import CheckList from "@/components/dashboard/technical/CheckList"
import StatusBreakdown from "@/components/dashboard/technical/StatusBreakdown"

export default function TechnicalPage() {
  return (
    <div>
      <div className="two-col" style={{
        gridTemplateColumns: "1fr 320px",
        alignItems: "start"
      }}>
        <CheckList />
        <StatusBreakdown />
      </div>
    </div>
  )
}
