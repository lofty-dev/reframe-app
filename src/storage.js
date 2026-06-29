const STORAGE_KEY = "reframe_records";
const CHECKIN_KEY = "reframe_checkins";
const COPING_KEY = "reframe_copings";
const CRISIS_KEY = "stride_crisis";
const ACHIEVEMENTS_KEY = "stride_achievements";
const MEMO_KEY = "stride_memo";

export const TELL_PEOPLE_KEY = "stride_tell_people";
export const TELL_MEMOS_KEY = "stride_tell_memos";
export const BRIDGE_SETTINGS_KEY = "stride_bridge_settings";
export const BRIDGE_MEMOS_KEY = "stride_bridge_memos";

export const DEFAULT_BRIDGE_SETTINGS = { showTellMemos: true, showMoodGraph: true, showSleep: true, showStress: true, showAchievement: true };

export const normalizeSleep = (s) => s === "4〜6時間" ? "4〜6時間未満" : s === "6〜8時間" ? "6〜8時間未満" : s;

const normalizeCheckins = (checkins) =>
  checkins.map(c => c.sleep ? { ...c, sleep: normalizeSleep(c.sleep) } : c);

export const todayStr = () => {
  const d = new Date();
  return {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    day: String(d.getDate()).padStart(2, "0"),
  };
};

