import React, { useState } from 'react';
import { RelocationSite, RelocationPriorityItem } from '../types';
import { assessCarryingCapacity } from '../services/riskEngine';
import { X, CheckCircle, AlertTriangle, XCircle, Droplets, Utensils, Shield, HeartPulse, Building2, Truck, ArrowRight } from 'lucide-react';

interface CarryingCapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
  priorityItem: RelocationPriorityItem | null;
  candidateSites: RelocationSite[];
  onProceedToAlert: (site: RelocationSite, requiredPopulation: number) => void;
}

export const CarryingCapacityModal: React.FC<CarryingCapacityModalProps> = ({
  isOpen,
  onClose,
  priorityItem,
  candidateSites,
  onProceedToAlert,
}) => {
  if (!isOpen || !priorityItem) return null;

  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    candidateSites[0]?.id || ''
  );

  const activeSite = candidateSites.find((s) => s.id === selectedSiteId) || candidateSites[0];
  const requiredPop = priorityItem.population_exposed;

  const assessment = activeSite ? assessCarryingCapacity(activeSite, requiredPop) : null;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'SUITABLE':
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-black text-xs flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            SUITABLE
          </span>
        );
      case 'NEARING_LIMIT':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-black text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            NEARING LIMIT
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full font-black text-xs flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            INSUFFICIENT CAPACITY
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
              Safe Site Carrying Capacity Engine
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              Target Habitation: {priorityItem.area_name}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
              <span>Required Population: <strong className="text-slate-900">{requiredPop.toLocaleString()} citizens</strong></span>
              <span>•</span>
              <span>Risk: <strong className="text-red-600">{priorityItem.risk_score}/100</strong></span>
              <span>•</span>
              <span>Priority: <strong className="text-red-700">{priorityItem.relocation_priority}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Site Selector Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select Candidate Relocation Site:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidateSites.map((site) => {
                const isSelected = site.id === activeSite?.id;
                const siteAssess = assessCarryingCapacity(site, requiredPop);
                return (
                  <button
                    key={site.id}
                    onClick={() => setSelectedSiteId(site.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-extrabold text-sm text-slate-900">{site.name}</div>
                      {getStatusBadge(siteAssess.suitability_status)}
                    </div>
                    <div className="mt-2 text-xs text-slate-600 grid grid-cols-2 gap-1">
                      <div>Safety Score: <strong>{site.safety_score}/100</strong></div>
                      <div>Distance: <strong>{site.distance_from_hazard_km} km</strong></div>
                      <div>Max Capacity: <strong>{site.carrying_capacity.toLocaleString()}</strong></div>
                      <div>Available: <strong className="text-emerald-700">{site.available_capacity.toLocaleString()}</strong></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Resource Capacity Breakdown */}
          {activeSite && assessment && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{activeSite.name}</h4>
                  <p className="text-xs text-slate-500">Resource bottleneck analysis & carrying limits</p>
                </div>
                {getStatusBadge(assessment.suitability_status)}
              </div>

              {/* Capacity Status Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Max Capacity</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {activeSite.carrying_capacity.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">Total headroom</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Current Occupancy</div>
                  <div className="text-lg font-black text-slate-700 mt-0.5">
                    {activeSite.current_allocated.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">Currently sheltered</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Available Space</div>
                  <div className="text-lg font-black text-emerald-700 mt-0.5">
                    {assessment.available_capacity.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Vacant beds</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Capacity Gap</div>
                  <div className={`text-lg font-black mt-0.5 ${assessment.capacity_gap >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {assessment.capacity_gap >= 0 ? `+${assessment.capacity_gap.toLocaleString()}` : assessment.capacity_gap.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">vs {requiredPop.toLocaleString()} evacuees</div>
                </div>
              </div>

              {/* Sub-resource bars */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" /> Housing & Space
                    </span>
                    <span className="text-slate-900 font-bold">{activeSite.housing_capacity.toLocaleString()} persons</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-700 h-2 rounded-full" style={{ width: `${Math.min(100, (activeSite.housing_capacity / 6000) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" /> Drinking Water Storage & R.O.
                    </span>
                    <span className="text-slate-900 font-bold">{activeSite.water_capacity.toLocaleString()} persons/day</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, (activeSite.water_capacity / 6000) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Utensils className="w-3.5 h-3.5 text-amber-500" /> Community Kitchen & Food Rations
                    </span>
                    <span className="text-slate-900 font-bold">{activeSite.food_capacity.toLocaleString()} rations/day</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${Math.min(100, (activeSite.food_capacity / 6000) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <HeartPulse className="w-3.5 h-3.5 text-red-500" /> Medical & First-Aid Post
                    </span>
                    <span className="text-slate-900 font-bold">{activeSite.medical_capacity.toLocaleString()} patient capacity</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: `${Math.min(100, (activeSite.medical_capacity / 6000) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Assessment Evaluation Box */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  AI Decision Support Guidance:
                </div>
                <ul className="space-y-1 text-xs text-slate-600">
                  {assessment.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>

                {assessment.capacity_gap < 0 && (
                  <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between">
                    <span>
                      ⚠️ <strong>Capacity Insufficient:</strong> Recommend splitting excess {Math.abs(assessment.capacity_gap).toLocaleString()} citizens across secondary relocation campus.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          {activeSite && (
            <button
              onClick={() => {
                onProceedToAlert(activeSite, requiredPop);
                onClose();
              }}
              className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Assign Site & Generate Alert</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
