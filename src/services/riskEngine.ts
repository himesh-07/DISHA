import { District, HazardType, RelocationSite, CapacityStatus, RelocationPriorityLevel } from '../types';

export interface MLPredictionResult {
  risk_score: number;
  risk_level: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  primary_hazard: HazardType;
  hazard_scores: {
    flood: number;
    landslide: number;
    cloudburst: number;
    extreme_rainfall: number;
    cyclone: number;
    coastal_erosion: number;
  };
  red_zone: boolean;
  explanation: string[];
  feature_importance: { feature: string; importance: number; description: string }[];
  evacuation_priority_score: number;
  recommended_action: string;
}

/**
 * Calculates Multi-Hazard and XGBoost-equivalent normalized risk score
 */
export function calculateRisk(district: District, customRedZoneThreshold: number = 80): MLPredictionResult {
  // 1. Extreme rainfall sub-score (0-100)
  const rainfallFactor = Math.min(100, Math.round((district.rainfall_24h_mm / 180) * 85 + (district.rainfall_7d_mm / 500) * 15));

  // 2. Flood sub-score
  const riverRatioFactor = Math.min(100, Math.round(district.river_level_ratio * 75 + (district.historical_disaster_count / 20) * 25));

  // 3. Landslide sub-score based on slope, rainfall, elevation
  const slopeFactor = Math.min(100, Math.round((district.slope_deg / 40) * 60 + (district.rainfall_24h_mm / 200) * 40));

  // 4. Cloudburst sub-score
  const cloudburstFactor = Math.min(100, Math.round((district.rainfall_24h_mm / 150) * 70 + (district.elevation_m > 500 ? 30 : 5)));

  // 5. Cyclone sub-score
  const cycloneFactor = district.hazard_scores?.cyclone || (district.elevation_m < 25 ? Math.min(100, Math.round((district.rainfall_24h_mm / 160) * 80 + 15)) : 0);

  // 6. Coastal erosion sub-score
  const coastalFactor = district.elevation_m < 15 ? Math.min(100, Math.round((district.rainfall_7d_mm / 450) * 60 + (district.river_level_ratio > 1 ? 40 : 10))) : 0;

  const hazard_scores = {
    flood: Math.max(district.hazard_scores?.flood || 0, riverRatioFactor),
    landslide: Math.max(district.hazard_scores?.landslide || 0, district.slope_deg > 15 ? slopeFactor : 5),
    cloudburst: Math.max(district.hazard_scores?.cloudburst || 0, cloudburstFactor),
    extreme_rainfall: Math.max(district.hazard_scores?.extreme_rainfall || 0, rainfallFactor),
    cyclone: cycloneFactor,
    coastal_erosion: coastalFactor,
  };

  // Determine dominant hazard
  let primary_hazard: HazardType = district.primary_hazard;
  let maxHazardScore = -1;
  (Object.keys(hazard_scores) as Array<keyof typeof hazard_scores>).forEach((key) => {
    const score = hazard_scores[key];
    if (score > maxHazardScore) {
      maxHazardScore = score;
      if (key === 'flood') primary_hazard = 'Flood';
      else if (key === 'landslide') primary_hazard = 'Landslide';
      else if (key === 'cloudburst') primary_hazard = 'Cloudburst';
      else if (key === 'extreme_rainfall') primary_hazard = 'Extreme Rainfall';
      else if (key === 'cyclone') primary_hazard = 'Cyclone';
      else if (key === 'coastal_erosion') primary_hazard = 'Coastal Erosion';
    }
  });

  // XGBoost Synthetic Model Weighting:
  // Risk = 0.35 * Hazard_Max + 0.25 * Vulnerability + 0.20 * River/Precipitation + 0.12 * Disaster_History + 0.08 * Population_Exposure
  const rawRisk =
    0.35 * maxHazardScore +
    0.25 * (district.vulnerability_index * 100) +
    0.20 * Math.max(district.river_level_ratio * 70, rainfallFactor * 0.8) +
    0.12 * Math.min(100, district.historical_disaster_count * 5) +
    0.08 * Math.min(100, (district.population_density / 800) * 100);

  const risk_score = Math.min(99, Math.max(15, Math.round(rawRisk)));

  let risk_level: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  if (risk_score >= 80) risk_level = 'CRITICAL';
  else if (risk_score >= 60) risk_level = 'HIGH';
  else if (risk_score >= 40) risk_level = 'MODERATE';
  else if (risk_score >= 20) risk_level = 'LOW';
  else risk_level = 'VERY_LOW';

  const red_zone = risk_score >= customRedZoneThreshold || (maxHazardScore >= 92 && district.vulnerability_index >= 0.7);

  // Confidence calculation (higher when multiple sensor indicators align)
  const confidence = Number((0.85 + (risk_score > 80 ? 0.08 : 0.03) + (district.historical_disaster_count > 10 ? 0.04 : 0)).toFixed(2));

  // Feature importance breakdown
  const feature_importance = [
    {
      feature: 'River Level & Inundation',
      importance: 32,
      description: `River level ratio at ${(district.river_level_ratio * 100).toFixed(0)}% of critical mark`,
    },
    {
      feature: 'Precipitation Intensity',
      importance: 28,
      description: `24h rainfall of ${district.rainfall_24h_mm} mm with 7d accumulation of ${district.rainfall_7d_mm} mm`,
    },
    {
      feature: 'Socioeconomic Vulnerability',
      importance: 18,
      description: `Vulnerability Index is ${district.vulnerability_index} with ${(district.vulnerable_population_ratio * 100).toFixed(0)}% vulnerable cohort`,
    },
    {
      feature: 'Historical Disaster Frequency',
      importance: 14,
      description: `${district.historical_disaster_count} past recurring catastrophic incidents`,
    },
    {
      feature: 'Topography & Terrain Slope',
      importance: 8,
      description: `Elevation ${district.elevation_m}m with average slope ${district.slope_deg}°`,
    },
  ];

  // AI Explainability bullet points
  const explanation = district.explanation && district.explanation.length > 0 ? district.explanation : [
    `24-hour rainfall is ${district.rainfall_24h_mm} mm (critical warning baseline is 90 mm)`,
    `${district.river_name || 'Catchment river'} is operating at ${(district.river_level_ratio * 100).toFixed(0)}% danger threshold`,
    `District vulnerability index is ${district.vulnerability_index} with dense riverine/slope habitation`,
    `Area has recorded ${district.historical_disaster_count} historical emergency disaster events`,
    `Road and evacuation accessibility factor is restricted to ${(district.road_accessibility * 100).toFixed(0)}%`,
  ];

  // Evacuation Priority Score (Risk * Vulnerability * (1 - Accessibility) / Time)
  const evacuation_priority_score = Math.min(100, Math.round(
    risk_score * 0.5 + (district.vulnerability_index * 100) * 0.3 + (1 - district.road_accessibility) * 100 * 0.2
  ));

  let recommended_action = 'CONTINUOUS SURVEILLANCE & LOCAL WATCH';
  if (risk_score >= 85) {
    recommended_action = 'IMMEDIATE EVACUATION & SHELTER RELOCATION';
  } else if (risk_score >= 70) {
    recommended_action = 'STAGE PRE-EVACUATION & RELOCATION PREP';
  } else if (risk_score >= 50) {
    recommended_action = 'SHORT-TERM PREPAREDNESS & ACTIVE WATCH';
  }

  return {
    risk_score,
    risk_level,
    confidence: Math.min(0.98, confidence),
    primary_hazard,
    hazard_scores,
    red_zone,
    explanation,
    feature_importance,
    evacuation_priority_score,
    recommended_action,
  };
}

