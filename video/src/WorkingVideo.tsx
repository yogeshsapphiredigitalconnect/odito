import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, Audio } from "remotion";
import { adaptToNewFormat } from "./data/dataAdapter";
import { theme } from "./theme";
import { TIMING } from "./utils/timingUtils";

// Import only the working new slides
import { OverviewSlide } from "./slides/OverviewSlide";
import { OnPageIssuesSlide } from "./slides/OnPageIssuesSlide";
import { TechnicalIssuesSlide } from "./slides/TechnicalIssuesSlide";
import { PageSpeedSlide } from "./slides/PageSpeedSlide";
import { KeywordSlide } from "./slides/KeywordSlide";
import { AIVisibilitySlide } from "./slides/AIVisibilitySlide";

interface VideoProps {
  audioUrl: string;  // Updated from audioFile to audioUrl
  projectId: string;
  videoData: any;
  narrationSegments?: string[];
}

export const AuditVideo = ({ audioUrl, projectId, videoData, narrationSegments }: VideoProps) => {
  const frame = useCurrentFrame();
  
  // Create safe default data structure to prevent runtime crashes
  const safeData = {
    topIssues: {
      critical: [],
      high: [],
      medium: [],
      low: []
    },
    recommendations: [],
    keywordData: {
      topRankings: [],
      opportunities: []
    },
    technicalHighlights: {
      criticalIssues: [],
      topRecommendations: []
    },
    performanceMetrics: {
      mobileScore: 75,
      desktopScore: 85,
      pageSpeed: 80,
      lcp: 2.5,
      tbt: 300
    },
    scores: {
      overall: 75,
      technical: 80,
      performance: 70,
      seo: 85
    },
    issueDistribution: {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    project: {
      name: "Website Audit"
    },
    aiAnalysis: {
      score: 70,
      schemaMarkupCount: 0,
      hasKnowledgeGraph: false
    }
  };
  
  // Use dynamic videoData or fallback to static data with safety
  const dynamicData = videoData || require("./data/auditData").auditData;
  const mergedData = { ...safeData, ...dynamicData };
  const adaptedData = adaptToNewFormat(mergedData);
  
  // Handle narrationSegments from worker with safety fallback
  console.log("NARRATION TYPE:", typeof narrationSegments);
  console.log("IS ARRAY:", Array.isArray(narrationSegments));
  
  const safeSegments = Array.isArray(narrationSegments)
    ? narrationSegments
    : typeof narrationSegments === "string"
    ? (narrationSegments as string).split('\n')
    : [];
  
  // If no narrationSegments from worker, generate locally as fallback
  const finalNarration = safeSegments.length > 0 
    ? safeSegments 
    : (() => {
        console.log("Generating local narration as fallback");
        const VideoTemplateService = require("../services/videoTemplate.service");
        const localNarration = VideoTemplateService.generateCompleteNarration(mergedData);
        return localNarration ? localNarration.split('\n').filter((s: string) => s.trim()) : [];
      })();
  
  // Use dynamic timing based on actual audio durations
  const TIMING_OBJ = TIMING;
  
  // Calculate total duration for fade out
  const totalDuration = TIMING_OBJ.s6.from + TIMING_OBJ.s6.dur;

  // Global fade out at the end
  const globalFade = interpolate(frame, [totalDuration - 30, totalDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: theme.bg, opacity: globalFade }}>
      
      {/* Single audio track for the entire video */}
      <Audio src={audioUrl || ''} volume={1} />
      
      {/* SLIDE 1: OVERVIEW */}
      <Sequence from={TIMING_OBJ.s1.from} durationInFrames={TIMING_OBJ.s1.dur}>
        <OverviewSlide
          data={adaptedData.overview || {}}
          narration={finalNarration[0] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 2: ON-PAGE ISSUES */}
      <Sequence from={TIMING_OBJ.s2.from} durationInFrames={TIMING_OBJ.s2.dur}>
        <OnPageIssuesSlide
          data={adaptedData.onpage || {}}
          narration={finalNarration[1] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 3: TECHNICAL ISSUES */}
      <Sequence from={TIMING_OBJ.s3.from} durationInFrames={TIMING_OBJ.s3.dur}>
        <TechnicalIssuesSlide
          data={adaptedData.technical || {}}
          narration={finalNarration[2] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 4: PAGESPEED */}
      <Sequence from={TIMING_OBJ.s4.from} durationInFrames={TIMING_OBJ.s4.dur}>
        <PageSpeedSlide
          data={adaptedData.pagespeed || {}}
          narration={finalNarration[3] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 5: KEYWORDS */}
      <Sequence from={TIMING_OBJ.s5.from} durationInFrames={TIMING_OBJ.s5.dur}>
        <KeywordSlide
          data={adaptedData.keywords || {}}
          narration={finalNarration[4] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 6: AI VISIBILITY */}
      <Sequence from={TIMING_OBJ.s6.from} durationInFrames={TIMING_OBJ.s6.dur}>
        <AIVisibilitySlide
          data={adaptedData.ai || {}}
          narration={finalNarration[5] || ''}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

    </AbsoluteFill>
  );
};
