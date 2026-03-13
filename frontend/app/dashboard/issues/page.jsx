"use client"

import { useState } from "react"
import IssueTable from "@/components/dashboard/issues/IssueTable"
import IssueDetailView from "@/components/dashboard/issues/IssueDetailView"
import { ISSUES } from "@/lib/constants/mockData"

export default function IssuesPage() {
  const [selected, setSelected] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const issue = selected !== null ? ISSUES[selected] : null

  const handleIssueSelect = (index) => {
    if (selected === index) {
      setSelected(null)
      setSelectedIssue(null)
    } else {
      setSelected(index)
      setSelectedIssue(ISSUES[index])
    }
  }

  const handleBack = () => {
    setSelected(null)
    setSelectedIssue(null)
  }

  return (
    <div>
      {selectedIssue ? (
        <IssueDetailView issue={selectedIssue} onBack={handleBack} />
      ) : (
        <>
          <div className="section-head">
            <div className="section-title">On-Page Issues</div>
            <div className="section-tag">
              {ISSUES.length} FOUND
            </div>
          </div>

          <div className="glass-card" style={{ overflow: "hidden" }}>
            <IssueTable
              issues={ISSUES}
              selected={selected}
              onSelect={handleIssueSelect}
            />
          </div>
        </>
      )}
    </div>
  )
}
