#!/usr/bin/env python3
"""
Check the jobs collection for keyword data at the job level.
"""

import os
import sys
import json
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import db
    jobs = db["jobs"]
except ImportError as e:
    print(f"❌ Failed to import db: {e}")
    sys.exit(1)

def check_jobs_collection():
    """Check jobs collection for keyword data."""
    
    print("🔍 CHECKING JOBS COLLECTION FOR KEYWORD DATA")
    print("=" * 50)
    
    # Get a sample job document
    job_sample = jobs.find_one()
    if job_sample:
        print(f"Found sample job with ID: {job_sample.get('_id', 'N/A')}")
        print(f"Job type: {job_sample.get('type', 'N/A')}")
        print(f"Status: {job_sample.get('status', 'N/A')}")
        
        # Check for keyword fields at job level
        print(f"\n🔍 Job-level keyword analysis:")
        print(f"  - target_keyword: {job_sample.get('target_keyword', 'NOT FOUND')}")
        print(f"  - primary_keyword: {job_sample.get('primary_keyword', 'NOT FOUND')}")
        print(f"  - keywords: {job_sample.get('keywords', 'NOT FOUND')}")
        print(f"  - focus_keyword: {job_sample.get('focus_keyword', 'NOT FOUND')}")
        print(f"  - main_keyword: {job_sample.get('main_keyword', 'NOT FOUND')}")
        
        # Check if there's a config or settings object with keywords
        config = job_sample.get('config', {})
        settings = job_sample.get('settings', {})
        metadata = job_sample.get('metadata', {})
        
        print(f"\n🔍 Nested keyword analysis:")
        print(f"  - config.target_keyword: {config.get('target_keyword', 'NOT FOUND')}")
        print(f"  - config.keywords: {config.get('keywords', 'NOT FOUND')}")
        print(f"  - settings.target_keyword: {settings.get('target_keyword', 'NOT FOUND')}")
        print(f"  - settings.keywords: {settings.get('keywords', 'NOT FOUND')}")
        print(f"  - metadata.target_keyword: {metadata.get('target_keyword', 'NOT FOUND')}")
        print(f"  - metadata.keywords: {metadata.get('keywords', 'NOT FOUND')}")
        
        # Show full job structure (truncated)
        print(f"\n📋 Full job keys:")
        for key in sorted(job_sample.keys()):
            value = job_sample[key]
            if isinstance(value, (str, int, float, bool)):
                if len(str(value)) < 100:
                    print(f"  - {key}: {value}")
                else:
                    print(f"  - {key}: [string too long: {len(str(value))} chars]")
            elif isinstance(value, list):
                print(f"  - {key}: [list with {len(value)} items]")
            elif isinstance(value, dict):
                print(f"  - {key}: {{dict with {len(value)} keys}}")
            else:
                print(f"  - {key}: {type(value)}")
    else:
        print("❌ No documents found in jobs collection")
    
    # Check multiple jobs for keyword data
    print(f"\n\n🔍 CHECKING MULTIPLE JOBS:")
    print("-" * 30)
    
    jobs_with_keywords = 0
    total_jobs_examined = 0
    
    for job in jobs.find().limit(5):
        total_jobs_examined += 1
        job_id = str(job.get('_id', 'N/A'))
        job_type = job.get('type', 'N/A')
        
        has_target_keyword = 'target_keyword' in job and job['target_keyword']
        has_primary_keyword = 'primary_keyword' in job and job['primary_keyword']
        has_keywords = 'keywords' in job and job['keywords']
        
        # Check nested objects
        config_keywords = job.get('config', {}).get('keywords', None)
        settings_keywords = job.get('settings', {}).get('keywords', None)
        metadata_keywords = job.get('metadata', {}).get('keywords', None)
        
        has_any_keywords = (has_target_keyword or has_primary_keyword or has_keywords 
                          or config_keywords or settings_keywords or metadata_keywords)
        
        if has_any_keywords:
            jobs_with_keywords += 1
            print(f"\n📄 Job {total_jobs_examined} ({job_type}): {job_id}")
            print(f"  - target_keyword: {job.get('target_keyword', 'NOT FOUND')}")
            print(f"  - primary_keyword: {job.get('primary_keyword', 'NOT FOUND')}")
            print(f"  - keywords: {job.get('keywords', 'NOT FOUND')}")
            print(f"  - config.keywords: {config_keywords}")
            print(f"  - settings.keywords: {settings_keywords}")
            print(f"  - metadata.keywords: {metadata_keywords}")
        else:
            print(f"📄 Job {total_jobs_examined} ({job_type}): {job_id} - ❌ No keyword data found")
    
    print(f"\n📊 JOBS SUMMARY:")
    print(f"  - Jobs examined: {total_jobs_examined}")
    print(f"  - Jobs with any keyword data: {jobs_with_keywords}")
    print(f"  - Percentage with keywords: {(jobs_with_keywords/total_jobs_examined*100):.1f}%" if total_jobs_examined > 0 else "N/A")

if __name__ == "__main__":
    check_jobs_collection()
