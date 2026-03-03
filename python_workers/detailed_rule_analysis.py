#!/usr/bin/env python3
"""
SEO PAGE_ANALYSIS Detailed Rule Execution Analysis

Tests actual rule execution, silent rules, and performance metrics.
"""

import os
import sys
import json
import time
from datetime import datetime
from collections import defaultdict, Counter

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

def test_actual_rule_execution():
    """Test actual rule execution with the modular engine"""
    print("🔍 Testing Actual Rule Execution...")
    
    try:
        # Import the actual modular engine
        sys.path.append('scraper/workers/seo/page_analysis')
        from rules.seo_rule_engine import get_seo_engine
        
        engine = get_seo_engine()
        all_rules = engine.registry.get_all_rules()
        
        print(f"  ✅ Loaded {len(all_rules)} rules from modular engine")
        
        # Create comprehensive test data
        test_context = {
            'url': 'https://example.com/test-page-with-many-issues',
            'title': 'Test Page With Many Issues For Comprehensive Rule Testing',
            'meta_description': 'This is a very long meta description that exceeds the recommended length and should trigger meta description rules',
            'content_text': 'This is test content with enough words to be meaningful for content analysis rules. It includes multiple sentences to test various rules. The content is designed to trigger several rule violations including missing elements, duplicate content, and structural issues.',
            'word_count': 45,
            'viewport': None,  # Missing viewport
            'headings': [
                {'tag': 'h1', 'text': 'Main Heading'},
                {'tag': 'h1', 'text': 'Duplicate H1 Heading'},  # Duplicate H1
                {'tag': 'h3', 'text': 'Skipped H2 Heading'},   # Skipped H2
                {'tag': 'h2', 'text': 'Sub Heading'},
                {'tag': 'h2', 'text': 'Duplicate Sub Heading'} # Duplicate H2
            ],
            'images': [
                {'src': 'image1.jpg'},  # Missing alt
                {'src': 'image2.jpg', 'alt': ''},  # Empty alt
                {'src': 'image3.jpg', 'alt': 'Test image'},  # Missing dimensions
                {'src': 'image4.jpg', 'alt': 'Test image with dimensions', 'width': '100', 'height': '100'}
            ],
            'og_tags': {},  # Missing Open Graph
            'scripts': [],  # Missing analytics
            'structured_data': [],  # Missing structured data
            'canonical': None,  # Missing canonical
            'hreflangs': [],  # Missing hreflangs
            'tracking': {},  # Missing tracking
            'meta_tags': {
                'description': ['This is a very long meta description that exceeds the recommended length'],
                'keywords': ['test, seo, verification']
            },
            'social': {'open_graph': {}},
            'doctype': False,  # Missing DOCTYPE
            'html_lang': None,  # Missing HTML lang
            'performance': {
                'mobile': {
                    'performance_score': 45,  # Low performance score
                    'first_contentful_paint': 3000  # Slow FCP
                }
            },
            'headless': {
                'accessibility_score': 65  # Low accessibility score
            },
            'crawl_graph': {
                'internal_links_count': 1,  # Few internal links
                'crawl_depth': 5  # Deep crawl
            },
            'technical_report': {
                'robots_txt_exists': False,  # Missing robots.txt
                'sitemap_xml_exists': False   # Missing sitemap
            }
        }
        
        # Execute all rules and track results
        rule_results = {}
        total_issues = 0
        executed_rules = 0
        rules_with_issues = 0
        rules_with_errors = 0
        
        execution_start = time.time()
        
        for rule in all_rules:
            rule_id = rule.rule_id
            rule_start = time.time()
            
            try:
                issues = rule.evaluate(test_context, "test_job", "test_project", "https://example.com")
                rule_time = time.time() - rule_start
                
                rule_results[rule_id] = {
                    'executed': True,
                    'issues_count': len(issues),
                    'execution_time_ms': round(rule_time * 1000, 2),
                    'sample_issues': issues[:2],  # First 2 issues for inspection
                    'category': rule.category,
                    'severity': rule.severity
                }
                total_issues += len(issues)
                executed_rules += 1
                if len(issues) > 0:
                    rules_with_issues += 1
                    
            except Exception as e:
                rule_time = time.time() - rule_start
                rule_results[rule_id] = {
                    'executed': False,
                    'error': str(e),
                    'execution_time_ms': round(rule_time * 1000, 2),
                    'category': getattr(rule, 'category', 'Unknown'),
                    'severity': getattr(rule, 'severity', 'Unknown')
                }
                rules_with_errors += 1
                executed_rules += 1
        
        total_execution_time = time.time() - execution_start
        
        print(f"  ✅ Rules executed: {executed_rules}/{len(all_rules)}")
        print(f"  ✅ Rules with issues: {rules_with_issues}")
        print(f"  ✅ Rules with errors: {rules_with_errors}")
        print(f"  ✅ Total issues generated: {total_issues}")
        print(f"  ⏱️  Total execution time: {total_execution_time:.3f}s")
        print(f"  ⏱️  Average per rule: {(total_execution_time / len(all_rules)) * 1000:.2f}ms")
        
        # Show top 10 rules by issue count
        issue_counts = [(rid, r['issues_count'], r['category']) for rid, r in rule_results.items() if r.get('executed') and r.get('issues_count', 0) > 0]
        issue_counts.sort(key=lambda x: x[1], reverse=True)
        
        print(f"  📊 Top 10 rules by issues:")
        for i, (rule_id, count, category) in enumerate(issue_counts[:10], 1):
            print(f"     {i:2d}. {rule_id}: {count} issues ({category})")
        
        # Show rules with errors
        if rules_with_errors > 0:
            print(f"  ❌ Rules with errors:")
            for rule_id, result in rule_results.items():
                if not result.get('executed') and 'error' in result:
                    print(f"     - {rule_id}: {result['error']}")
        
        return {
            'total_rules': len(all_rules),
            'executed_rules': executed_rules,
            'rules_with_issues': rules_with_issues,
            'rules_with_errors': rules_with_errors,
            'total_issues': total_issues,
            'execution_time_seconds': total_execution_time,
            'avg_time_per_rule_ms': (total_execution_time / len(all_rules)) * 1000,
            'top_rules_by_issues': issue_counts[:15],
            'rules_with_errors': [(rid, r['error']) for rid, r in rule_results.items() if not r.get('executed') and 'error' in r],
            'detailed_results': rule_results
        }
        
    except Exception as e:
        print(f"  ❌ Rule execution test failed: {e}")
        return {'error': str(e)}

