"""Sitemap.xml fetcher for domain-level technical data collection."""

import requests
import random
import re
from config.config import USER_AGENTS


def fetch_sitemap(domain: str) -> dict:
    """
    Fetch /sitemap.xml for the given domain.
    
    Returns:
        dict with keys: status, exists, content, url_count
    """
    result = {
        "status": None,
        "exists": False,
        "content": "",
        "url_count": 0
    }
    
    # Normalize domain URL
    sitemap_url = domain.rstrip("/") + "/sitemap.xml"
    
    try:
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "application/xml, text/xml, */*"
        }
        
        response = requests.get(sitemap_url, headers=headers, timeout=10, allow_redirects=True)
        result["status"] = response.status_code
        
        if response.status_code == 200:
            content = response.text
            result["exists"] = True
            result["content"] = content[:100000]  # Cap at 100KB to avoid huge sitemaps
            
            # Basic URL count from <loc> tags (no deep XML parsing needed)
            result["url_count"] = len(re.findall(r'<loc>', content, re.IGNORECASE))
            
            print(f"✅ sitemap.xml found | url={sitemap_url} | size={len(content)} bytes | urls={result['url_count']}")
        else:
            print(f"⚠️ sitemap.xml returned status {response.status_code} | url={sitemap_url}")
            
    except requests.exceptions.Timeout:
        print(f"⚠️ sitemap.xml request timed out | url={sitemap_url}")
        result["status"] = 0
    except requests.exceptions.ConnectionError as e:
        print(f"⚠️ sitemap.xml connection error | url={sitemap_url} | error={str(e)}")
        result["status"] = 0
    except Exception as e:
        print(f"⚠️ sitemap.xml fetch failed | url={sitemap_url} | error={str(e)}")
        result["status"] = 0
    
    return result