export const toDateStr = (y, m, d) => `${y}-${m}-${d}`;
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m)}月${parseInt(d)}日`;
};
export const daysInMonth = (y, m) => new Date(parseInt(y), parseInt(m), 0).getDate();

export const loadBridgeSettings = () => {
  try { const s = localStorage.getItem(BRIDGE_SETTINGS_KEY); if (s) return { ...DEFAULT_BRIDGE_SETTINGS, ...JSON.parse(s) }; } catch (e) {}
  return { ...DEFAULT_BRIDGE_SETTINGS };
};
export const saveBridgeSettings = (d) => { try { localStorage.setItem(BRIDGE_SETTINGS_KEY, JSON.stringify(d)); } catch (e) {} };

export const loadBridgeMemos = () => {
  try { const s = localStorage.getItem(BRIDGE_MEMOS_KEY); if (s) { const p = JSON.parse(s); if (Array.isArray(p)) return p; } } catch (e) {}
  return [];
};
export const saveBridgeMemos = (d) => { try { localStorage.setItem(BRIDGE_MEMOS_KEY, JSON.stringify(d)); } catch (e) {} };

export const loadTellPeople = () => {
  try { const s = localStorage.getItem(TELL_PEOPLE_KEY); if (s) { const p = JSON.parse(s); if (Array.isArray(p)) return p; } } catch (e) {}
  return [];
};
export const saveTellPeople = (d) => { try { localStorage.setItem(TELL_PEOPLE_KEY, JSON.stringify(d)); } catch (e) {} };

export const loadTellMemos = () => {
  try { const s = localStorage.getItem(TELL_MEMOS_KEY); if (s) { const p = JSON.parse(s); if (Array.isArray(p)) return p; } } catch (e) {}
  return [];
};
export const saveTellMemos = (d) => { try { localStorage.setItem(TELL_MEMOS_KEY, JSON.stringify(d)); } catch (e) {} };

export const loadMemo = () => {
  try {
    const saved = localStorage.getItem(MEMO_KEY);
    if (saved) { const p = JSON.parse(saved); if (Array.isArray(p)) return p; }
  } catch (e) {}
  return [];
};
export const saveMemo = (data) => {
  try { localStorage.setItem(MEMO_KEY, JSON.stringify(data)); } catch (e) {}
};

export const loadAchievements = () => {
  try {
    const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (saved) { const p = JSON.parse(saved); if (Array.isArray(p)) return p; }
  } catch (e) {}
  return [];
};
export const saveAchievements = (data) => {
  try { localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data)); } catch (e) {}
};

export const loadCrisisPlan = () => {
  try {
    const saved = localStorage.getItem(CRISIS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.safe)) return parsed;
    }
  } catch (e) {}
  return {
    safe: [],
    caution_triggers: [],
    caution_signs: [],
    crisis_signs: [],
    crisis_contacts: [],
  };
};

export const saveCrisisPlan = (plan) => {
  try { localStorage.setItem(CRISIS_KEY, JSON.stringify(plan)); } catch (e) {}
};

export const loadRecords = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { const p = JSON.parse(saved); if (Array.isArray(p)) return p; }
  } catch (e) {}
  return [];
};

export const saveRecords = (records) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch (e) {}
};

export const loadCheckins = () => {
  try {
    const saved = localStorage.getItem(CHECKIN_KEY);
    if (saved) { const p = JSON.parse(saved); if (Array.isArray(p)) return normalizeCheckins(p); }
  } catch (e) {}
  return [];
};

export const saveCheckins = (checkins) => {
  try { localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkins)); } catch (e) {}
};

export const loadCopings = () => {
  try {
    const saved = localStorage.getItem(COPING_KEY);
    if (saved) { const p = JSON.parse(saved); if (Array.isArray(p)) return p; }
  } catch (e) {}
  return [];
};

export const saveCopings = (copings) => {
  try { localStorage.setItem(COPING_KEY, JSON.stringify(copings)); } catch (e) {}
};

export const PWA_KEY = "stride_pwa_prompted";
export const hasPwaPrompted = () => {
  try { return localStorage.getItem(PWA_KEY) === "true"; } catch (e) { return false; }
};
export const setPwaPrompted = () => {
  try { localStorage.setItem(PWA_KEY, "true"); } catch (e) {}
};

export const FEEDBACK_BANNER_KEY = "stride_feedback_banner_dismissed";
export const hasFeedbackBannerDismissed = () => {
  try { return localStorage.getItem(FEEDBACK_BANNER_KEY) === "true"; } catch (e) { return false; }
};
export const setFeedbackBannerDismissed = () => {
  try { localStorage.setItem(FEEDBACK_BANNER_KEY, "true"); } catch (e) {}
};

const ALL_STORAGE_KEYS = [
  "reframe_records", "reframe_checkins", "reframe_copings",
  "stride_crisis", "stride_achievements", "stride_agreed", "stride_onboarded",
  "stride_memo", "stride_tell_people", "stride_tell_memos",
  "stride_bridge_settings", "stride_bridge_memos",
];

export const exportData = () => {
  const data = {};
  ALL_STORAGE_KEYS.forEach((key) => {
    try { data[key] = JSON.parse(localStorage.getItem(key)); } catch (e) { data[key] = null; }
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stride_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (file, onDone) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        onDone("error");
        return;
      }
      let imported = 0;
      ALL_STORAGE_KEYS.forEach((key) => {
        if (data[key] === undefined || data[key] === null) return;
        try {
          let value = data[key];
          if (key === CHECKIN_KEY && Array.isArray(value)) {
            value = normalizeCheckins(value);
          }
          const serialized = JSON.stringify(value);
          JSON.parse(serialized);
          localStorage.setItem(key, serialized);
          imported++;
        } catch (_) {}
      });
      onDone(imported > 0 ? "ok" : "error");
    } catch (err) {
      onDone("error");
    }
  };
  reader.onerror = () => onDone("error");
  reader.readAsText(file);
};

export const AGREED_KEY = "stride_agreed";
export const ONBOARDED_KEY = "stride_onboarded";

export const hasAgreed = () => {
  try { return localStorage.getItem(AGREED_KEY) === "true"; } catch (e) { return false; }
};
export const setAgreed = () => {
  try { localStorage.setItem(AGREED_KEY, "true"); } catch (e) {}
};
export const hasOnboarded = () => {
  try { return localStorage.getItem(ONBOARDED_KEY) === "true"; } catch (e) { return false; }
};
export const setOnboarded = () => {
  try { localStorage.setItem(ONBOARDED_KEY, "true"); } catch (e) {}
};

export const THEME_SELECTED_KEY = "stride_theme_selected";
export const hasThemeSelected = () => {
  try { return localStorage.getItem(THEME_SELECTED_KEY) === "true"; } catch (e) { return false; }
};
export const setThemeSelected = () => {
  try { localStorage.setItem(THEME_SELECTED_KEY, "true"); } catch (e) {}
};
