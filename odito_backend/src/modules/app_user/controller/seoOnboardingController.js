import { LoggerUtil } from '../../../utils/LoggerUtil.js';
import SeoRanking from '../model/SeoRanking.js';
import mongoose from 'mongoose';

/**
 * Python worker URL — the FastAPI server running onboarding endpoints.
 */
const PYTHON_WORKER_URL = process.env.PYTHON_WORKER_URL || 'http://localhost:8000';

/**
 * Country → DataForSEO location code mapping (mirrors Python worker).
 */
const COUNTRY_TO_LOCATION_CODE = {
  US: 2840, IN: 2356, UK: 2826, GB: 2826,
  CA: 2124, AU: 2036, DE: 2315, FR: 2250,
  ES: 2246, IT: 2240, JP: 2132, BR: 2075,
  MX: 2239, KR: 2131, RU: 2306,
};


// ═══════════════════════════════════════════════════════════════════════════
//  1) POST /api/seo/generate-keywords
// ═══════════════════════════════════════════════════════════════════════════

export const generateKeywords = async (req, res) => {
  try {
    const { subType, location, country = 'US', language = 'en' } = req.body;

    if (!subType || typeof subType !== 'string' || subType.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'subType is required and must be a non-empty string'
      });
    }

    LoggerUtil.info('Generate keywords request', { subType, location, country });

    // Forward to Python worker
    const response = await fetch(`${PYTHON_WORKER_URL}/api/onboarding/generate-keywords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sub_type: subType.trim(),
        location: location?.trim() || null,
        country: country.toUpperCase(),
        language: language.toLowerCase()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      LoggerUtil.error('Python worker keyword generation failed', {
        status: response.status,
        detail: errorData.detail
      });
      return res.status(response.status === 404 ? 404 : 502).json({
        success: false,
        message: errorData.detail || 'Failed to generate keywords'
      });
    }

    const data = await response.json();

    LoggerUtil.info('Keywords generated successfully', { count: data.keywords?.length });

    return res.status(200).json({
      success: true,
      data: {
        keywords: data.keywords || []
      }
    });

  } catch (error) {
    LoggerUtil.error('Generate keywords error', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while generating keywords'
    });
  }
};


// ═══════════════════════════════════════════════════════════════════════════
//  2) POST /api/seo/check-ranking
// ═══════════════════════════════════════════════════════════════════════════

export const checkRanking = async (req, res) => {
  try {
    const { domain, keywords, location, country = 'US', language = 'en' } = req.body;

    // CRITICAL LOG: Capture keywords received at ranking check
    console.log('🔍 DEBUG: Ranking check received keywords:', {
      requestKeywords: keywords,
      keywordsType: typeof keywords,
      keywordsLength: keywords?.length,
      keywordsString: JSON.stringify(keywords),
      fullBody: req.body
    });

    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'domain is required'
      });
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'keywords array is required and must not be empty'
      });
    }

    const locationCode = COUNTRY_TO_LOCATION_CODE[country?.toUpperCase()] || 2840;

    LoggerUtil.info('Check ranking request', { domain, keywords, country, locationCode });

    // CRITICAL LOG: Capture keywords before sending to Python worker
    const cleanedKeywords = keywords.map(k => k.trim());
    console.log('🔍 DEBUG: Keywords before Python worker:', {
      originalKeywords: keywords,
      cleanedKeywords,
      cleanedKeywordsString: JSON.stringify(cleanedKeywords)
    });

    // Forward to Python worker
    const response = await fetch(`${PYTHON_WORKER_URL}/api/onboarding/check-ranking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: domain.trim(),
        keywords: cleanedKeywords,
        location_code: locationCode,
        language_code: language?.toLowerCase() || 'en'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      LoggerUtil.error('Python worker ranking check failed', {
        status: response.status,
        detail: errorData.detail
      });
      return res.status(502).json({
        success: false,
        message: errorData.detail || 'Failed to check rankings'
      });
    }

    const data = await response.json();

    LoggerUtil.info('Ranking check completed', { resultsCount: data.results?.length });

    return res.status(200).json({
      success: true,
      data: {
        results: data.results || []
      }
    });

  } catch (error) {
    LoggerUtil.error('Check ranking error', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while checking rankings'
    });
  }
};


// ═══════════════════════════════════════════════════════════════════════════
//  3) POST /api/seo/save-ranking
// ═══════════════════════════════════════════════════════════════════════════

export const saveRanking = async (req, res) => {
  try {
    const { projectId, domain, location, keywords } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid projectId format'
      });
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'keywords array is required'
      });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    LoggerUtil.info('Save ranking request', { projectId, domain, keywordsCount: keywords.length });

    const ranking = new SeoRanking({
      project_id: projectId,
      user_id: userId,
      domain: domain?.trim()?.toLowerCase() || '',
      location: location?.trim() || null,
      keywords: keywords.map(kw => ({
        keyword: kw.keyword?.trim() || '',
        rank: kw.rank != null ? parseInt(kw.rank, 10) : null
      }))
    });

    const saved = await ranking.save();

    LoggerUtil.info('Ranking saved successfully', { rankingId: saved._id, projectId });

    return res.status(201).json({
      success: true,
      message: 'Ranking data saved successfully',
      data: {
        rankingId: saved._id
      }
    });

  } catch (error) {
    LoggerUtil.error('Save ranking error', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving ranking data'
    });
  }
};
