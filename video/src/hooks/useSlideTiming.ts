// remotion/hooks/useSlideTiming.ts
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

/**
 * Returns common animation values for slide entry/exit
 * and staggered child reveals.
 */
export function useSlideTiming() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slide in: 0–20 frames
  const slideIn = spring({ frame, fps, config: { damping: 18, stiffness: 120 }, durationInFrames: 20 });

  // Fade in opacity: 0–15 frames
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Slide Y from bottom
  const translateY = interpolate(frame, [0, 20], [40, 0], { extrapolateRight: "clamp" });

  // Fade out near end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames - 5],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Staggered children: each child appears 8 frames after previous
  const childOpacity = (index: number) =>
    interpolate(frame, [index * 8, index * 8 + 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const childY = (index: number) =>
    interpolate(frame, [index * 8, index * 8 + 20], [30, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Progress bar fill (0→1 over entire slide duration)
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Score counter: animate from 0 to target over 45 frames starting at frame 10
  const scoreCounter = (target: number, startFrame = 10) =>
    Math.round(
      interpolate(frame, [startFrame, startFrame + 45], [0, Number(target) || 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );

  return {
    frame,
    fps,
    durationInFrames,
    slideIn,
    opacity: Math.min(opacity, fadeOut),
    translateY,
    childOpacity,
    childY,
    progress,
    scoreCounter,
  };
}
