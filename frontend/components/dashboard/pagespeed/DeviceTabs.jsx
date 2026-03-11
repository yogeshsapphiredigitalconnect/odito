export default function DeviceTabs({ active, onChange }) {
  return (
    <div className="tabs" style={{ margin: 0 }}>
      <div className={`tab ${active === "mobile" ? "active" : ""}`} onClick={() => onChange("mobile")}>📱 Mobile</div>
      <div className={`tab ${active === "desktop" ? "active" : ""}`} onClick={() => onChange("desktop")}>🖥 Desktop</div>
    </div>
  );
}
