"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/apiService';

const ARIAChat = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([
    { type: "ai", text: "👋 Hey! I'm ARIA, your AI SEO co-pilot. Let's uncover what's holding your site back — and what's possible. What's your website URL?" }
  ]);
  const [input, setInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const [projectData, setProjectData] = useState({
    websiteUrl: '',
    keywords: [],
    industry: '',
    location: '',
    country: 'US',
    language: 'en'
  });
  
  const router = useRouter();

  // Country name to ISO code mapping
  const countryNameToISO = {
    // Full names
    'united states': 'US',
    'united kingdom': 'GB', 
    'great britain': 'GB',
    'britain': 'GB',
    'england': 'GB',
    'scotland': 'GB',
    'wales': 'GB',
    'northern ireland': 'GB',
    'canada': 'CA',
    'australia': 'AU',
    'germany': 'DE',
    'france': 'FR',
    'spain': 'ES',
    'italy': 'IT',
    'japan': 'JP',
    'china': 'CN',
    'india': 'IN',
    'brazil': 'BR',
    'mexico': 'MX',
    'south korea': 'KR',
    'korea': 'KR',
    'russia': 'RU',
    
    // Common abbreviations
    'usa': 'US',
    'uk': 'GB',
    'aus': 'AU',
    'ger': 'DE',
    'fra': 'FR',
    'spa': 'ES',
    'ita': 'IT',
    'jpn': 'JP',
    'chn': 'CN',
    'ind': 'IN',
    'bra': 'BR',
    'mex': 'MX',
    'kor': 'KR',
    'rus': 'RU',
    
    // Alternative spellings
    'america': 'US',
    'british': 'GB',
    'canadian': 'CA',
    'australian': 'AU',
    'german': 'DE',
    'french': 'FR',
    'spanish': 'ES',
    'italian': 'IT',
    'japanese': 'JP',
    'chinese': 'CN',
    'indian': 'IN',
    'brazilian': 'BR',
    'mexican': 'MX',
    'korean': 'KR',
    'russian': 'RU'
  };

  // Supported ISO country codes
  const supportedCountries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'JP', 'CN', 'IN', 'BR', 'MX', 'KR', 'RU'];

  const normalizeCountry = (input) => {
    if (!input || typeof input !== 'string') {
      return null;
    }

    const normalized = input.toLowerCase().trim();
    
    // Direct ISO code match
    if (supportedCountries.includes(normalized.toUpperCase())) {
      return normalized.toUpperCase();
    }
    
    // Country name match
    if (countryNameToISO[normalized]) {
      return countryNameToISO[normalized];
    }
    
    // Fuzzy matching for common variations
    const fuzzyMatches = {
      'states': 'US',
      'uk': 'GB',
      'england': 'GB',
      'scotland': 'GB',
      'wales': 'GB',
      'britain': 'GB'
    };
    
    if (fuzzyMatches[normalized]) {
      return fuzzyMatches[normalized];
    }
    
    return null;
  };

  // Language name to ISO code mapping
  const languageNameToISO = {
    // Full names
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'chinese': 'zh',
    'japanese': 'ja',
    'portuguese': 'pt',
    'italian': 'it',
    'russian': 'ru',
    'arabic': 'ar',
    'hindi': 'hi',
    'korean': 'ko',
    
    // Alternative names and common variations
    'inglés': 'es',    // Spanish with accent
    'ingles': 'es',    // Spanish without accent
    'français': 'fr',  // French with accent
    'francais': 'fr',  // French without accent
    'deutsch': 'de',  // German
    'español': 'es',   // Spanish with accent
    'espanol': 'es',   // Spanish without accent
    'italiano': 'it',  // Italian
    'português': 'pt', // Portuguese with accent
    'portugues': 'pt', // Portuguese without accent
    'русский': 'ru',   // Russian
    'russkiy': 'ru',   // Russian transliteration
    'العربية': 'ar',   // Arabic
    'arabiya': 'ar',   // Arabic transliteration
    'हिन्दी': 'hi',    // Hindi
    'hindi': 'hi',     // Hindi transliteration
    '한국어': 'ko',    // Korean
    'hangugeo': 'ko',  // Korean transliteration
    '中文': 'zh',      // Chinese
    'zhongwen': 'zh',  // Chinese transliteration
    '日本語': 'ja',    // Japanese
    'nihongo': 'ja',   // Japanese transliteration
    
    // Common abbreviations and slang
    'eng': 'en',
    'spa': 'es',
    'fre': 'fr',
    'ger': 'de',
    'chi': 'zh',
    'jpn': 'ja',
    'por': 'pt',
    'ita': 'it',
    'rus': 'ru',
    'ara': 'ar',
    'hin': 'hi',
    'kor': 'ko'
  };

  // Supported ISO language codes
  const supportedLanguages = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'it', 'ru', 'ar', 'hi', 'ko'];

  const normalizeLanguage = (input) => {
    if (!input || typeof input !== 'string') {
      return null;
    }

    const normalized = input.toLowerCase().trim();
    
    // Direct ISO code match
    if (supportedLanguages.includes(normalized)) {
      return normalized;
    }
    
    // Language name match
    if (languageNameToISO[normalized]) {
      return languageNameToISO[normalized];
    }
    
    // Fuzzy matching for common variations
    const fuzzyMatches = {
      'eng': 'en',
      'esp': 'es',
      'fra': 'fr',
      'deu': 'de',
      'chn': 'zh',
      'jap': 'ja',
      'por': 'pt',
      'ita': 'it',
      'rus': 'ru',
      'ara': 'ar',
      'hin': 'hi',
      'kor': 'ko'
    };
    
    if (fuzzyMatches[normalized]) {
      return fuzzyMatches[normalized];
    }
    
    return null;
  };

  const prompts = [
    "What are your 3 main target keywords? (comma-separated)",
    "What industry / niche are you in?",
    "What's your target location? (e.g., New York, London, or leave empty for country-level targeting)",
    "Which country are you targeting? (Example: United States, India, UK, Canada, Australia)",
    "Which language? (Example: English, Spanish, French, German, Chinese, Japanese)",
    "Perfect! Creating your project and starting analysis... 🔍",
  ];

  const generateProjectName = (url) => {
    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname.replace('www.', '');
      
      console.log('🔧 Original hostname:', hostname);
      
      // Replace dots with hyphens and remove invalid characters
      hostname = hostname
        .replace(/\./g, '-')
        .replace(/[^a-zA-Z0-9\s-_]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
      
      console.log('🔧 Sanitized hostname:', hostname);
      
      // Capitalize first letter of each word
      const projectName = hostname
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');
      
      console.log('🔧 Final project name:', projectName);
      
      return projectName || 'SEO Project';
    } catch (error) {
      console.error('🔧 Error generating project name:', error);
      return 'SEO Project';
    }
  };

  const validateProjectName = (name) => {
    // Check if project name contains only allowed characters
    const allowedPattern = /^[a-zA-Z0-9\s-_]+$/;
    return allowedPattern.test(name) && name.trim().length > 0;
  };

  const createProject = async () => {
    setIsCreating(true);
    
    try {
      // Validate URL
      try {
        new URL(projectData.websiteUrl);
      } catch {
        setMessages(m => [...m, { 
          type: "ai", 
          text: "❌ Please provide a valid website URL (e.g., https://example.com). Let's start over - what's your website URL?" 
        }]);
        setStep(0);
        setProjectData({ websiteUrl: '', keywords: [], industry: '', location: '', country: 'US', language: 'en' });
        setIsCreating(false);
        return;
      }

      // Create project with onboarding data
      const projectName = generateProjectName(projectData.websiteUrl);
      
      // Validate project name before sending
      if (!validateProjectName(projectName)) {
        throw new Error('Generated project name contains invalid characters');
      }

      const projectPayload = {
        project_name: projectName,
        main_url: projectData.websiteUrl,
        keywords: projectData.keywords.filter(k => k.trim()).slice(0, 5), // Limit to 5 keywords
        industry: projectData.industry,
        location: projectData.location,
        country: projectData.country,
        language: projectData.language,
        status: 'active'
      };

      console.log('🚀 Creating project with payload:', projectPayload);

      const response = await apiService.createProject(projectPayload);

      console.log('📥 API Response:', response);
      console.log('📥 Response success:', response.success);
      console.log('📥 Response data:', response.data);
      console.log('📥 Project ID:', response.data?.projectId);

      if (response.success) {
        const projectId = response.data?.projectId;

        if (!projectId) {
          console.error('❌ Project ID not found in response');
          throw new Error('Project ID not found in response');
        }

        // Automatically start the scraping/analysis job
        setIsStartingAnalysis(true);
        try {
          console.log('🚀 Starting analysis job for project:', projectId);
          const auditResponse = await apiService.startAudit(projectId);
          console.log('✅ Analysis job started successfully:', auditResponse);
        } catch (auditError) {
          console.error('⚠️ Failed to start analysis job:', auditError);
          // Don't fail the entire flow if job start fails, project is still created
          setMessages(m => [...m, { 
            type: "ai", 
            text: `✅ Project created successfully! Note: Analysis will start automatically. If it doesn't, you can start it manually from the dashboard.` 
          }]);
        } finally {
          setIsStartingAnalysis(false);
        }

        const redirectUrl = `/processing/${projectId}`;
        console.log(`🔄 Redirecting to ${redirectUrl}`);

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('skipAuthRedirect', 'true');
          sessionStorage.setItem('pendingRedirectUrl', redirectUrl);
        }

        window.location.replace(redirectUrl);
        return;
      } else {
        console.error('❌ API response not successful:', response);
        throw new Error(response.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Project creation error:', error);
      setMessages(m => [...m, { 
        type: "ai", 
        text: `❌ Sorry, there was an error creating your project: ${error.message}. Please try again.` 
      }]);
      setIsCreating(false);
    }
  };

  function send() {
    if (!input.trim() || isCreating || isStartingAnalysis) return;
    
    const userResponse = input.trim();
    const newMsgs = [...messages, { type: "user", text: userResponse }];
    setMessages(newMsgs);
    setInput("");

    // Process the response based on current step
    setTimeout(() => {
      switch (step) {
        case 0: // Website URL
          setProjectData(prev => ({ ...prev, websiteUrl: userResponse }));
          setMessages(m => [...m, { type: "ai", text: prompts[step] }]);
          setStep(s => s + 1);
          break;
          
        case 1: // Keywords
          const keywords = userResponse.split(',').map(k => k.trim()).filter(k => k);
          setProjectData(prev => ({ ...prev, keywords }));
          setMessages(m => [...m, { type: "ai", text: prompts[step] }]);
          setStep(s => s + 1);
          break;
          
        case 2: // Industry
          setProjectData(prev => ({ ...prev, industry: userResponse }));
          setMessages(m => [...m, { type: "ai", text: prompts[step] }]);
          setStep(s => s + 1);
          break;
          
        case 3: // Location
          setProjectData(prev => ({ ...prev, location: userResponse }));
          setMessages(m => [...m, { type: "ai", text: prompts[step] }]);
          setStep(s => s + 1);
          break;
          
        case 4: // Country
          const normalizedCountry = normalizeCountry(userResponse);
          if (normalizedCountry) {
            setProjectData(prev => ({ ...prev, country: normalizedCountry }));
            setMessages(m => [...m, { 
              type: "ai", 
              text: `Great! I've set your target country to ${normalizedCountry}. ${prompts[step]}` 
            }]);
            setStep(s => s + 1);
          } else {
            setMessages(m => [...m, { 
              type: "ai", 
              text: `❌ I didn't recognize that country. Please try one of these: United States, United Kingdom, Canada, Australia, Germany, France, Spain, Italy, Japan, China, India, Brazil, Mexico, South Korea, or Russia. You can also use ISO codes like US, GB, CA, etc. Which country are you targeting?` 
            }]);
          }
          break;
          
        case 5: // Language
          const normalizedLanguage = normalizeLanguage(userResponse);
          if (normalizedLanguage) {
            setProjectData(prev => ({ ...prev, language: normalizedLanguage }));
            setMessages(m => [...m, { 
              type: "ai", 
              text: `Perfect! I've set your language to ${normalizedLanguage}. ${prompts[step]}` 
            }]);
            setStep(s => s + 1);
            // Create project after language is provided
            setTimeout(createProject, 1000);
          } else {
            setMessages(m => [...m, { 
              type: "ai", 
              text: `❌ I didn't recognize that language. Please try one of these: English, Spanish, French, German, Chinese, Japanese, Portuguese, Italian, Russian, Arabic, Hindi, or Korean. You can also use language codes like en, es, fr, etc. Which language?` 
            }]);
          }
          break;
      }
    }, 600);
  }

  return (
    <div className="glass-card" style={{ width: "100%", maxWidth: 520, padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.type === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            {m.type === "ai" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--grad1)", display: "grid", placeItems: "center", fontSize: 12, marginRight: 8, flexShrink: 0, marginTop: 4 }}>✦</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "80%" }}>
              <div className={`chat-bubble ${m.type}`}>{m.text}</div>
              {m.action && (
                <button 
                  onClick={m.action.onClick}
                  style={{
                    marginTop: 8,
                    padding: "8px 16px",
                    backgroundColor: "var(--grad1)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    alignSelf: "flex-start"
                  }}
                >
                  {m.action.text}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder={step === 0 ? "https://yourwebsite.com" : "Type your answer..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && send()}
          disabled={isCreating || isStartingAnalysis}
        />
        <button 
          onClick={send} 
          disabled={!input.trim() || isCreating || isStartingAnalysis}
          className="chat-send-btn"
        >
          {isStartingAnalysis ? '🔄' : isCreating ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
};

export default ARIAChat;
