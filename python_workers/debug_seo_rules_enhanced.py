#!/usr/bin/env python3
"""
Enhanced forensic debugging script with real-world problematic data patterns.
"""

import sys
import os
import json
from pathlib import Path

# Add the scraper path to import modules
scraper_path = Path(__file__).parent / "scraper"
sys.path.insert(0, str(scraper_path))

from workers.seo.page_analysis.rules.categories.title_rules import TitleMissingKeywordRule, _keyword_from_context
from workers.seo.page_analysis.rules.categories.meta_rules import MetaDescMissingKeywordRule
from workers.seo.page_analysis.rules.categories.social_rules import OgValidUrlsRule
from workers.seo.page_analysis.rules.categories.accessibility_rules import AriaLandmarksRule
from workers.seo.page_analysis.rules.categories.performance_rules import PageSpeedScoreRule

def create_problematic_data():
    """Create data that triggers false positives"""
    return {
        "title": "Home Page",  # Generic title, no keyword
        "meta_description": "Welcome to our website",  # Generic description
        "meta_tags": {
            "keywords": []  # Empty keywords list
        },
        "headings": [
            {"tag": "h1", "text": "Welcome"}  # Generic H1
        ],
        "og_tags": {
            "og:title": "Home Page",
            "og:description": "Welcome",
            "og:image": "/images/logo.jpg",  # Relative URL (invalid)
            "og:url": "http://oldsite.com/page"  # HTTP instead of HTTPS
        },
        "headless": {
            "domMetrics": {
                "ariaLandmarks": 0  # No landmarks
            }
        },
        "performance": {
            "mobile": {
                "performance_score": 85  # Below threshold
            },
            "desktop": {
                "performance_score": 92
            }
        }
    }

def create_edge_case_data():
    """Create edge case data that might cause issues"""
    return {
        "title": None,  # None title
        "meta_description": "",  # Empty description
        "meta_tags": {
            "keywords": [""]  # Empty string in list
        },
        "headings": [],  # No headings
        "og_tags": {
            "og:image": "",  # Empty string
            "og:url": None  # None value
        },
        "headless": {
            "domMetrics": {
                "ariaLandmarks": None  # None instead of 0
            }
        },
        "performance": {
            "mobile": {
                "performance_score": None  # None score
            }
        }
    }

def debug_rule_with_data(rule_name, rule_class, normalized_data, **kwargs):
    """Generic rule debugging function"""
    print(f"\n{'='*80}")
    print(f"DEBUGGING {rule_name} WITH PROBLEMATIC DATA")
    print(f"{'='*80}")
    
    rule = rule_class()
    
    print("EVALUATE METHOD:")
    print("-" * 40)
    import inspect
    print(inspect.getsource(rule.evaluate))
    
    print("\nINPUT DATA:")
    print("-" * 40)
    if hasattr(rule_class, '_get_debug_info'):
        debug_info = rule_class._get_debug_info(normalized_data)
        for key, value in debug_info.items():
            print(f"{key}: {repr(value)}")
    else:
        # Generic debugging
        print(json.dumps(normalized_data, indent=2))
    
    print("\nRULE EXECUTION:")
    print("-" * 40)
    
    # Simulate the rule evaluation with debug output
    try:
        if rule_name == "TITLE_MISSING_KEYWORD":
            debug_title_missing_keyword_detailed(normalized_data)
        elif rule_name == "META_DESC_MISSING_KEYWORD":
            debug_meta_desc_missing_keyword_detailed(normalized_data)
        elif rule_name == "OG_URL_INVALID":
            debug_og_url_invalid_detailed(normalized_data)
        elif rule_name == "ARIA_LANDMARKS_MISSING":
            debug_aria_landmarks_missing_detailed(normalized_data)
        elif rule_name == "PAGESPEED_SCORE":
            debug_pagespeed_score_detailed(normalized_data)
    except Exception as e:
        print(f"Error during debugging: {e}")
        import traceback
        traceback.print_exc()

