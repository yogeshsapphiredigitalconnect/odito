require('dotenv').config();
const express = require('express');
const AudioService = require('./services/audioService');

console.log('🔍 WORKER ENVIRONMENT TEST');
console.log('='.repeat(40));

// Simulate the exact worker environment
class WorkerSimulation {
  constructor() {
    this.audioService = new AudioService();
    this.app = express();
    this.app.use(express.json());
    
    // Copy the exact worker endpoint
    this.app.post('/test-audio', async (req, res) => {
      try {
        const { narration, projectId } = req.body;
        console.log(`[WORKER_SIM] Received request for projectId: ${projectId}`);
        
        // This is the exact call from worker.js
        const result = await this.audioService.generateAudioFromText(narration, projectId);
        
        res.json({
          success: true,
          result: result
        });
      } catch (error) {
        console.error(`[WORKER_SIM] Audio generation failed:`, error.message);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }
  
  async testDirectly() {
    console.log('\n🎙️ Testing direct call (same as worker):');
    
    const testNarration = "This is a test of the worker environment to identify why the worker fails but direct calls work.";
    const projectId = 'worker-test';
    
    try {
      // This mimics the exact call in worker.js:831
      const result = await this.audioService.generateAudioFromText(testNarration, projectId);
      console.log(`✅ Direct call SUCCESS: ${result}`);
      return true;
    } catch (error) {
      console.log(`❌ Direct call FAILED: ${error.message}`);
      return false;
    }
  }
  
  async testViaHTTP() {
    console.log('\n🌐 Testing via HTTP (like real worker):');
    
    const testNarration = "This is a test of the worker HTTP endpoint to identify the exact failure point.";
    const projectId = 'http-test';
    
    try {
      const response = await axios.post('http://localhost:8002/test-audio', {
        narration: testNarration,
        projectId: projectId
      });
      
      console.log(`✅ HTTP call SUCCESS: ${response.data.result}`);
      return true;
    } catch (error) {
      console.log(`❌ HTTP call FAILED: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data:`, error.response.data);
      }
      return false;
    }
  }
  
  startServer() {
    return new Promise((resolve) => {
      this.server = this.app.listen(8002, () => {
        console.log('🚀 Worker simulation server started on port 8002');
        resolve();
      });
    });
  }
  
  stopServer() {
    if (this.server) {
      this.server.close();
    }
  }
}

async function runWorkerTest() {
  const workerSim = new WorkerSimulation();
  
  // Test direct call first
  const directResult = await workerSim.testDirectly();
  
  // Start HTTP server and test via HTTP
  await workerSim.startServer();
  const httpResult = await workerSim.testViaHTTP();
  workerSim.stopServer();
  
  console.log('\n🎯 WORKER ENVIRONMENT ANALYSIS:');
  console.log(`Direct call: ${directResult ? '✅' : '❌'}`);
  console.log(`HTTP call: ${httpResult ? '✅' : '❌'}`);
  
  if (directResult && !httpResult) {
    console.log('\n❌ HTTP ENVIRONMENT ISSUE:');
    console.log('   Direct calls work but HTTP calls fail');
    console.log('   This suggests an issue with the HTTP worker environment');
  } else if (!directResult && httpResult) {
    console.log('\n❌ REVERSE ISSUE: HTTP works but direct fails');
  } else if (directResult && httpResult) {
    console.log('\n✅ Both work - issue only occurs in real worker');
  } else {
    console.log('\n❌ Both fail - fundamental issue');
  }
}

const axios = require('axios');
runWorkerTest().catch(console.error);
