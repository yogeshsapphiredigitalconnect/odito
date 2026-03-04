"""
General SEO Rules (Rules 155, 197, 199–201, 208–209)

Cross-cutting rules: word count, content quality, security headers,
AMP, E-E-A-T signals, SGE optimization.
"""

import re
from ..base_seo_rule import BaseSEORuleV2
from ..seo_rule_utils import _keyword_from_context


# ═══════════════════════════════════════════════════════════════
# CONTENT QUALITY (Rules 155, 197)
# ═══════════════════════════════════════════════════════════════

class WordCountMinRule(BaseSEORuleV2):
    rule_id = "WORD_COUNT_MIN"
    rule_no = 184
    category = "Content"
    severity = "high"
    description = "Page should have ≥300 words"

    def evaluate(self, normalized, job_id, project_id, url):
        wc = normalized.get("word_count", 0)
        if wc < 300:
            return [self.create_issue(
                job_id, project_id, url,
                f"Page has only {wc} words (min 300)",
                wc, "≥300 words for content pages",
                data_key="word_count"
            )]
        return []


class WordCountMaxRule(BaseSEORuleV2):
    rule_id = "WORD_COUNT_MAX"
    rule_no = 185
    category = "Content"
    severity = "medium"
    description = "Page should not have excessive word count (≤5000)"

    def evaluate(self, normalized, job_id, project_id, url):
        wc = normalized.get("word_count", 0)
        if wc > 5000:
            return [self.create_issue(
                job_id, project_id, url,
                f"Page has {wc} words (consider splitting)",
                wc, "≤5000 words per page",
                data_key="word_count"
            )]
        return []


class ContentContainsKeywordRule(BaseSEORuleV2):
    rule_id = "CONTENT_CONTAINS_KEYWORD"
    rule_no = 187
    category = "Content"
    severity = "high"
    description = "Content should contain primary keyword"

    def evaluate(self, normalized, job_id, project_id, url):
        keyword = _keyword_from_context(normalized)
        if not keyword:
            return []  # KEYWORD_UNAVAILABLE: issue skipped — no target keyword configured
        content = normalized.get("content_text", "").lower()
        if keyword not in content:
            return [self.create_issue(
                job_id, project_id, url,
                "Content does not contain primary keyword",
                "Not found", f"Include: {keyword}",
                data_key="content_text"
            )]
        return []


class ContentKeywordDensityRule(BaseSEORuleV2):
    rule_id = "CONTENT_KEYWORD_DENSITY"
    rule_no = 188
    category = "Content"
    severity = "high"
    description = "Keyword density should be 1–3%"

    def evaluate(self, normalized, job_id, project_id, url):
        keyword = _keyword_from_context(normalized)
        if not keyword or len(keyword) < 3:
            return []  # KEYWORD_UNAVAILABLE: issue skipped — no target keyword configured
        content = normalized.get("content_text", "").lower()
        wc = normalized.get("word_count", 0)
        if wc < 100:
            return []
        count = content.count(keyword)
        density = (count / wc) * 100 if wc > 0 else 0
        if density > 3:
            return [self.create_issue(
                job_id, project_id, url,
                f"Keyword density is {density:.1f}% (max 3%)",
                f"{density:.1f}%", "1–3%",
                data_key="content_text"
            )]
        return []


# ═══════════════════════════════════════════════════════════════
# SGE / AI OPTIMIZATION (Rule 197)
# ═══════════════════════════════════════════════════════════════

class SgeOptimizedRule(BaseSEORuleV2):
    rule_id = "SGE_OPTIMIZED"
    rule_no = 197
    category = "Content"
    severity = "medium"
    description = "Content should be optimized for AI/SGE"

    def evaluate(self, normalized, job_id, project_id, url):
        # Heuristic: structured data + clear headings + sufficient content
        has_schema = bool(normalized.get("structured_data"))
        wc = normalized.get("word_count", 0)
        headings = normalized.get("headings", [])
        has_h2 = any(h.get("tag") == "h2" for h in headings)
        missing = []
        if not has_schema:
            missing.append("structured data")
        if wc < 300:
            missing.append("sufficient content (≥300 words)")
        if not has_h2:
            missing.append("H2 subheadings")
        if missing:
            return [self.create_issue(
                job_id, project_id, url,
                f"Not optimized for AI/SGE: missing {', '.join(missing)}",
                ", ".join(missing), "Schema + H2s + quality content",
                data_key="content_text"
            )]
        return []


