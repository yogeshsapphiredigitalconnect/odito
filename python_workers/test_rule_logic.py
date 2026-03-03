#!/usr/bin/env python3
"""
SEO Rule Logic Verification - Direct Test
Tests rule logic without ObjectId validation issues.
"""

import os
import sys
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

def test_rule_logic_directly():
    """Test rule logic directly without ObjectId validation"""
    print("🔍 Testing SEO Rule Logic Directly")
    print("=" * 60)
    
    target_url = "https://www.sapphiredigitalconnect.com/"
    
    try:
        # Import required modules
        from pymongo import MongoClient
        from bson.objectid import ObjectId
        
        # Connect to database
        MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/odito_dev')
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[MONGO_URI.split('/')[-1] if '/' in MONGO_URI else 'odito_dev']
        
        print(f"✅ Connected to database: {db.name}")
        
        # Find page data for target URL
        page_data = db.seo_page_data.find_one({"url": target_url})
        
        if not page_data:
            print(f"❌ No page data found for: {target_url}")
            return False
        
        print(f"✅ Found page data for: {target_url}")
        print(f"   Title: {page_data.get('title', 'N/A')}")
        
        # Get supporting data
        project_id = page_data.get('projectId')
        
        performance_data = db.seo_page_performance.find_one({
            "projectId": project_id, 
            "page_url": target_url
        })
        
        headless_data = db.seo_headless_data.find_one({
            "projectId": project_id,
            "url": target_url
        })
        
        crawl_graph_data = db.seo_crawl_graph.find_one({
            "projectId": project_id,
            "page_url": target_url
        })
        
        technical_report = db.domain_technical_reports.find_one({
            "projectId": project_id
        }) or {}
        
        # Import and test SEO rule engine
        sys.path.append('scraper/workers/seo/page_analysis')
        from page_analysis import normalize_page_data
        from rules.seo_rule_engine import get_seo_engine
        
        print(f"\n🚀 Loading SEO Rule Engine...")
        engine = get_seo_engine()
        all_rules = engine.registry.get_all_rules()
        
        # Test normalization
        print(f"\n📝 Testing data normalization...")
        normalized = normalize_page_data(page_data)
        
        # Analyze page content manually
        h1_tags = [h for h in normalized.get('headings', []) if h.get('tag') == 'h1']
        h2_tags = [h for h in normalized.get('headings', []) if h.get('tag') == 'h2']
        images = normalized.get('images', [])
        images_without_alt = [img for img in images if not img.get('alt') or img.get('alt') == '']
        structured_data = normalized.get('structured_data', [])
        security_headers = technical_report.get('security_headers', [])
        
        print(f"   H1 tags found: {len(h1_tags)}")
        for h1 in h1_tags:
            print(f"     H1: {h1.get('text', 'N/A')}")
        
        print(f"   H2 tags found: {len(h2_tags)}")
        print(f"   Images without alt: {len(images_without_alt)}")
        print(f"   Structured data items: {len(structured_data)}")
        print(f"   Security headers: {len(security_headers)}")
        
        # Build rule context
        def _normalize_lookup_url(url):
            if not url or not isinstance(url, str):
                return ""
            return url.rstrip('/').lower()
        
        lookup_url = _normalize_lookup_url(target_url)
        rule_context = {
            **normalized,
            "performance": performance_data or {},
            "headless": headless_data or {},
            "crawl_graph": crawl_graph_data or {},
            "technical_report": technical_report or {},
        }
        
        # Test specific rules directly
        print(f"\n🎯 TESTING SPECIFIC RULES:")
        
        # Test MULTIPLE_H1 rule (should be TITLE_MULTIPLE based on available rules)
        title_multiple_rule = None
        for rule in all_rules:
            if rule.rule_id == 'TITLE_MULTIPLE':
                title_multiple_rule = rule
                break
        
        if title_multiple_rule:
            print(f"\n   Testing TITLE_MULTIPLE rule:")
            try:
                # Test rule evaluation with dummy ObjectId
                issues = title_multiple_rule.evaluate(rule_context, "507f1f77bcf86cd7999999a", str(project_id), target_url)
                if issues:
                    print(f"   ✅ TITLE_MULTIPLE: DETECTED {len(issues)} issues")
                    for issue in issues:
                        print(f"      - {issue.get('issue_message', 'No message')}")
                else:
                    print(f"   ❌ TITLE_MULTIPLE: NOT DETECTED (should detect {len(h1_tags)} H1 tags)")
            except Exception as e:
                print(f"   🚨 TITLE_MULTIPLE: ERROR - {e}")
        else:
            print(f"   ❓ TITLE_MULTIPLE: Rule not found")
        
        # Test SCHEMA rules
        schema_rules = [r for r in all_rules if 'SCHEMA' in r.rule_id]
        print(f"\n   Found {len(schema_rules)} SCHEMA rules")
        
        # Test SCHEMA_JSONLD_PRESENT
        schema_jsonld_rule = next((r for r in all_rules if r.rule_id == 'SCHEMA_JSONLD_PRESENT'), None)
        if schema_jsonld_rule:
            print(f"\n   Testing SCHEMA_JSONLD_PRESENT rule:")
            try:
                issues = schema_jsonld_rule.evaluate(rule_context, "507f1f77bcf86cd7999999a", str(project_id), target_url)
                if issues:
                    print(f"   ✅ SCHEMA_JSONLD_PRESENT: DETECTED {len(issues)} issues")
                    for issue in issues:
                        print(f"      - {issue.get('issue_message', 'No message')}")
                else:
                    print(f"   ❌ SCHEMA_JSONLD_PRESENT: NOT DETECTED (should detect {len(structured_data)} structured data items)")
            except Exception as e:
                print(f"   🚨 SCHEMA_JSONLD_PRESENT: ERROR - {e}")
        
        # Test SECURITY_HEADERS rule
        security_headers_rule = next((r for r in all_rules if r.rule_id == 'SECURITY_HEADERS'), None)
        if security_headers_rule:
            print(f"\n   Testing SECURITY_HEADERS rule:")
            try:
                issues = security_headers_rule.evaluate(rule_context, "507f1f77bcf86cd7999999a", str(project_id), target_url)
                if issues:
                    print(f"   ✅ SECURITY_HEADERS: DETECTED {len(issues)} issues")
                    for issue in issues:
                        print(f"      - {issue.get('issue_message', 'No message')}")
                else:
                    print(f"   ❌ SECURITY_HEADERS: NOT DETECTED (should detect missing security headers)")
            except Exception as e:
                print(f"   🚨 SECURITY_HEADERS: ERROR - {e}")
        
        # Test IMAGES_ALL_HAVE_ALT rule
        images_alt_rule = next((r for r in all_rules if r.rule_id == 'IMAGES_ALL_HAVE_ALT'), None)
        if images_alt_rule:
            print(f"\n   Testing IMAGES_ALL_HAVE_ALT rule:")
            try:
                issues = images_alt_rule.evaluate(rule_context, "507f1f77bcf86cd7999999a", str(project_id), target_url)
                if issues:
                    print(f"   ✅ IMAGES_ALL_HAVE_ALT: DETECTED {len(issues)} issues")
                    for issue in issues:
                        print(f"      - {issue.get('issue_message', 'No message')}")
                else:
                    print(f"   ❌ IMAGES_ALL_HAVE_ALT: NOT DETECTED (should detect {len(images_without_alt)} images without alt)")
            except Exception as e:
                print(f"   🚨 IMAGES_ALL_HAVE_ALT: ERROR - {e}")
        
        # Test H1 rules
        h1_rules = [r for r in all_rules if 'H1' in r.rule_id]
        print(f"\n   Found {len(h1_rules)} H1-related rules:")
        for rule in h1_rules:
            print(f"     {rule.rule_id} (rule_no: {getattr(rule, 'rule_no', 'N/A')})")
        
        # Test rule execution with mock data that should trigger issues
        print(f"\n🧪 TESTING WITH PROBLEMATIC DATA:")
        
        # Create test data that should definitely trigger issues
        problematic_context = {
            'url': target_url,
            'title': '',  # Missing title
            'meta_description': '',  # Missing meta description
            'content_text': 'Short',  # Too short content
            'headings': [
                {'tag': 'h1', 'text': 'Title 1'},
                {'tag': 'h1', 'text': 'Title 2'},  # Multiple H1
                {'tag': 'h3', 'text': 'Subtitle'}  # H3 without H2
            ],
            'images': [
                {'src': 'image1.jpg'},  # Missing alt
                {'src': 'image2.jpg', 'alt': ''}  # Empty alt
            ],
            'structured_data': [],  # No structured data
            'performance': {},
            'headless': {},
            'crawl_graph': {},
            'technical_report': {
                'security_headers': []  # No security headers
            }
        }
        
        print(f"   Problematic data created:")
        print(f"     Missing title: {not problematic_context.get('title')}")
        print(f"     Multiple H1: {len([h for h in problematic_context.get('headings', []) if h.get('tag') == 'h1'])}")
        print(f"     Images without alt: {len([img for img in problematic_context.get('images', []) if not img.get('alt')])}")
        print(f"     No structured data: {len(problematic_context.get('structured_data', [])) == 0}")
        print(f"     No security headers: {len(problematic_context.get('technical_report', {}).get('security_headers', [])) == 0}")
        
        # Test with problematic data
        print(f"\n   Testing rules with problematic data:")
        issue_count = 0
        
        for rule in all_rules[:10]:  # Test first 10 rules
            try:
                issues = rule.evaluate(problematic_context, "507f1f77bcf86cd7999999a", str(project_id), target_url)
                if issues:
                    issue_count += len(issues)
                    print(f"     ✅ {rule.rule_id}: {len(issues)} issues")
                else:
                    print(f"     ❌ {rule.rule_id}: 0 issues")
            except Exception as e:
                print(f"     🚨 {rule.rule_id}: ERROR - {e}")
        
        print(f"   Total issues from problematic data: {issue_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test execution"""
    print("SEO RULE LOGIC VERIFICATION")
    print(f"Target URL: https://www.sapphiredigitalconnect.com/")
    print("=" * 60)
    
    result = test_rule_logic_directly()
    
    if result:
        print(f"\n✅ Rule logic verification completed")
    else:
        print(f"\n❌ Rule logic verification failed")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
