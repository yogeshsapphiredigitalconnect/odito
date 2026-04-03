"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/apiService';
import BusinessResultsList from '@/components/business/BusinessResultsList.jsx';

const ARIAChat = ({ onComplete }) => {
  // ── Flow states ──────────────────────────────────────────────────────
  const FLOW_STATES = {
    // Phase 1: Business verification (UNCHANGED)
    ASK_BUSINESS_NAME: 'ASK_BUSINESS_NAME',
    ASK_BUSINESS_LOCATION: 'ASK_BUSINESS_LOCATION',
    SEARCHING_BUSINESS: 'SEARCHING_BUSINESS',
    SHOW_BUSINESS_RESULTS: 'SHOW_BUSINESS_RESULTS',
    CONFIRM_BUSINESS: 'CONFIRM_BUSINESS',

    // Phase 2: Website (conditional — only if business has no website)
    ASK_WEBSITE_URL: 'ASK_WEBSITE_URL',

    // Phase 3: SEO Onboarding (NEW)
    ASK_BUSINESS_TYPE: 'ASK_BUSINESS_TYPE',
    ASK_SUB_TYPE: 'ASK_SUB_TYPE',
    ASK_TARGET_LEVEL: 'ASK_TARGET_LEVEL',
    GENERATING_KEYWORDS: 'GENERATING_KEYWORDS',
    CONFIRM_KEYWORDS: 'CONFIRM_KEYWORDS',
    ASK_CUSTOM_KEYWORDS: 'ASK_CUSTOM_KEYWORDS',

    // Phase 4: Project creation → Ranking → Save (CORRECTED ORDER)
    CREATING_PROJECT: 'CREATING_PROJECT',
    CHECKING_RANKINGS: 'CHECKING_RANKINGS',
    SAVING_RANKINGS: 'SAVING_RANKINGS',
    SHOW_RANKING_RESULTS: 'SHOW_RANKING_RESULTS',
  };

  // ── Business type options ────────────────────────────────────────────
  const BUSINESS_TYPES = [
    { label: 'Service-based', icon: '🛠️' },
    { label: 'Product-based', icon: '📦' },
    { label: 'E-commerce', icon: '🛒' },
    { label: 'Local Business', icon: '📍' },
    { label: 'Agency', icon: '🏢' },
    { label: 'SaaS / Tech', icon: '💻' },
  ];

  // ── State ────────────────────────────────────────────────────────────
  const [flowState, setFlowState] = useState(FLOW_STATES.ASK_BUSINESS_NAME);
  const [messages, setMessages] = useState([
    { type: "ai", text: "👋 Hey! I'm ODITO, your AI SEO co-pilot. Let's uncover what's holding your site back — and what's possible. First, what's your business name?" }
  ]);
  const [input, setInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const [isSearchingBusiness, setIsSearchingBusiness] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [isCheckingRankings, setIsCheckingRankings] = useState(false);
  const [projectData, setProjectData] = useState({
    businessName: '',
    businessLocation: '',
    businessSearchResults: [],
    verifiedBusiness: null,
    websiteUrl: '',
    // NEW fields
    businessType: '',
    subType: '',
    targetLevel: '',
    selectedKeywords: [],
    rankingResults: [],
    // Kept for project creation
    keywords: [],
    industry: '',
    location: '',
    country: 'US',
    language: 'en'
  });

  const chatEndRef = useRef(null);
  const router = useRouter();

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, flowState]);

  // Debug: Log when custom keyword input UI is rendered
  useEffect(() => {
    if (flowState === FLOW_STATES.ASK_CUSTOM_KEYWORDS) {
      console.log("🚨 RENDERING CUSTOM INPUT UI - ASK_CUSTOM_KEYWORDS state active");
    }
    console.log("🚨 FLOW STATE CHANGED TO:", flowState);
  }, [flowState]);

  // ── Sub-type prompt per business type ────────────────────────────────
  const subTypePrompts = {
    'Service-based': 'Which type of service do you offer? (e.g., IT services, marketing, consulting)',
    'Product-based': 'What type of products do you sell? (e.g., electronics, clothing, furniture)',
    'E-commerce': 'What does your online store specialize in? (e.g., fashion, gadgets, home goods)',
    'Local Business': 'What type of local business is it? (e.g., restaurant, salon, gym)',
    'Agency': 'What kind of agency? (e.g., digital marketing, design, PR)',
    'SaaS / Tech': 'What does your software/product do? (e.g., project management, CRM, analytics)',
  };

  // ── Helpers ──────────────────────────────────────────────────────────
  const generateProjectName = (url) => {
    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname.replace('www.', '');
      hostname = hostname.replace(/\./g, '-').replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '-').toLowerCase();
      return hostname.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-') || 'SEO Project';
    } catch {
      return 'SEO Project';
    }
  };

  // ── Business search (UNCHANGED) ─────────────────────────────────────
  const searchBusiness = async (businessName, businessLocation) => {
    setIsSearchingBusiness(true);
    setFlowState(FLOW_STATES.SEARCHING_BUSINESS);

    try {
      const response = await apiService.searchBusiness(businessName, businessLocation);
      if (response.success && response.data) {
        setProjectData(prev => ({ ...prev, businessSearchResults: response.data.results || [] }));
        if (response.data.results?.length > 0) {
          setFlowState(FLOW_STATES.SHOW_BUSINESS_RESULTS);
          setMessages(m => [...m, {
            type: "ai",
            text: `I found ${response.data.results.length} business${response.data.results.length !== 1 ? 'es' : ''}. Is one of these yours?`,
            businessResults: response.data.results
          }]);
        } else {
          setMessages(m => [...m, { type: "ai", text: "I couldn't find any businesses matching that search. Let's try different terms or continue manually. What's your business name?" }]);
          setFlowState(FLOW_STATES.ASK_BUSINESS_NAME);
        }
      } else {
        throw new Error(response.message || 'Failed to search');
      }
    } catch (error) {
      setMessages(m => [...m, { type: "ai", text: `I had trouble searching: ${error.message}. What's your business name?` }]);
      setFlowState(FLOW_STATES.ASK_BUSINESS_NAME);
    } finally {
      setIsSearchingBusiness(false);
    }
  };

  // ── Business selection → go to business type (MODIFIED) ─────────────
  const handleBusinessSelection = (business) => {
    setProjectData(prev => ({
      ...prev,
      verifiedBusiness: business,
      websiteUrl: business.website || '',
      location: business.address || prev.location
    }));

    if (business.website) {
      // Has website → skip website step, go straight to business type
      setMessages(m => [...m, {
        type: "ai",
        text: `Great! I found **${business.name}**${business.website ? ` with website ${business.website}` : ''}. Now let's understand your business better.\n\n**What type of business is it?**`
      }]);
      setFlowState(FLOW_STATES.ASK_BUSINESS_TYPE);
    } else {
      // No website → ask for it
      setMessages(m => [...m, {
        type: "ai",
        text: `Great! I found **${business.name}**. I couldn't find a website for your business. What's your website URL?`
      }]);
      setFlowState(FLOW_STATES.ASK_WEBSITE_URL);
    }
  };

  const handleNoneOfThese = () => {
    setMessages(m => [...m, { type: "ai", text: "No problem! Let's try searching again. What's your business name?" }]);
    setFlowState(FLOW_STATES.ASK_BUSINESS_NAME);
  };

  const handleShowMore = () => {
    setMessages(m => [...m, { type: "ai", text: "Let me search for more options..." }]);
  };

  // ── Business type selection handler ─────────────────────────────────
  const handleBusinessTypeSelect = (type) => {
    setProjectData(prev => ({ ...prev, businessType: type, industry: type }));
    setMessages(m => [
      ...m,
      { type: "user", text: type },
      { type: "ai", text: subTypePrompts[type] || 'What specific type of business is it?' }
    ]);
    setFlowState(FLOW_STATES.ASK_SUB_TYPE);
  };

  // ── Target level selection handler ──────────────────────────────────
  const handleTargetLevelSelect = (level) => {
    setProjectData(prev => ({ ...prev, targetLevel: level }));
    setMessages(m => [
      ...m,
      { type: "user", text: level === 'local' ? 'Local (city-level)' : 'Country level' }
    ]);

    // Trigger keyword generation
    const location = level === 'local'
      ? (projectData.verifiedBusiness?.address || projectData.businessLocation)
      : null;

    setFlowState(FLOW_STATES.GENERATING_KEYWORDS);
    generateKeywordsFlow(projectData.subType, location);
  };

  // ── Keyword generation flow ─────────────────────────────────────────
  const generateKeywordsFlow = async (subType, location) => {
    setIsGeneratingKeywords(true);
    setMessages(m => [...m, { type: "ai", text: "🔍 Finding the best keywords for your business..." }]);

    try {
      const response = await apiService.generateKeywords(
        subType,
        location,
        projectData.country,
        projectData.language
      );

      if (response.success && response.data?.keywords?.length > 0) {
        const keywords = response.data.keywords;
        setProjectData(prev => ({ ...prev, selectedKeywords: keywords, keywords }));
        setMessages(m => [...m, {
          type: "ai",
          text: `Here are the top keywords I found:\n\n${keywords.map((k, i) => `${i + 1}. **${k}**`).join('\n')}\n\nDo you want to go with these?`,
          keywordConfirmation: true
        }]);
        setFlowState(FLOW_STATES.CONFIRM_KEYWORDS);
      } else {
        throw new Error('No keywords returned');
      }
    } catch (error) {
      console.error('Keyword generation failed:', error);
      setMessages(m => [...m, {
        type: "ai",
        text: `⚠️ I couldn't auto-generate keywords: ${error.message}\n\nPlease enter up to 5 target keywords (comma-separated):`
      }]);
      setFlowState(FLOW_STATES.ASK_CUSTOM_KEYWORDS);
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  // ── Keyword confirmation handler ────────────────────────────────────
  const handleKeywordConfirm = (confirmed) => {
    console.log("🚨 KEYWORD CONFIRM CALLED with:", { confirmed, currentFlowState: flowState });
    
    if (confirmed) {
      console.log("🚨 USER ACCEPTED GENERATED KEYWORDS");
      setMessages(m => [
        ...m,
        { type: "user", text: "Yes, let's go with these!" },
        { type: "ai", text: "✅ Perfect! Setting up your project..." }
      ]);
      // ✅ Pass generated keywords directly to avoid async state issues
      startProjectAndRankingFlow(projectData.selectedKeywords);
    } else {
      console.log("🚨 USER REJECTED GENERATED KEYWORDS - SWITCHING TO CUSTOM INPUT");
      setMessages(m => [
        ...m,
        { type: "user", text: "No, I want different keywords" },
        { type: "ai", text: "No problem! Enter up to 5 target keywords (comma-separated):" }
      ]);
      console.log("🚨 FLOW STATE CHANGING TO:", FLOW_STATES.ASK_CUSTOM_KEYWORDS);
      setFlowState(FLOW_STATES.ASK_CUSTOM_KEYWORDS);
    }
  };

  // ── NON-BLOCKING: Create project → trigger background tasks → redirect ─────
  const startProjectAndRankingFlow = async (overrideKeywords = null) => {
    setFlowState(FLOW_STATES.CREATING_PROJECT);
    setIsCreating(true);

    try {
      // ✅ STEP 0: Use override keywords or fall back to state
      const finalKeywords = overrideKeywords || projectData.selectedKeywords || [];
      
      // 🚨 SAFETY CHECK: Ensure we have keywords
      if (!finalKeywords || finalKeywords.length === 0) {
        console.warn("❌ No keywords found for project creation");
        setMessages(m => [...m, { type: "ai", text: "❌ No keywords available. Please start over." }]);
        setIsCreating(false);
        setFlowState(FLOW_STATES.ASK_BUSINESS_NAME);
        return;
      }

      console.log("🚨 API USING KEYWORDS:", finalKeywords);
      console.log("🚨 KEYWORDS SOURCE:", overrideKeywords ? "CUSTOM (override)" : "STATE (fallback)");

      // STEP 1: Validate & create the project
      const websiteUrl = projectData.websiteUrl;
      try { new URL(websiteUrl); } catch {
        setMessages(m => [...m, { type: "ai", text: "❌ Invalid website URL. Please check and try again." }]);
        setIsCreating(false);
        setFlowState(FLOW_STATES.ASK_WEBSITE_URL);
        return;
      }

      const projectName = generateProjectName(websiteUrl);
      
      // ✅ FIXED: Use finalKeywords instead of stale state
      const keywordsBeforeAPI = finalKeywords.filter(k => k.trim()).slice(0, 5);
      console.log('🔍 DEBUG: Keywords before API call:', {
        selectedKeywords: projectData.selectedKeywords,
        keywords: projectData.keywords,
        keywordsBeforeAPI,
        keywordsLength: keywordsBeforeAPI.length,
        projectDataState: {
          selectedKeywords: projectData.selectedKeywords,
          keywords: projectData.keywords,
          subType: projectData.subType,
          businessType: projectData.businessType
        }
      });

      // VALIDATION: Final keywords being sent to API
      console.log('🚨 FINAL KEYWORDS SENT TO API:', keywordsBeforeAPI);

      const projectPayload = {
        project_name: projectName,
        main_url: websiteUrl,
        keywords: keywordsBeforeAPI,
        industry: projectData.businessType || projectData.industry,
        location: projectData.verifiedBusiness?.address || projectData.location || '',
        country: projectData.country,
        language: projectData.language,
        status: 'active',
        business_type: projectData.businessType,
        ...(projectData.verifiedBusiness && {
          verified_business: {
            placeId: projectData.verifiedBusiness.placeId,
            name: projectData.verifiedBusiness.name,
            address: projectData.verifiedBusiness.address,
            website: projectData.verifiedBusiness.website,
            phone: projectData.verifiedBusiness.phone,
            rating: projectData.verifiedBusiness.rating,
            location: projectData.verifiedBusiness.location,
            verifiedAt: new Date().toISOString()
          }
        })
      };

      // 🚨 STEP 1: FRONTEND → BACKEND REQUEST
      console.log("🚨 FRONTEND SENDING TO BACKEND:", {
        apiUrl: '/api/projects',
        payloadKeywords: projectPayload.keywords,
        fullPayload: projectPayload,
        payloadString: JSON.stringify(projectPayload)
      });

      console.log('🔍 DEBUG: Project payload being sent:', {
        payloadKeywords: projectPayload.keywords,
        payloadKeywordsString: JSON.stringify(projectPayload.keywords)
      });

      const response = await apiService.createProject(projectPayload);
      if (!response.success) throw new Error(response.message || 'Failed to create project');

      const projectId = response.data?.projectId;
      if (!projectId) throw new Error('Project ID not found in response');

      console.log('🔍 DEBUG: Project created successfully:', {
        projectId,
        responseKeywords: response.data?.project?.keywords
      });

      // STEP 2: Trigger background tasks WITHOUT waiting
      // CRITICAL FIX: Pass the actual keywords used in API call to prevent stale closure data
      console.log('🚨 API KEYWORDS (CALLER):', keywordsBeforeAPI);
      
      // Pass business location for dynamic location mapping
      const businessLocationData = projectData.verifiedBusiness ? {
        address: projectData.verifiedBusiness.address,
        lat: projectData.verifiedBusiness.location?.lat,
        lng: projectData.verifiedBusiness.location?.lng
      } : null;
      
      console.log('🚨 BUSINESS LOCATION FOR MAPPING:', businessLocationData);
      triggerBackgroundTasks(projectId, websiteUrl, keywordsBeforeAPI, businessLocationData);

      // STEP 3: Immediate redirect to processing page
      const redirectUrl = `/processing/${projectId}`;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('skipAuthRedirect', 'true');
        sessionStorage.setItem('pendingRedirectUrl', redirectUrl);
      }

      // Redirect immediately
      router.push(redirectUrl);

    } catch (error) {
      console.error('Project creation error:', error);
      setMessages(m => [...m, {
        type: "ai",
        text: `❌ Error: ${error.message}. Please try again.`
      }]);
      setIsCreating(false);
    }
  };

  // ── Fire-and-forget background tasks ─────────────────────────────────────
  const triggerBackgroundTasks = async (projectId, websiteUrl, keywords, businessLocation = null) => {
    try {
      // STRICT VALIDATION: Ensure keywords are provided
      if (!keywords || keywords.length === 0) {
        throw new Error("Keywords missing in triggerBackgroundTasks");
      }

      // USE ONLY passed keywords - NO fallback logic
      const keywordsForTasks = keywords;
      
      console.log('🚨 API KEYWORDS:', keywords);
      console.log('🚨 TASK KEYWORDS:', keywordsForTasks);
      console.log('🔍 DEBUG: Keywords at background task start:', {
        projectId,
        keywordsForTasks,
        keywordsString: JSON.stringify(keywordsForTasks),
        source: 'passed_parameter_only'
      });

      // Background task 1: Check rankings (non-blocking)
      console.log('🚨 CALLING CHECK RANKING WITH BUSINESS LOCATION:', businessLocation);
      
      apiService.checkRanking(
        websiteUrl,
        keywordsForTasks,
        businessLocation || projectData.verifiedBusiness?.address || projectData.location,
        projectData.country,
        projectData.language,
        businessLocation // Pass business location for backend mapping
      ).then(rankResponse => {
        console.log('🔍 DEBUG: Ranking check response:', {
          projectId,
          success: rankResponse.success,
          keywordsUsed: keywordsForTasks,
          results: rankResponse.data?.results
        });
        
        if (rankResponse.success && rankResponse.data?.results) {
          // Save rankings in background
          apiService.saveRanking(
            projectId,
            websiteUrl,
            projectData.verifiedBusiness?.address || projectData.location,
            rankResponse.data.results
          ).then(saveResponse => {
            console.log('🔍 DEBUG: Ranking save response:', {
              projectId,
              success: saveResponse.success,
              keywordsSaved: keywordsForTasks
            });
          }).catch(saveError => {
            console.error('Background ranking save failed:', saveError);
          });
        }
      }).catch(rankError => {
        console.error('Background ranking check failed:', rankError);
      });

      // Background task 2: Start audit (non-blocking)
      apiService.startAudit(projectId).then(auditResponse => {
        console.log('🔍 DEBUG: Audit start response:', {
          projectId,
          success: auditResponse.success
        });
      }).catch(auditError => {
        console.error('Background audit start failed:', auditError);
      });

    } catch (error) {
      console.error('Background task trigger failed:', error);
    }
  };

  // ── Main send handler ───────────────────────────────────────────────
  function send() {
    if (!input.trim() || isCreating || isStartingAnalysis || isSearchingBusiness || isGeneratingKeywords || isCheckingRankings) return;

    const userResponse = input.trim();
    const newMsgs = [...messages, { type: "user", text: userResponse }];
    setMessages(newMsgs);
    setInput("");

    setTimeout(() => {
      switch (flowState) {
        case FLOW_STATES.ASK_BUSINESS_NAME:
          setProjectData(prev => ({ ...prev, businessName: userResponse }));
          setMessages(m => [...m, { type: "ai", text: "What's your business location? (city or area)" }]);
          setFlowState(FLOW_STATES.ASK_BUSINESS_LOCATION);
          break;

        case FLOW_STATES.ASK_BUSINESS_LOCATION:
          setProjectData(prev => ({ ...prev, businessLocation: userResponse }));
          searchBusiness(projectData.businessName, userResponse);
          break;

        case FLOW_STATES.ASK_WEBSITE_URL:
          setProjectData(prev => ({ ...prev, websiteUrl: userResponse }));
          setMessages(m => [...m, {
            type: "ai",
            text: "Got it! Now let's understand your business better.\n\n**What type of business is it?**"
          }]);
          setFlowState(FLOW_STATES.ASK_BUSINESS_TYPE);
          break;

        case FLOW_STATES.ASK_SUB_TYPE:
          setProjectData(prev => ({ ...prev, subType: userResponse }));
          setMessages(m => [...m, {
            type: "ai",
            text: `Great — "${userResponse}"! What level of SEO targeting do you need?`
          }]);
          setFlowState(FLOW_STATES.ASK_TARGET_LEVEL);
          break;

        case FLOW_STATES.ASK_CUSTOM_KEYWORDS: {
          console.log("🚨 PROCESSING CUSTOM KEYWORDS - USER RESPONSE:", userResponse);
          
          const keywords = userResponse.split(',').map(k => k.trim()).filter(k => k);
          console.log("🚨 PARSED KEYWORDS (RAW):", keywords);
          
          // Deduplicate
          const unique = [...new Set(keywords.map(k => k.toLowerCase()))].map(k =>
            keywords.find(orig => orig.toLowerCase() === k) || k
          );
          console.log("🚨 PARSED KEYWORDS (UNIQUE):", unique);
          
          if (unique.length === 0) {
            console.log("🚨 NO KEYWORDS ENTERED - SHOWING ERROR");
            setMessages(m => [...m, { type: "ai", text: "Please enter at least one keyword. (comma-separated)" }]);
            return;
          }
          
          const finalKws = unique.slice(0, 5);
          console.log("🚨 SETTING CUSTOM KEYWORDS TO PROJECT DATA:", finalKws);
          
          setProjectData(prev => ({ 
            ...prev, 
            selectedKeywords: finalKws, 
            keywords: finalKws 
          }));
          
          setMessages(m => [...m, {
            type: "ai",
            text: `✅ Got it! Using these keywords:\n\n${finalKws.map((k, i) => `${i + 1}. **${k}**`).join('\n')}\n\nSetting up your project...`
          }]);
          
          console.log("🚨 STARTING PROJECT AND RANKING FLOW WITH CUSTOM KEYWORDS");
          console.log("🚨 PASSING KEYWORDS DIRECTLY TO AVOID ASYNC STATE BUG:", finalKws);
          startProjectAndRankingFlow(finalKws);  // ✅ PASS KEYWORDS DIRECTLY
          break;
        }

        default:
          break;
      }
    }, 600);
  }

  // ── Render helpers ──────────────────────────────────────────────────

  // Business type selector cards
  const renderBusinessTypeSelector = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 10, maxWidth: '100%' }}>
      {BUSINESS_TYPES.map(({ label, icon }) => (
        <button
          key={label}
          onClick={() => handleBusinessTypeSelect(label)}
          style={{
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'left',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );

  // Target level selector
  const renderTargetLevelSelector = () => (
    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
      {[
        { key: 'local', label: '📍 Local (city-level)', desc: 'Target your city area' },
        { key: 'country', label: '🌐 Country level', desc: 'Target entire country' }
      ].map(({ key, label, desc }) => (
        <button
          key={key}
          onClick={() => handleTargetLevelSelect(key)}
          style={{
            flex: 1,
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{desc}</div>
        </button>
      ))}
    </div>
  );

  // Keyword confirm buttons
  const renderKeywordConfirmButtons = () => (
    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
      <button
        onClick={() => handleKeywordConfirm(true)}
        style={{
          flex: 1, padding: '10px 16px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff', border: 'none', borderRadius: 8,
          cursor: 'pointer', fontWeight: 600, fontSize: 14,
          transition: 'all 0.2s ease'
        }}
      >
        ✅ Yes, use these
      </button>
      <button
        onClick={() => {
          console.log("🚨 ENTER MY OWN BUTTON CLICKED!");
          handleKeywordConfirm(false);
        }}
        style={{
          flex: 1, padding: '10px 16px',
          background: 'rgba(255,255,255,0.08)',
          color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
          cursor: 'pointer', fontWeight: 500, fontSize: 14,
          transition: 'all 0.2s ease'
        }}
      >
        ✏️ Enter my own
      </button>
    </div>
  );

  // Loading indicator
  const renderLoadingIndicator = (message) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, opacity: 0.8 }}>
      <div style={{
        width: 20, height: 20,
        border: '2px solid rgba(255,255,255,0.2)',
        borderTop: '2px solid #10b981',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Determine which states hide the text input ──────────────────────
  const hideInputStates = [
    FLOW_STATES.SEARCHING_BUSINESS,
    FLOW_STATES.SHOW_BUSINESS_RESULTS,
    FLOW_STATES.ASK_BUSINESS_TYPE,
    FLOW_STATES.ASK_TARGET_LEVEL,
    FLOW_STATES.GENERATING_KEYWORDS,
    FLOW_STATES.CONFIRM_KEYWORDS,
    FLOW_STATES.CREATING_PROJECT,
    // REMOVED: CHECKING_RANKINGS, SAVING_RANKINGS, SHOW_RANKING_RESULTS (now non-blocking)
  ];

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="glass-card" style={{ width: "100%", maxWidth: 520, padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.type === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            {m.type === "ai" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--grad1)", display: "grid", placeItems: "center", fontSize: 12, marginRight: 8, flexShrink: 0, marginTop: 4 }}>✦</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "80%" }}>
              <div 
                className={`chat-bubble ${m.type}`}
                style={{ 
                  whiteSpace: 'pre-line',
                  ...({}) 
                }}
                dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
              />

              {/* Action button */}
              {m.action && (
                <button
                  onClick={m.action.onClick}
                  style={{
                    marginTop: 8, padding: "8px 16px",
                    backgroundColor: "var(--grad1)", color: "white",
                    border: "none", borderRadius: "6px",
                    cursor: "pointer", fontSize: "14px", fontWeight: "500",
                    alignSelf: "flex-start"
                  }}
                >
                  {m.action.text}
                </button>
              )}

              {/* Business results (UNCHANGED) */}
              {m.businessResults && flowState === FLOW_STATES.SHOW_BUSINESS_RESULTS && (
                <BusinessResultsList
                  results={m.businessResults}
                  onSelect={handleBusinessSelection}
                  onShowMore={handleShowMore}
                  onNone={handleNoneOfThese}
                  searchQuery={`${projectData.businessName} in ${projectData.businessLocation}`}
                  isLoading={false}
                />
              )}

              {/* Keyword confirmation buttons */}
              {m.keywordConfirmation && flowState === FLOW_STATES.CONFIRM_KEYWORDS && renderKeywordConfirmButtons()}
            </div>
          </div>
        ))}

        {/* Business search loading (UNCHANGED) */}
        {flowState === FLOW_STATES.SEARCHING_BUSINESS && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--grad1)", display: "grid", placeItems: "center", fontSize: 12, marginRight: 8, flexShrink: 0, marginTop: 4 }}>✦</div>
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "80%" }}>
              <BusinessResultsList
                results={[]}
                onSelect={handleBusinessSelection}
                onShowMore={handleShowMore}
                onNone={handleNoneOfThese}
                searchQuery={`${projectData.businessName} in ${projectData.businessLocation}`}
                isLoading={true}
              />
            </div>
          </div>
        )}

        {/* Business type selector */}
        {flowState === FLOW_STATES.ASK_BUSINESS_TYPE && renderBusinessTypeSelector()}

        {/* Target level selector */}
        {flowState === FLOW_STATES.ASK_TARGET_LEVEL && renderTargetLevelSelector()}

        {/* Loading states */}
        {flowState === FLOW_STATES.GENERATING_KEYWORDS && renderLoadingIndicator('Finding keywords...')}
        {flowState === FLOW_STATES.CREATING_PROJECT && renderLoadingIndicator('Creating your project...')}
        {/* REMOVED: CHECKING_RANKINGS, SAVING_RANKINGS loading indicators (now non-blocking) */}

        <div ref={chatEndRef} />
      </div>

      {/* Text input — hidden during button/loading states */}
      {(() => {
        console.log("🚨 INPUT VISIBILITY CHECK:", {
          currentFlowState: flowState,
          hideInputStates,
          shouldShow: !hideInputStates.includes(flowState),
          isAskCustomKeywords: flowState === FLOW_STATES.ASK_CUSTOM_KEYWORDS
        });
        return !hideInputStates.includes(flowState);
      })() && (
        <>
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder={
                flowState === FLOW_STATES.ASK_BUSINESS_NAME ? "Enter your business name..." :
                flowState === FLOW_STATES.ASK_BUSINESS_LOCATION ? "Enter city or area..." :
                flowState === FLOW_STATES.ASK_WEBSITE_URL ? "httpsyourwebsite.com" :
                flowState === FLOW_STATES.ASK_SUB_TYPE ? "e.g., IT services, digital marketing..." :
                flowState === FLOW_STATES.ASK_CUSTOM_KEYWORDS ? "keyword1, keyword2, keyword3..." :
                "Type your answer..."
              }
              value={input}
              onChange={(e) => {
                console.log("🚨 USER TYPING IN CUSTOM INPUT:", e.target.value);
                setInput(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  console.log("🚨 USER PRESSED ENTER IN CUSTOM INPUT:", input);
                  send();
                }
              }}
              disabled={isCreating || isStartingAnalysis || isSearchingBusiness || isGeneratingKeywords || isCheckingRankings}
            />
            <button
              onClick={send}
              disabled={!input.trim() || isCreating || isStartingAnalysis || isSearchingBusiness || isGeneratingKeywords || isCheckingRankings}
              className="chat-send-btn"
            >
              {isCheckingRankings ? '📊' : isGeneratingKeywords ? '🔍' : isStartingAnalysis ? '🔄' : isCreating ? '⏳' : isSearchingBusiness ? '🔍' : '➤'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ARIAChat;
