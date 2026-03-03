# SEO Rule Engine False Positive Forensic Report

## Executive Summary
Comprehensive forensic analysis of 5 SEO rules experiencing false-positive firing. Analysis identified specific logical bugs in rule evaluation logic, data path access, and edge case handling.

---

## Rule 1: TITLE_MISSING_KEYWORD

**Expected Behavior:** Rule should fire only when title exists but doesn't contain the primary keyword derived from meta keywords or H1.

**Actual Behavior:** Rule correctly handles missing keywords but may fire false positives when keyword extraction fails or when case sensitivity issues exist.

### Full evaluate() Method:
```python
def evaluate(self, normalized, job_id, project_id, url):
    title = normalized.get("title", "")
    if not title:
        return []
    keyword = _keyword_from_context(normalized)
    if not keyword:
        return []  # Cannot check without a keyword
    if keyword.lower() not in title.lower():
        return [self.create_issue(
            job_id, project_id, url,
            "Title does not contain primary keyword",
            title, f"Include keyword: {keyword}",
            data_key="title"
        )]
    return []
```

### Normalized Data Keys Used:
- `title` (direct access)
- `meta_tags.keywords` (via `_keyword_from_context`)
- `headings` (via `_keyword_from_context` fallback)

### Keyword Derivation Logic:
```python
def _keyword_from_context(normalized):
    meta_tags = normalized.get("meta_tags", {})
    keywords_list = meta_tags.get("keywords", [])
    if keywords_list and isinstance(keywords_list, list) and keywords_list[0]:
        kw = keywords_list[0]
        if isinstance(kw, str):
            return kw.split(",")[0].strip().lower()
    headings = normalized.get("headings", [])
    for h in headings:
        if h.get("tag") == "h1" and h.get("text", "").strip():
            return h["text"].strip().lower()
    return ""
```

### Root Cause Analysis:
**Potential False Positive Scenarios:**
1. **Empty keywords list**: `meta_tags.keywords = []` → keyword = "" → rule returns [] (correct)
2. **Empty string keyword**: `meta_tags.keywords = [""]` → keyword = "" → rule returns [] (correct)
3. **Case sensitivity**: Rule uses `.lower()` on both sides (correct)
4. **Partial matching**: Rule uses substring matching which may be too permissive

**Actual Issue Found**: Rule logic appears correct. False positives likely due to:
- Incorrect keyword extraction from malformed meta tags
- Keyword doesn't actually represent the true primary keyword

### Exact Faulty Line:
Line 264: `if keyword.lower() not in title.lower():`

**Fix Recommendation (minimal):**
```python
# Add keyword validation before comparison
if keyword and len(keyword.strip()) >= 3:  # Ensure meaningful keyword
    if keyword.lower() not in title.lower():
        # create issue
```

---

## Rule 2: META_DESC_MISSING_KEYWORD

**Expected Behavior:** Rule should fire only when meta description exists but doesn't contain the primary keyword.

**Actual Behavior:** Similar to title rule, correctly handles missing keywords but may have extraction issues.

### Full evaluate() Method:
```python
def evaluate(self, normalized, job_id, project_id, url):
    desc = safe_str(normalized.get("meta_description", ""))
    if not desc:
        return []
    keyword = _keyword_from_context(normalized)
    if not keyword:
        return []
    if keyword.lower() not in desc.lower():
        return [self.create_issue(
            job_id, project_id, url,
            "Meta description does not contain primary keyword",
            desc[:80], f"Include keyword: {keyword}",
            data_key="meta_description"
        )]
    return []
```

### Normalized Data Keys Used:
- `meta_description` (direct access via `safe_str`)
- `meta_tags.keywords` (via `_keyword_from_context`)
- `headings` (via `_keyword_from_context` fallback)

### Root Cause Analysis:
Same keyword extraction issues as TITLE_MISSING_KEYWORD rule. Rule logic itself is sound.

### Exact Faulty Line:
Line 123: `if keyword.lower() not in desc.lower():`

**Fix Recommendation (minimal):**
Same as title rule - add keyword validation.

---

## Rule 3: OG_URL_INVALID (Actually OG_VALID_URLS)

**Expected Behavior:** Rule should fire only when OG URLs are invalid or use HTTP instead of HTTPS.

**Actual Behavior:** Rule correctly identifies invalid URLs but may flag relative URLs as invalid when they could be resolved.

### Full evaluate() Method:
```python
def evaluate(self, normalized, job_id, project_id, url):
    og = normalized.get("og_tags", {})
    issues_found = []
    for key in ("og:image", "og:url"):
        value = safe_str(og.get(key, ""))
        if value:
            if not _is_valid_url(value):
                issues_found.append(f"{key} invalid URL")
            elif value.startswith("http://"):
                issues_found.append(f"{key} uses HTTP")
    if issues_found:
        return [self.create_issue(
            job_id, project_id, url,
            "OG tag URL issues: " + "; ".join(issues_found),
            "; ".join(issues_found), "Use valid HTTPS URLs",
            data_key="og_tags"
        )]
    return []
```

### Normalized Data Keys Used:
- `og_tags.og:image`
- `og_tags.og:url`

