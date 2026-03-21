/**
 * Gemini AI Service
 * Handles integration with Google Gemini API for AI script generation
 */

import fetch from 'node-fetch';

export class GeminiService {
  
  /**
   * Generate video script using Gemini API
   * @param {string} prompt - AI prompt for script generation
   * @returns {string} Generated script
   */
  static async generateScript(prompt) {
    const startTime = Date.now();
    
    try {
      // Validate API key
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error('❌ Gemini API key not configured');
        throw new Error('Gemini API key not configured');
      }
      
      console.log('🤖 Gemini Service: Starting script generation', {
        promptLength: prompt.length
      });
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Gemini API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid Gemini API key');
        }
        if (response.status === 429) {
          throw new Error('Gemini API quota exceeded');
        }
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      if (!responseData.candidates || responseData.candidates.length === 0) {
        console.error('❌ No response generated from Gemini API');
        throw new Error('No response generated from Gemini API');
      }
      
      const generatedText = responseData.candidates[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        console.error('❌ Empty response from Gemini API');
        throw new Error('Empty response from Gemini API');
      }
      
      const processingTime = Date.now() - startTime;
      
      console.log('✅ Gemini Service: Script generation completed', {
        processingTime,
        responseLength: generatedText.length
      });
      
      // Clean up the response and return only the script
      return this.cleanResponse(generatedText);
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      console.error('❌ Gemini Service: Script generation failed', {
        error: error.message,
        processingTime
      });
      
      // Re-throw with specific error types
      if (error.message.includes('API key')) {
        throw new Error('AI service configuration error');
      }
      
      if (error.message.includes('quota')) {
        throw new Error('AI service quota exceeded');
      }
      
      if (error.message.includes('timeout')) {
        throw new Error('AI service timeout');
      }
      
      throw new Error('AI service temporarily unavailable');
    }
  }
  
  /**
   * Clean and format the AI response
   * @param {string} response - Raw AI response
   * @returns {string} Cleaned script text
   */
  static cleanResponse(response) {
    if (!response) {
      return '';
    }
    
    // Remove any JSON formatting or code blocks
    let cleaned = response
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .replace(/^{[\s\S]*}$/g, '') // Remove JSON objects
      .replace(/^\s*[\r\n]/gm, '') // Remove empty lines at start
      .trim();
    
    // Remove any remaining technical formatting
    cleaned = cleaned
      .replace(/"script":\s*"/g, '')
      .replace(/"\s*}$/g, '')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"');
    
    return cleaned;
  }
  
  /**
   * Get safe fallback script when AI fails
   * @param {Object} data - Basic project data
   * @returns {string} Fallback script
   */
  static getFallbackScript(data = {}) {
    const { companyName = 'Your Company', domain = 'your-website.com' } = data;
    
    return `Welcome to your AI video script for ${companyName}.

After analyzing your website at ${domain}, we've identified several key areas for improvement in your SEO and AI visibility.

Your overall performance shows opportunities for enhancement in technical SEO, content optimization, and AI search readiness.

Key recommendations include optimizing your page speed, improving meta descriptions, and implementing structured data markup to better communicate with search engines.

Focus on these areas first: technical health improvements, content optimization, and AI visibility enhancements to improve your search rankings.

This analysis provides a foundation for your digital marketing strategy and continued growth in search visibility.`;
  }
  
  /**
   * Test Gemini API connection
   * @returns {boolean} Connection status
   */
  static async testConnection() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return false;
      }
      
      const testPrompt = 'Respond with "OK" to test connection.';
      const response = await this.generateScript(testPrompt);
      
      return response.toLowerCase().includes('ok');
      
    } catch (error) {
      console.error('Gemini Service: Connection test failed', {
        error: error.message
      });
      
      return false;
    }
  }
}
