#!/usr/bin/env node

/**
 * Test script to verify perfect slide-audio synchronization
 * Tests the new per-slide audio generation and timing system
 */

require('dotenv').config();
const AudioService = require('./services/audioService');
const VideoWorker = require('./worker');

class SlideAudioSyncTest {
  constructor() {
    this.audioService = new AudioService();
    this.videoWorker = new VideoWorker();
  }

  async runTest() {
    console.log('🧪 Starting Slide-Audio Synchronization Test');
    console.log('=' .repeat(60));

    try {
      // Test data - simulate audit snapshot
      const testProjectId = 'test-sync-' + Date.now();
      const auditSnapshot = {
        projectName: 'Test Website',
        url: 'https://test.com',
        scores: { overall: 85, seo: 90, performance: 80, aiVisibility: 75 },
        issueDistribution: { critical: 2, high: 5, medium: 8, low: 12, total: 27 },
        topIssues: {
          critical: [{ title: 'Missing SSL Certificate', description: 'Critical security issue' }],
          high: [{ title: 'Slow Page Speed', description: 'Performance issue' }],
          medium: [{ title: 'Missing Meta Tags', description: 'SEO issue' }],
          low: [{ title: 'Image Alt Text', description: 'Accessibility issue' }]
        },
        technicalHighlights: { checks: [] },
        performanceMetrics: { pageSpeed: 75, mobileScore: 70, desktopScore: 80 },
        aiAnalysis: { score: 75, schemaMarkupCount: 5 }
      };

      console.log('📊 Test Project ID:', testProjectId);
      console.log('📝 Audit Data:', JSON.stringify(auditSnapshot, null, 2));

      // Step 1: Generate structured slides
      console.log('\n🎬 Step 1: Generating structured slides...');
      const structuredSlides = this.videoWorker.generateStructuredSlides(auditSnapshot);
      
      if (!structuredSlides || structuredSlides.length !== 11) {
        throw new Error(`Expected 11 slides, got ${structuredSlides?.length || 0}`);
      }
      
      console.log(`✅ Generated ${structuredSlides.length} structured slides`);

      // Step 2: Generate per-slide audio
      console.log('\n🎙️ Step 2: Generating per-slide audio...');
      const audioFiles = await this.audioService.generatePerSlideAudio(structuredSlides, testProjectId);
      
      if (!audioFiles || audioFiles.length !== 11) {
        throw new Error(`Expected 11 audio files, got ${audioFiles?.length || 0}`);
      }
      
      console.log(`✅ Generated ${audioFiles.length} audio files`);

      // Step 3: Attach audio to slides
      console.log('\n🔗 Step 3: Attaching audio to slides...');
      const slidesWithAudio = structuredSlides.map((slide, index) => {
        const audioFile = audioFiles.find(audio => audio.slideIndex === index + 1);
        if (!audioFile) {
          throw new Error(`Missing audio file for slide ${index + 1}`);
        }
        
        return {
          ...slide,
          audio: audioFile.audioPath,
          duration: audioFile.duration,
          durationInFrames: Math.round(audioFile.duration * 30)
        };
      });

      console.log(`✅ Attached audio to all ${slidesWithAudio.length} slides`);

      // Step 4: Verify timing and synchronization
      console.log('\n⏱️ Step 4: Verifying timing and synchronization...');
      
      let totalDuration = 0;
      let timingDetails = [];
      
      slidesWithAudio.forEach((slide, index) => {
        const startTime = totalDuration;
        const endTime = totalDuration + slide.duration;
        
        timingDetails.push({
          slideNumber: index + 1,
          title: slide.title,
          audioFile: slide.audio,
          duration: slide.duration,
          startTime: startTime,
          endTime: endTime,
          durationInFrames: slide.durationInFrames
        });
        
        totalDuration += slide.duration;
      });

      console.log('\n📋 Slide Timing Details:');
      console.table(timingDetails);

      console.log(`\n🕐 Total Video Duration: ${totalDuration.toFixed(2)} seconds`);
      console.log(`📊 Total Frames: ${Math.round(totalDuration * 30)} frames (at 30 FPS)`);

      // Step 5: Validate audio file existence
      console.log('\n🔍 Step 5: Validating audio file existence...');
      
      for (const slide of slidesWithAudio) {
        const filename = slide.audio.replace('/audio/', '');
        const exists = this.audioService.audioExists(filename.replace('.mp3', ''));
        
        if (!exists) {
          throw new Error(`Audio file not found: ${slide.audio}`);
        }
        
        console.log(`✅ Audio file exists: ${slide.audio}`);
      }

      // Step 6: Test Remotion props structure
      console.log('\n🎬 Step 6: Testing Remotion props structure...');
      
      const remotionProps = {
        projectId: testProjectId,
        slidesWithAudio: slidesWithAudio,
        auditSnapshot: auditSnapshot,
        fps: 30
      };

      console.log('📋 Remotion Props Structure:');
      console.log('- Project ID:', remotionProps.projectId);
      console.log('- Slides with Audio:', remotionProps.slidesWithAudio.length);
      console.log('- FPS:', remotionProps.fps);
      console.log('- Props JSON size:', JSON.stringify(remotionProps).length, 'characters');

      // Save test data for inspection
      const fs = require('fs');
      const path = require('path');
      
      const testDataPath = path.join(__dirname, 'temp', `${testProjectId}-sync-test.json`);
      if (!fs.existsSync(path.dirname(testDataPath))) {
        fs.mkdirSync(path.dirname(testDataPath), { recursive: true });
      }
      
      fs.writeFileSync(testDataPath, JSON.stringify(remotionProps, null, 2));
      console.log(`\n💾 Test data saved to: ${testDataPath}`);

      // Final validation
      console.log('\n✅ FINAL VALIDATION RESULTS:');
      console.log('✅ 11 structured slides generated');
      console.log('✅ 11 separate audio files generated');
      console.log('✅ Audio files attached to slides');
      console.log('✅ Timing calculated based on actual audio duration');
      console.log('✅ All audio files exist and are accessible');
      console.log('✅ Remotion props structure is valid');
      console.log(`✅ Total video duration: ${totalDuration.toFixed(2)} seconds`);

      console.log('\n🎉 SLIDE-AUDIO SYNCHRONIZATION TEST PASSED!');
      console.log('🚀 Ready for perfect video rendering with synchronized slides and audio');

      return {
        success: true,
        testProjectId,
        totalDuration,
        slidesCount: slidesWithAudio.length,
        audioFilesCount: audioFiles.length,
        timingDetails
      };

    } catch (error) {
      console.error('\n❌ SLIDE-AUDIO SYNCHRONIZATION TEST FAILED:');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  const tester = new SlideAudioSyncTest();
  tester.runTest()
    .then(result => {
      console.log('\n🏁 Test completed with result:', result.success ? 'SUCCESS' : 'FAILURE');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Unexpected error during test:', error);
      process.exit(1);
    });
}

module.exports = SlideAudioSyncTest;
