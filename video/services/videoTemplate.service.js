/**
 * Video Template Service
 * Internal templates for generating video content from scores
 * Used by video worker to create narration without external scripts
 */

class VideoTemplateService {
  /**
   * Generate slide narration from structured data
   * @param {string} slideType - Type of slide
   * @param {Object} data - Structured data for the slide
   * @returns {string} Generated narration text
   */
  generateSlideNarration(slideType, data) {
    switch (slideType) {
      case 'overview':
        return this.generateOverviewNarration(data);
      case 'issues':
        return this.generateIssuesNarration(data);
      case 'technical':
        return this.generateTechnicalNarration(data);
      case 'performance':
        return this.generatePerformanceNarration(data);
      case 'keywords':
        return this.generateKeywordsNarration(data);
      case 'ai':
        return this.generateAINarration(data);
      default:
        return this.generateDefaultNarration(data);
    }
  }

  /**
   * Generate overview slide narration
   * @param {Object} data - Overview data
   * @returns {string} Narration text
   */
  generateOverviewNarration(data) {
    const { scores, project, issueDistribution } = data;
    const scoreLevel = this.getScoreLevel(scores.overall);
    
    return `Welcome to your website audit for ${project.name}. Your overall performance score is ${scores.overall}, which indicates ${scoreLevel}. We found ${issueDistribution.total} total issues across your site, with ${issueDistribution.high} high-priority issues requiring attention. This analysis will walk you through the key areas impacting your digital presence and provide clear insights into how your website is performing in today's competitive landscape.`;
  }

  /**
   * Generate issues slide narration
   * @param {Object} data - Issues data
   * @returns {string} Narration text
   */
  generateIssuesNarration(data) {
    const { scores, topIssues, issueDistribution } = data;
    const highIssues = topIssues.high || [];
    const mediumIssues = topIssues.medium || [];
    
    let narration = `Your website has ${issueDistribution.high} high-priority and ${issueDistribution.medium} medium-priority issues that are actively impacting user experience and search rankings. `;
    
    if (highIssues.length > 0) {
      narration += `The main concerns include ${this.joinWithConjunction(highIssues.slice(0, 3))}. `;
    }
    
    if (mediumIssues.length > 0) {
      narration += `Additionally, we found medium-priority items such as ${this.joinWithConjunction(mediumIssues.slice(0, 2))}. `;
    }
    
    narration += `These issues create friction points that can cause visitors to leave your site and negatively impact your conversion rates.`;
    
    return narration;
  }

  /**
   * Generate technical slide narration
   * @param {Object} data - Technical data
   * @returns {string} Narration text
   */
  generateTechnicalNarration(data) {
    const { scores, technicalHighlights, topIssues } = data;
    const failedChecks = (technicalHighlights.checks || []).filter(c => c.status === 'FAIL');
    
    let narration = `From a technical perspective, your site has ${technicalHighlights.totalChecks} checks evaluated, with ${failedChecks.length} major technical issues that need resolution. `;
    
    if (failedChecks.length > 0) {
      narration += `The most pressing technical issues include ${this.joinWithConjunction(failedChecks.slice(0, 3))}. `;
    }
    
    narration += `These technical barriers prevent search engines from properly indexing your content and can significantly impact your organic visibility. Addressing these foundational issues will create a solid base for all other optimization efforts.`;
    
    return narration;
  }

  /**
   * Generate performance slide narration
   * @param {Object} data - Performance data
   * @returns {string} Narration text
   */
  generatePerformanceNarration(data) {
    const { scores, performanceMetrics } = data;
    const mobileScore = performanceMetrics.mobileScore;
    const desktopScore = performanceMetrics.desktopScore;
    const pageSpeed = performanceMetrics.pageSpeed;
    
    const mobileMetrics = performanceMetrics.metrics || [];
    const desktopMetrics = performanceMetrics.desktopMetrics || [];
    
    const getMetricValue = (arr, name, key) => {
      const item = arr.find(m => m.metric === name);
      return item ? item[key] : 'N/A';
    };
    
    const mobileLCP = getMetricValue(mobileMetrics, 'Largest Contentful Paint', 'mobile');
    const mobileTBT = getMetricValue(mobileMetrics, 'Total Blocking Time', 'mobile');
    
    const desktopLCP = getMetricValue(desktopMetrics, 'Largest Contentful Paint', 'desktop');
    const desktopTBT = getMetricValue(desktopMetrics, 'Total Blocking Time', 'desktop');
    
    return `Your website performance shows a mobile score of ${mobileScore} and desktop score of ${desktopScore}, with an overall page Speed score of ${pageSpeed}. On mobile devices, your Largest Contentful Paint is ${mobileLCP} and Total Blocking Time is ${mobileTBT}. On desktop, your Largest Contentful Paint is ${desktopLCP} and Total Blocking Time is ${desktopTBT}. In today's fast-paced digital environment, every millisecond counts—users form impressions about your brand within the first three seconds. Improving these performance metrics will directly enhance user engagement and search rankings.`;
  }

