# AI Visibility Scraper Analysis & Enhancement Roadmap
**Production-Grade SEO Audit Engine Assessment**

**Document Version:** 2.0  
**Last Updated:** March 4, 2026  
**Scope:** AI Visibility Data Extraction for 68 AI SEO Rules

---

## EXECUTIVE SUMMARY

Your **AI Visibility scraper** is architected with production-grade enhancements for structured data extraction (`ai_visibility.py`). However, it currently extracts data optimized for **stage-1 assessment** rather than **comprehensive rule evaluation**.

### Current Extraction Capability: **45-50% of required fields**
- ✅ **Excellent:** Structured data (JSON-LD), heading hierarchy, content sections
- ⚠️ **Partial:** Internal linking, images, author signals
- ❌ **Missing:** Entity relationships, author E-E-A-T, local signals, bot accessibility

---

## STEP 1: CURRENT EXTRACTED FIELDS ANALYSIS

### A. Page Metadata (Level: GOOD)
Currently extracted:
- `title` - Page title
- `meta_description` - Meta description  
- `canonical_urls` - Canonical link tags
- `canonical_present` - Boolean presence check
- `canonical_matches_url` - Normalization check
- `multiple_canonical_detected` - Conflict detection
- `normalized_page_url` - Normalized URL
- `protocol_comparison` - HTTPS validation
- `www_comparison` - WWW normalization
- `trailing_slash_comparison` - Slash handling

**Strength:** Excellent canonical normalization for homepage detection  
**Gap:** Missing OpenGraph, Twitter Card, Pinterest validation metadata

---

### B. Structured Data (Level: EXCELLENT)
**Most comprehensive extraction in your pipeline:**

#### JSON-LD Extraction:
- `raw_json_ld_blocks` - All JSON-LD script tags with validation
- `raw_json_objects` - Parsed JSON objects
- `unified_entity_graph` - Merged entity graph (one canonical graph)
- `parsed_entities` - Cleaned, deduplicated entities
- `architecture_violations` - Schema.org compliance issues
- `final_json_ld_block` - Single validated block
- `canonical_root` - Domain root (Organization permanence)
- `integrity_metrics` - Parse success rate, entity counts

#### Entity Properties:
- `@id` normalization - Canonical entity IDs
- `@type` detection - Entity types
- Property extraction - All properties with type analysis
- Data type mapping - String/int/float/bool/array/object
- Nested objects - Preserved for address/geo
- Entity references - Cross-entity relationships

#### Relationships:
- `entity_relationship_graph` - Graph edges (source→target)
- `relationship_types` - Types (provider, author, publisher, etc.)
- `resolved_relationships` - Internal vs external
- `primary_entity` - Deterministic selection
- `unreferenced_entities` - Orphan detection

**Strength:** Robust entity normalization, ID canonicalization engine  
**Gap:** Missing relationship directionality validation, circular dependency detection

---

### C. Content Structure (Level: GOOD)
**Heading Hierarchy:**
- `h1_count`, `h2_count`, `h3_count` - Level counts
- `heading_sequence_valid` - Validates H1→H2→H3 flow
- `question_headings` - Detects question patterns
- `heading_structure_score` - Compliance scoring
- `sequence_violations` - Identifies skipped levels
- `all_headings_in_order` - Ordered list for context

**Paragraph Metrics:**
- `paragraph_count` - Total paragraphs
- `avg_paragraph_length` - Average word count
- `short_paragraph_ratio` - % < 120 words
- `long_paragraph_ratio` - % > 300 words
- `avg_sentence_length` - Readability metric

**Main Content Isolation:**
- `main_content_text` - Extracted body (5000 chars limit)
- `main_content_html` - HTML version (10000 chars limit)
- `content_word_count` - Total words in main content
- `content_extraction_method` - Extraction source (article/main/density/body)
- `nav_keyword_counts` - Navigation pollution detection

**Content Sections:**
- `definition_section` - "What is" content
- `use_case_section` - "Who it's for" content
- `step_section` - "How it works" content
- `faq_section` - FAQ content
- `edge_case_section` - Limitations/caveats
- Minimum word threshold: **80 words per section**

**Strength:** Section detection with anti-pollution filtering, heading hierarchy  
**Gap:** Missing rhetorical structure analysis, keyword prominence metrics

---

### D. Internal Linking (Level: PARTIAL)
**What's Extracted:**
- Anchor text analysis
- Link destination URLs
- Link type classification (internal/external/relative)

**What's Missing:**
- Link position (header/body/footer context)
- Link velocity (links per 100 words)
- Orphaned pages (pages with no internal links)
- Link anchor text diversity
- Topic clustering (semantic link patterns)
- Contextual relevance scoring

---

