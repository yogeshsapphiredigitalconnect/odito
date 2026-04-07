require('dotenv').config({ path: __dirname + '/.env' });

/**
 * WORKING AUDIO SERVICE WITH OPENAI FALLBACK
 * Uses ElevenLabs when available, falls back to OpenAI TTS
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getMediaUrls } = require('../config/env.js');

class WorkingAudioService {
  constructor() {
    this.ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    this.VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'rachel';
    
    // Paths
    this.OUTPUT_DIR = path.join(__dirname, '../../odito_backend/public/audio');
    this.CACHE_DIR = path.join(__dirname, '../cache/audio');
    
    // Ensure directories exist
    [this.OUTPUT_DIR, this.CACHE_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    console.log('[WORKING_AUDIO_SERVICE] Initialized');
    console.log(`[WORKING_AUDIO_SERVICE] ElevenLabs API: ${this.ELEVENLABS_API_KEY ? 'Present' : 'Missing'}`);
    console.log(`[WORKING_AUDIO_SERVICE] OpenAI API: ${this.OPENAI_API_KEY ? 'Present' : 'Missing'}`);
  }

  /**
   * Generate audio with smart provider selection
   */
  async generateAudioFromText(text, projectId) {
    console.log(`[WORKING_AUDIO_SERVICE] Starting audio generation for project: ${projectId}`);
    console.log(`[WORKING_AUDIO_SERVICE] Text length: ${text.length} characters`);
    
    try {
      // Check if audio already exists
      if (this.audioExists(projectId)) {
        console.log(`[WORKING_AUDIO_SERVICE] Using existing audio for project: ${projectId}`);
        return this.getAudioUrl(projectId);
      }
      
      // Validate that at least one API key is available
      if (!this.ELEVENLABS_API_KEY && !this.OPENAI_API_KEY) {
        throw new Error('❌ NO TTS API KEYS CONFIGURED. Please add ELEVENLABS_API_KEY or OPENAI_API_KEY to your .env file. Real voice narration requires a valid API key.');
      }
      
      // Clean text
      const cleanedText = this.cleanTextForTTS(text);
      if (!cleanedText || cleanedText.trim().length === 0) {
        throw new Error('No valid text provided for audio generation');
      }
      
      console.log(`[WORKING_AUDIO_SERVICE] Cleaned text length: ${cleanedText.length} characters`);
      
      let audioBuffer;
      let providerUsed = 'Unknown';
      
      // Try ElevenLabs first if available
      if (this.ELEVENLABS_API_KEY) {
        try {
          console.log(`[WORKING_AUDIO_SERVICE] 🎙️ Attempting ElevenLabs TTS...`);
          audioBuffer = await this.generateElevenLabsAudio(cleanedText);
          providerUsed = 'ElevenLabs';
        } catch (elevenLabsError) {
          console.error(`[WORKING_AUDIO_SERVICE] ❌ ElevenLabs failed: ${elevenLabsError.message}`);
          
          // If OpenAI is available, try it
          if (this.OPENAI_API_KEY) {
            console.log(`[WORKING_AUDIO_SERVICE] Switching to OpenAI TTS...`);
            try {
              audioBuffer = await this.generateOpenAIAudio(cleanedText);
              providerUsed = 'OpenAI';
            } catch (openAIError) {
              console.error(`[WORKING_AUDIO_SERVICE] ❌ OpenAI also failed: ${openAIError.message}`);
              throw new Error(`❌ All TTS providers failed. ElevenLabs: ${elevenLabsError.message}. OpenAI: ${openAIError.message}. Please check your API keys and permissions.`);
            }
          } else {
            throw new Error(`❌ ElevenLabs failed and no OpenAI fallback available: ${elevenLabsError.message}. Please add OPENAI_API_KEY to your .env file.`);
          }
        }
      } else if (this.OPENAI_API_KEY) {
        // Only OpenAI available
        console.log(`[WORKING_AUDIO_SERVICE] 🎙️ Using OpenAI TTS (ElevenLabs not configured)...`);
        audioBuffer = await this.generateOpenAIAudio(cleanedText);
        providerUsed = 'OpenAI';
      }
      
      // Save audio file
      const outputPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
      fs.writeFileSync(outputPath, audioBuffer);
      
      // Cache the audio
      this.cacheAudio(text, audioBuffer);
      
      console.log(`[WORKING_AUDIO_SERVICE] ✅ Real voice audio saved using ${providerUsed}: ${outputPath}`);
      console.log(`[WORKING_AUDIO_SERVICE] 📊 Provider used: ${providerUsed}, Size: ${audioBuffer.length} bytes`);
      
      return `${getMediaUrls().audio}/${projectId}.mp3`;
      
    } catch (error) {
      console.error(`[WORKING_AUDIO_SERVICE] ❌ Audio generation failed:`, error.message);
      throw new Error(`Real voice audio generation failed: ${error.message}`);
    }
  }

  /**
   * Generate ElevenLabs audio
   */
  async generateElevenLabsAudio(text) {
    console.log(`[WORKING_AUDIO_SERVICE] 🎙️ Calling ElevenLabs API with voice: ${this.VOICE_ID}`);

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.VOICE_ID}`,
        {
          text: text,
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
            'xi-api-key': this.ELEVENLABS_API_KEY
          },
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );

      const audioBuffer = Buffer.from(response.data);
      console.log(`[WORKING_AUDIO_SERVICE] ✅ ElevenLabs audio generated: ${audioBuffer.length} bytes`);
      return audioBuffer;
      
    } catch (error) {
      let errorMessage = 'ElevenLabs API call failed';
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          errorMessage = 'ElevenLabs authentication failed (401). Check your API key and permissions.';
        } else if (status === 404) {
          errorMessage = `ElevenLabs voice not found (404). Voice ID: ${this.VOICE_ID}`;
        } else if (status === 429) {
          errorMessage = 'ElevenLabs rate limit exceeded (429). Wait before trying again.';
        } else {
          errorMessage = `ElevenLabs API error (${status}): ${error.response.statusText}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Generate OpenAI TTS audio
   */
  async generateOpenAIAudio(text) {
    console.log(`[WORKING_AUDIO_SERVICE] 🤖 Calling OpenAI TTS API...`);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
          model: 'tts-1',
          input: text,
          voice: 'alloy', // OpenAI voice options: alloy, echo, fable, onyx, nova, shimmer
          response_format: 'mp3'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );

      const audioBuffer = Buffer.from(response.data);
      console.log(`[WORKING_AUDIO_SERVICE] ✅ OpenAI audio generated: ${audioBuffer.length} bytes`);
      return audioBuffer;
      
    } catch (error) {
      let errorMessage = 'OpenAI TTS API call failed';
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          errorMessage = 'OpenAI authentication failed (401). Check your API key.';
        } else if (status === 429) {
          errorMessage = 'OpenAI rate limit exceeded (429). Wait before trying again.';
        } else if (error.response.status === 400) {
          errorMessage = 'OpenAI bad request (400). Check your input text and parameters.';
        } else {
          errorMessage = `OpenAI API error (${status}): ${error.response.statusText}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Clean text for TTS
   */
  cleanTextForTTS(text) {
    if (!text) return '';
    
    return text
      .replace(/\s+/g, ' ')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/[^\w\s.,!?;:'"-]/g, '')
      .trim();
  }

  /**
   * Cache audio
   */
  cacheAudio(text, audioBuffer) {
    try {
      const crypto = require('crypto');
      const cacheKey = crypto.createHash('sha256').update(text).digest('hex');
      const cachePath = path.join(this.CACHE_DIR, `${cacheKey}.mp3`);
      fs.writeFileSync(cachePath, audioBuffer);
    } catch (error) {
      console.warn('[WORKING_AUDIO_SERVICE] Failed to cache audio:', error.message);
    }
  }

  /**
   * Check if audio exists
   */
  audioExists(projectId) {
    const audioPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
    return fs.existsSync(audioPath);
  }

  /**
   * Get audio URL
   */
  getAudioUrl(projectId) {
    if (this.audioExists(projectId)) {
      return `${getMediaUrls().audio}/${projectId}.mp3`;
    }
    return null;
  }
}

module.exports = WorkingAudioService;
