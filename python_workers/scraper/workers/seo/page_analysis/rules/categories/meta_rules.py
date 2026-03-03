"""
Meta SEO Rules (Rules 21–42)

Rules for meta description, meta keywords, HTML lang, language meta,
charset, robots meta, and author validation.
"""

import re
from ..base_seo_rule import BaseSEORuleV2
from ..utils import safe_str


# ── Helpers ───────────────────────────────────────────────────

FILLER_WORDS = {
    "best", "top", "amazing", "awesome", "incredible",
    "ultimate", "ever", "guaranteed",
}

VALID_ROBOT_DIRECTIVES = {
    "index", "noindex", "follow", "nofollow", "none", "all",
    "noarchive", "nosnippet", "noimageindex", "notranslate",
    "max-snippet", "max-image-preview", "max-video-preview",
    "nositelinkssearchbox", "noodp", "unavailable_after",
}

ISO_639_1_CODES = {
    "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av",
    "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo",
    "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv",
    "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es",
    "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga",
    "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr",
    "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik",
    "io", "is", "it", "iu", "ja", "jv", "ka", "kg", "ki", "kj",
    "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw",
    "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv",
    "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my",
    "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv",
    "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps",
    "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd",
    "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr",
    "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti",
    "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug",
    "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi",
    "yo", "za", "zh", "zu",
}


def _keyword_from_context(normalized):
    """Extract primary keyword from meta keywords or first H1."""
    meta_tags = normalized.get("meta_tags", {})
    keywords_list = meta_tags.get("keywords", [])
    if keywords_list and isinstance(keywords_list, list) and keywords_list[0]:
        kw = keywords_list[0]
        if isinstance(kw, str):
            # take first keyword if comma-separated
            keyword = kw.split(",")[0].strip().lower()
            # Validate keyword quality
            if keyword and len(keyword) >= 3:
                return keyword
    # fallback: use H1 text
    headings = normalized.get("headings", [])
    for h in headings:
        if h.get("tag") == "h1" and h.get("text", "").strip():
            keyword = h["text"].strip().lower()
            if keyword and len(keyword) >= 3:
                return keyword
    return None


# ═══════════════════════════════════════════════════════════════
# META DESCRIPTION (Rules 21–25)
# ═══════════════════════════════════════════════════════════════

class MetaDescEmptyRule(BaseSEORuleV2):
    rule_id = "META_DESC_EMPTY"
    rule_no = 21
    category = "Meta Description"
    severity = "high"
    description = "Meta description must not be empty"

    def evaluate(self, normalized, job_id, project_id, url):
        if not normalized.get("meta_description"):
            return [self.create_issue(
                job_id, project_id, url,
                "Meta description is empty or missing",
                None, "A compelling meta description (50–160 characters)",
                data_key="meta_description"
            )]
        return []


class MetaDescLengthRule(BaseSEORuleV2):
    rule_id = "META_DESC_LENGTH"
    rule_no = 22
    category = "Meta Description"
    severity = "high"
    description = "Meta description length should be 50–160 characters"

    def evaluate(self, normalized, job_id, project_id, url):
        desc = safe_str(normalized.get("meta_description", ""))
        if not desc:
            return []
        length = len(desc)
        if length < 50 or length > 160:
            return [self.create_issue(
                job_id, project_id, url,
                f"Meta description length is {length} characters (should be 50–160)",
                length, "50–160 characters",
                data_key="meta_description"
            )]
        return []


class MetaDescMissingKeywordRule(BaseSEORuleV2):
    rule_id = "META_DESC_MISSING_KEYWORD"
    rule_no = 23
    category = "Meta Description"
    severity = "high"
    description = "Meta description must include primary keyword"

    def evaluate(self, normalized, job_id, project_id, url):
        desc = safe_str(normalized.get("meta_description", ""))
        if not desc:
            return []
        keyword = _keyword_from_context(normalized)
        if not keyword:
            return []  # Cannot check without a valid keyword
        if keyword.lower() not in desc.lower():
            return [self.create_issue(
                job_id, project_id, url,
                "Meta description does not contain primary keyword",
                desc[:80], f"Include keyword: {keyword}",
                data_key="meta_description"
            )]
        return []


class MetaDescFillerWordsRule(BaseSEORuleV2):
    rule_id = "META_DESC_FILLER_WORDS"
    rule_no = 24
    category = "Meta Description"
    severity = "medium"
    description = "Avoid filler words in meta description"

    def evaluate(self, normalized, job_id, project_id, url):
        desc = safe_str(normalized.get("meta_description", ""))
        if desc:
            desc_words = set(desc.lower().split())
            found = desc_words & FILLER_WORDS
            if found:
                return [self.create_issue(
                    job_id, project_id, url,
                    "Meta description contains filler words",
                    ", ".join(found), "Remove filler words",
                    data_key="meta_description"
                )]
        return []


# Rule 25 (match page content) — skipped: requires NLP/semantic analysis


# ═══════════════════════════════════════════════════════════════
# META KEYWORDS (Rules 26–28)
# ═══════════════════════════════════════════════════════════════

class MetaKeywordsCountRule(BaseSEORuleV2):
    rule_id = "META_KEYWORDS_COUNT"
    rule_no = 26
    category = "Meta Keywords"
    severity = "medium"
    description = "Meta keywords should be reasonable (1–10)"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        keywords_raw = meta_tags.get("keywords", [])
        if keywords_raw and isinstance(keywords_raw, list) and keywords_raw[0]:
            kw_str = keywords_raw[0] if isinstance(keywords_raw[0], str) else ""
            if kw_str:
                kw_list = [k.strip() for k in kw_str.split(",") if k.strip()]
                if len(kw_list) > 10:
                    return [self.create_issue(
                        job_id, project_id, url,
                        f"Too many meta keywords ({len(kw_list)})",
                        len(kw_list), "1–10 keywords recommended",
                        data_key="meta_tags", data_path="keywords"
                    )]
        return []


class MetaKeywordsIncludesPrimaryRule(BaseSEORuleV2):
    rule_id = "META_KEYWORDS_INCLUDES_PRIMARY"
    rule_no = 27
    category = "Meta Keywords"
    severity = "medium"
    description = "Meta keywords should include primary keyword"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        keywords_raw = meta_tags.get("keywords", [])
        if not keywords_raw or not isinstance(keywords_raw, list) or not keywords_raw[0]:
            return []
        kw_str = keywords_raw[0] if isinstance(keywords_raw[0], str) else ""
        keyword = _keyword_from_context(normalized)
        if keyword and kw_str and keyword.lower() not in kw_str.lower():
            return [self.create_issue(
                job_id, project_id, url,
                "Meta keywords do not include primary keyword",
                kw_str[:80], f"Include: {keyword}",
                data_key="meta_tags", data_path="keywords"
            )]
        return []


class MetaKeywordsHtmlTagsRule(BaseSEORuleV2):
    rule_id = "META_KEYWORDS_HTML_TAGS"
    rule_no = 28
    category = "Meta Keywords"
    severity = "high"
    description = "Meta keywords should not contain HTML tags"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        keywords_raw = meta_tags.get("keywords", [])
        if keywords_raw and isinstance(keywords_raw, list) and keywords_raw[0]:
            kw_str = str(keywords_raw[0])
            if re.search(r'<[^>]+>', kw_str):
                return [self.create_issue(
                    job_id, project_id, url,
                    "Meta keywords contain HTML tags",
                    kw_str[:80], "Remove HTML from keywords",
                    data_key="meta_tags", data_path="keywords"
                )]
        return []


# ═══════════════════════════════════════════════════════════════
# LANGUAGE META TAG (Rules 31, 33)
# ═══════════════════════════════════════════════════════════════

class LangMetaValidCodeRule(BaseSEORuleV2):
    rule_id = "LANG_META_VALID_CODE"
    rule_no = 31
    category = "Language"
    severity = "high"
    description = "HTML lang attribute must be a valid ISO 639-1 code"

    def evaluate(self, normalized, job_id, project_id, url):
        html_lang = normalized.get("html_lang", "")
        if html_lang:
            # Extract primary lang subtag (e.g. "en" from "en-US")
            primary = html_lang.strip().lower().split("-")[0]
            if primary and primary not in ISO_639_1_CODES:
                return [self.create_issue(
                    job_id, project_id, url,
                    f"Invalid language code: {html_lang}",
                    html_lang, "Use valid ISO 639-1 code (e.g. en, fr, de)",
                    data_key="html_lang"
                )]
        return []


