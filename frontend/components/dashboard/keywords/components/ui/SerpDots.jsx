import React from 'react';

export default function SerpDots({ types }) {
  const iconMap = {
    ai_overview: { icon: '✦', color: '#a855f7' },
    local_pack: { icon: '📍', color: '#10ffa0' },
    people_also_ask: { icon: '?', color: '#00e5ff' },
    video: { icon: '▶', color: '#ff4560' },
    knowledge_graph: { icon: '◈', color: '#ffbb33' },
    product_considerations: { icon: '🛒', color: '#ffbb33' },
    discussions_and_forums: { icon: '💬', color: '#00e5ff' },
    perspectives: { icon: '◉', color: '#7c3aed' },
    paid: { icon: '$', color: '#ffbb33' }
  };

  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {types
        .filter(type => iconMap[type])
        .slice(0, 4)
        .map((type, index) => (
          <span
            key={index}
            title={type.replace(/_/g, ' ')}
            style={{ fontSize: 10, color: iconMap[type].color, opacity: 0.85 }}
          >
            {iconMap[type].icon}
          </span>
        ))}
    </div>
  );
}
