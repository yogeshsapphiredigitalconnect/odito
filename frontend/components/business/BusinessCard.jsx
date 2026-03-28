"use client";

import React from 'react';

/**
 * BusinessCard Component
 * 
 * Displays a single business result with selection options
 * Used in the business verification flow of ARIAChat
 */

const BusinessCard = ({ 
  business, 
  onSelect, 
  onShowMore, 
  onNone,
  isBestMatch = false 
}) => {
  const {
    name,
    address,
    rating,
    reviewCount,
    website,
    phone,
    rankingScore
  } = business;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }

    if (hasHalfStar && fullStars < 5) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }

    return stars;
  };

  return (
    <div className={`business-card ${isBestMatch ? 'best-match' : ''}`} style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: isBestMatch ? '2px solid var(--grad1)' : '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      position: 'relative'
    }}>
      {isBestMatch && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '16px',
          background: 'var(--grad1)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          Best Match
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <h3 style={{
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          margin: '0 0 4px 0',
          lineHeight: '1.3'
        }}>
          {name}
        </h3>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px',
          margin: '0 0 8px 0',
          lineHeight: '1.4'
        }}>
          {address}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {renderStars(rating)}
          </div>
          <span style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px'
          }}>
            {rating?.toFixed(1)} {reviewCount > 0 && `(${reviewCount} reviews)`}
          </span>
        </div>

        {website && (
          <div style={{ marginBottom: '4px' }}>
            <a 
              href={website} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: 'var(--grad1)',
                fontSize: '13px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              🌐 {website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {phone && (
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '13px',
            marginBottom: '4px'
          }}>
            📞 {phone}
          </div>
        )}

        {rankingScore && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2px 8px',
            borderRadius: '8px',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            Match: {Math.round(rankingScore * 100)}%
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        flexWrap: 'wrap',
        marginTop: '12px'
      }}>
        <button
          onClick={() => onSelect(business)}
          style={{
            background: 'var(--grad1)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            flex: '1',
            minWidth: '120px'
          }}
        >
          Yes, this is my business
        </button>

        {onShowMore && (
          <button
            onClick={onShowMore}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              cursor: 'pointer',
              flex: '0 0 auto'
            }}
          >
            Show more
          </button>
        )}

        {onNone && (
          <button
            onClick={onNone}
            style={{
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              cursor: 'pointer',
              flex: '0 0 auto'
            }}
          >
            None of these
          </button>
        )}
      </div>
    </div>
  );
};

export default BusinessCard;
