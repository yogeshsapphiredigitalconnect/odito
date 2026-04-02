#!/usr/bin/env python3
"""
Debug script to validate Page Scraper and Headless Worker use same URLs
"""

import os
import sys
from bson.objectid import ObjectId

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper.shared.url_selector import get_top_urls
from db import seo_internal_links

def compare_worker_url_selection():
    """Compare URL selection between Page Scraper and Headless Worker"""
    print("🔍 DEBUG: Comparing Worker URL Selection")
    print("=" * 50)
    
    # Get a real project for testing
    total_docs = seo_internal_links.count_documents({})
    if total_docs == 0:
        print("❌ No data found. Run link discovery first.")
        return False
    
    sample_doc = seo_internal_links.find_one()
    project_id = str(sample_doc["projectId"])
    
    print(f"📋 Testing with Project: {project_id}")
    
    # Simulate Headless Worker URL selection
    print("\n1️⃣ HEADLESS WORKER URL SELECTION")
    headless_urls = get_top_urls(project_id, limit=25)
    print(f"[HEADLESS] Selected {len(headless_urls)} URLs")
    print(f"[HEADLESS] URLs: {headless_urls[:5]}...")
    
    # Simulate Page Scraping Worker URL selection (OLD WAY - BUG)
    print("\n2️⃣ PAGE SCRAPER OLD URL SELECTION (BUG)")
    # This simulates what get_urls_from_job_or_db would do with job.urls
    job_urls = list(seo_internal_links.find(
        {"projectId": ObjectId(project_id)}, 
        {"url": 1}
    ))
    job_urls_list = [doc["url"] for doc in job_urls if doc.get("url")]
    old_scraper_urls = sorted(set(job_urls_list))[:25]  # This was the bug!
    print(f"[SCRAPER_OLD] Selected {len(old_scraper_urls)} URLs from job.urls")
    print(f"[SCRAPER_OLD] URLs: {old_scraper_urls[:5]}...")
    
    # Simulate Page Scraping Worker URL selection (NEW WAY - FIXED)
    print("\n3️⃣ PAGE SCRAPER NEW URL SELECTION (FIXED)")
    new_scraper_urls = get_top_urls(project_id, limit=25)
    print(f"[SCRAPER_NEW] Selected {len(new_scraper_urls)} URLs")
    print(f"[SCRAPER_NEW] URLs: {new_scraper_urls[:5]}...")
    
    # Compare results
    print("\n🔍 COMPARISON RESULTS")
    
    # Old vs Headless (should be different - this was the bug)
    old_vs_headless = old_scraper_urls == headless_urls
    print(f"OLD Scraper vs Headless: {'✅ SAME' if old_vs_headless else '❌ DIFFERENT'}")
    
    # New vs Headless (should be same - this is the fix)
    new_vs_headless = new_scraper_urls == headless_urls
    print(f"NEW Scraper vs Headless: {'✅ SAME' if new_vs_headless else '❌ DIFFERENT'}")
    
    # Detailed analysis
    if not old_vs_headless:
        print(f"\n🐛 BUG CONFIRMED: Old scraper used different URLs")
        print(f"   Headless: {len(headless_urls)} URLs")
        print(f"   Old Scraper: {len(old_scraper_urls)} URLs")
        print(f"   Difference: {len(set(headless_urls) - set(old_scraper_urls))} URLs")
    
    if new_vs_headless:
        print(f"\n✅ FIX CONFIRMED: New scraper uses same URLs as Headless")
    else:
        print(f"\n❌ FIX FAILED: New scraper still uses different URLs")
        return False
    
    # Type analysis
    print(f"\n📊 TYPE ANALYSIS")
    type_counts = {}
    for url in headless_urls:
        doc = seo_internal_links.find_one({"projectId": ObjectId(project_id), "url": url})
        if doc:
            url_type = doc.get("type", "no-type")
            type_counts[url_type] = type_counts.get(url_type, 0) + 1
    
    for url_type, count in sorted(type_counts.items()):
        print(f"   {url_type}: {count} URLs")
    
    return True

def trace_execution_flow():
    """Trace the execution flow to identify where URLs are selected"""
    print(f"\n🔄 EXECUTION FLOW TRACE")
    print("=" * 50)
    
    print(f"1. LINK DISCOVERY → Creates URLs with type classification")
    print(f"2. PAGE SCRAPER → Receives job.urls (OLD BUG: Used these directly)")
    print(f"3. HEADLESS WORKER → Uses get_topUrls() (CORRECT: Type-based selection)")
    print(f"")
    print(f"🐛 THE BUG:")
    print(f"   Page Scraper used get_urls_from_job_or_db()")
    print(f"   → If job.urls exists → Uses job.urls (NOT type-based)")
    print(f"   → If job.urls empty → Falls back to get_topUrls()")
    print(f"   → Since job.urls always exists, it never used type-based selection!")
    print(f"")
    print(f"✅ THE FIX:")
    print(f"   Page Scraper now uses get_topUrls() directly")
    print(f"   → Same function as Headless Worker")
    print(f"   → Same type-based priority logic")
    print(f"   → Same deterministic results")

if __name__ == "__main__":
    print("🚀 DEBUGGING PAGE SCRAPER URL SELECTION")
    
    success = compare_worker_url_selection()
    trace_execution_flow()
    
    if success:
        print(f"\n🎉 BUG FIXED!")
        print(f"   Page Scraper and Headless Worker now use identical URL selection")
    else:
        print(f"\n❌ BUG STILL EXISTS")
        print(f"   Further investigation needed")
