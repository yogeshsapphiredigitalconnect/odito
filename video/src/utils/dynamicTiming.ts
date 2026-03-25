// Dynamic timing utilities for audio-video sync
export const FPS = 30;
export const AVERAGE_SPEECH_RATE = 15; // characters per second

/**
 * Calculate slide duration based on narration length
 * @param narration - The narration text for the slide
 * @returns duration in frames
 */
export const calculateSlideDuration = (narration: string): number => {
  if (!narration || typeof narration !== 'string') {
    // Default duration for empty narration
    return FPS * 2; // 2 seconds minimum
  }

  // Calculate duration based on character count
  const durationInSeconds = narration.length / AVERAGE_SPEECH_RATE;
  
  // Apply bounds: minimum 2 seconds, maximum 20 seconds
  const boundedDuration = Math.max(2, Math.min(20, durationInSeconds));
  
  // Convert to frames
  const durationInFrames = Math.ceil(boundedDuration * FPS);
  
  console.log(`🕐 Duration calculation: "${narration.substring(0, 50)}..."`);
  console.log(`   Characters: ${narration.length}, Seconds: ${boundedDuration.toFixed(1)}, Frames: ${durationInFrames}`);
  
  return durationInFrames;
};

/**
 * Calculate timing for all slides based on their narration
 * @param structuredSlides - Array of slide objects with narration
 * @returns timing object with cumulative from positions and durations
 */
export const calculateDynamicTiming = (structuredSlides: any[]) => {
  if (!structuredSlides || !Array.isArray(structuredSlides)) {
    console.error('❌ Invalid structuredSlides for timing calculation');
    return null;
  }

  const timing: any = {};
  let currentFrame = 0;

  console.log('🕐 Calculating dynamic timing for', structuredSlides.length, 'slides');

  structuredSlides.forEach((slide, index) => {
    const slideKey = `s${index + 1}`;
    const narration = slide?.narration || '';
    const duration = calculateSlideDuration(narration);
    
    timing[slideKey] = {
      from: currentFrame,
      dur: duration,
      narration: narration.substring(0, 50) + (narration.length > 50 ? '...' : '')
    };
    
    currentFrame += duration;
    
    console.log(`   Slide ${index + 1}: from ${timing[slideKey].from}, duration ${duration}, total so far: ${currentFrame}`);
  });

  const totalDuration = currentFrame;
  const totalSeconds = totalDuration / FPS;

  console.log(`🕐 Total video duration: ${totalDuration} frames (${totalSeconds.toFixed(1)} seconds)`);

  return {
    timing,
    totalDuration,
    totalSeconds
  };
};

/**
 * Get slide timing information for debugging
 */
export const getSlideTimingInfo = (timing: any, slideIndex: number) => {
  const slideKey = `s${slideIndex + 1}`;
  const slideTiming = timing[slideKey];
  
  if (!slideTiming) {
    return null;
  }

  return {
    slideNumber: slideIndex + 1,
    fromFrame: slideTiming.from,
    durationFrames: slideTiming.dur,
    toFrame: slideTiming.from + slideTiming.dur,
    startTimeSeconds: slideTiming.from / FPS,
    durationSeconds: slideTiming.dur / FPS,
    endTimeSeconds: (slideTiming.from + slideTiming.dur) / FPS,
    narrationPreview: slideTiming.narration
  };
};
