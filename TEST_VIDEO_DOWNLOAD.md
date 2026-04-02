# AI Video Download Feature - Testing Guide

## Overview
This document provides comprehensive testing instructions for the new AI Video Download feature implemented with secure backend authentication and validation.

## Feature Summary
- **Backend Route**: `GET /api/video/ai-generated/download/:filename`
- **Frontend Function**: `handleDownloadVideo()` in AI Video page
- **Security**: Authentication required, filename validation, path traversal protection
- **Dynamic Filenames**: Project-based naming with timestamps

## Pre-requisites
1. User must be logged in with valid authentication token
2. Project must have a successfully rendered video (`status: "RENDERED"`)
3. Video file must exist in `/public/videos/` directory on server
4. Video metadata must exist in `ai_generated_videos` collection

## Test Scenarios

### ✅ 1. Happy Path - Successful Download
**Steps:**
1. Navigate to AI Video page (`/ai-video`)
2. Select a project with a rendered video
3. Click "Download Video" button
4. Verify download starts immediately
5. Check downloaded file name format: `{project_name}_video_{YYYY-MM-DD}.mp4`

**Expected Results:**
- Download progress indicator shows "Downloading..."
- File downloads with dynamic name
- No page reload occurs
- Console shows success logs
- Backend logs show authorized download

### ✅ 2. Security - Unauthorized Access
**Steps:**
1. Clear authentication token (logout)
2. Try to access download endpoint directly: `GET /api/video/ai-generated/download/filename.mp4`

**Expected Results:**
- Returns 401 Unauthorized
- Error message: "Authentication required"

### ✅ 3. Security - Path Traversal Protection
**Steps:**
1. Try malicious filenames:
   - `../../../etc/passwd`
   - `..\\..\\windows\\system32\\config\\sam`
   - `folder/../../../etc/passwd.mp4`

**Expected Results:**
- Returns 400 Bad Request
- Error message: "Invalid filename"
- Security warning logged in backend

### ✅ 4. Security - File Type Validation
**Steps:**
1. Try non-MP4 files:
   - `document.pdf`
   - `image.jpg`
   - `script.js`

**Expected Results:**
- Returns 400 Bad Request
- Error message: "Invalid file format or name too long"

### ✅ 5. Edge Case - File Not Found
**Steps:**
1. Try downloading non-existent file: `nonexistent_video.mp4`

**Expected Results:**
- Returns 404 Not Found
- Error message: "Video file not found"

### ✅ 6. Edge Case - No Filename Available
**Steps:**
1. Access video page where `videoFileName` is null/undefined
2. Click download button

**Expected Results:**
- Button disabled state
- Error message: "Video filename not available for download"

### ✅ 7. Edge Case - User Doesn't Own Video
**Steps:**
1. User A downloads video belonging to User B
2. Modify request to use different filename

**Expected Results:**
- Returns 403 Forbidden
- Error message: "You do not have permission to download this video"
- Security violation logged

### ✅ 8. Performance - Large File Download
**Steps:**
1. Test with large video file (>100MB)
2. Monitor download progress

**Expected Results:**
- Download starts promptly
- No memory issues on server
- Proper streaming via `res.download()`

### ✅ 9. Analytics - Download Logging
**Steps:**
1. Download a video successfully
2. Check database record

**Expected Results:**
- `downloadCount` incremented
- `lastDownloadedAt` timestamp set
- Download logged in backend console

## Backend Testing

### Test Route Registration
```bash
# Check if route is properly registered
curl -X GET http://localhost:5000/api/video/ai-generated/download/test.mp4 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v
```

### Test Authentication
```bash
# Test without token
curl -X GET http://localhost:5000/api/video/ai-generated/download/test.mp4 -v
# Expected: 401 Unauthorized

# Test with invalid token
curl -X GET http://localhost:5000/api/video/ai-generated/download/test.mp4 \
  -H "Authorization: Bearer INVALID_TOKEN" -v
# Expected: 401 Unauthorized
```

### Test Security Validation
```bash
# Test path traversal
curl -X GET http://localhost:5000/api/video/ai-generated/download/../../../etc/passwd \
  -H "Authorization: Bearer YOUR_TOKEN" -v
# Expected: 400 Bad Request

# Test file type validation
curl -X GET http://localhost:5000/api/video/ai-generated/download/document.pdf \
  -H "Authorization: Bearer YOUR_TOKEN" -v
# Expected: 400 Bad Request
```

## Frontend Testing

### Test Button States
1. **Normal State**: "Download Video" enabled
2. **Loading State**: "Downloading..." with spinner, disabled
3. **Disabled State**: Button disabled when no filename available

### Test Error Handling
1. Network error (disconnect during download)
2. Server error (500 response)
3. Authentication timeout

**Expected Results:**
- User-friendly error messages
- Button state resets appropriately
- Console logs for debugging

## Database Verification

### Check Download Tracking
```javascript
// Query to verify download logging
db.ai_generated_videos.find({
  videoFileName: "your_video_file.mp4"
}).pretty()

// Should show:
// - downloadCount: incremented
// - lastDownloadedAt: recent timestamp
```

## Performance Monitoring

### Server Metrics
- Memory usage during download
- Response times
- Concurrent download capacity

### Client Metrics
- Download start time
- Progress indication
- File size verification

## Security Checklist

- ✅ Authentication middleware applied
- ✅ Filename sanitized and validated
- ✅ Path traversal protection implemented
- ✅ File type restrictions enforced
- ✅ User ownership verification
- ✅ Error information doesn't leak paths
- ✅ Download events logged (optional)

## Browser Compatibility

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Mobile Testing

- ✅ Download works on mobile browsers
- ✅ File saved to device storage
- ✅ UI responsive on small screens

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend allows download endpoint
   - Check preflight handling

2. **Authentication Failures**
   - Verify token format
   - Check token expiration
   - Ensure middleware properly applied

3. **File Not Found**
   - Verify file exists in `/public/videos/`
   - Check filename case sensitivity
   - Verify database record accuracy

4. **Download Fails Mid-way**
   - Check server timeout settings
   - Verify file integrity
   - Monitor network stability

## Success Criteria

✅ All security tests pass  
✅ Happy path works consistently  
✅ Error handling is user-friendly  
✅ Performance is acceptable  
✅ Analytics tracking works  
✅ Mobile compatibility confirmed  
✅ Browser compatibility confirmed  

## Rollback Plan

If issues are discovered:
1. Disable download button in UI
2. Add feature flag in backend
3. Revert route changes if necessary
4. Monitor for any security incidents
