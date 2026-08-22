
import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { AlertCircle, MapPin, Users, Send } from 'lucide-react';

const CATEGORIES = [
  { id: 'Medical', label: 'Medical', icon: '🏥' },
  { id: 'Water', label: 'Water', icon: '💧' },
  { id: 'Food', label: 'Food', icon: '🍱' },
  { id: 'Shelter', label: 'Shelter', icon: '🏠' },
  { id: 'Missing Person', label: 'Missing Person', icon: '👤' },
];

const SEVERITIES = [
  { id: 'Critical', label: 'Critical', color: 'bg-red-600 border-red-500 text-white' },
  { id: 'High', label: 'High', color: 'bg-orange-600 border-orange-500 text-white' },
  { id: 'Medium', label: 'Medium', color: 'bg-yellow-600 border-yellow-500 text-white' },
  { id: 'Low', label: 'Low', color: 'bg-emerald-600 border-emerald-500 text-white' },
];

export default function ReportNeedForm() {
  const { addIncident } = useIncidents();
  const [category, setCategory] = useState('Medical');
  const [severity, setSeverity] = useState('Critical');
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [description, setDescription] = useState('');
  const [coords, setCoords] = useState({ lat: 26.842, lng: 75.801 });
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        () => setIsLocating(false),
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    addIncident({
      category,
      severity,
      peopleAffected: Number(peopleAffected),
      description,
      lat: coords.lat,
      lng: coords.lng,
    });
    setDescription('');
    setPeopleAffected(1);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-400" /> Log Emergency Need
      </h3>

      {/* Category Selection */}
      <div>
        <label className="text-xs text-slate-400 font-medium block mb-2">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                category === cat.id
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Severity Selector */}
      <div>
        <label className="text-xs text-slate-400 font-medium block mb-2">Severity Level</label>
        <div className="grid grid-cols-4 gap-2">
          {SEVERITIES.map((sev) => (
            <button
              type="button"
              key={sev.id}
              onClick={() => setSeverity(sev.id)}
              className={`py-1.5 px-2 rounded-lg border text-xs font-semibold text-center transition ${
                severity === sev.id
                  ? sev.color
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {sev.label}
            </button>
          ))}
        </div>
      </div>

      {/* People Count & Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">People Affected</label>
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5">
            <Users className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="number"
              min="1"
              value={peopleAffected}
              onChange={(e) => setPeopleAffected(e.target.value)}
              className="bg-transparent text-sm w-full outline-none text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">Coordinates</label>
          <button
            type="button"
            onClick={handleGetLocation}
            className="w-full flex items-center justify-center gap-1 bg-slate-900 border border-slate-700 rounded-lg py-1.5 text-xs text-slate-300 hover:border-slate-500 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            {isLocating ? 'Locating...' : `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`}
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-slate-400 font-medium block mb-1">Details / Urgent Needs</label>
        <textarea
          required
          rows="2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. 2 elderly persons need oxygen, bridge collapsed near east exit..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition"
      >
        <Send className="w-4 h-4" /> Broadcast to Local Mesh
      </button>
    </form>
  );
}