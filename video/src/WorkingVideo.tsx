import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, Audio } from "remotion";
import { auditData } from "./data/auditData";
import { adaptToNewFormat, sampleNarration } from "./data/dataAdapter";
import { theme } from "./theme";
import { audioFiles, TIMING } from "./utils/timingUtils";

// Import only the working new slides
import { OverviewSlide } from "./slides/OverviewSlide";
import { OnPageIssuesSlide } from "./slides/OnPageIssuesSlide";
import { TechnicalIssuesSlide } from "./slides/TechnicalIssuesSlide";
import { PageSpeedSlide } from "./slides/PageSpeedSlide";
import { KeywordSlide } from "./slides/KeywordSlide";
import { AIVisibilitySlide } from "./slides/AIVisibilitySlide";

export const AuditVideo = () => {
  const frame = useCurrentFrame();
  const adaptedData = adaptToNewFormat(auditData);
  const narration = sampleNarration;
  
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
      
      {/* SLIDE 1: OVERVIEW */}
      <Sequence from={TIMING_OBJ.s1.from} durationInFrames={TIMING_OBJ.s1.dur}>
        <Audio src={audioFiles.overview} volume={1} />
        <OverviewSlide
          data={adaptedData.overview}
          narration={narration[0]}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 2: ON-PAGE ISSUES */}
      <Sequence from={TIMING_OBJ.s2.from} durationInFrames={TIMING_OBJ.s2.dur}>
        <Audio src={audioFiles.onpage} volume={1} />
        <OnPageIssuesSlide
          data={adaptedData.onpage}
          narration={narration[1]}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 3: TECHNICAL ISSUES */}
      <Sequence from={TIMING_OBJ.s3.from} durationInFrames={TIMING_OBJ.s3.dur}>
        <Audio src={audioFiles.technical} volume={1} />
        <TechnicalIssuesSlide
          data={adaptedData.technical}
          narration={narration[2]}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 4: PAGESPEED */}
      <Sequence from={TIMING_OBJ.s4.from} durationInFrames={TIMING_OBJ.s4.dur}>
        <Audio src={audioFiles.pagespeed} volume={1} />
        <PageSpeedSlide
          data={adaptedData.pagespeed}
          narration={narration[3]}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 5: KEYWORDS */}
      <Sequence from={TIMING_OBJ.s5.from} durationInFrames={TIMING_OBJ.s5.dur}>
        <Audio src={audioFiles.keywords} volume={1} />
        <KeywordSlide
          data={adaptedData.keywords}
          narration={narration[4]}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

      {/* SLIDE 6: AI VISIBILITY */}
      <Sequence from={TIMING_OBJ.s6.from} durationInFrames={TIMING_OBJ.s6.dur}>
        <Audio src={audioFiles.ai} volume={1} />
        <AIVisibilitySlide
          data={adaptedData.ai}
          narration={narration[5]}
          brandColor="#7730ed"
          agencyName="AuditIQ"
        />
      </Sequence>

    </AbsoluteFill>
  );
};