# ═══════════════════════════════════════════════════════════════
# SECURITY (Rules 199–201)
# ═══════════════════════════════════════════════════════════════

# Rule 199 (HTTPS_PAGE) removed — duplicates Rule 178 (HTTPS_ENFORCED) in technical_rules.py


class MixedContentRule(BaseSEORuleV2):
    rule_id = "MIXED_CONTENT"
    rule_no = 200
    category = "Security"
    severity = "high"
    description = "No mixed content (HTTP resources on HTTPS page)"

    def evaluate(self, normalized, job_id, project_id, url):
        page_url = normalized.get("url", "")
        if not page_url or not page_url.startswith("https://"):
            return []
        # Check images for HTTP URLs
        images = normalized.get("images", [])
        http_imgs = [img for img in images if img.get("src", "").startswith("http://")]
        if http_imgs:
            return [self.create_issue(
                job_id, project_id, url,
                f"{len(http_imgs)} HTTP image(s) on HTTPS page (mixed content)",
                len(http_imgs), "All resources must use HTTPS",
                data_key="images"
            )]
        return []


class SecurityHeadersRule(BaseSEORuleV2):
    rule_id = "SECURITY_HEADERS"
    rule_no = 201
    category = "Security"
    severity = "info"
    description = "Security headers should be present"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        # Check for Content-Security-Policy via meta tag
        has_csp = "content-security-policy" in meta_tags
        has_xframe = "x-frame-options" in meta_tags
        if not has_csp:
            return [self.create_issue(
                job_id, project_id, url,
                "Content-Security-Policy not found in meta tags",
                "Missing", "Add CSP header or meta tag",
                data_key="meta_tags"
            )]
        return []


# ═══════════════════════════════════════════════════════════════
# E-E-A-T / TRUST SIGNALS (Rules 208–209)
# ═══════════════════════════════════════════════════════════════

class EeatAuthorInfoRule(BaseSEORuleV2):
    rule_id = "EEAT_AUTHOR_INFO"
    rule_no = 208
    category = "Content"
    severity = "medium"
    description = "Author information should be present (E-E-A-T)"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        has_author = "author" in meta_tags
        # Also check structured data for author
        schemas = normalized.get("structured_data", [])
        has_schema_author = any(
            isinstance(s, dict) and s.get("author")
            for s in schemas
        )
        if not has_author and not has_schema_author:
            return [self.create_issue(
                job_id, project_id, url,
                "Author information not found (E-E-A-T signal)",
                "Missing", "Add author meta tag or schema author field",
                data_key="meta_tags"
            )]
        return []


class EeatContactInfoRule(BaseSEORuleV2):
    rule_id = "EEAT_CONTACT_INFO"
    rule_no = 209
    category = "Content"
    severity = "medium"
    description = "Contact information should be present (E-E-A-T)"

    def evaluate(self, normalized, job_id, project_id, url):
        schemas = normalized.get("structured_data", [])
        has_contact = any(
            isinstance(s, dict) and (
                s.get("@type") in ("Organization", "LocalBusiness") and
                (s.get("telephone") or s.get("email") or s.get("contactPoint"))
            )
            for s in schemas
        )
        if not has_contact:
            return [self.create_issue(
                job_id, project_id, url,
                "Contact info not found in structured data (E-E-A-T)",
                "Missing", "Add telephone/email to Organization schema",
                data_key="structured_data"
            )]
        return []


# ── Registration ──────────────────────────────────────────────

def register_general_rules(registry):
    """Register all General/Content/Security rules"""
    registry.register(WordCountMinRule())
    registry.register(WordCountMaxRule())
    registry.register(ContentContainsKeywordRule())
    registry.register(ContentKeywordDensityRule())
    registry.register(SgeOptimizedRule())
    # HttpsPageRule (199) removed — duplicate of HttpsEnforcedRule (178)
    registry.register(MixedContentRule())
    registry.register(SecurityHeadersRule())
    registry.register(EeatAuthorInfoRule())
    registry.register(EeatContactInfoRule())
