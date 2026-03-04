# SEO Rule Engine - evaluate() Methods Analysis

## Full evaluate() Method Bodies

### TitleMultipleRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    # This requires raw HTML count — not available in normalized data.
    # If page has a title, we assume one. This is a best-effort check.
    # The scraper extracts only the first title, so we cannot detect >1.
    return []
```
**Data accessed**: None

### SchemaJsonLdPresentRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    schemas = _get_schemas(normalized)
    if not schemas:
        return [self.create_issue(
            job_id, project_id, url,
            "No JSON-LD structured data found",
            "None", "Add JSON-LD schema markup",
            data_key="structured_data"
        )]
    return []
```
**Data accessed**: `structured_data` (via `_get_schemas(normalized)`)

### SchemaValidContextRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    for s in _get_schemas(normalized):
        if isinstance(s, dict):
            context = s.get("@context", "")
            if context and str(context).strip().rstrip("/")") not in _VALID_CONTEXTS_NORMALIZED:
                return [self.create_issue(
                    job_id, project_id, url,
                    f"Invalid schema @context: {context}",
                    str(context), "https://schema.org",
                    data_key="structured_data"
                )]
    return []
```
**Data accessed**: `structured_data` (via `_get_schemas(normalized)`)

### SchemaValidTypeRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    for s in _get_schemas(normalized):
        if isinstance(s, dict):
            schema_type = s.get("@type", "")
            if schema_type and schema_type not in VALID_SCHEMA_TYPES:
                return [self.create_issue(
                    job_id, project_id, url,
                    f"Invalid schema @type: {schema_type}",
                    schema_type, "Use valid schema.org types",
                    data_key="structured_data"
                )]
    return []
```
**Data accessed**: `structured_data` (via `_get_schemas(normalized)`)

### AppleTouchIconSizeRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    # Best-effort: we can only check if icon is present, not its actual size
    # from meta_tags. This is informational.
    return []
```
**Data accessed**: None

### HeadingKeywordEarlyRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    # Covered by H1 keyword position rule (87) — skip for all headings
    return []
```
**Data accessed**: None

### SchemaLocalBizPhoneRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    lb = _find_schema_by_type(_get_schemas(normalized), "LocalBusiness")
    if lb and not lb.get("telephone"):
        return [self.create_issue(
            job_id, project_id, url,
            "LocalBusiness schema missing telephone",
            "None", "Add telephone to LocalBusiness",
            data_key="structured_data"
        )]
    return []
```
**Data accessed**: `structured_data` (via `_get_schemas(normalized)`)

### SchemaLocalBizAddressRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    lb = _find_schema_by_type(_get_schemas(normalized), "LocalBusiness")
    if lb and not lb.get("address"):
        return [self.create_issue(
            job_id, project_id, url,
            "LocalBusiness schema missing address",
            "None", "Add PostalAddress to LocalBusiness",
            data_key="structured_data"
        )]
    return []
```
**Data accessed**: `structured_data` (via `_get_schemas(normalized)`)

### SchemaImageValidRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    for s in _get_schemas(normalized):
        if isinstance(s, dict):
            image = s.get("image")
            if image:
                img_url = image if isinstance(image, str) else (image.get("url", "") if isinstance(image, dict) else "")
                if img_url and not _is_valid_https_url(img_url):
                    return [self.create_issue(
                        job_id, project_id, url,
                        "Schema image is not valid HTTPS URL",
                        str(img_url)[:80], "Use valid HTTPS image URL",
                        data_key="structured_data"
                    )]
    return []
```
**Data accessed**: `structured_data` (via `_get_schemas(normalized)`)

### SchemaDescriptionKeywordRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    keyword = _keyword_from_context(normalized)
    if not keyword:
        return []
    for s in _get_schemas(normalized):
        if isinstance(s, dict):
            desc = s.get("description", "")
            if desc and keyword.lower() not in str(desc).lower():
                return [self.create_issue(
                    job_id, project_id, url,
                    "Schema description does not contain keyword",
                    str(desc)[:60], f"Include: {keyword}",
                    data_key="structured_data"
                )]
                break
    return []
```
**Data accessed**: `structured_data`, `meta_tags.keywords` (via `_keyword_from_context`)

### LcpGoodRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    perf = _get_perf(normalized)
    lcp = perf.get("largest_contentful_paint")
    if lcp is not None and lcp > 2.5:
        return [self.create_issue(
            job_id, project_id, url,
            f"LCP is {lcp}s (should be ≤2.5s)",
            lcp, "≤2.5 seconds",
            data_key="performance"
        )]
    return []
```
**Data accessed**: `performance` (via `_get_perf(normalized)`)

### ClsGoodRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    perf = _get_perf(normalized)
    cls = perf.get("cumulative_layout_shift")
    if cls is not None and cls > 0.1:
        return [self.create_issue(
            job_id, project_id, url,
            f"CLS is {cls} (should be ≤0.1)",
            cls, "≤0.1",
            data_key="performance"
        )]
    return []
```
**Data accessed**: `performance` (via `_get_perf(normalized)`)

### TbtGoodRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    perf = _get_perf(normalized)
    tbt = perf.get("total_blocking_time")
    if tbt is not None and tbt > 200:
        return [self.create_issue(
            job_id, project_id, url,
            f"TBT is {tbt}ms (should be ≤200ms)",
            tbt, "≤200ms",
            data_key="performance"
        )]
    return []
```
**Data accessed**: `performance` (via `_get_perf(normalized)`)

### PageSpeedScoreRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    score, device = _get_best_performance_score(normalized)
    if score is None:
        return []  # No performance data available
    
    if score < 90:
        return [self.create_issue(
            job_id, project_id, url,
            f"PageSpeed score is {score} (should be ≥90) - {device}",
            score, "≥90",
            data_key="performance"
        )]
    return []
```
**Data accessed**: `performance` (via `_get_best_performance_score(normalized)`)

### SpeedIndexRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    perf = _get_perf(normalized)
    si = perf.get("speed_index")
    if si is not None and si > 3.4:
        return [self.create_issue(
            job_id, project_id, url,
            f"Speed Index is {si}s (should be ≤3.4s)",
            si, "≤3.4 seconds",
            data_key="performance"
        )]
    return []
```
**Data accessed**: `performance` (via `_get_perf(normalized)`)

### RenderBlockingRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    perf = _get_perf(normalized)
    rb = perf.get("render_blocking_analysis", {})
    if isinstance(rb, dict):
        count = rb.get("total_blocking_count", 0)
        if count > 3:
            return [self.create_issue(
                job_id, project_id, url,
                f"{count} render-blocking resources detected",
                count, "≤3 render-blocking resources",
                data_key="performance"
            )]
    return []
```
**Data accessed**: `performance` (via `_get_perf(normalized)`)

### SchemaTypeNotDeprecatedRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    for s in _get_schemas(normalized):
        if isinstance(s, dict):
            schema_type = s.get("@type", "")
            if schema_type in DEPRECATED_SCHEMA_TYPES:
                return [self.create_issue(
                    job_id, project_id, url,
                    f"Schema uses deprecated type: {schema_type}",
                    schema_type, "Use supported schema types",
                    data_key="structured_data"
                )]
    return []
```
**Data accessed**: `structured_data` (via `_get_schemas(normalized)`)

### SchemaNoDuplicateFormatsRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    # We only have JSON-LD data; if structured_data has multiple entries
    # of same type, that could indicate duplicate formats
    schemas = _get_schemas(normalized)
    types_seen = {}
    for s in schemas:
        if isinstance(s, dict):
            stype = s.get("@type", "")
            if stype:
                types_seen[stype] = types_seen.get(stype, 0) + 1
    dupes = {t: c for t, c in types_seen.items() if c > 1}
    if dupes:
        return [self.create_issue(
            job_id, project_id, url,
            f"Duplicate schema types: {', '.join(f'{t}(×{c})' for t, c in dupes.items())}",
            str(dupes), "Use one format per schema type",
            data_key="structured_data"
        )]
    return []
```
**Data accessed**: `structured_data` (via `_get_schemas(normalized)`)

### SchemaArticleDatePublishedRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    for stype in ("Article", "BlogPosting", "NewsArticle"):
        schema = _find_schema_by_type(_get_schemas(normalized), stype)
        if schema and not schema.get("datePublished"):
            return [self.create_issue(
                job_id, project_id, url,
                f"{stype} schema missing datePublished",
                "None", "Add datePublished to article schema",
                data_key="structured_data"
            )]
    return []
```
**Data accessed**: `structured_data` (via `_get_schemas(normalized)`)

### AxeNoViolationsRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    violations = _get_axe(normalized)
    if violations:
        return [self.create_issue(
            job_id, project_id, url,
            f"{len(violations)} accessibility violation(s) found",
            len(violations), "0 axe-core violations",
            data_key="headless"
        )]
    return []
```
**Data accessed**: `headless` (via `_get_axe(normalized)`)

### AxeNoCriticalRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    violations = _get_axe(normalized)
    critical = [v for v in violations if isinstance(v, dict) and v.get("impact") == "critical"]
    if critical:
        return [self.create_issue(
            job_id, project_id, url,
            f"{len(critical)} critical accessibility violation(s)",
            len(critical), "0 critical violations",
            data_key="headless"
        )]
    return []
```
**Data accessed**: `headless` (via `_get_axe(normalized)`)

### AxeNoSeriousRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    violations = _get_axe(normalized)
    serious = [v for v in violations if isinstance(v, dict) and v.get("impact") == "serious"]
    if serious:
        return [self.create_issue(
            job_id, project_id, url,
            f"{len(serious)} serious accessibility violation(s)",
            len(serious), "0 serious violations",
            data_key="headless"
        )]
    return []
```
**Data accessed**: `headless` (via `_get_axe(normalized)`)

### AxeMaxModerateRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    violations = _get_axe(normalized)
    moderate = [v for v in violations if isinstance(v, dict) and v.get("impact") == "moderate"]
    if len(moderate) > 5:
        return [self.create_issue(
            job_id, project_id, url,
            f"{len(moderate)} moderate accessibility violations (max 5)",
            len(moderate), "≤5 moderate violations",
            data_key="headless"
        )]
    return []
```
**Data accessed**: `headless` (via `_get_axe(normalized)`)

### DomElementCountRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    dm = _get_dom_metrics(normalized)
    total = dm.get("totalElements", 0)
    if total > 1500:
        return [self.create_issue(
            job_id, project_id, url,
            f"DOM has {total} elements (recommend ≤1500)",
            total, "≤1500 elements",
            data_key="headless"
        )]
    return []
```
**Data accessed**: `headless` (via `_get_dom_metrics(normalized)`)

### FormLabelsRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    dm = _get_dom_metrics(normalized)
    inputs = dm.get("inputs", 0)
    forms = dm.get("forms", 0)
    if inputs > 0 and forms > 0:
        # Check axe for form-related violations
        violations = _get_axe(normalized)
        label_issues = [
            v for v in violations
            if isinstance(v, dict) and v.get("id") in ("label", "input-image-alt", "select-name")
        ]
        if label_issues:
            return [self.create_issue(
                job_id, project_id, url,
                f"Form input(s) missing labels ({len(label_issues)} issue(s))",
                len(label_issues), "All form inputs need associated labels",
                data_key="headless"
            )]
    return []
```
**Data accessed**: `headless` (via `_get_dom_metrics(normalized)` and `_get_axe(normalized)`)

### AriaLandmarksRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    dm = _get_dom_metrics(normalized)
    landmarks = dm.get("ariaLandmarks", 0)
    if landmarks is None:
        return []  # Data unavailable, do not fire issue
    if landmarks == 0:
        return [self.create_issue(
            job_id, project_id, url,
            "No ARIA landmarks found",
            0, "Add role=navigation, main, banner, etc.",
            data_key="headless"
        )]
    return []
```
**Data accessed**: `headless` (via `_get_dom_metrics(normalized)`)

### ButtonsHaveLabelsRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    violations = _get_axe(normalized)
    button_issues = [
        v for v in violations
        if isinstance(v, dict) and v.get("id") in ("button-name",)
    ]
    if button_issues:
        node_count = sum(
            len(v.get("nodes", [])) if isinstance(v.get("nodes"), list) else 0
            for v in button_issues
        )
        return [self.create_issue(
            job_id, project_id, url,
            "Buttons without accessible labels found",
            node_count,
            "All buttons need accessible names",
            data_key="headless"
        )]
    return []
```
**Data accessed**: `headless` (via `_get_axe(normalized)`)

### HeadingOrderLogicalRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    dm = _get_dom_metrics(normalized)
    headings = dm.get("headings", {})
    if isinstance(headings, dict):
        h1 = headings.get("h1", 0)
        h2 = headings.get("h2", 0)
        h3 = headings.get("h3", 0)
        h4 = headings.get("h4", 0)
        # If H3 exists without H2, or H4 without H3, heading order is broken
        if h3 > 0 and h2 == 0:
            return [self.create_issue(
                job_id, project_id, url,
                "H3 used without H2 — heading hierarchy broken",
                f"H1:{h1} H2:{h2} H3:{h3}", "Sequential heading order (H1→H2→H3)",
                data_key="headless"
            )]
        if h4 > 0 and h3 == 0:
            return [self.create_issue(
                job_id, project_id, url,
                "H4 used without H3 — heading hierarchy broken",
                f"H2:{h2} H3:{h3} H4:{h4}", "Sequential heading order",
                data_key="headless"
            )]
    return []
```
**Data accessed**: `headless` (via `_get_dom_metrics(normalized)`)

### KeyboardNavigationCheckedRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    kb = _get_keyboard(normalized)
    if kb and not kb.get("keyboard_navigation_checked"):
        return [self.create_issue(
            job_id, project_id, url,
            "Keyboard navigation could not be checked",
            "Not checked", "Ensure keyboard accessibility",
            data_key="headless"
        )]
    return []
```
**Data accessed**: `headless` (via `_get_keyboard(normalized)`)

### NoFocusTrapRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    kb = _get_keyboard(normalized)
    if kb and kb.get("focus_trap_detected"):
        return [self.create_issue(
            job_id, project_id, url,
            "Focus trap detected during keyboard navigation",
            "Trap detected", "Fix focus trapping elements",
            data_key="headless"
        )]
    return []
```
**Data accessed**: `headless` (via `_get_keyboard(normalized)`)

### SmallClickTargetsRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    kb = _get_keyboard(normalized)
    if kb:
        small = kb.get("small_click_targets", 0)
        if small > 0:
            return [self.create_issue(
                job_id, project_id, url,
                f"{small} small click target(s) detected (<24px)",
                small, "All interactive elements ≥24×24px",
                data_key="headless"
            )]
    return []
```
**Data accessed**: `headless` (via `_get_keyboard(normalized)`)

### FocusIndicatorRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    kb = _get_keyboard(normalized)
    if kb:
        missing = kb.get("missing_focus_outline", 0)
        if missing > 0:
            return [self.create_issue(
                job_id, project_id, url,
                f"{missing} element(s) with missing focus outline",
                missing, "All focusable elements need visible outline",
                data_key="headless"
            )]
    return []
```
**Data accessed**: `headless` (via `_get_keyboard(normalized)`)

### UnreachableElementsRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    kb = _get_keyboard(normalized)
    if kb:
        unreachable = kb.get("unreachable_elements", 0)
        total_tabs = kb.get("total_tab_presses", 20)
        if unreachable > total_tabs * 0.5:
            return [self.create_issue(
                job_id, project_id, url,
                f"{unreachable} of {total_tabs} tab presses reached no element",
                unreachable, "All elements should be keyboard-reachable",
                data_key="headless"
            )]
    return []
```
**Data accessed**: `headless` (via `_get_keyboard(normalized)`)

### SkipNavigationRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    violations = _get_axe(normalized)
    skip_issues = [
        v for v in violations
        if isinstance(v, dict) and v.get("id") in ("bypass", "skip-link")
    ]
    if skip_issues:
        return [self.create_issue(
            job_id, project_id, url,
            "Skip navigation link missing or broken",
            "Missing", "Add skip-to-content link",
            data_key="headless"
        )]
    return []
```
**Data accessed**: `headless` (via `_get_axe(normalized)`)

