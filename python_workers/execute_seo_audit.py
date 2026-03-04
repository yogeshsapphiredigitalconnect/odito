"""
SEO Rule Audit Execution

Executes comprehensive audit of SEO rule analysis results.
This script integrates with the existing page analysis pipeline.
"""

import json
import sys
import os
from datetime import datetime
from typing import Dict, List, Any

# Add the scraper path to import modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraper'))

from seo_rule_auditor import SEORuleAuditor
from scraper.workers.seo.page_analysis.rules.seo_rule_engine import get_seo_engine
from scraper.workers.seo.page_analysis.page_analysis import normalize_page_data

def audit_page_analysis_result(page_data: dict, job_id: str, project_id: str, url: str) -> dict:
    """
    Perform comprehensive audit of page analysis results
    
    Args:
        page_data: Raw page data from scraper
        job_id: Job ID for analysis
        project_id: Project ID for analysis  
        url: Page URL being analyzed
        
    Returns:
        Complete audit report with validation results
    """
    print(f"[AUDIT] Starting comprehensive SEO rule audit for: {url}")
    
    # Initialize auditor
    auditor = SEORuleAuditor()
    
    # Get normalized page data
    try:
        normalized_data = normalize_page_data(page_data)
        print(f"[AUDIT] Normalized page data with {len(normalized_data)} fields")
    except Exception as e:
        return {
            "error": f"Failed to normalize page data: {str(e)}",
            "page_url": url,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    # Get SEO rule engine
    try:
        engine = get_seo_engine()
        all_rules = engine.registry.get_all_rules()
        print(f"[AUDIT] Loaded {len(all_rules)} SEO rules for audit")
    except Exception as e:
        return {
            "error": f"Failed to load SEO rule engine: {str(e)}",
            "page_url": url,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    # Execute each rule individually for audit
    execution_results = []
    exceptions = []
    
    print(f"[AUDIT] Executing individual rule analysis...")
    
    for i, rule in enumerate(all_rules):
        try:
            result = rule.evaluate(normalized_data, job_id, project_id, url)
            execution_results.append(result)
            exceptions.append(None)
            
            # Progress indicator
            if (i + 1) % 50 == 0:
                print(f"[AUDIT] Processed {i + 1}/{len(all_rules)} rules...")
                
        except Exception as e:
            execution_results.append(None)
            exceptions.append(e)
            print(f"[AUDIT] Rule {rule.rule_id} failed: {str(e)}")
    
    # Perform comprehensive audit
    audit_report = auditor.audit_page_analysis(all_rules, normalized_data, execution_results, exceptions)
    
    # Add page context
    audit_report["page_context"] = {
        "url": url,
        "job_id": job_id,
        "project_id": project_id,
        "title": page_data.get("title", ""),
        "word_count": page_data.get("content", {}).get("word_count", 0),
        "images_count": len(page_data.get("images", [])),
        "headings_count": len(page_data.get("content", {}).get("headings", {}))
    }
    
    print(f"[AUDIT] Audit complete. Summary:")
    print(f"  Total Rules: {audit_report['summary']['total_rules']}")
    print(f"  Passed: {audit_report['summary']['passed']}")
    print(f"  Failed: {audit_report['summary']['failed']}")
    print(f"  Skipped: {audit_report['summary']['skipped']}")
    print(f"  Silent Failures: {audit_report['summary']['silent_skips_detected']}")
    print(f"  Data Missing: {audit_report['summary']['data_missing_rules']}")
    
    return audit_report


def analyze_rule_patterns(audit_report: dict) -> dict:
    """
    Analyze patterns in rule execution to identify systemic issues
    
    Args:
        audit_report: Complete audit report
        
    Returns:
        Pattern analysis with recommendations
    """
    patterns = {
        "skip_patterns": {},
        "failure_patterns": {},
        "data_issues": {},
        "potential_bugs": [],
        "recommendations": []
    }
    
    # Analyze skip patterns
    for rule in audit_report["rules"]:
        if rule["status"] == "SKIPPED":
            skip_type = rule["skip_type"]
            if skip_type not in patterns["skip_patterns"]:
                patterns["skip_patterns"][skip_type] = []
            patterns["skip_patterns"][skip_type].append(rule["rule_name"])
            
            # Track missing data patterns
            if rule["skip_type"] == "b) Data missing skip":
                missing_fields = rule["execution_details"].get("missing_fields", [])
                for field in missing_fields:
                    if field not in patterns["data_issues"]:
                        patterns["data_issues"][field] = 0
                    patterns["data_issues"][field] += 1
    
    # Analyze failure patterns
    for rule in audit_report["rules"]:
        if rule["status"] == "FAILED":
            category = rule["category"]
            if category not in patterns["failure_patterns"]:
                patterns["failure_patterns"][category] = []
            patterns["failure_patterns"][category].append(rule["rule_name"])
    
    # Identify potential bugs
    for rule in audit_report["rules"]:
        if rule["possible_bug"]:
            patterns["potential_bugs"].append({
                "rule_name": rule["rule_name"],
                "reason": rule["reason"],
                "status": rule["status"]
            })
    
    # Generate recommendations
    if patterns["data_issues"]:
        most_missing = max(patterns["data_issues"].items(), key=lambda x: x[1])
        patterns["recommendations"].append(
            f"Fix data extraction for '{most_missing[0]}' - missing in {most_missing[1]} rules"
        )
    
    if patterns["potential_bugs"]:
        patterns["recommendations"].append(
            f"Review {len(patterns['potential_bugs'])} rules with potential logic bugs"
        )
    
    if patterns["skip_patterns"].get("d) Silent logic error"):
        patterns["recommendations"].append(
            "Fix rules with silent logic errors causing exceptions"
        )
    
    return patterns


def create_audit_summary_report(audit_report: dict, patterns: dict) -> dict:
    """
    Create executive summary of audit results
    
    Args:
        audit_report: Complete audit report
        patterns: Pattern analysis results
        
    Returns:
        Executive summary for stakeholders
    """
    summary = audit_report["summary"]
    
    # Calculate health metrics
    total_rules = summary["total_rules"]
    pass_rate = (summary["passed"] / total_rules * 100) if total_rules > 0 else 0
    issue_rate = (summary["failed"] / total_rules * 100) if total_rules > 0 else 0
    
    # Determine overall health
    if pass_rate >= 90:
        health_status = "Excellent"
    elif pass_rate >= 80:
        health_status = "Good"
    elif pass_rate >= 70:
        health_status = "Fair"
    else:
        health_status = "Poor"
    
    return {
        "executive_summary": {
            "overall_health": health_status,
            "pass_rate": round(pass_rate, 1),
            "issue_rate": round(issue_rate, 1),
            "rules_analyzed": total_rules,
            "critical_issues": len(patterns["potential_bugs"]),
            "data_quality_issues": len(patterns["data_issues"])
        },
        "key_findings": [
            f"{summary['passed']} rules passed ({pass_rate:.1f}%)",
            f"{summary['failed']} rules failed ({issue_rate:.1f}%)",
            f"{summary['skipped']} rules skipped due to missing data",
            f"{summary['silent_skips_detected']} silent failures detected"
        ],
        "priority_actions": patterns["recommendations"][:5],  # Top 5 recommendations
        "audit_metadata": {
            "timestamp": audit_report["audit_metadata"]["timestamp"],
            "page_url": audit_report["page_context"]["url"]
        }
    }


def run_comprehensive_audit(page_data: dict, job_id: str, project_id: str, url: str, 
                          output_file: str = None) -> dict:
    """
    Run complete SEO rule audit with pattern analysis
    
    Args:
        page_data: Raw page data from scraper
        job_id: Job ID for analysis
        project_id: Project ID for analysis
        url: Page URL being analyzed
        output_file: Optional file to save audit results
        
    Returns:
        Complete audit results with analysis
    """
    print("=" * 80)
    print("SEO RULE AUDIT EXECUTION")
    print("=" * 80)
    
    # Run primary audit
    audit_report = audit_page_analysis_result(page_data, job_id, project_id, url)
    
    if "error" in audit_report:
        print(f"[ERROR] Audit failed: {audit_report['error']}")
        return audit_report
    
    # Analyze patterns
    print("\n[ANALYSIS] Analyzing execution patterns...")
    patterns = analyze_rule_patterns(audit_report)
    
    # Create executive summary
    print("[ANALYSIS] Creating executive summary...")
    executive_summary = create_audit_summary_report(audit_report, patterns)
    
    # Combine results
    final_report = {
        "audit_report": audit_report,
        "pattern_analysis": patterns,
        "executive_summary": executive_summary
    }
    
    # Save to file if requested
    if output_file:
        try:
            with open(output_file, 'w') as f:
                json.dump(final_report, f, indent=2)
            print(f"[OUTPUT] Audit report saved to: {output_file}")
        except Exception as e:
            print(f"[ERROR] Failed to save report: {str(e)}")
    
    print("\n" + "=" * 80)
    print("AUDIT EXECUTION COMPLETE")
    print("=" * 80)
    
    return final_report


if __name__ == "__main__":
    # Example usage with sample data
    sample_page_data = {
        "url": "https://example.com/page",
        "title": "Example Page Title",
        "content": {
            "text": "This is sample content for testing.",
            "word_count": 150,
            "headings": {"h1": ["Main Heading"], "h2": ["Sub Heading"]}
        },
        "images": [
            {"src": "image1.jpg", "alt": "Sample image"},
            {"src": "image2.jpg", "alt": ""}
        ],
        "meta_tags": {
            "description": ["Sample meta description"]
        }
    }
    
    # Run audit
    report = run_comprehensive_audit(
        page_data=sample_page_data,
        job_id="test_job_001",
        project_id="test_project_001", 
        url="https://example.com/page",
        output_file="seo_audit_report.json"
    )
    
    print("\nSample audit completed. Check seo_audit_report.json for results.")
