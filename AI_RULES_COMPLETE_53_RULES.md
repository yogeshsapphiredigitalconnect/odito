# AI Visibility Rules - Complete List (53 Rules)

## AI Impact Score Rules (1-7, 14-15, 34, 48-49, 68)

### 1. Rule: PRIMARY_ORGANIZATION_SCHEMA (Rule No: 1)
- **Category:** AI Impact
- **Description:** Primary Organization schema on homepage
- **Check:** Validates presence of Organization schema in JSON-LD
- **Expected Value:** Add Organization schema with required properties
- **Weight:** 1.0
- **Max Score:** 10

### 2. Rule: CORRECT_TYPE (Rule No: 2)
- **Category:** AI Impact
- **Description:** Correct @type (Organization / MarketingAgency)
- **Check:** Validates schema type matches business type
- **Expected Value:** Use appropriate schema type
- **Weight:** 1.0
- **Max Score:** 10

### 3. Rule: SCHEMA_VALID_JSONLD (Rule No: 3)
- **Category:** AI Impact
- **Description:** Schema valid JSON-LD
- **Check:** Validates JSON-LD syntax and structure
- **Expected Value:** Ensure valid JSON-LD format
- **Weight:** 1.0
- **Max Score:** 10

### 4. Rule: CONTEXT_EXACTLY_SCHEMA_ORG (Rule No: 4)
- **Category:** AI Impact
- **Description:** @context exactly https://schema.org
- **Check:** Validates schema.org context
- **Expected Value:** Use "https://schema.org" as context
- **Weight:** 1.0
- **Max Score:** 10

### 5. Rule: NAME_FIELD_MATCHES_BRAND (Rule No: 5)
- **Category:** AI Impact
- **Description:** name field matches brand name
- **Check:** Validates schema name matches brand
- **Expected Value:** Ensure consistency with brand name
- **Weight:** 1.0
- **Max Score:** 10

### 6. Rule: URL_POINTS_TO_CANONICAL_HOMEPAGE (Rule No: 6)
- **Category:** AI Impact
- **Description:** url points to canonical homepage
- **Check:** Validates schema URL points to homepage
- **Expected Value:** Use homepage URL in schema
- **Weight:** 1.0
- **Max Score:** 10

### 7. Rule: LOGO_URL_RETURNS_200 (Rule No: 7)
- **Category:** AI Impact
- **Description:** logo URL returns 200 status
- **Check:** Validates logo URL is accessible
- **Expected Value:** Ensure logo URL is valid and accessible
- **Weight:** 1.0
- **Max Score:** 10

### 8. Rule: XML_SITEMAP_EXISTS_VALID (Rule No: 14)
- **Category:** AI Impact
- **Description:** XML sitemap exists and valid
- **Check:** Validates sitemap exists and returns 200
- **Expected Value:** Create and maintain XML sitemap
- **Weight:** 1.0
- **Max Score:** 10

### 9. Rule: ROBOTS_TXT_NON_BLOCKING (Rule No: 15)
- **Category:** AI Impact
- **Description:** robots.txt non-blocking
- **Check:** Validates robots.txt doesn't block important content
- **Expected Value:** Review robots.txt directives
- **Weight:** 1.0
- **Max Score:** 10

### 10. Rule: NO_PLUGIN_DUPLICATE_SCHEMAS (Rule No: 34)
- **Category:** AI Impact
- **Description:** No plugin duplicate schemas
- **Check:** Detects duplicate schema from plugins
- **Expected Value:** Remove duplicate schemas
- **Weight:** 1.0
- **Max Score:** 10

### 11. Rule: LLMS_TXT_FILE_EXISTS (Rule No: 48)
- **Category:** AI Impact
- **Description:** llms.txt file exists
- **Check:** Validates presence of llms.txt file
- **Expected Value:** Add llms.txt for AI crawler guidance
- **Weight:** 1.0
- **Max Score:** 10