def debug_title_missing_keyword_detailed(normalized_data):
    """Detailed debugging for TITLE_MISSING_KEYWORD"""
    title = normalized_data.get("title", "")
    keyword = _keyword_from_context(normalized_data)
    
    print(f"title: {repr(title)} (type: {type(title)})")
    print(f"keyword: {repr(keyword)} (type: {type(keyword)})")
    
    # Debug keyword extraction
    meta_tags = normalized_data.get("meta_tags", {})
    keywords_list = meta_tags.get("keywords", [])
    print(f"meta_tags.keywords: {repr(keywords_list)}")
    
    headings = normalized_data.get("headings", [])
    print(f"headings: {repr(headings)}")
    
    if keywords_list and isinstance(keywords_list, list) and keywords_list[0]:
        kw = keywords_list[0]
        print(f"First keyword: {repr(kw)}")
        if isinstance(kw, str):
            extracted = kw.split(",")[0].strip().lower()
            print(f"Extracted keyword: {repr(extracted)}")
    
    # Check condition
    if not title:
        print("CONDITION: title is falsy -> NO ISSUE")
        return []
    if not keyword:
        print("CONDITION: keyword is falsy -> NO ISSUE")
        return []
    
    condition = keyword.lower() not in title.lower()
    print(f"CONDITION: '{keyword.lower()}' not in '{title.lower()}' -> {condition}")
    
    if condition:
        print("RESULT: ISSUE CREATED (FALSE POSITIVE)")
        return ["issue"]
    else:
        print("RESULT: NO ISSUE")
        return []

def debug_meta_desc_missing_keyword_detailed(normalized_data):
    """Detailed debugging for META_DESC_MISSING_KEYWORD"""
    from workers.seo.page_analysis.rules.categories.meta_rules import _keyword_from_context as meta_keyword_from_context
    
    desc = normalized_data.get("meta_description", "")
    keyword = meta_keyword_from_context(normalized_data)
    
    print(f"meta_description: {repr(desc)} (type: {type(desc)})")
    print(f"keyword: {repr(keyword)} (type: {type(keyword)})")
    
    if not desc:
        print("CONDITION: desc is falsy -> NO ISSUE")
        return []
    if not keyword:
        print("CONDITION: keyword is falsy -> NO ISSUE")
        return []
    
    condition = keyword.lower() not in desc.lower()
    print(f"CONDITION: '{keyword.lower()}' not in '{desc.lower()}' -> {condition}")
    
    if condition:
        print("RESULT: ISSUE CREATED (FALSE POSITIVE)")
        return ["issue"]
    else:
        print("RESULT: NO ISSUE")
        return []

def debug_og_url_invalid_detailed(normalized_data):
    """Detailed debugging for OG_URL_INVALID"""
    from workers.seo.page_analysis.rules.categories.social_rules import _is_valid_url, safe_str
    
    og = normalized_data.get("og_tags", {})
    print(f"og_tags: {repr(og)}")
    
    issues_found = []
    for key in ("og:image", "og:url"):
        value = safe_str(og.get(key, ""))
        print(f"\n{key}:")
        print(f"  Raw: {repr(og.get(key))}")
        print(f"  safe_str: {repr(value)}")
        
        if value:
            is_valid = _is_valid_url(value)
            uses_http = value.startswith("http://")
            print(f"  _is_valid_url: {is_valid}")
            print(f"  starts with http://: {uses_http}")
            
            if not is_valid:
                issues_found.append(f"{key} invalid URL")
                print(f"  -> ISSUE: {key} invalid URL")
            elif uses_http:
                issues_found.append(f"{key} uses HTTP")
                print(f"  -> ISSUE: {key} uses HTTP")
        else:
            print(f"  -> No value, skipping")
    
    print(f"\nissues_found: {issues_found}")
    if issues_found:
        print("RESULT: ISSUE CREATED")
        return ["issue"]
    else:
        print("RESULT: NO ISSUE")
        return []

def debug_aria_landmarks_missing_detailed(normalized_data):
    """Detailed debugging for ARIA_LANDMARKS_MISSING"""
    headless = normalized_data.get("headless", {})
    dom_metrics = headless.get("domMetrics", {})
    landmarks = dom_metrics.get("ariaLandmarks", 0)
    
    print(f"headless: {repr(headless)}")
    print(f"domMetrics: {repr(dom_metrics)}")
    print(f"ariaLandmarks: {repr(landmarks)} (type: {type(landmarks)})")
    
    condition = landmarks == 0
    print(f"CONDITION: landmarks == 0 -> {condition}")
    
    if condition:
        print("RESULT: ISSUE CREATED")
        print("POTENTIAL FALSE POSITIVE: landmarks might be None or missing")
        return ["issue"]
    else:
        print("RESULT: NO ISSUE")
        return []

