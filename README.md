# SAHAY: Decentralized Offline Humanitarian Coordination Platform

SAHAY (RELIEF-MESH) is an offline-first, delay-tolerant humanitarian relief management platform designed for the critical first 72 hours following severe natural disasters or infrastructure collapse. When telecommunications and power grids are severed, SAHAY enables decentralized incident reporting, hop-by-hop store-and-forward peer relay across field units, and central triage mapping once an uplink is established.

---

## The Problem

Following major disasters, cellular networks are either destroyed or heavily saturated. Rescue personnel, emergency services, and stranded victims operate in complete information isolation. This leads to duplicate deployments to accessible areas while critical, isolated zones receive zero aid during the golden triage window.

---

## Core System Architecture

SAHAY functions across three operational tiers:

```
[Field Node A (Victim)]
       |
  (Local Data Persistence)
       v
[Field Node B (Mobile Mule / Responder)]
       |
  (Store-and-Forward Mesh Hop)
       v
[Field Node C (Staging Relay)]
       |
  (Uplink / Gateway Sync)
       v
[Central Command Center & Database]
```

1. **Decentralized Field Reporting (Victim/Volunteer):** Captures emergency needs (Medical, Water, Food, Shelter, Missing Persons) with offline geolocation, victim counts, and severity categorization.
2. **Store-and-Forward Relay Engine (DTN):** Propagates immutable event payloads across offline nodes using proximity exchange and Time-To-Live (TTL) packet counters to prevent network broadcast loops.
3. **Responder Lifecycle Management:** Enables field responders to claim, acknowledge, advance, and resolve tasks through an offline-safe state machine.
4. **Command HQ Tactical Map:** Visualizes incidents dynamically with severity color coding, deduplication grouping, and direct responder dispatch controls.
5. **Network Visualizer:** Real-time simulation of hop-by-hop packet routing and transmission event audit logs.

---

## Technology Stack

* **Frontend Framework:** React 19 (Vite)
* **Styling & Design System:** Tailwind CSS
* **Mapping Engine:** Leaflet / React-Leaflet with CartoDB Dark Matter tiles
* **Iconography:** Lucide React
* **State & Synchronization:** React Context / Local persistence queue
* **Backend Architecture:** Node.js, Express.js, MongoDB (RESTful Gateway)

---

## Repository Structure

```text
src/
├── components/
│   ├── victim/
│   │   ├── ReportNeedForm.jsx      # Field reporting interface with geolocation capture
│   │   └── MyReportsList.jsx       # Local queue visualizer with sync indicators
│   ├── responder/
│   │   ├── ResponderView.jsx       # Field responder task interface and filters
│   │   └── TaskCard.jsx            # Lifecycle state machine (Accept -> In Progress -> Resolve)
│   ├── command/
│   │   ├── CommandMap.jsx          # Interactive tactical map with custom severity pins
│   │   ├── IncidentStats.jsx       # High-level aggregate triage metric boxes
│   │   └── IncidentQueue.jsx       # Real-time sorted priority incident queue
│   └── network/
│       └── HopVisualizer.jsx       # Store-and-forward DTN packet relay simulator
├── context/
│   └── IncidentContext.jsx         # Central state store coordinating local and remote logs
├── App.jsx                         # Main dashboard navigation and tab routing
└── index.css                       # Global styles and tactical theme configurations
```

---

## Getting Started

### Prerequisites

* Node.js (v18.0.0 or higher)
* npm (v9.0.0 or higher)

### Setup Instructions

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone [https://github.com/dontcuttrees/SAHAY.git](https://github.com/dontcuttrees/SAHAY.git)
   cd SAHAY
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Build for deployment:
   ```bash
   npm run build
   ```

---

## Demonstration Workflow

1. **Victim Log:** Submit an emergency report offline. The report receives a unique tracking ID and enters the queue marked as `Pending Sync`.
2. **Mesh Graph:** Switch to the **Mesh Graph** tab, select the incident, and click **Transmit Hop Simulation** to observe the packet route step-by-step from Node A to Node B, then to Node C, before persisting to the Central Gateway.
3. **Command HQ:** Navigate to **Command HQ** to view the live tactical map with severity-coded pins and the priority triage queue.
4. **Responder View:** Open the **Responder** tab to claim the incident, update its status to `In Progress`, and complete the lifecycle by marking it `Resolved`.