#!/usr/bin/env python3
"""
Test script to verify entity mention counting and other fixes are working
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scraper.workers.ai.ai_visibility.ai_visibility import analyze_single_url
import json
from bson import ObjectId

def test_sapphire_digital_connect():
    """Test the main URL that was having issues"""
    print("=" * 80)
    print("TESTING: Sapphire Digital Connect")
    print("=" * 80)
    
    url = "https://www.sapphiredigitalconnect.com/"
    
    # Mock job object with proper attributes
    class MockJob:
        def __init__(self):
            self.jobId = str(ObjectId())  # Valid 24-character hex string
            self.aiProjectId = str(ObjectId())  # Valid 24-character hex string
            self.projectId = str(ObjectId())  # Valid 24-character hex string
    
    job = MockJob()
    
    try:
        print(f"Analyzing URL: {url}")
        print(f"Job ID: {job.jobId}")
        print(f"Project ID: {job.aiProjectId}")
        result = analyze_single_url(url, job)
        
        print("\n" + "=" * 80)
        print("RESULTS ANALYSIS")
        print("=" * 80)
        
        # Check entity metrics
        entity_metrics = result.get('entity_metrics', {})
        print(f"Entity count: {entity_metrics.get('entity_count', 'NOT FOUND')}")
        print(f"Entity mentions: {entity_metrics.get('primary_entity_mentions_in_text', 'NOT FOUND')}")
        print(f"Unique entity types: {entity_metrics.get('unique_entity_types', 'NOT FOUND')}")
        
        # Check parsed entities
        parsed_entities = result.get('parsed_entities', [])
        print(f"Parsed entities count: {len(parsed_entities)}")
        
        # Show Organization entities
        org_entities = [e for e in parsed_entities if e.get('@type') == 'Organization']
        print(f"Organization entities found: {len(org_entities)}")
        for org in org_entities:
            name = org.get('name', 'NO NAME')
            legal_name = org.get('legalName', 'NO LEGAL NAME')
            print(f"  - Organization: name='{name}', legalName='{legal_name}'")
        
        # Show WebPage entities
        webpage_entities = [e for e in parsed_entities if e.get('@type') == 'WebPage']
        print(f"WebPage entities found: {len(webpage_entities)}")
        for webpage in webpage_entities:
            name = webpage.get('name', 'NO NAME')
            print(f"  - WebPage: name='{name}'")
        
        # Show WebSite entities
        website_entities = [e for e in parsed_entities if e.get('@type') == 'WebSite']
        print(f"WebSite entities found: {len(website_entities)}")
        for website in website_entities:
            name = website.get('name', 'NO NAME')
            print(f"  - WebSite: name='{name}'")
        
        # Show raw_json_ld_blocks for debugging
        raw_blocks = result.get('raw_json_ld_blocks', [])
        print(f"Raw JSON-LD blocks: {len(raw_blocks)}")
        for i, block in enumerate(raw_blocks):
            print(f"  Block {i}: {block.get('content_length', 0)} chars")
        
        # Check what entity name should be used for mention counting
        print(f"\n" + "=" * 80)
        print("ENTITY MENTION ANALYSIS")
        print("=" * 80)
        
        # Test multiple possible entity names
        entity_candidates = []
        
        # Check Organization entities
        for entity in parsed_entities:
            if entity.get("@type") == "Organization":
                name = entity.get("name", "").strip()
                legal_name = entity.get("legalName", "").strip()
                if name:
                    entity_candidates.append(("Organization.name", name))
                if legal_name:
                    entity_candidates.append(("Organization.legalName", legal_name))
                break
        
        # Check WebSite entities
        for entity in parsed_entities:
            if entity.get("@type") == "WebSite":
                name = entity.get("name", "").strip()
                if name:
                    entity_candidates.append(("WebSite.name", name))
                break
        
        # Check raw_json_ld_blocks as fallback
        import json
        import re
        for block in result.get("raw_json_ld_blocks", []):
            try:
                raw = json.loads(block.get("raw_content", "{}"))
                graph = raw.get("@graph", [raw])
                for node in graph:
                    if node.get("@type") == "Organization":
                        name = node.get("name", "").strip()
                        legal_name = node.get("legalName", "").strip()
                        if name:
                            entity_candidates.append(("Raw.Organization.name", name))
                        if legal_name:
                            entity_candidates.append(("Raw.Organization.legalName", legal_name))
                        break
            except Exception:
                continue
            break
        
        if not entity_candidates:
            print(f"❌ No entity name found!")
        else:
            print(f"🎯 Testing {len(entity_candidates)} entity name candidates:")
            
            # Get the actual text that the crawler uses
            title = result.get('enhanced_extraction_v2', {}).get('page_metadata', {}).get('title', '')
            meta_desc = result.get('enhanced_extraction_v2', {}).get('page_metadata', {}).get('meta_description', '')
            
            print(f"\n📝 Base text sources:")
            print(f"  Title: '{title}'")
            print(f"  Meta description: '{meta_desc}'")
            
            # For each candidate, count mentions
            best_candidate = None
            best_count = 0
            
            for source, entity_name in entity_candidates:
                if not entity_name:
                    continue
                    
                print(f"\n� Testing {source}: '{entity_name}'")
                
                # Check in title and meta
                title_contains = entity_name.lower() in title.lower()
                meta_contains = entity_name.lower() in meta_desc.lower()
                
                print(f"  Title contains: {title_contains}")
                print(f"  Meta description contains: {meta_contains}")
                
                # Count in combined text
                combined_text = f"{title} {meta_desc}"
                count = len(re.findall(re.escape(entity_name), combined_text, re.IGNORECASE))
                print(f"  🎯 Mentions in title+meta: {count}")
                
                if count > best_count:
                    best_count = count
                    best_candidate = (source, entity_name)
            
            print(f"\n� Best candidate: {best_candidate[0]} = '{best_candidate[1]}' with {best_count} mentions")
            
            # Now let's also check if there are any brand variations in the actual page content
            print(f"\n🔍 Looking for brand variations in page content...")
            
            # Try to get some actual page content to analyze
            main_content = result.get('main_content', {})
            content_text = main_content.get('main_content_text', '') or main_content.get('text', '') or main_content.get('content', '') or ''
            
            if content_text:
                print(f"  Main content available: {len(content_text)} chars")
                print(f"  First 200 chars: '{content_text[:200]}...'")
                
                # Look for any mention of "Sapphire" or "Digital Connect"
                sapphire_count = len(re.findall(r'\b' + re.escape('Sapphire') + r'\b', content_text, re.IGNORECASE))
                digital_count = len(re.findall(r'\b' + re.escape('Digital') + r'\b', content_text, re.IGNORECASE))
                connect_count = len(re.findall(r'\b' + re.escape('Connect') + r'\b', content_text, re.IGNORECASE))
                
                print(f"  'Sapphire' mentions: {sapphire_count}")
                print(f"  'Digital' mentions: {digital_count}")
                print(f"  'Connect' mentions: {connect_count}")
            else:
                print(f"  ❌ No main content available for analysis")
            
            # Final assessment
            print(f"\n� FINAL ASSESSMENT:")
            print(f"  Entity being used: '{best_candidate[1]}'")
            print(f"  Total mentions found: {best_count}")
            print(f"  Expected range: 8-20")
            print(f"  Assessment: {'✅ CORRECT' if best_count >= 8 else '⚠️  LOW - Brand name may not appear frequently in page content'}")
        
        # Check navigation detection
        enhanced_tech = result.get('enhanced_technical_signals', {})
        nav_detection = enhanced_tech.get('navigation_detection', {})
        print(f"\nNavigation detection (canonical):")
        print(f"  has_navigation: {nav_detection.get('has_navigation', 'NOT FOUND')}")
        print(f"  has_header: {nav_detection.get('has_header', 'NOT FOUND')}")
        print(f"  has_footer: {nav_detection.get('has_footer', 'NOT_FOUND')}")
        
        # Check synced locations
        enhanced_v2 = result.get('enhanced_extraction_v2', {})
        if enhanced_v2:
            page_metadata = enhanced_v2.get('page_metadata', {})
            structure_metrics = page_metadata.get('structure_metrics', {})
            print(f"\nNavigation detection (Location 1 - page_metadata):")
            print(f"  has_navigation: {structure_metrics.get('has_navigation', 'NOT FOUND')}")
            print(f"  has_header: {structure_metrics.get('has_header', 'NOT FOUND')}")
            print(f"  has_footer: {structure_metrics.get('has_footer', 'NOT FOUND')}")
            
            tech_seo = enhanced_v2.get('technical_seo_signals', {})
            body_signals = tech_seo.get('body_signals', {})
            structure = body_signals.get('structure', {})
            print(f"\nNavigation detection (Location 2 - body_signals):")
            print(f"  has_nav: {structure.get('has_nav', 'NOT FOUND')}")
            print(f"  has_header: {structure.get('has_header', 'NOT FOUND')}")
            print(f"  has_footer: {structure.get('has_footer', 'NOT FOUND')}")
        
        # Check paragraph counts
        content_metrics = result.get('content_metrics', {})
        print(f"\nParagraph counts:")
        print(f"  content_metrics.paragraph_count: {content_metrics.get('paragraph_count', 'NOT FOUND')}")
        
        if enhanced_v2 and 'page_metadata' in enhanced_v2:
            page_content_metrics = enhanced_v2['page_metadata'].get('content_metrics', {})
            print(f"  enhanced_extraction_v2.page_metadata.content_metrics.paragraph_count: {page_content_metrics.get('paragraph_count', 'NOT FOUND')}")
        
        # Check author detection
        author_signals = result.get('author_signals', {})
        print(f"\nAuthor detection:")
        print(f"  author_detected: {result.get('author_detected', 'NOT FOUND')}")
        print(f"  author_signals.author_detected: {author_signals.get('author_detected', 'NOT FOUND')}")
        print(f"  author_signals.author_schema: {author_signals.get('author_schema', 'NOT FOUND')}")
        
        # Check word counts
        print(f"\nWord counts:")
        print(f"  word_count: {result.get('word_count', 'NOT FOUND')}")
        print(f"  content_metrics.word_count: {content_metrics.get('word_count', 'NOT FOUND')}")
        print(f"  low_word_count: {result.get('low_word_count', 'NOT FOUND')}")
        
        # SUCCESS CRITERIA
        print("\n" + "=" * 80)
        print("SUCCESS CRITERIA CHECK")
        print("=" * 80)
        
        success = True
        
        # Entity count should be > 0
        entity_count = entity_metrics.get('entity_count', 0)
        if entity_count > 0:
            print(f"✅ Entity count: {entity_count} (> 0)")
        else:
            print(f"❌ Entity count: {entity_count} (should be > 0)")
            success = False
        
        # Entity mentions should be > 0
        mentions = entity_metrics.get('primary_entity_mentions_in_text', 0)
        if mentions > 0:
            print(f"✅ Entity mentions: {mentions} (> 0)")
        else:
            print(f"❌ Entity mentions: {mentions} (should be > 0)")
            success = False
        
        # Navigation should be consistent
        nav_canonical = nav_detection.get('has_navigation', False)
        nav_location1 = structure_metrics.get('has_navigation', False) if enhanced_v2 else False
        nav_location2 = structure.get('has_nav', False) if enhanced_v2 and tech_seo else False
        
        if nav_canonical == nav_location1 == nav_location2:
            print(f"✅ Navigation detection consistent: {nav_canonical}")
        else:
            print(f"❌ Navigation detection inconsistent: canonical={nav_canonical}, loc1={nav_location1}, loc2={nav_location2}")
            success = False
        
        # Author should be detected
        author_detected = result.get('author_detected', False)
        if author_detected:
            print(f"✅ Author detected: {author_detected}")
        else:
            print(f"❌ Author not detected: {author_detected}")
            success = False
        
        if success:
            print("\n🎉 ALL TESTS PASSED! Fixes are working correctly.")
        else:
            print("\n⚠️  SOME TESTS FAILED. Need further fixes.")
        
        return success
        
    except Exception as e:
        print(f"❌ ERROR during testing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting entity fixes test...")
    success = test_sapphire_digital_connect()
    sys.exit(0 if success else 1)
