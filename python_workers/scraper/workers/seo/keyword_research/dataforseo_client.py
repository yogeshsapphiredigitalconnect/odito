"""DataForSEO API client for Related Keywords endpoint.

Handles authentication, request formatting, retry logic, and error handling
for the DataForSEO Labs Google Related Keywords API.
"""

import os
import time
import requests
import base64
from datetime import datetime, timezone


class DataForSEOClient:
    """Client for the DataForSEO Related Keywords API."""

    API_URL = "https://sandbox.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live"
    MAX_RETRIES = 3
    RETRY_BACKOFF_BASE = 2  # seconds

    def __init__(self):
        self.login = os.getenv("DATAFORSEO_LOGIN", "")
        self.password = os.getenv("DATAFORSEO_PASSWORD", "")

        if not self.login or not self.password:
            print("[DATAFORSEO] WARNING: DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD not set in environment")

    def _get_auth_header(self):
        """Generate HTTP Basic Auth header."""
        credentials = f"{self.login}:{self.password}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"

    def get_related_keywords(self, keyword, depth=2, limit=50, location_name="United States", language_name="English"):
        """
        Fetch related keywords from DataForSEO API.

        Args:
            keyword: Seed keyword to find related keywords for
            depth: Depth of related keywords tree (1-4)
            limit: Maximum number of results
            location_name: Target location
            language_name: Target language

        Returns:
            dict: Raw API response data

        Raises:
            Exception: If all retry attempts fail
        """
        payload = [{
            "keyword": keyword,
            "location_name": location_name,
            "language_name": language_name,
            "depth": depth,
            "limit": limit
        }]

        headers = {
            "Authorization": self._get_auth_header(),
            "Content-Type": "application/json"
        }

        last_error = None

        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                print(f"[DATAFORSEO] API request attempt {attempt}/{self.MAX_RETRIES} | keyword=\"{keyword}\" | depth={depth} | location=\"{location_name}\" | language=\"{language_name}\" | timestamp={datetime.now(timezone.utc).isoformat()}")

                response = requests.post(
                    self.API_URL,
                    json=payload,
                    headers=headers,
                    timeout=60
                )

                # Check HTTP status
                if response.status_code == 401:
                    raise Exception("DataForSEO authentication failed — check DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD")

                if response.status_code == 402:
                    raise Exception("DataForSEO account has insufficient credits")

                response.raise_for_status()

                data = response.json()

                # Check API-level status
                if data.get("status_code") != 20000:
                    error_msg = data.get("status_message", "Unknown API error")
                    raise Exception(f"DataForSEO API error: {error_msg} (code: {data.get('status_code')})")

                print(f"[DATAFORSEO] API request successful | keyword=\"{keyword}\" | location=\"{location_name}\" | language=\"{language_name}\" | timestamp={datetime.now(timezone.utc).isoformat()}")
                return data

            except requests.exceptions.Timeout:
                last_error = Exception(f"DataForSEO API timeout on attempt {attempt}")
                print(f"[DATAFORSEO] Request timeout | attempt={attempt}/{self.MAX_RETRIES}")

            except requests.exceptions.ConnectionError as e:
                last_error = Exception(f"DataForSEO connection error: {str(e)}")
                print(f"[DATAFORSEO] Connection error | attempt={attempt}/{self.MAX_RETRIES} | error=\"{str(e)}\"")

            except Exception as e:
                last_error = e
                # Don't retry auth or credit errors
                if "authentication failed" in str(e).lower() or "insufficient credits" in str(e).lower():
                    print(f"[DATAFORSEO] Non-retryable error | reason=\"{str(e)}\"")
                    raise
                print(f"[DATAFORSEO] Request failed | attempt={attempt}/{self.MAX_RETRIES} | reason=\"{str(e)}\"")

            # Exponential backoff before retry
            if attempt < self.MAX_RETRIES:
                backoff = self.RETRY_BACKOFF_BASE ** attempt
                print(f"[DATAFORSEO] Retrying in {backoff}s...")
                time.sleep(backoff)

        # All retries exhausted
        raise Exception(f"DataForSEO API failed after {self.MAX_RETRIES} attempts: {str(last_error)}")
