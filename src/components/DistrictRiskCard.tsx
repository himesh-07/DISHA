import React from 'react';
import { District } from '../types';
import { ShieldAlert, AlertTriangle, Users, History, Activity, ArrowRight } from 'lucide-react';

interface DistrictRiskCardProps {
  district: District;
  onExploreRelocation?: () => void;
  onCreateAlert?: () => void;
  onViewDetails?: () => void;
}

export const DistrictRiskCard: React.FC<DistrictRiskCardProps> = ({
  district,
  onExploreRelocation,
  onCreateAlert,
  onViewDetails,
}) => {
  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-600';
    return 'text-emerald-600';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5 relative overflow-hidden">
      {district.red_zone && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1 uppercase">
          
          CRITICAL RED ZONE
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {district.state_name}
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {district.name}
          </h3>
        </div>
      </div>

      {/* Main Risk Display */}
      <div className="mt-4 grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase">Risk Score</div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-3xl font-black ${getScoreColor(district.current_risk_score)}`}>
              {district.current_risk_score}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${getBadgeStyle(district.risk_level)}`}>
            {district.risk_level}
          </span>
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase">Primary Hazard</div>
          <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            {district.primary_hazard}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            24h Rain: <strong className="text-slate-700">{district.rainfall_24h_mm} mm</strong>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-500">
            <Users className="w-3 h-3 text-slate-400" /> Population
          </div>
          <div className="text-xs font-bold text-slate-800 mt-0.5">
            {(district.population / 100000).toFixed(1)}L
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-500">
            <Activity className="w-3 h-3 text-slate-400" /> Vulnerability
          </div>
          <div className="text-xs font-bold text-slate-800 mt-0.5">
            {(district.vulnerability_index * 100).toFixed(0)}%
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-500">
            <History className="w-3 h-3 text-slate-400" /> Past Events
          </div>
          <div className="text-xs font-bold text-slate-800 mt-0.5">
            {district.historical_disaster_count}
          </div>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="mt-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80">
        <div className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
          Recommended Action
        </div>
        <div className="text-xs font-extrabold text-amber-950 mt-0.5">
          {district.recommended_action}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100">
        {onExploreRelocation && (
          <button
            onClick={onExploreRelocation}
            className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors text-center"
          >
            Relocation Plan
          </button>
        )}
        {onCreateAlert && (
          <button
            onClick={onCreateAlert}
            className="flex-1 py-2 px-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors text-center"
          >
            Create Alert
          </button>
        )}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Inspect Details"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
