#!/usr/bin/env python3
"""
Investigation script for suspicious rule behavior after fixes.
Checks actual data vs rule execution to identify remaining issues.
"""

import sys
import os
import json
from pathlib import Path

# Add the scraper path to import modules
scraper_path = Path(__file__).parent / "scraper"
sys.path.insert(0, str(scraper_path))

from workers.seo.page_analysis.rules.categories.performance_rules import PageSpeedScoreRule, _get_best_performance_score
from workers.seo.page_analysis.rules.categories.accessibility_rules import AriaLandmarksRule
from workers.seo.page_analysis.rules.categories.title_rules import TitleMissingKeywordRule, _keyword_from_context
from workers.seo.page_analysis.rules.categories.meta_rules import MetaDescMissingKeywordRule
from workers.seo.page_analysis.rules.categories.social_rules import OgValidUrlsRule

def investigate_pagespeed_score():
    """Investigate PAGESPEED_SCORE device selection"""
    print("=" * 80)
    print("🔍 INVESTIGATING PAGESPEED_SCORE DEVICE SELECTION")
    print("=" * 80)
    
    # Test data from user description
    test_data = {
        "performance": {
            "mobile": {
                "performance_score": 85
            },
            "desktop": {
                "performance_score": 90
            }
        }
    }
    
    print("TEST DATA:")
    print(json.dumps(test_data, indent=2))
    
    # Test the helper function
    score, device = _get_best_performance_score(test_data)
    print(f"\n_get_best_performance_score() result:")
    print(f"  score: {score}")
    print(f"  device: {device}")
    
    # Test the actual rule
    rule = PageSpeedScoreRule()
    # Use valid ObjectId format (24-char hex)
    issues = rule.evaluate(test_data, "507f1f77bcf86cd799439011", "507f1f77bcf86cd799439011", "https://example.com")
    
    print(f"\nRule evaluation result:")
    print(f"  Issues created: {len(issues)}")
    if issues:
        print(f"  Issue message: {issues[0].get('message', 'N/A')}")
    
    # Expected behavior analysis
    print(f"\n📊 EXPECTED BEHAVIOR ANALYSIS:")
    print(f"  Mobile score: 85 (below 90) → should fire issue")
    print(f"  Desktop score: 90 (meets threshold) → should pass")
    print(f"  Current logic: Use WORST score (85) → fires issue")
    print(f"  This is CORRECT if mobile-first approach")
    
    return score, device, len(issues) > 0

def investigate_aria_landmarks():
    """Investigate ARIA_LANDMARKS with actual data"""
    print("\n" + "=" * 80)
    print("🔍 INVESTIGATING ARIA_LANDMARKS")
    print("=" * 80)
    
    # Test data from user description - should have 1 landmark
    test_data = {
        "headless": {
            "domMetrics": {
                "ariaLandmarks": 1
            }
        }
    }
    
    print("TEST DATA:")
    print(json.dumps(test_data, indent=2))
    
    # Test the actual rule
    rule = AriaLandmarksRule()
    # Use valid ObjectId format (24-char hex)
    issues = rule.evaluate(test_data, "507f1f77bcf86cd799439011", "507f1f77bcf86cd799439011", "https://example.com")
    
    print(f"\nRule evaluation result:")
    print(f"  Issues created: {len(issues)}")
    if issues:
        print(f"  Issue message: {issues[0].get('message', 'N/A')}")
        print(f"  ❌ THIS IS WRONG - should NOT fire with ariaLandmarks=1")
    else:
        print(f"  ✅ CORRECT - no issues with ariaLandmarks=1")
    
    # Test edge cases
    print(f"\n🧪 EDGE CASE TESTING:")
    edge_cases = [
        {"headless": {"domMetrics": {"ariaLandmarks": 0}}, "desc": "0 landmarks"},
        {"headless": {"domMetrics": {"ariaLandmarks": None}}, "desc": "None landmarks"},
        {"headless": {"domMetrics": {}}, "desc": "Missing ariaLandmarks"},
    ]
    
    for case in edge_cases:
        issues = rule.evaluate(case, "507f1f77bcf86cd799439011", "507f1f77bcf86cd799439011", "https://example.com")
        expected = case["desc"]
        fires = len(issues) > 0
        print(f"  {expected}: {'FIRES' if fires else 'PASSES'}")
    
    return len(issues) > 0

