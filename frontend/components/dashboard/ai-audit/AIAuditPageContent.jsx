import AIReadinessMeter from "@/components/dashboard/ai-audit/AIReadinessMeter"
import AIFactorTable from "@/components/dashboard/ai-audit/AIFactorTable"

export default function AIAuditPageContent() {
  return (
    <div>
      {/* Header */}
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div className="section-title">
          AI Search Optimization Audit
        </div>
        <span className="glow-pill violet">
          ✦ AEO / GEO ANALYSIS
        </span>
      </div>

      {/* AI Readiness Meter */}
      <AIReadinessMeter />

      {/* AI Factor Table */}
      <AIFactorTable />
    </div>
  )
}
