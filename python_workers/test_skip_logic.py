#!/usr/bin/env python3
"""
Test that page analysis properly skips incomplete documents
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

def test_page_analysis_skip_logic():
    """Test that page analysis skips incomplete documents"""
    
    print("🧪 TESTING PAGE ANALYSIS SKIP LOGIC")
    print("=" * 60)
    
    # Find the latest job
    latest_job = db.jobs.find_one(
        {"jobType": "PAGE_SCRAPING", "status": "completed"},
        sort=[("created_at", -1)]
    )
    
    if not latest_job:
        print("❌ No completed PAGE_SCRAPING job found")
        return
    
    job_id = latest_job["_id"]
    project_id = latest_job.get("project_id")
    
    print(f"📋 Testing with Job ID: {job_id}")
    
    # Find the incomplete document
    incomplete_doc = seo_page_data.find_one({
        "seo_jobId": job_id,
        "scrape_status": "FAILED"
    })
    
    if not incomplete_doc:
        print("❌ No incomplete document found")
        return
    
    print(f"🔍 Testing incomplete document: {incomplete_doc.get('url')}")
    print(f"   Status: {incomplete_doc.get('scrape_status')}")
    print(f"   Error: {incomplete_doc.get('error')}")
    
    # Test page analysis on incomplete document
    print(f"\n🚀 Running page analysis on incomplete document...")
    
    try:
        result = analyze_page_seo(
            incomplete_doc,
            str(job_id),
            str(project_id),
            performance_lookup={},
            headless_lookup={},
            crawl_graph_lookup={},
            technical_report={}
        )
        
        print(f"✅ Analysis completed without error")
        print(f"📊 Result type: {type(result)}")
        
        if isinstance(result, dict):
            print(f"📋 Result keys: {list(result.keys())}")
            
            issues = result.get('issues', [])
            summary = result.get('summary', {})
            
            print(f"📝 Issues returned: {len(issues)}")
            print(f"📋 Summary: {summary}")
            
            # Check if it was properly skipped
            if summary.get('skipped'):
                print(f"✅ SUCCESS: Document was properly skipped")
                print(f"   Reason: {summary.get('reason')}")
            else:
                print(f"❌ FAILURE: Document was not skipped as expected")
        
    except Exception as e:
        print(f"❌ Analysis failed with error: {e}")
        import traceback
        traceback.print_exc()
    
    # Also test a complete document for comparison
    print(f"\n🔍 Testing complete document for comparison...")
    
    complete_doc = seo_page_data.find_one({
        "seo_jobId": job_id,
        "scrape_status": "SUCCESS"
    })
    
    if complete_doc:
        print(f"📄 Testing: {complete_doc.get('url')}")
        
        try:
            result = analyze_page_seo(
                complete_doc,
                str(job_id),
                str(project_id),
                performance_lookup={},
                headless_lookup={},
                crawl_graph_lookup={},
                technical_report={}
            )
            
            if isinstance(result, dict):
                issues = result.get('issues', [])
                summary = result.get('summary', {})
                
                print(f"📝 Issues returned: {len(issues)}")
                print(f"📋 Skipped: {summary.get('skipped', False)}")
                
                if not summary.get('skipped'):
                    print(f"✅ SUCCESS: Complete document was analyzed normally")
                else:
                    print(f"❌ UNEXPECTED: Complete document was skipped")
        
        except Exception as e:
            print(f"❌ Analysis of complete document failed: {e}")

if __name__ == "__main__":
    test_page_analysis_skip_logic()
