"""AI Visibility API routes."""

from fastapi import APIRouter, HTTPException, Request
from scraper.workers.ai.ai_visibility.ai_visibility import AIVisibilityJob

router = APIRouter()

@router.post("/jobs/ai-visibility")
async def handle_ai_visibility(request: Request):
    """Handle AI_VISIBILITY job dispatched from Node.js"""
    # Debug: Print raw request body
    body = await request.json()
    print("RAW BODY:", body)
    
    # Convert to Pydantic model
    job = AIVisibilityJob(**body)
    print("PARSED VALUES:")
    print(f"  jobId: {job.jobId}")
    print(f"  projectId: {job.projectId}")
    print(f"  userId: {job.userId}")
    print(f"  aiProjectId: {job.aiProjectId}")
    print(f"  TYPE aiProjectId: {type(job.aiProjectId)}")
    print(f"  RAW aiProjectId from body: {body.get('aiProjectId')}")
    print(f"  TYPE raw aiProjectId: {type(body.get('aiProjectId'))}")
    
    # Import here to avoid circular imports
    from main import completed_jobs, completed_jobs_lock
    from scraper.workers.ai.ai_visibility.ai_visibility import execute_ai_visibility
    
    try:
        # Defensive guard: skip if already completed
        with completed_jobs_lock:
            if job.jobId in completed_jobs:
                print(f"ℹ️ Skipping already completed AI_VISIBILITY job | jobId={job.jobId}")
                return {
                    "status": "already_completed",
                    "jobId": job.jobId,
                    "message": "Job already completed"
                }
        
        print(f"[WORKER] AI_VISIBILITY started | jobId={job.jobId}")
        
        # Use the parsed Pydantic model directly - DO NOT recreate it
        ai_job = job
        
        # Execute AI visibility immediately (no polling loop)
        result = execute_ai_visibility(ai_job, aiProjectId=job.aiProjectId)
        
        # Mark as completed
        with completed_jobs_lock:
            completed_jobs.add(job.jobId)
        
        return {
            "status": "accepted",
            "jobId": job.jobId,
            "message": "AI_VISIBILITY job accepted and processing"
        }
        
    except Exception as e:
        print(f"[ERROR] AI_VISIBILITY handler failed | jobId={job.jobId} | reason=\"{str(e)}\"")
        return {
            "status": "error",
            "jobId": job.jobId,
            "error": str(e)
        }
