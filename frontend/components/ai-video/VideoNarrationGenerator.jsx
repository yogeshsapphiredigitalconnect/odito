/**
 * Video Narration Script Generator
 * Creates professional, human-like narration scripts for website audit videos
 */

class VideoNarrationGenerator {
  constructor() {
    this.scriptTemplates = {
      intro: [
        "Welcome to your comprehensive website audit analysis for {companyName}. Today, we're diving deep into your digital presence to uncover opportunities for growth and identify areas that need attention. This isn't just about numbers and scores—it's about understanding how your website performs in the real world and what that means for your business success.",
        "Let's take a journey through your website's performance landscape. As we analyze {companyName}, we'll explore the critical metrics that matter most for your online success, from user experience to search engine visibility, and even how emerging AI technologies view your digital presence.",
        "Your website is your digital storefront, and today we're putting it under the microscope. We'll examine how {companyName} performs across key dimensions that directly impact your bottom line, helping you understand exactly where you stand and what steps will drive the most meaningful results."
      ],
      performance: [
        "When we look at your overall performance score of {overallScore}, it tells an important story about your digital health. This score reflects how well your website serves visitors and search engines alike, balancing technical excellence with user experience. Think of it as your website's fitness level—it indicates how prepared you are to compete effectively in the digital marketplace.",
        "Your overall score of {overallScore} places you in a unique position in the competitive landscape. This isn't just a number—it's a reflection of countless technical factors, user experience elements, and strategic decisions that together determine how successfully your website converts visitors into customers and ranks in search results.",
        "Scoring {overallScore} overall means your website has specific strengths to leverage and clear opportunities for improvement. This comprehensive assessment goes beyond surface-level metrics to examine the fundamental elements that drive online success, from how quickly your pages load to how easily search engines can understand and rank your content."
      ],
      issues: [
        "Let's address the critical issues that are holding your website back. Our analysis revealed several high-priority concerns that directly impact your user experience and search performance. These aren't just technical problems—they're barriers between your business and potential customers. Each issue we've identified represents lost opportunities, whether it's visitors abandoning your site due to slow loading times or search engines struggling to properly index your content.",
        "The technical challenges we've uncovered deserve immediate attention because they're actively working against your business goals. From performance bottlenecks that frustrate users to SEO gaps that limit your visibility, these issues create friction in the customer journey. What's particularly important is understanding how these problems compound—a slow-loading page doesn't just annoy visitors, it also hurts your search rankings and conversion rates.",
        "Your website faces several key challenges that are preventing you from reaching your full potential online. These issues range from technical optimizations that improve user experience to content gaps that limit your search visibility. The good news is that each identified problem comes with a clear solution path, and addressing them systematically will create a compounding positive effect on your overall digital performance."
      ],
      performanceMetrics: [
        "Your performance metrics reveal some interesting insights about user experience across different devices. With a mobile score of {mobileScore} and desktop score of {desktopScore}, we can see how your website adapts to different user contexts. The Largest Contentful Paint of {lcp} seconds indicates how quickly users see meaningful content, while the Total Blocking Time of {tbt} milliseconds shows how responsive your site feels during interactions. These metrics directly impact user satisfaction and search rankings.",
        "When we examine your performance data, the story becomes clear about user experience quality. Your mobile performance at {mobileScore} and desktop at {desktopScore} shows where you're excelling and where improvements are needed. The {lcp} second loading time for main content and {tbt} milliseconds of input delay tell us exactly how users experience your site—these aren't just technical metrics, they're moments that can make or break user engagement and conversion.",
        "Performance is the foundation of user experience, and your metrics tell us how visitors actually interact with your website. The difference between your mobile score of {mobileScore} and desktop score of {desktopScore} reveals important optimization opportunities. With content taking {lcp} seconds to appear and {tbt} milliseconds of interaction delay, we can pinpoint exactly where technical improvements will create the biggest impact on user satisfaction and business results."
      ],
      aiVisibility: [
        "Looking ahead, your AI visibility score of {aiVisibility} positions you for the future of search. As AI-powered search becomes increasingly sophisticated, how your website appears to these systems will dramatically impact your organic traffic. This score reflects how well your content is structured for AI understanding, from semantic markup to content depth, ensuring you're prepared for the next evolution of search technology.",
        "Your AI visibility performance of {aiVisibility} is particularly crucial as we enter the age of AI-driven search. This metric goes beyond traditional SEO to examine how emerging AI systems interpret and rank your content. It's about ensuring your website speaks the language of both human users and artificial intelligence, positioning you to capture traffic from next-generation search experiences.",
        "The {aiVisibility} AI visibility score represents your readiness for the future of digital discovery. As AI systems become the primary way users find information, your website's ability to communicate effectively with these algorithms becomes critical. This encompasses everything from content structure and semantic meaning to how well your information satisfies AI-generated queries and conversational search patterns."
      ],
      actionPlan: [
        "Now, let's transform these insights into actionable steps that will drive real results. Your optimization journey should start with the highest-impact fixes that deliver immediate improvements, then progress to strategic enhancements that build long-term competitive advantage. We'll prioritize actions that create the best return on investment, ensuring every improvement contributes directly to your business objectives.",
        "The path forward requires a strategic approach to optimization, balancing quick wins with foundational improvements. Based on your audit results, we recommend starting with performance optimizations that immediately improve user experience, followed by SEO enhancements that boost your search visibility. Each step builds upon the previous one, creating momentum that compounds over time.",
        "Your action plan should focus on systematic improvements that create sustainable competitive advantage. We recommend prioritizing technical fixes that remove user experience barriers first, then advancing to content and SEO optimizations that expand your reach. The key is consistency—regular, focused improvements will deliver better results than sporadic, overwhelming changes."
      ],
      closing: [
        "Your website audit is more than a report—it's your roadmap to digital excellence. By addressing these key areas, you're not just fixing problems; you're building a stronger foundation for business growth. The digital landscape waits for no one, and the time to act is now. Each improvement you make today compounds over time, creating lasting competitive advantage.",
        "This analysis marks the beginning of your optimization journey, not the end. With clear priorities and actionable insights, you have everything needed to transform your website into a powerful business asset. The opportunities are significant, and the path forward is clear. Your commitment to continuous improvement will set you apart in an increasingly competitive digital marketplace.",
        "Your website's potential is waiting to be unlocked, and this audit provides the key. By focusing on the areas we've identified, you'll create meaningful improvements that resonate with both users and search engines. The journey to digital excellence is ongoing, but with these insights, you're equipped to make strategic decisions that drive measurable business results."
      ]
    };
  }

