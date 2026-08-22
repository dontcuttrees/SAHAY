// src/components/command/IncidentQueue.jsx
import React from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { ChevronRight, Radio } from 'lucide-react';

export default function IncidentQueue() {
  const { incidents, updateIncidentStatus } = useIncidents();

  // Sort: Critical first, then High, then Medium, then Low
  const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  const sortedIncidents = [...incidents].sort((a, b) => {
    return (priorityWeight[b.severity] || 0) - (priorityWeight[a.severity] || 0);
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Priority Incident Queue ({incidents.length})
        </h3>
        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
          <Radio className="w-3 h-3 animate-pulse" /> Live Telemetry
        </span>
      </div>

      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        {sortedIncidents.map((incident) => (
          <div
            key={incident.id}
            className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400">{incident.id}</span>
                <span className="text-xs text-slate-300 font-medium">{incident.category}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    incident.severity === 'Critical'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-orange-950 text-orange-400 border border-orange-800'
                  }`}
                >
                  {incident.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">{incident.description}</p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {incident.status}
              </span>
              {incident.status !== 'Resolved' && (
                <button
                  onClick={() => updateIncidentStatus(incident.id, 'In Progress')}
                  className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition"
                  title="Dispatch Unit"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}