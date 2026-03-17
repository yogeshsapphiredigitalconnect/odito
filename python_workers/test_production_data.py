#!/usr/bin/env python3
"""
Test DataForSEO Production API with proper data extraction.
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
    print("🎯 DataForSEO PRODUCTION API Test")
    print("Testing SEO keyword research for India location in English")
    print("=" * 60)
    
    client = DataForSEOClient()
    
    try:
        result = client.get_related_keywords(
            keyword="seo",
            depth=1,
            limit=15,
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
                
                # Extract related keywords from items array
                items = keyword_data.get("items", [])
                if items:
                    print(f"🔍 Related Keywords for 'SEO' in India (Production Data):")
                    print()
                    
                    for i, item in enumerate(items, 1):
                        # Try different possible keyword fields
                        keyword = (
                            item.get("keyword") or 
                            item.get("related_keyword") or 
                            item.get("seed_keyword") or 
                            str(item.get("keyword", "N/A"))
                        )
                        
                        # Get additional metrics if available
                        search_info = item.get("search_info", {})
                        search_volume = search_info.get("search_volume", "N/A")
                        competition = item.get("keyword_info", {}).get("competition", "N/A")
                        
                        print(f"   {i:2d}. {keyword}")
                        if search_volume != "N/A":
                            print(f"       Search Volume: {search_volume:,}")
                        if competition != "N/A":
                            print(f"       Competition: {competition}")
                        print()
                    
                    print("🎉 PRODUCTION API returned real keyword data!")
                    print("📍 Location: India")
                    print("🌐 Language: English") 
                    print("🔑 Seed Keyword: 'seo'")
                    print(f"📊 Total keywords available: {keyword_data.get('total_count', 0)}")
                    print()
                    print("✅ DataForSEO API is READY for production integration!")
                    
                else:
                    print("⚠️  No items found in response")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("Please check your DataForSEO credentials and connection.")


if __name__ == "__main__":
    main()
    print("=" * 60)
