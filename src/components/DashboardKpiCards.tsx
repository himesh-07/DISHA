import React from 'react';
import { DashboardSummary } from '../types';
import { AlertOctagon, Flame, Users, Compass, Home, ShieldCheck } from 'lucide-react';
import { ShieldAlert } from "lucide-react";
interface DashboardKpiCardsProps {
  summary: DashboardSummary;
  selectedStateName?: string;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  summary,
  selectedStateName,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Monitored Areas */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Monitored Areas
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {summary.total_monitored_areas}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-2 truncate">
          {selectedStateName || 'Across States'}
        </div>
      </div>

      {/* 2. Critical Red Zones */}
      <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
        <div>
        
          <div className="flex items-center justify-between text-red-500 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-700">
              Critical Red Zones
            </span>
           <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-red-600 tracking-tight leading-tight">
            {summary.critical_red_zones}
          </div>
        </div>
       
      </div>

      {/* 3. High Risk Areas */}
      <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-orange-500 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-700">
              High Risk Zones
            </span>
            <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-orange-600 tracking-tight leading-tight">
            {summary.high_risk_zones}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-2 truncate">
          Active Surveillance
        </div>
      </div>

      {/* 4. People at Risk */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              People at Risk
            </span>
            <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {summary.people_at_risk > 100000
              ? `${(summary.people_at_risk / 100000).toFixed(1)}L`
              : summary.people_at_risk.toLocaleString()}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-2 truncate">
          Exposed Cohort
        </div>
      </div>

      {/* 5. Relocation Required */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Relocation Needed
            </span>
            <Compass className="w-4 h-4 text-purple-600 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-purple-700 tracking-tight leading-tight">
            {summary.relocation_required.toLocaleString()}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-2 truncate">
          Priority Habitations
        </div>
      </div>

      {/* 6. Shelter Capacity */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Shelter Capacity
            </span>
            <Home className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight leading-tight">
            {summary.available_shelter_capacity.toLocaleString()}
          </div>
        </div>
        <div className="text-[10px] text-emerald-600 font-semibold mt-2 truncate">
          Available Headroom
        </div>
      </div>
    </div>
  );
};
