import React from 'react';
import { State, District } from '../types';
import { MapPin, ChevronDown } from 'lucide-react';

interface StateDistrictSelectorProps {
  states: State[];
  selectedStateId: string;
  onSelectState: (stateId: string) => void;
  districts: District[];
  selectedDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
}

export const StateDistrictSelector: React.FC<StateDistrictSelectorProps> = ({
  states,
  selectedStateId,
  onSelectState,
  districts,
  selectedDistrictId,
  onSelectDistrict,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Step 1: Select State */}
      <div className="flex-1">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-black">
            1
          </span>
          Select State / UT
        </label>
        <div className="relative">
          <select
            value={selectedStateId}
            onChange={(e) => onSelectState(e.target.value)}
            className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {states.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Step 2: Select District */}
      <div className="flex-1">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-black">
            2
          </span>
          Select Monitored District
        </label>
        <div className="relative">
          <select
            value={selectedDistrictId}
            onChange={(e) => onSelectDistrict(e.target.value)}
            className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Districts ({districts.length})</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.red_zone ? '(RED ZONE)' : `(${d.current_risk_score}/100)`}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
