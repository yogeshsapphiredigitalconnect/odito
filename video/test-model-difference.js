require('dotenv').config();
const axios = require('axios');

console.log('🔍 MODEL DIFFERENCE ANALYSIS');
console.log('='.repeat(40));

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID; // pNInz6obpgDQGcFmaJgB

console.log(`API Key: ${apiKey?.substring(0, 8)}...`);
console.log(`Voice ID: ${voiceId}`);

async function testModel(modelId, description) {
  console.log(`\n🎙️ Testing: ${description} (model: ${modelId})`);
  
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: "Testing model difference",
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
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
        console.log(`   ← THIS IS THE 401 ERROR!`);
      }
      // Try to parse the error response
      try {
        const errorText = Buffer.from(error.response.data).toString('utf8');
        const errorObj = JSON.parse(errorText);
        console.log(`   Detail: ${errorObj.detail?.message || JSON.stringify(errorObj.detail)}`);
      } catch (e) {
        console.log(`   Raw error: ${error.response.data?.toString?.() || 'Unable to parse'}`);
      }
    }
    return false;
  }
}

async function runTest() {
  console.log('\n🧪 MODEL COMPARISON:');
  
  // Test the model from working script
  const workingResult = await testModel('eleven_flash_v2', 'Working Script Model');
  
  // Test the model from failing service
  const failingResult = await testModel('eleven_multilingual_v2', 'Failing Service Model');
  
  console.log('\n🎯 ANALYSIS:');
  if (workingResult && !failingResult) {
    console.log('❌ MODEL PERMISSION ISSUE:');
    console.log('   eleven_flash_v2 works but eleven_multilingual_v2 fails with 401');
    console.log('   This suggests your API key lacks permissions for multilingual model');
  } else if (!workingResult && failingResult) {
    console.log('❌ REVERSE MODEL ISSUE:');
    console.log('   eleven_multilingual_v2 works but eleven_flash_v2 fails');
  } else if (workingResult && failingResult) {
    console.log('✅ Both models work - issue is elsewhere');
  } else {
    console.log('❌ Both models fail - API key issue');
  }
}

runTest().catch(console.error);
