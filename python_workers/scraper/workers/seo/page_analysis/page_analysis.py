import re

import os

from datetime import datetime

from bson.objectid import ObjectId

from fastapi import HTTPException

import requests

from db import seo_internal_links, seo_external_links, seo_social_links, seo_page_data, seo_page_issues, seo_page_performance, db

from scraper.rules.seo_rules import SEO_RULES, get_rule, rule_exists



def safe_string(value):

    """Safely extract string value from various data types"""

    if isinstance(value, str):

        return value

    if isinstance(value, list) and value and isinstance(value[0], str):

        return value[0]

    return ""



def normalize_text(value):

    """Normalize text values from seo_page_data - prevents all .split() errors"""

    if value is None:

        return ""

    if isinstance(value, str):

        return value.strip()

    if isinstance(value, list):

        if value and isinstance(value[0], str):

            return value[0].strip()

        elif value:

            return str(value[0]).strip()

        return ""

    if isinstance(value, dict):

        # Handle nested objects from scraper

        text_val = value.get("text") or value.get("content") or value.get("value")

        if text_val:

            return str(text_val).strip()

        return ""

    return str(value).strip()



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



def execute_page_analysis_logic(job):

    # Track start time for duration calculation

    start_time = datetime.utcnow()

    duration_ms = 0  # Initialize before try block

    

    """Execute PAGE_ANALYSIS job logic"""

    try:

        # Validation guard - ensure job_id is available

        job_id = getattr(job, 'jobId', None)

        assert job_id is not None, "job_id missing in PAGE_ANALYSIS"

        

        print(f"[WORKER] PAGE_ANALYSIS started | jobId={job_id}")

        

        # Check for cancellation early

        if is_job_cancelled(job_id):

            print(f"[WORKER] PAGE_ANALYSIS cancelled | jobId={job_id}")

            return {"status": "cancelled", "jobId": job_id, "message": "Job cancelled by user"}

        

        # Query pages scraped by the project (not by specific jobId)

        pages = list(seo_page_data.find({

            "projectId": ObjectId(job.projectId),

            "scrape_status": "SUCCESS"

        }))

        

        # Also fetch performance data for this project

        performance_data = list(seo_page_performance.find({

            "projectId": ObjectId(job.projectId)

        }))

        

        # Create lookup map for performance data by page_url and device_type

        performance_lookup = {}

        for perf in performance_data:

            page_url = perf.get("page_url", "")

            device_type = perf.get("device_type", "")

            if page_url and device_type:

                if page_url not in performance_lookup:

                    performance_lookup[page_url] = {}

                performance_lookup[page_url][device_type] = perf

        

        print(f"[WORKER] PAGE_ANALYSIS started | jobId={job_id} | pagesFound={len(pages)} | performanceRecords={len(performance_data)}")

        

        if not pages:

            print(f"[WORKER] PAGE_ANALYSIS completed | jobId={job_id} | analyzed=0 | failed=0 | issues=0")

            stats = {

                "totalPages": 0,

                "pagesAnalyzed": 0,

                "issuesFound": 0

            }

            send_completion_callback(job_id, stats)

            return {

                "status": "success",

                "jobId": job_id,

                "stats": stats,

                "message": "No pages to analyze"

            }

        

        print(f"[WORKER] PAGE_ANALYSIS started | jobId={job_id} | pagesFound={len(pages)}")

        

        # Analyze each page and collect issues

        all_issues = []

        successful_analyses = 0

        failed_analyses = 0

        completed_analyses = 0

        total_pages = len(pages)

        

        for page in pages:

            try:

                # Check cancellation before processing each page

                if is_job_cancelled(job_id):

                    print(f"🛑 Job {job_id} cancelled during analysis")

                    return {"status": "cancelled", "jobId": job_id, "message": "Job cancelled by user"}

                

                page_issues = analyze_page_seo(page, job_id, job.projectId)

                print(f"PAGE_ANALYSIS returned: {len(page_issues)} issues for {page.get('url')}")

                all_issues.extend(page_issues)

                print(f"PAGE_ANALYSIS total collected: {len(all_issues)}")

                successful_analyses += 1

                completed_analyses += 1

                

                # Send progress update after each successful page analysis

                percentage = int((completed_analyses / total_pages) * 100)

                send_progress_update(

                    job_id, 

                    percentage, 

                    "Analyzing", 

                    "Analyzing SEO issues", 

                    f"{completed_analyses} of {total_pages} pages analyzed"

                )

                

            except Exception as page_error:

                print(f"[ERROR] PAGE_ANALYSIS page failed | jobId={job_id} | url={page.get('url', 'unknown')} | reason=\"{page_error}\"")

                failed_analyses += 1

                completed_analyses += 1

                

                # Send progress update after each failed page analysis

                percentage = int((completed_analyses / total_pages) * 100)

                send_progress_update(

                    job_id, 

                    percentage, 

                    "Analyzing", 

                    "Analyzing SEO issues", 

                    f"{completed_analyses} of {total_pages} pages analyzed"

                )

                

                continue

        

        # 🔥 HARD LOGS: PAGE_ANALYSIS INSERT

        print(f"PAGE_ANALYSIS inserting: {len(all_issues)} total issues")

        if all_issues:

            try:

                result = seo_page_issues.insert_many(all_issues, ordered=False)

                print(f"PAGE_ANALYSIS inserted: {len(result.inserted_ids)} issues")

            except Exception as insert_error:

                print(f"PAGE_ANALYSIS insert failed: {insert_error}")

                # Try one by one to see which fail

                for i, issue in enumerate(all_issues):

                    try:

                        seo_page_issues.insert_one(issue)

                        print(f"PAGE_ANALYSIS inserted {i}: {issue.get('issue_code')}")

                    except Exception as single_error:

                        print(f"PAGE_ANALYSIS failed {i}: {issue.get('issue_code')} - {single_error}")

        else:

            print("PAGE_ANALYSIS no issues to insert!")

        

        # Update seo_internal_links with analysis completion status

        try:

            # Get all URLs that were analyzed for this job

            analyzed_urls = [page.get("url") for page in pages]

            

            # Update each internal link with analysis completion

            if analyzed_urls:

                # Trace back to original LINK_DISCOVERY job ID

                # PAGE_ANALYSIS -> PAGE_SCRAPING -> LINK_DISCOVERY

                original_seo_job_id = None

                if hasattr(job, 'sourceJobId') and job.sourceJobId:

                    # Get the PAGE_SCRAPING job to find its source (LINK_DISCOVERY)

                    from db import db

                    page_scraping_job = db.jobs.find_one({"_id": ObjectId(job.sourceJobId)})

                    if page_scraping_job and page_scraping_job.get("input_data", {}).get("source_job_id"):

                        original_seo_job_id = page_scraping_job["input_data"]["source_job_id"]

                

                # Fallback to current job ID if tracing fails

                target_seo_job_id = ObjectId(original_seo_job_id) if original_seo_job_id else ObjectId(job.jobId)

                

                seo_internal_links.update_many(

                    {"url": {"$in": analyzed_urls}, "seo_jobId": target_seo_job_id},

                    {

                        "$set": {

                            "analyzedAt": datetime.utcnow()

                        }

                    }

                )

                print(f"[WORKER] Updated internal links analysis status | jobId={job_id} | analyzed={len(analyzed_urls)}")

        except Exception as update_error:

            print(f"[ERROR] Failed to update internal links analysis status | jobId={job_id} | reason=\"{str(update_error)}\"")

        

        # Prepare completion stats

        stats = {

            "totalPages": len(pages),

            "pagesAnalyzed": successful_analyses,

            "failedAnalyses": failed_analyses,

            "issuesFound": len(all_issues)

        }



        # Calculate duration before sending callbacks

        end_time = datetime.utcnow()

        duration_ms = int((end_time - start_time).total_seconds() * 1000)

        

        # Store stats in result_data for summary aggregation

        result_data = {

            "totalPages": len(pages),

            "pagesAnalyzed": successful_analyses,

            "failedAnalyses": failed_analyses,

            "issuesFound": len(all_issues),

            "duration_ms": duration_ms

        }

        

        print(f"[WORKER] PAGE_ANALYSIS completed | jobId={job_id} | analyzed={successful_analyses} | failed={failed_analyses} | issues={len(all_issues)}")

        

        # Update seo_internal_links with analysis status

        try:

            # Get all URLs that were successfully analyzed

            analyzed_urls = [page.get("url") for page in pages if page.get("url")]

            

            if analyzed_urls:

                result = seo_internal_links.update_many(

                    {"url": {"$in": analyzed_urls}, "projectId": ObjectId(job.projectId)},

                    {

                        "$set": {

                            "analyzedAt": datetime.utcnow()

                        }

                    }

                )

                print(f"[WORKER] Updated internal links analysis status | jobId={job_id} | matched={result.matched_count} | modified={result.modified_count}")

                if result.matched_count == 0:

                    print(f"[WARNING] No matching internal links found for analysis status update | jobId={job_id} | projectId={job.projectId}")

                elif result.modified_count < result.matched_count:

                    print(f"[WARNING] Some internal links already analyzed | jobId={job_id} | modified={result.modified_count}/{result.matched_count}")

        except Exception as update_error:

            print(f"[ERROR] Failed to update internal links analysis status | jobId={job_id} | reason=\"{str(update_error)}\"")

        

        # Send completion callback to Node.js

        send_completion_callback(job_id, stats, result_data)

        

        # Send crawl summary to Node.js (additional call)

        send_crawl_summary(job_id, job.projectId, stats, duration_ms, job.sourceJobId)

        

        return {

            "status": "success",

            "jobId": job_id,

            "stats": stats,

            "duration_ms": duration_ms,

            "message": "Page analysis completed and issues stored"

        }

        

    except Exception as e:

        print(f"[ERROR] PAGE_ANALYSIS failed | jobId={job_id} | reason=\"{str(e)}\"")

        

        # Safely compute duration even in exception case

        end_time = datetime.utcnow()

        duration_ms = int((end_time - start_time).total_seconds() * 1000)

        

        # Send failure callback to Node.js

        send_failure_callback(job_id, str(e))

        

        raise HTTPException(status_code=500, detail=f"Page analysis failed: {str(e)}")