def investigate_keyword_extraction():
    """Investigate keyword extraction for title and meta description"""
    print("\n" + "=" * 80)
    print("🔍 INVESTIGATING KEYWORD EXTRACTION")
    print("=" * 80)
    
    # Test data from user description
    test_data = {
        "title": "Digital Marketing Agency - Sapphire Digital Connect",
        "meta_description": "Sapphire Digital Connect is a leading digital marketing agency offering comprehensive digital marketing solutions.",
        "meta_tags": {
            "keywords": ["digital marketing agency", "SEO services", "web design"]
        },
        "headings": [
            {"tag": "h1", "text": "Digital Marketing Agency"}
        ]
    }
    
    print("TEST DATA:")
    print(json.dumps(test_data, indent=2))
    
    # Test keyword extraction
    keyword = _keyword_from_context(test_data)
    print(f"\nExtracted keyword: {repr(keyword)}")
    
    # Test title rule
    title_rule = TitleMissingKeywordRule()
    # Use valid ObjectId format (24-char hex)
    title_issues = title_rule.evaluate(test_data, "507f1f77bcf86cd799439011", "507f1f77bcf86cd799439011", "https://example.com")
    
    print(f"\nTITLE_MISSING_KEYWORD result:")
    print(f"  Issues created: {len(title_issues)}")
    if title_issues:
        print(f"  Issue message: {title_issues[0].get('message', 'N/A')}")
        print(f"  ❌ FALSE POSITIVE - keyword '{keyword}' found in title")
    else:
        print(f"  ✅ CORRECT - keyword found in title")
    
    # Test meta description rule
    meta_rule = MetaDescMissingKeywordRule()
    # Use valid ObjectId format (24-char hex)
    meta_issues = meta_rule.evaluate(test_data, "507f1f77bcf86cd799439011", "507f1f77bcf86cd799439011", "https://example.com")
    
    print(f"\nMETA_DESC_MISSING_KEYWORD result:")
    print(f"  Issues created: {len(meta_issues)}")
    if meta_issues:
        print(f"  Issue message: {meta_issues[0].get('message', 'N/A')}")
        print(f"  ❌ FALSE POSITIVE - keyword '{keyword}' found in description")
    else:
        print(f"  ✅ CORRECT - keyword found in description")
    
    # Debug the actual comparison
    title = test_data.get("title", "")
    desc = test_data.get("meta_description", "")
    print(f"\n🔍 DEBUG COMPARISON:")
    print(f"  Title: {repr(title)}")
    print(f"  Keyword: {repr(keyword)}")
    print(f"  Keyword in title: {keyword.lower() in title.lower() if keyword else False}")
    print(f"  Description: {repr(desc)}")
    print(f"  Keyword in desc: {keyword.lower() in desc.lower() if keyword else False}")
    
    return len(title_issues) > 0, len(meta_issues) > 0

def investigate_og_urls():
    """Investigate OG URL validation"""
    print("\n" + "=" * 80)
    print("🔍 INVESTIGATING OG URL VALIDATION")
    print("=" * 80)
    
    # Test various OG URL scenarios
    test_cases = [
        {
            "name": "Valid absolute URL",
            "data": {
                "og_tags": {
                    "og:url": "https://example.com/page"
                }
            },
            "base_url": "https://example.com",
            "should_fire": False
        },
        {
            "name": "Relative URL",
            "data": {
                "og_tags": {
                    "og:url": "/page"
                }
            },
            "base_url": "https://example.com",
            "should_fire": False  # Should be resolved and pass
        },
        {
            "name": "HTTP URL",
            "data": {
                "og_tags": {
                    "og:url": "http://example.com/page"
                }
            },
            "base_url": "https://example.com",
            "should_fire": True  # HTTP should fire
        },
        {
            "name": "Invalid URL",
            "data": {
                "og_tags": {
                    "og:url": "not-a-url"
                }
            },
            "base_url": "https://example.com",
            "should_fire": True
        },
        {
            "name": "Empty URL",
            "data": {
                "og_tags": {
                    "og:url": ""
                }
            },
            "base_url": "https://example.com",
            "should_fire": False
        }
    ]
    
    rule = OgValidUrlsRule()
    
    for case in test_cases:
        print(f"\n🧪 Testing: {case['name']}")
        print(f"  og:url: {repr(case['data']['og_tags']['og:url'])}")
        print(f"  base_url: {case['base_url']}")
        
        issues = rule.evaluate(case["data"], "507f1f77bcf86cd799439011", "507f1f77bcf86cd799439011", case["base_url"])
        fires = len(issues) > 0
        expected = case['should_fire']
        
        print(f"  Expected: {'FIRE' if expected else 'PASS'}")
        print(f"  Actual: {'FIRES' if fires else 'PASSES'}")
        
        if fires != expected:
            print(f"  ❌ MISMATCH!")
            if issues:
                print(f"  Issue: {issues[0].get('message', 'N/A')}")
        else:
            print(f"  ✅ CORRECT")
    
    return True  # Return True if any issues found

def main():
    """Main investigation function"""
    print("🚨 SEO RULE ENGINE POST-FIX INVESTIGATION")
    print("=" * 80)
    print("Checking if fixes resolved false positives...")
    
    results = {}
    
    # Investigate each suspicious case
    results['pagespeed'] = investigate_pagespeed_score()
    results['aria'] = investigate_aria_landmarks()
    title_fp, meta_fp = investigate_keyword_extraction()
    results['title_keyword'] = title_fp
    results['meta_keyword'] = meta_fp
    results['og_urls'] = investigate_og_urls()
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 INVESTIGATION SUMMARY")
    print("=" * 80)
    
    print(f"PAGESPEED_SCORE: {'❌ STILL FIRES' if results['pagespeed'][2] else '✅ FIXED'}")
    print(f"  - Score used: {results['pagespeed'][0]} from {results['pagespeed'][1]}")
    print(f"  - Mobile-first logic: {'CORRECT' if results['pagespeed'][1] == 'mobile' else 'CHECK'}")
    
    print(f"ARIA_LANDMARKS: {'❌ STILL FIRES' if results['aria'] else '✅ FIXED'}")
    
    print(f"TITLE_MISSING_KEYWORD: {'❌ FALSE POSITIVE' if results['title_keyword'] else '✅ FIXED'}")
    
    print(f"META_DESC_MISSING_KEYWORD: {'❌ FALSE POSITIVE' if results['meta_keyword'] else '✅ FIXED'}")
    
    print(f"OG_VALID_URLS: {'❌ ISSUES FOUND' if results['og_urls'] else '✅ FIXED'}")
    
    # Recommendations
    print(f"\n🎯 RECOMMENDATIONS:")
    if results['aria']:
        print("  - ARIA_LANDMARKS fix may not be working - check data path")
    if results['title_keyword'] or results['meta_keyword']:
        print("  - Keyword extraction still has issues - debug _keyword_from_context")
    if results['pagespeed'][2]:
        print("  - PAGESPEED_SCORE behavior: confirm if mobile-first is intended")
    
    print(f"\n✅ Investigation complete!")

if __name__ == "__main__":
    main()
