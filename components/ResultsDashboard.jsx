'use client';

import { useEffect, useState } from 'react';
import RiskGauge from './RiskGauge';

/* ── helpers ── */
function getRiskMeta(score, cls) {
  if (score <= 20)  return { label: 'Low Risk',         color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', bar: 'bg-emerald-500', emoji: '✅', stage: 'STAGE 0' };
  if (score <= 40)  return { label: 'Mild Concern',     color: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/25',    bar: 'bg-lime-500',    emoji: '🟡', stage: 'STAGE 0.5' };
  if (score <= 60)  return { label: 'Moderate Risk',    color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   bar: 'bg-amber-500',   emoji: '⚠️', stage: 'STAGE 1' };
  if (score <= 80)  return { label: 'High Risk',        color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/25',  bar: 'bg-orange-500',  emoji: '🚨', stage: 'STAGE 2' };
  return              { label: 'Critical Risk',        color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     bar: 'bg-red-500',     emoji: '🆘', stage: 'STAGE 3' };
}

function bioStatus(key, value) {
  const config = {
    stress_level:         { good: [0,40],   warn: [40,60],   bad: [60,100] },
    sleep_efficiency:     { good: [85,100], warn: [75,85],   bad: [0,75]   },
    hrv_sdnn:             { good: [50,999], warn: [30,50],   bad: [0,30]   },
    daily_steps:          { good: [7000,99999], warn: [4000,7000], bad: [0,4000] },
    spo2_avg:             { good: [95,100], warn: [93,95],   bad: [0,93]   },
    avg_heart_rate:       { good: [55,75],  warn: [75,90],   bad: [90,999] },
    sleep_duration_hours: { good: [7,9],    warn: [6,7],     bad: [0,6]    },
    rem_minutes:          { good: [80,999], warn: [60,80],   bad: [0,60]   },
    deep_minutes:         { good: [60,999], warn: [40,60],   bad: [0,40]   },
    awake_minutes:        { good: [0,20],   warn: [20,40],   bad: [40,999] },
  };
  const c = config[key];
  if (!c) return { label: '—', color: 'text-gray-400', dot: 'bg-gray-500' };
  const v = Number(value);
  if (v >= c.good[0] && v <= c.good[1]) return { label: 'Normal',   color: 'text-emerald-400', dot: 'bg-emerald-500' };
  if (v >= c.warn[0] && v <= c.warn[1]) return { label: 'Watch',    color: 'text-amber-400',   dot: 'bg-amber-500'   };
  return                                         { label: 'Concern', color: 'text-red-400',     dot: 'bg-red-500'     };
}

/* friendly labels */
const FEAT_META = {
  daily_steps:          { label: 'Daily Steps',          unit: 'steps/day', icon: '🚶', desc: 'Physical activity level' },
  sleep_duration_hours: { label: 'Sleep Duration',       unit: 'hrs/night', icon: '😴', desc: 'Total nightly sleep' },
  sleep_efficiency:     { label: 'Sleep Efficiency',     unit: '%',         icon: '🌙', desc: 'Useful sleep / time in bed' },
  awake_minutes:        { label: 'Awake Time',           unit: 'min/night', icon: '👁️', desc: 'Wake episodes during sleep' },
  light_minutes:        { label: 'Light Sleep',          unit: 'min/night', icon: '💤', desc: 'Light sleep stage duration' },
  deep_minutes:         { label: 'Deep Sleep',           unit: 'min/night', icon: '🧠', desc: 'Restorative sleep stage' },
  rem_minutes:          { label: 'REM Sleep',            unit: 'min/night', icon: '🔄', desc: 'Memory processing stage' },
  avg_heart_rate:       { label: 'Avg Heart Rate',       unit: 'bpm',       icon: '❤️', desc: 'Median daily heart rate' },
  hrv_sdnn:             { label: 'HRV (SDNN)',           unit: 'ms',        icon: '📈', desc: 'Heart rate variability' },
  movement_variability: { label: 'Movement Variability', unit: 'index',     icon: '📡', desc: 'Gait/movement patterns' },
  spo2_avg:             { label: 'Blood Oxygen (SpO2)',  unit: '%',         icon: '🩸', desc: 'Oxygen saturation level' },
  skin_temperature:     { label: 'Skin Temperature',     unit: '°C',        icon: '🌡️', desc: 'Wrist skin temperature' },
  stress_level:         { label: 'Stress Level',         unit: '/100',      icon: '⚡', desc: 'Samsung stress score' },
};

const TOP_FEATURES = ['stress_level', 'sleep_efficiency', 'hrv_sdnn', 'daily_steps', 'spo2_avg'];

/* ── Bar component ── */
function AnimatedBar({ pct, colorClass, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${width}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </div>
  );
}

/* ── Main component ── */
export default function ResultsDashboard({ result }) {
  const {
    risk_score, prediction, stage, cdr, gds,
    consult_doctor, urgency, probabilities,
    features, message, stage_label,
  } = result;

  const meta    = getRiskMeta(risk_score, prediction);
  const classes = probabilities
    ? Object.entries(probabilities).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="space-y-6 animate-fade-up opacity-0">

      {/* ── Section header ── */}
      <div className="flex items-center gap-3 pt-4">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
          📊
        </div>
        <div>
          <h2 className="text-white font-display font-semibold text-lg">Diagnosis Results</h2>
          <p className="text-gray-500 text-xs">Gradient Boosting model · 41,702 training records</p>
        </div>
        <div className="ml-auto text-xs text-gray-600 font-mono">
          {new Date().toLocaleString()}
        </div>
      </div>

      {/* ── TOP ROW: Gauge + Verdict ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gauge card */}
        <div className={`glass rounded-2xl p-6 flex flex-col items-center ${meta.bg} border ${meta.border}`}>
          <RiskGauge score={risk_score} />

          <div className={`mt-4 text-center`}>
            <div className={`text-3xl font-display font-bold ${meta.color}`}>
              {risk_score.toFixed(1)}%
            </div>
            <div className={`inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full text-sm font-semibold ${meta.bg} border ${meta.border} ${meta.color}`}>
              <span>{meta.emoji}</span>
              {meta.label}
            </div>
          </div>
        </div>

        {/* Verdict card */}
        <div className={`glass rounded-2xl p-6 flex flex-col justify-between border ${meta.border}`}>
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Clinical Stage</span>
                <h3 className={`text-2xl font-display font-bold mt-1 ${meta.color}`}>{stage || meta.stage}</h3>
                <p className="text-gray-400 text-sm mt-0.5">{stage_label || prediction}</p>
              </div>
              <span className="text-4xl">{meta.emoji}</span>
            </div>

            {/* CDR / GDS */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'CDR Rating', value: cdr || '—', desc: 'Clinical Dementia Rating' },
                { label: 'GDS Stage',  value: gds || '—', desc: 'Global Deterioration Scale' },
              ].map((item) => (
                <div key={item.label} className="glass-light rounded-xl p-3">
                  <div className={`text-lg font-bold font-display ${meta.color}`}>{item.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Message */}
            <div className={`p-4 rounded-xl ${meta.bg} border ${meta.border} text-sm leading-relaxed`}>
              <p className={`font-semibold mb-2 ${meta.color}`}>
                {consult_doctor ? '🩺 Medical Recommendation' : '✅ Assessment Note'}
              </p>
              <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line">
                {message || (consult_doctor
                  ? `Consult a neurologist ${urgency ? `within ${urgency}` : ''}. Clinical assessment including MMSE/MoCA and brain imaging recommended.`
                  : 'No significant dementia indicators detected. Continue healthy habits and routine annual check-ups.')}
              </p>
            </div>
          </div>

          {/* Doctor alert */}
          {consult_doctor && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-2xl">🩺</span>
              <div>
                <p className="text-red-400 font-semibold text-sm">Consult a Doctor</p>
                <p className="text-gray-400 text-xs">
                  Urgency: <span className="text-red-300 font-medium">{urgency || 'As soon as possible'}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CLASS PROBABILITIES ── */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-display font-semibold mb-5 flex items-center gap-2">
          <span className="text-cyan-400">📊</span> Model Class Probabilities
        </h3>
        <div className="space-y-4">
          {classes.map(([cls, pct], i) => {
            const barColors = {
              Demented:    'bg-red-500',
              MCI:         'bg-amber-500',
              Nondemented: 'bg-emerald-500',
            };
            const textColors = {
              Demented:    'text-red-400',
              MCI:         'text-amber-400',
              Nondemented: 'text-emerald-400',
            };
            return (
              <div key={cls}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${textColors[cls] || 'text-gray-300'}`}>{cls}</span>
                    {cls === prediction && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-gray-700">
                        predicted
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-bold font-mono ${textColors[cls] || 'text-gray-300'}`}>
                    {pct.toFixed(2)}%
                  </span>
                </div>
                <AnimatedBar pct={pct} colorClass={barColors[cls] || 'bg-cyan-500'} delay={i * 150} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── KEY BIOMARKER CARDS ── */}
      <div>
        <h3 className="text-white font-display font-semibold mb-4 flex items-center gap-2">
          <span className="text-cyan-400">🔬</span> Key Risk Drivers
          <span className="text-gray-500 text-sm font-normal font-sans">— top model features</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TOP_FEATURES.map((key, i) => {
            if (!features) return null;
            const val    = features[key];
            const meta2  = FEAT_META[key] || { label: key, unit: '', icon: '📊', desc: '' };
            const status = bioStatus(key, val);
            const importanceBar = [30.0, 26.8, 20.6, 19.7, 2.5]; // from training
            return (
              <div
                key={key}
                className="glass rounded-2xl p-4 flex flex-col gap-2 border border-gray-800/50
                  hover:border-gray-700 transition-colors animate-fade-up opacity-0"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{meta2.icon}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                    status.label === 'Normal'  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    status.label === 'Watch'   ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {status.label}
                  </span>
                </div>
                <div>
                  <div className="text-xl font-bold font-display text-white">
                    {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(1)) : val}
                    <span className="text-xs text-gray-500 font-normal ml-1">{meta2.unit}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{meta2.label}</div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Model weight</span>
                    <span>{importanceBar[i]}%</span>
                  </div>
                  <AnimatedBar pct={importanceBar[i] * 3} colorClass="bg-cyan-500/70" delay={200 + i * 100} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ALL 13 FEATURES TABLE ── */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800/60">
          <h3 className="text-white font-display font-semibold flex items-center gap-2">
            <span className="text-cyan-400">🗂️</span> All Extracted Biomarkers
            <span className="text-gray-500 text-sm font-normal font-sans ml-1">— 13 features from Samsung watch</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800/60">
                <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Biomarker</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Your Value</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Source</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {features && Object.entries(FEAT_META).map(([key, meta2], i) => {
                const val    = features[key];
                const status = bioStatus(key, val);
                const srcMap = {
                  daily_steps:          'step_daily_trend.csv',
                  sleep_duration_hours: 'shealth.sleep.csv',
                  sleep_efficiency:     'shealth.sleep.csv',
                  awake_minutes:        'sleep_stage.csv',
                  light_minutes:        'sleep_stage.csv',
                  deep_minutes:         'sleep_stage.csv',
                  rem_minutes:          'sleep_stage.csv',
                  avg_heart_rate:       'tracker.heart_rate.csv',
                  hrv_sdnn:             'health.hrv.csv',
                  movement_variability: 'tracker.heart_rate.csv',
                  spo2_avg:             'oxygen_saturation.csv',
                  skin_temperature:     'skin_temperature.csv',
                  stress_level:         'shealth.stress.csv',
                };
                return (
                  <tr
                    key={key}
                    className="border-b border-gray-800/30 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-gray-600 text-xs font-mono">{String(i+1).padStart(2,'0')}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span>{meta2.icon}</span>
                        <div>
                          <div className="text-gray-200 font-medium">{meta2.label}</div>
                          <div className="text-gray-600 text-xs">{meta2.desc}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-white font-mono font-semibold">
                        {typeof val === 'number'
                          ? (Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2))
                          : val ?? '—'}
                      </span>
                      <span className="text-gray-600 text-xs ml-1">{meta2.unit}</span>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-600 font-mono">{srcMap[key] || '—'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                        <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CLINICAL GUIDE ── */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-display font-semibold mb-5 flex items-center gap-2">
          <span className="text-cyan-400">📋</span> Clinical Stage Reference
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { score: '0–20%',  stage: 'Stage 0',   cdr: 'CDR 0',     label: 'No Impairment',       color: 'border-emerald-500/30 text-emerald-400', active: risk_score <= 20 },
            { score: '21–40%', stage: 'Stage 0.5', cdr: 'CDR 0.5',   label: 'Questionable',        color: 'border-lime-500/30 text-lime-400',        active: risk_score > 20 && risk_score <= 40 },
            { score: '41–60%', stage: 'Stage 1',   cdr: 'CDR 0.5–1', label: 'Mild MCI',            color: 'border-amber-500/30 text-amber-400',      active: risk_score > 40 && risk_score <= 60 },
            { score: '61–80%', stage: 'Stage 2',   cdr: 'CDR 1–2',   label: 'Mild–Moderate',       color: 'border-orange-500/30 text-orange-400',    active: risk_score > 60 && risk_score <= 80 },
            { score: '81–100%',stage: 'Stage 3',   cdr: 'CDR 2–3',   label: 'Moderate–Severe',     color: 'border-red-500/30 text-red-400',          active: risk_score > 80 },
          ].map((item) => (
            <div
              key={item.stage}
              className={`rounded-xl p-3 border transition-all ${
                item.active
                  ? `${item.color.split(' ')[0]} bg-white/5 ring-1 ring-white/10`
                  : 'border-gray-800/50 opacity-50'
              }`}
            >
              <div className={`text-sm font-bold font-display ${item.active ? item.color.split(' ')[1] : 'text-gray-500'}`}>
                {item.stage}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{item.cdr}</div>
              <div className="text-xs text-gray-400 mt-1">{item.label}</div>
              <div className="text-xs text-gray-600 mt-1">{item.score}</div>
              {item.active && (
                <div className="mt-2 text-xs font-semibold text-white/80">← You are here</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="glass rounded-2xl p-5 border border-amber-500/10">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <p className="text-amber-400 font-semibold text-sm mb-1">Medical Disclaimer</p>
            <p className="text-gray-500 text-xs leading-relaxed">
              Dementia BioTracker is a <strong className="text-gray-400">research-grade screening tool</strong> trained
              on anonymised population data. It is <strong className="text-gray-400">not a clinical diagnosis</strong>.
              All results must be interpreted by a qualified neurologist. Recommended clinical tests:
              MMSE · MoCA · MRI · PET scan · Full neuropsychological battery.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
