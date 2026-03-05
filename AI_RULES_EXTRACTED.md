# AI Rules Extraction - Odito Codebase

**Date Generated:** March 4, 2026  
**Total AI Rules:** 63  
**Categories:** 6

---

## Table of Contents

1. [AEO Score (Answer Engine Optimization)](#aeo-score)
2. [Citation Probability](#citation-probability)
3. [Voice & Intent](#voice--intent)
4. [Topical Authority](#topical-authority)
5. [LLM Readiness](#llm-readiness)
6. [AI Impact](#ai-impact)

---

## AEO Score

**Category:** Answer Engine Optimization  
**File:** `python_workers/scraper/workers/ai/ai_scoring_v2/categories/aeo_score.py`

### Rules

| Rule ID | Rule Name | Weight | Max Score | Description |
|---------|-----------|--------|-----------|-------------|
| `faq_structure` | FAQ Structure Rule | 2.0 | 20 | Evaluates FAQ structure and quality |
| `question_answer_format` | Question Answer Format Rule | 1.5 | 15 | Evaluates question-answer format throughout content |
| `step_by_step_content` | Step by Step Content Rule | 1.5 | 15 | Evaluates step-by-step content structure |
| `voice_search_optimization` | Voice Search Optimization Rule | 1.0 | 10 | Evaluates voice search optimization |
| `direct_answer_capability` | Direct Answer Capability Rule | 1.0 | 10 | Evaluates capability to provide direct answers |
| `featured_snippet_optimization` | Featured Snippet Optimization Rule | 1.0 | 10 | Evaluates featured snippet optimization |
| `conversational_content` | Conversational Content Rule | 1.0 | 10 | Evaluates conversational content style |
| `structured_answer` | Structured Answer Rule | 1.0 | 10 | Evaluates structured answer formats |
| `definition_structure_quality` | Definition Structure Quality Rule | 0.6 | 10 | Evaluates definition-style content structure for answer engines |
| `comparison_readiness` | Comparison Readiness Rule | 0.5 | 10 | Evaluates content structure for comparison-type queries |
| `speakable_schema` | Speakable Schema Rule | 0.7 | 10 | Evaluates speakable schema markup for voice search |

---

## Citation Probability

**Category:** Citation Probability Score  
**File:** `python_workers/scraper/workers/ai/ai_scoring_v2/categories/citation_probability.py`

### Rules

| Rule ID | Rule Name | Weight | Max Score | Description |
|---------|-----------|--------|-----------|-------------|
| `authority_signals` | Authority Signals Rule | 2.0 | 20 | Evaluates authority signals in content |
| `trustworthiness_indicators` | Trustworthiness Indicators Rule | 1.5 | 15 | Evaluates trustworthiness indicators |
| `content_depth` | Content Depth Rule | 1.5 | 15 | Evaluates content depth and comprehensiveness |
| `expertise_indicators` | Expertise Indicators Rule | 1.0 | 10 | Evaluates expertise indicators in content |
| `data_and_sources` | Data and Sources Rule | 1.0 | 10 | Evaluates presence of data and source references |
| `uniqueness_value` | Uniqueness Value Rule | 1.0 | 10 | Evaluates uniqueness and value proposition |
| `technical_quality` | Technical Quality Rule | 1.0 | 10 | Evaluates technical quality affecting citation likelihood |
| `external_validation` | External Validation Rule | 1.0 | 10 | Evaluates external validation signals |
| `social_proof_signals` | Social Proof Signals Rule | 0.6 | 10 | Evaluates social proof signals like reviews and ratings |
| `contact_completeness` | Contact Completeness Rule | 0.5 | 10 | Evaluates completeness of contact information for trust signals |
| `citation_format_readiness` | Citation Format Readiness Rule | 0.7 | 10 | Evaluates readiness for academic/professional citation |
  - External entities (≥1): +1 point
  - Review/Rating/AggregateRating schema: +2 points

#### Social Proof Signals Rule
- **Scoring Logic:**
  - AggregateRating/Review/Rating schema: +4 points
  - Rating value present: +2 points
  - Review count/rating count: +2 points
  - Product/Service/LocalBusiness with ratings: +2 points

#### Contact Completeness Rule
- **Scoring Logic:**
  - Organization/LocalBusiness/Person entity:
    - 4+ contact points: +7 points
    - 3 contact points: +5 points
    - 2 contact points: +3 points
    - 1 contact point: +1 point

#### Citation Format Readiness Rule
- **Scoring Logic:**
  - Academic/professional content types: +5 points
  - Citation fields present: +2 points
  - Person/Author with name: +2 points
  - Person affiliation/alumni: +1 point
  - Word count ≥1500: +2 points
  - Word count ≥1000: +1 point

---

## Voice & Intent

**Category:** Voice & Intent Score  
**File:** `python_workers/scraper/workers/ai/ai_scoring_v2/categories/voice_intent.py`  
**Description:** Evaluates content optimization for voice search and user intent. Focuses on conversational language, intent matching, and voice search readiness.

### Rules (11 total)

| # | Rule ID | Rule Name | Weight | Max Score | Applies To |
|---|---------|-----------|--------|-----------|-----------|
| 1 | `intent_clarity` | Intent Clarity Rule | 2.0 | 30 | page |
| 2 | `conversational_language` | Conversational Language Rule | 1.5 | 25 | page |
| 3 | `voice_search_readiness` | Voice Search Readiness Rule | 1.5 | 100 | page |
| 4 | `question_optimization` | Question Optimization Rule | 1.0 | 10 | page |
| 5 | `natural_language_patterns` | Natural Language Patterns Rule | 1.0 | 10 | page |
| 6 | `user_intent_alignment` | User Intent Alignment Rule | 1.0 | 10 | page |
| 7 | `voice_query_compatibility` | Voice Query Compatibility Rule | 1.0 | 10 | page |
| 8 | `contextual_relevance` | Contextual Relevance Rule | 1.0 | 10 | page |
| 9 | `command_phrase_detection` | Command Phrase Detection Rule | 0.6 | 10 | page |
| 10 | `conversational_flow_quality` | Conversational Flow Quality Rule | 0.7 | 10 | page |
| 11 | `voice_intent_advanced_clarity` | Voice Intent Advanced Clarity Rule | 1.5 | 20 | page |

#### Intent Clarity Rule
- **Scoring Logic:**
  - High confidence: +15 points
  - Medium confidence: +10 points
  - Low confidence: +5 points
  - Dominant intent ≥60%: +6 points
  - Dominant intent ≥40%: +4 points
  - Dominant intent ≥25%: +2 points
  - Dominant intent ≥15%: +1 point
  - Clear primary intent (ratio ≥1.5): +4 points
  - Primary intent ratio ≥1.2: +2 points
  - Primary intent > secondary: +1 point
  - Informational intent ≥30%: +2 points

#### Conversational Language Rule
- **Quality Dominance:** Answer quality ratio < 0.5 = 0.3x penalty; 0.5-0.8 = 0.7x penalty; ≥0.8 = 1.0x multiplier
- **Scoring Logic:**
  - Sentence length 12-18: +10 points
  - Readability 60-80: +8 points
  - Readability 50-85: +6 points
  - Readability 40-90: +4 points
  - Readability > 0: +2 points
  - Paragraph length 40-100: +3 points
  - Paragraph length 30-120: +2 points
  - Paragraph length 20-150: +1 point
  - Question headings ≥2: +3 points
  - Question headings ≥1: +2 points

#### Voice Search Readiness Rule
- **Scoring Logic (Continuous):**
  - FAQ present: +5 points
  - Question count calculation:
    - Answer quality <0.5: hard cap of 15 points
    - Answer quality ≥0.9 + questions ≥30: raw score 80
    - Answer quality ≥0.8 + questions ≥20: raw score 60
  - Sigmoid dominance applied based on answer quality ratio
  - Informational intent scoring (0-3 points)
  - Readability optimization (0-3 points)

#### Question Optimization Rule
- **Quality Dominance Applied** (penalty based on answer quality)
- **Scoring Logic:**
  - Question headings ≥4: +4 points
  - Question headings ≥2: +3 points
  - Question headings ≥1: +2 points
  - Q&A pairs ≥3: +3 points
  - Q&A pairs ≥1: +2 points
  - Total questions ≥6: +3 points
  - Total questions ≥3: +2 points
  - Total questions ≥1: +1 point
  - Hard cap of 25 points for poor quality content

#### Natural Language Patterns Rule
- **Quality Dominance Applied**
- **Scoring Logic:**
  - Sentence length 14-16: +4 points
  - Sentence length 12-18: +3 points
  - Sentence length 10-20: +2 points
  - Sentence length > 0: +1 point
  - Paragraph length 50-80: +3 points
  - Paragraph length 40-100: +2 points
  - Paragraph length 30-120: +1 point
  - Short paragraph ratio 0.2-0.4: +3 points
  - Short ratio 0.1-0.5: +2 points
  - Short ratio ≥0.05: +1 point

#### User Intent Alignment Rule
- **Quality Dominance Applied**
- **Scoring Logic:**
  - Dominant intent ≥50%: +4 points
  - Dominant intent ≥35%: +3 points
  - Dominant intent ≥25%: +2 points
  - Dominant intent ≥15%: +1 point
  - High confidence: +3 points
  - Medium confidence: +2 points
  - Low confidence: +1 point
  - Informational intent ≥35%: +3 points
  - Informational intent ≥20%: +2 points
  - Informational intent ≥10%: +1 point

#### Voice Query Compatibility Rule
- **Quality Dominance Applied**
- **Scoring Logic:**
  - Q&A pairs ≥2: +3 points
  - Q&A pairs ≥1: +2 points
  - Question headings ≥2: +2 points
  - Question headings ≥1: +1 point
  - Paragraph length 30-90: +2 points
  - Paragraph length 20-120: +1 point
  - Readability 55-75: +3 points
  - Readability 45-85: +2 points
  - Readability > 0: +1 point

#### Contextual Relevance Rule
- **Quality Dominance Applied**
- **Scoring Logic:**
  - Word count 500-1500: +3 points
  - Word count 300-2000: +2 points
  - Word count ≥200: +1 point
  - Entity density 4-10: +3 points
  - Entity density 3-12: +2 points
  - Entity density ≥2: +1 point
  - High confidence: +4 points
  - Medium confidence: +2 points
  - Low confidence: +1 point

#### Command Phrase Detection Rule
- **Scoring Logic:**
  - Transactional/commercial intent ≥20%: +3 points
  - Transactional/commercial intent ≥10%: +2 points
  - Transactional/commercial intent > 0: +1 point
  - Action-oriented headings (ratio ≥0.5): +4 points
  - Action ratio 0.3-0.5: +3 points
  - Action ratio > 0: +2 points
  - High confidence: +3 points
  - Medium confidence: +2 points
  - Low confidence: +1 point

#### Conversational Flow Quality Rule
- **Scoring Logic:**
  - FAQ with Q&A pairs ≥3: +4 points
  - FAQ with Q&A pairs ≥1: +2 points
  - Sentence length 12-18 + short ratio ≥0.1: +3 points
  - Sentence length 10-20 + short ratio ≥0.05: +2 points
  - Sentence length > 0: +1 point
  - Readability 55-75: +3 points
  - Readability 45-80: +2 points
  - Readability > 0: +1 point
  - Informational intent ≥40%: +2 points
  - Informational intent ≥25%: +1 point

#### Intent Clarity Advanced Rule
- Weight: 1.5, Max Score: 20
- Evaluates intent clarity with answer quality consideration

---

## Topical Authority

**Category:** Topical Authority Score  
**File:** `python_workers/scraper/workers/ai/ai_scoring_v2/categories/topical_authority.py`

### Rules

| Rule ID | Rule Name | Weight | Max Score | Description |
|---------|-----------|--------|-----------|-------------|
| `entity_richness` | Entity Richness Rule | 2.0 | 20 | Evaluates richness and diversity of entities |
| `topical_depth` | Topical Depth Rule | 1.5 | 15 | Evaluates depth of topical coverage |
| `primary_entity_authority` | Primary Entity Authority Rule | 1.5 | 15 | Evaluates authority of primary entity |
| `entity_relationships` | Entity Relationships Rule | 1.0 | 10 | Evaluates quality and quantity of entity relationships |
| `topic_consistency` | Topic Consistency Rule | 1.0 | 10 | Evaluates consistency of topic throughout content |
| `expertise_signals` | Expertise Signals Rule | 1.0 | 10 | Evaluates expertise and authority signals |
| `content_comprehensiveness` | Content Comprehensiveness Rule | 1.0 | 10 | Evaluates comprehensiveness of content coverage |
| `entity_validation` | Entity Validation Rule | 1.0 | 10 | Evaluates validation and quality of entities |
| `entity_mention_distribution` | Entity Mention Distribution Rule | 0.6 | 10 | Evaluates distribution of entity mentions throughout content |
| `schema_type_diversity` | Schema Type Diversity Rule | 0.5 | 10 | Evaluates diversity of schema types indicating topic breadth |

---

## LLM Readiness

**Category:** LLM Readiness Score  
**File:** `python_workers/scraper/workers/ai/ai_scoring_v2/categories/llm_readiness.py`

### Rules

| Rule ID | Rule Name | Weight | Max Score | Description |
|---------|-----------|--------|-----------|-------------|
| `content_structure_clarity` | Content Structure Clarity Rule | 2.0 | 20 | Evaluates clarity of content structure for LLM processing |
| `readability_optimization` | Readability Optimization Rule | 1.5 | 15 | Evaluates readability optimization for LLM comprehension |
| `content_length_optimization` | Content Length Optimization Rule | 1.0 | 10 | Evaluates content length optimization for LLM processing |
| `language_clarity` | Language Clarity Rule | 1.0 | 10 | Evaluates language clarity and simplicity |
| `semantic_coherence` | Semantic Coherence Rule | 1.0 | 10 | Evaluates semantic coherence and topic consistency |
| `technical_formatting` | Technical Formatting Rule | 1.0 | 10 | Evaluates technical formatting for LLM processing |
| `vocabulary_complexity` | Vocabulary Complexity Rule | 1.0 | 10 | Evaluates vocabulary complexity for LLM understanding |
| `content_organization` | Content Organization Rule | 1.5 | 15 | Evaluates overall content organization for LLM processing |
| `list_structure_quality` | List Structure Quality Rule | 0.6 | 10 | Evaluates list and table structure quality for LLM parsing |
| `content_chunking` | Content Chunking Rule | 0.5 | 10 | Evaluates content chunking for optimal LLM token processing |

---

## AI Impact

**Category:** AI Impact Score  
**File:** `python_workers/scraper/workers/ai/ai_scoring_v2/categories/ai_impact.py`

### Rules

| Rule ID | Rule Name | Weight | Max Score | Description |
|---------|-----------|--------|-----------|-------------|
| `structured_data_completeness` | Structured Data Completeness Rule | 2.0 | 20 | Evaluates completeness and quality of structured data |
| `entity_graph_quality` | Entity Graph Quality Rule | 1.5 | 15 | Evaluates quality and richness of entity graph |
| `content_semantic_clarity` | Content Semantic Clarity Rule | 1.0 | 10 | Evaluates semantic clarity and topic focus |
| `schema_markup_validation` | Schema Markup Validation Rule | 1.5 | 15 | Validates schema markup correctness and completeness |
| `ai_content_optimization` | AI Content Optimization Rule | 1.0 | 10 | Evaluates content optimization for AI processing |
| `technical_ai_readiness` | Technical AI Readiness Rule | 1.0 | 10 | Evaluates technical readiness for AI processing |
| `entity_consistency` | Entity Consistency Rule | 1.0 | 10 | Evaluates entity consistency across content |
| `cross_reference_quality` | Cross Reference Quality Rule | 1.0 | 10 | Evaluates cross-references and internal linking quality |
| `breadcrumb_navigation` | Breadcrumb Navigation Rule | 0.6 | 10 | Evaluates breadcrumb navigation presence and quality |
| `content_freshness` | Content Freshness Rule | 0.5 | 10 | Evaluates content freshness signals |
| `image_schema_completeness` | Image Schema Completeness Rule | 0.7 | 10 | Evaluates image schema completeness for visual content |

---

## Summary Statistics

| Category | Total Rules | Total Weight | Avg Max Score |
|----------|------------|--------------|---------------|
| AEO Score | 11 | 11.8 | 12.7 |
| Citation Probability | 11 | 12.0 | 12.3 |
| Voice & Intent | 11 | 15.4 | 20.1 |
| Topical Authority | 10 | 11.1 | 12.2 |
| LLM Readiness | 10 | 11.5 | 12.5 |
| AI Impact | 11 | 11.0 | 12.0 |
| **TOTAL** | **65** | **72.8** | **14.3** |

---

## File References

- **Base Rule Class**: `python_workers/scraper/workers/ai/ai_scoring_v2/rule_base.py`
- **AEO Rules**: `python_workers/scraper/workers/ai/ai_scoring_v2/categories/aeo_score.py`
- **Citation Rules**: `python_workers/scraper/workers/ai/ai_scoring_v2/categories/citation_probability.py`
- **Voice Rules**: `python_workers/scraper/workers/ai/ai_scoring_v2/categories/voice_intent.py`
- **Topical Rules**: `python_workers/scraper/workers/ai/ai_scoring_v2/categories/topical_authority.py`
- **LLM Rules**: `python_workers/scraper/workers/ai/ai_scoring_v2/categories/llm_readiness.py`
- **AI Impact Rules**: `python_workers/scraper/workers/ai/ai_scoring_v2/categories/ai_impact.py`

---

**End of AI Rules Extraction**