### 12. Rule: SEMANTIC_HTML_TAGS_USED (Rule No: 49)
- **Category:** AI Impact
- **Description:** Semantic HTML tags used
- **Check:** Validates semantic HTML implementation
- **Expected Value:** Use semantic HTML tags (header, nav, main, etc.)
- **Weight:** 1.0
- **Max Score:** 10

### 13. Rule: BREADCRUMBLIST_SCHEMA (Rule No: 68)
- **Category:** AI Impact
- **Description:** BreadcrumbList schema
- **Check:** Validates BreadcrumbList structured data
- **Expected Value:** Add BreadcrumbList schema
- **Weight:** 1.0
- **Max Score:** 10

---

## Citation Probability Rules (8-12, 19-21, 36-38, 46, 62)

### 14. Rule: BUSINESS_NAME_IDENTICAL (Rule No: 8)
- **Category:** Citation Probability
- **Description:** Business name identical everywhere
- **Check:** Validates consistent business name across citations
- **Expected Value:** Ensure consistent NAP (Name, Address, Phone)
- **Weight:** 1.0
- **Max Score:** 10

### 15. Rule: ADDRESS_IDENTICAL (Rule No: 9)
- **Category:** Citation Probability
- **Description:** Address identical everywhere
- **Check:** Validates consistent address across citations
- **Expected Value:** Use consistent address format
- **Weight:** 1.0
- **Max Score:** 10

### 16. Rule: NAP_MATCHES_FOOTER_CONTACT (Rule No: 10)
- **Category:** Citation Probability
- **Description:** NAP matches footer/contact page
- **Check:** Validates NAP consistency with contact pages
- **Expected Value:** Ensure footer/contact page matches citations
- **Weight:** 1.0
- **Max Score:** 10

### 17. Rule: NO_ENTITY_FRAGMENTATION (Rule No: 11)
- **Category:** Citation Probability
- **Description:** No entity fragmentation
- **Check:** Detects fragmented entity information
- **Expected Value:** Consolidate entity information
- **Weight:** 1.0
- **Max Score:** 10

### 18. Rule: ABOUT_CONTACT_PRIVACY_TERMS_PAGES (Rule No: 12)
- **Category:** Citation Probability
- **Description:** About / Contact / Privacy / Terms pages exist
- **Check:** Validates required pages exist
- **Expected Value:** Create About, Contact, Privacy, Terms pages
- **Weight:** 1.0
- **Max Score:** 10

### 19. Rule: PHONE_E164_FORMAT (Rule No: 19)
- **Category:** Citation Probability
- **Description:** Phone in E.164 format
- **Check:** Validates phone number format
- **Expected Value:** Use E.164 format (+1-555-123-4567)
- **Weight:** 1.0
- **Max Score:** 10

### 20. Rule: VISIBLE_AUTHOR_NAME (Rule No: 20)
- **Category:** Citation Probability
- **Description:** Visible author name
- **Check:** Validates author name is visible
- **Expected Value:** Display author name prominently
- **Weight:** 1.0
- **Max Score:** 10

### 21. Rule: PERSON_SCHEMA_LINKED_TO_ORGANIZATION (Rule No: 21)
- **Category:** Citation Probability
- **Description:** Person schema linked to Organization
- **Check:** Validates Person schema references Organization
- **Expected Value:** Link Person schema to Organization schema
- **Weight:** 1.0
- **Max Score:** 10

### 22. Rule: AUTHOR_BIO_WITH_CREDENTIALS (Rule No: 36)
- **Category:** Citation Probability
- **Description:** Author bio with credentials
- **Check:** Validates author has credentials
- **Expected Value:** Add author credentials and expertise
- **Weight:** 1.0
- **Max Score:** 10

### 23. Rule: AUTHOR_PHOTO (Rule No: 37)
- **Category:** Citation Probability
- **Description:** Author photo
- **Check:** Validates author has photo
- **Expected Value:** Add professional author photo
- **Weight:** 1.0
- **Max Score:** 10

