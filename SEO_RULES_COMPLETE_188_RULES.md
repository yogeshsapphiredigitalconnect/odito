# SEO Pipeline Rules - Complete List (188 Rules)

## Title Tag Rules (1–20)

### 1. Rule: TITLE_EMPTY (Rule No: 1)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Title tag must not be empty
- **Check:** Validates that the page has a non-empty title tag
- **Expected Value:** A descriptive page title

### 2. Rule: TITLE_MULTIPLE (Rule No: 2)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Exactly one title tag per page
- **Status:** DISABLED - Cannot be implemented with current normalized data structure

### 3. Rule: TITLE_LENGTH (Rule No: 3)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Title length should be between 10 and 70 characters
- **Check:** Validates title length is within 10–70 character range
- **Expected Value:** 10–70 characters

### 4. Rule: TITLE_SINGLE_WORD (Rule No: 4)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Title should not be a single word
- **Check:** Ensures title contains multiple words
- **Expected Value:** Multi-word descriptive title

### 5. Rule: TITLE_ALL_CAPS (Rule No: 5)
- **Category:** Title Tag
- **Severity:** Medium
- **Description:** Title should not be all uppercase
- **Check:** Detects if entire title is in uppercase
- **Expected Value:** Use sentence case or title case

### 6. Rule: TITLE_EXCESSIVE_PUNCTUATION (Rule No: 6)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Title should not contain excessive punctuation
- **Check:** Detects repeated punctuation marks (!! or ??)
- **Expected Value:** Avoid repeated !! or ??

### 7. Rule: TITLE_LEADING_TRAILING_SEPARATOR (Rule No: 7)
- **Category:** Title Tag
- **Severity:** Medium
- **Description:** Title should not start or end with separators
- **Check:** Validates title doesn't begin/end with -, |, or —
- **Expected Value:** Remove leading/trailing separators

### 8. Rule: TITLE_GENERIC_PHRASE (Rule No: 8)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Title should not use generic phrases
- **Check:** Detects common generic phrases (home, welcome, page, etc.)
- **Expected Value:** Use specific, descriptive phrases

### 9. Rule: TITLE_NUMBERS (Rule No: 9)
- **Category:** Title Tag
- **Severity:** Medium
- **Description:** Avoid unnecessary numbers in title
- **Check:** Detects excessive or irrelevant numbers in title
- **Expected Value:** Use meaningful numbers only

### 10. Rule: TITLE_CONTAINS_KEYWORD (Rule No: 10)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Title must include primary keyword
- **Check:** Validates primary keyword is present in title
- **Expected Value:** Include target keyword

### 11. Rule: TITLE_KEYWORD_EARLY (Rule No: 11)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Primary keyword should appear early in title
- **Check:** Validates keyword appears in first 30% of title
- **Expected Value:** Keyword at beginning

### 12. Rule: TITLE_KEYWORD_STUFFING (Rule No: 12)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Avoid keyword stuffing in title
- **Check:** Detects excessive keyword repetition
- **Expected Value:** Natural keyword usage

### 13. Rule: TITLE_VOICE_SEARCH (Rule No: 13)
- **Category:** Title Tag
- **Severity:** Info
- **Description:** Title could be optimized for voice search (question format)
- **Check:** Suggests question-based titles for voice queries
- **Expected Value:** Consider question format

### 14. Rule: TITLE_NON_DESCRIPTIVE (Rule No: 14)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Avoid vague, non-descriptive titles
- **Check:** Detects generic or unclear titles
- **Expected Value:** Use descriptive, specific titles

### 15. Rule: TITLE_OG_ALIGNMENT (Rule No: 15)
- **Category:** Title Tag
- **Severity:** Medium
- **Description:** Title should align with OG title
- **Check:** Validates 50%+ word overlap with og:title
- **Expected Value:** Consistent social sharing titles

### 16. Rule: TITLE_READABILITY (Rule No: 16)
- **Category:** Title Tag
- **Severity:** Medium
- **Description:** Title should be readable and scannable (≤10 words)
- **Check:** Validates title word count
- **Expected Value:** ≤10 words

### 17. Rule: TITLE_CLICKBAIT (Rule No: 17)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Avoid clickbait language in title
- **Check:** Detects clickbait phrases and patterns
- **Expected Value:** Use professional, informative language

### 18. Rule: TITLE_FILLER_WORDS (Rule No: 18)
- **Category:** Title Tag
- **Severity:** Medium
- **Description:** Avoid filler words in title
- **Check:** Detects unnecessary filler words
- **Expected Value:** Remove filler words

### 19. Rule: TITLE_HTML_TAGS (Rule No: 19)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Title should not contain HTML tags
- **Check:** Detects HTML tags in title content
- **Expected Value:** Remove HTML from title

### 20. Rule: TITLE_URL_LIKE (Rule No: 20)
- **Category:** Title Tag
- **Severity:** High
- **Description:** Title should not look like a URL/link
- **Check:** Detects URL-like patterns in title
- **Expected Value:** Use descriptive text, not URLs

---

## Meta Description Rules (21–25)

### 21. Rule: META_DESC_EMPTY (Rule No: 21)
- **Category:** Meta Description
- **Severity:** High
- **Description:** Meta description must not be empty
- **Check:** Validates meta description exists
- **Expected Value:** A compelling meta description (50–160 characters)

### 22. Rule: META_DESC_LENGTH (Rule No: 22)
- **Category:** Meta Description
- **Severity:** High
- **Description:** Meta description length should be 50–160 characters
- **Check:** Validates description length is within optimal range
- **Expected Value:** 50–160 characters

### 23. Rule: META_DESC_MISSING_KEYWORD (Rule No: 23)
- **Category:** Meta Description
- **Severity:** High
- **Description:** Meta description must include primary keyword
- **Check:** Checks if primary keyword is present in description
- **Expected Value:** Include the target keyword

### 24. Rule: META_DESC_FILLER_WORDS (Rule No: 24)
- **Category:** Meta Description
- **Severity:** Medium
- **Description:** Avoid filler words in meta description
- **Check:** Detects filler words (best, top, amazing, awesome, etc.)
- **Expected Value:** Remove filler words

---

## Meta Keywords Rules (26–28)

### 25. Rule: META_KEYWORDS_COUNT (Rule No: 26)
- **Category:** Meta Keywords
- **Severity:** Medium
- **Description:** Meta keywords should be reasonable (1–10)
- **Check:** Validates keyword count is not excessive
- **Expected Value:** 1–10 keywords recommended

