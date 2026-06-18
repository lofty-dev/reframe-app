import { COLORS } from "./constants";

export const selStyle = () => ({
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

export const inpStyle = () => ({
  width: "100%",
  background: COLORS.bg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  color: COLORS.text,
  fontSize: 15,
  padding: "12px 14px",
  outline: "none",
  resize: "vertical",
  fontFamily: "inherit",
  lineHeight: 1.7,
  boxSizing: "border-box",
});
