import mongoose from 'mongoose';

/**
 * Schema for raw keyword research API responses
 * Stores the complete DataForSEO response for audit trail
 */
const keywordResearchSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SeoProject'
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Job'
  },
  seed_keyword: {
    type: String,
    required: true
  },
  depth: {
    type: Number,
    default: 2
  },
  raw_api_response: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'seo_keyword_research',
  strict: false
});

keywordResearchSchema.index({ project_id: 1 });
keywordResearchSchema.index({ job_id: 1 });

/**
 * Schema for processed keyword opportunities
 * Normalized keywords extracted from the DataForSEO response
 */
const keywordOpportunitySchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SeoProject'
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  keyword: {
    type: String,
    required: true
  },
  search_volume: {
    type: Number,
    default: 0
  },
  competition: {
    type: Number,
    default: null
  },
  cpc: {
    type: Number,
    default: null
  },
  difficulty: {
    type: Number,
    default: null
  },
  source_keyword: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'seo_keyword_opportunities',
  strict: false
});

keywordOpportunitySchema.index({ project_id: 1 });
keywordOpportunitySchema.index({ project_id: 1, keyword: 1 }, { unique: true });

export const KeywordResearch = mongoose.model('KeywordResearch', keywordResearchSchema);
export const KeywordOpportunity = mongoose.model('KeywordOpportunity', keywordOpportunitySchema);
