"""KEYWORD_RESEARCH worker — Orchestrates keyword research via DataForSEO API.

Flow:
  1. Receive job payload (keyword, depth, projectId)
  2. Call DataForSEO Related Keywords API
  3. Process and normalize results
  4. Store raw response in seo_keyword_research collection
  5. Store processed keywords in seo_keyword_opportunities collection
  6. Callback to Node.js with completion status
"""

import os
import requests
import traceback
from datetime import datetime, timezone
from bson import ObjectId

from db import seo_keyword_research, seo_keyword_opportunities, seoprojects
from scraper.workers.seo.keyword_research.dataforseo_client import DataForSEOClient
from scraper.workers.seo.keyword_research.keyword_processor import KeywordProcessor


def fetch_project_settings(project_id: str) -> dict:
    """
    Fetch project location and language settings from MongoDB.
    
    Args:
        project_id: MongoDB project ID
        
    Returns:
        dict: Project settings with location, country, language
    """
    try:
        print(f"[KEYWORD_RESEARCH] Fetching project settings | projectId={project_id}")
        
        project = seoprojects.find_one({"_id": ObjectId(project_id)})
        
        if not project:
            print(f"[KEYWORD_RESEARCH] Project not found | projectId={project_id}")
            return {}
            
        settings = {
            "location": project.get("location"),
            "country": project.get("country", "US"),
            "language": project.get("language", "en")
        }
        
        print(f"[KEYWORD_RESEARCH] Project settings retrieved | location={settings['location']} | country={settings['country']} | language={settings['language']}")
        return settings
        
    except Exception as e:
        print(f"[KEYWORD_RESEARCH] Failed to fetch project settings | projectId={project_id} | error={str(e)}")
        return {}


def map_language_code_to_name(language_code: str) -> str:
    """
    Map ISO language codes to DataForSEO language names.
    
    Args:
        language_code: ISO language code (e.g., 'en', 'es')
        
    Returns:
        str: DataForSEO language name
    """
    mapping = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'pt': 'Portuguese',
        'it': 'Italian',
        'ru': 'Russian',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'ko': 'Korean'
    }
    return mapping.get(language_code.lower(), 'English')


def map_country_code_to_dataforseo_code(country_code: str) -> int:
    """
    Map ISO country codes to DataForSEO location codes.
    
    Args:
        country_code: ISO country code (e.g., 'US', 'GB')
        
    Returns:
        int: DataForSEO location code
    """
    mapping = {
        'US': 2840,  # United States
        'GB': 2826,  # United Kingdom
        'CA': 2124,  # Canada
        'AU': 2243,  # Australia
        'DE': 2365,  # Germany
        'FR': 2250,  # France
        'ES': 2153,  # Spain
        'IT': 2382,  # Italy
        'JP': 2320,  # Japan
        'CN': 2358,  # China
        'IN': 2249,  # India
        'BR': 2073,  # Brazil
        'MX': 2135,  # Mexico
        'KR': 2314,  # South Korea
        'RU': 2464   # Russia
    }
    return mapping.get(country_code.upper(), 2840)  # Default to United States


def get_location_name_for_api(location: str, country_code: str) -> str:
    """
    Get the best location name for DataForSEO API.
    
    Args:
        location: User-provided location string
        country_code: ISO country code
        
    Returns:
        str: Location name for API
    """
    if location and location.strip():
        return location.strip()
    
    # Fallback to country name if no specific location
    country_names = {
        'US': 'United States',
        'GB': 'United Kingdom',
        'CA': 'Canada',
        'AU': 'Australia',
        'DE': 'Germany',
        'FR': 'France',
        'ES': 'Spain',
        'IT': 'Italy',
        'JP': 'Japan',
        'CN': 'China',
        'IN': 'India',
        'BR': 'Brazil',
        'MX': 'Mexico',
        'KR': 'South Korea',
        'RU': 'Russia'
    }
    
    return country_names.get(country_code.upper(), 'United States')


