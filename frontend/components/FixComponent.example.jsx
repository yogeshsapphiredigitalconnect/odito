// Example usage of the reusable FixComponent

import FixComponent from './FixComponent'

// Example 1: Technical Check Detail View
export function TechnicalCheckExample({ check, onBack }) {
  return (
    <FixComponent
      // Core props
      title={check.name}
      category="Technical"
      status={check.status} // "critical", "warning", "passed"
      icon={check.icon} // optional custom icon
      severity={check.severity}
      
      // Data props
      items={check.affectedPages || []}
      stats={{
        pagesAffected: check.pages || 0,
        seoImpact: check.impact || 0,
        difficulty: check.difficulty || "Medium"
      }}
      
      // Content props
      description={`This issue affects ${check.pages || 0} pages. Missing or empty attributes reduce both search engine understanding and AI citation probability. Fixing this is rated ${check.difficulty || "Medium"} difficulty and can recover an estimated +${check.impact || 0}% SEO impact.`}
      
      whatToDo="Add descriptive, keyword-rich attributes to every element. For decorative elements use appropriate empty values."
      
      diySteps={[
        { 
          title: "Identify all instances", 
          desc: "Use browser DevTools → Elements tab → search for elements without the required attribute." 
        },
        { 
          title: "Write descriptive content", 
          desc: "Describe the element in 5–15 words. Include the target keyword naturally where relevant." 
        },
        { 
          title: "Update via CMS or code", 
          desc: "WordPress: Edit the element in the page builder. In HTML: add the required attribute." 
        },
        { 
          title: "Validate with tools", 
          desc: "Re-run the audit to confirm all attributes are populated and correct." 
        }
      ]}
      
      aiPrompt="Generate SEO-optimised content for this element. Include the target keyword and keep under 125 characters."
      
      beforeCode={`<element attribute="">Content</element>`}
      afterCode={`<element attribute="Optimized description here">Content</element>`}
      
      // Event handlers
      onBack={onBack}
      onFix={(item) => console.log("Fixing:", item)}
      onMarkFixed={(item) => console.log("Marked as fixed:", item)}
      onCopyCode={(code) => console.log("Copied code:", code)}
      
      // Customization
      type="technical"
      showBulkActions={true}
      initialFixedItems={[]}
      initialMode="ai"
    />
  )
}

// Example 2: Issue Detail View
export function IssueExample({ issue, onBack }) {
  return (
    <FixComponent
      // Core props
      title={issue.title || issue.issue}
      category="On-Page Issues"
      status={issue.severity === "high" ? "critical" : issue.severity === "medium" ? "warning" : "passed"}
      severity={issue.severity}
      
      // Data props
      items={issue.urls || []}
      stats={{
        pagesAffected: issue.pages || issue.pages_affected || 0,
        seoImpact: issue.impact || issue.impact_percentage || 0,
        difficulty: issue.difficulty || "Medium"
      }}
      
      // Content props
      description={`This issue affects ${issue.pages || issue.pages_affected || 0} pages. Missing or empty attributes reduce both search engine understanding and AI citation probability. Fixing this is rated ${issue.difficulty || "Medium"} difficulty and can recover an estimated +${issue.impact || issue.impact_percentage || 0}% SEO impact.`}
      
      whatToDo="Add descriptive, keyword-rich ALT attributes to every image. For decorative images use alt=''"
      
      diySteps={[
        { 
          title: "Identify all images", 
          desc: "Use browser DevTools → Elements tab → search for img tags without alt attribute." 
        },
        { 
          title: "Write descriptive ALT text", 
          desc: "Describe the image in 5–15 words. Include the target keyword naturally where relevant." 
        },
        { 
          title: "Update via CMS or code", 
          desc: "WordPress: Media Library → Edit → Alt text. In HTML: add alt attribute to img tags." 
        },
        { 
          title: "Validate with Screaming Frog", 
          desc: "Re-crawl after fixing to confirm all alt attributes are populated and correct." 
        }
      ]}
      
      aiPrompt="Write SEO-optimised ALT text for this image. Include the target keyword and keep under 125 characters."
      
      beforeCode='<img src="/photo.jpg">'
      afterCode='<img src="/photo.jpg"\n  alt="Description here">'
      
      // Event handlers
      onBack={onBack}
      onFix={(url) => console.log("Fixing URL:", url)}
      onMarkFixed={(url) => console.log("Marked as fixed:", url)}
      onCopyCode={(code) => console.log("Copied code:", code)}
      
      // Customization
      type="issues"
      showBulkActions={true}
      initialFixedItems={["/features/white-label"]} // pre-fixed URLs
      initialMode="ai"
    />
  )
}

// Example 3: Custom Use Case (e.g., Content Issues)
export function ContentIssueExample({ issue, onBack }) {
  return (
    <FixComponent
      // Core props
      title="Missing Meta Descriptions"
      category="Content Issues"
      status="warning"
      
      // Data props
      items={[
        { url: "/about", description: "Meta description missing" },
        { url: "/services", description: "Meta description too short" },
        { url: "/contact", description: "Meta description missing" }
      ]}
      stats={{
        pagesAffected: 3,
        seoImpact: 15,
        difficulty: "Easy"
      }}
      
      // Content props
      description="Meta descriptions are crucial for SEO. They appear in search results and significantly impact click-through rates."
      
      whatToDo="Write compelling meta descriptions (150-160 characters) that include target keywords and encourage clicks."
      
      diySteps={[
        { 
          title: "Audit current descriptions", 
          desc: "Check which pages are missing or have poor meta descriptions." 
        },
        { 
          title: "Write optimized descriptions", 
          desc: "Create unique, compelling descriptions for each page (150-160 chars)." 
        },
        { 
          title: "Update in CMS", 
          desc: "Add descriptions in SEO settings or meta tags." 
        },
        { 
          title: "Monitor performance", 
          desc: "Track changes in click-through rates after implementation." 
        }
      ]}
      
      aiPrompt="Write an SEO-optimized meta description for this page. Include target keywords, keep it 150-160 characters, and make it compelling to encourage clicks."
      
      beforeCode='<meta name="description" content="">'
      afterCode='<meta name="description" content="Compelling description with keywords that encourages clicks and improves SEO performance.">'
      
      // Event handlers
      onBack={onBack}
      onFix={(item) => console.log("Fixing:", item)}
      onMarkFixed={(item) => console.log("Marked as fixed:", item)}
      onCopyCode={(code) => console.log("Copied code:", code)}
      
      // Customization
      type="content" // custom type
      showBulkActions={true}
      initialFixedItems={[]}
      initialMode="ai"
    />
  )
}

// Example 4: Minimal Configuration
export function MinimalExample({ item, onBack }) {
  return (
    <FixComponent
      title="Simple Issue"
      onBack={onBack}
      items={["/page1", "/page2", "/page3"]}
      // All other props will use defaults
    />
  )
}
