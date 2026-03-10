"use client";

import { useState } from 'react';

const ARIAChat = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([
    { type: "ai", text: "👋 Hey! I'm ARIA, your AI SEO co-pilot. Let's uncover what's holding your site back — and what's possible. What's your website URL?" }
  ]);
  const [input, setInput] = useState("");

  const prompts = [
    "What are your 3 main target keywords?",
    "What industry / niche are you in?",
    "Any competitors you'd like to compare against?",
    "Perfect! Analyzing now... 🔍",
  ];

  function send() {
    if (!input.trim()) return;
    const newMsgs = [...messages, { type: "user", text: input }];
    setInput("");
    setMessages(newMsgs);
    setTimeout(() => {
      if (step < prompts.length - 1) {
        setMessages(m => [...m, { type: "ai", text: prompts[step] }]);
        setStep(s => s + 1);
      } else {
        setMessages(m => [...m, { type: "ai", text: prompts[prompts.length - 1] }]);
        setTimeout(onComplete, 1200);
      }
    }, 600);
  }

  return (
    <div className="glass-card" style={{ width: "100%", maxWidth: 520, padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.type === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            {m.type === "ai" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--grad1)", display: "grid", placeItems: "center", fontSize: 12, marginRight: 8, flexShrink: 0, marginTop: 4 }}>✦</div>
            )}
            <div className={`chat-bubble ${m.type}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder={step === 0 ? "https://yourwebsite.com" : "Type your answer..."}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button className="chat-send" onClick={send}>→</button>
      </div>
    </div>
  );
};

export default ARIAChat;
