"""
Test runner for diagnostic tracer on sapphiredigitalconnect.com
"""

import requests
from bs4 import BeautifulSoup
from diagnostic_tracer import run_full_diagnostic

def test_sapphiredigitalconnect():
    """Run diagnostic on the specific problematic page."""
    url = "http://sapphiredigitalconnect.com"
    
    print(f"Fetching: {url}")
    
    # Fetch the page
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        html = response.text
    except Exception as e:
        print(f"Failed to fetch page: {e}")
        return
    
    # Parse with BeautifulSoup
    soup = BeautifulSoup(html, "lxml")
    
    # Mock seo_data structure (simulate what PAGE_SCRAPING would extract)
    seo_data = {
        "title": soup.title.string.strip() if soup.title else "",
        "meta_tags": {},
        "content": {
            "headings": {},
            "text": soup.get_text(strip=True, separator=' ')
        },
        "images": []
    }
    
    # Extract meta tags
    for meta in soup.find_all("meta"):
        key = meta.get("name") or meta.get("property") or meta.get("http-equiv") or meta.get("charset")
        value = meta.get("content")
        if key and value:
            key = key.lower()
            if key not in seo_data["meta_tags"]:
                seo_data["meta_tags"][key] = []
            seo_data["meta_tags"][key].append(value.strip())
    
    # Extract headings
    for i in range(1, 7):
        tag = f"h{i}"
        headings = [h.get_text(strip=True) for h in soup.find_all(tag) if h.get_text(strip=True)]
        seo_data["content"]["headings"][tag] = headings
    
    # Extract images
    for img in soup.find_all("img", src=True):
        seo_data["images"].append({
            "src": img.get("src"),
            "alt": img.get("alt", ""),
            "width": img.get("width"),
            "height": img.get("height"),
            "title": img.get("title"),
            "is_decorative": False
        })
    
    # Mock response headers
    response_headers = dict(response.headers)
    
    # Run diagnostic
    diagnostic_results = run_full_diagnostic(html, soup, seo_data, response_headers, url)
    
    return diagnostic_results

if __name__ == "__main__":
    test_sapphiredigitalconnect()
