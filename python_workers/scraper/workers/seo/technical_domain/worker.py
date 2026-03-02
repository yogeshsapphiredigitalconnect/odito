"""
TECHNICAL_DOMAIN worker - Pure data collection for domain-level technical data.

Fetches /robots.txt and /sitemap.xml for the project domain.
Stores raw data via the Node.js backend API.
Reports job completion so the pipeline continues.

NO scoring logic. NO rule evaluation. NO parsing validation.
"""

import os
import requests
from scraper.workers.seo.technical_domain.robots_fetcher import fetch_robots
from scraper.workers.seo.technical_domain.sitemap_fetcher import fetch_sitemap


def execute_technical_domain(job):
    """
    Execute TECHNICAL_DOMAIN job: fetch robots.txt and sitemap.xml, store results.
    
    Args:
        job: Pydantic model with jobId, projectId, userId, domain
        
    Returns:
        dict with status and results
    """
    job_id = job.jobId
    project_id = job.projectId
    domain = job.domain
    node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
    
    # Domain normalization: ensure protocol prefix
    domain = domain.strip().rstrip("/")
    if not domain.startswith("http://") and not domain.startswith("https://"):
        domain = "https://" + domain
    
    print(f"[TECHNICAL_DOMAIN] Starting | jobId={job_id} | domain={domain}")
    
    try:
        # Step 1: Fetch robots.txt
        print(f"[TECHNICAL_DOMAIN] Fetching robots.txt | domain={domain}")
        robots_result = fetch_robots(domain)
        
        # Step 2: Fetch sitemap.xml
        print(f"[TECHNICAL_DOMAIN] Fetching sitemap.xml | domain={domain}")
        sitemap_result = fetch_sitemap(domain)
        
        # Step 3: Store results via Node.js API
        report_data = {
            "projectId": project_id,
            "domain": domain,
            "robotsStatus": robots_result["status"],
            "robotsExists": robots_result["exists"],
            "robotsContent": robots_result["content"],
            "sitemapStatus": sitemap_result["status"],
            "sitemapExists": sitemap_result["exists"],
            "sitemapContent": sitemap_result["content"],
            "parsedSitemapUrlCount": sitemap_result["url_count"]
        }
        
        try:
            store_url = f"{node_backend_url}/api/jobs/domain-technical-report"
            store_response = requests.post(store_url, json=report_data, timeout=10)
            store_response.raise_for_status()
            print(f"[TECHNICAL_DOMAIN] Report stored | projectId={project_id}")
        except Exception as store_error:
            print(f"⚠️ [TECHNICAL_DOMAIN] Failed to store report | error={str(store_error)}")
            # Non-critical: continue even if storage fails
        
        # Step 4: Report job completion to Node.js
        stats = {
            "robotsExists": robots_result["exists"],
            "robotsStatus": robots_result["status"],
            "sitemapExists": sitemap_result["exists"],
            "sitemapStatus": sitemap_result["status"],
            "parsedSitemapUrlCount": sitemap_result["url_count"]
        }
        
        try:
            complete_url = f"{node_backend_url}/api/jobs/{job_id}/complete"
            complete_response = requests.post(
                complete_url,
                json={"stats": stats},
                timeout=10
            )
            complete_response.raise_for_status()
            print(f"[TECHNICAL_DOMAIN] Job completion reported | jobId={job_id}")
        except Exception as complete_error:
            print(f"⚠️ [TECHNICAL_DOMAIN] Failed to report completion | error={str(complete_error)}")
            # Try to report failure so pipeline can continue via failJob fallback
            try:
                fail_url = f"{node_backend_url}/api/jobs/{job_id}/fail"
                requests.post(
                    fail_url,
                    json={"error": f"Completion reporting failed: {str(complete_error)}", "stats": stats},
                    timeout=10
                )
            except Exception:
                pass
        
        print(f"[TECHNICAL_DOMAIN] Completed | jobId={job_id} | robots={robots_result['exists']} | sitemap={sitemap_result['exists']} | sitemapUrls={sitemap_result['url_count']}")
        
        return {
            "status": "completed",
            "jobId": job_id,
            "robots_exists": robots_result["exists"],
            "sitemap_exists": sitemap_result["exists"],
            "sitemap_url_count": sitemap_result["url_count"]
        }
        
    except Exception as e:
        print(f"❌ [TECHNICAL_DOMAIN] Worker failed | jobId={job_id} | error={str(e)}")
        
        # Report failure to Node.js so pipeline continues via failJob fallback
        try:
            fail_url = f"{node_backend_url}/api/jobs/{job_id}/fail"
            requests.post(
                fail_url,
                json={"error": str(e), "stats": {}},
                timeout=10
            )
            print(f"[TECHNICAL_DOMAIN] Failure reported | jobId={job_id}")
        except Exception as fail_error:
            print(f"⚠️ [TECHNICAL_DOMAIN] Failed to report failure | error={str(fail_error)}")
        
        # Return success so the HTTP handler doesn't raise an exception
        return {
            "status": "failed_gracefully",
            "jobId": job_id,
            "error": str(e)
        }