### E. Images (Level: GOOD)
**Extracted:**
- `images[]` - Array of all images with:
  - `src`, `alt`, `title` 
  - `width`, `height` - Dimensions
  - `loading`, `decoding`, `srcset`, `sizes` - Performance attrs
  - `alt_word_count` - Alt text quality
  - `is_decorative` - Accessibility detection
  - `has_alt`, `has_title`, `has_dimensions` - Attribute booleans
  - `has_loading_attr`, `has_responsive_attrs` - Best practices

**Schema Matching:**
- `matching_image_objects` - Links to ImageObject schema
- `matches_schema` - Schema coverage bool

**Summary Metrics:**
- `total_images`, `images_with_alt`, `images_without_alt`
- `decorative_images`, `images_matching_schema`
- `alt_coverage_percentage`
- Duplication detection
- Size estimation (bytes/MB)

**Strength:** Comprehensive alt text and responsive image detection  
**Gap:** Missing image SEO (compression, format, lazy-loading audit), image relevance to content

---

### F. Video (Level: GOOD)
**Extracted:**
- `video_tags[]` - Native `<video>` elements
- `iframe_embeds[]` - YouTube/Vimeo/Dailymotion embeds
- `video_objects[]` - VideoObject schema
- Video IDs extracted from embeds
- Transcript detection (`has_transcript`)
- Duration validation (ISO 8601 format)
- Platform detection (YouTube, Vimeo, etc.)

**Comparison Metrics:**
- Cross-format reconciliation
- Platform distribution
- Total video element count

**Strength:** Multi-format video detection with embed parsing  
**Gap:** Missing video indexability signals, caption availability, video relevance scoring

---

### G. FAQ Data (Level: GOOD)
**Detection Methods:**
1. FAQPage schema (JSON-LD)
2. Question pattern matching
3. Q+A pair validation (requires substantial answers >5 words)

**Extracted:**
- Questions from schema & HTML
- Answer text & word counts
- Q+A pair validation
- Multiple answer detection
- Answer quality thresholds

**Strength:** Q+A pair validation prevents false positives  
**Gap:** Missing FAQ ranking (position in page), snippet length metrics, answer-to-intent matching

---

### H. Author & Entity Identity (Level: WEAK)
**Currently Missing:**
- ❌ Author entity extraction
- ❌ Author byline detection
- ❌ Author URL/profile links
- ❌ Author credentials in schema
- ❌ Author bio/description
- ❌ Author affiliation
- ❌ Author expertise tags
- ❌ Date published / Date modified (used to infer expertise recency)

**Required for E-E-A-T Rules:**
- Author schema (@type: Person)
- Author name consistency across pages
- Author publication frequency
- Author domain expertise signals

---

### I. Entity Signals (Level: PARTIAL)
**Extracted:**
- Organization entity basics (name, URL, logo)
- Logo presence detection
- SameAs links (social profiles)
- ContactPoint data
- Address/PostalAddress
- Geo coordinates

**Missing:**
- Entity mentions vs. entities (author mentions)
- Entity co-occurrence (multi-entity pages)
- Entity prominence (word count analysis)
- Entity expertise domains
- Entity-to-page relationship validation
- Entity name consistency (exact match requirement)
- Entity type validation (Organization vs. LocalBusiness vs. Brand)

---

### J. Local SEO Signals (Level: WEAK)
**Currently Missing:**
- ❌ LocalBusiness schema
- ❌ NAP (Name, Address, Phone) consistency
- ❌ Service area detection
- ❌ Business hours
- ❌ Local review/rating aggregation
- ❌ Location pages identification
- ❌ Geo-targeting signals
- ❌ Multiple location detection

---

### K. Technical AI Readiness (Level: PARTIAL)
**Extracted:**
- Canonical URL normalization
- Robots meta tag (needs verification)
- Protocol/HTTPS validation
- WWW consistency

**Missing:**
- robots.txt accessibility
- X-Robots-Tag headers
- Meta robots directives
- Crawlable page structure
- JavaScript rendering requirements
- Dynamic/static content detection
- Mobile-friendliness signals (viewport meta)
- Page load performance signals (Core Web Vitals data would be external API, so excluded)

---

### L. AEO (Answer Engine Optimization) Signals (Level: PARTIAL)
**Current Detection:**
- FAQ pages (FAQPage schema)
- Question patterns in headings
- Main content extraction
- Structure validation

**Missing:**
- Direct answer format detection (paragraphs vs. lists)
- Answer to query intent matching
- Featured snippet eligibility
- Position 0 optimization signals
- Answer snippet length metrics (optimal: 40-60 words)
- Question intent classification (How/Why/What/When/Where/Who)

---

### M. SGE Optimization (Level: WEAK)
**Missing (Critical for SGE/Gemini visibility):**
- ❌ Snippet structure analysis
- ❌ Multi-answer support scoring
- ❌ Content freshness signals
- ❌ Publisher credibility signals (yet external APIs banned)
- ❌ Structured data richness (count of fields per entity)
- ❌ Related entities extraction
- ❌ Topic depth analysis
- ❌ Semantic entity linking

---