def normalize_page_data(page):

    """Centralized normalization function for all SEO data extraction."""

    # Convert content.headings dict to flat list of heading objects

    content_headings = page.get("content", {}).get("headings", {})

    headings_list = []

    if content_headings and isinstance(content_headings, dict):

        for level, headings in content_headings.items():

            if isinstance(headings, list):

                for text in headings:

                    headings_list.append({

                        "tag": level,

                        "text": text,

                        "level": int(level[1:]) if level.startswith("h") else 0

                    })

    

    # Convert tracking to synthetic scripts list for analytics rules

    tracking = page.get("tracking", {})
    
    # DEBUG: Log tracking data for all pages
    page_url = page.get("url", "unknown")
    print(f"[DEBUG TRACKING] URL: {page_url}")
    print(f"[DEBUG TRACKING] Raw tracking object: {tracking}")
    print(f"[DEBUG TRACKING] Type: {type(tracking)}, Empty: {not tracking}")
    if isinstance(tracking, dict):
        print(f"[DEBUG TRACKING] analytics_detected: {tracking.get('analytics_detected')}")
        print(f"[DEBUG TRACKING] analytics_types: {tracking.get('analytics_types')}")
        print(f"[DEBUG TRACKING] facebook_pixel: {tracking.get('facebook_pixel')}")
        print(f"[DEBUG TRACKING] google_analytics: {tracking.get('google_analytics')}")

    scripts_list = []

    # IMPORTANT: Handle tracking even if empty dict to preserve structure
    # Empty dict is falsy in Python, so we check if it's a dict instead
    if isinstance(tracking, dict):

        # Create synthetic script objects from tracking data

        # Check both old field names and new analytics_detected flag for compatibility
        if tracking.get("google_analytics") or tracking.get("analytics_detected"):
            
            print(f"[DEBUG SCRIPTS] Adding GA/GTM script for {page_url}")

            scripts_list.append({

                "src": "https://www.googletagmanager.com/gtag/js?id=GA-ANALYTICS",

                "content": "Google Analytics",

                "type": "analytics"

            })

        # Check for GTM via old or new field names
        has_gtm = tracking.get("google_tag_manager") or ("GTM" in tracking.get("analytics_types", []))
        if has_gtm:
            
            print(f"[DEBUG SCRIPTS] Adding GTM script for {page_url}")

            scripts_list.append({

                "src": "https://www.googletagmanager.com/gtm.js?id=GTM-CONTAINER",

                "content": "Google Tag Manager",

                "type": "analytics"

            })

        if tracking.get("facebook_pixel"):

            print(f"[DEBUG SCRIPTS] Adding Facebook Pixel script for {page_url}")

            scripts_list.append({

                "src": "https://connect.facebook.net/en_US/fbevents.js",

                "content": "Facebook Pixel",

                "type": "tracking"

            })

        if tracking.get("linkedin_pixel"):

            print(f"[DEBUG SCRIPTS] Adding LinkedIn Pixel script for {page_url}")

            scripts_list.append({

                "src": "https://px.ads.linkedin.com/collect/",

                "content": "LinkedIn Pixel",

                "type": "tracking"

            })

    

    # Normalize images: convert width/height to integers if numeric strings
    images_normalized = []
    for img in page.get("images", []):
        normalized_img = dict(img)  # Shallow copy
        # Convert width to int if it's a numeric string
        if normalized_img.get("width") is not None:
            try:
                if isinstance(normalized_img["width"], str) and normalized_img["width"].isdigit():
                    normalized_img["width"] = int(normalized_img["width"])
            except (ValueError, TypeError):
                pass  # Keep original value if conversion fails
        # Convert height to int if it's a numeric string
        if normalized_img.get("height") is not None:
            try:
                if isinstance(normalized_img["height"], str) and normalized_img["height"].isdigit():
                    normalized_img["height"] = int(normalized_img["height"])
            except (ValueError, TypeError):
                pass  # Keep original value if conversion fails
        images_normalized.append(normalized_img)

    # Normalize all fields with proper fallbacks

    return {

        "url": normalize_text(page.get("url")),

        "title": normalize_text(page.get("title")),

        "meta_description": normalize_text(page.get("meta_tags", {}).get("description", [None])[0] if page.get("meta_tags", {}).get("description") else None),

        "content_text": normalize_text(page.get("content", {}).get("text")),

        "word_count": page.get("content", {}).get("word_count", 0),

        "viewport": normalize_text(page.get("meta_tags", {}).get("viewport", [None])[0] if page.get("meta_tags", {}).get("viewport") else None),

        "headings": headings_list,  # Now properly normalized

        "images": images_normalized,

        "image_analysis": page.get("image_analysis", {}),

        "og_tags": page.get("social", {}).get("open_graph", {}),

        "scripts": scripts_list,  # Now properly derived from tracking

        "structured_data": page.get("structured_data", []),

        "canonical": normalize_text(page.get("canonical")),

        "hreflangs": page.get("hreflangs", []),

        "tracking": tracking,  # Keep original for advanced rules

        "meta_tags": page.get("meta_tags", {}),  # Keep for advanced rules

        "social": page.get("social", {}),  # Keep for advanced rules

        "doctype": page.get("doctype_present"),  # Map doctype_present boolean to doctype field for rules

        "html_lang": page.get("html_lang"),

        # Include new page signals for enhanced rule compatibility
        "review_schema_present": page.get("review_schema_present", False),

        "theme_color_present": page.get("theme_color_present", False),

        "hreflang_present": page.get("hreflang_present", False)

    }



