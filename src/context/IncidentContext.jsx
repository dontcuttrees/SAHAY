// src/context/IncidentContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  enqueueIncident,
  processSyncQueue,
} from '../services/storeAndForwardService';

const IncidentContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api/incidents';

const INITIAL_LOCAL_INCIDENTS = [
  {
    id: 'INC-7012',
    category: 'Medical',
    severity: 'Critical',
    peopleAffected: 4,
    description:
      'Crush injuries near collapsed transit terminal. Immediate triage and stretcher needed.',
    lat: 12.9716,
    lng: 77.5946,
    status: 'Pending Sync',
    timestamp: '10:42 AM',
    assignedTo: null,
    originNode: 'NODE-A',
  },
  {
    id: 'INC-7013',
    category: 'Water',
    severity: 'High',
    peopleAffected: 18,
    description:
      'Clean drinking water contaminated by main pipeline burst in residential sector 3.',
    lat: 12.9820,
    lng: 77.6080,
    status: 'In Progress',
    timestamp: '11:15 AM',
    assignedTo: 'Alpha Team (Mule 1)',
    originNode: 'NODE-B',
  },
  {
    id: 'INC-7014',
    category: 'Missing Persons',
    severity: 'Medium',
    peopleAffected: 2,
    description:
      'Two elderly individuals unaccounted for after building evacuation.',
    lat: 12.9610,
    lng: 75.5800,
    status: 'Synced',
    timestamp: '11:50 AM',
    assignedTo: null,
    originNode: 'NODE-C',
  },
];

export function IncidentProvider({ children }) {
  const [incidents, setIncidents] = useState(INITIAL_LOCAL_INCIDENTS);
  const [activeTab, setActiveTab] = useState('victim');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Fetch incidents from backend
  const fetchIncidents = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }

      const data = await response.json();

      const backendIncidents = Array.isArray(data)
        ? data
        : data.incidents || [];

      const formatted = backendIncidents.map((item) => ({
        ...item,

        // IMPORTANT:
        // Backend uses incidentId such as INC-1787438147845
        id:
          item.incidentId ||
          item.id ||
          item._id ||
          `INC-${Math.floor(1000 + Math.random() * 9000)}`,

        lat: Number(item.lat ?? item.location?.lat ?? 12.9716),
        lng: Number(item.lng ?? item.location?.lng ?? 77.5946),

        originNode: item.originNode || 'NODE-A',

        timestamp: item.timestamp || Date.now(),
      }));

      if (formatted.length > 0) {
        setIncidents(formatted);
      }

      setIsOnline(true);
    } catch (err) {
      console.warn(
        'Backend unavailable, using local state buffer:',
        err.message
      );

      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
  fetchIncidents();

  processSyncQueue().then((syncedIds) => {
    if (syncedIds.length > 0) {
      fetchIncidents();
    }
  });
}, []);

  // Add a new incident
  const addIncident = async (newIncident) => {
    const localIncidentId = `INC-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: newIncident.category,
          severity: newIncident.severity,
          description: newIncident.description,
          peopleAffected: Number(newIncident.peopleAffected),
          lat: newIncident.lat,
          lng: newIncident.lng,
          originNode: 'NODE-A',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create incident');
      }

      const backendIncident = data.incident;

      const formatted = {
        id: backendIncident.incidentId,
        incidentId: backendIncident.incidentId,
        category: backendIncident.category,
        severity: backendIncident.severity,
        description: backendIncident.description,
        peopleAffected: backendIncident.peopleAffected,
        lat: backendIncident.lat,
        lng: backendIncident.lng,
        timestamp: backendIncident.timestamp,
        status: backendIncident.status,
        originNode: backendIncident.originNode || 'NODE-A',
        assignedTo: null,
      };

      setIncidents((prev) => [formatted, ...prev]);

      setIsOnline(true);

      console.log(
        'Incident saved to SHAHAY backend:',
        formatted
      );
    } catch (error) {
      console.error(
        'Backend unavailable. Storing incident locally:',
        error
      );

      // Offline/store-and-forward fallback
      const payload = {
        ...newIncident,
        id: localIncidentId,
        incidentId: localIncidentId,
        originNode: 'NODE-A',
        status: 'Pending Sync',
        currentNode: 'NODE-A',
        relayHistory: ['NODE-A'],
        timestamp: new Date().toISOString(),
      };

      setIncidents((prev) => [payload, ...prev]);

      // Queue it for later synchronization
      try {
        enqueueIncident(payload);
        console.log('Incident added to store-and-forward queue.');
      } catch (queueError) {
        console.error(
          'Failed to queue incident:',
          queueError
        );
      }

      setIsOnline(false);
    }
  };

  // Update incident status
  const updateIncidentStatus = async (
    id,
    status,
    assignedTo = null
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update incident status'
        );
      }

      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === id
            ? {
                ...inc,
                status,
                ...(assignedTo !== null
                  ? { assignedTo }
                  : {}),
              }
            : inc
        )
      );

      setIsOnline(true);

      console.log(
        'Incident status updated:',
        data.incident
      );
    } catch (err) {
      console.warn(
        'Status update failed:',
        err.message
      );

      // Still update the local UI so the offline state is visible
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === id
            ? {
                ...inc,
                status,
                ...(assignedTo !== null
                  ? { assignedTo }
                  : {}),
              }
            : inc
        )
      );

      setIsOnline(false);
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