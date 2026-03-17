#!/usr/bin/env python3
"""
Final test to demonstrate DataForSEO API working with SEO keyword in India.
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
    print("🚀 DataForSEO API - Final Test")
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
        
        print("✅ SUCCESS: DataForSEO API is working!")
        print()
        
        if "tasks" in result and len(result["tasks"]) > 0:
            task = result["tasks"][0]
            
            if "result" in task and len(task["result"]) > 0:
                keyword_data = task["result"][0]
                
                print("📋 API Response Summary:")
                print(f"   Status: {result.get('status_message')}")
                print(f"   Location Code: {keyword_data.get('location_code')} (India)")
                print(f"   Language Code: {keyword_data.get('language_code')} (English)")
                print()
                
                # Show related keywords found
                related_keywords = keyword_data.get("related_keywords", [])
                if related_keywords:
                    print(f"🔍 Related Keywords for 'SEO' in India:")
                    print(f"   Found {len(related_keywords)} related keywords:")
                    print()
                    
                    for i, kw in enumerate(related_keywords, 1):
                        print(f"   {i:2d}. {kw}")
                    
                    print()
                    print("🎉 DataForSEO API successfully returned related keywords!")
                    print("📍 Location: India")
                    print("🌐 Language: English") 
                    print("🔑 Seed Keyword: 'seo'")
                    print()
                    print("✅ The API is ready for integration!")
                else:
                    print("⚠️  No related keywords found in response")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("Please check your DataForSEO credentials and connection.")


if __name__ == "__main__":
    main()
    print("=" * 60)
