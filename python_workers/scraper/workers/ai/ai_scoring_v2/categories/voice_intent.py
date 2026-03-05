"""
Voice & Intent Score Category Rules

Evaluates content optimization for voice search and user intent.
Focuses on conversational language, intent matching, and voice search readiness.
"""

from typing import Dict, Any
from rule_base import BaseRule

class BulletNumberedListsUsedRule(BaseRule):
    """Rule 51 — Bullet / numbered lists used"""
    
    def __init__(self):
        config = {
            "rule_id": "bullet_numbered_lists_used",
            "category": "voice_intent",
            "description": "Bullet / numbered lists used",
            "weight": 1.0,
            "max_score": 10,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Check for bullet and numbered lists"""
        content_metrics = data.get("content_metrics", {})
        heading_metrics = data.get("heading_metrics", {})
        
        score = 0
        
        # Check for structured content (indicates lists)
        h2_count = heading_metrics.get("h2_count", 0)
        h3_count = heading_metrics.get("h3_count", 0)
        h2_count = h2_count[0] if isinstance(h2_count, list) else h2_count
        h3_count = h3_count[0] if isinstance(h3_count, list) else h3_count
        
        # Multiple headings often indicate list-based content
        if h2_count >= 2 or h3_count >= 3:
            score += 5
        elif h2_count >= 1 or h3_count >= 1:
            score += 3
        
        # Check for short paragraphs (often used in lists)
        short_ratio = content_metrics.get("short_paragraph_ratio", 0)
        if short_ratio >= 0.2:
            score += 3
        elif short_ratio >= 0.1:
            score += 2
        
        # Check for content length (lists need sufficient content)
        word_count = content_metrics.get("word_count", 0)
        if word_count >= 300:
            score += 2
        elif word_count >= 150:
            score += 1
        
        return min(score, self.max_score)

class ComparisonTablesPresentRule(BaseRule):
    """Rule 52 — Comparison tables present"""
    
    def __init__(self):
        config = {
            "rule_id": "comparison_tables_present",
            "category": "voice_intent",
            "description": "Comparison tables present",
            "weight": 1.0,
            "max_score": 10,
            "applies_to": "page"
        }
        super().__init__(config)
    
    def evaluate(self, data: Dict[str, Any]) -> float:
        """Check for comparison tables"""
        # Check the actual extracted signal for tables
        ai_signals = data.get("ai_visibility_signals", {})
        tables = ai_signals.get("tables", {})
        
        # Return score based on actual table presence
        if tables.get("present", False):
            # Bonus points for more substantial tables
            rows = tables.get("rows", 0)
            headers = tables.get("headers", 0)
            
            if rows >= 3 and headers >= 2:
                return 10.0  # Full score for substantial tables
            elif rows >= 1:
                return 7.0   # Partial score for simple tables
            else:
                return 5.0   # Minimal score for table detection
        else:
            return 0.0  # No score if no tables present

# Register all Voice & Intent rules (2 rules)
def register_voice_intent_rules(registry):
    """Register all Voice & Intent category rules"""
    registry.register(BulletNumberedListsUsedRule())
    registry.register(ComparisonTablesPresentRule())
