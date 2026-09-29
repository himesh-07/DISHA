import React from 'react';
import { Alert } from '../types';
import { ShieldAlert, Plus, Send, MapPin, Home, Smartphone, Radio, Users, CheckCircle } from 'lucide-react';

interface AlertsViewProps {
  alerts: Alert[];
  onOpenCreateAlert: () => void;
  onInspectAlert?: (alert: Alert) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onOpenCreateAlert,
  onInspectAlert,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            Actionable Emergency Evacuation Alerts & Broadcast Dispatch
          </h2>
          <p className="text-xs text-slate-500">
            Geo-tagged emergency alerts containing exact pickup point coordinates and shelter destination
          </p>
        </div>

        <button
          onClick={onOpenCreateAlert}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md shadow-red-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Emergency Alert</span>
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : alert.severity === 'HIGH'
                    ? 'bg-orange-500 text-white'
                    : 'bg-amber-400 text-slate-950'
                }`}>
                  {alert.severity} • {alert.hazard}
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {alert.target_area}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span>{new Date(alert.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-sans font-bold">
                  {alert.status}
                </span>
              </div>
            </div>

            {/* Alert Message */}
            <p className="text-sm font-semibold text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-sans">
              "{alert.message}"
            </p>

            {/* Geo-tagged Pairings (Section 28 & 31) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <div className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> Designated Assembly Point
                </div>
                <div className="font-extrabold text-slate-900 mt-1">
                  {alert.pickup_point_name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  GPS: {alert.pickup_lat.toFixed(4)}, {alert.pickup_lng.toFixed(4)}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-emerald-600" /> Assigned Shelter Destination
                </div>
                <div className="font-extrabold text-slate-900 mt-1">
                  {alert.shelter_name}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  Available Capacity: {alert.available_capacity.toLocaleString()} evacuees
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Citizens Dispatched
                  </div>
                  <div className="font-extrabold text-slate-900 mt-1">
                    {alert.dispatched_recipients.toLocaleString()} people reached
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-200/60 mt-2">
                  <Smartphone className="w-3 h-3 text-emerald-600" /> SMS Cell Broadcast
                  <span>•</span>
                  <Radio className="w-3 h-3 text-amber-600" /> Sirens Active
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Alert ID: <strong className="font-mono text-slate-600">{alert.id}</strong>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authority Broadcast Verified</span>
                </span>
                {onInspectAlert && (
                  <button
                    onClick={() => onInspectAlert(alert)}
                    className="py-1 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Focus Map Corridor
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
