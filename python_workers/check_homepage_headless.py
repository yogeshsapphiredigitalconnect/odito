#!/usr/bin/env python3
"""
Check headless data for the main homepage
"""

import os
import sys
from bson.objectid import ObjectId
from urllib.parse import urlparse

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, seo_headless_data, db
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def _normalize_lookup_url(url):
    if not url:
        return ""
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}{parsed.path}"

def check_homepage_headless():
    """Check headless data for the main homepage"""
    
    print("🔍 CHECKING HOMEPAGE HEADLESS DATA")
    print("=" * 50)
    
    # The main homepage URL
    homepage_url = "https://www.sapphiredigitalconnect.com/"
    
    print(f"🎯 Checking URL: {homepage_url}")
    
    # Check seo_page_data first
    page_doc = seo_page_data.find_one(
        {"url": homepage_url},
        {"headless": 1, "scrape_status": 1, "projectId": 1}
    )
    
    if not page_doc:
        print("❌ Page document not found in seo_page_data")
        return
    
    print(f"📋 Page Scrape Status: {page_doc.get('scrape_status')}")
    print(f"📋 Headless Field (seo_page_data): {type(page_doc.get('headless'))}")
    
    project_id = page_doc.get("projectId")
    print(f"📋 Project ID: {project_id}")
    
    # Check seo_headless_data collection
    headless_doc = seo_headless_data.find_one({
        "projectId": project_id,
        "$or": [
            {"url": homepage_url},
            {"page_url": homepage_url}
        ]
    })
    
    if headless_doc:
        print(f"✅ Found headless data in seo_headless_data!")
        print(f"📋 Headless Keys: {list(headless_doc.keys())}")
        
        # Check accessibility data
        if 'axeViolations' in headless_doc:
            violations = headless_doc.get('axeViolations', [])
            print(f"🪓 AXE Violations: {len(violations)}")
            if violations:
                print(f"   First violation type: {violations[0].get('type', 'Unknown')}")
        
        if 'domMetrics' in headless_doc:
            dom_metrics = headless_doc.get('domMetrics', {})
            print(f"📊 DOM Metrics: {len(dom_metrics)} fields")
            if dom_metrics:
                print(f"   Sample keys: {list(dom_metrics.keys())[:5]}")
        
        if 'keyboard_analysis' in headless_doc:
            keyboard = headless_doc.get('keyboard_analysis', {})
            print(f"⌨️  Keyboard Analysis: {len(keyboard)} fields")
        
        # Check for errors
        if 'error' in headless_doc and headless_doc.get('error'):
            print(f"❌ Headless Error: {headless_doc.get('error')}")
        
        # Check render status
        render_status = headless_doc.get('render_status', 'Unknown')
        print(f"🎬 Render Status: {render_status}")
        
    else:
        print(f"❌ No headless data found in seo_headless_data")
        
        # Check what URLs are available
        available_headless = list(seo_headless_data.find(
            {"projectId": project_id},
            {"url": 1, "page_url": 1}
        ))
        
        print(f"\n📋 Available headless URLs for this project:")
        for doc in available_headless[:10]:
            url = doc.get('url') or doc.get('page_url', 'Unknown')
            print(f"   • {url}")
    
    # Test the integration lookup
    print(f"\n🔍 INTEGRATION TEST:")
    print("-" * 30)
    
    headless_data_list = list(seo_headless_data.find({"projectId": project_id}))
    headless_lookup = {}
    for h in headless_data_list:
        url = h.get('url') or h.get('page_url', '')
        if url:
            normalized = _normalize_lookup_url(url)
            headless_lookup[normalized] = h
    
    lookup_url = _normalize_lookup_url(homepage_url)
    headless_for_page = headless_lookup.get(lookup_url, {})
    
    print(f"📋 Lookup URL: {lookup_url}")
    print(f"📋 Headless data found: {bool(headless_for_page)}")
    
    if headless_for_page:
        print(f"✅ Integration would work - data available")
        print(f"   Keys: {list(headless_for_page.keys())}")
    else:
        print(f"❌ Integration would fail - no headless data")
        print(f"   This means accessibility rules would be skipped!")

if __name__ == "__main__":
    check_homepage_headless()
