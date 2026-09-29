import React from 'react';
import { District } from '../types';
import { ShieldAlert, ArrowUpRight, Flame } from 'lucide-react';

interface TopRiskDistrictsProps {
  districts: District[];
  onSelectDistrict: (district: District) => void;
  selectedDistrictId?: string;
}

export const TopRiskDistricts: React.FC<TopRiskDistrictsProps> = ({
  districts,
  onSelectDistrict,
  selectedDistrictId,
}) => {
  const sorted = [...districts].sort((a, b) => b.current_risk_score - a.current_risk_score);

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Top Risk Districts</h4>
            <p className="text-[11px] text-slate-500">Dynamically ranked by AI Risk Engine</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-slate-400">
          {sorted.length} MONITORED
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {sorted.slice(0, 5).map((d, index) => {
          const isSelected = selectedDistrictId === d.id;
          return (
            <div
              key={d.id}
              onClick={() => onSelectDistrict(d)}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center font-black text-xs text-slate-400">
                  {index + 1}.
                </span>
                <div>
                  <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    {d.name}
                    {d.red_zone && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black bg-red-600 text-white rounded leading-none">
                        RED
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <ShieldAlert className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span>{d.primary_hazard}</span>
                    <span className="text-slate-300">•</span>
                    <span>{d.state_name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900 leading-tight">
                    {d.current_risk_score}
                  </div>
                  <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded border leading-none mt-0.5 ${getBadgeStyle(d.risk_level)}`}>
                    {d.risk_level}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