def identify_silent_rules():
    """Identify rules that never fire (silent rules)"""
    print("\n🔍 Identifying Silent Rules...")
    
    try:
        sys.path.append('scraper/workers/seo/page_analysis')
        from rules.seo_rule_engine import get_seo_engine
        
        engine = get_seo_engine()
        all_rules = engine.registry.get_all_rules()
        
        # Test with multiple scenarios
        test_scenarios = {
            'minimal_data': {
                'url': 'https://example.com',
                'title': 'Test',
                'content_text': 'Short',
                'headings': [],
                'images': [],
                'meta_tags': {},
                'structured_data': []
            },
            'perfect_data': {
                'url': 'https://example.com/perfect-page',
                'title': 'Perfect Page Title - Optimal Length',
                'meta_description': 'Perfect meta description with optimal length between 150-160 characters for best SEO results.',
                'content_text': 'This is comprehensive content with sufficient word count to satisfy content analysis rules. It includes proper structure, relevant information, and adequate length to be considered substantial content.',
                'word_count': 150,
                'viewport': 'width=device-width, initial-scale=1.0',
                'headings': [
                    {'tag': 'h1', 'text': 'Main Heading'},
                    {'tag': 'h2', 'text': 'Sub Heading 1'},
                    {'tag': 'h2', 'text': 'Sub Heading 2'},
                    {'tag': 'h3', 'text': 'Sub Sub Heading'}
                ],
                'images': [
                    {'src': 'image1.jpg', 'alt': 'Descriptive alt text', 'width': '800', 'height': '600'},
                    {'src': 'image2.jpg', 'alt': 'Another descriptive alt text', 'width': '1200', 'height': '800'}
                ],
                'og_tags': {
                    'og:title': 'OG Title',
                    'og:description': 'OG Description',
                    'og:image': 'https://example.com/image.jpg'
                },
                'scripts': [
                    {'type': 'text/javascript', 'src': 'https://www.googletagmanager.com/gtag.js'}
                ],
                'structured_data': [
                    {'@type': 'Organization', 'name': 'Test Org', 'url': 'https://example.com'},
                    {'@type': 'WebPage', 'name': 'Test Page'}
                ],
                'canonical': 'https://example.com/perfect-page',
                'hreflangs': [
                    {'hreflang': 'en', 'href': 'https://example.com/en'},
                    {'hreflang': 'es', 'href': 'https://example.com/es'}
                ],
                'doctype': True,
                'html_lang': 'en'
            },
            'empty_data': {
                'url': 'https://example.com',
                'title': '',
                'content_text': '',
                'headings': [],
                'images': [],
                'meta_tags': {},
                'structured_data': [],
                'viewport': None,
                'canonical': None,
                'doctype': False
            }
        }
        
        silent_rules = []
        always_firing_rules = []
        
        for rule in all_rules:
            rule_id = rule.rule_id
            always_empty = True
            always_has_issues = True
            
            for scenario_name, test_data in test_scenarios.items():
                try:
                    issues = rule.evaluate(test_data, "test_job", "test_project", "https://example.com")
                    if len(issues) > 0:
                        always_empty = False
                    else:
                        always_has_issues = False
                except Exception:
                    # Rules that error are not considered silent
                    always_empty = False
                    always_has_issues = False
                    break
            
            if always_empty:
                silent_rules.append({
                    'rule_id': rule_id,
                    'category': rule.category,
                    'severity': rule.severity,
                    'reason': 'Never generates issues across all test scenarios'
                })
            elif always_has_issues:
                always_firing_rules.append({
                    'rule_id': rule_id,
                    'category': rule.category,
                    'severity': rule.severity,
                    'reason': 'Always generates issues'
                })
        
        print(f"  📊 Silent rules identified: {len(silent_rules)}")
        print(f"  📊 Always-firing rules: {len(always_firing_rules)}")
        print(f"  📊 Total rules tested: {len(all_rules)}")
        
        if silent_rules:
            print(f"  🔇 Silent rules (never fire):")
            for rule in silent_rules[:10]:  # Show first 10
                print(f"     - {rule['rule_id']} ({rule['category']}/{rule['severity']})")
        
        if always_firing_rules:
            print(f"  🔥 Always-firing rules:")
            for rule in always_firing_rules[:5]:  # Show first 5
                print(f"     - {rule['rule_id']} ({rule['category']}/{rule['severity']})")
        
        return {
            'silent_rules': silent_rules,
            'always_firing_rules': always_firing_rules,
            'silent_percentage': (len(silent_rules) / len(all_rules)) * 100,
            'total_rules_tested': len(all_rules)
        }
        
    except Exception as e:
        print(f"  ❌ Silent rule identification failed: {e}")
        return {'error': str(e)}

