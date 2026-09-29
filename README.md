#  DISHA

> **D**ata-driven **I**ntelligence for **S**afety, **H**azard **A**lerts — a web platform that combines weather and river-water data to give timely, easy-to-understand hazard insights.

![SIH 2026](https://img.shields.io/badge/SIH-2026-orange)
![PS](https://img.shields.io/badge/PS-260191-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📌 Short Description

**DISHA** brings live weather forecasts and river/water-level data into a single dashboard backed by a lightweight API layer. It pulls data from **IMD**, **CWC** and **Open-Meteo**, processes it in the backend, and shows clear, actionable information to users on a fast React (Vite) frontend hosted on Firebase.

---

## 🏆 Smart India Hackathon 2026

| Field | Details |
|-------|---------|
| **Hackathon** | Smart India Hackathon (SIH) 2026 |
| **Problem Statement ID** | **PS 260191** |
| **Project Name** | DISHA |
| **Team Name** | BatchMates|

---

## 🗂️ Folder Structure

```
disha_01/
├── .firebase/            # Firebase hosting cache
├── backend/
│   ├── app/              # Backend application logic (routes, services, API calls)
│   └── models/           # Data models / ML models
├── dist/                 # Production build output (generated)
├── node_modules/         # Node dependencies (generated)
├── src/                  # Frontend source code
├── .env.example          # Sample environment variables
├── .firebaserc           # Firebase project config
├── .gitignore
├── bun.lock              # Bun lockfile
├── firebase.json         # Firebase hosting config
├── index.html            # App entry HTML
├── metadata.json         # Project metadata
├── package-lock.json
├── package.json          # Node scripts & dependencies
├── README.md
├── requirements.txt      # Python dependencies (backend)
├── server.ts             # Node/TypeScript server entry
├── tsconfig.json         # TypeScript config
└── vite.config.ts        # Vite config
```

---

## 🧰 Tech Stack

### Frontend
- **React** + **TypeScript**
- **Vite** (build tool & dev server)
- **HTML5 / CSS3**

### Backend
- **Node.js** with **TypeScript** (`server.ts`)
- **Python** (`backend/app`, `backend/models`) for data processing / models
- REST API architecture

### Deployment
- **Firebase Hosting** (frontend)
- **Firebase CLI** for deploys

### Tools
- **Bun / npm** — package management
- **Git & GitHub** — version control

---

## 🌐 APIs Used

| API | Purpose | Link |
|-----|---------|------|
| **IMD API** (India Meteorological Department) | Official weather forecasts, warnings, rainfall data | https://mausam.imd.gov.in/ |
| **CWC API** (Central Water Commission) | River water levels, flood forecasts, reservoir data | https://cwc.gov.in/ · https://indiawris.gov.in/ |
| **Open-Meteo API** | Free global weather & flood forecast data (no API key needed) | https://open-meteo.com/ · [Docs](https://open-meteo.com/en/docs) · [Flood API](https://open-meteo.com/en/docs/flood-api) |

---

## ⚙️ Getting Started — Run the Project

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (or [Bun](https://bun.sh/))
- [Python](https://www.python.org/) 3.9+
- [Git](https://git-scm.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli) (only for deployment)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd disha_01
```

### 2. Install frontend / Node dependencies
```bash
npm install
# or
bun install
```

### 3. Set up environment variables
```bash
# Windows (PowerShell)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```
Open `.env` and fill in the required keys (API keys, Firebase config, etc.).

### 4. Install Python dependencies (backend)
```bash
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 5. Start the development server
```bash
npm run dev
```
The app will be available at **http://localhost:3000** (or the port shown in the terminal).

### 6. Build for production
```bash
npm run build
```
The output is generated in the `dist/` folder.

---

## 🚀 Deployment (Firebase Hosting)

```bash
# Install Firebase CLI (once)
npm install -g firebase-tools

# Login
firebase login

# Build the project
npm run build

# Deploy
firebase deploy
```

Firebase settings are in `firebase.json` and `.firebaserc`.

---

## 🔑 Environment Variables

See `.env.example` for the full list. Typical variables:

```env
# Add your own values
IMD_API_KEY=
CWC_API_KEY=
FIREBASE_API_KEY=
FIREBASE_PROJECT_ID=
```

> Open-Meteo does not require an API key for non-commercial use.

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---





<p align="center">Made with ❤️ for <b>Smart India Hackathon 2026</b></p>
