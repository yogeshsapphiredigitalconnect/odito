"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import apiService from "@/lib/apiService"
import { useProject } from "@/contexts/ProjectContext"
import DeviceTabs from "@/components/dashboard/pagespeed/DeviceTabs"
import PerformanceRing from "@/components/dashboard/pagespeed/PerformanceRing"
import CoreMetrics from "@/components/dashboard/pagespeed/CoreMetrics"

// Google's Core Web Vitals thresholds
const CWV_THRESHOLDS = {
  lcp: { good: 2.5, poor: 4.0 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1.8, poor: 3.0 },
  tbt: { good: 200, poor: 600 },
  speed_index: { good: 3.4, poor: 5.8 },
  tti: { good: 3.8, poor: 7.3 }
}

// Get metric status based on Google thresholds
const getMetricStatus = (metric, value, unit) => {
  if (!value || value === null || value === undefined) return 'missing'
  
  const threshold = CWV_THRESHOLDS[metric]
  if (!threshold) return 'unknown'
  
  const numericValue = parseFloat(value)
  if (metric === 'cls') {
    return numericValue <= threshold.good ? 'good' : numericValue >= threshold.poor ? 'poor' : 'needs_improvement'
  } else {
    return numericValue <= threshold.good ? 'good' : numericValue >= threshold.poor ? 'poor' : 'needs_improvement'
  }
}

// Get performance score color
const getScoreColor = (score) => {
  if (score >= 90) return { color: '#10ffa0', color2: '#00e5ff', status: 'good' }
  if (score >= 50) return { color: '#ffbb33', color2: '#ff8c1a', status: 'needs_improvement' }
  return { color: '#ff4560', color2: '#ff1744', status: 'poor' }
}

// Generate traffic impact message based on LCP
const getTrafficImpactMessage = (lcpValue, device) => {
  if (!lcpValue || lcpValue === null) return 'No LCP data available'
  
  const lcpNumeric = parseFloat(lcpValue)
  if (lcpNumeric <= 2.5) {
    return device === 'mobile' 
      ? '✅ Your mobile LCP is within Google\'s good threshold. No significant traffic impact expected.'
      : '✅ Your desktop LCP is within Google\'s good threshold. No significant traffic impact expected.'
  }
  
  // Calculate estimated traffic loss based on how much LCP exceeds threshold
  const excessTime = lcpNumeric - 2.5
  let trafficLoss = '5–8%'
  
  if (excessTime >= 2.5) trafficLoss = '~12–18%'
  else if (excessTime >= 1.5) trafficLoss = '~8–12%'
  
  return `Your ${device} LCP of ${lcpValue}s exceeds Google's 2.5s threshold. Estimated traffic loss: <strong style={{ color: "var(--red)" }}>${trafficLoss} of ${device} sessions</strong>.`
}

