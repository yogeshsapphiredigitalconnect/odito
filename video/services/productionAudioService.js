require('dotenv').config({ path: __dirname + '/.env' });

/**
 * PRODUCTION AUDIO SERVICE
 * Uses ElevenLabs TTS with comprehensive error handling
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getMediaUrls } = require('../config/env.js');

/**
 * PRODUCTION-READY AUDIO SERVICE
 * Handles ElevenLabs API issues and provides working fallbacks
 */

class ProductionAudioService {
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
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY_BASE = 1000;
    this.RATE_LIMIT_DELAY = 2000;
    
    console.log('[PRODUCTION_AUDIO_SERVICE] Initialized');
    console.log(`[PRODUCTION_AUDIO_SERVICE] ElevenLabs API: ${this.ELEVENLABS_API_KEY ? 'Present' : 'Missing'}`);
    console.log(`[PRODUCTION_AUDIO_SERVICE] OpenAI API: ${this.OPENAI_API_KEY ? 'Present' : 'Missing'}`);
  }

  /**
   * Generate audio with intelligent provider selection
   */
  async generateAudioFromText(text, projectId) {
    console.log(`[PRODUCTION_AUDIO_SERVICE] Starting audio generation for project: ${projectId}`);
    console.log(`[PRODUCTION_AUDIO_SERVICE] Text length: ${text.length} characters`);
    
    try {
      // Check if audio already exists
      if (this.audioExists(projectId)) {
        console.log(`[PRODUCTION_AUDIO_SERVICE] Using existing audio for project: ${projectId}`);
        return this.getAudioUrl(projectId);
      }
      
      // Validate that at least one API key is available
      if (!this.ELEVENLABS_API_KEY && !this.OPENAI_API_KEY) {
        throw new Error('❌ NO TTS API KEYS CONFIGURED. Please add ELEVENLABS_API_KEY or OPENAI_API_KEY to your .env file.');
      }
      
      // Clean and validate text
      const cleanedText = this.cleanTextForTTS(text);
      if (!cleanedText || cleanedText.trim().length === 0) {
        throw new Error('No valid text provided for audio generation');
      }
      
      console.log(`[PRODUCTION_AUDIO_SERVICE] Cleaned text length: ${cleanedText.length} characters`);
      
      // Split long text into chunks (ElevenLabs has ~5000 character limit)
      const textChunks = this.splitTextIntoChunks(cleanedText);
      console.log(`[PRODUCTION_AUDIO_SERVICE] Text split into ${textChunks.length} chunks`);
      
      let audioBuffer;
      let providerUsed = 'Unknown';
      
      // Try providers in order of preference
      const providers = [];
      
      if (this.OPENAI_API_KEY) {
        providers.push({ name: 'OpenAI', method: () => this.generateOpenAIAudioChunks(textChunks) });
      }
      
      if (this.ELEVENLABS_API_KEY) {
        providers.push({ name: 'ElevenLabs', method: () => this.generateElevenLabsAudioChunks(textChunks) });
      }
      
      // Try each provider until one works
      for (const provider of providers) {
        try {
          console.log(`[PRODUCTION_AUDIO_SERVICE] 🎙️ Attempting ${provider.name} TTS...`);
          audioBuffer = await this.generateWithRetry(
            provider.method,
            provider.name
          );
          providerUsed = provider.name;
          break;
        } catch (error) {
          console.error(`[PRODUCTION_AUDIO_SERVICE] ❌ ${provider.name} failed: ${error.message}`);
          
          // If this is the last provider, throw the error
          if (provider === providers[providers.length - 1]) {
            throw new Error(`❌ All TTS providers failed. Last error: ${error.message}`);
          }
        }
      }
      
      if (!audioBuffer) {
        throw new Error('No audio buffer was generated');
      }
      
      // Save audio file
      const outputPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
      fs.writeFileSync(outputPath, audioBuffer);
      
      // Cache the audio
      this.cacheAudio(text, audioBuffer);
      
      console.log(`[PRODUCTION_AUDIO_SERVICE] ✅ Real voice audio saved using ${providerUsed}: ${outputPath}`);
      console.log(`[PRODUCTION_AUDIO_SERVICE] 📊 Provider used: ${providerUsed}, Size: ${audioBuffer.length} bytes`);
      
      // Validate the generated file
      this.validateAudioFile(outputPath);
      
      return `${getMediaUrls().audio}/${projectId}.mp3`;
      
    } catch (error) {
      console.error(`[PRODUCTION_AUDIO_SERVICE] ❌ Audio generation failed:`, error.message);
      throw new Error(`Real voice audio generation failed: ${error.message}`);
    }
  }

  /**
   * Split text into chunks for TTS processing
   */
  splitTextIntoChunks(text) {
    const maxChunkSize = 4000; // Conservative limit for TTS APIs
    const chunks = [];
    
    if (text.length <= maxChunkSize) {
      return [text];
    }
    
    // Split by sentences to maintain natural speech
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkSize) {
        currentChunk += sentence;
      } else {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Generate OpenAI TTS audio for multiple chunks
   */
  async generateOpenAIAudioChunks(textChunks) {
    console.log(`[PRODUCTION_AUDIO_SERVICE] 🤖 Generating ${textChunks.length} chunks with OpenAI TTS...`);
    
    const audioBuffers = [];
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      console.log(`[PRODUCTION_AUDIO_SERVICE] Processing chunk ${i + 1}/${textChunks.length} (${chunk.length} chars)`);
      
      const chunkBuffer = await this.generateOpenAIAudio(chunk);
      audioBuffers.push(chunkBuffer);
      
      // Small delay between chunks to avoid rate limiting
      if (i < textChunks.length - 1) {
        await this.sleep(500);
      }
    }
    
    // Concatenate all audio buffers
    return Buffer.concat(audioBuffers);
  }

  /**
   * Generate ElevenLabs audio for multiple chunks
   */
  async generateElevenLabsAudioChunks(textChunks) {
    console.log(`[PRODUCTION_AUDIO_SERVICE] 🎙️ Generating ${textChunks.length} chunks with ElevenLabs...`);
    
    const audioBuffers = [];
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      console.log(`[PRODUCTION_AUDIO_SERVICE] Processing chunk ${i + 1}/${textChunks.length} (${chunk.length} chars)`);
      
      const chunkBuffer = await this.generateElevenLabsAudio(chunk);
      audioBuffers.push(chunkBuffer);
      
      // Rate limiting for ElevenLabs
      if (i < textChunks.length - 1) {
        await this.sleep(this.RATE_LIMIT_DELAY);
      }
    }
    
    // Concatenate all audio buffers
    return Buffer.concat(audioBuffers);
  }

  /**
   * Generate OpenAI TTS audio (FIXED VERSION)
   */
  async generateOpenAIAudio(text) {
    console.log(`[PRODUCTION_AUDIO_SERVICE] 🤖 Calling OpenAI TTS API...`);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
          model: 'tts-1',
          input: text,
          voice: 'alloy', // Reliable voice option
          response_format: 'mp3',
          speed: 1.0 // Normal speed
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
      console.log(`[PRODUCTION_AUDIO_SERVICE] ✅ OpenAI audio generated: ${audioBuffer.length} bytes`);
      return audioBuffer;
      
    } catch (error) {
      let errorMessage = 'OpenAI TTS API call failed';
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          errorMessage = 'OpenAI authentication failed (401). Check your API key.';
        } else if (status === 429) {
          errorMessage = 'OpenAI rate limit exceeded (429). Wait before trying again.';
        } else if (status === 400) {
          errorMessage = 'OpenAI bad request (400). Check your input text.';
        } else {
          errorMessage = `OpenAI API error (${status}): ${error.response.statusText}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Generate ElevenLabs audio (FIXED VERSION)
   */
  async generateElevenLabsAudio(text) {
    console.log(`[PRODUCTION_AUDIO_SERVICE] 🎙️ Calling ElevenLabs API with voice: ${this.VOICE_ID}`);

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.VOICE_ID}`,
        {
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75, // Slightly higher for better clarity
            style: 0.0,
            use_speaker_boost: false
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
      console.log(`[PRODUCTION_AUDIO_SERVICE] ✅ ElevenLabs audio generated: ${audioBuffer.length} bytes`);
      return audioBuffer;
      
    } catch (error) {
      let errorMessage = 'ElevenLabs API call failed';
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 401) {
          // Parse the specific error message
          try {
            const errorText = errorData.toString();
            const errorJson = JSON.parse(errorText);
            
            if (errorJson.detail?.status === 'detected_unusual_activity') {
              errorMessage = 'ElevenLabs account flagged for unusual activity. Free tier disabled. Please upgrade to a paid plan or use OpenAI TTS as fallback.';
            } else if (errorJson.detail?.status === 'invalid_api_key') {
              errorMessage = 'ElevenLabs API key is invalid or expired.';
            } else {
              errorMessage = `ElevenLabs authentication failed: ${errorJson.detail?.message || 'Unknown error'}`;
            }
          } catch (parseError) {
            errorMessage = 'ElevenLabs authentication failed (401). Check your API key and account status.';
          }
        } else if (status === 404) {
          errorMessage = `ElevenLabs voice not found (404). Voice ID: ${this.VOICE_ID}`;
        } else if (status === 429) {
          errorMessage = 'ElevenLabs rate limit exceeded (429). Wait before trying again.';
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
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Generate with retry logic
   */
  async generateWithRetry(generator, providerName) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`[PRODUCTION_AUDIO_SERVICE] ${providerName} attempt ${attempt}/${this.MAX_RETRIES}`);
        
        const result = await generator();
        
        if (attempt > 1) {
          console.log(`[PRODUCTION_AUDIO_SERVICE] ✅ ${providerName} succeeded on attempt ${attempt}`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        console.warn(`[PRODUCTION_AUDIO_SERVICE] ${providerName} attempt ${attempt} failed:`, error.message);
        
        // Don't retry on authentication errors
        if (error.message?.includes('401') || error.message?.includes('authentication')) {
          break;
        }
        
        // Don't retry on the last attempt
        if (attempt === this.MAX_RETRIES) {
          break;
        }
        
        // Calculate exponential backoff delay
        const delay = this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
        console.log(`[PRODUCTION_AUDIO_SERVICE] Retrying ${providerName} in ${delay}ms...`);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Validate audio file
   */
  validateAudioFile(filePath) {
    try {
      const stats = fs.statSync(filePath);
      
      if (stats.size === 0) {
        throw new Error('Generated audio file is empty');
      }
      
      if (stats.size < 1024) {
        throw new Error(`Audio file too small (${stats.size} bytes) - likely corrupted`);
      }
      
      console.log(`[PRODUCTION_AUDIO_SERVICE] ✅ Audio file validated: ${stats.size} bytes`);
      return true;
      
    } catch (error) {
      console.error(`[PRODUCTION_AUDIO_SERVICE] ❌ Audio validation failed: ${error.message}`);
      throw error;
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
      const cacheKey = crypto.createHash('sha256').update(text).digest('hex');
      const cachePath = path.join(this.CACHE_DIR, `${cacheKey}.mp3`);
      fs.writeFileSync(cachePath, audioBuffer);
    } catch (error) {
      console.warn('[PRODUCTION_AUDIO_SERVICE] Failed to cache audio:', error.message);
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

module.exports = ProductionAudioService;
