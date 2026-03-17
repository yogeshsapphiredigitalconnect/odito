import React, { useState, useEffect } from 'react';

export default function VolBar({ vol, max }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth((vol / max) * 100);
    }, 300);
    return () => clearTimeout(timer);
  }, [vol, max]);

  const formatVolume = (v) => {
    return v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 52,
        height: 4,
        background: 'rgba(255,255,255,0.07)',
        borderRadius: 2,
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <div style={{
          height: '100%',
          width: `${width}%`,
          background: 'linear-gradient(90deg,#7c3aed,#00e5ff)',
          borderRadius: 2,
          transition: 'width 1s ease'
        }} />
      </div>
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#d0d8ee',
        fontFamily: "'Syne',sans-serif",
        whiteSpace: 'nowrap'
      }}>
        {formatVolume(vol)}
      </span>
    </div>
  );
}
