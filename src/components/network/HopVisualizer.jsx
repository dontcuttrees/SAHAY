// src/components/network/HopVisualizer.jsx
import React, { useState, useEffect } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { 
  Radio, 
  Server, 
  Smartphone, 
  Truck, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Send,
  WifiOff,
  Wifi
} from 'lucide-react';

const INITIAL_NODES = [
  { id: 'NODE-A', name: 'Field Victim Node', type: 'isolated', icon: Smartphone, location: 'Sector 4 (Grid Zero)' },
  { id: 'NODE-B', name: 'Ambulance Relay (Mule 1)', type: 'mule', icon: Truck, location: 'Sector 2 (Mobile)' },
  { id: 'NODE-C', name: 'Forward Staging Unit (Mule 2)', type: 'mule', icon: Radio, location: 'Perimeter Base' },
  { id: 'HQ-SERVER', name: 'Central Cloud Gateway', type: 'gateway', icon: Server, location: 'District HQ (Uplink Live)' },
];

export default function HopVisualizer() {
  const { incidents, updateIncidentStatus } = useIncidents();
  const [activePacket, setActivePacket] = useState(null);
  const [currentHopIndex, setCurrentHopIndex] = useState(0);
  const [isRelaying, setIsRelaying] = useState(false);
  const [relayLogs, setRelayLogs] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(incidents[0]?.id || '');

  const startHopSimulation = () => {
    const targetIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
    if (!targetIncident) return;

    setIsRelaying(true);
    setCurrentHopIndex(0);
    setActivePacket(targetIncident);
    setRelayLogs([
      `[${new Date().toLocaleTimeString()}] Packet ${targetIncident.id} queued at ${INITIAL_NODES[0].id} (TTL: 4)`
    ]);

    // Hop 0 -> Hop 1 (A -> B)
    setTimeout(() => {
      setCurrentHopIndex(1);
      setRelayLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] BLE Proximity Handshake: ${INITIAL_NODES[0].id} -> ${INITIAL_NODES[1].id} (Delivered, TTL: 3)`,
        ...prev
      ]);
    }, 1500);

    // Hop 1 -> Hop 2 (B -> C)
    setTimeout(() => {
      setCurrentHopIndex(2);
      setRelayLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Store-and-Forward: ${INITIAL_NODES[1].id} transferred payload to ${INITIAL_NODES[2].id} (TTL: 2)`,
        ...prev
      ]);
    }, 3000);

    // Hop 2 -> Hop 3 (C -> Server)
    setTimeout(async () => {
  setCurrentHopIndex(3);

  try {
    const response = await fetch(
      `http://localhost:5000/api/incidents/${targetIncident.id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Synced',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Sync failed');
    }

    setIsRelaying(false);

    // Update frontend only after MongoDB confirms the sync
    updateIncidentStatus(targetIncident.id, 'Synced');

    setRelayLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Uplink Established: ${INITIAL_NODES[2].id} synced payload with ${INITIAL_NODES[3].id} (Database Persisted)`,
      ...prev
    ]);

    console.log('Incident synced successfully:', data.incident);

  } catch (error) {
    setIsRelaying(false);

    setRelayLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Uplink FAILED: ${error.message}`,
      ...prev
    ]);

    console.error('Incident sync failed:', error);
  }
}, 4500);
  };

  const resetSimulation = () => {
    setIsRelaying(false);
    setCurrentHopIndex(0);
    setActivePacket(null);
    setRelayLogs([]);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-semibold uppercase">Target Packet:</label>
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            disabled={isRelaying}
            className="bg-slate-950 border border-slate-700 text-xs font-mono text-blue-400 py-1.5 px-3 rounded-lg outline-none"
          >
            {incidents.map((i) => (
              <option key={i.id} value={i.id}>
                {i.id} ({i.category} - {i.severity})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetSimulation}
            disabled={isRelaying}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={startHopSimulation}
            disabled={isRelaying || incidents.length === 0}
            className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition shadow-lg shadow-blue-900/30 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> {isRelaying ? 'Propagating Mesh...' : 'Transmit Hop Simulation'}
          </button>
        </div>
      </div>

      {/* Mesh Relay Pipeline Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
          Hop-By-Hop Delay-Tolerant Transmission Graph
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {INITIAL_NODES.map((node, index) => {
            const Icon = node.icon;
            const isCurrentHop = activePacket && currentHopIndex === index;
            const hasPassed = activePacket && currentHopIndex > index;

            return (
              <div
                key={node.id}
                className={`relative border rounded-xl p-4 transition-all duration-300 ${
                  isCurrentHop
                    ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-900/30 scale-102'
                    : hasPassed
                    ? 'bg-slate-950 border-emerald-800/60'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    isCurrentHop ? 'bg-blue-600 text-white animate-pulse' : hasPassed ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {node.type === 'gateway' ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                      <Wifi className="w-3 h-3" /> Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                      <WifiOff className="w-3 h-3" /> Offline Mesh
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-mono text-xs font-bold text-blue-400">{node.id}</p>
                  <p className="text-xs font-semibold text-slate-200">{node.name}</p>
                  <p className="text-[10px] text-slate-500">{node.location}</p>
                </div>

                {/* Packet Presence Badge */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  {isCurrentHop ? (
                    <div className="flex items-center gap-1.5 text-xs text-blue-300 font-mono font-medium">
                      <Send className="w-3.5 h-3.5 animate-bounce" /> Holding {activePacket.id}
                    </div>
                  ) : hasPassed ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Forwarded & Cleared
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-600 font-mono">Buffer Idle</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Packet Telemetry Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Relay Event Audit Log
        </h3>
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 space-y-1.5 max-h-[160px] overflow-y-auto">
          {relayLogs.length > 0 ? (
            relayLogs.map((log, idx) => (
              <p key={idx} className={idx === 0 ? 'text-blue-400 font-medium' : 'text-slate-500'}>
                {log}
              </p>
            ))
          ) : (
            <p className="text-slate-600">No mesh events logged. Trigger a transmission simulation above.</p>
          )}
        </div>
      </div>
    </div>
  );
}