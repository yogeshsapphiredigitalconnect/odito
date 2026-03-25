import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, Audio } from "remotion";
import { theme } from "./theme";

// Import all 10 required slides (matching worker output)
import { OverviewSlide } from "./slides/OverviewSlide";
import { ScoreSummarySlide } from "./slides/ScoreSummarySlide";
import { IssueDistributionSlide } from "./slides/IssueDistributionSlide";
import { HighIssuesSlide } from "./slides/HighIssuesSlide";
import { MediumIssuesSlide } from "./slides/MediumIssuesSlide";
import { LowIssuesSlide } from "./slides/LowIssuesSlide";
import { TechnicalHighlightsSlide } from "./slides/TechnicalHighlightsSlide";
import { PerformanceSummarySlide } from "./slides/PerformanceSummarySlide";
import { PageSpeedSlide } from "./slides/PageSpeedSlide";
import { AIAnalysisSlide } from "./slides/AIAnalysisSlide";

export const AuditVideo = (props: Record<string, unknown>) => {
  let { 
    projectId = '', 
    slidesWithAudio,
    fps = 30
  } = props as any;
  
  console.log('🎬 REMOTION: AuditVideo component called');
  console.log('🎬 REMOTION: Props received:', props);
  console.log('🎬 REMOTION: Project ID:', projectId);
  console.log('🎬 REMOTION: Slides with audio:', slidesWithAudio);
  console.log('🎬 REMOTION: Slides count:', slidesWithAudio?.length || 0);
  console.log('🎬 REMOTION: FPS:', fps);
  
  // CRITICAL: Validate slides with audio
  if (!slidesWithAudio || !Array.isArray(slidesWithAudio)) {
    console.error("❌ REMOTION: Invalid slidesWithAudio - expected array, got:", slidesWithAudio);
    // Return fallback UI instead of null
    return (
      <AbsoluteFill style={{ background: "#030912", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 20 }}>⚠️ Loading Video Data</div>
        <div style={{ fontSize: 24, opacity: 0.7 }}>Waiting for slide data...</div>
        <div style={{ fontSize: 16, opacity: 0.5, marginTop: 10 }}>Props received: {JSON.stringify(props, null, 2)}</div>
      </AbsoluteFill>
    );
  }
  
  console.log("🎬 REMOTION: Total slides:", slidesWithAudio.length);
  
  if (slidesWithAudio.length !== 10) {
    console.error("❌ REMOTION: Invalid slides count - expected 10, got:", slidesWithAudio.length);
    // Return fallback UI instead of null
    return (
      <AbsoluteFill style={{ background: "#030912", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 20 }}>⚠️ Slide Count Mismatch</div>
        <div style={{ fontSize: 24, opacity: 0.7 }}>Expected 10 slides, got {slidesWithAudio.length}</div>
        <div style={{ fontSize: 16, opacity: 0.5, marginTop: 10 }}>Check worker slide generation</div>
      </AbsoluteFill>
    );
  }
  
  console.log("✅ REMOTION: All 10 slides with audio validated successfully");
  
  // Calculate timing based on actual audio durations
  let currentFrame = 0;
  const slideTiming = slidesWithAudio.map((slide: any, index: number) => {
    const durationInFrames = Math.round(slide.duration * fps);
    const timing = {
      slideNumber: index + 1,
      from: currentFrame,
      dur: durationInFrames,
      to: currentFrame + durationInFrames,
      slide: slide
    };
    
    console.log(`🎬 REMOTION: Slide ${index + 1} (${slide.title}): ${currentFrame} - ${timing.to} (${durationInFrames} frames, ${slide.duration.toFixed(2)}s)`);
    
    currentFrame += durationInFrames;
    return timing;
  });
  
  const totalDuration = currentFrame;
  const totalSeconds = totalDuration / fps;
  
  console.log(`🕐 REMOTION: Total video duration: ${totalDuration} frames (${totalSeconds.toFixed(2)} seconds)`);
  
  const frame = useCurrentFrame();
  
  // Global fade out at the end (last 30 frames)
  const globalFade = interpolate(frame, [totalDuration - 30, totalDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: theme.bg, opacity: globalFade }}>
      
      {/* SLIDE 1: PROJECT OVERVIEW with per-slide audio */}
      <Sequence from={slideTiming[0].from} durationInFrames={slideTiming[0].dur}>
        {(() => {
          const slide = slidesWithAudio[0];
          console.log('🎵 REMOTION: Rendering Slide 1 with audio:', slide.audio);
          return (
            <>
              <Audio 
                src={slide.audio} 
                volume={1}
                startFrom={0}
                endAt={slideTiming[0].dur}
              />
              <OverviewSlide
                data={slide.data || {}}
                narration={slide.narration || ''}
                brandColor="#7730ed"
                agencyName="AuditIQ"
              />
            </>
          );
        })()}
      </Sequence>

      {/* SLIDE 2: SCORE SUMMARY with per-slide audio */}
      <Sequence from={slideTiming[1].from} durationInFrames={slideTiming[1].dur}>
        {(() => {
          const slide = slidesWithAudio[1];
          console.log('🎵 REMOTION: Rendering Slide 2 with audio:', slide.audio);
          return (
            <>
              <Audio 
                src={slide.audio} 
                volume={1}
                startFrom={0}
                endAt={slideTiming[1].dur}
              />
              <ScoreSummarySlide
                data={slide.data || {}}
                narration={slide.narration || ''}
                brandColor="#7730ed"
                agencyName="AuditIQ"
              />
            </>
          );
        })()}
      </Sequence>

      {/* SLIDE 3: ISSUE DISTRIBUTION with per-slide audio */}
      <Sequence from={slideTiming[2].from} durationInFrames={slideTiming[2].dur}>
        {(() => {
          const slide = slidesWithAudio[2];
          console.log('🎵 REMOTION: Rendering Slide 3 with audio:', slide.audio);
          return (
            <>
              <Audio 
                src={slide.audio} 
                volume={1}
                startFrom={0}
                endAt={slideTiming[2].dur}
              />
              <IssueDistributionSlide
                data={slide.data || {}}
                narration={slide.narration || ''}
                brandColor="#7730ed"
                agencyName="AuditIQ"
              />
            </>
          );
        })()}
      </Sequence>

      {/* SLIDE 4: HIGH ISSUES with per-slide audio */}
      <Sequence from={slideTiming[3].from} durationInFrames={slideTiming[3].dur}>
        {(() => {
          const slide = slidesWithAudio[3];
          console.log('� REMOTION: Rendering Slide 4 with audio:', slide.audio);
          return (
            <>
              <Audio 
                src={slide.audio} 
                volume={1}
                startFrom={0}
                endAt={slideTiming[3].dur}
              />
              <HighIssuesSlide
                data={slide.data || { issues: [] }}
                narration={slide.narration || ''}
                brandColor="#7730ed"
                agencyName="AuditIQ"
              />
            </>
          );
        })()}
      </Sequence>

      {/* SLIDE 5: MEDIUM ISSUES with per-slide audio */}
      <Sequence from={slideTiming[4].from} durationInFrames={slideTiming[4].dur}>
        {(() => {
          const slide = slidesWithAudio[4];
          console.log('� REMOTION: Rendering Slide 5 with audio:', slide.audio);
          return (
            <>
              <Audio 
                src={slide.audio} 
                volume={1}
                startFrom={0}
                endAt={slideTiming[4].dur}
              />
              <MediumIssuesSlide
                data={slide.data || { issues: [] }}
                narration={slide.narration || ''}
                brandColor="#7730ed"
                agencyName="AuditIQ"
              />
            </>
          );
        })()}
      </Sequence>

      {/* SLIDE 6: LOW ISSUES with per-slide audio */}
      <Sequence from={slideTiming[5].from} durationInFrames={slideTiming[5].dur}>
        {(() => {
          const slide = slidesWithAudio[5];
          console.log('� REMOTION: Rendering Slide 6 with audio:', slide.audio);
          return (
            <>
              <Audio 
                src={slide.audio} 
                volume={1}
                startFrom={0}
                endAt={slideTiming[5].dur}
              />
              <LowIssuesSlide
                data={slide.data || { issues: [] }}
                narration={slide.narration || ''}
                brandColor="#7730ed"
                agencyName="AuditIQ"
              />
            </>
          );
        })()}
      </Sequence>

      {/* SLIDE 7: TECHNICAL HIGHLIGHTS with per-slide audio */}
      <Sequence from={slideTiming[6].from} durationInFrames={slideTiming[6].dur}>
        {(() => {
          const slide = slidesWithAudio[6];
          console.log('🎵 REMOTION: Rendering Slide 7 with audio:', slide.audio);
          return (
            <>
              <Audio 
                src={slide.audio} 
                volume={1}
                startFrom={0}
                endAt={slideTiming[6].dur}
              />
              <TechnicalHighlightsSlide
                data={slide.data || {}}
                narration={slide.narration || ''}
                brandColor="#7730ed"
                agencyName="AuditIQ"
              />
            </>
          );
        })()}
      </Sequence>

      {/* SLIDE 8: PERFORMANCE SUMMARY with per-slide audio */}
      <Sequence from={slideTiming[7].from} durationInFrames={slideTiming[7].dur}>
        {(() => {
          const slide = slidesWithAudio[7];
          console.log('🎵 REMOTION: Rendering Slide 8 with audio:', slide.audio);
          return (
            <>
              <Audio 
                src={slide.audio} 
                volume={1}
                startFrom={0}
                endAt={slideTiming[7].dur}
              />
              <PerformanceSummarySlide
                data={slide.data || {}}
                narration={slide.narration || ''}
                brandColor="#7730ed"
                agencyName="AuditIQ"
              />
            </>
          );
        })()}
      </Sequence>

      {/* SLIDE 9: CORE WEB VITALS with per-slide audio */}
      <Sequence from={slideTiming[8].from} durationInFrames={slideTiming[8].dur}>
        {(() => {
          const slide = slidesWithAudio[8];
          console.log('🎵 REMOTION: Rendering Slide 9 with audio:', slide.audio);
          return (
            <>
              <Audio 
                src={slide.audio} 
                volume={1}
                startFrom={0}
                endAt={slideTiming[8].dur}
              />
              <PageSpeedSlide
                data={slide.data || {}}
                narration={slide.narration || ''}
                brandColor="#7730ed"
                agencyName="AuditIQ"
              />
            </>
          );
        })()}
      </Sequence>

      {/* SLIDE 10: AI ANALYSIS with per-slide audio */}
      <Sequence from={slideTiming[9].from} durationInFrames={slideTiming[9].dur}>
        {(() => {
          const slide = slidesWithAudio[9];
          console.log('🎵 REMOTION: Rendering Slide 10 with audio:', slide.audio);
          return (
            <>
              <Audio 
                src={slide.audio} 
                volume={1}
                startFrom={0}
                endAt={slideTiming[9].dur}
              />
              <AIAnalysisSlide
                data={slide.data || {}}
                narration={slide.narration || ''}
                brandColor="#7730ed"
                agencyName="AuditIQ"
              />
            </>
          );
        })()}
      </Sequence>

    </AbsoluteFill>
  );
};