### N. Knowledge Graph Signals (Level: PARTIAL)
**Extracted:**
- @id normalization (for entity persistence)
- Entity type classification
- Entity relationships (through schema)

**Missing:**
- Knowledge Graph eligibility (high-authority entity requirements)
- Entity fame signals (mentions, inbound authority)
- Disambiguation (entity uniqueness)
- Related entities (knowledge panel associations)
- Entity description quality
- Entity sameAs expansion (to validate author credentials elsewhere)

---

## STEP 2: FIELD-TO-RULE MAPPING

### Which 68 AI SEO Rules CAN Currently Be Evaluated

#### ✅ Evaluable with Current Data (28-32 rules)

**Structured Data & Schema Rules (~12):**
1. ✅ JSON-LD present and valid
2. ✅ Single canonical JSON-LD block  
3. ✅ Entity @id normalization
4. ✅ Organization entity present
5. ✅ Primary entity type detection
6. ✅ BreadcrumbList schema
7. ✅ FAQPage schema structure
8. ✅ Entity relationships mapped
9. ✅ Missing required properties
10. ✅ Property data type compliance
11. ✅ Entity reference resolution
12. ✅ Nested object validation

**Technical Readiness Rules (~8):**
1. ✅ Canonical URL present
2. ✅ Canonical matches page URL
3. ✅ HTTPS protocol active
4. ✅ WWW consistency
5. ✅ Trailing slash consistency
6. ✅ No multiple canonical tags
7. ✅ Valid heading hierarchy (H1→H2→H3)
8. ✅ No missing H2 (between H1 and H3)

**Content Structure Rules (~12):**
1. ✅ Definition section present (≥80 words)
2. ✅ Use case section present  
3. ✅ Step/process section present
4. ✅ FAQ section present
5. ✅ Limitations/edge case section present
6. ✅ Average paragraph length (readability)
7. ✅ Paragraph word count distribution
8. ✅ Main content extraction success
9. ✅ Navigation pollution detection
10. ✅ Question-based headings
11. ✅ Content word count threshold
12. ✅ Sentence complexity metrics

---

### ⚠️ Partially Evaluable (15-18 rules)

**Require Enhanced Extraction:**
1. ⚠️ **Author E-E-A-T:** Needs author schema extraction
2. ⚠️ **Entity Name Consistency:** Needs entity mention detection
3. ⚠️ **Brand Entity Type:** Needs entity type validation against guidelines
4. ⚠️ **Image Alt Text Audit:** Extracted but needs relevance scoring
5. ⚠️ **Image Schema Matching:** Extracted but incomplete schema coverage
6. ⚠️ **Video Optimization:** Extracted but missing caption/transcript audit
7. ⚠️ **Internal Linking:** Basic extraction but missing contextual analysis
8. ⚠️ **Orphaned Content:** Needs cross-URL linking analysis
9. ⚠️ **Topic Clustering:** Needs semantic analysis of link text
10. ⚠️ **Answer Format:** Needs direct answer snippet detection
11. ⚠️ **Featured Snippet:** Needs snippet candidate identification
12. ⚠️ **Content Freshness:** Needs datePublished/dateModified tracking

---

### ❌ Cannot Be Evaluated with Current Data (18-22 rules)

**Require Missing Extraction:**
1. ❌ **NAP Consistency** — Missing LocalBusiness schema, phone extraction
2. ❌ **Local Business Markers** — Missing service area, business hours
3. ❌ **Local Review Schema** — Missing AggregateRating/Review extraction
4. ❌ **Author Credentials** — Missing author bio, affiliation
5. ❌ **Author Publication Frequency** — Requires multi-page analysis
6. ❌ **Entity Fame Signals** — Requires external backlink data (banned)
7. ❌ **Knowledge Graph Eligibility** — Requires cross-page authority analysis
8. ❌ **robots.txt Directives** — Would need file-level parsing
9. ❌ **JavaScript Rendering** — Requires headless browser (not in scope)
10. ❌ **Core Web Vitals** — Requires PageSpeed Insights API (banned)
11. ❌ **Publisher Reputation** — Requires external verification sources
12. ❌ **Multi-language Hreflang** — Needs full language tag parsing
13. ❌ **Geo-targeting Signals** — Needs hreflang + location correlation
14. ❌ **Mobile Optimization** — Needs device-specific viewport analysis
15. ❌ **Pagination Rel Tags** — Needs rel=prev/next detection
16. ❌ **Canonical Redirect Chains** — Needs multi-hop canonicalization
17. ❌ **Structured Data Errors** — Needs schema validation beyond extraction
18. ❌ **Content Readability Beyond Metrics** — Needs readability score API

---

## STEP 3: CRITICAL DATA GAPS

### Priority 1: MUST EXTRACT (Enables 15+ rules)

