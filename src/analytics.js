// GA4への匿名イベント送信ユーティリティ。
// 記録内容・自由記述・個人を特定できる情報は絶対にparamsに含めないこと。
// 送ってよいのは「発火した事実」と、粗い分類（例：クライシスプランの段階）のみ。
export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
