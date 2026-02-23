"""Configuration constants and shared data for the Python worker service."""

# User agents for web requests
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
]

# Enterprise-grade social domain mapping
SOCIAL_DOMAINS = {
    "facebook.com": "facebook",
    "instagram.com": "instagram",
    "linkedin.com": "linkedin",
    "twitter.com": "twitter",
    "x.com": "twitter",
    "youtube.com": "youtube",
    "pinterest.com": "pinterest",
    "tiktok.com": "tiktok"
}

# Critical meta tags for SEO validation
CRITICAL_META_TAGS = ["description", "viewport", "theme-color", "robots"]

# Content selectors for finding main content area
CONTENT_SELECTORS = [
    "main", "article", "[role='main']", 
    ".content", ".main-content", "#content", "#main"
]

# International content indicators
INTERNATIONAL_SIGNALS = ["international", "global", "worldwide", "uk", "usa", "dubai", "australia", "canada"]

# FAQ content indicators
FAQ_INDICATORS = ["faq", "frequently asked questions", "questions", "what is", "how do", "services", "about"]

# Testimonial content indicators
TESTIMONIAL_INDICATORS = ["testimonial", "review", "rating", "stars", "client said", "customer feedback"]

# Social media domains for Organization schema validation
SOCIAL_DOMAINS_FOR_SCHEMA = ["facebook.com", "instagram.com", "linkedin.com", "twitter.com", "youtube.com"]

# Required fields for LocalBusiness schema
LOCALBUSINESS_REQUIRED_FIELDS = ["name", "description", "address"]

# Other tracking indicators
OTHER_TRACKING_INDICATORS = [
    'hotjar', 'mixpanel', 'segment', 'analytics', 'tracking', 'pixel',
    'adwords', 'doubleclick', 'googleads', 'bingads', 'twitterpixel'
]

# Social media content indicators for Facebook Pixel recommendation
SOCIAL_MEDIA_INDICATORS = ["facebook", "instagram", "social media", "marketing", "advertising"]

# Screenshot functionality configuration for PAGE_SCRAPING
ENABLE_PAGE_SCREENSHOTS = True
SCREENSHOT_STORAGE_PATH = "./screenshots"
MAX_SCREENSHOTS_PER_JOB = 300
