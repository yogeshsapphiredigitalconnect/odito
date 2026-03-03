#!/usr/bin/env python3
"""
Forensic debugging script for SEO rule engine false positives.
Analyzes the 5 specified rules with detailed debugging output.
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

def debug_title_missing_keyword(normalized_data):
    """Debug TITLE_MISSING_KEYWORD rule"""
    print("=" * 80)
    print("RULE 1: TITLE_MISSING_KEYWORD")
    print("=" * 80)
    
    rule = TitleMissingKeywordRule()
    
    print("EVALUATE METHOD:")
    print("-" * 40)
    import inspect
    print(inspect.getsource(rule.evaluate))
    
    print("\nNORMALIZED DATA KEYS USED:")
    print("-" * 40)
    print("- title (direct access)")
    print("- meta_tags.keywords (via _keyword_from_context)")
    print("- headings (via _keyword_from_context fallback)")
    
    print("\nRAW EXTRACTED VALUES:")
    print("-" * 40)
    title = normalized_data.get("title", "")
    print(f"title: {repr(title)}")
    
    meta_tags = normalized_data.get("meta_tags", {})
    keywords_list = meta_tags.get("keywords", [])
    print(f"meta_tags.keywords: {repr(keywords_list)}")
    
    headings = normalized_data.get("headings", [])
    print(f"headings: {repr(headings)}")
    
    print("\nTRANSFORMED/COMPUTED VALUES:")
    print("-" * 40)
    keyword = _keyword_from_context(normalized_data)
    print(f"keyword (from _keyword_from_context): {repr(keyword)}")
    print(f"keyword.lower(): {repr(keyword.lower() if keyword else '')}")
    print(f"title.lower(): {repr(title.lower() if title else '')}")
    
    print("\nFINAL BOOLEAN CONDITION:")
    print("-" * 40)
    if not title:
        print("Condition: title is empty -> RETURN []")
        result = []
    elif not keyword:
        print("Condition: keyword is empty -> RETURN []")
        result = []
    else:
        condition_result = keyword.lower() not in title.lower()
        print(f"Condition: keyword.lower() not in title.lower()")
        print(f"Result: {condition_result}")
        if condition_result:
            print("-> ISSUE CREATED")
            result = ["issue_created"]
        else:
            print("-> RETURN []")
            result = []
    
    print("\nEXACT FAULTY LINE (if issue created):")
    print("-" * 40)
    if result:
        print("Line 264: if keyword.lower() not in title.lower():")
        print("This line triggers the issue creation.")
    
    return result

def debug_meta_desc_missing_keyword(normalized_data):
    """Debug META_DESC_MISSING_KEYWORD rule"""
    print("\n" + "=" * 80)
    print("RULE 2: META_DESC_MISSING_KEYWORD")
    print("=" * 80)
    
    rule = MetaDescMissingKeywordRule()
    
    print("EVALUATE METHOD:")
    print("-" * 40)
    import inspect
    print(inspect.getsource(rule.evaluate))
    
    print("\nNORMALIZED DATA KEYS USED:")
    print("-" * 40)
    print("- meta_description (direct access)")
    print("- meta_tags.keywords (via _keyword_from_context)")
    print("- headings (via _keyword_from_context fallback)")
    
    print("\nRAW EXTRACTED VALUES:")
    print("-" * 40)
    from workers.seo.page_analysis.rules.categories.meta_rules import _keyword_from_context as meta_keyword_from_context
    desc = normalized_data.get("meta_description", "")
    print(f"meta_description: {repr(desc)}")
    
    meta_tags = normalized_data.get("meta_tags", {})
    keywords_list = meta_tags.get("keywords", [])
    print(f"meta_tags.keywords: {repr(keywords_list)}")
    
    headings = normalized_data.get("headings", [])
    print(f"headings: {repr(headings)}")
    
    print("\nTRANSFORMED/COMPUTED VALUES:")
    print("-" * 40)
    keyword = meta_keyword_from_context(normalized_data)
    print(f"keyword (from _keyword_from_context): {repr(keyword)}")
    print(f"keyword.lower(): {repr(keyword.lower() if keyword else '')}")
    print(f"desc.lower(): {repr(desc.lower() if desc else '')}")
    
    print("\nFINAL BOOLEAN CONDITION:")
    print("-" * 40)
    if not desc:
        print("Condition: desc is empty -> RETURN []")
        result = []
    elif not keyword:
        print("Condition: keyword is empty -> RETURN []")
        result = []
    else:
        condition_result = keyword.lower() not in desc.lower()
        print(f"Condition: keyword.lower() not in desc.lower()")
        print(f"Result: {condition_result}")
        if condition_result:
            print("-> ISSUE CREATED")
            result = ["issue_created"]
        else:
            print("-> RETURN []")
            result = []
    
    print("\nEXACT FAULTY LINE (if issue created):")
    print("-" * 40)
    if result:
        print("Line 123: if keyword.lower() not in desc.lower():")
        print("This line triggers the issue creation.")
    
    return result

def debug_og_url_invalid(normalized_data):
    """Debug OG_URL_INVALID rule (found as OG_VALID_URLS)"""
    print("\n" + "=" * 80)
    print("RULE 3: OG_URL_INVALID (actually OG_VALID_URLS)")
    print("=" * 80)
    
    rule = OgValidUrlsRule()
    
    print("EVALUATE METHOD:")
    print("-" * 40)
    import inspect
    print(inspect.getsource(rule.evaluate))
    
    print("\nNORMALIZED DATA KEYS USED:")
    print("-" * 40)
    print("- og_tags.og:image")
    print("- og_tags.og:url")
    
    print("\nRAW EXTRACTED VALUES:")
    print("-" * 40)
    og = normalized_data.get("og_tags", {})
    og_image = og.get("og:image", "")
    og_url = og.get("og:url", "")
    print(f"og_tags.og:image: {repr(og_image)}")
    print(f"og_tags.og:url: {repr(og_url)}")
    
    print("\nTRANSFORMED/COMPUTED VALUES:")
    print("-" * 40)
    from workers.seo.page_analysis.rules.categories.social_rules import _is_valid_url, safe_str
    
    for key, value in [("og:image", og_image), ("og:url", og_url)]:
        safe_value = safe_str(value)
        is_valid = _is_valid_url(safe_value)
        uses_http = safe_value.startswith("http://") if safe_value else False
        
        print(f"\n{key}:")
        print(f"  safe_str(): {repr(safe_value)}")
        print(f"  _is_valid_url(): {is_valid}")
        print(f"  starts with 'http://': {uses_http}")
    
    print("\nFINAL BOOLEAN CONDITION:")
    print("-" * 40)
    issues_found = []
    for key in ("og:image", "og:url"):
        value = safe_str(og.get(key, ""))
        if value:
            if not _is_valid_url(value):
                issues_found.append(f"{key} invalid URL")
            elif value.startswith("http://"):
                issues_found.append(f"{key} uses HTTP")
    
    print(f"issues_found: {issues_found}")
    condition_result = len(issues_found) > 0
    print(f"Condition: len(issues_found) > 0 -> {condition_result}")
    
    if condition_result:
        print("-> ISSUE CREATED")
        result = ["issue_created"]
    else:
        print("-> RETURN []")
        result = []
    
    print("\nEXACT FAULTY LINE (if issue created):")
    print("-" * 40)
    if result:
        print("Line 202: if issues_found:")
        print("This line triggers the issue creation.")
    
    return result

def debug_aria_landmarks_missing(normalized_data):
    """Debug ARIA_LANDMARKS_MISSING rule (found as ARIA_LANDMARKS)"""
    print("\n" + "=" * 80)
    print("RULE 4: ARIA_LANDMARKS_MISSING (actually ARIA_LANDMARKS)")
    print("=" * 80)
    
    rule = AriaLandmarksRule()
    
    print("EVALUATE METHOD:")
    print("-" * 40)
    import inspect
    print(inspect.getsource(rule.evaluate))
    
    print("\nNORMALIZED DATA KEYS USED:")
    print("-" * 40)
    print("- headless.domMetrics.ariaLandmarks")
    
    print("\nRAW EXTRACTED VALUES:")
    print("-" * 40)
    headless = normalized_data.get("headless", {})
    dom_metrics = headless.get("domMetrics", {})
    aria_landmarks = dom_metrics.get("ariaLandmarks", 0)
    print(f"headless.domMetrics.ariaLandmarks: {repr(aria_landmarks)}")
    
    print("\nTRANSFORMED/COMPUTED VALUES:")
    print("-" * 40)
    print(f"ariaLandmarks value: {aria_landmarks}")
    print(f"Type: {type(aria_landmarks)}")
    
    print("\nFINAL BOOLEAN CONDITION:")
    print("-" * 40)
    condition_result = aria_landmarks == 0
    print(f"Condition: aria_landmarks == 0 -> {condition_result}")
    
    if condition_result:
        print("-> ISSUE CREATED")
        result = ["issue_created"]
    else:
        print("-> RETURN []")
        result = []
    
    print("\nEXACT FAULTY LINE (if issue created):")
    print("-" * 40)
    if result:
        print("Line 201: if landmarks == 0:")
        print("This line triggers the issue creation.")
    
    return result

def debug_pagespeed_score(normalized_data):
    """Debug PAGESPEED_SCORE rule"""
    print("\n" + "=" * 80)
    print("RULE 5: PAGESPEED_SCORE")
    print("=" * 80)
    
    rule = PageSpeedScoreRule()
    
    print("EVALUATE METHOD:")
    print("-" * 40)
    import inspect
    print(inspect.getsource(rule.evaluate))
    
    print("\nNORMALIZED DATA KEYS USED:")
    print("-" * 40)
    print("- performance.performance_score (via _get_perf helper)")
    print("- performance.mobile.performance_score (device-specific)")
    
    print("\nRAW EXTRACTED VALUES:")
    print("-" * 40)
    perf = normalized_data.get("performance", {})
    print(f"performance dict: {repr(perf)}")
    
    # Check device-specific structure
    mobile_perf = perf.get("mobile", {})
    desktop_perf = perf.get("desktop", {})
    print(f"performance.mobile: {repr(mobile_perf)}")
    print(f"performance.desktop: {repr(desktop_perf)}")
    
    print("\nTRANSFORMED/COMPUTED VALUES:")
    print("-" * 40)
    from workers.seo.page_analysis.rules.categories.performance_rules import _get_perf
    
    mobile_data = _get_perf(normalized_data, "mobile")
    desktop_data = _get_perf(normalized_data, "desktop")
    default_data = _get_perf(normalized_data)
    
    print(f"_get_perf(normalized, 'mobile'): {repr(mobile_data)}")
    print(f"_get_perf(normalized, 'desktop'): {repr(desktop_data)}")
    print(f"_get_perf(normalized) [default]: {repr(default_data)}")
    
    # The rule uses default (mobile) device
    used_perf = _get_perf(normalized_data)
    score = used_perf.get("performance_score")
    print(f"performance_score selected: {repr(score)}")
    print(f"Type: {type(score)}")
    
    print("\nFINAL BOOLEAN CONDITION:")
    print("-" * 40)
    if score is not None:
        condition_result = score < 90
        print(f"Condition: score < 90 -> {condition_result}")
        
        if condition_result:
            print("-> ISSUE CREATED")
            result = ["issue_created"]
        else:
            print("-> RETURN []")
            result = []
    else:
        print("Condition: score is None -> RETURN []")
        result = []
    
    print("\nEXACT FAULTY LINE (if issue created):")
    print("-" * 40)
    if result:
        print("Line 100: if score is not None and score < 90:")
        print("This line triggers the issue creation.")
    
    return result

def create_sample_normalized_data():
    """Create sample normalized data for testing"""
    return {
        "title": "Best SEO Tools for 2024 | Complete Guide",
        "meta_description": "Discover the top SEO tools and software to boost your rankings in 2024.",
        "meta_tags": {
            "keywords": ["SEO tools, ranking software, optimization"]
        },
        "headings": [
            {"tag": "h1", "text": "SEO Tools Guide"}
        ],
        "og_tags": {
            "og:title": "Best SEO Tools for 2024",
            "og:description": "Complete guide to SEO tools",
            "og:image": "https://example.com/image.jpg",
            "og:url": "https://example.com/seo-tools"
        },
        "headless": {
            "domMetrics": {
                "ariaLandmarks": 0
            }
        },
        "performance": {
            "mobile": {
                "performance_score": 85
            },
            "desktop": {
                "performance_score": 92
            }
        }
    }

def main():
    """Main debugging function"""
    print("SEO RULE ENGINE FORENSIC DEBUG")
    print("=" * 80)
    print("Analyzing false-positive rules...")
    
    # Use sample data - in real usage, this would come from actual scraped data
    normalized_data = create_sample_normalized_data()
    
    print("\nSAMPLE NORMALIZED DATA:")
    print("-" * 40)
    print(json.dumps(normalized_data, indent=2))
    
    # Debug each rule
    results = {}
    results["TITLE_MISSING_KEYWORD"] = debug_title_missing_keyword(normalized_data)
    results["META_DESC_MISSING_KEYWORD"] = debug_meta_desc_missing_keyword(normalized_data)
    results["OG_URL_INVALID"] = debug_og_url_invalid(normalized_data)
    results["ARIA_LANDMARKS_MISSING"] = debug_aria_landmarks_missing(normalized_data)
    results["PAGESPEED_SCORE"] = debug_pagespeed_score(normalized_data)
    
    print("\n" + "=" * 80)
    print("SUMMARY OF ISSUES CREATED")
    print("=" * 80)
    for rule_name, result in results.items():
        status = "ISSUE CREATED" if result else "NO ISSUE"
        print(f"{rule_name}: {status}")
    
    print("\n" + "=" * 80)
    print("FORENSIC ANALYSIS COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    main()
