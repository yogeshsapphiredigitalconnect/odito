import React from 'react';
import { PageHeader, PageFooter } from '../layout';

export default function SectionDividerPage({ pageNum, sectionNum, title, subtitle }) {
  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={pageNum} />

      <div style={{ flex: 1, padding: '0', position: 'relative', overflow: 'hidden' }}>
        {/* Full-height dark section */}
        <div style={{
          background: '#0D1235', height: '100%', minHeight: 1160,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 60px 80px', position: 'relative', overflow: 'hidden'
        }}>
          {/* Dot grid texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.15,
            backgroundImage: 'radial-gradient(circle, #4F6EF7 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }} />

          {/* Big number watermark */}
          <div style={{
            position: 'absolute', bottom: 40, right: 60,
            fontSize: 280, fontWeight: 900, color: 'rgba(255,255,255,0.04)',
            fontFamily: "'Syne', sans-serif", lineHeight: 1, userSelect: 'none'
          }} className="letter-spacing-neg10">{sectionNum.toString().padStart(2, '0')}</div>

          {/* Section label */}
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <div style={{ fontSize: 12, color: '#00D4FF', fontWeight: 700, marginBottom: 8 }} className="letter-spacing-2">
              SECTION {sectionNum.toString().padStart(2, '0')}
            </div>
            <div style={{ width: 80, height: 2, background: '#4F6EF7' }} />
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 60, fontWeight: 800, color: '#fff',
            fontFamily: "'Syne', sans-serif", lineHeight: 1.1,
            marginBottom: 20, position: 'relative'
          }}>{title}</h1>

          {/* Subtitle */}
          <p style={{ fontSize: 18, color: '#8892C4', position: 'relative' }}>{subtitle}</p>
        </div>
      </div>

      <PageFooter page={pageNum} />
    </div>
  );
}
