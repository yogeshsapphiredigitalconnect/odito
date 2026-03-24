require('dotenv').config({ path: __dirname + '/.env' });

/**
 * 🔍 DETAILED ELEVENLABS API DEBUG
 * Tests the API key with detailed error reporting
 */

console.log('🔍 Detailed ElevenLabs API Debug...\n');

const axios = require('axios');

// Test the exact API call that the audio service makes
async function testElevenLabsDirectly() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
  
  console.log('🔑 API Key Details:');
  console.log(`   Length: ${apiKey?.length || 0}`);
  console.log(`   Format: ${apiKey?.startsWith('sk_') ? 'Valid format' : 'Invalid format'}`);
  console.log(`   Preview: ${apiKey?.substring(0, 12)}...`);
  
  console.log(`\n🎙️ Voice ID: ${voiceId}`);
  
  if (!apiKey) {
    console.error('❌ No API key found');
    return false;
  }
  
  // Test 1: Check user info (should work with valid key)
  console.log('\n📋 Test 1: User Info Endpoint');
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ User info retrieved successfully');
    console.log(`   Subscription: ${response.data.subscription?.tier || 'Unknown'}`);
    console.log(`   Character limit: ${response.data.subscription?.character_limit || 'Unknown'}`);
    console.log(`   Character count: ${response.data.subscription?.character_count || 'Unknown'}`);
  } catch (error) {
    console.error('❌ User info failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return false;
  }
  
  // Test 2: Check available voices
  console.log('\n🎭 Test 2: Available Voices');
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`✅ Retrieved ${response.data.voices?.length || 0} voices`);
    
    // Check if our voice ID exists
    const ourVoice = response.data.voices?.find(v => v.voice_id === voiceId);
    if (ourVoice) {
      console.log(`✅ Voice ${voiceId} found: ${ourVoice.name}`);
    } else {
      console.log(`⚠️ Voice ${voiceId} not found in available voices`);
      console.log('   Available voices:', response.data.voices?.slice(0, 5).map(v => v.voice_id).join(', '), '...');
    }
  } catch (error) {
    console.error('❌ Voices list failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
  
  // Test 3: Try TTS with minimal text
  console.log('\n🎵 Test 3: Minimal TTS Generation');
  try {
    const testText = "Hello world";
    console.log(`   Text: "${testText}"`);
    
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: testText,
        model_id: 'eleven_multilingual_v2'
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        responseType: 'arraybuffer',
        timeout: 15000
      }
    );
    
    const audioBuffer = Buffer.from(response.data);
    console.log(`✅ TTS successful: ${audioBuffer.length} bytes`);
    
    // Save test file
    const fs = require('fs');
    const path = require('path');
    const testPath = path.join(__dirname, 'debug-test-audio.mp3');
    fs.writeFileSync(testPath, audioBuffer);
    console.log(`✅ Test audio saved: ${testPath}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ TTS failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return false;
  }
}

// Test with a default voice if the custom voice fails
async function testWithDefaultVoice() {
  console.log('\n🔄 Testing with default voice (rachel)...');
  
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const defaultVoiceId = 'rachel';
  
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${defaultVoiceId}`,
      {
        text: "Testing with default voice",
        model_id: 'eleven_multilingual_v2'
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        responseType: 'arraybuffer',
        timeout: 15000
      }
    );
    
    const audioBuffer = Buffer.from(response.data);
    console.log(`✅ Default voice TTS successful: ${audioBuffer.length} bytes`);
    return true;
    
  } catch (error) {
    console.error('❌ Default voice TTS also failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return false;
  }
}

// Main execution
async function runDebug() {
  try {
    const success = await testElevenLabsDirectly();
    
    if (!success) {
      console.log('\n🔄 Trying with default voice...');
      const defaultSuccess = await testWithDefaultVoice();
      
      if (defaultSuccess) {
        console.log('\n💡 SOLUTION: Use default voice "rachel" instead of custom voice');
        console.log('   Update your .env file: ELEVENLABS_VOICE_ID=rachel');
      } else {
        console.log('\n❌ Both voices failed - API key issue confirmed');
        console.log('\n🔧 NEXT STEPS:');
        console.log('1. Get a new API key from https://elevenlabs.io/app/settings/api-keys');
        console.log('2. Update your .env file with the new key');
        console.log('3. Make sure the key has TTS permissions');
        console.log('4. Check if your account has sufficient character quota');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Debug test failed:', error.message);
  }
}

runDebug();
