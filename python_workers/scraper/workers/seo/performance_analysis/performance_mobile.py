"""Performance Mobile Analysis Worker."""

import os
import requests
from datetime import datetime
from bson.objectid import ObjectId
from db import seo_page_performance, seo_page_data

def send_progress_update(job_id: str, percentage: int, step: str, message: str, subtext: str = None):
    """Send progress update to Node.js backend"""
    try:
        node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
        progress_url = f"{node_backend_url}/api/jobs/{job_id}/progress"
        
        payload = {
            "percentage": percentage,
            "step": step,
            "message": message,
            "subtext": subtext
        }
        
        response = requests.post(progress_url, json=payload, timeout=5)
        response.raise_for_status()
        
        print(f"📊 Progress update sent: {percentage}% - {step}")
        
    except Exception as e:
        print(f"⚠️ Failed to send progress update: {e}")
        # Don't raise exception - progress updates are non-critical

def execute_performance_mobile_logic(job):
    """Execute PERFORMANCE_MOBILE job logic"""
    job_id = job.jobId
    project_id = job.projectId
    source_job_id = job.sourceJobId
    
    print(f"[WORKER] PERFORMANCE_MOBILE started | jobId={job_id} | sourceJobId={source_job_id}")
    
    try:
        # 1. Send initial progress
        send_progress_update(job_id, 10, "PERFORMANCE_MOBILE", "Starting mobile performance analysis")
        
        # 2. Get pages from seo_page_data collection by projectId only
        print(f"[DEBUG] PERFORMANCE_MOBILE MongoDB Audit:")
        print(f"[DEBUG] - Database: {seo_page_data.database.name}")
        print(f"[DEBUG] - Collection: {seo_page_data.name}")
        print(f"[DEBUG] - projectId type: {type(project_id)} | value: {project_id}")
        
        # Convert to ObjectId if string
        from bson.objectid import ObjectId
        if isinstance(project_id, str):
            try:
                project_id_obj = ObjectId(project_id)
                print(f"[DEBUG] - projectId converted to ObjectId: {project_id_obj}")
            except Exception as e:
                print(f"[ERROR] Failed to convert projectId to ObjectId: {e}")
                project_id_obj = project_id
        else:
            project_id_obj = project_id
        
        query_filter = {"projectId": project_id_obj}
        print(f"[DEBUG] - Query filter: {query_filter}")
        
        # Get count first
        total_count = seo_page_data.count_documents(query_filter)
        print(f"[DEBUG] - Document count: {total_count}")
        
        # Execute query
        pages = list(seo_page_data.find(query_filter))
        
        print(f"[DEBUG] - Pages returned: {len(pages)}")
        
        # Log sample document if available
        if pages:
            sample_doc = pages[0]
            print(f"[DEBUG] - Sample document keys: {list(sample_doc.keys())}")
            print(f"[DEBUG] - Sample projectId: {sample_doc.get('projectId')} (type: {type(sample_doc.get('projectId'))})")
            print(f"[DEBUG] - Sample page_url: {sample_doc.get('page_url', 'N/A')}")
        else:
            # Log what documents DO exist for debugging
            all_docs = list(seo_page_data.find({}).limit(3))
            if all_docs:
                print(f"[DEBUG] - Existing document keys: {list(all_docs[0].keys())}")
                print(f"[DEBUG] - Existing projectId field: {all_docs[0].get('projectId')} (type: {type(all_docs[0].get('projectId'))})")
            else:
                print(f"[DEBUG] - Collection is completely empty!")
        
        print(f"[PERFORMANCE] Pages fetched: {len(pages)}")
        
        if not pages:
            print(f"[WARNING] No pages found for performance analysis | jobId={job_id} | projectId={project_id}")
            send_progress_update(job_id, 100, "PERFORMANCE_MOBILE", "No pages found", "0 pages processed")
            return {
                "status": "completed",
                "jobId": job_id,
                "message": "No pages found for performance analysis",
                "pages_processed": 0,
                "performance_records_created": 0
            }
        
        print(f"[WORKER] Found {len(pages)} pages for performance analysis | jobId={job_id} | projectId={project_id}")
        send_progress_update(job_id, 20, "PERFORMANCE_MOBILE", f"Found {len(pages)} pages to analyze", f"Processing {len(pages)} pages")
        
        # 3. Process each page (placeholder logic)
        analyzed_pages = []
        failed_pages = []
        
        for i, page in enumerate(pages):
            page_url = page.get("url", "")  # FIXED: Use "url" not "page_url"
            
            if not page_url:
                print(f"[WARNING] Skipping page with empty URL | jobId={job_id} | page_index={i}")
                failed_pages.append({"url": "", "error": "Empty page URL"})
                continue
            
            try:
                # Placeholder performance data - NO PageSpeed API calls yet
                print(f"[DEBUG] Processing page {i+1}/{len(pages)} | URL: {page_url}")
                
                performance_data = {
                    "projectId": ObjectId(project_id),  # FIXED: Convert to ObjectId
                    "seo_jobId": ObjectId(job_id),       # FIXED: Convert to ObjectId
                    "page_url": page_url,
                    "device_type": "mobile",
                    "analyzed_at": datetime.utcnow(),
                    # Placeholder metrics - will be replaced with real PageSpeed data
                    "performance_score": 85,  # Placeholder
                    "first_contentful_paint": 1.2,  # Placeholder
                    "largest_contentful_paint": 2.1,  # Placeholder
                    "cumulative_layout_shift": 0.1,  # Placeholder
                    "total_blocking_time": 150,  # Placeholder
                    "speed_index": 1.8,  # Placeholder
                    "time_to_interactive": 2.5,  # Placeholder
                    "status": "completed",
                    "error": None
                }
                
                # Store in seo_page_performance collection
                seo_page_performance.insert_one(performance_data)
                analyzed_pages.append(page_url)
                
                # Send progress update
                progress = 25 + int((i + 1) / len(pages) * 60)
                send_progress_update(job_id, progress, "PERFORMANCE_MOBILE", f"Analyzed {i + 1}/{len(pages)} pages")
                
            except Exception as page_error:
                print(f"[ERROR] Failed to analyze page | jobId={job_id} | page={page_url} | error=\"{str(page_error)}\"")
                failed_pages.append({"url": page_url, "error": str(page_error)})
        
        # 4. Final stats and completion
        stats = {
            "totalPages": len(pages),
            "analyzedPages": len(analyzed_pages),
            "failedPages": len(failed_pages),
            "deviceType": "mobile"
        }
        
        result_data = {
            "device_type": "mobile",
            "pages_processed": analyzed_pages,
            "pages_failed": failed_pages,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
        print(f"[WORKER] PERFORMANCE_MOBILE completed | jobId={job_id} | analyzed={len(analyzed_pages)} | failed={len(failed_pages)}")
        
        # 5. Send completion callback to Node.js
        send_completion_callback(job_id, stats, result_data)
        
        return {
            "status": "completed",
            "jobId": job_id,
            "stats": stats,
            "result_data": result_data
        }
        
    except Exception as e:
        print(f"[ERROR] PERFORMANCE_MOBILE failed | jobId={job_id} | error=\"{str(e)}\"")
        
        # Send failure callback to Node.js
        send_failure_callback(job_id, str(e))
        
        return {
            "status": "failed",
            "jobId": job_id,
            "error": str(e)
        }

def send_completion_callback(job_id: str, stats: dict, result_data: dict):
    """Send completion callback to Node.js backend"""
    try:
        node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
        node_url = f"{node_backend_url}/api/jobs/{job_id}/complete"
        callback_payload = {"stats": stats, "result_data": result_data}
        
        response = requests.post(node_url, json=callback_payload, timeout=10)
        response.raise_for_status()
        
        print(f"[API] PERFORMANCE_MOBILE completion sent | jobId={job_id}")
        
    except Exception as callback_error:
        print(f"[ERROR] Failed to send PERFORMANCE_MOBILE completion | jobId={job_id} | error=\"{str(callback_error)}\"")
        # Try to mark job as failed instead
        try:
            node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
            node_fail_url = f"{node_backend_url}/api/jobs/{job_id}/fail"
            fail_payload = {"error": str(callback_error), "stats": stats}
            requests.post(node_fail_url, json=fail_payload, timeout=10)
        except:
            print(f"[CRITICAL] Failed to mark job as failed | jobId={job_id}")

def send_failure_callback(job_id: str, error: str):
    """Send failure callback to Node.js backend"""
    try:
        node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
        node_fail_url = f"{node_backend_url}/api/jobs/{job_id}/fail"
        fail_payload = {"error": error}
        
        response = requests.post(node_fail_url, json=fail_payload, timeout=10)
        response.raise_for_status()
        
        print(f"[API] PERFORMANCE_MOBILE failure sent | jobId={job_id}")
        
    except Exception as callback_error:
        print(f"[CRITICAL] Failed to send PERFORMANCE_MOBILE failure | jobId={job_id} | error=\"{str(callback_error)}\"")
