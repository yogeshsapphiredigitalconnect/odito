#!/usr/bin/env python3
"""
Check raw data formats in headless collection
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

def check_data_formats():
    """Check raw data formats in headless collection"""
    
    print("🔍 CHECKING RAW DATA FORMATS")
    print("=" * 50)
    
    test_url = "https://www.sapphiredigitalconnect.com/"
    
    # Get headless data
    headless_doc = seo_headless_data.find_one({
        "url": test_url
    })
    
    if not headless_doc:
        print("❌ No headless data found")
        return
    
    print(f"📋 URL: {test_url}")
    
    # Check domMetrics format
    print(f"\n📊 DOM_METRICS FORMAT:")
    dom_metrics = headless_doc.get('domMetrics', {})
    print(f"   Type: {type(dom_metrics)}")
    print(f"   Keys: {list(dom_metrics.keys())}")
    
    # Check headings specifically
    headings = dom_metrics.get('headings')
    print(f"   headings field: {headings} (type: {type(headings)})")
    
    if isinstance(headings, dict):
        print(f"   headings breakdown: {headings}")
    elif isinstance(headings, (int, float)):
        print(f"   headings is just a number: {headings}")
    
    # Check keyboard_analysis format
    print(f"\n⌨️ KEYBOARD_ANALYSIS FORMAT:")
    keyboard = headless_doc.get('keyboard_analysis', {})
    print(f"   Type: {type(keyboard)}")
    print(f"   Keys: {list(keyboard.keys())}")
    
    # Check specific fields that rules expect
    expected_fields = [
        "focus_trap_detected",
        "small_click_targets", 
        "missing_focus_outline",
        "unreachable_elements",
        "total_tab_presses"
    ]
    
    print(f"\n🔍 EXPECTED vs ACTUAL FIELDS:")
    for field in expected_fields:
        actual_value = keyboard.get(field)
        if actual_value is not None:
            print(f"   ✅ {field}: {actual_value} (type: {type(actual_value)})")
        else:
            print(f"   ❌ {field}: MISSING")
            
    # Show all keyboard fields for comparison
    print(f"\n📋 ALL KEYBOARD FIELDS:")
    for key, value in keyboard.items():
        print(f"   • {key}: {value} (type: {type(value)})")
    
    # Check axeViolations format
    print(f"\n🪓 AXE_VIOLATIONS FORMAT:")
    violations = headless_doc.get('axeViolations', [])
    print(f"   Type: {type(violations)}")
    print(f"   Count: {len(violations)}")
    
    if violations:
        print(f"   First violation keys: {list(violations[0].keys())}")
        print(f"   First violation ID: {violations[0].get('id', 'No ID')}")
        print(f"   First violation impact: {violations[0].get('impact', 'No impact')}")

if __name__ == "__main__":
    check_data_formats()
