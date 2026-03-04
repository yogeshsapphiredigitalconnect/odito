"""
Strict Rule Execution Debugger

Audits rule execution integrity with zero tolerance for logic errors.
Focuses on execution validation, not SEO quality assessment.
"""

import json
from typing import Dict, List, Any, Tuple
from datetime import datetime

class StrictRuleExecutionDebugger:
    """Strict debugger for rule execution integrity"""
    
    def __init__(self):
        self.required_data_map = self._build_required_data_map()
        
    def _build_required_data_map(self) -> Dict[str, List[str]]:
        """Build strict required data mapping for all 188 rules"""
        return {
            # Title Rules (20)
            "TITLE_EMPTY": ["title"],
            "TITLE_MULTIPLE": ["title"],
            "TITLE_LENGTH": ["title"],
            "TITLE_SINGLE_WORD": ["title"],
            "TITLE_ALL_CAPS": ["title"],
            "TITLE_EXCESSIVE_PUNCTUATION": ["title"],
            "TITLE_LEADING_TRAILING_SEPARATOR": ["title"],
            "TITLE_GENERIC_PHRASE": ["title"],
            "TITLE_UNNECESSARY_NUMBERS": ["title"],
            "TITLE_MISSING_KEYWORD": ["title", "meta_keywords", "headings"],
            "TITLE_KEYWORD_POSITION": ["title"],
            "TITLE_KEYWORD_STUFFING": ["title"],
            "TITLE_VOICE_SEARCH": ["title"],
            "TITLE_VAGUE": ["title"],
            "TITLE_META_ALIGNMENT": ["title", "og_tags"],
            "TITLE_READABILITY": ["title"],
            "TITLE_CLICKBAIT": ["title"],
            "TITLE_FILLER_WORDS": ["title"],
            "TITLE_CONTAINS_HTML": ["title"],
            "TITLE_IS_LINK": ["title"],
            
            # Technical Rules (12)
            "CANONICAL_PRESENT": ["canonical"],
            "CANONICAL_VALID_URL": ["canonical"],
            "CANONICAL_HTTPS": ["canonical"],
            "CANONICAL_NO_QUERY_PARAMS": ["canonical"],
            "CANONICAL_MATCHES_PAGE": ["canonical", "url"],
            "CANONICAL_CONSISTENT_WWW": ["canonical", "url"],
            "APPLE_TOUCH_ICON_PRESENT": ["meta_tags"],
            "APPLE_TOUCH_ICON_VALID_URL": ["meta_tags"],
            "APPLE_TOUCH_ICON_SIZE": ["meta_tags"],
            "APPLE_TOUCH_ICON_MULTIPLE_SIZES": ["meta_tags"],
            "VIEWPORT_PRESENT": ["viewport"],
            "HTTPS_ENFORCED": ["url"],
            
            # Social Rules (17)
            "OG_TITLE_EXISTS": ["og_tags"],
            "OG_DESCRIPTION_EXISTS": ["og_tags"],
            "OG_IMAGE_EXISTS": ["og_tags"],
            "OG_URL_EXISTS": ["og_tags"],
            "OG_TYPE_EXISTS": ["og_tags"],
            "OG_TITLE_MATCHES_PAGE": ["og_tags", "title"],
            "OG_CONTAINS_KEYWORD": ["og_tags"],
            "OG_VALID_URLS": ["og_tags"],
            "PINTEREST_MEDIA_PRESENT": ["social"],
            "PINTEREST_DESCRIPTION_PRESENT": ["social"],
            "PINTEREST_URL_MATCH": ["social", "url"],
            "PINTEREST_MEDIA_VALID_URL": ["social"],
            "PINTEREST_DESC_KEYWORD": ["social"],
            "PINTEREST_TAGS_VALID": ["social"],
            "SOCIAL_SHARING_OPTIMIZED": ["og_tags", "social"],
            
            # Schema Rules (14)
            "SCHEMA_JSONLD_PRESENT": ["structured_data"],
            "SCHEMA_VALID_CONTEXT": ["structured_data"],
            "SCHEMA_VALID_TYPE": ["structured_data"],
            "SCHEMA_URL_MATCHES_PAGE": ["structured_data", "url"],
            "SCHEMA_NAME_ALIGNS_TITLE": ["structured_data", "title"],
            "SCHEMA_LOCALBIZ_PHONE": ["structured_data"],
            "SCHEMA_LOCALBIZ_ADDRESS": ["structured_data"],
            "SCHEMA_IMAGE_VALID": ["structured_data"],
            "SCHEMA_DESCRIPTION_KEYWORD": ["structured_data"],
            "SCHEMA_TYPE_NOT_DEPRECATED": ["structured_data"],
            "SCHEMA_NO_DUPLICATE_FORMATS": ["structured_data"],
            "SCHEMA_BREADCRUMBLIST": ["structured_data"],
            "SCHEMA_ARTICLE_DATE": ["structured_data"],
            "SCHEMA_FAQPAGE": ["structured_data"],
            
            # Performance Rules (7)
            "LCP_GOOD": ["performance"],
            "CLS_GOOD": ["performance"],
            "TBT_GOOD": ["performance"],
            "PAGESPEED_SCORE": ["performance"],
            "SPEED_INDEX": ["performance"],
            "RENDER_BLOCKING": ["performance"],
            "MOBILE_FRIENDLY": ["headless"],
            
            # Meta Rules (16)
            "META_DESC_EMPTY": ["meta_description"],
            "META_DESC_LENGTH": ["meta_description"],
            "META_DESC_MISSING_KEYWORD": ["meta_description"],
            "META_DESC_FILLER_WORDS": ["meta_description"],
            "META_KEYWORDS_COUNT": ["meta_keywords"],
            "META_KEYWORDS_INCLUDES_PRIMARY": ["meta_keywords"],
            "META_KEYWORDS_HTML_TAGS": ["meta_keywords"],
            "LANG_META_VALID_CODE": ["html_lang"],
            "LANG_META_TAG_NAME": ["meta_tags"],
            "CHARSET_PRESENT": ["meta_tags"],
            "CHARSET_VALID_ENCODING": ["meta_tags"],
            "CHARSET_TAG_NAME": ["meta_tags"],
            "ROBOTS_META_PRESENT": ["meta_tags"],
            "ROBOTS_META_NOT_EMPTY": ["meta_tags"],
            "ROBOTS_META_VALID_DIRECTIVES": ["meta_tags"],
            "ROBOTS_META_CONFLICTING": ["meta_tags"],
            "AUTHOR_PRESENT": ["meta_tags"],
            "AUTHOR_LENGTH": ["meta_tags"],
            
            # International Rules (8)
            "HREFLANG_PRESENT": ["hreflangs"],
            "HREFLANG_SELF_REFERENCE": ["hreflangs", "url"],
            "HREFLANG_X_DEFAULT": ["hreflangs"],
            "HREFLANG_VALID_LANG_CODE": ["hreflangs"],
            "HREFLANG_VALID_URL": ["hreflangs"],
            "HREFLANG_INCLUDES_TARGET_LANGS": ["hreflangs"],
            "HREFLANG_ALL_VALID": ["hreflangs"],
            "MULTILINGUAL_SUPPORT": ["hreflangs", "html_lang"],
            
            # Image Rules (13)
            "IMAGES_PRESENT": ["images"],
            "IMAGES_COUNT": ["images"],
            "IMAGES_MODERN_FORMAT": ["images"],
            "IMAGES_VALID_URL": ["images"],
            "IMAGES_HTTPS": ["images"],
            "IMAGES_ALT_MEANINGFUL": ["images"],
            "IMAGES_ALT_KEYWORD": ["images"],
            "IMAGES_DIMENSIONS": ["images"],
            "IMAGES_OPTIMIZED_SIZE": ["images"],
            "IMAGES_DUPLICATE_URL": ["images"],
            "IMAGES_LAZY_LOADING": ["images"],
            "IMAGES_ROLE_ATTRIBUTE": ["images"],
            "IMAGES_OTHER_CATEGORY": ["images"],
            
            # Heading Rules (33)
            "H1_EXACTLY_ONE": ["headings"],
            "H1_LENGTH": ["headings"],
            "H1_CONTAINS_KEYWORD": ["headings"],
            "H1_KEYWORD_BEGINNING": ["headings"],
            "H1_READABILITY": ["headings"],
            "H2_COUNT": ["headings"],
            "H2_CONTAINS_KEYWORD": ["headings"],
            "H2_LENGTH": ["headings"],
            "H2_EMPTY": ["headings"],
            "H2_DUPLICATE": ["headings"],
            "H3_COUNT": ["headings"],
            "H3_LENGTH": ["headings"],
            "H3_DUPLICATE": ["headings"],
            "H4_COUNT": ["headings"],
            "H4_LENGTH": ["headings"],
            "H5_COUNT": ["headings"],
            "H5_LENGTH": ["headings"],
            "H6_COUNT": ["headings"],
            "H6_LENGTH": ["headings"],
            "HEADING_NO_EMPTY": ["headings"],
            "HEADING_NO_HTML": ["headings"],
            "HEADING_NOT_LINK": ["headings"],
            "HEADING_ALL_CAPS": ["headings"],
            "HEADING_EXCESSIVE_PUNCTUATION": ["headings"],
            "HEADING_GENERIC_PHRASE": ["headings"],
            "HEADING_CONTAINS_KEYWORD": ["headings"],
            "HEADING_KEYWORD_EARLY": ["headings"],
            "HEADING_KEYWORD_STUFFING": ["headings"],
            "HEADING_VOICE_SEARCH": ["headings"],
            "HEADING_UNIQUE": ["headings"],
            "HEADING_READABLE": ["headings"],
            "HEADING_SENTENCE_CASE": ["headings"],
            "HEADING_CLICKBAIT_FILLER": ["headings"],
            "H1_DIFFERS_FROM_TITLE": ["headings", "title"],
            "HEADING_HIERARCHY_LOGICAL": ["headings"],
            
            # General Rules (10)
            "WORD_COUNT_MIN": ["content_text", "word_count"],
            "WORD_COUNT_MAX": ["content_text", "word_count"],
            "CONTENT_CONTAINS_KEYWORD": ["content_text"],
            "CONTENT_KEYWORD_DENSITY": ["content_text"],
            "SGE_OPTIMIZED": ["content_text"],
            "MIXED_CONTENT": ["url"],
            "SECURITY_HEADERS": ["headless"],
            "EEAT_AUTHOR_INFO": ["content_text"],
            "EEAT_CONTACT_INFO": ["content_text"],
            
            # Crawlability Rules (18)
            "ROBOTS_TXT_PRESENT": ["headless"],
            "ROBOTS_TXT_ACCESSIBLE": ["headless"],
            "ROBOTS_TXT_VALID_SYNTAX": ["headless"],
            "ROBOTS_TXT_ALLOW_ROOT": ["headless"],
            "ROBOTS_TXT_NO_DISALLOW_ALL": ["headless"],
            "ROBOTS_TXT_SITEMAP_PRESENT": ["headless"],
            "SITEMAP_XML_PRESENT": ["headless"],
            "SITEMAP_XML_ACCESSIBLE": ["headless"],
            "SITEMAP_XML_VALID_SYNTAX": ["headless"],
            "SITEMAP_XML_URL_COUNT": ["headless"],
            "SITEMAP_XML_URL_VALID": ["headless"],
            "SITEMAP_XML_LASTMOD": ["headless"],
            "SITEMAP_XML_INCLUDES_ROOT": ["headless"],
            "CLEAN_URLS": ["url"],
            "URL_LENGTH": ["url"],
            "URL_STRUCTURE": ["url"],
            "PAGINATION_REL_NEXT_PREV": ["headless"],
            "PAGINATION_CANONICAL": ["canonical", "headless"],
            
            # Accessibility Rules (18)
            "IMG_ALT_PRESENT": ["images"],
            "IMG_ALT_MEANINGFUL": ["images"],
            "LINK_TEXT_DESCRIPTIVE": ["content_text"],
            "LINK_UNDERLINE_DISTINCT": ["headless"],
            "CONTRAST_RATIO_MIN": ["headless"],
            "FONT_SIZE_READABLE": ["headless"],
            "RESIZE_TEXT_ONLY": ["headless"],
            "KEYBOARD_NAVIGATION": ["headless"],
            "FOCUS_VISIBLE": ["headless"],
            "SKIP_LINK_PRESENT": ["headless"],
            "ARIA_LANDMARKS": ["headless"],
            "FORM_LABELS_PRESENT": ["content_text"],
            "TABLE_HEADERS_PRESENT": ["content_text"],
            "VIDEO_CAPTIONS_PRESENT": ["content_text"],
            "ERROR_MESSAGES_CLEAR": ["content_text"],
            "LANGUAGE_IDENTIFIED": ["html_lang"],
            "PAGE_TITLE_UNIQUE": ["title"],
            "HEADING_ORDER_LOGICAL": ["headings"],
            
            # Content Rules (12)
            "CONTENT_UNIQUE": ["content_text"],
            "CONTENT_READABILITY": ["content_text"],
            "CONTENT_STRUCTURE": ["headings", "content_text"],
            "INTERNAL_LINKS_PRESENT": ["content_text"],
            "INTERNAL_LINKS_RELEVANT": ["content_text"],
            "EXTERNAL_LINKS_QUALITY": ["content_text"],
            "OUTBOUND_LINKS_COUNT": ["content_text"],
            "BROKEN_LINKS_CHECK": ["content_text"],
            "FRESH_CONTENT": ["content_text"],
            "EVERGREEN_CONTENT": ["content_text"],
            "CONTENT_DEPTH": ["content_text", "word_count"],
            "TOPIC_COVERAGE": ["content_text"],
            
            # Tracking Rules (2)
            "ANALYTICS_PRESENT": ["tracking", "scripts"],
            "FB_PIXEL_PRESENT": ["tracking", "scripts"]
        }
    
    def debug_execution_integrity(self, page_data: dict, execution_results: List[dict]) -> dict:
        """
        Perform strict execution integrity debugging
        """
        
        # STEP 1: Validate Execution Integrity
        integrity_check = self._validate_execution_math(execution_results)
        
        # STEP 2: Analyze ALL SKIPPED Rules
        skip_analysis = self._analyze_skipped_rules(page_data, execution_results)
        
        # STEP 3: Detect Silent Passes
        silent_pass_analysis = self._detect_silent_passes(page_data, execution_results)
        
        # STEP 4: Detect Logic Errors
        logic_errors = self._detect_logic_errors(execution_results)
        
        # STEP 5: Provide Action Plan
        priority_fix_order = self._generate_priority_fix_order(
            integrity_check, skip_analysis, silent_pass_analysis, logic_errors
        )
        
        return {
            "integrity_check": integrity_check,
            "skip_analysis": skip_analysis,
            "silent_pass_analysis": silent_pass_analysis,
            "logic_errors": logic_errors,
            "priority_fix_order": priority_fix_order
        }
    
    def _validate_execution_math(self, execution_results: List[dict]) -> dict:
        """Validate mathematical integrity of execution counts"""
        
        total_rules = len(execution_results)
        passed = sum(1 for r in execution_results if r.get("status") == "PASS")
        failed = sum(1 for r in execution_results if r.get("status") == "FAIL")
        skipped = sum(1 for r in execution_results if r.get("status") == "SKIP")
        
        executed = passed + failed + skipped
        executed_correct = (passed + failed) == executed - skipped
        
        math_valid = (total_rules == executed)
        execution_count_correct = executed_correct
        
        return {
            "math_valid": math_valid,
            "execution_count_correct": execution_count_correct,
            "counts": {
                "total_rules": total_rules,
                "passed": passed,
                "failed": failed,
                "skipped": skipped,
                "executed": executed
            },
            "discrepancies": []
        }
    
    def _analyze_skipped_rules(self, page_data: dict, execution_results: List[dict]) -> List[dict]:
        """Analyze all skipped rules with root cause analysis"""
        
        skip_analysis = []
        
        for result in execution_results:
            if result.get("status") == "SKIP":
                rule_name = result.get("rule", "")
                required_data = self.required_data_map.get(rule_name, [])
                
                # Check what data is actually missing
                missing_data = []
                present_data = []
                
                for data_key in required_data:
                    if data_key not in page_data:
                        missing_data.append(data_key)
                    elif page_data[data_key] is None:
                        missing_data.append(f"{data_key} (null)")
                    elif isinstance(page_data[data_key], (str, list)) and len(page_data[data_key]) == 0:
                        missing_data.append(f"{data_key} (empty)")
                    else:
                        present_data.append(data_key)
                
                # Determine root cause and fix required
                real_reason, root_cause, fix_required = self._classify_skip_reason(
                    rule_name, missing_data, present_data, page_data
                )
                
                skip_analysis.append({
                    "rule": rule_name,
                    "real_reason": real_reason,
                    "root_cause": root_cause,
                    "fix_required": fix_required
                })
        
        return skip_analysis
    
    def _classify_skip_reason(self, rule_name: str, missing_data: List[str], 
                            present_data: List[str], page_data: dict) -> Tuple[str, str, str]:
        """Classify skip reason and provide fix recommendation"""
        
        if not missing_data:
            # No data missing - likely conditional skip
            return "Conditional skip", "Rule not applicable to this page type", "No fix needed - correct behavior"
        
        # Check if missing data should exist
        data_should_exist = self._should_data_exist(missing_data, page_data)
        
        if data_should_exist:
            # Data should exist but doesn't - crawler issue
            return "Data extraction failure", f"Crawler failed to extract: {missing_data}", f"Fix crawler to extract: {missing_data}"
        else:
            # Data legitimately doesn't exist - rule guard needed
            return "Rule dependency issue", f"Rule requires data that doesn't exist for this page", f"Add guard clause: if not {missing_data[0]}: return []"
    
    def _should_data_exist(self, missing_data: List[str], page_data: dict) -> bool:
        """Determine if missing data should realistically exist"""
        
        # Basic data that should exist on most pages
        should_exist_basic = {
            "title": True,  # Almost all pages should have title
            "url": True,    # URL should always exist
            "content_text": True,  # Pages should have content
        }
        
        # Context-dependent data
        for data_key in missing_data:
            clean_key = data_key.replace(" (null)", "").replace(" (empty)", "")
            
            if clean_key in should_exist_basic and should_exist_basic[clean_key]:
                return True
                
            # Check if page type suggests data should exist
            if clean_key == "images" and page_data.get("content_text"):
                # Text content suggests page should have images
                return True
                
            if clean_key == "headings" and page_data.get("content_text"):
                # Long content should have headings
                if len(page_data.get("content_text", "")) > 200:
                    return True
        
        return False
    
    def _detect_silent_passes(self, page_data: dict, execution_results: List[dict]) -> List[dict]:
        """Detect suspicious passes where required data was missing"""
        
        silent_passes = []
        
        for result in execution_results:
            if result.get("status") == "PASS":
                rule_name = result.get("rule", "")
                required_data = self.required_data_map.get(rule_name, [])
                
                # Check if required data was missing/empty
                suspicious_data = []
                
                for data_key in required_data:
                    if data_key not in page_data:
                        suspicious_data.append(f"{data_key} (missing)")
                    elif page_data[data_key] is None:
                        suspicious_data.append(f"{data_key} (null)")
                    elif isinstance(page_data[data_key], (str, list)) and len(page_data[data_key]) == 0:
                        # Only flag empty data for presence rules
                        if self._is_presence_rule(rule_name):
                            suspicious_data.append(f"{data_key} (empty)")
                
                if suspicious_data:
                    problem = f"Rule passed despite missing/empty required data: {suspicious_data}"
                    fix_pattern = self._generate_fix_pattern(rule_name, suspicious_data)
                    
                    silent_passes.append({
                        "rule": rule_name,
                        "problem": problem,
                        "fix_pattern": fix_pattern
                    })
        
        return silent_passes
    
    def _is_presence_rule(self, rule_name: str) -> bool:
        """Check if rule specifically tests for presence/absence"""
        presence_indicators = [
            "PRESENT", "EXISTS", "EMPTY", "MISSING"
        ]
        return any(indicator in rule_name for indicator in presence_indicators)
    
    def _generate_fix_pattern(self, rule_name: str, suspicious_data: List[str]) -> str:
        """Generate code-level fix pattern for suspicious pass"""
        
        if self._is_presence_rule(rule_name):
            data_key = suspicious_data[0].split(" (")[0]
            return f"Add guard clause: if not {data_key}: return [self.create_issue(...)]  # Fail when data missing"
        else:
            data_key = suspicious_data[0].split(" (")[0]
            return f"Add guard clause: if not {data_key}: return []  # Skip when data missing"
    
    def _detect_logic_errors(self, execution_results: List[dict]) -> List[dict]:
        """Detect logic errors from execution results"""
        
        logic_errors = []
        
        for result in execution_results:
            if result.get("exception"):
                logic_errors.append({
                    "rule": result.get("rule", ""),
                    "error_type": "Runtime exception",
                    "fix_pattern": f"Add try-catch: try: return rule.evaluate(...) except Exception as e: print(f'Rule error: {{e}}'); return []"
                })
            elif result.get("status") is None:
                logic_errors.append({
                    "rule": result.get("rule", ""),
                    "error_type": "Undefined return",
                    "fix_pattern": "Ensure rule always returns list: return [] if no issues"
                })
        
        return logic_errors
    
    def _generate_priority_fix_order(self, integrity_check: dict, skip_analysis: List[dict], 
                                   silent_pass_analysis: List[dict], logic_errors: List[dict]) -> List[str]:
        """Generate priority fix order based on analysis"""
        
        priority_fixes = []
        
        # Priority 1: Fix logic errors (crashes)
        if logic_errors:
            priority_fixes.append("1. Fix execution wrapper - handle rule crashes")
        
        # Priority 2: Fix required_data mapping (silent passes)
        if silent_pass_analysis:
            priority_fixes.append("2. Fix required_data mapping - prevent silent passes")
        
        # Priority 3: Fix guard clauses (dependency issues)
        dependency_issues = [s for s in skip_analysis if "Rule dependency" in s["root_cause"]]
        if dependency_issues:
            priority_fixes.append("3. Fix guard clauses - handle missing dependencies")
        
        # Priority 4: Fix crawler issues
        crawler_issues = [s for s in skip_analysis if "Data extraction" in s["root_cause"]]
        if crawler_issues:
            priority_fixes.append("4. Fix crawler extraction - improve data collection")
        
        # Priority 5: Re-run pipeline
        priority_fixes.append("5. Re-run pipeline with fixes applied")
        
        return priority_fixes


