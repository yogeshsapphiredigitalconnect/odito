import { Composition } from "remotion";
import { AuditVideo as WorkingVideo } from "./WorkingVideo";
import { TOTAL_DURATION_FRAMES } from "./utils/timingUtils";
import { loadFont as loadSyne } from "@remotion/google-fonts/Syne";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import React from "react";

// Preload fonts asynchronously with optimized settings
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

// Start font loading immediately
loadFonts();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AuditVideo"
        component={WorkingVideo}
        durationInFrames={TOTAL_DURATION_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          audioUrl: '',
          projectId: '',
          structuredSlides: []
        }}
      />
    </>
  );
};
