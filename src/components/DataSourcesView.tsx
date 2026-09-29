import React from 'react';
import { DataSourceStatus } from '../types';
import { Database, CheckCircle, RefreshCw, Layers, Cpu, Radio, ShieldCheck, ArrowDown, Activity, AlertCircle } from 'lucide-react';

interface DataSourcesViewProps {
  sources: DataSourceStatus[];
  onRefresh: () => void;
  isRefreshing: boolean;
  refreshMessage?: string;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({
  sources,
  onRefresh,
  isRefreshing,
  refreshMessage,
}) => {
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing Connectors...' : 'Trigger Pipeline Refresh'}</span>
        </button>
      </div>

      {refreshMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{refreshMessage}</span>
        </div>
      )}

      {/* Synthetic Demo Label - Section 72 */}
      <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950">
          <span className="font-black uppercase tracking-wider block text-amber-900">
            Data Integrity Notice (Section 72 Standard)
          </span>
          This sandbox currently displays calibrated synthetic demo datasets mirroring real CWC water gauges, IMD radar polygons, and Census distributions.
          <strong className="block mt-0.5">
            "Demo/Synthetic Data — Not for operational emergency decisions."
          </strong>
        </div>
      </div>

      {/* Data Source Cards (Section 36) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source) => (
          <div
            key={source.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                  {source.category}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">{source.name}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                {source.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{source.notes}</p>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Latency</div>
                <div className="text-xs font-black text-slate-900 mt-0.5 font-mono">
                  {source.latency_ms} ms
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Records</div>
                <div className="text-xs font-black text-slate-900 mt-0.5">
                  {source.records_received.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Data Quality</div>
                <div className="text-xs font-black text-emerald-700 mt-0.5">
                  {source.data_quality}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono truncate">
              Endpoint: {source.endpoint}
            </div>
          </div>
        ))}
      </div>

      
    </div>
  );
};
