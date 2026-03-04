"""
Extract and format backend systems audit results in the exact requested format
"""

import json

# Read the audit results
with open("backend_systems_audit.json", "r") as f:
    data = json.load(f)

# Extract rule audits in the requested format
rule_results = data["rule_audits"]

# Show examples of different issue types
print("STEP 2: INDIVIDUAL RULE AUDITS")
print("=" * 60)

print("EXAMPLES OF DIFFERENT ISSUE TYPES:")
print("-" * 40)

# Data mapping issues
mapping_issues = [r for r in rule_results if r["data_mapping_issue"]]
print(f"\nDATA MAPPING ISSUES ({len(mapping_issues)} rules):")
for rule in mapping_issues[:3]:
    print(json.dumps(rule, indent=2))

# Logic issues
logic_issues = [r for r in rule_results if r["logic_not_executing"]]
print(f"\nLOGIC ISSUES ({len(logic_issues)} rules):")
for rule in logic_issues[:3]:
    print(json.dumps(rule, indent=2))

# Silent pass risks
silent_risks = [r for r in rule_results if r["silent_pass_risk"]]
print(f"\nSILENT PASS RISKS ({len(silent_risks)} rules):")
for rule in silent_risks[:3]:
    print(json.dumps(rule, indent=2))

# Skip logic invalid
skip_issues = [r for r in rule_results if r["skip_logic_invalid"]]
print(f"\nSKIP LOGIC INVALID ({len(skip_issues)} rules):")
for rule in skip_issues:
    print(json.dumps(rule, indent=2))

# Fully operational rules
fully_operational = [r for r in rule_results if not any([
    r["data_mapping_issue"], r["logic_not_executing"], 
    r["silent_pass_risk"], r["skip_logic_invalid"]
])]
print(f"\nFULLY OPERATIONAL RULES ({len(fully_operational)} rules):")
for rule in fully_operational[:3]:
    print(json.dumps(rule, indent=2))

print("\n" + "=" * 60)
print("STEP 3: HIGH LEVEL ENGINE AUDIT")
print("=" * 60)

engine_audit = data["engine_audit"]
print(json.dumps(engine_audit, indent=2))

print("\n" + "=" * 60)
print("CRITICAL FINDINGS")
print("=" * 60)

print(f"🔴 CRITICAL: Overall Engine Health Score: {engine_audit['overall_engine_health_score']}%")
print(f"🔴 CRITICAL: {engine_audit['rules_with_mapping_issue']} rules have data mapping issues")
print(f"🔴 CRITICAL: {engine_audit['rules_with_logic_issue']} rules have logic issues")
print(f"🔴 CRITICAL: {engine_audit['rules_with_silent_pass_risk']} rules have silent pass risks")

print(f"\n📊 DATA EXTRACTION STATUS:")
print(f"   Collections with data: 1/4 (only seo_page_performance)")
print(f"   Missing critical data: title, meta_description, headings, images, og_tags, structured_data")
print(f"   Available data: performance metrics only")

print(f"\n🎯 IMMEDIATE ACTIONS REQUIRED:")
print(f"   1. Fix data extraction - 3/4 collections empty")
print(f"   2. Fix data mapping - {engine_audit['rules_with_mapping_issue']} rules affected")
print(f"   3. Fix rule logic - {engine_audit['rules_with_logic_issue']} rules not executing properly")
print(f"   4. Fix silent passes - {engine_audit['rules_with_silent_pass_risk']} rules passing without data")

# Save the final formatted results
final_output = {
    "step2_rule_audits": rule_results,
    "step3_engine_audit": engine_audit,
    "critical_findings": {
        "overall_health": engine_audit['overall_engine_health_score'],
        "data_extraction_status": "1/4 collections populated",
        "most_critical_issue": "Massive data extraction failure",
        "immediate_actions": [
            "Fix data extraction pipeline",
            "Repair data mapping rules", 
            "Fix rule logic execution",
            "Eliminate silent pass risks"
        ]
    }
}

with open("final_backend_audit.json", "w") as f:
    json.dump(final_output, f, indent=2, default=str)

print(f"\nComplete audit saved to: final_backend_audit.json")
