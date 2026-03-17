#!/usr/bin/env python3
"""
Detailed test script to examine DataForSEO API response structure.
"""

import os
import sys
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the scraper directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraper'))

from scraper.workers.seo.keyword_research.dataforseo_client import DataForSEOClient


def test_dataforseo_detailed():
    """Test DataForSEO API and show detailed response."""
    
    print("🔬 Detailed DataForSEO API Test...")
    print("=" * 60)
    
    # Initialize client
    client = DataForSEOClient()
    
    # Test parameters
    test_keyword = "seo"
    test_location = "India"
    test_language = "English"
    
    print(f"🎯 Testing: '{test_keyword}' in {test_location} ({test_language})")
    print()
    
    try:
        print("📡 Making API request...")
        result = client.get_related_keywords(
            keyword=test_keyword,
            depth=1,  # Use depth 1 for simpler response
            limit=5,
            location_name=test_location,
            language_name=test_language
        )
        
        print("✅ API request successful!")
        print()
        
        # Show full response structure
        print("📋 Full Response Structure:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        print()
        
        # Analyze specific parts
        if "tasks" in result and len(result["tasks"]) > 0:
            task = result["tasks"][0]
            print("🔍 Task Analysis:")
            print(f"   Task ID: {task.get('id')}")
            print(f"   Status Code: {task.get('status_code')}")
            print(f"   Status Message: {task.get('status_message')}")
            
            if "result" in task and len(task["result"]) > 0:
                keyword_data = task["result"][0]
                print()
                print("🎯 Keyword Result Analysis:")
                print(f"   Keyword: {keyword_data.get('keyword', 'N/A')}")
                print(f"   Location Code: {keyword_data.get('location_code', 'N/A')}")
                print(f"   Language Code: {keyword_data.get('language_code', 'N/A')}")
                
                if "items" in keyword_data:
                    items = keyword_data["items"]
                    print(f"   Related Keywords Found: {len(items)}")
                    print()
                    
                    for i, item in enumerate(items, 1):
                        print(f"   {i}. Keyword Data:")
                        print(f"      Raw Item: {json.dumps(item, indent=6, ensure_ascii=False)}")
                        print()
                        
                        # Try to extract specific fields
                        keyword = item.get("keyword", item.get("related_keyword", "N/A"))
                        search_info = item.get("search_info", {})
                        keyword_info = item.get("keyword_info", {})
                        
                        print(f"      Keyword: {keyword}")
                        print(f"      Search Volume: {search_info.get('search_volume', 'N/A')}")
                        print(f"      Competition: {keyword_info.get('competition', 'N/A')}")
                        print(f"      CPC: {search_info.get('cpc', 'N/A')}")
                        print()
                else:
                    print("   ⚠️  No 'items' array found in result")
            else:
                print("   ⚠️  No 'result' found in task")
        else:
            print("   ⚠️  No 'tasks' found in response")
        
        return True
            
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        return False


if __name__ == "__main__":
    success = test_dataforseo_detailed()
    
    print("=" * 60)
    if success:
        print("🎉 Detailed test completed")
    else:
        print("💥 Detailed test failed")
