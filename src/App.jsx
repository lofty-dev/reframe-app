import { useState, useEffect } from "react";
import { IconChartLine, IconPencil, IconListCheck, IconBrain, IconBulb, IconPlus, IconArrowLeft, IconPin, IconHome, IconShield, IconSettings, IconStar, IconNotes, IconMessage, IconStethoscope, IconLeaf, IconDeviceMobile, IconShare, IconCircleCheck, IconDotsVertical, IconDeviceDesktop, IconDownload, IconChevronDown, IconChevronUp, IconHelpCircle, IconBell } from "@tabler/icons-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { THEME_KEY, COLORS, COLORS_DARK, COLORS_LIGHT, ANNOUNCEMENTS, CBT3_STEPS, CBT_STEPS, STRESS_CATEGORIES, STRESS_INTENSITIES, COG_PATTERNS, PS_STEPS, TAB_VIEWS, HELP_CONTENT, ONBOARDING_SLIDES, TELL_PERSON_TYPES, sleepLabel } from "./constants";
import { todayStr, toDateStr, formatDate, daysInMonth, loadRecords, saveRecords, loadCheckins, saveCheckins, loadCopings, saveCopings, loadCrisisPlan, saveCrisisPlan, loadAchievements, saveAchievements, loadMemo, saveMemo, loadTellPeople, saveTellPeople, loadTellMemos, saveTellMemos, loadBridgeSettings, saveBridgeSettings, loadBridgeMemos, saveBridgeMemos, exportData, importData, hasAgreed, setAgreed, hasOnboarded, setOnboarded, hasPwaPrompted, setPwaPrompted, hasFeedbackBannerDismissed, setFeedbackBannerDismissed, hasThemeSelected, setThemeSelected } from "./storage";
import { inpStyle } from "./styles";
import { BottomNav, BottomTabBar } from "./components/BottomNav";
import { DateSelector } from "./components/DateSelector";
import { EmotionInput, AutoThoughtInput } from "./components/EmotionInput";
import { SortablePersonItem } from "./components/SortablePersonItem";