def test_database_operations():
    """Test database operation patterns"""
    print("\n🔍 Testing Database Operations...")
    
    try:
        from pymongo import MongoClient
        from bson.objectid import ObjectId
        
        MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/odito_dev')
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[MONGO_URI.split('/')[-1] if '/' in MONGO_URI else 'odito_dev']
        
        # Test current issues structure
        sample_issues = list(db.seo_page_issues.find().limit(5))
        
        if sample_issues:
            sample_issue = sample_issues[0]
            required_fields = [
                'projectId', 'seo_jobId', 'page_url', 'rule_no',
                'category', 'severity', 'issue_code', 'issue_message',
                'detected_value', 'expected_value', 'created_at'
            ]
            
            missing_fields = [field for field in required_fields if field not in sample_issue]
            has_objectid_projectId = isinstance(sample_issue.get('projectId'), ObjectId)
            has_objectid_jobId = isinstance(sample_issue.get('seo_jobId'), ObjectId)
            
            print(f"  ✅ Sample issues found: {len(sample_issues)}")
            print(f"  ✅ Required fields complete: {len(missing_fields) == 0}")
            print(f"  ✅ Uses ObjectId for projectId: {has_objectid_projectId}")
            print(f"  ✅ Uses ObjectId for seo_jobId: {has_objectid_jobId}")
            
            # Check for duplicate prevention
            project_counts = Counter(str(issue.get('projectId')) for issue in sample_issues)
            job_counts = Counter(str(issue.get('seo_jobId')) for issue in sample_issues)
            
            return {
                'sample_issues_found': len(sample_issues),
                'required_fields_complete': len(missing_fields) == 0,
                'missing_fields': missing_fields,
                'uses_objectid_projectId': has_objectid_projectId,
                'uses_objectid_jobId': has_objectid_jobId,
                'sample_structure': {k: type(v).__name__ for k, v in sample_issue.items()}
            }
        else:
            print("  ⚠️  No existing issues found to analyze structure")
            return {
                'sample_issues_found': 0,
                'note': 'No existing issues to analyze'
            }
        
    except Exception as e:
        print(f"  ❌ Database operations test failed: {e}")
        return {'error': str(e)}

