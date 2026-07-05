import { useState, useEffect } from "react";
import { COLORS, THEME_TEXT_MAX, THEME_PLACEHOLDER } from "../constants";
import { inpStyle } from "../styles";

// 伝えたいことメモ完了時・Bridge Session終了時に呼び出す共通のテーマ入力導線。
// activeTheme がある場合は先に「続ける／完了して新規／完了のみ」の3択を提示する。
export const ThemePrompt = ({ supporterName, activeTheme, onContinue, onCloseOnly, onCloseAndNew, onSave, onSkip }) => {
  const [text, setText] = useState("");
  const mode = activeTheme ? "choice" : "input";

  useEffect(() => { setText(""); }, [activeTheme?.id]);

  const valid = text.trim().length > 0 && text.length <= THEME_TEXT_MAX;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 500 }}>
      <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 340, boxSizing: "border-box" }}>
        {supporterName && <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>{supporterName}</div>}
        {mode === "choice" ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>次回までのテーマ</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>現在のテーマ</div>
            <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.7, background: COLORS.surfaceWarm, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 18, wordBreak: "break-word" }}>
              {activeTheme.text}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={onContinue}
                style={{ padding: "12px 0", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: "none", color: COLORS.text, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                このテーマを続ける
              </button>
              <button onClick={onCloseAndNew}
                style={{ padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.accent, color: "#0f1117", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                完了して新しいテーマを設定
              </button>
              <button onClick={onCloseOnly}
                style={{ padding: "12px 0", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: "none", color: COLORS.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                完了する（新しいテーマなし）
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>次回までのテーマはありますか？</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 14, lineHeight: 1.6 }}>
              診察で決まった「次回までに見ておくこと」があれば記録できます
            </div>
            <textarea rows={3} maxLength={THEME_TEXT_MAX} value={text} placeholder={THEME_PLACEHOLDER}
              onChange={e => setText(e.target.value)} style={inpStyle()} />
            <div style={{ textAlign: "right", fontSize: 11, color: text.length > THEME_TEXT_MAX ? COLORS.danger : COLORS.textMuted, margin: "4px 0 18px" }}>
              {text.length}/{THEME_TEXT_MAX}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onSkip}
                style={{ flex: 1, background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>
                スキップ
              </button>
              <button onClick={() => valid && onSave(text)} disabled={!valid}
                style={{ flex: 1, background: valid ? COLORS.accent : COLORS.border, border: "none", borderRadius: 10, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: 12, cursor: valid ? "pointer" : "default" }}>
                保存する
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
