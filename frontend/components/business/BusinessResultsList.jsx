"use client";

import React, { useState } from 'react';
import BusinessCard from './BusinessCard.jsx';

/**
 * BusinessResultsList Component
 * 
 * Displays a list of business search results
 * Handles user selection and provides options for more results or manual entry
 */

const BusinessResultsList = ({ 
  results, 
  onSelect, 
  onShowMore, 
  onNone,
  searchQuery,
  isLoading = false 
}) => {
  const [showAllResults, setShowAllResults] = useState(false);
  
  // Determine which results to show
  const visibleResults = showAllResults ? results : results.slice(0, 3);
  const hasMoreResults = results.length > 3;

  const handleSelect = (business) => {
    if (onSelect) {
      onSelect(business);
    }
  };

  const handleShowMore = () => {
    if (hasMoreResults && !showAllResults) {
      setShowAllResults(true);
    } else if (onShowMore) {
      onShowMore();
    }
  };

  const handleNone = () => {
    if (onNone) {
      onNone();
    }
  };

  if (isLoading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        <div style={{
          fontSize: '16px',
          marginBottom: '8px'
        }}>
          🔍 Searching for businesses...
        </div>
        <div style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          Finding the best matches for "{searchQuery}"
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '16px'
        }}>
          😕 No businesses found
        </div>
        <div style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: '20px'
        }}>
          We couldn't find any businesses matching "{searchQuery}"
        </div>
        <button
          onClick={handleNone}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Try different search terms
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '16px',
          color: 'white',
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          Found {results.length} business{results.length !== 1 ? 'es' : ''}
        </div>
        <div style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          Search: "{searchQuery}"
        </div>
      </div>

      {/* Business Cards */}
      <div style={{ marginBottom: '16px' }}>
        {visibleResults.map((business, index) => (
          <BusinessCard
            key={business.placeId || index}
            business={business}
            onSelect={handleSelect}
            onShowMore={index === 2 && hasMoreResults && !showAllResults ? handleShowMore : null}
            onNone={index === visibleResults.length - 1 ? handleNone : null}
            isBestMatch={index === 0}
          />
        ))}
      </div>

      {/* Show More Results Button */}
      {hasMoreResults && !showAllResults && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <button
            onClick={handleShowMore}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '8px 20px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Show {results.length - 3} more result{results.length - 3 !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Footer Actions */}
      <div style={{
        textAlign: 'center',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={handleNone}
          style={{
            background: 'transparent',
            color: 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          None of these businesses
        </button>
      </div>
    </div>
  );
};

export default BusinessResultsList;
