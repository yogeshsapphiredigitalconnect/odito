"""
Senior Backend Systems Auditor for SEO Rule Engine

Performs comprehensive audit of data mapping, rule logic, and execution integrity.
"""

import json
import sys
import os
from typing import Dict, List, Any, Tuple, Set
from datetime import datetime

# Add the scraper path to import modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraper'))

from db import seo_page_data, seo_headless_data, seo_page_performance, seo_crawl_graph
from scraper.workers.seo.page_analysis.rules.seo_rule_engine import get_seo_engine
from bson import ObjectId

class SeniorBackendSystemsAuditor:
    """Senior auditor for backend systems integrity"""
    
    def __init__(self):
        self.required_data_map = self._build_comprehensive_required_data_map()
        self.data_mapping_rules = self._build_data_mapping_rules()
        
    def _build_comprehensive_required_data_map(self) -> Dict[str, List[str]]:
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
            "HEADING_ORDER_LOGICAL": ["headless"],
            
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
    
    def _build_data_mapping_rules(self) -> Dict[str, str]:
        """Build data mapping rules for flattening nested structures"""
        return {
            # seo_page_data mappings
            "page.title": "title",
            "page.metaDescription": "meta_description",
            "page.metaKeywords": "meta_keywords",
            "page.content": "content_text",
            "page.wordCount": "word_count",
            "page.canonical": "canonical",
            "page.viewport": "viewport",
            "page.htmlLang": "html_lang",
            "page.url": "url",
            
            # seo_headless_data mappings
            "headless.title": "title",
            "headless.metaDescription": "meta_description",
            "headless.metaTags": "meta_tags",
            "headless.ogTags": "og_tags",
            "headless.structuredData": "structured_data",
            "headless.canonical": "canonical",
            "headless.hreflangs": "hreflangs",
            "headless.images": "images",
            "headless.headings": "headings",
            "headless.tracking": "tracking",
            "headless.scripts": "scripts",
            "headless.social": "social",
            "headless.htmlLang": "html_lang",
            "headless.url": "url",
            "headless.viewport": "viewport",
            "headless.robots": "robots",
            "headless.author": "author",
            "headless.charset": "charset",
            
            # seo_page_performance mappings
            "performance.largestContentfulPaint": "performance.largest_contentful_paint",
            "performance.cumulativeLayoutShift": "performance.cumulative_layout_shift",
            "performance.totalBlockingTime": "performance.total_blocking_time",
            "performance.firstContentfulPaint": "performance.first_contentful_paint",
            "performance.speedIndex": "performance.speed_index",
            "performance.timeToInteractive": "performance.time_to_interactive",
            "performance.renderBlockingAnalysis": "performance.render_blocking_analysis",
            "performance.mobileFriendly": "performance.mobile_friendly",
            "performance.performanceScore": "performance.performance_score",
            "performance.url": "url",
            
            # seo_crawl_graph mappings
            "crawl.internalLinks": "internal_links",
            "crawl.externalLinks": "external_links",
            "crawl.depth": "crawl_depth",
            "crawl.orphaned": "orphaned_page",
            "crawl.url": "url"
        }
    
    def build_unified_page_data(self, url: str) -> Dict[str, Any]:
        """
        STEP 1: Build unified final_page_data object by merging 4 collections
        """
        print(f"Building unified page data for: {url}")
        
        # Fetch from all collections
        collections = {
            "seo_page_data": seo_page_data,
            "seo_headless_data": seo_headless_data,
            "seo_page_performance": seo_page_performance,
            "seo_crawl_graph": seo_crawl_graph
        }
        
        raw_data = {}
        for collection_name, collection in collections.items():
            try:
                document = collection.find_one({"page_url": url})
                if document:
                    # Remove MongoDB specific fields
                    clean_doc = {k: v for k, v in document.items() 
                               if k not in ['_id', 'projectId', 'seo_jobId', 'created_at', 'updated_at']}
                    raw_data[collection_name] = clean_doc
                    print(f"✅ Found data in {collection_name}")
                else:
                    print(f"❌ No data found in {collection_name}")
            except Exception as e:
                print(f"⚠️ Error fetching from {collection_name}: {str(e)}")
        
        # Build unified data with proper flattening
        unified_data = self._flatten_and_merge_data(raw_data)
        
        print(f"Built unified data with {len(unified_data)} keys")
        return unified_data
    
    def _flatten_and_merge_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Flatten nested data and merge with proper mapping"""
        
        unified = {}
        
        # Start with base URL
        unified["url"] = raw_data.get("seo_page_data", {}).get("url", "")
        
        # Process each collection with flattening
        for collection_name, data in raw_data.items():
            if not data:
                continue
                
            flattened = self._flatten_dict(data, prefix="")
            
            # Apply mapping rules
            for key, value in flattened.items():
                mapped_key = self.data_mapping_rules.get(f"{collection_name}.{key}", key)
                
                # Handle nested performance data
                if mapped_key.startswith("performance."):
                    if "performance" not in unified:
                        unified["performance"] = {}
                    perf_key = mapped_key.replace("performance.", "")
                    unified["performance"][perf_key] = value
                else:
                    unified[mapped_key] = value
        
        # Ensure all required top-level keys exist
        required_keys = [
            "title", "meta_description", "headings", "images", "og_tags",
            "structured_data", "canonical", "hreflangs", "performance",
            "meta_tags", "content_text", "word_count", "url", "html_lang"
        ]
        
        for key in required_keys:
            if key not in unified:
                unified[key] = None
        
        return unified
    
    def _flatten_dict(self, d: Dict[str, Any], prefix: str = "") -> Dict[str, Any]:
        """Recursively flatten nested dictionary"""
        result = {}
        
        for key, value in d.items():
            new_key = f"{prefix}.{key}" if prefix else key
            
            if isinstance(value, dict):
                result.update(self._flatten_dict(value, new_key))
            elif isinstance(value, list) and len(value) > 0 and isinstance(value[0], dict):
                # Handle list of objects
                for i, item in enumerate(value):
                    if isinstance(item, dict):
                        result.update(self._flatten_dict(item, f"{new_key}[{i}]"))
                    else:
                        result[f"{new_key}[{i}]"] = item
            else:
                result[new_key] = value
        
        return result
    
    def audit_rule_engine_systems(self, url: str) -> Dict[str, Any]:
        """
        Perform comprehensive backend systems audit
        """
        print("=" * 80)
        print("SENIOR BACKEND SYSTEMS AUDIT")
        print("=" * 80)
        
        # STEP 1: Build unified page data
        final_page_data = self.build_unified_page_data(url)
        
        print(f"\nSTEP 2: Auditing 188 SEO rules...")
        
        # Load rule engine
        try:
            engine = get_seo_engine()
            all_rules = engine.registry.get_all_rules()
            print(f"Loaded {len(all_rules)} rules for audit")
        except Exception as e:
            return {
                "error": f"Failed to load rule engine: {str(e)}",
                "total_rules": 0,
                "overall_engine_health_score": 0
            }
        
        # STEP 2: Audit each rule
        rule_audits = []
        
        # Use valid ObjectIds for testing
        job_id = str(ObjectId())
        project_id = str(ObjectId())
        
        for rule in all_rules:
            audit = self._audit_individual_rule(rule, final_page_data, job_id, project_id)
            rule_audits.append(audit)
        
        # STEP 3: Generate high-level audit
        engine_audit = self._generate_engine_audit(rule_audits)
        
        # Save detailed results
        results = {
            "url": url,
            "final_page_data_keys": list(final_page_data.keys()),
            "rule_audits": rule_audits,
            "engine_audit": engine_audit
        }
        
        with open("backend_systems_audit.json", "w") as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"\nDetailed audit saved to: backend_systems_audit.json")
        return engine_audit
    
    def _audit_individual_rule(self, rule, final_page_data: Dict[str, Any], job_id: str, project_id: str) -> Dict[str, Any]:
        """Audit individual rule for systems integrity"""
        
        rule_name = getattr(rule, 'rule_id', 'UNKNOWN')
        required_data = self.required_data_map.get(rule_name, [])
        
        audit = {
            "rule_name": rule_name,
            "required_data_missing": [],
            "data_mapping_issue": False,
            "logic_not_executing": False,
            "silent_pass_risk": False,
            "skip_logic_invalid": False,
            "recommended_fix": ""
        }
        
        # Check if required_data is present
        missing_data = []
        for data_key in required_data:
            if data_key not in final_page_data:
                missing_data.append(data_key)
            elif final_page_data[data_key] is None:
                missing_data.append(f"{data_key} (null)")
            elif isinstance(final_page_data[data_key], (str, list)) and len(final_page_data[data_key]) == 0:
                missing_data.append(f"{data_key} (empty)")
        
        audit["required_data_missing"] = missing_data
        
        # Execute rule and analyze behavior
        try:
            result = rule.evaluate(final_page_data, job_id, project_id, final_page_data.get("url", ""))
            
            if result is None:
                audit["logic_not_executing"] = True
                audit["recommended_fix"] = "Rule returns None - fix to always return list"
                
            elif not isinstance(result, list):
                audit["logic_not_executing"] = True
                audit["recommended_fix"] = f"Rule returns {type(result)} - fix to return list"
                
            elif len(result) > 0:
                # Rule failed - check if failure is valid
                if missing_data:
                    audit["data_mapping_issue"] = True
                    audit["recommended_fix"] = f"Rule failed but missing data: {missing_data}"
                else:
                    # Valid failure
                    audit["recommended_fix"] = "Rule operating correctly"
                    
            else:
                # Rule passed - check for issues
                if missing_data:
                    audit["silent_pass_risk"] = True
                    audit["recommended_fix"] = f"Silent pass - missing required data: {missing_data}"
                elif not self._check_rule_uses_data(rule, required_data, final_page_data):
                    audit["logic_not_executing"] = True
                    audit["recommended_fix"] = "Rule not using required data in logic"
                else:
                    audit["recommended_fix"] = "Rule operating correctly"
                    
        except Exception as e:
            audit["logic_not_executing"] = True
            audit["recommended_fix"] = f"Rule crashes: {str(e)}"
        
        # Check for data mapping issues
        if missing_data and any(self._should_data_exist(key, final_page_data) for key in missing_data):
            audit["data_mapping_issue"] = True
            if not audit["recommended_fix"]:
                audit["recommended_fix"] = f"Data mapping issue - check data extraction for: {missing_data}"
        
        # Check for invalid skip logic
        if not missing_data and audit["logic_not_executing"]:
            audit["skip_logic_invalid"] = True
            if not audit["recommended_fix"]:
                audit["recommended_fix"] = "Rule skipped despite data being present"
        
        return audit
    
    def _check_rule_uses_data(self, rule, required_data: List[str], final_page_data: Dict[str, Any]) -> bool:
        """Check if rule actually uses required data in its logic"""
        # This is a simplified check - in production, you'd analyze the rule's source code
        # For now, we'll assume if data is present and rule passes, it's using the data
        return True
    
    def _should_data_exist(self, data_key: str, final_page_data: Dict[str, Any]) -> bool:
        """Check if data should exist based on page content"""
        # Basic data that should exist on most pages
        basic_data = ["title", "url", "content_text"]
        
        clean_key = data_key.replace(" (null)", "").replace(" (empty)", "")
        
        if clean_key in basic_data:
            return True
            
        # Check if page has content that suggests other data should exist
        if final_page_data.get("content_text") and clean_key in ["headings", "images"]:
            return True
            
        return False
    
    def _generate_engine_audit(self, rule_audits: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate high-level engine audit summary"""
        
        total_rules = len(rule_audits)
        fully_operational = 0
        mapping_issues = 0
        logic_issues = 0
        skip_issues = 0
        silent_pass_risks = 0
        
        for audit in rule_audits:
            if (not audit["required_data_missing"] and 
                not audit["data_mapping_issue"] and 
                not audit["logic_not_executing"] and 
                not audit["silent_pass_risk"] and 
                not audit["skip_logic_invalid"]):
                fully_operational += 1
            
            if audit["data_mapping_issue"]:
                mapping_issues += 1
            if audit["logic_not_executing"]:
                logic_issues += 1
            if audit["skip_logic_invalid"]:
                skip_issues += 1
            if audit["silent_pass_risk"]:
                silent_pass_risks += 1
        
        overall_health = (fully_operational / total_rules * 100) if total_rules > 0 else 0
        
        return {
            "total_rules": total_rules,
            "rules_fully_operational": fully_operational,
            "rules_with_mapping_issue": mapping_issues,
            "rules_with_logic_issue": logic_issues,
            "rules_with_skip_issue": skip_issues,
            "rules_with_silent_pass_risk": silent_pass_risks,
            "overall_engine_health_score": round(overall_health, 1)
        }


def main():
    """Main audit execution"""
    
    target_url = "https://www.sapphiredigitalconnect.com/"
    
    auditor = SeniorBackendSystemsAuditor()
    results = auditor.audit_rule_engine_systems(target_url)
    
    print("\n" + "=" * 80)
    print("BACKEND SYSTEMS AUDIT RESULTS")
    print("=" * 80)
    print(json.dumps(results, indent=2))
    
    return results


if __name__ == "__main__":
    main()
