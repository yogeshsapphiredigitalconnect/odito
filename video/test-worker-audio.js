require('dotenv').config();
const AudioService = require('./services/audioService');

console.log('🔍 WORKER AUDIO SERVICE TEST');
console.log('='.repeat(40));

const audioService = new AudioService();

async function testWorkerAudioService() {
  const testText = "This is a test of the worker audio service to identify the exact cause of the 401 error.";
  
  console.log(`Text: "${testText}"`);
  console.log(`Length: ${testText.length} characters`);
  console.log(`API Key: ${audioService.ELEVENLABS_API_KEY?.substring(0, 8)}...`);
  console.log(`Voice ID: ${audioService.VOICE_ID}`);
  
  try {
    console.log('\n🎙️ Calling audioService.generateAudioFromText()...');
    const result = await audioService.generateAudioFromText(testText, 'debug-test');
    console.log(`✅ SUCCESS: ${result}`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    console.log(`Full error:`, error);
    return false;
  }
}

testWorkerAudioService().catch(console.error);
