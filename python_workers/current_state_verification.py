#!/usr/bin/env python3
"""
SEO PAGE_ANALYSIS Pipeline Verification - Current State Analysis

Analyzes the ACTUAL current state of the pipeline, not what it should be.
"""

import os
import sys
import json
from datetime import datetime
from collections import defaultdict, Counter

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

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
        
        # Check collections exist and get sample data
        required_collections = [
            'seo_page_data', 'seo_page_performance', 'seo_headless_data',
            'seo_crawl_graph', 'domain_technical_reports', 'seo_page_issues'
        ]
        
        collection_status = {}
        for collection_name in required_collections:
            try:
                collection = db[collection_name]
                count = collection.count_documents({})
                # Get sample document for analysis
                sample = collection.find_one()
                collection_status[collection_name] = {
                    'exists': True,
                    'document_count': count,
                    'sample_keys': list(sample.keys()) if sample else [],
                    'has_data': count > 0
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

def analyze_page_analysis_code():
    """Analyze the actual page_analysis.py code structure"""
    print("\n🔍 Analyzing Page Analysis Code Structure...")
    
    try:
        with open('scraper/workers/seo/page_analysis/page_analysis.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        analysis = {
            'file_exists': True,
            'file_size': len(content),
            'references_modular_engine': 'get_seo_engine' in content,
            'has_old_execute_rule': 'def execute_rule(' in content,
            'has_seo_rules_import': 'from scraper.rules.seo_rules import SEO_RULES' in content,
            'bulk_collections_pattern': content.count('.find('),
            'insert_many_usage': content.count('insert_many'),
            'insert_one_usage': content.count('insert_one'),
            'rule_context_construction': 'rule_context = {' in content,
            'all_issues_aggregation': 'all_issues.extend' in content,
            'performance_lookup': 'performance_lookup' in content,
            'headless_lookup': 'headless_lookup' in content,
            'crawl_graph_lookup': 'crawl_graph_lookup' in content,
            'technical_report': 'technical_report' in content
        }
        
        print(f"  ✅ File exists and analyzed ({analysis['file_size']} chars)")
        print(f"  📊 Bulk collection fetches: {analysis['bulk_collections_pattern']}")
        print(f"  📊 insert_many usage: {analysis['insert_many_usage']}")
        print(f"  📊 insert_one usage: {analysis['insert_one_usage']}")
        print(f"  {'✅' if analysis['references_modular_engine'] else '❌'} References modular engine")
        print(f"  {'✅' if analysis['has_old_execute_rule'] else '❌'} Has old execute_rule")
        
        return analysis
        
    except Exception as e:
        print(f"  ❌ Code analysis failed: {e}")
        return {'error': str(e)}

def check_seo_rules_metadata():
    """Check SEO rules metadata structure"""
    print("\n🔍 Checking SEO Rules Metadata...")
    
    try:
        sys.path.append('scraper')
        from rules.seo_rules import SEO_RULES, get_all_rules
        
        rules = get_all_rules()
        
        rule_analysis = {
            'total_rules': len(rules),
            'categories': list(set(rule.get('category', 'Unknown') for rule in rules.values())),
            'severities': list(set(rule.get('severity', 'Unknown') for rule in rules.values())),
            'scorable_rules': sum(1 for rule in rules.values() if rule.get('scorable', False)),
            'sample_rules': list(rules.keys())[:5]
        }
        
        print(f"  ✅ SEO Rules metadata loaded: {rule_analysis['total_rules']} rules")
        print(f"  📊 Categories: {rule_analysis['categories']}")
        print(f"  📊 Severities: {rule_analysis['severities']}")
        print(f"  📊 Scorable rules: {rule_analysis['scorable_rules']}")
        
        return rule_analysis
        
    except Exception as e:
        print(f"  ❌ SEO rules check failed: {e}")
        return {'error': str(e)}

def check_modular_engine_exists():
    """Check if modular rule engine actually exists"""
    print("\n🔍 Checking Modular Rule Engine...")
    
    engine_files = [
        'scraper/workers/seo/page_analysis/rules/seo_rule_engine.py',
        'scraper/workers/seo/page_analysis/rules/seo_rule_registry.py',
        'scraper/workers/seo/page_analysis/rules/base_seo_rule.py',
        'scraper/workers/seo/page_analysis/rules/categories/__init__.py'
    ]
    
    file_status = {}
    for file_path in engine_files:
        exists = os.path.exists(file_path)
        file_status[file_path] = exists
        status = "✅" if exists else "❌"
        print(f"  {status} {file_path}")
    
    engine_exists = all(file_status.values())
    
    if engine_exists:
        print("  ✅ Modular rule engine exists")
    else:
        print("  ❌ Modular rule engine missing - code references non-existent module")
    
    return {
        'engine_exists': engine_exists,
        'file_status': file_status
    }

def test_data_flow_with_actual_code():
    """Test data flow by analyzing the actual execution pattern"""
    print("\n🔍 Testing Data Flow Pattern...")
    
    try:
        # Read the execute_page_analysis_logic function
        with open('scraper/workers/seo/page_analysis/page_analysis.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract the main function pattern
        data_flow_analysis = {
            'fetches_seo_page_data_once': 'seo_page_data.find' in content,
            'fetches_performance_once': 'seo_page_performance.find' in content,
            'fetches_headless_once': 'seo_headless_data.find' in content,
            'fetches_crawl_graph_once': 'seo_crawl_graph.find' in content,
            'fetches_technical_once': 'domain_technical_report.find_one' in content,
            'builds_performance_lookup': 'performance_lookup' in content,
            'builds_headless_lookup': 'headless_lookup' in content,
            'builds_crawl_graph_lookup': 'crawl_graph_lookup' in content,
            'creates_rule_context': 'rule_context = {' in content,
            'aggregates_issues_in_memory': 'all_issues.extend' in content,
            'bulk_insert_at_end': 'seo_page_issues.insert_many' in content,
            'no_per_page_db_inserts': content.count('seo_page_issues.insert_one') == 0
        }
        
        passed_checks = sum(data_flow_analysis.values())
        total_checks = len(data_flow_analysis)
        
        print(f"  ✅ Data flow checks: {passed_checks}/{total_checks}")
        
        for check_name, passed in data_flow_analysis.items():
            status = "✅" if passed else "❌"
            print(f"    {status} {check_name}")
        
        return {
            'passed_checks': passed_checks,
            'total_checks': total_checks,
            'pass_rate': (passed_checks / total_checks) * 100,
            'detailed_analysis': data_flow_analysis
        }
        
    except Exception as e:
        print(f"  ❌ Data flow analysis failed: {e}")
        return {'error': str(e)}

def identify_current_execution_method():
    """Identify which execution method is currently being used"""
    print("\n🔍 Identifying Current Execution Method...")
    
    try:
        with open('scraper/workers/seo/page_analysis/page_analysis.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'get_seo_engine()' in content:
            if os.path.exists('scraper/workers/seo/page_analysis/rules/seo_rule_engine.py'):
                method = 'modular_engine_functional'
                print("  ✅ Using functional modular rule engine")
            else:
                method = 'modular_engine_broken'
                print("  ❌ References broken modular rule engine")
        elif 'def execute_rule(' in content:
            method = 'hardcoded_execute_rule'
            print("  ✅ Using hardcoded execute_rule function")
        elif 'for rule_id, rule_config in SEO_RULES.items():' in content:
            method = 'inline_rule_loop'
            print("  ✅ Using inline rule execution loop")
        else:
            method = 'unknown'
            print("  ❌ Unable to determine execution method")
        
        return {
            'method': method,
            'has_modular_reference': 'get_seo_engine()' in content,
            'has_hardcoded_execute_rule': 'def execute_rule(' in content,
            'has_inline_loop': 'for rule_id, rule_config in SEO_RULES.items():' in content
        }
        
    except Exception as e:
        print(f"  ❌ Execution method identification failed: {e}")
        return {'error': str(e)}

def test_real_data_impact():
    """Test the impact of current issues on real data"""
    print("\n🔍 Testing Real Data Impact...")
    
    try:
        from pymongo import MongoClient
        from bson.objectid import ObjectId
        
        MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/odito_dev')
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[MONGO_URI.split('/')[-1] if '/' in MONGO_URI else 'odito_dev']
        
        # Find a project with data
        project_pipeline = [
            {"$group": {"_id": "$projectId", "count": {"$sum": 1}}},
            {"$match": {"count": {"$gte": 3}}},
            {"$limit": 1}
        ]
        
        project_result = list(db.seo_page_data.aggregate(project_pipeline))
        
        if not project_result:
            print("  ⚠️  No project with sufficient data found")
            return {'status': 'no_project_found'}
        
        project_id = project_result[0]['_id']
        pages = list(db.seo_page_data.find({"projectId": project_id}).limit(3))
        
        print(f"  ✅ Found project with {len(pages)} pages for testing")
        
        # Test normalization function
        sys.path.append('scraper/workers/seo/page_analysis')
        from page_analysis import normalize_page_data
        
        normalization_results = []
        for page in pages:
            try:
                normalized = normalize_page_data(page)
                normalization_results.append({
                    'url': page.get('url'),
                    'normalization_success': True,
                    'normalized_keys': list(normalized.keys()),
                    'has_title': bool(normalized.get('title')),
                    'has_content': bool(normalized.get('content_text')),
                    'has_headings': len(normalized.get('headings', [])) > 0
                })
            except Exception as e:
                normalization_results.append({
                    'url': page.get('url'),
                    'normalization_success': False,
                    'error': str(e)
                })
        
        successful_normalizations = sum(1 for r in normalization_results if r.get('normalization_success', False))
        
        print(f"  ✅ Normalization success: {successful_normalizations}/{len(pages)}")
        
        return {
            'project_found': True,
            'pages_tested': len(pages),
            'normalization_success_rate': (successful_normalizations / len(pages)) * 100,
            'normalization_results': normalization_results
        }
        
    except Exception as e:
        print(f"  ❌ Real data impact test failed: {e}")
        return {'error': str(e)}

def main():
    """Run comprehensive current state analysis"""
    print("=" * 60)
    print("SEO PAGE_ANALYSIS CURRENT STATE VERIFICATION")
    print("=" * 60)
    
    results = {
        'timestamp': datetime.now().isoformat(),
        'analysis': {}
    }
    
    # Run all analyses
    results['analysis']['database_connectivity'] = test_database_connectivity()
    results['analysis']['code_structure'] = analyze_page_analysis_code()
    results['analysis']['seo_rules_metadata'] = check_seo_rules_metadata()
    results['analysis']['modular_engine_exists'] = check_modular_engine_exists()
    results['analysis']['data_flow_pattern'] = test_data_flow_with_actual_code()
    results['analysis']['execution_method'] = identify_current_execution_method()
    results['analysis']['real_data_impact'] = test_real_data_impact()
    
    # Generate comprehensive summary
    print("\n" + "=" * 60)
    print("COMPREHENSIVE ANALYSIS SUMMARY")
    print("=" * 60)
    
    # Critical issues
    critical_issues = []
    
    # Check for broken modular engine reference
    if results['analysis']['execution_method'].get('method') == 'modular_engine_broken':
        critical_issues.append("❌ BROKEN: Code references non-existent modular rule engine")
    
    # Check data flow
    data_flow = results['analysis']['data_flow_pattern']
    if data_flow.get('pass_rate', 0) < 80:
        critical_issues.append("❌ RISKY: Data flow pattern has issues")
    
    # Check database connectivity
    if 'error' in results['analysis']['database_connectivity']:
        critical_issues.append("❌ BROKEN: Database connectivity failed")
    
    # Check normalization
    real_data = results['analysis']['real_data_impact']
    if real_data.get('normalization_success_rate', 0) < 80:
        critical_issues.append("❌ RISKY: Data normalization has issues")
    
    if critical_issues:
        print("🚨 CRITICAL ISSUES FOUND:")
        for issue in critical_issues:
            print(f"  {issue}")
    else:
        print("✅ No critical issues found")
    
    # Overall assessment
    print(f"\n📊 Current State Assessment:")
    print(f"  Database: {'✅ Connected' if 'error' not in results['analysis']['database_connectivity'] else '❌ Failed'}")
    print(f"  Code Structure: {'✅ Intact' if 'error' not in results['analysis']['code_structure'] else '❌ Broken'}")
    print(f"  SEO Rules: {'✅ Loaded' if 'error' not in results['analysis']['seo_rules_metadata'] else '❌ Failed'}")
    print(f"  Execution Method: {results['analysis']['execution_method'].get('method', 'unknown')}")
    
    # Final verdict
    if critical_issues:
        if any("BROKEN" in issue for issue in critical_issues):
            verdict = "RISKY - BROKEN COMPONENTS"
        else:
            verdict = "SAFE WITH FIXES - Minor Issues"
    else:
        verdict = "SAFE - Functioning Normally"
    
    print(f"\n🎯 FINAL VERDICT: {verdict}")
    print("=" * 60)
    
    results['critical_issues'] = critical_issues
    results['final_verdict'] = verdict
    
    # Save results
    with open('current_state_analysis.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nDetailed analysis saved to: current_state_analysis.json")
    return results

if __name__ == "__main__":
    main()