#### A. Author & Byline Information
```json
{
  "author_signals": {
    "author_present": boolean,
    "author_schema_present": boolean,
    "author_name": string,
    "author_url": string,
    "author_type": "Person|Organization|null",
    "author_email": string,
    "author_bio": string,
    "author_affiliation": string,
    "author_expertise_tags": [string],
    "author_sameAs_urls": [string],
    "date_published": ISO8601,
    "date_modified": ISO8601,
    "byline_text": string,
    "author_credentials_in_schema": boolean,
    "author_name_consistency": {
      "schema_name": string,
      "byline_name": string,
      "matches": boolean
    }
  }
}
```

#### B. Entity Mentions & Co-occurrence
```json
{
  "entity_analysis": {
    "primary_entity_mentions": {
      "name": string,
      "mention_count": integer,
      "first_mention_paragraph": integer,
      "mention_proximity_score": float
    },
    "related_entities": [
      {
        "name": string,
        "type": string,
        "mention_count": integer,
        "relationships_to_primary": [string]
      }
    ],
    "entity_co_occurrence": {
      "entity_pairs": [
        {
          "entity_1": string,
          "entity_2": string,
          "co_occurrence_count": integer
        }
      ]
    },
    "entity_prominence": {
      "primary_entity_keyword_density": float,
      "entity_mention_distribution": object
    }
  }
}
```

#### C. LocalBusiness & NAP Data
```json
{
  "local_seo_signals": {
    "local_business_schema": {
      "present": boolean,
      "name": string,
      "phone": string,
      "address": {
        "street": string,
        "city": string,
        "state": string,
        "postal_code": string,
        "country": string
      },
      "service_areas": [string],
      "business_hours": object,
      "price_range": string
    },
    "nap_consistency": {
      "name_matches_organization": boolean,
      "phone_matches_schema": boolean,
      "address_matches_schema": boolean
    },
    "review_aggregation": {
      "rating_schema_present": boolean,
      "average_rating": float,
      "review_count": integer,
      "best_rating": integer,
      "worst_rating": integer
    }
  }
}
```

#### D. Direct Answer Detection
```json
{
  "answer_signals": {
    "answer_format": "paragraph|list|table|multiple",
    "direct_answer_present": boolean,
    "answer_text": string,
    "answer_word_count": integer,
    "answer_snippet_length": integer,
    "answer_position": "first_paragraph|body|section|faq",
    "answer_format_optimal": boolean,
    "featured_snippet_eligible": boolean,
    "answer_question_intent_match": {
      "intent_type": "how|why|what|when|where|who",
      "intent_match_score": float
    }
  }
}
```

#### E. Page Speed & Mobile Signals (HTML-only)
```json
{
  "technical_signals": {
    "viewport_meta": boolean,
    "mobile_friendly_viewport": boolean,
    "preload_tags": integer,
    "dns_prefetch_tags": integer,
    "resource_hints": {
      "preconnect": integer,
      "prefetch": integer,
      "preload": integer
    },
    "meta_tags": {
      "robots": string,
      "mobile_web_app_capable": boolean,
      "apple_mobile_web_app": boolean,
      "theme_color": string,
      "charset": string
    }
  }
}
```

---

### Priority 2: SHOULD EXTRACT (Enables 8-10 rules)

#### F. Pagination & Navigation
```json
{
  "pagination_signals": {
    "rel_next_present": boolean,
    "rel_prev_present": boolean,
    "rel_next_url": string,
    "rel_prev_url": string,
    "pagination_links": {
      "page_numbers": [integer],
      "navigation_pattern": "numbered|next_prev|load_more"
    },
    "canonical_handles_pagination": boolean
  }
}
```

#### G. Multi-language & Geo-targeting
```json
{
  "internationalization": {
    "hreflang_tags": [
      {
        "lang": string,
        "region": string,
        "url": string,
        "is_self_reference": boolean
      }
    ],
    "html_lang_attribute": string,
    "page_language_matches_hreflang": boolean,
    "x_default_present": boolean,
    "language_count": integer,
    "geo_targeting_via_hreflang": [string]
  }
}
```

#### H. Content Freshness
```json
{
  "freshness_signals": {
    "date_published": ISO8601,
    "date_modified": ISO8601,
    "days_since_modification": integer,
    "last_reviewed": ISO8601,
    "content_age_days": integer,
    "freshness_indicator_present": boolean,
    "evergreen_content": boolean
  }
}
```

#### I. Internal Link Context
```json
{
  "link_context": {
    "anchor_text": string,
    "surrounding_text": string,
    "link_position": "header|navigation|body|sidebar|footer",
    "link_proximity_to_main_content": integer,
    "contextual_relevance_score": float,
    "anchor_text_keyword_match": boolean
  }
}
```

#### J. Breadcrumb Completeness
```json
{
  "breadcrumb_validation": {
    "breadcrumb_positions_valid": boolean,
    "breadcrumb_urls_correct": boolean,
    "breadcrumb_text_descriptive": boolean,
    "breadcrumb_depth_matches_hierarchy": boolean,
    "home_link_present": boolean
  }
}
```

---

### Priority 3: NICE TO HAVE (Enables 5-7 rules)

