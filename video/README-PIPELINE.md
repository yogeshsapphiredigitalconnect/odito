# Video Generation Pipeline

This directory contains the complete video generation pipeline that converts SEO audit scripts into professional narrated videos.

## Architecture Overview

```
Frontend (Generate Video) → Backend Job Creation → Worker Processing → Audio Generation → Video Render → Storage → Frontend Display
```

## Components

### 1. Backend Components

#### Job Model (`../odito_backend/src/modules/jobs/model/Job.js`)
- Extended with `VIDEO_GENERATION` job type
- Tracks video generation progress and results

#### Video Endpoint (`../odito_backend/src/modules/aiVideo/controllers/aiScript.controller.js`)
- `POST /api/ai-video/video` - Creates video generation jobs
- Validates project, ensures script exists, creates job

#### Job Status Endpoint (`../odito_backend/src/modules/jobs/routes/jobRoutes.js`)
- `GET /api/jobs/:jobId/status` - Polling endpoint for job status

### 2. Video Worker Components

#### Main Worker (`worker.js`)
- Polls database for `VIDEO_GENERATION` jobs
- Orchestrates the complete video generation pipeline
- Updates job status and results

#### Audio Service (`services/audioService.js`)
- Converts script text to audio using ElevenLabs API
- Manages audio file storage and retrieval
- Handles audio cleanup and error management

#### Remotion Integration (`src/WorkingVideo.tsx`)
- Updated to accept dynamic props (audioFile, projectId, auditData)
- Uses single audio track for entire video
- Maintains existing slide structure and timing

### 3. Frontend Components

#### AI Video Page (`../frontend/app/ai-video/page.jsx`)
- Replaced "Generate Script" with "Generate Video" button
- Added real-time job status polling
- Displays video player when generation completes
- Shows progress indicators and error handling

#### API Service (`../frontend/services/aiVideoApi.js`)
- Added `generateVideo()` function
- Added `getJobStatus()` for polling
- Maintains existing script generation functions

## Setup Instructions

### 1. Environment Variables

Create/update `.env` file in the video directory:

```env
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=rachel

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/odito

# Backend API URL (for frontend)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
cd video
npm install
```

### 3. Start the Worker

```bash
npm run worker
```

The worker will:
- Connect to MongoDB
- Start polling for VIDEO_GENERATION jobs
- Process jobs as they are created

## File Structure

```
video/
├── worker.js                    # Main video generation worker
├── services/
│   └── audioService.js          # ElevenLabs audio generation
├── src/
│   ├── WorkingVideo.tsx        # Updated Remotion video component
│   └── ...                      # Existing Remotion components
├── public/
│   ├── audio/                   # Generated audio files
│   └── videos/                  # Generated video files
├── temp/                        # Temporary data files
└── package.json                 # Dependencies and scripts
```

## Pipeline Flow

### 1. Job Creation
1. User clicks "Generate Video" in frontend
2. Frontend calls `POST /api/ai-video/video`
3. Backend validates project and script
4. Backend creates `VIDEO_GENERATION` job
5. Job ID returned to frontend

### 2. Job Processing
1. Worker polls and claims the job
2. Fetches script from `aiscripts` collection
3. Generates audio using ElevenLabs
4. Renders video using Remotion CLI
5. Updates job with results

### 3. Frontend Polling
1. Frontend polls `GET /api/jobs/:jobId/status` every 3 seconds
2. Updates UI with job status
3. Shows video player when job completes

## API Endpoints

### Generate Video
```
POST /api/ai-video/video
Body: { projectId }
Response: { success: true, jobId: "string" }
```

### Job Status
```
GET /api/jobs/:jobId/status
Response: { 
  success: true, 
  data: { 
    status: "pending|processing|completed|failed",
    result_data: { videoUrl: "string" },
    error: { message: "string" }
  }
}
```

## Error Handling

The pipeline includes comprehensive error handling:

- **Audio Generation**: Retry logic, ElevenLabs API error handling
- **Video Rendering**: Timeout protection, Remotion CLI error capture
- **Job Processing**: Status updates, error logging, graceful failure
- **Frontend**: User-friendly error messages, retry options

## Monitoring

### Console Logs
All components include detailed logging:
- `[VIDEO_CTRL]` - Backend controller logs
- `[VIDEO_WORKER]` - Worker process logs
- `[AUDIO_SERVICE]` - Audio generation logs
- `[REMOTION]` - Remotion CLI logs

### Job Status Tracking
Jobs track:
- Creation, start, completion timestamps
- Processing time
- Error messages and stack traces
- Result data (video URLs, audio URLs)

## Testing

### Manual Testing
1. Start the worker: `npm run worker`
2. Start the backend server
3. Start the frontend
4. Navigate to AI Video Report
5. Select a project and click "Generate Video"
6. Monitor console logs and job status

### Expected Behavior
- Job should move from pending → processing → completed
- Audio file should appear in `public/audio/`
- Video file should appear in `public/videos/`
- Frontend should display the completed video

## Troubleshooting

### Common Issues

1. **Worker can't connect to MongoDB**
   - Check `MONGODB_URI` in `.env`
   - Ensure MongoDB is running

2. **Audio generation fails**
   - Verify `ELEVENLABS_API_KEY` is valid
   - Check ElevenLabs API quota

3. **Video rendering fails**
   - Ensure Remotion dependencies are installed
   - Check audio file exists before rendering
   - Monitor Remotion CLI output

4. **Frontend polling stops**
   - Check network connection to backend
   - Verify job ID is correct
   - Check browser console for errors

### Debug Mode
Enable verbose logging by setting:
```env
DEBUG=video:*
```

## Production Considerations

### Scaling
- Run multiple worker instances
- Use job priority for queue management
- Implement job timeout handling

### Storage
- Configure CDN for video/audio files
- Implement file cleanup policies
- Add storage usage monitoring

### Security
- Validate all file inputs
- Sanitize user-generated content
- Implement rate limiting

## Maintenance

### Regular Tasks
- Monitor worker performance
- Clean up old temporary files
- Update API keys as needed
- Check storage usage

### Updates
- Update Remotion dependencies
- Refresh ElevenLabs voices
- Review job processing logic
- Update error handling procedures
