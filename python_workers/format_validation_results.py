"""
Extract and format rule validation results in the exact requested format
"""

import json

# Read the validation results
with open("rule_engine_validation_results.json", "r") as f:
    data = json.load(f)

# Extract rule validations in the requested format
rule_results = []
for validation in data["rule_validations"]:
    rule_results.append({
        "rule_name": validation["rule_name"],
        "required_data_present": validation["required_data_present"],
        "data_used_detected": validation["data_used_detected"],
        "logic_consistent": validation["logic_consistent"],
        "silent_pass_risk": validation["silent_pass_risk"],
        "skip_reason_valid": validation["skip_reason_valid"],
        "engine_confidence_score": validation["engine_confidence_score"]
    })

# Create the final output
output = {
    "rule_validations": rule_results,
    "total_rules_checked": data["total_rules_checked"],
    "fully_valid_rules": data["fully_valid_rules"],
    "rules_with_data_mapping_issue": data["rules_with_data_mapping_issue"],
    "rules_with_logic_issue": data["rules_with_logic_issue"],
    "rules_with_silent_pass_risk": data["rules_with_silent_pass_risk"],
    "overall_engine_reliability": data["overall_engine_reliability"]
}

# Show a sample of rule validations
print("SAMPLE RULE VALIDATIONS:")
print("-" * 50)

# Show examples of different types
perfect_rules = [r for r in rule_results if r["engine_confidence_score"] == 95]
data_issues = [r for r in rule_results if not r["required_data_present"]]
logic_issues = [r for r in rule_results if not r["logic_consistent"]]
silent_risks = [r for r in rule_results if r["silent_pass_risk"]]

print("PERFECT RULE EXAMPLES:")
for rule in perfect_rules[:3]:
    print(json.dumps(rule, indent=2))

print("\nDATA MAPPING ISSUE EXAMPLES:")
for rule in data_issues[:3]:
    print(json.dumps(rule, indent=2))

print("\nLOGIC ISSUE EXAMPLES:")
for rule in logic_issues[:3]:
    print(json.dumps(rule, indent=2))

print("\nSILENT PASS RISK EXAMPLES:")
for rule in silent_risks:
    print(json.dumps(rule, indent=2))

print("\n" + "="*60)
print("FINAL SUMMARY")
print("="*60)
summary = {
    "total_rules_checked": data["total_rules_checked"],
    "fully_valid_rules": data["fully_valid_rules"],
    "rules_with_data_mapping_issue": data["rules_with_data_mapping_issue"],
    "rules_with_logic_issue": data["rules_with_logic_issue"],
    "rules_with_silent_pass_risk": data["rules_with_silent_pass_risk"],
    "overall_engine_reliability": data["overall_engine_reliability"]
}

print(json.dumps(summary, indent=2))

# Save the complete results
with open("final_rule_validation.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"\nComplete results saved to: final_rule_validation.json")
