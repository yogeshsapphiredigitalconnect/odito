"""Robots.txt fetcher for domain-level technical data collection."""

import requests
import random
from config.config import USER_AGENTS


def fetch_robots(domain: str) -> dict:
    """
    Fetch /robots.txt for the given domain.
    
    Returns:
        dict with keys: status, exists, content
    """
    result = {
        "status": None,
        "exists": False,
        "content": ""
    }
    
    # Normalize domain URL
    robots_url = domain.rstrip("/") + "/robots.txt"
    
    try:
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/plain, */*"
        }
        
        response = requests.get(robots_url, headers=headers, timeout=10, allow_redirects=True)
        result["status"] = response.status_code
        
        if response.status_code == 200:
            result["exists"] = True
            result["content"] = response.text[:50000]  # Cap at 50KB to avoid huge files
            print(f"✅ robots.txt found | url={robots_url} | size={len(response.text)} bytes")
        else:
            print(f"⚠️ robots.txt returned status {response.status_code} | url={robots_url}")
            
    except requests.exceptions.Timeout:
        print(f"⚠️ robots.txt request timed out | url={robots_url}")
        result["status"] = 0
    except requests.exceptions.ConnectionError as e:
        print(f"⚠️ robots.txt connection error | url={robots_url} | error={str(e)}")
        result["status"] = 0
    except Exception as e:
        print(f"⚠️ robots.txt fetch failed | url={robots_url} | error={str(e)}")
        result["status"] = 0
    
    return result