def test_real_project_performance():
    """Test performance on real project data"""
    print("\n🔍 Testing Real Project Performance...")
    
    try:
        from pymongo import MongoClient
        from bson.objectid import ObjectId
        
        MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/odito_dev')
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[MONGO_URI.split('/')[-1] if '/' in MONGO_URI else 'odito_dev']
        
        # Find project with sufficient data
        project_pipeline = [
            {"$group": {"_id": "$projectId", "count": {"$sum": 1}}},
            {"$match": {"count": {"$gte": 10}}},
            {"$limit": 1}
        ]
        
        project_result = list(db.seo_page_data.aggregate(project_pipeline))
        
        if not project_result:
            print("  ⚠️  No project with 10+ pages found")
            return {'status': 'insufficient_data'}
        
        project_id = project_result[0]['_id']
        pages = list(db.seo_page_data.find({"projectId": project_id}).limit(10))
        
        print(f"  ✅ Found project with {len(pages)} pages")
        
        # Import analysis components
        sys.path.append('scraper/workers/seo/page_analysis')
        from page_analysis import normalize_page_data
        from rules.seo_rule_engine import get_seo_engine
        
        engine = get_seo_engine()
        
        # Performance tracking
        page_results = []
        rule_frequency = Counter()
        total_issues = 0
        normalization_errors = 0
        rule_execution_errors = 0
        
        start_time = time.time()
        
        for page in pages:
            page_start = time.time()
            
            try:
                # Test normalization
                normalized = normalize_page_data(page)
                
                # Test rule execution
                issues = engine.analyze_page(normalized, "test_job", str(project_id), page.get('url', ''))
                
                # Track rule frequency
                for issue in issues:
                    rule_frequency[issue.get('rule_id', 'unknown')] += 1
                
                page_time = time.time() - page_start
                
                page_results.append({
                    'url': page.get('url'),
                    'issues_count': len(issues),
                    'normalization_time_ms': round(page_time * 1000, 2),
                    'normalization_success': True,
                    'rule_execution_success': True
                })
                
                total_issues += len(issues)
                
            except Exception as e:
                page_time = time.time() - page_start
                page_results.append({
                    'url': page.get('url'),
                    'error': str(e),
                    'normalization_time_ms': round(page_time * 1000, 2),
                    'normalization_success': False,
                    'rule_execution_success': False
                })
                
                if 'normalize' in str(e).lower():
                    normalization_errors += 1
                else:
                    rule_execution_errors += 1
        
        total_time = time.time() - start_time
        
        # Calculate statistics
        successful_pages = [p for p in page_results if p.get('normalization_success', False)]
        avg_issues_per_page = total_issues / len(successful_pages) if successful_pages else 0
        avg_time_per_page = (total_time / len(pages)) * 1000
        
        # Get top rules
        top_10_rules = rule_frequency.most_common(10)
        
        print(f"  ✅ Successfully analyzed {len(successful_pages)}/{len(pages)} pages")
        print(f"  ✅ Total issues found: {total_issues}")
        print(f"  ✅ Average issues per page: {avg_issues_per_page:.2f}")
        print(f"  ⏱️  Total analysis time: {total_time:.3f}s")
        print(f"  ⏱️  Average per page: {avg_time_per_page:.2f}ms")
        print(f"  ❌ Normalization errors: {normalization_errors}")
        print(f"  ❌ Rule execution errors: {rule_execution_errors}")
        
        if top_10_rules:
            print(f"  📊 Top 5 triggered rules:")
            for i, (rule_id, count) in enumerate(top_10_rules[:5], 1):
                print(f"     {i}. {rule_id}: {count} times")
        
        return {
            'project_id': str(project_id),
            'pages_analyzed': len(pages),
            'pages_successful': len(successful_pages),
            'total_issues': total_issues,
            'avg_issues_per_page': round(avg_issues_per_page, 2),
            'total_time_seconds': total_time,
            'avg_time_per_page_ms': round(avg_time_per_page, 2),
            'normalization_errors': normalization_errors,
            'rule_execution_errors': rule_execution_errors,
            'top_10_rules': top_10_rules,
            'rule_frequency': dict(rule_frequency)
        }
        
    except Exception as e:
        print(f"  ❌ Real project performance test failed: {e}")
        return {'error': str(e)}

