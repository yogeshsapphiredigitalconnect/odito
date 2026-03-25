import { Composition } from "remotion";
import { AuditVideo as WorkingVideo } from "./WorkingVideo";
// import { TOTAL_DURATION_FRAMES } from "./utils/timingUtils"; // DEPRECATED - Use dynamic duration
import { loadFont as loadSyne } from "@remotion/google-fonts/Syne";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import React from "react";

// Start font loading immediately
const loadFonts = async () => {
  try {
    await Promise.all([
      loadSyne("normal"),
      loadJetBrains("normal")
    ]);
    console.log('✅ Fonts loaded successfully');
  } catch (error) {
    console.warn('⚠️ Font loading failed:', error);
  }
};
loadFonts();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AuditVideo"
        component={WorkingVideo}
        // durationInFrames will be set dynamically from worker input
        // Use a reasonable default for development (61.6 seconds = 1848 frames)
        durationInFrames={1848}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          audioUrl: '',
          projectId: '',
          slidesWithAudio: [],      // ✅ FIXED: Correct key matching worker
          durationInFrames: 1848,   // Dynamic duration from worker
          totalDuration: 61.6       // Dynamic total duration in seconds from worker
        }}
      />
    </>
  );
};
