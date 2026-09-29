import React, { useState, useEffect } from 'react';
import {
  State,
  District,
  Shelter,
  PickupPoint,
  RelocationSite,
  RelocationPriorityItem,
  Alert,
  DashboardSummary,
  DataSourceStatus,
  RescueOperation,
} from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { RiskMap } from './components/RiskMap';
import { StateDistrictSelector } from './components/StateSelector';
import { DistrictRiskCard } from './components/DistrictRiskCard';
import { TopRiskDistricts } from './components/TopRiskDistricts';
import { DistrictDetailPanel } from './components/DistrictDetailPanel';
import { RelocationPriorityTable } from './components/RelocationPriorityTable';
import { CarryingCapacityModal } from './components/CarryingCapacityModal';
import { CreateAlertModal } from './components/CreateAlertModal';
import { SheltersView } from './components/SheltersView';
import { AlertsView } from './components/AlertsView';
import { RescueTeamView } from './components/RescueTeamView';
import { DataSourcesView } from './components/DataSourcesView';
import { CommandCentreModal } from './components/CommandCentreModal';
import { DashboardKpiCards } from './components/DashboardKpiCards';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { ShieldAlert, Compass, Home, Layers, AlertTriangle, ArrowRight } from 'lucide-react';

export function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isCommandCentreOpen, setIsCommandCentreOpen] = useState<boolean>(false);

  // Core Data Stores
  const [states, setStates] = useState<State[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>('CG'); // Default Chhattisgarh
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('CG-KOR'); // Default Korba
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [relocationSites, setRelocationSites] = useState<RelocationSite[]>([]);
  const [relocationPriorities, setRelocationPriorities] = useState<RelocationPriorityItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rescueOps, setRescueOps] = useState<RescueOperation[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    total_monitored_areas: 0,
    critical_red_zones: 0,
    high_risk_zones: 0,
    people_at_risk: 0,
    relocation_required: 0,
    total_shelter_capacity: 0,
    available_shelter_capacity: 0,
    active_alerts_count: 0,
    rescue_teams_deployed: 0,
  });

  // Modal / Interaction states
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState<boolean>(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState<boolean>(false);
  const [activePriorityItem, setActivePriorityItem] = useState<RelocationPriorityItem | null>(null);
  const [isCreateAlertModalOpen, setIsCreateAlertModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshMessage, setRefreshMessage] = useState<string>('');

  // Initial load
  useEffect(() => {
    async function loadInitial() {
      const [stList, dList, sList, pList, rList, rpList, aList, roList, dsList, sum] =
        await Promise.all([
          api.getStates(),
          api.getDistricts('CG'),
          api.getShelters(),
          api.getPickupPoints(),
          api.getRelocationSites(),
          api.getRelocationPriorities(),
          api.getAlerts(),
          api.getRescueOperations(),
          api.getDataSources(),
          api.getDashboardSummary('CG'),
        ]);

      setStates(stList);
      setDistricts(dList);
      setShelters(sList);
      setPickupPoints(pList);
      setRelocationSites(rList);
      setRelocationPriorities(rpList);
      setAlerts(aList);
      setRescueOps(roList);
      setDataSources(dsList);
      setSummary(sum);
    }
    loadInitial();
  }, []);

  // When State changes: reload districts and dashboard summary
  const handleSelectState = async (stateId: string) => {
    setSelectedStateId(stateId);
    const [dList, sum] = await Promise.all([
      api.getDistricts(stateId),
      api.getDashboardSummary(stateId),
    ]);
    setDistricts(dList);
    setSummary(sum);
    if (dList.length > 0) {
      setSelectedDistrictId(dList[0].id);
    } else {
      setSelectedDistrictId('ALL');
    }
  };

  // When District changes
  const handleSelectDistrict = (districtId: string) => {
    setSelectedDistrictId(districtId);
    if (districtId !== 'ALL') {
      const target = districts.find((d) => d.id === districtId);
      if (target) {
        setIsDetailPanelOpen(true);
      }
    }
  };

  const handleSelectDistrictDirectly = (d: District) => {
    setSelectedStateId(d.state_id);
    setSelectedDistrictId(d.id);
    setIsDetailPanelOpen(true);
  };

  // Active selected District object
  const activeDistrict = districts.find((d) => d.id === selectedDistrictId) || districts[0] || null;
  const activeState = states.find((s) => s.id === selectedStateId);

  // Handlers for Relocation Plan and Alert generation
  const handleOpenRelocationPlan = (d?: District) => {
    setCurrentTab('relocation');
    setIsDetailPanelOpen(false);
    const targetDistrict = d || activeDistrict;
    if (targetDistrict) {
      const priorityMatch = relocationPriorities.find((p) => p.district_id === targetDistrict.id) || relocationPriorities[0];
      if (priorityMatch) {
        setActivePriorityItem(priorityMatch);
        setIsCapacityModalOpen(true);
      }
    }
  };

  const handleOpenCreateAlert = (d?: District) => {
    setIsCreateAlertModalOpen(true);
    setIsDetailPanelOpen(false);
  };

  const handleBroadcastAlert = async (alertData: any) => {
    const created = await api.createAlert(alertData);
    setAlerts((prev) => [created, ...prev]);
    setSummary((prev) => ({ ...prev, active_alerts_count: prev.active_alerts_count + 1 }));
  };

  const handleRefreshTelemetry = async () => {
    setIsRefreshing(true);
    const result = await api.refreshData();
    setIsRefreshing(false);
    setRefreshMessage(`${result.message} (Timestamp: ${result.timestamp})`);
    setTimeout(() => setRefreshMessage(''), 5000);
  };

  const handleSearchSelect = (result: any) => {
    if (result.type === 'district') {
      const found = districts.find((d) => d.id === result.id);
      if (found) {
        handleSelectDistrictDirectly(found);
      }
    } else if (result.type === 'shelter') {
      setCurrentTab('shelters');
    }
  };

  // 1. Landing View
  if (currentView === 'landing') {
    return (
      <LandingPage
        onOpenDashboard={() => setCurrentView('app')}
        onOpenCommandCentre={() => {
          setCurrentView('app');
          setIsCommandCentreOpen(true);
        }}
      />
    );
  }

  // 2. Login View
  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setCurrentView('app');
        }}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onSearchSelect={handleSearchSelect}
        onOpenCommandCentre={() => setIsCommandCentreOpen(true)}
        onRefreshData={handleRefreshTelemetry}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TAB 1: MAIN AUTHORITY DASHBOARD (Sections 15, 18, 19, 20) */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Step 1 & 2: State -> District Selectors */}
            <StateDistrictSelector
              states={states}
              selectedStateId={selectedStateId}
              onSelectState={handleSelectState}
              districts={districts}
              selectedDistrictId={selectedDistrictId}
              onSelectDistrict={handleSelectDistrict}
            />

            {/* Section 19: KPI Cards */}
            <DashboardKpiCards summary={summary} selectedStateName={activeState?.name} />

            {/* Interactive GIS Map & Risk Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* GIS Map (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      GIS Multi-Hazard & Habitation Risk Map
                    </h3>
                  </div>
                  
                </div>

                <RiskMap
                  districts={districts}
                  selectedDistrict={activeDistrict}
                  onSelectDistrict={handleSelectDistrictDirectly}
                  shelters={shelters}
                  pickupPoints={pickupPoints}
                  relocationSites={relocationSites}
                  heightClass="h-[520px]"
                />
              </div>

              {/* Right Side: District Risk Card & Top Risk Districts (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                {activeDistrict ? (
                  <DistrictRiskCard
                    district={activeDistrict}
                    onExploreRelocation={() => handleOpenRelocationPlan(activeDistrict)}
                    onCreateAlert={() => handleOpenCreateAlert(activeDistrict)}
                    onViewDetails={() => setIsDetailPanelOpen(true)}
                  />
                ) : (
                  <div className="bg-white rounded-2xl p-6 text-center text-slate-400 border border-slate-200">
                    Select a district to inspect risk card
                  </div>
                )}

                {/* Section 16: Top Risk Districts dynamically ranked */}
                <TopRiskDistricts
                  districts={districts}
                  onSelectDistrict={handleSelectDistrictDirectly}
                  selectedDistrictId={activeDistrict?.id}
                />
              </div>
            </div>

            {/* Relocation Quick View & Active Alerts Strip */}
            <div className="pt-2">
              <RelocationPriorityTable
                items={relocationPriorities}
                onSelectPriorityItem={(item) => {
                  setActivePriorityItem(item);
                  setIsCapacityModalOpen(true);
                }}
                selectedItemId={activePriorityItem?.id}
              />
            </div>
          </div>
        )}

        {/* TAB 2: GIS RISK MAP FULL VIEW (Section 14 & 21) */}
        {currentTab === 'risk-map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-6 h-6 text-emerald-700" />
                  Full-Screen GIS Spatial Hazard & Relocation Navigator
                </h2>
                <p className="text-xs text-slate-500">
                  Includes Red Zone polygons, shelter locations, pickup hubs, and evacuation polylines
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-bold">State:</span>
                <select
                  value={selectedStateId}
                  onChange={(e) => handleSelectState(e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                >
                  {states.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <RiskMap
              districts={districts}
              selectedDistrict={activeDistrict}
              onSelectDistrict={handleSelectDistrictDirectly}
              shelters={shelters}
              pickupPoints={pickupPoints}
              relocationSites={relocationSites}
              heightClass="h-[680px]"
            />
          </div>
        )}

        {/* TAB 3: RELOCATION & CARRYING CAPACITY (Sections 23-26) */}
        {currentTab === 'relocation' && (
          <div className="space-y-6">
            <RelocationPriorityTable
              items={relocationPriorities}
              onSelectPriorityItem={(item) => {
                setActivePriorityItem(item);
                setIsCapacityModalOpen(true);
              }}
              selectedItemId={activePriorityItem?.id}
            />

            {/* Safe Relocation Sites Overview Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900">
                Designated Safer Relocation Sites & Resource Headroom
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relocationSites.map((site) => (
                  <div
                    key={site.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        {site.area_acres} Acres Plateau
                      </span>
                      <span className="text-xs font-black text-emerald-700">
                        Safety: {site.safety_score}/100
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base">{site.name}</h4>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Carrying Capacity:</span>
                        <strong className="text-slate-900">{site.carrying_capacity.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Currently Allocated:</span>
                        <span>{site.current_allocated.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Buffer:</span>
                        <strong className="text-emerald-700">{site.available_capacity.toLocaleString()}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const match = relocationPriorities.find((p) => p.candidate_sites.some((cs) => cs.site_id === site.id)) || relocationPriorities[0];
                        setActivePriorityItem(match);
                        setIsCapacityModalOpen(true);
                      }}
                      className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Run Carrying Capacity Solver
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SHELTERS & PICKUP POINTS (Sections 27 & 56) */}
        {currentTab === 'shelters' && (
          <SheltersView
            shelters={shelters}
            pickupPoints={pickupPoints}
            selectedDistrictName={activeDistrict?.name}
          />
        )}

        {/* TAB 5: EMERGENCY ALERTS (Sections 28, 30, 31, 32) */}
        {currentTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onOpenCreateAlert={() => setIsCreateAlertModalOpen(true)}
            onInspectAlert={(alert) => {
              setCurrentTab('risk-map');
            }}
          />
        )}

        {/* TAB 6: RESCUE OPERATIONS (Sections 54 & 55) */}
        {currentTab === 'rescue' && (
          <RescueTeamView operations={rescueOps} />
        )}

        {/* TAB 7: DATA SOURCES & ARCHITECTURE (Sections 36, 65, 72) */}
        {currentTab === 'datasources' && (
          <DataSourcesView
            sources={dataSources}
            onRefresh={handleRefreshTelemetry}
            isRefreshing={isRefreshing}
            refreshMessage={refreshMessage}
          />
        )}
      </main>

      {/* Slide-in District Detail Panel (Section 22) */}
      {isDetailPanelOpen && (
        <DistrictDetailPanel
          district={activeDistrict}
          onClose={() => setIsDetailPanelOpen(false)}
          onFindSafeSites={(d) => handleOpenRelocationPlan(d)}
          onViewShelters={() => {
            setCurrentTab('shelters');
            setIsDetailPanelOpen(false);
          }}
          onCreateAlert={(d) => handleOpenCreateAlert(d)}
          onGenerateRelocationPlan={(d) => handleOpenRelocationPlan(d)}
        />
      )}

      {/* Carrying Capacity Assessment Modal (Sections 25 & 26) */}
      {isCapacityModalOpen && (
        <CarryingCapacityModal
          isOpen={isCapacityModalOpen}
          onClose={() => setIsCapacityModalOpen(false)}
          priorityItem={activePriorityItem}
          candidateSites={relocationSites}
          onProceedToAlert={(site, pop) => {
            setIsCreateAlertModalOpen(true);
          }}
        />
      )}

      {/* Create Geo-Tagged Alert Modal (Sections 30 & 31) */}
      {isCreateAlertModalOpen && (
        <CreateAlertModal
          isOpen={isCreateAlertModalOpen}
          onClose={() => setIsCreateAlertModalOpen(false)}
          district={activeDistrict}
          shelters={shelters}
          pickupPoints={pickupPoints}
          onBroadcastAlert={handleBroadcastAlert}
        />
      )}

      {/* Situation Room / Command Centre Full Screen Modal (Section 53) */}
      {isCommandCentreOpen && (
        <CommandCentreModal
          isOpen={isCommandCentreOpen}
          onClose={() => setIsCommandCentreOpen(false)}
          districts={districts}
          shelters={shelters}
          alerts={alerts}
          operations={rescueOps}
          summary={summary}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">DISHA Platform</span>
            <span>• Intelligent Disaster Risk & Relocation Decision Support System</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Compliant with NDMA & SDMA Early Warning Protocols • Demo Mode Active
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
