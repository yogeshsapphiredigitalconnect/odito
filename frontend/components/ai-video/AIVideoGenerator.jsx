/**
 * AI Video Generator Component
 * Handles AI video script generation with raw JSON data fetch + AI generation
 */

import React, { useState } from 'react';
import { Loader2, Play, FileText, Sparkles, Database, Brain } from 'lucide-react';

export const AIVideoGenerator = ({ projectId, className = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState('');
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Fetching audit data...');
  const [rawData, setRawData] = useState(null);
  const [fetchProgress, setFetchProgress] = useState(0);

  const loadingMessages = [
    'Fetching audit data from all 14 pages...',
    'Validating data completeness...',
    'Preparing data for AI analysis...',
    'Sending data to AI...',
    'Generating your video script...',
    'Optimizing for your business...',
    'Finalizing your video script...'
  ];

  /**
   * Generate AI video script
   * Step 1: Fetch raw JSON from all 14 pages
   * Step 2: Pass raw JSON to AI for script generation
   */
  const generateVideoScript = async () => {
    if (!projectId) {
      setError('Project ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setScript('');
    setRawData(null);
    setFetchProgress(0);

    // Rotate loading messages
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
      setFetchProgress(Math.min(100, (messageIndex + 1) * 15));
    }, 2000);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // ===== STEP 1: Fetch Raw JSON Data from All 14 Pages =====
      console.log('📊 Step 1: Fetching raw audit data...');
      setLoadingMessage('Fetching audit data from all 14 pages...');
      
      const rawDataResponse = await fetch(`http://localhost:5000/api/ai-video/${projectId}/raw-json`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!rawDataResponse.ok) {
        const errorData = await rawDataResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch audit data: ${rawDataResponse.status}`);
      }

      const rawDataResult = await rawDataResponse.json();

      if (!rawDataResult.success) {
        const missingPages = rawDataResult.missingPages?.join(', ') || 'unknown';
        throw new Error(`Data fetch incomplete. Missing pages: ${missingPages}`);
      }

      console.log('✅ Raw data fetched:', {
        pagesFetched: rawDataResult.pagesFetched,
        missingPages: rawDataResult.missingPages?.length || 0
      });

      setRawData(rawDataResult.rawData);
      setLoadingMessage('Data validated! Sending to AI...');

      // ===== STEP 2: Send Raw JSON to AI for Script Generation =====
      console.log('🤖 Step 2: Sending data to AI...');
      
      const generateResponse = await fetch(`http://localhost:5000/api/ai-video/${projectId}/generate-from-json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rawData: rawDataResult.rawData,
          metadata: rawDataResult.metadata
        })
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Script generation failed: ${generateResponse.status}`);
      }

      const generateResult = await generateResponse.json();

      if (!generateResult.success) {
        throw new Error(generateResult.message || 'Failed to generate script');
      }

      console.log('✅ Script generated successfully!');
      setScript(generateResult.script || '');

    } catch (err) {
      console.error('AI Video generation error:', err);
      setError(err.message || 'Failed to generate video script');
    } finally {
      clearInterval(messageInterval);
      setIsLoading(false);
      setLoadingMessage('Generating AI Script...');
      setFetchProgress(0);
    }
  };

  /**
   * Copy script to clipboard
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(script);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  /**
   * Download script as text file
   */
  const downloadScript = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-video-script-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`ai-video-generator ${className}`}>
      {/* Generate Button */}
      {!script && !isLoading && (
        <div className="text-center">
          <button
            onClick={generateVideoScript}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Generate AI Video
          </button>
          <p className="mt-2 text-sm text-gray-600">
            Create a personalized video script from your audit data
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-600 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Creating Your AI Video Script
            </h3>
            <p className="text-gray-600 mb-4">
              {loadingMessage}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" 
                   style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold">Generation Failed</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={generateVideoScript}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => setError('')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Script Display */}
      {script && !isLoading && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your AI Video Script</h2>
                  <p className="text-blue-100">
                    Ready for voice narration • {script.length} words
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                  title="Copy to clipboard"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={downloadScript}
                  className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                  title="Download script"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Script Content */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none">
              <div className="bg-gray-50 rounded-lg p-6 font-serif text-gray-800 leading-relaxed whitespace-pre-wrap">
                {script}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={generateVideoScript}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 inline mr-2" />
                Regenerate Script
              </button>
              <button
                onClick={copyToClipboard}
                className="px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Copy Script
              </button>
            </div>

            {/* Usage Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">🎬 Usage Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• This script is optimized for professional voice narration</li>
                <li>• Speak at a moderate pace for best engagement</li>
                <li>• Add pauses between sections for emphasis</li>
                <li>• Consider background music that matches your brand</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIVideoGenerator;
