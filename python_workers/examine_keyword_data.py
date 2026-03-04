#!/usr/bin/env python3
"""
Quick script to examine actual document structures in SEO collections
to verify keyword data availability at the data level.
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
    from db import db, seo_page_data, seoprojects
except ImportError as e:
    print(f"❌ Failed to import db: {e}")
    sys.exit(1)

def examine_document_structure():
    """Examine actual document structures to answer specific questions."""
    
    print("🔍 EXAMINING DOCUMENT STRUCTURES FOR KEYWORD DATA")
    print("=" * 60)
    
    # 1. Get a sample document from seo_page_data
    print("\n1. SEO PAGE DATA COLLECTION:")
    print("-" * 30)
    
    page_sample = seo_page_data.find_one()
    if page_sample:
        print(f"Found sample document with URL: {page_sample.get('url', 'N/A')}")
        print(f"Project ID: {page_sample.get('projectId', 'N/A')}")
        
        # Check for keyword fields
        print(f"\n🔍 Keyword field analysis:")
        print(f"  - target_keyword: {page_sample.get('target_keyword', 'NOT FOUND')}")
        print(f"  - primary_keyword: {page_sample.get('primary_keyword', 'NOT FOUND')}")
        
        # Check meta_tags.keywords
        meta_tags = page_sample.get('meta_tags', {})
        if isinstance(meta_tags, dict):
            keywords_content = meta_tags.get('keywords', 'NOT FOUND')
            print(f"  - meta_tags.keywords: {keywords_content}")
            if keywords_content != 'NOT FOUND':
                print(f"    - Type: {type(keywords_content)}")
                print(f"    - Length: {len(str(keywords_content))} chars")
                if isinstance(keywords_content, list):
                    print(f"    - List items: {keywords_content}")
        else:
            print(f"  - meta_tags.keywords: meta_tags is not a dict (type: {type(meta_tags)})")
        
        # Show full document structure (truncated)
        print(f"\n📋 Full document keys:")
        for key in sorted(page_sample.keys()):
            value = page_sample[key]
            if isinstance(value, (str, int, float, bool)):
                print(f"  - {key}: {value}")
            elif isinstance(value, list):
                print(f"  - {key}: [list with {len(value)} items]")
            elif isinstance(value, dict):
                print(f"  - {key}: {{dict with {len(value)} keys}}")
            else:
                print(f"  - {key}: {type(value)}")
    else:
        print("❌ No documents found in seo_page_data collection")
    
    # 2. Check projects collection for target keywords
    print("\n\n2. PROJECTS COLLECTION:")
    print("-" * 30)
    
    project_sample = seoprojects.find_one()
    if project_sample:
        print(f"Found sample project with ID: {project_sample.get('_id', 'N/A')}")
        print(f"Project name: {project_sample.get('name', 'N/A')}")
        print(f"Domain: {project_sample.get('domain', 'N/A')}")
        
        # Check for keyword fields at project level
        print(f"\n🔍 Project-level keyword analysis:")
        print(f"  - target_keyword: {project_sample.get('target_keyword', 'NOT FOUND')}")
        print(f"  - primary_keyword: {project_sample.get('primary_keyword', 'NOT FOUND')}")
        print(f"  - keywords: {project_sample.get('keywords', 'NOT FOUND')}")
        print(f"  - focus_keyword: {project_sample.get('focus_keyword', 'NOT FOUND')}")
        print(f"  - main_keyword: {project_sample.get('main_keyword', 'NOT FOUND')}")
        
        # Show full project structure
        print(f"\n📋 Full project keys:")
        for key in sorted(project_sample.keys()):
            value = project_sample[key]
            if isinstance(value, (str, int, float, bool)):
                print(f"  - {key}: {value}")
            elif isinstance(value, list):
                print(f"  - {key}: [list with {len(value)} items]")
            elif isinstance(value, dict):
                print(f"  - {key}: {{dict with {len(value)} keys}}")
            else:
                print(f"  - {key}: {type(value)}")
    else:
        print("❌ No documents found in seoprojects collection")
    
    # 3. Check for any other collections that might have job-level keywords
    print("\n\n3. SEARCHING FOR JOB-LEVEL KEYWORD STORAGE:")
    print("-" * 30)
    
    # List all collections in the database
    all_collections = db.list_collection_names()
    print(f"Found {len(all_collections)} collections:")
    for collection in sorted(all_collections):
        print(f"  - {collection}")
    
    # Look for collections that might contain job or keyword data
    job_collections = [col for col in all_collections if 'job' in col.lower()]
    keyword_collections = [col for col in all_collections if 'keyword' in col.lower()]
    
    print(f"\n🔍 Job-related collections: {job_collections}")
    print(f"🔍 Keyword-related collections: {keyword_collections}")
    
    # Check a few page documents to see if any have keyword data
    print("\n\n4. SAMPLE MULTIPLE PAGE DOCUMENTS:")
    print("-" * 30)
    
    pages_with_keywords = 0
    total_pages_examined = 0
    
    for page in seo_page_data.find().limit(5):
        total_pages_examined += 1
        url = page.get('url', 'N/A')
        
        has_target_keyword = 'target_keyword' in page and page['target_keyword']
        has_primary_keyword = 'primary_keyword' in page and page['primary_keyword']
        meta_keywords = page.get('meta_tags', {}).get('keywords', None)
        has_meta_keywords = meta_keywords and len(str(meta_keywords).strip()) > 0
        
        if has_target_keyword or has_primary_keyword or has_meta_keywords:
            pages_with_keywords += 1
            print(f"\n📄 Page {total_pages_examined}: {url}")
            print(f"  - target_keyword: {page.get('target_keyword', 'NOT FOUND')}")
            print(f"  - primary_keyword: {page.get('primary_keyword', 'NOT FOUND')}")
            print(f"  - meta_tags.keywords: {meta_keywords}")
        else:
            print(f"📄 Page {total_pages_examined}: {url} - ❌ No keyword data found")
    
    print(f"\n📊 SUMMARY:")
    print(f"  - Pages examined: {total_pages_examined}")
    print(f"  - Pages with any keyword data: {pages_with_keywords}")
    print(f"  - Percentage with keywords: {(pages_with_keywords/total_pages_examined*100):.1f}%" if total_pages_examined > 0 else "N/A")
    
    # Final verdict
    print(f"\n🎯 FINAL VERDICT:")
    if pages_with_keywords == 0:
        print("❌ CONFIRMED: No keyword data found at the page level")
        print("   The H1 fallback will indeed kick in for most pages")
    elif pages_with_keywords < total_pages_examined:
        print(f"⚠️  PARTIAL: Some pages have keyword data ({pages_with_keywords}/{total_pages_examined})")
        print("   H1 fallback will be needed for pages without keywords")
    else:
        print("✅ GOOD: All examined pages have keyword data")

if __name__ == "__main__":
    examine_document_structure()
