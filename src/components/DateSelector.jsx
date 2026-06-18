import { COLORS } from "../constants";
import { daysInMonth } from "../storage";

const selStyle = () => ({
  flex: 1,
  background: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  color: COLORS.text,
  fontSize: 15,
  padding: "12px 8px",
  outline: "none",
  fontFamily: "inherit",
  appearance: "none",
  WebkitAppearance: "none",
  textAlign: "center",
});

export const DateSelector = ({ year, month, day, onYear, onMonth, onDay }) => {
  const yearOptions = ["2025", "2026", "2027"];
  const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const dayOptions = Array.from({ length: daysInMonth(year, month) }, (_, i) => String(i + 1).padStart(2, "0"));
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select value={year} onChange={(e) => onYear(e.target.value)} style={selStyle()}>
        {yearOptions.map((y) => <option key={y} value={y}>{y}年</option>)}
      </select>
      <select value={month} onChange={(e) => { onMonth(e.target.value); if (parseInt(day) > daysInMonth(year, e.target.value)) onDay("01"); }} style={selStyle()}>
        {monthOptions.map((m) => <option key={m} value={m}>{parseInt(m)}月</option>)}
      </select>
      <select value={day} onChange={(e) => onDay(e.target.value)} style={selStyle()}>
        {dayOptions.map((d) => <option key={d} value={d}>{parseInt(d)}日</option>)}
      </select>
    </div>
  );
};
