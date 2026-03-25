// Test script for dynamic timing calculation
import { calculateDynamicTiming, calculateSlideDuration, FPS } from '../src/utils/dynamicTiming';

// Test data
const testSlides = [
  { narration: "Welcome to your comprehensive SEO audit report." },
  { narration: "Your website scores 75 out of 100 overall." },
  { narration: "We found several critical issues that need immediate attention." },
  { narration: "Your page speed is slower than industry standards." },
  { narration: "" }, // Empty narration test
  { narration: "a".repeat(300) }, // Very long narration test
];

console.log('🧪 Testing Dynamic Timing Calculation\n');

// Test individual duration calculation
console.log('📏 Individual Duration Tests:');
testSlides.forEach((slide, index) => {
  const duration = calculateSlideDuration(slide.narration);
  const seconds = duration / FPS;
  console.log(`Slide ${index + 1}: "${slide.narration.substring(0, 50)}${slide.narration.length > 50 ? '...' : ''}"`);
  console.log(`   Characters: ${slide.narration.length}, Duration: ${seconds.toFixed(1)}s (${duration} frames)\n`);
});

// Test full timing calculation
console.log('🕐 Full Timeline Calculation:');
const result = calculateDynamicTiming(testSlides);

if (result) {
  const { timing, totalDuration, totalSeconds } = result;
  
  console.log(`Total Duration: ${totalSeconds.toFixed(1)}s (${totalDuration} frames)\n`);
  
  console.log('Slide Timeline:');
  Object.entries(timing).forEach(([key, slideTiming]) => {
    const slideNum = key.replace('s', '');
    const startTime = slideTiming.from / FPS;
    const endTime = (slideTiming.from + slideTiming.dur) / FPS;
    const duration = slideTiming.dur / FPS;
    
    console.log(`  Slide ${slideNum}: ${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s (${duration.toFixed(1)}s)`);
  });
  
  // Verify cumulative timing
  console.log('\n✅ Verification:');
  let lastEndFrame = 0;
  let isSequential = true;
  
  Object.entries(timing).forEach(([key, slideTiming]) => {
    if (slideTiming.from !== lastEndFrame) {
      isSequential = false;
      console.log(`❌ Gap detected: Slide ${key} starts at ${slideTiming.from}, expected ${lastEndFrame}`);
    }
    lastEndFrame = slideTiming.from + slideTiming.dur;
  });
  
  if (isSequential) {
    console.log('✅ Timeline is perfectly sequential');
  }
  
  if (lastEndFrame === totalDuration) {
    console.log('✅ Total duration matches timeline sum');
  } else {
    console.log(`❌ Duration mismatch: timeline ends at ${lastEndFrame}, total is ${totalDuration}`);
  }
  
  // Test bounds
  console.log('\n🛡️ Bounds Testing:');
  const durations = Object.values(timing).map((t: any) => t.dur / FPS);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  console.log(`Min duration: ${minDuration.toFixed(1)}s (should be ≥ 2s)`);
  console.log(`Max duration: ${maxDuration.toFixed(1)}s (should be ≤ 20s)`);
  
  if (minDuration >= 2 && maxDuration <= 20) {
    console.log('✅ All durations within bounds');
  } else {
    console.log('❌ Duration bounds violated');
  }
  
} else {
  console.log('❌ Timing calculation failed');
}

console.log('\n🎉 Test completed!');
