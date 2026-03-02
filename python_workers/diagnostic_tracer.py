"""
Diagnostic tracer for PAGE_SCRAPING extraction logic.
Identifies why intelligence extraction produces incorrect results.
"""

import re
import json
from collections import Counter, defaultdict
from urllib.parse import urlparse, urljoin, unquote
from bs4 import BeautifulSoup

# Import the actual intelligence functions
from scraper.shared.intelligence import (
    _get_clean_content_soup, _remove_duplicate_blocks, _normalize_link_url,
    _extract_content_intelligence, _extract_image_context_intelligence,
    _extract_heading_intelligence, _extract_link_intelligence,
    _RE_NOISE_ATTR, _RE_HERO_EXCLUDE, _RE_SENTENCE_SPLIT, _RE_WORD
)

def trace_content_cleaning(html: str, url: str):
    """Trace content cleaning logic step by step."""
    print("\n" + "="*80)
    print("STEP 1 — CONTENT CLEANING TRACE")
    print("="*80)
    
    soup_original = BeautifulSoup(html, "lxml")
    
    # 1. Check for main tag
    main_tag = soup_original.find("main")
    print(f"\n1. <main> tag detected: {bool(main_tag)}")
    if main_tag:
        main_classes = main_tag.get("class", [])
        main_text_len = len(main_tag.get_text(strip=True))
        print(f"   <main> classes: {main_classes}")
        print(f"   <main> text length: {main_text_len}")
    
    # 2. Get raw text length before any cleaning
    body_original = soup_original.find("body")
    raw_text = body_original.get_text(separator=" ", strip=True) if body_original else ""
    print(f"\n2. Raw body text length (before cleaning): {len(raw_text)}")
    
    # 3. Apply cleaning step by step
    soup_clean = BeautifulSoup(html, "lxml")
    
    # Remove structural tags
    removed_structural = []
    for tag_name in ["script", "style", "nav", "footer", "aside", "header", "noscript"]:
        elements = soup_clean.find_all(tag_name)
        removed_structural.extend([f"{tag_name}({len(elements)})" for _ in elements])
        for el in elements:
            el.decompose()
    
    print(f"\n3. Structural tags removed: {', '.join(removed_structural)}")
    
    # Remove noise elements
    noise_elements = []
    for el in soup_clean.find_all(True):
        if not hasattr(el, 'attrs') or not el.attrs:
            continue
        classes = el.get('class') or []
        el_id = el.get('id', '') or ""
        combined = f"{' '.join(classes)} {el_id}"
        if _RE_NOISE_ATTR.search(combined):
            noise_elements.append(f"{el.name}({classes})")
            el.decompose()
    
    print(f"4. Noise elements removed: {len(noise_elements)}")
    if len(noise_elements) <= 10:
        for noise in noise_elements:
            print(f"   - {noise}")
    
    # Remove forms
    form_elements = soup_clean.find_all(["form", "input", "select", "textarea", "button", "label"])
    for el in form_elements:
        el.decompose()
    print(f"5. Form elements removed: {len(form_elements)}")
    
    # Check main content selection
    final_main = soup_clean.find("main")
    if final_main:
        selected_container = "main"
        container_text = final_main.get_text(strip=True)
        print(f"\n6. Selected container: <main>")
        print(f"   Container text length: {len(container_text)}")
    else:
        # Find largest div
        best_div = None
        best_len = 0
        all_divs = soup_clean.find_all("div")
        
        for div in all_divs:
            text_len = len(div.get_text(strip=True))
            if text_len > best_len:
                best_len = text_len
                best_div = div
        
        if best_div and best_len > 100:
            selected_container = f"div(class={best_div.get('class', [])})"
            container_text = best_div.get_text(strip=True)
            print(f"\n6. Selected container: {selected_container}")
            print(f"   Container text length: {best_len}")
        else:
            selected_container = "body"
            container_text = soup_clean.get_text(strip=True)
            print(f"\n6. Selected container: <body> (fallback)")
            print(f"   Container text length: {len(container_text)}")
    
    # Get final cleaned text
    cleaned_text = container_text
    
    # Remove duplicate blocks
    dedup_text = _remove_duplicate_blocks(cleaned_text)
    
    print(f"\n7. Text length after structural cleaning: {len(cleaned_text)}")
    print(f"8. Text length after duplicate removal: {len(dedup_text)}")
    
    # Find repeated sequences
    words = dedup_text.split()
    repeated_sequences = []
    
    for i in range(len(words) - 9):
        seq = " ".join(words[i:i+10])
        count = dedup_text.count(seq)
        if count > 1:
            repeated_sequences.append((seq, count))
    
    # Sort by frequency
    repeated_sequences.sort(key=lambda x: x[1], reverse=True)
    
    print(f"\n9. Top 5 most repeated 10-word sequences:")
    for seq, count in repeated_sequences[:5]:
        print(f"   \"{seq[:100]}...\" - appears {count} times")
    
    return {
        "raw_text_length": len(raw_text),
        "cleaned_text_length": len(cleaned_text),
        "dedup_text_length": len(dedup_text),
        "selected_container": selected_container,
        "repeated_sequences": repeated_sequences[:5]
    }


