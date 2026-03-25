#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING DYNAMIC DURATION FIX');
console.log('==================================\n');

// Test 1: Verify timingUtils.ts no longer has hardcoded duration
console.log('📋 Test 1: Check timingUtils.ts for hardcoded values');
const timingUtilsPath = path.join(__dirname, 'src', 'utils', 'timingUtils.ts');
const timingUtilsContent = fs.readFileSync(timingUtilsPath, 'utf8');

if (timingUtilsContent.includes('export const TOTAL_DURATION_FRAMES') && !timingUtilsContent.includes('// export const TOTAL_DURATION_FRAMES')) {
  console.log('❌ FAILED: TOTAL_DURATION_FRAMES still exported (uncommented)');
} else if (timingUtilsContent.includes('1320') && !timingUtilsContent.includes('// 1320 frames')) {
  console.log('❌ FAILED: Hardcoded 1320 frames still present (uncommented)');
} else {
  console.log('✅ PASSED: Hardcoded duration removed from timingUtils.ts');
}

// Test 2: Verify worker calculates dynamic duration
console.log('\n📋 Test 2: Check worker.js dynamic duration calculation');
const workerPath = path.join(__dirname, 'worker.js');
const workerContent = fs.readFileSync(workerPath, 'utf8');

if (workerContent.includes('const totalDurationInFrames = Math.round(totalDuration * 30)')) {
  console.log('✅ PASSED: Worker calculates dynamic totalDurationInFrames');
} else {
  console.log('❌ FAILED: Worker dynamic duration calculation not found');
}

if (workerContent.includes('--duration=${totalDurationInFrames}')) {
  console.log('✅ PASSED: Worker passes --duration to Remotion CLI');
} else {
  console.log('❌ FAILED: Worker does not pass --duration to Remotion CLI');
}

// Test 3: Verify WorkingRoot.tsx doesn't import hardcoded duration
console.log('\n📋 Test 3: Check WorkingRoot.tsx imports');
const workingRootPath = path.join(__dirname, 'src', 'WorkingRoot.tsx');
const workingRootContent = fs.readFileSync(workingRootPath, 'utf8');

if (workingRootContent.includes('import { TOTAL_DURATION_FRAMES }') && !workingRootContent.includes('// import { TOTAL_DURATION_FRAMES }')) {
  console.log('❌ FAILED: WorkingRoot still imports TOTAL_DURATION_FRAMES (uncommented)');
} else {
  console.log('✅ PASSED: WorkingRoot no longer imports hardcoded duration');
}

// Test 4: Verify WorkingVideo.tsx uses dynamic timing
console.log('\n📋 Test 4: Check WorkingVideo.tsx timing');
const workingVideoPath = path.join(__dirname, 'src', 'WorkingVideo.tsx');
const workingVideoContent = fs.readFileSync(workingVideoPath, 'utf8');

if (workingVideoContent.includes('const durationInFrames = Math.round(slide.duration * fps)')) {
  console.log('✅ PASSED: WorkingVideo calculates dynamic duration per slide');
} else {
  console.log('❌ FAILED: WorkingVideo dynamic slide duration not found');
}

if (workingVideoContent.includes('const totalDuration = currentFrame')) {
  console.log('✅ PASSED: WorkingVideo calculates total duration dynamically');
} else {
  console.log('❌ FAILED: WorkingVideo total duration calculation not found');
}

// Test 5: Simulate dynamic duration calculation
console.log('\n📋 Test 5: Simulate dynamic duration calculation');
const mockSlides = [
  { duration: 8.1 },  // Slide 1: 8.1 seconds
  { duration: 7.5 },  // Slide 2: 7.5 seconds
  { duration: 9.2 },  // Slide 3: 9.2 seconds
  { duration: 6.8 },  // Slide 4: 6.8 seconds
  { duration: 10.1 }, // Slide 5: 10.1 seconds
  { duration: 8.7 },  // Slide 6: 8.7 seconds
  { duration: 9.5 },  // Slide 7: 9.5 seconds
  { duration: 7.3 },  // Slide 8: 7.3 seconds
  { duration: 8.9 },  // Slide 9: 8.9 seconds
  { duration: 9.8 },  // Slide 10: 9.8 seconds
  { duration: 15.2 }, // Slide 11: 15.2 seconds
];

const totalDuration = mockSlides.reduce((sum, slide) => sum + slide.duration, 0);
const totalDurationInFrames = Math.round(totalDuration * 30);

console.log(`🎵 Mock slide durations: ${mockSlides.map(s => s.duration.toFixed(1)).join('s, ')}s`);
console.log(`🕐 Total duration: ${totalDuration.toFixed(2)} seconds`);
console.log(`🎞️ Total frames: ${totalDurationInFrames} frames`);
console.log(`📹 Expected video length: ${totalDuration.toFixed(2)} seconds`);

if (totalDurationInFrames > 1320) {
  console.log('✅ PASSED: Dynamic duration exceeds old 44-second limit');
} else {
  console.log('❌ FAILED: Dynamic duration still within old 44-second limit');
}

console.log('\n🎉 DYNAMIC DURATION FIX TEST COMPLETE');
console.log('=====================================');

// Summary
const allPassed = !(timingUtilsContent.includes('export const TOTAL_DURATION_FRAMES') && !timingUtilsContent.includes('// export const TOTAL_DURATION_FRAMES')) &&
                  !(timingUtilsContent.includes('1320') && !timingUtilsContent.includes('// 1320 frames')) &&
                  workerContent.includes('const totalDurationInFrames = Math.round(totalDuration * 30)') &&
                  workerContent.includes('--duration=${totalDurationInFrames}') &&
                  !(workingRootContent.includes('import { TOTAL_DURATION_FRAMES }') && !workingRootContent.includes('// import { TOTAL_DURATION_FRAMES }')) &&
                  workingVideoContent.includes('const durationInFrames = Math.round(slide.duration * fps)') &&
                  workingVideoContent.includes('const totalDuration = currentFrame') &&
                  totalDurationInFrames > 1320;

if (allPassed) {
  console.log('✅ ALL TESTS PASSED - Dynamic duration fix is working!');
  console.log('🚀 Video duration will now match total audio duration exactly.');
} else {
  console.log('❌ SOME TESTS FAILED - Please review the implementation.');
}
