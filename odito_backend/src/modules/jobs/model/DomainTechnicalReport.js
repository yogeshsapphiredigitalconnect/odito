import mongoose from 'mongoose';

const domainTechnicalReportSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeoProject',
    required: true,
    index: true
  },
  domain: {
    type: String,
    required: true
  },
  robotsStatus: {
    type: Number,
    default: null
  },
  robotsExists: {
    type: Boolean,
    default: false
  },
  robotsContent: {
    type: String,
    default: ''
  },
  sitemapStatus: {
    type: Number,
    default: null
  },
  sitemapExists: {
    type: Boolean,
    default: false
  },
  sitemapContent: {
    type: String,
    default: ''
  },
  parsedSitemapUrlCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'domain_technical_reports',
  strict: false
});

// Prevent duplicate reports per project
domainTechnicalReportSchema.index({ projectId: 1 }, { unique: true });

const DomainTechnicalReport = mongoose.model('DomainTechnicalReport', domainTechnicalReportSchema);

export default DomainTechnicalReport;
