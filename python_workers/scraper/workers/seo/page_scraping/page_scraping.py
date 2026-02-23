"""Page scraping worker implementation."""



import os

import threading

from datetime import datetime

from concurrent.futures import ThreadPoolExecutor, as_completed

from bson.objectid import ObjectId



# Third-party imports

from fastapi import HTTPException

from pydantic import BaseModel

import requests



# Local imports

from scraper.shared.orchestrator import scrape_page_data

from scraper.shared.screenshots import clear_screenshot_registry, take_page_screenshot

from db import seo_internal_links, seo_page_data



class PageScrapingJob(BaseModel):

    jobId: str

    projectId: str

    userId: str

    urls: list[str]  # Deterministic input from LINK_DISCOVERY

    sourceJobId: str | None = None  # Reference to LINK_DISCOVERY job



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

        

    except Exception as e:

        # Don't raise exception - progress updates are non-critical

        pass



def is_job_cancelled(job_id: str) -> bool:

    """Check if a job has been cancelled"""

    # Import here to avoid circular imports

    from main import cancelled_jobs, cancelled_jobs_lock

    

    with cancelled_jobs_lock:

        return job_id in cancelled_jobs



def execute_page_scraping_logic(job: PageScrapingJob):

    # Track start time for duration calculation

    start_time = datetime.utcnow()

    duration_ms = 0  # Initialize before try block

    

    try:

        print(f"[WORKER] PAGE_SCRAPING started | jobId={job.jobId} | totalUrls={len(job.urls)}")

        

        # Clear screenshot registry at the start of each job

        clear_screenshot_registry()

        

        # Check for cancellation early

        if is_job_cancelled(job.jobId):

            print(f"[WORKER] PAGE_SCRAPING cancelled | jobId={job.jobId}")

            return {"status": "cancelled", "jobId": job.jobId, "message": "Job cancelled by user"}

        

        # Initialize counters for failure tolerance

        successful_pages = 0

        failed_pages = 0

        completed_pages = 0

        total_pages = len(job.urls)

        

        def scrape_single_url(url):

            """Scrape a single URL - optimized for concurrent processing"""

            nonlocal successful_pages, failed_pages, completed_pages

            

            # Check cancellation before processing each URL

            if is_job_cancelled(job.jobId):

                return None

            

            try:

                # Scrape page data using comprehensive extraction

                page_data = scrape_page_data(url)

                

                # Take screenshot (best-effort, failures don't affect scraping)

                screenshot_path = take_page_screenshot(url, job.jobId, job.projectId)

                

                if page_data and page_data.get("extraction_status") == "SUCCESS":

                    # Add job metadata and screenshot path, including HTTP metrics

                    page_data.update({

                        "seo_jobId": ObjectId(job.jobId),

                        "projectId": ObjectId(job.projectId),

                        "sourceJobId": ObjectId(job.sourceJobId) if job.sourceJobId else None,

                        "scrapedAt": datetime.utcnow(),

                        "scrape_status": "SUCCESS",

                        "screenshot_path": screenshot_path,

                        "http_status_code": page_data.get("http_status_code"),

                        "response_time_ms": page_data.get("response_time_ms")

                    })

                    successful_pages += 1

                    completed_pages += 1

                    

                    # Send progress update after each successful page

                    percentage = int((completed_pages / total_pages) * 100)

                    send_progress_update(

                        job.jobId, 

                        percentage, 

                        "Scraping", 

                        "Scraping website pages", 

                        f"{completed_pages} of {total_pages} pages scraped"

                    )

                    

                    return page_data

                else:

                    failed_pages += 1

                    completed_pages += 1

                    

                    # Send progress update after each failed page

                    percentage = int((completed_pages / total_pages) * 100)

                    send_progress_update(

                        job.jobId, 

                        percentage, 

                        "Scraping", 

                        "Scraping website pages", 

                        f"{completed_pages} of {total_pages} pages scraped"

                    )

                    

                    return {

                        "url": url,

                        "seo_jobId": ObjectId(job.jobId),

                        "projectId": ObjectId(job.projectId),

                        "sourceJobId": ObjectId(job.sourceJobId) if job.sourceJobId else None,

                        "scrapedAt": datetime.utcnow(),

                        "scrape_status": "FAILED",

                        "error": page_data.get("error", "Extraction failed"),

                        "screenshot_path": screenshot_path,

                        "http_status_code": page_data.get("http_status_code"),

                        "response_time_ms": page_data.get("response_time_ms")

                    }

                    

            except Exception as e:

                failed_pages += 1

                completed_pages += 1

                

                # Send progress update after each exception

                percentage = int((completed_pages / total_pages) * 100)

                send_progress_update(

                    job.jobId, 

                    percentage, 

                    "Scraping", 

                    "Scraping website pages", 

                    f"{completed_pages} of {total_pages} pages scraped"

                )

                

                return {

                    "url": url,

                    "seo_jobId": ObjectId(job.jobId),

                    "projectId": ObjectId(job.projectId),

                    "sourceJobId": ObjectId(job.sourceJobId) if job.sourceJobId else None,

                    "scrapedAt": datetime.utcnow(),

                    "scrape_status": "FAILED",

                    "error": str(e),

                    "screenshot_path": None

                }       

        

        # Process URLs with ThreadPoolExecutor (max 6 workers as required)

        all_results = []

        with ThreadPoolExecutor(max_workers=6) as executor:

            # Submit all scraping tasks

            futures = [executor.submit(scrape_single_url, url) for url in job.urls]

            

            # Collect results as they complete

            for future in as_completed(futures):

                # Check cancellation during result collection

                if is_job_cancelled(job.jobId):

                    print(f"🛑 Job {job.jobId} cancelled during scraping")

                    # Cancel remaining futures

                    for f in futures:

                        f.cancel()

                    return {"status": "cancelled", "jobId": job.jobId, "message": "Job cancelled by user"}

                

                result = future.result()

                if result:

                    all_results.append(result)

        

        # Final cancellation check before storing results

        if is_job_cancelled(job.jobId):

            print(f"🛑 Job {job.jobId} cancelled before completion")

            return {"status": "cancelled", "jobId": job.jobId, "message": "Job cancelled by user"}

        

        # Store all results in bulk (successful and failed)

        if all_results:

            seo_page_data.insert_many(all_results, ordered=False)

        

        # Update seo_internal_links with crawl status and HTTP metrics after PAGE_SCRAPING completion

        try:

            # Get all URLs for this job (job.urls contains strings, not dicts)

            job_urls = job.urls

            

            # Update each internal link with crawl status and HTTP metrics

            for result in all_results:

                # Defensive guard: ensure result is a dictionary and has required fields

                if not result or not isinstance(result, dict):

                    continue

                    

                url = result.get("url")

                if not url or not isinstance(url, str):

                    continue

                    

                update_result = seo_internal_links.update_one(

                    {"url": url, "seo_jobId": ObjectId(job.sourceJobId)},

                    {

                        "$set": {

                            "crawledAt": datetime.utcnow()

                        }

                    }

                )

                if update_result.matched_count == 0:

                    print(f"[WARNING] No matching internal link found for update | url={url} | seo_jobId={job.sourceJobId}")

                elif update_result.modified_count == 0:

                    print(f"[WARNING] Internal link found but not modified | url={url} | seo_jobId={job.sourceJobId}")

            print(f"[WORKER] Updated internal links with crawl timestamp | jobId={job.jobId} | updated={len([r for r in all_results if r and isinstance(r, dict) and r.get('url')])}")

        except Exception as update_error:

            print(f"[ERROR] Failed to update internal links with crawl timestamp | jobId={job.jobId} | reason=\"{str(update_error)}\"")

        

        # Calculate duration before sending callbacks

        end_time = datetime.utcnow()

        duration_ms = int((end_time - start_time).total_seconds() * 1000)



        # Prepare completion stats

        stats = {

            "totalUrls": total_pages,

            "successfulPages": successful_pages,

            "failedPages": failed_pages,

            "successRate": round((successful_pages / total_pages) * 100, 2) if total_pages > 0 else 0

        }

        

        # Store stats in result_data for summary aggregation

        result_data = {

            "totalUrls": total_pages,

            "successfulPages": successful_pages,

            "failedPages": failed_pages,

            "successRate": round((successful_pages / total_pages) * 100, 2) if total_pages > 0 else 0,

            "duration_ms": duration_ms

        }

        

        print(f"[WORKER] PAGE_SCRAPING completed | jobId={job.jobId} | success={successful_pages} | failed={failed_pages}")

        

        # Send completion callback to Node.js (fire-and-forget)

        try:

            import requests

            node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

            node_url = f"{node_backend_url}/api/jobs/{job.jobId}/complete"

            callback_payload = {"stats": stats, "result_data": result_data}

            

            # Fire-and-forget completion notification

            response = requests.post(node_url, json=callback_payload, timeout=30)

            response.raise_for_status()

            

            print(f"✅ Successfully notified Node.js of page scraping completion")

            

        except requests.exceptions.Timeout:

            # Fire-and-forget: timeout doesn't mean job failed

            pass

            

        except Exception as callback_error:

            # Log but don't fail the job - completion is best-effort

            print(f"⚠️ Failed to notify Node.js of completion (job still succeeded): {callback_error}")

        

        # Always return success - job execution is complete regardless of notification

        return {

            "status": "success",

            "jobId": job.jobId,

            "stats": stats,

            "duration_ms": duration_ms,

            "message": "Page scraping completed and results stored"

        }

        

    except Exception as e:

        print(f"❌ Job {job.jobId} failed: {str(e)}")

        

        # Safely compute duration even in exception case

        end_time = datetime.utcnow()

        duration_ms = int((end_time - start_time).total_seconds() * 1000)

        

        # Send failure callback to Node.js

        try:

            import requests

            node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

            node_fail_url = f"{node_backend_url}/api/jobs/{job.jobId}/fail"

            fail_payload = {"error": str(e)}

            requests.post(node_fail_url, json=fail_payload, timeout=10)

        except:

            pass

            

        raise HTTPException(status_code=500, detail=str(e))