def analyze_page_seo(page, job_id, project_id):

    """Analyze a single page for SEO issues using ALL rules from rules.py"""

    issues = []

    

    # STEP 1: Normalize all page data

    try:

        normalized = normalize_page_data(page)

        url = normalized["url"]

    except Exception as norm_error:

        print(f"[ERROR] Normalization failed for {page.get('url', 'unknown')}: {norm_error}")

        return []

    

    # STEP 2: Execute ALL rules from registry

    from scraper.rules.seo_rules import SEO_RULES

    

    for rule_id, rule_config in SEO_RULES.items():

        try:

            rule_issues = execute_rule(rule_id, rule_config, normalized, job_id, project_id, url)

            issues.extend(rule_issues)

        except Exception as rule_error:

            print(f"[ERROR] Rule {rule_id} failed for {url}: {rule_error}")

            continue

    

    return issues



def execute_rule(rule_id, rule_config, normalized, job_id, project_id, url):

    """Execute a single SEO rule with proper error handling."""

    issues = []

    rule_name = rule_config.get("name", rule_id)

    category = rule_config.get("category", "Unknown")

    severity = rule_config.get("severity", "medium")

    

    try:

        if rule_id == "TITLE_MISSING":

            if not normalized["title"]:

                issues.append(create_issue(

                    job_id, project_id, url, 1, category, severity,

                    rule_id, "Page title is missing",

                    null, "A descriptive page title",

                    data_key="title"

                ))

        

        elif rule_id == "TITLE_TOO_SHORT":

            if normalized["title"]:

                title_len = len(normalized["title"])

                if title_len < 30:

                    issues.append(create_issue(

                        job_id, project_id, url, 2, category, severity,

                        rule_id, "Page title is too short",

                        title_len, 30,

                        data_key="title"

                    ))

        

        elif rule_id == "TITLE_TOO_LONG":

            if normalized["title"]:

                title_len = len(normalized["title"])

                if title_len > 60:

                    issues.append(create_issue(

                        job_id, project_id, url, 2, category, severity,

                        rule_id, "Page title is too long",

                        title_len, "30-60 characters",

                        data_key="title"

                    ))

        

        elif rule_id == "META_DESC_MISSING":

            if not normalized["meta_description"]:

                issues.append(create_issue(

                    job_id, project_id, url, 3, category, severity,

                    rule_id, "Meta description is missing",

                    null, "A compelling meta description (150-160 characters)",

                    data_key="meta_description"

                ))

        

        elif rule_id == "META_DESC_TOO_SHORT":

            if normalized["meta_description"]:

                desc_len = len(normalized["meta_description"])

                if desc_len < 150:

                    issues.append(create_issue(

                        job_id, project_id, url, 4, category, severity,

                        rule_id, "Meta description is too short",

                        desc_len, "150-160 characters",

                        data_key="meta_description"

                    ))

        

        elif rule_id == "META_DESC_TOO_LONG":

            if normalized["meta_description"]:

                desc_len = len(normalized["meta_description"])

                if desc_len > 160:

                    issues.append(create_issue(

                        job_id, project_id, url, 4, category, severity,

                        rule_id, "Meta description is too long",

                        desc_len, "150-160 characters",

                        data_key="meta_description"

                    ))

        

        elif rule_id == "VIEWPORT_MISSING":

            if not normalized["viewport"] or "width" not in normalized["viewport"].lower():

                issues.append(create_issue(

                    job_id, project_id, url, 5, category, severity,

                    rule_id, "Viewport meta tag is missing",

                    null, "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",

                    data_key="viewport"

                ))

        

        elif rule_id == "H1_MISSING":

            h1_count = len([h for h in normalized["headings"] if h.get("tag") == "h1"])

            if h1_count == 0:

                issues.append(create_issue(

                    job_id, project_id, url, 6, category, severity,

                    rule_id, "No H1 tag found",

                    0, "Exactly 1 H1 tag",

                    data_key="headings", data_path="h1"

                ))

        

        elif rule_id == "MULTIPLE_H1":

            h1_count = len([h for h in normalized["headings"] if h.get("tag") == "h1"])

            if h1_count > 1:

                issues.append(create_issue(

                    job_id, project_id, url, 6, category, severity,

                    rule_id, "Multiple H1 tags found",

                    h1_count, "Exactly 1 H1 tag",

                    data_key="headings", data_path="h1"

                ))

        

        elif rule_id == "H1_NOT_MEANINGFUL":

            h1_headings = [h for h in normalized["headings"] if h.get("tag") == "h1"]

            if len(h1_headings) == 1:

                h1_text = h1_headings[0].get("text", "").lower()

                if h1_text in ["home", "homepage", "main", "welcome", ""]:

                    issues.append(create_issue(

                        job_id, project_id, url, 7, category, severity,

                        rule_id, "H1 tag is not meaningful",

                        h1_text, "A descriptive, keyword-rich H1",

                        data_key="headings", data_path="h1"

                    ))

        

        elif rule_id == "HEADING_HIERARCHY_SKIPPED":

            if normalized["headings"]:

                heading_levels = []

                for h in normalized["headings"]:

                    level = h.get("level", 0)

                    if level > 0:

                        heading_levels.append(level)

                

                # Check for skipped levels

                for i in range(1, len(heading_levels)):

                    if heading_levels[i] - heading_levels[i-1] > 1:

                        issues.append(create_issue(

                            job_id, project_id, url, 8, category, severity,

                            rule_id, "Heading hierarchy skips levels",

                            f"H{heading_levels[i-1]} to H{heading_levels[i]}", "Sequential heading levels (H1, H2, H3...)"

                        ))

                        break

        

        elif rule_id == "URL_NOT_DESCRIPTIVE":

            url_path = normalized["url"].split("/")[-1] if "/" in normalized["url"] else normalized["url"]

            if re.match(r'^\d+$', url_path) or url_path in ["index", "home", "page", ""]:

                issues.append(create_issue(

                    job_id, project_id, url, 9, category, severity,

                    rule_id, "URL is not descriptive",

                    url_path, "Descriptive, keyword-rich URL"

                ))

        

        elif rule_id == "EXCESSIVE_QUERY_PARAMS":

            query_params = normalized["url"].split("?")

            if len(query_params) > 1:

                param_count = len(query_params[1].split("&")) if query_params[1] else 0

                if param_count > 3:

                    issues.append(create_issue(

                        job_id, project_id, url, 10, category, severity,

                        rule_id, "URL has too many query parameters",

                        str(param_count), "0-3 query parameters"

                    ))

        

        elif rule_id == "IMAGES_MISSING_ALT":

            images_without_alt = [

                img for img in normalized.get("images", [])

                if not normalize_text(img.get("alt")).strip()

                and not (

                    img.get("is_decorative") is True

                    or (img.get("width") == 1 and img.get("height") == 1)

                    or "pixel" in (img.get("src") or "").lower()

                )

            ]

            if images_without_alt:

                issues.append(create_issue(

                    job_id, project_id, url, 11, category, severity,

                    rule_id, "Images missing alt text",

                    len(images_without_alt), "All images should have alt text",

                    data_key="images"

                ))

        

        elif rule_id == "IMAGES_MISSING_DIMENSIONS":

            images_without_dims = [img for img in normalized["images"] if not img.get("width") or not img.get("height")]

            if images_without_dims:

                issues.append(create_issue(

                    job_id, project_id, url, 12, category, severity,

                    rule_id, "Images missing width/height attributes",

                    len(images_without_dims), "All images should have width and height",

                    data_key="images"

                ))

        

        elif rule_id == "MISSING_LAZY_LOADING":

            images_without_lazy = [

                img for img in normalized.get("images", [])

                if not img.get("loading")

            ]

            if images_without_lazy:

                issues.append(create_issue(

                    job_id, project_id, url, 13, category, severity,

                    rule_id, "Images missing lazy loading",

                    str(len(images_without_lazy)), "Images above fold should not lazy load, others should",

                    data_key="images"

                ))

        

        elif rule_id == "CONTENT_TOO_SHORT":

            if normalized["content_text"]:

                word_count = len(normalized["content_text"].split())

                if word_count < 300:

                    issues.append(create_issue(

                        job_id, project_id, url, 14, category, severity,

                        rule_id, "Page content is too short",

                        str(word_count), "Minimum 300 words",

                        data_key="content_text"

                    ))

        

        elif rule_id == "THIN_CONTENT":

            if normalized["content_text"]:

                template_indicators = ["navigation", "menu", "footer", "header", "sidebar"]

                template_words = 0

                for indicator in template_indicators:

                    template_words += len(re.findall(r'\b' + indicator + r'\b', normalized["content_text"], re.IGNORECASE))

                

                word_count = len(normalized["content_text"].split())

                if word_count > 0 and template_words / word_count > 0.3:

                    issues.append(create_issue(

                        job_id, project_id, url, 15, category, severity,

                        rule_id, "Page has thin content (high template ratio)",

                        f"{round((template_words/word_count)*100, 1)}%", "More unique content needed"

                    ))

        

        elif rule_id == "POOR_READABILITY":

            if normalized["content_text"]:

                sentences = re.split(r'[.!?]+', normalized["content_text"])

                long_sentences = [s for s in sentences if len(s.split()) > 25]

                if len(long_sentences) > len(sentences) * 0.2:

                    issues.append(create_issue(

                        job_id, project_id, url, 16, category, severity,

                        rule_id, "Content has poor readability (long sentences)",

                        f"{len(long_sentences)} long sentences", "Shorter, clearer sentences"

                    ))

        

        elif rule_id == "OPEN_GRAPH_MISSING":

            og_tags = normalized["og_tags"]

            if not og_tags.get("og:title") or not og_tags.get("og:description"):

                issues.append(create_issue(

                    job_id, project_id, url, 17, category, severity,

                    rule_id, "Open Graph tags are missing",

                    "Incomplete", "og:title and og:description should be present",

                    data_key="og_tags"

                ))

        

        elif rule_id == "ANALYTICS_MISSING":
            
            print(f"\n[DEBUG RULE] ===== ANALYTICS_MISSING for {url} =====")
            print(f"[DEBUG RULE] Scripts list: {normalized['scripts']}")
            print(f"[DEBUG RULE] Scripts count: {len(normalized['scripts'])}")
            
            has_analytics = any(

                "google-analytics" in script.get("src", "").lower() or 

                "googletagmanager" in script.get("src", "").lower() or

                "analytics" in script.get("content", "").lower()

                for script in normalized["scripts"]

            )
            
            print(f"[DEBUG RULE] has_analytics result: {has_analytics}")
            print(f"[DEBUG RULE] Checking tracking directly: {normalized.get('tracking', {})}")
            print(f"[DEBUG RULE] tracking.analytics_detected: {normalized.get('tracking', {}).get('analytics_detected')}")
            print(f"[DEBUG RULE] Issue will be created: {not has_analytics}")

            if not has_analytics:

                issues.append(create_issue(

                    job_id, project_id, url, 18, category, severity,

                    rule_id, "Analytics tracking is missing",

                    "None", "Google Analytics or Tag Manager should be present",

                    data_key="tracking", data_path="analytics"

                ))

        

        # Schema rules

        elif rule_id == "organization_sameas_missing":

            structured_data = normalized.get("structured_data", [])

            has_organization = False

            has_sameas = False

            

            for schema in structured_data:

                if isinstance(schema, dict) and schema.get("@type") == "Organization":

                    has_organization = True

                    if schema.get("sameAs"):

                        has_sameas = True

                        break

            

            if has_organization and not has_sameas:

                issues.append(create_issue(

                    job_id, project_id, url, 19, category, severity,

                    rule_id, "Organization schema missing sameAs social links",

                    "Missing", "Add sameAs array with social media URLs",

                    data_key="structured_data"

                ))

        

        elif rule_id == "organization_sameas_no_social":

            structured_data = normalized.get("structured_data", [])

            has_organization = False

            sameas_has_social = False

            

            for schema in structured_data:

                if isinstance(schema, dict) and schema.get("@type") == "Organization":

                    has_organization = True

                    sameas = schema.get("sameAs", [])

                    if isinstance(sameas, list):

                        social_domains = ["facebook.com", "twitter.com", "linkedin.com", "instagram.com"]

                        sameas_has_social = any(domain in str(item) for item in sameas for domain in social_domains)

                        break

            

            if has_organization and sameas and not sameas_has_social:

                issues.append(create_issue(

                    job_id, project_id, url, 20, category, severity,

                    rule_id, "Organization sameAs has no social media",

                    "No social URLs", "Include social media URLs in sameAs array",

                    data_key="structured_data"

                ))

        

        elif rule_id == "organization_eeat_missing":

            structured_data = normalized.get("structured_data", [])

            has_organization = False

            has_eeat = False

            

            for schema in structured_data:

                if isinstance(schema, dict) and schema.get("@type") == "Organization":

                    has_organization = True

                    if schema.get("founder") or schema.get("foundingDate"):

                        has_eeat = True

                        break

            

            if has_organization and not has_eeat:

                issues.append(create_issue(

                    job_id, project_id, url, 21, category, severity,

                    rule_id, "Organization schema missing E-E-A-T signals",

                    "Missing", "Add founder and foundingDate to Organization schema",

                    data_key="structured_data"

                ))

        

        elif rule_id == "localbusiness_required_missing":

            structured_data = normalized.get("structured_data", [])

            has_localbusiness = False

            missing_required = []

            required_fields = ["name", "description", "image"]

            

            for schema in structured_data:

                if isinstance(schema, dict) and schema.get("@type") == "LocalBusiness":

                    has_localbusiness = True

                    for field in required_fields:

                        if not schema.get(field):

                            missing_required.append(field)

                    break

            

            if has_localbusiness and missing_required:

                issues.append(create_issue(

                    job_id, project_id, url, 22, category, severity,

                    rule_id, "LocalBusiness schema missing required fields",

                    ", ".join(missing_required), f"Required: {', '.join(required_fields)}",

                    data_key="structured_data"

                ))

        

        elif rule_id == "faq_schema_missing":

            content_text = normalized.get("content_text", "").lower()

            faq_indicators = ["faq", "frequently asked questions", "questions and answers"]

            has_faq_content = any(indicator in content_text for indicator in faq_indicators)

            

            has_faq_schema = any(

                isinstance(schema, dict) and schema.get("@type") == "FAQPage"

                for schema in normalized.get("structured_data", [])

            )

            

            if has_faq_content and not has_faq_schema:

                issues.append(create_issue(

                    job_id, project_id, url, 23, category, severity,

                    rule_id, "FAQ schema missing",

                    "None", "Add FAQPage schema for FAQ content",

                    data_key="structured_data"

                ))

        

        elif rule_id == "breadcrumb_schema_missing":

            has_breadcrumb_schema = any(

                isinstance(schema, dict) and schema.get("@type") == "BreadcrumbList"

                for schema in normalized.get("structured_data", [])

            )

            

            if not has_breadcrumb_schema:

                issues.append(create_issue(

                    job_id, project_id, url, 24, category, severity,

                    rule_id, "Breadcrumb schema missing",

                    "None", "Add BreadcrumbList schema for navigation",

                    data_key="structured_data"

                ))

        

        elif rule_id == "review_schema_missing":

            has_review_schema = any(

                isinstance(schema, dict) and schema.get("@type") in ["Review", "AggregateRating"]

                for schema in normalized.get("structured_data", [])

            )

            

            if not has_review_schema:

                issues.append(create_issue(

                    job_id, project_id, url, 25, category, severity,

                    rule_id, "Review schema missing",

                    "None", "Add Review or AggregateRating schema for testimonials",

                    data_key="structured_data"

                ))

        

        # International rules

        elif rule_id == "HREFLANG_MISSING":

            if not normalized.get("hreflangs"):

                issues.append(create_issue(

                    job_id, project_id, url, 26, category, severity,

                    rule_id, "Hreflang tags are missing for international SEO",

                    "None", "Add hreflang tags for multilingual content",

                    data_key="hreflangs"

                ))

        

        elif rule_id == "localbusiness_country_invalid":

            structured_data = normalized.get("structured_data", [])

            for schema in structured_data:

                if isinstance(schema, dict) and schema.get("@type") == "LocalBusiness":

                    address = schema.get("address", {})

                    if isinstance(address, dict):

                        country = address.get("addressCountry")

                        if country and len(str(country)) == 5 and str(country).isdigit():

                            issues.append(create_issue(

                                job_id, project_id, url, 27, category, severity,

                                rule_id, "Invalid addressCountry (appears to be ZIP code)",

                                str(country), "Use ISO 3166-1 alpha-2 country code",

                                data_key="structured_data"

                            ))

                            break

        

        elif rule_id == "localbusiness_country_format":

            VALID_COUNTRY_NAMES = {

                "United States", "India", "Australia",

                "United Kingdom", "Canada", "Germany"

            }

            structured_data = normalized.get("structured_data", [])

            for schema in structured_data:

                if isinstance(schema, dict) and schema.get("@type") == "LocalBusiness":

                    address = schema.get("address", {})

                    if isinstance(address, dict):

                        country = address.get("addressCountry")

                        if country and not (

                            re.match(r'^[A-Z]{2}$', str(country))

                            or str(country).strip() in VALID_COUNTRY_NAMES

                        ):

                            issues.append(create_issue(

                                job_id, project_id, url, 28, category, severity,

                                rule_id, "addressCountry format incorrect",

                                str(country), "Use ISO 3166-1 alpha-2 format (e.g., US, GB)",

                                data_key="structured_data"

                            ))

                            break

        

        # Additional technical rules

        elif rule_id == "DOCTYPE_MISSING":
            
            print(f"\n[DEBUG RULE] ===== DOCTYPE_MISSING for {url} =====")
            print(f"[DEBUG RULE] Page doctype_present field: {page.get('doctype_present')}")
            print(f"[DEBUG RULE] Normalized doctype field: {normalized.get('doctype')}")
            print(f"[DEBUG RULE] Type of normalized doctype: {type(normalized.get('doctype'))}")
            print(f"[DEBUG RULE] Issue will be created: {not normalized.get('doctype')}")

            if not normalized.get("doctype"):

                issues.append(create_issue(

                    job_id, project_id, url, 29, category, severity,

                    rule_id, "DOCTYPE declaration is missing",

                    "None", "Add <!DOCTYPE html> at the top of the page",

                    data_key="doctype"

                ))

        

        elif rule_id == "THEME_COLOR_MISSING":

            meta_tags = normalized.get("meta_tags", {})

            has_theme_color = (

                normalized.get("theme_color_present") is True

                or any(key.lower() in ("theme-color", "msapplication-tilecolor")

                       for key in meta_tags.keys())

            )

            if not has_theme_color:

                issues.append(create_issue(

                    job_id, project_id, url, 30, category, severity,

                    rule_id, "Theme color meta tag is missing",

                    "None", "Add theme-color meta tag for mobile browser UI",

                    data_key="meta_tags"

                ))

        

        # Additional tracking rules

        elif rule_id == "FACEBOOK_PIXEL_MISSING":

            has_fb_pixel = any(

                "facebook" in script.get("src", "").lower() or "facebook" in script.get("content", "").lower()

                for script in normalized["scripts"]

            )

            if not has_fb_pixel:

                issues.append(create_issue(

                    job_id, project_id, url, 31, category, severity,

                    rule_id, "Facebook Pixel tracking is missing",

                    "None", "Add Facebook Pixel for social media tracking",

                    data_key="tracking", data_path="analytics"

                ))

        

        elif rule_id == "CONVERSION_TRACKING_MISSING":

            tracking = normalized.get("tracking", {})

            has_conversion_elements = any(

                indicator in normalized.get("content_text", "").lower()

                for indicator in ["contact", "submit", "buy", "order", "purchase"]

            )

            has_conversion_tracking = (

                tracking.get("google_analytics")

                or tracking.get("google_tag_manager")

                or tracking.get("facebook_pixel")

            )

            if has_conversion_elements and not has_conversion_tracking:

                issues.append(create_issue(

                    job_id, project_id, url, 32, category, severity,

                    rule_id, "Conversion tracking is missing",

                    "None", "Add conversion tracking for forms and purchases",

                    data_key="tracking", data_path="analytics"

                ))

        

        # Content rules

        elif rule_id == "H2_DUPLICATE":

            h2_texts = []

            for h in normalized["headings"]:

                if h.get("tag") == "h2":

                    h2_text = h.get("text", "").strip().lower()

                    if h2_text:

                        h2_texts.append(h2_text)

            

            # Check for duplicates

            seen_h2s = set()

            duplicate_h2s = []

            for h2_text in h2_texts:

                if h2_text in seen_h2s:

                    duplicate_h2s.append(h2_text)

                else:

                    seen_h2s.add(h2_text)

            

            if duplicate_h2s:

                issues.append(create_issue(

                    job_id, project_id, url, 33, category, severity,

                    rule_id, "Duplicate H2 tags found",

                    ", ".join(duplicate_h2s[:3]), "H2 tags should be unique",

                    data_key="headings", data_path="h2"

                ))

    

    except Exception as execution_error:

        print(f"[ERROR] Rule execution failed for {rule_id} on {url}: {execution_error}")

    

    return issues



