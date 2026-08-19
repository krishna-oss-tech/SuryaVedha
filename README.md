# SURYAVEDH (सूर्यवेध)
### *Simulate Tomorrow. Protect Solar Today.*
**Urban Solar Intelligence & Digital Twin** • *SIH1739 Aligned*

---

## 🌟 Overview

**Suryavedh** is a decision-support and digital twin platform for urban solar planning. It enables homeowners, campuses, commercial developers, and urban planners to analyze rooftop and façade (BIPV) solar potential, visualize dynamic solar trajectories and shadows in 3D, simulate future construction, evaluate solar conflicts, and discover optimal building envelopes before breaking ground.

---

## 🚀 Core Features

1. **3D LOD-1 Digital Twin & Local Metric Engine**
   - Interactive Three.js / React Three Fiber spatial canvas.
   - Extruded 3D LOD-1 buildings in local metric coordinates ($X, Y, Z$).
   - Verified building altimetry for **YCCE Campus Nagpur** and **Civil Lines Nagpur**, plus OpenStreetMap vector ingestion and custom plot input.

2. **Astronomical Solar Position & Ephemeris Engine**
   - High-precision Spencer (1971) & NREL SPA aligned algorithm.
   - Computes solar azimuth, elevation, zenith, declination, and equation of time.
   - Real-time 3D sun directional vector driving dynamic directional lighting and shadows.

3. **Deterministic 3D Rooftop PV Placement**
   - IEC 61724 standard PV yield model.
   - Places 540W Mono-PERC modules respecting setback safety perimeters and winter solstice row-to-row clearance.
   - Computes DC capacity (kWp), annual generation (MWh), specific yield (kWh/kWp), and CUF (%).

4. **Building Integrated Photovoltaics (BIPV) Façade Engine**
   - Perez 1990 & Hay-Davies anisotropic sky diffuse model on vertical surfaces.
   - Evaluates North, East, South, and West facades to identify prime BIPV envelopes.

5. **Future Construction Simulator & Solar Conflict Map (Primary USP)**
   - Interactive 3D tower geometry controls (height, setback, spatial offsets).
   - Real-time 3D shadow raycast projections that dynamically expand and rotate.
   - Categorizes solar conflicts into **CRITICAL**, **HIGH**, **MODERATE**, and **LOW** with quantified annual energy ($\text{kWh}$) and financial ($\text{₹}$) losses.

6. **Solar Access Planning Envelope & "FIND BETTER SCENARIO" Pareto Optimizer**
   - Computes maximum permissible height envelopes and minimum setback distances to protect $\ge 85\%$ solar access.
   - Multi-objective Pareto optimization finds the sweet spot balancing developer built-up area ($FSI$) and neighboring solar rights.

7. **25-Year DCF Financial & CEA Environmental Engines**
   - CAPEX, MSEDCL/MERC net-metering savings, payback period, 25-yr NPV, and Levelized Cost of Electricity ($LCOE$).
   - Central Electricity Authority (CEA India v19) grid baseline ($0.716\text{ kg CO}_2/\text{kWh}$) carbon avoidance.

8. **Official Solar Passport & Evidence Mode**
   - Certified **Solar Passport** and 20-Section Site Assessment Report.
   - **Evidence Mode** displaying governing mathematical equations, academic literature citations, and standard references.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Three.js, React Three Fiber, Tailwind CSS, Lucide Icons
- **Backend**: Python 3, FastAPI, Uvicorn, Pydantic v2, NumPy, Shapely
- **Science / GIS**: NREL SPA, Spencer Ephemeris, Perez Anisotropic POA, CEA India v19

---

## 🚦 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Unified Launcher
```bash
# Start both backend (port 8000) and frontend (port 5173)
python run_platform.py
```

### 2. Manual Startup

#### Backend:
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate   # Windows (or source .venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

- **Web App**: `http://localhost:5173/`
- **Interactive API Docs**: `http://127.0.0.1:8000/docs`

---

## 🧪 Running Tests

```bash
python -m pytest backend/tests/test_science.py -v
```

---

## 📄 License
MIT License. Developed for Smart India Hackathon (SIH1739).
