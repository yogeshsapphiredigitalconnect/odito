#!/usr/bin/env python3
"""
Test to compare DataForSEO Sandbox vs Production API.
"""

import os
import sys
import requests
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the scraper directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraper'))

from scraper.workers.seo.keyword_research.dataforseo_client import DataForSEOClient


def test_api_endpoint(api_url, endpoint_name):
    """Test a specific DataForSEO API endpoint."""
    
    print(f"🔍 Testing {endpoint_name}")
    print(f"   URL: {api_url}")
    print()
    
    # Get credentials
    login = os.getenv("DATAFORSEO_LOGIN", "")
    password = os.getenv("DATAFORSEO_PASSWORD", "")
    
    if not login or not password:
        print(f"❌ {endpoint_name}: No credentials found")
        return False
    
    # Prepare request
    credentials = f"{login}:{password}"
    encoded = base64.b64encode(credentials.encode()).decode()
    
    headers = {
        "Authorization": f"Basic {encoded}",
        "Content-Type": "application/json"
    }
    
    payload = [{
        "keyword": "seo",
        "location_name": "India",
        "language_name": "English",
        "depth": 1,
        "limit": 5
    }]
    
    try:
        print(f"📡 Making request to {endpoint_name}...")
        response = requests.post(api_url, json=payload, headers=headers, timeout=30)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   API Status: {data.get('status_message', 'Unknown')}")
            print(f"   Status Code: {data.get('status_code', 'Unknown')}")
            
            if "tasks" in data and len(data["tasks"]) > 0:
                task = data["tasks"][0]
                if "result" in task and len(task["result"]) > 0:
                    result = task["result"][0]
                    items_count = result.get("items_count", 0)
                    total_count = result.get("total_count", 0)
                    
                    print(f"   Items Found: {items_count}")
                    print(f"   Total Count: {total_count}")
                    
                    if items_count > 0 and "items" in result:
                        print(f"   Sample Keywords:")
                        for i, item in enumerate(result["items"][:3], 1):
                            keyword = item.get("keyword", item.get("seed_keyword", "N/A"))
                            print(f"     {i}. {keyword}")
                    
                    print(f"✅ {endpoint_name}: WORKING")
                    return True
                else:
                    print(f"⚠️  {endpoint_name}: No results in response")
                    return False
            else:
                print(f"⚠️  {endpoint_name}: No tasks in response")
                return False
        else:
            print(f"❌ {endpoint_name}: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('status_message', 'Unknown error')}")
            except:
                print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"❌ {endpoint_name}: Timeout")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ {endpoint_name}: Connection Error - {str(e)}")
        return False
    except Exception as e:
        print(f"❌ {endpoint_name}: {str(e)}")
        return False


def main():
    print("🚀 DataForSEO Sandbox vs Production Test")
    print("Testing SEO keyword research for India location in English")
    print("=" * 70)
    
    # API endpoints
    sandbox_url = "https://sandbox.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live"
    production_url = "https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live"
    
    print("🔐 Credentials Check:")
    login = os.getenv("DATAFORSEO_LOGIN", "")
    password = os.getenv("DATAFORSEO_PASSWORD", "")
    
    if login and password:
        print(f"   Login: {login}")
        print(f"   Password: {'*' * len(password)}")
        print("   ✅ Credentials found")
    else:
        print("   ❌ No credentials found")
        print("   Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env")
        return
    
    print()
    
    # Test sandbox
    sandbox_works = test_api_endpoint(sandbox_url, "SANDBOX API")
    print()
    
    # Test production
    production_works = test_api_endpoint(production_url, "PRODUCTION API")
    print()
    
    # Summary
    print("📊 SUMMARY:")
    print("=" * 30)
    print(f"Sandbox API:    {'✅ WORKING' if sandbox_works else '❌ FAILED'}")
    print(f"Production API: {'✅ WORKING' if production_works else '❌ FAILED'}")
    print()
    
    if sandbox_works and not production_works:
        print("💡 You're currently using SANDBOX credentials")
        print("   Sandbox has limited data and may return empty results")
        print("   For real data, you need production credentials")
    elif production_works:
        print("🎉 You have PRODUCTION credentials - real data available!")
    elif not sandbox_works and not production_works:
        print("⚠️  Both APIs failed - check credentials and connection")
    
    print()
    print("🔧 Current client is using:", sandbox_url)


if __name__ == "__main__":
    main()
    print("=" * 70)