### 24. Rule: DEDICATED_AUTHOR_PAGE (Rule No: 38)
- **Category:** Citation Probability
- **Description:** Dedicated author page
- **Check:** Validates dedicated author page exists
- **Expected Value:** Create dedicated author page
- **Weight:** 1.0
- **Max Score:** 10

### 25. Rule: BUSINESS_REGISTRATION_DETAILS (Rule No: 46)
- **Category:** Citation Probability
- **Description:** Business registration details
- **Check:** Validates business registration info
- **Expected Value:** Add business registration details
- **Weight:** 1.0
- **Max Score:** 10

### 26. Rule: GOOGLE_MAPS_EMBED_CORRECT (Rule No: 62)
- **Category:** Citation Probability
- **Description:** Google Maps embed correct
- **Check:** Validates Google Maps embed
- **Expected Value:** Add correct Google Maps embed
- **Weight:** 1.0
- **Max Score:** 10

---

## LLM Readiness Rules (22-23, 26, 29-33, 43-45, 54)

### 27. Rule: SERVICE_PAGES_800_WORDS (Rule No: 22)
- **Category:** LLM Readiness
- **Description:** Service pages 800+ words
- **Check:** Validates service pages have sufficient content
- **Expected Value:** Service pages should have 800+ words
- **Weight:** 1.0
- **Max Score:** 10

### 28. Rule: TOPIC_CLUSTERS_INTERNAL_LINKS (Rule No: 23)
- **Category:** LLM Readiness
- **Description:** Topic clusters with internal links
- **Check:** Validates topic cluster structure
- **Expected Value:** Create topic clusters with internal linking
- **Weight:** 1.0
- **Max Score:** 10

### 29. Rule: WEBP_AVIF_IMAGES_LAZY_LOADING (Rule No: 26)
- **Category:** LLM Readiness
- **Description:** WebP / AVIF images + lazy loading
- **Check:** Validates modern image formats and optimization
- **Expected Value:** Use WebP/AVIF with lazy loading
- **Weight:** 1.0
- **Max Score:** 10

### 30. Rule: CLEAR_ENTITY_FIRST_150_WORDS (Rule No: 29)
- **Category:** LLM Readiness
- **Description:** Clear entity in first 150 words
- **Check:** Validates primary entity mentioned early
- **Expected Value:** Mention primary entity in first 150 words
- **Weight:** 1.0
- **Max Score:** 10

### 31. Rule: SAMEAS_ARRAY_LINKS_ACTIVE (Rule No: 30)
- **Category:** LLM Readiness
- **Description:** sameAs array links active
- **Check:** Validates sameAs links are accessible
- **Expected Value:** Ensure sameAs links return 200 status
- **Weight:** 1.0
- **Max Score:** 10

### 32. Rule: GEO_COORDINATES_IN_SCHEMA (Rule No: 31)
- **Category:** LLM Readiness
- **Description:** GeoCoordinates in schema
- **Check:** Validates geographic coordinates in schema
- **Expected Value:** Add GeoCoordinates to location schema
- **Weight:** 1.0
- **Max Score:** 10

### 33. Rule: DESCRIPTION_MINIMUM_50_CHARACTERS (Rule No: 32)
- **Category:** LLM Readiness
- **Description:** description minimum 50 characters
- **Check:** Validates description length
- **Expected Value:** Description should be 50+ characters
- **Weight:** 1.0
- **Max Score:** 10

### 34. Rule: AREA_SERVED_DEFINED (Rule No: 33)
- **Category:** LLM Readiness
- **Description:** areaServed defined
- **Check:** validates service area definition
- **Expected Value:** Define service area in schema
- **Weight:** 1.0
- **Max Score:** 10

### 35. Rule: LAST_UPDATED_DATE_VISIBLE (Rule No: 43)
- **Category:** LLM Readiness
- **Description:** Last updated date visible
- **Check:** Validates content freshness indicator
- **Expected Value:** Display last updated date
- **Weight:** 1.0
- **Max Score:** 10

