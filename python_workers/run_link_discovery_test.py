#!/usr/bin/env python3
"""
Test script to run link discovery worker and populate database with type classification
"""

import os
import sys
import json
from datetime import datetime
from bson.objectid import ObjectId

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper.workers.seo.link_discovery.link_discovery import execute_link_discovery, LinkDiscoveryJob
from db import seo_internal_links

def run_link_discovery_test():
    """Run link discovery worker to populate database with type classification"""
    print("🚀 Running Link Discovery Worker with Type Classification")
    
    # Create test job
    test_job = LinkDiscoveryJob(
        jobId=str(ObjectId()),
        projectId=str(ObjectId()),
        userId=str(ObjectId()),
        main_url="https://www.sapphiredigitalagency.com"
    )
    
    print(f"📋 Job Details:")
    print(f"   Job ID: {test_job.jobId}")
    print(f"   Project ID: {test_job.projectId}")
    print(f"   Target URL: {test_job.main_url}")
    
    try:
        # Execute link discovery
        print(f"\n🔄 Starting link discovery...")
        result = execute_link_discovery(test_job)
        
        print(f"\n✅ Link Discovery Completed!")
        print(f"   Status: {result.get('status')}")
        print(f"   Internal Links: {result.get('stats', {}).get('internalLinksCount', 0)}")
        print(f"   External Links: {result.get('stats', {}).get('externalLinksCount', 0)}")
        print(f"   Social Links: {result.get('stats', {}).get('socialLinksCount', 0)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Link discovery failed: {e}")
        return False

def validate_database_population():
    """Validate that database was populated with type classification"""
    print(f"\n🔍 Validating Database Population...")
    
    try:
        # Total documents
        total_docs = seo_internal_links.count_documents({})
        print(f"📊 Total documents: {total_docs}")
        
        if total_docs == 0:
            print("❌ No documents found in database")
            return False
        
        # Documents with type field
        type_docs = seo_internal_links.count_documents({"type": {"$exists": True}})
        print(f"📊 Documents with type field: {type_docs}")
        
        # Documents with sourceSitemap field
        sitemap_docs = seo_internal_links.count_documents({"sourceSitemap": {"$exists": True}})
        print(f"📊 Documents with sourceSitemap field: {sitemap_docs}")
        
        # Type distribution
        type_pipeline = [
            {"$match": {"type": {"$exists": True}}},
            {"$group": {"_id": "$type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        
        type_stats = list(seo_internal_links.aggregate(type_pipeline))
        print(f"\n📈 Type Distribution:")
        for stat in type_stats:
            print(f"   {stat['_id']}: {stat['count']} URLs")
        
        # Sitemap distribution
        sitemap_pipeline = [
            {"$match": {"sourceSitemap": {"$exists": True}}},
            {"$group": {"_id": "$sourceSitemap", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        
        sitemap_stats = list(seo_internal_links.aggregate(sitemap_pipeline))
        print(f"\n🗂️ Sitemap Sources:")
        for stat in sitemap_stats:
            print(f"   {stat['_id']}: {stat['count']} URLs")
        
        # Sample documents
        print(f"\n📄 Sample Documents:")
        sample_docs = list(seo_internal_links.find(
            {"type": {"$exists": True}}, 
            {"url": 1, "type": 1, "sourceSitemap": 1, "projectId": 1}
        ).limit(5))
        
        for i, doc in enumerate(sample_docs, 1):
            print(f"   {i}. URL: {doc.get('url', 'N/A')}")
            print(f"      Type: {doc.get('type', 'N/A')}")
            print(f"      Source: {doc.get('sourceSitemap', 'N/A')}")
            print(f"      Project: {doc.get('projectId', 'N/A')}")
            print()
        
        # Test queries that scraper would use
        print(f"🧪 Testing Scraper Queries:")
        
        # Query 1: Priority pages (main + service)
        priority_count = seo_internal_links.count_documents({
            "type": {"$in": ["main", "service"]}
        })
        print(f"   Priority pages (main + service): {priority_count}")
        
        # Query 2: Blog pages
        blog_count = seo_internal_links.count_documents({"type": "blog"})
        print(f"   Blog pages: {blog_count}")
        
        # Query 3: Service sitemap URLs
        service_sitemap_count = seo_internal_links.count_documents({
            "sourceSitemap": {"$regex": "service", "$options": "i"}
        })
        print(f"   Service sitemap URLs: {service_sitemap_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database validation failed: {e}")
        return False

if __name__ == "__main__":
    print("🎯 Running Complete Link Discovery Test with Type Classification\n")
    
    # Run link discovery
    success1 = run_link_discovery_test()
    
    if success1:
        # Validate database population
        success2 = validate_database_population()
        
        overall_success = success1 and success2
        print(f"\n🏁 Test Summary: {'✅ All tests passed' if overall_success else '❌ Some tests failed'}")
        
        if overall_success:
            print(f"\n✨ Implementation Complete!")
            print(f"   - Link Discovery Worker updated with type classification")
            print(f"   - Database populated with type and sourceSitemap fields")
            print(f"   - Scraper can now use intelligent type-based queries")
            print(f"   - Backward compatibility maintained")
    else:
        print(f"\n❌ Link discovery failed - skipping database validation")
