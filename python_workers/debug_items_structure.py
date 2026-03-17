#!/usr/bin/env python3
import os
import sys
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the scraper directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraper'))

from scraper.workers.seo.keyword_research.dataforseo_client import DataForSEOClient

client = DataForSEOClient()
result = client.get_related_keywords('seo', depth=1, limit=3, location_name='India', language_name='English')

if 'tasks' in result:
    task = result['tasks'][0]
    if 'result' in task:
        keyword_data = task['result'][0]
        items = keyword_data.get('items', [])
        
        print(f'Found {len(items)} items')
        print()
        
        for i, item in enumerate(items, 1):
            print(f'Item {i} structure:')
            print(json.dumps(item, indent=2, ensure_ascii=False))
            print('-' * 50)
