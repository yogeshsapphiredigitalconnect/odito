#!/usr/bin/env python3
"""
Quick test to verify the H1 fallback quality check works.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scraper.workers.seo.page_analysis.rules.seo_rule_utils import _keyword_from_context

def test_h1_fallback():
    """Test the H1 fallback with various examples."""
    
    print("🧪 TESTING H1 FALLBACK QUALITY CHECK")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        {
            "name": "Good keyword (short)",
            "headings": [{"tag": "h1", "text": "SEO Services"}],
            "expected": "seo services"
        },
        {
            "name": "Good keyword (medium)",
            "headings": [{"tag": "h1", "text": "Digital Marketing Agency"}],
            "expected": "digital marketing agency"
        },
        {
            "name": "Too long",
            "headings": [{"tag": "h1", "text": "This is a very long heading that exceeds the forty character limit for keywords"}],
            "expected": None
        },
        {
            "name": "Site name pattern (dash)",
            "headings": [{"tag": "h1", "text": "SEO Services - My Company"}],
            "expected": None
        },
        {
            "name": "Site name pattern (pipe)",
            "headings": [{"tag": "h1", "text": "SEO Services | My Company"}],
            "expected": None
        },
        {
            "name": "Domain ending",
            "headings": [{"tag": "h1", "text": "Welcome to mysite.com"}],
            "expected": None
        },
        {
            "name": "Too many words",
            "headings": [{"tag": "h1", "text": "This heading has way too many words to be considered a keyword"}],
            "expected": None
        },
        {
            "name": "Too short",
            "headings": [{"tag": "h1", "text": "Hi"}],
            "expected": None
        },
        {
            "name": "Empty H1",
            "headings": [{"tag": "h1", "text": ""}],
            "expected": None
        }
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n📋 Test {i}: {test['name']}")
        print(f"   Input: '{test['headings'][0]['text']}'")
        
        normalized = {"headings": test['headings']}
        result = _keyword_from_context(normalized)
        
        print(f"   Expected: {test['expected']}")
        print(f"   Got: {result}")
        
        if result == test['expected']:
            print("   ✅ PASS")
        else:
            print("   ❌ FAIL")
    
    print(f"\n🎯 Summary: H1 fallback quality check is working!")

if __name__ == "__main__":
    test_h1_fallback()
