import { IconArrowLeft, IconHome, IconPencil, IconBrain, IconStethoscope } from "@tabler/icons-react";
import { COLORS } from "../constants";

export const BottomNav = ({ onBack, onHome, backLabel = "戻る" }) => (
  <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 32, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
    <button onClick={onBack || onHome} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 14, padding: "12px", cursor: "pointer" }}>
      <IconArrowLeft size={16} />{backLabel}
    </button>
    <button onClick={onHome} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 14, padding: "12px", cursor: "pointer" }}>
      <IconHome size={16} />ホーム
    </button>
  </div>
);

export const BottomTabBar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "home", Icon: IconHome, label: "ホーム" },
    { id: "records", Icon: IconPencil, label: "記録" },
    { id: "tools", Icon: IconBrain, label: "ツール" },
    { id: "medical", Icon: IconStethoscope, label: "診察" },
  ];
  return (
    <div className="no-print" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, display: "flex", zIndex: 200, paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map(({ id, Icon, label }) => {
        const active = activeTab === id;
        const color = active ? COLORS.accent : COLORS.textMuted;
        return (
          <button key={id} onClick={() => onTabChange(id)}
            style={{ flex: 1, background: "none", border: "none", padding: "10px 0 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Icon size={20} color={color} />
            <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 0.3 }}>{label}</span>
            {active && <div style={{ width: 20, height: 2, borderRadius: 1, background: COLORS.accent }} />}
          </button>
        );
      })}
    </div>
  );
};
