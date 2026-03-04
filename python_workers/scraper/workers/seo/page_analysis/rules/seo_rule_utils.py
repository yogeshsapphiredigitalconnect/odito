"""
SEO Rule Utilities — Shared Helpers

Centralised helper functions used across multiple SEO rule category files.
Import these instead of redefining them locally.
"""

from urllib.parse import urlparse


# ── Primary Keyword Extraction ────────────────────────────────

def _keyword_from_context(normalized):
    """
    Extract primary keyword with this priority order:
    1. Project-level target_keyword field (if present in normalized)
    2. Job-level primary_keyword field (if present in normalized)
    3. meta_tags.keywords[0] (if meaningful — not empty, >= 3 chars)
    4. First H1 text as fallback (if >= 3 chars)
    Returns lowercase string or None.
    """
    # 1. Project-level target keyword
    target_kw = normalized.get("target_keyword", "")
    if target_kw and isinstance(target_kw, str):
        target_kw = target_kw.strip().lower()
        if len(target_kw) >= 3:
            return target_kw

    # 2. Job-level primary keyword
    primary_kw = normalized.get("primary_keyword", "")
    if primary_kw and isinstance(primary_kw, str):
        primary_kw = primary_kw.strip().lower()
        if len(primary_kw) >= 3:
            return primary_kw

    # 3. meta_tags.keywords[0]
    meta_tags = normalized.get("meta_tags", {})
    keywords_list = meta_tags.get("keywords", [])
    if keywords_list and isinstance(keywords_list, list) and keywords_list[0]:
        kw = keywords_list[0]
        if isinstance(kw, str):
            keyword = kw.split(",")[0].strip().lower()
            if keyword and len(keyword) >= 3:
                return keyword

    # Priority 4: H1 fallback — only use if it looks like a real keyword
    # (not a full sentence, not a site name pattern, not too long)
    headings = normalized.get("headings", [])
    if isinstance(headings, list):
        for h in headings:
            if isinstance(h, dict) and h.get("tag") == "h1":
                text = h.get("text", "").strip().lower()
                word_count = len(text.split())
                # Reject: too long, too short, or looks like a sentence
                if (3 <= len(text) <= 40 
                    and word_count <= 5
                    and " - " not in text
                    and " | " not in text
                    and not text.endswith((".com", ".net", ".org"))):
                    return text
    
    # No usable keyword found
    return None


# ── Schema Helpers ────────────────────────────────────────────

def _get_schemas(normalized):
    """Get structured data list from normalized data."""
    return normalized.get("structured_data", [])


def _find_schema_by_type(schemas, type_name):
    """Find first schema dict matching a given @type."""
    for s in schemas:
        if isinstance(s, dict):
            schema_type = s.get("@type", "")
            if isinstance(schema_type, list):
                if type_name in schema_type:
                    return s
            elif schema_type == type_name:
                return s
    return None


def _is_valid_https_url(url_str):
    """Check whether a URL string is a valid HTTPS URL."""
    if not url_str:
        return False
    try:
        parsed = urlparse(str(url_str).strip())
        return parsed.scheme == "https" and bool(parsed.netloc)
    except Exception:
        return False


def _is_valid_url(url_str):
    """Check whether a URL string is a valid HTTP or HTTPS URL."""
    if not url_str:
        return False
    try:
        parsed = urlparse(str(url_str).strip())
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False


# ── Performance Helpers ───────────────────────────────────────

def _get_perf(normalized, device="mobile"):
    """Get performance data dict for a given device type."""
    perf = normalized.get("performance", {})
    if isinstance(perf, dict):
        # Try device-nested first: {"mobile": {...}}
        if device in perf:
            return perf[device]
        # Flat dict fallback (direct metrics)
        if "performance_score" in perf:
            return perf
    return {}


# ── Accessibility / Headless Helpers ──────────────────────────

def _get_headless(normalized):
    """Get headless data dict."""
    return normalized.get("headless", {})


def _get_axe(normalized):
    """Get axe-core violations list from headless data."""
    headless = _get_headless(normalized)
    return headless.get("axeViolations", [])


def _get_dom_metrics(normalized):
    """Get DOM metrics dict from headless data."""
    headless = _get_headless(normalized)
    return headless.get("domMetrics", {})


def _get_keyboard(normalized):
    """Get keyboard analysis dict from headless data."""
    headless = _get_headless(normalized)
    return headless.get("keyboard_analysis", {})
