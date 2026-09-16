// 横断検索インデックス構築。完全にクライアント側のフィルタ処理のみで完結させる。
// 1レコード（クライシスプランは1項目）= 1検索エントリとしてフィールドを結合する。

export const CRISIS_TYPES = ["safe", "caution_triggers", "caution_signs", "crisis_signs", "crisis_contacts"];

export const CRISIS_SUB_LABELS = {
  safe: "SAFE｜安定しているときの状態",
  caution_triggers: "CAUTION｜トリガー",
  caution_signs: "CAUTION｜注意サイン",
  crisis_signs: "CRISIS｜危機のサイン",
  crisis_contacts: "CRISIS｜対処法・連絡先",
};

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export const buildSearchIndex = ({ records, copings, tellMemos, bridgeMemos, achievements, memos, themes, checkins, crisisPlan }) => {
  const index = [];

  (records || []).forEach((r) => {
    const cbtValues = r.cbt ? Object.values(r.cbt).filter(isNonEmptyString) : [];
    const psValues = r.ps
      ? [r.ps.situation, r.ps.breakdown, r.ps.target, r.ps.benefit, r.ps.solutions, r.ps.selectPlan, r.ps.planWhen, r.ps.review?.result, r.ps.review?.insight].filter(isNonEmptyString)
      : [];
    const parts = [r.situation, ...cbtValues, ...psValues, r.coping, r.copingReview].filter(isNonEmptyString);
    if (parts.length === 0) return;
    index.push({
      sourceType: "record",
      sourceId: r.id,
      text: parts.join(" "),
      preview: isNonEmptyString(r.situation) ? r.situation : parts[0],
      date: r.date || null,
      categoryLabel: "ストレス記録",
    });
  });

  (copings || []).forEach((c) => {
    if (!isNonEmptyString(c.text)) return;
    index.push({
      sourceType: "coping",
      sourceId: c.id,
      text: c.text,
      preview: c.text,
      date: null,
      categoryLabel: "コーピング",
    });
  });

  (tellMemos || []).forEach((m) => {
    if (!m.completed) {
      // 「完了」タブの条件（m.completed）に一致しないもの＝未完了のみ、従来通り1メモ=1エントリ
      const replies = m.checks ? Object.values(m.checks).map((c) => c && c.reply).filter(isNonEmptyString) : [];
      const parts = [m.content, ...replies].filter(isNonEmptyString);
      if (parts.length === 0) return;
      index.push({
        sourceType: "tellMemo",
        sourceId: m.id,
        text: parts.join(" "),
        preview: isNonEmptyString(m.content) ? m.content : parts[0],
        date: m.date || null,
        categoryLabel: "伝えたいことメモ",
      });
      return;
    }
    // 完了済み（m.completed）は「診察等の記録」画面と重複するため、そちらのカテゴリとして人物単位で分割する
    (m.personIds || []).forEach((personId) => {
      const reply = m.checks?.[personId]?.reply;
      const parts = [m.content, reply].filter(isNonEmptyString);
      if (parts.length === 0) return;
      index.push({
        sourceType: "medicalLog",
        sourceId: m.id,
        personId,
        text: parts.join(" "),
        preview: isNonEmptyString(m.content) ? m.content : parts[0],
        date: m.date || null,
        categoryLabel: "診察等の記録",
      });
    });
  });

  (bridgeMemos || []).forEach((m) => {
    if (!isNonEmptyString(m.content)) return;
    index.push({
      sourceType: "medicalLog",
      sourceId: m.id,
      personId: m.personId,
      isBridgeMemo: true,
      text: m.content,
      preview: m.content,
      date: m.date || null,
      categoryLabel: "診察等の記録",
    });
  });

  (achievements || []).forEach((a) => {
    if (!isNonEmptyString(a.text)) return;
    index.push({
      sourceType: "achievement",
      sourceId: a.id,
      text: a.text,
      preview: a.text,
      date: a.date || null,
      categoryLabel: "できたことログ",
    });
  });

  (memos || []).forEach((m) => {
    const parts = [m.title, m.body].filter(isNonEmptyString);
    if (parts.length === 0) return;
    index.push({
      sourceType: "memo",
      sourceId: m.id,
      text: parts.join(" "),
      preview: isNonEmptyString(m.title) ? m.title : m.body,
      date: m.date || null,
      categoryLabel: "メモ",
    });
  });

  (themes || []).forEach((th) => {
    if (!isNonEmptyString(th.text)) return;
    index.push({
      sourceType: "theme",
      sourceId: th.id,
      text: th.text,
      preview: th.text,
      date: th.createdAt ? th.createdAt.slice(0, 10) : null,
      categoryLabel: "次回までのテーマ",
      supporterId: th.supporterId,
    });
  });

  (checkins || []).forEach((c) => {
    if (!isNonEmptyString(c.memo)) return;
    index.push({
      sourceType: "checkin",
      sourceId: c.id,
      text: c.memo,
      preview: c.memo,
      date: c.date || null,
      categoryLabel: "チェックイン",
    });
  });

  if (crisisPlan) {
    CRISIS_TYPES.forEach((type) => {
      (crisisPlan[type] || []).forEach((item) => {
        const text1 = isNonEmptyString(item.text) ? item.text.trim() : "";
        const text2 = isNonEmptyString(item.text2) ? item.text2.trim() : "";
        if (!text1 && !text2) return;
        index.push({
          sourceType: "crisis",
          sourceId: item.id,
          text: [text1, text2].filter(Boolean).join(" "),
          text1,
          text2: text2 || null,
          date: null,
          categoryLabel: "クライシスプラン",
          crisisSubLabel: CRISIS_SUB_LABELS[type],
          crisisType: type,
        });
      });
    });
  }

  return index;
};

export const searchIndexEntries = (index, query) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  return index.filter((entry) => entry.text.toLowerCase().includes(q));
};

// 不自然な位置で文が途切れないよう、句読点・改行・空白の直後で区切る。
export const truncateGraceful = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text || "";
  const slice = text.slice(0, maxLength);
  const breakPoints = ["。", "、", "\n", " ", "！", "？"];
  let cut = -1;
  for (const bp of breakPoints) {
    const idx = slice.lastIndexOf(bp);
    if (idx > cut) cut = idx;
  }
  if (cut >= Math.floor(maxLength * 0.4)) return slice.slice(0, cut + 1) + "…";
  return slice + "…";
};