def execute_keyword_research(job):
    """
    Execute a KEYWORD_RESEARCH job.

    Args:
        job: Pydantic model with jobId, projectId, userId, keyword, depth

    Returns:
        dict with status and results
    """
    job_id = job.jobId
    project_id = job.projectId
    keyword = job.keyword
    depth = job.depth or 2
    node_backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

    print(f"[KEYWORD_RESEARCH] Starting | jobId={job_id} | keyword=\"{keyword}\" | depth={depth} | timestamp={datetime.now(timezone.utc).isoformat()}")

    try:
        # STEP 0: Fetch project settings for location and language
        print(f"[KEYWORD_RESEARCH] Fetching project settings | jobId={job_id} | timestamp={datetime.now(timezone.utc).isoformat()}")
        project_settings = fetch_project_settings(project_id)
        
        # Extract location and language settings with fallbacks
        location_name = get_location_name_for_api(
            project_settings.get('location'), 
            project_settings.get('country', 'US')
        )
        language_name = map_language_code_to_name(project_settings.get('language', 'en'))
        location_code = map_country_code_to_dataforseo_code(project_settings.get('country', 'US'))
        
        print(f"[KEYWORD_RESEARCH] Using location settings | location_name=\"{location_name}\" | language_name=\"{language_name}\" | location_code={location_code}")

        # STEP 1: Call DataForSEO API with project-specific settings
        print(f"[KEYWORD_RESEARCH] Calling DataForSEO API | jobId={job_id} | timestamp={datetime.now(timezone.utc).isoformat()}")
        client = DataForSEOClient()
        raw_response = client.get_related_keywords(
            keyword=keyword, 
            depth=depth,
            location_name=location_name,
            language_name=language_name
        )

        # STEP 2: Store raw API response
        print(f"[KEYWORD_RESEARCH] Storing raw response | jobId={job_id} | timestamp={datetime.now(timezone.utc).isoformat()}")
        raw_doc = {
            "project_id": project_id,
            "job_id": job_id,
            "seed_keyword": keyword,
            "depth": depth,
            "raw_api_response": raw_response,
            "created_at": datetime.now(timezone.utc),
            "location_used": location_name,
            "language_used": language_name,
            "location_code": location_code
        }
        seo_keyword_research.insert_one(raw_doc)
        print(f"[KEYWORD_RESEARCH] Raw response stored | jobId={job_id}")

        # STEP 3: Process and normalize keywords
        print(f"[KEYWORD_RESEARCH] Processing keywords | jobId={job_id} | timestamp={datetime.now(timezone.utc).isoformat()}")
        processor = KeywordProcessor()
        processed_keywords = processor.process_results(raw_response, keyword)

        # STEP 4: Store processed keywords
        keywords_stored = 0
        if processed_keywords:
            print(f"[KEYWORD_RESEARCH] Storing {len(processed_keywords)} keywords | jobId={job_id}")

            # Prepare bulk operations with upsert to handle duplicates
            bulk_ops = []
            for kw in processed_keywords:
                bulk_ops.append({
                    "filter": {
                        "project_id": project_id,
                        "keyword": kw["keyword"]
                    },
                    "update": {
                        "$set": {
                            "project_id": project_id,
                            "job_id": job_id,
                            "keyword": kw["keyword"],
                            "search_volume": kw["search_volume"],
                            "competition": kw["competition"],
                            "cpc": kw["cpc"],
                            "difficulty": kw["difficulty"],
                            "source_keyword": kw["source_keyword"],
                            "created_at": kw["created_at"]
                        }
                    },
                    "upsert": True
                })

            # Execute bulk upserts
            from pymongo import UpdateOne
            mongo_ops = [
                UpdateOne(op["filter"], op["update"], upsert=op["upsert"])
                for op in bulk_ops
            ]
            result = seo_keyword_opportunities.bulk_write(mongo_ops)
            keywords_stored = result.upserted_count + result.modified_count
            print(f"[KEYWORD_RESEARCH] Keywords stored | jobId={job_id} | upserted={result.upserted_count} | modified={result.modified_count}")
        else:
            print(f"[KEYWORD_RESEARCH] No keywords to store | jobId={job_id}")

        # STEP 5: Report job completion
        stats = {
            "keywords_found": len(processed_keywords),
            "keywords_stored": keywords_stored,
            "seed_keyword": keyword,
            "depth": depth
        }

        try:
            complete_url = f"{node_backend_url}/api/jobs/{job_id}/complete"
            complete_response = requests.post(
                complete_url,
                json={"stats": stats},
                timeout=10
            )
            complete_response.raise_for_status()
            print(f"[KEYWORD_RESEARCH] Job completion reported | jobId={job_id} | keywords_found={len(processed_keywords)} | timestamp={datetime.now(timezone.utc).isoformat()}")
        except Exception as complete_error:
            print(f"⚠️ [KEYWORD_RESEARCH] Failed to report completion | jobId={job_id} | error={str(complete_error)}")
            # Try to report failure instead
            try:
                fail_url = f"{node_backend_url}/api/jobs/{job_id}/fail"
                requests.post(
                    fail_url,
                    json={"error": f"Completion reporting failed: {str(complete_error)}", "stats": stats},
                    timeout=10
                )
            except Exception:
                pass

        print(f"[KEYWORD_RESEARCH] Completed | jobId={job_id} | keywords_found={len(processed_keywords)} | timestamp={datetime.now(timezone.utc).isoformat()}")

        return {
            "status": "completed",
            "jobId": job_id,
            **stats
        }

    except Exception as e:
        print(f"❌ [KEYWORD_RESEARCH] Worker failed | jobId={job_id} | error={str(e)} | timestamp={datetime.now(timezone.utc).isoformat()}")
        traceback.print_exc()

        # Report failure to Node.js
        try:
            fail_url = f"{node_backend_url}/api/jobs/{job_id}/fail"
            requests.post(
                fail_url,
                json={"error": str(e), "stats": {}},
                timeout=10
            )
            print(f"[KEYWORD_RESEARCH] Failure reported | jobId={job_id}")
        except Exception as fail_error:
            print(f"⚠️ [KEYWORD_RESEARCH] Failed to report failure | error={str(fail_error)}")

        return {
            "status": "failed",
            "jobId": job_id,
            "error": str(e)
        }