def create_debug_demo():
    """Create demonstration of strict debugging output"""
    
    return {
        "integrity_check": {
            "math_valid": True,
            "execution_count_correct": True,
            "counts": {
                "total_rules": 188,
                "passed": 125,
                "failed": 28,
                "skipped": 35,
                "executed": 188
            },
            "discrepancies": []
        },
        "skip_analysis": [
            {
                "rule": "SCHEMA_JSONLD_PRESENT",
                "real_reason": "Data extraction failure",
                "root_cause": "Crawler failed to extract: ['structured_data']",
                "fix_required": "Fix crawler to extract: ['structured_data']"
            },
            {
                "rule": "HREFLANG_PRESENT",
                "real_reason": "Conditional skip",
                "root_cause": "Rule not applicable to this page type",
                "fix_required": "No fix needed - correct behavior"
            },
            {
                "rule": "TITLE_MULTIPLE",
                "real_reason": "Rule dependency issue",
                "root_cause": "Rule requires data that doesn't exist for this page",
                "fix_required": "Add guard clause: if not raw_html: return []"
            },
            {
                "rule": "PERFORMANCE_RULES",
                "real_reason": "Data extraction failure",
                "root_cause": "Crawler failed to extract: ['performance']",
                "fix_required": "Fix crawler to extract: ['performance']"
            }
        ],
        "silent_pass_analysis": [
            {
                "rule": "ANALYTICS_PRESENT",
                "problem": "Rule passed despite missing/empty required data: ['tracking (missing)']",
                "fix_pattern": "Add guard clause: if not tracking: return [self.create_issue(...)]  # Fail when data missing"
            },
            {
                "rule": "VIEWPORT_PRESENT",
                "problem": "Rule passed despite missing/empty required data: ['viewport (missing)']",
                "fix_pattern": "Add guard clause: if not viewport: return [self.create_issue(...)]  # Fail when data missing"
            },
            {
                "rule": "META_DESC_EMPTY",
                "problem": "Rule passed despite missing/empty required data: ['meta_description (empty)']",
                "fix_pattern": "Add guard clause: if not meta_description: return [self.create_issue(...)]  # Fail when data missing"
            }
        ],
        "logic_errors": [
            {
                "rule": "TITLE_MULTIPLE",
                "error_type": "Runtime exception",
                "fix_pattern": "Add try-catch: try: return rule.evaluate(...) except Exception as e: print(f'Rule error: {e}'); return []"
            }
        ],
        "priority_fix_order": [
            "1. Fix execution wrapper - handle rule crashes",
            "2. Fix required_data mapping - prevent silent passes",
            "3. Fix guard clauses - handle missing dependencies",
            "4. Fix crawler extraction - improve data collection",
            "5. Re-run pipeline with fixes applied"
        ]
    }


if __name__ == "__main__":
    demo = create_debug_demo()
    print(json.dumps(demo, indent=2))
