import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import stockOptions from '../data/stockOptions';
import Select from 'react-select';
import './StockNewsAnalyzer.css';

const StockNewsAnalyzer = () => {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const wsRef = useRef(null);

  const startWebSocket = () => {
    console.log("🔌 Attempting to connect WebSocket...");
    const WS_URL = "wss://tradenews-backend-eg2k.onrender.com";
    wsRef.current = new WebSocket(`${WS_URL}/ws/news/`);

    wsRef.current.onopen = () => {
      console.log('✅ WebSocket connected');
      if (selectedStock) {
        const symbol = selectedStock.value?.toUpperCase();
        const keywords = selectedStock.keywords || [selectedStock.label];
        if (!symbol) { console.warn('⚠️ Missing stock symbol!'); return; }
        console.log('📤 Sending stock to backend:', { symbol, keywords });
        wsRef.current.send(JSON.stringify({ action: 'start', symbol, keywords }));
      } else {
        console.warn('⚠️ No stock selected!');
      }
    };

    wsRef.current.onmessage = (event) => {
      console.log("📥 Message received from backend:", event.data);
      const data = JSON.parse(event.data);
      setAnalysisResult(data.result);
      setLoading(false);
    };

    wsRef.current.onerror = (error) => console.error('❌ WebSocket error:', error);
    wsRef.current.onclose = () => console.log('🔌 WebSocket closed');
  };

  const handleAnalyze = () => {
    if (!selectedStock) { console.warn("⚠️ No stock selected when Analyze was clicked"); return; }
    console.log("🔍 Analyze clicked for:", selectedStock.label);
    setLoading(true);
    setAnalysisResult(null);
    startWebSocket();
  };

  const handleEndAnalysis = () => {
    console.log("⛔ Ending analysis");
    setLoading(false);
    setAnalysisResult(null);
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
  };

  useEffect(() => {
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  const getRecommendationClass = (traderAdvice) => {
    if (!traderAdvice) return '';
    const adviceCombined = (
      (traderAdvice.ifInPosition || '') + ' ' + (traderAdvice.ifNotInPosition || '')
    ).toLowerCase();
    if (adviceCombined.includes('sell') || adviceCombined.includes('exit') || adviceCombined.includes('reduce') || adviceCombined.includes('cut your position')) return 'sell';
    if (adviceCombined.includes('wait') || adviceCombined.includes('hold') || adviceCombined.includes('caution') || adviceCombined.includes('cautious') || adviceCombined.includes('volatile') || adviceCombined.includes('uncertain') || adviceCombined.includes('monitor') || adviceCombined.includes('watch') || adviceCombined.includes('patience') || adviceCombined.includes('avoid')) return 'hold';
    if (adviceCombined.includes('buy') || adviceCombined.includes('enter') || adviceCombined.includes('purchase') || adviceCombined.includes('opportunity') || adviceCombined.includes('accumulate') || adviceCombined.includes('add to')) return 'buy';
    return '';
  };

  const recommendationClass = analysisResult ? getRecommendationClass(analysisResult.traderAdvice) : '';

  return (
    <div className="center-wrapper">
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

      <div className="analyzer-container">
        <div className="header">
          <h1 className="heading">
            <span className="emoji">📊</span> AI News Analyzer
          </h1>
          {loading && (
            <button className="end-btn" onClick={handleEndAnalysis}>
              ❌ End Analysis
            </button>
          )}
        </div>

        <div className="selector-section">
          <label>Select Stock/Crypto/Index:</label>
          <Select
            options={[
              { label: 'Stocks', options: stockOptions.stocks },
              { label: 'Crypto', options: stockOptions.crypto },
              { label: 'Indices', options: stockOptions.indices },
            ]}
            value={selectedStock}
            onChange={setSelectedStock}
            placeholder="Search and select..."
            isDisabled={loading}
            styles={{
              control: (base, state) => ({
                ...base,
                backgroundColor: '#1e1e1e',
                borderColor: state.isFocused ? '#ff4d4d' : '#333',
                boxShadow: state.isFocused ? '0 0 0 1px #ff4d4d' : 'none',
                color: '#fff',
              }),
              singleValue: (base) => ({ ...base, color: '#fff' }),
              menu: (base) => ({ ...base, backgroundColor: '#2a2a2a', color: '#fff' }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? '#ff4d4d' : '#2a2a2a',
                color: state.isFocused ? '#fff' : '#f0f0f0',
                cursor: 'pointer',
              }),
              input: (base) => ({ ...base, color: '#fff' }),
              placeholder: (base) => ({ ...base, color: '#999' }),
              dropdownIndicator: (base) => ({ ...base, color: '#ff4d4d' }),
            }}
          />
        </div>

        {/* ── EMPTY STATE ── */}
        {!selectedStock && !loading && !analysisResult && (
          <div className="empty-state">
            <div className="empty-state-icon">📡</div>
            <p className="empty-state-title">No asset selected yet</p>
            <p className="empty-state-subtitle">
              Pick a stock, crypto, or index above and let AI scan the latest news for trading signals.
            </p>
            <div className="empty-state-steps">
              <div className="empty-step">
                <span className="empty-step-num">1</span> Select an asset
              </div>
              <div className="empty-step">
                <span className="empty-step-num">2</span> Click Analyze
              </div>
              <div className="empty-step">
                <span className="empty-step-num">3</span> Get AI insights
              </div>
            </div>
          </div>
        )}

        {selectedStock && !loading && (
          <button className="analyze-btn" onClick={handleAnalyze}>
            🔍 Analyze
          </button>
        )}

        {selectedStock && (
          <h2 className="news-heading">
            📰 Analyzing News for: <span>{selectedStock.label}</span>
            {loading && <span className="spinner" />}
          </h2>
        )}

        {loading && <div className="loader">⏳ Live analysis in progress...</div>}

        {/* Result card */}
        {analysisResult && (
          <div className="news-blocks">
            <div className={`news-card ${analysisResult.sentiment}`}>
              <h3>{analysisResult.headline}</h3>
              <p className="news-summary">{analysisResult.summary}</p>

              {analysisResult.traderAdvice && (
                <div className="trader-advice">
                  <strong>💡 Trader Advice:</strong>
                  <ul>
                    <li><b>If in position:</b> {analysisResult.traderAdvice.ifInPosition}</li>
                    <li><b>If not in position:</b> {analysisResult.traderAdvice.ifNotInPosition}</li>
                  </ul>
                </div>
              )}

              <div className="news-info-grid">
                <div>📌 Impact: {analysisResult.impact}</div>
                <div>📈 Direction: {analysisResult.direction}</div>
                <div>⏰ Time: {new Date(analysisResult.time).toLocaleString()}</div>
                <div>📡 Source: {analysisResult.source}</div>
              </div>

              {recommendationClass && (
                <div className={`stock-recommendation ${recommendationClass}`}>
                  <h4>📌 Suggested Action:</h4>
                  <p>Based on analysis: <strong>{recommendationClass.toUpperCase()}</strong></p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockNewsAnalyzer;