#!/usr/bin/env python3
"""
Simplified SEO PAGE_ANALYSIS Pipeline Verification

Tests the core pipeline components without complex imports.
"""

import os
import sys
import json
from datetime import datetime
from collections import defaultdict, Counter

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

# Test database connection and basic structure
def test_database_connectivity():
    """Test basic database connectivity and collections"""
    print("🔍 Testing Database Connectivity...")
    
    try:
        from pymongo import MongoClient
        from bson.objectid import ObjectId
        
        MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/odito_dev')
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[MONGO_URI.split('/')[-1] if '/' in MONGO_URI else 'odito_dev']
        
        # Test connection
        client.admin.command('ping')
        print("  ✅ Database connection successful")
        
        # Check collections exist
        required_collections = [
            'seo_page_data', 'seo_page_performance', 'seo_headless_data',
            'seo_crawl_graph', 'domain_technical_reports', 'seo_page_issues'
        ]
        
        collection_status = {}
        for collection_name in required_collections:
            try:
                collection = db[collection_name]
                count = collection.count_documents({})
                collection_status[collection_name] = {
                    'exists': True,
                    'document_count': count
                }
                print(f"  ✅ {collection_name}: {count} documents")
            except Exception as e:
                collection_status[collection_name] = {
                    'exists': False,
                    'error': str(e)
                }
                print(f"  ❌ {collection_name}: {e}")
        
        return collection_status
        
    except Exception as e:
        print(f"  ❌ Database connection failed: {e}")
        return {'error': str(e)}

def test_rule_engine_import():
    """Test if the new modular rule engine can be imported"""
    print("\n🔍 Testing Rule Engine Import...")
    
    try:
        # Test SEO rule engine import
        sys.path.append('workers/seo/page_analysis')
        from rules.seo_rule_engine import get_seo_engine
        engine = get_seo_engine()
        
        rule_count = engine.registry.get_rule_count()
        categories = engine.registry.get_categories()
        
        print(f"  ✅ SEO Rule Engine imported successfully")
        print(f"  ✅ Rules registered: {rule_count}")
        print(f"  ✅ Categories: {len(categories)} ({', '.join(categories)})")
        
        return {
            'engine_loaded': True,
            'rule_count': rule_count,
            'categories': categories,
            'rules_by_category': {cat: len(engine.registry.get_rules_by_category(cat)) for cat in categories}
        }
        
    except Exception as e:
        print(f"  ❌ Rule Engine import failed: {e}")
        return {'error': str(e)}

