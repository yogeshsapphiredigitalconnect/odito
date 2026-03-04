"""
Strict SEO Rule Validation Debug Engine

Audits rule execution integrity with zero tolerance for logic errors.
Focuses on execution validation, not SEO quality assessment.
"""

import json
from typing import Dict, List, Any, Tuple
from datetime import datetime

class StrictSEORuleValidator:
    """Strict validation engine for SEO rule execution integrity"""
    
    def __init__(self):
        self.execution_log = []
        self.silent_passes = []
        self.logic_errors = []
        
    def validate_rule_execution(self, rule, normalized_data: dict, execution_result: list, exception: Exception = None) -> dict:
        """
        Strict validation of individual rule execution
        
        Returns validation result with exact status classification
        """
        validation = {
            "rule_name": getattr(rule, 'rule_id', 'UNKNOWN'),
            "rule_no": getattr(rule, 'rule_no', 0),
            "category": getattr(rule, 'category', 'Unknown'),
            "execution_status": "",
            "validation_details": {}
        }
        
        # Check for execution exception
        if exception:
            validation["execution_status"] = "SKIP"
            validation["validation_details"] = {
                "skip_type": "d) Logic error",
                "reason": f"Rule crashed: {str(exception)}",
                "missing_data": [],
                "logic_issue": True
            }
            self.logic_errors.append(validation["rule_name"])
            return validation
        
        # Validate execution result type
        if execution_result is None:
            validation["execution_status"] = "SKIP"
            validation["validation_details"] = {
                "skip_type": "d) Logic error", 
                "reason": "Rule returned None (undefined behavior)",
                "missing_data": [],
                "logic_issue": True
            }
            self.logic_errors.append(validation["rule_name"])
            return validation
            
        if not isinstance(execution_result, list):
            validation["execution_status"] = "SKIP"
            validation["validation_details"] = {
                "skip_type": "d) Logic error",
                "reason": f"Rule returned invalid type: {type(execution_result)}",
                "missing_data": [],
                "logic_issue": True
            }
            self.logic_errors.append(validation["rule_name"])
            return validation
        
        # Analyze execution result
        if len(execution_result) > 0:
            # Rule FAILED
            validation["execution_status"] = "FAIL"
            validation["validation_details"] = self._analyze_failure(rule, normalized_data, execution_result)
        else:
            # Rule PASSED or should be SKIPPED
            pass_analysis = self._analyze_pass_strict(rule, normalized_data)
            validation["execution_status"] = pass_analysis["status"]
            validation["validation_details"] = pass_analysis["details"]
            
            if pass_analysis.get("suspicious"):
                self.silent_passes.append({
                    "rule_name": validation["rule_name"],
                    "issue": pass_analysis["suspicious_reason"]
                })
        
        return validation
    
    def _analyze_failure(self, rule, normalized_data: dict, execution_result: list) -> dict:
        """Analyze rule failure with exact condition details"""
        if not execution_result:
            return {"reason": "Empty failure result"}
        
        # Get first issue for detailed analysis
        issue = execution_result[0]
        
        failure_analysis = {
            "reason": issue.get("issue_message", "Unknown failure"),
            "expected": issue.get("expected_value", "Not specified"),
            "detected": issue.get("detected_value", "Not specified"),
            "data_used": {}
        }
        
        # Extract actual data used for evaluation
        data_key = issue.get("data_key")
        if data_key and data_key in normalized_data:
            failure_analysis["data_used"][data_key] = normalized_data[data_key]
        elif data_key:
            failure_analysis["data_used"][data_key] = "MISSING"
        
        # Add context data for relevant fields
        rule_category = getattr(rule, 'category', '').lower()
        context_fields = self._get_context_fields(rule_category)
        for field in context_fields:
            if field in normalized_data:
                failure_analysis["data_used"][field] = normalized_data[field]
        
        return failure_analysis
    
    def _analyze_pass_strict(self, rule, normalized_data: dict) -> dict:
        """
        Strict analysis of pass result - detect suspicious passes
        """
        required_fields = self._get_required_fields_strict(rule)
        missing_fields = []
        null_fields = []
        empty_fields = []
        
        # Check each required field
        for field in required_fields:
            if field not in normalized_data:
                missing_fields.append(field)
            else:
                value = normalized_data[field]
                if value is None:
                    null_fields.append(field)
                elif isinstance(value, (str, list)) and len(value) == 0:
                    empty_fields.append(field)
        
        # Determine if pass is legitimate or suspicious
        if missing_fields or null_fields:
            # Rule should be SKIPPED, not passed
            return {
                "status": "SKIP",
                "details": {
                    "skip_type": "b) Data missing skip",
                    "reason": f"Required data missing: {missing_fields + null_fields}",
                    "missing_data": missing_fields + null_fields,
                    "logic_issue": False
                },
                "suspicious": True,
                "suspicious_reason": f"Passed despite missing required data: {missing_fields + null_fields}"
            }
        
        if empty_fields and self._is_presence_rule(rule):
            # Presence rule passed on empty data - suspicious
            return {
                "status": "SKIP", 
                "details": {
                    "skip_type": "b) Data missing skip",
                    "reason": f"Presence rule passed on empty data: {empty_fields}",
                    "missing_data": empty_fields,
                    "logic_issue": True
                },
                "suspicious": True,
                "suspicious_reason": f"Presence rule passed despite empty data: {empty_fields}"
            }
        
        # Legitimate pass
        return {
            "status": "PASS",
            "details": {
                "skip_type": None,
                "reason": "Conditions satisfied",
                "missing_data": [],
                "logic_issue": False
            },
            "suspicious": False
        }
    
    def _get_required_fields_strict(self, rule) -> List[str]:
        """Get strictly required fields for rule execution"""
        rule_id = getattr(rule, 'rule_id', '').lower()
        category = getattr(rule, 'category', '').lower()
        
        # Category-based field requirements
        category_requirements = {
            "title tag": ["title"],
            "meta description": ["meta_description"],
            "headings": ["headings"],
            "images": ["images"],
            "content": ["content_text", "word_count"],
            "technical": ["canonical", "viewport"],
            "social": ["og_tags", "social"],
            "schema": ["structured_data"],
            "performance": ["performance"],
            "accessibility": ["headless"],
            "international": ["hreflangs", "html_lang"],
            "crawlability": ["meta_tags"],
            "tracking": ["tracking", "scripts"]
        }
        
        required = category_requirements.get(category, [])
        
        # Rule-specific additional requirements
        if "length" in rule_id:
            required = [f for f in required if f in ["title", "meta_description", "content_text"]]
        elif "count" in rule_id:
            required.extend(["word_count"])
        elif "keyword" in rule_id:
            required.extend(["content_text"])
        elif "alt" in rule_id:
            required = ["images"]
        elif "hreflang" in rule_id:
            required = ["hreflangs"]
        elif "schema" in rule_id:
            required = ["structured_data"]
        elif "performance" in rule_id or any(x in rule_id for x in ["lcp", "cls", "tbt"]):
            required = ["performance"]
        elif "accessibility" in rule_id or "aria" in rule_id:
            required = ["headless"]
        
        return list(set(required))  # Remove duplicates
    
    def _is_presence_rule(self, rule) -> bool:
        """Check if rule specifically tests for presence/absence"""
        rule_id = getattr(rule, 'rule_id', '').lower()
        presence_indicators = [
            "present", "exists", "missing", "empty", "has_", "contains_"
        ]
        return any(indicator in rule_id for indicator in presence_indicators)
    
    def _get_context_fields(self, category: str) -> List[str]:
        """Get context fields for failure analysis"""
        context_mapping = {
            "title tag": ["title", "meta_description"],
            "meta description": ["meta_description", "title"],
            "headings": ["headings", "content_text"],
            "images": ["images", "content_text"],
            "content": ["content_text", "word_count", "title"],
            "technical": ["canonical", "viewport", "doctype", "url"],
            "social": ["og_tags", "social", "title", "images"],
            "schema": ["structured_data", "content_text"],
            "performance": ["performance", "url"],
            "accessibility": ["headless", "content_text"],
            "international": ["hreflangs", "html_lang", "url"],
            "crawlability": ["meta_tags", "robots", "url"],
            "tracking": ["tracking", "scripts", "content_text"]
        }
        return context_mapping.get(category.lower(), [])
    
    def validate_page_execution(self, rules: List, normalized_data: dict, execution_results: List, exceptions: List) -> dict:
        """
        Validate complete page execution with strict cross-validation
        """
        validations = []
        
        # Validate each rule execution
        for i, rule in enumerate(rules):
            exception = exceptions[i] if i < len(exceptions) else None
            result = execution_results[i] if i < len(execution_results) else None
            
            validation = self.validate_rule_execution(rule, normalized_data, result, exception)
            validations.append(validation)
        
        # Count execution statuses
        passed = sum(1 for v in validations if v["execution_status"] == "PASS")
        failed = sum(1 for v in validations if v["execution_status"] == "FAIL")
        skipped = sum(1 for v in validations if v["execution_status"] == "SKIP")
        executed = passed + failed + skipped
        
        # Cross-validation
        total_rules = len(rules)
        cross_valid = (total_rules == executed)
        
        # Build strict JSON output
        output = {
            "execution_summary": {
                "total_rules": total_rules,
                "executed": executed,
                "passed": passed,
                "failed": failed,
                "skipped": skipped,
                "silent_pass_detected": len(self.silent_passes),
                "logic_errors_detected": len(self.logic_errors)
            },
            "failed_rules": [],
            "skipped_rules": [],
            "suspicious_pass_rules": self.silent_passes
        }
        
        # Add failed rules details
        for validation in validations:
            if validation["execution_status"] == "FAIL":
                output["failed_rules"].append({
                    "rule_name": validation["rule_name"],
                    "reason": validation["validation_details"]["reason"],
                    "expected": validation["validation_details"]["expected"],
                    "detected": validation["validation_details"]["detected"],
                    "data_used": validation["validation_details"]["data_used"]
                })
        
        # Add skipped rules details
        for validation in validations:
            if validation["execution_status"] == "SKIP":
                output["skipped_rules"].append({
                    "rule_name": validation["rule_name"],
                    "skip_type": validation["validation_details"]["skip_type"],
                    "missing_data": validation["validation_details"]["missing_data"],
                    "reason": validation["validation_details"]["reason"]
                })
        
        # Add cross-validation status
        if not cross_valid:
            output["cross_validation_error"] = {
                "expected_total": total_rules,
                "actual_total": executed,
                "discrepancy": total_rules - executed
            }
        
        return output


