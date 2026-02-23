"""
SEO Rules Registry - Metadata Only

This file defines all SEO rules as metadata without any detection logic.
Rules are keyed by rule_id which exactly matches issue_code values used in analyzers.

IMPORTANT: This is metadata only - do not add detection logic or import into analyzers.
"""

SEO_RULES = {
    "TITLE_MISSING": {
        "rule_id": "TITLE_MISSING",
        "name": "Missing Page Title",
        "category": "Content",
        "severity": "high",
        "applies_to": ["page"],
        "description": "Page title is missing",
        "scorable": True
    },
    
    "TITLE_TOO_SHORT": {
        "rule_id": "TITLE_TOO_SHORT",
        "name": "Title Too Short",
        "category": "Content",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Page title is too short",
        "scorable": True
    },
    
    "TITLE_TOO_LONG": {
        "rule_id": "TITLE_TOO_LONG",
        "name": "Title Too Long",
        "category": "Content",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Page title is too long",
        "scorable": True
    },
    
    "META_DESC_MISSING": {
        "rule_id": "META_DESC_MISSING",
        "name": "Missing Meta Description",
        "category": "Content",
        "severity": "high",
        "applies_to": ["page"],
        "description": "Meta description is missing",
        "scorable": True
    },
    
    "META_DESC_TOO_SHORT": {
        "rule_id": "META_DESC_TOO_SHORT",
        "name": "Meta Description Too Short",
        "category": "Content",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Meta description is too short",
        "scorable": True
    },
    
    "META_DESC_TOO_LONG": {
        "rule_id": "META_DESC_TOO_LONG",
        "name": "Meta Description Too Long",
        "category": "Content",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Meta description is too long",
        "scorable": True
    },
    
    "VIEWPORT_MISSING": {
        "rule_id": "VIEWPORT_MISSING",
        "name": "Missing Viewport Meta Tag",
        "category": "Technical",
        "severity": "high",
        "applies_to": ["page"],
        "description": "Viewport meta tag is missing",
        "scorable": True
    },
    
    "H1_MISSING": {
        "rule_id": "H1_MISSING",
        "name": "Missing H1 Tag",
        "category": "Content",
        "severity": "high",
        "applies_to": ["page"],
        "description": "No H1 tag found",
        "scorable": True
    },
    
    "MULTIPLE_H1": {
        "rule_id": "MULTIPLE_H1",
        "name": "Multiple H1 Tags",
        "category": "Content",
        "severity": "high",
        "applies_to": ["page"],
        "description": "Multiple H1 tags found",
        "scorable": True
    },
    
    "H1_NOT_MEANINGFUL": {
        "rule_id": "H1_NOT_MEANINGFUL",
        "name": "H1 Not Meaningful",
        "category": "Content",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "H1 tag is not meaningful",
        "scorable": True
    },
    
    "HEADING_HIERARCHY_SKIPPED": {
        "rule_id": "HEADING_HIERARCHY_SKIPPED",
        "name": "Heading Hierarchy Skipped",
        "category": "Content",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Heading hierarchy skips levels",
        "scorable": True
    },
    
    "URL_NOT_DESCRIPTIVE": {
        "rule_id": "URL_NOT_DESCRIPTIVE",
        "name": "URL Not Descriptive",
        "category": "Technical",
        "severity": "low",
        "applies_to": ["page"],
        "description": "URL is not descriptive",
        "scorable": True
    },
    
    "EXCESSIVE_QUERY_PARAMS": {
        "rule_id": "EXCESSIVE_QUERY_PARAMS",
        "name": "Excessive Query Parameters",
        "category": "Technical",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "URL has too many query parameters",
        "scorable": True
    },
    
    "IMAGES_MISSING_ALT": {
        "rule_id": "IMAGES_MISSING_ALT",
        "name": "Images Missing Alt Text",
        "category": "Accessibility",
        "severity": "high",
        "applies_to": ["page"],
        "description": "Images missing alt text",
        "scorable": True
    },
    
    "IMAGES_MISSING_DIMENSIONS": {
        "rule_id": "IMAGES_MISSING_DIMENSIONS",
        "name": "Images Missing Dimensions",
        "category": "Performance",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Images missing width/height attributes",
        "scorable": True
    },
    
    "MISSING_LAZY_LOADING": {
        "rule_id": "MISSING_LAZY_LOADING",
        "name": "Missing Lazy Loading",
        "category": "Performance",
        "severity": "low",
        "applies_to": ["page"],
        "description": "Images missing lazy loading",
        "scorable": True
    },
    
    "CONTENT_TOO_SHORT": {
        "rule_id": "CONTENT_TOO_SHORT",
        "name": "Content Too Short",
        "category": "Content",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Page content is too short",
        "scorable": True
    },
    
    "THIN_CONTENT": {
        "rule_id": "THIN_CONTENT",
        "name": "Thin Content",
        "category": "Content",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Page has thin content (high template ratio)",
        "scorable": True
    },
    
    "POOR_READABILITY": {
        "rule_id": "POOR_READABILITY",
        "name": "Poor Readability",
        "category": "Content",
        "severity": "low",
        "applies_to": ["page"],
        "description": "Content has poor readability (long sentences)",
        "scorable": True
    },
    
    "OPEN_GRAPH_MISSING": {
        "rule_id": "OPEN_GRAPH_MISSING",
        "name": "Missing Open Graph Tags",
        "category": "Social",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Open Graph tags are missing",
        "scorable": True
    },
    
    "ANALYTICS_MISSING": {
        "rule_id": "ANALYTICS_MISSING",
        "name": "Missing Analytics Tracking",
        "category": "Tracking",
        "severity": "low",
        "applies_to": ["page"],
        "description": "Analytics tracking is missing",
        "scorable": True
    },

    "DOCTYPE_MISSING": {
        "rule_id": "DOCTYPE_MISSING",
        "name": "Missing DOCTYPE Declaration",
        "category": "Technical",
        "severity": "high",
        "applies_to": ["page"],
        "description": "DOCTYPE declaration is missing",
        "scorable": True
    },

    "THEME_COLOR_MISSING": {
        "rule_id": "THEME_COLOR_MISSING",
        "name": "Missing Theme Color Meta Tag",
        "category": "Technical",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Theme color meta tag is missing",
        "scorable": True
    },

    "HREFLANG_MISSING": {
        "rule_id": "HREFLANG_MISSING",
        "name": "Missing Hreflang Tags",
        "category": "International",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Hreflang tags are missing for international SEO",
        "scorable": True
    },

    "H2_DUPLICATE": {
        "rule_id": "H2_DUPLICATE",
        "name": "Duplicate H2 Tags",
        "category": "Content",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Duplicate H2 tags found",
        "scorable": True
    },

    "FACEBOOK_PIXEL_MISSING": {
        "rule_id": "FACEBOOK_PIXEL_MISSING",
        "name": "Missing Facebook Pixel",
        "category": "Tracking",
        "severity": "low",
        "applies_to": ["page"],
        "description": "Facebook Pixel tracking is missing",
        "scorable": True
    },

    "CONVERSION_TRACKING_MISSING": {
        "rule_id": "CONVERSION_TRACKING_MISSING",
        "name": "Missing Conversion Tracking",
        "category": "Tracking",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Conversion tracking is missing",
        "scorable": True
    },
    
    "organization_sameas_missing": {
        "rule_id": "organization_sameas_missing",
        "name": "Organization Missing sameAs Social Links",
        "category": "Schema",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Organization schema missing sameAs social links",
        "scorable": True
    },
    
    "organization_sameas_no_social": {
        "rule_id": "organization_sameas_no_social",
        "name": "Organization sameAs Has No Social Media",
        "category": "Schema",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Organization sameAs has no social media URLs",
        "scorable": True
    },
    
    "organization_eeat_missing": {
        "rule_id": "organization_eeat_missing",
        "name": "Organization Missing E-E-A-T Signals",
        "category": "Schema",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Organization schema missing founder/foundingDate",
        "scorable": True
    },
    
    "localbusiness_required_missing": {
        "rule_id": "localbusiness_required_missing",
        "name": "LocalBusiness Missing Required Fields",
        "category": "Schema",
        "severity": "high",
        "applies_to": ["page"],
        "description": "LocalBusiness schema missing required fields",
        "scorable": True
    },
    
    "localbusiness_country_invalid": {
        "rule_id": "localbusiness_country_invalid",
        "name": "LocalBusiness Invalid Country Code",
        "category": "International",
        "severity": "high",
        "applies_to": ["page"],
        "description": "Invalid addressCountry (appears to be ZIP code)",
        "scorable": True
    },
    
    "localbusiness_country_format": {
        "rule_id": "localbusiness_country_format",
        "name": "LocalBusiness Country Format Incorrect",
        "category": "International",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "addressCountry format incorrect",
        "scorable": True
    },
    
    "faq_schema_missing": {
        "rule_id": "faq_schema_missing",
        "name": "FAQ Schema Missing",
        "category": "Schema",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Page content suggests FAQ schema could be beneficial",
        "scorable": True
    },
    
    "breadcrumb_schema_missing": {
        "rule_id": "breadcrumb_schema_missing",
        "name": "Breadcrumb Schema Missing",
        "category": "Schema",
        "severity": "low",
        "applies_to": ["page"],
        "description": "Navigation found but no BreadcrumbList schema",
        "scorable": True
    },
    
    "review_schema_missing": {
        "rule_id": "review_schema_missing",
        "name": "Review Schema Missing",
        "category": "Schema",
        "severity": "medium",
        "applies_to": ["page"],
        "description": "Testimonials found but no Review/AggregateRating schema",
        "scorable": True
    }
}

