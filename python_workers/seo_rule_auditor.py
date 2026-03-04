"""
SEO Rule Validation Auditor

Performs deep audit of rule execution results to detect:
- Silent failures
- Missing data issues  
- Incorrect pass/fail determinations
- Rule logic bugs
"""

import json
from typing import Dict, List, Any, Tuple
from datetime import datetime

class SEORuleAuditor:
    """Audits SEO rule execution for validation and bug detection"""
    
    def __init__(self):
        self.rules_executed = []
        self.silent_failures = []
        self.data_missing_rules = []
        
    def audit_rule_execution(self, rule, normalized_data: dict, execution_result: list, exception: Exception = None) -> dict:
        """
        Audit individual rule execution
        
        Args:
            rule: The rule object that was executed
            normalized_data: Data passed to rule.evaluate()
            execution_result: Return value from rule.evaluate()
            exception: Exception if rule failed during execution
            
        Returns:
            Audit result dict with detailed analysis
        """
        audit_result = {
            "rule_name": rule.rule_id,
            "rule_no": rule.rule_no,
            "category": rule.category,
            "severity": rule.severity,
            "status": "",
            "reason": "",
            "data_required": self._extract_required_data(rule),
            "data_found": True,
            "skip_type": None,
            "possible_bug": False,
            "execution_details": {}
        }
        
        # Check for execution exception
        if exception:
            audit_result["status"] = "SKIPPED"
            audit_result["reason"] = f"Rule execution failed: {str(exception)}"
            audit_result["skip_type"] = "d) Silent logic error"
            audit_result["possible_bug"] = True
            audit_result["data_found"] = False
            return audit_result
            
        # Analyze execution result
        if execution_result is None:
            audit_result["status"] = "SKIPPED"
            audit_result["reason"] = "Rule returned None instead of list"
            audit_result["skip_type"] = "d) Silent logic error"
            audit_result["possible_bug"] = True
            return audit_result
            
        if isinstance(execution_result, list):
            if len(execution_result) > 0:
                # Rule FAILED
                audit_result["status"] = "FAILED"
                audit_result["reason"] = f"Generated {len(execution_result)} issue(s)"
                audit_result["execution_details"] = {
                    "issues_count": len(execution_result),
                    "issues": execution_result
                }
                
                # Analyze failure conditions
                self._analyze_failure_conditions(rule, normalized_data, execution_result, audit_result)
                
            else:
                # Rule PASSED or SKIPPED due to missing data
                analysis = self._analyze_pass_result(rule, normalized_data)
                audit_result.update(analysis)
                
        else:
            audit_result["status"] = "SKIPPED"
            audit_result["reason"] = f"Rule returned unexpected type: {type(execution_result)}"
            audit_result["skip_type"] = "d) Silent logic error"
            audit_result["possible_bug"] = True
            
        return audit_result
    
    def _extract_required_data(self, rule) -> List[str]:
        """Extract required data fields from rule logic"""
        required_fields = []
        
        # Common field patterns based on rule category
        category_field_mapping = {
            "Title Tag": ["title"],
            "Meta Description": ["meta_description"],
            "Headings": ["headings"],
            "Images": ["images"],
            "Links": ["internal_links", "external_links"],
            "Content": ["content_text", "word_count"],
            "Technical": ["canonical", "viewport", "doctype"],
            "Social": ["og_tags", "social"],
            "Schema": ["structured_data"],
            "Performance": ["performance"],
            "Accessibility": ["headless"],
            "International": ["hreflangs", "html_lang"],
            "Crawlability": ["meta_tags"],
            "Tracking": ["tracking", "scripts"]
        }
        
        return category_field_mapping.get(rule.category, [])
    
    def _analyze_failure_conditions(self, rule, normalized_data: dict, execution_result: list, audit_result: dict):
        """Analyze why a rule failed"""
        if not execution_result:
            return
            
        # Get first issue for analysis
        issue = execution_result[0]
        detected_value = issue.get("detected_value")
        expected_value = issue.get("expected_value")
        data_key = issue.get("data_key")
        
        audit_result["execution_details"]["failure_analysis"] = {
            "data_key": data_key,
            "detected_value": detected_value,
            "expected_value": expected_value,
            "actual_data": normalized_data.get(data_key) if data_key else None
        }
        
        # Check for potential bugs in failure logic
        if data_key and data_key not in normalized_data:
            audit_result["possible_bug"] = True
            audit_result["reason"] += " [BUG: Failed on missing data key]"
            
    def _analyze_pass_result(self, rule, normalized_data: dict) -> dict:
        """Analyze if pass is legitimate or due to missing data"""
        required_fields = self._extract_required_data(rule)
        missing_fields = []
        present_fields = []
        
        for field in required_fields:
            if field in normalized_data:
                value = normalized_data[field]
                if value is None or (isinstance(value, (str, list)) and len(value) == 0):
                    missing_fields.append(f"{field} (empty)")
                else:
                    present_fields.append(field)
            else:
                missing_fields.append(f"{field} (missing)")
        
        result = {
            "execution_details": {
                "required_fields": required_fields,
                "present_fields": present_fields,
                "missing_fields": missing_fields
            }
        }
        
        if missing_fields:
            # This might be a silent skip
            result["status"] = "SKIPPED"
            result["reason"] = f"Required data missing: {', '.join(missing_fields)}"
            result["data_found"] = False
            
            # Determine skip type
            if any("missing" in field for field in missing_fields):
                result["skip_type"] = "b) Data missing skip"
            else:
                result["skip_type"] = "a) Conditional skip"
                
            # Check if this could be a bug
            rule_id = rule.rule_id
            if any(keyword in rule_id.lower() for keyword in ["present", "exists", "missing"]):
                # Rule specifically checks for presence/absence
                if all("empty" in field for field in missing_fields):
                    result["possible_bug"] = True
                    result["reason"] += " [BUG: Presence rule treated as skip due to empty data]"
        else:
            # Legitimate pass
            result["status"] = "PASSED"
            result["reason"] = "All conditions met"
            result["data_found"] = True
            
        return result
    
    def audit_page_analysis(self, rules: List, normalized_data: dict, execution_results: List, exceptions: List) -> dict:
        """
        Audit complete page analysis
        
        Args:
            rules: List of all rule objects
            normalized_data: Page data that was analyzed
            execution_results: List of results from each rule.evaluate()
            exceptions: List of exceptions (None for successful executions)
            
        Returns:
            Complete audit report
        """
        rule_audits = []
        
        for i, rule in enumerate(rules):
            exception = exceptions[i] if i < len(exceptions) else None
            result = execution_results[i] if i < len(execution_results) else None
            
            audit = self.audit_rule_execution(rule, normalized_data, result, exception)
            rule_audits.append(audit)
            
            # Track issues
            if audit["skip_type"] == "d) Silent logic error":
                self.silent_failures.append(audit)
            if not audit["data_found"]:
                self.data_missing_rules.append(audit)
        
        # Generate summary
        summary = self._generate_summary(rule_audits)
        
        # Cross-check totals
        cross_check = self._cross_check_totals(summary, rule_audits)
        
        return {
            "summary": {**summary, **cross_check},
            "rules": rule_audits,
            "audit_metadata": {
                "timestamp": datetime.utcnow().isoformat(),
                "total_rules_analyzed": len(rules),
                "data_keys_available": list(normalized_data.keys())
            }
        }
    
    def _generate_summary(self, rule_audits: List[dict]) -> dict:
        """Generate summary statistics"""
        total = len(rule_audits)
        passed = sum(1 for r in rule_audits if r["status"] == "PASSED")
        failed = sum(1 for r in rule_audits if r["status"] == "FAILED")
        skipped = sum(1 for r in rule_audits if r["status"] == "SKIPPED")
        evaluated = passed + failed + skipped
        
        return {
            "total_rules": total,
            "evaluated": evaluated,
            "passed": passed,
            "failed": failed,
            "skipped": skipped,
            "silent_skips_detected": len(self.silent_failures),
            "data_missing_rules": len(self.data_missing_rules)
        }
    
    def _cross_check_totals(self, summary: dict, rule_audits: List[dict]) -> dict:
        """Cross-check totals for consistency"""
        expected_total = summary["passed"] + summary["failed"] + summary["skipped"]
        actual_total = summary["total_rules"]
        
        # Category breakdown
        category_breakdown = {}
        for audit in rule_audits:
            cat = audit["category"]
            if cat not in category_breakdown:
                category_breakdown[cat] = {"passed": 0, "failed": 0, "skipped": 0}
            category_breakdown[cat][audit["status"].lower()] += 1
        
        return {
            "cross_check": {
                "total_matches": expected_total == actual_total,
                "expected_total": expected_total,
                "actual_total": actual_total,
                "category_breakdown": category_breakdown
            }
        }


