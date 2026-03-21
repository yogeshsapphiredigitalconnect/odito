"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AISummaryCard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleVideoBrief = () => {
    // Show toast message for now - TODO: Replace with actual video generation
    alert("🎬 AI Video generation coming soon 🚀");
    
    // Alternative: Navigate to demo video
    // window.open('/demo-video.mp4', '_blank');
  };

  return (
    <div className="ai-card" style={{ marginBottom: 24 }}>
      <div className="ai-card-label">✦ ARIA AI Explainer — Auto Summary</div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--grad1)", display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0 }}>🎥</div>
        <div>
          <div className="ai-card-text">
            Your site has a <strong style={{ color: "var(--text)" }}>solid technical foundation</strong> but is losing significant AI search visibility due to missing schema markup, sparse entity structure, and thin FAQ coverage. Three critical wins are available this week: removing the Noindex from 3 pages, adding FAQ schema sitewide, and writing meta descriptions — together these could add <strong style={{ color: "var(--cyan)" }}>+14–19 points</strong> to your AI Visibility Score.
          </div>
          <div style={{ marginTop: 10 }}>
            <button 
              className="task-btn primary" 
              style={{ 
                fontSize: 12,
                background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "white",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                transition: "all 0.2s ease"
              }}
              onClick={handleVideoBrief}
              disabled={isLoading}
            >
              {isLoading ? "⏳ Loading..." : "🎬 Watch AI Video Brief"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
