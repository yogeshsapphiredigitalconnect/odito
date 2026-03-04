#!/usr/bin/env python3
"""
Simple test to see debug output only
"""

import os
import sys
from bson.objectid import ObjectId

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, seo_headless_data, db
    from scraper.workers.seo.page_analysis.page_analysis import analyze_page_seo
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def simple_debug_test():
    """Simple test to see debug output"""
    
    print("🧪 SIMPLE DEBUG TEST")
    print("=" * 30)
    
    test_url = "https://www.sapphiredigitalconnect.com/"
    
    page_doc = seo_page_data.find_one({"url": test_url})
    if not page_doc:
        print("❌ Page not found")
        return
    
    job_id = page_doc.get("seo_jobId")
    project_id = page_doc.get("projectId")
    
    print(f"🎯 URL: {test_url}")
    print(f"📋 Job: {job_id}")
    print(f"📋 Project: {project_id}")
    
    print(f"\n🚀 Running analysis...")
    
    try:
        result = analyze_page_seo(
            page_doc,
            str(job_id),
            str(project_id),
            performance_lookup={},
            headless_lookup={},
            crawl_graph_lookup={},
            technical_report={}
        )
        
        print(f"\n✅ Done!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    simple_debug_test()
