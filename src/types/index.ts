export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type HazardType =
  | 'Flood'
  | 'Landslide'
  | 'Cloudburst'
  | 'Extreme Rainfall'
  | 'Cyclone'
  | 'Coastal Erosion'
  | 'Heatwave'
  | 'Drought';

export type RelocationPriorityLevel = 'Immediate' | 'Short Term' | 'Medium Term';

export type CapacityStatus = 'SUITABLE' | 'NEARING_LIMIT' | 'INSUFFICIENT';

export interface State {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface District {
  id: string;
  state_id: string;
  state_name: string;
  name: string;
  latitude: number;
  longitude: number;
  population: number;
  area_sqkm: number;
  vulnerability_index: number;
  historical_disaster_count: number;
  current_risk_score: number;
  risk_level: RiskLevel;
  primary_hazard: HazardType;
  red_zone: boolean;
  recommended_action: string;
  rainfall_24h_mm: number;
  rainfall_7d_mm: number;
  river_name?: string;
  river_level_m: number;
  river_threshold_m: number;
  river_level_ratio: number;
  elevation_m: number;
  slope_deg: number;
  population_density: number;
  vulnerable_population_ratio: number;
  housing_vulnerability: number;
  road_accessibility: number;
  medical_accessibility: number;
  // Multi-hazard breakdown
  hazard_scores: {
    flood: number;
    landslide: number;
    cloudburst: number;
    extreme_rainfall: number;
    cyclone: number;
    coastal_erosion: number;
  };
  explanation?: string[];
  feature_importance?: { feature: string; importance: number; description: string }[];
  boundary_polygon?: [number, number][]; // lat, lng
}

export interface Shelter {
  id: string;
  district_id: string;
  name: string;
  latitude: number;
  longitude: number;
  total_capacity: number;
  current_occupancy: number;
  available_capacity: number;
  water_available: boolean;
  food_available: boolean;
  medical_available: boolean;
  toilets_available: boolean;
  electricity_available: boolean;
  accessibility_status: 'Accessible' | 'Limited Access' | 'Cut Off';
  contact_person: string;
  contact_phone: string;
  beds_count: number;
  emergency_supplies_days: number;
  rescue_teams_stationed: number;
  communication_status: 'Online' | 'Satellite Backup' | 'Degraded';
}

export interface PickupPoint {
  id: string;
  district_id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_queue: number;
  nearest_shelter_id: string;
  nearest_shelter_name: string;
  distance_km: number;
  road_status: 'Clear' | 'Waterlogged' | 'Under Observation';
  transport_vehicles_ready: number;
}

export interface RelocationSite {
  id: string;
  district_id: string;
  name: string;
  latitude: number;
  longitude: number;
  area_acres: number;
  housing_capacity: number;
  water_capacity: number;
  food_capacity: number;
  medical_capacity: number;
  transport_access: 'High' | 'Moderate' | 'Restricted';
  safety_score: number; // 0-100
  carrying_capacity: number;
  current_allocated: number;
  available_capacity: number;
  distance_from_hazard_km: number;
  suitability_status: CapacityStatus;
}

export interface RelocationPriorityItem {
  id: string;
  district_id: string;
  area_name: string;
  risk_score: number;
  population_exposed: number;
  vulnerability: number;
  disaster_frequency: number;
  infrastructure_risk: number;
  distance_to_safe_km: number;
  relocation_priority: RelocationPriorityLevel;
  action: string;
  candidate_sites: {
    site_id: string;
    site_name: string;
    safety_score: number;
    distance_km: number;
    available_capacity: number;
  }[];
}

export interface Alert {
  id: string;
  message: string;
  target_area: string;
  district_id: string;
  latitude: number;
  longitude: number;
  pickup_point_id: string;
  pickup_point_name: string;
  pickup_lat: number;
  pickup_lng: number;
  shelter_id: string;
  shelter_name: string;
  shelter_lat: number;
  shelter_lng: number;
  available_capacity: number;
  severity: 'WARNING' | 'HIGH' | 'CRITICAL';
  hazard: HazardType;
  affected_population: number;
  created_at: string;
  status: 'ACTIVE' | 'RESOLVED' | 'SIMULATED';
  dispatched_recipients: number;
}

export interface DashboardSummary {
  total_monitored_areas: number;
  critical_red_zones: number;
  high_risk_zones: number;
  people_at_risk: number;
  relocation_required: number;
  total_shelter_capacity: number;
  available_shelter_capacity: number;
  active_alerts_count: number;
  rescue_teams_deployed: number;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  category: 'Meteorological' | 'Hydrological' | 'Demographic' | 'Weather Forecast';
  status: 'Connected' | 'Healthy' | 'Degraded' | 'Simulated';
  last_updated: string;
  records_received: number;
  latency_ms: number;
  data_quality: string;
  endpoint: string;
  notes: string;
}

export interface RescueOperation {
  id: string;
  district_id: string;
  district_name: string;
  hazard: HazardType;
  people_at_risk: number;
  pickup_points_count: number;
  shelters_count: number;
  teams_available: number;
  teams_dispatched: number;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
  status: 'STANDBY' | 'DISPATCHED' | 'PICKUP_ACTIVE' | 'SHELTER_ARRIVED';
  last_activity: string;
}
