import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, Audio } from "remotion";
import { theme } from "./theme";
import { TIMING, TOTAL_DURATION_FRAMES, TOTAL_DURATION_SECONDS } from "./utils/timingUtils";

// Import all 11 required slides
import { OverviewSlide } from "./slides/OverviewSlide";
import { ScoreSummarySlide } from "./slides/ScoreSummarySlide";
import { IssueDistributionSlide } from "./slides/IssueDistributionSlide";
import { HighIssuesSlide } from "./slides/HighIssuesSlide";
import { MediumIssuesSlide } from "./slides/MediumIssuesSlide";
import { LowIssuesSlide } from "./slides/LowIssuesSlide";
import { TechnicalHighlightsSlide } from "./slides/TechnicalHighlightsSlide";
import { CriticalTechnicalIssueSlide } from "./slides/CriticalTechnicalIssueSlide";
import { PerformanceSummarySlide } from "./slides/PerformanceSummarySlide";
import { PageSpeedSlide } from "./slides/PageSpeedSlide";
import { AIAnalysisSlide } from "./slides/AIAnalysisSlide";

export const AuditVideo = (props: Record<string, unknown>) => {
  let { 
    audioUrl = '', 
    projectId = '', 
    structuredSlides
  } = props as any;
  
  // DEBUG: Add comprehensive logging
  console.log('🎬 REMOTION: Starting video generation');
  console.log('🎬 REMOTION: Project ID:', projectId);
  console.log('🎬 REMOTION: Audio URL:', audioUrl);
  console.log('🎬 REMOTION: Audio URL type:', typeof audioUrl);
  console.log('🎬 REMOTION: Audio URL length:', audioUrl?.length);
  console.log('🎬 REMOTION: Total duration frames:', TOTAL_DURATION_FRAMES);
  console.log('🎬 REMOTION: Total duration seconds:', TOTAL_DURATION_SECONDS);
  
  // CRITICAL: Validate audio URL
  if (!audioUrl) {
    console.error('❌ REMOTION: Audio URL is missing or undefined');
    throw new Error('Audio URL is required but not provided');
  }
  
  if (typeof audioUrl !== 'string') {
    console.error('❌ REMOTION: Audio URL is not a string:', typeof audioUrl);
    throw new Error(`Audio URL must be a string, got ${typeof audioUrl}`);
  }
  
  if (!audioUrl.startsWith('/audio/')) {
    console.error('❌ REMOTION: Audio URL does not start with /audio/:', audioUrl);
    throw new Error(`Audio URL must start with /audio/, got: ${audioUrl}`);
  }
  
  console.log('✅ REMOTION: Audio URL validation passed');
  
  // Validate structured slides format
  if (!structuredSlides || !Array.isArray(structuredSlides)) {
    console.error("❌ REMOTION: Invalid structuredSlides - expected array, got:", structuredSlides);
    return null;
  }
  
  console.log("🎬 REMOTION: Total slides:", structuredSlides.length);
  
  if (structuredSlides.length !== 11) {
    console.error("❌ REMOTION: Invalid slides count - expected 11, got:", structuredSlides.length);
    return null;
  }
  
  console.log("✅ REMOTION: All 11 slides validated successfully");
  
  // Extract narration from structured slides
  const finalNarration = structuredSlides.map((slide: any) => slide.narration || '').filter((n: any) => n.trim());
  console.log("🎬 REMOTION: Narration items:", finalNarration.length);
  
  const frame = useCurrentFrame();
  
  // Global fade out at the end (last 30 frames)
  const globalFade = interpolate(frame, [TOTAL_DURATION_FRAMES - 30, TOTAL_DURATION_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: theme.bg, opacity: globalFade }}>
      
      {/* FIXED: Single audio track for the entire video with proper validation */}
      {(() => {
        console.log('🎵 REMOTION: Rendering Audio component with src:', audioUrl);
        
        if (!audioUrl) {
          console.error('❌ REMOTION: Audio src is undefined in Audio component');
          throw new Error('Audio src is undefined in Audio component');
        }
        
        return (
          <Audio 
            src={audioUrl} 
            volume={1}
            startFrom={0}
            endAt={TOTAL_DURATION_FRAMES}
          />
        );
      })()}
      
      {/* SLIDE 1: PROJECT OVERVIEW */}
      <Sequence from={TIMING.s1.from} durationInFrames={TIMING.s1.dur}>
        <OverviewSlide
          data={structuredSlides?.[0]?.data || {}}
          narration={finalNarration[0] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 2: SCORE SUMMARY */}
      <Sequence from={TIMING.s2.from} durationInFrames={TIMING.s2.dur}>
        <ScoreSummarySlide
          data={structuredSlides?.[1]?.data || {}}
          narration={finalNarration[1] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 3: ISSUE DISTRIBUTION */}
      <Sequence from={TIMING.s3.from} durationInFrames={TIMING.s3.dur}>
        <IssueDistributionSlide
          data={structuredSlides?.[2]?.data || {}}
          narration={finalNarration[2] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 4: HIGH ISSUES */}
      <Sequence from={TIMING.s4.from} durationInFrames={TIMING.s4.dur}>
        {(() => {
          const slideData = structuredSlides?.[3]?.data || { issues: [] };
          console.log("🎬 REMOTION: Rendering HighIssuesSlide with data:", slideData);
          return (
            <HighIssuesSlide
              data={slideData}
              narration={finalNarration[3] || ''}
              brandColor="#7730ed"
              agencyName="AuditIQ"
            />
          );
        })()}
      </Sequence>

      {/* SLIDE 5: MEDIUM ISSUES */}
      <Sequence from={TIMING.s5.from} durationInFrames={TIMING.s5.dur}>
        {(() => {
          const slideData = structuredSlides?.[4]?.data || { issues: [] };
          console.log("🎬 REMOTION: Rendering MediumIssuesSlide with data:", slideData);
          return (
            <MediumIssuesSlide
              data={slideData}
              narration={finalNarration[4] || ''}
              brandColor="#7730ed"
              agencyName="AuditIQ"
            />
          );
        })()}
      </Sequence>

      {/* SLIDE 6: LOW ISSUES */}
      <Sequence from={TIMING.s6.from} durationInFrames={TIMING.s6.dur}>
        {(() => {
          const slideData = structuredSlides?.[5]?.data || { issues: [] };
          console.log("🎬 REMOTION: Rendering LowIssuesSlide with data:", slideData);
          return (
            <LowIssuesSlide
              data={slideData}
              narration={finalNarration[5] || ''}
              brandColor="#7730ed"
              agencyName="AuditIQ"
            />
          );
        })()}
      </Sequence>

      {/* SLIDE 7: TECHNICAL HIGHLIGHTS */}
      <Sequence from={TIMING.s7.from} durationInFrames={TIMING.s7.dur}>
        <TechnicalHighlightsSlide
          data={structuredSlides?.[6]?.data || {}}
          narration={finalNarration[6] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 8: CRITICAL TECHNICAL ISSUE */}
      <Sequence from={TIMING.s8.from} durationInFrames={TIMING.s8.dur}>
        <CriticalTechnicalIssueSlide
          data={structuredSlides?.[7]?.data || {}}
          narration={finalNarration[7] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 9: PERFORMANCE SUMMARY */}
      <Sequence from={TIMING.s9.from} durationInFrames={TIMING.s9.dur}>
        <PerformanceSummarySlide
          data={structuredSlides?.[8]?.data || {}}
          narration={finalNarration[8] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 10: CORE WEB VITALS */}
      <Sequence from={TIMING.s10.from} durationInFrames={TIMING.s10.dur}>
        <PageSpeedSlide
          data={structuredSlides?.[9]?.data || {}}
          narration={finalNarration[9] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 11: AI ANALYSIS */}
      <Sequence from={TIMING.s11.from} durationInFrames={TIMING.s11.dur}>
        <AIAnalysisSlide
          data={structuredSlides?.[10]?.data || {}}
          narration={finalNarration[10] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

    </AbsoluteFill>
  );
};