  /**
   * Generate keywords slide narration
   * @param {Object} data - Keywords data
   * @returns {string} Narration text
   */
  generateKeywordsNarration(data) {
    const { scores, keywordData } = data;
    const topRankings = keywordData.topRankings || [];
    const opportunities = keywordData.opportunities || [];
    
    let narration = `Your keyword strategy includes ${keywordData.totalKeywords} total tracked keywords. `;
    
    if (topRankings.length > 0) {
      const topKeyword = topRankings[0];
      narration += `Your best performing keyword is "${topKeyword.keyword}" at position ${topKeyword.position}. `;
    }
    
    if (opportunities.length > 0) {
      narration += `Key opportunities include ${this.joinWithConjunction(opportunities.slice(0, 2).map(o => o.keyword))}. `;
    }
    
    narration += `Optimizing your keyword strategy will help you capture more qualified organic traffic and improve your visibility in search results.`;
    
    return narration;
  }

  /**
   * Generate AI visibility slide narration
   * @param {Object} data - AI data
   * @returns {string} Narration text
   */
  generateAINarration(data) {
    const { scores, aiAnalysis, recommendations } = data;
    
    let narration = `Your AI visibility score is ${aiAnalysis.score}, which indicates how well your content is optimized for AI-powered search systems. `;
    
    if (aiAnalysis.schemaMarkupCount > 0) {
      narration += `You have ${aiAnalysis.schemaMarkupCount} schema markup implementations, which helps AI systems understand your content structure. `;
    }
    
    if (aiAnalysis.hasKnowledgeGraph) {
      narration += `Your site appears in the Knowledge Graph, which is excellent for AI visibility. `;
    }
    
    narration += `As AI becomes the primary way people find information, optimizing for these systems is crucial for future-proofing your organic traffic.`;
    
    return narration;
  }

  /**
   * Generate default narration for unknown slide types
   * @param {Object} data - Slide data
   * @returns {string} Default narration
   */
  generateDefaultNarration(data) {
    const { scores } = data;
    return `Your website analysis shows an overall score of ${scores.overall}. This data provides insights into your digital performance and areas for improvement.`;
  }

  /**
   * Get descriptive score level
   * @param {number} score - Numeric score
   * @returns {string} Description
   */
  getScoreLevel(score) {
    if (typeof score !== 'number') return 'moderate performance that needs attention';
    if (score >= 90) return 'exceptional performance that sets you apart from competitors';
    if (score >= 80) return 'strong performance with room for fine-tuning';
    if (score >= 70) return 'solid performance with clear opportunities for improvement';
    if (score >= 60) return 'moderate performance that requires strategic focus';
    if (score >= 50) return 'significant opportunities for growth and optimization';
    return 'critical areas that need immediate attention';
  }

  /**
   * Join array with natural conjunctions
   * @param {Array} items - Items to join
   * @returns {string} Natural language string
   */
  joinWithConjunction(items) {
    if (!items || items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  }

  /**
   * Generate complete video narration script from structured data
   * @param {Object} videoData - Complete video data
   * @returns {string} Combined narration text for all slides
   */
  generateCompleteNarration(videoData) {
    const slides = [
      { type: 'overview', data: videoData },
      { type: 'issues', data: videoData },
      { type: 'technical', data: videoData },
      { type: 'performance', data: videoData },
      { type: 'keywords', data: videoData },
      { type: 'ai', data: videoData }
    ];

    // Generate narration for each slide and combine into single string
    const narrations = slides.map(slide => 
      this.generateSlideNarration(slide.type, slide.data)
    );
    
    // Join with natural pauses between slides
    return narrations.join(' ');
  }

  /**
   * Get slide timing configuration
   * @returns {Object} Timing configuration for slides
   */
  getSlideTiming() {
    return {
      overview: { duration: 8000, wordsPerMinute: 150 },
      issues: { duration: 10000, wordsPerMinute: 150 },
      technical: { duration: 9000, wordsPerMinute: 150 },
      performance: { duration: 8000, wordsPerMinute: 150 },
      keywords: { duration: 7000, wordsPerMinute: 150 },
      ai: { duration: 8000, wordsPerMinute: 150 }
    };
  }
}

// Create and export singleton instance
const videoTemplateService = new VideoTemplateService();
module.exports = videoTemplateService;
