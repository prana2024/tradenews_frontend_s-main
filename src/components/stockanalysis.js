import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import stockOptions from "../data/stockOptions";
import "./StockAnalysis.css";

const StockAnalysis = () => {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const wsRef = useRef(null);

  const startWebSocket = () => {
    const WS_URL = "wss://tradenews-backend-eg2k.onrender.com";
    wsRef.current = new WebSocket(`${WS_URL}/ws/stock-analysis/`);

    wsRef.current.onopen = () => {
      if (selectedStock) {
        const symbol = selectedStock.value?.toUpperCase();
        console.log("Sending stock for analysis:", symbol);
        wsRef.current.send(
          JSON.stringify({
            action: "analyze",
            symbol: symbol,
            prompt: "Analyze the stock performance, considering fundamentals, technicals, sentiment, and recent news.",
          })
        );
      }
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received data:", data);
      setAnalysisResult(data.result);
      setLoading(false);
    };

    wsRef.current.onerror = (error) => console.error("WebSocket error:", error);
    wsRef.current.onclose = () => console.log("WebSocket closed");
  };

  const handleAnalyze = () => {
    if (!selectedStock) {
      alert("Please select a stock.");
      return;
    }
    setLoading(true);
    setAnalysisResult(null);
    startWebSocket();
  };

  const handleEndAnalysis = () => {
    setLoading(false);
    setAnalysisResult(null);
    if (wsRef.current) wsRef.current.close();
  };

  const renderValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") {
      return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(" | ");
    }
    return value;
  };

  return (
    <div className="stock-analysis">
      {/* Top Bar */}
      <div className="top-bar">
        <h1 className="brand-name">News2Trade</h1>

        {/* Desktop Nav */}
        <div className="top-buttons">
          <button onClick={() => navigate("/analyzer")}>Analyse News with AI</button>
          <button onClick={() => navigate("/")}>FinAI Assistant</button>
          <button onClick={() => navigate("/stock-trends")}>Analyze Stock Trends</button>
        </div>

        {/* Mobile Hamburger */}
        <div className="mobile-menu">
          <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
          {isMenuOpen && (
            <div className="mobile-dropdown">
              <button onClick={() => { navigate("/analyzer"); setIsMenuOpen(false); }}>📰 Analyse News</button>
              <button onClick={() => { navigate("/"); setIsMenuOpen(false); }}>🤖 FinAI Assistant</button>
              <button onClick={() => { navigate("/stock-trends"); setIsMenuOpen(false); }}>📈 Stock Trends</button>
            </div>
          )}
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
          .top-buttons { display: flex; gap: 20px; }
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

          @media (max-width: 900px) {
            .top-buttons { display: none; }
            .mobile-menu { display: block; }
            .brand-name { font-size: 30px; }
            .top-bar { padding: 8px 16px; }
          }
          @media (max-width: 500px) {
            .brand-name { font-size: 22px; }
            .top-bar { padding: 6px 12px; }
          }
        `}</style>
      </div>

      {/* Analysis Container */}
      <div className="stock-analysis-page">
        <div className="stock-analysis-container">
          <h2>Stock Full Analysis</h2>

          <div className="stock-selector-section">
            <label>Select Stock:</label>
            <Select
              options={[
                { label: "Stocks", options: stockOptions.stocks },
                { label: "Crypto", options: stockOptions.crypto },
                { label: "Indices", options: stockOptions.indices },
              ]}
              value={selectedStock}
              onChange={setSelectedStock}
              placeholder="Search and select..."
              isDisabled={loading}
              styles={{
                control: (base) => ({ ...base, backgroundColor: "#111", borderColor: "#333", color: "#fff" }),
                singleValue: (base) => ({ ...base, color: "#fff" }),
                menu: (base) => ({ ...base, backgroundColor: "#111", color: "#fff" }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "#ff4d4d" : "#111",
                  color: state.isFocused ? "#fff" : "#f9fafb",
                }),
                input: (base) => ({ ...base, color: "#fff" }),
                placeholder: (base) => ({ ...base, color: "#bbb" }),
              }}
            />
          </div>

          <div className="stock-buttons-section">
            <button onClick={handleAnalyze} disabled={loading}>
              🔍 Analyze
            </button>
            {loading && (
              <button onClick={handleEndAnalysis} className="end-btn">
                ❌ End Analysis
              </button>
            )}
          </div>

          {loading && <div className="loader">⏳ Analyzing stock trends...</div>}

          {analysisResult && (
            <div className="stock-analysis-result">
              {typeof analysisResult === "string" ? (
                <p>{analysisResult}</p>
              ) : (
                <>
                  <p><strong>📊 Historical Summary:</strong> {renderValue(analysisResult.historicalSummary)}</p>
                  <p><strong>📈 Current Sentiment:</strong> {renderValue(analysisResult.currentSentiment)}</p>
                  <p><strong>🔢 Numeric Insights:</strong> {renderValue(analysisResult.numericInsights)}</p>
                  <p><strong>🔮 Future Outlook:</strong> {renderValue(analysisResult.futureOutlook)}</p>
                  <p><strong>💡 If In Position:</strong> {renderValue(analysisResult.traderAdvice?.ifInPosition)}</p>
                  <p><strong>💡 If Not In Position:</strong> {renderValue(analysisResult.traderAdvice?.ifNotInPosition)}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;