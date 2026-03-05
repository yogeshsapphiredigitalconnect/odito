#!/usr/bin/env python3
"""
AI Visibility Scraper Test
Comprehensive extraction test for sapphiredigitalconnect.com
"""

import json
import re
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import html

def analyze_seo_signals(html_content):
    """Extract comprehensive SEO signals from HTML"""
    
    soup = BeautifulSoup(html_content, 'lxml')
    
    # Initialize result structure
    result = {
        "page_metadata": {},
        "structured_data": {},
        "entity_signals": {},
        "author_signals": {},
        "content_structure": {},
        "image_analysis": {},
        "internal_linking": {},
        "nap_signals": {},
        "aeo_signals": {},
        "extraction_quality": {}
    }
    
    print("=" * 80)
    print("AI VISIBILITY SCRAPER TEST RESULTS")
    print("=" * 80)
    
    # ==================== PAGE METADATA ====================
    print("\n📄 PAGE METADATA")
    print("-" * 40)
    
    # Title
    title_tag = soup.find('title')
    title = title_tag.get_text().strip() if title_tag else ""
    result["page_metadata"]["title"] = title
    print(f"Title: {title}")
    
    # Meta description
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    meta_description = meta_desc.get('content', '').strip() if meta_desc else ""
    result["page_metadata"]["meta_description"] = meta_description
    print(f"Meta Description: {meta_description}")
    
    # Canonical URL
    canonical = soup.find('link', rel='canonical')
    canonical_url = canonical.get('href', '') if canonical else ""
    result["page_metadata"]["canonical_url"] = canonical_url
    print(f"Canonical URL: {canonical_url}")
    
    # Robots meta
    robots_meta = soup.find('meta', attrs={'name': 'robots'})
    robots = robots_meta.get('content', '') if robots_meta else ""
    result["page_metadata"]["robots_meta"] = robots
    print(f"Robots Meta: {robots}")
    
    # Viewport meta
    viewport = soup.find('meta', attrs={'name': 'viewport'})
    viewport_content = viewport.get('content', '') if viewport else ""
    result["page_metadata"]["viewport_meta"] = viewport_content
    print(f"Viewport: {viewport_content}")
    
    # Language attribute
    html_tag = soup.find('html')
    language = html_tag.get('lang', '') if html_tag else ""
    result["page_metadata"]["language_attribute"] = language
    print(f"Language: {language}")
    
    # ==================== STRUCTURED DATA ====================
    print("\n🏗️ STRUCTURED DATA")
    print("-" * 40)
    
    json_ld_scripts = soup.find_all('script', type='application/ld+json')
    all_json_ld = []
    schema_types = []
    organization_entity = None
    person_entity = None
    article_entity = None
    sameas_links = []
    logo_url = ""
    
    for script in json_ld_scripts:
        try:
            data = json.loads(script.string)
            all_json_ld.append(data)
            
            # Handle both single objects and @graph arrays
            entities = data if isinstance(data, list) else ([data] if not isinstance(data, dict) or '@graph' not in data else data['@graph'])
            
            for entity in entities:
                if isinstance(entity, dict):
                    entity_type = entity.get('@type', '')
                    
                    # Handle multiple types
                    if isinstance(entity_type, list):
                        schema_types.extend(entity_type)
                    else:
                        schema_types.append(entity_type)
                    
                    # Extract specific entities
                    if entity_type in ['Organization', 'LocalBusiness'] or (isinstance(entity_type, list) and any(t in ['Organization', 'LocalBusiness'] for t in entity_type)):
                        organization_entity = entity
                        print(f"Organization Found: {entity.get('name', 'N/A')}")
                        
                        # Check for both name and legalName
                        name = entity.get('name', '')
                        legal_name = entity.get('legalName', '')
                        print(f"  - Name: {name}")
                        print(f"  - Legal Name: {legal_name}")
                        
                        # Extract sameAs links
                        if 'sameAs' in entity:
                            sameas_links.extend(entity['sameAs'] if isinstance(entity['sameAs'], list) else [entity['sameAs']])
                        
                        # Extract logo
                        if 'logo' in entity:
                            logo = entity['logo']
                            if isinstance(logo, dict):
                                logo_url = logo.get('url', '')
                            else:
                                logo_url = str(logo)
                    
                    elif entity_type in ['Person'] or (isinstance(entity_type, list) and 'Person' in entity_type):
                        person_entity = entity
                        print(f"Person Found: {entity.get('name', 'N/A')}")
                    
                    elif entity_type in ['Article', 'BlogPosting', 'NewsArticle'] or (isinstance(entity_type, list) and any(t in ['Article', 'BlogPosting', 'NewsArticle'] for t in entity_type)):
                        article_entity = entity
                        print(f"Article Found: {entity.get('headline', 'N/A')}")
        
        except json.JSONDecodeError as e:
            print(f"JSON-LD parse error: {e}")
            continue
    
    result["structured_data"]["json_ld_blocks"] = all_json_ld
    result["structured_data"]["schema_types"] = list(set(schema_types))
    result["structured_data"]["organization_entity"] = organization_entity
    result["structured_data"]["person_entity"] = person_entity
    result["structured_data"]["article_entity"] = article_entity
    result["structured_data"]["sameas_links"] = sameas_links
    result["structured_data"]["logo_url"] = logo_url
    
    print(f"Schema Types Found: {list(set(schema_types))}")
    print(f"SameAs Links: {sameas_links}")
    print(f"Logo URL: {logo_url}")
    
    # ==================== ENTITY SIGNALS ====================
    print("\n🎯 ENTITY SIGNALS")
    print("-" * 40)
    
    primary_entity_name = ""
    primary_entity_type = ""
    
    if organization_entity:
        primary_entity_name = organization_entity.get('name', '')
        primary_entity_type = 'Organization'
    elif article_entity:
        primary_entity_name = article_entity.get('headline', '')
        primary_entity_type = 'Article'
    elif person_entity:
        primary_entity_name = person_entity.get('name', '')
        primary_entity_type = 'Person'
    
    # Count entity mentions in content
    main_content = extract_main_content(soup)
    entity_mentions = 0
    
    if primary_entity_name and main_content:
        entity_mentions = len(re.findall(re.escape(primary_entity_name), main_content, re.IGNORECASE))
    
    result["entity_signals"]["primary_entity_name"] = primary_entity_name
    result["entity_signals"]["primary_entity_type"] = primary_entity_type
    result["entity_signals"]["entity_mentions_in_content"] = entity_mentions
    result["entity_signals"]["entity_mention_count"] = entity_mentions
    
    print(f"Primary Entity: {primary_entity_name}")
    print(f"Entity Type: {primary_entity_type}")
    print(f"Entity Mentions: {entity_mentions}")
    
    # ==================== AUTHOR SIGNALS ====================
    print("\n✍️ AUTHOR SIGNALS")
    print("-" * 40)
    
    author_name = ""
    byline_text = ""
    person_schema_detected = bool(person_entity)
    author_profile_link = ""
    date_published = ""
    date_modified = ""
    
    # Extract from Person schema
    if person_entity:
        author_name = person_entity.get('name', '')
        author_profile_link = person_entity.get('url', '')
    
    # Extract from Article schema
    if article_entity and 'author' in article_entity:
        author_ref = article_entity['author']
        if isinstance(author_ref, dict):
            if not author_name:
                author_name = author_ref.get('name', '')
            if not author_profile_link:
                author_profile_link = author_ref.get('url', '')
    
    # Extract dates from Article schema
    if article_entity:
        date_published = article_entity.get('datePublished', '')
        date_modified = article_entity.get('dateModified', '')
    
    # Extract HTML bylines
    byline_selectors = [
        '.author', '.byline', '.post-author', '.entry-author',
        'meta[name="author"]', '[class*="author"]'
    ]
    
    for selector in byline_selectors:
        elements = soup.select(selector)
        for elem in elements:
            if elem.name == 'meta':
                byline = elem.get('content', '')
            else:
                byline = elem.get_text().strip()
            
            if byline and not byline_text:
                byline_text = byline
                if not author_name:
                    author_name = byline
                break
    
    result["author_signals"]["author_name"] = author_name
    result["author_signals"]["byline_text"] = byline_text
    result["author_signals"]["person_schema_detected"] = person_schema_detected
    result["author_signals"]["author_profile_link"] = author_profile_link
    result["author_signals"]["datePublished"] = date_published
    result["author_signals"]["dateModified"] = date_modified
    
    print(f"Author Name: {author_name}")
    print(f"Byline Text: {byline_text}")
    print(f"Person Schema Detected: {person_schema_detected}")
    print(f"Author Profile Link: {author_profile_link}")
    print(f"Date Published: {date_published}")
    print(f"Date Modified: {date_modified}")
    
    # ==================== CONTENT STRUCTURE ====================
    print("\n📊 CONTENT STRUCTURE")
    print("-" * 40)
    
    h1_count = len(soup.find_all('h1'))
    h2_count = len(soup.find_all('h2'))
    h3_count = len(soup.find_all('h3'))
    
    # Find question headings
    question_headings = []
    for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
        heading_text = heading.get_text().strip()
        if (heading_text.endswith('?') or 
            any(q_word in heading_text.lower() for q_word in ['what', 'how', 'why', 'when', 'where', 'which', 'who'])):
            question_headings.append(heading_text)
    
    main_content_word_count = len(main_content.split()) if main_content else 0
    
    result["content_structure"]["h1_count"] = h1_count
    result["content_structure"]["h2_count"] = h2_count
    result["content_structure"]["h3_count"] = h3_count
    result["content_structure"]["question_headings"] = question_headings
    result["content_structure"]["main_content_word_count"] = main_content_word_count
    
    print(f"H1 Count: {h1_count}")
    print(f"H2 Count: {h2_count}")
    print(f"H3 Count: {h3_count}")
    print(f"Question Headings: {len(question_headings)}")
    for qh in question_headings[:5]:  # Show first 5
        print(f"  - {qh}")
    print(f"Main Content Word Count: {main_content_word_count}")
    
    # ==================== IMAGE ANALYSIS ====================
    print("\n🖼️ IMAGE ANALYSIS")
    print("-" * 40)
    
    images = soup.find_all('img')
    total_images = len(images)
    images_with_alt = 0
    lazy_loading_images = 0
    responsive_images = 0
    
    for img in images:
        # Alt text
        if img.get('alt'):
            images_with_alt += 1
        
        # Lazy loading
        loading = img.get('loading', '')
        if loading == 'lazy' or img.get('data-src'):
            lazy_loading_images += 1
        
        # Responsive images
        if img.get('srcset'):
            responsive_images += 1
    
    result["image_analysis"]["total_images"] = total_images
    result["image_analysis"]["images_with_alt"] = images_with_alt
    result["image_analysis"]["lazy_loading_images"] = lazy_loading_images
    result["image_analysis"]["responsive_images"] = responsive_images
    
    print(f"Total Images: {total_images}")
    print(f"Images with Alt Text: {images_with_alt}")
    print(f"Lazy Loading Images: {lazy_loading_images}")
    print(f"Responsive Images (srcset): {responsive_images}")
    
    # ==================== INTERNAL LINKING ====================
    print("\n🔗 INTERNAL LINKING")
    print("-" * 40)
    
    all_links = soup.find_all('a', href=True)
    internal_links = 0
    external_links = 0
    anchor_text_examples = []
    
    domain = urlparse("https://www.sapphiredigitalconnect.com/").netloc
    
    for link in all_links:
        href = link.get('href', '')
        anchor_text = link.get_text().strip()
        
        if not href or href.startswith('#') or href.startswith('javascript:'):
            continue
        
        try:
            link_domain = urlparse(href).netloc
            if link_domain == domain or not link_domain:  # Internal or relative
                internal_links += 1
            else:
                external_links += 1
                
                # Collect anchor text examples
                if anchor_text and len(anchor_text_examples) < 5:
                    anchor_text_examples.append(anchor_text)
        except:
            external_links += 1
    
    result["internal_linking"]["internal_link_count"] = internal_links
    result["internal_linking"]["external_link_count"] = external_links
    result["internal_linking"]["anchor_text_examples"] = anchor_text_examples
    
    print(f"Internal Links: {internal_links}")
    print(f"External Links: {external_links}")
    print(f"Anchor Text Examples: {anchor_text_examples}")
    
    # ==================== NAP / LOCAL SIGNALS ====================
    print("\n📍 NAP / LOCAL SIGNALS")
    print("-" * 40)
    
    business_name = ""
    phone = ""
    address = ""
    geo_coordinates = {"lat": 0, "lng": 0, "present": False}
    opening_hours = []
    
    if organization_entity:
        business_name = organization_entity.get('name', '')
        phone = organization_entity.get('telephone', '')
        
        # Address
        if 'address' in organization_entity:
            addr = organization_entity['address']
            if isinstance(addr, dict):
                street = addr.get('streetAddress', '')
                city = addr.get('addressLocality', '')
                state = addr.get('addressRegion', '')
                zip_code = addr.get('postalCode', '')
                address = f"{street}, {city}, {state} {zip_code}".strip(', ')
        
        # Geo coordinates
        if 'geo' in organization_entity:
            geo = organization_entity['geo']
            if isinstance(geo, dict):
                try:
                    geo_coordinates["lat"] = float(geo.get('latitude', 0))
                    geo_coordinates["lng"] = float(geo.get('longitude', 0))
                    geo_coordinates["present"] = True
                except:
                    pass
        
        # Opening hours
        if 'openingHours' in organization_entity:
            hours = organization_entity['openingHours']
            if isinstance(hours, list):
                opening_hours = hours
            else:
                opening_hours = [hours]
    
    result["nap_signals"]["business_name"] = business_name
    result["nap_signals"]["phone"] = phone
    result["nap_signals"]["address"] = address
    result["nap_signals"]["geo_coordinates"] = geo_coordinates
    result["nap_signals"]["opening_hours"] = opening_hours
    
    print(f"Business Name: {business_name}")
    print(f"Phone: {phone}")
    print(f"Address: {address}")
    print(f"Geo Coordinates: {geo_coordinates}")
    print(f"Opening Hours: {opening_hours}")
    
    # ==================== AEO / ANSWER SIGNALS ====================
    print("\n🤖 AEO / ANSWER SIGNALS")
    print("-" * 40)
    
    # Definition paragraph detection
    definition_paragraph = ""
    definition_patterns = [
        r'(\w+)\s+is\s+(a|an)\s+([^,.!?]+)',
        r'(\w+)\s+refers\s+to\s+([^,.!?]+)',
        r'(\w+)\s+can\s+be\s+defined\s+as\s+([^,.!?]+)'
    ]
    
    paragraphs = main_content.split('\n\n') if main_content else []
    for para in paragraphs:
        para = para.strip()
        if len(para.split()) >= 10:  # Meaningful paragraph
            for pattern in definition_patterns:
                if re.search(pattern, para, re.IGNORECASE):
                    definition_paragraph = para[:200] + "..." if len(para) > 200 else para
                    break
            if definition_paragraph:
                break
    
    # FAQ section detection
    faq_section = bool(article_entity and article_entity.get('@type') == 'FAQPage')
    
    # Potential direct answer snippet (40-60 words)
    potential_answer = ""
    for para in paragraphs:
        word_count = len(para.split())
        if 40 <= word_count <= 60:
            # Check if it answers a question
            if any(indicator in para.lower() for indicator in ['is defined as', 'refers to', 'means that', 'is a']):
                potential_answer = para
                break
    
    result["aeo_signals"]["definition_paragraph"] = definition_paragraph
    result["aeo_signals"]["faq_section"] = faq_section
    result["aeo_signals"]["question_headings"] = question_headings
    result["aeo_signals"]["potential_direct_answer_snippet"] = potential_answer
    
    print(f"Definition Paragraph: {definition_paragraph}")
    print(f"FAQ Section: {faq_section}")
    print(f"Potential Direct Answer: {potential_answer}")
    
    # ==================== EXTRACTION QUALITY REPORT ====================
    print("\n📋 EXTRACTION QUALITY REPORT")
    print("-" * 40)
    
    quality_report = {
        "successfully_extracted": [],
        "missing_signals": [],
        "potential_issues": [],
        "recommendations": []
    }
    
    # Check what was successfully extracted
    if title:
        quality_report["successfully_extracted"].append("Page title")
    if meta_description:
        quality_report["successfully_extracted"].append("Meta description")
    if organization_entity:
        quality_report["successfully_extracted"].append("Organization schema")
    if person_entity:
        quality_report["successfully_extracted"].append("Person schema")
    if article_entity:
        quality_report["successfully_extracted"].append("Article schema")
    if author_name:
        quality_report["successfully_extracted"].append("Author information")
    if main_content_word_count > 0:
        quality_report["successfully_extracted"].append("Main content")
    if business_name:
        quality_report["successfully_extracted"].append("NAP information")
    
    # Check for missing signals
    if not meta_description:
        quality_report["missing_signals"].append("Meta description missing")
    if not canonical_url:
        quality_report["missing_signals"].append("Canonical URL missing")
    if not organization_entity:
        quality_report["missing_signals"].append("Organization schema missing")
    if not person_entity and not author_name:
        quality_report["missing_signals"].append("Author information missing")
    if h1_count == 0:
        quality_report["missing_signals"].append("No H1 tags found")
    if images_with_alt < total_images * 0.8:  # Less than 80% have alt text
        quality_report["missing_signals"].append("Many images missing alt text")
    
    # Potential issues
    if h1_count > 1:
        quality_report["potential_issues"].append("Multiple H1 tags detected")
    if not main_content or main_content_word_count < 100:
        quality_report["potential_issues"].append("Main content extraction may be insufficient")
    if not robots_meta:
        quality_report["potential_issues"].append("No robots meta tag found")
    
    # Recommendations
    if not meta_description:
        quality_report["recommendations"].append("Add meta description for better SEO")
    if images_with_alt < total_images:
        quality_report["recommendations"].append("Add alt text to all images for accessibility")
    if not organization_entity:
        quality_report["recommendations"].append("Add Organization schema for better entity recognition")
    if not author_name:
        quality_report["recommendations"].append("Add author information for E-E-A-T signals")
    
    result["extraction_quality"] = quality_report
    
    print(f"✅ Successfully Extracted: {len(quality_report['successfully_extracted'])} signals")
    for signal in quality_report["successfully_extracted"]:
        print(f"  - {signal}")
    
    print(f"\n❌ Missing Signals: {len(quality_report['missing_signals'])}")
    for signal in quality_report["missing_signals"]:
        print(f"  - {signal}")
    
    print(f"\n⚠️  Potential Issues: {len(quality_report['potential_issues'])}")
    for issue in quality_report["potential_issues"]:
        print(f"  - {issue}")
    
    print(f"\n💡 Recommendations: {len(quality_report['recommendations'])}")
    for rec in quality_report["recommendations"]:
        print(f"  - {rec}")
    
    return result

