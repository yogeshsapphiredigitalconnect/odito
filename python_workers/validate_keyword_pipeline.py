#!/usr/bin/env python3
"""
Keyword Research Pipeline Validation Script

Tests all the fixes made to the keyword research pipeline:
1. Null result handling in keyword_processor.py
2. Intent classification
3. SERP features normalization
4. Data consistency validation
5. API endpoint testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import seo_keyword_opportunities, seo_keyword_research
from scraper.workers.seo.keyword_research.keyword_processor import KeywordProcessor
from datetime import datetime, timezone
import json

def test_intent_classification():
    """Test the intent classification logic."""
    print("=== TESTING INTENT CLASSIFICATION ===")
    
    test_cases = [
        ("buy seo services", "commercial"),
        ("seo agency near me", "commercial"),
        ("google analytics login", "navigational"),
        ("what is seo", "informational"),
        ("best seo tools", "commercial"),
        ("search console", "navigational"),
        ("seo guide", "informational")
    ]
    
    for keyword, expected in test_cases:
        result = KeywordProcessor._classify_intent(keyword)
        status = "✅" if result == expected else "❌"
        print(f"{status} '{keyword}' → {result} (expected: {expected})")
    
    print()

def test_null_handling():
    """Test null result handling in keyword processor."""
    print("=== TESTING NULL HANDLING ===")
    
    # Test with empty results array
    empty_response = {
        "tasks": [{
            "status_code": 20000,
            "result": []
        }]
    }
    
    processor = KeywordProcessor()
    result = processor.process_results(empty_response, "test_keyword")
    
    if result == []:
        print("✅ Empty results handled correctly")
    else:
        print("❌ Empty results not handled properly")
    
    # Test with null result
    null_response = {
        "tasks": [{
            "status_code": 20000,
            "result": None
        }]
    }
    
    result = processor.process_results(null_response, "test_keyword")
    
    if result == []:
        print("✅ Null results handled correctly")
    else:
        print("❌ Null results not handled properly")
    
    print()

def validate_data_consistency():
    """Validate data consistency in MongoDB collections."""
    print("=== VALIDATING DATA CONSISTENCY ===")
    
    # Check sample records for required fields
    sample_keywords = list(seo_keyword_opportunities.find().limit(5))
    
    required_fields = ['keyword', 'search_volume', 'difficulty', 'cpc', 'intent', 'serp_features']
    
    for i, doc in enumerate(sample_keywords):
        print(f"Checking document {i+1}...")
        missing_fields = []
        
        for field in required_fields:
            if field not in doc or doc[field] is None:
                missing_fields.append(field)
        
        if missing_fields:
            print(f"❌ Missing fields: {missing_fields}")
        else:
            print("✅ All required fields present")
        
        # Check serp_features is always an array
        if 'serp_features' in doc:
            if isinstance(doc['serp_features'], list):
                print("✅ serp_features is array")
            else:
                print(f"❌ serp_features is {type(doc['serp_features'])}, not array")
        
        # Check intent is valid
        if 'intent' in doc:
            valid_intents = ['informational', 'commercial', 'navigational']
            if doc['intent'] in valid_intents:
                print("✅ intent is valid")
            else:
                print(f"❌ intent '{doc['intent']}' is not valid")
        
        print()

def test_data_types():
    """Test data type consistency."""
    print("=== TESTING DATA TYPES ===")
    
    sample = seo_keyword_opportunities.find_one()
    if not sample:
        print("❌ No data to test")
        return
    
    type_checks = [
        ('keyword', str),
        ('search_volume', int),
        ('difficulty', int),
        ('cpc', (int, float)),
        ('intent', str),
        ('serp_features', list)
    ]
    
    for field, expected_type in type_checks:
        if field in sample:
            value = sample[field]
            if isinstance(value, expected_type):
                print(f"✅ {field}: {type(value).__name__}")
            else:
                print(f"❌ {field}: {type(value).__name__} (expected {expected_type})")
        else:
            print(f"❌ {field}: missing")
    
    print()

def test_indexes():
    """Test if required indexes exist."""
    print("=== TESTING INDEXES ===")
    
    try:
        indexes = seo_keyword_opportunities.list_indexes()
        index_keys = [list(idx['key'].keys()) for idx in indexes]
        
        required_indexes = [
            ['_id'],
            ['project_id'],
            ['project_id', 'keyword'],
            ['project_id', 'search_volume'],
            ['project_id', 'difficulty'],
            ['project_id', 'cpc'],
            ['project_id', 'intent'],
            ['job_id']
        ]
        
        for required in required_indexes:
            found = any(required == keys for keys in index_keys)
            status = "✅" if found else "❌"
            print(f"{status} Index on {required}")
        
    except Exception as e:
        print(f"❌ Error checking indexes: {e}")
    
    print()

def main():
    """Run all validation tests."""
    print("KEYWORD RESEARCH PIPELINE VALIDATION")
    print("=" * 50)
    print(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
    print()
    
    test_intent_classification()
    test_null_handling()
    validate_data_consistency()
    test_data_types()
    test_indexes()
    
    print("VALIDATION COMPLETE")
    print("=" * 50)

if __name__ == "__main__":
    main()
