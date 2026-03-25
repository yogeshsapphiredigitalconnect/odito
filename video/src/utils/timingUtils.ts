import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { staticFile } from "remotion";

// Audio files mapping for 11 slides
export const audioFiles = {
  s1: staticFile("audio/overview.mp3"),
  s2: staticFile("audio/score-summary.mp3"), 
  s3: staticFile("audio/issue-distribution.mp3"),
  s4: staticFile("audio/high-issues.mp3"),
  s5: staticFile("audio/medium-issues.mp3"),
  s6: staticFile("audio/low-issues.mp3"),
  s7: staticFile("audio/technical-highlights.mp3"),
  s8: staticFile("audio/critical-technical.mp3"),
  s9: staticFile("audio/performance-summary.mp3"),
  s10: staticFile("audio/pagespeed.mp3"),
  s11: staticFile("audio/ai-analysis.mp3"),
};

// Helper to get frames from audio duration
export const getFrames = async (file: string) => {
  try {
    const seconds = await getAudioDurationInSeconds(file);
    const frames = Math.ceil(seconds * 30); // 30 FPS
    // Edge case handling
    if (frames < 60) return 60; // Minimum 60 frames (2 seconds)
    if (frames > 600) return 600; // Maximum 600 frames (20 seconds)
    return frames;
  } catch {
    console.warn(`Failed to get audio duration for ${file}, using default 180 frames`);
    return 180; // Default fallback
  }
};

// Dynamic timing calculation for 11 slides
export const calculateTiming = async () => {
  const d1 = await getFrames(audioFiles.s1);
  const d2 = await getFrames(audioFiles.s2);
  const d3 = await getFrames(audioFiles.s3);
  const d4 = await getFrames(audioFiles.s4);
  const d5 = await getFrames(audioFiles.s5);
  const d6 = await getFrames(audioFiles.s6);
  const d7 = await getFrames(audioFiles.s7);
  const d8 = await getFrames(audioFiles.s8);
  const d9 = await getFrames(audioFiles.s9);
  const d10 = await getFrames(audioFiles.s10);
  const d11 = await getFrames(audioFiles.s11);
  
  return {
    s1: { from: 0, dur: d1 },
    s2: { from: d1, dur: d2 },
    s3: { from: d1 + d2, dur: d3 },
    s4: { from: d1 + d2 + d3, dur: d4 },
    s5: { from: d1 + d2 + d3 + d4, dur: d5 },
    s6: { from: d1 + d2 + d3 + d4 + d5, dur: d6 },
    s7: { from: d1 + d2 + d3 + d4 + d5 + d6, dur: d7 },
    s8: { from: d1 + d2 + d3 + d4 + d5 + d6 + d7, dur: d8 },
    s9: { from: d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8, dur: d9 },
    s10: { from: d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8 + d9, dur: d10 },
    s11: { from: d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8 + d9 + d10, dur: d11 },
  };
};

// DEPRECATED: Use dynamic duration calculation based on actual audio files
// const FPS = 30;
// const SECONDS_PER_SLIDE = 4;
// const DURATION_PER_SLIDE = FPS * SECONDS_PER_SLIDE; // 120 frames per slide
// const TOTAL_SLIDES = 11;
// export const TOTAL_DURATION_FRAMES = TOTAL_SLIDES * DURATION_PER_SLIDE; // 1320 frames
// export const TOTAL_DURATION_SECONDS = TOTAL_SLIDES * SECONDS_PER_SLIDE; // 44 seconds

// DEPRECATED: Use dynamic timing from calculateDynamicTiming() instead
// export const durations = {
//   s1: DURATION_PER_SLIDE, // 120 frames = 4 seconds
//   s2: DURATION_PER_SLIDE,
//   s3: DURATION_PER_SLIDE,
//   s4: DURATION_PER_SLIDE,
//   s5: DURATION_PER_SLIDE,
//   s6: DURATION_PER_SLIDE,
//   s7: DURATION_PER_SLIDE,
//   s8: DURATION_PER_SLIDE,
//   s9: DURATION_PER_SLIDE,
//   s10: DURATION_PER_SLIDE,
//   s11: DURATION_PER_SLIDE,
// };

// DEPRECATED: Use calculateDynamicTiming() for dynamic timing
// export const TIMING = {
//   s1: { from: 0, dur: durations.s1 },
//   s2: { from: durations.s1, dur: durations.s2 },
//   s3: { from: durations.s1 + durations.s2, dur: durations.s3 },
//   s4: { from: durations.s1 + durations.s2 + durations.s3, dur: durations.s4 },
//   s5: { from: durations.s1 + durations.s2 + durations.s3 + durations.s4, dur: durations.s5 },
//   s6: { from: durations.s1 + durations.s2 + durations.s3 + durations.s4 + durations.s5, dur: durations.s6 },
//   s7: { from: durations.s1 + durations.s2 + durations.s3 + durations.s4 + durations.s5 + durations.s6, dur: durations.s7 },
//   s8: { from: durations.s1 + durations.s2 + durations.s3 + durations.s4 + durations.s5 + durations.s6 + durations.s7, dur: durations.s8 },
//   s9: { from: durations.s1 + durations.s2 + durations.s3 + durations.s4 + durations.s5 + durations.s6 + durations.s7 + durations.s8, dur: durations.s9 },
//   s10: { from: durations.s1 + durations.s2 + durations.s3 + durations.s4 + durations.s5 + durations.s6 + durations.s7 + durations.s8 + durations.s9, dur: durations.s10 },
//   s11: { from: durations.s1 + durations.s2 + durations.s3 + durations.s4 + durations.s5 + durations.s6 + durations.s7 + durations.s8 + durations.s9 + durations.s10, dur: durations.s11 },
// };
