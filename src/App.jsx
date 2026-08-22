// src/App.jsx
import React from 'react';
import { IncidentProvider, useIncidents } from './context/IncidentContext';
import ReportNeedForm from './components/victim/ReportNeedForm';
import MyReportsList from './components/victim/MyReportsList';
import ResponderView from './components/responder/ResponderView';
import IncidentStats from './components/command/IncidentStats';
import CommandMap from './components/command/CommandMap';
import IncidentQueue from './components/command/IncidentQueue';
import HopVisualizer from './components/network/HopVisualizer';
import { Radio, ShieldAlert, Activity, Network } from 'lucide-react';

function DashboardShell() {
  const { activeTab, setActiveTab } = useIncidents();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-900/30">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight">SAHAY</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Offline Disaster DTN</p>
          </div>
        </div>

        <nav className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
          {[
            { id: 'victim', label: 'Victim Log', icon: ShieldAlert },
            { id: 'responder', label: 'Responder', icon: Activity },
            { id: 'command', label: 'Command HQ', icon: Radio },
            { id: 'network', label: 'Mesh Graph', icon: Network },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        {activeTab === 'victim' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReportNeedForm />
            <MyReportsList />
          </div>
        )}
        
        {activeTab === 'responder' && <ResponderView />}
        
        {activeTab === 'command' && (
          <div className="space-y-6">
            <IncidentStats />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CommandMap />
              </div>
              <div>
                <IncidentQueue />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && <HopVisualizer />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <IncidentProvider>
      <DashboardShell />
    </IncidentProvider>
  );
}