def create_issue(job_id, project_id, url, rule_no, category, severity, issue_code, issue_message, detected_value, expected_value, data_key=None, data_path=None):

    """Create a standardized issue document"""

    return {

        "projectId": ObjectId(project_id),

        "seo_jobId": ObjectId(job_id),

        "page_url": url,

        "rule_no": rule_no,

        "category": category,

        "severity": severity,

        "issue_code": issue_code,

        "rule_id": issue_code,  # NEW: Primary identifier for SEO rules

        "issue_message": issue_message,

        "detected_value": detected_value,

        "expected_value": expected_value,

        "data_key": data_key,  # NEW: Reference to seo_page_data field

        "data_path": data_path,  # NEW: Optional sub-filter for complex data

        "created_at": datetime.utcnow()

    }



def is_job_cancelled(job_id):

    """Check if a job has been cancelled"""

    from main import cancelled_jobs, cancelled_jobs_lock

    with cancelled_jobs_lock:

        return job_id in cancelled_jobs



def send_completion_callback(job_id, stats, result_data=None):

    """Send completion callback to Node.js"""

    import requests

    import os

    try:

        node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

        node_url = f"{node_backend_url}/api/jobs/{job_id}/complete"

        callback_payload = {"stats": stats}

        

        # Include result_data if provided

        if result_data:

            callback_payload["result_data"] = result_data

        

        response = requests.post(node_url, json=callback_payload, timeout=30)

        response.raise_for_status()

        

        print(f"✅ Successfully notified Node.js of page analysis completion")

        

    except Exception as callback_error:

        print(f"⚠️ Failed to notify Node.js of completion: {callback_error}")

        # Don't raise - job execution is complete regardless of notification



