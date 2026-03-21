/**
 * AI Video Prompt Builder
 * Creates professional prompts for AI video script generation
 */

export class AIVideoPrompt {
  
  /**
   * Create AI prompt for video script generation
   * @param {Object} transformedData - Clean transformed audit data
   * @returns {string} Complete AI prompt
   */
  static createPrompt(transformedData) {
    const prompt = `
You are an expert AI video script writer for SEO and AI audit reports.

Your job is to convert structured audit JSON data into a professional, engaging, and human-friendly narrated video script.

The script should:
- Sound like a professional analyst explaining insights
- Be clear, concise, and engaging
- Use simple language (non-technical audience friendly)
- Be structured in a storytelling format
- Avoid raw JSON or technical formatting in output

----------------------------------------
INPUT JSON:
${JSON.stringify(transformedData, null, 2)}
----------------------------------------

🎬 OUTPUT REQUIREMENTS:

Generate a VIDEO SCRIPT in the following structure:

1. INTRO (Hook + Company Info)
- Greet the user
- Mention company name and domain
- Mention audit purpose

2. OVERALL PERFORMANCE
- Overall score and grade
- Quick summary of performance

3. KEY METRICS BREAKDOWN
- Performance
- SEO Health
- Authority
- AI Visibility
Explain each briefly

4. TOP STRENGTHS
- Highlight 2–3 positive things

5. CRITICAL ISSUES
- Highlight major problems impacting growth

6. CORE WEB VITALS (if available)
- Explain LCP, CLS, FID simply
- Mention if good or bad

7. RECOMMENDATIONS
- Actionable improvements
- Business impact

8. CONCLUSION
- Encouraging closing statement

----------------------------------------

🎯 STYLE GUIDELINES:

- Use natural spoken tone (like a YouTube voiceover)
- Avoid bullet points
- Avoid technical jargon
- Keep sentences short and impactful
- Add slight persuasive tone
- Focus on business impact and user benefits
- Use conversational transitions

----------------------------------------

🎤 OUTPUT FORMAT:

Return ONLY the script text.
Do NOT include JSON.
Do NOT include headings like "Step 1".
Do NOT include explanations.
Make it ready for voice narration.

----------------------------------------

IMPORTANT: Focus on creating an engaging narrative that helps business owners understand their website's performance and what they need to do to improve. Make it actionable and encouraging.
`;

    return prompt.trim();
  }
  
  /**
   * Create a shorter prompt for quick video generation
   * @param {Object} transformedData - Clean transformed audit data
   * @returns {string} Short AI prompt
   */
  static createShortPrompt(transformedData) {
    const prompt = `
Convert this SEO audit data into a 60-second video script for a business owner:

${JSON.stringify(transformedData, null, 2)}

Requirements:
- Professional but friendly tone
- Focus on 3 key insights
- Include 1 actionable recommendation
- Keep it under 150 words
- Ready for voice narration

Return only the script text.
`;

    return prompt.trim();
  }
  
  /**
   * Create a detailed prompt for comprehensive video
   * @param {Object} transformedData - Clean transformed audit data
   * @returns {string} Detailed AI prompt
   */
  static createDetailedPrompt(transformedData) {
    const prompt = `
You are creating a comprehensive 5-minute video script for a detailed SEO and AI audit report.

AUDIT DATA:
${JSON.stringify(transformedData, null, 2)}

VIDEO SCRIPT STRUCTURE:

1. WARM INTRODUCTION (30 seconds)
- Welcome and overview
- Company name and domain
- What this audit covers

2. PERFORMANCE SNAPSHOT (60 seconds)
- Overall score and grade explanation
- What this means for their business
- How they compare to competitors

3. DEEP DIVE: KEY METRICS (90 seconds)
- Performance: Speed and user experience impact
- SEO Health: Search visibility fundamentals
- Authority: Trust and credibility signals
- AI Visibility: Future of search readiness

4. STRENGTHS HIGHLIGHTS (45 seconds)
- What they're doing well
- Competitive advantages
- Foundation to build upon

5. CRITICAL ISSUES ANALYSIS (60 seconds)
- Most urgent problems
- Business impact of each issue
- Why these matter for growth

6. TECHNICAL INSIGHTS (45 seconds)
- Core Web Vitals explained simply
- Technical health overview
- User experience implications

7. ACTIONABLE ROADMAP (60 seconds)
- Priority fixes (quick wins first)
- Expected impact timeline
- Resource requirements

8. STRATEGIC RECOMMENDATIONS (30 seconds)
- Long-term optimization strategy
- AI search preparation
- Growth opportunities

STYLE REQUIREMENTS:
- Professional but accessible language
- Business-focused perspective
- Clear transitions between sections
- Actionable insights throughout
- Encouraging and motivational tone
- Include specific numbers and data points
- Explain technical concepts simply

Return only the complete script text, ready for professional voice narration.
`;

    return prompt.trim();
  }
}
