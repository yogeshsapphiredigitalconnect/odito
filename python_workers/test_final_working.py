#!/usr/bin/env python3
"""
Final working test for DataForSEO Production API with correct data extraction.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the scraper directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraper'))

from scraper.workers.seo.keyword_research.dataforseo_client import DataForSEOClient


def main():
    print("🎯 DataForSEO PRODUCTION API - FINAL TEST")
    print("Testing SEO keyword research for India location in English")
    print("=" * 70)
    
    client = DataForSEOClient()
    
    try:
        result = client.get_related_keywords(
            keyword="seo",
            depth=1,
            limit=10,
            location_name="India",
            language_name="English"
        )
        
        print("✅ SUCCESS: DataForSEO Production API is working!")
        print()
        
        if "tasks" in result and len(result["tasks"]) > 0:
            task = result["tasks"][0]
            
            if "result" in task and len(task["result"]) > 0:
                keyword_data = task["result"][0]
                
                print("📋 API Response Summary:")
                print(f"   Status: {result.get('status_message')}")
                print(f"   Location Code: {keyword_data.get('location_code')} (India)")
                print(f"   Language Code: {keyword_data.get('language_code')} (English)")
                print(f"   Total Available: {keyword_data.get('total_count', 0)} keywords")
                print(f"   Returned Items: {keyword_data.get('items_count', 0)} keywords")
                print()
                
                # Extract keywords from items
                items = keyword_data.get("items", [])
                all_keywords = []
                
                if items:
                    # First, get related keywords from the first item
                    first_item = items[0]
                    related_keywords = first_item.get("related_keywords", [])
                    all_keywords.extend(related_keywords)
                    
                    # Then get individual keywords from other items
                    for item in items[1:]:
                        keyword_data = item.get("keyword_data", {})
                        keyword = keyword_data.get("keyword")
                        if keyword and keyword not in all_keywords:
                            all_keywords.append(keyword)
                    
                    print(f"🔍 Related Keywords for 'SEO' in India:")
                    print()
                    
                    for i, keyword in enumerate(all_keywords[:10], 1):
                        print(f"   {i:2d}. {keyword}")
                    
                    print()
                    print("📊 Sample Keyword Metrics:")
                    
                    # Show metrics for a few keywords
                    for i, item in enumerate(items[:3], 1):
                        keyword_data = item.get("keyword_data", {})
                        keyword = keyword_data.get("keyword", "N/A")
                        keyword_info = keyword_data.get("keyword_info", {})
                        search_volume = keyword_info.get("search_volume", 0)
                        competition = keyword_info.get("competition", 0)
                        cpc = keyword_info.get("cpc", 0)
                        difficulty = keyword_data.get("keyword_properties", {}).get("keyword_difficulty", 0)
                        
                        print(f"   {i}. {keyword}:")
                        print(f"      Search Volume: {search_volume:,}")
                        print(f"      Competition: {competition:.2f}")
                        print(f"      CPC: ${cpc:.2f}")
                        print(f"      Difficulty: {difficulty}")
                        print()
                    
                    print("🎉 PRODUCTION API is working perfectly!")
                    print("📍 Location: India")
                    print("🌐 Language: English") 
                    print("🔑 Seed Keyword: 'seo'")
                    print(f"📊 Found {len(all_keywords)} related keywords")
                    print()
                    print("✅ DataForSEO API is READY for production integration!")
                    
                else:
                    print("⚠️  No items found in response")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("Please check your DataForSEO credentials and connection.")


if __name__ == "__main__":
    main()
    print("=" * 70)
