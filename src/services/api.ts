import {
  State,
  District,
  Shelter,
  PickupPoint,
  RelocationSite,
  RelocationPriorityItem,
  Alert,
  DashboardSummary,
  DataSourceStatus,
  RescueOperation,
} from '../types';
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
} from '../data/mockData';
import { calculateRisk, assessCarryingCapacity } from './riskEngine';

// Central API Base URL
const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

async function fetchJson<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Graceful fallback to client simulated store
    console.debug(`API endpoint ${endpoint} fallback:`, err);
  }
  return fallbackData;
}

export const api = {
  async getStates(): Promise<State[]> {
    return fetchJson('/api/states', INDIAN_STATES);
  },

  async getDistricts(stateId?: string): Promise<District[]> {
    const url = stateId ? `/api/states/${stateId}/districts` : '/api/districts';
    const fallback = stateId
      ? INITIAL_DISTRICTS.filter((d) => d.state_id === stateId)
      : INITIAL_DISTRICTS;
    return fetchJson(url, fallback);
  },

  async getDistrictById(districtId: string): Promise<District | null> {
    const fallback = INITIAL_DISTRICTS.find((d) => d.id === districtId) || null;
    return fetchJson(`/api/districts/${districtId}`, fallback);
  },

  async getTopRiskDistricts(stateId?: string, limit: number = 5): Promise<District[]> {
    const url = stateId ? `/api/risk/top-districts/${stateId}?limit=${limit}` : `/api/risk/top-districts?limit=${limit}`;
    const pool = stateId
      ? INITIAL_DISTRICTS.filter((d) => d.state_id === stateId)
      : INITIAL_DISTRICTS;
    const sorted = [...pool].sort((a, b) => b.current_risk_score - a.current_risk_score).slice(0, limit);
    return fetchJson(url, sorted);
  },

  async getRedZones(stateId?: string): Promise<District[]> {
    const pool = stateId
      ? INITIAL_DISTRICTS.filter((d) => d.state_id === stateId && d.red_zone)
      : INITIAL_DISTRICTS.filter((d) => d.red_zone);
    return fetchJson('/api/red-zones', pool);
  },

  async getShelters(districtId?: string): Promise<Shelter[]> {
    const fallback = districtId
      ? INITIAL_SHELTERS.filter((s) => s.district_id === districtId)
      : INITIAL_SHELTERS;
    return fetchJson(districtId ? `/api/shelters?district_id=${districtId}` : '/api/shelters', fallback);
  },

  async getPickupPoints(districtId?: string): Promise<PickupPoint[]> {
    const fallback = districtId
      ? INITIAL_PICKUP_POINTS.filter((p) => p.district_id === districtId)
      : INITIAL_PICKUP_POINTS;
    return fetchJson(districtId ? `/api/pickup-points?district_id=${districtId}` : '/api/pickup-points', fallback);
  },

  async getRelocationSites(districtId?: string): Promise<RelocationSite[]> {
    const fallback = districtId
      ? INITIAL_RELOCATION_SITES.filter((r) => r.district_id === districtId)
      : INITIAL_RELOCATION_SITES;
    return fetchJson(districtId ? `/api/relocation-sites?district_id=${districtId}` : '/api/relocation-sites', fallback);
  },

  async getRelocationPriorities(districtId?: string): Promise<RelocationPriorityItem[]> {
    const fallback = districtId
      ? INITIAL_RELOCATION_PRIORITIES.filter((r) => r.district_id === districtId)
      : INITIAL_RELOCATION_PRIORITIES;
    return fetchJson(districtId ? `/api/relocation/priorities?district_id=${districtId}` : '/api/relocation/priorities', fallback);
  },

  async getAlerts(districtId?: string): Promise<Alert[]> {
    const fallback = districtId
      ? INITIAL_ALERTS.filter((a) => a.district_id === districtId)
      : INITIAL_ALERTS;
    return fetchJson('/api/alerts', fallback);
  },

  async createAlert(alertData: Omit<Alert, 'id' | 'created_at' | 'status' | 'dispatched_recipients'>): Promise<Alert> {
    const newAlert: Alert = {
      ...alertData,
      id: `ALT-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      status: 'ACTIVE',
      dispatched_recipients: alertData.affected_population || 1200,
    };

    try {
      const res = await fetch(`${API_BASE}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Return local created alert
    }
    return newAlert;
  },

  async getDashboardSummary(stateId?: string): Promise<DashboardSummary> {
    const districts = stateId
      ? INITIAL_DISTRICTS.filter((d) => d.state_id === stateId)
      : INITIAL_DISTRICTS;
    const shelters = stateId
      ? INITIAL_SHELTERS.filter((s) => districts.some((d) => d.id === s.district_id))
      : INITIAL_SHELTERS;

    const critical_zones = districts.filter((d) => d.risk_level === 'CRITICAL').length;
    const high_risk_zones = districts.filter((d) => d.risk_level === 'HIGH').length;
    const people_at_risk = districts.reduce((sum, d) => (d.current_risk_score > 60 ? sum + Math.round(d.population * 0.15) : sum), 0);
    const relocation_required = districts.reduce((sum, d) => (d.red_zone ? sum + Math.round(d.population * 0.02) : sum), 0);
    const total_shelter_capacity = shelters.reduce((sum, s) => sum + s.total_capacity, 0);
    const available_shelter_capacity = shelters.reduce((sum, s) => sum + s.available_capacity, 0);

    const fallback: DashboardSummary = {
      total_monitored_areas: districts.length,
      critical_red_zones: critical_zones,
      high_risk_zones: high_risk_zones,
      people_at_risk,
      relocation_required,
      total_shelter_capacity,
      available_shelter_capacity,
      active_alerts_count: 3,
      rescue_teams_deployed: 18,
    };

    return fetchJson(stateId ? `/api/dashboard/summary?state_id=${stateId}` : '/api/dashboard/summary', fallback);
  },

  async getDataSources(): Promise<DataSourceStatus[]> {
    return fetchJson('/api/datasources/status', INITIAL_DATA_SOURCES);
  },

  async refreshData(): Promise<{ success: boolean; timestamp: string; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/data/refresh`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      timestamp: new Date().toLocaleTimeString(),
      message: 'Telemetry refreshed across IMD, CWC, Census and Open-Meteo feeds (Simulated Sandbox).',
    };
  },

  async search(query: string): Promise<any[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    try {
      const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback local search
    }

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

    return results.slice(0, 8);
  },

  async getRescueOperations(): Promise<RescueOperation[]> {
    return fetchJson('/api/rescue/operations', INITIAL_RESCUE_OPS);
  },
};
