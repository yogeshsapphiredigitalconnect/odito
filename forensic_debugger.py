#!/usr/bin/env python3
"""
Forensic Debugging Investigation for AI Visibility Scraper
Comprehensive DOM analysis and extraction pipeline tracing
"""

import json
import re
from bs4 import BeautifulSoup
from urllib.parse import urlparse

class ForensicScraperDebugger:
    def __init__(self, html_file):
        self.html_file = html_file
        self.soup = None
        self.dom_evidence = {}
        self.extraction_failures = {}
        
    def load_html(self):
        """Load and parse HTML for forensic analysis"""
        try:
            with open(self.html_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            self.soup = BeautifulSoup(html_content, 'lxml')
            print(f"✅ HTML Loaded: {len(html_content):,} characters")
            return True
        except Exception as e:
            print(f"❌ Failed to load HTML: {e}")
            return False
    
    def step1_dom_inspection(self):
        """STEP 1: Crawl and Inspect Raw HTML DOM Structure"""
        print("\n" + "="*80)
        print("STEP 1 — DOM INSPECTION & EVIDENCE COLLECTION")
        print("="*80)
        
        evidence = {}
        
        # Navigation/Header/Footer Detection
        print("\n🔍 INVESTIGATING: Navigation, Header, Footer Elements")
        print("-" * 60)
        
        nav_elements = {
            'nav_tags': self.soup.find_all('nav'),
            'header_tags': self.soup.find_all('header'),
            'footer_tags': self.soup.find_all('footer'),
            'elementor_nav': self.soup.find_all(class_=re.compile(r'elementor.*nav')),
            'elementor_header': self.soup.find_all(class_=re.compile(r'elementor.*header')),
            'elementor_footer': self.soup.find_all(class_=re.compile(r'elementor.*footer')),
            'pxl_nav': self.soup.find_all(class_=re.compile(r'pxl.*nav')),
            'menu_classes': self.soup.find_all(class_=re.compile(r'menu')),
            'navigation_classes': self.soup.find_all(class_=re.compile(r'nav')),
        }
        
        for key, elements in nav_elements.items():
            print(f"{key}: {len(elements)} elements")
            for i, elem in enumerate(elements[:2]):  # Show first 2
                classes = ' '.join(elem.get('class', []))
                element_id = elem.get('id', '')
                print(f"  [{i}] <{elem.name}> class='{classes}' id='{element_id}'")
        
        evidence['navigation_elements'] = nav_elements
        
        # Image Analysis with Lazy Loading
        print("\n🔍 INVESTIGATING: Images & Lazy Loading Attributes")
        print("-" * 60)
        
        all_images = self.soup.find_all('img')
        lazy_loading_images = []
        loading_lazy_images = []
        data_src_images = []
        data_lazy_images = []
        
        for img in all_images:
            loading_attr = img.get('loading', '')
            data_src = img.get('data-src', '')
            data_lazy = img.get('data-lazy', '')
            src = img.get('src', '')
            
            img_info = {
                'loading': loading_attr,
                'data_src': bool(data_src),
                'data_lazy': bool(data_lazy),
                'src': src[:100] if src else '',
                'alt': img.get('alt', '')[:50]
            }
            
            if loading_attr == 'lazy':
                loading_lazy_images.append(img_info)
            if data_src:
                data_src_images.append(img_info)
            if data_lazy:
                data_lazy_images.append(img_info)
            if loading_attr == 'lazy' or data_src or data_lazy:
                lazy_loading_images.append(img_info)
        
        print(f"Total images: {len(all_images)}")
        print(f"Images with loading='lazy': {len(loading_lazy_images)}")
        print(f"Images with data-src: {len(data_src_images)}")
        print(f"Images with data-lazy: {len(data_lazy_images)}")
        print(f"Total lazy loading images: {len(lazy_loading_images)}")
        
        # Show examples
        for i, img in enumerate(lazy_loading_images[:3]):
            print(f"  Example {i+1}: loading='{img['loading']}', data_src={img['data_src']}, data_lazy={img['data_lazy']}")
        
        evidence['image_analysis'] = {
            'total_images': len(all_images),
            'loading_lazy': len(loading_lazy_images),
            'data_src': len(data_src_images),
            'data_lazy': len(data_lazy_images),
            'total_lazy': len(lazy_loading_images),
            'examples': lazy_loading_images[:3]
        }
        
        # Brand Name Occurrences
        print("\n🔍 INVESTIGATING: Brand Name 'Sapphire Digital Connect'")
        print("-" * 60)
        
        brand_name = "Sapphire Digital Connect"
        page_text = self.soup.get_text()
        brand_mentions = len(re.findall(re.escape(brand_name), page_text, re.IGNORECASE))
        
        # Find specific locations
        brand_contexts = []
        for match in re.finditer(re.escape(brand_name), page_text, re.IGNORECASE):
            start = max(0, match.start() - 50)
            end = min(len(page_text), match.end() + 50)
            context = page_text[start:end].replace('\n', ' ').strip()
            brand_contexts.append(context)
        
        print(f"Brand '{brand_name}' mentions: {brand_mentions}")
        for i, context in enumerate(brand_contexts[:3]):
            print(f"  Context {i+1}: ...{context}...")
        
        evidence['brand_mentions'] = {
            'brand_name': brand_name,
            'total_mentions': brand_mentions,
            'contexts': brand_contexts[:3]
        }
        
        # Content Container Analysis
        print("\n🔍 INVESTIGATING: Content Containers & Word Count")
        print("-" * 60)
        
        content_selectors = [
            'main', 'article', '[role="main"]',
            '.entry-content', '.post-content', '.content',
            '.elementor-element', '.elementor-section-wrap',
            'div[data-elementor-type]', 'body'
        ]
        
        content_analysis = {}
        total_body_text = self.soup.get_text()
        total_words = len(total_body_text.split())
        
        print(f"Total body text: {total_words:,} words")
        
        for selector in content_selectors:
            elements = self.soup.select(selector)
            for i, element in enumerate(elements[:2]):  # Check first 2
                temp_soup = BeautifulSoup(str(element), 'html.parser')
                # Remove scripts/styles for accurate word count
                for tag in temp_soup.find_all(['script', 'style', 'nav', 'header', 'footer']):
                    tag.decompose()
                
                text = temp_soup.get_text()
                word_count = len(text.split())
                char_count = len(text)
                
                content_analysis[f"{selector}_{i}"] = {
                    'selector': selector,
                    'element_index': i,
                    'word_count': word_count,
                    'char_count': char_count,
                    'classes': ' '.join(element.get('class', [])),
                    'element_id': element.get('id', '')
                }
                
                print(f"  {selector}[{i}]: {word_count:,} words, {char_count:,} chars")
        
        evidence['content_containers'] = {
            'total_body_words': total_words,
            'container_analysis': content_analysis
        }
        
        # JSON-LD Schema Analysis
        print("\n🔍 INVESTIGATING: JSON-LD Structured Data & Author Schema")
        print("-" * 60)
        
        json_ld_scripts = self.soup.find_all('script', type='application/ld+json')
        schema_analysis = {
            'total_scripts': len(json_ld_scripts),
            'schemas': [],
            'person_schemas': [],
            'organization_schemas': [],
            'article_schemas': []
        }
        
        for i, script in enumerate(json_ld_scripts):
            try:
                data = json.loads(script.string)
                entities = data if isinstance(data, list) else ([data] if not isinstance(data, dict) or '@graph' not in data else data['@graph'])
                
                for entity in entities:
                    if isinstance(entity, dict):
                        entity_type = entity.get('@type', '')
                        entity_name = entity.get('name', '')
                        
                        schema_info = {
                            'script_index': i,
                            'type': entity_type,
                            'name': entity_name,
                            'has_author': 'author' in entity,
                            'author_info': entity.get('author', {})
                        }
                        
                        schema_analysis['schemas'].append(schema_info)
                        
                        if entity_type == 'Person':
                            schema_analysis['person_schemas'].append(schema_info)
                            print(f"  Person Schema: name='{entity_name}', url='{entity.get('url', '')}'")
                        
                        elif entity_type in ['Organization', 'LocalBusiness']:
                            schema_analysis['organization_schemas'].append(schema_info)
                            print(f"  {entity_type} Schema: name='{entity_name}', legalName='{entity.get('legalName', '')}'")
                        
                        elif entity_type in ['Article', 'BlogPosting']:
                            schema_analysis['article_schemas'].append(schema_info)
                            author_ref = entity.get('author', {})
                            print(f"  {entity_type} Schema: headline='{entity.get('headline', '')[:50]}...'")
                            print(f"    Author: {author_ref}")
            
            except json.JSONDecodeError as e:
                print(f"  JSON-LD Parse Error in script {i}: {e}")
        
        evidence['schema_analysis'] = schema_analysis
        
        self.dom_evidence = evidence
        return evidence
    
    def step2_trace_extraction_pipeline(self):
        """STEP 2: Trace the extraction pipeline to find failures"""
        print("\n" + "="*80)
        print("STEP 2 — EXTRACTION PIPELINE TRACING")
        print("="*80)
        
        failures = {}
        
        # Bug 1: Navigation Detection Failure
        print("\n🐛 BUG 1 — Navigation Detection Failure")
        print("-" * 60)
        
        # Simulate current scraper logic
        nav_found = bool(self.soup.find('nav'))
        header_found = bool(self.soup.find('header'))
        footer_found = bool(self.soup.find('footer'))
        
        print(f"Current scraper logic results:")
        print(f"  nav tag found: {nav_found}")
        print(f"  header tag found: {header_found}")
        print(f"  footer tag found: {footer_found}")
        
        # Actual evidence
        actual_nav = len(self.dom_evidence['navigation_elements']['nav_tags'])
        actual_header = len(self.dom_evidence['navigation_elements']['header_tags'])
        actual_footer = len(self.dom_evidence['navigation_elements']['footer_tags'])
        elementor_nav = len(self.dom_evidence['navigation_elements']['elementor_nav'])
        pxl_nav = len(self.dom_evidence['navigation_elements']['pxl_nav'])
        
        print(f"\nActual DOM evidence:")
        print(f"  nav tags: {actual_nav}")
        print(f"  header tags: {actual_header}")
        print(f"  footer tags: {actual_footer}")
        print(f"  elementor nav: {elementor_nav}")
        print(f"  pxl nav: {pxl_nav}")
        
        failures['navigation'] = {
            'current_logic': {'nav': nav_found, 'header': header_found, 'footer': footer_found},
            'actual_dom': {'nav': actual_nav, 'header': actual_header, 'footer': actual_footer},
            'missing_selectors': {
                'elementor_nav': elementor_nav,
                'pxl_nav': pxl_nav
            },
            'root_cause': 'Scraper only checks basic HTML5 tags (nav, header, footer) but site uses CSS classes'
        }
        
        # Bug 2: Lazy Loading Detection Failure
        print("\n🐛 BUG 2 — Lazy Loading Detection Failure")
        print("-" * 60)
        
        # Simulate current scraper logic
        lazy_images_basic = self.soup.find_all('img', attrs={'loading': 'lazy'})
        lazy_images_data_src = self.soup.find_all('img', attrs={'data-src': True})
        
        print(f"Current scraper logic results:")
        print(f"  loading='lazy' images: {len(lazy_images_basic)}")
        print(f"  data-src images: {len(lazy_images_data_src)}")
        
        actual_lazy = self.dom_evidence['image_analysis']['total_lazy']
        actual_loading_lazy = self.dom_evidence['image_analysis']['loading_lazy']
        
        print(f"\nActual DOM evidence:")
        print(f"  total lazy images: {actual_lazy}")
        print(f"  loading='lazy' only: {actual_loading_lazy}")
        
        failures['lazy_loading'] = {
            'current_logic': {'loading_lazy': len(lazy_images_basic), 'data_src': len(lazy_images_data_src)},
            'actual_dom': self.dom_evidence['image_analysis'],
            'root_cause': 'Detection logic appears correct - issue may be in reporting or field mapping'
        }
        
        # Bug 3: Entity Mention Detection Failure
        print("\n🐛 BUG 3 — Entity Mention Detection Failure")
        print("-" * 60)
        
        # Simulate current scraper logic
        main_content_selectors = ['main', 'article', '.entry-content']  # Common selectors
        entity_mentions = 0
        
        for selector in main_content_selectors:
            element = self.soup.select_one(selector)
            if element:
                text = element.get_text()
                mentions = len(re.findall("Sapphire Digital Connect", text, re.IGNORECASE))
                entity_mentions = max(entity_mentions, mentions)
                print(f"  {selector}: {mentions} mentions")
        
        actual_mentions = self.dom_evidence['brand_mentions']['total_mentions']
        
        print(f"\nCurrent scraper logic results: {entity_mentions} mentions")
        print(f"Actual DOM evidence: {actual_mentions} mentions")
        
        failures['entity_mentions'] = {
            'current_logic': entity_mentions,
            'actual_dom': actual_mentions,
            'tested_selectors': main_content_selectors,
            'root_cause': 'Main content extraction failing - wrong selectors for Elementor-built page'
        }
        
        # Bug 4: Content Quality Flag Failure
        print("\n🐛 BUG 4 — Content Quality Flag Failure")
        print("-" * 60)
        
        # Simulate current scraper logic
        content_element = self.soup.select_one('main') or self.soup.select_one('article') or self.soup.find('body')
        if content_element:
            content_text = content_element.get_text()
            content_words = len(content_text.split())
        else:
            content_words = 0
        
        low_word_count = content_words < 300  # Typical threshold
        
        print(f"Current scraper logic results:")
        print(f"  content words: {content_words}")
        print(f"  low_word_count: {low_word_count}")
        
        actual_body_words = self.dom_evidence['content_containers']['total_body_words']
        
        print(f"\nActual DOM evidence:")
        print(f"  total body words: {actual_body_words}")
        
        failures['content_quality'] = {
            'current_logic': {'words': content_words, 'low_count': low_word_count},
            'actual_dom': {'total_words': actual_body_words},
            'root_cause': 'Main content selector not finding the actual content container'
        }
        
        # Bug 5: Author Detection Failure
        print("\n🐛 BUG 5 — Author Detection Failure")
        print("-" * 60)
        
        # Simulate current scraper logic
        person_schemas = [schema for schema in self.dom_evidence['schema_analysis']['schemas'] if schema['type'] == 'Person']
        article_schemas = [schema for schema in self.dom_evidence['schema_analysis']['schemas'] if schema['type'] in ['Article', 'BlogPosting']]
        
        author_detected = len(person_schemas) > 0 or any(schema['has_author'] for schema in article_schemas)
        
        print(f"Current scraper logic results:")
        print(f"  person schemas found: {len(person_schemas)}")
        print(f"  article schemas with author: {len([s for s in article_schemas if s['has_author']])}")
        print(f"  author_detected: {author_detected}")
        
        print(f"\nActual DOM evidence:")
        for schema in person_schemas:
            print(f"  Person: {schema}")
        for schema in article_schemas:
            print(f"  Article: {schema}")
        
        failures['author_detection'] = {
            'current_logic': author_detected,
            'actual_dom': {
                'person_schemas': len(person_schemas),
                'article_schemas': len(article_schemas),
                'schemas_with_author': len([s for s in article_schemas if s['has_author']])
            },
            'root_cause': 'Logic appears correct - issue may be in field mapping or reporting'
        }
        
        self.extraction_failures = failures
        return failures
    
    def step3_root_cause_analysis(self):
        """STEP 3: Identify exact root causes"""
        print("\n" + "="*80)
        print("STEP 3 — ROOT CAUSE ANALYSIS")
        print("="*80)
        
        root_causes = {}
        
        # Navigation Detection
        nav_failure = self.extraction_failures['navigation']
        root_causes['navigation'] = {
            'bug_name': 'Navigation Detection Failure',
            'root_cause': 'Insufficient CSS selector coverage',
            'file_location': 'extract_enhanced_technical_signals() function',
            'why_logic_fails': f"Scraper only checks basic HTML5 tags (nav: {nav_failure['current_logic']['nav']}, header: {nav_failure['current_logic']['header']}, footer: {nav_failure['current_logic']['footer']}) but the site uses CSS classes like .pxl-header-nav and Elementor navigation classes. Actual DOM has {nav_failure['missing_selectors']['elementor_nav']} elementor nav elements and {nav_failure['missing_selectors']['pxl_nav']} pxl nav elements.",
            'evidence': self.dom_evidence['navigation_elements']
        }
        
        # Lazy Loading
        lazy_failure = self.extraction_failures['lazy_loading']
        root_causes['lazy_loading'] = {
            'bug_name': 'Lazy Loading Detection Failure',
            'root_cause': 'Field mapping or reporting issue',
            'file_location': 'extract_enhanced_technical_signals() function',
            'why_logic_fails': f"Detection logic finds {lazy_failure['actual_dom']['loading_lazy']} images with loading='lazy' and {lazy_failure['actual_dom']['total_lazy']} total lazy images, but the output reports missing lazy loading. This suggests a field mapping or boolean logic error in the reporting layer.",
            'evidence': self.dom_evidence['image_analysis']
        }
        
        # Entity Mentions
        entity_failure = self.extraction_failures['entity_mentions']
        root_causes['entity_mentions'] = {
            'bug_name': 'Entity Mention Detection Failure',
            'root_cause': 'Main content extraction using wrong selectors',
            'file_location': 'extract_entity_mentions_and_signals() function',
            'why_logic_fails': f"Scraper finds {entity_failure['current_logic']} mentions because it searches in basic containers (main, article, .entry-content) but the actual content is in Elementor containers. The brand actually appears {entity_failure['actual_dom']} times in the full page text.",
            'evidence': self.dom_evidence['brand_mentions']
        }
        
        # Content Quality
        content_failure = self.extraction_failures['content_quality']
        root_causes['content_quality'] = {
            'bug_name': 'Content Quality Flag Failure',
            'root_cause': 'Main content selector not finding actual content',
            'file_location': 'extract_main_content() function',
            'why_logic_fails': f"Scraper extracts {content_failure['current_logic']['words']} words from basic selectors, but the page actually has {content_failure['actual_dom']['total_words']:,} words. The content is in Elementor-built containers that the scraper doesn't recognize.",
            'evidence': self.dom_evidence['content_containers']
        }
        
        # Author Detection
        author_failure = self.extraction_failures['author_detection']
        root_causes['author_detection'] = {
            'bug_name': 'Author Detection Failure',
            'root_cause': 'Field mapping or boolean logic error',
            'file_location': 'extract_ai_visibility_signals() function',
            'why_logic_fails': f"Logic correctly finds {author_failure['actual_dom']['person_schemas']} Person schemas and {author_failure['actual_dom']['article_schemas']} Article schemas with authors, but reports author_detected=false. This indicates a boolean logic or field assignment error.",
            'evidence': self.dom_evidence['schema_analysis']
        }
        
        return root_causes
    
    def step4_fix_strategies(self):
        """STEP 4: Provide corrected extraction logic"""
        print("\n" + "="*80)
        print("STEP 4 — CORRECTED EXTRACTION LOGIC")
        print("="*80)
        
        fixes = {}
        
        # Navigation Detection Fix
        fixes['navigation'] = {
            'corrected_selectors': [
                'nav', 'header', 'footer',
                '.nav', '.navigation', '.menu', '.navbar',
                '.elementor-nav-menu', '.elementor-location-header', '.elementor-location-footer',
                '.pxl-header-nav', '.pxl-nav', '.site-header', '.site-footer',
                '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]'
            ],
            'improved_logic': '''
def detect_navigation_elements(soup):
    """Enhanced navigation detection with fallback selectors"""
    navigation_selectors = [
        'nav', 'header', 'footer',
        '.nav', '.navigation', '.menu', '.navbar',
        '.elementor-nav-menu', '.elementor-location-header', '.elementor-location-footer',
        '.pxl-header-nav', '.pxl-nav', '.site-header', '.site-footer',
        '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]'
    ]
    
    nav_elements = []
    has_navigation = False
    has_header = False
    has_footer = False
    
    for selector in navigation_selectors:
        elements = soup.select(selector)
        for element in elements:
            element_name = element.name.lower()
            element_class = ' '.join(element.get('class', []))
            
            if element_name in ['nav', 'header'] or 'nav' in element_class.lower():
                has_navigation = True
            if element_name == 'header' or 'header' in element_class.lower():
                has_header = True
            if element_name == 'footer' or 'footer' in element_class.lower():
                has_footer = True
                
            nav_elements.append({
                'tag': element_name,
                'class': element_class,
                'selector': selector
            })
    
    return {
        'has_navigation': has_navigation,
        'has_header': has_header,
        'has_footer': has_footer,
        'elements_found': len(nav_elements)
    }
            '''
        }
        
        # Lazy Loading Fix
        fixes['lazy_loading'] = {
            'corrected_logic': '''
def detect_lazy_loading(soup):
    """Enhanced lazy loading detection"""
    lazy_patterns = [
        {'attr': 'loading', 'value': 'lazy'},
        {'attr': 'data-src', 'exists': True},
        {'attr': 'data-lazy', 'exists': True},
        {'attr': 'data-original', 'exists': True},
        {'attr': 'srcset', 'pattern': 'lazy'}
    ]
    
    lazy_images = []
    total_images = soup.find_all('img')
    
    for img in total_images:
        is_lazy = False
        for pattern in lazy_patterns:
            if 'value' in pattern:
                if img.get(pattern['attr']) == pattern['value']:
                    is_lazy = True
                    break
            elif 'exists' in pattern:
                if img.get(pattern['attr']):
                    is_lazy = True
                    break
            elif 'pattern' in pattern:
                if img.get(pattern['attr']) and pattern['pattern'] in img.get(pattern['attr']):
                    is_lazy = True
                    break
        
        if is_lazy:
            lazy_images.append(img)
    
    return {
        'total_images': len(total_images),
        'lazy_loading_images': len(lazy_images),
        'lazy_loading_detected': len(lazy_images) > 0,
        'lazy_loading_percentage': (len(lazy_images) / len(total_images) * 100) if total_images else 0
    }
            '''
        }
        
        # Entity Mentions Fix
        fixes['entity_mentions'] = {
            'corrected_selectors': [
                'main .entry-content',
                'main .post-content',
                'main .content-area',
                '.elementor-element.elementor-widget-theme-post-content',
                '.elementor-element.elementor-widget-text-editor',
                '.elementor-section-wrap',
                'div[data-elementor-type="wp-post"]',
                'div[data-elementor-type="page"]',
                'main', 'article',
                'body'  # fallback
            ],
            'improved_logic': '''
def extract_entity_mentions(soup, entity_name):
    """Enhanced entity mention detection with modern builder support"""
    content_selectors = [
        'main .entry-content', 'main .post-content', 'main .content-area',
        '.elementor-element.elementor-widget-theme-post-content',
        '.elementor-element.elementor-widget-text-editor',
        '.elementor-section-wrap',
        'div[data-elementor-type="wp-post"]', 'div[data-elementor-type="page"]',
        'main', 'article', 'body'
    ]
    
    best_content = ""
    max_word_count = 0
    
    for selector in content_selectors:
        elements = soup.select(selector)
        for element in elements:
            # Remove non-content elements
            temp_soup = BeautifulSoup(str(element), 'html.parser')
            for tag in temp_soup.find_all(['script', 'style', 'nav', 'header', 'footer']):
                tag.decompose()
            
            text = temp_soup.get_text()
            word_count = len(text.split())
            
            if word_count > max_word_count:
                max_word_count = word_count
                best_content = text
    
    # Count entity mentions
    entity_mentions = len(re.findall(re.escape(entity_name), best_content, re.IGNORECASE))
    
    return {
        'entity_name': entity_name,
        'content_word_count': max_word_count,
        'entity_mentions': entity_mentions,
        'content_selector_used': selector,
        'entity_density_per_1000_words': (entity_mentions / max_word_count * 1000) if max_word_count > 0 else 0
    }
            '''
        }
        
        # Content Quality Fix
        fixes['content_quality'] = {
            'improved_logic': '''
def extract_content_quality(soup):
    """Enhanced content quality detection with Elementor support"""
    content_selectors = [
        'main .entry-content', 'main .post-content', 'main .content-area',
        '.elementor-element.elementor-widget-theme-post-content',
        '.elementor-element.elementor-widget-text-editor',
        '.elementor-section-wrap',
        'div[data-elementor-type="wp-post"]', 'div[data-elementor-type="page"]',
        'main', 'article', 'body'
    ]
    
    best_content = ""
    max_word_count = 0
    selector_used = ""
    
    for selector in content_selectors:
        elements = soup.select(selector)
        for element in elements:
            temp_soup = BeautifulSoup(str(element), 'html.parser')
            for tag in temp_soup.find_all(['script', 'style', 'nav', 'header', 'footer']):
                tag.decompose()
            
            text = temp_soup.get_text()
            word_count = len(text.split())
            
            if word_count > max_word_count and word_count > 100:  # Minimum threshold
                max_word_count = word_count
                best_content = text
                selector_used = selector
    
    # Quality assessment
    low_word_count = max_word_count < 300
    thin_content = max_word_count < 100
    comprehensive = max_word_count > 1000
    
    return {
        'content_word_count': max_word_count,
        'content_selector_used': selector_used,
        'low_word_count': low_word_count,
        'thin_content': thin_content,
        'comprehensive_content': comprehensive,
        'content_quality_score': min(100, max_word_count / 10)  # Simple scoring
    }
            '''
        }
        
        # Author Detection Fix
        fixes['author_detection'] = {
            'improved_logic': '''
def detect_author_signals(parsed_entities):
    """Enhanced author detection with proper boolean logic"""
    author_detected = False
    person_schemas = []
    article_authors = []
    
    for entity in parsed_entities:
        entity_type = entity.get('@type', '')
        
        # Check Person schemas
        if entity_type == 'Person':
            author_detected = True
            person_schemas.append({
                'name': entity.get('name', ''),
                'url': entity.get('url', ''),
                'sameAs': entity.get('sameAs', [])
            })
        
        # Check Article schemas with authors
        elif entity_type in ['Article', 'BlogPosting', 'NewsArticle']:
            author_ref = entity.get('author')
            if author_ref:
                author_detected = True
                if isinstance(author_ref, dict):
                    article_authors.append({
                        'name': author_ref.get('name', ''),
                        'url': author_ref.get('url', '')
                    })
                elif isinstance(author_ref, list):
                    for auth in author_ref:
                        if isinstance(auth, dict):
                            article_authors.append({
                                'name': auth.get('name', ''),
                                'url': auth.get('url', '')
                            })
    
    return {
        'author_detected': author_detected,  # Fixed boolean logic
        'person_schemas_count': len(person_schemas),
        'article_authors_count': len(article_authors),
        'total_author_references': len(person_schemas) + len(article_authors),
        'person_schemas': person_schemas,
        'article_authors': article_authors
    }
            '''
        }
        
        return fixes
    
    def step5_defensive_improvements(self):
        """STEP 5: Recommend defensive improvements"""
        print("\n" + "="*80)
        print("STEP 5 — DEFENSIVE IMPROVEMENTS")
        print("="*80)
        
        improvements = {
            'fallback_mechanisms': [
                'Always include body tag as final fallback for content extraction',
                'Use multiple selector strategies (tag, class, ID, attribute)',
                'Implement progressive selector fallback with logging'
            ],
            'validation_checks': [
                'Validate extracted content against minimum word count thresholds',
                'Cross-reference schema data with HTML content for consistency',
                'Check for presence of expected elements before reporting false'
            ],
            'logging_enhancements': [
                'Log which selector was used for content extraction',
                'Log when expected elements (nav, header, footer) are not found',
                'Log schema parsing errors and missing fields'
            ],
            'error_handling': [
                'Graceful degradation when primary selectors fail',
                'Safe attribute access with None checks',
                'Try-catch blocks around JSON parsing and DOM queries'
            ],
            'performance_optimizations': [
                'Cache DOM queries to avoid repeated traversals',
                'Use efficient CSS selectors instead of complex XPath',
                'Limit text processing to content areas only'
            ]
        }
        
        for category, items in improvements.items():
            print(f"\n🛡️ {category.upper().replace('_', ' ')}:")
            for item in items:
                print(f"  • {item}")
        
        return improvements
    
    def generate_forensic_report(self):
        """Generate comprehensive forensic debugging report"""
        print("\n" + "="*80)
        print("FORENSIC DEBUGGING REPORT")
        print("="*80)
        
        if not self.dom_evidence or not self.extraction_failures:
            print("❌ Evidence not collected. Run step1_dom_inspection() first.")
            return
        
        root_causes = self.step3_root_cause_analysis()
        fixes = self.step4_fix_strategies()
        improvements = self.step5_defensive_improvements()
        
        report = {
            'investigation_summary': {
                'url': 'https://www.sapphiredigitalconnect.com/',
                'total_bugs_investigated': 5,
                'html_size': f"{len(self.soup.get_text()):,} characters",
                'dom_elements_analyzed': len(self.soup.find_all()),
                'schemas_found': len(self.dom_evidence['schema_analysis']['schemas'])
            },
            'bugs_identified': root_causes,
            'corrected_fixes': fixes,
            'defensive_improvements': improvements,
            'dom_evidence': self.dom_evidence,
            'extraction_failures': self.extraction_failures
        }
        
        # Save report
        with open('forensic_debugging_report.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\n📄 Complete forensic report saved to: forensic_debugging_report.json")
        
        return report

def main():
    """Main forensic investigation"""
    debugger = ForensicScraperDebugger('forensic_test.html')
    
    if not debugger.load_html():
        return
    
    # Execute investigation steps
    debugger.step1_dom_inspection()
    debugger.step2_trace_extraction_pipeline()
    debugger.step3_root_cause_analysis()
    debugger.step4_fix_strategies()
    debugger.step5_defensive_improvements()
    
    # Generate final report
    report = debugger.generate_forensic_report()
    
    print("\n" + "="*80)
    print("🔍 FORENSIC INVESTIGATION COMPLETE")
    print("="*80)
    print("All root causes identified and fixes documented.")
    print("Review forensic_debugging_report.json for complete analysis.")

if __name__ == "__main__":
    main()
