#!/usr/bin/env python3
"""
Quick test to see if debug prints appear
"""

import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def quick_test():
    print("🧪 QUICK DEBUG TEST")
    print("=" * 30)
    
    # Import and run a minimal test
    try:
        from scraper.workers.seo.page_analysis.page_analysis import _normalize_lookup_url
        
        # Test the normalize function
        test_url = "https://www.sapphiredigitalconnect.com/"
        normalized = _normalize_lookup_url(test_url)
        
        print(f"[DEBUG] Original URL: {test_url}")
        print(f"[DEBUG] Normalized URL: {normalized}")
        
        # Test with trailing slash
        test_url2 = "https://www.sapphiredigitalconnect.com"
        normalized2 = _normalize_lookup_url(test_url2)
        
        print(f"[DEBUG] Original URL 2: {test_url2}")
        print(f"[DEBUG] Normalized URL 2: {normalized2}")
        
        print(f"[DEBUG] URLs match: {normalized == normalized2}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    quick_test()
