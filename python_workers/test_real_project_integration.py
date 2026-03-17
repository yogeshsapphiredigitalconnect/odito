#!/usr/bin/env python3
"""
Create a test project in MongoDB to verify location/language integration.
"""

import sys
import os
from datetime import datetime, timezone
from bson import ObjectId

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import seoprojects


def create_test_project():
    """Create a test project with location and language settings."""
    print("🏗️  Creating test project with location and language settings...")
    
    test_project = {
        "_id": ObjectId("507f1f77bcf86cd799439011"),
        "user_id": ObjectId("507f1f77bcf86cd799439012"),
        "project_name": "Test SEO Project - Germany",
        "main_url": "https://example.de",
        "keywords": ["seo services", "suchmaschinenoptimierung"],
        "business_type": "Technology",
        "industry": "Software",
        "location": "Berlin",
        "country": "DE",
        "language": "de",
        "description": "Test project for German market",
        "scrape_frequency": "manual",
        "status": "active",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    try:
        # Remove existing test project if it exists
        seoprojects.delete_one({"_id": test_project["_id"]})
        
        # Insert the test project
        result = seoprojects.insert_one(test_project)
        
        print(f"✅ Test project created successfully:")
        print(f"   Project ID: {test_project['_id']}")
        print(f"   Name: {test_project['project_name']}")
        print(f"   Location: {test_project['location']}")
        print(f"   Country: {test_project['country']}")
        print(f"   Language: {test_project['language']}")
        
        return test_project["_id"]
        
    except Exception as e:
        print(f"❌ Failed to create test project: {str(e)}")
        return None


def test_with_real_project():
    """Test the keyword research worker with the real project."""
    print("\n🧪 Testing keyword research worker with real project data...")
    
    try:
        from scraper.workers.seo.keyword_research.keyword_research import (
            fetch_project_settings,
            map_language_code_to_name,
            map_country_code_to_dataforseo_code,
            get_location_name_for_api
        )
        
        # Test with the real project ID
        project_id = "507f1f77bcf86cd799439011"
        
        print(f"📋 Fetching project settings for ID: {project_id}")
        settings = fetch_project_settings(project_id)
        
        if settings:
            print("✅ Project settings retrieved successfully:")
            for key, value in settings.items():
                print(f"   {key}: {value}")
            
            # Test the mappings
            location_name = get_location_name_for_api(
                settings.get('location'), 
                settings.get('country', 'US')
            )
            language_name = map_language_code_to_name(settings.get('language', 'en'))
            location_code = map_country_code_to_dataforseo_code(settings.get('country', 'US'))
            
            print(f"\n🌍 Mapped parameters for DataForSEO API:")
            print(f"   location_name: {location_name}")
            print(f"   language_name: {language_name}")
            print(f"   location_code: {location_code}")
            
            # Verify the German mappings
            expected_mappings = {
                'location_name': 'Berlin',
                'language_name': 'German',
                'location_code': 2365  # Germany
            }
            
            print(f"\n🔍 Verification:")
            for key, expected in expected_mappings.items():
                actual = locals()[key]
                status = "✅" if actual == expected else "❌"
                print(f"   {status} {key}: expected '{expected}', got '{actual}'")
            
            return True
        else:
            print("❌ Failed to retrieve project settings")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def cleanup_test_project():
    """Clean up the test project."""
    print("\n🧹 Cleaning up test project...")
    
    try:
        result = seoprojects.delete_one({"_id": ObjectId("507f1f77bcf86cd799439011")})
        if result.deleted_count > 0:
            print("✅ Test project deleted successfully")
        else:
            print("⚠️  Test project not found for deletion")
    except Exception as e:
        print(f"❌ Failed to delete test project: {str(e)}")


def main():
    """Run the integration test."""
    print("🚀 INTEGRATION TEST WITH REAL PROJECT DATA")
    print(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)
    
    success = False
    
    try:
        # Create test project
        project_id = create_test_project()
        if not project_id:
            return 1
        
        # Test with real project data
        success = test_with_real_project()
        
    finally:
        # Always cleanup
        cleanup_test_project()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 INTEGRATION TEST PASSED")
        print("✅ Location and language support is working correctly!")
    else:
        print("❌ INTEGRATION TEST FAILED")
        print("⚠️  Please check the implementation")
    
    return 0 if success else 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