def extract_main_content(soup):
    """Extract main content using modern builder-aware priority hierarchy"""
    
    content_selectors = [
        # WordPress Gutenberg
        'main .entry-content',
        'main .post-content', 
        'main .content-area',
        'main .site-content',
        
        # Elementor
        '.elementor-element.elementor-widget-theme-post-content',
        '.elementor-element.elementor-widget-text-editor',
        '.elementor-section-wrap',
        
        # Standard HTML5 semantic tags
        'main',
        'article',
        '[role="main"]',
        
        # Common CMS patterns
        '.content',
        '.post-content',
        '.entry-content',
        '.article-content',
        '.page-content',
        
        # Fallbacks
        '#content',
        '#main',
        '.main-content',
        'body'
    ]
    
    for selector in content_selectors:
        element = soup.select_one(selector)
        if element:
            # Remove non-content elements
            for tag in element.find_all(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                tag.decompose()
            return element.get_text(separator=' ', strip=True)
    
    # Fallback to body
    body = soup.find('body')
    if body:
        for tag in body.find_all(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            tag.decompose()
        return body.get_text(separator=' ', strip=True)
    
    return ""

def main():
    """Main test function"""
    try:
        # Read the downloaded HTML
        with open('test_page.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        print(f"HTML Size: {len(html_content):,} characters")
        
        # Analyze the page
        result = analyze_seo_signals(html_content)
        
        # Save results to JSON
        with open('scraper_test_results.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Results saved to: scraper_test_results.json")
        
    except FileNotFoundError:
        print("Error: test_page.html not found. Please download the page first.")
    except Exception as e:
        print(f"Error during analysis: {e}")

if __name__ == "__main__":
    main()