### LinksHaveDescriptiveTextRule
```python
def evaluate(self, normalized, job_id, project_id, url):
    violations = _get_axe(normalized)
    link_issues = [
        v for v in violations
        if isinstance(v, dict) and v.get("id") in ("link-name",)
    ]
    if link_issues:
        node_count = sum(
            len(v.get("nodes", [])) if isinstance(v.get("nodes"), list) else 0
            for v in link_issues
        )
        return [self.create_issue(
            job_id, project_id, url,
            "Links without descriptive text found",
            node_count, "All links need descriptive text",
            data_key="headless"
        )]
    return []
```
**Data accessed**: `headless` (via `_get_axe(normalized)`)

## Primary Keyword Analysis

### Where is the "primary keyword" defined or extracted?

The primary keyword is extracted by the `_keyword_from_context()` helper function, which is defined in multiple rule files:

#### In title_rules.py and meta_rules.py (most complete version):
```python
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
```

#### In social_rules.py, schema_rules.py, image_rules.py, heading_rules.py (simpler version):
```python
def _keyword_from_context(normalized):
    meta_tags = normalized.get("meta_tags", {})
    keywords_list = meta_tags.get("keywords", [])
    if keywords_list and isinstance(keywords_list, list) and keywords_list[0]:
        kw = keywords_list[0]
        if isinstance(kw, str):
            return kw.split(",")[0].strip().lower()
    return ""
```

### Is it passed into the page_data dict? Under what key?

**NO**, the primary keyword is NOT stored in the page_data dict. It is extracted dynamically at runtime by each rule using the `_keyword_from_context()` helper function.

**Data sources used for keyword extraction:**
1. **Primary source**: `meta_tags.keywords[0]` - First keyword from meta keywords tag
2. **Fallback source**: `headings[0].text` where `tag == "h1"` - First H1 text

### What happens if no keyword is set?

The behavior depends on the rule implementation:

#### Rules with graceful handling (return empty list - silently pass):
- **SchemaDescriptionKeywordRule**: `if not keyword: return []`
- **TitleMissingKeywordRule**: Uses `_keyword_from_context()` but handles None gracefully
- **MetaDescMissingKeywordRule**: Uses `_keyword_from_context()` but handles None gracefully

#### Rules with simplified version (return empty string):
- Rules in social_rules.py, schema_rules.py, image_rules.py, heading_rules.py return `""` if no keyword found

#### Rules that don't use keywords:
- Most rules don't depend on keywords and work independently

### Key Points:

1. **No Errors Raised**: Keyword rules do NOT raise errors when no keyword is found - they either silently pass or skip the check
2. **Graceful Degradation**: The system is designed to work without keywords
3. **Multiple Implementations**: There are two versions of `_keyword_from_context()` - a complete one with H1 fallback and a simpler one
4. **Dynamic Extraction**: Keywords are extracted at runtime, not pre-computed and stored
5. **Validation**: The complete version validates keyword quality (minimum 3 characters)

### Data Dictionary Keys Accessed by Rules:

**Core normalized data fields:**
- `structured_data` - Schema rules
- `meta_tags` - Keyword extraction, meta rules
- `headings` - Keyword extraction, heading rules
- `performance` - Performance rules
- `headless` - Accessibility rules
- `images` - Image rules
- `viewport` - Mobile-friendly rule

**Helper functions access nested data:**
- `_get_schemas(normalized)` → `normalized.get("structured_data", [])`
- `_get_perf(normalized)` → `normalized.get("performance", {})`
- `_get_axe(normalized)` → `normalized.get("headless", {}).get("axeViolations", [])`
- `_get_dom_metrics(normalized)` → `normalized.get("headless", {}).get("domMetrics", {})`
- `_get_keyboard(normalized)` → `normalized.get("headless", {}).get("keyboard_analysis", {})`
