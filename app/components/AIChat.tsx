"use client";

import { useState } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ question: input }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    setMessages([
      ...newMessages,
      { role: "ai", content: data.answer },
    ]);

    setLoading(false);
  };

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "20px",
      maxWidth: "500px",
      marginTop: "30px"
    }}>
      <h3>AI Assistant</h3>

      <div style={{
        height: "300px",
        overflowY: "auto",
        marginBottom: "15px"
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            textAlign: msg.role === "user" ? "right" : "left",
            marginBottom: "10px"
          }}>
            <span style={{
              background: msg.role === "user" ? "#6c5ce7" : "#eee",
              color: msg.role === "user" ? "white" : "black",
              padding: "10px",
              borderRadius: "10px",
              display: "inline-block"
            }}>
              {msg.content}
            </span>
          </div>
        ))}

        {loading && <p>Typing...</p>}
      </div>

      <div style={{ display: "flex" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "10px 15px",
            background: "#6c5ce7",
            color: "white",
            border: "none",
            borderRadius: "8px"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}