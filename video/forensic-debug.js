require('dotenv').config({ path: __dirname + '/.env' });

/**
 * 🔍 FORENSIC ELEVENLABS API DEBUGGER
 * Captures exact request/response to find 401 root cause
 */

const axios = require('axios');

class ForensicElevenLabsDebugger {
  constructor() {
    this.API_KEY = process.env.ELEVENLABS_API_KEY;
    this.VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'rachel';
    
    console.log('🔍 FORENSIC ELEVENLABS DEBUGGER');
    console.log('================================');
    console.log(`API Key: ${this.API_KEY ? this.API_KEY.substring(0, 8) + '...' : 'MISSING'}`);
    console.log(`Voice ID: ${this.VOICE_ID}`);
    console.log(`API Key Length: ${this.API_KEY?.length || 0}`);
  }

  async debugAPIRequest() {
    const testText = "Hello world, this is a test.";
    
    console.log('\n📡 CONSTRUCTING REQUEST...');
    
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.VOICE_ID}`;
    const headers = {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': this.API_KEY
    };
    const body = {
      text: testText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    };

    console.log('🔍 REQUEST DETAILS:');
    console.log(`URL: ${url}`);
    console.log('Headers:');
    Object.entries(headers).forEach(([key, value]) => {
      if (key === 'xi-api-key') {
        console.log(`  ${key}: ${value.substring(0, 8)}...`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
    console.log('Body:');
    console.log(`  text: "${body.text}"`);
    console.log(`  model_id: ${body.model_id}`);
    console.log(`  voice_settings: ${JSON.stringify(body.voice_settings)}`);
    console.log(`  Body size: ${JSON.stringify(body).length} bytes`);

    console.log('\n🚀 SENDING REQUEST...');
    
    try {
      // Create axios instance with detailed logging
      const axiosInstance = axios.create({
        timeout: 30000,
        responseType: 'arraybuffer'
      });

      // Add request interceptor for logging
      axiosInstance.interceptors.request.use(
        (config) => {
          console.log('📤 ACTUAL REQUEST SENT:');
          console.log(`  Method: ${config.method?.toUpperCase()}`);
          console.log(`  URL: ${config.url}`);
          console.log(`  Headers:`, JSON.stringify(config.headers, null, 2));
          console.log(`  Data:`, JSON.stringify(config.data, null, 2));
          return config;
        },
        (error) => {
          console.error('❌ Request interceptor error:', error);
          return Promise.reject(error);
        }
      );

      // Add response interceptor for logging
      axiosInstance.interceptors.response.use(
        (response) => {
          console.log('📥 ACTUAL RESPONSE RECEIVED:');
          console.log(`  Status: ${response.status}`);
          console.log(`  Status Text: ${response.statusText}`);
          console.log(`  Headers:`, JSON.stringify(response.headers, null, 2));
          console.log(`  Data Type: ${typeof response.data}`);
          console.log(`  Data Length: ${response.data?.length || 0} bytes`);
          
          if (response.data instanceof Buffer) {
            console.log(`  Buffer Type: MP3 audio (${response.data.length} bytes)`);
          }
          
          return response;
        },
        (error) => {
          console.error('❌ Response interceptor error:');
          console.log(`  Status: ${error.response?.status}`);
          console.log(`  Status Text: ${error.response?.statusText}`);
          console.log(`  Headers:`, JSON.stringify(error.response?.headers, null, 2));
          
          if (error.response?.data) {
            try {
              // Try to parse error data as JSON
              const errorData = JSON.parse(error.response.data.toString());
              console.log(`  Error Data:`, JSON.stringify(errorData, null, 2));
            } catch (e) {
              // If not JSON, show as buffer info
              console.log(`  Error Data Type: ${typeof error.response.data}`);
              console.log(`  Error Data Length: ${error.response.data?.length || 0} bytes`);
              console.log(`  Error Data Preview:`, error.response.data.toString().substring(0, 200));
            }
          }
          
          return Promise.reject(error);
        }
      );

      const response = await axiosInstance.post(url, body, {
        headers: headers
      });

      console.log('\n✅ REQUEST SUCCESSFUL!');
      console.log(`Audio buffer size: ${response.data.length} bytes`);
      
      // Save test audio
      const fs = require('fs');
      const testPath = './forensic-test-audio.mp3';
      fs.writeFileSync(testPath, response.data);
      console.log(`Test audio saved: ${testPath}`);
      
      return true;

    } catch (error) {
      console.error('\n❌ REQUEST FAILED!');
      console.error('Error object:', error);
      
      if (error.response) {
        console.error('\n🔍 DETAILED ERROR ANALYSIS:');
        console.error(`Status: ${error.response.status}`);
        console.error(`Status Text: ${error.response.statusText}`);
        
        // Parse error response body
        if (error.response.data) {
          try {
            const errorText = error.response.data.toString();
            console.error(`Response Body: ${errorText}`);
            
            // Try to parse as JSON
            try {
              const errorJson = JSON.parse(errorText);
              console.error(`Parsed Error:`, JSON.stringify(errorJson, null, 2));
              
              // Analyze specific ElevenLabs error patterns
              if (errorJson.detail?.status === 'invalid_api_key') {
                console.error('\n🎯 ROOT CAUSE FOUND: Invalid API Key');
                console.error('The API key format is correct but the key itself is invalid or expired.');
              } else if (errorJson.detail?.status === 'missing_permissions') {
                console.error('\n🎯 ROOT CAUSE FOUND: Missing Permissions');
                console.error('API key lacks required permissions for Text-to-Speech.');
              } else if (errorJson.detail?.status === 'quota_exceeded') {
                console.error('\n🎯 ROOT CAUSE FOUND: Quota Exceeded');
                console.error('Account has exceeded character quota or usage limits.');
              }
            } catch (jsonError) {
              console.error('Could not parse error as JSON');
            }
          } catch (bufferError) {
            console.error('Could not convert response to string');
          }
        }
        
        // Analyze headers for clues
        if (error.response.headers) {
          console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
        }
      }
      
      if (error.code) {
        console.error(`Network Error Code: ${error.code}`);
      }
      
      return false;
    }
  }

  async testAPIKeyFormat() {
    console.log('\n🔑 TESTING API KEY FORMAT...');
    
    if (!this.API_KEY) {
      console.error('❌ API Key is missing');
      return false;
    }
    
    if (!this.API_KEY.startsWith('sk_')) {
      console.error('❌ API Key should start with "sk_"');
      return false;
    }
    
    if (this.API_KEY.length < 20) {
      console.error('❌ API Key too short (should be 40+ characters)');
      return false;
    }
    
    // Test with a simple GET request to user endpoint
    console.log('Testing API key with user endpoint...');
    try {
      const response = await axios.get('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': this.API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ API Key is valid for user endpoint');
      console.log(`User: ${response.data.name || 'Unknown'}`);
      console.log(`Subscription: ${response.data.subscription?.tier || 'Unknown'}`);
      return true;
      
    } catch (error) {
      console.error('❌ API Key failed user endpoint test:');
      if (error.response?.status === 401) {
        console.error('API Key is invalid or expired');
      } else if (error.response?.status === 403) {
        console.error('API Key lacks user_read permission');
      }
      return false;
    }
  }
}

// Run forensic analysis
async function runForensicAnalysis() {
  const forensicDebugger = new ForensicElevenLabsDebugger();
  
  console.log('\n' + '='.repeat(60));
  console.log('STEP 1: API Key Format Validation');
  console.log('='.repeat(60));
  
  const keyValid = await forensicDebugger.testAPIKeyFormat();
  
  console.log('\n' + '='.repeat(60));
  console.log('STEP 2: Full API Request Analysis');
  console.log('='.repeat(60));
  
  const requestSuccess = await forensicDebugger.debugAPIRequest();
  
  console.log('\n' + '='.repeat(60));
  console.log('FORENSIC ANALYSIS SUMMARY');
  console.log('='.repeat(60));
  
  if (keyValid && requestSuccess) {
    console.log('✅ API integration is working correctly');
  } else {
    console.log('❌ Issues found:');
    if (!keyValid) console.log('- API Key format/validation failed');
    if (!requestSuccess) console.log('- API request failed');
    
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('1. Get a fresh API key from ElevenLabs dashboard');
    console.log('2. Ensure key has Text-to-Speech permissions');
    console.log('3. Check account quota and subscription status');
    console.log('4. Verify voice ID is accessible (try "rachel")');
  }
}

runForensicAnalysis().catch(console.error);