def trace_hero_image_detection(soup: BeautifulSoup, seo_data: dict, base_url: str):
    """Trace hero image detection logic."""
    print("\n" + "="*80)
    print("STEP 2 — HERO IMAGE TRACE")
    print("="*80)
    
    images = seo_data.get("images", [])
    page_domain = urlparse(base_url).netloc.lower()
    
    # Find H1 position
    first_h1 = soup.find("h1")
    h1_dom_position = None
    if first_h1:
        h1_dom_position = len(list(first_h1.find_all_previous()))
        print(f"1. H1 found at DOM position: {h1_dom_position}")
        print(f"   H1 text: \"{first_h1.get_text(strip=True)}\"")
    else:
        print("1. No H1 found")
    
    # Build header/nav exclusion set
    header_nav_srcs = set()
    for container in soup.find_all(["header", "nav"]):
        for img in container.find_all("img", src=True):
            src = img.get("src", "").strip()
            header_nav_srcs.add(src)
    
    print(f"\n2. Images in header/nav to exclude: {len(header_nav_srcs)}")
    for src in list(header_nav_srcs)[:5]:
        print(f"   - {src}")
    
    print(f"\n3. Hero image candidate analysis:")
    
    best_hero = None
    best_hero_area = 0
    logo_image = None
    
    for idx, img_data in enumerate(images):
        src = img_data.get("src", "")
        alt = img_data.get("alt", "")
        width = img_data.get("width")
        height = img_data.get("height")
        
        # Parse dimensions
        w_num = 0
        h_num = 0
        try:
            w_num = int(str(width).replace("px", "").strip()) if width else 0
        except:
            pass
        try:
            h_num = int(str(height).replace("px", "").strip()) if height else 0
        except:
            pass
        
        src_lower = src.lower()
        alt_lower = alt.lower()
        area = w_num * h_num
        
        # Logo detection
        if not logo_image and ("logo" in src_lower or "logo" in alt_lower):
            logo_image = {"src": src, "dom_index": idx}
            print(f"\n   [{idx}] LOGO DETECTED: {src}")
            print(f"        Size: {w_num}x{h_num}, Area: {area}")
            print(f"        Reason: Contains 'logo' in filename/alt")
        
        # Hero candidate evaluation
        rejection_reasons = []
        
        # Check exclusions
        if _RE_HERO_EXCLUDE.search(src_lower):
            rejection_reasons.append("filename contains logo/icon/favicon")
        
        if w_num < 300 or h_num < 200:
            rejection_reasons.append(f"too small ({w_num}x{h_num})")
        
        if src.strip() in header_nav_srcs:
            rejection_reasons.append("inside header/nav")
        
        print(f"\n   [{idx}] HERO CANDIDATE: {src}")
        print(f"        Size: {w_num}x{h_num}, Area: {area}")
        print(f"        DOM index: {idx}")
        
        if rejection_reasons:
            print(f"        REJECTED: {', '.join(rejection_reasons)}")
        else:
            print(f"        ACCEPTED: Valid hero candidate")
            
            # Calculate confidence
            confidence = 0.5
            if h1_dom_position is not None and idx > 0:
                confidence += 0.2
            if w_num >= 600:
                confidence += 0.15
            if h_num >= 400:
                confidence += 0.15
            confidence = min(round(confidence, 2), 1.0)
            
            print(f"        Confidence score: {confidence}")
            
            if area > best_hero_area:
                best_hero = {
                    "src": src,
                    "dom_index": idx,
                    "width": w_num,
                    "height": h_num,
                    "area": area,
                    "confidence": confidence
                }
                best_hero_area = area
                print(f"        → NEW BEST HERO (area: {area})")
            else:
                print(f"        → Not best (current best area: {best_hero_area})")
    
    print(f"\n4. FINAL HERO SELECTION:")
    if best_hero:
        print(f"   Selected: {best_hero['src']}")
        print(f"   Size: {best_hero['width']}x{best_hero['height']}")
        print(f"   Area: {best_hero['area']}")
        print(f"   Confidence: {best_hero['confidence']}")
    else:
        print("   No hero image selected")
    
    if logo_image:
        print(f"\n5. LOGO IMAGE:")
        print(f"   Detected: {logo_image['src']}")
        print(f"   DOM index: {logo_image['dom_index']}")
    
    return {
        "hero_selected": best_hero,
        "logo_detected": logo_image,
        "total_candidates": len(images),
        "header_nav_exclusions": len(header_nav_srcs)
    }


