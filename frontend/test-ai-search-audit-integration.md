# AI Search Audit Frontend Integration Test

## Overview
This document outlines the testing steps to verify that the frontend correctly integrates with the new dynamic AI Search Audit APIs.

## Test Scenarios

### 1. Main AI Search Audit Page
**URL**: `/ai-search-audit`

**Expected Behavior**:
- Page loads with dynamic issues from API
- Issues display correct counts and metadata
- Category filtering works correctly
- Loading states show during API calls
- Fallback to static data if API fails

**Test Steps**:
1. Navigate to AI Search Audit page
2. Verify issues load dynamically (check browser console for API calls)
3. Test category filters (All, GEO, AEO, AISEO)
4. Verify issue counts update correctly
5. Click "Fix" button - should navigate to issue detail page

### 2. Issue Detail Page
**URL**: `/ai-search-audit/issues/[issueId]`

**Expected Behavior**:
- Issue details load from API
- Affected URLs load dynamically with pagination
- Loading states show during API calls
- Fallback to static data if API fails
- Fix Assistant panel works correctly

**Test Steps**:
1. Click "Fix" on any issue card
2. Verify issue details load correctly
3. Check affected URLs list loads dynamically
4. Test Fix Assistant tabs (AI Fix, DIY, AuditIQ)
5. Verify back navigation works

### 3. API Integration Testing

#### Test API Endpoints Directly:
```bash
# Get all issues for a project
GET /api/ai-visibility/projects/{projectId}/ai-search-audit/issues

# Get affected pages for specific issue
GET /api/ai-visibility/projects/{projectId}/ai-search-audit/issues/{issueId}/affected-pages
```

#### Expected Response Format:
```json
// Issues endpoint
{
  "success": true,
  "data": [
    {
      "issueId": "schema_markup_missing",
      "title": "Schema Markup Missing",
      "severity": "critical",
      "category": "GEO",
      "impact": "+38% AI Visibility",
      "difficulty": "Medium",
      "pagesAffected": 47,
      "sampleUrls": ["/blog/seo-audit-guide"]
    }
  ],
  "count": 1
}

// Affected pages endpoint
{
  "success": true,
  "data": {
    "issueId": "schema_markup_missing",
    "title": "Schema Markup Missing",
    "pages": [
      {
        "url": "/blog/seo-audit-guide",
        "title": "SEO Audit Guide",
        "aiVisibility": { ... }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPagesAffected": 247
    }
  }
}
```

## Frontend Components Updated

### 1. AIAuditPageContent.jsx
- Added `loadIssues()` function to fetch dynamic issues
- Transforms API response to match static data structure
- Added fallback to static data if API fails
- Updated category filtering to use dynamic data

### 2. IssueCard.jsx
- Updated to handle dynamic data structure
- Added category-based icons (🌍 GEO, 💬 AEO, 🤖 AISEO)
- Maintains navigation to issue detail page

### 3. Issue Detail Page
- Updated to fetch issue details from issues API
- Added dynamic affected pages loading
- Added loading states and error handling
- Maintains fallback to static data

## Data Transformation

### API Response → Frontend Format
```javascript
// API Response
{
  issueId: "schema_markup_missing",
  title: "Schema Markup Missing",
  severity: "critical",
  category: "GEO",
  pagesAffected: 47,
  impact: "+38% AI Visibility",
  difficulty: "Medium"
}

// Frontend Format (for compatibility)
{
  id: "schema_markup_missing",
  title: "Schema Markup Missing",
  sev: "crit", // critical -> crit
  cat: "GEO",
  desc: "This issue affects 47 pages. +38% AI Visibility impact. Difficulty: Medium.",
  pages: 47,
  impact: "+38% AI Visibility",
  diff: "Medium"
}
```

## Error Handling

### API Failure Scenarios:
1. **Network Error**: Console log + fallback to static data
2. **Invalid Project ID**: Error message + fallback to static data
3. **No Issues Found**: Empty state message
4. **Rate Limiting**: Retry logic + fallback

### Loading States:
- Main page: Loading spinner during API calls
- Issue detail: Loading spinner for affected URLs
- Graceful degradation to static data

## Browser Console Testing

### Expected Console Logs:
```
✅ AI Search Audit metrics loaded: {total_pages: 150, ai_readiness: 72}
✅ AI Search Audit issues loaded: 8 issues
API not available, falling back to static data (if API fails)
```

### Network Tab:
- Check for `GET /api/ai-visibility/projects/{id}/ai-search-audit/issues`
- Check for `GET /api/ai-visibility/projects/{id}/ai-search-audit/issues/{issueId}/affected-pages`
- Verify response status codes and data format

## Performance Considerations

### Optimizations Implemented:
1. **Early API Calls**: Issues and metrics load in parallel
2. **Pagination**: Affected pages loaded in chunks (50 per page)
3. **Caching**: Static data fallback prevents repeated failed calls
4. **Loading States**: UI remains responsive during API calls

### Performance Metrics to Monitor:
- API response times (<200ms target)
- Page load times (<2s target)
- Memory usage (large datasets)

## Troubleshooting

### Common Issues:
1. **API Not Loading**: Check backend server status
2. **Wrong Project ID**: Verify activeProject._id is valid
3. **CORS Issues**: Check backend CORS configuration
4. **Data Format Mismatch**: Verify API response structure

### Debug Steps:
1. Open browser DevTools
2. Check Console for error messages
3. Check Network tab for API calls
4. Verify response data format
5. Test API endpoints directly

## Success Criteria

✅ **Main Page**:
- Issues load dynamically from API
- Category filtering works
- Loading states show correctly
- Fallback to static data works

✅ **Issue Detail Page**:
- Issue details load correctly
- Affected URLs load with pagination
- Fix Assistant works
- Back navigation works

✅ **Error Handling**:
- Graceful fallback to static data
- Appropriate error messages
- Loading states throughout

✅ **Performance**:
- Fast API response times
- Smooth user experience
- No memory leaks

---

This integration ensures the AI Search Audit frontend is fully dynamic while maintaining backward compatibility with static data as a fallback.