export default function PageSpeedPageContent() {
  const [device, setDevice] = useState("mobile")
  const [pagespeedData, setPagespeedData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { activeProject, activeProjectId, isLoading: projectLoading } = useProject()

  useEffect(() => {
    // Wait for project context to load
    if (projectLoading) return
    
    // Check if we have an active project
    if (!activeProjectId) {
      setError('No active project selected. Please select a project to view PageSpeed data.')
      setLoading(false)
      return
    }

    const fetchPageSpeedData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getPageSpeedData(activeProjectId)
        
        if (response.success && response.data) {
          setPagespeedData(response.data)
        } else {
          setError(response.message || 'Failed to load PageSpeed data')
        }
      } catch (err) {
        console.error('Error fetching PageSpeed data:', err)
        setError(err.message || 'Failed to fetch PageSpeed data')
      } finally {
        setLoading(false)
      }
    }

    fetchPageSpeedData()
  }, [activeProjectId, projectLoading])

  // Handle project loading state
  if (projectLoading) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loading-spinner">🔄</div>
        <div>Loading project information...</div>
      </div>
    )
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loading-spinner">🔄</div>
        <div>Loading PageSpeed data...</div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="error-container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="error-icon">❌</div>
        <div style={{ color: 'var(--red)', marginBottom: '16px' }}>{error}</div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Retry
          </button>
          <button 
            onClick={() => router.push('/dashboard')} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: 'transparent', 
              color: 'var(--text2)', 
              border: '1px solid var(--border)', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Handle no project state with redirect to project selection
  if (!activeProjectId) {
    return (
      <div className="no-project-container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="no-project-icon">📁</div>
        <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>No Project Selected</div>
        <div style={{ color: 'var(--text3)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
          Please select a project to view PageSpeed data. You can manage your projects from the dashboard.
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => router.push('/dashboard')} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => window.history.back()} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: 'transparent', 
              color: 'var(--text2)', 
              border: '1px solid var(--border)', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Handle no data state
  if (!pagespeedData || (!pagespeedData.mobile && !pagespeedData.desktop)) {
    return (
      <div className="no-data-container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="no-data-icon">📊</div>
        <div style={{ marginBottom: '16px' }}>No PageSpeed data available</div>
        <div style={{ color: 'var(--text3)', marginBottom: '24px' }}>
          {pagespeedData?.message || 'Run a PageSpeed audit to see performance metrics.'}
        </div>
        <button 
          onClick={() => router.push('/dashboard')} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  // Get current device data
  const currentDeviceData = pagespeedData[device]
  if (!currentDeviceData) {
    return (
      <div className="no-device-data" style={{ textAlign: 'center', padding: '40px' }}>
        <div>No {device} data available</div>
      </div>
    )
  }

  const score = currentDeviceData.performance_score || 0
  const scoreColors = getScoreColor(score)

  // Prepare metrics with proper status logic
  const metrics = [
    { 
      label: "LCP", 
      value: currentDeviceData.lcp?.display_value || 'N/A', 
      status: getMetricStatus('lcp', currentDeviceData.lcp?.value, currentDeviceData.lcp?.unit),
      rawValue: currentDeviceData.lcp?.value
    },
    { 
      label: "CLS", 
      value: currentDeviceData.cls?.display_value || 'N/A', 
      status: getMetricStatus('cls', currentDeviceData.cls?.value, currentDeviceData.cls?.unit),
      rawValue: currentDeviceData.cls?.value
    },
    { 
      label: "FCP", 
      value: currentDeviceData.fcp?.display_value || 'N/A', 
      status: getMetricStatus('fcp', currentDeviceData.fcp?.value, currentDeviceData.fcp?.unit),
      rawValue: currentDeviceData.fcp?.value
    },
    { 
      label: "TBT", 
      value: currentDeviceData.tbt?.display_value || 'N/A', 
      status: getMetricStatus('tbt', currentDeviceData.tbt?.value, currentDeviceData.tbt?.unit),
      rawValue: currentDeviceData.tbt?.value
    },
    { 
      label: "Speed Index", 
      value: currentDeviceData.speed_index?.display_value || 'N/A', 
      status: getMetricStatus('speed_index', currentDeviceData.speed_index?.value, currentDeviceData.speed_index?.unit),
      rawValue: currentDeviceData.speed_index?.value
    },
  ]

  // Filter out missing metrics
  const availableMetrics = metrics.filter(metric => metric.status !== 'missing')

  // Generate traffic impact message
  const trafficImpactMessage = getTrafficImpactMessage(currentDeviceData.lcp?.value, device)

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div className="section-head" style={{ margin: 0 }}>
          <div className="section-title">PageSpeed Insights</div>
          <div className="section-tag">CORE WEB VITALS</div>
        </div>
        <DeviceTabs active={device} onChange={setDevice} />
      </div>
      <div className="two-col">
        <div>
          <div className="score-card" style={{ marginBottom: 16, "--grad": scoreColors.status === 'good' ? "linear-gradient(90deg,#10ffa0,#00e5ff)" : scoreColors.status === 'needs_improvement' ? "linear-gradient(90deg,#ffbb33,#ff8c1a)" : "linear-gradient(90deg,#ff4560,#ff1744)" }}>
            <div className="score-label">Performance Score</div>
            <div style={{ position: "relative", width: 120, height: 120 }}>
              <PerformanceRing
                score={score}
                color={scoreColors.color}
                color2={scoreColors.color2}
                label={device}
              />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: scoreColors.status === 'good' ? "var(--green)" : scoreColors.status === 'needs_improvement' ? "var(--orange)" : "var(--red)" }}>{score}</div>
              </div>
            </div>
            <div className="score-sub">{device === "mobile" ? "📱 Mobile" : "🖥 Desktop"}</div>
          </div>
          <div className="ai-card">
            <div className="ai-card-label">✦ Traffic Impact</div>
            <div className="ai-card-text" dangerouslySetInnerHTML={{ __html: trafficImpactMessage }} />
          </div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Core Metrics</div>
          {availableMetrics.map((metric, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < availableMetrics.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{metric.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: metric.status === 'good' ? "var(--green)" : metric.status === 'needs_improvement' ? "var(--orange)" : "var(--red)" }}>{metric.value}</div>
                <div style={{ fontSize: 16 }}>
                  {metric.status === 'good' ? "✅" : metric.status === 'needs_improvement' ? "⚠️" : "❌"}
                </div>
              </div>
            </div>
          ))}
          {availableMetrics.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px' }}>
              No metrics data available for {device}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
