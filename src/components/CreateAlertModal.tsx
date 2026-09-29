import React, { useState } from 'react';
import { District, Shelter, PickupPoint, Alert, HazardType } from '../types';
import { X, ShieldAlert, MapPin, Home, Send, CheckCircle2, MessageSquare, Radio, Smartphone, AlertOctagon, Navigation } from 'lucide-react';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  district: District | null;
  shelters: Shelter[];
  pickupPoints: PickupPoint[];
  onBroadcastAlert: (alertData: Omit<Alert, 'id' | 'created_at' | 'status' | 'dispatched_recipients'>) => void;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  isOpen,
  onClose,
  district,
  shelters,
  pickupPoints,
  onBroadcastAlert,
}) => {
  if (!isOpen) return null;

  // Filter pickups and shelters for this district
  const availablePickups = district
    ? pickupPoints.filter((p) => p.district_id === district.id)
    : pickupPoints;
  const availableShelters = district
    ? shelters.filter((s) => s.district_id === district.id)
    : shelters;

  const defaultPickup = availablePickups[0] || pickupPoints[0];
  const defaultShelter = availableShelters[0] || shelters[0];

  const [affectedArea, setAffectedArea] = useState(
    district ? `${district.name} — Riverfront & Lowland Habitation` : 'Korba Sitamani Ward'
  );
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'WARNING'>('CRITICAL');
  const [hazard, setHazard] = useState<HazardType>(district?.primary_hazard || 'Flood');
  const [affectedPop, setAffectedPop] = useState<number>(4230);
  const [selectedPickupId, setSelectedPickupId] = useState<string>(defaultPickup?.id || '');
  const [selectedShelterId, setSelectedShelterId] = useState<string>(defaultShelter?.id || '');
  const [channels, setChannels] = useState({
    sms: true,
    whatsapp: true,
    sirens: true,
    push: true,
  });

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [simulatedLog, setSimulatedLog] = useState<string | null>(null);

  const activePickup = availablePickups.find((p) => p.id === selectedPickupId) || defaultPickup;
  const activeShelter = availableShelters.find((s) => s.id === selectedShelterId) || defaultShelter;

  const defaultMessage = `EMERGENCY EVACUATION ALERT: Saturated flash flood threat along ${affectedArea}. Immediate mandatory relocation ordered. Move immediately to ${activePickup?.name || 'Pickup Point'} (${activePickup?.distance_km || 1.2} km) for bus transit to ${activeShelter?.name || 'District Shelter'}. Available shelter capacity: ${activeShelter?.available_capacity?.toLocaleString() || 1250} people.`;

  const [message, setMessage] = useState(defaultMessage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    onBroadcastAlert({
      message,
      target_area: affectedArea,
      district_id: district?.id || 'CG-KOR',
      latitude: district?.latitude || 22.3595,
      longitude: district?.longitude || 82.7501,
      pickup_point_id: activePickup?.id || 'PP-CG-KOR-01',
      pickup_point_name: activePickup?.name || 'Government School Ground',
      pickup_lat: activePickup?.latitude || 22.3520,
      pickup_lng: activePickup?.longitude || 82.7480,
      shelter_id: activeShelter?.id || 'SH-CG-KOR-01',
      shelter_name: activeShelter?.name || 'District Relief Centre',
      shelter_lat: activeShelter?.latitude || 22.3685,
      shelter_lng: activeShelter?.longitude || 82.7610,
      available_capacity: activeShelter?.available_capacity || 1250,
      severity,
      hazard,
      affected_population: affectedPop,
    });

    setSimulatedLog(`Broadcast successfully dispatched to ${affectedPop.toLocaleString()} citizens via Cell Broadcast (SMS), Sirens, and WhatsApp.`);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[750] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-red-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Generate Geo-Tagged Emergency Alert</h3>
              <p className="text-xs text-red-100">Actionable Citizen Evacuation Dispatch Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Operational Safety Rule Banner (Section 73) */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center gap-2 text-xs text-amber-900 font-semibold">
          <AlertOctagon className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            AI Recommendation — Authority Confirmation Required before operational emergency broadcast.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {simulatedLog ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900">Broadcast Dispatched</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">{simulatedLog}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Affected Zone
                  </label>
                  <input
                    type="text"
                    value={affectedArea}
                    onChange={(e) => setAffectedArea(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Hazard Classification
                  </label>
                  <select
                    value={hazard}
                    onChange={(e) => setHazard(e.target.value as HazardType)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Flood">Flood (River Inundation)</option>
                    <option value="Landslide">Landslide & Debris Flow</option>
                    <option value="Cloudburst">Cloudburst & Flash Flood</option>
                    <option value="Extreme Rainfall">Extreme Rainfall</option>
                    <option value="Cyclone">Cyclone & Storm Surge</option>
                    <option value="Coastal Erosion">Coastal Erosion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Severity Alert Level
                  </label>
                  <div className="flex gap-2">
                    {(['CRITICAL', 'HIGH', 'WARNING'] as const).map((lvl) => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setSeverity(lvl)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all ${
                          severity === lvl
                            ? lvl === 'CRITICAL'
                              ? 'bg-red-600 text-white border-red-600'
                              : lvl === 'HIGH'
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-amber-400 text-slate-950 border-amber-400'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Estimated Exposed Population
                  </label>
                  <input
                    type="number"
                    value={affectedPop}
                    onChange={(e) => setAffectedPop(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Automatic Destination Recommendations & Exact Location Coordinates */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                    Actionable Routing Coordinates (System Auto-Paired)
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    GIS VALIDATED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Designated Pickup Point Card */}
                  <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm space-y-2">
                    <label className="text-[11px] font-bold text-amber-900 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" /> Designated Pickup Point
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold">Assembly Hub</span>
                    </label>

                    <select
                      value={selectedPickupId}
                      onChange={(e) => setSelectedPickupId(e.target.value)}
                      className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900"
                    >
                      {availablePickups.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.distance_km} km)
                        </option>
                      ))}
                    </select>

                    {/* Detailed Location & Coordinate Breakdown */}
                    {activePickup && (
                      <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-100 text-xs space-y-1.5">
                        <div className="font-extrabold text-amber-950 text-xs leading-snug">
                          📍 {activePickup.name}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 font-medium">
                          <div>
                            Coordinates:
                            <span className="font-mono font-bold text-slate-900 block">
                              {activePickup.latitude.toFixed(5)}° N, {activePickup.longitude.toFixed(5)}° E
                            </span>
                          </div>
                          <div>
                            Distance to Hazard:
                            <span className="font-bold text-amber-800 block">
                              {activePickup.distance_km} km radius
                            </span>
                          </div>
                          <div>
                            Road Access:
                            <span className={`font-bold block ${activePickup.road_status === 'Clear' ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {activePickup.road_status}
                            </span>
                          </div>
                          <div>
                            Transport Staged:
                            <span className="font-bold text-slate-900 block">
                              {activePickup.transport_vehicles_ready} Rescue Buses
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 pt-1 border-t border-amber-200/50 flex justify-between items-center">
                          <span>Assembly Capacity: <strong>{activePickup.capacity}</strong></span>
                          <span>Queue: <strong>{activePickup.current_queue} evacuees</strong></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Designated Safe Shelter Card */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-2">
                    <label className="text-[11px] font-bold text-emerald-900 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Home className="w-3.5 h-3.5 text-emerald-600" /> Designated Safe Shelter
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Relocation Destination</span>
                    </label>

                    <select
                      value={selectedShelterId}
                      onChange={(e) => setSelectedShelterId(e.target.value)}
                      className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900"
                    >
                      {availableShelters.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (Cap: {s.available_capacity.toLocaleString()})
                        </option>
                      ))}
                    </select>

                    {/* Detailed Shelter Location & Coordinates */}
                    {activeShelter && (
                      <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-100 text-xs space-y-1.5">
                        <div className="font-extrabold text-emerald-950 text-xs leading-snug">
                          🏥 {activeShelter.name}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 font-medium">
                          <div>
                            Coordinates:
                            <span className="font-mono font-bold text-slate-900 block">
                              {activeShelter.latitude.toFixed(5)}° N, {activeShelter.longitude.toFixed(5)}° E
                            </span>
                          </div>
                          <div>
                            Available Headroom:
                            <span className="font-bold text-emerald-800 block">
                              {activeShelter.available_capacity.toLocaleString()} beds
                            </span>
                          </div>
                          <div>
                            Status:
                            <span className="font-bold text-emerald-700 block">
                              {activeShelter.accessibility_status}
                            </span>
                          </div>
                          <div>
                            Medical Post:
                            <span className="font-bold text-slate-900 block">
                              {activeShelter.medical_available ? 'Physician Ready' : 'Limited'}
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 pt-1 border-t border-emerald-200/50 flex justify-between items-center">
                          <span>Incharge: <strong>{activeShelter.contact_person}</strong></span>
                          <span>Emergency Line: <strong>{activeShelter.contact_phone}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actionable Message Editor */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Citizen SMS / Push Broadcast Text
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 font-mono text-slate-800"
                />
              </div>

              {/* Geo-tagged message preview (Section 31) */}
              <div className="p-3 bg-slate-900 rounded-xl text-emerald-400 font-mono text-[10px] overflow-x-auto">
                <div className="text-slate-400 mb-1 text-[9px] uppercase tracking-wider font-sans font-bold">
                  Geo-Tagged Dispatch Payload (JSON Telemetry):
                </div>
                <pre>
{JSON.stringify(
  {
    alert_id: 'ALT-GEN-NEW',
    severity,
    target_zone: affectedArea,
    hazard,
    pickup_point: {
      name: activePickup?.name,
      lat: activePickup?.latitude,
      lng: activePickup?.longitude,
      distance_km: activePickup?.distance_km,
    },
    shelter: {
      name: activeShelter?.name,
      lat: activeShelter?.latitude,
      lng: activeShelter?.longitude,
      available_capacity: activeShelter?.available_capacity,
    },
  },
  null,
  2
)}
                </pre>
              </div>

              {/* Multi-Channel Checklist */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Emergency Broadcast Channels:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <label className="flex items-center gap-1.5 p-2 rounded-lg border bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.sms}
                      onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                    <span>Cell Broadcast</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-lg border bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.whatsapp}
                      onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                    <span>WhatsApp</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-lg border bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.sirens}
                      onChange={(e) => setChannels({ ...channels, sirens: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <Radio className="w-3.5 h-3.5 text-slate-600" />
                    <span>Siren Relays</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-lg border bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.push}
                      onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
                    <span>Web & Push</span>
                  </label>
                </div>
              </div>

              {/* Explicit Authority Confirmation Checkbox (Section 73) */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-red-900 font-bold">
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                  />
                  <span>
                    I, as Designated Disaster Authority Officer, authorize this immediate mass evacuation broadcast.
                  </span>
                </label>
              </div>
            </>
          )}

          {!simulatedLog && (
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isConfirmed}
                className={`py-2.5 px-6 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 transition-all ${
                  isConfirmed
                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-red-600/30'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Authorize & Dispatch Alert</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
