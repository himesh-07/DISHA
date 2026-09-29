import React, { useState } from 'react';
import { Shelter, PickupPoint } from '../types';
import { Home, Droplets, Utensils, HeartPulse, Zap, Phone, Users, ShieldAlert, Bus, Check, X, AlertCircle, Search } from 'lucide-react';

interface SheltersViewProps {
  shelters: Shelter[];
  pickupPoints: PickupPoint[];
  selectedDistrictName?: string;
}

export const SheltersView: React.FC<SheltersViewProps> = ({
  shelters,
  pickupPoints,
  selectedDistrictName,
}) => {
  const [activeTab, setActiveTab] = useState<'SHELTERS' | 'PICKUPS'>('SHELTERS');
  const [search, setSearch] = useState('');

  const filteredShelters = shelters.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_person.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPickups = pickupPoints.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.nearest_shelter_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Home className="w-6 h-6 text-emerald-700 flex-shrink-0" />
            Emergency Shelters & Evacuation Pickup Assembly Hubs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedDistrictName ? `Active District: ${selectedDistrictName} • ` : ''}
            Live carrying occupancy, emergency food/water supplies, and transit logistics
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={activeTab === 'SHELTERS' ? 'Filter shelter...' : 'Filter pickup...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tab switch */}
          <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold text-slate-600 flex-shrink-0">
            <button
              onClick={() => setActiveTab('SHELTERS')}
              className={`py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === 'SHELTERS' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Shelters ({shelters.length})
            </button>
            <button
              onClick={() => setActiveTab('PICKUPS')}
              className={`py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
                activeTab === 'PICKUPS' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Pickup Points ({pickupPoints.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'SHELTERS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShelters.map((shelter) => {
            const occupancyPct = Math.round((shelter.current_occupancy / shelter.total_capacity) * 100);
            const isNearCapacity = occupancyPct >= 90;
            const isFull = shelter.available_capacity <= 0;

            return (
              <div
                key={shelter.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                      {shelter.accessibility_status}
                    </span>
                    {isFull ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white">
                        FULL
                      </span>
                    ) : isNearCapacity ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        NEAR CAPACITY
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        OPEN BEDS
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-2">
                    {shelter.name}
                  </h3>

                  {/* Section 56 Capacity Visualization */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex justify-between items-baseline text-xs mb-1.5">
                      <span className="font-bold text-slate-600">Capacity Utilization:</span>
                      <span className="font-extrabold text-slate-900">{occupancyPct}%</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${
                          isFull
                            ? 'bg-red-600'
                            : isNearCapacity
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, occupancyPct)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
                      <span>Occupancy: <strong>{shelter.current_occupancy.toLocaleString()}</strong> / {shelter.total_capacity.toLocaleString()}</span>
                      <span className="text-emerald-700 font-bold">
                        Available: {shelter.available_capacity.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Section 27 Resources at Shelter */}
                  <div className="mt-4">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                      Essential On-Site Resources:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Droplets className={`w-3.5 h-3.5 ${shelter.water_available ? 'text-blue-500' : 'text-slate-300'}`} />
                        <span>Water: {shelter.water_available ? 'Ready' : 'Restricted'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Utensils className={`w-3.5 h-3.5 ${shelter.food_available ? 'text-amber-500' : 'text-slate-300'}`} />
                        <span>Food Rations: {shelter.food_available ? 'Ready' : 'Restricted'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700">
                        <HeartPulse className={`w-3.5 h-3.5 ${shelter.medical_available ? 'text-red-500' : 'text-slate-300'}`} />
                        <span>Medical: {shelter.medical_available ? 'Doctor On Site' : 'Deficit'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Zap className={`w-3.5 h-3.5 ${shelter.electricity_available ? 'text-yellow-500' : 'text-slate-300'}`} />
                        <span>Genset Power: {shelter.electricity_available ? 'Online' : 'Off'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <div>Incharge: <strong>{shelter.contact_person}</strong></div>
                    <div className="text-[11px] text-slate-400">{shelter.contact_phone}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {shelter.rescue_teams_stationed} Rescue Teams
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Pickup Points Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPickups.map((point) => (
            <div
              key={point.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                  ROAD: {point.road_status}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {point.distance_km} km to shelter
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">{point.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Destination: <strong className="text-slate-800">{point.nearest_shelter_name}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Waiting Queue</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {point.current_queue} / {point.capacity}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Transport Buses</div>
                  <div className="text-base font-black text-emerald-700 mt-0.5">
                    {point.transport_vehicles_ready} Ready
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 p-2.5 rounded-xl bg-slate-50 font-mono text-[11px]">
                Coordinates: {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