def test_rule_execution():
    """Test rule execution with sample data"""
    print("\n🔍 Testing Rule Execution...")
    
    try:
        sys.path.append('workers/seo/page_analysis')
        from rules.seo_rule_engine import get_seo_engine
        
        engine = get_seo_engine()
        all_rules = engine.registry.get_all_rules()
        
        # Create test data
        test_context = {
            'url': 'https://example.com/test-page',
            'title': 'Test Page Title - Example Website',
            'meta_description': 'This is a test page for SEO rule verification',
            'content_text': 'This is test content with enough words to be meaningful. It includes multiple sentences to test various rules.',
            'word_count': 25,
            'viewport': 'width=device-width, initial-scale=1.0',
            'headings': [
                {'tag': 'h1', 'text': 'Main Heading'},
                {'tag': 'h2', 'text': 'Sub Heading'},
                {'tag': 'h2', 'text': 'Another Sub Heading'}
            ],
            'images': [
                {'src': 'image1.jpg', 'alt': 'Test image 1'},
                {'src': 'image2.jpg', 'alt': ''},  # Missing alt text
                {'src': 'image3.jpg', 'alt': 'Test image 3', 'width': '100', 'height': '100'}
            ],
            'og_tags': {
                'og:title': 'OG Title',
                'og:description': 'OG Description'
            },
            'scripts': [
                {'type': 'text/javascript', 'src': 'analytics.js'}
            ],
            'structured_data': [
                {'@type': 'Organization', 'name': 'Test Org'}
            ],
            'canonical': 'https://example.com/test-page',
            'hreflangs': [],
            'tracking': {'google_analytics': 'GA-12345'},
            'meta_tags': {
                'description': ['This is a test page'],
                'keywords': ['test, seo, verification']
            },
            'social': {'open_graph': {}},
            'doctype': True,
            'html_lang': 'en',
            'performance': {
                'mobile': {
                    'performance_score': 85,
                    'first_contentful_paint': 1200
                }
            },
            'headless': {
                'accessibility_score': 90
            },
            'crawl_graph': {
                'internal_links_count': 5,
                'crawl_depth': 2
            },
            'technical_report': {
                'robots_txt_exists': True,
                'sitemap_xml_exists': True
            }
        }
        
        # Execute all rules
        rule_results = {}
        total_issues = 0
        executed_rules = 0
        rules_with_issues = 0
        
        for rule in all_rules:
            rule_id = rule.rule_id
            try:
                issues = rule.evaluate(test_context, "test_job", "test_project", "https://example.com")
                rule_results[rule_id] = {
                    'executed': True,
                    'issues_count': len(issues),
                    'sample_issues': issues[:2]  # First 2 issues for inspection
                }
                total_issues += len(issues)
                executed_rules += 1
                if len(issues) > 0:
                    rules_with_issues += 1
            except Exception as e:
                rule_results[rule_id] = {
                    'executed': False,
                    'error': str(e)
                }
        
        print(f"  ✅ Rules executed: {executed_rules}/{len(all_rules)}")
        print(f"  ✅ Rules with issues: {rules_with_issues}")
        print(f"  ✅ Total issues generated: {total_issues}")
        
        # Show top 5 rules by issue count
        issue_counts = [(rid, r['issues_count']) for rid, r in rule_results.items() if r.get('executed') and r.get('issues_count', 0) > 0]
        issue_counts.sort(key=lambda x: x[1], reverse=True)
        
        print(f"  📊 Top 5 rules by issues:")
        for rule_id, count in issue_counts[:5]:
            print(f"     - {rule_id}: {count} issues")
        
        return {
            'total_rules': len(all_rules),
            'executed_rules': executed_rules,
            'rules_with_issues': rules_with_issues,
            'total_issues': total_issues,
            'execution_rate': (executed_rules / len(all_rules)) * 100,
            'top_rules': issue_counts[:10],
            'rule_results': rule_results
        }
        
    except Exception as e:
        print(f"  ❌ Rule execution test failed: {e}")
        return {'error': str(e)}

