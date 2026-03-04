#!/usr/bin/env python3
"""
Extract the complete data schema from normalize_page_data function
"""

import re
from pathlib import Path

def extract_complete_schema():
    """Extract the complete schema from normalize_page_data function"""
    schema_file = Path("d:/new/Odito/python_workers/scraper/workers/seo/page_analysis/page_analysis.py")
    
    with open(schema_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the normalize_page_data function
    func_match = re.search(r'def normalize_page_data\(page\):(.*?)(?=\n\ndef|\nclass|\Z)', content, re.DOTALL)
    
    if not func_match:
        return {}
    
    func_body = func_match.group(1)
    
    # Extract all fields from the return statement
    schema = {}
    
    # Find all assignments in the function body
    assignments = re.findall(r'(\w+)\s*=\s*[^#\n]+', func_body)
    
    # Extract return statement
    return_match = re.search(r'return\s*\{(.*?)\}', func_body, re.DOTALL)
    if return_match:
        return_content = return_match.group(1)
        
        # Extract field mappings
        field_mappings = re.findall(r'"([^"]+)":\s*([^,}]+)', return_content)
        
        for field_name, field_value in field_mappings:
            # Determine the actual source and type
            if field_value.strip() == 'normalize_text(page.get("url"))':
                schema[field_name] = {
                    'type': 'string',
                    'source': 'page.url',
                    'description': 'Page URL, normalized'
                }
            elif field_value.strip() == 'normalize_text(page.get("title"))':
                schema[field_name] = {
                    'type': 'string', 
                    'source': 'page.title',
                    'description': 'Page title, normalized'
                }
            elif 'meta_description' in field_value:
                schema[field_name] = {
                    'type': 'string',
                    'source': 'page.meta_tags.description[0]',
                    'description': 'Meta description, normalized'
                }
            elif 'content_text' in field_value:
                schema[field_name] = {
                    'type': 'string',
                    'source': 'page.content.text',
                    'description': 'Page content text, normalized'
                }
            elif 'word_count' in field_value:
                schema[field_name] = {
                    'type': 'integer',
                    'source': 'page.content.word_count',
                    'description': 'Word count of page content'
                }
            elif 'viewport' in field_value:
                schema[field_name] = {
                    'type': 'string',
                    'source': 'page.meta_tags.viewport[0]',
                    'description': 'Viewport meta tag, normalized'
                }
            elif 'headings_list' in field_value:
                schema[field_name] = {
                    'type': 'array',
                    'source': 'page.content.headings (converted)',
                    'description': 'List of heading objects with tag, text, level'
                }
            elif 'images_normalized' in field_value:
                schema[field_name] = {
                    'type': 'array',
                    'source': 'page.images (normalized)',
                    'description': 'List of image objects with normalized width/height'
                }
            elif 'image_analysis' in field_value:
                schema[field_name] = {
                    'type': 'object',
                    'source': 'page.image_analysis',
                    'description': 'Image analysis data'
                }
            elif 'og_tags' in field_value:
                schema[field_name] = {
                    'type': 'object',
                    'source': 'page.social.open_graph',
                    'description': 'Open Graph tags'
                }
            elif 'scripts_list' in field_value:
                schema[field_name] = {
                    'type': 'array',
                    'source': 'page.tracking (converted)',
                    'description': 'Synthetic scripts list from tracking data'
                }
            elif 'structured_data' in field_value:
                schema[field_name] = {
                    'type': 'array',
                    'source': 'page.structured_data',
                    'description': 'Structured data/JSON-LD'
                }
            elif 'canonical' in field_value:
                schema[field_name] = {
                    'type': 'string',
                    'source': 'page.canonical',
                    'description': 'Canonical URL, normalized'
                }
            elif 'hreflangs' in field_value:
                schema[field_name] = {
                    'type': 'array',
                    'source': 'page.hreflangs',
                    'description': 'Hreflang links'
                }
            elif 'tracking' in field_value:
                schema[field_name] = {
                    'type': 'object',
                    'source': 'page.tracking',
                    'description': 'Original tracking data (preserved)'
                }
            elif 'meta_tags' in field_value:
                schema[field_name] = {
                    'type': 'object',
                    'source': 'page.meta_tags',
                    'description': 'All meta tags (preserved for advanced rules)'
                }
            elif 'social' in field_value:
                schema[field_name] = {
                    'type': 'object',
                    'source': 'page.social',
                    'description': 'Social media data (preserved for advanced rules)'
                }
            elif 'doctype_present' in field_value:
                schema[field_name] = {
                    'type': 'boolean',
                    'source': 'page.doctype_present',
                    'description': 'Whether doctype is present'
                }
            elif 'html_lang' in field_value:
                schema[field_name] = {
                    'type': 'string',
                    'source': 'page.html_lang',
                    'description': 'HTML lang attribute'
                }
            elif 'review_schema_present' in field_value:
                schema[field_name] = {
                    'type': 'boolean',
                    'source': 'page.review_schema_present',
                    'description': 'Whether review schema is present'
                }
            elif 'theme_color_present' in field_value:
                schema[field_name] = {
                    'type': 'boolean',
                    'source': 'page.theme_color_present',
                    'description': 'Whether theme color meta tag is present'
                }
            elif 'hreflang_present' in field_value:
                schema[field_name] = {
                    'type': 'boolean',
                    'source': 'page.hreflang_present',
                    'description': 'Whether hreflang tags are present'
                }
            else:
                schema[field_name] = {
                    'type': 'mixed',
                    'source': field_value.strip(),
                    'description': 'Unknown field'
                }
    
    # Also check for additional context fields added in analyze_page_seo
    additional_fields = {
        'performance': {
            'type': 'object',
            'source': 'seo_page_performance collection',
            'description': 'Performance data for the page'
        },
        'headless': {
            'type': 'object', 
            'source': 'seo_headless_data collection',
            'description': 'Headless browser analysis data'
        },
        'crawl_graph': {
            'type': 'object',
            'source': 'seo_crawl_graph collection',
            'description': 'Crawl graph analysis data'
        },
        'technical_report': {
            'type': 'object',
            'source': 'domain_technical_reports collection',
            'description': 'Domain-level technical data (robots.txt, sitemap)'
        }
    }
    
    schema.update(additional_fields)
    
    return schema

def main():
    print("=" * 80)
    print("COMPLETE DATA COLLECTION SCHEMA")
    print("=" * 80)
    
    schema = extract_complete_schema()
    
    print(f"\nTotal Fields: {len(schema)}")
    print("\nField Details:")
    print("-" * 50)
    
    for field_name, field_info in sorted(schema.items()):
        print(f"\n{field_name}:")
        print(f"  Type: {field_info['type']}")
        print(f"  Source: {field_info['source']}")
        print(f"  Description: {field_info['description']}")
    
    # Save schema to file
    import json
    with open('seo_data_schema.json', 'w', encoding='utf-8') as f:
        json.dump(schema, f, indent=2)
    
    print(f"\n\nComplete schema saved to: seo_data_schema.json")

if __name__ == "__main__":
    main()
