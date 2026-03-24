/**
 * Video Data Debug Script
 * 
 * Fetches structured video data and outputs the exact JSON structure
 * that gets passed to Remotion for debugging and inspection.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ID = "69bd4440b9f78e5bd946750b";
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const OUTPUT_FILE = './debug-video-data.json';

/**
 * Find and log all undefined values in an object recursively
 */
function findUndefined(obj, path = '') {
  const undefinedPaths = [];
  
  function traverse(current, currentPath) {
    if (current === undefined) {
      undefinedPaths.push(currentPath);
      return;
    }
    
    if (current === null || typeof current !== 'object') {
      return;
    }
    
    if (Array.isArray(current)) {
      current.forEach((item, index) => {
        traverse(item, `${currentPath}[${index}]`);
      });
    } else {
      Object.keys(current).forEach(key => {
        traverse(current[key], currentPath ? `${currentPath}.${key}` : key);
      });
    }
  }
  
  traverse(obj, path);
  return undefinedPaths;
}

/**
 * Clean undefined values by replacing them with appropriate defaults
 */
function cleanUndefined(obj) {
  if (obj === undefined) {
    return null;
  }
  
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  
  const cleaned = {};
  Object.keys(obj).forEach(key => {
    cleaned[key] = cleanUndefined(obj[key]);
  });
  
  return cleaned;
}

/**
 * Fetch structured video data from backend
 */
async function fetchVideoData(projectId) {
  try {
    console.log(`🔍 Fetching video data for projectId: ${projectId}`);
    
    const response = await axios.get(`${BACKEND_URL}/api/video/data/${projectId}`, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to fetch video data');
    }
    
    console.log('✅ Successfully fetched video data');
    return response.data.data;
    
  } catch (error) {
    console.error('❌ Error fetching video data:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Connection refused. Is the backend running?');
    }
    
    throw error;
  }
}

/**
 * Generate final data structure passed to Remotion
 */
function generateFinalVideoData(videoData, projectId) {
  console.log('🏗️  Building final video data structure...');
  
  // Create safe default data structure (same as in WorkingVideo.tsx)
  const safeData = {
    topIssues: {
      critical: [],
      high: [],
      medium: [],
      low: []
    },
    recommendations: [],
    keywordData: {
      topRankings: [],
      opportunities: []
    },
    technicalHighlights: {
      criticalIssues: [],
      topRecommendations: []
    },
    performanceMetrics: {
      mobileScore: 75,
      desktopScore: 85,
      pageSpeed: 80,
      lcp: 2.5,
      tbt: 300
    },
    scores: {
      overall: 75,
      technical: 80,
      performance: 70,
      seo: 85
    },
    issueDistribution: {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    project: {
      name: "Website Audit"
    },
    aiAnalysis: {
      score: 70,
      schemaMarkupCount: 0,
      hasKnowledgeGraph: false
    }
  };
  
  // Merge with actual data (same as worker)
  const mergedData = { ...safeData, ...videoData };
  
  // Generate audio file path (same as worker)
  const audioFile = `/audio/${projectId}.mp3`;
  
  // Final structure passed to Remotion
  const finalData = {
    audioFile,
    projectId,
    videoData: mergedData
  };
  
  return finalData;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Video Data Debug Script\n');
  console.log(`📋 Configuration:`);
  console.log(`   Project ID: ${PROJECT_ID}`);
  console.log(`   Backend URL: ${BACKEND_URL}`);
  console.log(`   Output File: ${OUTPUT_FILE}\n`);
  
  try {
    // Step 1: Fetch video data
    const videoData = await fetchVideoData(PROJECT_ID);
    
    // Step 2: Generate final data structure
    const finalData = generateFinalVideoData(videoData, PROJECT_ID);
    
    // Step 3: Check for undefined values
    console.log('🔍 Checking for undefined values...');
    const undefinedPaths = findUndefined(finalData);
    
    if (undefinedPaths.length > 0) {
      console.log('⚠️  Found undefined values:');
      undefinedPaths.forEach(path => {
        console.log(`   - ${path}`);
      });
      console.log();
    } else {
      console.log('✅ No undefined values found\n');
    }
    
    // Step 4: Clean undefined values
    const cleanedData = cleanUndefined(finalData);
    
    // Step 5: Print final JSON to console
    console.log('📄 FINAL VIDEO JSON:');
    console.log('=' .repeat(50));
    console.log(JSON.stringify(cleanedData, null, 2));
    console.log('=' .repeat(50));
    console.log();
    
    // Step 6: Save to file
    console.log('💾 Saving to file...');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanedData, null, 2));
    console.log(`✅ Saved to: ${path.resolve(OUTPUT_FILE)}`);
    
    // Step 7: Summary
    console.log('\n📊 Data Summary:');
    console.log(`   Audio File: ${cleanedData.audioFile}`);
    console.log(`   Project ID: ${cleanedData.projectId}`);
    console.log(`   Video Data Keys: ${Object.keys(cleanedData.videoData).join(', ')}`);
    
    if (cleanedData.videoData.scores) {
      console.log(`   Overall Score: ${cleanedData.videoData.scores.overall}`);
    }
    
    if (cleanedData.videoData.issueDistribution) {
      console.log(`   Total Issues: ${cleanedData.videoData.issueDistribution.total}`);
    }
    
    console.log('\n🎉 Debug script completed successfully!');
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Review the JSON structure above`);
    console.log(`   2. Check the saved file: ${OUTPUT_FILE}`);
    console.log(`   3. Validate data matches expectations`);
    console.log(`   4. Use this data for Remotion testing`);
    
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure backend is running');
    console.error('   2. Check backend URL configuration');
    console.error('   3. Verify project ID exists');
    console.error('   4. Check network connectivity');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  fetchVideoData,
  generateFinalVideoData,
  findUndefined,
  cleanUndefined
};
