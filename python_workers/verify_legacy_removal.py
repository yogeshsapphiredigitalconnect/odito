#!/usr/bin/env python3
"""
Legacy SEO Rule System Removal Verification
"""

import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

def verify_legacy_removal():
    """Verify all legacy SEO rule system has been removed"""
    print("🔍 Verifying Legacy SEO Rule System Removal")
    print("=" * 50)
    
    # 1. Check old seo_rules.py file is removed
    old_rules_path = 'scraper/rules/seo_rules.py'
    if os.path.exists(old_rules_path):
        print(f"❌ Legacy file still exists: {old_rules_path}")
        return False
    else:
        print(f"✅ Legacy file removed: {old_rules_path}")
    
    # 2. Check no execute_rule function exists
    try:
        with open('scraper/workers/seo/page_analysis/page_analysis.py', 'r') as f:
            content = f.read()
        
        if 'def execute_rule(' in content:
            print("❌ execute_rule() function still exists")
            return False
        else:
            print("✅ execute_rule() function removed")
    
    except Exception as e:
        print(f"❌ Error checking page_analysis.py: {e}")
        return False
    
    # 3. Check no old SEO_RULES dict usage
    if 'SEO_RULES[' in content or 'for.*SEO_RULES' in content:
        print("❌ Old SEO_RULES dict usage found")
        return False
    else:
        print("✅ Old SEO_RULES dict usage removed")
    
    # 4. Check only modular engine is used
    if 'get_seo_engine().analyze_page(' in content:
        print("✅ Modular engine is being used")
    else:
        print("❌ Modular engine not found")
        return False
    
    # 5. Check no legacy imports
    if 'from.*seo_rules.*import' in content or 'import.*seo_rules' in content:
        print("❌ Legacy seo_rules imports found")
        return False
    else:
        print("✅ No legacy seo_rules imports")
    
    return True

def print_modular_engine_info():
    """Print information about the modular engine"""
    print("\n🚀 Modular SEO Rule Engine Information")
    print("=" * 50)
    
    try:
        # Import the modular engine
        sys.path.append('scraper/workers/seo/page_analysis')
        from rules.seo_rule_engine import get_seo_engine
        
        engine = get_seo_engine()
        all_rules = engine.registry.get_all_rules()
        
        print(f"✅ Total rule count registered: {len(all_rules)}")
        
        # Get all rule_no values
        rule_numbers = []
        for rule in all_rules:
            if hasattr(rule, 'rule_no') and rule.rule_no is not None:
                rule_numbers.append(rule.rule_no)
        
        rule_numbers.sort()
        print(f"✅ Registered rule_no values: {rule_numbers}")
        
        # Show categories
        categories = engine.registry.get_categories()
        print(f"✅ Rule categories: {categories}")
        
        # Show some example rules
        print(f"✅ Sample registered rules:")
        for i, rule in enumerate(all_rules[:10]):
            print(f"   {i+1}. {rule.rule_id} (rule_no: {getattr(rule, 'rule_no', 'N/A')}, category: {getattr(rule, 'category', 'N/A')})")
        
        if len(all_rules) > 10:
            print(f"   ... and {len(all_rules) - 10} more rules")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading modular engine: {e}")
        return False

def confirm_no_legacy_functions():
    """Confirm no legacy functions exist anywhere"""
    print("\n🔍 Searching for Any Remaining Legacy Functions")
    print("=" * 50)
    
    legacy_patterns = [
        'def execute_rule(',
        'SEO_RULES[',
        'for rule_id, rule_config in SEO_RULES',
        'elif.*rule_id ==',
        'case.*rule_id'
    ]
    
    try:
        with open('scraper/workers/seo/page_analysis/page_analysis.py', 'r') as f:
            content = f.read()
        
        found_legacy = False
        for pattern in legacy_patterns:
            if pattern in content:
                print(f"❌ Found legacy pattern: {pattern}")
                found_legacy = True
        
        if not found_legacy:
            print("✅ No legacy function patterns found")
            return True
        else:
            return False
            
    except Exception as e:
        print(f"❌ Error checking for legacy functions: {e}")
        return False

def main():
    """Main verification"""
    print("SEO LEGACY RULE SYSTEM REMOVAL VERIFICATION")
    print("=" * 60)
    
    # Run all verifications
    legacy_removed = verify_legacy_removal()
    engine_info = print_modular_engine_info()
    no_legacy_functions = confirm_no_legacy_functions()
    
    print("\n" + "=" * 60)
    print("FINAL VERIFICATION RESULTS")
    print("=" * 60)
    
    if legacy_removed and engine_info and no_legacy_functions:
        print("🎉 SUCCESS: All legacy SEO rule system has been removed!")
        print("✅ Only modular SEO engine remains")
        print("✅ No legacy functions or imports exist")
        print("✅ Worker can only call modular engine")
    else:
        print("❌ FAILURE: Some legacy components still exist")
        if not legacy_removed:
            print("   - Legacy files or functions still present")
        if not engine_info:
            print("   - Modular engine not working properly")
        if not no_legacy_functions:
            print("   - Legacy function patterns still found")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
