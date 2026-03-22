/**
 * Test Script for Debug Audit Flow
 * Tests the complete debug pipeline
 */

import { debugAuditFlow } from './src/modules/aiVideo/services/debugAuditFlow.service.js';

console.log('🔍 TESTING DEBUG AUDIT FLOW');
console.log('='.repeat(60));

// Test with a mock project ID
const testProjectId = 'test-project-123';

console.log(`📋 Testing with project ID: ${testProjectId}`);
console.log('This will test the debug flow with expected failures...');

// Run the debug flow
debugAuditFlow(testProjectId)
  .then(result => {
    console.log('\n🎯 DEBUG FLOW RESULT:');
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('✅ Debug flow completed successfully');
      console.log('Data sources:', result.summary.dataSources);
      console.log('Data integrity:', result.summary.dataIntegrity);
      console.log('Validation:', result.summary.validation);
    } else {
      console.log('❌ Debug flow failed:', result.error);
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Test with real project ID using: GET /api/debug/audit/:projectId');
    console.log('2. Check console output for detailed debugging information');
    console.log('3. Look for "RAW API RESPONSE" and "FINAL SNAPSHOT" sections');
    console.log('4. Verify data integrity and identify failure points');
  })
  .catch(error => {
    console.error('❌ TEST FAILED:', error);
    console.error('Stack trace:', error.stack);
  });
