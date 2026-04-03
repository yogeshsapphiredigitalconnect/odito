import React from 'react';

function UserAddedKeywords({ data, loading, error, onRefresh }) {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Helper function to get rank badge style
  const getRankBadgeStyle = (rank) => {
    if (rank >= 1 && rank <= 10) {
      return { background: '#1a2a1a', color: '#4ade80' }; // green
    } else if (rank >= 11 && rank <= 20) {
      return { background: '#2a2010', color: '#facc15' }; // yellow
    } else {
      return { background: '#2a1010', color: '#f43f5e' }; // red
    }
  };

  // Helper function to get status from rank
  const getStatusFromRank = (rank) => {
    if (rank >= 1 && rank <= 10) {
      return { text: 'Page 1', style: { background: '#1a2a1a', color: '#4ade80' } };
    } else if (rank >= 11 && rank <= 20) {
      return { text: 'Page 2', style: { background: '#2a2010', color: '#facc15' } };
    } else {
      return { text: 'Page 3+', style: { background: '#2a1010', color: '#f43f5e' } };
    }
  };

  // Helper function to extract domain from URL
  const getDomainFromUrl = (url) => {
    if (!url) return '';
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        padding: '60px 0', 
        textAlign: 'center', 
        color: '#5a6a82', 
        fontSize: '13px' 
      }}>
        Loading tracked keywords...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        padding: '60px 0', 
        textAlign: 'center', 
        color: '#f43f5e', 
        fontSize: '13px' 
      }}>
        <div style={{ marginBottom: '10px' }}>⚠️ Error loading keywords</div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '20px' }}>{error}</div>
        <button
          onClick={onRefresh}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '6px',
            padding: '6px 12px',
            color: '#f0f4ff',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // No data state
  if (!data || !data.keywords || !Array.isArray(data.keywords) || data.keywords.length === 0) {
    return (
      <div style={{ 
        padding: '60px 0', 
        textAlign: 'center', 
        color: '#5a6a82', 
        fontSize: '13px' 
      }}>
        No tracked keywords yet
      </div>
    );
  }

  const { domain, location, keywords, created_at } = data;

  return (
    <div>
      {/* Domain info card */}
      <div style={{
        background: '#141820',
        border: '0.5px solid #1e2230',
        borderRadius: '10px',
        padding: '14px 16px',
        marginBottom: '16px',
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start'
      }}>
        <div>
          <div style={{
            fontSize: '10px',
            color: '#4a5568',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '4px'
          }}>
            Domain
          </div>
          <div style={{
            color: '#60a5fa',
            fontSize: '13px'
          }}>
            {domain}
          </div>
        </div>
        <div>
          <div style={{
            fontSize: '10px',
            color: '#4a5568',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '4px'
          }}>
            Location
          </div>
          <div style={{
            color: '#c8d0e0',
            fontSize: '12px',
            maxWidth: '380px',
            lineHeight: '1.5'
          }}>
            {location}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{
            fontSize: '10px',
            color: '#4a5568',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '4px'
          }}>
            Added
          </div>
          <div style={{
            color: '#c8d0e0',
            fontSize: '12px'
          }}>
            {formatDate(created_at)}
          </div>
        </div>
      </div>

      {/* Keywords table */}
      <div style={{
        background: '#141820',
        border: '0.5px solid #1e2230',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        {/* Section header */}
        <div style={{
          padding: '14px 16px 10px',
          borderBottom: '0.5px solid #1e2230',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#4a5568',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            Tracked Keywords
          </div>
          <div style={{
            background: '#1a2a4a',
            color: '#38bdf8',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '20px'
          }}>
            {keywords.length} keywords
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 110px 100px 120px',
          padding: '8px 16px',
          borderBottom: '0.5px solid #1e2230',
          fontSize: '10px',
          color: '#4a5568',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          <div>#</div>
          <div>Keyword</div>
          <div>Current Rank</div>
          <div>Status</div>
          <div>Domain</div>
        </div>

        {/* Table rows */}
        {keywords.map((keyword, index) => {
          const rankBadgeStyle = getRankBadgeStyle(keyword.rank);
          const status = getStatusFromRank(keyword.rank);
          const domainChip = getDomainFromUrl(domain);

          return (
            <div
              key={keyword._id || index}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 110px 100px 120px',
                padding: '12px 16px',
                borderBottom: index < keywords.length - 1 ? '0.5px solid #1a1f2a' : 'none',
                alignItems: 'center'
              }}
            >
              <div style={{ fontSize: '12px', color: '#4a5568' }}>
                {index + 1}
              </div>
              <div>
                <div style={{
                  fontSize: '13px',
                  color: '#e2e8f0',
                  fontWeight: 500
                }}>
                  {keyword.keyword}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#4a5568',
                  marginTop: '2px'
                }}>
                  Local · Informational
                </div>
              </div>
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '24px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  ...rankBadgeStyle
                }}>
                  #{keyword.rank}
                </span>
              </div>
              <div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  ...status.style,
                  borderRadius: '6px',
                  padding: '4px 10px',
                  display: 'inline-block'
                }}>
                  {status.text}
                </span>
              </div>
              <div>
                <span style={{
                  fontSize: '12px',
                  color: '#60a5fa',
                  background: '#0f1f3a',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  display: 'inline-block',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {domainChip}
                </span>
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div style={{
          padding: '8px 16px',
          fontSize: '11px',
          color: '#2a3040',
          textAlign: 'center',
          borderTop: '0.5px solid #1e2230'
        }}>
          Manual tracking · Last updated {formatDate(created_at)}
        </div>
      </div>
    </div>
  );
}

export default UserAddedKeywords;
