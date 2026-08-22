// src/components/command/IncidentStats.jsx
import React from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { AlertCircle, Activity, CheckCircle2, Users } from 'lucide-react';

export default function IncidentStats() {
  const { incidents } = useIncidents();

  const criticalCount = incidents.filter((i) => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const inProgressCount = incidents.filter((i) => i.status === 'In Progress' || i.status === 'Acknowledged').length;
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved').length;
  const totalAffected = incidents
    .filter((i) => i.status !== 'Resolved')
    .reduce((sum, item) => sum + (Number(item.peopleAffected) || 0), 0);

  const stats = [
    { label: 'Critical Triage', value: criticalCount, icon: AlertCircle, color: 'text-red-400 bg-red-950/40 border-red-800/60' },
    { label: 'Active Response', value: inProgressCount, icon: Activity, color: 'text-amber-400 bg-amber-950/40 border-amber-800/60' },
    { label: 'Resolved Cases', value: resolvedCount, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60' },
    { label: 'Population at Risk', value: totalAffected, icon: Users, color: 'text-blue-400 bg-blue-950/40 border-blue-800/60' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className={`border rounded-xl p-3.5 flex items-center justify-between ${stat.color}`}>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold font-mono text-white mt-0.5">{stat.value}</p>
            </div>
            <Icon className="w-6 h-6 opacity-80" />
          </div>
        );
      })}
    </div>
  );
}