### 36. Rule: SEMANTIC_SUBTOPICS_COVERED (Rule No: 44)
- **Category:** LLM Readiness
- **Description:** Semantic subtopics covered
- **Check:** Validates comprehensive topic coverage
- **Expected Value:** Cover semantic subtopics thoroughly
- **Weight:** 1.0
- **Max Score:** 10

### 37. Rule: STATISTICS_HAVE_SOURCE_LINKS (Rule No: 45)
- **Category:** LLM Readiness
- **Description:** Statistics have source links
- **Check:** Validates statistical data sources
- **Expected Value:** Link to sources for statistics
- **Weight:** 1.0
- **Max Score:** 10

### 38. Rule: SHORT_PARAGRAPHS_3_TO_5_LINES (Rule No: 54)
- **Category:** LLM Readiness
- **Description:** Short paragraphs (3–5 lines)
- **Check:** Validates paragraph length for readability
- **Expected Value:** Use short paragraphs (3-5 lines)
- **Weight:** 1.0
- **Max Score:** 10

---

## AEO (Answer Engine Optimization) Score Rules (27-28, 42, 50, 60-61)

### 39. Rule: FIRST_60_WORDS_DIRECT_ANSWER (Rule No: 27)
- **Category:** AEO Score
- **Description:** First 60 words contain direct answer
- **Check:** Validates direct answer in opening content
- **Expected Value:** Provide direct answer in first 60 words
- **Weight:** 1.0
- **Max Score:** 10

### 40. Rule: FAQ_SCHEMA_MATCHES_CONTENT (Rule No: 28)
- **Category:** AEO Score
- **Description:** FAQ schema matches visible content
- **Check:** Validates FAQ schema aligns with content
- **Expected Value:** Ensure FAQ schema matches visible FAQs
- **Weight:** 1.0
- **Max Score:** 10

### 41. Rule: FAQ_SECTION_5_TO_10_QUESTIONS (Rule No: 42)
- **Category:** AEO Score
- **Description:** FAQ section 5–10 questions
- **Check:** Validates FAQ section has adequate questions
- **Expected Value:** Include 5-10 relevant FAQ questions
- **Weight:** 1.0
- **Max Score:** 10

### 42. Rule: QUESTION_BASED_H2_HEADINGS (Rule No: 50)
- **Category:** AEO Score
- **Description:** Question-based H2 headings
- **Check:** validates H2 headings use question format
- **Expected Value:** Use question-based H2 headings
- **Weight:** 1.0
- **Max Score:** 10

### 43. Rule: DIRECT_ANSWER_FORMAT (Rule No: 60)
- **Category:** AEO Score
- **Description:** Direct answer format
- **Check:** Validates content uses direct answer format
- **Expected Value:** Structure content for direct answers
- **Weight:** 1.0
- **Max Score:** 10

### 44. Rule: CONTENT_CITES_SOURCES (Rule No: 61)
- **Category:** AEO Score
- **Description:** Content cites sources
- **Check:** Validates content includes source citations
- **Expected Value:** Cite authoritative sources
- **Weight:** 1.0
- **Max Score:** 10

---

## Topical Authority Rules (16-18, 63, 65-67)

### 45. Rule: ONLY_ONE_PRIMARY_ENTITY (Rule No: 16)
- **Category:** Topical Authority
- **Description:** Only ONE primary entity site-wide
- **Check:** Validates single primary entity focus
- **Expected Value:** Focus on one primary entity
- **Weight:** 1.0
- **Max Score:** 10

### 46. Rule: CONSISTENT_ID_ACROSS_PAGES (Rule No: 17)
- **Category:** Topical Authority
- **Description:** Consistent @id across pages
- **Check:** Validates consistent entity ID
- **Expected Value:** Use consistent @id for entity
- **Weight:** 1.0
- **Max Score:** 10

