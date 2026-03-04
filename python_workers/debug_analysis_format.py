#!/usr/bin/env python3
"""
Debug the analysis return format and fix the script
"""

import os
import sys
import json
from bson.objectid import ObjectId
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, seo_page_issues, seo_page_scores, db
    from scraper.workers.seo.page_analysis.page_analysis import analyze_page_seo
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def debug_analysis_format():
    """Debug what the analysis function actually returns"""
    
    print("🔍 DEBUGGING ANALYSIS RETURN FORMAT")
    print("=" * 50)
    
    # Test URL
    test_url = "https://www.sapphiredigitalconnect.com/pay-per-click-shopping-ads"
    
    # Find the page data
    page = seo_page_data.find_one({"url": test_url})
    if not page:
        print(f"❌ Page not found")
        return
    
    # Extract project info
    project_id = page.get("projectId")
    job_id = page.get("seo_jobId", ObjectId())
    
    print(f"🎯 Analyzing: {test_url}")
    
    # Run the analysis
    try:
        result = analyze_page_seo(
            page, 
            str(job_id), 
            str(project_id),
            performance_lookup={},
            headless_lookup={},
            crawl_graph_lookup={},
            technical_report={}
        )
        
        print(f"✅ Analysis completed")
        print(f"📊 Return type: {type(result)}")
        
        if isinstance(result, dict):
            print(f"📋 Dict keys: {list(result.keys())}")
            
            if 'issues' in result:
                issues = result['issues']
                print(f"📝 Issues type: {type(issues)}")
                print(f"📝 Issues count: {len(issues) if isinstance(issues, list) else 'Not a list'}")
                
                if isinstance(issues, list) and issues:
                    first_issue = issues[0]
                    print(f"📝 First issue type: {type(first_issue)}")
                    print(f"📝 First issue: {first_issue}")
            
            if 'summary' in result:
                summary = result['summary']
                print(f"📋 Summary: {summary}")
        
        elif isinstance(result, list):
            print(f"📝 List length: {len(result)}")
            if result:
                first_item = result[0]
                print(f"📝 First item type: {type(first_item)}")
                print(f"📝 First item: {first_item}")
        
        else:
            print(f"📝 Raw result: {result}")
        
        return result
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    debug_analysis_format()