#### K. Semantic Content Analysis
```json
{
  "semantic_signals": {
    "topic_keywords": [string],
    "keyword_clustering": object,
    "semantic_synonyms": [string],
    "related_topics": [string],
    "semantic_richness_score": float
  }
}
```

#### L. Robots & Crawlability
```json
{
  "crawlability_signals": {
    "meta_robots": string,
    "noindex_present": boolean,
    "nofollow_present": boolean,
    "nosnippet_present": boolean,
    "x_robots_tag": string,
    "crawlable": boolean
  }
}
```

#### M. AMP & Alternate Versions
```json
{
  "alternate_versions": {
    "amp_version_present": boolean,
    "amp_url": string,
    "canonical_from_amp": string,
    "mobile_version_present": boolean,
    "app_version_present": boolean
  }
}
```

---

## STEP 4: RECOMMENDED SCRAPING DATA STRUCTURE

### Production-Grade Enhanced Schema

```python
class AIVisibilityPageData(BaseModel):
    """Comprehensive AI visibility data for a single page"""
    
    # === PHASE 1: CORE IDENTIFIERS ===
    url: str
    canonical_url: str
    language: str
    country_code: Optional[str]
    
    # === PHASE 2: METADATA LAYER ===
    metadata: MetadataSignals
    
    # === PHASE 3: STRUCTURED DATA LAYER ===
    structured_data: StructuredDataLayer
    
    # === PHASE 4: CONTENT LAYER ===
    content: ContentAnalysis
    
    # === PHASE 5: ENTITY LAYER ===
    entities: EntityAnalysis
    
    # === PHASE 6: TECHNICAL LAYER ===
    technical: TechnicalSignals
    
    # === PHASE 7: LOCAL LAYER ===
    local: LocalSEOSignals
    
    # === PHASE 8: AUTHOR LAYER ===
    author: AuthorSignals
    
    # === EXTRACTION METADATA ===
    extraction_metadata: ExtractionMetadata


class MetadataSignals(BaseModel):
    """Page-level metadata"""
    title: str
    meta_description: str
    og_title: Optional[str]
    og_description: Optional[str]
    og_image: Optional[str]
    twitter_title: Optional[str]
    twitter_description: Optional[str]
    twitter_image: Optional[str]
    canonical: CanonicalData
    viewport: str
    charset: str


class StructuredDataLayer(BaseModel):
    """All structured data format extraction"""
    json_ld: JSONLDData
    microdata: MicrodataData
    rdfa: RDFaData
    format_mixed: bool


class ContentAnalysis(BaseModel):
    """Content structure and quality metrics"""
    main_content: MainContentData
    headings: HeadingAnalysis
    paragraphs: ParagraphMetrics
    sections: ContentSectionAnalysis
    answer_signals: AnswerEngineSignals
    images: ImageAnalysis
    videos: VideoAnalysis
    links: LinkAnalysis
    faq: FAQAnalysis


class EntityAnalysis(BaseModel):
    """Entity-level signals for E-E-A-T"""
    primary_entity: PrimaryEntity
    related_entities: List[RelatedEntity]
    co_occurrence: EntityCoOccurrence
    mention_analysis: EntityMentionAnalysis
    graph_structure: EntityGraphStructure


class AuthorSignals(BaseModel):
    """Author credentials and E-E-A-T"""
    author_present: bool
    author_schema: Optional[AuthorSchema]
    byline: Optional[BylineData]
    author_credentials: AuthorCredentials
    expertise_indicators: ExpertiseIndicators
    publication_signals: PublicationSignals


class TechnicalSignals(BaseModel):
    """Technical readiness for AI crawlers"""
    robots_meta: RobotsMeta
    crawlability: CrawlabilityData
    mobilefriendly: MobileFriendlyData
    performance_hints: PerformanceHints
    internationalization: InternationalizationData


class LocalSEOSignals(BaseModel):
    """Local business and geo-targeting"""
    local_business: Optional[LocalBusinessSchema]
    nap: NAPConsistency
    review_aggregation: ReviewAggregation
    service_areas: List[str]
    geographical_signals: GeoSignals
```

---

## STEP 5: FINAL COMPREHENSIVE EXTRACTION FIELDS

### **A. PAGE METADATA** (Essential, 18 fields)
- [x] `title` — Page title
- [x] `meta_description` — Meta description
- [x] `canonical_url` — Canonical link
- [x] `og_title` — Open Graph title
- [x] `og_description` — Open Graph description
- [x] `og_image` — Open Graph image
- [x] `twitter_title` — Twitter Card title
- [x] `twitter_description` — Twitter Card description
- [x] `twitter_image` — Twitter Card image
- [x] `viewport_meta` — Viewport tag for mobile
- [x] `charset` — Character encoding
- [x] `language_attribute` — HTML lang attribute
- [x] `language_hreflang` — Language from hreflang tags
- [x] `country_code` — Geo-targeting via hreflang
- [ ] `author_meta` — Author meta tag
- [ ] `robots_meta` — Robots meta tag
- [ ] `publish_date_meta` — Publication date meta
- [ ] `update_date_meta` — Update date meta

