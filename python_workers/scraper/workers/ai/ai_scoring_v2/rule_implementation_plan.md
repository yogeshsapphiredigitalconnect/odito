# Rule Implementation Plan

## Current Rules Analysis
Current system has many rules that don't match the 52 required rules. Need to replace all existing rules.

## 52 Required Rules Mapping to Categories:

### aeo_score.py (Answer Engine Optimization)
- Rule 27 — First 60 words contain direct answer
- Rule 28 — FAQ schema matches visible content  
- Rule 42 — FAQ section 5–10 questions
- Rule 50 — Question-based H2 headings
- Rule 60 — Direct answer format
- Rule 61 — Content cites sources

### ai_impact.py (AI Impact & Technical)
- Rule 1 — Primary Organization schema on homepage
- Rule 2 — Correct @type (Organization / MarketingAgency)
- Rule 3 — Schema valid JSON-LD
- Rule 4 — @context exactly https://schema.org
- Rule 5 — name field matches brand name
- Rule 6 — url points to canonical homepage
- Rule 7 — logo URL returns 200 status
- Rule 14 — XML sitemap exists and valid
- Rule 15 — robots.txt non-blocking
- Rule 34 — No plugin duplicate schemas
- Rule 48 — llms.txt file exists
- Rule 49 — Semantic HTML tags used
- Rule 68 — BreadcrumbList schema

### citation_probability.py (Citation & Authority)
- Rule 8 — Business name identical everywhere
- Rule 9 — Address identical everywhere
- Rule 10 — NAP matches footer/contact page
- Rule 11 — No entity fragmentation
- Rule 12 — About / Contact / Privacy / Terms pages exist
- Rule 19 — Phone in E.164 format
- Rule 20 — Visible author name
- Rule 21 — Person schema linked to Organization
- Rule 36 — Author bio with credentials
- Rule 37 — Author photo
- Rule 38 — Dedicated author page
- Rule 46 — Business registration details
- Rule 62 — Google Maps embed correct

### llm_readiness.py (LLM Processing)
- Rule 22 — Service pages 800+ words
- Rule 23 — Topic clusters with internal links
- Rule 26 — WebP / AVIF images + lazy loading
- Rule 29 — Clear entity in first 150 words
- Rule 30 — sameAs array links active
- Rule 31 — GeoCoordinates in schema
- Rule 32 — description minimum 50 characters
- Rule 33 — areaServed defined
- Rule 43 — Last updated date visible
- Rule 44 — Semantic subtopics covered
- Rule 45 — Statistics have source links
- Rule 54 — Short paragraphs (3–5 lines)

### topical_authority.py (Entity & Authority)
- Rule 16 — Only ONE primary entity site-wide
- Rule 17 — Consistent @id across pages
- Rule 18 — Child schemas reference main @id
- Rule 63 — openingHoursSpecification
- Rule 65 — Event schema
- Rule 66 — AggregateRating schema
- Rule 67 — Service/Product schema with offers

### voice_intent.py (Voice & Intent)
- Rule 51 — Bullet / numbered lists used
- Rule 52 — Comparison tables present

## Implementation Strategy:
1. Replace all existing rule classes in each category file
2. Implement exactly the 52 required rules with proper rule_id matching
3. Update registry functions to register only these 52 rules
4. Verify total count equals 52
