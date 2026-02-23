"""
AEO (Answer Engine Optimization) Score Category Rules

Evaluates content optimization for answer engines and voice search.
Focuses on question-answer format, structured answers, and voice search readiness.
"""

import json
from typing import Dict, Any
from rule_base import BaseRule

class FAQStructureRule(BaseRule):
    """Evaluates FAQ structure and quality"""
    
    def __init__(self):
        config = {
            "rule_id": "faq_structure",
            "category": "aeo_score",
            "description": "Evaluates FAQ structure and quality",
            "weight": 2.0,
            "max_score": 20,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Evaluate FAQ structure"""
        faq_metrics = data.get("faq_metrics", {})
        structured_data = data.get("structured_data", {})
        
        score = 0
        
        # Check for FAQ detection
        if faq_metrics.get("faq_detected"):
            score += 8
        
        # Check FAQ schema
        if faq_metrics.get("faq_schema_detected"):
            score += 6
        
        # Check question count
        question_count = faq_metrics.get("question_count", 0)
        if question_count >= 5:
            score += 4
        elif question_count >= 3:
            score += 3
        elif question_count >= 1:
            score += 2
        
        # Check Q&A pairs
        qa_pairs = faq_metrics.get("qa_pairs_detected", 0)
        if qa_pairs >= 3:
            score += 2
        elif qa_pairs >= 1:
            score += 1
        
        return min(score, self.max_score)

class QuestionAnswerFormatRule(BaseRule):
    """Evaluates question-answer format throughout content"""
    
    def __init__(self):
        config = {
            "rule_id": "question_answer_format",
            "category": "aeo_score",
            "description": "Evaluates question-answer format throughout content",
            "weight": 1.5,
            "max_score": 15,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Evaluate Q&A format"""
        heading_metrics = data.get("heading_metrics", {})
        faq_metrics = data.get("faq_metrics", {})
        
        score = 0
        
        # Check question headings
        question_headings = heading_metrics.get("question_headings", 0)
        question_headings = len(question_headings) if isinstance(question_headings, list) else question_headings
        if question_headings >= 3:
            score += 6
        elif question_headings >= 2:
            score += 4
        elif question_headings >= 1:
            score += 2
        
        # Check Q&A pairs
        qa_pairs = faq_metrics.get("qa_pairs_detected", 0)
        qa_pairs = qa_pairs[0] if isinstance(qa_pairs, list) else qa_pairs
        if qa_pairs >= 5:
            score += 5
        elif qa_pairs >= 3:
            score += 3
        elif qa_pairs >= 1:
            score += 1
        
        # Check for question density
        total_questions = faq_metrics.get("question_count", 0)
        total_questions = total_questions[0] if isinstance(total_questions, list) else total_questions
        if total_questions >= 8:
            score += 4
        elif total_questions >= 5:
            score += 2
        elif total_questions >= 2:
            score += 1
        
        return min(score, self.max_score)

class StepByStepContentRule(BaseRule):
    """Evaluates step-by-step content structure"""
    
    def __init__(self):
        config = {
            "rule_id": "step_by_step_content",
            "category": "aeo_score",
            "description": "Evaluates step-by-step content structure",
            "weight": 1.5,
            "max_score": 15,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Evaluate step-by-step content"""
        step_metrics = data.get("step_metrics", {})
        structured_data = data.get("structured_data", {})
        
        score = 0
        
        # Check for step section
        if step_metrics.get("step_section_present"):
            score += 8
        
        # Check HowTo schema
        if step_metrics.get("howto_schema_detected"):
            score += 5
        
        # Check step count
        step_count = step_metrics.get("step_count", 0)
        if step_count >= 5:
            score += 2
        elif step_count >= 3:
            score += 1
        
        return min(score, self.max_score)

class VoiceSearchOptimizationRule(BaseRule):
    """Evaluates voice search optimization"""
    
    def __init__(self):
        config = {
            "rule_id": "voice_search_optimization",
            "category": "aeo_score",
            "description": "Evaluates voice search optimization",
            "weight": 1.0,
            "max_score": 10,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Evaluate voice search optimization"""
        content_metrics = data.get("content_metrics", {})
        intent_metrics = data.get("intent_metrics", {})
        
        score = 0
        
        # Check for conversational content
        avg_sentence_length = content_metrics.get("avg_sentence_length", 0)
        if 10 <= avg_sentence_length <= 18:  # Conversational length
            score += 3
        elif 8 <= avg_sentence_length <= 22:
            score += 2
        elif avg_sentence_length > 0:
            score += 1
        
        # Check readability for voice
        readability = content_metrics.get("readability_score", 0)
        if 50 <= readability <= 70:  # Easy to read aloud
            score += 3
        elif 40 <= readability <= 80:
            score += 2
        elif readability > 0:
            score += 1
        
        # Check for question intent
        intent_dist = intent_metrics.get("intent_distribution", {})
        informational = intent_dist.get("informational", 0)
        if informational >= 40:  # High informational content
            score += 4
        elif informational >= 25:
            score += 2
        elif informational >= 10:
            score += 1
        
        return min(score, self.max_score)

class DirectAnswerCapabilityRule(BaseRule):
    """Evaluates capability to provide direct answers"""
    
    def __init__(self):
        config = {
            "rule_id": "direct_answer_capability",
            "category": "aeo_score",
            "description": "Evaluates capability to provide direct answers",
            "weight": 1.0,
            "max_score": 10,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Evaluate direct answer capability"""
        faq_metrics = data.get("faq_metrics", {})
        content_metrics = data.get("content_metrics", {})
        
        score = 0
        
        # Check for concise answers in Q&A pairs
        qa_pairs = faq_metrics.get("qa_pairs_detected", 0)
        if qa_pairs >= 3:
            score += 4
        elif qa_pairs >= 1:
            score += 2
        
        # Check paragraph length (shorter paragraphs better for direct answers)
        avg_paragraph_length = content_metrics.get("avg_paragraph_length", 0)
        if 30 <= avg_paragraph_length <= 80:
            score += 3
        elif 20 <= avg_paragraph_length <= 120:
            score += 2
        elif avg_paragraph_length > 0:
            score += 1
        
        # Check for question count
        question_count = faq_metrics.get("question_count", 0)
        if question_count >= 5:
            score += 3
        elif question_count >= 2:
            score += 2
        elif question_count >= 1:
            score += 1
        
        return min(score, self.max_score)

class FeaturedSnippetOptimizationRule(BaseRule):
    """Evaluates featured snippet optimization"""
    
    def __init__(self):
        config = {
            "rule_id": "featured_snippet_optimization",
            "category": "aeo_score",
            "description": "Evaluates featured snippet optimization",
            "weight": 1.0,
            "max_score": 10,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Evaluate featured snippet optimization"""
        heading_metrics = data.get("heading_metrics", {})
        content_metrics = data.get("content_metrics", {})
        step_metrics = data.get("step_metrics", {})
        
        score = 0
        
        # Check for list/bullet point structure
        h2_count = heading_metrics.get("h2_count", 0)
        h3_count = heading_metrics.get("h3_count", 0)
        h2_count = h2_count[0] if isinstance(h2_count, list) else h2_count
        h3_count = h3_count[0] if isinstance(h3_count, list) else h3_count
        if h2_count >= 2 or h3_count >= 3:
            score += 3
        
        # Check for step-by-step (good for featured snippets)
        if step_metrics.get("step_section_present"):
            score += 3
        
        # Check for definition-style content
        paragraph_count = content_metrics.get("paragraph_count", 0)
        paragraph_count = paragraph_count[0] if isinstance(paragraph_count, list) else paragraph_count
        if paragraph_count >= 2:
            score += 2
        
        # Check for question headings
        question_headings = heading_metrics.get("question_headings", 0)
        question_headings = len(question_headings) if isinstance(question_headings, list) else question_headings
        if question_headings >= 1:
            score += 2
        
        return min(score, self.max_score)

class ConversationalContentRule(BaseRule):
    """Evaluates conversational content style"""
    
    def __init__(self):
        config = {
            "rule_id": "conversational_content",
            "category": "aeo_score",
            "description": "Evaluates conversational content style",
            "weight": 1.0,
            "max_score": 10,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Evaluate conversational content"""
        content_metrics = data.get("content_metrics", {})
        intent_metrics = data.get("intent_metrics", {})
        
        score = 0
        
        # Check sentence length (conversational)
        avg_sentence_length = content_metrics.get("avg_sentence_length", 0)
        if 12 <= avg_sentence_length <= 20:
            score += 3
        elif 10 <= avg_sentence_length <= 25:
            score += 2
        elif avg_sentence_length > 0:
            score += 1
        
        # Check readability (conversational)
        readability = content_metrics.get("readability_score", 0)
        if 60 <= readability <= 80:
            score += 3
        elif 50 <= readability <= 85:
            score += 2
        elif readability > 0:
            score += 1
        
        # Check for informational intent
        intent_dist = intent_metrics.get("intent_distribution", {})
        informational = intent_dist.get("informational", 0)
        if informational >= 30:
            score += 4
        elif informational >= 15:
            score += 2
        elif informational >= 5:
            score += 1
        
        return min(score, self.max_score)

class StructuredAnswerRule(BaseRule):
    """Evaluates structured answer formats"""
    
    def __init__(self):
        config = {
            "rule_id": "structured_answer",
            "category": "aeo_score",
            "description": "Evaluates structured answer formats",
            "weight": 1.0,
            "max_score": 10,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Evaluate structured answer formats"""
        structured_data = data.get("structured_data", {})
        if isinstance(structured_data, str):
            try:
                structured_data = json.loads(structured_data)
            except (json.JSONDecodeError, TypeError):
                structured_data = {}
        faq_metrics = data.get("faq_metrics", {})
        step_metrics = data.get("step_metrics", {})
        
        score = 0
        
        # Check for FAQ schema
        if faq_metrics.get("faq_schema_detected"):
            score += 4
        
        # Check for HowTo schema
        if step_metrics.get("howto_schema_detected"):
            score += 3
        
        # Check for other structured data types
        graph = structured_data.get("@graph", [])
        for item in graph:
            if item.get("@type") in ["FAQPage", "HowTo", "Recipe", "Instructions"]:
                score += 2
                break
        
        # Check for Q&A pairs
        qa_pairs = faq_metrics.get("qa_pairs_detected", 0)
        if qa_pairs >= 2:
            score += 1
        
        return min(score, self.max_score)

class DefinitionStructureQualityRule(BaseRule):
    """Evaluates definition-style content structure for answer engines"""
    
    def __init__(self):
        config = {
            "rule_id": "definition_structure_quality",
            "category": "aeo_score",
            "description": "Evaluates definition-style content structure for answer engines",
            "weight": 0.6,
            "max_score": 10,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Evaluate definition structure quality"""
        content_metrics = data.get("content_metrics", {})
        heading_metrics = data.get("heading_metrics", {})
        
        score = 0
        
        # Check for definition-style paragraph structure
        # Definition content typically has shorter initial paragraphs
        avg_paragraph_length = content_metrics.get("avg_paragraph_length", 0)
        paragraph_count = content_metrics.get("paragraph_count", 0)
        paragraph_count = paragraph_count[0] if isinstance(paragraph_count, list) else paragraph_count
        
        if 30 <= avg_paragraph_length <= 80 and paragraph_count >= 2:
            score += 3  # Good for definitions
        elif 20 <= avg_paragraph_length <= 100 and paragraph_count >= 1:
            score += 2
        
        # Check for question headings (common in definition content)
        question_headings = heading_metrics.get("question_headings", 0)
        h2_count = heading_metrics.get("h2_count", 0)
        question_headings = len(question_headings) if isinstance(question_headings, list) else question_headings
        h2_count = h2_count[0] if isinstance(h2_count, list) else h2_count
        
        if question_headings >= 1:
            if h2_count >= 1:
                # High ratio of question headings indicates definition format
                ratio = question_headings / max(h2_count, 1)
                if ratio >= 0.5:
                    score += 4
                elif ratio >= 0.3:
                    score += 3
                else:
                    score += 2
            else:
                score += 1
        
        # Check for sentence structure (definitions often have varied lengths)
        avg_sentence_length = content_metrics.get("avg_sentence_length", 0)
        if 10 <= avg_sentence_length <= 18:  # Clear, definitional sentences
            score += 3
        elif 8 <= avg_sentence_length <= 22:
            score += 2
        
        return min(score, self.max_score)

class ComparisonReadinessRule(BaseRule):
    """Evaluates content structure for comparison-type queries"""
    
    def __init__(self):
        config = {
            "rule_id": "comparison_readiness",
            "category": "aeo_score",
            "description": "Evaluates content structure for comparison-type queries",
            "weight": 0.5,
            "max_score": 10,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Evaluate comparison readiness"""
        heading_metrics = data.get("heading_metrics", {})
        content_metrics = data.get("content_metrics", {})
        entity_metrics = data.get("entity_metrics", {})
        
        score = 0
        
        # Check for balanced heading structure (good for comparisons)
        h2_count = heading_metrics.get("h2_count", 0)
        h3_count = heading_metrics.get("h3_count", 0)
        
        if h2_count >= 2 and h3_count >= 2:  # Multiple sections with subsections
            score += 3
        elif h2_count >= 2 and h3_count >= 1:
            score += 2
        elif h2_count >= 2:
            score += 1
        
        # Check for multiple entities (comparison requires multiple subjects)
        entity_count = entity_metrics.get("entity_count", 0)
        if entity_count >= 3:
            score += 3
        elif entity_count >= 2:
            score += 2
        elif entity_count >= 1:
            score += 1
        
        # Check paragraph consistency (comparisons need consistent structure)
        short_ratio = content_metrics.get("short_paragraph_ratio", 0)
        long_ratio = content_metrics.get("long_paragraph_ratio", 0)
        
        # Balanced mix indicates structured comparison content
        if 0.2 <= short_ratio <= 0.4 and long_ratio <= 0.4:
            score += 2
        elif short_ratio >= 0.1 and long_ratio <= 0.5:
            score += 1
        
        # Check content length (comparisons need sufficient detail)
        word_count = content_metrics.get("word_count", 0)
        if word_count >= 500:
            score += 2
        elif word_count >= 300:
            score += 1
        
        return min(score, self.max_score)

class SpeakableSchemaRule(BaseRule):
    """Evaluates speakable schema markup for voice search"""
    
    def __init__(self):
        config = {
            "rule_id": "speakable_schema",
            "category": "aeo_score",
            "description": "Evaluates speakable schema markup for voice search",
            "weight": 0.7,
            "max_score": 10,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Evaluate speakable schema"""
        structured_data = data.get("structured_data", {})
        if isinstance(structured_data, str):
            try:
                structured_data = json.loads(structured_data)
            except (json.JSONDecodeError, TypeError):
                structured_data = {}
        content_metrics = data.get("content_metrics", {})
        
        score = 0
        graph = structured_data.get("@graph", [])
        
        # Check for speakable markup in WebPage or Article types
        for item in graph:
            item_type = item.get("@type", "")
            if item_type in ["WebPage", "Article", "BlogPosting"]:
                # Check for speakable property
                speakable = item.get("speakable", {})
                if speakable:
                    score += 5
                    # Check if speakable specifies CSS selectors or xpaths
                    if speakable.get("cssSelector") or speakable.get("xpath"):
                        score += 3
                    break
        
        # Check for WebPage type specifically (most common for speakable)
        for item in graph:
            if item.get("@type") == "WebPage":
                score += 2
                # Bonus for name and description (spoken by voice assistants)
                if item.get("name") and item.get("description"):
                    score += 2
                break
        
        # Check readability for speakability
        readability = content_metrics.get("readability_score", 0)
        if 50 <= readability <= 75:  # Optimal for voice
            score += 2
        elif 40 <= readability <= 85:
            score += 1
        
        return min(score, self.max_score)

# Register all AEO Score rules
def register_aeo_score_rules(registry):
    """Register all AEO Score category rules"""
    registry.register(FAQStructureRule())
    registry.register(QuestionAnswerFormatRule())
    registry.register(StepByStepContentRule())
    registry.register(VoiceSearchOptimizationRule())
    registry.register(DirectAnswerCapabilityRule())
    registry.register(FeaturedSnippetOptimizationRule())
    registry.register(ConversationalContentRule())
    registry.register(StructuredAnswerRule())
    registry.register(DefinitionStructureQualityRule())
    registry.register(ComparisonReadinessRule())
    registry.register(SpeakableSchemaRule())
