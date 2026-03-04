#!/usr/bin/env python3
"""
Diagnose incomplete scraper documents in seo_page_data collection
"""

import os
import sys
from bson.objectid import ObjectId

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, db
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def diagnose_incomplete_documents():
    """Analyze incomplete documents in seo_page_data"""
    
    print("🔍 DIAGNOSING INCOMPLETE SCRAPER DOCUMENTS")
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
    project_id = latest_job.get("project_id")
    
    print(f"📋 Latest Job ID: {job_id}")
    print(f"📋 Project ID: {project_id}")
    print(f"📋 Job Status: {latest_job.get('status')}")
    print(f"📋 Created: {latest_job.get('created_at')}")
    
    # Find all documents for this job
    all_docs = list(seo_page_data.find({
        "seo_jobId": job_id
    }))
    
    print(f"\n📊 Total documents for this job: {len(all_docs)}")
    
    # Analyze document completeness
    complete_docs = []
    incomplete_docs = []
    
    for doc in all_docs:
        # Count fields
        field_count = len([k for k in doc.keys() if not k.startswith('_')])
        
        # Check for critical content fields
        has_content = all([
            doc.get("title"),
            doc.get("meta_tags"),
            doc.get("content"),
            doc.get("images")
        ])
        
        if field_count >= 20 and has_content:
            complete_docs.append(doc)
        else:
            incomplete_docs.append(doc)
    
    print(f"✅ Complete documents: {len(complete_docs)}")
    print(f"❌ Incomplete documents: {len(incomplete_docs)}")
    
    # Analyze incomplete documents
    if incomplete_docs:
        print(f"\n🔍 INCOMPLETE DOCUMENTS ANALYSIS:")
        print("-" * 50)
        
        # Group by scrape_status
        status_groups = {}
        for doc in incomplete_docs:
            status = doc.get("scrape_status", "unknown")
            if status not in status_groups:
                status_groups[status] = []
            status_groups[status].append(doc)
        
        print(f"📋 Scrape Status Breakdown:")
        for status, docs in status_groups.items():
            print(f"   • {status}: {len(docs)} documents")
            
            # Show error messages for this status
            errors = set(doc.get("error", "no error") for doc in docs)
            if errors and "no error" not in errors:
                print(f"     Errors: {list(errors)[:3]}")  # Show first 3 unique errors
        
        # Show field analysis for incomplete docs
        print(f"\n📋 Field Analysis (Incomplete Docs):")
        sample_incomplete = incomplete_docs[0]
        print(f"   • Field count: {len([k for k in sample_incomplete.keys() if not k.startswith('_')])}")
        print(f"   • Fields present: {[k for k in sample_incomplete.keys() if not k.startswith('_')]}")
        
        # Check which critical fields are missing
        critical_fields = ["title", "meta_tags", "content", "images", "structured_data"]
        missing_critical = [f for f in critical_fields if not sample_incomplete.get(f)]
        print(f"   • Missing critical fields: {missing_critical}")
    
    # Show complete document sample for comparison
    if complete_docs:
        print(f"\n✅ COMPLETE DOCUMENT SAMPLE:")
        print("-" * 50)
        sample_complete = complete_docs[0]
        print(f"   • Field count: {len([k for k in sample_complete.keys() if not k.startswith('_')])}")
        print(f"   • Has title: {bool(sample_complete.get('title'))}")
        print(f"   • Has meta_tags: {bool(sample_complete.get('meta_tags'))}")
        print(f"   • Has content: {bool(sample_complete.get('content'))}")
        print(f"   • Has images: {bool(sample_complete.get('images'))}")
        print(f"   • Scrape status: {sample_complete.get('scrape_status', 'unknown')}")
    
    # Check for documents missing title field specifically
    missing_title = seo_page_data.count_documents({
        "seo_jobId": job_id,
        "title": {"$exists": False}
    })
    
    print(f"\n📋 Documents missing 'title' field: {missing_title}")
    
    # Check scrape_status distribution across all docs
    pipeline = [
        {"$match": {"seo_jobId": job_id}},
        {"$group": {"_id": "$scrape_status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    status_distribution = list(seo_page_data.aggregate(pipeline))
    print(f"\n📊 Complete Scrape Status Distribution:")
    for item in status_distribution:
        print(f"   • {item['_id'] or 'None'}: {item['count']} documents")
    
    return {
        "total_docs": len(all_docs),
        "complete_docs": len(complete_docs),
        "incomplete_docs": len(incomplete_docs),
        "missing_title": missing_title,
        "status_distribution": status_distribution,
        "job_id": job_id
    }

if __name__ == "__main__":
    diagnose_incomplete_documents()
