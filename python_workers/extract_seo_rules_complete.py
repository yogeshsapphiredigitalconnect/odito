#!/usr/bin/env python3
"""
Complete SEO Rule Engine Analysis

This script extracts comprehensive information about all SEO rules including:
1. All 188 SEO rules with their details
2. Data collection structure 
3. Rule evaluation logic
4. Sample output structure
5. Field access validation
"""

import os
import sys
import re
import importlib.util
from pathlib import Path

def load_rule_module(module_path):
    """Load a rule module from file path"""
    spec = importlib.util.spec_from_file_location("rule_module", module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def extract_rules_from_file(file_path):
    """Extract all rule classes from a rule file"""
    rules = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all rule classes
        class_pattern = r'class (\w+Rule)\(BaseSEORuleV2\):(.*?)(?=\nclass |\Z)'
        matches = re.findall(class_pattern, content, re.DOTALL)
        
        for class_name, class_body in matches:
            # Extract rule attributes
            rule_id_match = re.search(r'rule_id\s*=\s*"([^"]+)"', class_body)
            rule_no_match = re.search(r'rule_no\s*=\s*(\d+)', class_body)
            category_match = re.search(r'category\s*=\s*"([^"]+)"', class_body)
            severity_match = re.search(r'severity\s*=\s*"([^"]+)"', class_body)
            description_match = re.search(r'description\s*=\s*"([^"]+)"', class_body)
            
            # Extract data fields accessed in evaluate method
            evaluate_match = re.search(r'def evaluate\(.*?\):(.*?)(?=\n    def|\nclass|\Z)', class_body, re.DOTALL)
            data_fields = []
            if evaluate_match:
                evaluate_body = evaluate_match.group(1)
                # Look for normalized.get() calls
                get_calls = re.findall(r'normalized\.get\("([^"]+)"', evaluate_body)
                data_fields.extend(get_calls)
                
                # Look for direct dictionary access
                direct_access = re.findall(r'normalized\["([^"]+)"\]', evaluate_body)
                data_fields.extend(direct_access)
                
                # Look for nested access like normalized.get("meta_tags", {}).get()
                nested_access = re.findall(r'normalized\.get\("([^"]+)", {}\)', evaluate_body)
                data_fields.extend(nested_access)
            
            # Extract issue generation logic
            issue_logic = []
            if evaluate_match:
                create_issue_calls = re.findall(r'self\.create_issue\([^)]*\)', evaluate_match.group(1))
                for call in create_issue_calls:
                    # Extract the message part
                    msg_match = re.search(r'"([^"]+)"', call)
                    if msg_match:
                        issue_logic.append(msg_match.group(1))
            
            rule = {
                'class_name': class_name,
                'rule_id': rule_id_match.group(1) if rule_id_match else 'UNKNOWN',
                'rule_no': int(rule_no_match.group(1)) if rule_no_match else 0,
                'category': category_match.group(1) if category_match else 'Unknown',
                'severity': severity_match.group(1) if severity_match else 'medium',
                'description': description_match.group(1) if description_match else '',
                'data_fields': list(set(data_fields)),  # Remove duplicates
                'issue_logic': issue_logic,
                'file_path': str(file_path)
            }
            rules.append(rule)
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
    
    return rules

def get_data_collection_schema():
    """Extract the data collection schema from normalize_page_data function"""
    schema_file = Path("d:/new/Odito/python_workers/scraper/workers/seo/page_analysis/page_analysis.py")
    
    if not schema_file.exists():
        return {}
    
    with open(schema_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the normalize_page_data function
    func_match = re.search(r'def normalize_page_data\(page\):(.*?)(?=\n\ndef|\nclass|\Z)', content, re.DOTALL)
    
    if not func_match:
        return {}
    
    func_body = func_match.group(1)
    
    # Extract the return dictionary structure
    return_match = re.search(r'return\s*\{(.*?)\}', func_body, re.DOTALL)
    
    if not return_match:
        return {}
    
    return_content = return_match.group(1)
    
    # Extract all field names and their types/structure
    schema = {}
    field_pattern = r'"([^"]+)":\s*([^,}]+)'
    matches = re.findall(field_pattern, return_content)
    
    for field_name, field_value in matches:
        # Determine field type based on the value
        if 'normalize_text' in field_value:
            schema[field_name] = {'type': 'string', 'source': 'normalized text'}
        elif 'headings_list' in field_value:
            schema[field_name] = {'type': 'array', 'source': 'content.headings converted to list'}
        elif 'images_normalized' in field_value:
            schema[field_name] = {'type': 'array', 'source': 'images with normalized width/height'}
        elif 'scripts_list' in field_value:
            schema[field_name] = {'type': 'array', 'source': 'tracking converted to synthetic scripts'}
        elif 'page.get(' in field_value:
            source_match = re.search(r'page\.get\("([^"]+)"', field_value)
            source = source_match.group(1) if source_match else 'unknown'
            schema[field_name] = {'type': 'mixed', 'source': f'page.{source}'}
        else:
            schema[field_name] = {'type': 'mixed', 'source': field_value.strip()}
    
    return schema

def get_rule_evaluation_logic():
    """Extract the core rule evaluation logic"""
    engine_file = Path("d:/new/Odito/python_workers/scraper/workers/seo/page_analysis/rules/seo_rule_engine.py")
    
    if not engine_file.exists():
        return {}
    
    with open(engine_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the analyze_page method
    method_match = re.search(r'def analyze_page\(.*?\):(.*?)(?=\n    def|\nclass|\Z)', content, re.DOTALL)
    
    if not method_match:
        return {}
    
    method_body = method_match.group(1)
    
    return {
        'file_path': str(engine_file),
        'method': 'analyze_page',
        'logic': method_body.strip(),
        'description': 'Executes all registered rules against normalized page data and returns issues and summary'
    }

def get_sample_issue_structure():
    """Get the structure of a generated issue"""
    base_rule_file = Path("d:/new/Odito/python_workers/scraper/workers/seo/page_analysis/rules/base_seo_rule.py")
    
    if not base_rule_file.exists():
        return {}
    
    with open(base_rule_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the create_issue method
    method_match = re.search(r'def create_issue\(.*?\):(.*?)(?=\n    def|\nclass|\Z)', content, re.DOTALL)
    
    if not method_match:
        return {}
    
    method_body = method_match.group(1)
    
    # Extract the return dictionary
    return_match = re.search(r'return\s*\{(.*?)\}', method_body, re.DOTALL)
    
    if not return_match:
        return {}
    
    return_content = return_match.group(1)
    
    # Parse the structure
    structure = {}
    field_pattern = r'"([^"]+)":\s*([^,}]+)'
    matches = re.findall(field_pattern, return_content)
    
    for field_name, field_value in matches:
        if 'ObjectId' in field_value:
            structure[field_name] = {'type': 'ObjectId', 'description': f'MongoDB ObjectId - {field_name}'}
        elif 'datetime' in field_value:
            structure[field_name] = {'type': 'datetime', 'description': 'Timestamp when issue was created'}
        elif 'self.' in field_value:
            structure[field_name] = {'type': 'string', 'description': f'Rule attribute - {field_name}'}
        else:
            structure[field_name] = {'type': 'mixed', 'description': field_value.strip()}
    
    return {
        'file_path': str(base_rule_file),
        'method': 'create_issue',
        'structure': structure
    }

def validate_field_access(rules, schema):
    """Check if any rule accesses fields that don't exist in the schema"""
    schema_fields = set(schema.keys())
    mismatches = []
    
    for rule in rules:
        for field in rule['data_fields']:
            if field not in schema_fields:
                mismatches.append({
                    'rule_id': rule['rule_id'],
                    'rule_no': rule['rule_no'],
                    'field_accessed': field,
                    'file_path': rule['file_path']
                })
    
    return mismatches

def main():
    print("=" * 80)
    print("COMPLETE SEO RULE ENGINE ANALYSIS")
    print("=" * 80)
    
    # 1. Extract all rules
    print("\n1. EXTRACTING ALL SEO RULES...")
    print("-" * 50)
    
    rules_dir = Path("d:/new/Odito/python_workers/scraper/workers/seo/page_analysis/rules/categories")
    all_rules = []
    
    for py_file in rules_dir.glob("*.py"):
        if py_file.name != "__init__.py":
            print(f"Processing {py_file.name}...")
            rules = extract_rules_from_file(py_file)
            all_rules.extend(rules)
    
    # Sort rules by rule_no
    all_rules.sort(key=lambda x: x['rule_no'])
    
    print(f"\nTotal Rules Found: {len(all_rules)}")
    
    # Display rules by category
    categories = {}
    for rule in all_rules:
        cat = rule['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(rule)
    
    print("\nRules by Category:")
    for cat, cat_rules in categories.items():
        print(f"  {cat}: {len(cat_rules)} rules")
    
    # 2. Data Collection Schema
    print("\n\n2. DATA COLLECTION SCHEMA")
    print("-" * 50)
    schema = get_data_collection_schema()
    
    print("Field Structure:")
    for field, info in schema.items():
        print(f"  {field}: {info['type']} (source: {info['source']})")
    
    # 3. Rule Evaluation Logic
    print("\n\n3. RULE EVALUATION LOGIC")
    print("-" * 50)
    eval_logic = get_rule_evaluation_logic()
    print(f"File: {eval_logic['file_path']}")
    print(f"Method: {eval_logic['method']}")
    print(f"Description: {eval_logic['description']}")
    
    # 4. Sample Issue Structure
    print("\n\n4. SAMPLE ISSUE STRUCTURE")
    print("-" * 50)
    issue_structure = get_sample_issue_structure()
    print(f"File: {issue_structure['file_path']}")
    print(f"Method: {issue_structure['method']}")
    print("Issue Fields:")
    for field, info in issue_structure['structure'].items():
        print(f"  {field}: {info['type']} - {info['description']}")
    
    # 5. Field Access Validation
    print("\n\n5. FIELD ACCESS VALIDATION")
    print("-" * 50)
    mismatches = validate_field_access(all_rules, schema)
    
    if mismatches:
        print(f"Found {len(mismatches)} field access mismatches:")
        for mismatch in mismatches:
            print(f"  Rule {mismatch['rule_no']} ({mismatch['rule_id']}) accesses non-existent field: {mismatch['field_accessed']}")
            print(f"    File: {mismatch['file_path']}")
    else:
        print("✅ All rules access valid fields in the data schema")
    
    # Generate detailed report
    print("\n\n6. DETAILED RULES LIST")
    print("-" * 50)
    
    for rule in all_rules:
        print(f"\nRule {rule['rule_no']}: {rule['rule_id']}")
        print(f"  Category: {rule['category']}")
        print(f"  Severity: {rule['severity']}")
        print(f"  Description: {rule['description']}")
        print(f"  Data Fields: {', '.join(rule['data_fields']) if rule['data_fields'] else 'None'}")
        if rule['issue_logic']:
            print(f"  Issue Logic: {rule['issue_logic'][0]}")
        print(f"  File: {rule['file_path']}")
    
    # Summary
    print("\n\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total SEO Rules: {len(all_rules)}")
    print(f"Categories: {len(categories)}")
    print(f"Schema Fields: {len(schema)}")
    print(f"Field Mismatches: {len(mismatches)}")
    
    # Save to file
    output_file = "seo_rules_complete_analysis.json"
    import json
    
    report_data = {
        'summary': {
            'total_rules': len(all_rules),
            'categories': len(categories),
            'schema_fields': len(schema),
            'field_mismatches': len(mismatches)
        },
        'rules': all_rules,
        'schema': schema,
        'evaluation_logic': eval_logic,
        'issue_structure': issue_structure,
        'field_mismatches': mismatches,
        'categories_by_name': {cat: len(rules) for cat, rules in categories.items()}
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2, default=str)
    
    print(f"\nDetailed report saved to: {output_file}")
    
    return report_data

if __name__ == "__main__":
    main()
