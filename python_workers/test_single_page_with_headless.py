#!/usr/bin/env python3
"""
Test single page analysis with debug output
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

def test_single_page_with_headless():
    """Test single page with proper headless_lookup"""
    
    print("🧪 TESTING SINGLE PAGE WITH HEADLESS LOOKUP")
    print("=" * 60)
    
    test_url = "https://www.sapphiredigitalconnect.com/"
    
    # Get page document
    page_doc = seo_page_data.find_one({"url": test_url})
    if not page_doc:
        print("❌ Page not found")
        return
    
    job_id = page_doc.get("seo_jobId")
    project_id = page_doc.get("projectId")
    
    print(f"🎯 URL: {test_url}")
    print(f"📋 Job ID: {job_id}")
    print(f"📋 Project ID: {project_id}")
    
    # Build headless_lookup manually like the worker does
    print(f"\n🔧 BUILDING HEADLESS_LOOKUP:")
    headless_data_list = list(seo_headless_data.find({"projectId": ObjectId(project_id)}))
    headless_lookup = {}
    
    # Import the normalize function
    from urllib.parse import urlparse
    def _normalize_lookup_url(url):
        if not url or not isinstance(url, str):
            return ""
        url = url.strip()
        parsed = urlparse(url)
        scheme = (parsed.scheme or "https").lower()
        host = (parsed.netloc or "").lower()
        path = parsed.path.rstrip("/")
        query = f"?{parsed.query}" if parsed.query else ""
        return f"{scheme}://{host}{path}{query}" if host else url.rstrip("/")
    
    for h in headless_data_list:
        url = h.get('url', '')
        if url:
            normalized = _normalize_lookup_url(url)
            headless_lookup[normalized] = h
    
    print(f"   Total headless records: {len(headless_data_list)}")
    print(f"   Headless lookup keys: {list(headless_lookup.keys())[:5]}")
    
    # Test lookup for our URL
    lookup_url = _normalize_lookup_url(test_url)
    headless_match = headless_lookup.get(lookup_url, 'NOT FOUND')
    
    print(f"\n🔍 URL MATCHING TEST:")
    print(f"   Test URL: {test_url}")
    print(f"   Normalized: {lookup_url}")
    print(f"   Headless match: {headless_match}")
    
    if headless_match != 'NOT FOUND':
        print(f"   ✅ Match found!")
        print(f"   Keys in match: {list(headless_match.keys())}")
        violations = headless_match.get('axeViolations', [])
        print(f"   AXE violations: {len(violations)}")
    else:
        print(f"   ❌ No match found!")
        return
    
    # Run analysis with the proper headless_lookup
    print(f"\n🚀 RUNNING ANALYSIS:")
    print("-" * 40)
    
    try:
        result = analyze_page_seo(
            page_doc,
            str(job_id),
            str(project_id),
            performance_lookup={},
            headless_lookup=headless_lookup,  # Pass the real lookup!
            crawl_graph_lookup={},
            technical_report={}
        )
        
        print(f"\n✅ Analysis completed!")
        
        if isinstance(result, dict):
            issues = result.get('issues', [])
            print(f"📝 Total Issues: {len(issues)}")
            
            # Look for accessibility issues
            accessibility_issues = []
            for issue in issues:
                rule_code = issue.get('rule_code', '')
                if any(keyword in rule_code for keyword in ['AXE_', 'ARIA_', 'KEYBOARD_', 'FOCUS_', 'DOM_', 'BUTTONS_', 'LINKS_', 'SMALL_', 'HEADING_', 'HTML_', 'UNREACHABLE_', 'SKIP_', 'IMAGES_ALL_HAVE_ALT']):
                    accessibility_issues.append(issue)
            
            print(f"🔍 Accessibility Issues Found: {len(accessibility_issues)}")
            
            # Group by rule type
            rule_groups = {}
            for issue in accessibility_issues:
                rule_code = issue.get('rule_code', 'Unknown')
                if rule_code not in rule_groups:
                    rule_groups[rule_code] = []
                rule_groups[rule_code].append(issue)
            
            # Show results for specific rules
            target_rules = [
                'AXE_NO_VIOLATIONS', 'AXE_NO_CRITICAL', 'AXE_NO_SERIOUS', 'AXE_MAX_MODERATE',
                'DOM_ELEMENT_COUNT', 'ARIA_LANDMARKS', 'BUTTONS_HAVE_LABELS', 'FORM_LABELS',
                'HEADING_ORDER_LOGICAL_A11Y', 'KEYBOARD_NAV_CHECKED', 'NO_FOCUS_TRAP',
                'SMALL_CLICK_TARGETS', 'FOCUS_INDICATOR', 'UNREACHABLE_ELEMENTS',
                'SKIP_NAVIGATION', 'LINKS_DESCRIPTIVE_TEXT', 'IMAGES_ALL_HAVE_ALT', 'HTML_LANG_A11Y'
            ]
            
            print(f"\n📋 ACCESSIBILITY RULE RESULTS:")
            for rule in target_rules:
                if rule in rule_groups:
                    print(f"   ✅ {rule}: {len(rule_groups[rule])} issues")
                    for issue in rule_groups[rule][:2]:  # Show first 2
                        print(f"      - {issue.get('issue_message', '')[:80]}...")
                else:
                    print(f"   ❌ {rule}: 0 issues")
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_single_page_with_headless()
