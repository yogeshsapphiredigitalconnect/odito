#!/usr/bin/env python3
"""
Quick test to verify incomplete document skip logic
"""

import os
import sys
from bson.objectid import ObjectId

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, db
    from scraper.workers.seo.page_analysis.page_analysis import analyze_page_seo
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def test_incomplete_skip():
    """Test only the incomplete document skip logic"""
    
    print("🧪 TESTING INCOMPLETE DOCUMENT SKIP")
    print("=" * 50)
    
    # Find the latest job
    latest_job = db.jobs.find_one(
        {"jobType": "PAGE_SCRAPING", "status": "completed"},
        sort=[("created_at", -1)]
    )
    
    job_id = latest_job["_id"]
    project_id = latest_job.get("project_id")
    
    # Find the incomplete document
    incomplete_doc = seo_page_data.find_one({
        "seo_jobId": job_id,
        "scrape_status": "FAILED"
    })
    
    if not incomplete_doc:
        print("❌ No incomplete document found")
        return
    
    print(f"🔍 Testing: {incomplete_doc.get('url')}")
    print(f"   Status: {incomplete_doc.get('scrape_status')}")
    print(f"   Error: {incomplete_doc.get('error')}")
    
    # Test page analysis
    print(f"\n🚀 Running analysis...")
    
    result = analyze_page_seo(
        incomplete_doc,
        str(job_id),
        str(project_id),
        performance_lookup={},
        headless_lookup={},
        crawl_graph_lookup={},
        technical_report={}
    )
    
    print(f"📊 Result: {result}")
    
    # Verify skip behavior
    if isinstance(result, dict) and result.get('summary', {}).get('skipped'):
        print(f"✅ SUCCESS: Document properly skipped")
        print(f"   Reason: {result['summary'].get('reason')}")
        print(f"   Issues: {len(result.get('issues', []))}")
    else:
        print(f"❌ FAILURE: Document was not skipped")

if __name__ == "__main__":
    test_incomplete_skip()
