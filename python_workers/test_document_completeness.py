#!/usr/bin/env python3
"""
Test the document completeness check and show current job statistics
"""

import os
import sys
from bson.objectid import ObjectId

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, db
    from scraper.workers.seo.page_analysis.page_analysis import _is_document_complete, normalize_page_data
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def test_document_completeness():
    """Test the document completeness check with real data"""
    
    print("🧪 TESTING DOCUMENT COMPLETENESS CHECK")
    print("=" * 60)
    
    # Find the latest job
    latest_job = db.jobs.find_one(
        {"jobType": "PAGE_SCRAPING", "status": "completed"},
        sort=[("created_at", -1)]
    )
    
    if not latest_job:
        print("❌ No completed PAGE_SCRAPING job found")
        return
    
    job_id = latest_job["_id"]
    
    print(f"📋 Testing with Job ID: {job_id}")
    
    # Get documents for this job
    all_docs = list(seo_page_data.find({"seo_jobId": job_id}))
    print(f"📊 Total documents: {len(all_docs)}")
    
    # Test completeness check on each document
    complete_count = 0
    incomplete_count = 0
    skipped_docs = []
    
    for doc in all_docs:
        try:
            normalized = normalize_page_data(doc)
            is_complete = _is_document_complete(normalized)
            
            if is_complete:
                complete_count += 1
            else:
                incomplete_count += 1
                skipped_docs.append({
                    "url": doc.get("url", "unknown"),
                    "scrape_status": doc.get("scrape_status", "unknown"),
                    "error": doc.get("error", "no error"),
                    "missing_fields": [f for f in ["title", "content_text", "headings", "images"] 
                                     if not normalized.get(f)]
                })
        except Exception as e:
            print(f"❌ Error processing {doc.get('url', 'unknown')}: {e}")
            incomplete_count += 1
    
    print(f"\n📊 COMPLETENESS RESULTS:")
    print(f"   ✅ Complete documents: {complete_count}")
    print(f"   ❌ Incomplete documents: {incomplete_count}")
    print(f"   📊 Completeness rate: {(complete_count/len(all_docs)*100):.1f}%")
    
    # Show details of incomplete documents
    if skipped_docs:
        print(f"\n🔍 INCOMPLETE DOCUMENTS DETAILS:")
        for doc in skipped_docs:
            print(f"   • URL: {doc['url']}")
            print(f"     Status: {doc['scrape_status']}")
            print(f"     Error: {doc['error']}")
            print(f"     Missing: {doc['missing_fields']}")
            print()
    
    return {
        "total_docs": len(all_docs),
        "complete_count": complete_count,
        "incomplete_count": incomplete_count,
        "skipped_docs": skipped_docs
    }

def show_current_job_stats():
    """Show statistics for the current job's documents"""
    
    print("\n📈 CURRENT JOB STATISTICS")
    print("=" * 40)
    
    # Find the latest job
    latest_job = db.jobs.find_one(
        {"jobType": "PAGE_SCRAPING", "status": "completed"},
        sort=[("created_at", -1)]
    )
    
    if not latest_job:
        return
    
    job_id = latest_job["_id"]
    
    # Count documents with scrape_status != "SUCCESS"
    failed_docs = seo_page_data.count_documents({
        "seo_jobId": job_id,
        "scrape_status": {"$ne": "SUCCESS"}
    })
    
    # Count documents missing title field
    missing_title = seo_page_data.count_documents({
        "seo_jobId": job_id,
        "title": {"$exists": False}
    })
    
    # Count documents missing content
    missing_content = seo_page_data.count_documents({
        "seo_jobId": job_id,
        "content": {"$exists": False}
    })
    
    total_docs = seo_page_data.count_documents({"seo_jobId": job_id})
    
    print(f"📋 Job ID: {job_id}")
    print(f"📊 Total documents: {total_docs}")
    print(f"❌ Failed status (SUCCESS): {failed_docs}")
    print(f"❌ Missing title field: {missing_title}")
    print(f"❌ Missing content field: {missing_content}")
    
    # Show scrape status breakdown
    pipeline = [
        {"$match": {"seo_jobId": job_id}},
        {"$group": {"_id": "$scrape_status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    status_breakdown = list(seo_page_data.aggregate(pipeline))
    print(f"\n📊 Scrape Status Breakdown:")
    for status in status_breakdown:
        status_name = status['_id'] or 'None'
        print(f"   • {status_name}: {status['count']} documents")

if __name__ == "__main__":
    test_document_completeness()
    show_current_job_stats()
