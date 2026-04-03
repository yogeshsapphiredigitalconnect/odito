// Test script to verify keyword ranking API and create sample data
// Run with: node test-keywords-api.js

const sampleData = {
  project_id: "69ce518d6b8c9e6c8f9c7e3e",
  user_id: "507f1f77bcf86cd799439011", // sample user ID
  domain: "https://www.wowinfotech.com/",
  location: "1st Floor and 2nd Floor, Nutan Sayali Society, College Rd, near Croma Store, Nashik, Maharashtra 422005, India",
  keywords: [
    { keyword: "best it company in nashik", rank: 12 },
    { keyword: "best software company in nashik", rank: 11 }
  ],
  created_at: "2026-04-02T11:23:27.617Z"
};

console.log('Sample data structure for SeoRanking:');
console.log(JSON.stringify(sampleData, null, 2));

console.log('\nTo test the API:');
console.log('1. Make sure backend server is running: cd odito_backend && npm run dev');
console.log('2. Test the endpoint: curl -X GET "http://localhost:5000/api/keywords/rankings/project/69ce518d6b8c9e6c8f9c7e3e?limit=1"');
console.log('3. Create sample data using the save-ranking endpoint');