def main():
    """Run detailed rule execution analysis"""
    print("=" * 60)
    print("SEO PAGE_ANALYSIS DETAILED RULE EXECUTION ANALYSIS")
    print("=" * 60)
    
    results = {
        'timestamp': datetime.now().isoformat(),
        'tests': {}
    }
    
    # Run all detailed tests
    results['tests']['rule_execution'] = test_actual_rule_execution()
    results['tests']['silent_rules'] = identify_silent_rules()
    results['tests']['database_operations'] = test_database_operations()
    results['tests']['real_project_performance'] = test_real_project_performance()
    
    # Generate final assessment
    print("\n" + "=" * 60)
    print("FINAL PIPELINE ASSESSMENT")
    print("=" * 60)
    
    rule_exec = results['tests']['rule_execution']
    silent_rules = results['tests']['silent_rules']
    db_ops = results['tests']['database_operations']
    real_perf = results['tests']['real_project_performance']
    
    assessments = {
        'rules_executing_properly': rule_exec.get('execution_time_seconds', 0) > 0 and rule_exec.get('executed_rules', 0) > 0,
        'error_rate_acceptable': rule_exec.get('rules_with_errors', 0) / rule_exec.get('total_rules', 1) < 0.1,
        'silent_rules_acceptable': silent_rules.get('silent_percentage', 100) < 30,
        'database_structure_valid': 'error' not in db_ops and db_ops.get('required_fields_complete', False),
        'real_performance_good': real_perf.get('pages_successful', 0) >= real_perf.get('pages_analyzed', 0) * 0.8
    }
    
    print("📊 Component Assessments:")
    for component, passed in assessments.items():
        status = "✅" if passed else "❌"
        print(f"  {status} {component.replace('_', ' ').title()}")
    
    # Critical findings
    critical_findings = []
    
    if rule_exec.get('rules_with_errors', 0) > 0:
        critical_findings.append(f"🚨 {rule_exec.get('rules_with_errors', 0)} rules have execution errors")
    
    if silent_rules.get('silent_percentage', 0) > 20:
        critical_findings.append(f"⚠️  {silent_rules.get('silent_percentage', 0):.1f}% rules are silent (never fire)")
    
    if real_perf.get('normalization_errors', 0) > 0:
        critical_findings.append(f"❌ {real_perf.get('normalization_errors', 0)} normalization errors on real data")
    
    if critical_findings:
        print(f"\n🚨 Critical Findings:")
        for finding in critical_findings:
            print(f"  {finding}")
    else:
        print(f"\n✅ No critical issues found")
    
    # Final verdict
    passed_assessments = sum(assessments.values())
    if passed_assessments == 5:
        verdict = "SAFE - Pipeline is functioning optimally"
    elif passed_assessments >= 4:
        verdict = "SAFE WITH FIXES - Minor issues need attention"
    elif passed_assessments >= 3:
        verdict = "RISKY - Significant issues require fixes"
    else:
        verdict = "BROKEN - Major issues prevent normal operation"
    
    print(f"\n🎯 FINAL VERDICT: {verdict}")
    print("=" * 60)
    
    results['assessments'] = assessments
    results['critical_findings'] = critical_findings
    results['final_verdict'] = verdict
    
    # Save detailed results
    with open('detailed_rule_analysis.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nDetailed analysis saved to: detailed_rule_analysis.json")
    return results

if __name__ == "__main__":
    main()