def create_strict_validation_demo():
    """Create demonstration of strict validation output"""
    
    demo_output = {
        "execution_summary": {
            "total_rules": 188,
            "executed": 188,
            "passed": 125,
            "failed": 28,
            "skipped": 35,
            "silent_pass_detected": 8,
            "logic_errors_detected": 3
        },
        "failed_rules": [
            {
                "rule_name": "TITLE_LENGTH",
                "reason": "Title tag is too long",
                "expected": "30-60 characters",
                "detected": 85,
                "data_used": {
                    "title": "This is an extremely long title that exceeds the recommended length for SEO purposes",
                    "meta_description": "A reasonable meta description"
                }
            },
            {
                "rule_name": "LCP_GOOD",
                "reason": "Largest Contentful Paint (LCP) is too slow",
                "expected": "<= 2.5 seconds",
                "detected": 4.2,
                "data_used": {
                    "performance": {
                        "largest_contentful_paint": 4.2,
                        "first_contentful_paint": 1.8,
                        "cumulative_layout_shift": 0.15
                    },
                    "url": "https://example.com/page"
                }
            },
            {
                "rule_name": "IMAGES_ALT_MEANINGFUL",
                "reason": "Image missing meaningful alt text",
                "expected": "Descriptive alt text",
                "detected": "",
                "data_used": {
                    "images": [
                        {"src": "image1.jpg", "alt": ""},
                        {"src": "image2.jpg", "alt": "Photo"}
                    ]
                }
            }
        ],
        "skipped_rules": [
            {
                "rule_name": "SCHEMA_JSONLD_PRESENT",
                "skip_type": "b) Data missing skip",
                "missing_data": ["structured_data"],
                "reason": "Required data missing: ['structured_data']"
            },
            {
                "rule_name": "HREFLANG_PRESENT",
                "skip_type": "a) Conditional skip",
                "missing_data": [],
                "reason": "Rule not applicable - single language site"
            },
            {
                "rule_name": "TITLE_MULTIPLE",
                "skip_type": "d) Logic error",
                "missing_data": [],
                "reason": "Rule crashed: 'NoneType' object has no attribute 'count'"
            },
            {
                "rule_name": "PERFORMANCE_RULES",
                "skip_type": "b) Data missing skip",
                "missing_data": ["performance"],
                "reason": "Required data missing: ['performance']"
            }
        ],
        "suspicious_pass_rules": [
            {
                "rule_name": "ANALYTICS_PRESENT",
                "issue": "Passed despite missing required data: ['tracking']"
            },
            {
                "rule_name": "VIEWPORT_PRESENT",
                "issue": "Passed despite missing required data: ['viewport']"
            },
            {
                "rule_name": "META_DESC_EMPTY",
                "issue": "Presence rule passed despite empty data: ['meta_description']"
            }
        ]
    }
    
    return demo_output


if __name__ == "__main__":
    # Generate strict validation demo
    demo = create_strict_validation_demo()
    print(json.dumps(demo, indent=2))
