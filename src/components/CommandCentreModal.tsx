import React, { useEffect, useState } from 'react';
import { District, Shelter, Alert, RescueOperation, DashboardSummary } from '../types';
import { RiskMap } from './RiskMap';
import { X, ShieldAlert, Radio, AlertTriangle, Users, Home, Truck, Maximize2, Minimize2, Clock } from 'lucide-react';

interface CommandCentreModalProps {
  isOpen: boolean;
  onClose: () => void;
  districts: District[];
  shelters: Shelter[];
  alerts: Alert[];
  operations: RescueOperation[];
  summary: DashboardSummary;
}

export const CommandCentreModal: React.FC<CommandCentreModalProps> = ({
  isOpen,
  onClose,
  districts,
  shelters,
  alerts,
  operations,
  summary,
}) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(districts[0] || null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const criticalDistricts = districts.filter((d) => d.risk_level === 'CRITICAL');

  return (
    <div className="fixed inset-0 z-[800] bg-slate-950 text-white flex flex-col font-sans overflow-hidden">
      {/* Top Command Bar */}
      <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
         
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              DISHA SITUATION ROOM & CONTROL CENTRE
             
            </h1>
            <p className="text-[11px] text-slate-400">
              National & State Disaster Management Joint Operations Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>IST: {time}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Exit Command Centre"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-4 overflow-hidden">
        {/* Left Column: KPI Stats & Critical Ticker (3 Cols) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-red-950/40 border border-red-700/50 rounded-2xl">
              <div className="text-[10px] font-bold text-red-400 uppercase">Red Zones</div>
              <div className="text-2xl font-black text-red-500 mt-0.5">
                {summary.critical_red_zones}
              </div>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-700/50 rounded-2xl">
              <div className="text-[10px] font-bold text-amber-400 uppercase">High Risk</div>
              <div className="text-2xl font-black text-amber-500 mt-0.5">
                {summary.high_risk_zones}
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Exposed Pop</div>
              <div className="text-xl font-black text-white mt-0.5">
                {(summary.people_at_risk / 100000).toFixed(1)}L
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Shelter Cap</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">
                {summary.available_shelter_capacity.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Critical District Ticker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-black uppercase text-red-400">
              <span>Severe Hazard Red Zones</span>
              <Radio className="w-3.5 h-3.5 animate-pulse" />
            </div>

            <div className="space-y-2">
              {criticalDistricts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDistrict(d)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedDistrict?.id === d.id
                      ? 'bg-red-950/80 border-red-500 shadow'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white">{d.name}</span>
                    <span className="text-xs font-black text-red-400">{d.current_risk_score}/100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {d.primary_hazard} • {d.state_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Major Live GIS Map (6 Cols) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col rounded-3xl overflow-hidden border border-slate-800 relative bg-slate-900">
          <RiskMap
            districts={districts}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={(d) => setSelectedDistrict(d)}
            shelters={shelters}
            heightClass="h-full min-h-[500px]"
          />
        </div>

        {/* Right Column: Live Operational Dispatch Feed (3 Cols) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          {/* Active Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <ShieldAlert className="w-4 h-4" /> Live Evacuation Alerts
            </div>

            {alerts.slice(0, 3).map((a) => (
              <div key={a.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-red-400">
                  <span>{a.target_area}</span>
                  <span className="text-[10px] text-slate-500">Active</span>
                </div>
                <div className="text-slate-300 text-[11px] leading-tight truncate">
                  {a.message}
                </div>
                <div className="text-[10px] text-emerald-400 pt-0.5">
                  Transit: {a.pickup_point_name} ➔ {a.shelter_name}
                </div>
              </div>
            ))}
          </div>

          {/* Rescue Teams Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 space-y-2">
            <div className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Truck className="w-4 h-4" /> Rescue Battalions Deployed
            </div>

            {operations.map((op) => (
              <div key={op.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-200">{op.district_name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-400">
                    {op.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Teams: {op.teams_dispatched}/{op.teams_available} • {op.people_at_risk.toLocaleString()} evacuees
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
