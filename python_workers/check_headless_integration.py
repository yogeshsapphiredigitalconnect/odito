#!/usr/bin/env python3
"""
Check headless data collection and integration
"""

import os
import sys
from bson.objectid import ObjectId

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, seo_headless_data, db
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def check_headless_integration():
    """Check headless data collection and integration"""
    
    print("🔍 CHECKING HEADLESS DATA INTEGRATION")
    print("=" * 60)
    
    # Get the project ID from the thank-you page
    test_url = "https://www.sapphiredigitalconnect.com/thank-you"
    page_doc = seo_page_data.find_one({"url": test_url})
    
    if not page_doc:
        print("❌ Page document not found")
        return
    
    project_id = page_doc.get("projectId")
    print(f"📋 Project ID: {project_id}")
    
    # Check seo_headless_data collection for this project
    headless_records = list(seo_headless_data.find({"projectId": project_id}))
    print(f"📊 Headless records for this project: {len(headless_records)}")
    
    if headless_records:
        print(f"\n📋 Headless Records Found:")
        for i, record in enumerate(headless_records[:3]):  # Show first 3
            print(f"   {i+1}. URL: {record.get('page_url', 'Unknown')}")
            print(f"      Keys: {list(record.keys())}")
            if 'axe' in record:
                axe_data = record.get('axe', {})
                print(f"      AXE violations: {len(axe_data.get('violations', []))}")
            print()
        
        # Check if our specific URL has headless data
        matching_headless = seo_headless_data.find_one({
            "projectId": project_id,
            "page_url": test_url
        })
        
        if matching_headless:
            print(f"✅ Found headless data for {test_url}")
            print(f"   Keys: {list(matching_headless.keys())}")
        else:
            print(f"❌ No headless data found for {test_url}")
            
            # Show available URLs
            available_urls = [r.get('page_url') for r in headless_records if r.get('page_url')]
            print(f"\n📋 Available headless URLs ({len(available_urls)}):")
            for url in available_urls[:5]:
                print(f"   • {url}")
    else:
        print(f"❌ No headless records found for project {project_id}")
        
        # Check if there are any headless records at all
        total_headless = seo_headless_data.count_documents({})
        print(f"📊 Total headless records in database: {total_headless}")
        
        if total_headless > 0:
            # Show a sample record
            sample = seo_headless_data.find_one()
            print(f"\n📋 Sample headless record structure:")
            print(f"   Project: {sample.get('projectId')}")
            print(f"   URL: {sample.get('page_url')}")
            print(f"   Keys: {list(sample.keys())}")
    
    # Check how headless data gets integrated in page_analysis
    print(f"\n🔍 HEADLESS INTEGRATION ANALYSIS:")
    print("-" * 40)
    
    # Simulate the lookup process from page_analysis.py
    headless_data_list = list(seo_headless_data.find({"projectId": project_id}))
    headless_lookup = {_normalize_lookup_url(h.get("page_url", "")): h for h in headless_data_list}
    
    print(f"📋 Headless lookup created with {len(headless_lookup)} entries")
    
    # Check what our test URL would get
    from urllib.parse import urlparse
    def _normalize_lookup_url(url):
        if not url:
            return ""
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    
    lookup_url = _normalize_lookup_url(test_url)
    headless_for_page = headless_lookup.get(lookup_url, {})
    
    print(f"📋 Lookup URL: {lookup_url}")
    print(f"📋 Headless data for page: {type(headless_for_page)}")
    if headless_for_page:
        print(f"   Keys: {list(headless_for_page.keys())}")
    else:
        print(f"   ❌ No headless data found - this explains missing accessibility analysis")

if __name__ == "__main__":
    check_headless_integration()
