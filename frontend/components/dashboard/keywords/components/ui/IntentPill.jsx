import React from 'react';

export default function IntentPill({ intent }) {
  const config = {
    navigational: { color: '#a855f7', background: 'rgba(168,85,247,0.14)', label: 'NAV' },
    commercial: { color: '#ffbb33', background: 'rgba(255,187,51,0.14)', label: 'COM' },
    informational: { color: '#00e5ff', background: 'rgba(0,229,255,0.12)', label: 'INFO' }
  };

  const { color, background, label } = config[intent] || config.informational;

  return (
    <span style={{
      fontSize: 9,
      fontWeight: 800,
      padding: '3px 7px',
      borderRadius: 5,
      background,
      color,
      border: `1px solid ${color}35`,
      letterSpacing: '0.08em',
      whiteSpace: 'nowrap'
    }}>
      {label}
    </span>
  );
}
