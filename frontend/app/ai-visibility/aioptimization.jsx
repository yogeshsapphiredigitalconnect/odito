"use client"

import { useState } from 'react';
import CircularProgress from '@/components/CircularProgress';
import { AI_CATEGORY_COLOR_MAP } from "@/utils/aiCategoryColors";

export default function AIOptimization({ project }) {
  const [activeTab, setActiveTab] = useState('aeo');

  // Use project data instead of mock data
  const getScoreForCategory = (category) => {
    if (!project?.summary?.categoryAverages) return 0;
    
    const categoryMapping = {
      'aeo': 'aeo_score',
      'ai-impact': 'ai_impact',
      'llm-readiness': 'llm_readiness',
      'topical-authority': 'topical_authority',
      'voice-intent': 'voice_intent',
      'citation-probability': 'citation_probability'
    };
    
    const labelMapping = {
      'aeo': 'AEO Score',
      'ai-impact': 'AI Impact',
      'llm-readiness': 'LLM Readiness',
      'topical-authority': 'Topical Authority',
      'voice-intent': 'Voice Intent',
      'citation-probability': 'Citation Probability'
    };
    
    const projectField = categoryMapping[category];
    return Math.round(project?.summary?.categoryAverages[projectField] || 0);
  };

  // Helper function to get color for category
  const getCategoryColor = (category) => {
    const labelMapping = {
      'aeo': 'AEO Score',
      'ai-impact': 'AI Impact',
      'llm-readiness': 'LLM Readiness',
      'topical-authority': 'Topical Authority',
      'voice-intent': 'Voice Intent',
      'citation-probability': 'Citation Probability'
    };
    const label = labelMapping[category];
    return AI_CATEGORY_COLOR_MAP[label]?.text || "text-white";
  };

  const activeScore = getScoreForCategory(activeTab);

  const tabs = [
    { id: 'aeo', label: 'AEO' },
    { id: 'ai-impact', label: 'AI Impact' },
    { id: 'llm-readiness', label: 'LLM Readiness' },
    { id: 'topical-authority', label: 'Topical Authority' },
    { id: 'voice-intent', label: 'Voice Intent' },
    { id: 'citation-probability', label: 'Citation Probability' }
  ];

  const categoryData = {
    aeo: { score: getScoreForCategory('aeo'), description: "Answer Engine Optimization focuses on structuring content for AI-driven answer systems." },
    'ai-impact': { score: getScoreForCategory('ai-impact'), description: "AI Impact evaluates how generative systems interpret and rank your content." },
    'llm-readiness': { score: getScoreForCategory('llm-readiness'), description: "LLM Readiness measures how effectively large language models understand your site." },
    'topical-authority': { score: getScoreForCategory('topical-authority'), description: "Topical Authority analyzes semantic coverage and depth within your niche." },
    'voice-intent': { score: getScoreForCategory('voice-intent'), description: "Voice Intent optimization aligns your content with conversational AI queries." },
    'citation-probability': { score: getScoreForCategory('citation-probability'), description: "Citation Probability predicts likelihood of your content being referenced by AI systems." }
  };

  const activeData = categoryData[activeTab];

  return (
    <div className="px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">AI Optimization Framework</h1>
        <p className="text-muted-foreground max-w-4xl leading-relaxed">
          AI Optimization enhances your website's visibility across AI-driven systems, search engines, and large language models. Below are six core optimization pillars that will power this module.
        </p>
      </div>

      {/* Internal Tab Navigation */}
      <div className="border-b border-border mb-8">
        <div className="flex gap-12 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-medium text-base pb-1 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'font-semibold text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Unified Analytics Card */}
      <div className="bg-card border border-border rounded-2xl p-10 mt-10">
        <div className="flex items-center gap-20">
          
          {/* LEFT SIDE - CIRCLE */}
          <div className="flex justify-center items-center w-80">
            <div className="flex flex-col items-center">
              <CircularProgress 
                percentage={activeScore} 
                size={120} 
                strokeWidth={10}
                color={getCategoryColor(activeTab)}
              />
              <span className="text-xs text-muted-foreground mt-2">{tabs.find(tab => tab.id === activeTab)?.label}</span>
            </div>
          </div>

          {/* RIGHT SIDE - CONTENT */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-4">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-muted-foreground mb-6">
              {categoryData[activeTab].description}
            </p>
            <div className="text-muted-foreground">
              Detailed analytics and optimization recommendations coming soon...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
