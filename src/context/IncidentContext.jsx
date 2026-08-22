
import React, { createContext, useContext, useState } from 'react';

const IncidentContext = createContext();

const INITIAL_REPORTS = [
  {
    id: 'INC-8F72A',
    category: 'Medical',
    severity: 'Critical',
    description: 'Multiple injuries, need immediate first aid and triage kits.',
    peopleAffected: 4,
    lat: 26.843,
    lng: 75.805,
    timestamp: Date.now() - 1000 * 60 * 15,
    status: 'Pending Sync', // 'Pending Sync' | 'Synced' | 'In Progress' | 'Resolved'
    originNode: 'NODE-A',
  },
  {
    id: 'INC-4B11C',
    category: 'Water',
    severity: 'High',
    description: 'Clean drinking water supply depleted.',
    peopleAffected: 25,
    lat: 26.848,
    lng: 75.812,
    timestamp: Date.now() - 1000 * 60 * 45,
    status: 'Synced',
    originNode: 'NODE-B',
  },
];

export function IncidentProvider({ children }) {
  const [incidents, setIncidents] = useState(INITIAL_REPORTS);
  const [activeTab, setActiveTab] = useState('victim'); // 'victim' | 'responder' | 'command' | 'network'

  const addIncident = (newIncident) => {
    const formatted = {
      ...newIncident,
      id: `INC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: Date.now(),
      status: 'Pending Sync',
      originNode: 'NODE-A',
    };
    setIncidents((prev) => [formatted, ...prev]);
  };

  const updateIncidentStatus = (id, newStatus) => {
    setIncidents((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <IncidentContext.Provider value={{ incidents, addIncident, updateIncidentStatus, activeTab, setActiveTab }}>
      {children}
    </IncidentContext.Provider>
  );
}

export const useIncidents = () => useContext(IncidentContext);