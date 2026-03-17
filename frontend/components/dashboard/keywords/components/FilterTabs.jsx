import React from 'react';

export default function FilterTabs({ filter, setFilter, counts, total }) {
  const tabs = [
    { id: 'all', label: 'All', count: total },
    { id: 'commercial', label: 'Commercial', count: counts.commercial },
    { id: 'informational', label: 'Informational', count: counts.informational },
    { id: 'navigational', label: 'Navigational', count: counts.navigational }
  ];

  return (
    <div className="filter-row">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`fbtn ${filter === tab.id ? 'on' : ''}`}
          onClick={() => setFilter(tab.id)}
        >
          {tab.label} <span style={{ opacity: 0.5, marginLeft: 2 }}>({tab.count})</span>
        </button>
      ))}
      <div style={{ 
        marginLeft: 'auto', 
        fontSize: 11, 
        color: '#5a6a82', 
        whiteSpace: 'nowrap' 
      }}>
        {total} shown
      </div>
    </div>
  );
}