def create_mock_audit_report() -> dict:
    """Create a sample audit report structure for demonstration"""
    return {
        "summary": {
            "total_rules": 188,
            "evaluated": 188,
            "passed": 142,
            "failed": 23,
            "skipped": 23,
            "silent_skips_detected": 5,
            "data_missing_rules": 18
        },
        "rules": [
            {
                "rule_name": "TITLE_EMPTY",
                "status": "PASSED",
                "reason": "All conditions met",
                "data_required": ["title"],
                "data_found": True,
                "skip_type": None,
                "possible_bug": False
            },
            {
                "rule_name": "IMAGES_ALT_MEANINGFUL",
                "status": "SKIPPED",
                "reason": "Required data missing: images (missing)",
                "data_required": ["images"],
                "data_found": False,
                "skip_type": "b) Data missing skip",
                "possible_bug": False
            },
            {
                "rule_name": "LCP_GOOD",
                "status": "FAILED",
                "reason": "Generated 1 issue(s)",
                "data_required": ["performance"],
                "data_found": True,
                "skip_type": None,
                "possible_bug": False,
                "execution_details": {
                    "issues_count": 1,
                    "failure_analysis": {
                        "data_key": "largest_contentful_paint",
                        "detected_value": 4.2,
                        "expected_value": "<= 2.5",
                        "actual_data": {"largest_contentful_paint": 4.2}
                    }
                }
            }
        ]
    }


if __name__ == "__main__":
    # Example usage
    auditor = SEORuleAuditor()
    sample_report = create_mock_audit_report()
    print(json.dumps(sample_report, indent=2))
