import React, { useState } from 'react';
import { RelocationPriorityItem, RelocationSite } from '../types';
import { ArrowUpRight, Search, ShieldAlert, Users, Compass, ChevronRight } from 'lucide-react';

interface RelocationPriorityTableProps {
  items: RelocationPriorityItem[];
  onSelectPriorityItem: (item: RelocationPriorityItem) => void;
  selectedItemId?: string;
}

export const RelocationPriorityTable: React.FC<RelocationPriorityTableProps> = ({
  items,
  onSelectPriorityItem,
  selectedItemId,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = items.filter((item) => {
    const matchesPriority = filterPriority === 'ALL' || item.relocation_priority === filterPriority;
    const matchesQuery = item.area_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesQuery;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Immediate':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-700 border border-red-300 flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
            IMMEDIATE
          </span>
        );
      case 'Short Term':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 w-fit">
            SHORT TERM
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300 w-fit">
            MEDIUM TERM
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Filter Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/60">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-700" />
            Vulnerable Habitation Relocation Priority 
          </h3>
          
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter habitation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Priority filter pills */}
          <div className="flex rounded-xl bg-slate-200/80 p-0.5 text-xs font-bold text-slate-600">
            {(['ALL', 'Immediate', 'Short Term', 'Medium Term'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterPriority === p ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="py-3.5 px-4">Vulnerable Habitation</th>
              <th className="py-3.5 px-4 text-center">Risk</th>
              <th className="py-3.5 px-4 text-right">Population Exposed</th>
              <th className="py-3.5 px-4 text-center">Vulnerability</th>
              <th className="py-3.5 px-4 text-center">Priority</th>
              <th className="py-3.5 px-4">Recommended Strategy</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No habitations match your search filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectPriorityItem(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 text-slate-900 font-semibold'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                      
                        {item.area_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-red-600 text-sm">{item.risk_score}</span>
                      <span className="text-slate-400 text-[10px]">/100</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {item.population_exposed.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold">
                        {(item.vulnerability * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getPriorityBadge(item.relocation_priority)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {item.action}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPriorityItem(item);
                        }}
                        className="py-1 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors inline-flex items-center gap-1"
                      >
                        <span>Check Capacity</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
