import { useState, useEffect } from "react";
import { IconChartLine, IconPencil, IconListCheck, IconBrain, IconBulb, IconPlus, IconArrowLeft, IconPin, IconHome, IconShield } from "@tabler/icons-react";

const COLORS = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surfaceWarm: "#1e2132",
  border: "#2a2d3e",
  accent: "#38bdf8",
  accentSoft: "#0c2a3a",
  accentText: "#38bdf8",
  text: "#e8eaf0",
  textMuted: "#6b7280",
  success: "#38bdf8",
  successBg: "#0c2a3a",
  successText: "#38bdf8",
  hint: "#151929",
  hintBorder: "#2a2d3e",
  hintText: "#8b98b0",
  danger: "#f87171",
  psAccent: "#818cf8",
};

const CBT_STEPS = [
  {
    id: "emotion",
    label: "感情",
    question: "そのとき、どんな感情があった？強さは？",
    placeholder: "例）不安 80%、悲しみ 60%",
    hint: "感情には名前をつけてみよう。「不安」「悲しみ」「怒り」「恥ずかしさ」など。\n強さを0〜100%で表すと、後で変化を比べやすくなるよ。複数あってもOK。",
  },
  {
    id: "autoThought",
    label: "自動思考",
    question: "頭に浮かんだ考えは？",
    placeholder: "例）自分はダメな人間だ、また失敗した",
    hint: "出来事のあとに、瞬間的に頭に浮かんだ考えや言葉を書いてみよう。\n「〜に違いない」「〜のせいだ」「〜はずだ」という形になることが多い。評価せずそのまま書いてOK。",
  },
  {
    id: "evidence_for",
    label: "根拠（そう思う理由）",
    question: "その考えを支持する事実は？",
    placeholder: "例）実際にミスをした、何度か注意された",
    hint: "「なぜそう思うのか」を事実ベースで書いてみよう。\n感情や憶測ではなく、実際に起きたことや言われたことを書くのがポイント。",
  },
  {
    id: "evidence_against",
    label: "反証（別の見方）",
    question: "その考えに反する事実や、別の見方は？",
    placeholder: "例）今まで褒められたこともある、今回は初めてのタスクだった",
    hint: "自動思考に反する事実や、別の可能性を探してみよう。\n「友人が同じ状況だったら何と言う？」と考えると出てきやすいよ。完璧じゃなくていい。",
  },
  {
    id: "balanced",
    label: "バランス思考",
    question: "両方を踏まえると、どう考えられる？",
    placeholder: "例）ミスはしたけど、まだ学んでいる段階だ。全否定するほどのことじゃない",
    hint: "根拠と反証の両方を見たうえで、より現実的な考え方を書いてみよう。\n「完璧」じゃなくていい。「〜だけど、〜とも言える」という形になることが多い。",
  },
  {
    id: "reEmotion",
    label: "感情の変化",
    question: "今の感情は？強さはどう変わった？",
    placeholder: "例）不安 40%、少し落ち着いた",
    hint: "最初に書いた感情と比べて、強さはどう変わった？\n大きく変わらなくても大丈夫。少しでも和らいでいれば、それが認知再構成の効果だよ。",
  },
];

const PS_STEPS = [
  {
    id: "situation",
    label: "問題状況",
    question: "今、何が気になっていますか？",
    placeholder: "例）仕事のミスが続いていて、上司との関係も悪くなっている気がする",
    hint: "うまくまとめようとしなくて大丈夫。頭にあることをそのまま書いてみよう。",
  },
  {
    id: "breakdown",
    label: "問題の細分化",
    question: "具体的にどこが困っていますか？小さく分けて書いてみよう",
    placeholder: "例）\n・ミスの原因が自分でわからない\n・上司への報告が怖い\n・同じ作業に時間がかかりすぎる",
    hint: "「〜がつらい」ではなく「〜ができない」「〜がわからない」という形で書くと分けやすいよ。3つくらい出せると十分。",
  },
  {
    id: "target",
    label: "取り組む問題",
    question: "その中で、今一番対処できそうなものはどれですか？",
    placeholder: "例）ミスの原因が自分でわからない、という問題に取り組む",
    hint: "「解決できそう」じゃなくて「対処できそう」で選ぼう。小さくても手をつけられるものがベスト。",
  },
  {
    id: "benefit",
    label: "解決のメリット",
    question: "それが解決したら、どんないいことがありそう？",
    placeholder: "例）ミスが減れば上司への報告も怖くなくなる。少し自信が持てるかも",
    hint: "大きなことじゃなくていい。「少し楽になる」「気持ちが軽くなる」でも十分。やる気のタネになるよ。",
  },
  {
    id: "solutions",
    label: "解決策を出す",
    question: "どんな方法が考えられますか？思いつくだけ書いてみよう",
    placeholder: "例）\n・作業前にメモで手順を確認する（効果80% / できそう90%）\n・上司に確認のタイミングを決めてもらう（効果70% / できそう60%）\n・同僚にやり方を聞いてみる（効果60% / できそう70%）",
    hint: "「効果的か」「実際にできそうか」も一緒に書けると選びやすくなるよ。パーセントでなくても○△×でもOK。",
  },
  {
    id: "plan",
    label: "実行計画",
    question: "まず何から試しますか？いつ、どうやってやるか書いてみよう",
    placeholder: "例）明日の朝、作業前に手順メモを作る。5分でいいのでやってみる",
    hint: "「完璧にやる」じゃなく「実験としてやってみる」くらいの気持ちで。小さく始めるのがコツ。",
  },
];

const todayStr = () => {
  const d = new Date();
  return {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    day: String(d.getDate()).padStart(2, "0"),
  };
};

const toDateStr = (y, m, d) => `${y}-${m}-${d}`;
const formatDate = (dateStr) => {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m)}月${parseInt(d)}日`;
};
const daysInMonth = (y, m) => new Date(parseInt(y), parseInt(m), 0).getDate();

const sel = {
  flex: 1,
  background: "#1a1d27",
  border: "1px solid #2a2d3e",
  borderRadius: 10,
  color: "#e8eaf0",
  fontSize: 15,
  padding: "12px 8px",
  outline: "none",
  fontFamily: "inherit",
  appearance: "none",
  WebkitAppearance: "none",
  textAlign: "center",
};

const inp = {
  width: "100%",
  background: "#151929",
  border: "1px solid #2a2d3e",
  borderRadius: 10,
  color: "#e8eaf0",
  fontSize: 15,
  padding: "12px 14px",
  outline: "none",
  resize: "vertical",
  fontFamily: "inherit",
  lineHeight: 1.7,
  boxSizing: "border-box",
};

const BottomNav = ({ onBack, onHome }) => (
  <div style={{ display: "flex", gap: 10, marginTop: 32, paddingTop: 16, borderTop: `1px solid #2a2d3e` }}>
    <button onClick={onBack} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#1a1d27", border: "1px solid #2a2d3e", borderRadius: 12, color: "#6b7280", fontSize: 14, padding: "12px", cursor: "pointer" }}>
      <IconArrowLeft size={16} />戻る
    </button>
    <button onClick={onHome} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#1a1d27", border: "1px solid #2a2d3e", borderRadius: 12, color: "#6b7280", fontSize: 14, padding: "12px", cursor: "pointer" }}>
      <IconHome size={16} />ホーム
    </button>
  </div>
);

