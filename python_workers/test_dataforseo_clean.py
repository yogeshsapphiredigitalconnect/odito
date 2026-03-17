#!/usr/bin/env python3
"""
Clean test to show DataForSEO API results for SEO keyword in India.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the scraper directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraper'))

from scraper.workers.seo.keyword_research.dataforseo_client import DataForSEOClient


def test_dataforseo_clean():
    """Clean test showing key DataForSEO results."""
    
    print("🎯 DataForSEO API Test - SEO Keyword in India")
    print("=" * 50)
    
    client = DataForSEOClient()
    
    try:
        result = client.get_related_keywords(
            keyword="seo",
            depth=1,
            limit=10,
            location_name="India",
            language_name="English"
        )
        
        if "tasks" in result and len(result["tasks"]) > 0:
            task = result["tasks"][0]
            
            if "result" in task and len(task["result"]) > 0:
                keyword_data = task["result"][0]
                
                print(f"✅ API Status: {result.get('status_message')}")
                print(f"📍 Location: {keyword_data.get('location_code', 'N/A')}")
                print(f"🌐 Language: {keyword_data.get('language_code', 'N/A')}")
                print()
                
                # Show main keyword metrics
                search_info = keyword_data.get("search_info", {})
                keyword_info = keyword_data.get("keyword_info", {})
                keyword_properties = keyword_data.get("keyword_properties", {})
                
                print("📊 Main Keyword Metrics:")
                search_volume = search_info.get('search_volume', 0)
                if search_volume and search_volume != 'N/A':
                    print(f"   Search Volume: {search_volume:,}")
                else:
                    print(f"   Search Volume: {search_volume}")
                print(f"   Competition: {keyword_info.get('competition', 'N/A')}")
                print(f"   Keyword Difficulty: {keyword_properties.get('keyword_difficulty', 'N/A')}")
                cpc = search_info.get('cpc', 0)
                if cpc and cpc != 'N/A':
                    print(f"   CPC: ${cpc:.2f}")
                else:
                    print(f"   CPC: {cpc}")
                print()
                
                # Show related keywords
                related_keywords = keyword_data.get("related_keywords", [])
                if related_keywords:
                    print(f"🔍 Related Keywords ({len(related_keywords)} found):")
                    for i, kw in enumerate(related_keywords[:8], 1):
                        print(f"   {i}. {kw}")
                    print()
                
                # Show monthly trend (last 3 months)
                monthly_searches = search_info.get("monthly_searches", [])
                if monthly_searches:
                    print("📈 Recent Search Volume Trend:")
                    for month_data in monthly_searches[-3:]:
                        year = month_data.get("year")
                        month = month_data.get("month")
                        volume = month_data.get("search_volume", 0)
                        if volume and volume != 'N/A':
                            print(f"   {year}-{month:02d}: {volume:,}")
                        else:
                            print(f"   {year}-{month:02d}: {volume}")
                
                print()
                print("🎉 DataForSEO API is working perfectly!")
                return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


if __name__ == "__main__":
    success = test_dataforseo_clean()
    print("=" * 50)
    if success:
        print("✅ TEST PASSED - DataForSEO API Ready!")
    else:
        print("❌ TEST FAILED")