  /**
   * Generate a complete narration script from audit data
   */
  generateScript(auditData) {
    const {
      projectName,
      scores,
      topIssues,
      performanceMetrics
    } = auditData;

    // Clean and format issues for natural language
    const highIssues = this.formatIssues(topIssues?.high || []);
    const mediumIssues = this.formatIssues(topIssues?.medium || []);

    // Build script sections with natural flow
    const script = [
      this.generateIntro(projectName),
      this.generatePerformanceOverview(scores?.overall),
      this.generateKeyIssues(highIssues, mediumIssues),
      this.generatePerformanceInsights(scores, performanceMetrics),
      this.generateAIVisibility(scores?.aiVisibility),
      this.generateActionPlan(),
      this.generateClosing()
    ];

    return script.join('\n\n');
  }

  /**
   * Generate engaging introduction
   */
  generateIntro(companyName) {
    return `Every successful digital presence starts with understanding exactly where you stand, and that's precisely what we're uncovering today for ${companyName || 'your website'}. Think of this analysis as your digital roadmap—a clear view into how your online presence is performing in real-world conditions, what opportunities you might be missing, and most importantly, how your website is actually serving the people who visit it every day. This isn't just about numbers and technical metrics; it's about the story your website tells to potential customers and how effectively that story converts visitors into loyal clients.`;
  }

  /**
   * Generate overall performance explanation
   */
  generatePerformanceOverview(overallScore) {
    const scoreLevel = this.getScoreLevel(overallScore);
    return `When we look at your overall performance score of ${overallScore}, what we're really seeing is ${scoreLevel}. This score represents the culmination of countless factors working together—from how quickly your pages load to how easily search engines can understand and rank your content. At the same time, this number tells us something crucial about your competitive position in the digital marketplace. Because search engines and users alike increasingly demand fast, seamless experiences, this score directly impacts your ability to attract and retain customers in an environment where attention spans are shorter than ever and first impressions happen in milliseconds.`;
  }

  /**
   * Generate key issues discussion
   */
  generateKeyIssues(highIssues, mediumIssues) {
    let issuesText = `The technical challenges we've identified are creating real friction in your customer journey, and each one represents a barrier between your business and potential success. When visitors encounter slow-loading pages or struggle to navigate your content, they don't just get frustrated—they leave, often never to return. As a result, these issues directly impact your bottom line through lost conversions and diminished search visibility. `;
    
    if (highIssues.length > 0) {
      issuesText += `Your high-priority concerns include ${this.joinWithConjunction(highIssues)}. These aren't just technical problems; they're actively working against your business goals by creating poor user experiences that search engines penalize. `;
    }
    
    if (mediumIssues.length > 0) {
      issuesText += `Additionally, we've identified medium-priority areas including ${this.joinWithConjunction(mediumIssues)}. While less critical, these issues compound over time and can gradually erode your competitive advantage if left unaddressed. `;
    }
    
    return issuesText + `The good news is that each of these challenges has a clear solution path, and addressing them systematically will create a compounding positive effect on your overall digital performance.`;
  }

