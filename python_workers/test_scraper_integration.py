#!/usr/bin/env python3
"""
Integration test showing how scraper can use the new type field
"""

import os
import sys
from pymongo import MongoClient
from bson.objectid import ObjectId

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import seo_internal_links

def demonstrate_scraper_integration():
    """Demonstrate how the scraper can use type-based URL selection"""
    print("🎯 Demonstrating Scraper Integration with Type Classification")
    
    # Get a recent project for testing
    recent_project = seo_internal_links.find_one(
        {"type": {"$exists": True}}, 
        sort=[("discoveredAt", -1)]
    )
    
    if not recent_project:
        print("❌ No project with type data found. Run link discovery first.")
        return False
    
    project_id = recent_project.get("projectId")
    print(f"📂 Using Project ID: {project_id}")
    
    try:
        # Strategy 1: Priority-based selection (main + service pages first)
        print("\n🔥 Strategy 1: Priority-based Selection")
        priority_urls = list(seo_internal_links.find(
            {
                "projectId": project_id,
                "type": {"$in": ["main", "service"]}
            },
            {"url": 1, "type": 1, "sourceSitemap": 1}
        ).limit(25))
        
        print(f"   Found {len(priority_urls)} priority URLs (main + service)")
        type_breakdown = {}
        for url_doc in priority_urls:
            url_type = url_doc.get("type", "unknown")
            type_breakdown[url_type] = type_breakdown.get(url_type, 0) + 1
        
        for url_type, count in type_breakdown.items():
            print(f"   - {url_type}: {count} URLs")
        
        # Strategy 2: Balanced selection (mix of all types)
        print("\n⚖️ Strategy 2: Balanced Selection")
        balanced_urls = []
        
        # Get URLs from each type
        for url_type in ["main", "service", "blog", "category"]:
            type_urls = list(seo_internal_links.find(
                {
                    "projectId": project_id,
                    "type": url_type
                },
                {"url": 1, "type": 1}
            ).limit(8))  # 8 from each type = 32 total
            
            balanced_urls.extend(type_urls)
            print(f"   - {url_type}: {len(type_urls)} URLs")
        
        print(f"   Total balanced URLs: {len(balanced_urls)}")
        
        # Strategy 3: Content-focused selection (blogs + categories)
        print("\n📝 Strategy 3: Content-focused Selection")
        content_urls = list(seo_internal_links.find(
            {
                "projectId": project_id,
                "type": {"$in": ["blog", "category"]}
            },
            {"url": 1, "type": 1, "sourceSitemap": 1}
        ).limit(25))
        
        print(f"   Found {len(content_urls)} content URLs (blog + category)")
        content_breakdown = {}
        for url_doc in content_urls:
            url_type = url_doc.get("type", "unknown")
            content_breakdown[url_type] = content_breakdown.get(url_type, 0) + 1
        
        for url_type, count in content_breakdown.items():
            print(f"   - {url_type}: {count} URLs")
        
        # Strategy 4: Fallback for old data (no type field)
        print("\n🔄 Strategy 4: Fallback for Old Data")
        fallback_urls = list(seo_internal_links.find(
            {
                "projectId": project_id,
                "$or": [
                    {"type": {"$exists": False}},
                    {"type": None}
                ]
            },
            {"url": 1}
        ).limit(10))
        
        print(f"   Found {len(fallback_urls)} URLs without type (fallback)")
        
        # Show sample URLs from each strategy
        print("\n🔗 Sample URLs by Strategy:")
        
        print("\n   Priority Strategy Sample:")
        for i, url_doc in enumerate(priority_urls[:3]):
            print(f"     {i+1}. {url_doc.get('url')} [{url_doc.get('type')}]")
        
        print("\n   Content Strategy Sample:")
        for i, url_doc in enumerate(content_urls[:3]):
            print(f"     {i+1}. {url_doc.get('url')} [{url_doc.get('type')}]")
        
        return True
        
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False

def show_scraper_query_examples():
    """Show example queries that the scraper can use"""
    print("\n📋 Scraper Query Examples:")
    
    # Sample project ID for demonstration
    sample_project_id = ObjectId("507f1f77bcf86cd799439011")
    
    examples = [
        {
            "name": "Get priority pages (main + service)",
            "query": {
                "projectId": sample_project_id,
                "type": {"$in": ["main", "service"]}
            },
            "limit": 25
        },
        {
            "name": "Get blog content only",
            "query": {
                "projectId": sample_project_id,
                "type": "blog"
            },
            "limit": 20
        },
        {
            "name": "Get all service pages",
            "query": {
                "projectId": sample_project_id,
                "sourceSitemap": {"$regex": "service", "$options": "i"}
            },
            "limit": 30
        },
        {
            "name": "Fallback for mixed data (with and without type)",
            "query": {
                "projectId": sample_project_id,
                "$or": [
                    {"type": {"$in": ["main", "service"]}},
                    {"type": {"$exists": False}}
                ]
            },
            "limit": 25
        }
    ]
    
    for i, example in enumerate(examples, 1):
        print(f"\n   {i}. {example['name']}")
        print(f"      Query: {example['query']}")
        print(f"      Limit: {example['limit']}")

if __name__ == "__main__":
    print("🚀 Starting Scraper Integration Test\n")
    
    success = demonstrate_scraper_integration()
    show_scraper_query_examples()
    
    print(f"\n🏁 Integration Test: {'✅ Success' if success else '❌ Failed'}")
    
    if success:
        print("\n✨ Next Steps:")
        print("   1. Update page scraper worker to use type-based queries")
        print("   2. Add type-aware sampling strategies")
        print("   3. Monitor classification accuracy in production")
        print("   4. Consider adding content-based classification override")
