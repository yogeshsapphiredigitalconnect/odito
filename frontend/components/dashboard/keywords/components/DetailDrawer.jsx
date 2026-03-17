import React from 'react';

const MONTHS = ["Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb"];

export default function DetailDrawer({ kw, loading = false, onClose }) {
  if (!kw && !loading) return null;

  // Show loading state
  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: 'min(360px, 100vw)',
        zIndex: 400,
        background: 'linear-gradient(180deg,#08111f,#04070f)',
        borderLeft: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: '#5a6a82', 
          fontSize: '14px' 
        }}>
          <div style={{ marginBottom: '10px' }}>Loading keyword details...</div>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '3px solid rgba(255,255,255,0.1)', 
            borderTop: '3px solid #00e5ff', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      </div>
    );
  }

  const maxVol = kw.monthly && kw.monthly.length > 0 ? Math.max(...kw.monthly) : 1;
  const minVol = kw.monthly && kw.monthly.length > 0 ? Math.min(...kw.monthly) : 0;

  const metricCards = [
    { label: 'Volume', value: kw.vol >= 1000 ? `${(kw.vol / 1000).toFixed(0)}K` : kw.vol, color: '#00e5ff' },
    { label: 'CPC', value: `$${kw.cpc.toFixed(2)}`, color: '#10ffa0' },
    { label: 'KD Score', value: `${kw.kd}/100`, color: kw.kd >= 80 ? '#ff4560' : kw.kd >= 60 ? '#ffbb33' : '#10ffa0' },
    { label: 'Intent', value: kw.intent.slice(0, 4).toUpperCase(), color: '#a855f7' }
  ];

  const trendCards = [
    { label: 'Monthly', value: kw.trend.monthly },
    { label: 'Quarterly', value: kw.trend.quarterly },
    { label: 'Yearly', value: kw.trend.yearly }
  ];

  const formatTrendValue = (v) => {
    if (v > 0) return `+${v}%`;
    if (v < 0) return `${v}%`;
    return '—';
  };

  const getTrendColor = (v) => {
    if (v > 0) return '#10ffa0';
    if (v < 0) return '#ff4560';
    return '#5a6a82';
  };

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: 'min(360px, 100vw)',
      zIndex: 400,
      background: 'linear-gradient(180deg,#08111f,#04070f)',
      borderLeft: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '-20px 0 60px rgba(0,0,0,0.7)',
      overflowY: 'auto',
      padding: 24
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 20 
      }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <div style={{ 
            fontSize: 9, 
            fontWeight: 800, 
            color: '#5a6a82', 
            textTransform: 'uppercase', 
            letterSpacing: '0.12em', 
            marginBottom: 5 
          }}>
            Keyword Detail
          </div>
          <div style={{ 
            fontFamily: "'Syne',sans-serif", 
            fontSize: 16, 
            fontWeight: 800, 
            color: '#f0f4ff', 
            lineHeight: 1.3 
          }}>
            {kw.keyword}
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{ 
            background: 'rgba(255,255,255,0.06)', 
            border: '1px solid rgba(255,255,255,0.09)', 
            borderRadius: 8, 
            color: '#5a6a82', 
            cursor: 'pointer', 
            padding: '7px 11px', 
            fontSize: 14, 
            flexShrink: 0 
          }}
        >
          ✕
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 9, 
        marginBottom: 18 
      }}>
        {metricCards.map((metric, index) => (
          <div key={index} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10,
            padding: '12px 14px'
          }}>
            <div style={{ 
              fontSize: 9, 
              fontWeight: 700, 
              color: '#5a6a82', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              marginBottom: 4 
            }}>
              {metric.label}
            </div>
            <div style={{ 
              fontFamily: "'Syne',sans-serif", 
              fontSize: 20, 
              fontWeight: 800, 
              color: metric.color 
            }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Trend Section */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ 
          fontSize: 10, 
          fontWeight: 700, 
          color: '#5a6a82', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          marginBottom: 8 
        }}>
          Volume Trend
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          {trendCards.map((trend, index) => (
            <div key={index} style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 9,
              padding: '9px 8px',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: 8, 
                fontWeight: 700, 
                color: '#5a6a82', 
                letterSpacing: '0.06em', 
                marginBottom: 4 
              }}>
                {trend.label}
              </div>
              <div style={{ 
                fontFamily: "'Syne',sans-serif", 
                fontWeight: 800, 
                fontSize: 15, 
                color: getTrendColor(trend.value) 
              }}>
                {formatTrendValue(trend.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 12-Month Chart */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ 
          fontSize: 10, 
          fontWeight: 700, 
          color: '#5a6a82', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          marginBottom: 8 
        }}>
          12-Month Volume
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: 2, 
          height: 60 
        }}>
          {(kw.monthly || []).map((volume, index) => {
            const percentage = (volume - minVol) / (maxVol - minVol || 1);
            const isLastMonth = index === (kw.monthly || []).length - 1;
            
            return (
              <div key={index} style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 2 
              }}>
                <div style={{
                  width: '100%',
                  height: `${Math.max(percentage * 50 + 5, 5)}px`,
                  background: isLastMonth 
                    ? 'linear-gradient(180deg,#00e5ff,#7c3aed)' 
                    : 'rgba(255,255,255,0.1)',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.8s ease'
                }} />
                <div style={{ fontSize: 6, color: '#3a4a5f' }}>
                  {MONTHS[index][0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SERP Features */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ 
          fontSize: 10, 
          fontWeight: 700, 
          color: '#5a6a82', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          marginBottom: 8 
        }}>
          SERP Features
        </div>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 5 
        }}>
          {(kw.serpTypes || []).map((type, index) => (
            <span key={index} style={{
              fontSize: 10,
              padding: '3px 8px',
              borderRadius: 5,
              background: 'rgba(255,255,255,0.05)',
              color: '#8896b0',
              border: '1px solid rgba(255,255,255,0.07)'
            }}>
              {type.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Backlink Profile */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ 
          fontSize: 10, 
          fontWeight: 700, 
          color: '#5a6a82', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          marginBottom: 8 
        }}>
          Backlink Profile
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 8 
        }}>
          {[
            { label: 'Backlinks', value: kw.backlinks >= 1000 ? `${(kw.backlinks / 1000).toFixed(1)}K` : kw.backlinks },
            { label: 'Ref. Domains', value: kw.refDomains.toLocaleString() }
          ].map((item, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 9,
              padding: '10px 12px'
            }}>
              <div style={{ fontSize: 9, color: '#5a6a82', marginBottom: 3 }}>
                {item.label}
              </div>
              <div style={{ 
                fontFamily: "'Syne',sans-serif", 
                fontWeight: 800, 
                fontSize: 17, 
                color: '#f0f4ff' 
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Keywords */}
      <div>
        <div style={{ 
          fontSize: 10, 
          fontWeight: 700, 
          color: '#5a6a82', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          marginBottom: 8 
        }}>
          Related Keywords
        </div>
        {kw.relatedKws.map((relatedKw, index) => (
          <div key={index} style={{
            padding: '8px 12px',
            marginBottom: 4,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            fontSize: 12,
            color: '#8896b0',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ wordBreak: 'break-word' }}>{relatedKw}</span>
            <span style={{ color: '#3a4a5f', marginLeft: 8, flexShrink: 0 }}>→</span>
          </div>
        ))}
      </div>
    </div>
  );
}