class LangMetaTagNameRule(BaseSEORuleV2):
    rule_id = "LANG_META_TAG_NAME"
    rule_no = 33
    category = "Language"
    severity = "medium"
    description = "Language meta tag should use meta[name=language]"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        has_lang_meta = "language" in meta_tags or "content-language" in meta_tags
        has_html_lang = bool(normalized.get("html_lang"))
        # Only warn if no language signal at all
        if not has_lang_meta and not has_html_lang:
            return [self.create_issue(
                job_id, project_id, url,
                "No language declaration found",
                "None", "Add html lang attribute or meta[name=language]",
                data_key="html_lang"
            )]
        return []


# ═══════════════════════════════════════════════════════════════
# CHARSET (Rules 34–36)
# ═══════════════════════════════════════════════════════════════

class CharsetPresentRule(BaseSEORuleV2):
    rule_id = "CHARSET_PRESENT"
    rule_no = 34
    category = "Technical"
    severity = "high"
    description = "Charset meta tag must be present"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        has_charset = "charset" in meta_tags or "content-type" in meta_tags
        if not has_charset:
            return [self.create_issue(
                job_id, project_id, url,
                "Charset meta tag is missing",
                "None", '<meta charset="UTF-8">',
                data_key="meta_tags"
            )]
        return []


class CharsetValidEncodingRule(BaseSEORuleV2):
    rule_id = "CHARSET_VALID_ENCODING"
    rule_no = 35
    category = "Technical"
    severity = "high"
    description = "Charset should be valid encoding (UTF-8 preferred)"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        charset_values = meta_tags.get("charset", [])
        if charset_values and isinstance(charset_values, list):
            charset = str(charset_values[0]).strip().lower() if charset_values[0] else ""
            if charset and charset not in ("utf-8", "utf8"):
                return [self.create_issue(
                    job_id, project_id, url,
                    f"Charset is {charset} (UTF-8 recommended)",
                    charset, "UTF-8",
                    data_key="meta_tags", data_path="charset"
                )]
        return []


class CharsetTagNameRule(BaseSEORuleV2):
    rule_id = "CHARSET_TAG_NAME"
    rule_no = 36
    category = "Technical"
    severity = "high"
    description = "Charset should use meta[charset] format"

    def evaluate(self, normalized, job_id, project_id, url):
        # Best-effort: check for presence of charset in meta_tags
        meta_tags = normalized.get("meta_tags", {})
        has_charset_attr = "charset" in meta_tags
        has_content_type = "content-type" in meta_tags
        if not has_charset_attr and has_content_type:
            return [self.create_issue(
                job_id, project_id, url,
                "Charset declared via content-type instead of meta[charset]",
                "content-type header", 'Use <meta charset="UTF-8">',
                data_key="meta_tags"
            )]
        return []


# ═══════════════════════════════════════════════════════════════
# ROBOTS META (Rules 37–40)
# ═══════════════════════════════════════════════════════════════

class RobotsMetaPresentRule(BaseSEORuleV2):
    rule_id = "ROBOTS_META_PRESENT"
    rule_no = 37
    category = "Technical"
    severity = "info"
    description = "Robots meta tag should be present"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        if "robots" not in meta_tags:
            return [self.create_issue(
                job_id, project_id, url,
                "Robots meta tag is missing",
                "None", '<meta name="robots" content="index, follow">',
                data_key="meta_tags"
            )]
        return []


class RobotsMetaNotEmptyRule(BaseSEORuleV2):
    rule_id = "ROBOTS_META_NOT_EMPTY"
    rule_no = 38
    category = "Technical"
    severity = "high"
    description = "Robots meta tag content must not be empty"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        robots_list = meta_tags.get("robots", [])
        if isinstance(robots_list, list) and robots_list:
            content = str(robots_list[0]).strip() if robots_list[0] else ""
            if not content:
                return [self.create_issue(
                    job_id, project_id, url,
                    "Robots meta tag is empty",
                    "Empty", "Specify directives (e.g. index, follow)",
                    data_key="meta_tags", data_path="robots"
                )]
        return []


