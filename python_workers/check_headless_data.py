#!/usr/bin/env python3
"""
Check headless field data for the page that generated issues
"""

import os
import sys
from bson.objectid import ObjectId
import json

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, db
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def check_headless_data():
    """Check headless field for the problematic page"""
    
    print("🔍 CHECKING HEADLESS FIELD DATA")
    print("=" * 50)
    
    # The URL that generated issues (thank-you page)
    test_url = "https://www.sapphiredigitalconnect.com/thank-you"
    
    print(f"🎯 Checking URL: {test_url}")
    
    # Query for headless and scrape_status
    doc = seo_page_data.find_one(
        {"url": test_url},
        {"headless": 1, "scrape_status": 1, "url": 1}
    )
    
    if not doc:
        print("❌ Document not found")
        return
    
    print(f"📋 Scrape Status: {doc.get('scrape_status')}")
    print(f"📋 Headless Field Type: {type(doc.get('headless'))}")
    
    headless_data = doc.get('headless')
    
    if headless_data is None:
        print("❌ Headless field is None/missing")
    elif isinstance(headless_data, dict):
        print(f"✅ Headless is a dict with {len(headless_data)} keys:")
        for key, value in headless_data.items():
            if isinstance(value, (dict, list)):
                print(f"   • {key}: {type(value).__name__} ({len(value)} items/keys)")
            else:
                print(f"   • {key}: {type(value).__name__} = {str(value)[:100]}...")
        
        # Show specific accessibility-related fields
        print(f"\n🔍 Accessibility-Related Fields:")
        accessibility_fields = ['axe', 'accessibility', 'violations', 'a11y', 'dom']
        for field in accessibility_fields:
            if field in headless_data:
                value = headless_data[field]
                print(f"   • {field}: {type(value).__name__}")
                if isinstance(value, dict):
                    print(f"     Keys: {list(value.keys())[:5]}...")
                elif isinstance(value, list):
                    print(f"     Items: {len(value)}")
        
        # Show axe data specifically if present
        if 'axe' in headless_data:
            axe_data = headless_data['axe']
            print(f"\n🪓 AXE Data Details:")
            print(f"   Type: {type(axe_data)}")
            if isinstance(axe_data, dict):
                print(f"   Keys: {list(axe_data.keys())}")
                if 'violations' in axe_data:
                    violations = axe_data['violations']
                    print(f"   Violations: {type(violations)} ({len(violations) if isinstance(violations, list) else 'N/A'})")
                    if isinstance(violations, list) and violations:
                        print(f"   First violation keys: {list(violations[0].keys()) if violations[0] else 'Empty'}")
    else:
        print(f"⚠️  Headless is unexpected type: {type(headless_data)}")
        print(f"   Value: {str(headless_data)[:200]}...")
    
    return doc

if __name__ == "__main__":
    check_headless_data()