### 26. Rule: META_KEYWORDS_INCLUDES_PRIMARY (Rule No: 27)
- **Category:** Meta Keywords
- **Severity:** Medium
- **Description:** Meta keywords should include primary keyword
- **Check:** Ensures primary keyword is in meta keywords
- **Expected Value:** Include primary keyword in keywords list

### 27. Rule: META_KEYWORDS_HTML_TAGS (Rule No: 28)
- **Category:** Meta Keywords
- **Severity:** High
- **Description:** Meta keywords should not contain HTML tags
- **Check:** Detects HTML tags in keyword field
- **Expected Value:** Remove HTML from keywords

---

## Language & Meta Rules (31–42)

### 28. Rule: LANG_META_VALID_CODE (Rule No: 31)
- **Category:** Language
- **Severity:** High
- **Description:** HTML lang attribute must be a valid ISO 639-1 code
- **Check:** Validates language code against ISO 639-1 standard
- **Expected Value:** Use valid ISO 639-1 code (e.g., en, fr, de)

### 29. Rule: LANG_META_TAG_NAME (Rule No: 33)
- **Category:** Language
- **Severity:** High
- **Description:** Language information presentation
- **Check:** Validates proper language meta tag structure

### 30. Rule: CHARSET_PRESENT (Rule No: 34)
- **Category:** Technical
- **Severity:** High
- **Description:** Charset meta tag must be present
- **Check:** Validates presence of charset declaration
- **Expected Value:** <meta charset="UTF-8">

### 31. Rule: CHARSET_VALID (Rule No: 35)
- **Category:** Technical
- **Severity:** High
- **Description:** Charset should be valid encoding (UTF-8 preferred)
- **Check:** Validates charset encoding
- **Expected Value:** Use UTF-8 encoding

### 32. Rule: CHARSET_FORMAT (Rule No: 36)
- **Category:** Technical
- **Severity:** High
- **Description:** Charset should use meta[charset] format
- **Check:** Validates modern charset declaration format
- **Expected Value:** <meta charset="UTF-8"> format

### 33. Rule: ROBOTS_META_PRESENT (Rule No: 37)
- **Category:** Technical
- **Severity:** Info
- **Description:** Robots meta tag should be present
- **Check:** Validates presence of robots meta tag
- **Expected Value:** Add robots meta tag

### 34. Rule: ROBOTS_META_NOT_EMPTY (Rule No: 38)
- **Category:** Technical
- **Severity:** High
- **Description:** Robots meta tag content must not be empty
- **Check:** Validates robots meta has content
- **Expected Value:** Add robots directives

### 35. Rule: ROBOTS_META_VALID (Rule No: 39)
- **Category:** Technical
- **Severity:** High
- **Description:** All robots directives must be valid
- **Check:** Validates robots meta directives
- **Expected Value:** Use valid robots directives

### 36. Rule: ROBOTS_META_NO_CONFLICTS (Rule No: 40)
- **Category:** Technical
- **Severity:** High
- **Description:** No conflicting robots directives
- **Check:** Detects conflicting robots meta values
- **Expected Value:** Remove conflicting directives

### 37. Rule: AUTHOR_META_PRESENT (Rule No: 41)
- **Category:** Technical
- **Severity:** Info
- **Description:** Author meta tag should be present
- **Check:** Validates presence of author meta tag
- **Expected Value:** Add author meta tag

### 38. Rule: AUTHOR_META_LENGTH (Rule No: 42)
- **Category:** Technical
- **Severity:** Low
- **Description:** Author name should be ≤100 characters
- **Check:** Validates author meta length
- **Expected Value:** ≤100 characters

---

## Canonical URL Rules (43–48)

### 39. Rule: CANONICAL_PRESENT (Rule No: 43)
- **Category:** Technical
- **Severity:** High
- **Description:** Canonical URL must be present
- **Check:** Validates presence of canonical link
- **Expected Value:** `<link rel="canonical" href="...">`

### 40. Rule: CANONICAL_VALID_URL (Rule No: 44)
- **Category:** Technical
- **Severity:** High
- **Description:** Canonical must be a valid URL
- **Check:** Validates URL format and structure
- **Expected Value:** Valid absolute URL

### 41. Rule: CANONICAL_HTTPS (Rule No: 45)
- **Category:** Technical
- **Severity:** High
- **Description:** Canonical URL should use HTTPS
- **Check:** Detects HTTP canonical URLs
- **Expected Value:** Use HTTPS for canonical URL

### 42. Rule: CANONICAL_NO_QUERY_PARAMS (Rule No: 46)
- **Category:** Technical
- **Severity:** High
- **Description:** Canonical URL should not have query params or fragments
- **Check:** Detects ? and # in canonical URL
- **Expected Value:** Remove ? and # from canonical

### 43. Rule: CANONICAL_MATCHES_PAGE (Rule No: 47)
- **Category:** Technical
- **Severity:** High
- **Description:** Canonical URL should match page URL
- **Check:** Validates canonical matches current page URL
- **Expected Value:** Expected: page URL

### 44. Rule: CANONICAL_CONSISTENT_WWW (Rule No: 48)
- **Category:** Technical
- **Severity:** Medium
- **Description:** Canonical URL should be consistent with www/non-www
- **Check:** Validates www consistency between canonical and page
- **Expected Value:** Consistent www/non-www

---

## Open Graph Rules (49–56, 71–73, 128–130, 148)

### 45. Rule: OG_TITLE_EXISTS (Rule No: 49)
- **Category:** Social
- **Severity:** High
- **Description:** og:title must exist
- **Check:** Validates presence of og:title meta property
- **Expected Value:** Add og:title meta property

### 46. Rule: OG_DESCRIPTION_EXISTS (Rule No: 50)
- **Category:** Social
- **Severity:** High
- **Description:** og:description must exist
- **Check:** Validates presence of og:description meta property
- **Expected Value:** Add og:description meta property

### 47. Rule: OG_IMAGE_EXISTS (Rule No: 51)
- **Category:** Social
- **Severity:** High
- **Description:** og:image must exist
- **Check:** Validates presence of og:image meta property
- **Expected Value:** Add og:image meta property

### 48. Rule: OG_URL_EXISTS (Rule No: 52)
- **Category:** Social
- **Severity:** High
- **Description:** og:url must exist
- **Check:** Validates presence of og:url meta property
- **Expected Value:** Add og:url meta property

### 49. Rule: OG_TYPE_EXISTS (Rule No: 53)
- **Category:** Social
- **Severity:** High
- **Description:** og:type must exist
- **Check:** Validates presence of og:type meta property
- **Expected Value:** Add og:type (e.g., website, article)

### 50. Rule: OG_TITLE_MATCHES_PAGE (Rule No: 54)
- **Category:** Social
- **Severity:** Medium
- **Description:** og:title should match page title
- **Check:** Validates 50%+ word overlap between og:title and page title
- **Expected Value:** Should closely match page title

### 51. Rule: OG_CONTAINS_KEYWORD (Rule No: 55)
- **Category:** Social
- **Severity:** Medium
- **Description:** OG tags should contain primary keyword
- **Check:** Validates primary keyword in og:title or og:description
- **Expected Value:** Include: keyword

### 52. Rule: OG_VALID_URLS (Rule No: 56)
- **Category:** Social
- **Severity:** High
- **Description:** OG URLs should be valid and use HTTPS
- **Check:** Validates og:image and og:url are valid HTTPS URLs
- **Expected Value:** Use valid HTTPS URLs

### 53. Rule: PINTEREST_MEDIA_PRESENT (Rule No: 71)
- **Category:** Social
- **Severity:** Info
- **Description:** pin:media should be present
- **Check:** Validates Pinterest media tag exists
- **Expected Value:** Add pin:media for Pinterest sharing

### 54. Rule: PINTEREST_DESCRIPTION_PRESENT (Rule No: 72)
- **Category:** Social
- **Severity:** Info
- **Description:** pin:description should be present
- **Check:** Validates Pinterest description exists
- **Expected Value:** Add pin:description for Pinterest sharing

### 55. Rule: PINTEREST_URL_MATCH (Rule No: 73)
- **Category:** Social
- **Severity:** Medium
- **Description:** pin:url should match page URL
- **Check:** Validates pin:url matches current page URL
- **Expected Value:** Expected: page URL

### 56. Rule: PINTEREST_MEDIA_VALID_URL (Rule No: 128)
- **Category:** Social
- **Severity:** High
- **Description:** pin:media must be a valid image URL
- **Check:** Validates Pinterest media is valid image URL

### 57. Rule: PINTEREST_DESCRIPTION_KEYWORD (Rule No: 129)
- **Category:** Social
- **Severity:** Medium
- **Description:** pin:description should contain keyword
- **Check:** Validates keyword in Pinterest description
- **Expected Value:** Include target keyword

### 58. Rule: PINTEREST_ALL_VALID (Rule No: 130)
- **Category:** Social
- **Severity:** High
- **Description:** All Pinterest tags should be valid
- **Check:** Validates all Pinterest meta tags
- **Expected Value:** Ensure all Pinterest tags are properly formatted

### 59. Rule: SOCIAL_SHARING_OPTIMIZED (Rule No: 148)
- **Category:** Social
- **Severity:** High
- **Description:** Social sharing optimized (OG + Twitter card)
- **Check:** Validates comprehensive social meta tags
- **Expected Value:** Add Twitter Card tags alongside OG

---

## Schema.org Core Rules (57–61, 122–125, 189–193)

### 60. Rule: SCHEMA_JSONLD_PRESENT (Rule No: 57)
- **Category:** Schema
- **Severity:** High
- **Description:** JSON-LD structured data must be present
- **Check:** Validates presence of JSON-LD schema
- **Expected Value:** Add JSON-LD schema markup

### 61. Rule: SCHEMA_VALID_CONTEXT (Rule No: 58)
- **Category:** Schema
- **Severity:** High
- **Description:** Schema @context must be valid
- **Check:** Validates @context is https://schema.org
- **Expected Value:** https://schema.org

### 62. Rule: SCHEMA_VALID_TYPE (Rule No: 59)
- **Category:** Schema
- **Severity:** High
- **Description:** Schema @type must be valid
- **Check:** Validates presence and validity of @type field
- **Expected Value:** Add valid @type to schema

### 63. Rule: SCHEMA_URL_MATCHES_PAGE (Rule No: 60)
- **Category:** Schema
- **Severity:** High
- **Description:** Schema URL should match page URL
- **Check:** Validates schema URL matches current page URL
- **Expected Value:** Expected: page URL

### 64. Rule: SCHEMA_NAME_ALIGNS_TITLE (Rule No: 61)
- **Category:** Schema
- **Severity:** High
- **Description:** Schema name should align with page title
- **Check:** Validates 30%+ word overlap between schema name and title
- **Expected Value:** Should reflect: page title

### 65. Rule: SCHEMA_LOCALBIZ_PHONE (Rule No: 122)
- **Category:** Schema
- **Severity:** High
- **Description:** LocalBusiness telephone should be present
- **Check:** Validates telephone in LocalBusiness schema
- **Expected Value:** Add telephone to LocalBusiness

### 66. Rule: SCHEMA_LOCALBIZ_ADDRESS (Rule No: 123)
- **Category:** Schema
- **Severity:** High
- **Description:** LocalBusiness address should be present
- **Check:** Validates address in LocalBusiness schema
- **Expected Value:** Add PostalAddress to LocalBusiness

### 67. Rule: SCHEMA_IMAGE_VALID (Rule No: 124)
- **Category:** Schema
- **Severity:** High
- **Description:** Schema image should be valid URL + HTTPS
- **Check:** Validates schema image is valid HTTPS URL
- **Expected Value:** Use valid HTTPS image URL

### 68. Rule: SCHEMA_DESCRIPTION_KEYWORD (Rule No: 125)
- **Category:** Schema
- **Severity:** Medium
- **Description:** Schema description should contain keyword
- **Check:** Validates keyword in schema description
- **Expected Value:** Include: keyword

### 69. Rule: SCHEMA_TYPE_NOT_DEPRECATED (Rule No: 189)
- **Category:** Schema
- **Severity:** High
- **Description:** Schema @type must not be deprecated
- **Check:** Validates schema type is not deprecated
- **Expected Value:** Use supported schema types

### 70. Rule: SCHEMA_NO_DUPLICATE_FORMATS (Rule No: 190)
- **Category:** Schema
- **Severity:** High
- **Description:** No duplicate schema formats (JSON-LD + Microdata)
- **Check:** Detects duplicate schema types
- **Expected Value:** Use single schema format

### 71. Rule: SCHEMA_BREADCRUMBLIST (Rule No: 191)
- **Category:** Schema
- **Severity:** High
- **Description:** BreadcrumbList schema should be present for navigation
- **Check:** Validates BreadcrumbList structured data
- **Expected Value:** Add BreadcrumbList schema

### 72. Rule: SCHEMA_ARTICLE_DATE (Rule No: 192)
- **Category:** Schema
- **Severity:** High
- **Description:** Article/BlogPosting schema should have datePublished
- **Check:** Validates datePublished in article schema
- **Expected Value:** Add datePublished to articles

### 73. Rule: SCHEMA_FAQ_PAGE (Rule No: 193)
- **Category:** Schema
- **Severity:** Medium
- **Description:** FAQPage schema where relevant
- **Check:** Suggests FAQ schema for FAQ content
- **Expected Value:** Consider FAQPage schema

---

## Apple Touch Icons (62–65)

### 74. Rule: APPLE_TOUCH_ICON_PRESENT (Rule No: 62)
- **Category:** Technical
- **Severity:** Medium
- **Description:** Apple touch icon should be present
- **Check:** Validates presence of apple-touch-icon meta tag
- **Expected Value:** `<link rel="apple-touch-icon" href="...">`

### 75. Rule: APPLE_TOUCH_ICON_VALID_URL (Rule No: 63)
- **Category:** Technical
- **Severity:** High
- **Description:** Apple touch icon must have valid URL
- **Check:** Validates icon URL is valid and accessible
- **Expected Value:** Use valid URL for icon

### 76. Rule: APPLE_TOUCH_ICON_SIZE (Rule No: 64)
- **Category:** Technical
- **Severity:** Medium
- **Description:** Apple touch icon should use recommended sizes
- **Status:** DISABLED - Current data structure limitation

### 77. Rule: APPLE_TOUCH_ICON_MULTIPLE_SIZES (Rule No: 65)
- **Category:** Technical
- **Severity:** Medium
- **Description:** Multiple icon sizes should be declared
- **Check:** Validates multiple apple-touch-icon sizes
- **Expected Value:** Declare multiple sizes (180×180, 120×120, etc.)

---

## International (Hreflang) Rules (66–70, 126–127, 147)

### 78. Rule: HREFLANG_PRESENT (Rule No: 66)
- **Category:** International
- **Severity:** Info
- **Description:** Hreflang tags should be present for multilingual sites
- **Check:** Validates presence of hreflang tags
- **Expected Value:** Add hreflang for multilingual content

### 79. Rule: HREFLANG_SELF_REFERENCE (Rule No: 67)
- **Category:** International
- **Severity:** High
- **Description:** Self-referencing hreflang URL should be present
- **Check:** Validates current page has self-referencing hreflang
- **Expected Value:** Add hreflang pointing to this page

### 80. Rule: HREFLANG_X_DEFAULT (Rule No: 68)
- **Category:** International
- **Severity:** High
- **Description:** x-default hreflang should be present
- **Check:** Validates x-default hreflang exists
- **Expected Value:** Add x-default hreflang

### 81. Rule: HREFLANG_VALID_LANG_CODE (Rule No: 69)
- **Category:** International
- **Severity:** High
- **Description:** Hreflang must use valid language code or x-default
- **Check:** Validates ISO 639-1 language codes
- **Expected Value:** Use valid ISO 639-1 code or x-default

### 82. Rule: HREFLANG_VALID_URL (Rule No: 70)
- **Category:** International
- **Severity:** High
- **Description:** Each hreflang must have a valid URL
- **Check:** Validates each hreflang href is a valid URL
- **Expected Value:** Use valid absolute URL

### 83. Rule: HREFLANG_INCLUDES_TARGET_LANGS (Rule No: 126)
- **Category:** International
- **Severity:** Medium
- **Description:** Hreflang should include target languages
- **Check:** Validates at least one target language declared
- **Expected Value:** Add language-specific hreflang tags

### 84. Rule: HREFLANG_ALL_VALID (Rule No: 127)
- **Category:** International
- **Severity:** High
- **Description:** All hreflang tags must be valid
- **Check:** Validates each hreflang has both lang and href
- **Expected Value:** Each hreflang must have both lang and href

### 85. Rule: MULTILINGUAL_SUPPORT (Rule No: 147)
- **Category:** International
- **Severity:** Medium
- **Description:** Page should support multilingual (hreflang + lang)
- **Check:** Validates presence of lang attribute or hreflang tags
- **Expected Value:** Add html lang and/or hreflang tags

---

## Image Rules (74–83, 131–133)

### 86. Rule: IMAGES_PRESENT (Rule No: 74)
- **Category:** Images
- **Severity:** Medium
- **Description:** Images should be present on page
- **Check:** Validates page has at least one image
- **Expected Value:** At least 1 image recommended

### 87. Rule: IMAGES_COUNT (Rule No: 75)
- **Category:** Images
- **Severity:** Medium
- **Description:** Reasonable total image count (≤50)
- **Check:** Validates image count doesn't exceed 50
- **Expected Value:** ≤50 images recommended

### 88. Rule: IMAGES_MODERN_FORMAT (Rule No: 76)
- **Category:** Images
- **Severity:** High
- **Description:** Use modern image formats (WebP, SVG, AVIF)
- **Check:** Detects legacy image formats (JPG, PNG, GIF, etc.)
- **Expected Value:** Use WebP, SVG, or AVIF

### 89. Rule: IMAGES_VALID_URL (Rule No: 77)
- **Category:** Images
- **Severity:** High
- **Description:** Every image must have a valid URL
- **Check:** Validates all images have src URL
- **Expected Value:** All images must have valid src

### 90. Rule: IMAGES_HTTPS (Rule No: 78)
- **Category:** Images
- **Severity:** High
- **Description:** Every image should use HTTPS
- **Check:** Detects HTTP image URLs
- **Expected Value:** All images should use HTTPS

### 91. Rule: IMAGES_ALT_MEANINGFUL (Rule No: 79)
- **Category:** Images
- **Severity:** High
- **Description:** Alt text should be meaningful
- **Check:** Detects meaningless alt text (image, photo, pic, etc.)
- **Expected Value:** Use descriptive alt text

### 92. Rule: IMAGES_ALT_KEYWORD (Rule No: 80)
- **Category:** Images
- **Severity:** High
- **Description:** Alt text should contain keyword
- **Check:** Validates primary keyword in at least one image alt
- **Expected Value:** Include: keyword

### 93. Rule: IMAGES_DIMENSIONS (Rule No: 81)
- **Category:** Images
- **Severity:** High
- **Description:** Width & height attributes should be present
- **Check:** Validates all images have width and height
- **Expected Value:** All images should have width and height

### 94. Rule: IMAGES_OPTIMIZED_SIZE (Rule No: 82)
- **Category:** Images
- **Severity:** High
- **Description:** Images should be optimized for file size
- **Check:** Validates image file sizes are optimized
- **Expected Value:** Optimize image file sizes

### 95. Rule: IMAGES_DUPLICATE_URL (Rule No: 83)
- **Category:** Images
- **Severity:** High
- **Description:** Images should not be duplicated
- **Check:** Detects duplicate image URLs

