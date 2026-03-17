import React from 'react';

export default function KdRing({ kd }) {
  const color = kd >= 80 ? '#ff4560' : kd >= 60 ? '#ffbb33' : kd >= 35 ? '#00e5ff' : '#10ffa0';
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (kd / 100) * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <svg 
        width={28} 
        height={28} 
        style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}
      >
        <circle
          cx={14}
          cy={14}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={2.5}
        />
        <circle
          cx={14}
          cy={14}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div>
        <div style={{ 
          fontFamily: "'Syne',sans-serif", 
          fontWeight: 800, 
          fontSize: 12, 
          color, 
          lineHeight: 1 
        }}>
          {kd}
        </div>
        <div style={{ 
          fontSize: 8, 
          fontWeight: 700, 
          color, 
          opacity: 0.7, 
          letterSpacing: '0.05em' 
        }}>
          {kd >= 80 ? 'HARD' : kd >= 60 ? 'MED' : kd >= 35 ? 'OK' : 'EASY'}
        </div>
      </div>
    </div>
  );
}
