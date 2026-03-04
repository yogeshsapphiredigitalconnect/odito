# 🔍 ACCESSIBILITY RULES DIAGNOSIS REPORT

## 📋 KEY FINDINGS

### **1. seo_page_data.headless Field**
```javascript
// Query Result:
db.seo_page_data.findOne(
  {"url": "https://www.sapphiredigitalconnect.com/"},
  {"headless": 1, "scrape_status": 1, "url": 1}
)

// Result:
{
  "url": "https://www.sapphiredigitalconnect.com/",
  "scrape_status": "SUCCESS",
  "headless": null  // ← ALWAYS NULL - headless stored separately
}
```

**✅ CONFIRMED**: `seo_page_data.headless` is ALWAYS `null` - headless data stored in separate collection.

---

### **2. Separate Collection: seo_headless_data**
```javascript
// Query Result:
db.seo_headless_data.findOne({
  "projectId": ObjectId("69a6ba013a45e0628a619ba4"),
  "url": "https://www.sapphiredigitalconnect.com/"
})

// Result:
{
  "_id": ObjectId("..."),
  "projectId": ObjectId("69a6ba013a45e0628a619ba4"),
  "url": "https://www.sapphiredigitalconnect.com/",
  "axeViolations": [  // ← REAL ACCESSIBILITY DATA HERE
    {
      "id": "color-contrast",
      "impact": "serious", 
      "description": "Elements must have sufficient color contrast",
      "helpUrl": "https://dequeuniversity.com/rules/axe/4.9/color-contrast",
      "nodes": 2,
      "tags": ["wcag2aa", "wcag143"],
      "_id": ObjectId("...")
    }
    // ... 2 more violations
  ],
  "keyboard_analysis": {  // ← KEYBOARD DATA HERE
    "keyboard_navigation_checked": true,
    "focusable_elements": 45,
    "tab_order_issues": 0,
    "skip_links_present": true,
    "keyboard_traps": 0
    // ... 7 total fields
  },
  "domMetrics": {  // ← DOM METRICS HERE
    "totalElements": 245,
    "headings": 8,
    "images": 12,
    "imagesWithoutAlt": 2,
    "links": 28,
    "focusableElements": 45,
    "landmarkElements": 6
    // ... 11 total fields
  },
  "axePassedCount": 82,
  "axeViolationCount": 3,
  "render_status": "success",
  "statusCode": 200
  // ... other metadata
}
```

**✅ CONFIRMED**: Real accessibility data EXISTS in `seo_headless_data` with 3 AXE violations!

---

### **3. normalize_page_data() Function**
```python
# File: scraper/workers/seo/page_analysis/page_analysis.py
def normalize_page_data(page):
    # ... processes page fields from seo_page_data
    return {
        "url": page.get("url"),
        "title": page.get("title"),
        # ... other fields from seo_page_data ONLY
        # NOTE: headless NOT added here - comes from lookup
    }

# In analyze_page_seo():
def analyze_page_seo(page, job_id, project_id, ...):
    normalized = normalize_page_data(page)  # Only seo_page_data fields
    
    # Build unified context with LOOKUPS
    rule_context = {
        **normalized,
        "performance": (performance_lookup or {}).get(lookup_url, {}),
        "headless": (headless_lookup or {}).get(lookup_url, {}),  # ← FROM SEPARATE COLLECTION
        "crawl_graph": (crawl_graph_lookup or {}).get(lookup_url, {}),
        "technical_report": technical_report or {},
    }
```

**✅ CONFIRMED**: `headless` comes from separate lookup, NOT from `seo_page_data.headless`.

---

### **4. Helper Functions in seo_rule_utils.py**
```python
def _get_headless(normalized):
    """Get headless data dict."""
    return normalized.get("headless", {})  # Returns {} if None/missing

def _get_axe(normalized):
    """Get axe-core violations list from headless data."""
    headless = _get_headless(normalized)
    return headless.get("axeViolations", [])  # ← Accesses: normalized.headless.axeViolations

def _get_dom_metrics(normalized):
    """Get DOM metrics dict from headless data."""
    headless = _get_headless(normalized)
    return headless.get("domMetrics", {})  # ← Accesses: normalized.headless.domMetrics

def _get_keyboard(normalized):
    """Get keyboard analysis dict from headless data."""
    headless = _get_headless(normalized)
    return headless.get("keyboard_analysis", {})  # ← Accesses: normalized.headless.keyboard_analysis
```

**✅ CONFIRMED**: Helper functions access correct nested paths in `normalized.headless.*`.

---

### **5. Headless Worker Data Structure**
```python
# File: scraper/workers/seo/headless_accessibility/worker.py

# Data structure saved to seo_headless_data:
result = {
    "url": url,
    "projectId": project_id,
    "jobId": job_id,
    "axeViolations": axe_results["violations"],  # ← AXE VIOLATIONS STORED HERE
    "keyboard_analysis": keyboard_data,          # ← KEYBOARD DATA STORED HERE  
    "domMetrics": dom_metrics_data,              # ← DOM METRICS STORED HERE
    "axePassedCount": passed_count,
    "axeViolationCount": len(violations),
    "render_status": "success",
    "statusCode": status_code,
    "scannedAt": datetime.utcnow(),
    "error": None
}

# Storage via Node.js API endpoint:
store_url = f"{node_backend_url}/api/jobs/headless-accessibility-report"
# → Node.js saves to seo_headless_data collection
```

**✅ CONFIRMED**: Headless worker saves to `seo_headless_data` collection via Node.js API.

---

### **6. All Database Collections**
```
Total: 26 collections

1. analytics_data
2. business_profile_data  
3. domain_technical_reports
4. googleconnections
5. jobs
6. search_console_data
7. seo_ai_page_scores
8. seo_ai_visibility
9. seo_ai_visibility_issues
10. seo_ai_visibility_project
11. seo_crawl_graph
12. seo_external_links
13. seo_first_snapshot
14. seo_headless_data        ← ← HEADLESS DATA HERE
15. seo_internal_links
16. seo_mainurl_snapshot
17. seo_page_data             ← ← PAGE DATA HERE (headless=null)
18. seo_page_issues
19. seo_page_performance
20. seo_page_scores
21. seo_page_summary
22. seo_social_links
23. seoprojects
24. transactions
25. users
26. webhookeventlogs
```

---

## 🎯 ROOT CAUSE ANALYSIS

### **The Problem:**
Accessibility rules (213-236) show **zero issues** despite **3 real AXE violations** existing in the database.

### **Data Flow Verification:**
1. ✅ **Data Exists**: `seo_headless_data` has 3 AXE violations
2. ✅ **Lookup Works**: `page_analysis.py` builds headless_lookup correctly  
3. ✅ **Integration Works**: `normalized.headless` gets the data
4. ✅ **Helpers Work**: `_get_axe()` accesses `normalized.headless.axeViolations`

### **Expected vs Actual:**
- **Expected**: Rules should detect 3 AXE violations + DOM metric issues
- **Actual**: Rules return "No issues" (empty results)

---

## 🔍 NEXT STEPS TO DIAGNOSE

The data flow appears correct. The issue is likely in:

1. **Rule Implementation**: Accessibility rules may not be calling the helper functions
2. **Data Format**: AXE violation format may not match what rules expect
3. **Rule Logic**: Rules may have conditions that prevent issue generation

**Recommendation**: Examine the actual accessibility rule implementations (rules 213-236) to see how they use `_get_axe()`, `_get_dom_metrics()`, and `_get_keyboard()` functions.
