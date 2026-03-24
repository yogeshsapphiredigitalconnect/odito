require('dotenv').config();
const axios = require('axios');

console.log('🔍 ROOT CAUSE ANALYSIS: Voice ID Difference');
console.log('='.repeat(50));

const apiKey = process.env.ELEVENLABS_API_KEY;
const envVoiceId = process.env.ELEVENLABS_VOICE_ID; // This is pNInz6obpgDQGcFmaJgB
const fallbackVoiceId = 'rachel'; // This is what the working script uses

console.log(`API Key: ${apiKey?.substring(0, 8)}...`);
console.log(`Voice ID from .env: ${envVoiceId}`);
console.log(`Fallback voice ID: ${fallbackVoiceId}`);

async function testVoiceId(voiceId, description) {
  console.log(`\n🎙️ Testing: ${description} (voice: ${voiceId})`);
  
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: "Testing voice ID",
        model_id: 'eleven_flash_v2' // Use same model as working script
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
    console.log(`✅ SUCCESS: ${audioBuffer.length} bytes generated`);
    return true;
    
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      if (error.response.status === 401) {
        console.log(`   This is the 401 authentication error!`);
      } else if (error.response.status === 404) {
        console.log(`   Voice not found or inaccessible`);
      }
    }
    return false;
  }
}

async function runTest() {
  console.log('\n🧪 COMPARISON TEST:');
  
  // Test the voice ID from .env (what worker uses)
  const envResult = await testVoiceId(envVoiceId, "Worker (from .env)");
  
  // Test the fallback voice ID (what working script uses)
  const fallbackResult = await testVoiceId(fallbackVoiceId, "Working Script (fallback)");
  
  console.log('\n🎯 ROOT CAUSE IDENTIFIED:');
  if (!envResult && fallbackResult) {
    console.log('❌ CUSTOM VOICE ID ISSUE:');
    console.log(`   The voice ID "${envVoiceId}" from .env is not accessible`);
    console.log(`   But the fallback voice "rachel" works perfectly`);
    console.log('\n💡 SOLUTION:');
    console.log('   Option 1: Use fallback voice "rachel"');
    console.log('   Option 2: Get a voice ID that your API key can access');
  } else if (envResult && fallbackResult) {
    console.log('✅ Both voices work - issue is elsewhere');
  } else if (!envResult && !fallbackResult) {
    console.log('❌ Both voices fail - API key issue');
  }
}

runTest().catch(console.error);
