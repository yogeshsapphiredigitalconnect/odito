# AI Video Feature Integration Guide

## 🚀 Quick Setup

### 1. Backend Integration

Add the AI Video routes to your main app:

```javascript
// In your main app.js or routes/index.js
import { aiVideoRoutes } from './modules/aiVideo/aiVideo.routes.js';

app.use('/api/ai-video', aiVideoRoutes);
```

### 2. Environment Variables

Add to your `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Frontend Integration

```jsx
import { AIVideoGenerator } from '@/components/ai-video';

// Usage
<AIVideoGenerator projectId={projectId} />
```

## 📁 File Structure

```
Backend:
├── src/modules/aiVideo/
│   ├── aiVideo.controller.js
│   ├── aiVideo.service.js
│   ├── aiVideo.routes.js
│   ├── aiVideo.transformer.js
│   ├── aiVideo.prompt.js
│   └── index.js
└── src/services/
    └── gemini.service.js

Frontend:
├── components/ai-video/
│   ├── AIVideoGenerator.jsx
│   └── index.js
```

## 🔧 API Endpoint

**GET** `/api/ai-video/:projectId`

**Response:**
```json
{
  "success": true,
  "script": "Generated video script text...",
  "metadata": {
    "projectId": "123",
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "processingTime": 2500
  }
}
```

## ⚡ Performance Features

- **Parallel Data Fetching**: Uses `Promise.all` to fetch all page data simultaneously
- **Data Transformation**: Clean JSON structure optimized for AI processing
- **Error Handling**: Comprehensive error handling with fallbacks
- **Caching Ready**: Structure supports future caching implementation

## 🎯 Key Features

1. **Full Audit Data Integration**: Fetches data from all 14 PDF pages
2. **Smart Data Transformation**: Converts raw data to AI-friendly format
3. **Professional Script Generation**: Uses Gemini AI for high-quality scripts
4. **Beautiful UI**: Modern loading states and script display
5. **Export Options**: Copy to clipboard and download functionality

## 🛠️ Dependencies

### Backend
- `node-fetch` (for Gemini API calls)
- Existing PDF services (CoverPageService, ExecutiveService, etc.)

### Frontend
- `lucide-react` (for icons)
- Tailwind CSS (for styling)

## 🔒 Authentication

The feature uses existing authentication middleware. Users must be logged in to generate video scripts.

## 📊 Data Sources

The AI Video feature pulls data from:
- Cover page (`/cover`)
- Executive summary (`/executive`)
- On-Page SEO (`/page08`)
- Structured Data (`/page09`)
- Technical SEO (`/page10`)
- Crawlability (`/page11`)
- Performance data (`/performance`)

## 🎨 Customization

### Script Style
Edit `aiVideo.prompt.js` to customize the script generation prompt.

### UI Styling
Modify `AIVideoGenerator.jsx` to change the appearance and behavior.

### Data Transformation
Update `aiVideo.transformer.js` to modify how data is processed for AI.

## 🚨 Error Handling

- **Missing API Key**: Returns "AI service configuration error"
- **Quota Exceeded**: Returns "AI service quota exceeded"
- **Timeout**: Returns "AI service timeout"
- **General Failures**: Returns "AI service temporarily unavailable"

## 🔄 Testing

Test the integration with:

```bash
# Backend
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/ai-video/<projectId>

# Frontend
# Click the "Generate AI Video" button in the UI
```

## 📈 Monitoring

All operations are logged with:
- Processing times
- Data source counts
- Error details
- User identification

## 🎬 Production Ready

The feature is production-ready with:
- Comprehensive error handling
- Performance optimization
- Security best practices
- Scalable architecture
- Professional UI/UX
