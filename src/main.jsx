import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#0f1117", color: "#e8eaf0", fontFamily: "'Noto Sans JP', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>エラーが発生しました</div>
          <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.8, marginBottom: 24 }}>
            アプリの表示中に問題が起きました。<br />ページを再読み込みしてください。
          </div>
          <button onClick={() => window.location.reload()}
            style={{ background: "#38bdf8", border: "none", borderRadius: 10, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: "12px 32px", cursor: "pointer" }}>
            再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
