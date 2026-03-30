"use client";

import { useState, useEffect } from "react";

import { useProject } from "@/contexts/ProjectContext";

import apiService from "@/lib/apiService";

import { Skeleton } from "@/components/ui/skeleton";

export default function TechCheckDetailView({ check, onBack, onOpenUrl }) {
  const { activeProject } = useProject();

  const [mode, setMode] = useState("ai");

  const [selUrl, setSelUrl] = useState(null);

  const [fixingUrl, setFixingUrl] = useState(null);

  const [fixedUrls, setFixedUrls] = useState([]);

  const [checked, setChecked] = useState([]);

  const [streamLines, setStreamLines] = useState([]);

  const [streamDone, setStreamDone] = useState(false);

  const [showBulkModal, setShowBulkModal] = useState(false);

  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [checkDetail, setCheckDetail] = useState(null);

  const [affectedPages, setAffectedPages] = useState([]);

  // Inject custom styles

  useEffect(() => {
    const style = document.createElement("style");

    style.textContent = `

      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

      

      @keyframes fixFadeUp {

        from { opacity: 0; transform: translateY(6px); }

        to { opacity: 1; transform: translateY(0); }

      }

      

      @keyframes fixBlink {

        0%, 100% { opacity: 1; }

        50% { opacity: 0; }

      }

      

      @keyframes fixSlideUp {

        from { opacity: 0; transform: translateY(14px); }

        to { opacity: 1; transform: translateY(0); }

      }

    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch detailed data for this check

  useEffect(() => {
    if (!activeProject || !check?.id) return;

    const fetchCheckDetail = async () => {
      try {
        setLoading(true);

        setError(null);

        const response = await apiService.getTechnicalCheckDetail(
          activeProject._id,
          check.id,
        );

        if (response.success) {
          setCheckDetail(response.data.check);

          setAffectedPages(response.data.pages || []);

          console.log(`📊 Loaded ${check.name} detail:`, {
            affectedPages: response.data.pages?.length || 0,

            status: response.data.check?.status,
          });
        } else {
          setError(response?.message || "Failed to load check details");
        }
      } catch (err) {
        console.error("Error fetching check detail:", err);

        setError("Failed to load check details");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckDetail();
  }, [activeProject, check?.id, check?.name]);

  // Use API data or fallback to check prop for backward compatibility

  const currentCheck = checkDetail || check;

  const pages = affectedPages;

  const openUrls = pages.filter((p) => !fixedUrls.includes(p.url));

  const allFixed = fixedUrls.length;

  const progress = pages.length > 0 ? (allFixed / pages.length) * 100 : 100;

  function toggleCheck(url) {
    setChecked((c) =>
      c.includes(url) ? c.filter((x) => x !== url) : [...c, url],
    );
  }

  function startStream(url) {
    setFixingUrl(url);

    setStreamLines([]);

    setStreamDone(false);

    const msgs = [
      { t: 0, l: `🔍 Scanning ${url}…` },

      { t: 700, l: `⚙️ Analysing ${currentCheck.name} configuration…` },

      {
        t: 1500,
        l: `✦ Root cause: ${currentCheck.detail || currentCheck.message || currentCheck.description}`,
      },

      { t: 2300, l: `🧠 Generating targeted fix code…` },

      { t: 3100, l: `✅ Fix ready — +${currentCheck.impact_percentage || 0}% SEO impact` },
    ];

    msgs.forEach((m) =>
      setTimeout(() => setStreamLines((l) => [...l, m.l]), m.t),
    );

    setTimeout(() => setStreamDone(true), 3400);
  }

  function markFixed() {
    if (fixingUrl) {
      setFixedUrls((prev) => [...prev, fixingUrl]);

      setFixingUrl(null);

      setStreamLines([]);

      setStreamDone(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);

    setCopiedPrompt(true);

    setTimeout(() => setCopiedPrompt(false), 2000);
  }

  // Loading state

  if (loading) {
    return (
      <div className="slide-up">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <button onClick={onBack} className="tb-btn">
            ← Technical Checks
          </button>

          <span style={{ color: "var(--t3)", fontSize: 12 }}>›</span>

          <span style={{ fontSize: 12, color: "var(--t2)" }}>
            {check?.name || "Loading..."}
          </span>
        </div>

        <div style={{ padding: "40px 20px" }}>
          <div style={{ textAlign: "center" }}>
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />

            <Skeleton className="h-6 w-48 mx-auto mb-2" />

            <Skeleton className="h-4 w-64 mx-auto mb-6" />

            <div className="stats-row">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="stat-tile">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />

                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state

  if (error) {
    return (
      <div className="slide-up">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <button onClick={onBack} className="tb-btn">
            ← Technical Checks
          </button>

          <span style={{ color: "var(--t3)", fontSize: 12 }}>›</span>

          <span style={{ fontSize: 12, color: "var(--t2)" }}>
            {check?.name || "Error"}
          </span>
        </div>

        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: "var(--red)" }}>
            ⚠️
          </div>

          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Failed to Load
          </div>

          <div
            style={{
              fontSize: 14,
              color: "var(--t2)",
              maxWidth: 400,
              margin: "0 auto 24px",
            }}
          >
            {error}
          </div>

          <button onClick={onBack} className="tb-btn primary">
            ← Back to Technical Checks
          </button>
        </div>
      </div>
    );
  }

  // Special case: Passed check

  if (currentCheck?.status === "passed" || currentCheck?.status === "OK") {
    return (
      <div className="slide-up">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <button onClick={onBack} className="tb-btn">
            ← Technical Checks
          </button>

          <span style={{ color: "var(--t3)", fontSize: 12 }}>›</span>

          <span style={{ fontSize: 12, color: "var(--t2)" }}>
            {currentCheck.name}
          </span>
        </div>

        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>

          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 8,
              color: "var(--green)",
            }}
          >
            All Clear!
          </div>

          <div
            style={{
              fontSize: 14,
              color: "var(--t2)",
              maxWidth: 400,
              margin: "0 auto 24px",
            }}
          >
            {currentCheck.what || currentCheck.message || "No issues detected."}
          </div>

          <div
            className="ai-card"
            style={{ maxWidth: 480, margin: "0 auto 20px", textAlign: "left" }}
          >
            <div className="ai-label">✦ ARIA Insight</div>

            <div className="ai-body">
              {currentCheck.name} is correctly configured. No action needed.
              Monitor this check on every re-audit to ensure it stays green.
            </div>
          </div>

          <button onClick={onBack} className="tb-btn primary">
            ← Back to Technical Checks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-up">
      {/* Breadcrumb */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <button onClick={onBack} className="tb-btn">
          ← Technical Checks
        </button>

        <span style={{ color: "var(--t3)", fontSize: 12 }}>›</span>

        <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>
          {currentCheck.name}
        </span>
      </div>

      {/* Header */}

      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 50,

              height: 50,

              borderRadius: 13,

              display: "grid",

              placeItems: "center",

              fontSize: 22,

              background:
                currentCheck.status === "critical"
                  ? "rgba(255,56,96,0.12)"
                  : currentCheck.status === "warning"
                    ? "rgba(255,183,3,0.10)"
                    : "rgba(0,245,160,0.08)",

              flexShrink: 0,
            }}
          >
            {currentCheck.icon || "⚙"}
          </div>

          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 28,
              fontWeight: 800,
              flex: 1,
              color: "#eef2ff",
            }}
          >
            {currentCheck.name}
          </h2>

          <span
            style={{
              background: "rgba(0,223,255,0.09)",

              border: "1px solid rgba(0,223,255,0.18)",

              color: "#00dfff",

              borderRadius: 20,

              padding: "4px 13px",

              fontSize: 11,

              fontWeight: 600,
            }}
          >
            🗂 {currentCheck.category || "Technical"}
          </span>
        </div>
      </div>

      {/* 4 Stat Tiles */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns: "repeat(4, 1fr)",

          gap: 12,

          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.038)",

            border: "1px solid rgba(255,255,255,0.075)",

            borderRadius: 14,

            padding: "16px 18px",
          }}
        >
          <div
            style={{
              fontSize: "9.5px",

              fontWeight: 700,

              color: "#4e5f7a",

              textTransform: "uppercase",

              letterSpacing: "0.08em",

              marginBottom: 8,
            }}
          >
            PAGES AFFECTED
          </div>

          <div
            style={{
              fontFamily: "Syne, sans-serif",

              fontWeight: 800,

              fontSize: 32,

              lineHeight: 1,

              color: "#ff3860",
            }}
          >
            {pages.length}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.038)",

            border: "1px solid rgba(255,255,255,0.075)",

            borderRadius: 14,

            padding: "16px 18px",
          }}
        >
          <div
            style={{
              fontSize: "9.5px",

              fontWeight: 700,

              color: "#4e5f7a",

              textTransform: "uppercase",

              letterSpacing: "0.08em",

              marginBottom: 8,
            }}
          >
            SEO IMPACT
          </div>

          <div
            style={{
              fontFamily: "Syne, sans-serif",

              fontWeight: 800,

              fontSize: 32,

              lineHeight: 1,

              color: "#00dfff",
            }}
          >
            +{currentCheck.impact_percentage || 0}%
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.038)",

            border: "1px solid rgba(255,255,255,0.075)",

            borderRadius: 14,

            padding: "16px 18px",
          }}
        >
          <div
            style={{
              fontSize: "9.5px",

              fontWeight: 700,

              color: "#4e5f7a",

              textTransform: "uppercase",

              letterSpacing: "0.08em",

              marginBottom: 8,
            }}
          >
            DIFFICULTY
          </div>

          <div
            style={{
              fontFamily: "Syne, sans-serif",

              fontWeight: 800,

              fontSize: 32,

              lineHeight: 1,

              color:
                currentCheck.difficulty === "Easy"
                  ? "#00f5a0"
                  : currentCheck.difficulty === "Medium"
                    ? "#ffb703"
                    : "#ff3860",
            }}
          >
            {currentCheck.difficulty || "Medium"}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.038)",

            border: "1px solid rgba(255,255,255,0.075)",

            borderRadius: 14,

            padding: "16px 18px",
          }}
        >
          <div
            style={{
              fontSize: "9.5px",

              fontWeight: 700,

              color: "#4e5f7a",

              textTransform: "uppercase",

              letterSpacing: "0.08em",

              marginBottom: 8,
            }}
          >
            FIXED
          </div>

          <div
            style={{
              fontFamily: "Syne, sans-serif",

              fontWeight: 800,

              fontSize: 32,

              lineHeight: 1,

              color: "#7730ed",
            }}
          >
            {allFixed}/{pages.length}
          </div>
        </div>
      </div>

      {/* ARIA Issue Breakdown */}

      <div
        style={{
          marginBottom: 22,

          background:
            "linear-gradient(135deg, rgba(119,48,237,0.11), rgba(0,223,255,0.05))",

          border: "1px solid rgba(119,48,237,0.22)",

          borderRadius: 14,

          padding: "18px 22px",

          position: "relative",

          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",

            right: 14,

            top: 12,

            fontSize: 20,

            opacity: 0.1,

            color: "#00dfff",

            pointerEvents: "none",
          }}
        >
          ✦
        </div>

        <div
          style={{
            fontSize: 9,

            fontWeight: 700,

            color: "#c77dff",

            letterSpacing: "0.12em",

            textTransform: "uppercase",

            marginBottom: 8,
          }}
        >
          ✦ ARIA — ISSUE BREAKDOWN
        </div>

        <div
          style={{
            fontSize: 13,

            color: "#8494b0",

            lineHeight: 1.65,
          }}
        >
          {currentCheck.what ||
            currentCheck.message ||
            currentCheck.detail ||
            "No description available."}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5 mt-1 min-w-0">
        {/* Left Column - Affected Pages */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="font-syne text-base font-bold text-[#eef2ff]">
                Affected Pages
              </div>
              <div className="bg-[rgba(0,223,255,0.09)] border border-[rgba(0,223,255,0.18)] text-[#00dfff] rounded-full text-[9px] font-bold px-2.5 py-0.5 ml-2">
                {openUrls.length} OPEN
              </div>
            </div>
            {openUrls.length > 1 && (
              <div className="flex gap-2">
                <button
                  className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] 
                           rounded-lg px-3 py-1.5 text-xs text-[#8494b0] cursor-pointer
                           hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                  onClick={() =>
                    setChecked(
                      openUrls.length === checked.length
                        ? []
                        : openUrls.map((u) => u.url),
                    )
                  }
                >
                  {openUrls.length === checked.length
                    ? "☐ Deselect All"
                    : "☑ Select All"}
                </button>
                {checked.length > 0 && (
                  <button
                    className="bg-gradient-to-r from-[#7730ed] to-[#00dfff] text-white
                             rounded-lg px-3 py-1.5 text-xs font-bold border-none cursor-pointer
                             hover:shadow-lg transition-all"
                    onClick={() => setShowBulkModal(true)}
                  >
                    ✦ Fix {checked.length} with AI
                  </button>
                )}
              </div>
            )}
          </div>

          {checked.length > 0 && (
            <div className="flex items-center gap-2 p-3 mb-3 bg-[rgba(0,223,255,0.05)] border border-[rgba(0,223,255,0.16)] rounded-lg text-xs text-[#00dfff] font-semibold">
              ✦ {checked.length} pages selected
              <button
                className="bg-gradient-to-r from-[#7730ed] to-[#00dfff] text-white border-none
                         rounded-md px-2.5 py-1 text-[10px] font-semibold cursor-pointer ml-auto
                         hover:shadow-md transition-all"
                onClick={() => setShowBulkModal(true)}
              >
                Fix All with AI
              </button>
              <button
                className="bg-transparent border border-[rgba(255,255,255,0.2)] text-[#8494b0]
                         rounded-md px-2.5 py-1 text-[10px] cursor-pointer
                         hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                onClick={() => setChecked([])}
              >
                Clear
              </button>
            </div>
          )}

          {/* URL Rows */}
          {pages.map((page, i) => {
            const isFixed = fixedUrls.includes(page.url);
            const isSelected = selUrl === page.url;
            const isChecked = checked.includes(page.url);

            return (
              <div
                key={i}
                className={`
                  flex items-center gap-2.5 p-3 mb-2 bg-[rgba(255,255,255,0.03)] rounded-xl cursor-pointer 
                  transition-all duration-200 border min-w-0
                  ${isSelected && !isFixed ? "bg-[rgba(119,48,237,0.07)] border-[rgba(119,48,237,0.4)]" : "border-[rgba(255,255,255,0.075)]"}
                  ${isFixed ? "opacity-55" : "hover:bg-[rgba(255,255,255,0.05)]"}
                `}
                onClick={() =>
                  !isFixed && setSelUrl(isSelected ? null : page.url)
                }
              >
                {!isFixed && (
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(page.url)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-3.5 h-3.5 accent-[#7730ed] cursor-pointer flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-dm-mono text-xs text-[#00dfff] font-medium truncate">
                    {page.url}
                  </div>
                  <div className="text-[10.5px] text-[#4e5f7a] mt-0.5 truncate">
                    {page.issue || "Issue detected on this page"}
                  </div>
                </div>
                {!isFixed && (
                  <>
                    <button
                      className="bg-[rgba(255,56,96,0.11)] text-[#ff3860] border border-[rgba(255,56,96,0.2)] 
                               text-[10px] font-medium px-2.5 py-1 rounded-md flex-shrink-0 mr-1.5
                               transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.3)]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenUrl?.(page.url);
                      }}
                    >
                      Open
                    </button>
                    <button
                      className="bg-gradient-to-r from-[#7730ed] to-[#00dfff] text-white border-none
                               text-[10px] font-bold px-3 py-1 rounded-md flex-shrink-0
                               shadow-[0_0_12px_rgba(0,223,255,0.2)] transition-all duration-200
                               hover:-translate-y-px hover:shadow-[0_3px_16px_rgba(0,223,255,0.3)]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelUrl(page.url);
                        setMode("ai");
                        startStream(page.url);
                      }}
                    >
                      ✦ Fix
                    </button>
                  </>
                )}
              </div>
            );
          })}

          {/* Progress Card */}
          <div className="mt-3.5 bg-[rgba(255,255,255,0.038)] border border-[rgba(255,255,255,0.075)] rounded-xl p-4">
            <div className="flex justify-between mb-2.5">
              <span className="text-xs text-[#8494b0]">
                Remediation Progress
              </span>
              <span className="text-xs font-bold text-[#00f5a0]">
                {allFixed}/{pages.length} Fixed
              </span>
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-[#00f5a0] transition-all duration-1100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && (
              <div className="text-xs text-[#00f5a0] font-semibold text-center mt-2.5">
                🎉 All issues resolved! Re-audit to confirm.
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Fix Panel */}
        <div className="w-full lg:w-96 xl:w-[460px] flex-shrink-0">
          <div className="bg-[#06101d] border border-[rgba(255,255,255,0.075)] rounded-2xl overflow-hidden sticky top-0">
            {/* Panel Header */}
            <div className="px-4.5 py-4 border-b border-[rgba(255,255,255,0.075)] flex items-center justify-between">
              <div>
                <div className="font-syne text-sm font-bold text-[#eef2ff]">
                  {fixingUrl
                    ? "🔧 AI Fixing"
                    : selUrl
                      ? "🔍 Selected"
                      : "Fix Assistant"}
                </div>
              </div>
              {(selUrl || fixingUrl) && (
                <button
                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] 
                           rounded-md px-2 py-0.5 text-xs text-[#8494b0] cursor-pointer
                           hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                  onClick={() => {
                    setSelUrl(null);
                    setFixingUrl(null);
                    setStreamLines([]);
                    setStreamDone(false);
                  }}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Panel Body */}
            <div className="p-4.5 max-h-[calc(100vh-180px)] overflow-y-auto">
              {/* 3-Tab Switcher */}
              <div
                style={{
                  display: "grid",

                  gridTemplateColumns: "1fr 1fr 1fr",

                  border: "1px solid rgba(255,255,255,0.075)",

                  borderRadius: 10,

                  overflow: "hidden",

                  marginBottom: 18,
                }}
              >
                <button
                  style={{
                    padding: "9px 6px",

                    fontSize: 11,

                    fontWeight: 600,

                    border: "none",

                    background:
                      mode === "ai"
                        ? "linear-gradient(135deg,#7730ed,#00dfff)"
                        : "transparent",

                    color: mode === "ai" ? "#fff" : "rgba(255,255,255,0.35)",

                    cursor: "pointer",

                    lineHeight: 1.3,

                    transition: "all 0.2s",

                    borderRight: "1px solid rgba(255,255,255,0.075)",
                  }}
                  onClick={() => setMode("ai")}
                >
                  ✦ Fix with AI
                </button>

                <button
                  style={{
                    padding: "9px 6px",

                    fontSize: 11,

                    fontWeight: 600,

                    border: "none",

                    background:
                      mode === "diy"
                        ? "linear-gradient(135deg,#7730ed,#00dfff)"
                        : "transparent",

                    color: mode === "diy" ? "#fff" : "rgba(255,255,255,0.35)",

                    cursor: "pointer",

                    lineHeight: 1.3,

                    transition: "all 0.2s",

                    borderLeft: "1px solid rgba(255,255,255,0.075)",

                    borderRight: "1px solid rgba(255,255,255,0.075)",
                  }}
                  onClick={() => setMode("diy")}
                >
                  🛠 DIY Guide
                </button>

                <button
                  style={{
                    padding: "9px 6px",

                    fontSize: 11,

                    fontWeight: 600,

                    border: "none",

                    background:
                      mode === "help"
                        ? "linear-gradient(135deg,#7730ed,#00dfff)"
                        : "transparent",

                    color: mode === "help" ? "#fff" : "rgba(255,255,255,0.35)",

                    cursor: "pointer",

                    lineHeight: 1.3,

                    transition: "all 0.2s",

                    borderLeft: "1px solid rgba(255,255,255,0.075)",
                  }}
                  onClick={() => setMode("help")}
                >
                  🤝 AuditIQ
                </button>
              </div>

              {/* Tab 1: AI Fix */}

              {mode === "ai" && (
                <div>
                  {fixingUrl ? (
                    <div>
                      {/* Stream Animation */}

                      <div
                        style={{
                          background: "rgba(0,0,0,0.4)",

                          border: "1px solid rgba(0,223,255,0.12)",

                          borderRadius: 10,

                          padding: "13px 15px",

                          minHeight: 72,

                          marginBottom: 12,

                          fontFamily: "'DM Mono', monospace",

                          fontSize: 12,

                          lineHeight: 1.7,

                          color: "#8494b0",
                        }}
                      >
                        {streamLines.map((line, i) => (
                          <div
                            key={i}
                            style={{
                              marginBottom: 3,

                              animation: "fixFadeUp 0.3s ease forwards",
                            }}
                          >
                            {line}
                          </div>
                        ))}

                        {!streamDone && (
                          <span
                            style={{
                              display: "inline-block",

                              width: 2,

                              height: 12,

                              background: "#00dfff",

                              marginLeft: 1,

                              animation: "fixBlink 1s infinite",

                              verticalAlign: "middle",
                            }}
                          />
                        )}
                      </div>

                      {streamDone && (
                        <div
                          style={{ animation: "fixFadeUp 0.3s ease forwards" }}
                        >
                          {/* Generated Fix Code Label */}

                          <div
                            style={{
                              fontSize: 10,

                              fontWeight: 700,

                              color: "#4e5f7a",

                              textTransform: "uppercase",

                              letterSpacing: "0.08em",

                              marginBottom: 8,
                            }}
                          >
                            Generated Fix Code
                          </div>

                          {/* Before/After Grid */}

                          <div
                            style={{
                              display: "grid",

                              gridTemplateColumns: "1fr 1fr",

                              gap: 8,

                              marginBottom: 12,
                            }}
                          >
                            <div
                              style={{
                                background: "rgba(255,56,96,0.06)",

                                border: "1px solid rgba(255,56,96,0.15)",

                                color: "#ffaab5",

                                borderRadius: 9,

                                padding: "11px 13px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "8.5px",

                                  fontWeight: 700,

                                  letterSpacing: "0.1em",

                                  marginBottom: 6,

                                  textTransform: "uppercase",

                                  opacity: 0.6,

                                  fontFamily: "'DM Sans', sans-serif",
                                }}
                              >
                                ❌ BEFORE
                              </div>

                              <pre
                                style={{ whiteSpace: "pre-wrap", fontSize: 10 }}
                              >
                                {currentCheck.before || "<!-- Before code -->"}
                              </pre>
                            </div>

                            <div
                              style={{
                                background: "rgba(0,245,160,0.05)",

                                border: "1px solid rgba(0,245,160,0.15)",

                                color: "#5ef7c0",

                                borderRadius: 9,

                                padding: "11px 13px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "8.5px",

                                  fontWeight: 700,

                                  letterSpacing: "0.1em",

                                  marginBottom: 6,

                                  textTransform: "uppercase",

                                  opacity: 0.6,

                                  fontFamily: "'DM Sans', sans-serif",
                                }}
                              >
                                ✅ AFTER
                              </div>

                              <pre
                                style={{ whiteSpace: "pre-wrap", fontSize: 10 }}
                              >
                                {currentCheck.after || "<!-- After code -->"}
                              </pre>
                            </div>
                          </div>

                          {/* ARIA Explanation Card */}

                          <div
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(119,48,237,0.11), rgba(0,223,255,0.05))",

                              border: "1px solid rgba(119,48,237,0.22)",

                              borderRadius: 14,

                              padding: "12px 14px",

                              marginBottom: 12,

                              position: "relative",

                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",

                                right: 14,

                                top: 12,

                                fontSize: 20,

                                opacity: 0.1,

                                color: "#00dfff",

                                pointerEvents: "none",
                              }}
                            >
                              ✦
                            </div>

                            <div
                              style={{
                                fontSize: 9,

                                fontWeight: 700,

                                color: "#c77dff",

                                letterSpacing: "0.12em",

                                textTransform: "uppercase",

                                marginBottom: 6,
                              }}
                            >
                              ✦ ARIA Explanation
                            </div>

                            <div
                              style={{
                                fontSize: 11.5,

                                color: "#8494b0",

                                lineHeight: 1.65,
                              }}
                            >
                              This fix resolves{" "}
                              <strong style={{ color: "#eef2ff" }}>
                                {currentCheck.name}
                              </strong>{" "}
                              on{" "}
                              <strong
                                style={{
                                  color: "#00dfff",
                                  fontFamily: "'DM Mono', monospace",
                                }}
                              >
                                {fixingUrl}
                              </strong>
                              . Estimated recovery:{" "}
                              <strong style={{ color: "#00f5a0" }}>
                                +{currentCheck.impact_percentage || 0}% SEO
                              </strong>
                              . Difficulty:{" "}
                              <strong style={{ color: "#eef2ff" }}>
                                {currentCheck.difficulty || "Medium"}
                              </strong>
                              .
                            </div>
                          </div>

                          <button
                            style={{
                              width: "100%",

                              padding: 10,

                              borderRadius: 9,

                              fontSize: "12.5px",

                              fontWeight: 600,

                              cursor: "pointer",

                              border: "none",

                              fontFamily: "'DM Sans', sans-serif",

                              display: "flex",

                              alignItems: "center",

                              justifyContent: "center",

                              gap: 6,

                              marginBottom: 7,

                              background: "rgba(0,245,160,0.1)",

                              border: "1px solid rgba(0,245,160,0.2)",

                              color: "#00f5a0",
                            }}
                            onClick={markFixed}
                          >
                            ✓ Mark as Fixed
                          </button>

                          <button
                            style={{
                              width: "100%",

                              padding: 10,

                              borderRadius: 9,

                              fontSize: "12.5px",

                              fontWeight: 600,

                              cursor: "pointer",

                              border: "none",

                              fontFamily: "'DM Sans', sans-serif",

                              display: "flex",

                              alignItems: "center",

                              justifyContent: "center",

                              gap: 6,

                              marginBottom: 7,

                              background: "rgba(255,255,255,0.065)",

                              color: "#8494b0",

                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                            onClick={() => copyToClipboard(currentCheck.after)}
                          >
                            {copiedPrompt ? "✓ Copied!" : "📋 Copy Code"}
                          </button>

                          <button
                            style={{
                              width: "100%",

                              padding: 10,

                              borderRadius: 9,

                              fontSize: "12.5px",

                              fontWeight: 600,

                              cursor: "pointer",

                              border: "none",

                              fontFamily: "'DM Sans', sans-serif",

                              display: "flex",

                              alignItems: "center",

                              justifyContent: "center",

                              gap: 6,

                              background: "rgba(255,255,255,0.065)",

                              color: "#8494b0",

                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            👥 Send to Dev Team
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {/* Hint Box */}

                      <div
                        style={{
                          background: "rgba(255,255,255,0.038)",

                          borderRadius: 8,

                          padding: "8px 11px",

                          fontSize: "11.5px",

                          marginBottom: 14,

                          color: selUrl ? "#00dfff" : "#4e5f7a",

                          fontFamily: selUrl
                            ? "'DM Mono', monospace"
                            : "'DM Sans', sans-serif",
                        }}
                      >
                        {selUrl
                          ? `Selected: ${selUrl}`
                          : "👆 Select a page from the list to generate a targeted AI fix"}
                      </div>

                      {/* AI Prompt Template Card */}

                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(119,48,237,0.11), rgba(0,223,255,0.05))",

                          border: "1px solid rgba(119,48,237,0.22)",

                          borderRadius: 14,

                          padding: "18px 22px",

                          marginBottom: 16,

                          position: "relative",

                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",

                            right: 14,

                            top: 12,

                            fontSize: 20,

                            opacity: 0.1,

                            color: "#00dfff",

                            pointerEvents: "none",
                          }}
                        >
                          ✦
                        </div>

                        <div
                          style={{
                            fontSize: 9,

                            fontWeight: 700,

                            color: "#c77dff",

                            letterSpacing: "0.12em",

                            textTransform: "uppercase",

                            marginBottom: 8,
                          }}
                        >
                          ✦ AI PROMPT TEMPLATE
                        </div>

                        <div
                          style={{
                            fontSize: "11.5px",

                            color: "#8494b0",

                            lineHeight: 1.65,

                            marginBottom: 10,
                          }}
                        >
                          {currentCheck.aiPrompt ||
                            "Generate AI prompt for fixing this issue..."}
                        </div>

                        <button
                          style={{
                            background: "rgba(255,255,255,0.05)",

                            border: "1px solid rgba(255,255,255,0.1)",

                            borderRadius: 6,

                            padding: "4px 10px",

                            fontSize: 10,

                            color: "#8494b0",

                            cursor: "pointer",

                            marginTop: 0,
                          }}
                          onClick={() => copyToClipboard(currentCheck.aiPrompt)}
                        >
                          {copiedPrompt ? "✓ Copied!" : "📋 Copy Prompt"}
                        </button>
                      </div>

                      {/* Before/After Code Blocks */}

                      <div
                        style={{
                          display: "grid",

                          gridTemplateColumns: "1fr 1fr",

                          gap: 8,

                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            background: "rgba(255,56,96,0.06)",

                            border: "1px solid rgba(255,56,96,0.15)",

                            color: "#ffaab5",

                            borderRadius: 9,

                            padding: "11px 13px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "8.5px",

                              fontWeight: 700,

                              letterSpacing: "0.1em",

                              marginBottom: 6,

                              textTransform: "uppercase",

                              opacity: 0.6,

                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            ❌ BEFORE
                          </div>

                          <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                            {currentCheck.before || "<!-- Before code -->"}
                          </pre>
                        </div>

                        <div
                          style={{
                            background: "rgba(0,245,160,0.05)",

                            border: "1px solid rgba(0,245,160,0.15)",

                            color: "#5ef7c0",

                            borderRadius: 9,

                            padding: "11px 13px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "8.5px",

                              fontWeight: 700,

                              letterSpacing: "0.1em",

                              marginBottom: 6,

                              textTransform: "uppercase",

                              opacity: 0.6,

                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            ✅ AFTER
                          </div>

                          <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                            {currentCheck.after || "<!-- After code -->"}
                          </pre>
                        </div>
                      </div>

                      <button
                        style={{
                          width: "100%",

                          padding: 10,

                          borderRadius: 9,

                          fontSize: "12.5px",

                          fontWeight: 600,

                          cursor: "pointer",

                          border: "none",

                          fontFamily: "'DM Sans', sans-serif",

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          gap: 6,

                          marginBottom: 7,

                          background: "linear-gradient(135deg,#7730ed,#00dfff)",

                          color: "#fff",

                          opacity: selUrl ? 1 : 0.5,

                          boxShadow: selUrl
                            ? "0 0 18px rgba(0,223,255,0.16)"
                            : "none",
                        }}
                        onClick={() => selUrl && startStream(selUrl)}
                      >
                        ✦ Generate Fix for {selUrl || "URL"}
                      </button>

                      <button
                        style={{
                          width: "100%",

                          padding: 10,

                          borderRadius: 9,

                          fontSize: "12.5px",

                          fontWeight: 600,

                          cursor: "pointer",

                          border: "none",

                          fontFamily: "'DM Sans', sans-serif",

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          gap: 6,

                          marginBottom: 7,

                          background:
                            "linear-gradient(135deg, rgba(119,48,237,0.28), rgba(157,78,221,0.2))",

                          color: "#c77dff",

                          border: "1px solid rgba(119,48,237,0.28)",

                          opacity: checked.length > 0 ? 1 : 0.5,
                        }}
                        onClick={() =>
                          checked.length > 0 && setShowBulkModal(true)
                        }
                      >
                        ✦ Bulk Fix ({checked.length} pages)
                      </button>

                      <button
                        style={{
                          width: "100%",

                          padding: 10,

                          borderRadius: 9,

                          fontSize: "12.5px",

                          fontWeight: 600,

                          cursor: "pointer",

                          border: "none",

                          fontFamily: "'DM Sans', sans-serif",

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          gap: 6,

                          background: "rgba(255,255,255,0.065)",

                          color: "#8494b0",

                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        👥 Assign to Dev Team
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: DIY Guide */}

              {mode === "diy" && (
                <div>
                  {/* What to do card */}

                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(119,48,237,0.11), rgba(0,223,255,0.05))",

                      border: "1px solid rgba(119,48,237,0.22)",

                      borderRadius: 14,

                      padding: "18px 22px",

                      marginBottom: 16,

                      position: "relative",

                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",

                        right: 14,

                        top: 12,

                        fontSize: 20,

                        opacity: 0.1,

                        color: "#00dfff",

                        pointerEvents: "none",
                      }}
                    >
                      ✦
                    </div>

                    <div
                      style={{
                        fontSize: 9,

                        fontWeight: 700,

                        color: "#c77dff",

                        letterSpacing: "0.12em",

                        textTransform: "uppercase",

                        marginBottom: 8,
                      }}
                    >
                      🛠 What to do
                    </div>

                    <div
                      style={{
                        fontSize: "11.5px",

                        color: "#8494b0",

                        lineHeight: 1.65,
                      }}
                    >
                      {currentCheck.whatToDo ||
                        currentCheck.what ||
                        "Follow these steps to fix the issue."}
                    </div>
                  </div>

                  {/* Step-by-Step Guide Label */}

                  <div
                    style={{
                      fontSize: 10,

                      fontWeight: 700,

                      color: "#4e5f7a",

                      textTransform: "uppercase",

                      letterSpacing: "0.08em",

                      marginBottom: 11,
                    }}
                  >
                    Step-by-Step Guide
                  </div>

                  {/* Steps */}

                  {(
                    currentCheck.diySteps || [
                      {
                        title: "Identify the issue",
                        desc: "Locate all instances where this problem occurs on your website.",
                      },

                      {
                        title: "Apply the fix",
                        desc: "Implement the recommended changes using the provided code examples.",
                      },

                      {
                        title: "Test and verify",
                        desc: "Check that the fix works correctly and doesn't break anything else.",
                      },
                    ]
                  ).map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",

                        gap: 10,

                        alignItems: "flex-start",

                        marginBottom: 13,
                      }}
                    >
                      <div
                        style={{
                          width: 22,

                          height: 22,

                          borderRadius: "50%",

                          background: "linear-gradient(135deg,#7730ed,#00dfff)",

                          display: "grid",

                          placeItems: "center",

                          fontSize: 10,

                          fontWeight: 800,

                          color: "#fff",

                          flexShrink: 0,

                          marginTop: 1,

                          fontFamily: "Syne, sans-serif",
                        }}
                      >
                        {i + 1}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "12.5px",

                            fontWeight: 600,

                            marginBottom: 2,

                            color: "#eef2ff",
                          }}
                        >
                          {step.title}
                        </div>

                        <div
                          style={{
                            fontSize: "11.5px",

                            color: "#8494b0",

                            lineHeight: 1.55,
                          }}
                        >
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Before/After */}

                  <div
                    style={{
                      display: "grid",

                      gridTemplateColumns: "1fr 1fr",

                      gap: 8,

                      marginTop: 14,
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(255,56,96,0.06)",

                        border: "1px solid rgba(255,56,96,0.15)",

                        color: "#ffaab5",

                        borderRadius: 9,

                        padding: "11px 13px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "8.5px",

                          fontWeight: 700,

                          letterSpacing: "0.1em",

                          marginBottom: 6,

                          textTransform: "uppercase",

                          opacity: 0.6,

                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        ❌ BEFORE
                      </div>

                      <pre style={{ whiteSpace: "pre-wrap", fontSize: 9.5 }}>
                        {currentCheck.before || "<!-- Before code -->"}
                      </pre>
                    </div>

                    <div
                      style={{
                        background: "rgba(0,245,160,0.05)",

                        border: "1px solid rgba(0,245,160,0.15)",

                        color: "#5ef7c0",

                        borderRadius: 9,

                        padding: "11px 13px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "8.5px",

                          fontWeight: 700,

                          letterSpacing: "0.1em",

                          marginBottom: 6,

                          textTransform: "uppercase",

                          opacity: 0.6,

                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        ✅ AFTER
                      </div>

                      <pre style={{ whiteSpace: "pre-wrap", fontSize: 9.5 }}>
                        {currentCheck.after || "<!-- After code -->"}
                      </pre>
                    </div>
                  </div>

                  <button
                    style={{
                      width: "100%",

                      padding: 10,

                      borderRadius: 9,

                      fontSize: "12.5px",

                      fontWeight: 600,

                      cursor: "pointer",

                      border: "none",

                      fontFamily: "'DM Sans', sans-serif",

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      gap: 6,

                      marginBottom: 7,

                      background: "linear-gradient(135deg,#7730ed,#00dfff)",

                      color: "#fff",

                      boxShadow: "0 0 18px rgba(0,223,255,0.16)",
                    }}
                  >
                    📥 Download Full Checklist
                  </button>

                  <button
                    style={{
                      width: "100%",

                      padding: 10,

                      borderRadius: 9,

                      fontSize: "12.5px",

                      fontWeight: 600,

                      cursor: "pointer",

                      border: "none",

                      fontFamily: "'DM Sans', sans-serif",

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      gap: 6,

                      marginBottom: 7,

                      background: "rgba(255,255,255,0.065)",

                      color: "#8494b0",

                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onClick={() => copyToClipboard(currentCheck.after)}
                  >
                    📋 Copy Code Fix
                  </button>

                  <button
                    style={{
                      width: "100%",

                      padding: 10,

                      borderRadius: 9,

                      fontSize: "12.5px",

                      fontWeight: 600,

                      cursor: "pointer",

                      border: "none",

                      fontFamily: "'DM Sans', sans-serif",

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      gap: 6,

                      background: "rgba(255,255,255,0.065)",

                      color: "#8494b0",

                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onClick={() => setMode("ai")}
                  >
                    ✦ Switch to AI Fix
                  </button>
                </div>
              )}

              {/* Tab 3: AuditIQ Help */}

              {mode === "help" && (
                <div>
                  {/* Centered Header Section */}

                  <div
                    style={{
                      textAlign: "center",

                      padding: "16px 0 18px",
                    }}
                  >
                    <div
                      style={{
                        width: 52,

                        height: 52,

                        borderRadius: 14,

                        background: "linear-gradient(135deg,#7730ed,#00dfff)",

                        display: "grid",

                        placeItems: "center",

                        fontSize: 24,

                        margin: "0 auto 12px",
                      }}
                    >
                      🤝
                    </div>

                    <div
                      style={{
                        fontFamily: "Syne, sans-serif",

                        fontSize: 17,

                        fontWeight: 800,

                        marginBottom: 6,
                      }}
                    >
                      Let AuditIQ Fix It
                    </div>

                    <div
                      style={{
                        fontSize: 12,

                        color: "#8494b0",

                        lineHeight: 1.6,
                      }}
                    >
                      Our technical team will resolve{" "}
                      <strong style={{ color: "#eef2ff" }}>
                        {currentCheck.name}
                      </strong>{" "}
                      across all {openUrls.length} affected pages — with QA
                      verification and a before/after report.
                    </div>
                  </div>

                  {/* Service Options */}

                  {[
                    {
                      icon: "⚡",

                      title: "Express Fix",

                      desc: "Fix all pages in 24 hours",

                      tag: "Most Popular",

                      tc: "#00dfff",

                      bg: "rgba(0,223,255,0.12)",
                    },

                    {
                      icon: "🔍",

                      title: "Technical Audit + Fix",

                      desc: "Full review then implement fixes with docs",

                      tag: "Comprehensive",

                      tc: "#c77dff",

                      bg: "rgba(119,48,237,0.12)",
                    },

                    {
                      icon: "♾",

                      title: "Monthly Maintenance",

                      desc: "Ongoing fixes + monitoring + alerts",

                      tag: "Best Value",

                      tc: "#00f5a0",

                      bg: "rgba(0,245,160,0.08)",
                    },
                  ].map((option, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",

                        alignItems: "center",

                        gap: 12,

                        padding: "13px 14px",

                        marginBottom: 9,

                        background: "rgba(255,255,255,0.03)",

                        border: "1px solid rgba(255,255,255,0.075)",

                        borderRadius: 11,

                        cursor: "pointer",

                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.14)";

                        e.target.style.transform = "translateX(2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.075)";

                        e.target.style.transform = "translateX(0)";
                      }}
                    >
                      <div
                        style={{
                          width: 38,

                          height: 38,

                          borderRadius: 10,

                          display: "grid",

                          placeItems: "center",

                          fontSize: 20,

                          background: option.bg,

                          flexShrink: 0,
                        }}
                      >
                        {option.icon}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,

                            fontSize: 13,

                            marginBottom: 2,
                          }}
                        >
                          {option.title}
                        </div>

                        <div
                          style={{
                            fontSize: 11,

                            color: "#4e5f7a",
                          }}
                        >
                          {option.desc}
                        </div>
                      </div>

                      <span
                        style={{
                          borderRadius: 20,

                          padding: "2px 9px",

                          fontSize: "9.5px",

                          fontWeight: 600,

                          color: option.tc,

                          background: `${option.tc}12`,

                          border: `1px solid ${option.tc}18`,
                        }}
                      >
                        {option.tag}
                      </span>
                    </div>
                  ))}

                  <button
                    style={{
                      width: "100%",

                      padding: 10,

                      borderRadius: 9,

                      fontSize: "12.5px",

                      fontWeight: 600,

                      cursor: "pointer",

                      border: "none",

                      fontFamily: "'DM Sans', sans-serif",

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      gap: 6,

                      marginBottom: 7,

                      background: "linear-gradient(135deg,#7730ed,#00dfff)",

                      color: "#fff",

                      boxShadow: "0 0 18px rgba(0,223,255,0.16)",
                    }}
                  >
                    🚀 Request Expert Fix
                  </button>

                  <button
                    style={{
                      width: "100%",

                      padding: 10,

                      borderRadius: 9,

                      fontSize: "12.5px",

                      fontWeight: 600,

                      cursor: "pointer",

                      border: "none",

                      fontFamily: "'DM Sans', sans-serif",

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      gap: 6,

                      marginBottom: 7,

                      background:
                        "linear-gradient(135deg, rgba(119,48,237,0.28), rgba(157,78,221,0.2))",

                      color: "#c77dff",

                      border: "1px solid rgba(119,48,237,0.28)",
                    }}
                  >
                    📅 Book a Strategy Call
                  </button>

                  <button
                    style={{
                      width: "100%",

                      padding: 10,

                      borderRadius: 9,

                      fontSize: "12.5px",

                      fontWeight: 600,

                      cursor: "pointer",

                      border: "none",

                      fontFamily: "'DM Sans', sans-serif",

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      gap: 6,

                      background: "rgba(255,255,255,0.065)",

                      color: "#8494b0",

                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onClick={() => setMode("ai")}
                  >
                    ← Back to AI Fix
                  </button>

                  {/* Green Info Strip */}

                  <div
                    style={{
                      background: "rgba(0,245,160,0.05)",

                      border: "1px solid rgba(0,245,160,0.14)",

                      borderRadius: 9,

                      padding: "10px 12px",

                      marginTop: 12,

                      fontSize: 11,

                      color: "#00f5a0",

                      textAlign: "center",
                    }}
                  >
                    ✓ Includes before/after screenshots + 30-day rank tracking
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Fix Modal */}

        {showBulkModal && (
          <div
            style={{
              position: "fixed",

              inset: 0,

              background: "rgba(0,0,0,0.75)",

              backdropFilter: "blur(10px)",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              zIndex: 9999,

              padding: 20,
            }}
          >
            <div
              style={{
                background: "#06101d",

                border: "1px solid rgba(119,48,237,0.3)",

                borderRadius: 16,

                padding: 26,

                maxWidth: 520,

                width: "100%",

                animation: "fixSlideUp 0.3s ease",
              }}
            >
              <div
                style={{
                  fontFamily: "Syne, sans-serif",

                  fontSize: 19,

                  fontWeight: 800,

                  marginBottom: 6,
                }}
              >
                ✦ Bulk AI Fix
              </div>

              <div
                style={{
                  fontSize: "12.5px",

                  color: "#8494b0",

                  marginBottom: 18,
                }}
              >
                Generating fixes for {checked.length} pages —{" "}
                {currentCheck.name}
              </div>

              <div
                style={{
                  maxHeight: 280,

                  overflowY: "auto",

                  marginBottom: 16,
                }}
              >
                {checked.map((url, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: 9,

                      padding: "8px 11px",

                      marginBottom: 7,

                      background: "rgba(255,255,255,0.038)",

                      borderRadius: 8,

                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: "#00f5a0" }}>✓</span>

                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",

                        color: "#00dfff",

                        flex: 1,

                        fontSize: 11,
                      }}
                    >
                      {url}
                    </span>

                    <span
                      style={{
                        background: "rgba(0,245,160,0.09)",

                        border: "1px solid rgba(0,245,160,0.18)",

                        color: "#00f5a0",

                        borderRadius: 20,

                        fontSize: 9,

                        fontWeight: 600,

                        padding: "2px 7px",
                      }}
                    >
                      Fix ready
                    </span>
                  </div>
                ))}
              </div>

              <button
                style={{
                  width: "100%",

                  padding: 10,

                  borderRadius: 9,

                  fontSize: "12.5px",

                  fontWeight: 600,

                  cursor: "pointer",

                  border: "none",

                  fontFamily: "'DM Sans', sans-serif",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  gap: 6,

                  marginBottom: 8,

                  background: "linear-gradient(135deg,#7730ed,#00dfff)",

                  color: "#fff",

                  boxShadow: "0 0 18px rgba(0,223,255,0.16)",
                }}
                onClick={() => {
                  setFixedUrls((prev) => [...prev, ...checked]);

                  setChecked([]);

                  setShowBulkModal(false);
                }}
              >
                ✓ Apply All Fixes ({checked.length} pages)
              </button>

              <button
                style={{
                  width: "100%",

                  padding: 10,

                  borderRadius: 9,

                  fontSize: "12.5px",

                  fontWeight: 600,

                  cursor: "pointer",

                  border: "none",

                  fontFamily: "'DM Sans', sans-serif",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  gap: 6,

                  background: "rgba(255,255,255,0.065)",

                  color: "#8494b0",

                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onClick={() => setShowBulkModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
