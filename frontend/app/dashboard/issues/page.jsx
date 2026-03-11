"use client"

import { useState } from "react"
import IssueTable from "@/components/dashboard/issues/IssueTable"
import IssueDetailPanel from "@/components/dashboard/issues/IssueDetailPanel"
import { ISSUES } from "@/lib/constants/mockData"

export default function IssuesPage() {
  const [selected, setSelected] = useState(null)
  const issue = selected !== null ? ISSUES[selected] : null

  return (
    <div>
      <div className="section-head">
        <div className="section-title">On-Page Issues</div>
        <div className="section-tag">
          {ISSUES.length} FOUND
        </div>
      </div>

      <div className="two-col" style={{
        gridTemplateColumns: selected !== null 
          ? "1fr 380px" : "1fr"
      }}>
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <IssueTable
            selected={selected}
            onSelect={(i) => setSelected(selected === i ? null : i)}
          />
        </div>

        {issue && (
          <IssueDetailPanel issue={issue} />
        )}
      </div>
    </div>
  )
}
