import { interpolate, spring, Easing } from "remotion";

// Smooth count-up for score numbers
export const countUp = (frame: number, target: number, startFrame = 0, duration = 45) =>
  Math.round(interpolate(frame, [startFrame, startFrame + duration], [0, target], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }));

// Spring pop-in (for cards, badges, icons)
export const popIn = (frame: number, delay = 0, fps = 30) =>
  spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 180, mass: 0.8 } });

// Soft fade in
export const fadeIn = (frame: number, delay = 0, duration = 20) =>
  interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Slide up + fade
export const slideUp = (frame: number, delay = 0, distance = 30) => ({
  opacity: fadeIn(frame, delay),
  transform: `translateY(${interpolate(frame, [delay, delay + 25], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  })}px)`,
});

// Slide in from left
export const slideLeft = (frame: number, delay = 0, distance = 60) => ({
  opacity: fadeIn(frame, delay),
  transform: `translateX(${interpolate(frame, [delay, delay + 30], [-distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  })}px)`,
});

// SVG circle progress (returns strokeDashoffset)
export const circleProgress = (frame: number, radius: number, score: number, delay = 0, duration = 60) => {
  const circumference = 2 * Math.PI * radius;
  const progress = interpolate(frame, [delay, delay + duration], [0, score / 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return circumference * (1 - progress);
};

// Score color helper
export const scoreColor = (score: number) =>
  score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

// Slide in from right
export const slideRight = (frame: number, delay = 0, distance = 60) => ({
  opacity: fadeIn(frame, delay),
  transform: `translateX(${interpolate(frame, [delay, delay + 30], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  })}px)`,
});
