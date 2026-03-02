"""
Test script to validate URL normalization in LINK_DISCOVERY
"""

import sys
sys.path.append('d:/new/Odito/python_workers')

from scraper.shared.utils import normalize_url

def test_url_normalization():
    """Test URL normalization with various edge cases"""
    
    test_cases = [
        # Basic protocol/www variations
        ("http://sapphiredigitalconnect.com", "https://sapphiredigitalconnect.com/"),
        ("https://sapphiredigitalconnect.com", "https://sapphiredigitalconnect.com/"),
        ("https://www.sapphiredigitalconnect.com", "https://www.sapphiredigitalconnect.com/"),
        ("http://www.sapphiredigitalconnect.com", "https://www.sapphiredigitalconnect.com/"),
        
        # Trailing slash variations
        ("https://sapphiredigitalconnect.com/", "https://sapphiredigitalconnect.com/"),
        ("https://sapphiredigitalconnect.com//", "https://sapphiredigitalconnect.com/"),
        
        # Path variations
        ("https://sapphiredigitalconnect.com/about", "https://sapphiredigitalconnect.com/about"),
        ("https://sapphiredigitalconnect.com/about/", "https://sapphiredigitalconnect.com/about"),
        
        # Tracking parameters
        ("https://sapphiredigitalconnect.com?utm_source=google", "https://sapphiredigitalconnect.com/"),
        ("https://sapphiredigitalconnect.com?utm_source=google&fbclid=123", "https://sapphiredigitalconnect.com/"),
        ("https://sapphiredigitalconnect.com?valid=param&utm_source=spam", "https://sapphiredigitalconnect.com/?valid=param"),
        
        # Fragments
        ("https://sapphiredigitalconnect.com#section", "https://sapphiredigitalconnect.com/"),
        ("https://sapphiredigitalconnect.com/about#contact", "https://sapphiredigitalconnect.com/about"),
        
        # Mixed case (preserve path case)
        ("HTTPS://WWW.Sapphiredigitalconnect.COM/ABOUT/", "https://www.sapphiredigitalconnect.com/ABOUT"),
        
        # URL encoded (decode %20 to space)
        ("https://sapphiredigitalconnect.com/search%20test", "https://sapphiredigitalconnect.com/search test"),
    ]
    
    print("Testing URL Normalization:")
    print("=" * 60)
    
    all_passed = True
    
    for input_url, expected in test_cases:
        result = normalize_url(input_url)
        status = "✅" if result == expected else "❌"
        
        if result != expected:
            all_passed = False
        
        print(f"{status} {input_url}")
        print(f"   Expected: {expected}")
        print(f"   Got:      {result}")
        print()
    
    print("=" * 60)
    if all_passed:
        print("🎉 All tests PASSED!")
    else:
        print("❌ Some tests FAILED!")
    
    return all_passed

if __name__ == "__main__":
    test_url_normalization()
