#!/usr/bin/env python3
"""
Run page analysis on the specific test URL to compare results before/after the fix
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

def run_test_analysis():
    """Run analysis on the test URL and show detailed results"""
    
    print("🔬 RUNNING PAGE ANALYSIS ON TEST URL")
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
    print(f"📋 Job ID: {job_id}")
    
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
        issues = analyze_page_seo(
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
        
        # Calculate score (simple scoring: fewer issues = better)
        total_issues = len(issues)
        high_severity = sum(1 for i in issues if i.get('severity') == 'high')
        medium_severity = sum(1 for i in issues if i.get('severity') == 'medium')
        low_severity = sum(1 for i in issues if i.get('severity') == 'low')
        
        # Simple scoring formula
        score = max(0, 100 - (high_severity * 5) - (medium_severity * 2) - (low_severity * 1))
        
        print(f"\n📈 SUMMARY:")
        print(f"   Total Issues: {total_issues}")
        print(f"   High Severity: {high_severity}")
        print(f"   Medium Severity: {medium_severity}")
        print(f"   Low Severity: {low_severity}")
        print(f"   Estimated Score: {score:.1f}/100")
        
        # Store results for comparison
        results = {
            "url": test_url,
            "timestamp": datetime.utcnow().isoformat(),
            "total_issues": total_issues,
            "high_severity": high_severity,
            "medium_severity": medium_severity,
            "low_severity": low_severity,
            "score": score,
            "issues_by_rule": {rule: len(issues) for rule, issues in issues_by_rule.items()},
            "target_rules_status": {rule_id: len(issues_by_rule.get(rule_id, [])) > 0 for rule_id in target_rules}
        }
        
        with open("analysis_results_after_fix.json", "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\n💾 Results saved to: analysis_results_after_fix.json")
        
        return results
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    run_test_analysis()
