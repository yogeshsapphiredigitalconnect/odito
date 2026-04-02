#!/usr/bin/env python3
"""
Test script for sitemap-based URL type classification
"""

import sys
import os

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper.shared.recursive_sitemap import classify_sitemap_type, discover_all_sitemap_urls

def test_classification():
    """Test the sitemap classification function"""
    print("🧪 Testing sitemap type classification...")
    
    test_cases = [
        ("https://example.com/services-sitemap.xml", "service"),
        ("https://example.com/service-sitemap.xml", "service"),
        ("https://example.com/blog-sitemap.xml", "blog"),
        ("https://example.com/post-sitemap.xml", "blog"),
        ("https://example.com/page-sitemap.xml", "main"),
        ("https://example.com/standard-pages-sitemap.xml", "main"),
        ("https://example.com/category-sitemap.xml", "category"),
        ("https://example.com/unknown-sitemap.xml", "other"),
        ("https://example.com/sitemap.xml", "other"),
    ]
    
    for url, expected in test_cases:
        result = classify_sitemap_type(url)
        status = "✅" if result == expected else "❌"
        print(f"{status} {url} → {result} (expected: {expected})")

def test_discovery():
    """Test the discovery with a real site"""
    print("\n🔍 Testing sitemap discovery with classification...")
    
    # Test with a site that likely has multiple sitemaps
    test_url = "https://www.sapphiredigitalagency.com"
    
    try:
        urls, url_metadata, stats = discover_all_sitemap_urls(
            test_url, 
            max_depth=3,  # Limit depth for testing
            max_sitemaps=10  # Limit sitemaps for testing
        )
        
        print(f"📊 Discovery Results:")
        print(f"   Total URLs: {len(urls)}")
        print(f"   URLs with metadata: {len(url_metadata)}")
        print(f"   Sitemaps processed: {stats['sitemaps_processed']}")
        print(f"   Sitemap indexes: {stats['sitemap_indexes_found']}")
        print(f"   URL sets: {stats['urlsets_found']}")
        
        # Analyze types found
        type_counts = {}
        sitemap_counts = {}
        
        for url, metadata in url_metadata.items():
            url_type = metadata.get('type', 'unknown')
            source_sitemap = metadata.get('sourceSitemap', 'unknown')
            
            type_counts[url_type] = type_counts.get(url_type, 0) + 1
            sitemap_counts[source_sitemap] = sitemap_counts.get(source_sitemap, 0) + 1
        
        print(f"\n📈 Type Distribution:")
        for url_type, count in sorted(type_counts.items()):
            print(f"   {url_type}: {count} URLs")
        
        print(f"\n🗂️ Sitemap Sources:")
        for sitemap, count in sorted(sitemap_counts.items()):
            print(f"   {sitemap}: {count} URLs")
        
        # Show sample URLs with types
        print(f"\n🔗 Sample URLs with types:")
        for i, (url, metadata) in enumerate(list(url_metadata.items())[:5]):
            print(f"   {url} → {metadata.get('type', 'unknown')} (from {metadata.get('sourceSitemap', 'unknown')})")
        
        return True
        
    except Exception as e:
        print(f"❌ Discovery test failed: {e}")
        return False

def validate_priority_logic():
    """Test type priority resolution"""
    print("\n⚖️ Testing type priority logic...")
    
    from scraper.shared.recursive_sitemap import TYPE_PRIORITY
    
    print("Type Priorities (lower = higher priority):")
    for type_name, priority in sorted(TYPE_PRIORITY.items(), key=lambda x: x[1]):
        print(f"   {type_name}: {priority}")
    
    # Test priority comparisons
    test_cases = [
        ("main", "service", "main"),
        ("service", "blog", "service"),
        ("blog", "category", "blog"),
        ("other", "main", "main"),
    ]
    
    for type1, type2, expected_winner in test_cases:
        priority1 = TYPE_PRIORITY.get(type1, 99)
        priority2 = TYPE_PRIORITY.get(type2, 99)
        
        winner = type1 if priority1 < priority2 else type2
        status = "✅" if winner == expected_winner else "❌"
        
        print(f"{status} {type1}({priority1}) vs {type2}({priority2}) → {winner}")

if __name__ == "__main__":
    print("🚀 Starting Sitemap Type Classification Tests\n")
    
    # Run all tests
    test_classification()
    validate_priority_logic()
    success = test_discovery()
    
    print(f"\n🏁 Test Summary: {'✅ All tests passed' if success else '❌ Some tests failed'}")
