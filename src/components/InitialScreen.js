import React, { useState, useEffect, useRef } from "react";
import "./InitialScreen.css";
import { useNavigate } from "react-router-dom";

const InitialScreen = ({ onContinue }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showInitialMessage, setShowInitialMessage] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const chatAreaRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("messages");
    if (stored) {
      setMessages(JSON.parse(stored));
      setShowInitialMessage(false);
    }
  }, []);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const navigate = useNavigate();

  const handleAnalyzeNews = () => navigate("/analyzer");
  const handleChat = () => navigate("/");
  const handleAnalyzeStock = () => navigate("/stock-trends");

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (showInitialMessage) {
      setShowInitialMessage(false);
    }

    const userMsg = { id: Date.now().toString(), text: input, sender: "User" };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    localStorage.setItem("messages", JSON.stringify(updated));

    const BACKEND_URL = "https://tradenews-backend-eg2k.onrender.com";
    const payload = { message: input, role: "Friend", character: "Funny" };
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.message) {
        const aiMsg = { id: Date.now().toString(), text: data.message, sender: "AI" };
        const newMsgs = [...updated, aiMsg];
        setMessages(newMsgs);
        localStorage.setItem("messages", JSON.stringify(newMsgs));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowInitialMessage(true);
    localStorage.removeItem("messages");
  };

  const handleEditYourAI = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="initial-screen">
      {/* Top Bar */}
      <div className="top-bar">
        <h1 className="brand-name">News2Trade</h1>
        <div className="top-buttons">
          <button onClick={handleAnalyzeNews}>Analyse News with AI</button>
          <button onClick={handleChat}>FinAI Assistant</button>
          <button onClick={handleAnalyzeStock}>Analyze Stock Trends</button>
        </div>
        {/* Mobile hamburger menu */}
        <div className="mobile-menu">
          <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
          {isMenuOpen && (
            <div className="mobile-dropdown">
              <button onClick={() => { handleAnalyzeNews(); setIsMenuOpen(false); }}>📰 Analyse News</button>
              <button onClick={() => { handleChat(); setIsMenuOpen(false); }}>🤖 FinAI Assistant</button>
              <button onClick={() => { handleAnalyzeStock(); setIsMenuOpen(false); }}>📈 Stock Trends</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 5px 30px;
          background: linear-gradient(90deg, #0a0f1a, #313843ff, #444e62ff);
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .brand-name {
          font-size: 50px;
          font-weight: 900;
          background: linear-gradient(90deg, #ff6f3c, #ff3e3e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 2px;
          text-shadow: 0 3px 8px rgba(0,0,0,0.8);
        }
        .top-buttons {
          display: flex;
          gap: 20px;
        }
        .top-buttons button {
          padding: 10px 24px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #1e293b, #111827);
          color: #f9fafb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }
        .top-buttons button:hover {
          background: linear-gradient(135deg, #374151, #1f2937);
          box-shadow: 0 4px 12px rgba(0,0,0,0.7);
        }

        /* Mobile menu — hidden on desktop */
        .mobile-menu { display: none; position: relative; }

        .hamburger-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.2);
          color: #f9fafb;
          font-size: 22px;
          padding: 4px 10px;
          border-radius: 8px;
          cursor: pointer;
        }

        .mobile-dropdown {
          position: absolute;
          top: 110%;
          right: 0;
          background: linear-gradient(135deg, #1e293b, #111827);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          overflow: hidden;
          z-index: 200;
          min-width: 180px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.6);
        }

        .mobile-dropdown button {
          display: block;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          color: #f9fafb;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          transition: background 0.2s ease;
        }

        .mobile-dropdown button:last-child { border-bottom: none; }
        .mobile-dropdown button:hover { background: rgba(255,255,255,0.08); }

        /* Loading bubble */
        .loading-bubble {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #1e293b;
          border-radius: 18px 18px 18px 4px;
          width: fit-content;
          max-width: 80px;
          margin: 6px 0;
        }
        .loading-bubble span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #94a3b8;
          animation: bounce 1.2s infinite ease-in-out;
        }
        .loading-bubble span:nth-child(1) { animation-delay: 0s; }
        .loading-bubble span:nth-child(2) { animation-delay: 0.2s; }
        .loading-bubble span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40%            { transform: scale(1.2); opacity: 1; }
        }

        /* Tablet */
        @media (max-width: 900px) {
          .top-buttons { display: none; }
          .mobile-menu { display: block; }
          .brand-name { font-size: 30px; }
          .top-bar { padding: 8px 16px; }
        }

        /* Mobile */
        @media (max-width: 500px) {
          .brand-name { font-size: 22px; }
          .top-bar { padding: 6px 12px; }
        }
      `}</style>

      {/* Chat Area */}
      <div className="chat-area" ref={chatAreaRef}>
        {showInitialMessage ? (
          <p className="ai-message">Hello! How can I help you today?</p>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.sender === "User" ? "user-message" : "ai-message"}
              >
                {msg.text}
              </div>
            ))}

            {isLoading && (
              <div className="loading-bubble">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Input */}
      <div className="input-barinput-bar">
        <button onClick={handleClearChat}>✖</button>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleSendMessage}>➤</button>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>You are not logged in. Please log in to edit your AI.</p>
            <button onClick={() => setShowLoginModal(false)}>Login</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InitialScreen;