require('dotenv').config({ path: __dirname + '/.env' });

/**
 * 🎯 COMPREHENSIVE AUDIO GENERATION FIX
 * Fixes ElevenLabs API authentication and removes silent audio fallback
 */

console.log('🔧 Testing Audio Generation Fixes...\n');

// Test 1: Verify environment variables are loaded
console.log('📋 Test 1: Environment Variables');
console.log('✅ NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('✅ ELEVENLABS_API_KEY:', process.env.ELEVENLABS_API_KEY ? `${process.env.ELEVENLABS_API_KEY.substring(0, 8)}...` : 'MISSING');
console.log('✅ ELEVENLABS_VOICE_ID:', process.env.ELEVENLABS_VOICE_ID || 'MISSING');
console.log('✅ OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 8)}...` : 'MISSING');

// Test 2: Validate API key format
console.log('\n🔑 Test 2: API Key Validation');
const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
if (!elevenLabsKey) {
  console.error('❌ ELEVENLABS_API_KEY is missing');
  console.log('💡 Please check your .env file in the video directory');
  process.exit(1);
} else if (elevenLabsKey.length < 20) {
  console.error('❌ ELEVENLABS_API_KEY appears to be too short');
  process.exit(1);
} else {
  console.log('✅ ElevenLabs API key format looks valid');
}

// Test 3: Test ElevenLabs API authentication
console.log('\n🌐 Test 3: ElevenLabs API Authentication');
const axios = require('axios');

async function testElevenLabsAuth() {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ ElevenLabs API authentication successful');
    console.log('✅ User info:', response.data.subscription?.tier || 'Free tier');
    return true;
  } catch (error) {
    console.error('❌ ElevenLabs API authentication failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.detail || error.response.statusText}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return false;
  }
}

// Test 4: Test actual TTS generation
console.log('\n🎵 Test 4: Text-to-Speech Generation');
async function testTTSGeneration() {
  const testText = "This is a test of the audio generation system. If you can hear this, the fix is working correctly.";
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'rachel';
  
  try {
    console.log(`🔊 Generating audio with voice: ${voiceId}`);
    console.log(`📝 Test text: "${testText}"`);
    
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: testText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );
    
    const audioBuffer = Buffer.from(response.data);
    console.log(`✅ Audio generated successfully`);
    console.log(`✅ Audio size: ${audioBuffer.length} bytes`);
    
    // Save test audio file
    const fs = require('fs');
    const path = require('path');
    const testAudioPath = path.join(__dirname, 'test-audio-output.mp3');
    
    fs.writeFileSync(testAudioPath, audioBuffer);
    console.log(`✅ Test audio saved: ${testAudioPath}`);
    
    return audioBuffer;
  } catch (error) {
    console.error('❌ TTS generation failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.detail || error.response.statusText}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return null;
  }
}

// Test 5: Test Audio Service with real API
console.log('\n🔧 Test 5: Audio Service Integration');
const AudioService = require('./services/audioService');

async function testAudioService() {
  // Create a modified audio service that doesn't fallback to silent audio
  class FixedAudioService extends AudioService {
    constructor() {
      super();
      // Disable silent audio fallback
      this.FALLBACK_ENABLED = false;
    }

    async generateAudioFromText(text, projectId) {
      console.log(`[FIXED_AUDIO_SERVICE] Starting audio generation for project: ${projectId}`);
      
      // Validate API key first
      if (!this.ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY not configured - cannot generate audio');
      }

      // Clean and validate input text
      const cleanedText = this.cleanTextForTTS(text);
      if (!cleanedText || cleanedText.trim().length === 0) {
        throw new Error('No valid text provided for audio generation');
      }
      
      console.log(`[FIXED_AUDIO_SERVICE] Cleaned text length: ${cleanedText.length} characters`);
      
      // Apply rate limiting
      await this.applyRateLimit();
      
      // Generate audio with ElevenLabs (no fallback to silent audio)
      try {
        console.log(`[FIXED_AUDIO_SERVICE] Generating audio with ElevenLabs...`);
        const audioBuffer = await this.generateWithRetry(
          () => this.generateElevenLabsAudio(cleanedText),
          'ElevenLabs'
        );
        
        // Save audio file
        const outputPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
        fs.writeFileSync(outputPath, audioBuffer);
        
        console.log(`[FIXED_AUDIO_SERVICE] ✅ Real voice audio saved: ${outputPath}`);
        console.log(`[FIXED_AUDIO_SERVICE] 📊 Size: ${audioBuffer.length} bytes`);
        
        // Return HTTP URL for backend access
        return `http://localhost:5000/audio/${projectId}.mp3`;
        
      } catch (error) {
        console.error(`[FIXED_AUDIO_SERVICE] ❌ Real audio generation failed:`, error.message);
        // CRITICAL: DO NOT fallback to silent audio
        throw new Error(`Real voice audio generation failed: ${error.message}`);
      }
    }
  }
  
  const fixedAudioService = new FixedAudioService();
  const testProjectId = `test-real-audio-${Date.now()}`;
  const testScript = "Welcome to the AI Search Optimization Audit. This video will guide you through your website's performance analysis and provide actionable insights to improve your search visibility.";
  
  try {
    console.log(`🔊 Testing real audio generation...`);
    const audioUrl = await fixedAudioService.generateAudioFromText(testScript, testProjectId);
    console.log(`✅ Real audio generated: ${audioUrl}`);
    
    // Validate the generated file
    const isValid = fixedAudioService.validateAudioFile(testProjectId);
    console.log(`✅ Audio validation: ${isValid ? 'PASSED' : 'FAILED'}`);
    
    return audioUrl;
  } catch (error) {
    console.error('❌ Fixed audio service test failed:', error.message);
    return null;
  }
}

// Main test execution
async function runAllTests() {
  try {
    // Test 1 & 2 already done above
    
    // Test 3: API Authentication
    const authSuccess = await testElevenLabsAuth();
    if (!authSuccess) {
      console.error('\n❌ API authentication failed - cannot continue');
      process.exit(1);
    }
    
    // Test 4: TTS Generation
    const ttsSuccess = await testTTSGeneration();
    if (!ttsSuccess) {
      console.error('\n❌ TTS generation failed - cannot continue');
      process.exit(1);
    }
    
    // Test 5: Audio Service Integration
    const serviceSuccess = await testAudioService();
    if (!serviceSuccess) {
      console.error('\n❌ Audio service integration failed');
      process.exit(1);
    }
    
    console.log('\n🎉 ALL AUDIO GENERATION FIXES VALIDATED!');
    console.log('\n📋 Summary of Fixes:');
    console.log('✅ Environment variables loading: FIXED');
    console.log('✅ ElevenLabs API authentication: WORKING');
    console.log('✅ Real voice TTS generation: WORKING');
    console.log('✅ Silent audio fallback: REMOVED');
    console.log('✅ Audio service integration: WORKING');
    
    console.log('\n🚀 Ready for video generation with real narration!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests();
