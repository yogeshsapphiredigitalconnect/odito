#!/usr/bin/env python3
"""
Extract specific debug and accessibility lines from worker output
"""

import os
import sys
import subprocess

def extract_specific_lines():
    """Extract debug and accessibility lines"""
    
    print("🔍 EXTRACTING SPECIFIC LINES")
    print("=" * 40)
    
    # Run worker and capture output
    try:
        result = subprocess.run(
            ['python', 'test_worker_debug.py'],
            capture_output=True,
            text=True,
            cwd='d:\\new\\Odito\\python_workers'
        )
        
        output = result.stdout
        lines = output.split('\n')
        
        # Extract debug lines
        print("📋 DEBUG LINES:")
        debug_lines = [line for line in lines if '[DEBUG]' in line or '[HEADLESS]' in line]
        for line in debug_lines:
            print(f"   {line}")
        
        if not debug_lines:
            print("   ❌ No debug lines found!")
        
        # Extract accessibility rule lines
        print(f"\n📋 ACCESSIBILITY RULE RESULTS:")
        accessibility_rules = [
            'AXE_NO_VIOLATIONS',
            'AXE_NO_CRITICAL', 
            'AXE_NO_SERIOUS',
            'AXE_MAX_MODERATE',
            'DOM_ELEMENT_COUNT',
            'ARIA_LANDMARKS',
            'BUTTONS_HAVE_LABELS',
            'FORM_LABELS',
            'HEADING_ORDER_LOGICAL_A11Y',
            'KEYBOARD_NAV_CHECKED',
            'NO_FOCUS_TRAP',
            'SMALL_CLICK_TARGETS',
            'FOCUS_INDICATOR',
            'UNREACHABLE_ELEMENTS',
            'SKIP_NAVIGATION',
            'LINKS_DESCRIPTIVE_TEXT',
            'IMAGES_ALL_HAVE_ALT',
            'HTML_LANG_A11Y'
        ]
        
        for rule in accessibility_rules:
            rule_lines = [line for line in lines if f'[RULE] ✅ {rule}:' in line]
            if rule_lines:
                for line in rule_lines:
                    print(f"   {line}")
            else:
                print(f"   ❌ {rule}: NOT FOUND")
        
        # Extract summary
        print(f"\n📋 SUMMARY:")
        summary_lines = [line for line in lines if '[SUMMARY]' in line and 'Total issues generated:' in line]
        for line in summary_lines:
            print(f"   {line}")
        
        # Extract worker completion
        worker_lines = [line for line in lines if '[WORKER] PAGE_ANALYSIS completed' in line]
        for line in worker_lines:
            print(f"   {line}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    extract_specific_lines()
