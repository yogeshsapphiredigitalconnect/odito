"""
Image SEO Rules (Rules 74–83, 131–133)

Rules for image presence, format, alt text, dimensions,
lazy loading, duplicates, and optimization.
"""

import re
from urllib.parse import urlparse
from ..base_seo_rule import BaseSEORuleV2


# ── Helpers ───────────────────────────────────────────────────

MODERN_IMAGE_FORMATS = {".webp", ".svg", ".avif"}
ALL_IMAGE_FORMATS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".ico",
                     ".tiff", ".tif", ".webp", ".svg", ".avif"}


def _keyword_from_context(normalized):
    meta_tags = normalized.get("meta_tags", {})
    keywords_list = meta_tags.get("keywords", [])
    if keywords_list and isinstance(keywords_list, list) and keywords_list[0]:
        kw = keywords_list[0]
        if isinstance(kw, str):
            return kw.split(",")[0].strip().lower()
    return ""


def _get_image_ext(src):
    if not src:
        return ""
    try:
        path = urlparse(src).path.lower()
        for ext in ALL_IMAGE_FORMATS:
            if path.endswith(ext):
                return ext
    except Exception:
        pass
    return ""


# ═══════════════════════════════════════════════════════════════
# IMAGE RULES (74–83, 131–133)
# ═══════════════════════════════════════════════════════════════

class ImagesPresentRule(BaseSEORuleV2):
    rule_id = "IMAGES_PRESENT"
    rule_no = 74
    category = "Images"
    severity = "medium"
    description = "Images should be present on page"

    def evaluate(self, normalized, job_id, project_id, url):
        images = normalized.get("images", [])
        if not images:
            return [self.create_issue(
                job_id, project_id, url,
                "No images found on page",
                0, "At least 1 image recommended",
                data_key="images"
            )]
        return []


class ImagesCountRule(BaseSEORuleV2):
    rule_id = "IMAGES_COUNT"
    rule_no = 75
    category = "Images"
    severity = "medium"
    description = "Reasonable total image count (≤50)"

    def evaluate(self, normalized, job_id, project_id, url):
        images = normalized.get("images", [])
        if len(images) > 50:
            return [self.create_issue(
                job_id, project_id, url,
                f"Too many images on page ({len(images)})",
                len(images), "≤50 images recommended",
                data_key="images"
            )]
        return []


class ImagesModernFormatRule(BaseSEORuleV2):
    rule_id = "IMAGES_MODERN_FORMAT"
    rule_no = 76
    category = "Images"
    severity = "high"
    description = "Use modern image formats (WebP, SVG, AVIF)"

    def evaluate(self, normalized, job_id, project_id, url):
        images = normalized.get("images", [])
        if not images:
            return []
        non_modern = []
        for img in images:
            ext = _get_image_ext(img.get("src", ""))
            if ext and ext not in MODERN_IMAGE_FORMATS:
                non_modern.append(ext)
        if non_modern:
            return [self.create_issue(
                job_id, project_id, url,
                f"{len(non_modern)} image(s) use legacy formats",
                ", ".join(set(non_modern)), "Use WebP, SVG, or AVIF",
                data_key="images"
            )]
        return []


class ImagesValidUrlRule(BaseSEORuleV2):
    rule_id = "IMAGES_VALID_URL"
    rule_no = 77
    category = "Images"
    severity = "high"
    description = "Every image must have a valid URL"

    def evaluate(self, normalized, job_id, project_id, url):
        images = normalized.get("images", [])
        invalid = [img for img in images if not img.get("src", "").strip()]
        if invalid:
            return [self.create_issue(
                job_id, project_id, url,
                f"{len(invalid)} image(s) missing src URL",
                len(invalid), "All images must have valid src",
                data_key="images"
            )]
        return []


class ImagesHttpsRule(BaseSEORuleV2):
    rule_id = "IMAGES_HTTPS"
    rule_no = 78
    category = "Images"
    severity = "high"
    description = "Every image should use HTTPS"

    def evaluate(self, normalized, job_id, project_id, url):
        images = normalized.get("images", [])
        http_images = [
            img for img in images
            if img.get("src", "").startswith("http://")
        ]
        if http_images:
            return [self.create_issue(
                job_id, project_id, url,
                f"{len(http_images)} image(s) use HTTP instead of HTTPS",
                len(http_images), "All images should use HTTPS",
                data_key="images"
            )]
        return []


class ImagesAltMeaningfulRule(BaseSEORuleV2):
    rule_id = "IMAGES_ALT_MEANINGFUL"
    rule_no = 79
    category = "Images"
    severity = "high"
    description = "Alt text should be meaningful"

    def evaluate(self, normalized, job_id, project_id, url):
        images = normalized.get("images", [])
        meaningless_alts = {"image", "img", "photo", "picture", "pic",
                           "untitled", "none", "n/a", "alt", "alt text"}
        bad = []
        for img in images:
            alt = (img.get("alt") or "").strip().lower()
            if alt in meaningless_alts:
                bad.append(alt)
        if bad:
            return [self.create_issue(
                job_id, project_id, url,
                f"{len(bad)} image(s) have meaningless alt text",
                ", ".join(bad[:3]), "Use descriptive alt text",
                data_key="images"
            )]
        return []