def trace_heading_parent_logic(soup: BeautifulSoup, seo_data: dict):
    """Trace heading parent level logic."""
    print("\n" + "="*80)
    print("STEP 3 — HEADING PARENT LOGIC TRACE")
    print("="*80)
    
    title = seo_data.get("title", "") or ""
    
    headings = soup.find_all(re.compile(r'^h[1-6]$'))
    print(f"1. Total headings found: {len(headings)}")
    
    heading_stack = []  # [(level, dom_index), ...]
    dom_index = 0
    
    for i, tag in enumerate(headings[:15]):  # First 15 only
        text = tag.get_text(strip=True)
        if not text:
            continue
        
        level = int(tag.name[1])
        
        print(f"\n   [{i}] <h{level}> \"{text[:50]}...\"")
        print(f"        DOM index: {dom_index}")
        
        # Find parent logic
        parent_level = None
        considered_parents = []
        
        for prev_level, prev_dom_index in reversed(heading_stack):
            considered_parents.append(f"h{prev_level}(index={prev_dom_index})")
            if prev_level < level:
                parent_level = prev_level
                break
        
        print(f"        Previous headings considered: {considered_parents}")
        print(f"        Parent level selected: {parent_level}")
        
        if parent_level is None:
            print(f"        Reason: No previous heading with lower level found")
        else:
            print(f"        Reason: Closest previous heading with lower level")
        
        # Check for parent_level = 0 issue
        if parent_level == 0:
            print(f"        ⚠️  WARNING: parent_level should never be 0!")
        
        heading_stack.append((level, dom_index))
        dom_index += 1
    
    return {
        "total_headings": len(headings),
        "traced_headings": min(15, len(headings))
    }