---

### **B. STRUCTURED DATA** (Comprehensive, 25 fields)
- [x] `json_ld_blocks_count` — Total JSON-LD scripts
- [x] `json_ld_valid_percentage` — Parse success rate
- [x] `json_ld_entities_count` — Total entities
- [x] `primary_entity_type` — Detected primary entity
- [x] `entity_graph_structure` — Relationship map
- [x] `organization_present` — Boolean
- [x] `organization_name` — Organization name
- [x] `organization_url` — Organization URL
- [x] `organization_logo` — Logo URL
- [x] `sameas_urls` — Social profile links
- [x] `breadcrumb_detected` — Boolean
- [x] `breadcrumb_items_count` — Item count
- [x] `breadcrumb_valid_sequence` — Sequence check
- [x] `faq_page_detected` — Boolean
- [x] `faq_items_count` — FAQ count
- [ ] `article_schema_present` — Boolean
- [ ] `article_author_schema` — Author in Article schema
- [ ] `article_publish_date` — datePublished field
- [ ] `article_modified_date` — dateModified field
- [ ] `product_schema_present` — Product schema
- [ ] `review_schema_present` — AggregateRating present
- [ ] `local_business_schema` — LocalBusiness present
- [ ] `video_schema_present` — VideoObject present
- [ ] `image_schema_present` — ImageObject present
- [ ] `schema_validation_errors` — Error count

---

### **C. CONTENT STRUCTURE** (Advanced, 30 fields)
- [x] `h1_count` — H1 tags
- [x] `h2_count` — H2 tags
- [x] `h3_count` — H3 tags
- [x] `h4_count` — H4+ tags
- [x] `heading_hierarchy_valid` — H1→H2→H3→H4 check
- [x] `main_content_word_count` — Total words
- [x] `main_content_extraction_method` — Source (article/main/body)
- [x] `paragraph_count` — Total paragraphs
- [x] `avg_paragraph_length` — Average words/paragraph
- [x] `short_paragraph_percentage` — % < 120 words
- [x] `long_paragraph_percentage` — % > 300 words
- [x] `avg_sentence_length` — Readability metric
- [ ] `readability_score` — Flesch-Kincaid or similar
- [ ] `definition_section_present` — Boolean
- [ ] `definition_section_words` — Word count
- [ ] `use_case_section_present` — Boolean
- [ ] `use_case_section_words` — Word count
- [ ] `process_section_present` — Boolean
- [ ] `process_section_words` — Word count
- [ ] `faq_section_present` — Boolean
- [ ] `faq_section_words` — Word count
- [ ] `edge_case_section_present` — Boolean (Limitations)
- [ ] `edge_case_section_words` — Word count
- [ ] `keyword_density_analysis` — Top 10 keywords
- [ ] `semantic_keyword_clustering` — Keyword groups
- [ ] `question_format_headings` — Count of question headings
- [ ] `list_items_count` — Ordered/unordered list items
- [ ] `code_blocks_present` — Boolean
- [ ] `citations_present` — External source links
- [ ] `table_count` — Data tables present

---

### **D. INTERNAL LINKING** (Strategic, 20 fields)
- [ ] `total_internal_links` — Count
- [ ] `unique_internal_urls` — Unique destinations
- [ ] `internal_link_density` — Links per 1000 words
- [ ] `orphaned_pages_detected` — Boolean (0 inbound links)
- [ ] `linking_distribution` — Most/least linked pages
- [ ] `anchor_text_diversity` — Unique anchor variation
- [ ] `anchor_text_keyword_match` — Keyword in anchor %
- [ ] `branded_anchor_percentage` — Brand name anchors
- [ ] `exact_match_anchor_percentage` — Exact keyword anchors
- [ ] `partial_match_anchor_percentage` — Partial keywords
- [ ] `generic_anchor_percentage` — "Click here" type
- [ ] `link_position_distribution` — Header/body/footer %
- [ ] `link_to_main_content_ratio` — Contextual links
- [ ] `siloed_linking_detected` — Topic clustering
- [ ] `circular_links_detected` — A→B→A patterns
- [ ] `reciprocal_links_detected` — Mutual linking
- [ ] `deep_linking_percentage` — % deeper than 2 levels
- [ ] `no_follow_percentage` — Rel=nofollow links
- [ ] `external_link_count` — To other domains
- [ ] `outbound_link_relevance` — Domain authority comparison

---