class ImagesAltKeywordRule(BaseSEORuleV2):
    rule_id = "IMAGES_ALT_KEYWORD"
    rule_no = 80
    category = "Images"
    severity = "high"
    description = "Alt text should contain keyword"

    def evaluate(self, normalized, job_id, project_id, url):
        keyword = _keyword_from_context(normalized)
        if not keyword:
            return []
        images = normalized.get("images", [])
        if not images:
            return []
        has_keyword = any(
            keyword.lower() in (img.get("alt") or "").lower()
            for img in images if img.get("alt")
        )
        if not has_keyword:
            return [self.create_issue(
                job_id, project_id, url,
                "No image alt text contains primary keyword",
                f"{len(images)} images checked", f"Include: {keyword}",
                data_key="images"
            )]
        return []


class ImagesDimensionsRule(BaseSEORuleV2):
    rule_id = "IMAGES_DIMENSIONS"
    rule_no = 81
    category = "Images"
    severity = "high"
    description = "Width & height attributes should be present"

    def evaluate(self, normalized, job_id, project_id, url):
        images = normalized.get("images", [])
        missing_dims = [
            img for img in images
            if not img.get("width") or not img.get("height")
        ]
        if missing_dims:
            return [self.create_issue(
                job_id, project_id, url,
                f"{len(missing_dims)} image(s) missing width/height",
                len(missing_dims), "All images should have width and height",
                data_key="images"
            )]
        return []


class ImagesOptimizedSizeRule(BaseSEORuleV2):
    rule_id = "IMAGES_OPTIMIZED_SIZE"
    rule_no = 82
    category = "Images"
    severity = "high"
    description = "Images should be optimized for file size"

    def evaluate(self, normalized, job_id, project_id, url):
        # Check image_analysis for file size data if available
        image_analysis = normalized.get("image_analysis", {})
        if image_analysis:
            large_images = image_analysis.get("large_images", [])
            if large_images:
                return [self.create_issue(
                    job_id, project_id, url,
                    f"{len(large_images)} image(s) exceed recommended file size",
                    len(large_images), "Optimize image file sizes",
                    data_key="images"
                )]
        return []


class ImagesDuplicateUrlRule(BaseSEORuleV2):
    rule_id = "IMAGES_DUPLICATE_URL"
    rule_no = 83
    category = "Images"
    severity = "medium"
    description = "No duplicate image URLs on page"

    def evaluate(self, normalized, job_id, project_id, url):
        images = normalized.get("images", [])
        seen = set()
        dupes = []
        for img in images:
            src = img.get("src", "").strip()
            if src:
                if src in seen:
                    dupes.append(src)
                seen.add(src)
        if dupes:
            return [self.create_issue(
                job_id, project_id, url,
                f"{len(dupes)} duplicate image URL(s) on page",
                len(dupes), "Each image URL should be unique",
                data_key="images"
            )]
        return []


class ImagesLazyLoadingRule(BaseSEORuleV2):
    rule_id = "IMAGES_LAZY_LOADING"
    rule_no = 131
    category = "Images"
    severity = "high"
    description = "Non-critical images should use lazy loading"

    def evaluate(self, normalized, job_id, project_id, url):
        images = normalized.get("images", [])
        if len(images) <= 1:
            return []
        # Skip first image (likely above fold)
        below_fold = images[1:]
        no_lazy = [img for img in below_fold if not img.get("loading")]
        if no_lazy:
            return [self.create_issue(
                job_id, project_id, url,
                f"{len(no_lazy)} below-fold image(s) missing lazy loading",
                len(no_lazy), 'Add loading="lazy" for non-critical images',
                data_key="images"
            )]
        return []


class ImagesRoleAttributeRule(BaseSEORuleV2):
    rule_id = "IMAGES_ROLE_ATTRIBUTE"
    rule_no = 132
    category = "Images"
    severity = "medium"
    description = "Images should have role attribute"

    def evaluate(self, normalized, job_id, project_id, url):
        images = normalized.get("images", [])
        missing_role = [img for img in images if not img.get("role")]
        if missing_role and len(missing_role) > len(images) * 0.5:
            return [self.create_issue(
                job_id, project_id, url,
                f"{len(missing_role)} image(s) missing role attribute",
                len(missing_role), 'Add role="img" for accessibility',
                data_key="images"
            )]
        return []


class ImagesOtherCategoryRule(BaseSEORuleV2):
    rule_id = "IMAGES_OTHER_CATEGORY"
    rule_no = 133
    category = "Images"
    severity = "low"
    description = "Images categorized as 'other' should be reclassified"

    def evaluate(self, normalized, job_id, project_id, url):
        image_analysis = normalized.get("image_analysis", {})
        other_count = image_analysis.get("other_category_count", 0)
        if other_count > 0:
            return [self.create_issue(
                job_id, project_id, url,
                f"{other_count} image(s) have 'other' classification",
                other_count, "Reclassify images properly (logo, hero, content)",
                data_key="images"
            )]
        return []


# ── Registration ──────────────────────────────────────────────

def register_image_rules(registry):
    """Register all Image rules"""
    registry.register(ImagesPresentRule())
    registry.register(ImagesCountRule())
    registry.register(ImagesModernFormatRule())
    registry.register(ImagesValidUrlRule())
    registry.register(ImagesHttpsRule())
    registry.register(ImagesAltMeaningfulRule())
    registry.register(ImagesAltKeywordRule())
    registry.register(ImagesDimensionsRule())
    registry.register(ImagesOptimizedSizeRule())
    registry.register(ImagesDuplicateUrlRule())
    registry.register(ImagesLazyLoadingRule())
    registry.register(ImagesRoleAttributeRule())
    registry.register(ImagesOtherCategoryRule())