def trace_link_deduplication(soup: BeautifulSoup, seo_data: dict, base_url: str):
    """Trace link deduplication logic."""
    print("\n" + "="*80)
    print("STEP 4 — LINK DEDUP TRACE")
    print("="*80)
    
    page_domain = urlparse(base_url).netloc.lower().replace("www.", "")
    normalized_page_url = _normalize_link_url(base_url, base_url)
    
    # Find all <a> tags
    all_a_tags = soup.find_all("a", href=True)
    print(f"1. Total raw <a> tags found: {len(all_a_tags)}")
    
    # Extract and normalize
    raw_links = []
    for a_tag in all_a_tags:
        href = a_tag.get("href", "").strip()
        if not href or href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:") or href.startswith("javascript:"):
            continue
        
        anchor_text = a_tag.get_text(strip=True)[:200]
        raw_links.append({
            "href": href,
            "anchor_text": anchor_text,
            "normalized_href": _normalize_link_url(href, base_url)
        })
    
    print(f"2. Links after basic filtering: {len(raw_links)}")
    
    # Deduplication
    seen_links = set()
    deduped_links = []
    duplicate_clusters = defaultdict(list)
    
    for i, link in enumerate(raw_links):
        normalized_href = link["normalized_href"]
        anchor_text = link["anchor_text"].lower().strip()
        dedup_key = (normalized_href, anchor_text)
        
        if dedup_key in seen_links:
            duplicate_clusters[dedup_key].append(i)
            continue
        
        seen_links.add(dedup_key)
        deduped_links.append(link)
    
    print(f"3. Links after deduplication: {len(deduped_links)}")
    
    # Show duplicate clusters
    print(f"\n4. Duplicate clusters found:")
    for (href, anchor), indices in list(duplicate_clusters.items())[:5]:
        print(f"   \"{href}\" with anchor \"{anchor}\" - appears {len(indices)+1} times")
        print(f"   Found at indices: {indices[:5]}")
    
    # Navigation analysis
    nav_hrefs = set()
    for nav in soup.find_all(["nav", "header"]):
        for a in nav.find_all("a", href=True):
            nav_hrefs.add(_normalize_link_url(a.get("href", "").strip(), base_url))
    
    print(f"\n5. Navigation links detected: {len(nav_hrefs)}")
    for nav_href in list(nav_hrefs)[:5]:
        print(f"   - {nav_href}")
    
    # Check for navigation duplicates in final list
    nav_duplicates = 0
    for link in deduped_links:
        if link["normalized_href"] in nav_hrefs:
            nav_duplicates += 1
    
    print(f"\n6. Navigation links in final deduped list: {nav_duplicates}")
    
    return {
        "raw_a_tags": len(all_a_tags),
        "filtered_links": len(raw_links),
        "deduped_links": len(deduped_links),
        "duplicate_clusters": len(duplicate_clusters),
        "nav_links": len(nav_hrefs),
        "nav_in_final": nav_duplicates
    }


def trace_orphan_detection(soup: BeautifulSoup, seo_data: dict, base_url: str):
    """Trace orphan detection logic."""
    print("\n" + "="*80)
    print("STEP 5 — ORPHAN DETECTION TRACE")
    print("="*80)
    
    page_domain = urlparse(base_url).netloc.lower().replace("www.", "")
    normalized_page_url = _normalize_link_url(base_url, base_url)
    
    print(f"1. Current page URL: {base_url}")
    print(f"   Normalized: {normalized_page_url}")
    
    # Extract all internal links
    internal_links = []
    for a_tag in soup.find_all("a", href=True):
        href = a_tag.get("href", "").strip()
        if not href or href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:") or href.startswith("javascript:"):
            continue
        
        abs_url = href if href.startswith("http") else urljoin(base_url, href)
        
        try:
            link_domain = urlparse(abs_url).netloc.lower().replace("www.", "")
        except:
            link_domain = ""
        
        if link_domain.endswith(page_domain):
            normalized_href = _normalize_link_url(href, base_url)
            anchor_text = a_tag.get_text(strip=True)
            internal_links.append({
                "href": href,
                "normalized_href": normalized_href,
                "anchor_text": anchor_text,
                "abs_url": abs_url
            })
    
    print(f"2. Total internal links found: {len(internal_links)}")
    
    # Get nav links for exclusion
    nav_hrefs = set()
    for nav in soup.find_all(["nav", "header"]):
        for a in nav.find_all("a", href=True):
            nav_hrefs.add(_normalize_link_url(a.get("href", "").strip(), base_url))
    
    print(f"3. Navigation links for exclusion: {len(nav_hrefs)}")
    
    # Orphan detection logic
    orphan_candidates = []
    homepage_appearances = 0
    
    for link in internal_links:
        anchor_text = link["anchor_text"]
        normalized_href = link["normalized_href"]
        
        # Check if it's an orphan candidate
        is_orphan_candidate = False
        reasons = []
        
        if not anchor_text.strip():
            reasons.append("empty anchor text")
        else:
            reasons.append("has anchor text")
        
        if normalized_href != normalized_page_url:
            reasons.append("not homepage self-link")
        else:
            reasons.append("homepage self-link")
            homepage_appearances += 1
        
        if normalized_href not in nav_hrefs:
            reasons.append("not in navigation")
        else:
            reasons.append("in navigation")
        
        # Apply orphan logic
        if not anchor_text.strip() and normalized_href != normalized_page_url and normalized_href not in nav_hrefs:
            is_orphan_candidate = True
            orphan_candidates.append(link["href"])
        
        # Trace first few internal links
        if len(orphan_candidates) <= 5 or link["href"] in orphan_candidates[:5]:
            print(f"\n   Internal link: {link['href']}")
            print(f"   Normalized: {normalized_href}")
            print(f"   Anchor: \"{anchor_text}\"")
            print(f"   Reasons: {', '.join(reasons)}")
            print(f"   Orphan candidate: {is_orphan_candidate}")
    
    print(f"\n4. Homepage self-link count: {homepage_appearances}")
    print(f"5. Total orphan candidates: {len(orphan_candidates)}")
    
    # Show homepage appearances
    homepage_links = [link for link in internal_links if link["normalized_href"] == normalized_page_url]
    print(f"\n6. Homepage link details:")
    for link in homepage_links[:3]:
        print(f"   href: {link['href']}")
        print(f"   anchor: \"{link['anchor_text']}\"")
        print(f"   normalized: {link['normalized_href']}")
    
    return {
        "internal_links": len(internal_links),
        "nav_links": len(nav_hrefs),
        "homepage_appearances": homepage_appearances,
        "orphan_candidates": len(orphan_candidates),
        "homepage_links": len(homepage_links)
    }