### 96. Rule: IMAGES_LAZY_LOADING (Rule No: 131)
- **Category:** Images
- **Severity:** High
- **Description:** Non-critical images should use lazy loading
- **Check:** Validates loading="lazy" on appropriate images
- **Expected Value:** Add lazy loading to below-fold images

### 97. Rule: IMAGES_ROLE_ATTRIBUTE (Rule No: 132)
- **Category:** Images
- **Severity:** Medium
- **Description:** Images should have role attribute
- **Check:** Validates role attribute on decorative images
- **Expected Value:** Add role="presentation" to decorative images

### 98. Rule:_IMAGES_RECLASSIFY_OTHER (Rule No: 133)
- **Category:** Images
- **Severity:** Low
- **Description:** Images categorized as 'other' should be reclassified
- **Check:** Identifies images needing better categorization
- **Expected Value:** Use specific image categories

---

## Heading Rules (84–121, 141, 229)

### 99. Rule: H1_EXACTLY_ONE (Rule No: 84)
- **Category:** Headings
- **Severity:** High
- **Description:** Exactly one H1 per page
- **Check:** Validates page has exactly 1 H1 tag
- **Expected Value:** Exactly 1 H1 tag

### 100. Rule: H1_LENGTH (Rule No: 85)
- **Category:** Headings
- **Severity:** High
- **Description:** H1 length should be 20–70 characters
- **Check:** Validates H1 length is within range
- **Expected Value:** 20–70 characters

### 101. Rule: H1_KEYWORD_BEGINNING (Rule No: 87)
- **Category:** Headings
- **Severity:** High
- **Description:** Primary keyword should be at beginning of H1
- **Check:** Validates keyword appears in first 30% of H1
- **Expected Value:** Keyword at beginning

### 102. Rule: H1_READABILITY (Rule No: 92)
- **Category:** Headings
- **Severity:** Medium
- **Description:** H1 should be readable (≤10 words)
- **Check:** Validates H1 has 10 or fewer words
- **Expected Value:** ≤10 words

### 103. Rule: H1_CONTAINS_KEYWORD (Rule No: 90)
- **Category:** Headings
- **Severity:** High
- **Description:** H1 must contain primary keyword
- **Check:** Validates primary keyword is in H1
- **Expected Value:** Include keyword: keyword

### 104. Rule: H2_COUNT (Rule No: 94)
- **Category:** Headings
- **Severity:** High
- **Description:** H2 count should be reasonable (0–10)
- **Check:** Validates H2 count doesn't exceed 10
- **Expected Value:** 0–10 H2 tags

### 105. Rule: H2_CONTAINS_KEYWORD (Rule No: 95)
- **Category:** Headings
- **Severity:** High
- **Description:** H2 should contain secondary keyword
- **Check:** Validates secondary/primary keyword in at least one H2
- **Expected Value:** Include: keyword

### 106. Rule: H2_LENGTH (Rule No: 96)
- **Category:** Headings
- **Severity:** Medium
- **Description:** H2 length should be 10–80 characters
- **Check:** Validates H2 length is within range
- **Expected Value:** 10–80 characters

### 107. Rule: H2_EMPTY (Rule No: 97)
- **Category:** Headings
- **Severity:** High
- **Description:** H2 should not be empty
- **Check:** Detects empty H2 tags
- **Expected Value:** All H2 tags should have text

### 108. Rule: H2_DUPLICATE (Rule No: 98)
- **Category:** Headings
- **Severity:** High
- **Description:** H2 tags should be unique
- **Check:** Detects duplicate H2 text
- **Expected Value:** H2 tags should be unique

### 109. Rule: H3_COUNT (Rule No: 99)
- **Category:** Headings
- **Severity:** Medium
- **Description:** H3 count should be reasonable (0–15)
- **Check:** Validates H3 count doesn't exceed 15
- **Expected Value:** 0–15 H3 tags

### 110. Rule: H3_LENGTH (Rule No: 100)
- **Category:** Headings
- **Severity:** Medium
- **Description:** H3 length should be 8–70 characters
- **Check:** Validates H3 length is within range
- **Expected Value:** 8–70 characters

### 111. Rule: H3_DUPLICATE (Rule No: 101)
- **Category:** Headings
- **Severity:** High
- **Description:** H3 tags should be unique
- **Check:** Detects duplicate H3 text
- **Expected Value:** H3 tags should be unique

### 112. Rule: H4_COUNT (Rule No: 102)
- **Category:** Headings
- **Severity:** Medium
- **Description:** H4 count should be reasonable (0–20)
- **Check:** Validates H4 count doesn't exceed 20
- **Expected Value:** 0–20

### 113. Rule: H4_LENGTH (Rule No: 103)
- **Category:** Headings
- **Severity:** Medium
- **Description:** H4 length should be 6–60 characters
- **Check:** Validates H4 length is within range
- **Expected Value:** 6–60 characters

### 114. Rule: H5_COUNT (Rule No: 104)
- **Category:** Headings
- **Severity:** Medium
- **Description:** H5 count should be reasonable (0–25)
- **Check:** Validates H5 count doesn't exceed 25
- **Expected Value:** 0–25

### 115. Rule: H5_LENGTH (Rule No: 105)
- **Category:** Headings
- **Severity:** Medium
- **Description:** H5 length should be 6–60 characters
- **Check:** Validates H5 length is within range
- **Expected Value:** 6–60 characters

### 116. Rule: H6_COUNT (Rule No: 106)
- **Category:** Headings
- **Severity:** Medium
- **Description:** H6 count should be reasonable (0–30)
- **Check:** Validates H6 count doesn't exceed 30
- **Expected Value:** 0–30

### 117. Rule: H6_LENGTH (Rule No: 107)
- **Category:** Headings
- **Severity:** Medium
- **Description:** H6 length should be 6–50 characters
- **Check:** Validates H6 length is within range
- **Expected Value:** 6–50 characters

### 118. Rule: HEADING_NO_EMPTY (Rule No: 108)
- **Category:** Headings
- **Severity:** High
- **Description:** No empty headings (H1–H6)
- **Check:** Detects any empty heading tags
- **Expected Value:** All headings should have text

### 119. Rule: HEADING_NO_HTML (Rule No: 109)
- **Category:** Headings
- **Severity:** High
- **Description:** No HTML tags inside any heading
- **Check:** Detects HTML tags within heading text
- **Expected Value:** Remove HTML from headings

### 120. Rule: HEADING_NOT_LINK (Rule No: 110)
- **Category:** Headings
- **Severity:** Medium
- **Description:** Headings should not be links
- **Check:** Detects URLs as heading text
- **Expected Value:** Use descriptive text, not URLs

