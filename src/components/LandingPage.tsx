import React from 'react';
import { DishaLogo } from './DishaLogo';
import { ShieldAlert, Compass, Home, Radio, ArrowRight, ShieldCheck, MapPin, Database, Users, ChevronRight, Activity } from 'lucide-react';

interface LandingPageProps {
  onOpenDashboard: () => void;
  onOpenCommandCentre: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenDashboard,
  onOpenCommandCentre,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
     
      

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex justify-center mb-2">
            <DishaLogo />
          </div>

          

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Intelligent Disaster Risk & Relocation Decision Support System
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            From hazard prediction to safe relocation — one intelligent platform for State & District Disaster Authorities.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onOpenDashboard}
              className="py-3.5 px-7 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/20 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Open Authority Command Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenCommandCentre}
              className="py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              
              <span>Situation Room (Control Centre)</span>
            </button>
          </div>

          {/* Core Decision Questions Solved Banner (Section 76) */}
          <div className="pt-8 max-w-4xl mx-auto">
           
          </div>
        </div>
      </div>

      {/* Section 64: What DISHA Does - Feature Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
            Platform Capabilities
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            What DISHA Delivers to Incident Commanders
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Comprehensive workflow integrating telemetry prediction, relocation mathematics, and field logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Multi-Hazard Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integrates Flood, Landslide, Cloudburst, Cyclone, and Extreme Rainfall indicators into a normalized 0-100 risk score with explainable AI attribution.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Red Zone Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identifies geographic polygons unsuitable for permanent habitation when combined risk exceeds safety thresholds or recurring hazards threaten human life.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Carrying Capacity Assessment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates available housing, drinking water, medical posts, and food rations at candidate relocation sites to prevent catastrophic shelter overcrowding.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Relocation Prioritization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Classifies habitations into Immediate, Short-Term, and Medium-Term stages based on population vulnerability, isolation indices, and distance to safety.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Geo-Tagged Citizen Alerts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Replaces generic warnings with actionable instructions containing exact GPS coordinates of assigned assembly pickup points, bus arrival times, and shelter destinations.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Multi-Agency Telemetry</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connects directly to IMD radar observations, CWC gauge hydrographs, Census demographic indices, and Open-Meteo ensemble forecasts.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      
    </div>
  );
};