export default function App() {
  const t = todayStr();
  const [view, setView] = useState("home");
  const [activeTab, setActiveTab] = useState("home");
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) !== "light"; } catch { return true; }
  });

  const toggleTheme = (dark) => {
    const style = document.createElement("style");
    style.id = "__theme_tr__";
    style.textContent = "*, *::before, *::after { transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease !important; }";
    document.head.appendChild(style);
    const bg = dark ? COLORS_DARK.bg : COLORS_LIGHT.bg;
    document.documentElement.style.setProperty("--app-bg", bg);
    const themeColorMeta = document.querySelector("meta[name='theme-color']");
    if (themeColorMeta) themeColorMeta.setAttribute("content", bg);
    Object.assign(COLORS, dark ? COLORS_DARK : COLORS_LIGHT);
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch {}
    setIsDark(dark);
    setTimeout(() => { const el = document.getElementById("__theme_tr__"); if (el) el.remove(); }, 400);
  };

  const [records, setRecords] = useState(loadRecords);
  const [agreed, setAgreedState] = useState(hasAgreed);
  const [onboarded, setOnboardedState] = useState(hasOnboarded);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [onboardSlide, setOnboardSlide] = useState(0);
  const [themeSelected, setThemeSelectedState] = useState(hasThemeSelected);
  const [cookieNoticed, setCookieNoticed] = useState(() => { try { return localStorage.getItem("stride_cookie_noticed") === "true"; } catch { return false; } });

  const [newSituation, setNewSituation] = useState("");
  const [newYear, setNewYear] = useState(t.year);
  const [newMonth, setNewMonth] = useState(t.month);
  const [newDay, setNewDay] = useState(t.day);

  const [cbtId, setCbtId] = useState(null);
  const [cbtStep, setCbtStep] = useState(0);
  const [cbtDraft, setCbtDraft] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [cbtMode, setCbtMode] = useState("7");
  const [selectedThought, setSelectedThought] = useState("");
  const [pendingThought, setPendingThought] = useState(null);

  const [psId, setPsId] = useState(null);
  const [psStep, setPsStep] = useState(0);
  const [psDraft, setPsDraft] = useState({});
  const [psSolutionItems, setPsSolutionItems] = useState([{ id: Date.now(), text: "" }]);
  const [psSolutionInput, setPsSolutionInput] = useState("");
  const [psBreakdownItems, setPsBreakdownItems] = useState([{ id: Date.now(), text: "" }]);
  const [psReviewId, setPsReviewId] = useState(null);
  const [psReviewDraft, setPsReviewDraft] = useState({ result: "", insight: "" });

  const [newCategory, setNewCategory] = useState(null);
  const [newIntensity, setNewIntensity] = useState(null);
  const [newFirstThought, setNewFirstThought] = useState("");

  const [copingReviewId, setCopingReviewId] = useState(null);
  const [copingReviewResult, setCopingReviewResult] = useState(null);
  const [copingPracticeId, setCopingPracticeId] = useState(null);
  const [copingPracticeResult, setCopingPracticeResult] = useState(null);
  const [copingDetailId, setCopingDetailId] = useState(null);

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
  const [checkinEditDate, setCheckinEditDate] = useState(null);
  const [checkinEditDraft, setCheckinEditDraft] = useState({ mood: 5, condition: null, sleep: null, memo: "" });

  const [copings, setCopings] = useState(loadCopings);
  const [copingSort, setCopingSort] = useState("difficulty");
  const [copingSortDir, setCopingSortDir] = useState("asc");
  const [copingEditId, setCopingEditId] = useState(null);
  const [copingEditText, setCopingEditText] = useState("");
  const [copingEditDifficulty, setCopingEditDifficulty] = useState(null);
  const [copingEditEffect, setCopingEditEffect] = useState(null);
  const [newCoping, setNewCoping] = useState({ text: "", difficulty: null, effect: null });
  const [copingDeleteId, setCopingDeleteId] = useState(null);

  const [crisisPlan, setCrisisPlan] = useState(loadCrisisPlan);
  const [crisisModal, setCrisisModal] = useState(null);
  const [crisisTab, setCrisisTab] = useState("safe");
  const [showCopingGuide, setShowCopingGuide] = useState(false);
  const [showCrisisGuide, setShowCrisisGuide] = useState(false);
  const [copingGuidePrompt, setCopingGuidePrompt] = useState(false);
  const [crisisGuidePrompt, setCrisisGuidePrompt] = useState(false);

  const [graphType, setGraphType] = useState("line"); // "line" | "bar"
  const [graphPeriod, setGraphPeriod] = useState(14); // 14 | 30
  const [graphMetric, setGraphMetric] = useState("mood"); // "mood" | "condition" | "sleep"
  const [historyTab, setHistoryTab] = useState("graph"); // "graph" | "report" | "list"
  const [checkinListCount, setCheckinListCount] = useState(14);
  const [reportWeekOffset, setReportWeekOffset] = useState(0);

  const [achievements, setAchievements] = useState(loadAchievements);
  const [achievementText, setAchievementText] = useState("");
  const [achievementTab, setAchievementTab] = useState("log");
  const [achievementDeleteId, setAchievementDeleteId] = useState(null);
  const [selectedAchievementDate, setSelectedAchievementDate] = useState(null);

  const [medicalLogPersonId, setMedicalLogPersonId] = useState(null);
  const [medicalLogDetailId, setMedicalLogDetailId] = useState(null);
  const [medicalLogEditDraft, setMedicalLogEditDraft] = useState({ date: "", content: "", reply: "" });

  const [memos, setMemos] = useState(loadMemo);
  const [memoView, setMemoView] = useState("list");
  const [memoDraft, setMemoDraft] = useState({ date: toDateStr(t.year, t.month, t.day), title: "", body: "" });
  const [memoDetailId, setMemoDetailId] = useState(null);
  const [memoEditing, setMemoEditing] = useState(false);
  const [memoEditDraft, setMemoEditDraft] = useState({});

  const [tellPeople, setTellPeople] = useState(loadTellPeople);
  const [tellMemos, setTellMemos] = useState(loadTellMemos);
  const [tellTab, setTellTab] = useState("pending");
  const [tellDetailId, setTellDetailId] = useState(null);
  const [tellNewContent, setTellNewContent] = useState("");
  const [tellNewPersonIds, setTellNewPersonIds] = useState([]);
  const [tellNewPersonName, setTellNewPersonName] = useState("");
  const [tellNewPersonType, setTellNewPersonType] = useState("主治医");
  const [tellMemoDeleteId, setTellMemoDeleteId] = useState(null);
  const [tellPersonDeleteId, setTellPersonDeleteId] = useState(null);
  const [tellEditId, setTellEditId] = useState(null);
  const [tellEditContent, setTellEditContent] = useState("");
  const [tellEditPersonIds, setTellEditPersonIds] = useState([]);
  const [tellPersonEditId, setTellPersonEditId] = useState(null);
  const [tellPersonEditName, setTellPersonEditName] = useState("");
  const [tellPersonEditType, setTellPersonEditType] = useState("主治医");

  const [bridgeSettings, setBridgeSettings] = useState(loadBridgeSettings);
  const [bridgeMemos, setBridgeMemos] = useState(loadBridgeMemos);
  const [bridgeMemoInput, setBridgeMemoInput] = useState("");
  const [bridgePersonId, setBridgePersonId] = useState(null);
  const [bridgeSessionMemoIds, setBridgeSessionMemoIds] = useState(new Set());
  const [bridgeMemoSelectDialog, setBridgeMemoSelectDialog] = useState(null);

  const initBridgeSession = (personId) => {
    setBridgePersonId(personId);
    setBridgeMemoInput("");
    setBridgeSessionMemoIds(new Set(tellMemos.filter(m => m.personIds.includes(personId) && !m.completed).map(m => m.id)));
    setView("bridge");
  };

  const dndSensors = useSensors(useSensor(PointerSensor));

  const [visibleCount, setVisibleCount] = useState(10);
  const [recordSort, setRecordSort] = useState("newest");

  const [mfMinutes, setMfMinutes] = useState(5);
  const [mfRunning, setMfRunning] = useState(false);
  const [mfRemaining, setMfRemaining] = useState(null);
  const [mfTimerRef, setMfTimerRef] = useState(null);
  const [mfInfoOpen, setMfInfoOpen] = useState(false);

  const [guideOpenIndex, setGuideOpenIndex] = useState(null);
  const [helpModal, setHelpModal] = useState(null);
  useEffect(() => {
    if (helpModal) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [helpModal]);
  const [copingSelectId, setCopingSelectId] = useState(null);
  const [copingConfirm, setCopingConfirm] = useState(null); // { type, editId, text, text2 }

  const [pwaPrompted, setPwaPromptedState] = useState(hasPwaPrompted);
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const isPwa = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIosChrome = isIos && /CriOS/i.test(navigator.userAgent);

  useEffect(() => {
    const splash = document.getElementById("splash-screen");
    if (splash) {
      splash.classList.add("splash-hide");
      setTimeout(() => splash.remove(), 400);
    }
  }, []);

  useEffect(() => {
    if (view !== "home") {
      window.history.pushState({ view }, "", "");
    }
  }, [view]);

  useEffect(() => {
    const onPopState = (e) => {
      if (view === "home") {
        return;
      }
      e.preventDefault();
      if (view === "newCoping") { setView("coping"); }
      else if (view === "checkin" || view === "checkinHistory") { setView("home"); setActiveTab("home"); }
      else if (view === "settings" || view === "guide" || view === "support") { setView("home"); setActiveTab("home"); }
      else if (view === "list") { setView("records"); setActiveTab("records"); }
      else if (view === "achievement") { setView("records"); setActiveTab("records"); }
      else if (view === "medicalLog") { setView("medicalTab"); setActiveTab("medical"); }
      else if (view === "bridgePerson") { setView("medicalTab"); setActiveTab("medical"); }
      else if (view === "bridge") { setBridgePersonId(null); setView("medicalTab"); setActiveTab("medical"); }
      else if (view === "bridgeSettings") { if (bridgePersonId) { setView("bridge"); } else { setView("medicalTab"); setActiveTab("medical"); } }
      else if (view === "memo") { setView("records"); setActiveTab("records"); }
      else if (view === "tellMemos") { setView("medicalTab"); setActiveTab("medical"); }
      else if (view === "tellMemoNew" || view === "tellMemoDetail" || view === "tellMemoEdit") { setView("tellMemos"); }
      else if (view === "copingDetail") { setCopingDetailId(null); setView("coping"); }
      else if (view === "coping" || view === "crisis") { setView("tools"); setActiveTab("tools"); }
      else if (view === "mindfulness") { if (mfTimerRef) { clearInterval(mfTimerRef); setMfRunning(false); setMfRemaining(null); } setView("tools"); setActiveTab("tools"); }
      else if (view === "new") { setView("list"); }
      else if (view === "detail") { setView("list"); setEditing(false); }
      else if (view === "copingSelect") { setView("approach"); }
      else if (view === "cbtSelect") { setView("approach"); }
      else if (view === "cbt") { setView("cbtSelect"); }
      else if (view === "ps") { setView("approach"); }
      else if (view === "records") { setView("home"); setActiveTab("home"); }
      else if (view === "tools") { setView("home"); setActiveTab("home"); }
      else if (view === "medicalTab") { setView("home"); setActiveTab("home"); }
      else if (view === "medicalLogEdit") { setView("medicalLog"); }
      else if (view === "checkinEdit") { setView("checkinHistory"); }
      else { setView("home"); setActiveTab("home"); }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [view]);

  useEffect(() => { saveRecords(records); }, [records]);
  useEffect(() => { saveCheckins(checkins); }, [checkins]);
  useEffect(() => { saveCopings(copings); }, [copings]);
  useEffect(() => { saveAchievements(achievements); }, [achievements]);
  useEffect(() => { saveCrisisPlan(crisisPlan); }, [crisisPlan]);
  useEffect(() => { saveMemo(memos); }, [memos]);
  useEffect(() => { saveTellPeople(tellPeople); }, [tellPeople]);
  useEffect(() => { saveTellMemos(tellMemos); }, [tellMemos]);
  useEffect(() => { saveBridgeSettings(bridgeSettings); }, [bridgeSettings]);
  useEffect(() => { saveBridgeMemos(bridgeMemos); }, [bridgeMemos]);
  useEffect(() => { if (showPrivacy) { window.scrollTo(0, 0); requestAnimationFrame(() => window.scrollTo(0, 0)); } }, [showPrivacy]);

  useEffect(() => {
    if (view !== "mindfulness" && mfRunning) {
      if (mfTimerRef) clearInterval(mfTimerRef);
      try {
        if (window._mfGain) window._mfGain.gain.exponentialRampToValueAtTime(0.001, window._mfAudioCtx.currentTime + 0.5);
        setTimeout(() => { try { window._mfSource?.stop(); window._mfAudioCtx?.close(); } catch(e) {} }, 600);
      } catch(e) {}
      setMfRunning(false);
      setMfRemaining(null);
    }
  }, [view]);

  const printHtml = (html) => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;

    // 印刷ボタンをHTML内に埋め込む（同フレーム内のユーザー操作でprint()を呼ぶことで自動印刷ブロックを回避）
    const printBar = '<div class="__pb" style="position:sticky;top:0;background:#f8f9fa;padding:10px 16px;border-bottom:1px solid #dee2e6;display:flex;align-items:center;justify-content:space-between;">'
      + '<span style="font-size:13px;color:#555;font-family:sans-serif;">印刷プレビュー</span>'
      + '<button onclick="window.print()" style="background:#111;color:#fff;border:none;padding:8px 20px;border-radius:20px;font-size:13px;cursor:pointer;font-family:sans-serif;">🖨️ 印刷・PDF保存</button>'
      + '</div>'
      + '<style>@media print{.__pb{display:none!important}}</style>';
    const htmlWithBar = html.replace('<body>', '<body>' + printBar);

    if (!isPWA) {
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(htmlWithBar);
      w.document.close();
      w.focus();
      return;
    }

    // PWA: overlay + iframe でアプリ画面を保持したまま印刷プレビューを表示
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#fff;display:flex;flex-direction:column;';

    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;justify-content:flex-end;padding:10px 14px;padding-top:max(30px,env(safe-area-inset-top));border-bottom:1px solid #e5e7eb;flex-shrink:0;background:#fff;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '← 戻る';
    closeBtn.style.cssText = 'background:none;border:1px solid #d1d5db;color:#374151;padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;font-family:sans-serif;';

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'flex:1;border:none;width:100%;';

    const remove = () => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
    closeBtn.onclick = remove;

    bar.appendChild(closeBtn);
    overlay.appendChild(bar);
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    iframe.contentDocument.open();
    iframe.contentDocument.write(htmlWithBar);
    iframe.contentDocument.close();

    if (iframe.contentWindow) iframe.contentWindow.onafterprint = remove;
  };

  const handleCrisisPrint = () => {
    const today = `${t.year}年${parseInt(t.month)}月${parseInt(t.day)}日`;
    const li = (items) => items.length > 0
      ? items.map(item => '<li>' + item.text + (item.text2 ? '　→ ' + item.text2 : '') + '</li>').join('')
      : '<li class="empty">未記入</li>';
    const html = '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>クライシスプラン</title><style>'
      + 'body{font-family:\'Hiragino Kaku Gothic ProN\',\'Noto Sans JP\',sans-serif;background:#fff;color:#111;padding:32px;max-width:600px;margin:0 auto;}'
      + 'h1{font-size:22px;font-weight:700;margin:0 0 4px;}'
      + '.meta{font-size:12px;color:#888;margin-bottom:28px;}'
      + 'h2{font-size:14px;font-weight:700;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #ddd;}'
      + 'ul{list-style:none;padding:0;margin:0;}'
      + 'li{font-size:13px;line-height:1.9;}'
      + 'li::before{content:"・";}'
      + '.empty{color:#999;}.safe{color:#0ea5e9;}.caution{color:#d97706;}.crisis{color:#ef4444;}'
      + '</style></head><body>'
      + '<h1>クライシスプラン</h1>'
      + '<div class="meta">出力日：' + today + '</div>'
      + '<h2 class="safe">Safe — 安定しているときの状態</h2><ul>' + li(crisisPlan.safe) + '</ul>'
      + '<h2 class="caution">Caution — トリガー</h2><ul>' + li(crisisPlan.caution_triggers) + '</ul>'
      + '<h2 class="caution">Caution — 注意サイン</h2><ul>' + li(crisisPlan.caution_signs) + '</ul>'
      + '<h2 class="crisis">Crisis — 危機のサイン</h2><ul>' + li(crisisPlan.crisis_signs) + '</ul>'
      + '<h2 class="crisis">Crisis — 対処法・連絡先</h2><ul>' + li(crisisPlan.crisis_contacts) + '</ul>'
      + '</body></html>';
    printHtml(html);
  };

  const handleCopingPrint = () => {
    const today = `${t.year}年${parseInt(t.month)}月${parseInt(t.day)}日`;
    const rows = sortedCopings.map(c =>
      '<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;line-height:1.7;">' + c.text + '</td>'
      + '<td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center;">' + c.difficulty + ' / 5</td>'
      + '<td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center;">' + c.effect + ' / 5</td></tr>'
    ).join('');
    const html = '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>コーピングリスト</title><style>'
      + 'body{font-family:\'Hiragino Kaku Gothic ProN\',\'Noto Sans JP\',sans-serif;background:#fff;color:#111;padding:32px;max-width:600px;margin:0 auto;}'
      + 'h1{font-size:22px;font-weight:700;margin:0 0 4px;}'
      + '.meta{font-size:12px;color:#888;margin-bottom:28px;}'
      + 'table{width:100%;border-collapse:collapse;}'
      + 'th{font-size:12px;font-weight:700;color:#555;padding:8px 12px;border-bottom:2px solid #ddd;text-align:left;}'
      + 'th.center{text-align:center;}'
      + '</style></head><body>'
      + '<h1>コーピングリスト</h1>'
      + '<div class="meta">出力日：' + today + '　登録数：' + copings.length + '件</div>'
      + (copings.length > 0
        ? '<table><thead><tr><th>コーピング</th><th class="center">難易度</th><th class="center">効果</th></tr></thead><tbody>' + rows + '</tbody></table>'
        : '<p style="color:#999;font-size:13px;">コーピングが登録されていません</p>')
      + '</body></html>';
    printHtml(html);
  };

  const handleDetailPrint = (record) => {
    const today = `${t.year}年${parseInt(t.month)}月${parseInt(t.day)}日`;
    let body = '<h1>ストレス記録</h1>'
      + '<div class="meta">出力日：' + today + '</div>'
      + '<div class="date">' + formatDate(record.date) + '</div>'
      + '<div class="situation">' + record.situation + '</div>';
    const tags = [];
    if (record.category) tags.push(record.category);
    if (record.intensity) tags.push(record.intensity);
    if (tags.length > 0) body += '<div class="tags">' + tags.join('　') + '</div>';
    if (record.firstThought) body += '<div class="thought">「' + record.firstThought + '」</div>';
    if (record.coping) {
      body += '<h2 style="color:#b8860b;">コーピングの記録</h2><div class="box">' + record.coping + '</div>';
      if (record.copingReview) body += '<div class="sub">効果：' + record.copingReview + '</div>';
    }
    if (record.cbt && Object.keys(record.cbt).length > 0) {
      body += '<h2 style="color:#0ea5e9;">認知再構成の記録</h2>';
      [...CBT3_STEPS, ...CBT_STEPS].forEach(step => {
        if (record.cbt[step.id]) {
          body += '<div class="label">' + step.label + '</div><div class="box">' + record.cbt[step.id].replace(/\n/g, '<br>') + '</div>';
        }
      });
    }
    if (record.ps && Object.keys(record.ps).length > 0) {
      body += '<h2 style="color:#818cf8;">問題解決技法の記録</h2>';
      PS_STEPS.forEach(step => {
        if (record.ps[step.id]) {
          body += '<div class="label">' + step.label + '</div><div class="box">' + record.ps[step.id].replace(/\n/g, '<br>') + '</div>';
        }
      });
      if (record.ps.review) {
        if (record.ps.review.result) body += '<div class="label">試してみた結果</div><div class="box">' + record.ps.review.result + '</div>';
        if (record.ps.review.insight) body += '<div class="label">気づいたこと</div><div class="box">' + record.ps.review.insight + '</div>';
      }
    }
    const html = '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>ストレス記録</title><style>'
      + 'body{font-family:\'Hiragino Kaku Gothic ProN\',\'Noto Sans JP\',sans-serif;background:#fff;color:#111;padding:32px;max-width:600px;margin:0 auto;}'
      + 'h1{font-size:22px;font-weight:700;margin:0 0 4px;}'
      + '.meta{font-size:12px;color:#888;margin-bottom:28px;}'
      + '.date{font-size:12px;color:#888;margin-bottom:6px;}'
      + '.situation{font-size:16px;font-weight:600;line-height:1.6;margin-bottom:12px;}'
      + '.tags{font-size:13px;color:#555;margin-bottom:8px;}'
      + '.thought{font-size:13px;color:#888;font-style:italic;margin-bottom:20px;}'
      + 'h2{font-size:14px;font-weight:700;margin:24px 0 8px;padding-bottom:4px;border-bottom:1px solid #ddd;}'
      + '.label{font-size:11px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin:12px 0 4px;}'
      + '.box{font-size:13px;line-height:1.9;padding:10px 14px;background:#f9f9f9;border-radius:8px;margin-bottom:8px;}'
      + '.sub{font-size:13px;color:#b8860b;margin-top:4px;}'
      + '</style></head><body>' + body + '</body></html>';
    printHtml(html);
  };

  const sortedCopings = [...copings].sort((a, b) => {
    const valA = copingSort === "difficulty" ? a.difficulty : a.effect;
    const valB = copingSort === "difficulty" ? b.difficulty : b.effect;
    return copingSortDir === "asc" ? valA - valB : valB - valA;
  });

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
    const entry = { id: todayCheckin ? todayCheckin.id : Date.now(), date: toDateStr(t.year, t.month, t.day), ...checkinDraft };
    setCheckins([entry, ...checkins.filter((c) => c.date !== entry.date)]);
    setCheckinDraft({ mood: 5, condition: null, sleep: null, memo: "" });
    setView("home");
    setActiveTab("home");
  };

  const selectedDetail = records.find((r) => r.id === detailId);
  const cbtRecord = records.find((r) => r.id === cbtId);

  const saveNew = () => {
    if (!newSituation.trim()) return;
    setRecords([{ id: Date.now(), date: toDateStr(newYear, newMonth, newDay), situation: newSituation, category: newCategory, intensity: newIntensity, firstThought: newFirstThought.trim() || null, completed: false, cbt: {} }, ...records]);
    setNewSituation("");
    setNewCategory(null);
    setNewIntensity(null);
    setNewFirstThought("");
    const t2 = todayStr();
    setNewYear(t2.year); setNewMonth(t2.month); setNewDay(t2.day);
    setVisibleCount(10);
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
    setView("cbtSelect");
  };

  const startCBT3 = () => {
    setCbtMode("3");
    setCbtStep(0);
    setShowHint(false);
    setSelectedThought("");
    setPendingThought(null);
    setView("cbt");
  };

  const startCBT7 = () => {
    setCbtMode("7");
    setCbtStep(0);
    setShowHint(false);
    setSelectedThought("");
    setPendingThought(null);
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
    const ps = rec.ps || {};
    setPsDraft(ps);
    const breakdownLines = (ps.breakdown || "").split("\n").filter(l => l.trim());
    setPsBreakdownItems(breakdownLines.length > 0 ? breakdownLines.map((t, i) => ({ id: i, text: t })) : [{ id: Date.now(), text: "" }]);
    setPsStep(0);
    setShowHint(false);
    setView("ps");
  };

  const finishPS = () => {
    setRecords(records.map((r) => r.id === psId ? { ...r, ps: { ...psDraft, status: "planned" } } : r));
    setView("list");
  };

  const savePSDraft = () => {
    setRecords(records.map((r) => r.id === psId ? { ...r, completed: false, ps: psDraft } : r));
    setView("list");
  };

  const startPsReview = (id) => {
    const rec = records.find((r) => r.id === id);
    setPsReviewId(id);
    setPsReviewDraft({ result: rec.ps?.review?.result || "", insight: rec.ps?.review?.insight || "" });
    setView("psReview");
  };

  const savePsReview = () => {
    setRecords(prev => prev.map(r => r.id === psReviewId ? { ...r, completed: true, ps: { ...r.ps, status: "done", review: psReviewDraft } } : r));
    setView("list");
  };

  const startApproach = (id) => {
    setDetailId(id);
    setView("approach");
  };

  const startCopingSelect = (id) => {
    setCopingSelectId(id);
    setView("copingSelect");
  };

  const confirmCoping = (coping) => {
    setRecords(records.map((r) => r.id === copingSelectId ? { ...r, coping, copingStatus: "pending" } : r));
    setCopingConfirm(null);
    setView("list");
  };

  const startCopingReview = (id) => {
    setCopingReviewId(id);
    setCopingReviewResult(null);
    setView("copingReview");
  };

  const saveCopingReview = () => {
    if (!copingReviewResult) return;
    setRecords(prev => prev.map(r => r.id === copingReviewId ? { ...r, completed: true, copingStatus: "done", copingReview: copingReviewResult } : r));
    setView("list");
  };

  const startPractice = (copingId) => {
    setCopings(prev => prev.map(c => c.id === copingId
      ? { ...c, pendingPractice: { id: Date.now(), date: toDateStr(t.year, t.month, t.day) } }
      : c));
  };

  const saveCopingPractice = (copingId, result) => {
    setCopings(prev => prev.map(c => {
      if (c.id !== copingId) return c;
      const pending = c.pendingPractice;
      return { ...c, practices: [...(c.practices || []), { id: pending?.id || Date.now(), date: pending?.date || toDateStr(t.year, t.month, t.day), result }], pendingPractice: null };
    }));
    setCopingPracticeId(null);
    setCopingPracticeResult(null);
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

  const saveTellMemo = () => {
    if (!tellNewContent.trim() || tellNewPersonIds.length === 0) return;
    setTellMemos([{ id: Date.now(), date: toDateStr(t.year, t.month, t.day), content: tellNewContent, personIds: [...tellNewPersonIds], checks: {}, completed: false }, ...tellMemos]);
    setTellNewContent("");
    setTellNewPersonIds([]);
    setView("tellMemos");
  };

  const addTellPerson = () => {
    if (!tellNewPersonName.trim()) return;
    setTellPeople([...tellPeople, { id: Date.now(), name: tellNewPersonName, type: tellNewPersonType }]);
    setTellNewPersonName("");
    setTellNewPersonType("主治医");
  };

  const toggleTellCheck = (memoId, personId) => {
    setTellMemos(prev => prev.map(m => {
      if (m.id !== memoId) return m;
      const cur = m.checks[personId] || { checked: false, reply: "" };
      const newChecks = { ...m.checks, [personId]: { ...cur, checked: !cur.checked } };
      const allChecked = m.personIds.length > 0 && m.personIds.every(pid => newChecks[pid]?.checked);
      return { ...m, checks: newChecks, completed: m.completed || allChecked };
    }));
  };

  const updateTellReply = (memoId, personId, reply) => {
    setTellMemos(prev => prev.map(m => {
      if (m.id !== memoId) return m;
      return { ...m, checks: { ...m.checks, [personId]: { ...m.checks[personId], reply } } };
    }));
  };

  const completeTellMemo = (memoId) => {
    setTellMemos(prev => prev.map(m => m.id === memoId ? { ...m, completed: true } : m));
    setView("tellMemos");
    setTellTab("done");
  };

  const psRecord = records.find((r) => r.id === psId);

  if (showPrivacy) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Noto Sans JP', sans-serif", maxWidth: 480, margin: "0 auto", boxSizing: "border-box" }}>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
        {/* ヘッダー */}
        <div style={{ position: "sticky", top: 0, background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, zIndex: 10 }}>
          <button onClick={() => setShowPrivacy(false)}
            style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", padding: 0, lineHeight: 1 }}>
            <IconArrowLeft size={20} />
          </button>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>プライバシーポリシー・免責事項</div>
        </div>
        {/* コンテンツ */}
        <div style={{ padding: "24px 20px 60px" }}>
          {/* プライバシーポリシー */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Privacy Policy</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>プライバシーポリシー</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 24 }}>Stride｜最終更新日：2026年6月</div>
            {[
              { title: "1. はじめに", body: "Stride（以下「本アプリ」）は、ユーザーのプライバシーを尊重し、個人情報の適切な取り扱いに努めます。" },
              { title: "2. 収集する情報", body: "■ユーザーが入力する情報\n・気分・体調・睡眠に関する記録\n・ストレスや出来事に関するメモ\n・認知再構成・問題解決技法・コーピングに関する記録\n・クライシスプランの内容\n・その他、アプリ内で入力したすべての情報\n\n■自動的に収集される情報\n本アプリはGoogle Analyticsを使用しています。アクセス状況（ページビュー数・滞在時間など）を収集・分析しています。Googleのプライバシーポリシーが適用されます。" },
              { title: "3. 情報の保存場所", body: "ユーザーが入力した情報は、ご利用のデバイスのブラウザ内（localStorage等）にのみ保存され、ユーザーの同意なく外部のサーバーに送信されることはありません。開発者を含む第三者が、ユーザーの記録内容を閲覧することはできません。\n\n※将来的に、AIによる分析機能（任意・有料）を追加する場合があります。この機能を利用する際は、分析のために入力データの一部が外部サーバーに送信されますが、これはご本人がこの機能を有効にし、明示的に同意した場合に限ります。同意しない限り、データが外部に送信されることはありません。\n\n※ブラウザのデータを削除した場合、記録は復元できません。エクスポート機能でのバックアップを推奨します。" },
              { title: "4. 情報の第三者提供", body: "本アプリは、ユーザーの情報を第三者に販売・提供・開示しません。ただし、以下の外部サービスを利用しています：\n\n・Googleフォーム（フィードバック収集）：入力情報はGoogleのサービスを通じて処理されます\n\n・Google Analytics（アクセス解析）：Googleのプライバシーポリシーが適用されます\n\n・Google Search Console（検索流入の分析）：検索エンジン経由のアクセス状況を把握するために使用します。Googleのプライバシーポリシーが適用されます\n\n・Tawk.to（チャットサポート）：チャット機能を使用した場合、送信内容・IPアドレス・ブラウザ情報等がTawk.toのサーバーに送信・保存されます。Tawk.toのプライバシーポリシーが適用されます\n\n・（将来）AI分析機能：本機能を有効にした場合に限り、分析処理のために外部のAIサービスへ入力データの一部が送信されます。本機能はオプトイン（任意）であり、有効にしない限りデータが送信されることはありません" },
              { title: "5. Cookie・ローカルストレージについて", body: "アプリの機能提供のためにlocalStorageを使用します。広告目的では使用しません。\n\n端末を他の方と共有している場合、ブラウザの開発者ツールから記録データが閲覧される可能性があります。共有端末でのご利用はご注意ください。" },
              { title: "6. プライバシーポリシーの変更", body: "本ポリシーは必要に応じて更新されます。重要な変更はアプリ内でお知らせします。" },
              { title: "7. お問い合わせ", body: "アプリ内のフィードバックフォームよりご連絡ください。" },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8, whiteSpace: "pre-line" }}>{s.body}</div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: COLORS.border, marginBottom: 40 }} />

          {/* 免責事項 */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Disclaimer</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>免責事項</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 24 }}>Stride｜最終更新日：2026年6月</div>
            {[
              { title: "1. 医療行為ではありません", body: "本アプリは、セルフマネジメントおよび自己理解を支援するためのツールです。医療行為、診断、治療、またはその代替を目的としたものではありません。精神的・身体的な健康上の問題については、必ず専門家にご相談ください。" },
              { title: "2. 効果の保証はしません", body: "本アプリの利用によって、特定の効果・改善・結果が得られることを保証するものではありません。使用はユーザー自身の判断と責任において行ってください。" },
              { title: "3. 緊急時の対応", body: "自傷・自殺念慮など、緊急性のある状態にある場合は、直ちに以下の相談窓口または医療機関にご連絡ください。\n・いのちの電話：0120-783-556\n・よりそいホットライン：0120-279-338\n・救急：119 / 警察：110" },
              { title: "4. データの損失について", body: "データはブラウザ内に保存されます。ブラウザのデータ削除・端末の初期化・ブラウザの変更などによりデータが失われる場合があります。定期的なエクスポートを推奨します。開発者はデータ損失に関して責任を負いません。" },
              { title: "5. サービスの変更・終了", body: "予告なくサービス内容の変更・停止・終了をする場合があります。これによってユーザーに生じた損害について、開発者は責任を負いません。" },
              { title: "6. 免責事項の変更", body: "本免責事項は必要に応じて更新されます。最新の内容は本ページでご確認ください。" },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8, whiteSpace: "pre-line" }}>{s.body}</div>
              </div>
            ))}
          </div>

          <button onClick={() => setShowPrivacy(false)}
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 14, padding: 14, cursor: "pointer" }}>
            ← 戻る
          </button>
        </div>
      </div>
    );
  }

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
              入力したデータはお使いのブラウザ（端末）にのみ保存されます。サーバーへの送信や、運営者によるデータへのアクセスは一切ありません。ブラウザのデータ削除・機種変更・別ブラウザへの切り替えでデータは失われますのでご注意ください。<br /><br />
              またiPhoneでホーム画面に追加（PWA）した場合、ブラウザ版とホーム画面版でデータは別々に保存されます。どちらか一方で使い続けることをおすすめします。
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
          onClick={() => setShowPrivacy(true)}
          style={{ width: "100%", background: "none", border: "none", color: COLORS.textMuted, fontSize: 13, padding: "10px 0", cursor: "pointer", marginBottom: 8, textDecoration: "underline" }}>
          プライバシーポリシー・免責事項を確認する
        </button>
        <button
          onClick={() => { setAgreed(true); setAgreedState(true); }}
          style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, color: "#0f1117", fontSize: 15, fontWeight: 700, padding: 16, cursor: "pointer" }}>
          同意して次へ →
        </button>
      </div>
    );
  }

  if (agreed && !pwaPrompted && !isPwa && !showPwaGuide) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Noto Sans JP', sans-serif", maxWidth: 480, margin: "0 auto", padding: "40px 20px", boxSizing: "border-box" }}>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <div style={{ fontSize: 13, letterSpacing: 3, color: COLORS.accent, textTransform: "uppercase", fontWeight: 700, marginBottom: 24 }}>Stride</div>
        <div style={{ marginBottom: 16, textAlign: "center" }}><IconDeviceMobile size={48} color={COLORS.accent} /></div>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 12, textAlign: "center" }}>
          ホーム画面に追加して<br />使ってみよう！
        </div>
        <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8, textAlign: "center", marginBottom: 32 }}>
          ホーム画面に追加すると、アプリのように起動できます。データも端末に保存されます。
        </div>

        <div style={{ background: COLORS.surface, borderRadius: 16, padding: "20px 18px", border: `1px solid ${COLORS.border}`, marginBottom: 24 }}>
          {isIosChrome && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ marginBottom: 14 }}><IconDeviceMobile size={36} color={COLORS.accent} /></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Safariで開いてください</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>
                iPhoneをお使いの方はSafariで開くと<br />ホーム画面に追加できます。<br />
                <span style={{ fontSize: 12 }}>Chromeではホーム画面への追加に対応していません。</span>
              </div>
            </div>
          )}
          {isIos && !isIosChrome && (
            <>
              <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>iPhoneの場合</div>
              {[
                { step: "1", Icon: IconShare, text: "Safari下部の「共有」ボタンをタップ" },
                { step: "2", Icon: IconPlus, text: "「ホーム画面に追加」を選択" },
                { step: "3", Icon: IconCircleCheck, text: "「追加」をタップして完了" },
              ].map(({ step, Icon, text }) => (
                <div key={step} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.accentSoft, border: `1px solid ${COLORS.accent}`, color: COLORS.accent, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step}</div>
                  <div style={{ flexShrink: 0 }}><Icon size={22} color={COLORS.accent} /></div>
                  <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>{text}</div>
                </div>
              ))}
              <img src="/home.png" alt="ホーム画面への追加手順" style={{ width: "100%", borderRadius: 10, marginTop: 8, display: "block" }} />
            </>
          )}
          {isAndroid && (
            <>
              <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>Androidの場合</div>
              {[
                { step: "1", Icon: IconDotsVertical, text: "ブラウザ右上のメニュー（⋮）をタップ" },
                { step: "2", Icon: IconPlus, text: "「ホーム画面に追加」を選択" },
                { step: "3", Icon: IconCircleCheck, text: "「追加」をタップして完了" },
              ].map(({ step, Icon, text }) => (
                <div key={step} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.accentSoft, border: `1px solid ${COLORS.accent}`, color: COLORS.accent, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step}</div>
                  <div style={{ flexShrink: 0 }}><Icon size={22} color={COLORS.accent} /></div>
                  <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>{text}</div>
                </div>
              ))}
            </>
          )}
          {!isIos && !isAndroid && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ marginBottom: 12 }}><IconDeviceDesktop size={32} color={COLORS.accent} /></div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>
                スマートフォンのブラウザで開くと<br />ホーム画面に追加できます。
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowPwaGuide(true)}
          style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, color: "#0f1117", fontSize: 15, fontWeight: 700, padding: 16, cursor: "pointer", marginBottom: 12 }}>
          ホーム画面に追加した！→
        </button>
        <button
          onClick={() => { setPwaPrompted(); setPwaPromptedState(true); }}
          style={{ width: "100%", background: "none", border: "none", color: COLORS.textMuted, fontSize: 13, padding: "10px", cursor: "pointer" }}>
          あとで追加する
        </button>
      </div>
    );
  }

  if (agreed && showPwaGuide && !pwaPrompted && !isPwa) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Noto Sans JP', sans-serif", maxWidth: 480, margin: "0 auto", padding: "40px 20px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <div style={{ fontSize: 13, letterSpacing: 3, color: COLORS.accent, textTransform: "uppercase", fontWeight: 700, marginBottom: 32 }}>Stride</div>
        <div style={{ marginBottom: 20 }}><IconHome size={48} color={COLORS.accent} /></div>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 16, textAlign: "center", lineHeight: 1.6 }}>
          ホーム画面から<br />Strideを開いてください
        </div>
        <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.9, textAlign: "center", marginBottom: 40, maxWidth: 320 }}>
          ホーム画面に追加された<br />
          <span style={{ color: COLORS.accent, fontWeight: 700 }}>Strideのアイコン</span>をタップして<br />
          アプリを開き直してください。
        </div>
        <div style={{ background: COLORS.surface, borderRadius: 16, padding: "20px 24px", border: `1px solid ${COLORS.border}`, marginBottom: 40, width: "100%", maxWidth: 340 }}>
          <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>なぜ開き直すの？</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>
            ブラウザ版とホーム画面版ではデータが別々に保存されます。最初からホーム画面版をお使いいただくことで、データの混乱を防げます。
          </div>
        </div>
        <button
          onClick={() => { setPwaPrompted(); setPwaPromptedState(true); }}
          style={{ width: "100%", maxWidth: 340, background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 13, padding: 14, cursor: "pointer" }}>
          このままブラウザで続ける
        </button>
      </div>
    );
  }

  if (agreed && !onboarded) {
    const slide = ONBOARDING_SLIDES[onboardSlide];
    const isLast = onboardSlide === ONBOARDING_SLIDES.length - 1;
    return (
      <div style={{ height: "100dvh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Noto Sans JP', sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .slide { animation: fadeIn 0.2s ease-out; }`}</style>

        {/* プログレスドット */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", paddingTop: 48, flexShrink: 0 }}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <div key={i} style={{ width: i === onboardSlide ? 20 : 6, height: 6, borderRadius: 3, background: i === onboardSlide ? COLORS.accent : COLORS.border, transition: "all 0.3s" }} />
          ))}
        </div>

        {/* スライドコンテンツ */}
        <div key={onboardSlide} className="slide" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <div style={{ marginBottom: 20 }}><slide.Icon size={52} color={COLORS.accent} /></div>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 12, lineHeight: 1.4 }}>{slide.title}</div>
          <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.8, maxWidth: 300 }}>{slide.desc}</div>
        </div>

        {/* ボタン */}
        <div style={{ display: "flex", gap: 10, padding: "16px 24px 40px", flexShrink: 0 }}>
          {onboardSlide > 0 && (
            <button onClick={() => setOnboardSlide(onboardSlide - 1)}
              style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 14, padding: 14, cursor: "pointer" }}>
              ← 戻る
            </button>
          )}
          <button onClick={() => {
            if (isLast) { setOnboarded(true); setOnboardedState(true); }
            else setOnboardSlide(onboardSlide + 1);
          }} style={{ flex: 2, background: COLORS.accent, border: "none", borderRadius: 12, color: "#0f1117", fontSize: 15, fontWeight: 700, padding: 14, cursor: "pointer" }}>
            {isLast ? "はじめる 🎉" : "次へ →"}
          </button>
        </div>
      </div>
    );
  }

  if (agreed && onboarded && !themeSelected) {
    return (
      <div style={{ height: "100dvh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Noto Sans JP', sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .theme-select { animation: fadeIn 0.3s ease-out; }`}</style>

        <div className="theme-select" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: COLORS.accent, textTransform: "uppercase", fontWeight: 700, marginBottom: 24 }}>Stride</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 8, textAlign: "center", lineHeight: 1.4 }}>テーマを選んでください</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 36, textAlign: "center" }}>設定からいつでも変更できます</div>

          <div style={{ display: "flex", gap: 16, width: "100%", maxWidth: 320 }}>
            <button onClick={() => toggleTheme(false)}
              style={{ flex: 1, background: "#f5f7fa", border: `3px solid ${!isDark ? COLORS.accent : "#d1d5db"}`, borderRadius: 16, padding: "20px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transition: "border-color 0.25s" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#ffffff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1d27" }}>ライト</div>
              {!isDark && <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700 }}>選択中</div>}
            </button>

            <button onClick={() => toggleTheme(true)}
              style={{ flex: 1, background: "#0f1117", border: `3px solid ${isDark ? COLORS.accent : "#4b5563"}`, borderRadius: 16, padding: "20px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transition: "border-color 0.25s" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#1a1d27", border: "1px solid #2a2d37", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #818cf8, #6366f1)" }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e7eb" }}>ダーク</div>
              {isDark && <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700 }}>選択中</div>}
            </button>
          </div>
        </div>

        <div style={{ padding: "16px 24px 40px", flexShrink: 0 }}>
          <button onClick={() => { setThemeSelected(); setThemeSelectedState(true); }}
            style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, color: "#0f1117", fontSize: 15, fontWeight: 700, padding: 14, cursor: "pointer" }}>
            このテーマではじめる →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Noto Sans JP', sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 120 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page { animation: fadeIn 0.18s ease-out; }
        body { padding-bottom: env(safe-area-inset-bottom); }

      `}</style>

      {/* Header */}
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {view !== "home" && view !== "records" && view !== "tools" && view !== "medicalTab" && (
            <button onClick={() => {
              const goHome = () => { setView("home"); setActiveTab("home"); };
              if (view === "newCoping") { setView("coping"); }
              else if (view === "checkinEdit") { setView("checkinHistory"); }
              else if (view === "checkin" || view === "checkinHistory") { goHome(); }
              else if (view === "settings" || view === "guide" || view === "support") { goHome(); }
              else if (view === "list") { setView("records"); setActiveTab("records"); }
              else if (view === "achievement") { setView("records"); setActiveTab("records"); }
              else if (view === "medicalLog") { setView("medicalTab"); setActiveTab("medical"); }
              else if (view === "medicalLogEdit") { setView("medicalLog"); }
              else if (view === "bridgePerson") { setView("medicalTab"); setActiveTab("medical"); }
              else if (view === "bridge") { setBridgePersonId(null); setView("medicalTab"); setActiveTab("medical"); }
              else if (view === "bridgeSettings") { if (bridgePersonId) { setView("bridge"); } else { setView("medicalTab"); setActiveTab("medical"); } }
              else if (view === "memo") {
                if (memoView !== "list") { setMemoView("list"); setMemoEditing(false); return; }
                setView("records"); setActiveTab("records");
              }
              else if (view === "tellMemos") { setView("medicalTab"); setActiveTab("medical"); }
              else if (view === "tellMemoNew" || view === "tellMemoDetail" || view === "tellMemoEdit") { setView("tellMemos"); }
              else if (view === "copingDetail") { setCopingDetailId(null); setView("coping"); }
              else if (view === "coping" || view === "crisis") { setView("tools"); setActiveTab("tools"); }
              else if (view === "mindfulness") {
                if (mfTimerRef) { clearInterval(mfTimerRef); setMfRunning(false); setMfRemaining(null); }
                setView("tools"); setActiveTab("tools");
              }
              else if (view === "new") { setView("list"); }
              else if (view === "detail") { setView("list"); setEditing(false); }
              else if (view === "copingSelect") { setView("approach"); }
              else if (view === "cbtSelect") { setView("approach"); }
              else if (view === "cbt") { setView("cbtSelect"); }
              else if (view === "ps") { setView("approach"); }
              else { setView("list"); setEditing(false); }
            }} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 20, padding: 0, lineHeight: 1 }}><IconArrowLeft size={20} /></button>
          )}
          <div>
            <div style={{ fontSize: 13, letterSpacing: 3, color: COLORS.accent, textTransform: "uppercase", fontWeight: 700 }}>Stride</div>
            {view !== "home" && (
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, color: COLORS.text }}>
                {view === "tellMemos" && "伝えたいことメモ"}
                {view === "tellMemoNew" && "新しいメモを作成"}
                {view === "tellMemoDetail" && "メモの詳細"}
                {view === "records" && "記録"}
                {view === "tools" && "ツール"}
                {view === "medicalTab" && "診察"}
                {view === "list" && "ストレス記録"}
                {view === "new" && "出来事を記録"}
                {view === "checkin" && "今日のチェックイン"}
                {view === "checkinHistory" && "チェックイン履歴"}
                {view === "checkinEdit" && "チェックインを編集"}
                {view === "copingDetail" && "コーピングの詳細"}
                {view === "coping" && "コーピングリスト"}
                {view === "newCoping" && "コーピングを追加"}
                {view === "crisis" && "クライシスプラン"}
                {view === "guide" && "使い方ガイド"}
                {view === "support" && "サポート・フィードバック"}
                {view === "achievement" && "できたことログ"}
                {view === "mindfulness" && "マインドフルネス"}
                {view === "settings" && "設定"}
                {view === "medicalLog" && "診察等の記録"}
                {view === "medicalLogEdit" && "記録の編集"}
                {view === "bridgePerson" && "Bridge Session"}
                {view === "bridge" && "Bridge Session"}
                {view === "bridgeSettings" && "表示項目の設定"}
                {view === "tellMemoEdit" && "メモを編集"}
                {view === "memo" && (memoView === "list" ? "メモ" : memoView === "new" ? "新しいメモ" : memoEditing ? "編集" : "メモの詳細")}
                {view === "approach" && "アプローチを選ぶ"}
                {view === "cbtSelect" && "コラム法を選ぶ"}
                {view === "copingSelect" && "コーピングで対処する"}
                {view === "cbt" && "認知再構成"}
                {view === "ps" && "問題解決技法"}
                {view === "detail" && !editing && "記録の詳細"}
                {view === "detail" && editing && "編集"}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {view === "detail" && !editing && selectedDetail && (
            <button onClick={() => startEdit(selectedDetail)} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, fontSize: 13, fontWeight: 600, padding: "8px 14px", cursor: "pointer" }}>
              編集
            </button>
          )}
          {view === "home" && (
            <button onClick={() => setView("settings")}
              style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", padding: 4 }}>
              <IconSettings size={22} />
            </button>
          )}
          {view === "bridge" && (
            <button onClick={() => setView("bridgeSettings")}
              style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", padding: 4 }}>
              <IconSettings size={22} />
            </button>
          )}
          {["checkinHistory", "list", "cbt", "ps", "coping", "achievement", "mindfulness", "crisis", "tellMemos", "bridge", "medicalLog", "checkinEdit"].includes(view) && (
            <button onClick={() => setHelpModal(view)}
              style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", padding: 4 }}>
              <IconHelpCircle size={22} />
            </button>
          )}
        </div>
      </div>

      {/* HOME */}
      {view === "home" && (
        <div className="page" style={{ padding: "24px 16px 20px" }}>
          {/* PWAバナー */}
          {!isPwa && isIosChrome && (
            <div style={{ background: COLORS.surface, borderRadius: 12, padding: "10px 14px", marginBottom: 16, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <IconDeviceMobile size={16} color={COLORS.accent} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5 }}>iPhoneをお使いの方はSafariで開くとホーム画面に追加できます</div>
            </div>
          )}
          {!isPwa && !isIosChrome && (
            <div style={{ background: COLORS.surface, borderRadius: 12, padding: "10px 14px", marginBottom: 16, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>📱 ホーム画面に追加できるよ</div>
              <button onClick={() => { setPwaPromptedState(false); }}
                style={{ flexShrink: 0, background: COLORS.accentSoft, border: `1px solid ${COLORS.accent}`, borderRadius: 8, color: COLORS.accent, fontSize: 11, fontWeight: 700, padding: "6px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>
                追加方法を見る
              </button>
            </div>
          )}

          {/* フィードバックバナー */}
          {showFeedbackBanner && (
            <div style={{ background: COLORS.surface, borderRadius: 12, padding: "10px 14px", marginBottom: 16, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
              <div style={{ flex: 1, paddingRight: 20 }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>
                  この度はアプリを使っていただきありがとうございます！<br />よろしければ使ってみた感想や要望を教えてください！
                </div>
                <button
                  onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSexa5H2X037mrCEGrOwcRil-VWOlz3byyCVcQmJ3cAqMKIy9g/viewform?usp=publish-editor", "_blank")}
                  style={{ marginTop: 6, background: "none", border: "none", padding: 0, color: COLORS.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
                  フィードバックフォームを開く →
                </button>
              </div>
              <button
                onClick={() => { setFeedbackBannerDismissed(); setShowFeedbackBanner(false); }}
                style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: COLORS.textMuted, fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1, opacity: 0.6 }}>
                ×
              </button>
            </div>
          )}

          {/* ヒーローテキスト */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, lineHeight: 1.3, marginBottom: 4 }}>
              今日も、<span style={{ color: COLORS.accent }}>一歩ずつ。</span>
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>記録することで、自分のパターンが見えてくる</div>
          </div>

          {/* チェックインカード */}
          {todayCheckin ? (
            <div style={{ background: COLORS.surface, borderRadius: 16, padding: "16px 18px", marginBottom: 16, border: `1px solid ${COLORS.accent}30` }}>
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
                    {todayCheckin.sleep && <span>睡眠 {sleepLabel(todayCheckin.sleep)}</span>}
                  </div>
                  {todayCheckin.memo && <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 4 }}>"{todayCheckin.memo}"</div>}
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => { setCheckinDraft({ mood: 5, condition: null, sleep: null, memo: "" }); setView("checkin"); }}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.accent}50`, borderRadius: 16, color: COLORS.accent, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", marginBottom: 16, textAlign: "left" }}>
              <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4, opacity: 0.7 }}>Today's Check-in</div>
              今日のチェックインをする →
            </button>
          )}

          {/* 7日間気分グラフ */}
          {(() => {
            const last7 = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const ds = toDateStr(String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0"));
              const found = checkins.find(c => c.date === ds);
              return { label: `${d.getMonth() + 1}/${d.getDate()}`, mood: found?.mood ?? null };
            });
            const hasData = last7.some(d => d.mood !== null);
            const moodColor = (m) => m >= 7 ? COLORS.accent : m >= 4 ? "#e0a855" : COLORS.danger;
            return (
              <div style={{ background: COLORS.surface, borderRadius: 14, padding: "14px 16px", marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>過去7日間の気分</div>
                  <button onClick={() => setView("checkinHistory")}
                    style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 11, cursor: "pointer", padding: 0 }}>詳細 →</button>
                </div>
                {!hasData ? (
                  <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center", padding: "16px 0" }}>まだ記録がありません</div>
                ) : (
                  <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60 }}>
                    {last7.map((d, i) => {
                      const barH = d.mood !== null ? Math.max(4, (d.mood / 10) * 44) : 4;
                      const color = d.mood !== null ? moodColor(d.mood) : COLORS.border;
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          {d.mood !== null && <div style={{ fontSize: 9, color: color, fontWeight: 700 }}>{d.mood}</div>}
                          <div style={{ width: "100%", height: barH, borderRadius: 3, background: color, opacity: d.mood !== null ? 1 : 0.25 }} />
                          <div style={{ fontSize: 8, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{d.label}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ガイド・サポート */}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("guide")}
              style={{ flex: 1, background: `linear-gradient(135deg, ${COLORS.accent}15, ${COLORS.accent}05)`, border: `1px solid ${COLORS.accent}40`, borderRadius: 14, color: COLORS.text, fontSize: 13, fontWeight: 700, padding: "14px 12px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IconNotes size={18} color={COLORS.accent} />
                <span>使い方ガイド</span>
              </div>
            </button>
            <button onClick={() => setView("support")}
              style={{ flex: 1, background: `linear-gradient(135deg, ${COLORS.accent}15, ${COLORS.accent}05)`, border: `1px solid ${COLORS.accent}40`, borderRadius: 14, color: COLORS.text, fontSize: 13, fontWeight: 700, padding: "14px 12px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IconMessage size={18} color={COLORS.accent} />
                <span>フィードバック</span>
              </div>
            </button>
          </div>

          {/* お知らせ */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <IconBell size={16} color={COLORS.textMuted} />
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>お知らせ</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ANNOUNCEMENTS.map((a, i) => (
                <div key={i} style={{ background: COLORS.surface, borderRadius: 10, padding: "10px 14px", border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{a.date}</div>
                  <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>{a.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RECORDS TAB */}
      {view === "records" && (
        <div className="page" style={{ padding: "24px 16px" }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20, lineHeight: 1.6 }}>記録と振り返りのツールが集まっています</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setView("list")}
              style={{ width: "100%", background: `linear-gradient(135deg, ${COLORS.accent}15, ${COLORS.accent}05)`, border: `1px solid ${COLORS.accent}40`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconPencil size={22} color={COLORS.accent} />
                <div>
                  <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Stress Log</div>
                  ストレス記録
                  <div style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted, marginTop: 3 }}>記録の一覧・認知再構成・問題解決技法</div>
                </div>
              </div>
            </button>
            <button onClick={() => setView("achievement")}
              style={{ width: "100%", background: `linear-gradient(135deg, #e0a85515, #e0a85505)`, border: `1px solid #e0a85540`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconStar size={22} color="#e0a855" />
                <div>
                  <div style={{ fontSize: 11, color: "#e0a855", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Achievement</div>
                  できたことログ
                  <div style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted, marginTop: 3 }}>小さな前進を積み重ねる</div>
                </div>
              </div>
            </button>
            <button onClick={() => { setMemoView("list"); setView("memo"); }}
              style={{ width: "100%", background: `linear-gradient(135deg, #6b728015, #6b728005)`, border: `1px solid #6b728040`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconNotes size={22} color="#9ca3af" />
                <div>
                  <div style={{ fontSize: 11, color: "#9ca3af", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Memo</div>
                  メモ
                  <div style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted, marginTop: 3 }}>日付＋タイトル＋本文を自由に記録</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* TOOLS TAB */}
      {view === "tools" && (
        <div className="page" style={{ padding: "24px 16px" }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20, lineHeight: 1.6 }}>気持ちの安定と再発防止を支えるツールです</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setView("coping")}
              style={{ width: "100%", background: `linear-gradient(135deg, #818cf815, #818cf805)`, border: `1px solid #818cf840`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconListCheck size={22} color="#818cf8" />
                <div>
                  <div style={{ fontSize: 11, color: "#818cf8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Coping</div>
                  コーピングリスト
                  <div style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted, marginTop: 3 }}>自分だけの対処法を管理する</div>
                </div>
              </div>
            </button>
            <button onClick={() => { setMfRunning(false); setMfRemaining(null); setMfMinutes(5); setView("mindfulness"); }}
              style={{ width: "100%", background: `linear-gradient(135deg, #818cf815, #818cf805)`, border: `1px solid #818cf840`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconLeaf size={22} color="#818cf8" />
                <div>
                  <div style={{ fontSize: 11, color: "#818cf8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Mindfulness</div>
                  マインドフルネス
                  <div style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted, marginTop: 3 }}>タイマーで静かな時間を作る</div>
                </div>
              </div>
            </button>
            <button onClick={() => setView("crisis")}
              style={{ width: "100%", background: `linear-gradient(135deg, #f8716115, #f8716105)`, border: `1px solid #f8716140`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconShield size={22} color="#f87161" />
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

      {/* MEDICAL TAB */}
      {view === "medicalTab" && (
        <div className="page" style={{ padding: "24px 16px" }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>診察・カウンセリングをサポートする機能です</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => {
              if (tellPeople.length === 0) {
                setView("bridgePerson");
              } else if (tellPeople.length === 1) {
                initBridgeSession(tellPeople[0].id);
              } else {
                setView("bridgePerson");
              }
            }}
              style={{ width: "100%", background: `linear-gradient(135deg, ${COLORS.accent}22, ${COLORS.accent}08)`, border: `1.5px solid ${COLORS.accent}70`, borderRadius: 16, color: COLORS.text, padding: "20px 18px", cursor: "pointer", textAlign: "left", boxShadow: `0 2px 16px ${COLORS.accent}14` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconChartLine size={16} color="#0f1117" />
                </div>
                <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 2, textTransform: "uppercase", fontWeight: 800 }}>Feature</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.accent, letterSpacing: 0.5, marginBottom: 4 }}>Bridge Session</div>
              <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 500, marginBottom: 8 }}>面談・診察のサポートツール</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>記録を一覧し、相手に伝えたいことを確認。言われたことをその場でメモできます。</div>
            </button>
            <button onClick={() => { setTellTab("pending"); setView("tellMemos"); }}
              style={{ width: "100%", background: `linear-gradient(135deg, #818cf815, #818cf805)`, border: `1px solid #818cf840`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconMessage size={22} color="#818cf8" />
                <div>
                  <div style={{ fontSize: 11, color: "#818cf8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Tell Memo</div>
                  伝えたいことメモ
                  <div style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted, marginTop: 3 }}>診察前に伝えたいことをまとめ、言えたかチェックする</div>
                </div>
              </div>
            </button>
            <button onClick={() => setView("medicalLog")}
              style={{ width: "100%", background: `linear-gradient(135deg, ${COLORS.accent}15, ${COLORS.accent}05)`, border: `1px solid ${COLORS.accent}40`, borderRadius: 14, color: COLORS.text, fontSize: 14, fontWeight: 700, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconStethoscope size={22} color={COLORS.accent} />
                <div>
                  <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Medical Log</div>
                  診察等の記録
                  <div style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted, marginTop: 3 }}>伝えたメモを人物ごとに振り返る</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* BRIDGE PERSON SELECT */}
      {view === "bridgePerson" && (
        <div className="page" style={{ padding: "24px 16px 100px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>誰との話ですか？</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 24, lineHeight: 1.6 }}>セッションを始める前に、相手を選んでください</div>
          {tellPeople.length === 0 ? (
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>まだ人物が登録されていません</div>
              <button onClick={() => { setView("tellMemos"); setTellTab("people"); setActiveTab("medical"); }}
                style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: COLORS.psAccent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                人物を登録する
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tellPeople.map(p => (
                <button key={p.id} onClick={() => initBridgeSession(p.id)}
                  style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${COLORS.accent}20`, border: `1.5px solid ${COLORS.accent}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.accent }}>{p.name[0]}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{p.type}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <BottomNav onBack={() => { setView("medicalTab"); setActiveTab("medical"); }} onHome={() => { setView("home"); setActiveTab("home"); }} />
        </div>
      )}

      {/* BRIDGE SESSION MAIN */}
      {view === "bridge" && (() => {
        const person = tellPeople.find(p => p.id === bridgePersonId);
        const personAllMemos = tellMemos.filter(m => m.personIds.includes(bridgePersonId) && bridgeSessionMemoIds.has(m.id));
        const personPendingMemos = personAllMemos.filter(m => !m.completed);
        const today = new Date();
        const todayDs = toDateStr(String(today.getFullYear()), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0"));
        const last14 = Array.from({ length: 14 }, (_, i) => {
          const d = new Date(today); d.setDate(today.getDate() - (13 - i));
          const ds = toDateStr(String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0"));
          const c = checkins.find(x => x.date === ds);
          return { label: `${d.getMonth() + 1}/${d.getDate()}`, ds, mood: c?.mood ?? null, sleep: c?.sleep ?? null };
        });
        const moodColor = (m) => m >= 7 ? COLORS.accent : m >= 4 ? "#e0a855" : COLORS.danger;
        const recentStress = [...records].sort((a, b) => b.id - a.id).slice(0, 5);
        const recentAchievements = [...achievements].sort((a, b) => b.id - a.id).slice(0, 5);

        const handleSave = () => {
          if (!bridgeMemoInput.trim()) return;
          if (personPendingMemos.length === 0) {
            setBridgeMemos(prev => [{ id: Date.now(), date: todayDs, content: bridgeMemoInput.trim(), personId: bridgePersonId }, ...prev]);
            setBridgeMemoInput("");
          } else {
            setBridgeMemoSelectDialog({ content: bridgeMemoInput.trim(), memos: personPendingMemos });
          }
        };

        return (
          <div className="page" style={{ padding: "4px 16px 240px" }}>
            {/* 相手の名前 */}
            <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, color: COLORS.accent, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>Bridge Session</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>{person?.name ?? ""}との Session</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{todayDs}</div>
            </div>

            {/* 伝えたいことメモ（この人が対象の未完了のみ） */}
            {bridgeSettings.showTellMemos && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.psAccent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>伝えたいことメモ</div>
                {personAllMemos.length === 0 ? (
                  <div style={{ background: COLORS.surface, borderRadius: 12, padding: "12px 14px", border: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.textMuted }}>メモはありません</div>
                ) : (
                  personAllMemos.map(m => {
                    const check = m.checks[bridgePersonId] || { checked: false };
                    return (
                      <div key={m.id} style={{ background: COLORS.surface, border: `1px solid ${m.completed ? "#818cf860" : "#818cf840"}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, opacity: m.completed ? 0.65 : 1 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                          <div style={{ fontSize: 12, color: COLORS.textMuted }}>{m.date}</div>
                          {m.completed ? (
                            <span style={{ padding: "4px 10px", borderRadius: 8, background: "#818cf820", color: "#818cf8", fontSize: 12, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>✓ 完了</span>
                          ) : (
                            <button onClick={() => toggleTellCheck(m.id, bridgePersonId)}
                              style={{ padding: "4px 10px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0, marginLeft: 8,
                                background: check.checked ? "#818cf820" : COLORS.psAccent, color: check.checked ? "#818cf8" : "#fff" }}>
                              {check.checked ? "✓ 伝えた" : "伝えた"}
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.content}</div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 気分グラフ（14日） */}
            {bridgeSettings.showMoodGraph && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>気分（直近2週間）</div>
                <div style={{ background: COLORS.surface, borderRadius: 12, padding: "20px 14px 12px", border: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 60 }}>
                    {last14.map((d, i) => {
                      const barH = d.mood !== null ? Math.max(4, (d.mood / 10) * 44) : 4;
                      const color = d.mood !== null ? moodColor(d.mood) : COLORS.border;
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          {d.mood !== null && <div style={{ fontSize: 8, color, fontWeight: 700 }}>{d.mood}</div>}
                          <div style={{ width: "100%", height: barH, borderRadius: 2, background: color, opacity: d.mood !== null ? 1 : 0.2 }} />
                          <div style={{ fontSize: 7, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{d.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 睡眠記録（14日）バーグラフ */}
            {bridgeSettings.showSleep && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>睡眠（直近2週間）</div>
                <div style={{ background: COLORS.surface, borderRadius: 12, padding: "20px 14px 12px", border: `1px solid ${COLORS.border}` }}>
                  {last14.filter(d => d.sleep).length === 0 ? (
                    <div style={{ fontSize: 13, color: COLORS.textMuted }}>記録なし</div>
                  ) : (
                    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 60 }}>
                      {last14.map((d, i) => {
                        const lv = d.sleep === "4時間未満" ? 1 : d.sleep === "4〜6時間未満" ? 2 : d.sleep === "6〜8時間未満" ? 3 : d.sleep === "8時間以上" ? 4 : null;
                        const barH = lv !== null ? Math.max(4, (lv / 4) * 44) : 4;
                        const color = lv === 1 ? COLORS.danger : lv === 2 ? "#e0a855" : COLORS.accent;
                        return (
                          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            {lv !== null && <div style={{ fontSize: 8, color, fontWeight: 700 }}>{lv}</div>}
                            <div style={{ width: "100%", height: barH, borderRadius: 2, background: color, opacity: lv !== null ? 1 : 0.2 }} />
                            <div style={{ fontSize: 7, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{d.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ストレス記録（直近5件） */}
            {bridgeSettings.showStress && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>ストレス記録（直近5件）</div>
                {recentStress.length === 0 ? (
                  <div style={{ background: COLORS.surface, borderRadius: 12, padding: "12px 14px", border: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.textMuted }}>記録なし</div>
                ) : (
                  recentStress.map(r => (
                    <div key={r.id} style={{ background: COLORS.surface, borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: `1px solid ${COLORS.border}` }}>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>{r.date || r.createdAt?.slice(0, 10)}</div>
                      <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{r.situation}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* できたことログ（直近5件） */}
            {bridgeSettings.showAchievement && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e0a855", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>できたことログ（直近5件）</div>
                {recentAchievements.length === 0 ? (
                  <div style={{ background: COLORS.surface, borderRadius: 12, padding: "12px 14px", border: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.textMuted }}>記録なし</div>
                ) : (
                  recentAchievements.map(a => (
                    <div key={a.id} style={{ background: COLORS.surface, borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: `1px solid #e0a85530` }}>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>{a.date}</div>
                      <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>{a.text}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 過去のメモ */}
            {bridgeMemos.filter(m => m.personId === bridgePersonId).length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>過去のメモ</div>
                {bridgeMemos.filter(m => m.personId === bridgePersonId).map(m => (
                  <div key={m.id} style={{ background: COLORS.surface, borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>{m.date}</div>
                    <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.content}</div>
                  </div>
                ))}
              </div>
            )}

            <BottomNav onBack={() => { setBridgePersonId(null); setView("medicalTab"); setActiveTab("medical"); }} onHome={() => { setView("home"); setActiveTab("home"); }} />

            {/* 固定メモ入力パネル */}
            <div style={{ position: "fixed", bottom: "calc(56px + env(safe-area-inset-bottom))", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, padding: "12px 16px", zIndex: 150, boxSizing: "border-box" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Session メモ</div>
              <textarea value={bridgeMemoInput} onChange={e => setBridgeMemoInput(e.target.value)}
                placeholder="言われたこと、気づいたことをメモする"
                rows={2}
                style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 10px", color: COLORS.text, fontSize: 13, boxSizing: "border-box", resize: "none", lineHeight: 1.5 }} />
              <button onClick={handleSave} disabled={!bridgeMemoInput.trim()}
                style={{ marginTop: 8, width: "100%", padding: "9px 0", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 700, cursor: bridgeMemoInput.trim() ? "pointer" : "default",
                  background: bridgeMemoInput.trim() ? COLORS.accent : COLORS.border,
                  color: bridgeMemoInput.trim() ? "#0f1117" : COLORS.textMuted }}>
                保存する
              </button>
            </div>

            {/* メモ紐付けダイアログ */}
            {bridgeMemoSelectDialog && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 400 }}>
                <div style={{ background: COLORS.surface, borderRadius: "16px 16px 0 0", padding: "20px 16px 32px", width: "100%", maxWidth: 480, boxSizing: "border-box" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>どのメモの回答として保存しますか？</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>「{bridgeMemoSelectDialog.content.slice(0, 40)}{bridgeMemoSelectDialog.content.length > 40 ? "…" : ""}」</div>
                  {bridgeMemoSelectDialog.memos.map(m => (
                    <button key={m.id} onClick={() => {
                      updateTellReply(m.id, bridgePersonId, bridgeMemoSelectDialog.content);
                      if (!tellMemos.find(x => x.id === m.id)?.checks[bridgePersonId]?.checked) {
                        toggleTellCheck(m.id, bridgePersonId);
                      }
                      setBridgeMemoInput("");
                      setBridgeMemoSelectDialog(null);
                    }}
                      style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer", textAlign: "left" }}>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 3 }}>{m.date}</div>
                      <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{m.content}</div>
                    </button>
                  ))}
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button onClick={() => setBridgeMemoSelectDialog(null)}
                      style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: "none", color: COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      キャンセル
                    </button>
                    <button onClick={() => {
                      setBridgeMemos(prev => [{ id: Date.now(), date: todayDs, content: bridgeMemoSelectDialog.content, personId: bridgePersonId }, ...prev]);
                      setBridgeMemoInput("");
                      setBridgeMemoSelectDialog(null);
                    }}
                      style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.surface, color: COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", borderTop: `1px solid ${COLORS.border}` }}>
                      単独で保存
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* BRIDGE SETTINGS */}
      {view === "bridgeSettings" && (
        <div className="page" style={{ padding: "16px 16px 100px" }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20, lineHeight: 1.6 }}>Bridge Sessionに表示する項目を選んでください</div>
          {[
            { key: "showTellMemos", label: "伝えたいことメモ（未完了）", color: COLORS.psAccent },
            { key: "showMoodGraph", label: "気分のグラフ（直近2週間）", color: COLORS.accent },
            { key: "showSleep", label: "睡眠の記録（直近2週間）", color: COLORS.accent },
            { key: "showStress", label: "ストレス記録（直近5件）", color: COLORS.accent },
            { key: "showAchievement", label: "できたことログ（直近5件）", color: "#e0a855" },
          ].map(({ key, label, color }) => (
            <div key={key} onClick={() => setBridgeSettings(prev => ({ ...prev, [key]: !prev[key] }))}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
              <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 500 }}>{label}</div>
              <div style={{ width: 44, height: 26, borderRadius: 13, background: bridgeSettings[key] ? color : COLORS.border, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: bridgeSettings[key] ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TELL MEMOS LIST */}
      {view === "tellMemos" && (
        <div className="page" style={{ padding: "16px 16px 100px" }}>
          {/* 3-tab switcher */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, background: COLORS.surface, borderRadius: 12, padding: 4 }}>
            {[{ id: "pending", label: "未完了" }, { id: "done", label: "完了済み" }, { id: "people", label: "人物管理" }].map(tab => (
              <button key={tab.id} onClick={() => setTellTab(tab.id)}
                style={{ flex: 1, padding: "8px 4px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: tellTab === tab.id ? COLORS.psAccent : "transparent",
                  color: tellTab === tab.id ? "#fff" : COLORS.textMuted }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 未完了タブ */}
          {tellTab === "pending" && (
            <div>
              <button onClick={() => setView("tellMemoNew")}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: COLORS.psAccent, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>
                ＋ 新しいメモを作成
              </button>
              {tellMemos.filter(m => !m.completed).length === 0 ? (
                <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 14, marginTop: 32 }}>メモがありません</div>
              ) : (
                tellMemos.filter(m => !m.completed).map(m => {
                  const people = m.personIds.map(pid => tellPeople.find(p => p.id === pid)).filter(Boolean);
                  const checkedCount = Object.values(m.checks).filter(c => c.checked).length;
                  return (
                    <div key={m.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ fontSize: 12, color: COLORS.textMuted }}>{m.date}</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={(e) => { e.stopPropagation(); setTellEditId(m.id); setTellEditContent(m.content); setTellEditPersonIds([...m.personIds]); setView("tellMemoEdit"); }}
                            style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "none", color: COLORS.textMuted, fontSize: 12, cursor: "pointer" }}>
                            編集
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setTellMemoDeleteId(m.id); }}
                            style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1, opacity: 0.5 }}>
                            ×
                          </button>
                        </div>
                      </div>
                      <div onClick={() => { setTellDetailId(m.id); setView("tellMemoDetail"); }}
                        style={{ fontSize: 14, color: COLORS.text, marginBottom: 10, whiteSpace: "pre-wrap", wordBreak: "break-word", cursor: "pointer" }}>{m.content}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {people.map(p => (
                            <span key={p.id} style={{ background: "#818cf820", border: "1px solid #818cf840", color: "#818cf8", borderRadius: 8, padding: "2px 8px", fontSize: 12 }}>
                              {p.name}
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize: 12, color: checkedCount === m.personIds.length && m.personIds.length > 0 ? COLORS.success : COLORS.textMuted, fontWeight: 600 }}>
                          {checkedCount}/{m.personIds.length} 済
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 完了済みタブ */}
          {tellTab === "done" && (
            <div>
              {tellMemos.filter(m => m.completed).length === 0 ? (
                <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 14, marginTop: 32 }}>完了済みのメモがありません</div>
              ) : (
                tellMemos.filter(m => m.completed).map(m => {
                  const people = m.personIds.map(pid => tellPeople.find(p => p.id === pid)).filter(Boolean);
                  return (
                    <div key={m.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, opacity: 0.85 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ fontSize: 12, color: COLORS.textMuted }}>{m.date}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, color: COLORS.success, fontWeight: 600, background: COLORS.successBg, borderRadius: 8, padding: "2px 8px" }}>✓ 完了</span>
                          <button onClick={(e) => { e.stopPropagation(); setTellMemoDeleteId(m.id); }}
                            style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1, opacity: 0.5 }}>
                            ×
                          </button>
                        </div>
                      </div>
                      <div onClick={() => { setTellDetailId(m.id); setView("tellMemoDetail"); }}
                        style={{ fontSize: 14, color: COLORS.text, marginBottom: 10, whiteSpace: "pre-wrap", wordBreak: "break-word", cursor: "pointer" }}>{m.content}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {people.map(p => (
                          <span key={p.id} style={{ background: "#818cf820", border: "1px solid #818cf840", color: "#818cf8", borderRadius: 8, padding: "2px 8px", fontSize: 12 }}>
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 人物管理タブ */}
          {tellTab === "people" && (
            <div>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>人物を追加</div>
                <input value={tellNewPersonName} onChange={e => setTellNewPersonName(e.target.value)}
                  placeholder="名前（例：田中先生）"
                  style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", color: COLORS.text, fontSize: 14, boxSizing: "border-box", marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {TELL_PERSON_TYPES.map(type => (
                    <button key={type} onClick={() => setTellNewPersonType(type)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        background: tellNewPersonType === type ? COLORS.psAccent : COLORS.bg,
                        color: tellNewPersonType === type ? "#fff" : COLORS.textMuted }}>
                      {type}
                    </button>
                  ))}
                </div>
                <button onClick={addTellPerson} disabled={!tellNewPersonName.trim()}
                  style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700, cursor: tellNewPersonName.trim() ? "pointer" : "default",
                    background: tellNewPersonName.trim() ? COLORS.psAccent : COLORS.border, color: "#fff" }}>
                  追加
                </button>
              </div>
              {tellPeople.length === 0 ? (
                <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 14, marginTop: 16 }}>登録された人物がいません</div>
              ) : (
                <DndContext sensors={dndSensors} collisionDetection={closestCenter}
                  onDragEnd={({ active, over }) => {
                    if (active.id !== over?.id) {
                      setTellPeople(prev => {
                        const oldIndex = prev.findIndex(p => p.id === active.id);
                        const newIndex = prev.findIndex(p => p.id === over.id);
                        return arrayMove(prev, oldIndex, newIndex);
                      });
                    }
                  }}>
                  <SortableContext items={tellPeople.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    {tellPeople.map(p => (
                      <SortablePersonItem key={p.id} person={p} onDelete={(id) => setTellPersonDeleteId(id)}
                        onEdit={(person) => { setTellPersonEditId(person.id); setTellPersonEditName(person.name); setTellPersonEditType(person.type); }} />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
          <BottomNav onBack={() => { setView("medicalTab"); setActiveTab("medical"); }} onHome={() => { setView("home"); setActiveTab("home"); }} />
        </div>
      )}

      {/* TELL MEMO NEW */}
      {view === "tellMemoNew" && (
        <div className="page" style={{ padding: "16px 16px 100px" }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>診察やカウンセリングで伝えたいことをメモしておきましょう</div>
          <textarea value={tellNewContent} onChange={e => setTellNewContent(e.target.value)}
            placeholder="伝えたいことを書いてください（例：最近眠れていない、薬の副作用が気になる）"
            rows={6}
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px", color: COLORS.text, fontSize: 14, boxSizing: "border-box", resize: "vertical", marginBottom: 20, lineHeight: 1.6 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 10 }}>誰に伝える？（複数選択可）</div>
          {tellPeople.length === 0 ? (
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px", textAlign: "center", marginBottom: 16 }}>
              <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 10 }}>まだ人物が登録されていません</div>
              <button onClick={() => { setView("tellMemos"); setTellTab("people"); }}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: COLORS.psAccent, color: "#fff", fontSize: 13, cursor: "pointer" }}>
                人物を追加する
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              {tellPeople.map(p => {
                const selected = tellNewPersonIds.includes(p.id);
                return (
                  <div key={p.id} onClick={() => setTellNewPersonIds(prev => selected ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                    style={{ display: "flex", alignItems: "center", gap: 12, background: selected ? "#818cf815" : COLORS.surface,
                      border: `1px solid ${selected ? "#818cf860" : COLORS.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 8, cursor: "pointer" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${selected ? COLORS.psAccent : COLORS.textMuted}`,
                      background: selected ? COLORS.psAccent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {selected && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{p.type}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setView("tellMemos")}
              style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: `1px solid ${COLORS.border}`, background: "none", color: COLORS.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              キャンセル
            </button>
            <button onClick={saveTellMemo} disabled={!tellNewContent.trim() || tellNewPersonIds.length === 0}
              style={{ flex: 2, padding: "13px 0", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, cursor: tellNewContent.trim() && tellNewPersonIds.length > 0 ? "pointer" : "default",
                background: tellNewContent.trim() && tellNewPersonIds.length > 0 ? COLORS.psAccent : COLORS.border, color: "#fff" }}>
              メモを保存
            </button>
          </div>
        </div>
      )}

      {/* TELL MEMO DETAIL */}
      {view === "tellMemoDetail" && (() => {
        const memo = tellMemos.find(m => m.id === tellDetailId);
        if (!memo) return <div className="page" style={{ padding: 16, color: COLORS.textMuted }}>メモが見つかりません</div>;
        const people = memo.personIds.map(pid => tellPeople.find(p => p.id === pid)).filter(Boolean);
        const allChecked = people.length > 0 && people.every(p => memo.checks[p.id]?.checked);
        return (
          <div className="page" style={{ padding: "16px 16px 100px" }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>{memo.date}</div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px", marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: COLORS.text, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7 }}>{memo.content}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>伝えた記録</div>
            {people.map(p => {
              const check = memo.checks[p.id] || { checked: false, reply: "" };
              return (
                <div key={p.id} style={{ background: COLORS.surface, border: `1px solid ${check.checked ? "#818cf860" : COLORS.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: check.checked ? 12 : 0 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{p.name}</span>
                      <span style={{ fontSize: 12, color: COLORS.textMuted, marginLeft: 8 }}>{p.type}</span>
                    </div>
                    {memo.completed ? (
                      <span style={{ padding: "7px 14px", borderRadius: 9, background: "#818cf820", color: "#818cf8", fontSize: 13, fontWeight: 600 }}>
                        ✓ 伝えた
                      </span>
                    ) : (
                      <button onClick={() => toggleTellCheck(memo.id, p.id)}
                        style={{ padding: "7px 14px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                          background: check.checked ? "#818cf820" : COLORS.psAccent, color: check.checked ? "#818cf8" : "#fff" }}>
                        {check.checked ? "✓ 伝えた" : "伝えた"}
                      </button>
                    )}
                  </div>
                  {check.checked && (
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>言われたこと・返答メモ（任意）</div>
                      <textarea value={check.reply || ""} onChange={e => updateTellReply(memo.id, p.id, e.target.value)}
                        placeholder="相手から言われたことや返答をメモできます"
                        rows={3}
                        style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 12px", color: COLORS.text, fontSize: 13, boxSizing: "border-box", resize: "vertical", lineHeight: 1.6 }} />
                    </div>
                  )}
                </div>
              );
            })}
            {!memo.completed && allChecked && (
              <button onClick={() => completeTellMemo(memo.id)}
                style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: COLORS.success, color: COLORS.bg, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 8, marginBottom: 10 }}>
                ✓ このメモを完了にする
              </button>
            )}
            {memo.completed && (
              <div style={{ textAlign: "center", color: COLORS.success, fontSize: 13, fontWeight: 600, marginTop: 8, marginBottom: 10 }}>✓ 完了済み</div>
            )}
            <button onClick={() => setTellMemoDeleteId(memo.id)}
              style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: `1px solid ${COLORS.danger}40`, background: "none", color: COLORS.danger, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
              このメモを削除
            </button>
            <BottomNav onBack={() => setView("tellMemos")} onHome={() => { setView("home"); setActiveTab("home"); }} />
          </div>
        );
      })()}

      {/* TELL MEMO EDIT */}
      {view === "tellMemoEdit" && (() => {
        const memo = tellMemos.find(m => m.id === tellEditId);
        if (!memo) return <div className="page" style={{ padding: 16, color: COLORS.textMuted }}>メモが見つかりません</div>;
        const saveEdit = () => {
          if (!tellEditContent.trim() || tellEditPersonIds.length === 0) return;
          setTellMemos(prev => prev.map(m => m.id === tellEditId ? { ...m, content: tellEditContent.trim(), personIds: tellEditPersonIds } : m));
          setView("tellMemos");
        };
        return (
          <div className="page" style={{ padding: "16px 16px 100px" }}>
            <textarea value={tellEditContent} onChange={e => setTellEditContent(e.target.value)}
              rows={6}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px", color: COLORS.text, fontSize: 14, boxSizing: "border-box", resize: "vertical", marginBottom: 20, lineHeight: 1.6 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 10 }}>誰に伝える？</div>
            <div style={{ marginBottom: 20 }}>
              {tellPeople.map(p => {
                const selected = tellEditPersonIds.includes(p.id);
                return (
                  <div key={p.id} onClick={() => setTellEditPersonIds(prev => selected ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                    style={{ display: "flex", alignItems: "center", gap: 12, background: selected ? "#818cf815" : COLORS.surface,
                      border: `1px solid ${selected ? "#818cf860" : COLORS.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 8, cursor: "pointer" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${selected ? COLORS.psAccent : COLORS.textMuted}`,
                      background: selected ? COLORS.psAccent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {selected && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{p.type}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setView("tellMemos")}
                style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: `1px solid ${COLORS.border}`, background: "none", color: COLORS.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                キャンセル
              </button>
              <button onClick={saveEdit} disabled={!tellEditContent.trim() || tellEditPersonIds.length === 0}
                style={{ flex: 2, padding: "13px 0", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, cursor: tellEditContent.trim() && tellEditPersonIds.length > 0 ? "pointer" : "default",
                  background: tellEditContent.trim() && tellEditPersonIds.length > 0 ? COLORS.psAccent : COLORS.border, color: "#fff" }}>
                保存する
              </button>
            </div>
          </div>
        );
      })()}

      {/* ACHIEVEMENT */}
      {view === "achievement" && (() => {
        const todayStr2 = toDateStr(t.year, t.month, t.day);
        const todayAchievements = achievements.filter(a => a.date === todayStr2);

        // 連続記録日数を計算（今日未記録でも昨日から遡って数える）
        let streak = 0;
        const d = new Date();
        const todayHasRecord = achievements.some(a => a.date === todayStr2);
        if (!todayHasRecord) {
          d.setDate(d.getDate() - 1);
        }
        while (true) {
          const y = String(d.getFullYear());
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const dateStr = toDateStr(y, m, day);
          if (achievements.some(a => a.date === dateStr)) {
            streak++;
            d.setDate(d.getDate() - 1);
          } else break;
        }

        // カレンダー（今月）
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth2 = new Date(year, month + 1, 0).getDate();
        const recordedDates = new Set(achievements.map(a => a.date));

        const saveAchievement = () => {
          if (!achievementText.trim()) return;
          setAchievements([{ id: Date.now(), date: todayStr2, text: achievementText.trim() }, ...achievements]);
          setAchievementText("");
        };

        return (
          <div className="page" style={{ padding: "20px 16px" }}>
            {/* 連続記録 */}
            <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px 18px", marginBottom: 16, border: `1px solid ${COLORS.accent}30`, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: COLORS.accent, lineHeight: 1 }}>{streak}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>日連続記録中</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>毎日続けることが力になる</div>
              </div>
            </div>

            {/* タブ */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[{ v: "log", label: "ログ" }, { v: "calendar", label: "カレンダー" }].map(({ v, label }) => (
                <button key={v} onClick={() => setAchievementTab(v)}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1.5px solid ${achievementTab === v ? COLORS.accent : COLORS.border}`, background: achievementTab === v ? COLORS.accentSoft : COLORS.surface, color: achievementTab === v ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ログタブ */}
            {achievementTab === "log" && (
              <div key="log" className="page">
                {/* 入力 */}
                <div style={{ background: COLORS.surface, borderRadius: 14, padding: "14px 16px", marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, marginBottom: 8 }}>今日できたことを記録する</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input type="text" placeholder="例）30分散歩できた"
                      value={achievementText}
                      onChange={(e) => setAchievementText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveAchievement()}
                      style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 14, padding: "10px 12px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                    <button onClick={saveAchievement} disabled={!achievementText.trim()}
                      style={{ width: "100%", background: achievementText.trim() ? COLORS.accent : COLORS.border, border: "none", borderRadius: 8, color: "#0f1117", fontSize: 13, fontWeight: 700, padding: "10px", cursor: achievementText.trim() ? "pointer" : "default" }}>
                      追加する
                    </button>
                  </div>
                </div>

                {/* 今日の記録のみ */}
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10 }}>今日の記録</div>
                {todayAchievements.length === 0 ? (
                  <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 14, padding: "32px 0", lineHeight: 2 }}>
                    まだ今日の記録がありません。<br />小さなことでも記録してみましょう
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {todayAchievements.map((a) => (
                      <div key={a.id} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.accent}40`, display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontSize: 16 }}>⭐</div>
                        <div style={{ flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>{a.text}</div>
                        <button onClick={() => setAchievementDeleteId(a.id)}
                          style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, padding: 0, opacity: 0.4 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center", marginTop: 16 }}>
                  過去の記録はカレンダーから確認できます
                </div>
              </div>
            )}

            {/* カレンダータブ */}
            {achievementTab === "calendar" && (
              <div key="calendar" className="page">
                <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px", border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, textAlign: "center", marginBottom: 16 }}>
                    {year}年{month + 1}月
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
                    {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
                      <div key={d} style={{ textAlign: "center", fontSize: 11, color: i === 0 ? COLORS.danger : i === 6 ? COLORS.accent : COLORS.textMuted, fontWeight: 700 }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                    {Array.from({ length: firstDay === 0 ? 0 : firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth2 }, (_, i) => {
                      const day = i + 1;
                      const dateStr = toDateStr(String(year), String(month + 1).padStart(2, "0"), String(day).padStart(2, "0"));
                      const hasRecord = recordedDates.has(dateStr);
                      const isToday = dateStr === todayStr2;
                      const isSelected = dateStr === selectedAchievementDate;
                      return (
                        <div key={day} onClick={() => hasRecord && setSelectedAchievementDate(isSelected ? null : dateStr)}
                          style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: isSelected ? COLORS.accent : hasRecord ? COLORS.accentSoft : isToday ? COLORS.accentSoft : "none", border: isSelected ? "none" : isToday ? `1px solid ${COLORS.accent}` : "none", fontSize: 12, fontWeight: hasRecord || isToday ? 700 : 400, color: isSelected ? "#0f1117" : hasRecord ? COLORS.accent : isToday ? COLORS.accent : COLORS.textMuted, cursor: hasRecord ? "pointer" : "default" }}>
                          {hasRecord ? "⭐" : day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 選択した日の記録 */}
                {selectedAchievementDate ? (
                  <div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10 }}>
                      {(() => { const [, m, d] = selectedAchievementDate.split("-"); return `${parseInt(m)}月${parseInt(d)}日の記録`; })()}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {achievements.filter(a => a.date === selectedAchievementDate).map((a) => (
                        <div key={a.id} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.accent}30`, display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ fontSize: 16 }}>⭐</div>
                          <div style={{ flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>{a.text}</div>
                          <button onClick={() => setAchievementDeleteId(a.id)}
                            style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, padding: 0, opacity: 0.4 }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center", marginTop: 4 }}>
                    ⭐のある日をタップすると記録を見られます
                  </div>
                )}
              </div>
            )}

            <BottomNav onBack={() => { setView("records"); setActiveTab("records"); }} onHome={() => { setView("home"); setActiveTab("home"); }} />

            {achievementDeleteId && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 100 }}>
                <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>この記録を削除しますか？</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
                    {achievements.find(a => a.id === achievementDeleteId)?.text}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setAchievementDeleteId(null)}
                      style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>キャンセル</button>
                    <button onClick={() => { setAchievements(achievements.filter(a => a.id !== achievementDeleteId)); setAchievementDeleteId(null); }}
                      style={{ flex: 1, background: COLORS.danger, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 12, cursor: "pointer" }}>削除する</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* MINDFULNESS */}
      {view === "mindfulness" && (
        <div className="page" style={{ padding: "32px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>

          {!mfRunning && mfRemaining === null && (
            <>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: "#818cf820", border: "1.5px solid #818cf840", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <IconLeaf size={40} color="#818cf8" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>マインドフルネス</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, textAlign: "center", lineHeight: 1.8, marginBottom: 24, maxWidth: 280 }}>
                時間を設定してスタートしましょう。タイマーが終わると音が鳴ります。<br />
                <span style={{ fontSize: 12, color: "#818cf8" }}>🎵 瞑想中はBGM（雨音風）が流れます</span>
              </div>

              {/* マインドフルネスとは？アコーディオン */}
              <div style={{ width: "100%", marginBottom: 32 }}>
                <button onClick={() => setMfInfoOpen(!mfInfoOpen)}
                  style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: mfInfoOpen ? "12px 12px 0 0" : 12, color: COLORS.textMuted, fontSize: 13, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>マインドフルネスとは？</span>
                  <span style={{ fontSize: 15 }}>{mfInfoOpen ? "▾" : "▸"}</span>
                </button>
                {mfInfoOpen && (
                  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "16px", fontSize: 13, color: COLORS.textMuted, lineHeight: 1.9 }}>
                    <div style={{ marginBottom: 12 }}>
                      マインドフルネスとは、「今この瞬間」に意識を向ける練習です。過去への後悔や未来への不安から離れ、今の呼吸や体の感覚に集中することで、心を落ち着かせます。
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      精神科領域でも認知行動療法と組み合わせて活用されており、ストレス軽減・感情調整・再発防止に効果があるとされています。
                    </div>
                    <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>やり方</div>
                    <div style={{ lineHeight: 2 }}>
                      ① 楽な姿勢で座る<br />
                      ② 目を閉じるか、視線を落とす<br />
                      ③ 呼吸に意識を向ける（吸う・吐く）<br />
                      ④ 考えが浮かんでも、そっと呼吸に戻す<br />
                      ⑤ タイマーが鳴るまで続ける
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 40, width: "100%" }}>
                <div style={{ fontSize: 13, color: COLORS.textMuted, textAlign: "center", marginBottom: 16 }}>時間を選ぶ</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {[1, 3, 5, 7, 10].map(m => (
                    <button key={m} onClick={() => setMfMinutes(m)}
                      style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${mfMinutes === m ? "#818cf8" : COLORS.border}`, background: mfMinutes === m ? "#818cf820" : COLORS.surface, color: mfMinutes === m ? "#818cf8" : COLORS.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      {m}分
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => {
                const total = mfMinutes * 60;
                setMfRemaining(total);
                setMfRunning(true);

                // ホワイトノイズ（雨音風）を開始
                try {
                  const ctx = new (window.AudioContext || window.webkitAudioContext)();
                  const bufferSize = ctx.sampleRate * 2;
                  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                  const data = buffer.getChannelData(0);
                  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                  const source = ctx.createBufferSource();
                  source.buffer = buffer;
                  source.loop = true;
                  const filter = ctx.createBiquadFilter();
                  filter.type = "lowpass";
                  filter.frequency.value = 800;
                  const gainNode = ctx.createGain();
                  gainNode.gain.value = 0.15;
                  source.connect(filter);
                  filter.connect(gainNode);
                  gainNode.connect(ctx.destination);
                  source.start();
                  window._mfAudioCtx = ctx;
                  window._mfSource = source;
                  window._mfGain = gainNode;
                } catch(e) {}

                const ref = setInterval(() => {
                  setMfRemaining(prev => {
                    if (prev <= 1) {
                      clearInterval(ref);
                      setMfRunning(false);
                      // ホワイトノイズを止める
                      try {
                        if (window._mfGain) {
                          window._mfGain.gain.exponentialRampToValueAtTime(0.001, window._mfAudioCtx.currentTime + 1);
                        }
                        setTimeout(() => {
                          try { window._mfSource?.stop(); window._mfAudioCtx?.close(); } catch(e) {}
                        }, 1200);
                      } catch(e) {}
                      // ベル音を鳴らす
                      try {
                        setTimeout(() => {
                          const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
                          const playBell = (delay) => {
                            const osc = ctx2.createOscillator();
                            const gain = ctx2.createGain();
                            osc.connect(gain);
                            gain.connect(ctx2.destination);
                            osc.frequency.setValueAtTime(528, ctx2.currentTime + delay);
                            osc.frequency.exponentialRampToValueAtTime(440, ctx2.currentTime + delay + 2);
                            gain.gain.setValueAtTime(0.4, ctx2.currentTime + delay);
                            gain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + delay + 3);
                            osc.start(ctx2.currentTime + delay);
                            osc.stop(ctx2.currentTime + delay + 3);
                          };
                          playBell(0);
                          playBell(3.5);
                        }, 1000);
                      } catch(e) {}
                      return 0;
                    }
                    return prev - 1;
                  });
                }, 1000);
                setMfTimerRef(ref);
              }} style={{ width: 160, height: 160, borderRadius: "50%", border: `3px solid #818cf8`, background: "#818cf815", color: "#818cf8", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <span style={{ fontSize: 32 }}>▶</span>
                スタート
              </button>
            </>
          )}

          {(mfRunning || (mfRemaining !== null && mfRemaining > 0)) && (
            <>
              <div style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>瞑想中</div>

              {/* 円形プログレス */}
              <div style={{ position: "relative", width: 220, height: 220, marginBottom: 40 }}>
                <svg viewBox="0 0 220 220" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
                  <circle cx="110" cy="110" r="100" fill="none" stroke={COLORS.border} strokeWidth="6" />
                  <circle cx="110" cy="110" r="100" fill="none" stroke="#818cf8" strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 100}`}
                    strokeDashoffset={`${2 * Math.PI * 100 * (1 - mfRemaining / (mfMinutes * 60))}`}
                    strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 48, fontWeight: 700, color: COLORS.text, lineHeight: 1 }}>
                    {String(Math.floor(mfRemaining / 60)).padStart(2, "0")}:{String(mfRemaining % 60).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8 }}>残り時間</div>
                </div>
              </div>

              <div style={{ fontSize: 14, color: COLORS.textMuted, textAlign: "center", lineHeight: 2, marginBottom: 40 }}>
                呼吸に意識を向けましょう<br />
                <span style={{ fontSize: 12 }}>吸って… 吐いて…</span>
              </div>

              <button onClick={() => {
                if (mfTimerRef) clearInterval(mfTimerRef);
                try {
                  if (window._mfGain) window._mfGain.gain.exponentialRampToValueAtTime(0.001, window._mfAudioCtx.currentTime + 0.5);
                  setTimeout(() => { try { window._mfSource?.stop(); window._mfAudioCtx?.close(); } catch(e) {} }, 600);
                } catch(e) {}
                setMfRunning(false);
                setMfRemaining(null);
              }} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 14, padding: "12px 32px", cursor: "pointer" }}>
                終了する
              </button>
            </>
          )}

          {!mfRunning && mfRemaining === 0 && (
            <>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: "#818cf820", border: "1.5px solid #818cf840", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <IconBell size={48} color="#818cf8" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>お疲れ様でした</div>
              <div style={{ fontSize: 14, color: COLORS.textMuted, textAlign: "center", lineHeight: 1.8, marginBottom: 40 }}>
                {mfMinutes}分間の瞑想が完了しました
              </div>
              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                <button onClick={() => setView("home")}
                  style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: 700, padding: 14, cursor: "pointer" }}>
                  ホームへ
                </button>
                <button onClick={() => { setMfRemaining(null); setMfRunning(false); }}
                  style={{ flex: 1, background: "#818cf8", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, padding: 14, cursor: "pointer" }}>
                  もう一度
                </button>
              </div>
            </>
          )}

          {(!mfRunning && mfRemaining === null) && (
            <div style={{ marginTop: 40, width: "100%" }}>
              <BottomNav onBack={() => { setView("tools"); setActiveTab("tools"); }} onHome={() => { setView("home"); setActiveTab("home"); }} />
            </div>
          )}
        </div>
      )}

      {/* MEDICAL LOG */}
      {view === "medicalLog" && (() => {
        const completedMemos = tellMemos.filter(m => m.completed);
        const activePeople = tellPeople.filter(p => completedMemos.some(m => m.personIds.includes(p.id)));
        const currentPersonId = medicalLogPersonId && activePeople.some(p => p.id === medicalLogPersonId)
          ? medicalLogPersonId
          : activePeople[0]?.id ?? null;
        const personMemos = currentPersonId
          ? [...completedMemos.filter(m => m.personIds.includes(currentPersonId))].sort((a, b) => b.date.localeCompare(a.date))
          : [];

        return (
          <div className="page" style={{ padding: "16px 0 100px" }}>
            {activePeople.length === 0 ? (
              <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 14, padding: "48px 24px", lineHeight: 2 }}>
                完了済みのメモがまだありません
                <div style={{ fontSize: 12, marginTop: 8 }}>伝えたいことメモを完了にすると、ここに記録が表示されます</div>
              </div>
            ) : (
              <>
                {/* 人物タブ */}
                <div style={{ display: "flex", gap: 8, padding: "0 16px 16px", overflowX: "auto", borderBottom: `1px solid ${COLORS.border}` }}>
                  {activePeople.map(p => (
                    <button key={p.id} onClick={() => setMedicalLogPersonId(p.id)}
                      style={{ flexShrink: 0, padding: "8px 18px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        background: currentPersonId === p.id ? COLORS.accent : COLORS.surface,
                        color: currentPersonId === p.id ? "#0f1117" : COLORS.textMuted }}>
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* メモ一覧 */}
                <div style={{ padding: "16px 16px 0" }}>
                  {personMemos.length === 0 ? (
                    <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 14, marginTop: 32 }}>記録がありません</div>
                  ) : (
                    personMemos.map(m => {
                      const check = m.checks[currentPersonId] || { checked: false, reply: "" };
                      return (
                        <div key={m.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px", marginBottom: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <div style={{ fontSize: 12, color: COLORS.textMuted }}>{m.date}</div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button onClick={() => {
                                setMedicalLogDetailId(m.id);
                                setMedicalLogEditDraft({ date: m.date, content: m.content, reply: check.reply || "" });
                                setView("medicalLogEdit");
                              }}
                                style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: "4px 10px" }}>編集</button>
                              <button onClick={() => setTellMemoDeleteId(m.id)}
                                style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, padding: 0, opacity: 0.5 }}>×</button>
                            </div>
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>伝えたこと</div>
                          <div style={{ fontSize: 14, color: COLORS.text, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7, marginBottom: 14, paddingLeft: 2 }}>{m.content}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>言われたこと</div>
                          <div style={{ fontSize: 14, color: COLORS.text, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7, paddingLeft: 2 }}>
                            {check.reply || <span style={{ color: COLORS.textMuted, fontStyle: "italic", fontSize: 13 }}>未記入</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
            <div style={{ padding: "0 16px" }}>
              <BottomNav onBack={() => { setView("medicalTab"); setActiveTab("medical"); }} onHome={() => { setView("home"); setActiveTab("home"); }} />
            </div>
          </div>
        );
      })()}

      {/* MEDICAL LOG EDIT */}
      {view === "medicalLogEdit" && (() => {
        const memo = tellMemos.find(m => m.id === medicalLogDetailId);
        if (!memo) return null;
        const completedMemos = tellMemos.filter(m => m.completed);
        const activePeople = tellPeople.filter(p => completedMemos.some(m => m.personIds.includes(p.id)));
        const currentPersonId = medicalLogPersonId && activePeople.some(p => p.id === medicalLogPersonId)
          ? medicalLogPersonId
          : activePeople[0]?.id ?? null;
        const [ey, em, ed] = medicalLogEditDraft.date.split("-");
        return (
          <div className="page" style={{ padding: "20px 16px" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>日付</div>
              <DateSelector year={ey} month={em} day={ed}
                onYear={y => setMedicalLogEditDraft({ ...medicalLogEditDraft, date: toDateStr(y, em, ed) })}
                onMonth={m => setMedicalLogEditDraft({ ...medicalLogEditDraft, date: toDateStr(ey, m, ed) })}
                onDay={d => setMedicalLogEditDraft({ ...medicalLogEditDraft, date: toDateStr(ey, em, d) })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>伝えたこと</div>
              <textarea rows={5} style={inpStyle()} value={medicalLogEditDraft.content}
                onChange={e => setMedicalLogEditDraft({ ...medicalLogEditDraft, content: e.target.value })} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>言われたこと</div>
              <textarea rows={5} style={inpStyle()} value={medicalLogEditDraft.reply}
                placeholder="言われたことや返答をメモできます"
                onChange={e => setMedicalLogEditDraft({ ...medicalLogEditDraft, reply: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setView("medicalLog")}
                style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>キャンセル</button>
              <button onClick={() => {
                setTellMemos(prev => prev.map(m => m.id === medicalLogDetailId ? { ...m, date: medicalLogEditDraft.date, content: medicalLogEditDraft.content, checks: { ...m.checks, [currentPersonId]: { ...(m.checks[currentPersonId] || {}), reply: medicalLogEditDraft.reply } } } : m));
                setView("medicalLog");
              }}
                style={{ flex: 2, background: COLORS.accent, border: "none", borderRadius: 10, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: 13, cursor: "pointer" }}>保存する</button>
            </div>
          </div>
        );
      })()}

      {/* MEMO */}
      {view === "memo" && (() => {
        const detailMemo = memos.find(m => m.id === memoDetailId);

        if (memoView === "new") return (
          <div className="page" style={{ padding: "20px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>日付</div>
                <DateSelector year={memoDraft.date.split("-")[0]} month={memoDraft.date.split("-")[1]} day={memoDraft.date.split("-")[2]}
                  onYear={y => setMemoDraft({...memoDraft, date: toDateStr(y, memoDraft.date.split("-")[1], memoDraft.date.split("-")[2])})}
                  onMonth={m => setMemoDraft({...memoDraft, date: toDateStr(memoDraft.date.split("-")[0], m, memoDraft.date.split("-")[2])})}
                  onDay={d => setMemoDraft({...memoDraft, date: toDateStr(memoDraft.date.split("-")[0], memoDraft.date.split("-")[1], d)})} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>タイトル <span style={{ fontSize: 11 }}>任意</span></div>
                <input type="text" style={{ ...inpStyle(), resize: "none" }} placeholder="例）デイケア遅刻" value={memoDraft.title} onChange={e => setMemoDraft({...memoDraft, title: e.target.value})} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>内容</div>
                <textarea rows={8} style={inpStyle()} placeholder="自由に書いてください" value={memoDraft.body} onChange={e => setMemoDraft({...memoDraft, body: e.target.value})} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setMemoView("list")} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>キャンセル</button>
              <button onClick={() => {
                if (!memoDraft.body.trim()) return;
                setMemos([{ id: Date.now(), ...memoDraft }, ...memos]);
                setMemoDraft({ date: toDateStr(t.year, t.month, t.day), title: "", body: "" });
                setMemoView("list");
              }} style={{ flex: 2, background: COLORS.accent, border: "none", borderRadius: 10, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: 13, cursor: "pointer" }}>保存する</button>
            </div>
          </div>
        );

        if (memoView === "detail" && detailMemo) return (
          <div className="page" style={{ padding: "20px 16px" }}>
            {!memoEditing ? (
              <>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>{formatDate(detailMemo.date)}</div>
                {detailMemo.title && <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 16, lineHeight: 1.4 }}>{detailMemo.title}</div>}
                <div style={{ background: COLORS.surface, borderRadius: 10, padding: "14px 16px", fontSize: 14, lineHeight: 1.8, border: `1px solid ${COLORS.border}`, color: COLORS.text, whiteSpace: "pre-wrap" }}>{detailMemo.body}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button onClick={() => { setMemoEditDraft({...detailMemo}); setMemoEditing(true); }}
                    style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>編集</button>
                  <button onClick={() => { setMemos(memos.filter(m => m.id !== detailMemo.id)); setMemoView("list"); }}
                    style={{ flex: 1, background: COLORS.danger, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 13, cursor: "pointer" }}>削除</button>
                </div>
                <BottomNav onHome={() => { setView("home"); setActiveTab("home"); }} />
              </>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>タイトル</div>
                    <input type="text" style={{ ...inpStyle(), resize: "none" }} value={memoEditDraft.title || ""} onChange={e => setMemoEditDraft({...memoEditDraft, title: e.target.value})} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>内容</div>
                    <textarea rows={8} style={inpStyle()} value={memoEditDraft.body || ""} onChange={e => setMemoEditDraft({...memoEditDraft, body: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                  <button onClick={() => setMemoEditing(false)} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>キャンセル</button>
                  <button onClick={() => { setMemos(memos.map(m => m.id === detailMemo.id ? {...m, ...memoEditDraft} : m)); setMemoEditing(false); }}
                    style={{ flex: 2, background: COLORS.accent, border: "none", borderRadius: 10, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: 13, cursor: "pointer" }}>保存する</button>
                </div>
              </>
            )}
          </div>
        );

        return (
          <div className="page" style={{ padding: "20px 16px" }}>
            <button onClick={() => { setMemoDraft({ date: toDateStr(t.year, t.month, t.day), title: "", body: "" }); setMemoView("new"); }}
              style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: 14, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <IconPlus size={16} />新しいメモを作成
            </button>
            {memos.length === 0 ? (
              <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 14, padding: "40px 0", lineHeight: 2 }}>まだメモがありません</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {memos.map(m => (
                  <div key={m.id} onClick={() => { setMemoDetailId(m.id); setMemoEditing(false); setMemoView("detail"); }}
                    style={{ background: COLORS.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${COLORS.border}`, cursor: "pointer" }}>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>{formatDate(m.date)}</div>
                    {m.title && <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{m.title}</div>}
                    <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{m.body}</div>
                  </div>
                ))}
              </div>
            )}
            <BottomNav onBack={() => { setView("records"); setActiveTab("records"); }} onHome={() => { setView("home"); setActiveTab("home"); }} />
          </div>
        );
      })()}

      {/* SETTINGS */}
      {view === "settings" && (
        <div className="page" style={{ padding: "20px 16px" }}>

          {/* 表示設定 */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>表示設定</div>
            <div style={{ background: COLORS.surface, borderRadius: 14, padding: "14px 18px", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>テーマ</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{isDark ? "ダークモード" : "ライトモード"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: isDark ? COLORS.textMuted : COLORS.accent, fontWeight: isDark ? 400 : 700 }}>ライト</span>
                <button
                  onClick={() => toggleTheme(!isDark)}
                  style={{ width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer", position: "relative", padding: 0,
                    background: isDark ? COLORS.accent : COLORS.border, transition: "background 0.25s" }}>
                  <div style={{ position: "absolute", top: 3, left: isDark ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    transition: "left 0.25s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </button>
                <span style={{ fontSize: 12, color: isDark ? COLORS.accent : COLORS.textMuted, fontWeight: isDark ? 700 : 400 }}>ダーク</span>
              </div>
            </div>
          </div>

          {/* データ管理 */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>データ管理</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px 18px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>データをバックアップする</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 14 }}>
                  全データをJSONファイルとしてダウンロードします。機種変更やブラウザ変更の前にご利用ください。
                </div>
                <button
                  onClick={exportData}
                  style={{ width: "100%", background: COLORS.accentSoft, border: `1px solid ${COLORS.accent}`, borderRadius: 10, color: COLORS.accent, fontSize: 14, fontWeight: 700, padding: "12px", cursor: "pointer" }}>
                  バックアップファイルをダウンロード
                </button>
              </div>

              <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px 18px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>データを復元する</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 14 }}>
                  バックアップしたJSONファイルを選択して復元します。現在のデータは上書きされます。
                </div>
                <label style={{ display: "block", width: "100%", background: COLORS.bg, border: `1px dashed ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, fontWeight: 700, padding: "12px", cursor: "pointer", textAlign: "center", boxSizing: "border-box" }}>
                  JSONファイルを選択
                  <input type="file" accept=".json" style={{ display: "none" }} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImportResult(null);
                    importData(file, (result) => {
                      setImportResult(result);
                      if (result === "ok") {
                        setTimeout(() => window.location.reload(), 1500);
                      }
                    });
                    e.target.value = "";
                  }} />
                </label>
                {importResult === "ok" && (
                  <div style={{ marginTop: 10, padding: "10px 14px", background: COLORS.accentSoft, borderRadius: 8, fontSize: 13, color: COLORS.accent, fontWeight: 700 }}>
                    復元しました。ページを再読み込みします…
                  </div>
                )}
                {importResult === "error" && (
                  <div style={{ marginTop: 10, padding: "10px 14px", background: "#f8716120", borderRadius: 8, fontSize: 13, color: COLORS.danger, fontWeight: 700 }}>
                    ファイルの読み込みに失敗しました。正しいバックアップファイルか確認してください。
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>法的情報</div>
            <button
              onClick={() => setShowPrivacy(true)}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: 14, color: COLORS.text }}>プライバシーポリシー・免責事項</span>
              <span style={{ fontSize: 16, color: COLORS.textMuted }}>›</span>
            </button>
          </div>

          <BottomNav onHome={() => { setView("home"); setActiveTab("home"); }} />
        </div>
      )}

      {/* SUPPORT */}
      {view === "support" && (
        <div className="page" style={{ padding: "24px 16px" }}>
          <div style={{ background: COLORS.surface, borderRadius: 14, padding: "20px 18px", marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>フィードバック・お問い合わせ</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8, marginBottom: 16 }}>
              バグの報告・機能のご要望・使い方のご質問など、お気軽にお送りください。いただいたフィードバックは今後の改善に活かします。
            </div>
            <button
              onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSexa5H2X037mrCEGrOwcRil-VWOlz3byyCVcQmJ3cAqMKIy9g/viewform?usp=publish-editor", "_blank")}
              style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: 14, cursor: "pointer" }}>
              フォームを開く →
            </button>
          </div>

          <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px 18px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>開発者について</div>
              Strideは、精神科デイケアで学んだ内容をもとに個人が開発したセルフケア支援アプリです。医療行為・診断・治療を目的としたものではありません。
            </div>
          </div>

          <BottomNav onHome={() => { setView("home"); setActiveTab("home"); }} />
        </div>
      )}

      {/* GUIDE */}
      {view === "guide" && (() => {
        const GUIDE_ITEMS = [
          {
            Icon: IconChartLine,
            title: "毎日のチェックイン",
            purpose: "自分の状態を毎日記録して、気分や体調のパターンを把握するための機能",
            usage: ["気分を1〜10で記録", "体調・睡眠を選択", "ひとことメモを任意で記入"],
            points: ["毎日続けることで週次レポートやグラフで自分の波が見えてくる", "完璧に書かなくていい、気分の数字だけでもOK"],
          },
          {
            Icon: IconPencil,
            title: "ストレス記録",
            purpose: "気になった出来事やストレスを記録して、認知再構成・問題解決・コーピングで対処するための機能",
            usage: ["気になった出来事や状況を記録", "カテゴリ・強度・浮かんだ考えを任意で記入", "記録後にアプローチを選んで対処できる"],
            points: ["その場で対処できなくてもまず記録だけでもOK", "認知再構成・問題解決は記録後に「続きから」で再開できる", "対処後の振り返りまで書くと完了になる"],
          },
          {
            Icon: IconBrain,
            title: "認知再構成",
            purpose: "ストレスを感じたときの自動的な思考パターンに気づき、バランスのとれた見方を見つけるための機能",
            usage: ["3コラム：感情・自動思考・バランス思考をシンプルに整理", "7コラム：より詳しく、根拠・反証・認知のクセまで掘り下げる", "ストレス記録からアプローチとして選んで使う"],
            points: ["慣れないうちは3コラムから始めるのがおすすめ", "認知のクセに気づくだけでも十分な効果がある", "途中で止めても「続きから」で再開できる"],
          },
          {
            Icon: IconListCheck,
            title: "問題解決技法",
            purpose: "漠然とした悩みや困りごとを整理して、具体的な行動プランを立てるための機能",
            usage: ["困りごとを細かく分解して整理", "対処できそうなものを選んで解決策を考える", "いつやるかを決めて行動に移す", "後日、結果と気づきを振り返りとして記録する"],
            points: ["問題が大きく感じるときほど、小さく分解するのが大事", "完璧な解決策でなくていい、試してみることが大切", "振り返りまで書くと完了になる"],
          },
          {
            Icon: IconBulb,
            title: "コーピング",
            purpose: "つらいときや気分を切り替えたいときに使える対処法をリスト化して、すぐに実践できるようにするための機能",
            usage: ["コーピングリストに自分なりの対処法を登録", "難易度・効果で整理してソートできる", "ストレス記録からアプローチとして選ぶか、コーピング一覧から直接実践できる", "実践後に効果を記録して振り返れる"],
            points: ["調子が悪いときほど考える余裕がないので、事前にリストを充実させておくのがおすすめ", "難易度が低いものから試してみよう", "効果の記録を続けると、自分に合うコーピングがわかってくる"],
          },
          {
            Icon: IconStar,
            title: "できたことログ",
            purpose: "毎日の小さな達成や良かったことを記録して、自己肯定感を育てるための機能",
            usage: ["今日できたことを自由に記録", "カレンダーで過去の記録を振り返れる", "連続記録日数で継続のモチベーションを確認できる"],
            points: ["大きなことでなくていい、「朝ごはんを食べた」「外に出られた」でも十分", "調子が悪い日こそ、小さなことを記録してみよう", "積み重ねた記録が自信につながっていく"],
          },
          {
            Icon: IconLeaf,
            title: "マインドフルネス",
            purpose: "今この瞬間に意識を向けて、気持ちを落ち着かせるための機能",
            usage: ["1・3・5・7・10分から時間を選んでタイマーをスタート", "ホワイトノイズのBGMを流しながら瞑想できる", "終了時にベル音で知らせてくれる"],
            points: ["慣れないうちは1〜3分から始めるのがおすすめ", "呼吸に意識を向けるだけでOK、うまくやろうとしなくていい", "気分が落ち着かないとき、寝る前のリラックスにも使える"],
          },
          {
            Icon: IconShield,
            title: "クライシスプラン",
            purpose: "調子が悪くなったときに備えて、自分の状態のサインや対処法・連絡先をあらかじめ整理しておくための機能",
            usage: ["SAFE：安定しているときの自分の状態を記録", "CAUTION：調子が崩れるサインや引き金になることを記録", "CRISIS：危機状態のサインと連絡先を記録", "PDF出力して診察に持参することもできる"],
            points: ["調子が良いときに作っておくのが大事", "主治医や支援者と一緒に内容を確認するとより効果的", "いざというときにすぐ見られるように、内容を定期的に見直そう"],
          },
          {
            Icon: IconMessage,
            title: "伝えたいことメモ",
            purpose: "診察や面談で伝えたいことを事前に整理して、言いたいことをちゃんと伝えられるようにするための機能",
            usage: ["伝えたいことを自由に記入", "誰に伝えるかを登録済みの人物から選ぶ", "診察・面談中に伝えた人にチェックをつける", "チェック後にその人から言われたことを記録できる", "全員チェック済みで完了になる"],
            points: ["緊張すると言いたいことを忘れがち、事前にメモしておくと安心", "完了したメモは診察等の記録に自動的に反映される", "人物はあらかじめ登録しておくと毎回選ぶだけでOK"],
          },
          {
            Icon: IconStethoscope,
            title: "Bridge Session",
            purpose: "診察や面談の場で、自分の記録を見ながら支援者と話せるようにするための機能",
            usage: ["誰との話かを選んでSessionを開始", "気分グラフ・睡眠・ストレス記録・伝えたいことメモなど表示する項目をカスタマイズできる", "Session中にその場でメモを取れる", "メモを保存すると伝えたいことメモの回答欄に自動で記録される"],
            points: ["診察室でそのままスマホを見せながら話せる", "「うまく説明できない」「何を話せばいいかわからない」というときに特に役立つ", "表示項目は自分に合わせてカスタマイズしよう"],
          },
          {
            Icon: IconNotes,
            title: "診察等の記録",
            purpose: "主治医・精神保健福祉士・カウンセラーなど、支援者ごとのやりとりの履歴を振り返るための機能",
            usage: ["登録した人物ごとにタブで切り替えて記録を確認", "伝えたいことメモで完了したものが自動的に反映される", "言われたことや伝えたことを時系列で振り返れる"],
            points: ["別途記録しなくても伝えたいことメモと自動で同期される", "「あのとき何を言われたっけ？」という振り返りに役立つ", "Bridge Sessionのメモも合わせて確認できる"],
          },
          {
            Icon: IconDownload,
            title: "データのバックアップ",
            purpose: "記録したデータをファイルに保存して、機種変更やアプリの再インストール時にデータを引き継げるようにするための機能",
            usage: ["設定画面から「バックアップファイルを作成」でJSONファイルをダウンロード", "機種変更時や新しい端末では「ファイルを選んで復元」で読み込む", "ブラウザからPWAに移行するときにも使える"],
            points: ["データはこの端末にのみ保存されるため、定期的なバックアップがおすすめ", "バックアップファイルはiCloudやGoogleドライブなどに保存しておくと安心", "復元後は画面を再読み込みするとデータが反映される"],
          },
        ];
        return (
          <div className="page" style={{ padding: "20px 16px" }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
              各機能の使い方をまとめました。タップして詳細を確認できます。
            </div>
            {GUIDE_ITEMS.map((item, i) => {
              const isOpen = guideOpenIndex === i;
              return (
                <div key={i} style={{ background: COLORS.surface, borderRadius: 14, marginBottom: 8, border: `1px solid ${isOpen ? COLORS.accent + "60" : COLORS.border}`, overflow: "hidden", transition: "border-color 0.2s" }}>
                  <button
                    onClick={() => setGuideOpenIndex(isOpen ? null : i)}
                    style={{ width: "100%", background: "none", border: "none", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
                    <item.Icon size={20} color={isOpen ? COLORS.accent : COLORS.textMuted} />
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: isOpen ? COLORS.accent : COLORS.text }}>{item.title}</div>
                    {isOpen ? <IconChevronUp size={16} color={COLORS.textMuted} /> : <IconChevronDown size={16} color={COLORS.textMuted} />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12, paddingTop: 4, borderTop: `1px solid ${COLORS.border}` }}>
                        <span style={{ paddingTop: 8, display: "block" }}>{item.purpose}</span>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>使い方</div>
                        {item.usage.map((u, j) => (
                          <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                            <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.accent, marginTop: 7, flexShrink: 0 }} />
                            <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>{u}</div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.psAccent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>ポイント</div>
                        {item.points.map((p, j) => (
                          <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                            <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.psAccent, marginTop: 7, flexShrink: 0 }} />
                            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>{p}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ background: COLORS.surface, borderRadius: 14, marginTop: 16, padding: "14px 16px", border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <IconDeviceMobile size={16} color={COLORS.textMuted} />
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>Androidをお使いの方へ</div>
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7 }}>
                Androidをお使いの方は、スワイプでの戻る操作ではなく、画面内の「戻る」ボタンをご利用ください。
              </div>
            </div>
            <BottomNav onHome={() => { setView("home"); setActiveTab("home"); }} />
          </div>
        );
      })()}

      {/* LIST */}
      {view === "list" && (
        <div className="page" style={{ padding: "20px 16px" }}>
          <button onClick={() => setView("new")} style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, color: "#0f1117", fontSize: 15, fontWeight: 700, padding: 14, cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <IconPlus size={18} />ストレスを記録する
          </button>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
            {[
              { v: "newest", label: "新しい順" },
              { v: "oldest", label: "古い順" },
              { v: "incomplete", label: "未完了優先" },
              { v: "complete", label: "完了優先" },
            ].map(({ v, label }) => (
              <button key={v} onClick={() => setRecordSort(v)}
                style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 20, border: `1px solid ${recordSort === v ? COLORS.accent : COLORS.border}`, background: recordSort === v ? COLORS.accentSoft : "none", color: recordSort === v ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
          {records.length === 0 && (
            <div style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 60, fontSize: 14, lineHeight: 2 }}>まだ記録がありません。<br />上のボタンから追加できます</div>
          )}
          {(() => {
            const sortedRecords = [...records].sort((a, b) => {
              if (recordSort === "newest") return (b.date || "").localeCompare(a.date || "");
              if (recordSort === "oldest") return (a.date || "").localeCompare(b.date || "");
              if (recordSort === "incomplete") return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
              if (recordSort === "complete") return (b.completed ? 1 : 0) - (a.completed ? 1 : 0);
              return 0;
            });
            return (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sortedRecords.slice(0, visibleCount).map((rec) => (
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
                    {(rec.category || rec.intensity) && (
                      <div style={{ display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
                        {rec.category && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: COLORS.accentSoft, color: COLORS.accentText }}>{rec.category}</span>}
                        {rec.intensity && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textMuted }}>{rec.intensity}</span>}
                      </div>
                    )}
                    <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5, color: rec.completed ? COLORS.textMuted : COLORS.text, textDecoration: rec.completed ? "line-through" : "none" }}>
                      {rec.situation}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTargetId(rec.id); }}
                    style={{ flexShrink: 0, marginTop: 2, background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1, opacity: 0.5 }}
                  >×</button>
                </div>
                {(() => {
                  const hasCopingPending = rec.copingStatus === "pending";
                  const hasCopingDone = rec.copingStatus === "done";
                  const hasPsPlanned = rec.ps?.status === "planned";
                  const hasPsDone = rec.ps?.status === "done";
                  const hasAnyApproach = (rec.cbt && Object.keys(rec.cbt).length > 0) || (rec.ps && Object.keys(rec.ps).length > 0) || rec.copingStatus;
                  const showApproach = !rec.completed && !hasCopingPending && !hasCopingDone && !hasPsPlanned && !hasPsDone;
                  return (
                    <div>
                      {hasCopingPending && (
                        <button onClick={() => startCopingReview(rec.id)}
                          style={{ marginTop: 10, width: "100%", background: "#e0a85510", border: `1px solid #e0a85540`, borderRadius: 8, color: "#e0a855", fontSize: 13, fontWeight: 700, padding: "10px", cursor: "pointer" }}>
                          🕐 コーピングの効果を記録する
                        </button>
                      )}
                      {hasCopingDone && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "#e0a855", display: "flex", alignItems: "center", gap: 4 }}>✓ コーピング：{rec.copingReview}</div>
                      )}
                      {hasPsPlanned && (
                        <button onClick={() => startPsReview(rec.id)}
                          style={{ marginTop: 10, width: "100%", background: "#818cf810", border: `1px solid #818cf840`, borderRadius: 8, color: "#818cf8", fontSize: 13, fontWeight: 700, padding: "10px", cursor: "pointer" }}>
                          🕐 振り返りを記録する
                        </button>
                      )}
                      {hasPsDone && (
                        <div style={{ marginTop: 8, fontSize: 12, color: COLORS.accent, display: "flex", alignItems: "center", gap: 4 }}>✓ 振り返り完了</div>
                      )}
                      {showApproach && (
                        <button onClick={() => startApproach(rec.id)} style={{ marginTop: 12, width: "100%", background: COLORS.accentSoft, border: "none", borderRadius: 8, color: COLORS.accentText, fontSize: 13, fontWeight: 700, padding: "10px", cursor: "pointer" }}>
                          {hasAnyApproach ? "続きから →" : "アプローチを選ぶ →"}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
            );
          })()}
          {records.length > visibleCount && (
            <button onClick={() => setVisibleCount(visibleCount + 10)}
              style={{ width: "100%", background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 13, padding: 12, cursor: "pointer", marginTop: 10 }}>
              もっと見る（残り{records.length - visibleCount}件）
            </button>
          )}
          <BottomNav onBack={() => { setView("records"); setActiveTab("records"); }} onHome={() => { setView("home"); setActiveTab("home"); }} />
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
              <button onClick={() => { if (copingSort === "difficulty") { setCopingSortDir(d => d === "asc" ? "desc" : "asc"); } else { setCopingSort("difficulty"); setCopingSortDir("asc"); } }}
                style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${copingSort === "difficulty" ? COLORS.accent : COLORS.border}`, background: copingSort === "difficulty" ? COLORS.accentSoft : COLORS.surface, color: copingSort === "difficulty" ? COLORS.accentText : COLORS.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                難易度順 {copingSort === "difficulty" ? (copingSortDir === "asc" ? "↑" : "↓") : ""}
              </button>
              <button onClick={() => { if (copingSort === "effect") { setCopingSortDir(d => d === "asc" ? "desc" : "asc"); } else { setCopingSort("effect"); setCopingSortDir("desc"); } }}
                style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${copingSort === "effect" ? COLORS.accent : COLORS.border}`, background: copingSort === "effect" ? COLORS.accentSoft : COLORS.surface, color: copingSort === "effect" ? COLORS.accentText : COLORS.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                効果順 {copingSort === "effect" ? (copingSortDir === "asc" ? "↑" : "↓") : ""}
              </button>
            </div>
          )}

          {copings.length === 0 && (
            <div style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 60, fontSize: 14, lineHeight: 2 }}>
              まだコーピングが登録されていません。<br />上のボタンから追加できます
              <div style={{ marginTop: 16 }}>
                <button onClick={() => setCopingGuidePrompt(true)}
                  style={{ background: COLORS.accentSoft, border: `1px solid ${COLORS.accent}40`, borderRadius: 10, color: COLORS.accentText, fontSize: 13, fontWeight: 700, padding: "10px 20px", cursor: "pointer" }}>
                  書き方ガイドを見る
                </button>
              </div>
            </div>
          )}

          {(() => {
            const pendingCopingReviews = records.filter(r => r.copingStatus === "pending").length;
            return pendingCopingReviews > 0 ? (
              <button onClick={() => setView("list")}
                style={{ width: "100%", background: "#e0a85515", border: `1px solid #e0a85540`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, cursor: "pointer", textAlign: "left", display: "block" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e0a855" }}>🕐 振り返りが{pendingCopingReviews}件あります</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>ストレス記録に戻って効果を記録しよう</div>
              </button>
            ) : null;
          })()}

          <div key={copingSort} className="page" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sortedCopings.map((c) => (
              <div key={c.id} id={`coping-${c.id}`} style={{ background: COLORS.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, fontSize: 15, lineHeight: 1.6, color: COLORS.text, cursor: "pointer" }} onClick={() => { setCopingDetailId(c.id); setView("copingDetail"); }}>{c.text}</div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                    {c.pendingPractice && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "#e0a85520", border: `1px solid #e0a85540`, color: "#e0a855", whiteSpace: "nowrap" }}>振り返りがまだ</span>
                    )}
                    <button onClick={() => { setCopingEditId(c.id); setCopingEditText(c.text); setCopingEditDifficulty(c.difficulty); setCopingEditEffect(c.effect); }}
                      style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: "4px 10px" }}>編集</button>
                    <button onClick={() => setCopingDeleteId(c.id)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 18, padding: "0 2px", opacity: 0.5 }}>×</button>
                  </div>
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
                {c.pendingPractice && (
                  <button onClick={() => { setCopingPracticeId(c.id); setCopingPracticeResult(null); }}
                    style={{ marginTop: 10, width: "100%", background: "#e0a85510", border: `1px solid #e0a85540`, borderRadius: 8, color: "#e0a855", fontSize: 13, fontWeight: 700, padding: "10px", cursor: "pointer" }}>
                    振り返りを記録する
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* コーピング削除確認 */}
          {copingDeleteId && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 300 }}>
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
          {copingEditId && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300 }}>
              <div style={{ background: COLORS.surface, borderRadius: "16px 16px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 480, boxSizing: "border-box" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>コーピングを編集</div>
                <textarea rows={3} style={{ ...inpStyle(), marginBottom: 16 }} value={copingEditText} onChange={e => setCopingEditText(e.target.value)} />
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>難易度（1〜5）</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setCopingEditDifficulty(n)}
                        style={{ flex: 1, height: 40, borderRadius: 10, border: `2px solid ${copingEditDifficulty === n ? COLORS.accent : COLORS.border}`, background: copingEditDifficulty === n ? COLORS.accentSoft : COLORS.surface, color: copingEditDifficulty === n ? COLORS.accentText : COLORS.text, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>効果（1〜5）</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setCopingEditEffect(n)}
                        style={{ flex: 1, height: 40, borderRadius: 10, border: `2px solid ${copingEditEffect === n ? COLORS.accent : COLORS.border}`, background: copingEditEffect === n ? COLORS.accentSoft : COLORS.surface, color: copingEditEffect === n ? COLORS.accentText : COLORS.text, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setCopingEditId(null)}
                    style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>キャンセル</button>
                  <button onClick={() => {
                    if (!copingEditText.trim() || !copingEditDifficulty || !copingEditEffect) return;
                    const updated = copings.map(c => c.id === copingEditId ? { ...c, text: copingEditText.trim(), difficulty: copingEditDifficulty, effect: copingEditEffect } : c);
                    setCopings(updated); saveCopings(updated); setCopingEditId(null);
                  }} disabled={!copingEditText.trim() || !copingEditDifficulty || !copingEditEffect}
                    style={{ flex: 2, background: copingEditText.trim() && copingEditDifficulty && copingEditEffect ? COLORS.accent : COLORS.border, border: "none", borderRadius: 10, color: copingEditText.trim() && copingEditDifficulty && copingEditEffect ? "#0f1117" : COLORS.textMuted, fontSize: 14, fontWeight: 700, padding: 12, cursor: "pointer" }}>保存する</button>
                </div>
              </div>
            </div>
          )}
          {copings.length > 0 && (
            <button className="no-print" onClick={handleCopingPrint}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: 700, padding: 14, cursor: "pointer", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <IconDownload size={16} />PDFとして保存する
            </button>
          )}
          <BottomNav onBack={() => { setView("tools"); setActiveTab("tools"); }} onHome={() => { setView("home"); setActiveTab("home"); }} />
        </div>
      )}

      {view === "copingDetail" && (() => {
        const c = copings.find(x => x.id === copingDetailId);
        if (!c) return null;
        return (
          <div className="page" style={{ padding: "20px 16px" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 12, lineHeight: 1.5 }}>{c.text}</div>
            <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>難易度 <span style={{ fontWeight: 700, color: COLORS.text }}>{c.difficulty}</span><span style={{ color: COLORS.border }}> / 5</span></div>
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>効果 <span style={{ fontWeight: 700, color: COLORS.text }}>{c.effect}</span><span style={{ color: COLORS.border }}> / 5</span></div>
            </div>
            {c.pendingPractice ? (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 8, background: "#e0a85520", border: `1px solid #e0a85540`, color: "#e0a855", fontWeight: 700 }}>振り返りがまだ</span>
                </div>
                <button onClick={() => { setCopingPracticeId(c.id); setCopingPracticeResult(null); }}
                  style={{ width: "100%", background: "#e0a85510", border: `1px solid #e0a85540`, borderRadius: 10, color: "#e0a855", fontSize: 14, fontWeight: 700, padding: 14, cursor: "pointer" }}>
                  振り返りを記録する
                </button>
              </div>
            ) : (
              <button onClick={() => startPractice(c.id)}
                style={{ width: "100%", background: COLORS.accentSoft, border: "none", borderRadius: 10, color: COLORS.accentText, fontSize: 14, fontWeight: 700, padding: 14, cursor: "pointer", marginBottom: 24 }}>
                実践する
              </button>
            )}
            {c.practices?.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${COLORS.border}` }}>過去の実践記録</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...c.practices].reverse().map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.surface, borderRadius: 10, padding: "10px 14px", border: `1px solid ${COLORS.border}` }}>
                      <span style={{ fontSize: 13, color: COLORS.textMuted }}>{p.date}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: p.result === "よかった" ? COLORS.success : p.result === "あまり効かなかった" ? COLORS.textMuted : COLORS.text }}>{p.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <BottomNav onBack={() => { setCopingDetailId(null); setView("coping"); }} onHome={() => { setView("home"); setActiveTab("home"); }} />
          </div>
        );
      })()}

      {/* 実践モーダル */}
      {copingPracticeId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 300 }}>
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>どうだった？</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {["よかった", "普通", "あまり効かなかった"].map(r => (
                <button key={r} onClick={() => setCopingPracticeResult(r)}
                  style={{ padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${copingPracticeResult === r ? COLORS.accent : COLORS.border}`, background: copingPracticeResult === r ? COLORS.accentSoft : COLORS.bg, color: copingPracticeResult === r ? COLORS.accentText : COLORS.text, fontSize: 14, fontWeight: copingPracticeResult === r ? 700 : 400, cursor: "pointer" }}>
                  {r}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setCopingPracticeId(null); setCopingPracticeResult(null); }}
                style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>キャンセル</button>
              <button onClick={() => saveCopingPractice(copingPracticeId, copingPracticeResult)}
                disabled={!copingPracticeResult}
                style={{ flex: 2, background: copingPracticeResult ? COLORS.accent : COLORS.border, border: "none", borderRadius: 10, color: copingPracticeResult ? "#0f1117" : COLORS.textMuted, fontSize: 14, fontWeight: 700, padding: 12, cursor: copingPracticeResult ? "pointer" : "default" }}>
                記録する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW COPING */}
      {view === "newCoping" && (
        <div className="page" style={{ padding: "24px 16px" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>どんな対処法？</div>
            <textarea rows={4} style={inpStyle()} placeholder="例）散歩に出かける、好きな音楽を聴く、深呼吸を10回する" value={newCoping.text} onChange={(e) => setNewCoping({ ...newCoping, text: e.target.value })} />
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

          {crisisPlan.safe.length === 0 && crisisPlan.caution_triggers.length === 0 && crisisPlan.caution_signs.length === 0 && crisisPlan.crisis_signs.length === 0 && crisisPlan.crisis_contacts.length === 0 && (
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <button onClick={() => setCrisisGuidePrompt(true)}
                style={{ background: COLORS.accentSoft, border: `1px solid ${COLORS.accent}40`, borderRadius: 10, color: COLORS.accentText, fontSize: 13, fontWeight: 700, padding: "10px 20px", cursor: "pointer" }}>
                書き方ガイドを見る
              </button>
            </div>
          )}

          {/* タブ */}
          <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 24 }}>
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
            <div key="safe" className="page no-print" style={{ marginBottom: 24 }}>
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
                      style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: "4px 10px" }}>編集</button>
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
            <div key="caution" className="page no-print" style={{ marginBottom: 24 }}>
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
                          style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: "4px 10px" }}>編集</button>
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
                          style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: "4px 10px" }}>編集</button>
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
            <div key="crisis" className="page no-print" style={{ marginBottom: 24 }}>
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
                          style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: "4px 10px" }}>編集</button>
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
                          style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: "pointer", fontSize: 12, padding: "4px 10px" }}>編集</button>
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

          <button className="no-print" onClick={handleCrisisPrint}
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: 700, padding: 14, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <IconDownload size={16} />PDFとして保存する
          </button>

          <BottomNav onBack={() => { setView("tools"); setActiveTab("tools"); }} onHome={() => { setView("home"); setActiveTab("home"); }} />

          {/* 入力モーダル */}
          {crisisModal && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
              <div style={{ background: COLORS.surface, borderRadius: 16, width: "90%", maxWidth: 480, maxHeight: "70vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* スクロール可能なコンテンツ */}
                <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>
                    {crisisModal.type === "safe" && "安定しているときの状態"}
                    {crisisModal.type === "caution_triggers" && "トリガー"}
                    {crisisModal.type === "caution_signs" && "注意サイン"}
                    {crisisModal.type === "crisis_signs" && "危機のサイン"}
                    {crisisModal.type === "crisis_contacts" && "対処法・連絡先"}
                  </div>
                  <textarea rows={3} style={{ ...inpStyle(), marginBottom: 10 }}
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
                    <textarea rows={2} style={inpStyle()}
                      placeholder="対処法を書いておこう"
                      value={crisisModal.text2}
                      onChange={(e) => setCrisisModal({ ...crisisModal, text2: e.target.value })}
                    />
                  )}
                </div>
                {/* 常時表示のボタン */}
                <div style={{ flexShrink: 0, padding: 16, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 12 }}>
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
      {view === "checkinHistory" && (() => {
        const moodColor = (mood) => mood >= 7 ? COLORS.accent : mood >= 4 ? "#e0a855" : COLORS.danger;

        // 期間分のデータを生成
        const periodCheckins = Array.from({ length: graphPeriod }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (graphPeriod - 1 - i));
          const y = String(d.getFullYear());
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const dateStr = toDateStr(y, m, day);
          const found = checkins.find((c) => c.date === dateStr);
          return { date: dateStr, data: found || null, label: `${parseInt(m)}/${parseInt(day)}` };
        });

        // 今週（月曜〜今日）のデータを集計
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          return toDateStr(String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0"));
        });
        const weekCheckins = checkins.filter(c => weekDates.includes(c.date));
        const moodCheckins = weekCheckins.filter(c => typeof c.mood === "number");
        const avgMood = moodCheckins.length > 0 ? (moodCheckins.reduce((s, c) => s + c.mood, 0) / moodCheckins.length).toFixed(1) : null;
        const weekRecords = records.filter(r => {
          const rd = new Date(r.date);
          return rd >= monday && rd <= now;
        });
        const cbtCount = weekRecords.filter(r => r.cbt && Object.keys(r.cbt).length > 0).length;
        const psCount = weekRecords.filter(r => r.ps && Object.keys(r.ps).length > 0).length;
        const copingCount = weekRecords.filter(r => r.coping).length;
        const stressCount = weekRecords.length;

        // 感情集計（今週のCBT記録から）
        const emotionMap = {};
        weekRecords.forEach(r => {
          const emotionStr = r.cbt?.emotion || r.cbt?.emotion3 || "";
          emotionStr.split("、").forEach(e => {
            const match = e.trim().match(/^(.+?)\s*\d+%$/);
            if (match) {
              const name = match[1].trim();
              emotionMap[name] = (emotionMap[name] || 0) + 1;
            }
          });
        });
        const topEmotions = Object.entries(emotionMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

        const hasData = periodCheckins.some(c => c.data);
        const W = 340, H = 140, YPAD = 20, CHART_L = 28, CHART_R = 28;
        const CHART_W = W - CHART_L - CHART_R;

        const conditionScore = (c) => c === "とても良い" ? 5 : c === "良い" ? 4 : c === "普通" ? 3 : c === "悪い" ? 2 : c === "とても悪い" ? 1 : null;
        const sleepScore = (s) => s === "4時間未満" ? 1 : s === "4〜6時間未満" ? 2 : s === "6〜8時間未満" ? 3 : s === "8時間以上" ? 4 : null;
        const metricColor = (v, m) => {
          if (m === "mood") return moodColor(v);
          if (m === "condition") return v >= 4 ? COLORS.accent : v >= 3 ? "#e0a855" : COLORS.danger;
          return v >= 3 ? COLORS.accent : v === 2 ? "#e0a855" : COLORS.danger;
        };
        const getMetricValue = (data, m) => {
          if (!data) return null;
          if (m === "mood") return data.mood ?? null;
          if (m === "condition") return conditionScore(data.condition);
          return sleepScore(data.sleep);
        };
        const metricMax = graphMetric === "mood" ? 10 : graphMetric === "condition" ? 5 : 4;
        const barW = Math.max(4, CHART_W / graphPeriod * 0.6);

        const dataPoints = periodCheckins.map((c, i) => {
          const val = getMetricValue(c.data, graphMetric);
          return {
            x: CHART_L + barW / 2 + (i / Math.max(graphPeriod - 1, 1)) * (CHART_W - barW),
            y: val !== null ? H - YPAD - ((val - 1) / (metricMax - 1)) * (H - YPAD * 2) : null,
            val,
            label: c.label,
          };
        });

        return (
          <div className="page" style={{ padding: "20px 16px" }}>
            {/* タブ */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[{ v: "graph", label: "グラフ" }, { v: "report", label: "週次レポート" }, { v: "list", label: "一覧" }].map(({ v, label }) => (
                <button key={v} onClick={() => setHistoryTab(v)}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1.5px solid ${historyTab === v ? COLORS.accent : COLORS.border}`, background: historyTab === v ? COLORS.accentSoft : COLORS.surface, color: historyTab === v ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* グラフタブ */}
            {historyTab === "graph" && (
              <div key="graph" className="page">
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 4, flex: 2 }}>
                    {[{ v: "mood", label: "気分" }, { v: "condition", label: "体調" }, { v: "sleep", label: "睡眠" }].map(({ v, label }) => (
                      <button key={v} onClick={() => setGraphMetric(v)}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${graphMetric === v ? COLORS.accent : COLORS.border}`, background: graphMetric === v ? COLORS.accentSoft : COLORS.surface, color: graphMetric === v ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 4, flex: 1 }}>
                    {[{ v: 14, label: "2週間" }, { v: 30, label: "1ヶ月" }].map(({ v, label }) => (
                      <button key={v} onClick={() => setGraphPeriod(v)}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${graphPeriod === v ? COLORS.accent : COLORS.border}`, background: graphPeriod === v ? COLORS.accentSoft : COLORS.surface, color: graphPeriod === v ? COLORS.accent : COLORS.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px", marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
                  {!hasData ? (
                    <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 13, padding: "40px 0" }}>まだ記録がありません</div>
                  ) : (
                    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
                      {/* グリッド線（背面） */}
                      {Array.from({ length: metricMax }, (_, i) => i + 1).map(v => {
                        const y = H - YPAD - ((v - 1) / (metricMax - 1)) * (H - YPAD * 2);
                        return <line key={`grid-${v}`} x1={CHART_L} y1={y} x2={W - CHART_R} y2={y} stroke={COLORS.border} strokeWidth="0.5" />;
                      })}
                      {/* 棒グラフ */}
                      {dataPoints.map((p, i) => {
                        if (p.val === null) return null;
                        return <rect key={i} x={p.x - barW / 2} y={p.y} width={barW} height={H - YPAD - p.y} fill={metricColor(p.val, graphMetric)} opacity="0.8" rx="2" />;
                      })}
                      {/* Y軸ラベル（棒の上面に重なるよう最前面に） */}
                      {Array.from({ length: metricMax }, (_, i) => i + 1).map(v => {
                        const y = H - YPAD - ((v - 1) / (metricMax - 1)) * (H - YPAD * 2);
                        return <text key={`label-${v}`} x={CHART_L - 4} y={y} textAnchor="end" dominantBaseline="middle" fill={COLORS.textMuted} fontSize="8">{v}</text>;
                      })}
                      {/* 日付ラベル */}
                      {dataPoints.filter((_, i) => graphPeriod === 14 ? i % 2 === 0 : i % 5 === 0).map((p, i) => (
                        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fill={COLORS.textMuted} fontSize="7">{p.label}</text>
                      ))}
                    </svg>
                  )}
                </div>
              </div>
            )}

            {/* 週次レポートタブ */}
            {historyTab === "report" && (() => {
              const rNow = new Date();
              const rDow = rNow.getDay();
              const thisMonday = new Date(rNow);
              thisMonday.setDate(rNow.getDate() - (rDow === 0 ? 6 : rDow - 1));
              thisMonday.setHours(0, 0, 0, 0);
              const rMonday = new Date(thisMonday);
              rMonday.setDate(thisMonday.getDate() + reportWeekOffset * 7);
              const rSunday = new Date(rMonday);
              rSunday.setDate(rMonday.getDate() + 6);
              const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
              const weekLabel = `${fmt(rMonday)}〜${fmt(rSunday)}`;
              const rWeekDates = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(rMonday);
                d.setDate(rMonday.getDate() + i);
                return toDateStr(String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0"));
              });
              const rCheckins = checkins.filter(c => rWeekDates.includes(c.date));
              const rAvgMood = rCheckins.length > 0 ? (rCheckins.reduce((s, c) => s + c.mood, 0) / rCheckins.length).toFixed(1) : null;
              const rRecords = records.filter(r => {
                const rd = new Date(r.date + "T00:00:00");
                return rd >= rMonday && rd <= rSunday;
              });
              const rCbtCount = rRecords.filter(r => r.cbt && Object.keys(r.cbt).length > 0).length;
              const rPsCount = rRecords.filter(r => r.ps && Object.keys(r.ps).length > 0).length;
              const rCopingCount = rRecords.filter(r => r.coping).length;
              const rStressCount = rRecords.length;
              const rEmotionMap = {};
              rRecords.forEach(r => {
                const emotionStr = r.cbt?.emotion || r.cbt?.emotion3 || "";
                emotionStr.split("、").forEach(e => {
                  const match = e.trim().match(/^(.+?)\s*\d+%$/);
                  if (match) { rEmotionMap[match[1].trim()] = (rEmotionMap[match[1].trim()] || 0) + 1; }
                });
              });
              const rTopEmotions = Object.entries(rEmotionMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
              const hasAnyData = rCheckins.length > 0 || rStressCount > 0;
              const handleWeeklyPrint = () => {
                const today = `${t.year}年${parseInt(t.month)}月${parseInt(t.day)}日`;
                const recHtml = rRecords.map(r => {
                  const dets = [
                    r.cbt?.emotion ? '感情：' + r.cbt.emotion : '',
                    r.cbt?.autoThought ? '自動思考：' + r.cbt.autoThought.replace(/\n/g, ' / ') : '',
                    r.cbt?.balanced ? 'バランス思考：' + r.cbt.balanced : '',
                    r.ps?.target ? '取り組んだ問題：' + r.ps.target : '',
                    r.coping ? 'コーピング：' + r.coping : '',
                  ].filter(Boolean).join('<br>');
                  return '<li style="margin-bottom:10px;"><span style="font-size:11px;color:#888;">' + formatDate(r.date) + '</span><br><strong>' + r.situation + '</strong>' + (dets ? '<br>' + dets : '') + '</li>';
                }).join('');
                const html = '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>週次レポート</title><style>'
                  + 'body{font-family:\'Hiragino Kaku Gothic ProN\',\'Noto Sans JP\',sans-serif;background:#fff;color:#111;padding:32px;max-width:600px;margin:0 auto;}'
                  + 'h1{font-size:22px;font-weight:700;margin:0 0 4px;}'
                  + '.meta{font-size:12px;color:#888;margin-bottom:28px;}'
                  + 'h2{font-size:14px;font-weight:700;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #ddd;}'
                  + 'ul{list-style:none;padding:0;margin:0;}'
                  + 'li{font-size:13px;line-height:1.9;}'
                  + 'li::before{content:"・";}'
                  + '.muted{color:#999;}'
                  + '</style></head><body>'
                  + '<h1>週次レポート</h1>'
                  + '<div class="meta">' + weekLabel + '　出力日：' + today + '</div>'
                  + '<h2>気分スコア</h2><ul><li>' + (rAvgMood ? rAvgMood + ' / 10（チェックイン ' + rCheckins.length + '回 / 7日）' : '<span class="muted">記録なし</span>') + '</li></ul>'
                  + '<h2>取り組み</h2><ul>'
                  + '<li>ストレス記録：' + rStressCount + '回</li>'
                  + '<li>認知再構成：' + rCbtCount + '回</li>'
                  + '<li>問題解決技法：' + rPsCount + '回</li>'
                  + '<li>コーピング：' + rCopingCount + '回</li>'
                  + '</ul>'
                  + (rTopEmotions.length > 0 ? '<h2>よく出た感情</h2><ul>' + rTopEmotions.map(([n, c]) => '<li>' + n + '（' + c + '回）</li>').join('') + '</ul>' : '')
                  + (rRecords.length > 0 ? '<h2>ストレス記録</h2><ul>' + recHtml + '</ul>' : '')
                  + '</body></html>';
                printHtml(html);
              };
              return (
                <div key="report" className="page">
                  {/* 週ナビゲーション */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, background: COLORS.surface, borderRadius: 10, padding: "10px 14px", border: `1px solid ${COLORS.border}` }}>
                    <button onClick={() => setReportWeekOffset(reportWeekOffset - 1)}
                      style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 20, cursor: "pointer", padding: "0 8px", lineHeight: 1 }}>←</button>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{weekLabel}</div>
                    <button onClick={() => setReportWeekOffset(reportWeekOffset + 1)}
                      disabled={reportWeekOffset >= 0}
                      style={{ background: "none", border: "none", color: reportWeekOffset >= 0 ? COLORS.border : COLORS.accent, fontSize: 20, cursor: reportWeekOffset >= 0 ? "default" : "pointer", padding: "0 8px", lineHeight: 1 }}>→</button>
                  </div>

                  {!hasAnyData ? (
                    <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 13, padding: "40px 0" }}>この週の記録はありません</div>
                  ) : (
                    <>
                      {/* 気分スコア */}
                      <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px 18px", marginBottom: 12, border: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>気分</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                          {rAvgMood ? (
                            <>
                              <div style={{ fontSize: 36, fontWeight: 700, color: COLORS.accent }}>{rAvgMood}</div>
                              <div style={{ fontSize: 13, color: COLORS.textMuted }}>/ 10　平均気分スコア</div>
                            </>
                          ) : (
                            <div style={{ fontSize: 13, color: COLORS.textMuted }}>この週のチェックインがありません</div>
                          )}
                        </div>
                        {rAvgMood && (
                          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6 }}>チェックイン {rCheckins.length}回 / 7日</div>
                        )}
                      </div>

                      {/* 取り組み回数 */}
                      <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px 18px", marginBottom: 12, border: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>この週の取り組み</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {[
                            { label: "ストレス記録", count: rStressCount, color: COLORS.accent },
                            { label: "認知再構成", count: rCbtCount, color: COLORS.accent },
                            { label: "問題解決技法", count: rPsCount, color: "#818cf8" },
                            { label: "コーピング", count: rCopingCount, color: "#e0a855" },
                          ].map(({ label, count, color }) => (
                            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ fontSize: 13, color: COLORS.textMuted, minWidth: 100 }}>{label}</div>
                              <div style={{ flex: 1, height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: count > 0 ? `${Math.min(count / 7 * 100, 100)}%` : "0%", height: "100%", background: color, borderRadius: 3, transition: "width 0.5s" }} />
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: count > 0 ? color : COLORS.textMuted, minWidth: 24, textAlign: "right" }}>{count}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* よく出た感情 */}
                      {rTopEmotions.length > 0 && (
                        <div style={{ background: COLORS.surface, borderRadius: 14, padding: "16px 18px", marginBottom: 12, border: `1px solid ${COLORS.border}` }}>
                          <div style={{ fontSize: 11, color: "#e0a855", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>よく出た感情</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {rTopEmotions.map(([name, count]) => (
                              <div key={name} style={{ padding: "6px 14px", borderRadius: 20, background: COLORS.bg, border: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.textMuted }}>
                                {name} <span style={{ fontSize: 11 }}>{count}回</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* エクスポートボタン */}
                  <button className="no-print" onClick={handleWeeklyPrint}
                    style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: 700, padding: 14, cursor: "pointer", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <IconDownload size={16} />PDFとして保存する
                  </button>
                </div>
              );
            })()}

            {/* 一覧タブ */}
            {historyTab === "list" && (() => {
              const allCheckins = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
              const todayStr2 = toDateStr(t.year, t.month, t.day);
              return (
                <div key="list" className="page" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {allCheckins.slice(0, checkinListCount).map((data) => {
                    const isToday = data.date === todayStr2;
                    const [, dm, dd] = data.date.split("-");
                    const label = `${parseInt(dm)}/${parseInt(dd)}`;
                    return (
                      <div key={data.date} style={{ background: COLORS.surface, borderRadius: 12, padding: "12px 16px", border: `1px solid ${COLORS.accentSoft}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ minWidth: 48 }}>
                            <div style={{ fontSize: 12, color: COLORS.textMuted }}>{label}</div>
                            {isToday && <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 700 }}>今日</div>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <div style={{ flex: 1, height: 6, borderRadius: 3, background: COLORS.border, overflow: "hidden" }}>
                                <div style={{ width: `${data.mood * 10}%`, height: "100%", background: moodColor(data.mood), borderRadius: 3 }} />
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, minWidth: 16 }}>{data.mood}</div>
                            </div>
                            <div style={{ display: "flex", gap: 10, fontSize: 11, color: COLORS.textMuted }}>
                              {data.condition && <span>{data.condition}</span>}
                              {data.sleep && <span>睡眠 {sleepLabel(data.sleep)}</span>}
                            </div>
                            {data.memo && <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 4, lineHeight: 1.5 }}>「{data.memo}」</div>}
                          </div>
                          <button onClick={() => {
                            setCheckinEditDate(data.date);
                            setCheckinEditDraft({ mood: data.mood, condition: data.condition, sleep: data.sleep, memo: data.memo || "" });
                            setView("checkinEdit");
                          }}
                            style={{ flexShrink: 0, background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: "pointer", fontSize: 11, padding: "5px 10px" }}>
                            編集
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {allCheckins.length === 0 && (
                    <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 13, padding: "40px 0" }}>まだ記録がありません</div>
                  )}
                  {allCheckins.length > checkinListCount && (
                    <button onClick={() => setCheckinListCount(checkinListCount + 14)}
                      style={{ width: "100%", background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 13, padding: 12, cursor: "pointer", marginTop: 4 }}>
                      もっと見る（残り{allCheckins.length - checkinListCount}件）
                    </button>
                  )}
                </div>
              );
            })()}

            <BottomNav onHome={() => { setView("home"); setActiveTab("home"); }} />
          </div>
        );
      })()}
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
              {["4時間未満", "4〜6時間未満", "6〜8時間未満", "8時間以上"].map((s) => (
                <button key={s} onClick={() => setCheckinDraft({ ...checkinDraft, sleep: checkinDraft.sleep === s ? null : s })}
                  style={{ padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${checkinDraft.sleep === s ? COLORS.accent : COLORS.border}`, background: checkinDraft.sleep === s ? COLORS.accentSoft : COLORS.surface, color: checkinDraft.sleep === s ? COLORS.accentText : COLORS.text, fontSize: 14, fontWeight: checkinDraft.sleep === s ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
                  {sleepLabel(s)}
                </button>
              ))}
            </div>
          </div>

          {/* 一言メモ */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>一言メモ<span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 400, marginLeft: 6 }}>任意</span></div>
            <textarea rows={3} style={inpStyle()} placeholder="今日の気持ちや気づきをひとこと" value={checkinDraft.memo} onChange={(e) => setCheckinDraft({ ...checkinDraft, memo: e.target.value })} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setView("home"); setActiveTab("home"); }} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>キャンセル</button>
            <button onClick={saveCheckin} disabled={!checkinDraft.mood}
              style={{ flex: 2, background: checkinDraft.mood ? COLORS.accent : COLORS.border, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 13, cursor: checkinDraft.mood ? "pointer" : "default", transition: "background 0.2s" }}>
              記録する
            </button>
          </div>
        </div>
      )}

      {/* CHECKIN EDIT */}
      {view === "checkinEdit" && (() => {
        const editDateLabel = checkinEditDate ? (() => { const [, m, d] = checkinEditDate.split("-"); return `${parseInt(m)}月${parseInt(d)}日`; })() : "";
        return (
          <div className="page" style={{ padding: "24px 16px" }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>{editDateLabel}のチェックインを編集</div>
            {/* 気分スコア */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>気分</div>
                {checkinEditDraft.mood && (
                  <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.accentText, lineHeight: 1 }}>{checkinEditDraft.mood}</div>
                )}
              </div>
              <input
                type="range" min="1" max="10" step="1"
                value={checkinEditDraft.mood ?? 5}
                onChange={(e) => setCheckinEditDraft({ ...checkinEditDraft, mood: parseInt(e.target.value) })}
                style={{ width: "100%", accentColor: COLORS.accent, height: 6, cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: COLORS.textMuted }}>
                <span>1 つらい</span><span>最高 10</span>
              </div>
            </div>

            {/* 体調 */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>体調<span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 400, marginLeft: 6 }}>任意</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["とても良い", "良い", "普通", "悪い", "とても悪い"].map((c) => (
                  <button key={c} onClick={() => setCheckinEditDraft({ ...checkinEditDraft, condition: checkinEditDraft.condition === c ? null : c })}
                    style={{ padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${checkinEditDraft.condition === c ? COLORS.accent : COLORS.border}`, background: checkinEditDraft.condition === c ? COLORS.accentSoft : COLORS.surface, color: checkinEditDraft.condition === c ? COLORS.accentText : COLORS.text, fontSize: 14, fontWeight: checkinEditDraft.condition === c ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 睡眠時間 */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>睡眠時間<span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 400, marginLeft: 6 }}>任意</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["4時間未満", "4〜6時間未満", "6〜8時間未満", "8時間以上"].map((s) => (
                  <button key={s} onClick={() => setCheckinEditDraft({ ...checkinEditDraft, sleep: checkinEditDraft.sleep === s ? null : s })}
                    style={{ padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${checkinEditDraft.sleep === s ? COLORS.accent : COLORS.border}`, background: checkinEditDraft.sleep === s ? COLORS.accentSoft : COLORS.surface, color: checkinEditDraft.sleep === s ? COLORS.accentText : COLORS.text, fontSize: 14, fontWeight: checkinEditDraft.sleep === s ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
                    {sleepLabel(s)}
                  </button>
                ))}
              </div>
            </div>

            {/* 一言メモ */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>一言メモ<span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 400, marginLeft: 6 }}>任意</span></div>
              <textarea rows={3} style={inpStyle()} placeholder="気持ちや気づきをひとこと" value={checkinEditDraft.memo} onChange={(e) => setCheckinEditDraft({ ...checkinEditDraft, memo: e.target.value })} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setView("checkinHistory")} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>キャンセル</button>
              <button onClick={() => {
                setCheckins(prev => prev.map(c => c.date === checkinEditDate ? { ...c, ...checkinEditDraft } : c));
                setView("checkinHistory");
              }}
                style={{ flex: 2, background: COLORS.accent, border: "none", borderRadius: 10, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: 13, cursor: "pointer" }}>
                保存する
              </button>
            </div>
          </div>
        );
      })()}

      {/* NEW */}
      {view === "new" && (
        <div className="page" style={{ padding: "24px 16px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>日付</div>
            <DateSelector year={newYear} month={newMonth} day={newDay} onYear={setNewYear} onMonth={setNewMonth} onDay={setNewDay} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>何があった？</div>
            <textarea rows={4} style={inpStyle()} placeholder="例）上司に仕事のやり方を批判された" value={newSituation} onChange={(e) => setNewSituation(e.target.value)} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>カテゴリ <span style={{ fontSize: 11 }}>任意</span></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STRESS_CATEGORIES.map(c => (
                <button key={c} onClick={() => setNewCategory(newCategory === c ? null : c)}
                  style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${newCategory === c ? COLORS.accent : COLORS.border}`, background: newCategory === c ? COLORS.accentSoft : COLORS.surface, color: newCategory === c ? COLORS.accentText : COLORS.textMuted, fontSize: 13, fontWeight: newCategory === c ? 700 : 400, cursor: "pointer" }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>強度 <span style={{ fontSize: 11 }}>任意</span></div>
            <div style={{ display: "flex", gap: 8 }}>
              {STRESS_INTENSITIES.map(v => (
                <button key={v} onClick={() => setNewIntensity(newIntensity === v ? null : v)}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1.5px solid ${newIntensity === v ? COLORS.accent : COLORS.border}`, background: newIntensity === v ? COLORS.accentSoft : COLORS.surface, color: newIntensity === v ? COLORS.accentText : COLORS.textMuted, fontSize: 13, fontWeight: newIntensity === v ? 700 : 400, cursor: "pointer" }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>浮かんだ考え <span style={{ fontSize: 11 }}>任意</span></div>
            <input type="text" style={{ ...inpStyle(), resize: undefined, boxSizing: "border-box" }} placeholder="例）また失敗した、どうせダメだ" value={newFirstThought} onChange={(e) => setNewFirstThought(e.target.value)} />
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
          <div style={{ background: COLORS.surface, borderRadius: 12, padding: "14px 16px", fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: (selectedDetail.category || selectedDetail.intensity || selectedDetail.firstThought) ? 12 : 24, border: `1px solid ${COLORS.border}` }}>{selectedDetail.situation}</div>

          {(selectedDetail.category || selectedDetail.intensity || selectedDetail.firstThought) && (
            <div style={{ marginBottom: 24 }}>
              {(selectedDetail.category || selectedDetail.intensity) && (
                <div style={{ display: "flex", gap: 8, marginBottom: selectedDetail.firstThought ? 8 : 0, flexWrap: "wrap" }}>
                  {selectedDetail.category && <span style={{ fontSize: 13, padding: "4px 12px", borderRadius: 16, background: COLORS.accentSoft, color: COLORS.accentText, border: `1px solid ${COLORS.border}` }}>{selectedDetail.category}</span>}
                  {selectedDetail.intensity && <span style={{ fontSize: 13, padding: "4px 12px", borderRadius: 16, background: COLORS.surface, color: COLORS.textMuted, border: `1px solid ${COLORS.border}` }}>{selectedDetail.intensity}</span>}
                </div>
              )}
              {selectedDetail.firstThought && (
                <div style={{ fontSize: 13, color: COLORS.textMuted, fontStyle: "italic", lineHeight: 1.6 }}>「{selectedDetail.firstThought}」</div>
              )}
            </div>
          )}

          {/* コーピング記録 */}
          {selectedDetail.coping && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "#e0a855", fontWeight: 700, letterSpacing: 1, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${COLORS.border}` }}>コーピングの記録</div>
              <div style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.7, border: `1px solid #e0a85530`, color: COLORS.text }}>
                {selectedDetail.coping}
              </div>
              {selectedDetail.copingReview && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#e0a855", display: "flex", alignItems: "center", gap: 4 }}>効果：{selectedDetail.copingReview}</div>
              )}
            </div>
          )}

          {/* CBT記録 */}
          {selectedDetail.cbt && Object.keys(selectedDetail.cbt).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: 1, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${COLORS.border}` }}>認知再構成の記録</div>
              {[...CBT3_STEPS, ...CBT_STEPS].map((step) => selectedDetail.cbt[step.id] ? (
                <div key={step.id} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1, marginBottom: 5, textTransform: "uppercase" }}>{step.label}</div>
                  <div style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.7, border: `1px solid ${COLORS.border}` }}>
                    {(step.id === "autoThought" || step.id === "autoThought3")
                      ? selectedDetail.cbt[step.id].split("\n").filter(s => s.trim()).map((t, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < selectedDetail.cbt[step.id].split("\n").filter(s => s.trim()).length - 1 ? 8 : 0 }}>
                            <span style={{ color: COLORS.textMuted, minWidth: 16 }}>{i + 1}</span>
                            <span>{t}</span>
                          </div>
                        ))
                      : (step.id === "cogPattern" || step.id === "cogPattern3")
                        ? <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {selectedDetail.cbt[step.id].split(",").filter(s => s.trim()).map((p, i) => (
                              <span key={i} style={{ padding: "3px 10px", borderRadius: 14, background: COLORS.accentSoft, border: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.accentText }}>{p}</span>
                            ))}
                          </div>
                        : selectedDetail.cbt[step.id]
                    }
                  </div>
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
                  <div style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.7, border: `1px solid ${COLORS.border}` }}>
                    {(step.id === "breakdown" || step.id === "solutions")
                      ? selectedDetail.ps[step.id].split("\n").filter(s => s.trim()).map((t, i, arr) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < arr.length - 1 ? 8 : 0 }}>
                            <span style={{ color: COLORS.textMuted, minWidth: 16 }}>{i + 1}</span>
                            <span>{t}</span>
                          </div>
                        ))
                      : selectedDetail.ps[step.id]
                    }
                  </div>
                </div>
              ) : null)}
              {selectedDetail.ps?.review && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, letterSpacing: 1, marginBottom: 8, paddingTop: 8, borderTop: `1px solid ${COLORS.border}` }}>振り返り</div>
                  {selectedDetail.ps.review.result && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1, marginBottom: 5, textTransform: "uppercase" }}>試してみた結果</div>
                      <div style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.7, border: `1px solid ${COLORS.border}` }}>{selectedDetail.ps.review.result}</div>
                    </div>
                  )}
                  {selectedDetail.ps.review.insight && (
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1, marginBottom: 5, textTransform: "uppercase" }}>気づいたこと</div>
                      <div style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.7, border: `1px solid ${COLORS.border}` }}>{selectedDetail.ps.review.insight}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {(!selectedDetail.cbt || Object.keys(selectedDetail.cbt).length === 0) &&
           (!selectedDetail.ps || Object.keys(selectedDetail.ps).length === 0) && (
            <div style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>まだアプローチをしていません</div>
          )}

          <button onClick={() => startApproach(selectedDetail.id)} style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, padding: 14, cursor: "pointer", marginTop: 8 }}>
            アプローチを選ぶ →
          </button>
          <button className="no-print" onClick={() => handleDetailPrint(selectedDetail)}
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, fontSize: 14, fontWeight: 700, padding: 14, cursor: "pointer", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <IconDownload size={16} />PDFとして保存する
          </button>
          <BottomNav onBack={() => { setView("list"); setEditing(false); }} onHome={() => { setView("home"); setActiveTab("home"); }} />
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
            <textarea rows={4} style={inpStyle()} value={editSituation} onChange={(e) => setEditSituation(e.target.value)} />
          </div>
          {selectedDetail.cbt && Object.keys(selectedDetail.cbt).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16, paddingTop: 8, borderTop: `1px solid ${COLORS.border}` }}>認知再構成の内容</div>
              {CBT_STEPS.map((step) => (
                <div key={step.id} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>{step.label}</div>
                  <textarea rows={3} style={inpStyle()} placeholder={step.placeholder} value={editCbt[step.id] || ""} onChange={(e) => setEditCbt({ ...editCbt, [step.id]: e.target.value })} />
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
                  <textarea rows={3} style={inpStyle()} placeholder={step.placeholder} value={editPs[step.id] || ""} onChange={(e) => setEditPs({ ...editPs, [step.id]: e.target.value })} />
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

            <button onClick={() => startCopingSelect(selectedDetail.id)} style={{ background: COLORS.surface, border: `1px solid #e0a85540`, borderRadius: 14, padding: "16px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <IconListCheck size={22} color="#e0a855" />
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>コーピング</div>
              </div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6, paddingLeft: 34 }}>今すぐ気持ちを楽にしたいとき。自分のコーピングリストから選んで対処する</div>
            </button>
          </div>
          <BottomNav onBack={() => { setView("list"); setEditing(false); }} onHome={() => { setView("home"); setActiveTab("home"); }} />
        </div>
      )}

      {/* CBT SELECT */}
      {view === "cbtSelect" && (() => {
        const rec = records.find((r) => r.id === cbtId);
        return rec ? (
          <div className="page" style={{ padding: "20px 16px" }}>
            <div style={{ background: COLORS.accentSoft, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.accentText, marginBottom: 24, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <IconPin size={14} />{rec.situation}
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>どのコラム法を使いますか？</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={startCBT3} style={{ background: COLORS.surface, border: `1px solid ${COLORS.accent}40`, borderRadius: 14, padding: "16px", cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>3コラム法</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>状況・感情・自動思考を整理したいとき。まず出来事を書き出して、自分のパターンに気づく</div>
              </button>
              <button onClick={startCBT7} style={{ background: COLORS.surface, border: `1px solid ${COLORS.accent}40`, borderRadius: 14, padding: "16px", cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>7コラム法</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>しっかり認知を再構成したいとき。根拠・反証・バランス思考まで丁寧に整理する</div>
              </button>
            </div>
            <BottomNav onBack={() => setView("approach")} onHome={() => { setView("home"); setActiveTab("home"); }} />
          </div>
        ) : null;
      })()}

      {/* COPING SELECT */}
      {view === "copingSelect" && (() => {
        const rec = records.find((r) => r.id === copingSelectId);
        return rec ? (
          <div className="page" style={{ padding: "20px 16px" }}>
            <div style={{ background: COLORS.accentSoft, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.accentText, marginBottom: 24, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <IconPin size={14} />{rec.situation}
            </div>

            {/* 自分のコーピングリスト */}
            <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>自分のコーピングリスト</div>
            {copings.length === 0 ? (
              <div style={{ background: COLORS.surface, borderRadius: 12, padding: "20px 16px", border: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.textMuted, textAlign: "center", lineHeight: 2 }}>
                まだコーピングが登録されていません<br />
                <span style={{ fontSize: 12 }}>ホーム → コーピングリストから追加できます</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sortedCopings.map((c) => (
                  <button key={c.id} onClick={() => setCopingConfirm(c)}
                    style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 16px", border: `1px solid ${COLORS.border}`, textAlign: "left", cursor: "pointer", width: "100%" }}>
                    <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6, marginBottom: 6 }}>{c.text}</div>
                    <div style={{ display: "flex", gap: 12, fontSize: 11, color: COLORS.textMuted }}>
                      <span>難易度 <span style={{ color: COLORS.text, fontWeight: 700 }}>{c.difficulty}</span>/5</span>
                      <span>効果 <span style={{ color: COLORS.text, fontWeight: 700 }}>{c.effect}</span>/5</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <BottomNav onBack={() => setView("approach")} onHome={() => { setView("home"); setActiveTab("home"); }} />

            {/* 確認ダイアログ */}
            {copingConfirm && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 100 }}>
                <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 }}>
                  <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 8 }}>このコーピングを選びますか？</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 24, lineHeight: 1.5 }}>{copingConfirm.text}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setCopingConfirm(null)}
                      style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>
                      キャンセル
                    </button>
                    <button onClick={() => confirmCoping(copingConfirm.text)}
                      style={{ flex: 2, background: COLORS.accent, border: "none", borderRadius: 10, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: 12, cursor: "pointer" }}>
                      これにする
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null;
      })()}

      {/* PS */}
      {view === "ps" && psRecord && (() => {
        const isBreakdownStep = PS_STEPS[psStep].id === "breakdown";
        const isTargetStep = PS_STEPS[psStep].id === "target";
        const isSolutionsStep = PS_STEPS[psStep].id === "solutions";
        const isSelectPlanStep = PS_STEPS[psStep].id === "selectPlan";
        const isPlanWhenStep = PS_STEPS[psStep].id === "planWhen";
        const solutionTexts = psSolutionItems.map(s => s.text).filter(t => t.trim());
        const breakdownTexts = (psDraft.breakdown || "").split("\n").filter(t => t.trim());

        const goToStep = (next) => {
          if (isBreakdownStep) {
            const serialized = psBreakdownItems.map(s => s.text).filter(t => t.trim()).join("\n");
            setPsDraft(prev => ({ ...prev, breakdown: serialized }));
          }
          if (isSolutionsStep) {
            const serialized = psSolutionItems.map(s => s.text).filter(t => t.trim()).join("\n");
            setPsDraft(prev => ({ ...prev, solutions: serialized }));
          }
          if (PS_STEPS[next]?.id === "breakdown") {
            const existing = psDraft.breakdown || "";
            const lines = existing.split("\n").filter(l => l.trim());
            setPsBreakdownItems(lines.length > 0 ? lines.map((t, i) => ({ id: i, text: t })) : [{ id: Date.now(), text: "" }]);
          }
          if (PS_STEPS[next]?.id === "solutions") {
            const existing = psDraft.solutions || "";
            const lines = existing.split("\n").filter(l => l.trim());
            setPsSolutionItems(lines.length > 0 ? lines.map((t, i) => ({ id: i, text: t })) : [{ id: Date.now(), text: "" }]);
          }
          setPsStep(next);
          setShowHint(false);
        };

        const stepId = PS_STEPS[psStep].id;
        const pinText = stepId === "situation" ? psRecord.situation
          : stepId === "breakdown" || stepId === "target" ? (psDraft.situation || psRecord.situation)
          : stepId === "benefit" || stepId === "solutions" || stepId === "selectPlan" ? (psDraft.target || psRecord.situation)
          : stepId === "planWhen" ? (psDraft.selectPlan || psDraft.target || psRecord.situation)
          : psRecord.situation;

        return (
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
              📌 {pinText}
            </div>

            {isBreakdownStep ? (
              <div>
                {psBreakdownItems.map((item, idx) => (
                  <div key={item.id} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                    <div style={{ paddingTop: 12, fontSize: 12, color: COLORS.textMuted, minWidth: 20 }}>{idx + 1}</div>
                    <textarea
                      rows={2}
                      style={{ ...inpStyle(), flex: 1, resize: "none" }}
                      placeholder="例）ミスの原因が自分でわからない"
                      value={item.text}
                      onChange={(e) => setPsBreakdownItems(prev => prev.map(s => s.id === item.id ? { ...s, text: e.target.value } : s))}
                    />
                    {psBreakdownItems.length > 1 && (
                      <button onClick={() => setPsBreakdownItems(prev => prev.filter(s => s.id !== item.id))}
                        style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 18, cursor: "pointer", padding: "8px 0", opacity: 0.5 }}>×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setPsBreakdownItems(prev => [...prev, { id: Date.now(), text: "" }])}
                  style={{ background: "none", border: `1px dashed ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, fontSize: 13, padding: "8px 16px", cursor: "pointer", width: "100%" }}>
                  ＋ 困りごとを追加する
                </button>
              </div>
            ) : isTargetStep ? (
              <div>
                {breakdownTexts.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {breakdownTexts.map((t, i) => (
                      <button key={i} onClick={() => setPsDraft(prev => ({ ...prev, target: t }))}
                        style={{ textAlign: "left", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${psDraft.target === t ? "#818cf8" : COLORS.border}`, background: psDraft.target === t ? "#818cf820" : COLORS.surface, color: psDraft.target === t ? "#818cf8" : COLORS.text, fontSize: 14, lineHeight: 1.6, cursor: "pointer", fontFamily: "inherit" }}>
                        {i + 1}. {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>
                    前のステップで困りごとを入力してください
                  </div>
                )}
              </div>
            ) : isSolutionsStep ? (
              <div>
                {psSolutionItems.map((item, idx) => (
                  <div key={item.id} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                    <div style={{ paddingTop: 12, fontSize: 12, color: COLORS.textMuted, minWidth: 20 }}>{idx + 1}</div>
                    <textarea
                      rows={2}
                      style={{ ...inpStyle(), flex: 1, resize: "none" }}
                      placeholder="例）作業前にメモで手順を確認する"
                      value={item.text}
                      onChange={(e) => setPsSolutionItems(prev => prev.map(s => s.id === item.id ? { ...s, text: e.target.value } : s))}
                    />
                    {psSolutionItems.length > 1 && (
                      <button onClick={() => setPsSolutionItems(prev => prev.filter(s => s.id !== item.id))}
                        style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 18, cursor: "pointer", padding: "8px 0", opacity: 0.5 }}>×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setPsSolutionItems(prev => [...prev, { id: Date.now(), text: "" }])}
                  style={{ background: "none", border: `1px dashed ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, fontSize: 13, padding: "8px 16px", cursor: "pointer", width: "100%" }}>
                  ＋ 解決策を追加する
                </button>
              </div>
            ) : isSelectPlanStep ? (
              <div>
                {solutionTexts.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {solutionTexts.map((t, i) => (
                      <button key={i} onClick={() => setPsDraft(prev => ({ ...prev, selectPlan: t }))}
                        style={{ textAlign: "left", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${psDraft.selectPlan === t ? "#818cf8" : COLORS.border}`, background: psDraft.selectPlan === t ? "#818cf820" : COLORS.surface, color: psDraft.selectPlan === t ? "#818cf8" : COLORS.text, fontSize: 14, lineHeight: 1.6, cursor: "pointer", fontFamily: "inherit" }}>
                        {i + 1}. {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>
                    前のステップで解決策を入力してください
                  </div>
                )}
              </div>
            ) : isPlanWhenStep ? (
              <div>
                <textarea
                  rows={4}
                  style={inpStyle()}
                  placeholder={PS_STEPS[psStep].placeholder}
                  value={psDraft[PS_STEPS[psStep].id] || ""}
                  onChange={(e) => setPsDraft({ ...psDraft, [PS_STEPS[psStep].id]: e.target.value })}
                />
              </div>
            ) : (
              <textarea
                rows={5}
                style={inpStyle()}
                placeholder={PS_STEPS[psStep].placeholder}
                value={psDraft[PS_STEPS[psStep].id] || ""}
                onChange={(e) => setPsDraft({ ...psDraft, [PS_STEPS[psStep].id]: e.target.value })}
              />
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              {psStep > 0 && (
                <button onClick={() => goToStep(psStep - 1)} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>← 戻る</button>
              )}
              <button
                onClick={() => {
                  if (psStep < PS_STEPS.length - 1) {
                    goToStep(psStep + 1);
                  } else {
                    if (isSolutionsStep) {
                      const s = psSolutionItems.map(x => x.text).filter(t => t.trim()).join("\n");
                      setPsDraft(prev => ({ ...prev, solutions: s }));
                    }
                    finishPS();
                  }
                }}
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
        );
      })()}

      {/* PS 振り返り */}
      {view === "psReview" && (() => {
        const rec = records.find(r => r.id === psReviewId);
        if (!rec) return null;
        const canSave = psReviewDraft.result.trim() || psReviewDraft.insight.trim();
        return (
          <div className="page" style={{ padding: "20px 16px" }}>
            <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
              問題解決技法 — 振り返り
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5, marginBottom: 16, color: COLORS.text }}>
              プランを試した結果を記録しよう
            </div>
            <div style={{ background: COLORS.accentSoft, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.accentText, marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
              📌 {rec.situation}
            </div>
            {rec.ps?.target && (
              <div style={{ background: COLORS.surface, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#818cf8", marginBottom: 12, border: `1px solid #818cf830` }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>取り組んだ問題</div>
                {rec.ps.target}
              </div>
            )}
            {(rec.ps?.selectPlan || rec.ps?.planWhen) && (
              <div style={{ background: COLORS.surface, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#818cf8", marginBottom: 16, border: `1px solid #818cf830` }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>実行したプラン</div>
                {rec.ps.selectPlan && <div style={{ marginBottom: rec.ps.planWhen ? 6 : 0 }}>{rec.ps.selectPlan}</div>}
                {rec.ps.planWhen && <div style={{ color: COLORS.textMuted, fontSize: 11 }}>タイミング：{rec.ps.planWhen}</div>}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>試してみた結果どうだったか</div>
              <textarea
                rows={4}
                style={inpStyle()}
                placeholder="例）手順メモを作ったら、作業前に確認できてミスが減った"
                value={psReviewDraft.result}
                onChange={(e) => setPsReviewDraft(prev => ({ ...prev, result: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>気づいたこと</div>
              <textarea
                rows={4}
                style={inpStyle()}
                placeholder="例）全部はできなかったけど、意識するだけで少し楽になった"
                value={psReviewDraft.insight}
                onChange={(e) => setPsReviewDraft(prev => ({ ...prev, insight: e.target.value }))}
              />
            </div>
            <button
              onClick={savePsReview}
              style={{ width: "100%", background: canSave ? "#818cf8" : COLORS.border, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 14, cursor: canSave ? "pointer" : "default", marginBottom: 10 }}>
              ✓ 振り返りを保存する
            </button>
            <button onClick={() => setView("list")} style={{ width: "100%", background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 13, padding: 12, cursor: "pointer" }}>
              キャンセル
            </button>
          </div>
        );
      })()}

      {/* コーピング振り返り */}
      {view === "copingReview" && (() => {
        const rec = records.find(r => r.id === copingReviewId);
        if (!rec) return null;
        return (
          <div className="page" style={{ padding: "20px 16px" }}>
            <div style={{ fontSize: 11, color: "#e0a855", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
              コーピング — 効果の記録
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5, marginBottom: 16, color: COLORS.text }}>
              どうだった？
            </div>
            <div style={{ background: COLORS.accentSoft, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.accentText, marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
              📌 {rec.situation}
            </div>
            <div style={{ background: COLORS.surface, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#e0a855", marginBottom: 24, border: `1px solid #e0a85530` }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>試したコーピング</div>
              {rec.coping}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {["よかった", "普通", "あまり効かなかった"].map(r => (
                <button key={r} onClick={() => setCopingReviewResult(r)}
                  style={{ padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${copingReviewResult === r ? "#e0a855" : COLORS.border}`, background: copingReviewResult === r ? "#e0a85520" : COLORS.surface, color: copingReviewResult === r ? "#e0a855" : COLORS.text, fontSize: 15, fontWeight: copingReviewResult === r ? 700 : 400, cursor: "pointer" }}>
                  {r}
                </button>
              ))}
            </div>
            <button onClick={saveCopingReview} disabled={!copingReviewResult}
              style={{ width: "100%", background: copingReviewResult ? "#e0a855" : COLORS.border, border: "none", borderRadius: 10, color: copingReviewResult ? "#0f1117" : COLORS.textMuted, fontSize: 14, fontWeight: 700, padding: 14, cursor: copingReviewResult ? "pointer" : "default", marginBottom: 10 }}>
              ✓ 記録する
            </button>
            <button onClick={() => setView("list")} style={{ width: "100%", background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 13, padding: 12, cursor: "pointer" }}>
              キャンセル
            </button>
          </div>
        );
      })()}

      {view === "cbt" && cbtRecord && (() => {
        const steps = cbtMode === "3" ? CBT3_STEPS : CBT_STEPS;
        const currentStep = steps[cbtStep];
        return (
        <div className="page" style={{ padding: "20px 16px" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 10, background: i <= cbtStep ? COLORS.accent : COLORS.border, transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
            Step {cbtStep + 1} / {steps.length} — {currentStep.label}
          </div>
          {(() => {
            const sid = currentStep.id;
            const autoThoughts = (cbtDraft["autoThought"] || cbtDraft["autoThought3"] || "").split("\n").filter(s => s.trim());
            const effectiveThought = selectedThought || (autoThoughts.length === 1 ? autoThoughts[0] : null);
            const inThoughtSelect = sid === "evidence_for" && !selectedThought && autoThoughts.length > 1;
            const displayQuestion = inThoughtSelect ? "根拠・反証を検証したい自動思考を一つ選ぼう" : currentStep.question;
            const situation = cbtDraft["situation7"] || cbtDraft["situation3"] || cbtRecord.situation;

            const pinStyle = { background: COLORS.accentSoft, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.accentText, marginBottom: 16, border: `1px solid ${COLORS.border}` };
            const subCardStyle = { background: COLORS.surface, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.textMuted, marginBottom: 10, border: `1px solid ${COLORS.border}` };

            const pinNode = (() => {
              if (sid === "situation7" || sid === "situation3") {
                return <div style={pinStyle}>📌 {cbtRecord.situation}</div>;
              }
              if (["emotion", "emotion3", "autoThought", "autoThought3"].includes(sid)) {
                return <div style={pinStyle}>📌 {situation}</div>;
              }
              if (sid === "cogPattern" || sid === "cogPattern3") {
                if (autoThoughts.length === 0) return null;
                return (
                  <div style={pinStyle}>
                    {autoThoughts.map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, marginBottom: i < autoThoughts.length - 1 ? 4 : 0 }}>
                        <span style={{ opacity: 0.6, minWidth: 14 }}>{i + 1}.</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                );
              }
              if (sid === "evidence_for" && inThoughtSelect) {
                return <div style={pinStyle}>📌 {situation}</div>;
              }
              if (sid === "evidence_for" || sid === "evidence_against") {
                return effectiveThought ? <div style={pinStyle}>📌 {effectiveThought}</div> : null;
              }
              if (sid === "balanced") {
                return (
                  <>
                    {effectiveThought && <div style={{ ...pinStyle, marginBottom: 10 }}>📌 {effectiveThought}</div>}
                    {cbtDraft["evidence_for"] && (
                      <div style={subCardStyle}>
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>根拠（そう思う理由）</div>
                        <div style={{ color: COLORS.text }}>{cbtDraft["evidence_for"]}</div>
                      </div>
                    )}
                    {cbtDraft["evidence_against"] && (
                      <div style={{ ...subCardStyle, marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>反証（別の見方）</div>
                        <div style={{ color: COLORS.text }}>{cbtDraft["evidence_against"]}</div>
                      </div>
                    )}
                  </>
                );
              }
              if (sid === "reEmotion") {
                return <div style={pinStyle}>📌 {situation}</div>;
              }
              return null;
            })();

            return (
              <>
                <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5, marginBottom: 16, color: COLORS.text }}>{displayQuestion}</div>
                {pinNode}
                {sid === "reEmotion" && cbtDraft["emotion"] && (
                  <div style={{ background: COLORS.surface, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.textMuted, marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, marginBottom: 4 }}>最初の感情</div>
                    <div style={{ color: COLORS.text }}>{cbtDraft["emotion"]}</div>
                  </div>
                )}
                {sid === "autoThought" || sid === "autoThought3" ? (
                  <AutoThoughtInput
                    value={cbtDraft[sid] || ""}
                    onChange={(val) => setCbtDraft({ ...cbtDraft, [sid]: val })}
                  />
                ) : (sid === "cogPattern" || sid === "cogPattern3") ? (
                  <div>
                    {COG_PATTERNS.map(p => {
                      const patterns = (cbtDraft[sid] || "").split(",").filter(s => s.trim());
                      const isSelected = patterns.includes(p.label);
                      return (
                        <button key={p.label} onClick={() => {
                          const next = isSelected ? patterns.filter(x => x !== p.label) : [...patterns, p.label];
                          setCbtDraft({ ...cbtDraft, [sid]: next.join(",") });
                        }}
                          style={{ width: "100%", textAlign: "left", padding: "12px 16px", marginBottom: 8, borderRadius: 10, border: `1.5px solid ${isSelected ? COLORS.accent : COLORS.border}`, background: isSelected ? COLORS.accentSoft : COLORS.surface, cursor: "pointer", fontFamily: "inherit", display: "block" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? COLORS.accent : COLORS.text, marginBottom: p.desc ? 2 : 0 }}>{p.label}</div>
                          {p.desc && <div style={{ fontSize: 12, color: COLORS.textMuted }}>{p.desc}</div>}
                        </button>
                      );
                    })}
                  </div>
                ) : inThoughtSelect ? (
                  <div>
                    {autoThoughts.map((thought, idx) => (
                      <button key={idx} onClick={() => setPendingThought(thought)}
                        style={{ width: "100%", textAlign: "left", padding: "14px 16px", marginBottom: 10, borderRadius: 10, border: `2px solid ${pendingThought === thought ? COLORS.accent : COLORS.border}`, background: pendingThought === thought ? COLORS.accentSoft : COLORS.surface, color: pendingThought === thought ? COLORS.accent : COLORS.text, fontSize: 14, lineHeight: 1.6, cursor: "pointer", fontFamily: "inherit" }}>
                        {thought}
                      </button>
                    ))}
                  </div>
                ) : (sid !== "emotion" && sid !== "reEmotion" && sid !== "emotion3") ? (
                  <textarea
                    rows={5}
                    style={inpStyle()}
                    placeholder={currentStep.placeholder}
                    value={cbtDraft[sid] || ""}
                    onChange={(e) => setCbtDraft({ ...cbtDraft, [sid]: e.target.value })}
                  />
                ) : (
                  <EmotionInput
                    value={cbtDraft[sid] || ""}
                    onChange={(val) => setCbtDraft({ ...cbtDraft, [sid]: val })}
                  />
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  {cbtStep > 0 && (
                    <button onClick={() => {
                      if (inThoughtSelect) {
                        const atIdx = steps.findIndex(s => s.id === "autoThought" || s.id === "autoThought3");
                        setCbtStep(atIdx >= 0 ? atIdx : cbtStep - 1);
                        setPendingThought(null);
                      } else if ((sid === "evidence_for" || sid === "evidence_against") && autoThoughts.length > 1) {
                        const efIdx = steps.findIndex(s => s.id === "evidence_for");
                        setCbtStep(efIdx >= 0 ? efIdx : cbtStep - 1);
                        setSelectedThought("");
                        setPendingThought(null);
                      } else {
                        setCbtStep(cbtStep - 1);
                      }
                      setShowHint(false);
                    }} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 13, cursor: "pointer" }}>← 戻る</button>
                  )}
                  <button
                    onClick={() => {
                      if (inThoughtSelect) {
                        setSelectedThought(pendingThought);
                        setShowHint(false);
                      } else if (cbtStep < steps.length - 1) {
                        setCbtStep(cbtStep + 1);
                        setShowHint(false);
                      } else {
                        finishCBT();
                      }
                    }}
                    disabled={inThoughtSelect && !pendingThought}
                    style={{ flex: 2, background: (inThoughtSelect && !pendingThought) ? COLORS.border : cbtStep === steps.length - 1 ? COLORS.success : COLORS.accent, border: "none", borderRadius: 10, color: (inThoughtSelect && !pendingThought) ? COLORS.textMuted : "#fff", fontSize: 14, fontWeight: 700, padding: 13, cursor: (inThoughtSelect && !pendingThought) ? "default" : "pointer" }}
                  >
                    {cbtStep === steps.length - 1 ? "✓ 完了する" : "次へ →"}
                  </button>
                </div>
              </>
            );
          })()}

          {/* ヒント */}
          <div style={{ marginTop: 20 }}>
            <button onClick={() => setShowHint(!showHint)} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 13, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15 }}>{showHint ? "▾" : "▸"}</span>
              書き方のヒント
            </button>
            {showHint && (
              <div style={{ marginTop: 10, background: COLORS.hint, border: `1px solid ${COLORS.hintBorder}`, borderRadius: 10, padding: "14px 16px", fontSize: 13, color: COLORS.hintText, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {currentStep.hint}
              </div>
            )}
          </div>
          <button onClick={saveCBTDraft} style={{ marginTop: 20, width: "100%", background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 13, padding: 12, cursor: "pointer" }}>
            今日はここまでにする
          </button>
        </div>
        );
      })()}

      {/* ボトムタブバー */}
      <BottomTabBar activeTab={activeTab} onTabChange={(id) => {
        setActiveTab(id);
        setView(TAB_VIEWS[id]);
      }} />

      {/* メモ削除確認ダイアログ */}
      {tellMemoDeleteId && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 300 }}>
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>このメモを削除しますか？</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 24, maxHeight: 80, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
              {tellMemos.find(m => m.id === tellMemoDeleteId)?.content}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setTellMemoDeleteId(null)} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>
                キャンセル
              </button>
              <button onClick={() => { setTellMemos(prev => prev.filter(m => m.id !== tellMemoDeleteId)); setTellMemoDeleteId(null); setView("tellMemos"); }}
                style={{ flex: 1, background: COLORS.danger, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 12, cursor: "pointer" }}>
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 人物削除確認ダイアログ */}
      {tellPersonDeleteId && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 300 }}>
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
              {tellPeople.find(p => p.id === tellPersonDeleteId)?.name}を削除しますか？
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
              この人物に紐づいたメモの記録も影響を受けます。
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setTellPersonDeleteId(null)} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>
                キャンセル
              </button>
              <button onClick={() => { setTellPeople(prev => prev.filter(p => p.id !== tellPersonDeleteId)); setTellMemos(prev => prev.map(m => ({ ...m, personIds: m.personIds.filter(pid => pid !== tellPersonDeleteId), checks: Object.fromEntries(Object.entries(m.checks).filter(([k]) => k !== String(tellPersonDeleteId))) }))); setTellPersonDeleteId(null); }}
                style={{ flex: 1, background: COLORS.danger, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 12, cursor: "pointer" }}>
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 人物編集ダイアログ */}
      {tellPersonEditId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 350 }}>
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>人物を編集</div>
            <input value={tellPersonEditName} onChange={e => setTellPersonEditName(e.target.value)}
              placeholder="名前"
              style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", color: COLORS.text, fontSize: 14, boxSizing: "border-box", marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {TELL_PERSON_TYPES.map(type => (
                <button key={type} onClick={() => setTellPersonEditType(type)}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: tellPersonEditType === type ? COLORS.psAccent : COLORS.bg,
                    color: tellPersonEditType === type ? "#fff" : COLORS.textMuted }}>
                  {type}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setTellPersonEditId(null)}
                style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>
                キャンセル
              </button>
              <button onClick={() => {
                if (!tellPersonEditName.trim()) return;
                setTellPeople(prev => prev.map(p => p.id === tellPersonEditId ? { ...p, name: tellPersonEditName.trim(), type: tellPersonEditType } : p));
                setTellPersonEditId(null);
              }} disabled={!tellPersonEditName.trim()}
                style={{ flex: 1, background: tellPersonEditName.trim() ? COLORS.psAccent : COLORS.border, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: 12, cursor: tellPersonEditName.trim() ? "pointer" : "default" }}>
                保存する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ヘルプモーダル */}
      {helpModal && (() => {
        const h = HELP_CONTENT[helpModal];
        if (!h) return null;
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 400, padding: "0 0 0 0" }}
            onClick={() => setHelpModal(null)}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: COLORS.surface, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* ハンドル */}
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border }} />
              </div>
              {/* タイトル */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 8px" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{h.title}</div>
                <button onClick={() => setHelpModal(null)}
                  style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 20, padding: 4, lineHeight: 1 }}>✕</button>
              </div>
              {/* コンテンツ */}
              <div style={{ overflowY: "auto", padding: "0 20px 32px", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                  {h.purpose}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>使い方</div>
                  {h.usage.map((u, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.accent, marginTop: 7, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>{u}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.psAccent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>ポイント</div>
                  {h.points.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.psAccent, marginTop: 7, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>{p}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* コーピング書き方ガイドプロンプト */}
      {copingGuidePrompt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 300 }}>
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>書き方ガイドを見ますか？</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
              コーピングリストの書き方のヒントを表示します。
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setCopingGuidePrompt(false)} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>いいえ</button>
              <button onClick={() => { setCopingGuidePrompt(false); setShowCopingGuide(true); }} style={{ flex: 1, background: COLORS.accent, border: "none", borderRadius: 10, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: 12, cursor: "pointer" }}>はい</button>
            </div>
          </div>
        </div>
      )}

      {/* コーピング書き方ガイド */}
      {showCopingGuide && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 400 }}
          onClick={() => setShowCopingGuide(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: COLORS.surface, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 8px" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>コーピングリストの書き方ガイド</div>
              <button onClick={() => setShowCopingGuide(false)}
                style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 20, padding: 4, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", padding: "0 20px 32px", WebkitOverflowScrolling: "touch" }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                コーピングとは、ストレスを感じたときに自分を助ける「対処法」のこと。あらかじめリストにしておくと、つらいときにすぐ使えます。
              </div>
              {[
                { title: "体を動かす系", items: ["散歩に出る", "ストレッチをする", "深呼吸を3回する", "階段を上り下りする"] },
                { title: "リラックス系", items: ["好きな音楽を聴く", "お風呂にゆっくり浸かる", "ホットドリンクを飲む", "アロマを焚く"] },
                { title: "気分転換系", items: ["好きな動画を観る", "外の景色を眺める", "推しの写真を見る", "掃除や片付けをする"] },
                { title: "人とつながる系", items: ["友人にLINEする", "家族に電話する", "SNSで気持ちを書く", "ペットと触れ合う"] },
                { title: "自分を整理する系", items: ["気持ちを紙に書き出す", "今感じていることを言葉にしてみる", "マインドフルネスをする"] },
              ].map((cat, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent, marginBottom: 8 }}>{cat.title}</div>
                  {cat.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.accent, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>{item}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ background: COLORS.bg, borderRadius: 10, padding: "12px 14px", marginTop: 8 }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7 }}>
                  自分にとって「これなら手軽にできそう」と思えるものを選んで、難易度と効果を設定して登録してみましょう。調子が悪いときこそ、難易度の低いものから試してみるのがコツです。
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* クライシスプラン書き方ガイドプロンプト */}
      {crisisGuidePrompt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 300 }}>
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>書き方ガイドを見ますか？</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
              クライシスプランの書き方のヒントを表示します。
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setCrisisGuidePrompt(false)} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 14, padding: 12, cursor: "pointer" }}>いいえ</button>
              <button onClick={() => { setCrisisGuidePrompt(false); setShowCrisisGuide(true); }} style={{ flex: 1, background: COLORS.accent, border: "none", borderRadius: 10, color: "#0f1117", fontSize: 14, fontWeight: 700, padding: 12, cursor: "pointer" }}>はい</button>
            </div>
          </div>
        </div>
      )}

      {/* クライシスプラン書き方ガイド */}
      {showCrisisGuide && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 400 }}
          onClick={() => setShowCrisisGuide(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: COLORS.surface, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 8px" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>クライシスプランの書き方ガイド</div>
              <button onClick={() => setShowCrisisGuide(false)}
                style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 20, padding: 4, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", padding: "0 20px 32px", WebkitOverflowScrolling: "touch" }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                クライシスプランは、調子が悪くなったときに「どうすればいいか」をあらかじめ整理しておくためのものです。調子が良いときに作っておきましょう。
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.accent }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.accent }}>Safe（安定しているとき）</div>
                </div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 8 }}>自分が安定しているときの状態を書いておきます。</div>
                <div style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: COLORS.text, lineHeight: 1.8 }}>
                  例：「夜ちゃんと眠れている」「食欲がある」「趣味を楽しめている」「人と普通に話せる」
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e0a855" }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e0a855" }}>Caution（注意が必要なとき）</div>
                </div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 8 }}>調子が崩れるきっかけ（トリガー）と、注意サインを書きます。それぞれに対処法も書いておくと安心です。</div>
                <div style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: COLORS.text, lineHeight: 1.8, marginBottom: 8 }}>
                  トリガー例：「残業が続く」「人間関係のトラブル」「季節の変わり目」
                </div>
                <div style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: COLORS.text, lineHeight: 1.8 }}>
                  注意サイン例：「眠れなくなる」「食欲が落ちる」「イライラしやすい」「涙が出る」
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.danger }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.danger }}>Crisis（危機的なとき）</div>
                </div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 8 }}>危機的な状態のサインと、そのときに連絡する人を書いておきます。</div>
                <div style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: COLORS.text, lineHeight: 1.8, marginBottom: 8 }}>
                  サイン例：「自分を傷つけたい気持ちが出る」「何日も眠れない」「外に出られない」
                </div>
                <div style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: COLORS.text, lineHeight: 1.8 }}>
                  連絡先例：「主治医（◯◯病院）」「家族」「いのちの電話 0120-783-556」
                </div>
              </div>
              <div style={{ background: COLORS.bg, borderRadius: 10, padding: "12px 14px", marginTop: 8 }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7 }}>
                  完璧に書く必要はありません。思いつくものから少しずつ書き足していきましょう。主治医や支援者と一緒に作ると、より安心できるプランになります。
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie通知バナー */}
      {!cookieNoticed && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#1a1d2e", borderTop: `1px solid ${COLORS.border}`, padding: "16px 18px", zIndex: 500, boxSizing: "border-box" }}>
          <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.7, marginBottom: 12 }}>
            本アプリはGoogle Analyticsによるアクセス解析を使用しています。詳しくは<button onClick={() => setShowPrivacy(true)} style={{ background: "none", border: "none", color: "#38bdf8", fontSize: 13, cursor: "pointer", padding: 0, textDecoration: "underline", fontFamily: "inherit" }}>プライバシーポリシー</button>をご覧ください。
          </div>
          <button onClick={() => { try { localStorage.setItem("stride_cookie_noticed", "true"); } catch {} setCookieNoticed(true); }}
            style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "#38bdf8", color: "#0f1117", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            OK
          </button>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {deleteTargetId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 300 }}>
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