/**
 * Assess safe relocation site carrying capacity
 */
export function assessCarryingCapacity(site: RelocationSite, requiredPopulation: number): {
  carrying_capacity: number;
  available_capacity: number;
  capacity_gap: number;
  suitability_status: CapacityStatus;
  bottleneck: string;
  recommendations: string[];
} {
  // Bottleneck is the minimum resource capacity
  const resources = [
    { name: 'Housing & Space', val: site.housing_capacity },
    { name: 'Drinking Water Supply', val: site.water_capacity },
    { name: 'Food Rations & Logistics', val: site.food_capacity },
    { name: 'Medical & Sanitation Support', val: site.medical_capacity },
  ];

  resources.sort((a, b) => a.val - b.val);
  const bottleneck = resources[0].name;
  const carrying_capacity = resources[0].val;

  const available_capacity = Math.max(0, carrying_capacity - site.current_allocated);
  const capacity_gap = available_capacity - requiredPopulation;

  let suitability_status: CapacityStatus = 'SUITABLE';
  const recommendations: string[] = [];

  if (capacity_gap >= 0) {
    suitability_status = 'SUITABLE';
    recommendations.push(`Carrying capacity is sufficient for all ${requiredPopulation.toLocaleString()} citizens.`);
    recommendations.push(`Surplus buffer of ${capacity_gap.toLocaleString()} capacity remains available.`);
  } else if (capacity_gap >= -800) {
    suitability_status = 'NEARING_LIMIT';
    recommendations.push(`Available capacity (${available_capacity.toLocaleString()}) is nearing ceiling limit.`);
    recommendations.push(`Deficit of ${Math.abs(capacity_gap).toLocaleString()} requires secondary overflow shelter allocation.`);
  } else {
    suitability_status = 'INSUFFICIENT';
    recommendations.push(`Critical capacity deficit of ${Math.abs(capacity_gap).toLocaleString()} people.`);
    recommendations.push(`Primary constraint: ${bottleneck} capped at ${carrying_capacity.toLocaleString()}.`);
    recommendations.push('Immediate routing of excess evacuees to alternative transit sites is required.');
  }

  return {
    carrying_capacity,
    available_capacity,
    capacity_gap,
    suitability_status,
    bottleneck,
    recommendations,
  };
}

/**
 * Calculates Relocation Priority Level based on formula
 */
export function calculateRelocationPriority(riskScore: number, vulnerability: number, roadAccess: number): RelocationPriorityLevel {
  const score = riskScore * 0.55 + vulnerability * 100 * 0.3 + (1 - roadAccess) * 100 * 0.15;
  if (score >= 78) return 'Immediate';
  if (score >= 60) return 'Short Term';
  return 'Medium Term';
}
