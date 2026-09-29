import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import {
  INDIAN_STATES,
  INITIAL_DISTRICTS,
  INITIAL_SHELTERS,
  INITIAL_PICKUP_POINTS,
  INITIAL_RELOCATION_SITES,
  INITIAL_RELOCATION_PRIORITIES,
  INITIAL_ALERTS,
  INITIAL_DATA_SOURCES,
  INITIAL_RESCUE_OPS,
} from './src/data/mockData';
import { calculateRisk, assessCarryingCapacity } from './src/services/riskEngine';
import { Alert } from './src/types';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Mutable memory store for runtime modifications
  let alertsStore: Alert[] = [...INITIAL_ALERTS];
  let customRedZoneThreshold = 80;

  // 1. States
  app.get('/api/states', (_req: Request, res: Response) => {
    res.json(INDIAN_STATES);
  });

  // 2. Districts by state or all
  app.get('/api/states/:stateId/districts', (req: Request, res: Response) => {
    const { stateId } = req.params;
    const districts = INITIAL_DISTRICTS.filter((d) => d.state_id.toLowerCase() === stateId.toLowerCase());
    res.json(districts);
  });

  app.get('/api/districts', (req: Request, res: Response) => {
    const stateId = req.query.state_id as string;
    if (stateId) {
      const districts = INITIAL_DISTRICTS.filter((d) => d.state_id.toLowerCase() === stateId.toLowerCase());
      return res.json(districts);
    }
    res.json(INITIAL_DISTRICTS);
  });

  // 3. District by ID
  app.get('/api/districts/:districtId', (req: Request, res: Response) => {
    const { districtId } = req.params;
    const district = INITIAL_DISTRICTS.find((d) => d.id.toLowerCase() === districtId.toLowerCase());
    if (!district) {
      return res.status(404).json({ error: 'District not found' });
    }
    res.json(district);
  });

  // 4. District Risk (XGBoost calculation)
  app.get('/api/districts/:districtId/risk', (req: Request, res: Response) => {
    const { districtId } = req.params;
    const district = INITIAL_DISTRICTS.find((d) => d.id.toLowerCase() === districtId.toLowerCase());
    if (!district) {
      return res.status(404).json({ error: 'District not found' });
    }
    const prediction = calculateRisk(district, customRedZoneThreshold);
    res.json({
      district_id: district.id,
      name: district.name,
      ...prediction,
    });
  });

  // 5. Top Risk Districts
  app.get(['/api/risk/top-districts', '/api/risk/top-districts/:stateId'], (req: Request, res: Response) => {
    const stateId = req.params.stateId || (req.query.state_id as string);
    const limit = parseInt((req.query.limit as string) || '5', 10);
    const pool = stateId
      ? INITIAL_DISTRICTS.filter((d) => d.state_id.toLowerCase() === stateId.toLowerCase())
      : INITIAL_DISTRICTS;
    const sorted = [...pool].sort((a, b) => b.current_risk_score - a.current_risk_score).slice(0, limit);
    res.json(sorted);
  });

  // 6. Hazards catalog
  app.get('/api/hazards', (_req: Request, res: Response) => {
    res.json([
      { type: 'Flood', severity: 'CRITICAL', affected_count: 5, primary_monitored_basin: 'Hasdeo, Kelo, Brahmaputra' },
      { type: 'Landslide', severity: 'CRITICAL', affected_count: 4, primary_monitored_basin: 'Chamoli, Wayanad, Mandi' },
      { type: 'Cloudburst', severity: 'HIGH', affected_count: 3, primary_monitored_basin: 'Rudraprayag, Kullu' },
      { type: 'Extreme Rainfall', severity: 'HIGH', affected_count: 6, primary_monitored_basin: 'Raipur, Kamrup' },
      { type: 'Cyclone', severity: 'CRITICAL', affected_count: 3, primary_monitored_basin: 'Balasore, Puri' },
      { type: 'Coastal Erosion', severity: 'HIGH', affected_count: 2, primary_monitored_basin: 'Sundarbans, Alappuzha' },
    ]);
  });

  // 7. Red Zones
  app.get('/api/red-zones', (req: Request, res: Response) => {
    const stateId = req.query.state_id as string;
    const pool = stateId
      ? INITIAL_DISTRICTS.filter((d) => d.state_id.toLowerCase() === stateId.toLowerCase() && d.red_zone)
      : INITIAL_DISTRICTS.filter((d) => d.red_zone);
    res.json(pool);
  });

  // 8. Shelters
  app.get('/api/shelters', (req: Request, res: Response) => {
    const districtId = req.query.district_id as string;
    const shelters = districtId
      ? INITIAL_SHELTERS.filter((s) => s.district_id.toLowerCase() === districtId.toLowerCase())
      : INITIAL_SHELTERS;
    res.json(shelters);
  });

  app.get('/api/shelters/:id', (req: Request, res: Response) => {
    const shelter = INITIAL_SHELTERS.find((s) => s.id === req.params.id);
    if (!shelter) return res.status(404).json({ error: 'Shelter not found' });
    res.json(shelter);
  });

  // 9. Pickup Points
  app.get('/api/pickup-points', (req: Request, res: Response) => {
    const districtId = req.query.district_id as string;
    const points = districtId
      ? INITIAL_PICKUP_POINTS.filter((p) => p.district_id.toLowerCase() === districtId.toLowerCase())
      : INITIAL_PICKUP_POINTS;
    res.json(points);
  });

  // 10. Relocation Sites
  app.get('/api/relocation-sites', (req: Request, res: Response) => {
    const districtId = req.query.district_id as string;
    const sites = districtId
      ? INITIAL_RELOCATION_SITES.filter((r) => r.district_id.toLowerCase() === districtId.toLowerCase())
      : INITIAL_RELOCATION_SITES;
    res.json(sites);
  });

  // 11. Relocation Priorities
  app.get('/api/relocation/priorities', (req: Request, res: Response) => {
    const districtId = req.query.district_id as string;
    const priorities = districtId
      ? INITIAL_RELOCATION_PRIORITIES.filter((p) => p.district_id.toLowerCase() === districtId.toLowerCase())
      : INITIAL_RELOCATION_PRIORITIES;
    res.json(priorities);
  });

  // 12. Alerts (GET and POST)
  app.get('/api/alerts', (_req: Request, res: Response) => {
    res.json(alertsStore);
  });

  app.post('/api/alerts', (req: Request, res: Response) => {
    const body = req.body;
    const newAlert: Alert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      message: body.message || 'EMERGENCY EVACUATION ALERT',
      target_area: body.target_area || 'Designated Risk Sector',
      district_id: body.district_id || 'CG-KOR',
      latitude: body.latitude || 22.3595,
      longitude: body.longitude || 82.7501,
      pickup_point_id: body.pickup_point_id || 'PP-CG-KOR-01',
      pickup_point_name: body.pickup_point_name || 'Government School Ground',
      pickup_lat: body.pickup_lat || 22.3520,
      pickup_lng: body.pickup_lng || 82.7480,
      shelter_id: body.shelter_id || 'SH-CG-KOR-01',
      shelter_name: body.shelter_name || 'District Relief Centre',
      shelter_lat: body.shelter_lat || 22.3685,
      shelter_lng: body.shelter_lng || 82.7610,
      available_capacity: body.available_capacity || 1250,
      severity: body.severity || 'CRITICAL',
      hazard: body.hazard || 'Flood',
      affected_population: body.affected_population || 4230,
      created_at: new Date().toISOString(),
      status: 'ACTIVE',
      dispatched_recipients: body.affected_population || 4230,
    };
    alertsStore.unshift(newAlert);
    res.status(201).json(newAlert);
  });

  // 13. Search endpoint
  app.get('/api/search', (req: Request, res: Response) => {
    const q = ((req.query.q as string) || '').toLowerCase().trim();
    if (!q) return res.json([]);

    const results: any[] = [];
    INITIAL_DISTRICTS.forEach((d) => {
      if (
        d.name.toLowerCase().includes(q) ||
        d.state_name.toLowerCase().includes(q) ||
        d.primary_hazard.toLowerCase().includes(q) ||
        (q.includes('risk') && d.current_risk_score > 70) ||
        (q.includes('red') && d.red_zone)
      ) {
        results.push({
          type: 'district',
          id: d.id,
          name: d.name,
          state: d.state_name,
          risk_score: d.current_risk_score,
          risk_level: d.risk_level,
          primary_hazard: d.primary_hazard,
          red_zone: d.red_zone,
          population: d.population,
        });
      }
    });

    INITIAL_SHELTERS.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || q.includes('shelter')) {
        results.push({
          type: 'shelter',
          id: s.id,
          name: s.name,
          district_id: s.district_id,
          available_capacity: s.available_capacity,
        });
      }
    });

    res.json(results.slice(0, 8));
  });

  // 14. Dashboard Summary
  app.get('/api/dashboard/summary', (req: Request, res: Response) => {
    const stateId = req.query.state_id as string;
    const pool = stateId
      ? INITIAL_DISTRICTS.filter((d) => d.state_id.toLowerCase() === stateId.toLowerCase())
      : INITIAL_DISTRICTS;
    const shelters = stateId
      ? INITIAL_SHELTERS.filter((s) => pool.some((d) => d.id === s.district_id))
      : INITIAL_SHELTERS;

    const critical_zones = pool.filter((d) => d.risk_level === 'CRITICAL').length;
    const high_risk_zones = pool.filter((d) => d.risk_level === 'HIGH').length;
    const people_at_risk = pool.reduce((sum, d) => (d.current_risk_score > 60 ? sum + Math.round(d.population * 0.15) : sum), 0);
    const relocation_required = pool.reduce((sum, d) => (d.red_zone ? sum + Math.round(d.population * 0.02) : sum), 0);
    const total_shelter_capacity = shelters.reduce((sum, s) => sum + s.total_capacity, 0);
    const available_shelter_capacity = shelters.reduce((sum, s) => sum + s.available_capacity, 0);

    res.json({
      total_monitored_areas: pool.length,
      critical_red_zones: critical_zones,
      high_risk_zones: high_risk_zones,
      people_at_risk,
      relocation_required,
      total_shelter_capacity,
      available_shelter_capacity,
      active_alerts_count: alertsStore.length,
      rescue_teams_deployed: 18,
    });
  });

  // 15. Explainability endpoint
  app.get('/api/model/explainability', (req: Request, res: Response) => {
    const districtId = (req.query.district_id as string) || 'CG-KOR';
    const district = INITIAL_DISTRICTS.find((d) => d.id === districtId) || INITIAL_DISTRICTS[0];
    const prediction = calculateRisk(district, customRedZoneThreshold);
    res.json({
      district_id: district.id,
      name: district.name,
      explanation: prediction.explanation,
      feature_importance: prediction.feature_importance,
      confidence: prediction.confidence,
      model_type: 'XGBoost Multi-Hazard Regressor (Normalized Ensemble v2.4)',
    });
  });

  // 16. Refresh data
  app.post('/api/data/refresh', (_req: Request, res: Response) => {
    res.json({
      success: true,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      message: 'Telemetry refreshed across IMD, CWC, Census and Open-Meteo feeds (Simulated Sandbox).',
    });
  });

  // 17. Data Sources Status
  app.get('/api/datasources/status', (_req: Request, res: Response) => {
    res.json(INITIAL_DATA_SOURCES);
  });

  // 18. Rescue Operations
  app.get('/api/rescue/operations', (_req: Request, res: Response) => {
    res.json(INITIAL_RESCUE_OPS);
  });

  // 19. GeoJSON boundary endpoint
  app.get('/api/geo/districts', (req: Request, res: Response) => {
    const features = INITIAL_DISTRICTS.map((d) => ({
      type: 'Feature',
      properties: {
        id: d.id,
        name: d.name,
        state: d.state_name,
        risk_score: d.current_risk_score,
        risk_level: d.risk_level,
        primary_hazard: d.primary_hazard,
        red_zone: d.red_zone,
        population: d.population,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          (d.boundary_polygon || [
            [d.latitude + 0.15, d.longitude - 0.15],
            [d.latitude + 0.15, d.longitude + 0.15],
            [d.latitude - 0.15, d.longitude + 0.15],
            [d.latitude - 0.15, d.longitude - 0.15],
          ]).map(([lat, lng]) => [lng, lat]),
        ],
      },
    }));

    res.json({
      type: 'FeatureCollection',
      features,
    });
  });

  // Vite middleware in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DISHA Platform backend & UI running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start DISHA server:', err);
});