### **E. IMAGES** (Accessibility & SEO, 20 fields)
- [x] `total_images` — Count
- [x] `images_with_alt_text` — Count + percentage
- [x] `images_with_descriptive_alt` — Min 10 characters
- [x] `alt_text_avg_length` — Average alt text words
- [x] `images_with_title_attribute` — Count
- [x] `images_with_dimensions` — Width/height present
- [x] `responsive_images_percentage` — Srcset/sizes present
- [x] `lazy_loading_percentage` — Loading=lazy attribute
- [x] `duplicate_images_detected` — Same src multiple times
- [x] `image_format_distribution` — JPEG/PNG/WebP/SVG
- [ ] `images_compressed` — File size optimization
- [ ] `image_alt_keyword_match` — Target keywords in alt
- [ ] `above_fold_image_alt_coverage` — Above-the-fold completeness
- [ ] `image_to_text_ratio` — Content vs imagery balance
- [ ] `emoji_in_alt_text` — Accessibility concern
- [ ] `empty_alt_decorative_images` — Correctly marked
- [ ] `image_matches_schema_count` — Connected to schema
- [ ] `image_schema_coverage_percentage` — % with matching schema
- [ ] `featured_image_present` — Main image identified
- [ ] `featured_image_optimized` — Alt + dimensions

---

### **F. AUTHOR SIGNALS** (E-E-A-T Foundation, 25 fields)
- [ ] `author_present` — Boolean
- [ ] `author_name` — From byline or schema
- [ ] `author_url` — Author profile/page link
- [ ] `author_email` — Contact email
- [ ] `author_bio_present` — Boolean
- [ ] `author_bio_word_count` — Bio length
- [ ] `author_credentials_present` — Degree/certification
- [ ] `author_expertise_tags` — Domain expertise areas
- [ ] `author_company_affiliation` — Employment/org
- [ ] `author_sameAs_urls` — Social profiles (LinkedIn, etc.)
- [ ] `author_schema_present` — Person schema
- [ ] `author_schema_complete` — All properties present
- [ ] `author_image_present` — Profile photo
- [ ] `date_published_present` — Article datePublished
- [ ] `date_published_valid` — ISO 8601 format
- [ ] `date_modified_present` — dateModified field
- [ ] `date_modified_after_published` — Logical validation
- [ ] `author_name_consistency` — Byline vs schema match
- [ ] `author_mention_count` — Total mentions in page
- [ ] `author_byline_position` — Before/after content
- [ ] `author_expertise_domain_match` — Author expertise vs topic
- [ ] `author_publication_frequency` — (Multi-page analysis)
- [ ] `author_domain_history` — (Cross-domain analysis)
- [ ] `author_credentials_verifiable` — (SameAs validation)
- [ ] `author_e_e_a_t_score` — Composite (0-100)

---

### **G. ENTITY SIGNALS** (Brand & Organization, 22 fields)
- [x] `primary_entity_type` — Organization/Service/Product/Person
- [x] `primary_entity_name` — Entity name
- [x] `primary_entity_id` — URL-based @id
- [x] `primary_entity_description` — Schema description
- [x] `entity_count_total` — All entities on page
- [x] `entity_mentions_primary` — How many times primary entity mentioned
- [ ] `entity_mention_prominence` — Position & density
- [ ] `entity_name_consistency` — Exact vs variations
- [ ] `related_entities_count` — Secondary entities
- [ ] `entity_co_occurrence_clustering` — Associated entities
- [ ] `entity_type_consistency` — Same type across pages
- [ ] `entity_brand_identity_present` — Logo + colors + voice
- [ ] `ambiguous_entity_names` — Disambiguation needed
- [ ] `entity_relationship_graph_complete` — All relationships mapped
- [ ] `entity_references_internal` — Links to other entities on site
- [ ] `entity_references_external` — Links to partner entities
- [ ] `entity_description_length` — Word count
- [ ] `entity_description_uniqueness` — Vs competitor entities
- [ ] `entity_image_present` — Logo or photo
- [ ] `entity_knowledge_graph_eligible` — Signals of KG features
- [ ] `entity_disambiguation_signals` — To distinguish from similar entities
- [ ] `entity_expertise_domain_match` — Entity expertise = page topic

---

### **H. LOCAL SEO SIGNALS** (NAP & Location, 20 fields)
- [ ] `local_business_schema_present` — Boolean
- [ ] `business_name` — From LocalBusiness schema
- [ ] `business_phone` — Phone number
- [ ] `business_address_street` — Street address
- [ ] `business_address_city` — City
- [ ] `business_address_state` — State/Province
- [ ] `business_address_postal_code` — Postal code
- [ ] `business_address_country` — Country
- [ ] `nap_consistency` — Name/Address/Phone match check
- [ ] `service_areas_list` — Geographic service areas
- [ ] `service_area_coverage_map` — Service radius
- [ ] `business_hours_present` — Opening hours schema
- [ ] `business_type_classification` — Category
- [ ] `review_rating_present` — AggregateRating
- [ ] `review_average_rating` — 1-5 stars
- [ ] `review_count` — Total reviews
- [ ] `review_best_rating` — Best possible (usually 5)
- [ ] `review_worst_rating` — Worst possible (usually 1)
- [ ] `multiple_locations_detected` — Boolean
- [ ] `geo_coordinates_present` — Latitude/longitude

