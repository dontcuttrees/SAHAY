const STORAGE_KEY = 'shahay_incidents';

export function getStoredIncidents() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const incidents = JSON.parse(stored);

    return Array.isArray(incidents) ? incidents : [];
  } catch (error) {
    console.error('Failed to read incidents from local storage:', error);
    return [];
  }
}

export function saveIncidents(incidents) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    return true;
  } catch (error) {
    console.error('Failed to save incidents to local storage:', error);
    return false;
  }
}

export function saveIncident(incident) {
  const incidents = getStoredIncidents();

  const existingIndex = incidents.findIndex(
    (item) => item.id === incident.id
  );

  if (existingIndex >= 0) {
    incidents[existingIndex] = incident;
  } else {
    incidents.unshift(incident);
  }

  return saveIncidents(incidents);
}

export function updateStoredIncident(id, updates) {
  const incidents = getStoredIncidents();

  const updatedIncidents = incidents.map((incident) =>
    incident.id === id
      ? { ...incident, ...updates }
      : incident
  );

  return saveIncidents(updatedIncidents);
}

export function removeStoredIncident(id) {
  const incidents = getStoredIncidents();

  const remainingIncidents = incidents.filter(
    (incident) => incident.id !== id
  );

  return saveIncidents(remainingIncidents);
}

export function clearStoredIncidents() {
  localStorage.removeItem(STORAGE_KEY);
}