def run_full_diagnostic(html: str, soup: BeautifulSoup, seo_data: dict, response_headers: dict, base_url: str):
    """Run complete diagnostic trace."""
    print("STARTING DIAGNOSTIC MODE")
    print(f"Target URL: {base_url}")
    print(f"Timestamp: {__import__('datetime').datetime.now()}")
    
    # Run all traces
    content_trace = trace_content_cleaning(html, base_url)
    hero_trace = trace_hero_image_detection(soup, seo_data, base_url)
    heading_trace = trace_heading_parent_logic(soup, seo_data)
    link_trace = trace_link_deduplication(soup, seo_data, base_url)
    orphan_trace = trace_orphan_detection(soup, seo_data, base_url)
    
    # Summary
    print("\n" + "="*80)
    print("DIAGNOSTIC SUMMARY")
    print("="*80)
    
    print(f"\n🔍 CONTENT CLEANING:")
    print(f"   Raw → Cleaned → Dedup: {content_trace['raw_text_length']} → {content_trace['cleaned_text_length']} → {content_trace['dedup_text_length']}")
    print(f"   Selected container: {content_trace['selected_container']}")
    print(f"   Repeated sequences: {len(content_trace['repeated_sequences'])}")
    
    print(f"\n🖼️  HERO IMAGE:")
    print(f"   Total candidates: {hero_trace['total_candidates']}")
    print(f"   Logo detected: {bool(hero_trace['logo_detected'])}")
    print(f"   Hero selected: {bool(hero_trace['hero_selected'])}")
    
    print(f"\n📝 HEADINGS:")
    print(f"   Total headings: {heading_trace['total_headings']}")
    print(f"   Traced headings: {heading_trace['traced_headings']}")
    
    print(f"\n🔗 LINKS:")
    print(f"   Raw → Filtered → Dedup: {link_trace['raw_a_tags']} → {link_trace['filtered_links']} → {link_trace['deduped_links']}")
    print(f"   Duplicate clusters: {link_trace['duplicate_clusters']}")
    print(f"   Nav links in final: {link_trace['nav_in_final']}")
    
    print(f"\n👻 ORPHANS:")
    print(f"   Internal links: {orphan_trace['internal_links']}")
    print(f"   Homepage appearances: {orphan_trace['homepage_appearances']}")
    print(f"   Orphan candidates: {orphan_trace['orphan_candidates']}")
    
    return {
        "content": content_trace,
        "hero": hero_trace,
        "headings": heading_trace,
        "links": link_trace,
        "orphans": orphan_trace
    }


if __name__ == "__main__":
    # Test with sample data
    print("Diagnostic tracer ready. Import and run run_full_diagnostic() with actual page data.")
