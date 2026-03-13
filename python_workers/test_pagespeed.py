"""Test script to validate PageSpeed API request format"""

import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_pagespeed_api():
    """Test PageSpeed API with correct format"""
    
    # Get API key
    api_key = os.getenv('PSI_API_KEY')
    if not api_key:
        print("❌ PSI_API_KEY not found in environment")
        return
    
    print(f"✅ Using API key: {api_key[:10]}...")
    
    # Test URL
    test_url = "https://www.sapphiredigitalconnect.com/"
    print(f"🌐 Testing URL: {test_url}")
    
    # PageSpeed API endpoint
    api_url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
    
    # Test mobile request
    print("\n📱 Testing mobile request...")
    mobile_params = {
        'url': test_url,
        'strategy': 'mobile',
        'key': api_key,
        'category': 'performance'  # String, not array
    }
    
    try:
        print(f"Request params: {mobile_params}")
        response = requests.get(api_url, params=mobile_params, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            score = data.get('lighthouseResult', {}).get('categories', {}).get('performance', {}).get('score', 0)
            print(f"✅ Mobile test successful! Performance score: {score * 100:.0f}")
        else:
            print(f"❌ Mobile test failed")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Mobile test error: {str(e)}")
    
    # Test desktop request
    print("\n🖥️ Testing desktop request...")
    desktop_params = {
        'url': test_url,
        'strategy': 'desktop',
        'key': api_key,
        'category': 'performance'
    }
    
    try:
        print(f"Request params: {desktop_params}")
        response = requests.get(api_url, params=desktop_params, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            score = data.get('lighthouseResult', {}).get('categories', {}).get('performance', {}).get('score', 0)
            print(f"✅ Desktop test successful! Performance score: {score * 100:.0f}")
        else:
            print(f"❌ Desktop test failed")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Desktop test error: {str(e)}")

if __name__ == "__main__":
    test_pagespeed_api()
