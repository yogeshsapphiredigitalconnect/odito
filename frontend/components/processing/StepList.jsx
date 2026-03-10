const StepList = ({ steps, done, active }) => {
  return (
    <div>
      {steps.map((s, i) => (
        <div key={i} className="process-step">
          <div className={`process-icon ${done.includes(i) ? "done" : i === active ? "active" : "pending"}`}>
            {done.includes(i) ? "✓" : i === active ? "⟳" : s.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: done.includes(i) ? "var(--text)" : i === active ? "var(--cyan)" : "var(--text3)" }}>{s.label}</div>
          </div>
          {done.includes(i) && <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>Done</span>}
          {i === active && <span style={{ fontSize: 11, color: "var(--cyan)", fontWeight: 600 }}>Running...</span>}
        </div>
      ))}
    </div>
  );
};

export default StepList;
