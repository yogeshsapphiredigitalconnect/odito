"""AI Link Discovery worker implementation."""

import os
import sys
import json
import time
import threading
import logging
import random
import string
import warnings
import hashlib
from datetime import datetime
from urllib.parse import urljoin, urlparse

# Third-party imports
import requests
from fastapi import HTTPException
from pydantic import BaseModel, HttpUrl
from concurrent.futures import ThreadPoolExecutor, as_completed
from bson.objectid import ObjectId

# Local imports
from scraper.shared.links import extract_sitemaps_from_robots, extract_all_links_from_html
from scraper.shared.recursive_sitemap import discover_all_sitemap_urls
from scraper.shared.utils import normalize_url, get_registrable_domain
from scraper.shared.fetcher import fetch_html
from db import seo_ai_internal_links

class AiLinkDiscoveryJob(BaseModel):
    jobId: str
    projectId: str
    userId: str
    aiProjectId: str
    url: str

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

def is_job_cancelled(job_id: str) -> bool:
    """Check if a job has been cancelled"""
    # Import here to avoid circular imports
    from main import cancelled_jobs, cancelled_jobs_lock
    
    with cancelled_jobs_lock:
        return job_id in cancelled_jobs

def execute_ai_link_discovery(job: AiLinkDiscoveryJob):
    """Execute AI link discovery for standalone projects"""
    start_time = datetime.utcnow()
    
    try:
        print(f"[WORKER] AI_LINK_DISCOVERY started | jobId={job.jobId} | url={job.url}")
        
        # Send initial progress
        send_progress_update(job.jobId, 5, "Start", "Starting AI link discovery")
        
        # Check for cancellation early
        if is_job_cancelled(job.jobId):
            print(f"[WORKER] AI_LINK_DISCOVERY cancelled | jobId={job.jobId}")
            return {"status": "cancelled", "jobId": job.jobId, "message": "Job cancelled by user"}
        
        # Parse and normalize the target URL
        try:
            parsed_url = urlparse(job.url)
            if not parsed_url.scheme:
                normalized_url = f"https://{job.url}"
            else:
                normalized_url = job.url
            
            base_domain = get_registrable_domain(normalized_url)
            print(f"[WORKER] Processing domain: {base_domain} | url: {normalized_url}")
            
        except Exception as e:
            print(f"[ERROR] Invalid URL: {job.url} | error: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid URL: {job.url}")
        
        send_progress_update(job.jobId, 10, "Find", "Discovering sitemaps and links")
        
        # Step 1: Universal Recursive Sitemap Discovery
        all_internal_urls = set()
        all_internal_links = []
        sitemap_stats = {
            'sitemaps_found': 0,
            'sitemap_indexes_found': 0,
            'urlsets_found': 0,
            'recursion_depth_used': 0,
            'failed_sitemaps': 0
        }
        
        try:
            print(f"[DISCOVERY] Starting universal recursive sitemap discovery")
            print(f"[DISCOVERY] Target: {normalized_url}")
            print(f"[DISCOVERY] Max recursion depth: 5, Max sitemaps: 50")
            
            # Use the new recursive sitemap discovery system
            discovered_urls, stats = discover_all_sitemap_urls(
                normalized_url, 
                max_depth=5, 
                max_sitemaps=50
            )
            
            # Filter and normalize URLs
            for url in discovered_urls:
                if base_domain in url:  # Ensure internal URL
                    normalized_link = normalize_url(url)
                    if normalized_link and base_domain in normalized_link:
                        all_internal_urls.add(normalized_link)
                        all_internal_links.append(normalized_link)
            
            # Update sitemap statistics
            sitemap_stats.update({
                'sitemaps_found': stats['sitemaps_processed'],
                'sitemap_indexes_found': stats['sitemap_indexes_found'],
                'urlsets_found': stats['urlsets_found'],
                'recursion_depth_used': stats['recursion_depth_used'],
                'failed_sitemaps': stats['failed_sitemaps']
            })
            
            print(f"[DISCOVERY] Recursive discovery completed")
            print(f"[DISCOVERY] Total unique URLs collected: {len(all_internal_urls)}")
            print(f"[DISCOVERY] Sitemaps processed: {sitemap_stats['sitemaps_found']}")
            print(f"[DISCOVERY] Sitemap indexes: {sitemap_stats['sitemap_indexes_found']}")
            print(f"[DISCOVERY] URL sets: {sitemap_stats['urlsets_found']}")
            print(f"[DISCOVERY] Failed sitemaps: {sitemap_stats['failed_sitemaps']}")
            print(f"[DISCOVERY] Max recursion depth used: {sitemap_stats['recursion_depth_used']}")
            
        except Exception as e:
            print(f"[ERROR] Recursive sitemap discovery failed: {e}")
            print(f"[WARNING] Falling back to basic discovery methods")
        
        send_progress_update(job.jobId, 30, "Analyze", f"Extracting links from {sitemap_stats['sitemaps_found']} sitemaps")
        if not all_internal_links:
            print(f"[WORKER] No sitemap links found, trying main page extraction")
            
            try:
                main_html, status_code, response_time = fetch_html(normalized_url, timeout=10)
                if status_code == 200 and main_html:
                    main_internal_links, _, _ = extract_all_links_from_html(main_html, normalized_url, base_domain)
                    
                    for link in main_internal_links:
                        normalized_link = normalize_url(link) if isinstance(link, str) else normalize_url(link.get("url", ""))
                        if normalized_link and base_domain in normalized_link:
                            all_internal_urls.add(normalized_link)
                            all_internal_links.append(normalized_link)
                            
            except Exception as e:
                print(f"[WARNING] Main page extraction failed: {e}")
        
        # Step 4: Store results in seo_ai_internal_links
        send_progress_update(job.jobId, 60, "Store", "Saving discovered links")
        
        if all_internal_links:
            try:
                # Prepare bulk insert documents
                bulk_docs = []
                for url in all_internal_links:
                    bulk_docs.append({
                        "aiProjectId": ObjectId(job.aiProjectId),
                        "url": url,
                        "discoveredAt": datetime.utcnow(),
                        "source": "ai_link_discovery",
                        "jobId": ObjectId(job.jobId)
                    })
                
                # Bulk insert with upsert to prevent duplicates
                if bulk_docs:
                    # Clear existing links for this project first
                    seo_ai_internal_links.delete_many({"aiProjectId": ObjectId(job.aiProjectId)})
                    
                    # Insert new links
                    result = seo_ai_internal_links.insert_many(bulk_docs)
                    print(f"[WORKER] Stored {len(result.inserted_ids)} internal links | aiProjectId={job.aiProjectId}")
                
            except Exception as e:
                print(f"[ERROR] Failed to store links: {e}")
                raise HTTPException(status_code=500, detail=f"Failed to store links: {e}")
        else:
            print(f"[WARNING] No internal links discovered for {normalized_url}")
        
        # Final progress update
        send_progress_update(job.jobId, 100, "Complete", f"Discovered {len(all_internal_links)} internal links")
        
        # Calculate duration
        end_time = datetime.utcnow()
        duration_ms = int((end_time - start_time).total_seconds() * 1000)
        
        # Prepare comprehensive stats
        stats = {
            "links_discovered": len(all_internal_links),
            "sitemaps_found": sitemap_stats['sitemaps_found'],
            "sitemap_indexes_found": sitemap_stats['sitemap_indexes_found'],
            "urlsets_found": sitemap_stats['urlsets_found'],
            "recursion_depth_used": sitemap_stats['recursion_depth_used'],
            "failed_sitemaps": sitemap_stats['failed_sitemaps'],
            "duration_ms": duration_ms,
            "domain": base_domain,
            "discovery_method": "recursive_sitemap" if all_internal_links else "fallback_html"
        }
        
        # Send completion callback to Node.js (fire-and-forget)
        try:
            node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
            node_url = f"{node_backend_url}/api/jobs/{job.jobId}/complete"
            callback_payload = {"stats": stats, "result_data": {"links_discovered": len(all_internal_links)}}
            
            requests.post(node_url, json=callback_payload, timeout=30)
            print(f"✅ Successfully notified Node.js of AI link discovery completion")
            
        except requests.exceptions.Timeout:
            # Fire-and-forget: timeout doesn't mean job failed
            pass
        except Exception as callback_error:
            # Log but don't fail the job - completion is best-effort
            print(f"⚠️ Failed to notify Node.js of completion (job still succeeded): {callback_error}")
        
        return {
            "status": "success",
            "jobId": job.jobId,
            "message": "AI link discovery completed",
            "stats": stats
        }
        
    except Exception as e:
        print(f"❌ Job {job.jobId} failed: {str(e)}")
        
        # Send failure callback to Node.js
        try:
            node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")
            fail_url = f"{node_backend_url}/api/jobs/{job.jobId}/fail"
            fail_payload = {"error": str(e)}
            requests.post(fail_url, json=fail_payload, timeout=10)
        except:
            pass
        
        raise HTTPException(status_code=500, detail=str(e))
