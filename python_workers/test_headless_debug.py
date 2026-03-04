#!/usr/bin/env python3
"""
Test page analysis with debug output to see headless data matching
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

def test_headless_debug():
    """Test page analysis with headless debug output"""
    
    print("🧪 TESTING HEADLESS DATA MATCHING")
    print("=" * 60)
    
    # Test with homepage (has headless data)
    test_url = "https://www.sapphiredigitalconnect.com/"
    
    print(f"🎯 Testing URL: {test_url}")
    
    # Get the page document
    page_doc = seo_page_data.find_one({"url": test_url})
    if not page_doc:
        print("❌ Page document not found")
        return
    
    job_id = page_doc.get("seo_jobId")
    project_id = page_doc.get("projectId")
    
    print(f"📋 Job ID: {job_id}")
    print(f"📋 Project ID: {project_id}")
    
    # Run page analysis with debug output
    print(f"\n🚀 Running page analysis with debug...")
    print("-" * 50)
    
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
        
        print(f"\n✅ Analysis completed!")
        
        if isinstance(result, dict):
            issues = result.get('issues', [])
            summary = result.get('summary', {})
            
            print(f"📝 Total Issues: {len(issues)}")
            
            # Look for accessibility-specific issues (rules 213-236)
            accessibility_issues = [issue for issue in issues if 213 <= issue.get('rule_id', 0) <= 236]
            
            print(f"\n🔍 ACCESSIBILITY RULES ANALYSIS (213-236):")
            print(f"   Total accessibility issues: {len(accessibility_issues)}")
            
            # Show specific rules mentioned
            target_rules = ['AXE_NO_VIOLATIONS', 'AXE_NO_CRITICAL', 'ARIA_LANDMARKS', 'DOM_ELEMENT_COUNT']
            for rule_name in target_rules:
                rule_issues = [issue for issue in accessibility_issues if rule_name in issue.get('rule_code', '')]
                if rule_issues:
                    print(f"   ✅ {rule_name}: {len(rule_issues)} issues")
                    for issue in rule_issues[:2]:  # Show first 2
                        print(f"      - {issue.get('issue_message', '')[:80]}...")
                else:
                    print(f"   ❌ {rule_name}: 0 issues")
            
            # Show all accessibility issues found
            if accessibility_issues:
                print(f"\n📋 All Accessibility Issues Found:")
                for i, issue in enumerate(accessibility_issues[:10]):  # Show first 10
                    print(f"   {i+1}. Rule {issue.get('rule_id')}: {issue.get('rule_code', 'Unknown')}")
                    print(f"      {issue.get('issue_message', 'No message')[:100]}...")
                    print()
            else:
                print(f"\n❌ NO ACCESSIBILITY ISSUES FOUND")
                print(f"   This suggests headless data is still not reaching the rules")
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_headless_debug()
