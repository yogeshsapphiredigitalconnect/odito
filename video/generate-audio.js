require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load scripts
const scripts = require('./scripts/audio-scripts.json');

// Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'rachel';
const OUTPUT_DIR = './public/audio';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created directory: ${OUTPUT_DIR}`);
}

// Generate audio for a single script
async function generateAudio(name, text) {
  try {
    console.log(`Generating audio for: ${name}`);
    
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: text,
        model_id: 'eleven_flash_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    const outputPath = path.join(OUTPUT_DIR, `${name}.mp3`);
    fs.writeFileSync(outputPath, response.data);
    
    console.log(`✅ Saved: ${outputPath}`);
    return outputPath;
    
  } catch (error) {
    let errorMessage = 'Unknown error';
    
    if (error.response) {
      if (error.response.data instanceof Buffer) {
        try {
          const errorText = error.response.data.toString('utf8');
          errorMessage = JSON.parse(errorText)?.detail?.message || errorText;
        } catch {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        }
      } else {
        errorMessage = error.response.data?.detail?.message || error.response.data?.message || `HTTP ${error.response.status}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error(`❌ Error generating ${name}:`, errorMessage);
    throw error;
  }
}

// Generate all audio files
async function generateAllAudio() {
  console.log('🎤 Starting ElevenLabs audio generation...\n');
  
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not found in .env file');
  }

  const results = [];
  
  for (const [name, text] of Object.entries(scripts)) {
    try {
      const outputPath = await generateAudio(name, text);
      results.push({ name, status: 'success', path: outputPath });
    } catch (error) {
      results.push({ name, status: 'error', error: error.message });
    }
  }
  
  console.log('\n📊 Generation Summary:');
  results.forEach(result => {
    if (result.status === 'success') {
      console.log(`✅ ${result.name}: ${result.path}`);
    } else {
      console.log(`❌ ${result.name}: ${result.error}`);
    }
  });
  
  const successCount = results.filter(r => r.status === 'success').length;
  console.log(`\n🎉 Completed: ${successCount}/${results.length} audio files generated`);
}

// Run if called directly
if (require.main === module) {
  generateAllAudio().catch(console.error);
}

module.exports = { generateAudio, generateAllAudio };
