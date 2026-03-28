// remotion/slides/CTAClosureSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    cards: Array<{
      title: string;
      description: string;
    }>;
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

export const CTAClosureSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("CTAClosureSlide: Missing slide data");
    return (
      <AbsoluteFill style={{ background: "#030912", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 24, opacity: 0.7 }}>Loading CTA...</div>
      </AbsoluteFill>
    );
  }

  console.log("CTA Closure Data:", data);
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const cards = data.cards || [];

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: -150,
          left: -150,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(119,48,237,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={14}
        totalSlides={14}
        slideTitle="What's Next?"
      />

      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "60px 80px",
          opacity,
        }}
      >
        {/* Header */}
        <div
          style={{
            opacity: childOpacity(0),
            transform: `translateY(${childY(0)}px)`,
            marginBottom: 50,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: brandColor,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontFamily: "sans-serif",
              marginBottom: 14,
            }}
          >
            🎯 Next Steps
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#eef2ff",
              fontFamily: "sans-serif",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 12,
            }}
          >
            What's Next?
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            Take Action on Your SEO & AI Growth
          </div>
        </div>

        {/* Cards */}
        <div
          style={{
            opacity: childOpacity(1),
            maxWidth: 1000,
            margin: "0 auto",
            display: "flex",
            gap: 24,
            justifyContent: "center",
          }}
        >
          {cards.map((card, i) => {
            const itemDelay = 15 + i * 10;
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 25], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemY = interpolate(frame, [itemDelay, itemDelay + 25], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                className="card"
                style={{
                  opacity: itemOpacity,
                  transform: `translateY(${itemY}px)`,
                  flex: 1,
                  maxWidth: 320,
                  padding: "32px 28px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  textAlign: "center",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Card Icon */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: `${brandColor}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: 24,
                  }}
                >
                  {i === 0 && "🤖"}
                  {i === 1 && "🛠️"}
                  {i === 2 && "🚀"}
                </div>

                {/* Card Content */}
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#eef2ff",
                    fontFamily: "sans-serif",
                    marginBottom: 12,
                    lineHeight: 1.3,
                  }}
                >
                  {card.title}
                </h3>
                
                <p
                  style={{
                    fontSize: 15,
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "sans-serif",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            opacity: childOpacity(2),
            marginTop: 50,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.8)",
              fontFamily: "sans-serif",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Ready to transform your SEO and AI visibility?
          </div>
          
          <div
            style={{
              display: "inline-flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div
              style={{
                padding: "12px 24px",
                background: brandColor,
                color: "white",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "sans-serif",
                cursor: "pointer",
              }}
            >
              Get Started
            </div>
            
            <div
              style={{
                padding: "12px 24px",
                background: "transparent",
                color: brandColor,
                border: `2px solid ${brandColor}`,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "sans-serif",
                cursor: "pointer",
              }}
            >
              Learn More
            </div>
          </div>
        </div>
      </div>

      {/* Slide number */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 60,
          fontFamily: "sans-serif",
          fontSize: 15,
          color: "rgba(255,255,255,0.2)",
        }}
      >
        14 / 14
      </div>
    </AbsoluteFill>
  );
};
