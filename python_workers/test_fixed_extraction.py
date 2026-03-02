"""
Test runner for fixed intelligence extraction on sapphiredigitalconnect.com
"""

import requests
from bs4 import BeautifulSoup
from scraper.shared.intelligence import extract_seo_intelligence

def test_fixed_extraction():
    """Test fixed extraction on the problematic page."""
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
        "images": [],
        "structured_data": []
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
    
    # Extract structured data
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            import json
            schema = json.loads(script.string)
            seo_data["structured_data"].append(schema)
        except:
            pass
    
    # Mock response headers
    response_headers = dict(response.headers)
    
    # Run fixed intelligence extraction
    intelligence_results = extract_seo_intelligence(html, soup, seo_data, response_headers, url)
    
    # Print validation results
    print("\n" + "="*80)
    print("FIXED EXTRACTION VALIDATION RESULTS")
    print("="*80)
    
    # Content analysis
    content = intelligence_results.get("content_analysis", {})
    print(f"\nCONTENT ANALYSIS:")
    print(f"   Word count: {content.get('word_count', 'N/A')}")
    print(f"   Internal repetition ratio: {content.get('internal_repetition_ratio', 'N/A')}")
    print(f"   First 200 words preview: \"{content.get('first_200_words', '')[:200]}...\"")
    
    if 'debug_info' in content:
        debug = content['debug_info']
        print(f"   Container type: {debug.get('original_container_type', 'N/A')}")
        print(f"   Original text length: {debug.get('original_text_length', 'N/A')}")
        print(f"   Cleaned text length: {debug.get('cleaned_text_length', 'N/A')}")
        print(f"   Text reduction ratio: {debug.get('text_reduction_ratio', 'N/A')}")
    
    # Hero image
    image_context = intelligence_results.get("image_context", {})
    hero = image_context.get("hero_image", {})
    print(f"\nHERO IMAGE:")
    print(f"   Selected: {hero.get('src', 'None')}")
    print(f"   Size: {hero.get('width', 'N/A')}x{hero.get('height', 'N/A')}")
    print(f"   Confidence: {hero.get('hero_image_confidence_score', 'N/A')}")
    
    logo = image_context.get("logo_image", {})
    print(f"   Logo detected: {logo.get('src', 'None')}")
    
    # Headings
    headings = intelligence_results.get("heading_analysis_extended", {})
    heading_list = headings.get("headings", [])
    print(f"\nHEADING ANALYSIS:")
    print(f"   Total headings: {len(heading_list)}")
    
    # Show first 10 headings with parent levels
    print(f"   First 10 headings:")
    for i, h in enumerate(heading_list[:10]):
        parent_level = h.get('parent_level')
        parent_display = 'null' if parent_level is None else parent_level
        print(f"     h{h.get('level')} \"{h.get('text', '')[:30]}...\" parent: {parent_display}")
    
    # Check for parent_level = 0 issues
    zero_parent_count = sum(1 for h in heading_list if h.get('parent_level') == 0)
    if zero_parent_count > 0:
        print(f"   WARNING: Found {zero_parent_count} headings with parent_level = 0")
    else:
        print(f"   No parent_level = 0 issues found")
    
    # Links
    links = intelligence_results.get("link_analysis", {})
    print(f"\nLINK ANALYSIS:")
    print(f"   Total internal links (unique): {links.get('total_internal_links', 'N/A')}")
    print(f"   Total external links (unique): {links.get('total_external_links', 'N/A')}")
    print(f"   Orphan candidates: {len(links.get('orphan_candidates', []))}")
    
    # Debug: show raw href_data count
    link_list = links.get("links", [])
    print(f"   Debug: Total links in list: {len(link_list)}")
    
    # Show link dedup effectiveness
    multi_occurrence = [l for l in link_list if l.get('occurrence_count', 1) > 1]
    print(f"   Links with multiple occurrences: {len(multi_occurrence)}")
    
    if multi_occurrence:
        print(f"   Example multi-occurrence links:")
        for link in multi_occurrence[:3]:
            print(f"     {link.get('href', '')} - appears {link.get('occurrence_count', 1)} times")
            print(f"       Anchor variations: {link.get('anchor_variations', [])}")
    else:
        # Show first few links for debugging
        print(f"   First 5 links:")
        for i, link in enumerate(link_list[:5]):
            print(f"     {i+1}. {link.get('href', '')} - internal: {link.get('is_internal')}")
    
    # Schema validation
    schema = intelligence_results.get("schema_validation", {})
    schemas = schema.get("schemas", [])
    local_business = next((s for s in schemas if s.get('type') == 'LocalBusiness'), None)
    if local_business:
        print(f"\nSCHEMA VALIDATION:")
        print(f"   LocalBusiness missing required: {local_business.get('missing_required', [])}")
    
    return intelligence_results

if __name__ == "__main__":
    test_fixed_extraction()
