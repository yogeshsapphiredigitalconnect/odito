#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the scraper directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraper'))

from scraper.workers.seo.keyword_research.dataforseo_client import DataForSEOClient

client = DataForSEOClient()
result = client.get_related_keywords('seo', depth=1, limit=5, location_name='India', language_name='English')

if 'tasks' in result:
    task = result['tasks'][0]
    if 'result' in task:
        keyword_data = task['result'][0]
        print('Available keys in keyword_data:')
        for key in keyword_data.keys():
            print(f'  {key}')
        print()
        
        if 'related_keywords' in keyword_data:
            print('Related keywords found:', len(keyword_data['related_keywords']))
            for i, kw in enumerate(keyword_data['related_keywords'][:10], 1):
                print(f'  {i}. {kw}')
        else:
            print('No related_keywords key found')
            print('Checking for other keyword arrays...')
            for key, value in keyword_data.items():
                if isinstance(value, list) and len(value) > 0:
                    print(f'Found list in key "{key}" with {len(value)} items:')
                    if isinstance(value[0], str):
                        for i, item in enumerate(value[:5], 1):
                            print(f'  {i}. {item}')
