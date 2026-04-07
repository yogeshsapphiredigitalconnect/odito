require('dotenv').config({ path: __dirname + '/.env' });

/**
 * SMART AUDIO SERVICE WITH OPENAI FALLBACK
 * Uses ElevenLabs when available, falls back to OpenAI TTS
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getMediaUrls } = require('../config/env.js');

class SmartAudioService {
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
    
    // Configuration
    this.MAX_RETRIES = 2;
    this.RETRY_DELAY_BASE = 1000;
    this.RATE_LIMIT_DELAY = 2000;
    this.FALLBACK_ENABLED = false; // No silent audio
    
    // Cache for available voices
    this.availableVoices = null;
    this.lastVoiceCheck = 0;
    this.VOICE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    
    console.log('[SMART_AUDIO_SERVICE] Initialized');
    console.log(`[SMART_AUDIO_SERVICE] API Key: ${this.ELEVENLABS_API_KEY ? 'Present' : 'Missing'}`);
  }

  /**
   * Get available voices with caching
   */
  async getAvailableVoices() {
    const now = Date.now();
    
    // Return cached voices if still valid
    if (this.availableVoices && (now - this.lastVoiceCheck) < this.VOICE_CACHE_TTL) {
      return this.availableVoices;
    }
    
    if (!this.ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key required');
    }
    
    try {
      console.log('[SMART_AUDIO_SERVICE] Fetching available voices...');
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': this.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      this.availableVoices = response.data.voices || [];
      this.lastVoiceCheck = now;
      
      console.log(`[SMART_AUDIO_SERVICE] Found ${this.availableVoices.length} available voices`);
      
      // Log some popular voice options
      const popularVoices = this.availableVoices
        .filter(v => v.voice_id.includes('rachel') || v.voice_id.includes('adam') || v.voice_id.includes('bella') || v.voice_id.includes('domi'))
        .slice(0, 5);
      
      if (popularVoices.length > 0) {
        console.log('[SMART_AUDIO_SERVICE] Popular voices available:');
        popularVoices.forEach(v => {
          console.log(`   - ${v.voice_id}: ${v.name} (${v.gender || 'unknown'})`);
        });
      }
      
      return this.availableVoices;
      
    } catch (error) {
      console.error('[SMART_AUDIO_SERVICE] Failed to fetch voices:', error.message);
      // Return some common default voices as fallback
      return [
        { voice_id: 'rachel', name: 'Rachel', gender: 'female' },
        { voice_id: 'adam', name: 'Adam', gender: 'male' },
        { voice_id: 'bella', name: 'Bella', gender: 'female' },
        { voice_id: 'domi', name: 'Domi', gender: 'male' },
        { voice_id: 'elli', name: 'Elli', gender: 'female' }
      ];
    }
  }

  /**
   * Find the best available voice
   */
  async findBestVoice() {
    const voices = await this.getAvailableVoices();
    
    // Try the configured voice first
    const configuredVoice = voices.find(v => v.voice_id === this.VOICE_ID);
    if (configuredVoice) {
      console.log(`[SMART_AUDIO_SERVICE] Using configured voice: ${this.VOICE_ID}`);
      return this.VOICE_ID;
    }
    
    // Try popular female voices (better for narration)
    const preferredVoices = ['rachel', 'bella', 'elli', 'domi', 'adam'];
    for (const voiceId of preferredVoices) {
      const voice = voices.find(v => v.voice_id === voiceId);
      if (voice) {
        console.log(`[SMART_AUDIO_SERVICE] Using fallback voice: ${voiceId} (${voice.name})`);
        return voiceId;
      }
    }
    
    // Use the first available voice
    if (voices.length > 0) {
      const firstVoice = voices[0];
      console.log(`[SMART_AUDIO_SERVICE] Using first available voice: ${firstVoice.voice_id} (${firstVoice.name})`);
      return firstVoice.voice_id;
    }
    
    throw new Error('No voices available');
  }

  /**
   * Generate audio with smart voice selection
   */
  async generateAudioFromText(text, projectId) {
    console.log(`[SMART_AUDIO_SERVICE] Starting audio generation for project: ${projectId}`);
    console.log(`[SMART_AUDIO_SERVICE] Text length: ${text.length} characters`);
    
    try {
      // Check if audio already exists
      if (this.audioExists(projectId)) {
        console.log(`[SMART_AUDIO_SERVICE] Using existing audio for project: ${projectId}`);
        return this.getAudioUrl(projectId);
      }
      
      // Validate API key
      if (!this.ELEVENLABS_API_KEY) {
        throw new Error('❌ ELEVENLABS_API_KEY not configured. Real voice narration requires a valid API key.');
      }
      
      // Clean text
      const cleanedText = this.cleanTextForTTS(text);
      if (!cleanedText || cleanedText.trim().length === 0) {
        throw new Error('No valid text provided for audio generation');
      }
      
      console.log(`[SMART_AUDIO_SERVICE] Cleaned text length: ${cleanedText.length} characters`);
      
      // Find best available voice
      const bestVoiceId = await this.findBestVoice();
      
      // Generate audio
      console.log(`[SMART_AUDIO_SERVICE] 🎙️ Generating audio with voice: ${bestVoiceId}`);
      const audioBuffer = await this.generateElevenLabsAudio(cleanedText, bestVoiceId);
      
      // Save audio file
      const outputPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
      fs.writeFileSync(outputPath, audioBuffer);
      
      // Cache the audio
      this.cacheAudio(text, audioBuffer);
      
      console.log(`[SMART_AUDIO_SERVICE] ✅ Real voice audio saved: ${outputPath}`);
      console.log(`[SMART_AUDIO_SERVICE] 📊 Size: ${audioBuffer.length} bytes`);
      console.log(`[SMART_AUDIO_SERVICE] 🎵 Voice used: ${bestVoiceId}`);
      
      return `${getMediaUrls().audio}/${projectId}.mp3`;
      
    } catch (error) {
      console.error(`[SMART_AUDIO_SERVICE] ❌ Audio generation failed:`, error.message);
      throw new Error(`Real voice audio generation failed: ${error.message}`);
    }
  }

  /**
   * Generate ElevenLabs audio with specific voice
   */
  async generateElevenLabsAudio(text, voiceId) {
    console.log(`[SMART_AUDIO_SERVICE] 🎙️ Calling ElevenLabs API with voice: ${voiceId}`);
    console.log(`[SMART_AUDIO_SERVICE] 📝 Text preview: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
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
      console.log(`[SMART_AUDIO_SERVICE] ✅ ElevenLabs audio generated: ${audioBuffer.length} bytes`);
      return audioBuffer;
      
    } catch (error) {
      let errorMessage = 'ElevenLabs API call failed';
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          errorMessage = 'ElevenLabs authentication failed (401). Please check your API key permissions.';
        } else if (status === 404) {
          errorMessage = `ElevenLabs voice not found (404). Voice ID: ${voiceId}`;
        } else if (status === 429) {
          errorMessage = 'ElevenLabs rate limit exceeded (429). Please wait before trying again.';
        } else if (status === 400) {
          errorMessage = `ElevenLabs bad request (400). Check text length and parameters.`;
        } else {
          errorMessage = `ElevenLabs API error (${status}): ${error.response.statusText}`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'ElevenLabs request timeout (30s). Please try again.';
      } else {
        errorMessage = `ElevenLabs network error: ${error.message}`;
      }
      
      console.error(`[SMART_AUDIO_SERVICE] ❌ ${errorMessage}`);
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
      console.warn('[SMART_AUDIO_SERVICE] Failed to cache audio:', error.message);
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

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SmartAudioService;
