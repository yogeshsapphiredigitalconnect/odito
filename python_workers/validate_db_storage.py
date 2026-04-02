#!/usr/bin/env python3
"""
Database validation script for sitemap-based URL type classification
"""

import os
import sys
from pymongo import MongoClient
from bson.objectid import ObjectId

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import seo_internal_links

def validate_database_storage():
    """Validate that URLs are stored with type and sourceSitemap fields"""
    print("🔍 Validating database storage...")
    
    try:
        # Count documents with type field
        type_count = seo_internal_links.count_documents({"type": {"$exists": True}})
        print(f"📊 Documents with 'type' field: {type_count}")
        
        # Count documents with sourceSitemap field
        sitemap_count = seo_internal_links.count_documents({"sourceSitemap": {"$exists": True}})
        print(f"📊 Documents with 'sourceSitemap' field: {sitemap_count}")
        
        # Get type distribution
        type_pipeline = [
            {"$match": {"type": {"$exists": True}}},
            {"$group": {"_id": "$type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        
        type_stats = list(seo_internal_links.aggregate(type_pipeline))
        print(f"\n📈 Type Distribution in Database:")
        for stat in type_stats:
            print(f"   {stat['_id']}: {stat['count']} URLs")
        
        # Get sitemap distribution
        sitemap_pipeline = [
            {"$match": {"sourceSitemap": {"$exists": True}}},
            {"$group": {"_id": "$sourceSitemap", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}  # Limit to top 10
        ]
        
        sitemap_stats = list(seo_internal_links.aggregate(sitemap_pipeline))
        print(f"\n🗂️ Top Sitemap Sources in Database:")
        for stat in sitemap_stats:
            print(f"   {stat['_id']}: {stat['count']} URLs")
        
        # Show sample documents
        print(f"\n📄 Sample Documents with Type Information:")
        sample_docs = list(seo_internal_links.find(
            {"type": {"$exists": True}}, 
            {"url": 1, "type": 1, "sourceSitemap": 1, "projectId": 1}
        ).limit(5))
        
        for doc in sample_docs:
            print(f"   URL: {doc.get('url', 'N/A')}")
            print(f"   Type: {doc.get('type', 'N/A')}")
            print(f"   Source: {doc.get('sourceSitemap', 'N/A')}")
            print(f"   Project: {doc.get('projectId', 'N/A')}")
            print("   ---")
        
        return True
        
    except Exception as e:
        print(f"❌ Database validation failed: {e}")
        return False

def test_type_queries():
    """Test the type-based queries that will be used by scraper"""
    print("\n🧪 Testing type-based queries...")
    
    try:
        # Test Query 1: Find service pages
        service_pages = list(seo_internal_links.find(
            {"type": "service"},
            {"url": 1, "sourceSitemap": 1}
        ).limit(3))
        
        print(f"✅ Query 1 - Service pages: Found {len(service_pages)} results")
        for page in service_pages:
            print(f"   {page.get('url')} (from {page.get('sourceSitemap', 'unknown')})")
        
        # Test Query 2: Find blog pages
        blog_pages = list(seo_internal_links.find(
            {"type": "blog"},
            {"url": 1, "sourceSitemap": 1}
        ).limit(3))
        
        print(f"✅ Query 2 - Blog pages: Found {len(blog_pages)} results")
        for page in blog_pages:
            print(f"   {page.get('url')} (from {page.get('sourceSitemap', 'unknown')})")
        
        # Test Query 3: Find URLs from service sitemaps
        service_sitemap_urls = list(seo_internal_links.find(
            {"sourceSitemap": {"$regex": "service", "$options": "i"}},
            {"url": 1, "type": 1, "sourceSitemap": 1}
        ).limit(3))
        
        print(f"✅ Query 3 - URLs from service sitemaps: Found {len(service_sitemap_urls)} results")
        for page in service_sitemap_urls:
            print(f"   {page.get('url')} → {page.get('type')} (from {page.get('sourceSitemap')})")
        
        # Test Query 4: Scraper priority query (main + service)
        priority_pages = list(seo_internal_links.find(
            {"type": {"$in": ["main", "service"]}},
            {"url": 1, "type": 1}
        ).limit(25))
        
        print(f"✅ Query 4 - Priority pages (main + service): Found {len(priority_pages)} results")
        type_counts = {}
        for page in priority_pages:
            page_type = page.get('type', 'unknown')
            type_counts[page_type] = type_counts.get(page_type, 0) + 1
        
        for page_type, count in type_counts.items():
            print(f"   {page_type}: {count} pages")
        
        return True
        
    except Exception as e:
        print(f"❌ Query testing failed: {e}")
        return False

def test_backward_compatibility():
    """Test that old documents without type fields still work"""
    print("\n🔄 Testing backward compatibility...")
    
    try:
        # Count documents without type field
        no_type_count = seo_internal_links.count_documents({"type": {"$exists": False}})
        print(f"📊 Documents without 'type' field: {no_type_count}")
        
        # Test that we can still query all documents
        all_docs = list(seo_internal_links.find({}, {"url": 1}).limit(5))
        print(f"✅ Can query all documents: Found {len(all_docs)} results")
        
        # Test that scraper fallback query works
        fallback_docs = list(seo_internal_links.find(
            {"$or": [
                {"type": {"$exists": False}},
                {"type": {"$in": ["main", "service"]}}
            ]},
            {"url": 1, "type": 1}
        ).limit(5))
        
        print(f"✅ Fallback query works: Found {len(fallback_docs)} results")
        for doc in fallback_docs:
            has_type = "type" in doc and doc["type"] is not None
            print(f"   {doc.get('url')} - has type: {has_type}")
        
        return True
        
    except Exception as e:
        print(f"❌ Backward compatibility test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Database Validation Tests\n")
    
    # Run all validation tests
    success1 = validate_database_storage()
    success2 = test_type_queries()
    success3 = test_backward_compatibility()
    
    overall_success = success1 and success2 and success3
    print(f"\n🏁 Validation Summary: {'✅ All tests passed' if overall_success else '❌ Some tests failed'}")
