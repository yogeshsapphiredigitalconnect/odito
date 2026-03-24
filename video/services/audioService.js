require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

/**
 * Enhanced Audio Service with Retry Logic, Fallbacks, and Caching
 * Handles programmatic audio generation from script text with resilience
 */

class AudioService {
  constructor() {
    this.ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    this.VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'rachel';
    
    // Update paths to use backend's public directory
    this.OUTPUT_DIR = path.join(__dirname, '../../odito_backend/public/audio');
    this.CACHE_DIR = path.join(__dirname, '../cache/audio');
    
    // Ensure directories exist
    [this.OUTPUT_DIR, this.CACHE_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`[AUDIO_SERVICE] Created directory: ${dir}`);
      }
    });

    // Configuration
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY_BASE = 1000; // 1 second base delay
    this.RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
    this.FALLBACK_ENABLED = true;
    
    // Rate limiting
    this.lastRequestTime = 0;
  }

  /**
   * Generate audio from text with retry logic and fallbacks
   * @param {string} text - Script text to convert to audio
   * @param {string} projectId - Project ID for filename
   * @returns {Promise<string>} Path to generated audio file
   */
  async generateAudioFromText(text, projectId) {
    console.log(`[AUDIO_SERVICE] Starting audio generation for project: ${projectId}`);
    console.log(`[AUDIO_SERVICE] Text length: ${text.length} characters`);
    
    try {
      // Check cache first
      const cachedAudio = this.getCachedAudio(text);
      if (cachedAudio) {
        console.log(`[AUDIO_SERVICE] ✅ Using cached audio for project: ${projectId}`);
        return this.copyCachedAudio(cachedAudio, projectId);
      }

      // Clean and prepare text for TTS
      const cleanedText = this.cleanTextForTTS(text);
      
      if (!cleanedText || cleanedText.trim().length === 0) {
        throw new Error('Script text is empty after cleaning');
      }

      // Apply rate limiting
      await this.applyRateLimit();

      // Try primary provider (ElevenLabs) with retries
      let audioBuffer = null;
      let providerUsed = 'none';
      
      try {
        audioBuffer = await this.generateWithRetry(
          () => this.generateElevenLabsAudio(cleanedText),
          'ElevenLabs'
        );
        providerUsed = 'ElevenLabs';
      } catch (elevenLabsError) {
        console.warn(`[AUDIO_SERVICE] ElevenLabs failed: ${elevenLabsError.message}`);
        
        if (this.FALLBACK_ENABLED && this.OPENAI_API_KEY) {
          try {
            console.log(`[AUDIO_SERVICE] Switching to fallback provider: OpenAI`);
            audioBuffer = await this.generateWithRetry(
              () => this.generateOpenAIAudio(cleanedText),
              'OpenAI'
            );
            providerUsed = 'OpenAI';
          } catch (openAIError) {
            console.error(`[AUDIO_SERVICE] OpenAI fallback also failed: ${openAIError.message}`);
            throw new Error(`All TTS providers failed. ElevenLabs: ${elevenLabsError.message}, OpenAI: ${openAIError.message}`);
          }
        } else {
          throw elevenLabsError;
        }
      }

      // Save audio file to backend's public directory
      const outputPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
      fs.writeFileSync(outputPath, audioBuffer);
      
      // Cache the generated audio
      this.cacheAudio(text, audioBuffer);
      
      console.log(`[AUDIO_SERVICE] ✅ Audio saved using ${providerUsed}: ${outputPath}`);
      console.log(`[AUDIO_SERVICE] 📊 Provider used: ${providerUsed}, Size: ${audioBuffer.length} bytes`);
      
      // Return HTTP URL for backend access
      return `http://localhost:5000/audio/${projectId}.mp3`;
      
    } catch (error) {
      console.error(`[AUDIO_SERVICE] ❌ Audio generation failed for ${projectId}:`, error.message);
      throw new Error(`Audio generation failed: ${error.message}`);
    }
  }

  /**
   * Generate audio with exponential backoff retry logic
   * @param {Function} generator - Audio generation function
   * @param {string} providerName - Name of the provider for logging
   * @returns {Promise<Buffer>} Audio buffer
   */
  async generateWithRetry(generator, providerName) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`[AUDIO_SERVICE] ${providerName} attempt ${attempt}/${this.MAX_RETRIES}`);
        
        const result = await generator();
        
        if (attempt > 1) {
          console.log(`[AUDIO_SERVICE] ✅ ${providerName} succeeded on attempt ${attempt}`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        console.warn(`[AUDIO_SERVICE] ${providerName} attempt ${attempt} failed:`, error.message);
        
        // Check if we should retry
        if (!this.shouldRetry(error) || attempt === this.MAX_RETRIES) {
          break;
        }
        
        // Calculate exponential backoff delay
        const delay = this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
        console.log(`[AUDIO_SERVICE] Retrying ${providerName} in ${delay}ms...`);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Generate audio using ElevenLabs API
   * @param {string} text - Text to convert
   * @returns {Promise<Buffer>} Audio buffer
   */
  async generateElevenLabsAudio(text) {
    if (!this.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${this.VOICE_ID}`,
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
          'xi-api-key': this.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      }
    );

    return Buffer.from(response.data);
  }

  /**
   * Generate audio using OpenAI TTS API
   * @param {string} text - Text to convert
   * @returns {Promise<Buffer>} Audio buffer
   */
  async generateOpenAIAudio(text) {
    if (!this.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        input: text,
        voice: 'alloy',
        response_format: 'mp3'
      },
      {
        headers: {
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      }
    );

    return Buffer.from(response.data);
  }

  /**
   * Check if an error should trigger a retry
   * @param {Error} error - The error to check
   * @returns {boolean} True if should retry
   */
  shouldRetry(error) {
    // Don't retry on authentication errors
    if (error.message?.includes('401') || error.message?.includes('authentication')) {
      return false;
    }
    
    // Don't retry on invalid request errors
    if (error.message?.includes('400') || error.message?.includes('bad request')) {
      return false;
    }
    
    // Retry on rate limiting, server errors, and network issues
    if (error.message?.includes('429') || // Rate limit
        error.message?.includes('500') || // Server error
        error.message?.includes('502') || // Bad gateway
        error.message?.includes('503') || // Service unavailable
        error.message?.includes('timeout') ||
        error.message?.includes('network') ||
        error.message?.includes('ECONNRESET')) {
      return true;
    }
    
    // Default to retry for unknown errors
    return true;
  }

  /**
   * Apply rate limiting between requests
   */
  async applyRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      console.log(`[AUDIO_SERVICE] Rate limiting: waiting ${waitTime}ms`);
      await this.sleep(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Generate cache key from text
   * @param {string} text - Text to hash
   * @returns {string} Cache key
   */
  getCacheKey(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Get cached audio if exists
   * @param {string} text - Original text
   * @returns {string|null} Cache file path or null
   */
  getCachedAudio(text) {
    const cacheKey = this.getCacheKey(text);
    const cachePath = path.join(this.CACHE_DIR, `${cacheKey}.mp3`);
    
    if (fs.existsSync(cachePath)) {
      return cachePath;
    }
    
    return null;
  }

  /**
   * Cache audio data
   * @param {string} text - Original text
   * @param {Buffer} audioBuffer - Audio data to cache
   */
  cacheAudio(text, audioBuffer) {
    try {
      const cacheKey = this.getCacheKey(text);
      const cachePath = path.join(this.CACHE_DIR, `${cacheKey}.mp3`);
      fs.writeFileSync(cachePath, audioBuffer);
      console.log(`[AUDIO_SERVICE] Cached audio: ${cacheKey}`);
    } catch (error) {
      console.warn(`[AUDIO_SERVICE] Failed to cache audio:`, error.message);
    }
  }

  /**
   * Copy cached audio to project output
   * @param {string} cachePath - Path to cached file
   * @param {string} projectId - Project ID
   * @returns {string} Output path
   */
  copyCachedAudio(cachePath, projectId) {
    const outputPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
    fs.copyFileSync(cachePath, outputPath);
    // Return HTTP URL for backend access
    return `http://localhost:5000/audio/${projectId}.mp3`;
  }

  /**
   * Clean text for TTS processing
   * @param {string} text - Raw script text
   * @returns {string} Cleaned text
   */
  cleanTextForTTS(text) {
    if (!text) return '';
    
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Code
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove special characters that might cause issues
      .replace(/[^\w\s.,!?;:'"-]/g, '')
      // Trim whitespace
      .trim();
  }

  /**
   * Sleep utility for delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if audio file already exists for a project
   * @param {string} projectId - Project ID
   * @returns {boolean} True if file exists
   */
  audioExists(projectId) {
    const audioPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
    return fs.existsSync(audioPath);
  }

  /**
   * Get audio URL for a project
   * @param {string} projectId - Project ID
   * @returns {string|null} Audio URL or null if not found
   */
  getAudioUrl(projectId) {
    if (this.audioExists(projectId)) {
      return `http://localhost:5000/audio/${projectId}.mp3`;
    }
    return null;
  }

  /**
   * Delete audio file for a project
   * @param {string} projectId - Project ID
   * @returns {boolean} True if deleted successfully
   */
  deleteAudio(projectId) {
    try {
      const audioPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
        console.log(`[AUDIO_SERVICE] Deleted audio: ${audioPath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[AUDIO_SERVICE] Error deleting audio for ${projectId}:`, error);
      return false;
    }
  }

  /**
   * Clear audio cache (utility function)
   */
  clearCache() {
    try {
      const files = fs.readdirSync(this.CACHE_DIR);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.CACHE_DIR, file));
      });
      console.log(`[AUDIO_SERVICE] Cleared ${files.length} cached audio files`);
    } catch (error) {
      console.error(`[AUDIO_SERVICE] Error clearing cache:`, error);
    }
  }
}

module.exports = AudioService;
