"""
Strict Rule Engine Validator

Validates that every SEO rule has proper data mapping, logic consistency,
and never silently passes with missing data.
"""

import json
import sys
import os
from typing import Dict, List, Any, Tuple, Set
from datetime import datetime

# Add the scraper path to import modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraper'))

from scraper.workers.seo.page_analysis.rules.seo_rule_engine import get_seo_engine
from bson import ObjectId

class StrictRuleEngineValidator:
    """Strict validator for rule engine integrity"""
    
    def __init__(self):
        self.required_data_map = self._build_complete_required_data_map()
        
    def _build_complete_required_data_map(self) -> Dict[str, List[str]]:
        """Build comprehensive required data mapping for all 188 rules"""
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
            "SGE_OPTIMIZED": ["content_text", "structured_data", "headings"],
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
    
    def validate_rule_engine_integrity(self, page_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate every rule in the engine for strict compliance
        """
        print("Starting strict rule engine validation...")
        
        try:
            engine = get_seo_engine()
            all_rules = engine.registry.get_all_rules()
            print(f"Loaded {len(all_rules)} rules for validation")
        except Exception as e:
            return {
                "error": f"Failed to load rule engine: {str(e)}",
                "total_rules_checked": 0,
                "overall_engine_reliability": 0
            }
        
        rule_validations = []
        
        # Use valid ObjectIds for testing
        job_id = str(ObjectId())
        project_id = str(ObjectId())
        url = page_data.get("url", "https://test.com")
        
        for rule in all_rules:
            validation = self._validate_individual_rule(rule, page_data, job_id, project_id, url)
            rule_validations.append(validation)
        
        # Calculate overall statistics
        total_rules = len(rule_validations)
        fully_valid = sum(1 for v in rule_validations if v["engine_confidence_score"] >= 90)
        data_mapping_issues = sum(1 for v in rule_validations if not v["required_data_present"])
        logic_issues = sum(1 for v in rule_validations if not v["logic_consistent"])
        silent_pass_risks = sum(1 for v in rule_validations if v["silent_pass_risk"])
        
        overall_reliability = (fully_valid / total_rules * 100) if total_rules > 0 else 0
        
        return {
            "rule_validations": rule_validations,
            "total_rules_checked": total_rules,
            "fully_valid_rules": fully_valid,
            "rules_with_data_mapping_issue": data_mapping_issues,
            "rules_with_logic_issue": logic_issues,
            "rules_with_silent_pass_risk": silent_pass_risks,
            "overall_engine_reliability": round(overall_reliability, 1)
        }
    
    def _validate_individual_rule(self, rule, page_data: Dict[str, Any], job_id: str, project_id: str, url: str) -> Dict[str, Any]:
        """Validate individual rule for strict compliance"""
        
        rule_name = getattr(rule, 'rule_id', 'UNKNOWN')
        required_data = self.required_data_map.get(rule_name, [])
        
        validation = {
            "rule_name": rule_name,
            "required_data_present": False,
            "data_used_detected": False,
            "logic_consistent": False,
            "silent_pass_risk": False,
            "skip_reason_valid": False,
            "engine_confidence_score": 0
        }
        
        # 1. Check if required_data is defined
        if not required_data:
            validation["engine_confidence_score"] = 0
            return validation
        
        # 2. Check if required_data is present in page_data
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
        
        validation["required_data_present"] = len(missing_data) == 0
        
        # 3. Execute rule and analyze behavior
        try:
            result = rule.evaluate(page_data, job_id, project_id, url)
            
            if result is None:
                # Rule crashed - major logic issue
                validation["logic_consistent"] = False
                validation["engine_confidence_score"] = 0
                return validation
                
            elif not isinstance(result, list):
                # Wrong return type - logic issue
                validation["logic_consistent"] = False
                validation["engine_confidence_score"] = 0
                return validation
                
            elif len(result) > 0:
                # Rule failed - check if failure is valid
                validation["logic_consistent"] = True
                validation["data_used_detected"] = self._check_data_usage_in_failure(result, present_data)
                validation["skip_reason_valid"] = True  # Not skipped
                validation["engine_confidence_score"] = 85 if validation["data_used_detected"] else 70
                
            else:
                # Rule passed - check if pass is legitimate
                if missing_data:
                    # Silent pass risk - passed despite missing data
                    validation["silent_pass_risk"] = True
                    validation["logic_consistent"] = False
                    validation["engine_confidence_score"] = 20
                else:
                    # Legitimate pass
                    validation["logic_consistent"] = True
                    validation["data_used_detected"] = True
                    validation["skip_reason_valid"] = True
                    validation["engine_confidence_score"] = 95
                    
        except Exception as e:
            # Rule crashed - logic error
            validation["logic_consistent"] = False
            validation["engine_confidence_score"] = 0
            
        # 4. Special validation for presence rules
        if self._is_presence_rule(rule_name):
            validation = self._validate_presence_rule(validation, rule_name, page_data, present_data)
        
        # 5. Final confidence calculation
        validation["engine_confidence_score"] = self._calculate_final_confidence(validation, missing_data, present_data)
        
        return validation
    
    def _check_data_usage_in_failure(self, result: List[dict], present_data: List[str]) -> bool:
        """Check if failure actually used the required data"""
        if not result:
            return False
            
        issue = result[0]
        data_key = issue.get("data_key")
        
        # Check if any required data was referenced in the failure
        if data_key and data_key in present_data:
            return True
            
        # Check if detected_value corresponds to present data
        detected_value = issue.get("detected_value")
        if detected_value is not None:
            # Simple heuristic - if detected_value is not generic, data was likely used
            generic_values = ["None", "Missing", "", "Not found", "Not specified"]
            if str(detected_value) not in generic_values:
                return True
                
        return False
    
    def _is_presence_rule(self, rule_name: str) -> bool:
        """Check if rule specifically tests for presence/absence"""
        presence_indicators = [
            "PRESENT", "EXISTS", "EMPTY", "MISSING", "HAS_", "CONTAINS_"
        ]
        return any(indicator in rule_name for indicator in presence_indicators)
    
    def _validate_presence_rule(self, validation: dict, rule_name: str, page_data: Dict[str, Any], present_data: List[str]) -> dict:
        """Special validation for presence/absence rules"""
        
        if validation["silent_pass_risk"]:
            # Presence rule passed despite missing data - critical issue
            validation["engine_confidence_score"] = 10
            validation["logic_consistent"] = False
        elif not present_data and not validation["silent_pass_risk"]:
            # Presence rule correctly failed when data missing
            validation["logic_consistent"] = True
            validation["engine_confidence_score"] = 90
        elif present_data:
            # Data present - rule should have evaluated it
            if validation["data_used_detected"]:
                validation["engine_confidence_score"] = 95
            else:
                validation["engine_confidence_score"] = 75
                
        return validation
    
    def _calculate_final_confidence(self, validation: dict, missing_data: List[str], present_data: List[str]) -> int:
        """Calculate final confidence score"""
        
        score = validation["engine_confidence_score"]
        
        # Deductions for specific issues
        if not validation["required_data_present"]:
            score = min(score, 30)
            
        if validation["silent_pass_risk"]:
            score = min(score, 25)
            
        if not validation["logic_consistent"]:
            score = min(score, 40)
            
        if not validation["data_used_detected"] and present_data:
            score = min(score, 60)
            
        # Bonus for perfect execution
        if (validation["required_data_present"] and 
            validation["data_used_detected"] and 
            validation["logic_consistent"] and 
            not validation["silent_pass_risk"]):
            score = max(score, 95)
            
        return max(0, min(100, score))


def create_comprehensive_test_data() -> Dict[str, Any]:
    """Create comprehensive test data with all possible fields"""
    
    return {
        "url": "https://test.example.com/page",
        "title": "Test Page Title - Comprehensive SEO Analysis",
        "meta_description": "This is a comprehensive test page for SEO rule validation with proper meta description length.",
        "content_text": "This is comprehensive content text for testing SEO rules. It contains multiple paragraphs and sufficient word count to pass content validation rules. The content includes keywords like SEO, analysis, testing, and validation to ensure keyword-based rules can be properly evaluated.",
        "word_count": 85,
        "headings": {
            "h1": ["Main Heading for SEO Testing"],
            "h2": ["Subheading One", "Subheading Two", "Subheading Three"],
            "h3": ["Sub-subheading", "Another Sub-subheading"],
            "h4": ["Fourth Level Heading"],
            "h5": [],
            "h6": []
        },
        "images": [
            {"src": "https://example.com/image1.jpg", "alt": "Descriptive alt text for image 1"},
            {"src": "https://example.com/image2.png", "alt": ""},
            {"src": "https://example.com/image3.webp", "alt": "Modern format image with good description"}
        ],
        "canonical": "https://test.example.com/page",
        "viewport": "width=device-width, initial-scale=1",
        "meta_tags": {
            "charset": "UTF-8",
            "robots": "index, follow",
            "author": "Test Author",
            "keywords": "SEO, testing, validation, analysis"
        },
        "og_tags": {
            "title": "Test Page - Social Media Title",
            "description": "Social media description for comprehensive testing",
            "image": "https://example.com/social-image.jpg",
            "url": "https://test.example.com/page",
            "type": "website"
        },
        "social": {
            "pinterest": {
                "media": "https://example.com/pinterest-image.jpg",
                "description": "Pinterest description for testing"
            }
        },
        "structured_data": [
            {
                "@context": "https://schema.org",
                "@type": "Article",
                "name": "Test Article",
                "description": "Test article description",
                "url": "https://test.example.com/page",
                "author": {
                    "@type": "Person",
                    "name": "Test Author"
                }
            }
        ],
        "performance": {
            "largest_contentful_paint": 2.1,
            "cumulative_layout_shift": 0.08,
            "total_blocking_time": 150,
            "first_contentful_paint": 1.2,
            "speed_index": 2.8
        },
        "headless": {
            "axe_violations": {
                "critical": 0,
                "serious": 2,
                "moderate": 5
            },
            "dom_element_count": 250,
            "has_viewport": True,
            "has_lang_attribute": True,
            "html_lang": "en"
        },
        "hreflangs": [
            {"lang": "en", "url": "https://test.example.com/page"},
            {"lang": "es", "url": "https://test.example.com/es/page"}
        ],
        "html_lang": "en",
        "tracking": {
            "google_analytics": True,
            "facebook_pixel": True
        },
        "scripts": [
            {"src": "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"},
            {"src": "https://connect.facebook.net/en_US/fbevents.js"}
        ]
    }


def main():
    """Main validation execution"""
    
    print("=" * 80)
    print("STRICT RULE ENGINE VALIDATION")
    print("=" * 80)
    
    # Create comprehensive test data
    test_data = create_comprehensive_test_data()
    print(f"Created test data with {len(test_data)} keys")
    
    # Run validation
    validator = StrictRuleEngineValidator()
    results = validator.validate_rule_engine_integrity(test_data)
    
    # Display results
    print("\nVALIDATION RESULTS:")
    print("-" * 40)
    print(f"Total Rules Checked: {results['total_rules_checked']}")
    print(f"Fully Valid Rules: {results['fully_valid_rules']}")
    print(f"Rules with Data Mapping Issues: {results['rules_with_data_mapping_issue']}")
    print(f"Rules with Logic Issues: {results['rules_with_logic_issue']}")
    print(f"Rules with Silent Pass Risk: {results['rules_with_silent_pass_risk']}")
    print(f"Overall Engine Reliability: {results['overall_engine_reliability']}%")
    
    # Save detailed results
    with open("rule_engine_validation_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nDetailed results saved to: rule_engine_validation_results.json")
    
    # Show sample of problematic rules
    print("\nSAMPLE PROBLEMATIC RULES:")
    print("-" * 40)
    problematic_rules = [r for r in results["rule_validations"] if r["engine_confidence_score"] < 80]
    for rule in problematic_rules[:5]:  # Show first 5
        print(f"Rule: {rule['rule_name']} - Score: {rule['engine_confidence_score']}")
        print(f"  Issues: Data Present={rule['required_data_present']}, "
              f"Logic Consistent={rule['logic_consistent']}, "
              f"Silent Pass Risk={rule['silent_pass_risk']}")
    
    return results


if __name__ == "__main__":
    results = main()
    print(json.dumps({
        "total_rules_checked": results["total_rules_checked"],
        "fully_valid_rules": results["fully_valid_rules"],
        "rules_with_data_mapping_issue": results["rules_with_data_mapping_issue"],
        "rules_with_logic_issue": results["rules_with_logic_issue"],
        "rules_with_silent_pass_risk": results["rules_with_silent_pass_risk"],
        "overall_engine_reliability": results["overall_engine_reliability"]
    }, indent=2))
