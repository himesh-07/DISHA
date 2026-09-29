import React from 'react';
import { District } from '../types';
import { X, ShieldAlert, Users, Activity, History, AlertTriangle, ArrowRight, MapPin, CheckCircle, Navigation } from 'lucide-react';
import { FeatureImportanceChart } from './FeatureImportanceChart';
import { ExplainabilityPanel } from './ExplainabilityPanel';

interface DistrictDetailPanelProps {
  district: District | null;
  onClose: () => void;
  onFindSafeSites: (district: District) => void;
  onViewShelters: (district: District) => void;
  onCreateAlert: (district: District) => void;
  onGenerateRelocationPlan: (district: District) => void;
}

export const DistrictDetailPanel: React.FC<DistrictDetailPanelProps> = ({
  district,
  onClose,
  onFindSafeSites,
  onViewShelters,
  onCreateAlert,
  onGenerateRelocationPlan,
}) => {
  if (!district) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-600';
    return 'text-emerald-600';
  };

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MODERATE':
        return 'bg-yellow-500 text-slate-950';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[600] flex flex-col border-l border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            {district.state_name} Disaster Command
          </span>
          <h3 className="text-xl font-black tracking-tight">{district.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {/* Risk Score Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Normalized Risk Score</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-4xl font-black ${getScoreColor(district.current_risk_score)}`}>
                  {district.current_risk_score}
                </span>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-block px-3 py-1 text-xs font-black rounded-lg shadow-sm ${getBadgeStyle(district.risk_level)}`}>
                {district.risk_level}
              </span>
              <div className="text-[11px] text-slate-500 mt-1.5 font-medium">
                XGBoost Confidence: <strong>91%</strong>
              </div>
            </div>
          </div>

          {/* Red Zone Status Banner */}
          <div className="mt-4 p-3 rounded-xl flex items-center justify-between bg-white border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Official Red Zone Classification:</span>
            {district.red_zone ? (
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-black tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                ACTIVE RED ZONE
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Standard Habitation
              </span>
            )}
          </div>
        </div>

        {/* Hazard Breakdown Bars */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
            Multi-Hazard Exposure Engine
          </h4>
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Flood Sub-Score
                </span>
                <span className="font-bold text-slate-900">{district.hazard_scores?.flood ?? 78}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${district.hazard_scores?.flood ?? 78}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Extreme Rainfall
                </span>
                <span className="font-bold text-slate-900">{district.hazard_scores?.extreme_rainfall ?? 75}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-2 rounded-full"
                  style={{ width: `${district.hazard_scores?.extreme_rainfall ?? 75}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span> Landslide & Slope
                </span>
                <span className="font-bold text-slate-900">{district.hazard_scores?.landslide ?? 20}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-2 rounded-full"
                  style={{ width: `${district.hazard_scores?.landslide ?? 20}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span> Cloudburst Risk
                </span>
                <span className="font-bold text-slate-900">{district.hazard_scores?.cloudburst ?? 30}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${district.hazard_scores?.cloudburst ?? 30}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Demographic & Infrastructure Profile */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Population</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {district.population.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Density: <strong>{district.population_density}/km²</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Vulnerability</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {(district.vulnerability_index * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Socio-econ index
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Historical Events</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {district.historical_disaster_count} disasters
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Past 15 yrs record
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase">River Status</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {(district.river_level_ratio * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {district.river_name || 'Catchment Basin'}
            </div>
          </div>
        </div>

        {/* AI Explainability Component */}
        <ExplainabilityPanel
          explanation={district.explanation || []}
          primaryHazard={district.primary_hazard}
          riskScore={district.current_risk_score}
        />

        {/* Feature Importance Chart */}
        <FeatureImportanceChart features={district.feature_importance} />

        {/* Recommended Action Box */}
        <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Recommended Action
          </div>
          <p className="text-sm font-extrabold text-amber-950 mt-1">
            {district.recommended_action}
          </p>
        </div>
      </div>

      {/* Fixed Action Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onGenerateRelocationPlan(district)}
            className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Relocation Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onCreateAlert(district)}
            className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Create Alert</span>
            <ShieldAlert className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onFindSafeSites(district)}
            className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Find Safe Sites
          </button>

          <button
            onClick={() => onViewShelters(district)}
            className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            View Shelters
          </button>
        </div>
      </div>
    </div>
  );
};