# Read-only helper functions for rule metadata
def get_rule(rule_id):
    """Get rule metadata by rule_id."""
    return SEO_RULES.get(rule_id)

def get_all_rules():
    """Get all rule definitions."""
    return SEO_RULES.copy()

def get_rules_by_category(category):
    """Get all rules in a specific category."""
    return {
        rule_id: rule
        for rule_id, rule in SEO_RULES.items()
        if rule.get("category") == category
    }

def get_rules_by_severity(severity):
    """Get all rules with a specific severity."""
    return {
        rule_id: rule
        for rule_id, rule in SEO_RULES.items()
        if rule.get("severity") == severity
    }

def get_scorable_rules():
    """Get all rules that are scorable."""
    return {
        rule_id: rule
        for rule_id, rule in SEO_RULES.items()
        if rule.get("scorable") is True
    }

def rule_exists(rule_id):
    """Check if a rule exists in the registry."""
    return rule_id in SEO_RULES

# Rule categories for reference
CATEGORIES = {
    "Content": "Content-related SEO issues",
    "Technical": "Technical SEO issues",
    "Accessibility": "Accessibility issues",
    "Performance": "Performance issues",
    "Social": "Social media optimization",
    "Schema": "Structured data and schema issues",
    "International": "International and localization issues",
    "Tracking": "Analytics and tracking issues"
}

# Severity levels for reference
SEVERITY_LEVELS = {
    "high": "Critical issues that should be fixed immediately",
    "medium": "Important issues that should be addressed soon",
    "low": "Minor issues that can be improved over time"
}
