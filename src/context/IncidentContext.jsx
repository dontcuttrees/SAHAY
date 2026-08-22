// src/context/IncidentContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const IncidentContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api/incidents';

const INITIAL_LOCAL_INCIDENTS = [
  {
    id: 'INC-7012',
    category: 'Medical',
    severity: 'Critical',
    peopleAffected: 4,
    description: 'Crush injuries near collapsed transit terminal. Immediate triage and stretcher needed.',
    lat: 12.9716,
    lng: 77.5946,
    status: 'Pending Sync',
    timestamp: '10:42 AM',
    assignedTo: null,
  },
  {
    id: 'INC-7013',
    category: 'Water',
    severity: 'High',
    peopleAffected: 18,
    description: 'Clean drinking water contaminated by main pipeline burst in residential sector 3.',
    lat: 12.9820,
    lng: 77.6080,
    status: 'In Progress',
    timestamp: '11:15 AM',
    assignedTo: 'Alpha Team (Mule 1)',
  },
  {
    id: 'INC-7014',
    category: 'Missing Persons',
    severity: 'Medium',
    peopleAffected: 2,
    description: 'Two elderly individuals unaccounted for after building evacuation.',
    lat: 12.9610,
    lng: 77.5800,
    status: 'Synced',
    timestamp: '11:50 AM',
    assignedTo: null,
  }
];

export function IncidentProvider({ children }) {
  const [incidents, setIncidents] = useState(INITIAL_LOCAL_INCIDENTS);
  const [activeTab, setActiveTab] = useState('victim');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // 1. Fetch Incidents from Backend (GET)
  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const data = await response.json();
      
      // Ensure backend data adapts to UI format (handles _id -> id if MongoDB schema used)
      const formatted = (Array.isArray(data) ? data : data.incidents || []).map((item) => ({
        ...item,
        id: item.id || item._id || `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        lat: Number(item.lat || item.location?.lat || 12.9716),
        lng: Number(item.lng || item.location?.lng || 77.5946),
      }));

      if (formatted.length > 0) {
        setIncidents(formatted);
      }
      setIsOnline(true);
    } catch (err) {
      console.warn('Backend unavailable, using local state buffer:', err.message);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // 2. Add New Incident from Report Form (POST)
  // Find addIncident in src/context/IncidentContext.jsx and update payload:

const addIncident = async (newReport) => {
  const payload = {
    ...newReport,
    originNode: 'NODE-A', // Required by backend schema (Field Victim Node)
    id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Pending Sync',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // Optimistically update local UI immediately
  setIncidents((prev) => [payload, ...prev]);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const savedData = await response.json();
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === payload.id
            ? { ...inc, status: 'Synced', ...(savedData._id || savedData.id ? { id: savedData.id || savedData._id } : {}) }
            : inc
        )
      );
      setIsOnline(true);
    }
  } catch (err) {
    console.warn('POST failed, item saved locally with Pending Sync:', err.message);
    setIsOnline(false);
  }
};

  // 3. Update Incident Status / Responders (PATCH/PUT)
  const updateIncidentStatus = async (id, status, assignedTo = null) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? { ...inc, status, ...(assignedTo !== null ? { assignedTo } : {}) }
          : inc
      )
    );

    try {
      await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedTo }),
      });
    } catch (err) {
      console.warn('Status update queued locally:', err.message);
    }
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        activeTab,
        setActiveTab,
        addIncident,
        updateIncidentStatus,
        fetchIncidents,
        isLoading,
        isOnline,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  return useContext(IncidentContext);
}