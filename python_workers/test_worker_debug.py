#!/usr/bin/env python3
"""
Test the main worker function to see headless debug output
"""

import os
import sys
from bson.objectid import ObjectId

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, seo_headless_data, db
    from scraper.workers.seo.page_analysis.page_analysis import execute_page_analysis_logic
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

# Mock job object
class MockJob:
    def __init__(self, job_id, project_id):
        self.jobId = str(job_id)
        self.projectId = str(project_id)
        self.userId = "test_user"
        self.sourceJobId = None

def test_worker_debug():
    """Test the main worker function to see debug output"""
    
    print("🧪 TESTING MAIN WORKER FUNCTION")
    print("=" * 50)
    
    # Get a page that has headless data
    test_url = "https://www.sapphiredigitalconnect.com/"
    page_doc = seo_page_data.find_one({"url": test_url})
    
    if not page_doc:
        print("❌ Page not found")
        return
    
    job_id = page_doc.get("seo_jobId")
    project_id = page_doc.get("projectId")
    
    print(f"🎯 URL: {test_url}")
    print(f"📋 Job ID: {job_id}")
    print(f"📋 Project ID: {project_id}")
    
    # Create mock job
    mock_job = MockJob(job_id, project_id)
    
    print(f"\n🚀 Running main worker function...")
    print("-" * 50)
    
    try:
        result = execute_page_analysis_logic(mock_job)
        print(f"\n✅ Worker completed!")
        print(f"📊 Result: {result}")
        
    except Exception as e:
        print(f"❌ Worker failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_worker_debug()
