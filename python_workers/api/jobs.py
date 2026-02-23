"""Job management API routes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class CancelJobRequest(BaseModel):
    jobId: str

class LinkDiscoveryJob(BaseModel):
    jobId: str
    projectId: str
    userId: str
    main_url: str

@router.post("/jobs/link-discovery")
def handle_link_discovery(job: LinkDiscoveryJob):
    """Handle LINK_DISCOVERY job dispatched from Node.js"""
    # Import here to avoid circular imports
    from scraper.workers.seo.link_discovery.link_discovery import execute_link_discovery
    
    return execute_link_discovery(job)

@router.post("/jobs/cancel")
def cancel_job(request: CancelJobRequest):
    """Mark a job as cancelled"""
    # Import here to avoid circular imports
    from main import cancelled_jobs, cancelled_jobs_lock
    
    with cancelled_jobs_lock:
        cancelled_jobs.add(request.jobId)
    print(f"🛑 Job {request.jobId} marked as cancelled by user")
    return {"success": True, "message": f"Job {request.jobId} cancelled"}

def is_job_cancelled(job_id: str) -> bool:
    """Check if a job has been cancelled"""
    # Import here to avoid circular imports
    from main import cancelled_jobs, cancelled_jobs_lock
    
    with cancelled_jobs_lock:
        return job_id in cancelled_jobs
