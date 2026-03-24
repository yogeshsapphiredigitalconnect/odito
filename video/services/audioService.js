require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const { execSync } = require('child_process');

/**
 * Enhanced Audio Service with Retry Logic, Fallbacks, and Caching
 * Handles programmatic audio generation from script text with resilience
 */

class AudioService {
  constructor() {
    this.ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    this.VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'rachel';
    
    // CRITICAL: Validate API keys at initialization
    this.validateApiKeys();
    
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
    // CRITICAL: Disable silent audio fallback - we want real voice only
    this.FALLBACK_ENABLED = false;
    
    // Rate limiting
    this.lastRequestTime = 0;
  }

  /**
   * Validate API keys at initialization
   * @throws {Error} If no valid API keys are found
   */
  validateApiKeys() {
    if (!this.ELEVENLABS_API_KEY && !this.OPENAI_API_KEY) {
      throw new Error('❌ CRITICAL: No TTS API keys configured. Please set ELEVENLABS_API_KEY or OPENAI_API_KEY in your .env file. Real voice narration requires valid API keys.');
    }
    
    if (this.ELEVENLABS_API_KEY) {
      console.log(`[AUDIO_SERVICE] ✅ ElevenLabs API key loaded: ${this.ELEVENLABS_API_KEY.substring(0, 8)}...`);
    }
    
    if (this.OPENAI_API_KEY) {
      console.log(`[AUDIO_SERVICE] ✅ OpenAI API key loaded: ${this.OPENAI_API_KEY.substring(0, 8)}...`);
    }
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
      // Check if audio already exists
      if (this.audioExists(projectId)) {
        console.log(`[AUDIO_SERVICE] Using existing audio for project: ${projectId}`);
        return this.getAudioUrl(projectId);
      }
      
      // CRITICAL: Validate API keys configuration - NO SILENT AUDIO FALLBACK
      if (!this.ELEVENLABS_API_KEY && !this.OPENAI_API_KEY) {
        throw new Error('❌ CRITICAL: No TTS API keys configured. Please set ELEVENLABS_API_KEY or OPENAI_API_KEY in your .env file. Silent audio fallback is disabled to ensure real voice narration.');
      }
      
      // Additional validation for ElevenLabs
      if (this.ELEVENLABS_API_KEY) {
        console.log(`[AUDIO_SERVICE] ✅ ElevenLabs API key configured: ${this.ELEVENLABS_API_KEY.substring(0, 8)}...`);
      } else {
        console.log(`[AUDIO_SERVICE] ⚠️ ElevenLabs API key not configured`);
      }
      
      if (this.OPENAI_API_KEY) {
        console.log(`[AUDIO_SERVICE] ✅ OpenAI API key configured: ${this.OPENAI_API_KEY.substring(0, 8)}...`);
      } else {
        console.log(`[AUDIO_SERVICE] ⚠️ OpenAI API key not configured`);
      }
      
      // Clean and validate input text
      const cleanedText = this.cleanTextForTTS(text);
      if (!cleanedText || cleanedText.trim().length === 0) {
        throw new Error('No valid text provided for audio generation');
      }
      
      console.log(`[AUDIO_SERVICE] Cleaned text length: ${cleanedText.length} characters`);
      
      // Apply rate limiting
      await this.applyRateLimit();
      
      let audioBuffer;
      let providerUsed = 'Unknown';
      
      // Try ElevenLabs first
      try {
        console.log(`[AUDIO_SERVICE] 🎙️ Attempting ElevenLabs TTS with voice: ${this.VOICE_ID}...`);
        audioBuffer = await this.generateWithRetry(
          () => this.generateElevenLabsAudio(cleanedText),
          'ElevenLabs'
        );
        providerUsed = 'ElevenLabs';
      } catch (elevenLabsError) {
        console.error(`[AUDIO_SERVICE] ❌ ElevenLabs failed: ${elevenLabsError.message}`);
        
        // CRITICAL: Check if this is an authentication error
        if (elevenLabsError.message?.includes('401') || elevenLabsError.message?.includes('authentication')) {
          throw new Error(`❌ ElevenLabs authentication failed. Please check your API key: ${elevenLabsError.message}`);
        }
        
        if (this.FALLBACK_ENABLED && this.OPENAI_API_KEY) {
          try {
            console.log(`[AUDIO_SERVICE] Switching to fallback provider: OpenAI`);
            audioBuffer = await this.generateWithRetry(
              () => this.generateOpenAIAudio(cleanedText),
              'OpenAI'
            );
            providerUsed = 'OpenAI';
          } catch (openAIError) {
            console.error(`[AUDIO_SERVICE] ❌ OpenAI fallback also failed: ${openAIError.message}`);
            // CRITICAL: DO NOT fallback to silent audio - throw error instead
            throw new Error(`❌ All TTS providers failed. ElevenLabs: ${elevenLabsError.message}. OpenAI: ${openAIError.message}. Silent audio fallback is disabled.`);
          }
        } else {
          // CRITICAL: DO NOT fallback to silent audio - throw error instead
          const errorMsg = this.OPENAI_API_KEY 
            ? `❌ ElevenLabs failed and fallback is disabled: ${elevenLabsError.message}`
            : `❌ ElevenLabs failed and no OpenAI fallback available: ${elevenLabsError.message}. Silent audio fallback is disabled.`;
          throw new Error(errorMsg);
        }
      }

      // Save audio file to backend's public directory
      const outputPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
      fs.writeFileSync(outputPath, audioBuffer);
      
      // Cache the generated audio
      this.cacheAudio(text, audioBuffer);
      
      console.log(`[AUDIO_SERVICE] ✅ Real voice audio saved using ${providerUsed}: ${outputPath}`);
      console.log(`[AUDIO_SERVICE] 📊 Provider used: ${providerUsed}, Size: ${audioBuffer.length} bytes`);
      console.log(`[AUDIO_SERVICE] 🎵 Audio duration will be calculated based on text length and speech rate`);
      
      // Return PUBLIC URL for Remotion compatibility
      return `/audio/${projectId}.mp3`;
      
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

    console.log(`[AUDIO_SERVICE] 🎙️ Calling ElevenLabs API with voice: ${this.VOICE_ID}`);
    console.log(`[AUDIO_SERVICE] 📝 Text preview: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
    console.log(`[AUDIO_SERVICE] 🔑 API Key: ${this.ELEVENLABS_API_KEY.substring(0, 8)}...${this.ELEVENLABS_API_KEY.substring(-4)}`);
    console.log(`[AUDIO_SERVICE] 🎛️ Model: eleven_flash_v2`);
    console.log(`[AUDIO_SERVICE] 📏 Text length: ${text.length} characters`);

    try {
      const requestConfig = {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      };

      console.log(`[AUDIO_SERVICE] 📡 Request URL: https://api.elevenlabs.io/v1/text-to-speech/${this.VOICE_ID}`);
      console.log(`[AUDIO_SERVICE] 📋 Request headers:`, JSON.stringify(requestConfig.headers, null, 2));

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
        requestConfig
      );

      const audioBuffer = Buffer.from(response.data);
      console.log(`[AUDIO_SERVICE] ✅ ElevenLabs audio generated: ${audioBuffer.length} bytes`);
      return audioBuffer;
      
    } catch (error) {
      let errorMessage = 'ElevenLabs API call failed';
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.log(`[AUDIO_SERVICE] 🚨 API Error Details:`);
        console.log(`[AUDIO_SERVICE]    Status: ${status}`);
        console.log(`[AUDIO_SERVICE]    Headers:`, JSON.stringify(error.response.headers, null, 2));
        
        // Try to parse error response
        try {
          let errorText;
          if (errorData instanceof Buffer) {
            errorText = errorData.toString('utf8');
            const errorObj = JSON.parse(errorText);
            console.log(`[AUDIO_SERVICE]    Parsed Error:`, JSON.stringify(errorObj, null, 2));
            
            if (status === 401) {
              errorMessage = `ElevenLabs authentication failed (401). ${errorObj.detail?.message || 'Invalid API key or insufficient permissions.'}`;
              console.log(`[AUDIO_SERVICE] ❌ 401 AUTHENTICATION FAILURE:`);
              console.log(`[AUDIO_SERVICE]    API Key Used: ${this.ELEVENLABS_API_KEY.substring(0, 8)}...${this.ELEVENLABS_API_KEY.substring(-4)}`);
              console.log(`[AUDIO_SERVICE]    Voice ID: ${this.VOICE_ID}`);
              console.log(`[AUDIO_SERVICE]    Model: eleven_flash_v2`);
              console.log(`[AUDIO_SERVICE]    Error Message: ${errorObj.detail?.message || 'No details'}`);
            } else if (status === 429) {
              errorMessage = `ElevenLabs rate limit exceeded (429). ${errorObj.detail?.message || 'Please wait before trying again.'}`;
            } else if (status === 400) {
              errorMessage = `ElevenLabs bad request (400). ${errorObj.detail?.message || 'Invalid parameters'}`;
            } else {
              errorMessage = `ElevenLabs API error (${status}): ${errorObj.detail?.message || error.response.statusText}`;
            }
          } else {
            console.log(`[AUDIO_SERVICE]    Raw Error Data:`, errorData);
            errorMessage = `ElevenLabs API error (${status}): ${errorData?.detail || error.response.statusText}`;
          }
        } catch (parseError) {
          console.log(`[AUDIO_SERVICE]    Parse Error: ${parseError.message}`);
          errorMessage = `ElevenLabs API error (${status}): ${error.response.statusText}`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'ElevenLabs request timeout (30s). Please try again.';
      } else {
        errorMessage = `ElevenLabs network error: ${error.message}`;
      }
      
      console.error(`[AUDIO_SERVICE] ❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }
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
      return `/audio/${projectId}.mp3`;
    }
    return null;
  }

  /**
   * Validate audio file exists and is not empty/corrupted
   * @param {string} projectId - Project ID
   * @returns {boolean} True if audio file is valid
   */
  validateAudioFile(projectId) {
    const audioPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
    
    try {
      // Check if file exists
      if (!fs.existsSync(audioPath)) {
        console.warn(`[AUDIO_SERVICE] Audio file does not exist: ${audioPath}`);
        return false;
      }
      
      // Check file size
      const stats = fs.statSync(audioPath);
      if (stats.size === 0) {
        console.warn(`[AUDIO_SERVICE] Audio file is empty: ${audioPath}`);
        return false;
      }
      
      // Check minimum valid MP3 size (at least 1KB)
      if (stats.size < 1024) {
        console.warn(`[AUDIO_SERVICE] Audio file too small (${stats.size} bytes): ${audioPath}`);
        return false;
      }
      
      console.log(`[AUDIO_SERVICE] ✅ Audio file validated: ${audioPath} (${stats.size} bytes)`);
      return true;
      
    } catch (error) {
      console.error(`[AUDIO_SERVICE] Error validating audio file for ${projectId}:`, error.message);
      return false;
    }
  }

  /**
   * Ensure valid audio file exists, create if needed
   * @param {string} projectId - Project ID
   * @returns {Promise<string>} Audio URL
   */
  async ensureValidAudio(projectId) {
    console.log(`[AUDIO_SERVICE] Ensuring valid audio for project: ${projectId}`);
    
    // Check if existing audio is valid
    if (this.validateAudioFile(projectId)) {
      console.log(`[AUDIO_SERVICE] Using existing valid audio for project: ${projectId}`);
      return this.getAudioUrl(projectId);
    }
    
    // Delete corrupted file if it exists
    this.deleteAudio(projectId);
    
    // Create new silent audio
    console.log(`[AUDIO_SERVICE] Creating new valid silent audio for project: ${projectId}`);
    return this.createSilentAudio(projectId);
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
   * Create silent audio as fallback using FFmpeg
   * FIXED: Now creates 44 seconds of silence to match 11 slides × 4 seconds each
   * @param {string} projectId - Project ID
   * @returns {string} Path to silent audio file
   */
  createSilentAudio(projectId) {
    console.log(`[AUDIO_SERVICE] Creating valid silent audio for project: ${projectId}`);
    
    const outputPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
    
    try {
      // Delete existing corrupted file if it exists
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
        console.log(`[AUDIO_SERVICE] Deleted existing corrupted audio: ${outputPath}`);
      }
      
      // FIXED: Generate valid silent MP3 using FFmpeg (44 seconds of silence for 11 slides)
      const durationSeconds = 44; // 11 slides × 4 seconds each
      const ffmpegCommand = `ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t ${durationSeconds} -q:a 9 -acodec libmp3lame "${outputPath}" -y`;
      console.log(`[AUDIO_SERVICE] Running FFmpeg for ${durationSeconds} seconds: ${ffmpegCommand}`);
      
      execSync(ffmpegCommand, { stdio: 'inherit' });
      
      // Validate the generated file
      if (!fs.existsSync(outputPath)) {
        throw new Error('FFmpeg failed to create silent audio file');
      }
      
      const stats = fs.statSync(outputPath);
      if (stats.size === 0) {
        throw new Error('Generated silent audio file is empty');
      }
      
      console.log(`[AUDIO_SERVICE] ✅ Valid silent audio created: ${outputPath} (${stats.size} bytes, ${durationSeconds} seconds)`);
      
      // Return PUBLIC URL for Remotion compatibility
      return `/audio/${projectId}.mp3`;
      
    } catch (error) {
      console.error(`[AUDIO_SERVICE] ❌ Failed to create silent audio:`, error.message);
      throw new Error(`Silent audio generation failed: ${error.message}`);
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
