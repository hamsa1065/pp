# Dementia BioTracker 🧠

> **"Digital Biomarker for Dementia & Circadian Rhythm Disorder"**  
> Early Detection Using Samsung Galaxy Watch Biomarkers — No MRI Required  
> K.L.N. College of Engineering · Department of AI & Data Science

---

## What it does

Upload your Samsung Health ZIP export → AI analyses 13 biomarkers from your watch → displays a **dementia risk score (0–100%)** with clinical staging (CDR/GDS), class probabilities, and biomarker dashboard.

**Model:** Gradient Boosting Classifier · 41,702 patient records · **98.55% accuracy** · 5-fold CV: 98.67% ± 0.10%

---

## Project Structure

```
dementia-biotracker/
├── app/
│   ├── layout.js              ← Root HTML layout
│   ├── page.js                ← Main page (client)
│   ├── globals.css            ← Global styles + Tailwind
│   └── api/
│       └── diagnose/
│           └── route.js       ← Backend API: receives ZIP → runs Python → returns JSON
├── components/
│   ├── HeroSection.jsx        ← Paper title, authors, abstract, stats
│   ├── UploadSection.jsx      ← Drag-drop ZIP upload + Run Diagnosis button
│   ├── ResultsDashboard.jsx   ← Full output dashboard
│   ├── RiskGauge.jsx          ← Animated SVG gauge (0–100)
│   └── LoadingOverlay.jsx     ← Loading screen with step-by-step progress
├── python/
│   ├── dementia_model.pkl     ← Trained model (Gradient Boosting)
│   └── dementia_predict.py   ← Prediction engine (supports --json flag)
├── package.json
├── tailwind.config.js
├── next.config.mjs
└── README.md
```

---

## Setup & Run

### Prerequisites

- **Node.js** v18+ → https://nodejs.org
- **Python 3.8+** → https://python.org
- Python packages:

```bash
pip install scikit-learn pandas numpy
```

### 1. Install Node dependencies

```bash
cd dementia-biotracker
npm install
```

### 2. Verify Python model works

```bash
python3 python/dementia_predict.py /path/to/samsung_health.zip
```

### 3. Start the app

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## How to use

1. Open Samsung Health app on phone
2. **My page → Settings → Download personal data**
3. Download the ZIP
4. Upload the ZIP on the web app
5. Click **"Run Diagnosis"**
6. View full risk dashboard

---

## Features used from Samsung watch

| CSV File | Biomarker |
|---|---|
| `shealth.sleep.csv` | Sleep duration, Sleep efficiency |
| `sleep_stage.csv` | Awake/Light/Deep/REM minutes |
| `tracker.heart_rate.csv` | Avg heart rate, HRV (SDNN), Movement variability |
| `shealth.stress.csv` | Stress level (0–100) |
| `oxygen_saturation.csv` | SpO2 (blood oxygen %) |
| `skin_temperature.csv` | Skin temperature (°C) |
| `step_daily_trend.csv` | Daily step count |

---

## Risk Score Scale

| Score | Stage | CDR | Meaning |
|---|---|---|---|
| 0–20% | Stage 0 | CDR 0 | No impairment |
| 21–40% | Stage 0.5 | CDR 0.5 | Preclinical risk |
| 41–60% | Stage 1 | CDR 0.5–1 | Mild Cognitive Impairment (MCI) |
| 61–80% | Stage 2 | CDR 1–2 | Mild–Moderate Dementia |
| 81–100% | Stage 3 | CDR 2–3 | Moderate–Severe Dementia |

---

## Medical Disclaimer

This is a **screening tool only** — not a clinical diagnosis.  
Always consult a certified neurologist for proper evaluation.  
Standard clinical tests: MMSE · MoCA · MRI · PET scan.
