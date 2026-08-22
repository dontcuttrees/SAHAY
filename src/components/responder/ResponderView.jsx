// src/components/responder/ResponderView.jsx
import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import TaskCard from './TaskCard';
import { ShieldCheck, Filter } from 'lucide-react';

export default function ResponderView() {
  const { incidents } = useIncidents();
  const [filter, setFilter] = useState('Active'); // 'Active' | 'All' | 'Resolved'

  const filteredIncidents = incidents.filter((item) => {
    if (filter === 'Active') return item.status !== 'Resolved';
    if (filter === 'Resolved') return item.status === 'Resolved';
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Field Responder Unit Alpha-1</span>
        </div>

        <div className="flex items-center gap-1 text-xs">
          {['Active', 'All', 'Resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filter === f
                  ? 'bg-slate-800 text-blue-400 border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident) => (
            <TaskCard key={incident.id} incident={incident} />
          ))
        ) : (
          <div className="col-span-2 py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs">
            No incidents found in this filter view.
          </div>
        )}
      </div>
    </div>
  );
}