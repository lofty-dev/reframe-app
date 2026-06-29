import { Component } from 'react';

export class PageErrorBoundary extends Component {
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
        <div style={{
          padding: "48px 20px",
          textAlign: "center",
          fontFamily: "'Noto Sans JP', sans-serif",
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0", marginBottom: 10 }}>
            このページの表示でエラーが発生しました
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.8, marginBottom: 24 }}>
            データが壊れているか、想定外の問題が起きました。<br />
            再試行しても解決しない場合は設定からデータをエクスポートして<br />お問い合わせください。
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              background: "#38bdf8",
              border: "none",
              borderRadius: 10,
              color: "#0f1117",
              fontSize: 13,
              fontWeight: 700,
              padding: "10px 28px",
              cursor: "pointer",
            }}
          >
            再試行
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
