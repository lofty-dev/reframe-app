import { useState } from "react";
import { COLORS, EMOTION_LIST, INTENSITY_OPTIONS } from "../constants";
import { inpStyle, selStyle } from "../styles";

export const EmotionInput = ({ value, onChange }) => {
  const allEmotionNames = EMOTION_LIST.flatMap(g => g.items);

  const parseValue = (val) => {
    if (!val) return { selected: [], freeInputs: [{ name: "", intensity: 50 }], mode: "select" };
    const items = val.split("、").map(s => {
      const match = s.trim().match(/^(.+?)\s*(\d+)%$/);
      if (!match) return null;
      return { name: match[1].trim(), intensity: parseInt(match[2]) };
    }).filter(Boolean);
    if (items.length === 0) return { selected: [], freeInputs: [{ name: "", intensity: 50 }], mode: "select" };
    const isSelect = items.every(i => allEmotionNames.includes(i.name));
    if (isSelect) return { selected: items, freeInputs: [{ name: "", intensity: 50 }], mode: "select" };
    return { selected: [], freeInputs: items.length > 0 ? items : [{ name: "", intensity: 50 }], mode: "free" };
  };

  const initial = parseValue(value);
  const [mode, setMode] = useState(initial.mode);
  const [selected, setSelected] = useState(initial.selected);
  const [freeInputs, setFreeInputs] = useState(initial.freeInputs);

  const toText = (items) => items.filter(i => i.name).map(i => `${i.name} ${i.intensity}%`).join("、");

  const handleSelectEmotion = (name) => {
    const exists = selected.find(s => s.name === name);
    let next;
    if (exists) {
      next = selected.filter(s => s.name !== name);
    } else {
      next = [...selected, { name, intensity: 50 }];
    }
    setSelected(next);
    onChange(toText(next));
  };

  const handleSelectIntensity = (name, intensity) => {
    const next = selected.map(s => s.name === name ? { ...s, intensity } : s);
    setSelected(next);
    onChange(toText(next));
  };

  const handleFreeChange = (idx, field, val) => {
    const next = freeInputs.map((f, i) => i === idx ? { ...f, [field]: val } : f);
    setFreeInputs(next);
    onChange(toText(next));
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["select", "free"].map((m) => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${mode === m ? COLORS.accent : COLORS.border}`, background: mode === m ? COLORS.accentSoft : COLORS.surface, color: mode === m ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {m === "select" ? "選択式" : "自由記入"}
          </button>
        ))}
      </div>

      {mode === "select" && (
        <div>
          {EMOTION_LIST.map((group) => (
            <div key={group.category} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, marginBottom: 8 }}>{group.category}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {group.items.map((name) => {
                  const sel = selected.find(s => s.name === name);
                  return (
                    <div key={name}>
                      <button onClick={() => handleSelectEmotion(name)}
                        style={{ padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${sel ? COLORS.accent : COLORS.border}`, background: sel ? COLORS.accentSoft : COLORS.surface, color: sel ? COLORS.accent : COLORS.textMuted, fontSize: 13, fontWeight: sel ? 700 : 400, cursor: "pointer" }}>
                        {name}
                      </button>
                      {sel && (
                        <select value={sel.intensity} onChange={(e) => handleSelectIntensity(name, parseInt(e.target.value))}
                          style={{ ...selStyle(), marginLeft: 6, padding: "4px 6px", borderRadius: 6, fontSize: 12, width: 70, background: COLORS.surface, color: COLORS.accent, border: `1px solid ${COLORS.accent}` }}>
                          {INTENSITY_OPTIONS.map(v => <option key={v} value={v}>{v}%</option>)}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {selected.length > 0 && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: COLORS.accentSoft, borderRadius: 8, fontSize: 13, color: COLORS.accent }}>
              {toText(selected)}
            </div>
          )}
        </div>
      )}

      {mode === "free" && (
        <div>
          {freeInputs.map((f, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
              <input
                type="text"
                placeholder="例）不安"
                value={f.name}
                onChange={(e) => handleFreeChange(idx, "name", e.target.value)}
                style={{ flex: 1, minWidth: 0, boxSizing: "border-box", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 14, padding: "10px 12px", outline: "none", fontFamily: "inherit" }}
              />
              <select value={f.intensity} onChange={(e) => handleFreeChange(idx, "intensity", parseInt(e.target.value))}
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 14, padding: "10px 6px", outline: "none", fontFamily: "inherit", width: 70, flexShrink: 0, boxSizing: "border-box" }}>
                {INTENSITY_OPTIONS.map(v => <option key={v} value={v}>{v}%</option>)}
              </select>
              {freeInputs.length > 1 && (
                <button onClick={() => { const next = freeInputs.filter((_, i) => i !== idx); setFreeInputs(next); onChange(toText(next)); }}
                  style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 18, cursor: "pointer", padding: 0 }}>×</button>
              )}
            </div>
          ))}
          <button onClick={() => setFreeInputs([...freeInputs, { name: "", intensity: 50 }])}
            style={{ background: "none", border: `1px dashed ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, fontSize: 13, padding: "8px 16px", cursor: "pointer", width: "100%" }}>
            ＋ 感情を追加する
          </button>
        </div>
      )}
    </div>
  );
};

export const AutoThoughtInput = ({ value, onChange }) => {
  const parseThoughts = (val) => {
    if (!val) return [{ id: Date.now(), text: "" }];
    const items = val.split("\n").filter(s => s.trim());
    return items.length > 0 ? items.map((t, i) => ({ id: i, text: t })) : [{ id: 0, text: "" }];
  };

  const [thoughts, setThoughts] = useState(parseThoughts(value));

  const toText = (items) => items.filter(i => i.text.trim()).map(i => i.text.trim()).join("\n");

  const handleChange = (id, text) => {
    const next = thoughts.map(t => t.id === id ? { ...t, text } : t);
    setThoughts(next);
    onChange(toText(next));
  };

  const addThought = () => {
    setThoughts([...thoughts, { id: Date.now(), text: "" }]);
  };

  const removeThought = (id) => {
    const next = thoughts.filter(t => t.id !== id);
    setThoughts(next);
    onChange(toText(next));
  };

  return (
    <div>
      {thoughts.map((t, idx) => (
        <div key={t.id} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
          <div style={{ paddingTop: 12, fontSize: 12, color: COLORS.textMuted, minWidth: 20 }}>{idx + 1}</div>
          <textarea
            rows={2}
            style={{ ...inpStyle(), flex: 1, resize: "none" }}
            placeholder="例）自分はダメな人間だ"
            value={t.text}
            onChange={(e) => handleChange(t.id, e.target.value)}
          />
          {thoughts.length > 1 && (
            <button onClick={() => removeThought(t.id)}
              style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 18, cursor: "pointer", padding: "8px 0", opacity: 0.5 }}>×</button>
          )}
        </div>
      ))}
      <button onClick={addThought}
        style={{ background: "none", border: `1px dashed ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, fontSize: 13, padding: "8px 16px", cursor: "pointer", width: "100%" }}>
        ＋ 自動思考を追加する
      </button>
    </div>
  );
};