### 47. Rule: CHILD_SCHEMAS_REFERENCE_MAIN_ID (Rule No: 18)
- **Category:** Topical Authority
- **Description:** Child schemas reference main @id
- **Check:** Validates child schemas link to main entity
- **Expected Value:** Link child schemas to main entity @id
- **Weight:** 1.0
- **Max Score:** 10

### 48. Rule: OPENING_HOURS_SPECIFICATION (Rule No: 63)
- **Category:** Topical Authority
- **Description:** openingHoursSpecification
- **Check:** Validates opening hours schema
- **Expected Value:** Add openingHoursSpecification schema
- **Weight:** 1.0
- **Max Score:** 10

### 49. Rule: EVENT_SCHEMA (Rule No: 65)
- **Category:** Topical Authority
- **Description:** Event schema
- **Check:** Validates Event schema implementation
- **Expected Value:** Add Event schema for events
- **Weight:** 1.0
- **Max Score:** 10

### 50. Rule: AGGREGATE_RATING_SCHEMA (Rule No: 66)
- **Category:** Topical Authority
- **Description:** AggregateRating schema
- **Check:** Validates rating schema implementation
- **Expected Value:** Add AggregateRating schema
- **Weight:** 1.0
- **Max Score:** 10

### 51. Rule: SERVICE_PRODUCT_SCHEMA_WITH_OFFERS (Rule No: 67)
- **Category:** Topical Authority
- **Description:** Service/Product schema with offers
- **Check:** Validates service/product schema with offers
- **Expected Value:** Add offers to service/product schema
- **Weight:** 1.0
- **Max Score:** 10

---

## Voice Intent Rules (51-52)

### 52. Rule: BULLET_NUMBERED_LISTS_USED (Rule No: 51)
- **Category:** Voice Intent
- **Description:** Bullet / numbered lists used
- **Check:** Validates use of structured lists
- **Expected Value:** Use bullet/numbered lists for clarity
- **Weight:** 1.0
- **Max Score:** 10

### 53. Rule: COMPARISON_TABLES_PRESENT (Rule No: 52)
- **Category:** Voice Intent
- **Description:** Comparison tables present
- **Check:** Validates presence of comparison tables
- **Expected Value:** Add comparison tables for voice queries
- **Weight:** 1.0
- **Max Score:** 10

---

## Summary

**Total Rules: 53**

**Categories:**
- AI Impact: 13 rules
- Citation Probability: 13 rules  
- LLM Readiness: 12 rules
- AEO Score: 6 rules
- Topical Authority: 7 rules
- Voice Intent: 2 rules

**Rule Distribution by Number:**
- Rules 1-7: AI Impact fundamentals
- Rules 8-12: Citation probability basics
- Rules 14-15: Technical SEO for AI
- Rules 16-18: Entity consistency
- Rules 19-21: Author authority
- Rules 22-23: Content depth
- Rules 26, 29-33: Technical optimization
- Rules 27-28: Answer engine optimization
- Rules 34, 36-38: Advanced authority signals
- Rules 42-45: Content quality
- Rules 46, 48-49: Local SEO
- Rules 50-52: Voice search optimization
- Rules 54: Readability
- Rules 60-61: Source credibility
- Rules 62-68: Advanced schema markup

**Weight Distribution:**
- All rules have equal weight: 1.0
- All rules have maximum score: 10

**Focus Areas:**
1. **Structured Data & Schema**: Comprehensive schema markup for AI understanding
2. **Entity Consistency**: Unified entity representation across platforms
3. **Content Optimization**: AI-friendly content structure and depth
4. **Authority Signals**: Author credibility and business validation
5. **Technical Excellence**: Modern web standards and performance
6. **Voice Search**: Conversational and answer-focused content

This AI visibility rule set evaluates content readiness for AI systems, voice search, and answer engines, ensuring comprehensive optimization for the evolving search landscape.
