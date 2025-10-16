import React, { useState, useRef, useEffect } from "react";
import userAvatar from "../../assets/user.png";
import botAvatar from "../../assets/policy_bot.png";
import chatIcon from "../../assets/chat-icon.png";
import { FiSend, FiUpload, FiX } from "react-icons/fi";
import "./ChatBot.css";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I’m PolicyGenie, your intelligent company assistant. Upload your policies, handbooks, or documents, and I’ll instantly help you find the answers you need — no more digging through lengthy PDFs.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function uploadFile(file, uploadedBy = "web") {
    const form = new FormData();
    form.append("file", file);
    form.append("uploadedBy", uploadedBy);
    const res = await fetch(`${BACKEND}/api/documents/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function askQuestion(question, topK = 3) {
    const res = await fetch(`${BACKEND}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, topK }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function handleUpload() {
    if (!file) return setStatus("⚠️ Please select or drop a file");
    setStatus("📤 Uploading...");
    try {
      const res = await uploadFile(file);
      setStatus(`✅ Uploaded: ${res.filename}`);
      setFile(null);
    } catch (e) {
      setStatus("❌ Upload failed: " + e.message);
    }
  }

  async function sendQuestion() {
    const q = question.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setIsTyping(true);

    try {
      const res = await askQuestion(q);
      const newMsg = { role: "assistant", text: "" };
      setMessages((prev) => [...prev, newMsg]);
      await typeText(res.answer);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ " + err.message },
      ]);
      setIsTyping(false);
    }
  }

  async function typeText(fullText) {
    const words = fullText.split(" ");
    let typed = "";
    for (let i = 0; i < words.length; i++) {
      typed += words[i] + " ";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", text: typed.trim() };
        return updated;
      });
      await new Promise((r) => setTimeout(r, 30));
    }
    setIsTyping(false);
  }

  // --- Drag & Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setStatus(`📥 File ready: ${droppedFile.name}`);
    }
  };

  return (
    <div className={`app-container`}>
      {/* Chat Icon */}
      {!isChatOpen && (
        <div className="chat-launcher" onClick={() => setIsChatOpen(true)}>
          <img src={chatIcon} alt="Chat Icon" />
        </div>
      )}

      {/* Chat Window */}
      <div className={`chat-window ${isChatOpen ? "open" : ""}`}>
        <div className="chat-header">
          <div className="bot-info">
            <img src={botAvatar} alt="bot" className="bot-icon" />
            <h3>PolicyGenie Assistant</h3>
          </div>
          <button className="close-btn" onClick={() => setIsChatOpen(false)}>
            <FiX />
          </button>
        </div>

        {/* Upload Section with Drag & Drop */}
        <div
          className={`upload-box ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="upload-label" htmlFor="file-upload">
            <FiUpload />{" "}
            {file ? `Selected: ${file.name}` : "Drag & drop or choose a file"}
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button onClick={handleUpload} className="upload-btn">
            Upload
          </button>
          {status && <p className="status-text">{status}</p>}
        </div>

        {/* Messages */}
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <img
                src={m.role === "user" ? userAvatar : botAvatar}
                alt={m.role}
                className="msg-avatar"
              />
              <div className="bubble">{m.text}</div>
            </div>
          ))}

          {isTyping && (
            <div className="msg assistant">
              <img src={botAvatar} alt="bot" className="msg-avatar" />
              <div className="bubble typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={endRef}></div>
        </div>

        {/* Input Area */}
        <div className="input-area">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything..."
            onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
          />
          <button onClick={sendQuestion} disabled={isTyping}>
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
}
