# DISHA — Disaster Intelligence, Safety, Hazard Assessment & Relocation Assistant

> **Intelligent Disaster Risk & Relocation Decision Support System**  
> Built for State Disaster Management Authorities (SDMA), District Authorities (DDMA), Emergency Response Units, and Vulnerable Citizens in Indian disaster-prone regions.

---

## 1. Project Overview & Primary Objective
DISHA is a production-grade, responsive, GIS-enabled disaster decision-support platform designed to answer 8 life-saving questions in seconds during catastrophic hazard events:
1. **Where is the danger?** ➔ Interactive GIS Risk Map + Critical Red Zones.
2. **How dangerous is it?** ➔ 0–100 Normalized XGBoost Multi-Hazard Risk Score + AI Explainability.
3. **Who is vulnerable?** ➔ Demographic vulnerability, kutcha housing ratios, population density.
4. **Who should be relocated first?** ➔ Relocation Priority Engine (Immediate, Short-Term, Medium-Term).
5. **Where can they safely go?** ➔ Identified Safe Relocation Sites & Transit Campus plateaus.
6. **Can the destination handle them?** ➔ Carrying Capacity Solver (Water, Food, Medical, Space bottleneck evaluation).
7. **How do citizens reach safety?** ➔ Designated assembly pickup points & straight-line evacuation polylines.
8. **How do we notify citizens?** ➔ Geo-tagged emergency broadcasts containing exact pickup GPS coordinates and assigned shelter headroom.

---

## 2. Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Leaflet & OpenStreetMap, Recharts, Lucide React icons.
- **Backend**: Express + Vite proxy middleware in development; full Python FastAPI architecture in `/backend`.
- **Machine Learning & Risk Engine**: XGBoost Multi-Hazard Regressor simulation with TreeSHAP explainability feature attribution.
- **GIS Cartography**: OpenStreetMap Leaflet layers, GeoJSON polygons, custom pulsing HTML markers, dynamic risk color scale:
  - 🟢 Safe (0–39)
  - 🟡 Moderate (40–59)
  - 🟠 High (60–79)
  - 🔴 Critical / Red Zone (80–100)

---

## 3. Data Integrity & Operational Rule (Sections 72 & 73)
- **Demo Mode Notice**: All sensor feeds and telemetry data in this sandbox environment are calibrated synthetic demo values (`"Demo/Synthetic Data — Not for operational emergency decisions"`).
- **AI Safety & Human-in-the-Loop**: The platform does not autonomously execute irreversible decisions. All mass evacuation broadcasts require explicit authorized officer sign-off (`"AI Recommendation — Authority Confirmation Required"`).

---

## 4. REST API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/states` | List Indian disaster-prone states |
| `GET` | `/api/states/{id}/districts` | Filter districts for a given state |
| `GET` | `/api/districts/{id}` | Detailed district hazard and demographic metrics |
| `GET` | `/api/districts/{id}/risk` | XGBoost prediction, hazard sub-scores & confidence |
| `GET` | `/api/risk/top-districts` | Dynamic ranking of top high-risk districts |
| `GET` | `/api/red-zones` | Active critical Red Zone polygons |
| `GET` | `/api/shelters` | Emergency shelters with capacity & resource stock |
| `GET` | `/api/pickup-points` | Evacuation assembly points & queue size |
| `GET` | `/api/relocation-sites` | Candidate relocation sites & carrying capacity |
| `GET` | `/api/relocation/priorities` | Relocation priority matrix items |
| `POST` | `/api/alerts` | Create & broadcast geo-tagged emergency alert |
| `GET` | `/api/alerts` | Fetch recent operational alerts |
| `GET` | `/api/search?q={query}` | AI entity search across districts, habitations, shelters |
| `GET` | `/api/dashboard/summary` | KPI counters (Total areas, red zones, people at risk) |
| `POST` | `/api/data/refresh` | Resync telemetry feeds (IMD, CWC, Census, Open-Meteo) |
| `GET` | `/api/geo/districts` | GeoJSON boundary feature collection |

---

## 5. Getting Started & Installation

### Web App (Node.js & Express / Vite)
```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server (port 3000)
npm run dev

# 3. Build for production
npm run build
```

### Python FastAPI Backend (`backend/`)
```bash
# 1. Install Python packages
pip install -r requirements.txt

# 2. Start Uvicorn server
uvicorn backend.app.main:app --reload --port 8000
```

---

## 6. Supported Regions in Demo
- **Chhattisgarh**: Korba, Raigarh, Raipur, Bilaspur, Bastar (Jagdalpur), Surguja
- **Odisha**: Balasore, Puri, Kendrapara, Cuttack
- **Uttarakhand**: Chamoli, Rudraprayag, Uttarkashi
- **Assam**: Dhemaji, Barpeta, Kamrup (Guwahati)
- **Kerala**: Wayanad, Idukki, Alappuzha (Kuttanad)
- **West Bengal**: South 24 Parganas (Sundarbans)
- **Himachal Pradesh**: Kullu, Mandi
