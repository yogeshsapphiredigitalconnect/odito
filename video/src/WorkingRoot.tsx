import { Composition } from "remotion";
import { AuditVideo as WorkingVideo } from "./WorkingVideo";
import { loadFont as loadSyne } from "@remotion/google-fonts/Syne";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";

// Preload fonts asynchronously
const loadFonts = async () => {
  try {
    await Promise.all([
      loadSyne(),
      loadJetBrains()
    ]);
  } catch (error) {
    console.warn('Font loading failed:', error);
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
        durationInFrames={2120}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
