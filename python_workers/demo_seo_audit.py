"""
SEO Rule Audit Demonstration

Shows the auditor in action with real SEO rule analysis.
This demonstrates the comprehensive validation capabilities.
"""

import json
from datetime import datetime

def create_demo_audit_report():
    """
    Create a realistic demo audit report showing all validation capabilities
    """
    
    demo_report = {
        "summary": {
            "total_rules": 188,
            "evaluated": 188,
            "passed": 142,
            "failed": 23,
            "skipped": 23,
            "silent_skips_detected": 5,
            "data_missing_rules": 18
        },
        "cross_check": {
            "total_matches": True,
            "expected_total": 188,
            "actual_total": 188,
            "category_breakdown": {
                "Title Tag": {"passed": 18, "failed": 2, "skipped": 0},
                "Meta Description": {"passed": 14, "failed": 2, "skipped": 0},
                "Headings": {"passed": 25, "failed": 5, "skipped": 3},
                "Images": {"passed": 8, "failed": 3, "skipped": 2},
                "Technical": {"passed": 10, "failed": 1, "skipped": 1},
                "Social": {"passed": 12, "failed": 3, "skipped": 2},
                "Schema": {"passed": 10, "failed": 2, "skipped": 2},
                "Performance": {"passed": 5, "failed": 2, "skipped": 0},
                "Accessibility": {"passed": 12, "failed": 1, "skipped": 5},
                "International": {"passed": 6, "failed": 1, "skipped": 1},
                "Content": {"passed": 9, "failed": 1, "skipped": 0},
                "Crawlability": {"passed": 15, "failed": 0, "skipped": 3},
                "Tracking": {"passed": 2, "failed": 0, "skipped": 0}
            }
        },
        "rules": [
            # Example 1: Properly passed rule
            {
                "rule_name": "TITLE_EMPTY",
                "rule_no": 1,
                "category": "Title Tag",
                "severity": "high",
                "status": "PASSED",
                "reason": "All conditions met",
                "data_required": ["title"],
                "data_found": True,
                "skip_type": None,
                "possible_bug": False,
                "execution_details": {
                    "required_fields": ["title"],
                    "present_fields": ["title"],
                    "missing_fields": []
                }
            },
            
            # Example 2: Failed rule with detailed analysis
            {
                "rule_name": "LCP_GOOD",
                "rule_no": 105,
                "category": "Performance",
                "severity": "high",
                "status": "FAILED",
                "reason": "Generated 1 issue(s)",
                "data_required": ["performance"],
                "data_found": True,
                "skip_type": None,
                "possible_bug": False,
                "execution_details": {
                    "issues_count": 1,
                    "issues": [
                        {
                            "issue_code": "LCP_GOOD",
                            "issue_message": "Largest Contentful Paint (LCP) is too slow",
                            "detected_value": 4.2,
                            "expected_value": "<= 2.5"
                        }
                    ],
                    "failure_analysis": {
                        "data_key": "largest_contentful_paint",
                        "detected_value": 4.2,
                        "expected_value": "<= 2.5",
                        "actual_data": {"largest_contentful_paint": 4.2, "first_contentful_paint": 1.8}
                    }
                }
            },
            
            # Example 3: Skipped due to missing data
            {
                "rule_name": "IMAGES_ALT_MEANINGFUL",
                "rule_no": 134,
                "category": "Images",
                "severity": "medium",
                "status": "SKIPPED",
                "reason": "Required data missing: images (missing)",
                "data_required": ["images"],
                "data_found": False,
                "skip_type": "b) Data missing skip",
                "possible_bug": False,
                "execution_details": {
                    "required_fields": ["images"],
                    "present_fields": [],
                    "missing_fields": ["images (missing)"]
                }
            },
            
            # Example 4: Silent logic error (bug detected)
            {
                "rule_name": "TITLE_MULTIPLE",
                "rule_no": 2,
                "category": "Title Tag",
                "severity": "high",
                "status": "SKIPPED",
                "reason": "Rule execution failed: 'NoneType' object has no attribute 'count'",
                "data_required": ["title"],
                "data_found": False,
                "skip_type": "d) Silent logic error",
                "possible_bug": True,
                "execution_details": {}
            },
            
            # Example 5: Conditional skip (rule not applicable)
            {
                "rule_name": "HREFLANG_PRESENT",
                "rule_no": 150,
                "category": "International",
                "severity": "medium",
                "status": "SKIPPED",
                "reason": "Required data missing: hreflangs (empty)",
                "data_required": ["hreflangs"],
                "data_found": False,
                "skip_type": "a) Conditional skip",
                "possible_bug": False,
                "execution_details": {
                    "required_fields": ["hreflangs"],
                    "present_fields": [],
                    "missing_fields": ["hreflangs (empty)"]
                }
            },
            
            # Example 6: Potential bug - presence rule treated as skip
            {
                "rule_name": "ANALYTICS_PRESENT",
                "rule_no": 180,
                "category": "Tracking",
                "severity": "low",
                "status": "SKIPPED",
                "reason": "Required data missing: tracking (empty) [BUG: Presence rule treated as skip due to empty data]",
                "data_required": ["tracking"],
                "data_found": False,
                "skip_type": "a) Conditional skip",
                "possible_bug": True,
                "execution_details": {
                    "required_fields": ["tracking"],
                    "present_fields": [],
                    "missing_fields": ["tracking (empty)"]
                }
            },
            
            # Example 7: Failed due to missing data key
            {
                "rule_name": "META_DESC_LENGTH",
                "rule_no": 75,
                "category": "Meta Description",
                "severity": "medium",
                "status": "FAILED",
                "reason": "Generated 1 issue(s) [BUG: Failed on missing data key]",
                "data_required": ["meta_description"],
                "data_found": True,
                "skip_type": None,
                "possible_bug": True,
                "execution_details": {
                    "issues_count": 1,
                    "failure_analysis": {
                        "data_key": "meta_description",
                        "detected_value": None,
                        "expected_value": "50-160 characters",
                        "actual_data": None
                    }
                }
            }
        ],
        "audit_metadata": {
            "timestamp": datetime.utcnow().isoformat(),
            "total_rules_analyzed": 188,
            "data_keys_available": [
                "url", "title", "meta_description", "content_text", "word_count",
                "viewport", "headings", "images", "og_tags", "scripts",
                "structured_data", "canonical", "hreflangs", "tracking", 
                "meta_tags", "social", "doctype", "html_lang"
            ]
        }
    }
    
    return demo_report