def send_failure_callback(job_id, error_message):

    """Send failure callback to Node.js"""

    import requests

    import os

    try:

        node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

        node_fail_url = f"{node_backend_url}/api/jobs/{job_id}/fail"

        fail_payload = {"error": error_message}

        requests.post(node_fail_url, json=fail_payload, timeout=10)

    except:

        pass



def send_crawl_summary(job_id, project_id, analysis_stats, analysis_duration_ms, source_job_id=None):

    """Send crawl summary to Node.js after PAGE_ANALYSIS completion"""

    import requests

    import os

    try:

        # Get previous job results from MongoDB for complete summary

        from db import db

        

        def to_object_id(value):

            try:

                return ObjectId(value)

            except Exception:

                return None



        project_object_id = to_object_id(project_id)

        source_job_object_id = to_object_id(source_job_id) if source_job_id else None



        # Get PAGE_SCRAPING results (prefer chain from PAGE_ANALYSIS -> PAGE_SCRAPING)

        page_scraping_job = None

        if source_job_object_id:

            page_scraping_job = db.jobs.find_one({"_id": source_job_object_id})



        if not page_scraping_job and project_object_id:

            page_scraping_job = db.jobs.find_one({

                "project_id": project_object_id,

                "jobType": "PAGE_SCRAPING",

                "status": "completed"

            }, sort=[("created_at", -1)])



        # Get LINK_DISCOVERY results (prefer chain from PAGE_SCRAPING -> LINK_DISCOVERY)

        link_discovery_job = None

        if page_scraping_job:

            link_discovery_job_id = to_object_id(page_scraping_job.get("input_data", {}).get("source_job_id"))

            if link_discovery_job_id:

                link_discovery_job = db.jobs.find_one({"_id": link_discovery_job_id})



        if not link_discovery_job and project_object_id:

            link_discovery_job = db.jobs.find_one({

                "project_id": project_object_id,

                "jobType": "LINK_DISCOVERY",

                "status": "completed"

            }, sort=[("created_at", -1)])

        

        # Build crawl summary payload with complete data from DATABASE (primary source)

        link_discovery_result = link_discovery_job.get("result_data", {}) if link_discovery_job else {}

        page_scraping_result = page_scraping_job.get("result_data", {}) if page_scraping_job else {}



        # PRIMARY: Read from database collections (source of truth)

        internal_links = 0

        external_links = 0

        social_links = 0

        

        if project_object_id:

            internal_links = seo_internal_links.count_documents({"projectId": project_object_id})

            external_links = seo_external_links.count_documents({"projectId": project_object_id})

            social_links = seo_social_links.count_documents({"projectId": project_object_id})



        discovered_total = internal_links + external_links + social_links



        # PRIMARY: Read crawled pages from database

        scraped_successful = 0

        scraped_failed = 0

        scraped_total = 0

        

        if project_object_id:

            scraped_successful = seo_page_data.count_documents({

                "projectId": project_object_id,

                "scrape_status": "SUCCESS"

            })

            scraped_failed = seo_page_data.count_documents({

                "projectId": project_object_id,

                "scrape_status": "FAILED"

            })

            scraped_total = scraped_successful + scraped_failed



        # Calculate success rate from actual database counts

        scraped_success_rate = round((scraped_successful / scraped_total) * 100, 2) if scraped_total > 0 else 0



        link_discovery_duration_ms = link_discovery_result.get("duration_ms", 0)

        page_scraping_duration_ms = page_scraping_result.get("duration_ms", 0)

        total_crawl_duration_ms = link_discovery_duration_ms + page_scraping_duration_ms + analysis_duration_ms



        crawl_summary = {

            "projectId": project_id,

            "seo_jobId": job_id,

            "crawl_summary": {

                "discovered_links": {

                    "internal_links": internal_links,

                    "external_links": external_links,

                    "social_links": social_links,

                    "total": discovered_total

                },

                "crawled_pages": {

                    "total": scraped_total,

                    "successful": scraped_successful,

                    "failed": scraped_failed,

                    "success_rate": scraped_success_rate

                },

                "analysis_results": {

                    "pages_analyzed": seo_page_data.count_documents({

                        "projectId": project_object_id,

                        "scrape_status": "SUCCESS"

                    }),

                    "issues_found": seo_page_issues.count_documents({

                        "projectId": project_object_id

                    }),

                    "failed_analyses": analysis_stats.get("failedAnalyses", 0)

                },

                "timing": {

                    "page_analysis_duration_ms": analysis_duration_ms,

                    "total_crawl_duration_ms": total_crawl_duration_ms

                }

            }

        }

        

        # Validate and log summary data completeness

        discovered_total = crawl_summary['crawl_summary']['discovered_links']['total']

        crawled_successful = crawl_summary['crawl_summary']['crawled_pages']['successful']

        analyzed_pages = crawl_summary['crawl_summary']['analysis_results']['pages_analyzed']

        total_duration = crawl_summary['crawl_summary']['timing']['total_crawl_duration_ms']

        

        print(f"[API] Crawl summary from database | jobId={job_id} | discovered={discovered_total} | crawled={crawled_successful} | analyzed={analyzed_pages} | duration={total_duration}ms")

        

        # Send summary to Node.js

        node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

        summary_url = f"{node_backend_url}/api/jobs/{job_id}/summary"

        

        response = requests.post(summary_url, json=crawl_summary, timeout=30)

        response.raise_for_status()

        

        print(f"✅ Successfully sent crawl summary to Node.js | jobId={job_id} | total_duration={crawl_summary['crawl_summary']['timing']['total_crawl_duration_ms']}ms")

        

    except Exception as summary_error:

        print(f"⚠️ Failed to send crawl summary to Node.js | jobId={job_id} | error=\"{str(summary_error)}\"")

        # Don't raise - analysis completion is more important than summary

