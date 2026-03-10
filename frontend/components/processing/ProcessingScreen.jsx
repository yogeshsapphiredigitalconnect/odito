"use client";

import { useState, useEffect } from 'react';
import StepList from './StepList';

const ProcessingScreen = ({ onDone }) => {
  const steps = [
    { label: "Crawling Pages", icon: "🕷", time: 600 },
    { label: "Technical Analysis", icon: "⚙️", time: 900 },
    { label: "AI Content Scan", icon: "🧠", time: 1100 },
    { label: "Keyword Analysis", icon: "🎯", time: 800 },
    { label: "Backlink Check", icon: "🔗", time: 700 },
    { label: "AI Readability Scan", icon: "✨", time: 600 },
    { label: "Calculating Scores", icon: "📊", time: 500 },
  ];
  const [done, setDone] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let idx = 0;
    let cumulative = 0;
    steps.forEach((s, i) => {
      cumulative += s.time;
      setTimeout(() => {
        setDone(d => [...d, i]);
        setActive(i + 1);
        if (i === steps.length - 1) setTimeout(onDone, 800);
      }, cumulative);
    });
  }, []);

  const progress = (done.length / steps.length) * 100;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: 480, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="url(#proc-grad)" strokeWidth="6"
                strokeDasharray={`${2*Math.PI*32}`}
                strokeDashoffset={`${2*Math.PI*32 * (1 - progress/100)}`}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.5s" }}
              />
              <defs>
                <linearGradient id="proc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#00e5ff" />
                </linearGradient>
              </defs>
              <text x="40" y="44" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" fontFamily="'Syne', sans-serif">{Math.round(progress)}%</text>
            </svg>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Analyzing Your Site</div>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>Estimated time: {Math.max(0, Math.ceil((steps.length - done.length) * 0.9))}s remaining</div>
        </div>

        <StepList steps={steps} done={done} active={active} />
      </div>
    </div>
  );
};

export default ProcessingScreen;
