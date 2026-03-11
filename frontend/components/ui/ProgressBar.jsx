"use client";

import { useState, useEffect } from "react";

export default function ProgressBar({ val, color = "var(--cyan)", animated = true }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(val), 400); return () => clearTimeout(t); }, [val]);
  return (
    <div className="prog-bar">
      <div className="prog-fill" style={{ width: animated ? `${w}%` : `${val}%`, background: color }} />
    </div>
  );
}
