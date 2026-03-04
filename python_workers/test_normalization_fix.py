#!/usr/bin/env python3
"""
Test the fixed normalization function with real data from seo_page_data
"""

import os
import sys
import json
from bson.objectid import ObjectId

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, db
    from scraper.workers.seo.page_analysis.page_analysis import normalize_page_data
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def test_normalization_fix():
    """Test the normalization fix with real page data"""
    
    print("🧪 TESTING NORMALIZATION FIX")
    print("=" * 50)
    
    # Get the specific test URL
    test_url = "https://www.sapphiredigitalconnect.com/pay-per-click-shopping-ads"
    
    print(f"🔍 Testing URL: {test_url}")
    
    # Find the page data
    page = seo_page_data.find_one({"url": test_url})
    if not page:
        print(f"❌ Page not found in database: {test_url}")
        return
    
    print(f"✅ Found page data")
    
    # Test the normalization
    try:
        normalized = normalize_page_data(page)
        print(f"✅ Normalization successful")
        
        # Check key fields that were broken before
        print(f"\n📋 Key Field Validation:")
        print(f"  - URL: {normalized.get('url', 'MISSING')}")
        print(f"  - Title: {normalized.get('title', 'MISSING')}")
        print(f"  - Content text length: {len(normalized.get('content_text', ''))}")
        print(f"  - Word count: {normalized.get('word_count', 0)}")
        print(f"  - Meta description: {normalized.get('meta_description', 'MISSING')[:50]}...")
        print(f"  - Viewport: {normalized.get('viewport', 'MISSING')}")
        print(f"  - Headings count: {len(normalized.get('headings', []))}")
        
        # Check OG tags mapping
        og_tags = normalized.get('og_tags', {})
        print(f"\n🏷️  OG Tags (from meta_tags):")
        print(f"  - og:title: {og_tags.get('title', 'MISSING')}")
        print(f"  - og:description: {og_tags.get('description', 'MISSING')[:50]}...")
        print(f"  - og:image: {og_tags.get('image', 'MISSING')}")
        
        # Check meta_tags structure
        meta_tags = normalized.get('meta_tags', {})
        print(f"\n📄 Meta Tags structure:")
        print(f"  - keywords: {meta_tags.get('keywords', 'MISSING')}")
        print(f"  - robots: {meta_tags.get('robots', 'MISSING')}")
        print(f"  - charset: {meta_tags.get('charset', 'MISSING')}")
        
        # Show first few headings
        headings = normalized.get('headings', [])
        if headings:
            print(f"\n📝 First 3 Headings:")
            for i, h in enumerate(headings[:3]):
                print(f"  {i+1}. {h.get('tag', 'unknown')}: {h.get('text', 'no text')[:50]}")
        
        print(f"\n✅ Normalization fix appears to be working!")
        return True
        
    except Exception as e:
        print(f"❌ Normalization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_normalization_fix()
