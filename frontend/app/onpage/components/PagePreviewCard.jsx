"use client";

import { useState, useEffect } from 'react';
import apiService from '@/lib/apiService';

export default function PagePreviewCard({ url, issues }) {
  const [rawHtml, setRawHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRawHtml = async () => {
    if (!url) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getPageRawHtml(url);
      if (response.success) {
        setRawHtml(response.data.html);
      } else {
        setError(response.message || 'Failed to fetch HTML');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch HTML');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url && !rawHtml) {
      fetchRawHtml();
    }
  }, [url]);

  return (
    <div className="preview-card">
      <div className="preview-hd">
        <div className="preview-hd-title">🖥 Page Preview</div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button className="btn sm pr">HTML</button>
        </div>
      </div>
      
      <div className="browser">
        <div className="browser-bar">
          <div className="browser-dots">
            <div className="browser-dot" style={{ background: "#ff5f57" }}></div>
            <div className="browser-dot" style={{ background: "#febc2e" }}></div>
            <div className="browser-dot" style={{ background: "#28c840" }}></div>
          </div>
          <div className="browser-addr">{url}</div>
        </div>
        
        <div className="browser-viewport" style={{ overflow: "hidden" }}>
          <div style={{ 
            position: "relative", 
            zIndex: 1, 
            padding: "0", 
            width: "100%", 
            height: "100%", 
            overflow: "hidden",
            background: "white"
          }}>
            {loading ? (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                height: "100%",
                color: "#666",
                fontSize: "12px"
              }}>
                Loading HTML from stored data...
              </div>
            ) : error ? (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                height: "100%",
                color: "#ff4444",
                fontSize: "11px",
                padding: "10px",
                textAlign: "center"
              }}>
                {error}
              </div>
            ) : (
              <iframe
                srcDoc={rawHtml}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  background: "white",
                  transform: "scale(0.6)",
                  transformOrigin: "top left",
                  width: "166.67%", // 100% / 0.6
                  height: "166.67%", // 100% / 0.6
                }}
                title="Page Preview"
                sandbox="allow-same-origin allow-scripts allow-forms"
                scrolling="no"
              />
            )}
          </div>

          {/* Issue Indicator Dots */}
          {issues.crit > 0 && (
            <div style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "var(--re)",
              boxShadow: "0 0 8px rgba(255,56,96,0.9)",
              animation: "blink 1.4s infinite"
            }}></div>
          )}
          {issues.warn > 0 && (
            <div style={{
              position: "absolute",
              top: "14px",
              left: "28px",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "var(--am)",
              boxShadow: "0 0 7px rgba(255,183,3,0.8)",
              animation: "blink 1.9s infinite"
            }}></div>
          )}
          {issues.low > 0 && (
            <div style={{
              position: "absolute",
              top: "14px",
              left: "42px",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "var(--cy)",
              boxShadow: "0 0 7px rgba(0,223,255,0.7)",
              animation: "blink 2.2s infinite"
            }}></div>
          )}
        </div>
      </div>
    </div>
  )
}