const DateSelector = ({ year, month, day, onYear, onMonth, onDay }) => {
  const yearOptions = ["2025", "2026", "2027"];
  const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const dayOptions = Array.from({ length: daysInMonth(year, month) }, (_, i) => String(i + 1).padStart(2, "0"));
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select value={year} onChange={(e) => onYear(e.target.value)} style={sel}>
        {yearOptions.map((y) => <option key={y} value={y}>{y}年</option>)}
      </select>
      <select value={month} onChange={(e) => { onMonth(e.target.value); if (parseInt(day) > daysInMonth(year, e.target.value)) onDay("01"); }} style={sel}>
        {monthOptions.map((m) => <option key={m} value={m}>{parseInt(m)}月</option>)}
      </select>
      <select value={day} onChange={(e) => onDay(e.target.value)} style={sel}>
        {dayOptions.map((d) => <option key={d} value={d}>{parseInt(d)}日</option>)}
      </select>
    </div>
  );
};

const STORAGE_KEY = "reframe_records";
const CHECKIN_KEY = "reframe_checkins";
const COPING_KEY = "reframe_copings";
const CRISIS_KEY = "stride_crisis";

const loadCrisisPlan = () => {
  try {
    const saved = localStorage.getItem(CRISIS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 新形式かチェック
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

const saveCrisisPlan = (plan) => {
  try { localStorage.setItem(CRISIS_KEY, JSON.stringify(plan)); } catch (e) {}
};

const loadRecords = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [
    { id: 1, date: "2026-05-07", situation: "友達にLINEを既読無視された", completed: true, cbt: { emotion: "不安 70%、悲しみ 50%", autoThought: "嫌われたのかもしれない", evidence_for: "最近会っていない", evidence_against: "相手が忙しいだけかも", balanced: "忙しくて返せていないだけかもしれない", reEmotion: "不安 30%" } },
    { id: 2, date: "2026-05-09", situation: "上司に仕事のやり方を批判された", completed: false, cbt: {} },
  ];
};

const saveRecords = (records) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch (e) {}
};

const loadCheckins = () => {
  try {
    const saved = localStorage.getItem(CHECKIN_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
};

const saveCheckins = (checkins) => {
  try { localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkins)); } catch (e) {}
};

const loadCopings = () => {
  try {
    const saved = localStorage.getItem(COPING_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
};

const AGREED_KEY = "stride_agreed";
const hasAgreed = () => {
  try { return localStorage.getItem(AGREED_KEY) === "true"; } catch (e) { return false; }
};
const setAgreed = () => {
  try { localStorage.setItem(AGREED_KEY, "true"); } catch (e) {}
};

const saveCopings = (copings) => {
  try { localStorage.setItem(COPING_KEY, JSON.stringify(copings)); } catch (e) {}
};

export default function App() {
  const t = todayStr();
  const [view, setView] = useState("home");
  const [records, setRecords] = useState(loadRecords);
  const [agreed, setAgreedState] = useState(hasAgreed);

  const [newSituation, setNewSituation] = useState("");
  const [newYear, setNewYear] = useState(t.year);
  const [newMonth, setNewMonth] = useState(t.month);
  const [newDay, setNewDay] = useState(t.day);

  const [cbtId, setCbtId] = useState(null);
  const [cbtStep, setCbtStep] = useState(0);
  const [cbtDraft, setCbtDraft] = useState({});
  const [showHint, setShowHint] = useState(false);

  const [psId, setPsId] = useState(null);
  const [psStep, setPsStep] = useState(0);
  const [psDraft, setPsDraft] = useState({});

  const [detailId, setDetailId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editSituation, setEditSituation] = useState("");
  const [editYear, setEditYear] = useState(t.year);
  const [editMonth, setEditMonth] = useState(t.month);
  const [editDay, setEditDay] = useState(t.day);
  const [editCbt, setEditCbt] = useState({});
  const [editPs, setEditPs] = useState({});

  const [checkins, setCheckins] = useState(loadCheckins);
  const [checkinDraft, setCheckinDraft] = useState({ mood: 5, condition: null, sleep: null, memo: "" });

  const [copings, setCopings] = useState(loadCopings);
  const [copingSort, setCopingSort] = useState("difficulty");
  const [newCoping, setNewCoping] = useState({ text: "", difficulty: null, effect: null });
  const [copingDeleteId, setCopingDeleteId] = useState(null);

  const [crisisPlan, setCrisisPlan] = useState(loadCrisisPlan);
  const [crisisModal, setCrisisModal] = useState(null);
  const [crisisTab, setCrisisTab] = useState("safe"); // { type, editId, text, text2 }

  useEffect(() => { saveRecords(records); }, [records]);
  useEffect(() => { saveCheckins(checkins); }, [checkins]);
  useEffect(() => { saveCopings(copings); }, [copings]);
  useEffect(() => { saveCrisisPlan(crisisPlan); }, [crisisPlan]);

  const sortedCopings = [...copings].sort((a, b) =>
    copingSort === "difficulty" ? a.difficulty - b.difficulty : b.effect - a.effect
  );

  const recentCheckins = (() => {
    const result = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = String(d.getFullYear());
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = toDateStr(y, m, day);
      const found = checkins.find((c) => c.date === dateStr);
      result.push({ date: dateStr, data: found || null });
    }
    return result;
  })();

  const saveCoping = () => {
    if (!newCoping.text.trim() || !newCoping.difficulty || !newCoping.effect) return;
    setCopings([{ id: Date.now(), ...newCoping }, ...copings]);
    setNewCoping({ text: "", difficulty: null, effect: null });
    setView("coping");
  };

  const deleteCoping = (id) => {
    setCopings((prev) => prev.filter((c) => c.id !== id));
    setCopingDeleteId(null);
  };

  const todayCheckin = checkins.find((c) => c.date === toDateStr(t.year, t.month, t.day));

  const saveCheckin = () => {
    if (!checkinDraft.mood) return;
    const entry = { id: Date.now(), date: toDateStr(t.year, t.month, t.day), ...checkinDraft };
    setCheckins([entry, ...checkins.filter((c) => c.date !== entry.date)]);
    setCheckinDraft({ mood: 5, condition: null, sleep: null, memo: "" });
    setView("home");
  };

  const selectedDetail = records.find((r) => r.id === detailId);
  const cbtRecord = records.find((r) => r.id === cbtId);

  const saveNew = () => {
    if (!newSituation.trim()) return;
    setRecords([{ id: Date.now(), date: toDateStr(newYear, newMonth, newDay), situation: newSituation, completed: false, cbt: {} }, ...records]);
    setNewSituation("");
    const t2 = todayStr();
    setNewYear(t2.year); setNewMonth(t2.month); setNewDay(t2.day);
    setView("list");
  };

  const toggleComplete = (id) => {
    setRecords(records.map((r) => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setDeleteTargetId(null);
  };

  const startEdit = (rec) => {
    const [y, m, d] = rec.date.split("-");
    setEditYear(y); setEditMonth(m); setEditDay(d);
    setEditSituation(rec.situation);
    setEditCbt({ ...(rec.cbt || {}) });
    setEditPs({ ...(rec.ps || {}) });
    setEditing(true);
  };

  const saveEdit = () => {
    setRecords(records.map((r) => r.id === detailId ? { ...r, date: toDateStr(editYear, editMonth, editDay), situation: editSituation, cbt: editCbt, ps: editPs } : r));
    setEditing(false);
  };

  const startCBT = (id) => {
    const rec = records.find((r) => r.id === id);
    setCbtId(id);
    setCbtDraft(rec.cbt || {});
    setCbtStep(0);
    setShowHint(false);
    setView("cbt");
  };

  const finishCBT = () => {
    setRecords(records.map((r) => r.id === cbtId ? { ...r, completed: true, cbt: cbtDraft } : r));
    setView("list");
  };

  const saveCBTDraft = () => {
    setRecords(records.map((r) => r.id === cbtId ? { ...r, completed: false, cbt: cbtDraft } : r));
    setView("list");
  };

  const startPS = (id) => {
    const rec = records.find((r) => r.id === id);
    setPsId(id);
    setPsDraft(rec.ps || {});
    setPsStep(0);
    setShowHint(false);
    setView("ps");
  };

  const finishPS = () => {
    setRecords(records.map((r) => r.id === psId ? { ...r, completed: true, ps: psDraft } : r));
    setView("list");
  };

  const savePSDraft = () => {
    setRecords(records.map((r) => r.id === psId ? { ...r, completed: false, ps: psDraft } : r));
    setView("list");
  };

  const startApproach = (id) => {
    setDetailId(id);
    setView("approach");
  };

  const addCrisisItem = (type, text, text2 = "") => {
    const item = { id: Date.now(), text, text2 };
    setCrisisPlan((prev) => ({ ...prev, [type]: [...prev[type], item] }));
  };

  const updateCrisisItem = (type, id, text, text2 = "") => {
    setCrisisPlan((prev) => ({ ...prev, [type]: prev[type].map((i) => i.id === id ? { ...i, text, text2 } : i) }));
  };

  const deleteCrisisItem = (type, id) => {
    setCrisisPlan((prev) => ({ ...prev, [type]: prev[type].filter((i) => i.id !== id) }));
  };

  const psRecord = records.find((r) => r.id === psId);

  if (!agreed) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Noto Sans JP', sans-serif", maxWidth: 480, margin: "0 auto", padding: "40px 20px" }}>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: COLORS.accent, textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>Stride</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>はじめる前に</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>以下をご確認のうえ、同意いただける場合はご利用ください。</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px 18px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>データの保存について</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>
              入力したデータはお使いのブラウザ（端末）にのみ保存されます。サーバーへの送信や、運営者によるデータへのアクセスは一切ありません。ブラウザのデータ削除・機種変更・別ブラウザへの切り替えでデータは失われますのでご注意ください。
            </div>
          </div>

          <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px 18px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 12, color: "#818cf8", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>医療行為ではありません</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>
              このアプリは個人が作成したセルフケア支援ツールです。医療行為・診断・治療を目的としたものではなく、精神科・心療内科などの専門的な治療の代替にはなりません。症状が悪化した場合や、緊急性を感じる場合は、必ず医療機関または支援機関にご相談ください。
            </div>
          </div>

          <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px 18px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>免責事項</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>
              本アプリの利用によって生じたいかなる損害についても、開発者は責任を負いかねます。自己の判断と責任のもとでご利用ください。
            </div>
          </div>
        </div>

        <button
          onClick={() => { setAgreed(true); setAgreedState(true); }}
          style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, color: "#0f1117", fontSize: 15, fontWeight: 700, padding: 16, cursor: "pointer" }}>
          同意してはじめる
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Noto Sans JP', sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page { animation: fadeIn 0.18s ease-out; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {view !== "home" && (
            <button onClick={() => {
              if (view === "newCoping") { setView("coping"); }
              else if (view === "list" || view === "coping" || view === "checkin" || view === "checkinHistory" || view === "crisis") { setView("home"); }
              else if (view === "new" || view === "detail") { setView("list"); setEditing(false); }
              else { setView("list"); setEditing(false); }
            }} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 20, padding: 0, lineHeight: 1 }}><IconArrowLeft size={20} /></button>
          )}
          <div>
            <div style={{ fontSize: 13, letterSpacing: 3, color: COLORS.accent, textTransform: "uppercase", fontWeight: 700 }}>Stride</div>
            {view !== "home" && (
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, color: COLORS.text }}>
                {view === "list" && "ストレス記録"}
                {view === "new" && "出来事を記録"}
                {view === "checkin" && "今日のチェックイン"}
                {view === "checkinHistory" && "チェックイン履歴"}
                {view === "coping" && "コーピングリスト"}
                {view === "newCoping" && "コーピングを追加"}
                {view === "crisis" && "クライシスプラン"}
                {view === "approach" && "アプローチを選ぶ"}
                {view === "cbt" && "認知再構成"}
                {view === "ps" && "問題解決技法"}
                {view === "detail" && !editing && "記録の詳細"}
                {view === "detail" && editing && "編集"}
              </div>
            )}
          </div>
        </div>
        {view === "detail" && !editing && selectedDetail && (
          <button onClick={() => startEdit(selectedDetail)} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, fontSize: 13, fontWeight: 600, padding: "8px 14px", cursor: "pointer" }}>
            編集
          </button>
        )}
      </div>

      {/* HOME */}
      {view === "home" && (
        <div className="page" style={{ padding: "32px 16px 24px" }}>
          {/* ヒーローテキスト */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, lineHeight: 1.3, marginBottom: 8 }}>
              今日も、<span style={{ color: COLORS.accent }}>一歩ずつ。</span>
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7 }}>
              記録することで、自分のパターンが見えてくる
            </div>
          </div>

          {/* チェックインカード */}
          {todayCheckin ? (
            <div style={{ background: COLORS.surface, borderRadius: 16, padding: "16px 18px", marginBottom: 24, border: `1px solid ${COLORS.accent}30` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Today's Check-in</div>
                <button onClick={() => { setCheckinDraft({ mood: todayCheckin.mood, condition: todayCheckin.condition, sleep: todayCheckin.sleep, memo: todayCheckin.memo || "" }); setView("checkin"); }}
                  style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 12, cursor: "pointer", padding: 0 }}>編集</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: COLORS.accent, lineHeight: 1 }}>{todayCheckin.mood}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 4, background: COLORS.border, borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
                    <div style={{ width: `${todayCheckin.mood * 10}%`, height: "100%", background: COLORS.accent, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, display: "flex", gap: 10 }}>
                    {todayCheckin.condition && <span>{todayCheckin.condition}</span>}
                    {todayCheckin.sleep && <span>睡眠 {todayCheckin.sleep}</span>}
                  </div>
                  {todayCheckin.memo && <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 4 }}>"{todayCheckin.memo}"</div>}
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => { setCheckinDraft({ mood: 5, condition: null, sleep: null, memo: "" }); setView("checkin"); }}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.accent}50`, borderRadius: 16, color: COLORS.accent, fontSize: 14, fontWeight: 700, padding: 16, cursor: "pointer", marginBottom: 24, textAlign: "left", letterSpacing: 0.5 }}>
              <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4, opacity: 0.7 }}>Today's Check-in</div>
              今日のチェックインをする →
            </button>
          )}

          {/* メニュー */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setView("checkinHistory")}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconChartLine size={24} color={COLORS.accent} />
                <div>
                  <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>History</div>
                  チェックイン履歴
                  <div style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted, marginTop: 3 }}>過去2週間の気分・体調を振り返る</div>
                </div>
              </div>
            </button>
            <button onClick={() => setView("list")}
              style={{ width: "100%", background: `linear-gradient(135deg, ${COLORS.accent}20, ${COLORS.accent}08)`, border: `1px solid ${COLORS.accent}40`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconPencil size={24} color={COLORS.accent} />
                <div>
                  <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Stress Log</div>
                  ストレス記録
                  <div style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted, marginTop: 3 }}>記録の一覧・アプローチワーク</div>
                </div>
              </div>
            </button>
            <button onClick={() => setView("coping")}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconListCheck size={24} color="#818cf8" />
                <div>
                  <div style={{ fontSize: 11, color: "#818cf8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Coping</div>
                  コーピングリスト
                  <div style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted, marginTop: 3 }}>自分だけの対処法を管理する</div>
                </div>
              </div>
            </button>
            <button onClick={() => setView("crisis")}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid #f8716130`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconShield size={24} color="#f87161" />
                <div>
                  <div style={{ fontSize: 11, color: "#f87161", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Crisis Plan</div>
                  クライシスプラン
                  <div style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted, marginTop: 3 }}>Safe / Caution / Crisis の状態を整理する</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* LIST */}
      {view === "list" && (
        <div className="page" style={{ padding: "20px 16px" }}>
          <button onClick={() => setView("new")} style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, color: "#0f1117", fontSize: 15, fontWeight: 700, padding: 14, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <IconPlus size={18} />ストレスを記録する
          </button>
          {records.length === 0 && (
            <div style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 60, fontSize: 14, lineHeight: 2 }}>まだ記録がないよ<br />上のボタンから追加してみて</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {records.map((rec) => (
              <div key={rec.id} style={{ background: COLORS.surface, borderRadius: 14, padding: "14px 16px", border: `1px solid ${COLORS.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <button
                    onClick={() => toggleComplete(rec.id)}
                    style={{ flexShrink: 0, marginTop: 3, width: 24, height: 24, borderRadius: 6, border: `2px solid ${rec.completed ? COLORS.success : COLORS.border}`, background: rec.completed ? COLORS.success : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", padding: 0 }}
                  >
                    {rec.completed && (
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                        <path d="M1.5 5L5 8.5L11.5 1.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <div style={{ flex: 1, cursor: "pointer" }} onClick={() => { setDetailId(rec.id); setEditing(false); setView("detail"); }}>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>{formatDate(rec.date)}</div>
                    <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5, color: rec.completed ? COLORS.textMuted : COLORS.text, textDecoration: rec.completed ? "line-through" : "none" }}>
                      {rec.situation}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTargetId(rec.id); }}
                    style={{ flexShrink: 0, marginTop: 2, background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1, opacity: 0.5 }}
                  >×</button>
                </div>
                {!rec.completed && (
                  <button onClick={() => startApproach(rec.id)} style={{ marginTop: 12, width: "100%", background: COLORS.accentSoft, border: "none", borderRadius: 8, color: COLORS.accentText, fontSize: 13, fontWeight: 700, padding: "10px", cursor: "pointer" }}>
                    {(rec.cbt && Object.keys(rec.cbt).length > 0) || (rec.ps && Object.keys(rec.ps).length > 0)
                      ? "続きから →"
                      : "アプローチを選ぶ →"}
                  </button>
                )}
              </div>
            ))}
          </div>
          <BottomNav onBack={() => setView("home")} onHome={() => setView("home")} />
        </div>
      )}

      {/* COPING LIST */}
      {view === "coping" && (
        <div className="page" style={{ padding: "20px 16px" }}>
          <button onClick={() => { setNewCoping({ text: "", difficulty: null, effect: null }); setView("newCoping"); }} style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, padding: 13, cursor: "pointer", marginBottom: 16 }}>
            ＋ コーピングを追加する
          </button>

          {/* ソート切り替え */}
          {copings.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setCopingSort("difficulty")}
                style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${copingSort === "difficulty" ? COLORS.accent : COLORS.border}`, background: copingSort === "difficulty" ? COLORS.accentSoft : COLORS.surface, color: copingSort === "difficulty" ? COLORS.accentText : COLORS.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                難易度順
              </button>
              <button onClick={() => setCopingSort("effect")}
                style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${copingSort === "effect" ? COLORS.accent : COLORS.border}`, background: copingSort === "effect" ? COLORS.accentSoft : COLORS.surface, color: copingSort === "effect" ? COLORS.accentText : COLORS.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                効果順
              </button>
            </div>
          )}

          {copings.length === 0 && (
            <div style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 60, fontSize: 14, lineHeight: 2 }}>まだコーピングがないよ<br />上のボタンから追加してみて</div>
          )}

          <div key={copingSort} className="page" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sortedCopings.map((c) => (
              <div key={c.id} style={{ background: COLORS.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, fontSize: 15, lineHeight: 1.6, color: COLORS.text }}>{c.text}</div>
                  <button onClick={() => setCopingDeleteId(c.id)} style={{ flexShrink: 0, background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 18, padding: "0 2px", opacity: 0.5 }}>×</button>
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                    難易度 <span style={{ fontWeight: 700, color: COLORS.text }}>{c.difficulty}</span>
                    <span style={{ color: COLORS.border }}> / 5</span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                    効果 <span style={{ fontWeight: 700, color: COLORS.text }}>{c.effect}</span>
                    <span style={{ color: COLORS.border }}> / 5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* コーピング削除確認 */}
          {copingDeleteId && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>このコーピングを削除しますか？</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
                  {copings.find((c) => c.id === copingDeleteId)?.text}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setCopingDeleteId(null)} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>キャンセル</button>
                  <button onClick={() => deleteCoping(copingDeleteId)} style={{ flex: 1, background: COLORS.danger, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 12, cursor: "pointer" }}>削除する</button>
                </div>
              </div>
            </div>
          )}
          <BottomNav onBack={() => setView("home")} onHome={() => setView("home")} />
        </div>
      )}

      {/* NEW COPING */}
      {view === "newCoping" && (
        <div className="page" style={{ padding: "24px 16px" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>どんな対処法？</div>
            <textarea rows={4} style={inp} placeholder="例）散歩に出かける、好きな音楽を聴く、深呼吸を10回する" value={newCoping.text} onChange={(e) => setNewCoping({ ...newCoping, text: e.target.value })} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>実施難易度</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>1（簡単）〜 5（難しい）</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[1,2,3,4,5].map((n) => (
                <button key={n} onClick={() => setNewCoping({ ...newCoping, difficulty: n })}
                  style={{ flex: 1, height: 44, borderRadius: 10, border: `2px solid ${newCoping.difficulty === n ? COLORS.accent : COLORS.border}`, background: newCoping.difficulty === n ? COLORS.accentSoft : COLORS.surface, color: newCoping.difficulty === n ? COLORS.accentText : COLORS.text, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>効果</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>1（あまり効かない）〜 5（とても効く）</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[1,2,3,4,5].map((n) => (
                <button key={n} onClick={() => setNewCoping({ ...newCoping, effect: n })}
                  style={{ flex: 1, height: 44, borderRadius: 10, border: `2px solid ${newCoping.effect === n ? COLORS.accent : COLORS.border}`, background: newCoping.effect === n ? COLORS.accentSoft : COLORS.surface, color: newCoping.effect === n ? COLORS.accentText : COLORS.text, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setView("coping")} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>キャンセル</button>
            <button onClick={saveCoping} disabled={!newCoping.text.trim() || !newCoping.difficulty || !newCoping.effect}
              style={{ flex: 2, background: (newCoping.text.trim() && newCoping.difficulty && newCoping.effect) ? COLORS.accent : COLORS.border, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 13, cursor: (newCoping.text.trim() && newCoping.difficulty && newCoping.effect) ? "pointer" : "default" }}>
              追加する
            </button>
          </div>
        </div>
      )}

      {/* CRISIS PLAN */}
      {view === "crisis" && (
        <div className="page" style={{ padding: "20px 16px" }}>

          {/* タブ */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[
              { id: "safe", label: "Safe", color: COLORS.accent },
              { id: "caution", label: "Caution", color: "#e0a855" },
              { id: "crisis", label: "Crisis", color: COLORS.danger },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setCrisisTab(tab.id)}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${crisisTab === tab.id ? tab.color : COLORS.border}`, background: crisisTab === tab.id ? `${tab.color}18` : COLORS.surface, color: crisisTab === tab.id ? tab.color : COLORS.textMuted, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Safe */}
          {crisisTab === "safe" && (
            <div key="safe" className="page" style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.accent }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.accent, letterSpacing: 2, textTransform: "uppercase" }}>Safe</div>
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>安定しているときの自分の状態を書いておこう</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                {crisisPlan.safe.map((item) => (
                  <div key={item.id} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.accent}30`, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>{item.text}</div>
                    <button onClick={() => setCrisisModal({ type: "safe", editId: item.id, text: item.text, text2: "" })}
                      style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: 0 }}>編集</button>
                    <button onClick={() => deleteCrisisItem("safe", item.id)}
                      style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, padding: 0, opacity: 0.5 }}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setCrisisModal({ type: "safe", editId: null, text: "", text2: "" })}
                style={{ width: "100%", background: "none", border: `1px dashed ${COLORS.accent}50`, borderRadius: 10, color: COLORS.accent, fontSize: 13, padding: "10px", cursor: "pointer" }}>
                ＋ 追加する
              </button>
            </div>
          )}

          {/* Caution */}
          {crisisTab === "caution" && (
            <div key="caution" className="page" style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e0a855" }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e0a855", letterSpacing: 2, textTransform: "uppercase" }}>Caution</div>
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>ストレスのトリガー・注意サイン、それぞれに対処法を書いておこう</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#e0a855", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>トリガー（ストレスになりうるもの）</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                  {crisisPlan.caution_triggers.map((item) => (
                    <div key={item.id} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid #e0a85530` }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, color: COLORS.text, marginBottom: 6 }}>{item.text}</div>
                          {item.text2 && <div style={{ fontSize: 12, color: "#e0a855", borderTop: `1px solid ${COLORS.border}`, paddingTop: 6, marginTop: 4 }}>対処法：{item.text2}</div>}
                        </div>
                        <button onClick={() => setCrisisModal({ type: "caution_triggers", editId: item.id, text: item.text, text2: item.text2 })}
                          style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: 0 }}>編集</button>
                        <button onClick={() => deleteCrisisItem("caution_triggers", item.id)}
                          style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, padding: 0, opacity: 0.5 }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setCrisisModal({ type: "caution_triggers", editId: null, text: "", text2: "" })}
                  style={{ width: "100%", background: "none", border: `1px dashed #e0a85550`, borderRadius: 10, color: "#e0a855", fontSize: 13, padding: "10px", cursor: "pointer" }}>
                  ＋ 追加する
                </button>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#e0a855", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>注意サイン（体・気持ちの変化）</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                  {crisisPlan.caution_signs.map((item) => (
                    <div key={item.id} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid #e0a85530` }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, color: COLORS.text, marginBottom: 6 }}>{item.text}</div>
                          {item.text2 && <div style={{ fontSize: 12, color: "#e0a855", borderTop: `1px solid ${COLORS.border}`, paddingTop: 6, marginTop: 4 }}>対処法：{item.text2}</div>}
                        </div>
                        <button onClick={() => setCrisisModal({ type: "caution_signs", editId: item.id, text: item.text, text2: item.text2 })}
                          style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: 0 }}>編集</button>
                        <button onClick={() => deleteCrisisItem("caution_signs", item.id)}
                          style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, padding: 0, opacity: 0.5 }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setCrisisModal({ type: "caution_signs", editId: null, text: "", text2: "" })}
                  style={{ width: "100%", background: "none", border: `1px dashed #e0a85550`, borderRadius: 10, color: "#e0a855", fontSize: 13, padding: "10px", cursor: "pointer" }}>
                  ＋ 追加する
                </button>
              </div>
            </div>
          )}

          {/* Crisis */}
          {crisisTab === "crisis" && (
            <div key="crisis" className="page" style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.danger }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.danger, letterSpacing: 2, textTransform: "uppercase" }}>Crisis</div>
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>危機のサイン・対処法、連絡先を書いておこう</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: COLORS.danger, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>危機のサイン</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                  {crisisPlan.crisis_signs.map((item) => (
                    <div key={item.id} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.danger}30` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{item.text}</div>
                        <button onClick={() => setCrisisModal({ type: "crisis_signs", editId: item.id, text: item.text, text2: "" })}
                          style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: 0 }}>編集</button>
                        <button onClick={() => deleteCrisisItem("crisis_signs", item.id)}
                          style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, padding: 0, opacity: 0.5 }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setCrisisModal({ type: "crisis_signs", editId: null, text: "", text2: "" })}
                  style={{ width: "100%", background: "none", border: `1px dashed ${COLORS.danger}50`, borderRadius: 10, color: COLORS.danger, fontSize: 13, padding: "10px", cursor: "pointer" }}>
                  ＋ 追加する
                </button>
              </div>
              <div>
                <div style={{ fontSize: 11, color: COLORS.danger, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>対処法・連絡先</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                  {crisisPlan.crisis_contacts.map((item) => (
                    <div key={item.id} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.danger}30` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>{item.text}</div>
                        <button onClick={() => setCrisisModal({ type: "crisis_contacts", editId: item.id, text: item.text, text2: "" })}
                          style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: 0 }}>編集</button>
                        <button onClick={() => deleteCrisisItem("crisis_contacts", item.id)}
                          style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, padding: 0, opacity: 0.5 }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setCrisisModal({ type: "crisis_contacts", editId: null, text: "", text2: "" })}
                  style={{ width: "100%", background: "none", border: `1px dashed ${COLORS.danger}50`, borderRadius: 10, color: COLORS.danger, fontSize: 13, padding: "10px", cursor: "pointer" }}>
                  ＋ 追加する
                </button>
              </div>
            </div>
          )}

          <BottomNav onBack={() => setView("home")} onHome={() => setView("home")} />

          {/* 入力モーダル */}
          {crisisModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}>
              <div style={{ background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 480 }}>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>
                  {crisisModal.type === "safe" && "安定しているときの状態"}
                  {crisisModal.type === "caution_triggers" && "トリガー"}
                  {crisisModal.type === "caution_signs" && "注意サイン"}
                  {crisisModal.type === "crisis_signs" && "危機のサイン"}
                  {crisisModal.type === "crisis_contacts" && "対処法・連絡先"}
                </div>
                <textarea rows={3} style={{ ...inp, marginBottom: 10 }}
                  placeholder={
                    crisisModal.type === "safe" ? "例）よく眠れている、趣味を楽しめている" :
                    crisisModal.type === "caution_triggers" ? "例）締め切りが重なる" :
                    crisisModal.type === "caution_signs" ? "例）イライラしやすくなる" :
                    crisisModal.type === "crisis_signs" ? "例）希死念慮が出てくる" :
                    "例）〇〇クリニック（主治医）/ 深呼吸して落ち着く"
                  }
                  value={crisisModal.text}
                  onChange={(e) => setCrisisModal({ ...crisisModal, text: e.target.value })}
                  autoFocus
                />
                {crisisModal.type !== "safe" && crisisModal.type !== "crisis_signs" && crisisModal.type !== "crisis_contacts" && (
                  <textarea rows={2} style={{ ...inp, marginBottom: 16 }}
                    placeholder="対処法を書いておこう"
                    value={crisisModal.text2}
                    onChange={(e) => setCrisisModal({ ...crisisModal, text2: e.target.value })}
                  />
                )}
                <div style={{ display: "flex", gap: 10, marginTop: crisisModal.type === "safe" ? 16 : 0 }}>
                  <button onClick={() => setCrisisModal(null)}
                    style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>キャンセル</button>
                  <button onClick={() => {
                    if (!crisisModal.text.trim()) return;
                    if (crisisModal.editId) {
                      updateCrisisItem(crisisModal.type, crisisModal.editId, crisisModal.text, crisisModal.text2);
                    } else {
                      addCrisisItem(crisisModal.type, crisisModal.text, crisisModal.text2);
                    }
                    setCrisisModal(null);
                  }} style={{ flex: 2, background: COLORS.accent, border: "none", borderRadius: 10, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: 12, cursor: "pointer" }}>
                    {crisisModal.editId ? "更新する" : "追加する"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHECKIN HISTORY */}
      {view === "checkinHistory" && (
        <div className="page" style={{ padding: "20px 16px" }}>
          {recentCheckins.every((r) => !r.data) && (
            <div style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 60, fontSize: 14, lineHeight: 2 }}>
              まだチェックインの記録がないよ<br />毎日記録すると波が見えてくる
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentCheckins.map(({ date, data }) => {
              const [, m, d] = date.split("-");
              const label = `${parseInt(m)}月${parseInt(d)}日`;
              const isToday = date === toDateStr(t.year, t.month, t.day);
              return (
                <div key={date} style={{ background: COLORS.surface, borderRadius: 12, padding: "12px 16px", border: `1px solid ${data ? COLORS.accentSoft : COLORS.border}`, opacity: data ? 1 : 0.5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ minWidth: 60 }}>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{label}</div>
                      {isToday && <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 700 }}>今日</div>}
                    </div>
                    {data ? (
                      <>
                        {/* 気分バー */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <div style={{ flex: 1, height: 8, borderRadius: 4, background: COLORS.border, overflow: "hidden" }}>
                              <div style={{ width: `${data.mood * 10}%`, height: "100%", background: data.mood >= 7 ? COLORS.accent : data.mood >= 4 ? "#e0a855" : COLORS.danger, borderRadius: 4, transition: "width 0.3s" }} />
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, minWidth: 16 }}>{data.mood}</div>
                          </div>
                          <div style={{ display: "flex", gap: 10, fontSize: 11, color: COLORS.textMuted }}>
                            {data.condition && <span>{data.condition}</span>}
                            {data.sleep && <span>睡眠 {data.sleep}</span>}
                            {data.memo && <span style={{ color: COLORS.accent }}>「{data.memo}」</span>}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 13, color: COLORS.textMuted }}>記録なし</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <BottomNav onBack={() => setView("home")} onHome={() => setView("home")} />
        </div>
      )}
      {view === "checkin" && (
        <div className="page" style={{ padding: "24px 16px" }}>
          {/* 気分スコア */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>今の気分は？</div>
              {checkinDraft.mood && (
                <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.accentText, lineHeight: 1 }}>{checkinDraft.mood}</div>
              )}
            </div>
            <input
              type="range" min="1" max="10" step="1"
              value={checkinDraft.mood ?? 5}
              onChange={(e) => setCheckinDraft({ ...checkinDraft, mood: parseInt(e.target.value) })}
              style={{ width: "100%", accentColor: COLORS.accent, height: 6, cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: COLORS.textMuted }}>
              <span>1 つらい</span><span>最高 10</span>
            </div>
          </div>

          {/* 体調 */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>体調は？<span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 400, marginLeft: 6 }}>任意</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["とても良い", "良い", "普通", "悪い", "とても悪い"].map((c) => (
                <button key={c} onClick={() => setCheckinDraft({ ...checkinDraft, condition: checkinDraft.condition === c ? null : c })}
                  style={{ padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${checkinDraft.condition === c ? COLORS.accent : COLORS.border}`, background: checkinDraft.condition === c ? COLORS.accentSoft : COLORS.surface, color: checkinDraft.condition === c ? COLORS.accentText : COLORS.text, fontSize: 14, fontWeight: checkinDraft.condition === c ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 睡眠時間 */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>昨夜の睡眠時間は？<span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 400, marginLeft: 6 }}>任意</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["4時間未満", "4〜6時間", "6〜8時間", "8時間以上"].map((s) => (
                <button key={s} onClick={() => setCheckinDraft({ ...checkinDraft, sleep: checkinDraft.sleep === s ? null : s })}
                  style={{ padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${checkinDraft.sleep === s ? COLORS.accent : COLORS.border}`, background: checkinDraft.sleep === s ? COLORS.accentSoft : COLORS.surface, color: checkinDraft.sleep === s ? COLORS.accentText : COLORS.text, fontSize: 14, fontWeight: checkinDraft.sleep === s ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 一言メモ */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>一言メモ<span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 400, marginLeft: 6 }}>任意</span></div>
            <textarea rows={3} style={inp} placeholder="今日の気持ちや気づきをひとこと" value={checkinDraft.memo} onChange={(e) => setCheckinDraft({ ...checkinDraft, memo: e.target.value })} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setView("home")} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>キャンセル</button>
            <button onClick={saveCheckin} disabled={!checkinDraft.mood}
              style={{ flex: 2, background: checkinDraft.mood ? COLORS.accent : COLORS.border, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 13, cursor: checkinDraft.mood ? "pointer" : "default", transition: "background 0.2s" }}>
              記録する
            </button>
          </div>
        </div>
      )}

      {/* NEW */}
      {view === "new" && (
        <div className="page" style={{ padding: "24px 16px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>日付</div>
            <DateSelector year={newYear} month={newMonth} day={newDay} onYear={setNewYear} onMonth={setNewMonth} onDay={setNewDay} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>何があった？</div>
            <textarea rows={5} style={inp} placeholder="例）上司に仕事のやり方を批判された" value={newSituation} onChange={(e) => setNewSituation(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setView("list")} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>キャンセル</button>
            <button onClick={saveNew} style={{ flex: 2, background: COLORS.accent, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 13, cursor: "pointer" }}>記録する</button>
          </div>
        </div>
      )}

      {/* DETAIL — 表示 */}
      {view === "detail" && selectedDetail && !editing && (
        <div className="page" style={{ padding: "20px 16px" }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>{formatDate(selectedDetail.date)}</div>
          <div style={{ background: COLORS.surface, borderRadius: 12, padding: "14px 16px", fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 24, border: `1px solid ${COLORS.border}` }}>{selectedDetail.situation}</div>

          {/* CBT記録 */}
          {selectedDetail.cbt && Object.keys(selectedDetail.cbt).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: 1, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${COLORS.border}` }}>認知再構成の記録</div>
              {CBT_STEPS.map((step) => selectedDetail.cbt[step.id] ? (
                <div key={step.id} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1, marginBottom: 5, textTransform: "uppercase" }}>{step.label}</div>
                  <div style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.7, border: `1px solid ${COLORS.border}` }}>{selectedDetail.cbt[step.id]}</div>
                </div>
              ) : null)}
            </div>
          )}

          {/* PS記録 */}
          {selectedDetail.ps && Object.keys(selectedDetail.ps).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "#818cf8", fontWeight: 700, letterSpacing: 1, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${COLORS.border}` }}>問題解決技法の記録</div>
              {PS_STEPS.map((step) => selectedDetail.ps[step.id] ? (
                <div key={step.id} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1, marginBottom: 5, textTransform: "uppercase" }}>{step.label}</div>
                  <div style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.7, border: `1px solid ${COLORS.border}` }}>{selectedDetail.ps[step.id]}</div>
                </div>
              ) : null)}
            </div>
          )}

          {(!selectedDetail.cbt || Object.keys(selectedDetail.cbt).length === 0) &&
           (!selectedDetail.ps || Object.keys(selectedDetail.ps).length === 0) && (
            <div style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>まだアプローチをしていないよ</div>
          )}

          <button onClick={() => startApproach(selectedDetail.id)} style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, padding: 14, cursor: "pointer", marginTop: 8 }}>
            アプローチを選ぶ →
          </button>
          <BottomNav onBack={() => setView("list")} onHome={() => setView("home")} />
        </div>
      )}

      {/* DETAIL — 編集 */}
      {view === "detail" && selectedDetail && editing && (
        <div className="page" style={{ padding: "24px 16px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>日付</div>
            <DateSelector year={editYear} month={editMonth} day={editDay} onYear={setEditYear} onMonth={setEditMonth} onDay={setEditDay} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>何があった？</div>
            <textarea rows={4} style={inp} value={editSituation} onChange={(e) => setEditSituation(e.target.value)} />
          </div>
          {selectedDetail.cbt && Object.keys(selectedDetail.cbt).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16, paddingTop: 8, borderTop: `1px solid ${COLORS.border}` }}>認知再構成の内容</div>
              {CBT_STEPS.map((step) => (
                <div key={step.id} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>{step.label}</div>
                  <textarea rows={3} style={inp} placeholder={step.placeholder} value={editCbt[step.id] || ""} onChange={(e) => setEditCbt({ ...editCbt, [step.id]: e.target.value })} />
                </div>
              ))}
            </div>
          )}
          {selectedDetail.ps && Object.keys(selectedDetail.ps).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16, paddingTop: 8, borderTop: `1px solid ${COLORS.border}` }}>問題解決技法の内容</div>
              {PS_STEPS.map((step) => (
                <div key={step.id} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>{step.label}</div>
                  <textarea rows={3} style={inp} placeholder={step.placeholder} value={editPs[step.id] || ""} onChange={(e) => setEditPs({ ...editPs, [step.id]: e.target.value })} />
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setEditing(false)} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>キャンセル</button>
            <button onClick={saveEdit} style={{ flex: 2, background: COLORS.accent, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 13, cursor: "pointer" }}>保存する</button>
          </div>
        </div>
      )}

      {/* APPROACH */}
      {view === "approach" && selectedDetail && (
        <div className="page" style={{ padding: "20px 16px" }}>
          <div style={{ background: COLORS.accentSoft, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.accentText, marginBottom: 24, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <IconPin size={14} />{selectedDetail.situation}
          </div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>どのアプローチで向き合いますか？</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => startCBT(selectedDetail.id)} style={{ background: COLORS.surface, border: `1px solid ${COLORS.accent}40`, borderRadius: 14, padding: "16px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <IconBrain size={22} color={COLORS.accent} />
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>認知再構成</div>
              </div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6, paddingLeft: 34 }}>考え方のクセが気になるとき。自動思考を整理して、バランスのとれた見方を探す</div>
            </button>

            <button onClick={() => startPS(selectedDetail.id)} style={{ background: COLORS.surface, border: `1px solid #818cf840`, borderRadius: 14, padding: "16px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <IconBulb size={22} color="#818cf8" />
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>問題解決技法</div>
              </div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6, paddingLeft: 34 }}>状況そのものを変えたいとき。問題を整理して、具体的な行動を考える</div>
            </button>
          </div>
          <BottomNav onBack={() => setView("detail")} onHome={() => setView("home")} />
        </div>
      )}

      {/* PS */}
      {view === "ps" && psRecord && (
        <div className="page" style={{ padding: "20px 16px" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
            {PS_STEPS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 10, background: i <= psStep ? "#818cf8" : COLORS.border, transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
            Step {psStep + 1} / {PS_STEPS.length} — {PS_STEPS[psStep].label}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5, marginBottom: 16, color: COLORS.text }}>{PS_STEPS[psStep].question}</div>
          <div style={{ background: COLORS.accentSoft, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.accentText, marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
            📌 {psRecord.situation}
          </div>
          <textarea
            rows={5}
            style={inp}
            placeholder={PS_STEPS[psStep].placeholder}
            value={psDraft[PS_STEPS[psStep].id] || ""}
            onChange={(e) => setPsDraft({ ...psDraft, [PS_STEPS[psStep].id]: e.target.value })}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {psStep > 0 && (
              <button onClick={() => { setPsStep(psStep - 1); setShowHint(false); }} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>← 戻る</button>
            )}
            <button
              onClick={() => { if (psStep < PS_STEPS.length - 1) { setPsStep(psStep + 1); setShowHint(false); } else finishPS(); }}
              style={{ flex: 2, background: psStep === PS_STEPS.length - 1 ? COLORS.success : "#818cf8", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 13, cursor: "pointer" }}
            >
              {psStep === PS_STEPS.length - 1 ? "✓ 完了する" : "次へ →"}
            </button>
          </div>
          <div style={{ marginTop: 20 }}>
            <button onClick={() => setShowHint(!showHint)} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 13, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15 }}>{showHint ? "▾" : "▸"}</span>
              書き方のヒント
            </button>
            {showHint && (
              <div style={{ marginTop: 10, background: COLORS.hint, border: `1px solid ${COLORS.hintBorder}`, borderRadius: 10, padding: "14px 16px", fontSize: 13, color: COLORS.hintText, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {PS_STEPS[psStep].hint}
              </div>
            )}
          </div>
          <button onClick={savePSDraft} style={{ marginTop: 20, width: "100%", background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 13, padding: 12, cursor: "pointer" }}>
            今日はここまでにする
          </button>
        </div>
      )}
      {view === "cbt" && cbtRecord && (
        <div className="page" style={{ padding: "20px 16px" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
            {CBT_STEPS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 10, background: i <= cbtStep ? COLORS.accent : COLORS.border, transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
            Step {cbtStep + 1} / {CBT_STEPS.length} — {CBT_STEPS[cbtStep].label}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5, marginBottom: 16, color: COLORS.text }}>{CBT_STEPS[cbtStep].question}</div>
          <div style={{ background: COLORS.accentSoft, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.accentText, marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
            📌 {cbtRecord.situation}
          </div>
          <textarea
            rows={5}
            style={inp}
            placeholder={CBT_STEPS[cbtStep].placeholder}
            value={cbtDraft[CBT_STEPS[cbtStep].id] || ""}
            onChange={(e) => setCbtDraft({ ...cbtDraft, [CBT_STEPS[cbtStep].id]: e.target.value })}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {cbtStep > 0 && (
              <button onClick={() => { setCbtStep(cbtStep - 1); setShowHint(false); }} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>← 戻る</button>
            )}
            <button
              onClick={() => { if (cbtStep < CBT_STEPS.length - 1) { setCbtStep(cbtStep + 1); setShowHint(false); } else finishCBT(); }}
              style={{ flex: 2, background: cbtStep === CBT_STEPS.length - 1 ? COLORS.success : COLORS.accent, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 13, cursor: "pointer" }}
            >
              {cbtStep === CBT_STEPS.length - 1 ? "✓ 完了する" : "次へ →"}
            </button>
          </div>

          {/* ヒント */}
          <div style={{ marginTop: 20 }}>
            <button onClick={() => setShowHint(!showHint)} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 13, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15 }}>{showHint ? "▾" : "▸"}</span>
              書き方のヒント
            </button>
            {showHint && (
              <div style={{ marginTop: 10, background: COLORS.hint, border: `1px solid ${COLORS.hintBorder}`, borderRadius: 10, padding: "14px 16px", fontSize: 13, color: COLORS.hintText, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {CBT_STEPS[cbtStep].hint}
              </div>
            )}
          </div>
          <button onClick={saveCBTDraft} style={{ marginTop: 20, width: "100%", background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 13, padding: 12, cursor: "pointer" }}>
            今日はここまでにする
          </button>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {deleteTargetId && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>この記録を削除しますか？</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
              {records.find((r) => r.id === deleteTargetId)?.situation}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteTargetId(null)} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>
                キャンセル
              </button>
              <button onClick={() => deleteRecord(deleteTargetId)} style={{ flex: 1, background: COLORS.danger, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 12, cursor: "pointer" }}>
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}