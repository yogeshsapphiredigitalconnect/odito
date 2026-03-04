#!/usr/bin/env python3
"""
Fixed analysis script that handles the correct return format
"""

import os
import sys
import json
from bson.objectid import ObjectId
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db import seo_page_data, seo_page_issues, seo_page_scores, db
    from scraper.workers.seo.page_analysis.page_analysis import analyze_page_seo
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)

def run_fixed_analysis():
    """Run analysis on the test URL with correct format handling"""
    
    print("🔬 RUNNING FIXED PAGE ANALYSIS")
    print("=" * 60)
    
    # Test URL
    test_url = "https://www.sapphiredigitalconnect.com/pay-per-click-shopping-ads"
    
    print(f"🎯 Target URL: {test_url}")
    
    # Find the page data
    page = seo_page_data.find_one({"url": test_url})
    if not page:
        print(f"❌ Page not found in database")
        return
    
    # Extract project info
    project_id = page.get("projectId")
    job_id = page.get("seo_jobId", ObjectId())
    
    print(f"📋 Project ID: {project_id}")
    
    # Clear previous issues for this URL to get clean results
    seo_page_issues.delete_many({
        "projectId": project_id,
        "page_url": test_url
    })
    print(f"🧹 Cleared previous issues for this URL")
    
    # Run the analysis
    print(f"\n🚀 Running page analysis...")
    start_time = datetime.utcnow()
    
    try:
        result = analyze_page_seo(
            page, 
            str(job_id), 
            str(project_id),
            performance_lookup={},
            headless_lookup={},
            crawl_graph_lookup={},
            technical_report={}
        )
        
        end_time = datetime.utcnow()
        duration = (end_time - start_time).total_seconds()
        
        # Extract issues and summary from the result dict
        issues = result.get('issues', [])
        summary = result.get('summary', {})
        
        print(f"✅ Analysis completed in {duration:.2f} seconds")
        print(f"📊 Found {len(issues)} issues")
        
        # Group issues by rule for analysis
        issues_by_rule = {}
        for issue in issues:
            rule_id = issue.get('rule_id', 'UNKNOWN')
            if rule_id not in issues_by_rule:
                issues_by_rule[rule_id] = []
            issues_by_rule[rule_id].append(issue)
        
        # Show specific rules you asked about
        target_rules = [
            'WORD_COUNT_MIN',
            'H1_CONTAINS_KEYWORD', 
            'H1_LENGTH',
            'CONTENT_CONTAINS_KEYWORD',
            'VIEWPORT_PRESENT',
            'TITLE_VOICE_SEARCH',
            'META_DESC_MISSING_KEYWORD'
        ]
        
        print(f"\n🎯 TARGET RULE ANALYSIS:")
        print("-" * 40)
        
        for rule_id in target_rules:
            rule_issues = issues_by_rule.get(rule_id, [])
            if rule_issues:
                issue = rule_issues[0]  # Show first issue
                print(f"✅ {rule_id}: FIRED")
                print(f"   Message: {issue.get('issue_message', 'N/A')}")
                print(f"   Detected: {issue.get('detected_value', 'N/A')}")
                print(f"   Expected: {issue.get('expected_value', 'N/A')}")
            else:
                print(f"❌ {rule_id}: NOT FIRED")
        
        # Show keyword-related rules specifically
        keyword_rules = [rule for rule in issues_by_rule.keys() if 'keyword' in rule.lower()]
        if keyword_rules:
            print(f"\n🔍 KEYWORD-RELATED RULES:")
            print("-" * 40)
            for rule_id in keyword_rules:
                rule_issues = issues_by_rule.get(rule_id, [])
                issue = rule_issues[0] if rule_issues else None
                if issue:
                    print(f"   • {rule_id}: {issue.get('issue_message', 'N/A')}")
        
        # Show all issues by category
        print(f"\n📋 ALL ISSUES BY CATEGORY:")
        print("-" * 40)
        
        categories = {}
        for issue in issues:
            category = issue.get('category', 'Unknown')
            if category not in categories:
                categories[category] = []
            categories[category].append(issue)
        
        for category, cat_issues in sorted(categories.items()):
            print(f"\n📁 {category} ({len(cat_issues)} issues):")
            for issue in cat_issues:
                rule_id = issue.get('rule_id', 'UNKNOWN')
                message = issue.get('issue_message', 'No message')
                print(f"   • {rule_id}: {message[:60]}...")
        
        # Calculate score based on summary
        total_rules = summary.get('total_rules', 185)
        failed_count = summary.get('failed_count', len(issues))
        passed_count = summary.get('passed_count', 0)
        
        # Simple scoring formula based on pass rate
        pass_rate = (passed_count / total_rules) * 100 if total_rules > 0 else 0
        
        print(f"\n📈 DETAILED SUMMARY:")
        print(f"   Total Rules: {total_rules}")
        print(f"   Passed: {passed_count}")
        print(f"   Failed: {failed_count}")
        print(f"   Pass Rate: {pass_rate:.1f}%")
        print(f"   Website Score: {pass_rate:.1f}/100")
        
        # Show category breakdown from summary
        category_breakdown = summary.get('category_breakdown', {})
        if category_breakdown:
            print(f"\n📊 CATEGORY BREAKDOWN:")
            for category, stats in category_breakdown.items():
                failed = stats.get('failed', 0)
                passed = stats.get('passed', 0)
                total = failed + passed
                pass_rate = (passed / total * 100) if total > 0 else 0
                print(f"   • {category}: {passed}/{total} ({pass_rate:.1f}% pass)")
        
        # Store results for comparison
        results = {
            "url": test_url,
            "timestamp": datetime.utcnow().isoformat(),
            "total_issues": failed_count,
            "total_rules": total_rules,
            "passed_count": passed_count,
            "score": pass_rate,
            "issues_by_rule": {rule: len(issues) for rule, issues in issues_by_rule.items()},
            "target_rules_status": {rule_id: len(issues_by_rule.get(rule_id, [])) > 0 for rule_id in target_rules},
            "summary": summary
        }
        
        with open("analysis_results_after_fix.json", "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\n💾 Results saved to: analysis_results_after_fix.json")
        
        # Compare with previous results if available
        print(f"\n🔄 COMPARISON WITH PREVIOUS RUN:")
        print("-" * 40)
        print(f"   Previous issues: 32 (from your mention)")
        print(f"   Current issues: {failed_count}")
        print(f"   Change: {failed_count - 32:+d} issues")
        
        if failed_count != 32:
            print(f"   📊 The normalization fix has changed the issue count!")
        else:
            print(f"   📊 Issue count remains the same")
        
        return results
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    run_fixed_analysis()