class RobotsMetaValidDirectivesRule(BaseSEORuleV2):
    rule_id = "ROBOTS_META_VALID_DIRECTIVES"
    rule_no = 39
    category = "Technical"
    severity = "high"
    description = "All robots directives must be valid"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        robots_list = meta_tags.get("robots", [])
        if isinstance(robots_list, list) and robots_list:
            content = str(robots_list[0]).strip() if robots_list[0] else ""
            if content:
                directives = [d.strip().lower().split(":")[0] for d in content.split(",")]
                invalid = [d for d in directives if d and d not in VALID_ROBOT_DIRECTIVES]
                if invalid:
                    return [self.create_issue(
                        job_id, project_id, url,
                        f"Invalid robots directives: {', '.join(invalid)}",
                        content, f"Valid: {', '.join(sorted(VALID_ROBOT_DIRECTIVES)[:6])}…",
                        data_key="meta_tags", data_path="robots"
                    )]
        return []


class RobotsMetaConflictingRule(BaseSEORuleV2):
    rule_id = "ROBOTS_META_CONFLICTING"
    rule_no = 40
    category = "Technical"
    severity = "high"
    description = "No conflicting robots directives"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        robots_list = meta_tags.get("robots", [])
        if isinstance(robots_list, list) and robots_list:
            content = str(robots_list[0]).strip().lower() if robots_list[0] else ""
            if content:
                directives = {d.strip().split(":")[0] for d in content.split(",")}
                conflicts = []
                if "index" in directives and "noindex" in directives:
                    conflicts.append("index + noindex")
                if "follow" in directives and "nofollow" in directives:
                    conflicts.append("follow + nofollow")
                if "all" in directives and ("noindex" in directives or "nofollow" in directives):
                    conflicts.append("all + noindex/nofollow")
                if conflicts:
                    return [self.create_issue(
                        job_id, project_id, url,
                        f"Conflicting robots directives: {', '.join(conflicts)}",
                        content, "Remove conflicting directives",
                        data_key="meta_tags", data_path="robots"
                    )]
        return []


# ═══════════════════════════════════════════════════════════════
# AUTHOR (Rules 41–42)
# ═══════════════════════════════════════════════════════════════

class AuthorPresentRule(BaseSEORuleV2):
    rule_id = "AUTHOR_PRESENT"
    rule_no = 41
    category = "Technical"
    severity = "info"
    description = "Author meta tag should be present"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        if "author" not in meta_tags:
            return [self.create_issue(
                job_id, project_id, url,
                "Author meta tag is missing",
                "None", '<meta name="author" content="Author Name">',
                data_key="meta_tags"
            )]
        return []


class AuthorLengthRule(BaseSEORuleV2):
    rule_id = "AUTHOR_LENGTH"
    rule_no = 42
    category = "Technical"
    severity = "low"
    description = "Author name should be ≤100 characters"

    def evaluate(self, normalized, job_id, project_id, url):
        meta_tags = normalized.get("meta_tags", {})
        author_list = meta_tags.get("author", [])
        if isinstance(author_list, list) and author_list:
            author = str(author_list[0]).strip() if author_list[0] else ""
            if author and len(author) > 100:
                return [self.create_issue(
                    job_id, project_id, url,
                    f"Author name too long ({len(author)} chars)",
                    author[:80], "≤100 characters",
                    data_key="meta_tags", data_path="author"
                )]
        return []


# ── Registration ──────────────────────────────────────────────

def register_meta_rules(registry):
    """Register all Meta category rules"""
    # Meta Description (21–24)
    registry.register(MetaDescEmptyRule())
    registry.register(MetaDescLengthRule())
    registry.register(MetaDescMissingKeywordRule())
    registry.register(MetaDescFillerWordsRule())
    # Meta Keywords (26–28)
    registry.register(MetaKeywordsCountRule())
    registry.register(MetaKeywordsIncludesPrimaryRule())
    registry.register(MetaKeywordsHtmlTagsRule())
    # Language (31, 33)
    registry.register(LangMetaValidCodeRule())
    registry.register(LangMetaTagNameRule())
    # Charset (34–36)
    registry.register(CharsetPresentRule())
    registry.register(CharsetValidEncodingRule())
    registry.register(CharsetTagNameRule())
    # Robots (37–40)
    registry.register(RobotsMetaPresentRule())
    registry.register(RobotsMetaNotEmptyRule())
    registry.register(RobotsMetaValidDirectivesRule())
    registry.register(RobotsMetaConflictingRule())
    # Author (41–42)
    registry.register(AuthorPresentRule())
    registry.register(AuthorLengthRule())
