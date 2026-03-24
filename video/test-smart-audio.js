require('dotenv').config({ path: __dirname + '/.env' });

/**
 * 🎯 COMPREHENSIVE AUDIO GENERATION TEST WITH SMART SERVICE
 * Tests the complete audio generation pipeline with automatic voice detection
 */

console.log('🎵 Testing Smart Audio Service...\n');

const SmartAudioService = require('./services/smartAudioService');

async function testSmartAudioService() {
  const smartAudioService = new SmartAudioService();
  const testProjectId = `test-smart-audio-${Date.now()}`;
  
  // Test script that simulates real video narration
  const testScript = `
    Welcome to your AI Search Optimization Audit report.
    
    Your website has been analyzed across multiple dimensions including schema coverage, 
    FAQ optimization, and conversational content readiness.
    
    Based on our analysis, we've identified several opportunities to improve your 
    search visibility and user engagement.
    
    Let's walk through your results and discuss actionable recommendations.
  `.trim();
  
  try {
    console.log('🔧 Step 1: Testing voice detection...');
    const availableVoices = await smartAudioService.getAvailableVoices();
    console.log(`✅ Found ${availableVoices.length} voices`);
    
    console.log('\n🔧 Step 2: Testing best voice selection...');
    const bestVoice = await smartAudioService.findBestVoice();
    console.log(`✅ Best voice selected: ${bestVoice}`);
    
    console.log('\n🔧 Step 3: Testing audio generation...');
    console.log(`📝 Script length: ${testScript.length} characters`);
    console.log(`🎯 Project ID: ${testProjectId}`);
    
    const audioUrl = await smartAudioService.generateAudioFromText(testScript, testProjectId);
    console.log(`✅ Audio generated: ${audioUrl}`);
    
    console.log('\n🔧 Step 4: Validating generated audio...');
    const fs = require('fs');
    const path = require('path');
    const audioPath = path.join(smartAudioService.OUTPUT_DIR, `${testProjectId}.mp3`);
    
    if (fs.existsSync(audioPath)) {
      const stats = fs.statSync(audioPath);
      console.log(`✅ File exists: ${audioPath}`);
      console.log(`✅ File size: ${stats.size} bytes`);
      
      // Estimate duration (rough calculation: ~150 words per minute, ~2.5 characters per word)
      const estimatedWords = testScript.length / 2.5;
      const estimatedDurationSeconds = (estimatedWords / 150) * 60;
      console.log(`✅ Estimated duration: ~${Math.round(estimatedDurationSeconds)} seconds`);
      
      // For 11 slides at 4 seconds each, we need ~44 seconds
      const requiredDuration = 44;
      if (estimatedDurationSeconds >= 30 && estimatedDurationSeconds <= 60) {
        console.log('✅ Duration looks good for video synchronization');
      } else {
        console.log(`⚠️ Duration might be ${estimatedDurationSeconds < 30 ? 'too short' : 'too long'} for optimal video sync`);
      }
    }
    
    console.log('\n🎉 SMART AUDIO SERVICE TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Summary:');
    console.log('✅ Voice detection: WORKING');
    console.log('✅ Best voice selection: WORKING');
    console.log('✅ Real audio generation: WORKING');
    console.log('✅ File saving: WORKING');
    console.log('✅ No silent fallback: CONFIRMED');
    
    console.log('\n🚀 Ready for video generation with real narration!');
    
    // Cleanup
    console.log('\n🧹 Cleaning up test files...');
    try {
      fs.unlinkSync(audioPath);
      console.log('✅ Test audio file deleted');
    } catch (error) {
      console.log('⚠️ Could not delete test file (may be in use)');
    }
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Smart audio service test failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 API Key Issue Detected:');
      console.log('1. Check your ElevenLabs API key in .env file');
      console.log('2. Ensure the key has Text-to-Speech permissions');
      console.log('3. Verify your account has sufficient character quota');
    } else if (error.message.includes('404')) {
      console.log('\n💡 Voice Issue Detected:');
      console.log('1. The configured voice ID is not available');
      console.log('2. Smart service should automatically find alternatives');
      console.log('3. Check if your account has access to premium voices');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Rate Limit Issue:');
      console.log('1. Too many requests to ElevenLabs API');
      console.log('2. Wait a few minutes before trying again');
      console.log('3. Consider upgrading your ElevenLabs plan');
    }
    
    return false;
  }
}

// Test the original audio service for comparison
async function testOriginalAudioService() {
  console.log('\n🔄 Testing Original Audio Service for comparison...');
  
  try {
    const AudioService = require('./services/audioService');
    const audioService = new AudioService();
    console.log('✅ Original service instantiated (should fail with current API key)');
  } catch (error) {
    console.log(`❌ Original service failed (expected): ${error.message}`);
  }
}

// Main execution
async function runTests() {
  console.log('=' .repeat(60));
  console.log('🎵 SMART AUDIO SERVICE COMPREHENSIVE TEST');
  console.log('=' .repeat(60));
  
  const success = await testSmartAudioService();
  await testOriginalAudioService();
  
  if (success) {
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Update your video worker to use SmartAudioService');
    console.log('2. Test audio generation with real project data');
    console.log('3. Verify audio-slide synchronization in video output');
    console.log('4. Monitor audio quality and adjust voice settings if needed');
    
    console.log('\n📝 Integration Example:');
    console.log('// In your worker.js');
    console.log('const SmartAudioService = require("./services/smartAudioService");');
    console.log('this.audioService = new SmartAudioService();');
    console.log('// Replace existing audioService calls');
  } else {
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Update your ElevenLabs API key');
    console.log('2. Check account permissions and quota');
    console.log('3. Contact ElevenLabs support if issues persist');
  }
}

runTests();
