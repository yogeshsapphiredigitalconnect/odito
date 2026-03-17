#!/usr/bin/env python3
"""
Test script to verify DataForSEO API functionality.
Tests related keywords for SEO with India location in English.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the scraper directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraper'))

from scraper.workers.seo.keyword_research.dataforseo_client import DataForSEOClient


def test_dataforseo_api():
    """Test DataForSEO API with SEO keyword and India location."""
    
    print("🔬 Testing DataForSEO API...")
    print("=" * 50)
    
    # Initialize client
    client = DataForSEOClient()
    
    # Check if credentials are set
    if not client.login or not client.password:
        print("❌ ERROR: DataForSEO credentials not found!")
        print("Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in your .env file")
        return False
    
    print(f"✅ Credentials found | login={client.login}")
    print()
    
    # Test parameters
    test_keyword = "seo"
    test_location = "India"
    test_language = "English"
    
    print(f"🎯 Test Parameters:")
    print(f"   Keyword: {test_keyword}")
    print(f"   Location: {test_location}")
    print(f"   Language: {test_language}")
    print()
    
    try:
        print("📡 Making API request...")
        result = client.get_related_keywords(
            keyword=test_keyword,
            depth=2,
            limit=10,
            location_name=test_location,
            language_name=test_language
        )
        
        print("✅ API request successful!")
        print()
        
        # Analyze response
        if "tasks" in result and len(result["tasks"]) > 0:
            task = result["tasks"][0]
            
            print("📊 Response Analysis:")
            print(f"   Status Code: {result.get('status_code')}")
            print(f"   Status Message: {result.get('status_message')}")
            print(f"   Task ID: {task.get('id')}")
            print(f"   Task Status: {task.get('status_code')}")
            print()
            
            if "result" in task and len(task["result"]) > 0:
                keyword_data = task["result"][0]
                
                if "items" in keyword_data and len(keyword_data["items"]) > 0:
                    print(f"🔍 Found {len(keyword_data['items'])} related keywords:")
                    print()
                    
                    for i, item in enumerate(keyword_data["items"][:5], 1):
                        keyword = item.get("keyword", "N/A")
                        search_volume = item.get("search_info", {}).get("search_volume", "N/A")
                        competition = item.get("keyword_info", {}).get("competition", "N/A")
                        
                        print(f"   {i}. \"{keyword}\"")
                        print(f"      Search Volume: {search_volume}")
                        print(f"      Competition: {competition}")
                        print()
                    
                    print("✅ DataForSEO API is working correctly!")
                    return True
                else:
                    print("⚠️  No keyword items found in response")
                    return False
            else:
                print("⚠️  No results found in task")
                return False
        else:
            print("❌ No tasks found in response")
            print("Full response:", result)
            return False
            
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        print()
        print("🔧 Troubleshooting:")
        print("1. Check your DataForSEO credentials")
        print("2. Verify your account has sufficient credits")
        print("3. Check internet connection")
        print("4. Verify API endpoint is accessible")
        return False


if __name__ == "__main__":
    success = test_dataforseo_api()
    
    print("=" * 50)
    if success:
        print("🎉 DataForSEO API test PASSED")
        sys.exit(0)
    else:
        print("💥 DataForSEO API test FAILED")
        sys.exit(1)