### 121. Rule: HEADING_ALL_CAPS (Rule No: 111)
- **Category:** Headings
- **Severity:** Medium
- **Description:** Avoid ALL CAPS in any heading
- **Check:** Detects all-uppercase heading text
- **Expected Value:** Use sentence case

### 122. Rule: HEADING_EXCESSIVE_PUNCTUATION (Rule No: 112)
- **Category:** Headings
- **Severity:** High
- **Description:** Avoid excessive punctuation in headings
- **Check:** Detects repeated !! or ??
- **Expected Value:** Avoid repeated !! or ??

### 123. Rule: HEADING_GENERIC_PHRASE (Rule No: 113)
- **Category:** Headings
- **Severity:** High
- **Description:** Avoid generic phrases in headings
- **Check:** Detects generic phrases (home, about, contact, etc.)
- **Expected Value:** Use specific, descriptive headings

### 124. Rule: HEADING_INCLUDE_KEYWORD (Rule No: 114)
- **Category:** Headings
- **Severity:** High
- **Description:** Headings should include primary/secondary keyword
- **Check:** Validates keywords in at least one heading
- **Expected Value:** Include target keywords

### 125. Rule: HEADING_KEYWORD_EARLY (Rule No: 115)
- **Category:** Headings
- **Severity:** Medium
- **Description:** Keyword should appear early in headings
- **Check:** Validates keyword position in headings
- **Expected Value:** Place keywords early in headings

### 126. Rule: HEADING_KEYWORD_STUFFING (Rule No: 116)
- **Category:** Headings
- **Severity:** High
- **Description:** Avoid keyword stuffing in headings
- **Check:** Detects excessive keyword repetition
- **Expected Value:** Natural keyword usage

### 127. Rule: HEADING_VOICE_SEARCH (Rule No: 117)
- **Category:** Headings
- **Severity:** Info
- **Description:** Optimize headings for voice search
- **Check:** Suggests question-based headings
- **Expected Value:** Consider question format

### 128. Rule: HEADING_UNIQUE (Rule No: 118)
- **Category:** Headings
- **Severity:** High
- **Description:** All headings should be unique on page
- **Check:** Detects duplicate heading text across levels
- **Expected Value:** Unique heading text

### 129. Rule: HEADING_READABLE (Rule No: 119)
- **Category:** Headings
- **Severity:** Medium
- **Description:** Headings should be readable and scannable
- **Check:** Validates heading readability metrics
- **Expected Value:** Clear, scannable headings

### 130. Rule: HEADING_SENTENCE_CASE (Rule No: 120)
- **Category:** Headings
- **Severity:** Medium
- **Description:** Headings should maintain sentence case
- **Check:** Detects inconsistent capitalization
- **Expected Value:** Use consistent sentence case

### 131. Rule: HEADING_NO_CLICKBAIT (Rule No: 121)
- **Category:** Headings
- **Severity:** High
- **Description:** Headings should avoid clickbait and filler words
- **Check:** Detects clickbait patterns and filler words
- **Expected Value:** Professional, informative headings

### 132. Rule: H1_DIFFERENT_FROM_TITLE (Rule No: 141)
- **Category:** Headings
- **Severity:** Medium
- **Description:** H1 should differ from title tag (not identical)
- **Check:** Validates H1 is not identical to title tag
- **Expected Value:** H1 should complement, not duplicate title

### 133. Rule: HEADING_STRUCTURE_LOGICAL (Rule No: 229)
- **Category:** Headings
- **Severity:** High
- **Description:** Heading structure should be logical (no skipped levels)
- **Check:** Validates proper heading hierarchy
- **Expected Value:** Follow sequential heading levels

---

## URL Structure & Technical Rules (146, 149, 150, 152–154, 157–158, 167–168, 178–180)

### 134. Rule: URL_MAX_LENGTH (Rule No: 146)
- **Category:** Crawlability
- **Severity:** High
- **Description:** URL should be ≤200 characters
- **Check:** Validates URL length doesn't exceed 200 characters
- **Expected Value:** ≤200 characters

### 135. Rule: VIEWPORT_PRESENT (Rule No: 149)
- **Category:** Technical
- **Severity:** High
- **Description:** Viewport must be present for mobile-friendly page
- **Check:** Validates viewport meta tag with width=device-width
- **Expected Value:** `<meta name="viewport" content="width=device-width, initial-scale=1">`

### 136. Rule: URL_SEO_FRIENDLY (Rule No: 150)
- **Category:** Crawlability
- **Severity:** High
- **Description:** URL should be SEO-friendly (lowercase, hyphens, no special chars)
- **Check:** Validates lowercase, hyphens, no underscores/special chars
- **Expected Value:** Lowercase, hyphens, no special chars

### 137. Rule: URL_NO_QUERY_PARAMS (Rule No: 152)
- **Category:** Crawlability
- **Severity:** High
- **Description:** URL should avoid query parameters
- **Check:** Detects ? in URL
- **Expected Value:** Use clean URLs without ?params

### 138. Rule: URL_CONTAINS_KEYWORD (Rule No: 153)
- **Category:** Crawlability
- **Severity:** Medium
- **Description:** URL should contain primary keyword
- **Check:** Validates keyword appears in URL path
- **Expected Value:** Include: keyword-slug

### 139. Rule: URL_MAX_DEPTH (Rule No: 154)
- **Category:** Crawlability
- **Severity:** High
- **Description:** URL depth should be ≤4 levels
- **Check:** Validates URL path depth doesn't exceed 4 levels
- **Expected Value:** ≤4 directory levels

### 140. Rule: DOCTYPE_PRESENT (Rule No: 157)
- **Category:** Crawlability
- **Severity:** High
- **Description:** DOCTYPE declaration must be present
- **Check:** Validates presence of DOCTYPE
- **Expected Value:** <!DOCTYPE html>

### 141. Rule: THEME_COLOR_PRESENT (Rule No: 158)
- **Category:** Crawlability
- **Severity:** Low
- **Description:** Theme color should be declared
- **Check:** Validates theme-color meta tag exists
- **Expected Value:** `<meta name="theme-color" content="#...">`

### 142. Rule: INTERNAL_LINKS_MIN (Rule No: 167)
- **Category:** Crawlability
- **Severity:** High
- **Description:** Page should have ≥3 internal links
- **Check:** Validates minimum internal link count
- **Expected Value:** ≥3 internal links

### 143. Rule: INTERNAL_LINKS_MAX (Rule No: 168)
- **Category:** Crawlability
- **Severity:** High
- **Description:** Page should not have excessive internal links (≤100)
- **Check:** Validates maximum internal link count
- **Expected Value:** ≤100 internal links

