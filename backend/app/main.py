"""
DISHA — Disaster Intelligence, Safety, Hazard Assessment & Relocation Assistant
FastAPI Backend Main Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="DISHA Backend API",
    description="Intelligent Disaster Risk & Relocation Decision Support System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "system": "DISHA Decision Support System",
        "demo_mode": True,
        "label": "Demo/Synthetic Data — Not for operational emergency decisions"
    }

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    return {
        "total_monitored_areas": 245,
        "critical_red_zones": 38,
        "high_risk_zones": 67,
        "people_at_risk": 2400000,
        "relocation_required": 18450,
        "total_shelter_capacity": 92000,
        "available_shelter_capacity": 31400,
        "active_alerts_count": 3
    }
