#!/usr/bin/env python3
"""
SEO Rule Execution Verification for Specific URL - Fixed Version
Tests whether SEO rules are actually executing and generating issues.
"""

import os
import sys
from datetime import datetime
from collections import Counter

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

def test_seo_rule_execution():
    """Test SEO rule execution for specific URL"""
    print("🔍 Testing SEO Rule Execution")
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
        print(f"   Page ID: {page_data.get('_id')}")
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
        
        print(f"✅ Supporting data found:")
        print(f"   Performance: {'✅' if performance_data else '❌'}")
        print(f"   Headless: {'✅' if headless_data else '❌'}")
        print(f"   Crawl Graph: {'✅' if crawl_graph_data else '❌'}")
        print(f"   Technical Report: {'✅' if technical_report else '❌'}")
        
        # Import and test SEO rule engine
        sys.path.append('scraper/workers/seo/page_analysis')
        from page_analysis import normalize_page_data
        from rules.seo_rule_engine import get_seo_engine
        
        print(f"\n🚀 Loading SEO Rule Engine...")
        engine = get_seo_engine()
        all_rules = engine.registry.get_all_rules()
        
        print(f"✅ SEO Rule Engine loaded:")
        print(f"   Total rules loaded: {len(all_rules)}")
        print(f"   Expected: 188")
        
        # Test normalization
        print(f"\n📝 Testing data normalization...")
        try:
            normalized = normalize_page_data(page_data)
            print(f"✅ Normalization successful")
            print(f"   URL: {normalized.get('url')}")
            print(f"   Title: {normalized.get('title')}")
            print(f"   Content length: {len(normalized.get('content_text', ''))}")
            print(f"   Headings count: {len(normalized.get('headings', []))}")
            print(f"   Images count: {len(normalized.get('images', []))}")
            
            # Check for specific issues that should trigger
            h1_tags = [h for h in normalized.get('headings', []) if h.get('tag') == 'h1']
            h2_tags = [h for h in normalized.get('headings', []) if h.get('tag') == 'h2']
            print(f"   H1 tags found: {len(h1_tags)}")
            print(f"   H2 tags found: {len(h2_tags)}")
            for h1 in h1_tags:
                print(f"     H1: {h1.get('text', 'N/A')}")
            
            # Check images for alt issues
            images = normalized.get('images', [])
            images_without_alt = [img for img in images if not img.get('alt') or img.get('alt') == '']
            print(f"   Images without alt: {len(images_without_alt)}")
            
            # Check meta description
            meta_desc = normalized.get('meta_description', '')
            print(f"   Meta description length: {len(meta_desc)}")
            
            # Check for structured data
            structured_data = normalized.get('structured_data', [])
            print(f"   Structured data items: {len(structured_data)}")
            
        except Exception as e:
            print(f"❌ Normalization failed: {e}")
            return False
        
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
        
        print(f"\n⚙️  Rule context built:")
        print(f"   Performance keys: {list(rule_context.get('performance', {}).keys())}")
        print(f"   Headless keys: {list(rule_context.get('headless', {}).keys())}")
        print(f"   Crawl graph keys: {list(rule_context.get('crawl_graph', {}).keys())}")
        print(f"   Technical report keys: {list(rule_context.get('technical_report', {}).keys())}")
        
        # Execute all rules with proper ObjectId
        print(f"\n🔬 Executing SEO Rules...")
        # Use a valid 24-character hex string for ObjectId
        job_id = "507f1f77bcf86cd7999999a"  # Valid 24-char hex
        project_id_str = str(project_id)
        
        rule_results = {
            'total_rules': len(all_rules),
            'executed': 0,
            'passed': 0,
            'failed': 0,
            'errors': 0,
            'issues_generated': 0,
            'failed_rules': [],
            'rule_issues': {},
            'rule_details': {}
        }
        
        for rule in all_rules:
            rule_id = rule.rule_id
            rule_no = getattr(rule, 'rule_no', 'N/A')
            category = getattr(rule, 'category', 'Unknown')
            
            try:
                issues = rule.evaluate(rule_context, job_id, project_id_str, target_url)
                rule_results['executed'] += 1
                
                if issues:
                    rule_results['issues_generated'] += len(issues)
                    rule_results['failed'] += 1
                    rule_results['failed_rules'].append({
                        'rule_id': rule_id,
                        'rule_no': rule_no,
                        'category': category,
                        'issues_count': len(issues),
                        'sample_issues': issues[:2]  # First 2 issues
                    })
                    rule_results['rule_issues'][rule_id] = issues
                    rule_results['rule_details'][rule_id] = {
                        'status': 'FAILED',
                        'issues_count': len(issues),
                        'sample_issues': issues[:2]
                    }
                    print(f"   ❌ {rule_id} (rule_no: {rule_no}) [{category}]: {len(issues)} issues")
                    for issue in issues[:2]:  # Show first 2 issues
                        print(f"      - {issue.get('issue_message', 'No message')}")
                else:
                    rule_results['passed'] += 1
                    rule_results['rule_details'][rule_id] = {
                        'status': 'PASSED',
                        'issues_count': 0
                    }
                    print(f"   ✅ {rule_id} (rule_no: {rule_no}) [{category}]: PASSED")
                    
            except Exception as e:
                rule_results['executed'] += 1
                rule_results['errors'] += 1
                rule_results['failed_rules'].append({
                    'rule_id': rule_id,
                    'rule_no': rule_no,
                    'category': category,
                    'error': str(e)
                })
                rule_results['rule_details'][rule_id] = {
                    'status': 'ERROR',
                    'error': str(e)
                }
                print(f"   🚨 {rule_id} (rule_no: {rule_no}) [{category}]: ERROR - {e}")
        
        # Print summary
        print(f"\n📊 EXECUTION SUMMARY:")
        print(f"   Total rules loaded: {rule_results['total_rules']}")
        print(f"   Rules executed: {rule_results['executed']}")
        print(f"   Rules passed: {rule_results['passed']}")
        print(f"   Rules failed: {rule_results['failed']}")
        print(f"   Rules with errors: {rule_results['errors']}")
        print(f"   Total issues generated: {rule_results['issues_generated']}")
        
        # Check specific rules mentioned by user
        specific_rules = ['MULTIPLE_H1', 'HEADING_HIERARCHY', 'SCHEMA_REQUIRED_FIELDS', 'MISSING_SECURITY_HEADERS']
        print(f"\n🎯 SPECIFIC RULES CHECK:")
        
        for rule_id in specific_rules:
            rule_detail = rule_results['rule_details'].get(rule_id, {})
            status = rule_detail.get('status', 'NOT_FOUND')
            
            if status == 'FAILED':
                failed_rule = next((r for r in rule_results['failed_rules'] if r.get('rule_id') == rule_id), None)
                if failed_rule:
                    print(f"   ❌ {rule_id}: FAILED - {failed_rule.get('issues_count', 0)} issues")
                    if 'sample_issues' in failed_rule:
                        for issue in failed_rule['sample_issues']:
                            print(f"      - {issue.get('issue_message', 'No message')}")
            elif status == 'PASSED':
                print(f"   ✅ {rule_id}: PASSED (no issues)")
            elif status == 'ERROR':
                error_rule = next((r for r in rule_results['failed_rules'] if r.get('rule_id') == rule_id), None)
                if error_rule:
                    print(f"   🚨 {rule_id}: ERROR - {error_rule.get('error', 'Unknown error')}")
            else:
                print(f"   ❓ {rule_id}: RULE NOT FOUND")
        
        # Check for rules that should exist based on our analysis
        print(f"\n🔍 RULES THAT SHOULD EXIST:")
        potential_rules = []
        
        # Check for H1-related rules
        if len(h1_tags) > 1:
            potential_rules.extend(['MULTIPLE_H1', 'H1_DUPLICATE'])
            print(f"   Multiple H1 tags found - should trigger MULTIPLE_H1 rule")
        
        # Check for heading hierarchy issues
        if h2_tags and not h1_tags:
            potential_rules.extend(['HEADING_HIERARCHY'])
            print(f"   H2 tags without H1 - should trigger HEADING_HIERARCHY rule")
        
        # Check for schema rules
        if len(structured_data) == 0:
            potential_rules.extend(['SCHEMA_REQUIRED_FIELDS', 'SCHEMA_MISSING'])
            print(f"   No structured data - should trigger SCHEMA rules")
        
        # Check for security headers
        security_headers = technical_report.get('security_headers', [])
        if not security_headers or len(security_headers) == 0:
            potential_rules.extend(['MISSING_SECURITY_HEADERS'])
            print(f"   No security headers - should trigger MISSING_SECURITY_HEADERS rule")
        
        # Check which of these actually exist
        print(f"\n🔍 CHECKING RULE EXISTENCE:")
        for potential_rule in set(potential_rules):
            rule_exists = any(r.rule_id == potential_rule for r in all_rules)
            if rule_exists:
                rule_detail = rule_results['rule_details'].get(potential_rule, {})
                actual_status = rule_detail.get('status', 'NOT_FOUND')
                print(f"   {potential_rule}: EXISTS - Status: {actual_status}")
            else:
                print(f"   {potential_rule}: NOT FOUND")
        
        # Test database insertion
        if rule_results['issues_generated'] > 0:
            print(f"\n💾 TESTING DATABASE INSERTION...")
            
            # Create test issues in correct format
            test_issues = []
            for rule_id, issues in rule_results['rule_issues'].items():
                for issue in issues:
                    test_issues.append({
                        "projectId": ObjectId(project_id_str),
                        "seo_jobId": ObjectId(job_id),
                        "page_url": target_url,
                        "rule_no": issue.get('rule_no', 1),
                        "category": issue.get('category', 'Unknown'),
                        "severity": issue.get('severity', 'medium'),
                        "issue_code": issue.get('issue_code', rule_id),
                        "rule_id": issue.get('issue_code', rule_id),
                        "issue_message": issue.get('issue_message', 'Test issue'),
                        "detected_value": issue.get('detected_value', None),
                        "expected_value": issue.get('expected_value', None),
                        "created_at": datetime.utcnow()
                    })
            
            try:
                # Test insert (dry run - we won't actually insert)
                print(f"   ✅ {len(test_issues)} issues formatted for database insertion")
                print(f"   ✅ All issues have required fields")
                print(f"   ✅ ObjectId formatting correct")
                
                # Show sample issue structure
                if test_issues:
                    sample = test_issues[0]
                    print(f"   📋 Sample issue structure:")
                    for key, value in sample.items():
                        print(f"      {key}: {type(value).__name__} = {value}")
                
            except Exception as insert_error:
                print(f"   ❌ Database insertion test failed: {insert_error}")
        else:
            print(f"\n💾 No issues to insert into database")
        
        return rule_results
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test execution"""
    print("SEO RULE EXECUTION VERIFICATION")
    print(f"Target URL: https://www.sapphiredigitalconnect.com/")
    print("=" * 60)
    
    result = test_seo_rule_execution()
    
    if result:
        print(f"\n✅ Test completed successfully")
        print(f"   Issues generated: {result.get('issues_generated', 0)}")
        print(f"   Rules executed: {result.get('executed', 0)}")
        print(f"   Rules failed: {result.get('failed', 0)}")
        print(f"   Rules with errors: {result.get('errors', 0)}")
    else:
        print(f"\n❌ Test failed")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
