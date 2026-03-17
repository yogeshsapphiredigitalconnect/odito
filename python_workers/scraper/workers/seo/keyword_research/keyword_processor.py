"""Keyword result processor for DataForSEO Related Keywords API responses.

Extracts and normalizes keyword data from the nested DataForSEO response
structure into flat records suitable for MongoDB storage.
"""

from datetime import datetime, timezone


class KeywordProcessor:
    """Processes raw DataForSEO API responses into normalized keyword records."""

    @staticmethod
    def process_results(raw_response, seed_keyword):
        """
        Extract and normalize keywords from a DataForSEO Related Keywords response.

        Args:
            raw_response: Complete API response dict from DataForSEO
            seed_keyword: The original seed keyword used for the query

        Returns:
            list[dict]: Normalized keyword records ready for MongoDB insertion
        """
        keywords = []
        seen_keywords = set()  # Deduplicate within a single response

        try:
            tasks = raw_response.get("tasks", [])
            if not tasks:
                print(f"[KEYWORD_PROCESSOR] No tasks in API response | seed=\"{seed_keyword}\"")
                return keywords

            for task in tasks:
                result_items = task.get("result", [])
                if not result_items:
                    continue

                for result in result_items:
                    items = result.get("items", [])
                    if not items:
                        continue

                    for item in items:
                        keyword_data = item.get("keyword_data", {})
                        keyword_info = keyword_data.get("keyword_info", {})
                        keyword_text = keyword_data.get("keyword", "")

                        if not keyword_text:
                            continue

                        # Deduplicate within response
                        keyword_lower = keyword_text.lower().strip()
                        if keyword_lower in seen_keywords:
                            continue
                        seen_keywords.add(keyword_lower)

                        # Extract metrics
                        search_volume = keyword_info.get("search_volume", 0) or 0
                        competition = keyword_info.get("competition", None)
                        cpc = keyword_info.get("cpc", None)

                        # Keyword difficulty from keyword_properties if available
                        keyword_properties = keyword_data.get("keyword_properties", {})
                        difficulty = keyword_properties.get("keyword_difficulty", None)

                        keywords.append({
                            "keyword": keyword_text,
                            "search_volume": search_volume,
                            "competition": competition,
                            "cpc": cpc,
                            "difficulty": difficulty,
                            "source_keyword": seed_keyword,
                            "created_at": datetime.now(timezone.utc)
                        })

            print(f"[KEYWORD_PROCESSOR] Processed {len(keywords)} keywords | seed=\"{seed_keyword}\"")

        except Exception as e:
            print(f"[KEYWORD_PROCESSOR] Error processing results | seed=\"{seed_keyword}\" | error=\"{str(e)}\"")

        return keywords
