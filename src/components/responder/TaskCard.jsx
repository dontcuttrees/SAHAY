// src/components/responder/TaskCard.jsx
import React from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { Clock, MapPin, Users, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

const SEVERITY_BADGES = {
  Critical: 'bg-red-950 text-red-400 border-red-800',
  High: 'bg-orange-950 text-orange-400 border-orange-800',
  Medium: 'bg-yellow-950 text-yellow-400 border-yellow-800',
  Low: 'bg-emerald-950 text-emerald-400 border-emerald-800',
};

export default function TaskCard({ incident }) {
  const { updateIncidentStatus } = useIncidents();

  const handleNextStatus = () => {
    switch (incident.status) {
      case 'Pending Sync':
      case 'Synced':
      case 'Reported':
        updateIncidentStatus(incident.id, 'Acknowledged');
        break;
      case 'Acknowledged':
        updateIncidentStatus(incident.id, 'In Progress');
        break;
      case 'In Progress':
        updateIncidentStatus(incident.id, 'Resolved');
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-blue-400">{incident.id}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
            {incident.category}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${SEVERITY_BADGES[incident.severity]}`}>
            {incident.severity}
          </span>
        </div>

        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {incident.status}
        </span>
      </div>

      <p className="text-sm text-slate-200">{incident.description}</p>

      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            {incident.peopleAffected} affected
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {incident.lat.toFixed(3)}, {incident.lng.toFixed(3)}
          </span>
        </div>

        <span className="text-[10px] text-slate-500 font-mono">
          {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* State Machine Transition Actions */}
      <div className="pt-1">
        {incident.status !== 'Resolved' ? (
          <button
            onClick={handleNextStatus}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              incident.status === 'In Progress'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {(incident.status === 'Pending Sync' || incident.status === 'Synced' || incident.status === 'Reported') && (
              <>Accept & Acknowledge <ChevronRight className="w-3.5 h-3.5" /></>
            )}
            {incident.status === 'Acknowledged' && (
              <>Start Response Deployment <ChevronRight className="w-3.5 h-3.5" /></>
            )}
            {incident.status === 'In Progress' && (
              <>Mark as Resolved <CheckCircle2 className="w-3.5 h-3.5" /></>
            )}
          </button>
        ) : (
          <div className="w-full py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs text-emerald-500 font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Incident Closed
          </div>
        )}
      </div>
    </div>
  );
}