### 144. Rule: CLICK_DEPTH (Rule No: 179)
- **Category:** Crawlability
- **Severity:** High
- **Description:** Click depth from homepage should be ≤3
- **Check:** Validates navigation depth
- **Expected Value:** ≤3 clicks from homepage

### 145. Rule: NOT_ORPHANED (Rule No: 180)
- **Category:** Crawlability
- **Severity:** High
- **Description:** Page should not be orphaned (0 inbound links)
- **Check:** Validates page has inbound links
- **Expected Value:** ≥1 inbound internal link

### 146. Rule: HTTPS_ENFORCED (Rule No: 178)
- **Category:** Technical
- **Severity:** High
- **Description:** HTTPS must be enforced site-wide
- **Check:** Detects HTTP pages
- **Expected Value:** Enforce HTTPS site-wide

---

## Robots.txt & Sitemap Rules (160–165)

### 147. Rule: ROBOTS_TXT_EXISTS (Rule No: 160)
- **Category:** Crawlability
- **Severity:** High
- **Description:** robots.txt must exist
- **Check:** Validates robots.txt file exists
- **Expected Value:** Create robots.txt at domain root

### 148. Rule: ROBOTS_TXT_NOT_BLOCK_IMPORTANT (Rule No: 161)
- **Category:** Crawlability
- **Severity:** High
- **Description:** robots.txt must not block important pages
- **Check:** Validates important pages aren't blocked
- **Expected Value:** Review Disallow rules

### 149. Rule: ROBOTS_TXT_SITEMAP_REF (Rule No: 162)
- **Category:** Crawlability
- **Severity:** High
- **Description:** robots.txt should reference sitemap
- **Check:** Validates Sitemap directive in robots.txt
- **Expected Value:** Add Sitemap: directive

### 150. Rule: SITEMAP_EXISTS (Rule No: 163)
- **Category:** Crawlability
- **Severity:** High
- **Description:** XML sitemap must exist
- **Check:** Validates sitemap.xml exists
- **Expected Value:** Create sitemap.xml

### 151. Rule: SITEMAP_VALID (Rule No: 164)
- **Category:** Crawlability
- **Severity:** High
- **Description:** Sitemap should return HTTP 200
- **Check:** Validates sitemap HTTP status code
- **Expected Value:** HTTP 200

### 152. Rule: SITEMAP_CONTAINS_PAGE (Rule No: 165)
- **Category:** Crawlability
- **Severity:** High
- **Description:** Current page should be listed in sitemap
- **Check:** Validates current page in sitemap

---

## Performance & Core Web Vitals (170–176)

### 153. Rule: LCP_GOOD (Rule No: 170)
- **Category:** Performance
- **Severity:** High
- **Description:** LCP should be ≤2.5 seconds
- **Check:** Validates Largest Contentful Paint metric
- **Expected Value:** ≤2.5 seconds

### 154. Rule: CLS_GOOD (Rule No: 171)
- **Category:** Performance
- **Severity:** High
- **Description:** CLS should be ≤0.1
- **Check:** Validates Cumulative Layout Shift metric
- **Expected Value:** ≤0.1

### 155. Rule: TBT_GOOD (Rule No: 172)
- **Category:** Performance
- **Severity:** High
- **Description:** TBT should be ≤200ms
- **Check:** Validates Total Blocking Time metric
- **Expected Value:** ≤200ms

### 156. Rule: PAGESPEED_SCORE (Rule No: 173)
- **Category:** Performance
- **Severity:** High
- **Description:** PageSpeed score should be ≥90
- **Check:** Validates PageSpeed Insights score
- **Expected Value:** ≥90

### 157. Rule: SPEED_INDEX (Rule No: 174)
- **Category:** Performance
- **Severity:** High
- **Description:** Speed Index should be ≤3.4s
- **Check:** Validates Speed Index metric
- **Expected Value:** ≤3.4 seconds

### 158. Rule: RENDER_BLOCKING (Rule No: 175)
- **Category:** Performance
- **Severity:** High
- **Description:** Minimize render-blocking resources (≤3)
- **Check:** Validates render-blocking resource count
- **Expected Value:** ≤3 render-blocking resources

### 159. Rule: MOBILE_FRIENDLY (Rule No: 176)
- **Category:** Performance
- **Severity:** High
- **Description:** Page must be mobile-friendly
- **Check:** Validates viewport meta tag
- **Expected Value:** width=device-width, initial-scale=1

---

## Content Quality Rules (184–188, 197, 200–201, 208–209)

### 160. Rule: WORD_COUNT_MIN (Rule No: 184)
- **Category:** Content
- **Severity:** High
- **Description:** Page should have ≥300 words
- **Check:** Validates minimum word count
- **Expected Value:** ≥300 words for content pages

### 161. Rule: WORD_COUNT_MAX (Rule No: 185)
- **Category:** Content
- **Severity:** Medium
- **Description:** Page should not have excessive word count (≤5000)
- **Check:** Validates maximum word count
- **Expected Value:** ≤5000 words per page

### 162. Rule: CONTENT_CONTAINS_KEYWORD (Rule No: 187)
- **Category:** Content
- **Severity:** High
- **Description:** Content should contain primary keyword
- **Check:** Validates keyword appears in page content
- **Expected Value:** Include: keyword

### 163. Rule: CONTENT_KEYWORD_DENSITY (Rule No: 188)
- **Category:** Content
- **Severity:** High
- **Description:** Keyword density should be 1–3%
- **Check:** Validates keyword density is within range
- **Expected Value:** 1–3%

### 164. Rule: SGE_OPTIMIZED (Rule No: 197)
- **Category:** Content
- **Severity:** Medium
- **Description:** Content should be optimized for AI/SGE
- **Check:** Validates structured data + headings + content length
- **Expected Value:** Schema + H2s + quality content

### 165. Rule: MIXED_CONTENT (Rule No: 200)
- **Category:** Security
- **Severity:** High
- **Description:** No mixed content (HTTP resources on HTTPS page)
- **Check:** Detects HTTP resources on HTTPS pages
- **Expected Value:** Use HTTPS for all resources

### 166. Rule: SECURITY_HEADERS (Rule No: 201)
- **Category:** Security
- **Severity:** High
- **Description:** Security headers should be present
- **Check:** Validates security headers (CSP, HSTS, etc.)
- **Expected Value:** Implement security headers

### 167. Rule: EEAT_AUTHOR_INFO (Rule No: 208)
- **Category:** Content
- **Severity:** High
- **Description:** Author information should be present for E-E-A-T
- **Check:** Validates author info is displayed
- **Expected Value:** Add author information

### 168. Rule: EEAT_CONTACT_INFO (Rule No: 209)
- **Category:** Content
- **Severity:** High
- **Description:** Contact information should be present for E-E-A-T
- **Check:** Validates contact info is available
- **Expected Value:** Add contact information

