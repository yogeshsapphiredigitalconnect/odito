import React from 'react';

export default function TrendCell({ v }) {
  if (v > 0) {
    return (
      <span style={{ 
        color: '#10ffa0', 
        fontWeight: 700, 
        fontSize: 11, 
        whiteSpace: 'nowrap' 
      }}>
        ▲{v}%
      </span>
    );
  }
  
  if (v < 0) {
    return (
      <span style={{ 
        color: '#ff4560', 
        fontWeight: 700, 
        fontSize: 11, 
        whiteSpace: 'nowrap' 
      }}>
        ▼{Math.abs(v)}%
      </span>
    );
  }
  
  return (
    <span style={{ 
      color: '#3a4a5f', 
      fontSize: 11 
    }}>
      —
    </span>
  );
}
