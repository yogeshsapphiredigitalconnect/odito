require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Audio Service for Video Generation
 * Handles programmatic audio generation from script text
 */

class AudioService {
  constructor() {
    this.ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    this.VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'rachel';
    this.OUTPUT_DIR = path.join(__dirname, '../public/audio');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.OUTPUT_DIR)) {
      fs.mkdirSync(this.OUTPUT_DIR, { recursive: true });
      console.log(`[AUDIO_SERVICE] Created directory: ${this.OUTPUT_DIR}`);
    }
  }

  /**
   * Generate audio from text using ElevenLabs API
   * @param {string} text - Script text to convert to audio
   * @param {string} projectId - Project ID for filename
   * @returns {Promise<string>} Path to generated audio file
   */
  async generateAudioFromText(text, projectId) {
    try {
      console.log(`[AUDIO_SERVICE] Generating audio for project: ${projectId}`);
      
      if (!this.ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY not found in environment variables');
      }

      if (!text || text.trim().length === 0) {
        throw new Error('Script text is empty');
      }

      // Clean and prepare text for TTS
      const cleanedText = this.cleanTextForTTS(text);
      console.log(`[AUDIO_SERVICE] Text length: ${cleanedText.length} characters`);

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.VOICE_ID}`,
        {
          text: cleanedText,
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
          responseType: 'arraybuffer'
        }
      );

      const outputPath = path.join(this.OUTPUT_DIR, `${projectId}.mp3`);
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`[AUDIO_SERVICE] ✅ Audio saved: ${outputPath}`);
      return `/audio/${projectId}.mp3`; // Return relative path for web access
      
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
      
      console.error(`[AUDIO_SERVICE] ❌ Error generating audio for ${projectId}:`, errorMessage);
      throw new Error(`Audio generation failed: ${errorMessage}`);
    }
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
}

module.exports = AudioService;
