import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { District, Shelter, PickupPoint, RelocationSite } from '../types';
import { Layers, Maximize2, ShieldAlert, Home, Navigation, MapPin } from 'lucide-react';

interface RiskMapProps {
  districts: District[];
  selectedDistrict: District | null;
  onSelectDistrict: (district: District) => void;
  shelters?: Shelter[];
  pickupPoints?: PickupPoint[];
  relocationSites?: RelocationSite[];
  showEvacuationRoute?: boolean;
  activeEvacuationRoute?: {
    from: [number, number];
    pickup: [number, number];
    shelter: [number, number];
    pickupName: string;
    shelterName: string;
  } | null;
  heightClass?: string;
  zoomStateCoords?: { lat: number; lng: number; zoom: number };
}

export const RiskMap: React.FC<RiskMapProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  shelters = [],
  pickupPoints = [],
  relocationSites = [],
  showEvacuationRoute = true,
  activeEvacuationRoute = null,
  heightClass = 'h-[540px]',
  zoomStateCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer Visibility State
  const [layers, setLayers] = useState({
    riskZones: true,
    redZones: true,
    shelters: true,
    pickupPoints: true,
    relocationSites: true,
    evacuationRoutes: true,
  });

  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [21.8, 82.5]; // Central India (Chhattisgarh / Odisha belt)
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    // Add standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    // Zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Layer group for dynamic disaster objects
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when state changes or district selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedDistrict) {
      map.flyTo([selectedDistrict.latitude, selectedDistrict.longitude], 9, {
        duration: 1.2,
      });
    } else if (zoomStateCoords) {
      map.flyTo([zoomStateCoords.lat, zoomStateCoords.lng], zoomStateCoords.zoom, {
        duration: 1.2,
      });
    }
  }, [selectedDistrict, zoomStateCoords]);

  // Re-render markers, polygons, and overlays when data or layers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Draw District Risk Zones (Circles and Polygons)
    districts.forEach((d) => {
      const isSelected = selectedDistrict?.id === d.id;
      const riskColor = getRiskColor(d.current_risk_score);

      // District boundary polygon if available
      if (layers.riskZones && d.boundary_polygon && d.boundary_polygon.length > 0) {
        const polygon = L.polygon(d.boundary_polygon, {
          color: d.red_zone ? '#b91c1c' : riskColor,
          weight: isSelected ? 3 : 1.5,
          fillColor: riskColor,
          fillOpacity: d.red_zone ? 0.35 : 0.18,
          dashArray: d.red_zone ? '5, 5' : undefined,
        });

        polygon.on('click', () => {
          onSelectDistrict(d);
        });

        layerGroup.addLayer(polygon);
      }

      // Red Zone Pulsing Marker / Buffer
      if (layers.redZones && d.red_zone) {
        const redZoneCircle = L.circle([d.latitude, d.longitude], {
          radius: 12000, // 12km hazard radius
          color: '#dc2626',
          weight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.25,
        });
        redZoneCircle.bindTooltip(`⚠️ CRITICAL RED ZONE: ${d.name}`, { sticky: true });
        redZoneCircle.on('click', () => onSelectDistrict(d));
        layerGroup.addLayer(redZoneCircle);
      }

      // Center Risk Badge Marker
      const markerHtml = `
        <div class="relative cursor-pointer transition-transform hover:scale-110 flex items-center justify-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg text-white border-2 ${
            isSelected ? 'ring-4 ring-emerald-500 scale-125 border-white' : 'border-white'
          }" style="background-color: ${riskColor};">
            ${d.current_risk_score}
          </div>
          ${d.red_zone ? '<div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border border-white animate-ping"></div>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-risk-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([d.latitude, d.longitude], { icon: customIcon });

      const popupContent = `
        <div class="p-3 font-sans max-w-[240px]">
          <div class="flex items-center justify-between gap-2 border-b pb-1.5 mb-2">
            <h4 class="font-extrabold text-slate-900 text-sm">${d.name}</h4>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style="background-color: ${riskColor};">
              ${d.risk_level}
            </span>
          </div>
          <div class="space-y-1 text-xs text-slate-600">
            <div class="flex justify-between"><span>State:</span> <strong class="text-slate-800">${d.state_name}</strong></div>
            <div class="flex justify-between"><span>Risk Score:</span> <strong class="text-slate-900">${d.current_risk_score} / 100</strong></div>
            <div class="flex justify-between"><span>Primary Hazard:</span> <strong class="text-amber-700">${d.primary_hazard}</strong></div>
            <div class="flex justify-between"><span>Population:</span> <span>${d.population.toLocaleString()}</span></div>
            <div class="flex justify-between"><span>Red Zone:</span> <strong class="${d.red_zone ? 'text-red-600 font-black' : 'text-emerald-700'}">${d.red_zone ? 'YES (CRITICAL)' : 'NO'}</strong></div>
          </div>
          <button id="view-district-${d.id}" class="mt-3 w-full py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow transition-colors text-center block">
            VIEW DISTRICT DETAILS
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-district-${d.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectDistrict(d);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectDistrict(d);
      });

      layerGroup.addLayer(marker);
    });

    // 2. Shelters Layer
    if (layers.shelters && shelters.length > 0) {
      shelters.forEach((s) => {
        const shelterHtml = `
          <div class="w-7 h-7 rounded-lg bg-emerald-700 border-2 border-white shadow-md flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          </div>
        `;
        const icon = L.divIcon({ html: shelterHtml, className: 'shelter-marker', iconSize: [28, 28], iconAnchor: [14, 14] });
        const marker = L.marker([s.latitude, s.longitude], { icon });

        const occupancyPct = Math.round((s.current_occupancy / s.total_capacity) * 100);
        marker.bindPopup(`
          <div class="p-2.5 font-sans text-xs max-w-[220px]">
            <div class="font-bold text-emerald-800 border-b pb-1 text-sm">${s.name}</div>
            <div class="mt-1.5 space-y-1">
              <div>Capacity: <strong>${s.total_capacity.toLocaleString()}</strong></div>
              <div>Available: <strong class="text-emerald-700">${s.available_capacity.toLocaleString()}</strong> (${occupancyPct}% full)</div>
              <div>Water: ${s.water_available ? '✅ Available' : '❌ Deficit'} | Food: ${s.food_available ? '✅ Available' : '❌ Deficit'}</div>
              <div>Rescue Teams: <strong>${s.rescue_teams_stationed} stationed</strong></div>
              <div class="text-[10px] text-slate-500 mt-1">Contact: ${s.contact_phone}</div>
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 3. Pickup Points Layer
    if (layers.pickupPoints && pickupPoints.length > 0) {
      pickupPoints.forEach((p) => {
        const pickupHtml = `
          <div class="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-slate-950 font-black text-[10px] cursor-pointer hover:scale-110 transition-transform">
            P
          </div>
        `;
        const icon = L.divIcon({ html: pickupHtml, className: 'pickup-marker', iconSize: [24, 24], iconAnchor: [12, 12] });
        const marker = L.marker([p.latitude, p.longitude], { icon });
        marker.bindPopup(`
          <div class="p-2 font-sans text-xs">
            <div class="font-bold text-amber-900 border-b pb-1">${p.name}</div>
            <div class="mt-1 space-y-0.5">
              <div>Queue: <strong>${p.current_queue} / ${p.capacity} citizens</strong></div>
              <div>Road Status: <span class="font-semibold text-emerald-700">${p.road_status}</span></div>
              <div>Transport Buses: <strong>${p.transport_vehicles_ready} ready</strong></div>
              <div>Transit to: <strong>${p.nearest_shelter_name}</strong> (${p.distance_km} km)</div>
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 4. Relocation Sites Layer
    if (layers.relocationSites && relocationSites.length > 0) {
      relocationSites.forEach((r) => {
        const siteHtml = `
          <div class="w-6 h-6 rounded-md bg-purple-700 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:scale-110 transition-transform">
            RS
          </div>
        `;
        const icon = L.divIcon({ html: siteHtml, className: 'relocation-site-marker', iconSize: [24, 24], iconAnchor: [12, 12] });
        const marker = L.marker([r.latitude, r.longitude], { icon });
        marker.bindPopup(`
          <div class="p-2 font-sans text-xs max-w-[210px]">
            <div class="font-bold text-purple-900 border-b pb-1">${r.name}</div>
            <div class="mt-1 space-y-0.5">
              <div>Carrying Capacity: <strong>${r.carrying_capacity.toLocaleString()}</strong></div>
              <div>Available Space: <strong class="text-emerald-700">${r.available_capacity.toLocaleString()}</strong></div>
              <div>Safety Score: <strong>${r.safety_score}/100</strong></div>
              <div>Status: <span class="px-1 py-0.5 rounded text-[10px] font-bold ${r.suitability_status === 'SUITABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">${r.suitability_status}</span></div>
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 5. Evacuation Route Polyline
    if (layers.evacuationRoutes && showEvacuationRoute) {
      let routePoints: [number, number][] = [];
      let pickupName = '';
      let shelterName = '';

      if (activeEvacuationRoute) {
        routePoints = [
          activeEvacuationRoute.from,
          activeEvacuationRoute.pickup,
          activeEvacuationRoute.shelter,
        ];
        pickupName = activeEvacuationRoute.pickupName;
        shelterName = activeEvacuationRoute.shelterName;
      } else if (selectedDistrict) {
        const dPickups = pickupPoints.filter((p) => p.district_id === selectedDistrict.id);
        const dShelters = shelters.filter((s) => s.district_id === selectedDistrict.id);
        if (dPickups.length > 0 && dShelters.length > 0) {
          routePoints = [
            [selectedDistrict.latitude, selectedDistrict.longitude],
            [dPickups[0].latitude, dPickups[0].longitude],
            [dShelters[0].latitude, dShelters[0].longitude],
          ];
          pickupName = dPickups[0].name;
          shelterName = dShelters[0].name;
        }
      }

      if (routePoints.length >= 3) {
        const polyline = L.polyline(routePoints, {
          color: '#2563eb', // Royal Blue
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
        });

        polyline.bindTooltip(
          `Evacuation Corridor: ${pickupName} ➔ ${shelterName} (Demo Straight-Line Polyline)`,
          { sticky: true }
        );

        layerGroup.addLayer(polyline);
      }
    }
  }, [
    districts,
    selectedDistrict,
    shelters,
    pickupPoints,
    relocationSites,
    layers,
    showEvacuationRoute,
    activeEvacuationRoute,
    onSelectDistrict,
  ]);

  function getRiskColor(score: number): string {
    if (score >= 80) return '#dc2626'; // Critical Red
    if (score >= 60) return '#f97316'; // High Orange
    if (score >= 40) return '#eab308'; // Moderate Yellow
    if (score >= 20) return '#22c55e'; // Low Green
    return '#16a34a'; // Safe Green
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* Map Container */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />

      <div className="absolute top-3 left-3 z-[400] flex flex-col gap-2">
        
        {/* Legend */}
        <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200/80 text-[11px] flex items-center gap-3">
          <span className="font-bold text-slate-700">Risk:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> 80+ Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 60-79 High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> 40-59 Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Safe
          </span>
        </div>
      </div>

      {/* Top Right: Layer Switcher & Tools */}
      <div className="absolute top-3 right-14 z-[400] flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Map Layers</span>
          </button>

          {isLayerMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 p-2.5 space-y-1.5 text-xs text-slate-700 z-[500]">
              <div className="font-bold text-slate-900 border-b pb-1 mb-1 text-[11px] uppercase tracking-wider">
                Overlay Toggles
              </div>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={layers.riskZones}
                  onChange={(e) => setLayers({ ...layers, riskZones: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>District Risk Boundaries</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={layers.redZones}
                  onChange={(e) => setLayers({ ...layers, redZones: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-red-600 font-semibold">Critical Red Zones</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={layers.shelters}
                  onChange={(e) => setLayers({ ...layers, shelters: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Emergency Shelters</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={layers.pickupPoints}
                  onChange={(e) => setLayers({ ...layers, pickupPoints: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Evacuation Pickup Points</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={layers.relocationSites}
                  onChange={(e) => setLayers({ ...layers, relocationSites: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Safe Relocation Sites</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={layers.evacuationRoutes}
                  onChange={(e) => setLayers({ ...layers, evacuationRoutes: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-blue-700 font-medium">Evacuation Polyline Route</span>
              </label>
            </div>
          )}
        </div>

        {/* Recenter Button */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([22.5, 82.5], 6);
            }
          }}
          className="p-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 text-slate-700 hover:bg-slate-50"
          title="Reset Map View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Info Bar: Demo Mode Notice */}
      
    </div>
  );
};