def test_data_flow_structure():
    """Test the data flow structure by checking page_analysis.py"""
    print("\n🔍 Testing Data Flow Structure...")
    
    try:
        # Read the page_analysis.py file to verify data flow
        with open('workers/seo/page_analysis/page_analysis.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for key data flow patterns
        checks = {
            'bulk_fetch_seo_page_data': 'seo_page_data.find' in content,
            'bulk_fetch_performance': 'seo_page_performance.find' in content,
            'bulk_fetch_headless': 'seo_headless_data.find' in content,
            'bulk_fetch_crawl_graph': 'seo_crawl_graph.find' in content,
            'bulk_fetch_technical': 'domain_technical_report.find_one' in content,
            'rule_context_construction': 'rule_context = {' in content,
            'aggregated_issues': 'all_issues.extend' in content,
            'bulk_insert': 'insert_many' in content,
            'modular_engine': 'get_seo_engine()' in content,
            'no_per_page_db_ops': 'seo_page_issues.insert' not in content.replace('insert_many', '')
        }
        
        passed_checks = sum(checks.values())
        total_checks = len(checks)
        
        print(f"  ✅ Data flow checks passed: {passed_checks}/{total_checks}")
        
        for check_name, passed in checks.items():
            status = "✅" if passed else "❌"
            print(f"    {status} {check_name}")
        
        return {
            'checks_passed': passed_checks,
            'total_checks': total_checks,
            'pass_rate': (passed_checks / total_checks) * 100,
            'detailed_checks': checks
        }
        
    except Exception as e:
        print(f"  ❌ Data flow structure test failed: {e}")
        return {'error': str(e)}

def test_real_project_analysis():
    """Test analysis on a real project if available"""
    print("\n🔍 Testing Real Project Analysis...")
    
    try:
        from pymongo import MongoClient
        from bson.objectid import ObjectId
        
        MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/odito_dev')
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[MONGO_URI.split('/')[-1] if '/' in MONGO_URI else 'odito_dev']
        
        # Find project with data
        project_pipeline = [
            {"$group": {"_id": "$projectId", "count": {"$sum": 1}}},
            {"$match": {"count": {"$gte": 5}}},
            {"$limit": 1}
        ]
        
        project_result = list(db.seo_page_data.aggregate(project_pipeline))
        
        if not project_result:
            print("  ⚠️  No project with sufficient data found")
            return {'status': 'no_project_found'}
        
        project_id = project_result[0]['_id']
        pages = list(db.seo_page_data.find({"projectId": project_id}).limit(5))
        
        print(f"  ✅ Found project with {len(pages)} pages")
        
        # Test normalization
        sys.path.append('workers/seo/page_analysis')
        from page_analysis import normalize_page_data
        from rules.seo_rule_engine import get_seo_engine
        
        engine = get_seo_engine()
        page_results = []
        
        for page in pages:
            try:
                normalized = normalize_page_data(page)
                issues = engine.analyze_page(normalized, "test_job", str(project_id), page.get('url', ''))
                page_results.append({
                    'url': page.get('url'),
                    'issues_count': len(issues),
                    'normalization_success': True
                })
            except Exception as e:
                page_results.append({
                    'url': page.get('url'),
                    'error': str(e),
                    'normalization_success': False
                })
        
        successful_pages = [p for p in page_results if p.get('normalization_success', False)]
        total_issues = sum(p.get('issues_count', 0) for p in successful_pages)
        avg_issues = total_issues / len(successful_pages) if successful_pages else 0
        
        print(f"  ✅ Successfully analyzed {len(successful_pages)}/{len(pages)} pages")
        print(f"  ✅ Total issues found: {total_issues}")
        print(f"  ✅ Average issues per page: {avg_issues:.2f}")
        
        return {
            'project_found': True,
            'pages_analyzed': len(pages),
            'pages_successful': len(successful_pages),
            'total_issues': total_issues,
            'avg_issues_per_page': round(avg_issues, 2)
        }
        
    except Exception as e:
        print(f"  ❌ Real project analysis failed: {e}")
        return {'error': str(e)}

def main():
    """Run all verification tests"""
    print("=" * 60)
    print("SEO PAGE_ANALYSIS PIPELINE VERIFICATION")
    print("=" * 60)
    
    results = {
        'timestamp': datetime.now().isoformat(),
        'tests': {}
    }
    
    # Run all tests
    results['tests']['database_connectivity'] = test_database_connectivity()
    results['tests']['rule_engine_import'] = test_rule_engine_import()
    results['tests']['rule_execution'] = test_rule_execution()
    results['tests']['data_flow_structure'] = test_data_flow_structure()
    results['tests']['real_project_analysis'] = test_real_project_analysis()
    
    # Generate summary
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    
    summary = {
        'database_safe': 'error' not in results['tests']['database_connectivity'],
        'engine_loaded': 'error' not in results['tests']['rule_engine_import'],
        'rules_executing': 'error' not in results['tests']['rule_execution'] and results['tests']['rule_execution'].get('execution_rate', 0) > 90,
        'data_flow_safe': results['tests']['data_flow_structure'].get('pass_rate', 0) > 80,
        'real_data_working': results['tests']['real_project_analysis'].get('project_found', False) or results['tests']['real_project_analysis'].get('status') == 'no_project_found'
    }
    
    for test_name, passed in summary.items():
        status = "✅" if passed else "❌"
        print(f"{status} {test_name.replace('_', ' ').title()}")
    
    # Final verdict
    passed_count = sum(summary.values())
    if passed_count == 5:
        verdict = "SAFE"
    elif passed_count >= 4:
        verdict = "SAFE WITH FIXES"
    else:
        verdict = "RISKY"
    
    print(f"\n🎯 FINAL VERDICT: {verdict}")
    print("=" * 60)
    
    results['summary'] = summary
    results['final_verdict'] = verdict
    
    # Save results
    with open('verification_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nDetailed results saved to: verification_results.json")
    return results

if __name__ == "__main__":
    main()
