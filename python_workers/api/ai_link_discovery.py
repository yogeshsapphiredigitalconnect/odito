"""AI Link Discovery API routes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson.objectid import ObjectId

router = APIRouter()

class AiLinkDiscoveryJob(BaseModel):
    jobId: str
    projectId: str
    userId: str
    aiProjectId: str
    url: str

@router.post("/jobs/ai-link-discovery")
def handle_ai_link_discovery(job: AiLinkDiscoveryJob):
    """Handle AI_LINK_DISCOVERY job dispatched from Node.js"""
    # Import here to avoid circular imports
    from main import completed_jobs, completed_jobs_lock
    from scraper.workers.ai.ai_link_discovery.ai_link_discovery import execute_ai_link_discovery
    
    try:
        # Defensive guard: skip if already completed
        with completed_jobs_lock:
            if job.jobId in completed_jobs:
                print(f"ℹ️ Skipping already completed AI_LINK_DISCOVERY job | jobId={job.jobId}")
                return {
                    "status": "already_completed",
                    "jobId": job.jobId,
                    "message": "AI link discovery job already completed"
                }
        
        print(f"[WORKER] AI_LINK_DISCOVERY started | jobId={job.jobId} | url={job.url}")
        
        # Execute AI link discovery immediately (no polling loop)
        result = execute_ai_link_discovery(job)
        
        # Mark as completed
        with completed_jobs_lock:
            completed_jobs.add(job.jobId)
        
        return {
            "status": "accepted",
            "jobId": job.jobId,
            "message": "AI_LINK_DISCOVERY job accepted and processing"
        }
        
    except Exception as e:
        print(f"❌ Failed to handle AI_LINK_DISCOVERY job | jobId={job.jobId} | reason={str(e)}")
        return {
            "status": "error",
            "jobId": job.jobId,
            "error": str(e)
        }
