#!/usr/bin/env python3
"""
Test page analysis on the newly fixed complete document
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

def test_complete_document_analysis():
    """Test page analysis on the newly complete document"""
    
    print("🧪 TESTING COMPLETE DOCUMENT ANALYSIS")
    print("=" * 60)
    
    # The URL that was previously incomplete
    test_url = "https://www.sapphiredigitalconnect.com/thank-you"
    
    print(f"🎯 Testing URL: {test_url}")
    
    # Find the document
    doc = seo_page_data.find_one({"url": test_url})
    if not doc:
        print("❌ Document not found")
        return
    
    print(f"📋 Document Status: {doc.get('scrape_status')}")
    print(f"📋 Field Count: {len([k for k in doc.keys() if not k.startswith('_')])}")
    
    # Check critical fields
    critical_fields = ["title", "meta_tags", "content", "images", "structured_data"]
    missing_fields = [f for f in critical_fields if not doc.get(f)]
    
    print(f"📋 Missing Critical Fields: {missing_fields}")
    
    # Run page analysis
    print(f"\n🚀 Running page analysis...")
    
    job_id = doc.get("seo_jobId", ObjectId())
    project_id = doc.get("projectId", ObjectId())
    
    try:
        result = analyze_page_seo(
            doc,
            str(job_id),
            str(project_id),
            performance_lookup={},
            headless_lookup={},
            crawl_graph_lookup={},
            technical_report={}
        )
        
        print(f"✅ Analysis completed!")
        
        if isinstance(result, dict):
            issues = result.get('issues', [])
            summary = result.get('summary', {})
            
            print(f"📝 Issues Found: {len(issues)}")
            print(f"📋 Skipped: {summary.get('skipped', False)}")
            
            if summary.get('skipped'):
                print(f"   Reason: {summary.get('reason')}")
            else:
                print(f"   ✅ Document was analyzed normally")
                
                # Show some sample issues
                if issues:
                    print(f"\n📋 Sample Issues (first 5):")
                    for i, issue in enumerate(issues[:5]):
                        print(f"   {i+1}. {issue.get('rule_id', 'Unknown')}: {issue.get('issue_message', 'No message')[:60]}...")
                
                # Show summary stats
                if 'passed_count' in summary and 'failed_count' in summary:
                    print(f"\n📊 Analysis Summary:")
                    print(f"   Passed: {summary['passed_count']}")
                    print(f"   Failed: {summary['failed_count']}")
                    total = summary['passed_count'] + summary['failed_count']
                    pass_rate = (summary['passed_count'] / total * 100) if total > 0 else 0
                    print(f"   Pass Rate: {pass_rate:.1f}%")
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_complete_document_analysis()