def debug_pagespeed_score_detailed(normalized_data):
    """Detailed debugging for PAGESPEED_SCORE"""
    from workers.seo.page_analysis.rules.categories.performance_rules import _get_perf
    
    perf = normalized_data.get("performance", {})
    print(f"performance: {repr(perf)}")
    
    # Test different device contexts
    for device in ["mobile", "desktop", None]:
        if device:
            device_perf = _get_perf(normalized_data, device)
            print(f"\n_get_perf(normalized, '{device}'): {repr(device_perf)}")
        else:
            device_perf = _get_perf(normalized_data)
            print(f"\n_get_perf(normalized) [default]: {repr(device_perf)}")
        
        score = device_perf.get("performance_score")
        print(f"  performance_score: {repr(score)} (type: {type(score)})")
        
        if score is not None:
            condition = score < 90
            print(f"  CONDITION: score < 90 -> {condition}")
            if condition:
                print(f"  RESULT: ISSUE CREATED for {device or 'default'}")
            else:
                print(f"  RESULT: NO ISSUE for {device or 'default'}")
        else:
            print(f"  CONDITION: score is None -> NO ISSUE for {device or 'default'}")

def main():
    """Main debugging function"""
    print("ENHANCED SEO RULE ENGINE FORENSIC DEBUG")
    print("=" * 80)
    
    # Test with problematic data
    problematic_data = create_problematic_data()
    edge_case_data = create_edge_case_data()
    
    print("\n" + "="*80)
    print("TESTING WITH PROBLEMATIC DATA (LIKELY FALSE POSITIVES)")
    print("="*80)
    print(json.dumps(problematic_data, indent=2))
    
    rules_to_test = [
        ("TITLE_MISSING_KEYWORD", TitleMissingKeywordRule),
        ("META_DESC_MISSING_KEYWORD", MetaDescMissingKeywordRule),
        ("OG_URL_INVALID", OgValidUrlsRule),
        ("ARIA_LANDMARKS_MISSING", AriaLandmarksRule),
        ("PAGESPEED_SCORE", PageSpeedScoreRule),
    ]
    
    for rule_name, rule_class in rules_to_test:
        debug_rule_with_data(rule_name, rule_class, problematic_data)
    
    print("\n" + "="*80)
    print("TESTING WITH EDGE CASE DATA")
    print("="*80)
    print(json.dumps(edge_case_data, indent=2))
    
    for rule_name, rule_class in rules_to_test:
        debug_rule_with_data(rule_name, rule_class, edge_case_data)
    
    print("\n" + "="*80)
    print("ROOT CAUSE ANALYSIS")
    print("="*80)
    
    print("""
POTENTIAL ROOT CAUSES OF FALSE POSITIVES:

1. TITLE_MISSING_KEYWORD & META_DESC_MISSING_KEYWORD:
   - _keyword_from_context() returns empty string when:
     * meta_tags.keywords is empty list []
     * meta_tags.keywords[0] is empty string ""
     * No H1 headings found
   - Rule returns [] (no issue) when keyword is empty
   - FALSE POSITIVE occurs when keyword exists but doesn't match content

2. OG_URL_INVALID (OG_VALID_URLS):
   - _is_valid_url() fails on relative URLs like "/images/logo.jpg"
   - HTTP URLs flagged even when valid
   - Empty strings passed to safe_str() become "" and are skipped

3. ARIA_LANDMARKS_MISSING:
   - landmarks == 0 check triggers even when landmarks is None
   - Should check for None/missing vs actual zero count

4. PAGESPEED_SCORE:
   - Always uses mobile data (_get_perf() defaults to mobile)
   - Desktop performance ignored even if better
   - None scores handled correctly but might be missing data issue

FIX RECOMMENDATIONS:
1. Fix keyword extraction to handle empty lists/strings better
2. Add URL resolution for relative URLs in OG tags
3. Fix ARIA landmarks to check for None explicitly
4. Consider best score across devices for performance rules
""")

if __name__ == "__main__":
    main()