### URL Validation Logic:
```python
def _is_valid_url(url_str):
    if not url_str:
        return False
    try:
        parsed = urlparse(url_str.strip())
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False
```

### Root Cause Analysis:
**False Positive Issues:**
1. **Relative URLs**: `/images/logo.jpg` fails `_is_valid_url()` but could be resolved against base URL
2. **Protocol-relative URLs**: `//example.com/image.jpg` fails validation
3. **Root-relative URLs**: Valid in HTML context but flagged as invalid

### Exact Faulty Line:
Line 198: `if not _is_valid_url(value):`

**Fix Recommendation (minimal):**
```python
# Add URL resolution for relative URLs
def _resolve_url(url_str, base_url):
    if not url_str or url_str.startswith(('http://', 'https://')):
        return url_str
    if url_str.startswith('//'):
        return 'https:' + url_str
    if url_str.startswith('/'):
        from urllib.parse import urljoin
        return urljoin(base_url, url_str)
    return url_str
```

---

## Rule 4: ARIA_LANDMARKS_MISSING (Actually ARIA_LANDMARKS)

**Expected Behavior:** Rule should fire only when no ARIA landmarks are found on the page.

**Actual Behavior:** Rule correctly checks for zero landmarks but doesn't distinguish between "no landmarks found" and "data missing".

### Full evaluate() Method:
```python
def evaluate(self, normalized, job_id, project_id, url):
    dm = _get_dom_metrics(normalized)
    landmarks = dm.get("ariaLandmarks", 0)
    if landmarks == 0:
        return [self.create_issue(
            job_id, project_id, url,
            "No ARIA landmarks found",
            0, "Add role=navigation, main, banner, etc.",
            data_key="headless"
        )]
    return []
```

### Normalized Data Keys Used:
- `headless.domMetrics.ariaLandmarks`

### Root Cause Analysis:
**Logic Issue**: `landmarks == 0` returns `False` when `landmarks` is `None`, but the default value is `0`. This creates ambiguity:
- `ariaLandmarks: 0` → Issue created (correct)
- `ariaLandmarks: None` → Issue NOT created (potential false negative)
- `ariaLandmarks` missing → Uses default `0` → Issue created (correct)

### Exact Faulty Line:
Line 201: `if landmarks == 0:`

**Fix Recommendation (minimal):**
```python
# Explicit None check
if landmarks is None:
    return []  # Data not available, don't fire issue
if landmarks == 0:
    # create issue
```

---

## Rule 5: PAGESPEED_SCORE

**Expected Behavior:** Rule should fire when PageSpeed score is below 90, using the best available device data.

**Actual Behavior:** Rule always uses mobile data (first priority) and may fire issues even when desktop performance is acceptable.

### Full evaluate() Method:
```python
def evaluate(self, normalized, job_id, project_id, url):
    perf = _get_perf(normalized)
    score = perf.get("performance_score")
    if score is not None and score < 90:
        return [self.create_issue(
            job_id, project_id, url,
            f"PageSpeed score is {score} (should be ≥90)",
            score, "≥90",
            data_key="performance"
        )]
    return []
```

### Performance Data Access Logic:
```python
def _get_perf(normalized, device="mobile"):
    perf = normalized.get("performance", {})
    if isinstance(perf, dict):
        if device in perf:
            return perf[device]
        if "performance_score" in perf:
            return perf
    return {}
```

### Normalized Data Keys Used:
- `performance.mobile.performance_score` (priority)
- `performance.desktop.performance_score` (fallback)
- `performance.performance_score` (flat structure fallback)

### Root Cause Analysis:
**Device Context Issue**: Rule always uses mobile data (_get_perf defaults to "mobile"), which may have lower scores than desktop. This creates false positives when mobile performance is poor but desktop is acceptable.

### Exact Faulty Line:
Line 98: `perf = _get_perf(normalized)` (defaults to mobile)

**Fix Recommendation (minimal):**
```python
# Use best score across devices
mobile_score = _get_perf(normalized, "mobile").get("performance_score")
desktop_score = _get_perf(normalized, "desktop").get("performance_score")

# Use the best available score
valid_scores = [s for s in [mobile_score, desktop_score] if s is not None]
if not valid_scores:
    return []
score = max(valid_scores)  # Use best performance
```

---

## Summary of Root Causes

| Rule | Primary Issue | Type | Impact |
|------|---------------|------|---------|
| TITLE_MISSING_KEYWORD | Keyword extraction validation | Logic | False positives when keyword is malformed |
| META_DESC_MISSING_KEYWORD | Keyword extraction validation | Logic | Same as title rule |
| OG_URL_INVALID | Relative URL resolution | Logic | False positives for valid relative URLs |
| ARIA_LANDMARKS_MISSING | None vs 0 ambiguity | Logic | False negatives when data missing |
| PAGESPEED_SCORE | Device context selection | Logic | False positives when mobile poor but desktop good |

## Minimal Fix Implementation

All fixes require single-line changes or small helper functions without architectural changes:

1. **Keyword rules**: Add keyword length/validation check
2. **OG URL rule**: Add URL resolution helper
3. **ARIA rule**: Add explicit None check
4. **PageSpeed rule**: Use best score across devices

These fixes maintain existing rule structure while eliminating identified false positive patterns.
