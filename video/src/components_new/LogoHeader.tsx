// remotion/components/LogoHeader.tsx
import { Img } from "remotion";
import { interpolate, useCurrentFrame } from "remotion";

interface LogoHeaderProps {
  agencyName: string;
  logoUrl?: string;
  brandColor?: string;
  slideNumber: number;
  totalSlides: number;
  slideTitle: string;
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({
  agencyName,
  logoUrl,
  brandColor = "#7730ed",
  slideNumber,
  totalSlides,
  slideTitle,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 60px",
        background: "rgba(6,16,29,0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        opacity,
        zIndex: 100,
      }}
    >
      {/* Logo / Agency name */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {logoUrl ? (
          <Img src={logoUrl || ''} alt={agencyName} style={{ height: 36, objectFit: "contain" }} />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${brandColor}, #00dfff)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: "#fff",
            }}
          >
            {agencyName.charAt(0)}
          </div>
        )}
        <span
          style={{
            fontFamily: "sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: "#eef2ff",
            letterSpacing: "-0.02em",
          }}
        >
          {agencyName}
        </span>
        <span
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "sans-serif",
            marginLeft: 4,
          }}
        >
          SEO Audit Report
        </span>
      </div>

      {/* Slide title + progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <span
          style={{
            fontFamily: "sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {slideTitle}
        </span>
        {/* Slide dots */}
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === slideNumber - 1 ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background:
                  i === slideNumber - 1
                    ? brandColor
                    : i < slideNumber - 1
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.12)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
