// src/components/command/CommandMap.jsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useIncidents } from '../../context/IncidentContext';
import { AlertCircle, Users, CheckCircle2, ChevronRight } from 'lucide-react';

// Fix Leaflet's default icon missing issue
delete L.Icon.Default.prototype._getIconUrl;

const createCustomIcon = (severity) => {
  let color = '#3B82F6'; // default
  if (severity === 'Critical') color = '#EF4444';
  if (severity === 'High') color = '#F97316';
  if (severity === 'Medium') color = '#FACC15';
  if (severity === 'Low') color = '#10B981';

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 0 10px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
};

// Component to dynamically re-center map when incidents change
function MapAutoCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function CommandMap() {
  const { incidents, updateIncidentStatus } = useIncidents();

  const defaultCenter = [26.843, 75.805];
  const center = incidents.length > 0 ? [incidents[0].lat, incidents[0].lng] : defaultCenter;

  return (
    <div className="h-[460px] w-full rounded-xl overflow-hidden border border-slate-800 relative z-0 shadow-lg">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full bg-slate-950"
      >
        <MapAutoCenter center={center} />

        {/* Dark Tactical CartoDB Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />

        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.lat, incident.lng]}
            icon={createCustomIcon(incident.severity)}
          >
            <Popup className="tactical-popup">
              <div className="p-2 space-y-2 text-slate-900 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">{incident.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 uppercase">
                    {incident.severity}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-sm leading-tight text-slate-950">{incident.category}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{incident.description}</p>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-200 pt-1.5">
                  <span>Affected: <strong>{incident.peopleAffected}</strong></span>
                  <span className="font-mono">{incident.status}</span>
                </div>

                {incident.status !== 'Resolved' && (
                  <button
                    onClick={() => updateIncidentStatus(incident.id, 'In Progress')}
                    className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded transition flex items-center justify-center gap-1"
                  >
                    Dispatch Nearest Unit <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}