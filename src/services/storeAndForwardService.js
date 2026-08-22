const QUEUE_KEY = 'shahay_sync_queue';

export function getSyncQueue() {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);

    if (!stored) {
      return [];
    }

    const queue = JSON.parse(stored);

    return Array.isArray(queue) ? queue : [];
  } catch (error) {
    console.error('Failed to read sync queue:', error);
    return [];
  }
}

function saveSyncQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueIncident(incident) {
  const queue = getSyncQueue();

  const existing = queue.find(
    (item) => item.incidentId === incident.incidentId
  );

  if (!existing) {
    queue.push({
      ...incident,
      status: 'Pending Sync',
      currentNode: 'NODE-A',
      relayHistory: ['NODE-A'],
      queuedAt: Date.now(),
    });

    saveSyncQueue(queue);
  }

  return getSyncQueue();
}

export function updateQueuedIncident(incidentId, updates) {
  const queue = getSyncQueue();

  const updatedQueue = queue.map((incident) =>
    incident.incidentId === incidentId
      ? { ...incident, ...updates }
      : incident
  );

  saveSyncQueue(updatedQueue);

  return updatedQueue;
}

export function removeFromQueue(incidentId) {
  const queue = getSyncQueue();

  const updatedQueue = queue.filter(
    (incident) => incident.incidentId !== incidentId
  );

  saveSyncQueue(updatedQueue);

  return updatedQueue;
}

/*
 * Software simulation of:
 *
 * NODE-A -> NODE-B -> NODE-C
 *
 * No real Bluetooth/Wi-Fi is used.
 */
export async function relayIncident(incidentId, onUpdate) {
  const queue = getSyncQueue();

  const incident = queue.find(
    (item) => item.incidentId === incidentId
  );

  if (!incident) {
    throw new Error(`Incident ${incidentId} not found in sync queue`);
  }

  // NODE-A -> NODE-B
  await wait(1500);

  updateQueuedIncident(incidentId, {
    currentNode: 'NODE-B',
    status: 'Pending Sync',
    relayHistory: ['NODE-A', 'NODE-B'],
  });

  if (onUpdate) {
    onUpdate({
      incidentId,
      currentNode: 'NODE-B',
      status: 'Pending Sync',
    });
  }

  // NODE-B -> NODE-C
  await wait(1500);

  updateQueuedIncident(incidentId, {
    currentNode: 'NODE-C',
    status: 'Pending Sync',
    relayHistory: ['NODE-A', 'NODE-B', 'NODE-C'],
  });

  if (onUpdate) {
    onUpdate({
      incidentId,
      currentNode: 'NODE-C',
      status: 'Pending Sync',
    });
  }

  return getSyncQueue().find(
    (item) => item.incidentId === incidentId
  );
}

/*
 * Send an incident to the SHAHAY backend.
 *
 * Backend endpoint expected:
 * POST /api/incidents
 */
export async function syncIncidentToBackend(incident) {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const response = await fetch(`${baseUrl}/api/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      incidentId: incident.incidentId,
      category: incident.category,
      severity: incident.severity,
      description: incident.description,
      peopleAffected: incident.peopleAffected,
      lat: incident.lat,
      lng: incident.lng,
      originNode: incident.originNode,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Backend sync failed: ${response.status}`
    );
  }

  return response.json();
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
let isSyncing = false;

export async function processSyncQueue() {
  if (isSyncing) {
    return [];
  }

  isSyncing = true;

  const synced = [];

  try {
    const queue = getSyncQueue();

    if (queue.length === 0) {
      return [];
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    for (const incident of queue) {
      try {
        // 1. Send the locally queued incident to MongoDB
        const result = await syncIncidentToBackend(incident);

        // Get the actual backend-generated incident ID
        const backendIncident = result.incident;

        if (!backendIncident?.incidentId) {
          throw new Error('Backend did not return an incident ID');
        }

        // 2. Mark the newly synced incident as Synced
        const statusResponse = await fetch(
          `${baseUrl}/api/incidents/${backendIncident.incidentId}/status`,
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

        if (!statusResponse.ok) {
          throw new Error(
            `Status update failed: ${statusResponse.status}`
          );
        }

        // 3. Remove it from the local queue
        removeFromQueue(incident.incidentId);

        synced.push(backendIncident.incidentId);

        console.log(
          `Incident ${backendIncident.incidentId} synced successfully.`
        );
      } catch (error) {
        console.warn(
          `Incident ${incident.incidentId} still pending:`,
          error.message
        );
      }
    }

    return synced;
  } finally {
    isSyncing = false;
  }
}