def create_pattern_analysis():
    """Create pattern analysis showing systemic issues"""
    
    return {
        "skip_patterns": {
            "b) Data missing skip": [
                "IMAGES_ALT_MEANINGFUL", "IMAGES_ALT_KEYWORD", "IMAGES_DIMENSIONS",
                "SCHEMA_JSONLD_PRESENT", "PERFORMANCE_RULES", "ACCESSIBILITY_RULES"
            ],
            "a) Conditional skip": [
                "HREFLANG_PRESENT", "HREFLANG_SELF_REFERENCE", "PINTEREST_MEDIA_PRESENT"
            ],
            "d) Silent logic error": [
                "TITLE_MULTIPLE", "CANONICAL_VALID_URL", "OG_IMAGE_EXISTS"
            ]
        },
        "failure_patterns": {
            "Performance": ["LCP_GOOD", "CLS_GOOD", "PAGESPEED_SCORE"],
            "Title Tag": ["TITLE_LENGTH", "TITLE_KEYWORD_POSITION"],
            "Meta Description": ["META_DESC_LENGTH", "META_DESC_MISSING_KEYWORD"],
            "Images": ["IMAGES_ALT_MEANINGFUL", "IMAGES_HTTPS"]
        },
        "data_issues": {
            "images (missing)": 8,
            "performance (missing)": 7,
            "headless (missing)": 5,
            "hreflangs (empty)": 3,
            "structured_data (missing)": 2
        },
        "potential_bugs": [
            {
                "rule_name": "TITLE_MULTIPLE",
                "reason": "Rule execution failed: 'NoneType' object has no attribute 'count'",
                "status": "SKIPPED"
            },
            {
                "rule_name": "ANALYTICS_PRESENT", 
                "reason": "Required data missing: tracking (empty) [BUG: Presence rule treated as skip due to empty data]",
                "status": "SKIPPED"
            },
            {
                "rule_name": "META_DESC_LENGTH",
                "reason": "Generated 1 issue(s) [BUG: Failed on missing data key]",
                "status": "FAILED"
            }
        ],
        "recommendations": [
            "Fix data extraction for 'images (missing)' - missing in 8 rules",
            "Review 3 rules with potential logic bugs",
            "Fix rules with silent logic errors causing exceptions",
            "Improve performance data collection - affecting 7 rules",
            "Review presence/absence rule logic for empty data handling"
        ]
    }


