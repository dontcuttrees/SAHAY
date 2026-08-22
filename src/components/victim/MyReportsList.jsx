
import React from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { Clock, CheckCircle2, Radio } from 'lucide-react';

export default function MyReportsList() {
  const { incidents } = useIncidents();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Local Incident Queue ({incidents.length})
      </h3>

      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
        {incidents.map((report) => (
          <div
            key={report.id}
            className="bg-slate-900 border border-slate-700/80 rounded-lg p-3 flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400">{report.id}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {report.category}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    report.severity === 'Critical'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {report.severity}
                </span>
              </div>
              <p className="text-xs text-slate-300">{report.description}</p>
              <div className="text-[10px] text-slate-500">
                Origin: {report.originNode} • Affected: {report.peopleAffected}
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              {report.status === 'Synced' ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium animate-pulse">
                  <Radio className="w-3.5 h-3.5" /> Pending Sync
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}