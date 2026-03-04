#!/usr/bin/env python3
"""
Diagnose why accessibility rules are generating zero issues - FIXED VERSION
"""

import os
import sys
from bson.objectid import ObjectId
import json

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, seo_headless_data, db
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def diagnose_accessibility_rules():
    """Diagnose why accessibility rules show zero issues"""
    
    print("🔍 DIAGNOSING ACCESSIBILITY RULES (213-236)")
    print("=" * 60)
    
    # Test URL that had 40+ issues (homepage)
    test_url = "https://www.sapphiredigitalconnect.com/"
    
    print(f"🎯 Testing URL: {test_url}")
    
    # 1. Check seo_page_data headless field
    print(f"\n1️⃣ CHECKING seo_page_data.headless FIELD:")
    print("-" * 50)
    
    doc = seo_page_data.find_one(
        {"url": test_url},
        {"headless": 1, "scrape_status": 1, "url": 1, "projectId": 1}
    )
    
    if doc:
        print(f"✅ Found document:")
        print(f"   URL: {doc.get('url')}")
        print(f"   Scrape Status: {doc.get('scrape_status')}")
        print(f"   Project ID: {doc.get('projectId')}")
        print(f"   Headless Field Type: {type(doc.get('headless'))}")
        print(f"   Headless Field Value:")
        
        headless_value = doc.get('headless')
        if headless_value is None:
            print(f"      null")
        elif isinstance(headless_value, dict):
            print(f"      {{")
            for key, value in headless_value.items():
                if isinstance(value, (dict, list)):
                    print(f"        \"{key}\": {type(value).__name__}({len(value)})")
                else:
                    print(f"        \"{key}\": {json.dumps(value)[:100]}...")
            print(f"      }}")
        else:
            print(f"      {json.dumps(headless_value)}")
    else:
        print(f"❌ Document not found")
        return
    
    # 2. Check separate collections for headless data
    print(f"\n2️⃣ CHECKING SEPARATE HEADLESS COLLECTIONS:")
    print("-" * 50)
    
    # Get all collection names
    all_collections = db.list_collection_names()
    headless_related = [col for col in all_collections if any(keyword in col.lower() for keyword in ['headless', 'axe', 'accessibility', 'keyboard', 'dom'])]
    
    print(f"📋 Headless-related collections: {headless_related}")
    
    project_id = doc.get("projectId")
    
    # Check seo_headless_data specifically
    if "seo_headless_data" in all_collections:
        print(f"\n📋 Checking seo_headless_data collection:")
        
        headless_doc = seo_headless_data.find_one({
            "projectId": project_id,
            "$or": [
                {"url": test_url},
                {"page_url": test_url}
            ]
        })
        
        if headless_doc:
            print(f"✅ Found headless data for {test_url}:")
            print(f"   Document keys: {list(headless_doc.keys())}")
            
            # Show specific accessibility fields
            accessibility_fields = ['axeViolations', 'keyboard_analysis', 'domMetrics', 'axe', 'violations']
            print(f"   Accessibility fields:")
            for field in accessibility_fields:
                if field in headless_doc:
                    value = headless_doc[field]
                    print(f"      • {field}: {type(value).__name__} ({len(value) if isinstance(value, (list, dict)) else str(value)[:50]})")
                    
                    # Show sample of violations if present
                    if field == 'axeViolations' and isinstance(value, list) and value:
                        print(f"        Sample violation: {list(value[0].keys()) if value[0] else 'Empty violation'}")
                        print(f"        First violation ID: {value[0].get('id', 'No ID')}")
                        print(f"        First violation impact: {value[0].get('impact', 'No impact')}")
                
                elif field == 'axe' and 'axe' in headless_doc:
                    # Check nested axe structure
                    axe_data = headless_doc['axe']
                    if isinstance(axe_data, dict):
                        print(f"      • axe (nested): {type(axe_data)} with keys: {list(axe_data.keys())}")
                        if 'violations' in axe_data:
                            violations = axe_data['violations']
                            print(f"        axe.violations: {len(violations)} items")
            
            # Show RAW document structure (complete)
            print(f"\n   RAW DOCUMENT (COMPLETE):")
            print(f"   {{")
            for key, value in headless_doc.items():
                if key.startswith('_'):
                    continue
                if isinstance(value, dict):
                    print(f"      \"{key}\": {{")
                    for subkey, subvalue in value.items():
                        if isinstance(subvalue, (dict, list)):
                            print(f"        \"{subkey}\": {type(subvalue).__name__}({len(subvalue)})")
                        else:
                            print(f"        \"{subkey}\": {json.dumps(subvalue)[:80]}...")
                    print(f"      }}")
                elif isinstance(value, list):
                    print(f"      \"{key}\": [{type(value[0]).__name__ if value else 'empty'}] ({len(value)} items)")
                    if value and len(value) <= 3:
                        for i, item in enumerate(value):
                            if isinstance(item, dict):
                                print(f"        [{i}]: {list(item.keys())}")
                            else:
                                print(f"        [{i}]: {str(item)[:50]}...")
                else:
                    print(f"      \"{key}\": {json.dumps(value)[:100]}...")
            print(f"   }}")
        else:
            print(f"❌ No headless data found for {test_url}")
    
    # 3. Show all collections
    print(f"\n3️⃣ ALL COLLECTIONS IN DATABASE:")
    print("-" * 50)
    
    print(f"📋 Total collections: {len(all_collections)}")
    for i, col in enumerate(sorted(all_collections)):
        print(f"   {i+1:2d}. {col}")
    
    return doc, headless_doc if 'headless_doc' in locals() else None

if __name__ == "__main__":
    diagnose_accessibility_rules()
