"use client"

const CircularProgress = ({ 
  percentage = 0, 
  size = 100, 
  strokeWidth = 8,
  className = "",
  color = "text-white",
  children 
}) => {
  const safeValue = percentage ?? 0;
  const displayValue = isNaN(Number(safeValue)) ? 0 : Number(safeValue);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`relative ${className}`}>
      <svg 
        className="transform -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress Circle - Always render */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percentage / 100)}
          className={`${color} transition-all duration-500 ease-out`}
        />
      </svg>
      
      {/* Center Content - OUTSIDE SVG */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center relative z-10">
          <span className={`text-3xl font-bold animate-in fade-in zoom-in duration-700 ${color}`}>{displayValue}%</span>
        </div>
      </div>
    </div>
  );
};

export default CircularProgress;