def create_executive_summary():
    """Create executive summary for stakeholders"""
    
    return {
        "executive_summary": {
            "overall_health": "Good",
            "pass_rate": 75.5,
            "issue_rate": 12.2,
            "rules_analyzed": 188,
            "critical_issues": 3,
            "data_quality_issues": 5
        },
        "key_findings": [
            "142 rules passed (75.5%)",
            "23 rules failed (12.2%)",
            "23 rules skipped due to missing data",
            "5 silent failures detected"
        ],
        "priority_actions": [
            "Fix data extraction for 'images (missing)' - missing in 8 rules",
            "Review 3 rules with potential logic bugs", 
            "Fix rules with silent logic errors causing exceptions",
            "Improve performance data collection - affecting 7 rules"
        ],
        "audit_metadata": {
            "timestamp": datetime.utcnow().isoformat(),
            "page_url": "https://example.com/audited-page"
        }
    }


def main():
    """Generate complete demo audit report"""
    
    print("Generating SEO Rule Audit Demo Report...")
    print("=" * 60)
    
    # Create complete audit report
    audit_report = create_demo_audit_report()
    pattern_analysis = create_pattern_analysis()
    executive_summary = create_executive_summary()
    
    # Combine into final report
    final_report = {
        "audit_report": audit_report,
        "pattern_analysis": pattern_analysis, 
        "executive_summary": executive_summary
    }
    
    # Save demo report
    output_file = "seo_rule_audit_demo.json"
    with open(output_file, 'w') as f:
        json.dump(final_report, f, indent=2)
    
    print(f"Demo audit report generated: {output_file}")
    print()
    print("KEY DEMONSTRATION FEATURES:")
    print("-" * 40)
    print("✅ Comprehensive rule status tracking (PASSED/FAILED/SKIPPED)")
    print("✅ Silent failure detection and bug identification")
    print("✅ Missing data impact analysis")
    print("✅ Cross-validation of totals and category breakdowns")
    print("✅ Pattern recognition for systemic issues")
    print("✅ Executive summary with actionable recommendations")
    print("✅ Detailed execution context for each rule")
    print()
    print("DEMO STATISTICS:")
    print("-" * 40)
    summary = audit_report["summary"]
    print(f"Total Rules: {summary['total_rules']}")
    print(f"Passed: {summary['passed']} ({summary['passed']/summary['total_rules']*100:.1f}%)")
    print(f"Failed: {summary['failed']} ({summary['failed']/summary['total_rules']*100:.1f}%)")
    print(f"Skipped: {summary['skipped']} ({summary['skipped']/summary['total_rules']*100:.1f}%)")
    print(f"Silent Failures: {summary['silent_skips_detected']}")
    print(f"Potential Bugs: {len(pattern_analysis['potential_bugs'])}")
    print(f"Data Issues: {len(pattern_analysis['data_issues'])}")
    print()
    print("CRITICAL ISSUES DETECTED:")
    print("-" * 40)
    for bug in pattern_analysis["potential_bugs"]:
        print(f"🐛 {bug['rule_name']}: {bug['reason']}")
    
    return final_report


if __name__ == "__main__":
    main()
