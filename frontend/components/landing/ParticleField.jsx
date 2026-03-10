"use client";

import { useEffect, useState } from 'react';

const ParticleField = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${4 + Math.random() * 4}s`,
    }));
    setParticles(particles);
  }, []);

  return (
    <div className="hero-particles">
      {particles.map((p, i) => (
        <div key={i} className="particle" style={{ 
          left: p.left, 
          top: p.top, 
          animationDelay: p.delay, 
          animationDuration: p.duration 
        }} />
      ))}
    </div>
  );
};

export default ParticleField;
