"""Keyword research API routes."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

router = APIRouter()


class KeywordResearchJob(BaseModel):
    jobId: str
    projectId: str
    userId: str
    keyword: str
    depth: Optional[int] = 2


@router.post("/jobs/keyword-research")
def handle_keyword_research(job: KeywordResearchJob):
    """Handle KEYWORD_RESEARCH job dispatched from Node.js"""
    from main import completed_jobs, completed_jobs_lock
    from scraper.workers.seo.keyword_research.keyword_research import execute_keyword_research

    print(f"[ROUTE] KEYWORD_RESEARCH handler entered | jobId={job.jobId} | keyword=\"{job.keyword}\" | timestamp={datetime.now(timezone.utc).isoformat()}")

    try:
        # Defensive guard: skip if already completed
        with completed_jobs_lock:
            if job.jobId in completed_jobs:
                print(f"ℹ️ Skipping already completed KEYWORD_RESEARCH job | jobId={job.jobId} | timestamp={datetime.now(timezone.utc).isoformat()}")
                return {
                    "status": "already_completed",
                    "jobId": job.jobId,
                    "message": "Job already completed"
                }

        print(f"[WORKER] KEYWORD_RESEARCH started | jobId={job.jobId} | keyword=\"{job.keyword}\" | depth={job.depth} | timestamp={datetime.now(timezone.utc).isoformat()}")

        # Execute keyword research
        result = execute_keyword_research(job)

        # Mark as completed
        with completed_jobs_lock:
            completed_jobs.add(job.jobId)

        return {
            "status": "accepted",
            "jobId": job.jobId,
            "message": "KEYWORD_RESEARCH job accepted and processing"
        }

    except Exception as e:
        print(f"[ERROR] KEYWORD_RESEARCH handler failed | jobId={job.jobId} | reason=\"{str(e)}\" | timestamp={datetime.now(timezone.utc).isoformat()}")
        return {
            "status": "error",
            "jobId": job.jobId,
            "error": str(e)
        }