---

## Analytics & Tracking Rules (155–156)

### 169. Rule: ANALYTICS_PRESENT (Rule No: 155)
- **Category:** Tracking
- **Severity:** High
- **Description:** Analytics tracking should be present
- **Check:** Validates Google Analytics or similar
- **Expected Value:** Add analytics tracking

### 170. Rule: FB_PIXEL_PRESENT (Rule No: 156)
- **Category:** Tracking
- **Severity:** High
- **Description:** Facebook Pixel should be present if relevant
- **Check:** Validates Facebook Pixel implementation
- **Expected Value:** Add Facebook Pixel if using Facebook ads

---

## Accessibility Rules (213–236)

### 171. Rule: AXE_NO_VIOLATIONS (Rule No: 213)
- **Category:** Accessibility
- **Severity:** High
- **Description:** No axe accessibility violations
- **Check:** Validates axe accessibility test results
- **Expected Value:** Fix all accessibility violations

### 172. Rule: AXE_NO_CRITICAL (Rule No: 214)
- **Category:** Accessibility
- **Severity:** High
- **Description:** No critical accessibility issues
- **Check:** Validates no critical axe violations
- **Expected Value:** Address critical accessibility issues

### 173. Rule: AXE_NO_SERIOUS (Rule No: 215)
- **Category:** Accessibility
- **Severity:** High
- **Description:** No serious accessibility issues
- **Check:** Validates no serious axe violations
- **Expected Value:** Address serious accessibility issues

### 174. Rule: AXE_MAX_MODERATE (Rule No: 216)
- **Category:** Accessibility
- **Severity:** High
- **Description:** Moderate accessibility issues should be minimal (≤5)
- **Check:** Validates moderate issue count
- **Expected Value:** ≤5 moderate issues

### 175. Rule: IMAGES_ALL_HAVE_ALT (Rule No: 217)
- **Category:** Accessibility
- **Severity:** High
- **Description:** All images should have alt text
- **Check:** Validates every image has alt attribute
- **Expected Value:** Add alt text to all images

### 176. Rule: DOM_ELEMENT_COUNT (Rule No: 218)
- **Category:** Accessibility
- **Severity:** High
- **Description:** DOM element count should be reasonable (≤1500)
- **Check:** Validates total DOM elements
- **Expected Value:** ≤1500 DOM elements

### 177. Rule: FORM_LABELS (Rule No: 219)
- **Category:** Accessibility
- **Severity:** High
- **Description:** Form inputs should have associated labels
- **Check:** validates form input labeling
- **Expected Value:** Add labels to all form inputs

### 178. Rule: ARIA_LANDMARKS (Rule No: 221)
- **Category:** Accessibility
- **Severity:** High
- **Description:** ARIA landmarks should be present for navigation
- **Check:** Validates ARIA landmark implementation
- **Expected Value:** Add ARIA landmarks

### 179. Rule: BUTTONS_ACCESSIBLE (Rule No: 222)
- **Category:** Accessibility
- **Severity:** High
- **Description:** All buttons should have accessible labels
- **Check:** Validates button accessibility
- **Expected Value:** Add accessible labels to buttons

### 180. Rule: HEADING_ORDER_LOGICAL (Rule No: 223)
- **Category:** Accessibility
- **Severity:** High
- **Description:** Heading order should be logical for accessibility
- **Check:** Validates heading hierarchy
- **Expected Value:** Maintain logical heading order

### 181. Rule: KEYBOARD_NAVIGATION (Rule No: 224)
- **Category:** Accessibility
- **Severity:** High
- **Description:** Keyboard navigation should be functional
- **Check:** Validates keyboard accessibility
- **Expected Value:** Ensure keyboard navigation works

### 182. Rule: NO_FOCUS_TRAPS (Rule No: 225)
- **Category:** Accessibility
- **Severity:** High
- **Description:** No focus traps detected
- **Check:** Validates focus management
- **Expected Value:** Eliminate focus traps

### 183. Rule: NO_SMALL_CLICK_TARGETS (Rule No: 226)
- **Category:** Accessibility
- **Severity:** High
- **Description:** No small click targets (<24px)
- **Check:** Validates click target sizes
- **Expected Value:** Make click targets ≥24px

### 184. Rule: FOCUS_INDICATORS_VISIBLE (Rule No: 227)
- **Category:** Accessibility
- **Severity:** High
- **Description:** Focus indicators should be visible
- **Check:** Validates focus styling
- **Expected Value:** Add visible focus indicators

### 185. Rule: INTERACTIVE_KEYBOARD_REACHABLE (Rule No: 228)
- **Category:** Accessibility
- **Severity:** High
- **Description:** All interactive elements should be keyboard-reachable
- **Check:** Validates keyboard accessibility
- **Expected Value:** Ensure keyboard reachability

### 186. Rule: SKIP_NAVIGATION (Rule No: 230)
- **Category:** Accessibility
- **Severity:** High
- **Description:** Skip navigation link should be present
- **Check:** Validates skip link implementation
- **Expected Value:** Add skip navigation link

### 187. Rule: LANG_ATTRIBUTE_SCREEN_READERS (Rule No: 233)
- **Category:** Accessibility
- **Severity:** High
- **Description:** HTML lang attribute must be present for screen readers
- **Check:** validates lang attribute for accessibility
- **Expected Value:** Add lang attribute to HTML

### 188. Rule: LINKS_DESCRIPTIVE (Rule No: 236)
- **Category:** Accessibility
- **Severity:** High
- **Description:** Links should have descriptive text
- **Check:** Validates link text descriptiveness
- **Expected Value:** Use descriptive link text

---

## Summary

**Total Rules: 188**

**Categories:**
- Title Tag: 20 rules
- Meta Description: 4 rules  
- Meta Keywords: 3 rules
- Language & Meta: 12 rules
- Canonical URL: 6 rules
- Social (OG + Pinterest): 15 rules
- Schema.org: 14 rules
- Apple Touch Icons: 4 rules
- International (Hreflang): 8 rules
- Images: 13 rules
- Headings: 35 rules
- URL Structure & Technical: 13 rules
- Robots.txt & Sitemap: 6 rules
- Performance & Core Web Vitals: 7 rules
- Content Quality: 9 rules
- Analytics & Tracking: 2 rules
- Accessibility: 18 rules

**Severity Distribution:**
- High: 126 rules
- Medium: 41 rules
- Low: 3 rules
- Info: 18 rules

This comprehensive SEO rule set covers all aspects of on-page SEO, technical SEO, performance, accessibility, and content quality for modern web optimization.
