const StepList = ({ steps, done, active, jobStatus, getStepStatus }) => {
  const getStepIcon = (stepIndex) => {
    const status = getStepStatus ? getStepStatus(stepIndex) : 'pending';
    const step = steps[stepIndex];
    
    if (status === 'completed') return "✓";
    if (status === 'failed') return "✗";
    if (status === 'processing') return "⟳";
    return step.icon;
  };
  
  const getStepClassName = (stepIndex) => {
    const status = getStepStatus ? getStepStatus(stepIndex) : 'pending';
    
    if (status === 'completed') return "done";
    if (status === 'failed') return "failed";
    if (status === 'processing') return "active";
    return "pending";
  };
  
  const getStepLabelColor = (stepIndex) => {
    const status = getStepStatus ? getStepStatus(stepIndex) : 'pending';
    
    if (status === 'completed') return "var(--text)";
    if (status === 'failed') return "var(--destructive)";
    if (status === 'processing') return "var(--cyan)";
    return "var(--text3)";
  };
  
  const getStepBadge = (stepIndex) => {
    const status = getStepStatus ? getStepStatus(stepIndex) : 'pending';
    
    if (status === 'completed') return <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>Done</span>;
    if (status === 'failed') return <span style={{ fontSize: 11, color: "var(--destructive)", fontWeight: 600 }}>Failed</span>;
    if (status === 'processing') return <span style={{ fontSize: 11, color: "var(--cyan)", fontWeight: 600 }}>Running...</span>;
    return null;
  };

  return (
    <div>
      {steps.map((s, i) => (
        <div key={i} className="process-step">
          <div className={`process-icon ${getStepClassName(i)}`}>
            {getStepIcon(i)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: getStepLabelColor(i) }}>{s.label}</div>
          </div>
          {getStepBadge(i)}
        </div>
      ))}
    </div>
  );
};

export default StepList;
