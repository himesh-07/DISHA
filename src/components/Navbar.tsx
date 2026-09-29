import React, { useState } from 'react';
import { DishaLogo } from './DishaLogo';
import { Search, ShieldAlert, Radio, AlertTriangle, Layers, Home, Compass, Truck, Database, UserCheck, Monitor, HelpCircle, RefreshCw } from 'lucide-react';
import { District } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onSearchSelect: (result: any) => void;
  onOpenCommandCentre: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onSearchSelect,
  onOpenCommandCentre,
  onRefreshData,
  isRefreshing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchInput = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length > 1) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setIsSearchOpen(true);
        }
      } catch {
        // Fallback
      }
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'risk-map', label: 'GIS Risk Map', icon: Layers },
    { id: 'relocation', label: 'Relocation & Capacity', icon: Compass },
    { id: 'shelters', label: 'Shelters & Hubs', icon: Home },
    { id: 'alerts', label: 'Emergency Alerts', icon: ShieldAlert },
    { id: 'rescue', label: 'Rescue Operations', icon: Truck },
    { id: 'datasources', label: 'Data Sources & AI', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-[500] bg-white border-b border-slate-200/90 shadow-xs backdrop-blur-md">
     
      

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Logo & Identity */}
        <div className="cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <DishaLogo size="md" showSubtitle={true} />
        </div>

        {/* AI Area Search Box (Section 17) */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search district, village, habitation or location..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-[600] space-y-1">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1">
                Identified Entities:
              </div>
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onSearchSelect(res);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-xs"
                >
                  <div>
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      {res.name}
                      {res.red_zone && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-black bg-red-600 text-white">
                          RED ZONE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {res.type === 'district' ? `${res.primary_hazard} • ${res.state}` : `Shelter (${res.available_capacity} free)`}
                    </div>
                  </div>
                  {res.risk_score && (
                    <span className="font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {res.risk_score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Tools & Role Mode */}
        <div className="flex items-center gap-2">
          {/* Situation Room / Command Centre button */}
          <button
            onClick={onOpenCommandCentre}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow transition-all cursor-pointer"
          >
           
            <span>Situation Room</span>
          </button>

          {/* Authority Mode Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-black shadow-2xs">
           
            <span>Authority Console</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50/90 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
