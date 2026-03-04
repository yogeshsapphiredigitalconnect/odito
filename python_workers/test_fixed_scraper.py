#!/usr/bin/env python3
"""
Test the fixed scraper by re-scraping the problematic URL
"""

import os
import sys
from bson.objectid import ObjectId

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, db
    from scraper.shared.orchestrator import scrape_page_data
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def test_fixed_scraper():
    """Test the fixed scraper on the problematic URL"""
    
    print("🧪 TESTING FIXED SCRAPER")
    print("=" * 50)
    
    # The problematic URL
    test_url = "https://www.sapphiredigitalconnect.com/thank-you"
    
    print(f"🎯 Testing URL: {test_url}")
    
    # Clear any existing data for this URL
    seo_page_data.delete_many({"url": test_url})
    print(f"🧹 Cleared existing data for this URL")
    
    # Test the scraper
    print(f"\n🚀 Running scrape_page_data...")
    
    try:
        result = scrape_page_data(test_url)
        
        print(f"✅ Scraping completed without error!")
        print(f"📊 Result type: {type(result)}")
        
        if isinstance(result, dict):
            print(f"📋 Extraction status: {result.get('extraction_status', 'Unknown')}")
            print(f"📋 Field count: {len([k for k in result.keys() if not k.startswith('_')])}")
            
            # Check for critical fields
            critical_fields = ["title", "meta_tags", "content", "images", "structured_data"]
            missing_fields = [f for f in critical_fields if not result.get(f)]
            
            print(f"\n📋 Critical Field Analysis:")
            for field in critical_fields:
                has_field = bool(result.get(field))
                status = "✅" if has_field else "❌"
                print(f"   {status} {field}: {has_field}")
            
            if not missing_fields:
                print(f"\n✅ SUCCESS: All critical fields present!")
                print(f"   Document appears to be complete")
            else:
                print(f"\n⚠️  WARNING: Missing critical fields: {missing_fields}")
            
            # Show error if present
            if result.get('error'):
                print(f"\n❌ Error reported: {result.get('error')}")
            
            # Save the result to database for verification
            if result.get('extraction_status') == 'SUCCESS':
                # Add job metadata
                result.update({
                    "seo_jobId": ObjectId("69a6ba3e3a45e0628a619bf3"),  # Use existing job ID
                    "projectId": ObjectId("69a6ba013a45e0628a619ba4"),
                    "sourceJobId": ObjectId("69a6ba1e3a45e0628a619ba5"),
                    "scrapedAt": datetime.utcnow(),
                    "scrape_status": "SUCCESS",
                    "screenshot_path": None,
                    "internal_links": []
                })
                
                # Insert into database
                seo_page_data.insert_one(result)
                print(f"\n💾 Saved complete document to database")
                
                # Verify it was saved correctly
                saved_doc = seo_page_data.find_one({"url": test_url})
                if saved_doc:
                    field_count = len([k for k in saved_doc.keys() if not k.startswith('_')])
                    print(f"✅ Verified: Document saved with {field_count} fields")
                else:
                    print(f"❌ ERROR: Failed to save document")
        
    except Exception as e:
        print(f"❌ Scraping failed with error: {e}")
        import traceback
        traceback.print_exc()
        
        # Show what kind of error this is
        if "list index out of range" in str(e):
            print(f"\n🔍 This is still a 'list index out of range' error")
            print(f"   The fix may not have addressed the root cause")
        else:
            print(f"\n🔍 This is a different error type")
            print(f"   The 'list index out of range' issue may be fixed")

if __name__ == "__main__":
    from datetime import datetime
    test_fixed_scraper()
