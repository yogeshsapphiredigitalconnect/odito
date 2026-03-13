// import ProgressBar from "@/components/ui/ProgressBar"

// function SevBadge({ sev }) {
//   const dot = sev === "high" ? "● "
//     : sev === "medium" ? "◆ " : "▸ "
//   return (
//     <span className={`sev-badge ${sev}`}>
//       {dot}{sev.toUpperCase()}
//     </span>
//   )
// }

// export default function IssueDetailPanel({ issue }) {
//   if (!issue) return null

//   const difficulty = (issue.difficulty || "medium")
//   const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)

//   return (
//     <div
//       className="glass-card"
//       style={{
//         padding: 20,
//         height: "fit-content",
//         position: "sticky",
//         top: 88
//       }}
//     >
//       <div style={{
//         fontFamily: "var(--font-display)",
//         fontWeight: 700,
//         fontSize: 15,
//         marginBottom: 6
//       }}>
//         {issue.issue_message}
//       </div>
//       <SevBadge sev={issue.severity} />

//       <div style={{ marginTop: 16 }}>
//         <div style={{
//           fontSize: 11,
//           fontWeight: 700,
//           color: "var(--text3)",
//           textTransform: "uppercase",
//           letterSpacing: "0.07em",
//           marginBottom: 8
//         }}>
//           AI Explanation
//         </div>
//         <div className="ai-card" style={{ padding: 14 }}>
//           <div className="ai-card-text" style={{ fontSize: 12.5 }}>
//             This issue affects <strong style={{ color: "var(--text)" }}>{issue.pages_affected} pages</strong> and is
//             estimated to deliver a <strong style={{ color: "var(--cyan)" }}>+{issue.impact_percentage}% SEO impact</strong>
//             {" "}when fixed. Difficulty is rated <strong style={{ color: "var(--text)" }}>{diffLabel}</strong>.
//             ARIA confidence: {issue.ai_confidence}%.
//           </div>
//         </div>
//       </div>

//       {issue.sample_pages && issue.sample_pages.length > 0 && (
//         <div style={{ marginTop: 16 }}>
//           <div style={{
//             fontSize: 11,
//             fontWeight: 700,
//             color: "var(--text3)",
//             textTransform: "uppercase",
//             letterSpacing: "0.07em",
//             marginBottom: 8
//           }}>
//             Affected Pages
//           </div>
//           <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//             {issue.sample_pages.map((url, i) => (
//               <div key={i} style={{
//                 fontSize: 11,
//                 color: "var(--text2)",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap"
//               }}>
//                 {url}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
//         <button className="task-btn primary" style={{ width: "100%", padding: "10px", fontSize: 12.5 }}>
//           ✦ Generate Fix Code
//         </button>
//         <button className="task-btn secondary" style={{ width: "100%", padding: "10px", fontSize: 12.5 }}>
//           👥 Assign to Team
//         </button>
//         <button className="task-btn secondary" style={{ width: "100%", padding: "10px", fontSize: 12.5 }}>
//           📋 Before / After Preview
//         </button>
//       </div>
//     </div>
//   )
// }
