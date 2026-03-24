import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { staticFile } from "remotion";

// Audio files mapping using staticFile
export const audioFiles = {
  overview: staticFile("audio/overview.mp3"),
  onpage: staticFile("audio/onpage.mp3"), 
  technical: staticFile("audio/technical.mp3"),
  pagespeed: staticFile("audio/pagespeed.mp3"),
  keywords: staticFile("audio/keywords.mp3"),
  ai: staticFile("audio/ai.mp3"),
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

// Dynamic timing calculation
export const calculateTiming = async () => {
  const d1 = await getFrames(audioFiles.overview);
  const d2 = await getFrames(audioFiles.onpage);
  const d3 = await getFrames(audioFiles.technical);
  const d4 = await getFrames(audioFiles.pagespeed);
  const d5 = await getFrames(audioFiles.keywords);
  const d6 = await getFrames(audioFiles.ai);
  
  return {
    s1: { from: 0, dur: d1 },
    s2: { from: d1, dur: d2 },
    s3: { from: d1 + d2, dur: d3 },
    s4: { from: d1 + d2 + d3, dur: d4 },
    s5: { from: d1 + d2 + d3 + d4, dur: d5 },
    s6: { from: d1 + d2 + d3 + d4 + d5, dur: d6 },
  };
};

// Dynamic timing with actual audio durations (in frames)
export const durations = {
  s1: 392,
  s2: 393,
  s3: 308,
  s4: 355,
  s5: 360,
  s6: 314,
};

// Dynamic timing object with no gaps
export const TIMING = {
  s1: { from: 0, dur: durations.s1 },
  s2: { from: durations.s1, dur: durations.s2 },
  s3: { from: durations.s1 + durations.s2, dur: durations.s3 },
  s4: { from: durations.s1 + durations.s2 + durations.s3, dur: durations.s4 },
  s5: { from: durations.s1 + durations.s2 + durations.s3 + durations.s4, dur: durations.s5 },
  s6: { from: durations.s1 + durations.s2 + durations.s3 + durations.s4 + durations.s5, dur: durations.s6 },
};
