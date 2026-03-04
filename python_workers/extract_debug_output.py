#!/usr/bin/env python3
"""
Extract debug output from worker run
"""

import os
import sys
import subprocess

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def extract_debug_output():
    """Run worker and capture debug output"""
    
    print("🧪 CAPTURING DEBUG OUTPUT")
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
        
        # Look for debug lines
        debug_lines = []
        for line in lines:
            if '[DEBUG]' in line or '[HEADLESS]' in line:
                debug_lines.append(line)
        
        print(f"📋 Found {len(debug_lines)} debug lines:")
        for line in debug_lines:
            print(f"   {line}")
        
        if not debug_lines:
            print("❌ No debug output found!")
            print("\n🔍 Looking for worker start lines...")
            worker_lines = [line for line in lines if '[WORKER]' in line and 'PAGE_ANALYSIS' in line]
            for line in worker_lines[:5]:
                print(f"   {line}")
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    extract_debug_output()