---

### **I. AI ANSWER OPTIMIZATION** (AEO/SGE, 18 fields)
- [ ] `direct_answer_present` — Boolean
- [ ] `direct_answer_text` — The answer text
- [ ] `direct_answer_word_count` — Optimal: 40-60 words
- [ ] `answer_position_in_page` — First section vs buried
- [ ] `answer_in_snippet_eligible` — Boolean
- [ ] `answer_format_type` — Paragraph/list/table/multiple
- [ ] `answer_snippet_optimal_length` — 40-60 words present
- [ ] `question_intent_detected` — How/Why/What/When/Where/Who
- [ ] `intent_answer_match_score` — Relevance (0-100)
- [ ] `featured_snippet_structured` — Optimal structure for Position 0
- [ ] `quick_answer_identifiable` — Can be truncated to ~60 words
- [ ] `question_format_headings_count` — Question-based headings
- [ ] `q_and_a_section_present` — FAQ section
- [ ] `multi_answer_support` — Multiple valid answers
- [ ] `related_questions_present` — "People also ask"
- [ ] `answer_supported_by_schema` — FAQPage or similar
- [ ] `answer_freshness_days` — Days since last update
- [ ] `answer_authority_signals` — E-E-A-T of answer

---

### **J. TECHNICAL READINESS** (AI Crawler Access, 20 fields)
- [x] `https_present` — HTTPS protocol
- [x] `www_consistency` — WWW normalization
- [x] `trailing_slash_consistency` — Consistent slash handling
- [x] `canonical_present` — Canonical tag
- [ ] `robots_meta_tag` — Content of robots meta
- [ ] `no_index_detected` — Noindex blocking
- [ ] `no_follow_global` — Nofollow on all links
- [ ] `nosnippet_detected` — Snippet blocking
- [ ] `x_robots_tag_present` — Header robots directive
- [ ] `meta_refresh_present` — Redirect via meta
- [ ] `mobile_friendly_viewport` — Mobile optimized
- [ ] `javascript_required` — Client-side rendering
- [ ] `json_ld_mobile_rendered` — JSON-LD accessible on mobile
- [ ] `page_speed_signal_optimization` — Resource hints (preload/prefetch)
- [ ] `dns_prefetch_tags` — DNS optimization
- [ ] `preconnect_tags` — Connection pooling
- [ ] `amp_version_present` — Accelerated Mobile Pages
- [ ] `pagination_rel_next` — Rel=next present
- [ ] `pagination_rel_prev` — Rel=prev present
- [ ] `crawlable_page_structure` — Scannable by bots

---

## STEP 6: IMPLEMENTATION PRIORITIES

### Phase 1 (Weeks 1-2): HIGH IMPACT — 12 new fields
```
Priority: Author signals, Entity mentions, Direct answer detection
Impact: Unlocks 15+ rules
Effort: 30-40 hours
```

### Phase 2 (Weeks 3-4): MEDIUM IMPACT — 18 new fields
```
Priority: Local business, pagination, internationalization
Impact: Unlocks 8-10 rules
Effort: 25-30 hours
```

### Phase 3 (Weeks 5-6): QUALITY IMPROVEMENTS — 15 new fields
```
Priority: Link context, semantic analysis, crawlability
Impact: Improves rule accuracy by 20%
Effort: 20-25 hours
```

---

## RECOMMENDATIONS

### ✅ What to Do NOW
1. **Extract author schema and byline** — Enables E-E-A-T evaluation
2. **Add LocalBusiness detection** — Enables NAP consistency rules
3. **Implement direct answer detection** — Enables AEO scoring
4. **Track entity mentions** — Enables entity prominence analysis
5. **Add publication date metadata** — Enables freshness signals

### ⚠️ What to Do NEXT
6. Extract internal link context
7. Add robots.txt and meta robots detection
8. Implement breadcrumb validation
9. Add hreflang and language tag parsing
10. Track multi-page author publication patterns

### ❌ What You CAN'T Do (Without External APIs)
- ✗ Core Web Vitals (needs PageSpeed API) — **BANNED**
- ✗ Backlink authority (needs GSC/backlink API) — **BANNED**
- ✗ Keyword difficulty/search volume (needs keyword API) — **BANNED**
- ✗ Publisher reputation validation (needs external sources) — **BANNED**

---

## CONCLUSION

Your scraper currently captures **~50% of needed AI SEO data**. With the 40+ recommended additional fields, you can evaluate **60+ of 68 AI visibility rules** without external APIs.

**Next Steps:**
1. Prioritize author and entity extraction (highest ROI)
2. Implement LocalBusiness schema parsing
3. Enhance answer engine optimization signals
4. Add multi-page cross-validation for publication patterns
5. Build rule engine consuming this data

**Estimated full implementation:** 10-12 weeks | **Effort:** 100-120 hours

---

**Document prepared for production AI SEO audit engine**  
**Scope: Scraper-only data collection without external APIs**
