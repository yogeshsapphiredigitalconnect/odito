import { KEYWORDS } from "@/lib/constants/mockData"
import KeywordTable from "@/components/dashboard/keywords/KeywordTable"

export default function KeywordPageContent() {
  return (
    <div>
      <div className="section-head" style={{ marginBottom:20 }}>
        <div className="section-title">Keyword Rankings</div>
        <span className="section-tag">
          {KEYWORDS.length} TRACKED
        </span>
      </div>
      <KeywordTable />
    </div>
  )
}