  /**
   * Generate performance metrics explanation
   */
  generatePerformanceInsights(scores, performanceMetrics) {
    const mobileScore = scores?.performance || performanceMetrics?.mobileScore;
    const desktopScore = scores?.performance || performanceMetrics?.desktopScore;
    const lcp = performanceMetrics?.lcp || '5.1';
    const tbt = performanceMetrics?.tbt || '1960';
    
    return `Your performance metrics tell a fascinating story about how users actually experience your website across different devices. With a mobile score of ${mobileScore} and desktop score of ${desktopScore}, we can see how your digital presence adapts to different user contexts—and where those adaptations might be falling short. The ${lcp}-second loading time for your main content might seem acceptable on paper, but in reality, users form impressions about your brand in the first three seconds. Because of this, every millisecond counts when it comes to keeping visitors engaged. At the same time, the ${tbt} milliseconds of input delay means users are experiencing noticeable lag when interacting with your site, which directly impacts their perception of your professionalism and attention to detail. These metrics aren't just technical measurements—they're moments that either build or break trust with potential customers.`;
  }

  /**
   * Generate AI visibility discussion
   */
  generateAIVisibility(aiVisibilityScore) {
    return `Looking toward the horizon, your AI visibility score of ${aiVisibilityScore} positions you for the next evolution of digital discovery. As AI-powered search becomes the primary way people find information online, how your website appears to these intelligent systems will dramatically impact your organic traffic. This goes far beyond traditional SEO—it's about ensuring your content speaks the language of both human users and artificial intelligence. Because AI systems are increasingly becoming the gatekeepers of information, websites that aren't optimized for AI understanding risk becoming invisible to large segments of their potential audience. As a result, improving your AI visibility isn't just about future-proofing; it's about capturing opportunities that your competitors might be missing entirely in this new landscape of AI-driven search and conversational interfaces.`;
  }

  /**
   * Generate action plan
   */
  generateActionPlan() {
    return `Your path forward requires a strategic approach that balances immediate wins with foundational improvements. We recommend starting with performance optimizations that will immediately enhance user experience, because these create the quickest positive impact on both visitor satisfaction and search rankings. At the same time, addressing technical SEO issues will remove barriers that prevent search engines from properly indexing and understanding your content. As you implement these changes, you'll notice a compounding effect—each improvement builds upon the previous one, creating momentum that accelerates your progress. The key is consistency and prioritization; focus on the changes that will deliver the greatest return on investment first, then systematically work through your optimization roadmap. This methodical approach ensures you're not just fixing problems, but building a stronger digital foundation that supports sustainable growth.`;
  }

  /**
   * Generate closing statement
   */
  generateClosing() {
    return `Your website audit represents more than just a technical analysis—it's your blueprint for digital excellence and competitive advantage. Because the digital landscape continues to evolve at an unprecedented pace, the insights we've uncovered today provide you with the knowledge needed to make strategic decisions that drive measurable business results. Every improvement you implement creates lasting value that compounds over time, positioning your business not just to compete, but to lead in your industry. The opportunities before you are significant, and the path forward is clear. Your commitment to continuous improvement and digital excellence will set you apart in an increasingly crowded marketplace, ensuring your website becomes not just a digital presence, but a powerful engine for business growth and customer success.`;
  }

  /**
   * Get descriptive score level for natural language
   */
  getScoreLevel(score) {
    if (typeof score !== 'number') return 'a moderate position that needs attention';
    if (score >= 90) return 'an exceptional performance that sets you apart from competitors';
    if (score >= 80) return 'a strong position with room for fine-tuning';
    if (score >= 70) return 'a solid foundation with clear opportunities for improvement';
    if (score >= 60) return 'a moderate position that requires strategic focus';
    if (score >= 50) return 'significant opportunities for growth and optimization';
    return 'critical areas that need immediate attention and strategic overhaul';
  }

  /**
   * Format score for natural language
   */
  formatScore(score) {
    if (typeof score !== 'number') return 'moderate';
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'moderate';
    if (score >= 50) return 'below average';
    return 'poor';
  }

  /**
   * Format issues array for natural language
   */
  formatIssues(issues) {
    if (!Array.isArray(issues)) return [];
    return issues.map(issue => 
      typeof issue === 'string' ? issue : 
      issue?.message || issue?.description || 'technical issue'
    ).filter(Boolean);
  }

  /**
   * Join array with natural conjunctions
   */
  joinWithConjunction(items) {
    if (!items || items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  }
}

export default VideoNarrationGenerator;
