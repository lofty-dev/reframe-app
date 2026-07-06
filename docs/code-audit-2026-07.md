# コード監査レポート（2026-07）

調査ブランチ: `chore/code-audit`（mainからの派生、変更・削除は一切行っていない調査のみのブランチ）

背景：2026-07-06に本番でBridge Session終了後にsessionメモの返信が消失するバグが発生し
（コミット `3b6accd`）、原因はレンダー時点のstate変数から新しい値を組み立ててから
`setState`していたこと（同一stateへの連続更新で片方が他方を上書きして消える）だった。
このバグパターンがApp.jsx内の他の箇所にも潜んでいないか、また不要なコードが
残っていないかを確認するために実施した。

---

## 調査1：state更新パターンの監査

App.jsx内の全state変数（約70個）について`setXXX(`呼び出し箇所を全てGrepし、
以下の2パターンに該当するものを洗い出した。

- **パターンA**：関数型`prev => ...`を使わず、レンダー時点のstate変数を直接
  読んで新しい値を組み立てsetStateしている箇所。
- **パターンB**（今回の実バグの形）：関数型`prev => ...`を使っているが、
  コールバック内部で`prev`由来ではなく外側スコープのレンダー時点変数を
  参照して新しい値を構築している箇所（「関数型だから安全」に見えて実は危険）。

### 該当箇所一覧

| 行番号 | どのstate | どんな状況で上書き事故が起きうるか | リスク |
|---|---|---|---|
| 1929-1932 | tellMemos | `updateTellReply(m.id,...)` → `toggleTellCheck(m.id,...)` を同一クリックハンドラ内で連続呼び出し。**2026-07-06のバグと同一の「reply保存→チェックON」シーケンス**が発生する箇所。現状は両関数とも`prev => prev.map(...)`かつ`prev`由来の`m.checks`をベースに構築するよう修正済みで安全だが、どちらか一方が将来regressionでパターンA/Bに戻ると即座に再発する構造。 | 高（要継続監視） |
| 586 | checkins | `saveCheckin`内で`setCheckins([entry, ...checkins.filter(...)])`とレンダー時点の`checkins`を直接展開（パターンA）。動線1（チェックイン）の心臓部。現状このハンドラ内で他のcheckins更新はなく即時の事故はないが、他の箇所（4334行目）は正しく`prev => prev.map`を使っており書き方が不統一。 | 中 |
| 597 | records | `saveNew`で`setRecords([{...}, ...records])`（パターンA）。動線2（ストレス記録）新規保存部分。単独呼び出しのため現状事故なし。 | 低 |
| 609 | records | `toggleComplete`で`setRecords(records.map(...))`（パターンA）。単独呼び出し。 | 低 |
| 627 | records | `saveEdit`で`setRecords(records.map(...))`（パターンA）。単独呼び出し。 | 低 |
| 659 | records | `finishCBT`で`setRecords(records.map(...))`（パターンA）。単独呼び出し。 | 低 |
| 664 | records | `saveCBTDraft`で`setRecords(records.map(...))`（パターンA）。単独呼び出し。 | 低 |
| 681 | records | `finishPS`で`setRecords(records.map(...))`（パターンA）。単独呼び出し。 | 低 |
| 686 | records | `savePSDraft`で`setRecords(records.map(...))`（パターンA）。単独呼び出し。 | 低 |
| 713 | records | `confirmCoping`で`setRecords(records.map(...))`（パターンA）。単独呼び出し。 | 低 |
| 761 | tellMemos | `saveTellMemo`で`setTellMemos([{...}, ...tellMemos])`（パターンA）。動線3（伝えたいことメモ作成）。単独呼び出し。 | 低 |
| 769 | tellPeople | `addTellPerson`で`setTellPeople([...tellPeople, {...}])`（パターンA）。単独呼び出し。 | 低 |
| 2897 | memos | 新規メモ保存で`setMemos([{...}, ...memos])`（パターンA）。単独呼び出し。 | 低 |
| 2915 | memos | メモ削除で`setMemos(memos.filter(...))`（パターンA）。単独呼び出し。 | 低 |
| 2934 | memos | メモ編集保存で`setMemos(memos.map(...))`（パターンA）。単独呼び出し。 | 低 |
| 2350 | achievements | できたことログ保存で`setAchievements([{...}, ...achievements])`（パターンA）。単独呼び出し。 | 低 |
| 2487 | achievements | できたことログ削除で`setAchievements(achievements.filter(...))`（パターンA）。単独呼び出し。 | 低 |
| 3469 | copings | コーピング編集保存で`const updated = copings.map(...); setCopings(updated); saveCopings(updated);`（パターンA、localStorage即時保存も同時実施）。単独呼び出し。 | 低 |
| 233 | bridgeSessionMemoIds | `initBridgeSession`で`setBridgeSessionMemoIds(new Set(tellMemos.filter(...)))`とレンダー時点の`tellMemos`を直接参照（パターンA）。呼び出し箇所はここのみ。 | 低 |

### 補足説明

**行1929-1932（高リスク）**：「reply保存 → チェックON」という、2026-07-06に実際に
バグを起こした操作シーケンスそのもの。現状は`toggleTellCheck`（776行目）と
`updateTellReply`（790行目）の両方が`setTellMemos(prev => prev.map(m => ...))`という形で、
かつ内部で参照する`m.checks`が全て`prev`由来（`m`はコールバック引数）になっているため、
Reactが同一tick内で複数のupdater関数を順に適用する仕組み上、正しく連鎖して安全に
動作する。ただし今後どちらかの関数が「一度`tellMemos.find`等でメモを取得してから
`newChecks`を組み立てる」形にリファクタされると、パターンBに逆戻りし即座に同じ
バグが再発する。CLAUDE.mdが動線4のスモークテストを毎回必須にしているのは、
この箇所の脆弱性を踏まえると妥当と考えられる。

**行586（中リスク）**：`saveCheckin`は現状単独でしか`setCheckins`を呼んでいないため
直ちに事故は起きないが、`checkins.filter(...)`というレンダー時点stateを直接展開する
書き方（パターンA）は、同一ハンドラ内に将来2つ目のcheckins更新（下書き自動保存等）が
追加された場合にtellMemosバグと同型の事故を招く土壌になる。動線1に関わるため、
修正時は関数型`setCheckins(prev => ...)`への統一が望ましい。

**その他の低リスク項目**：records・tellMemos・tellPeople・memos・achievements・
copings・bridgeSessionMemoIdsに見られるパターンAの箇所は、いずれも該当ハンドラ内で
同一stateへの追加のsetState呼び出しが存在しないため現状は衝突が起きようがない。
ただし全て「レンダー時点のstate変数を直接読む」という共通の脆弱な書き方であり、
将来の機能追加によってリスクが顕在化しうる潜在的な負債として記録している。

**安全と確認できたもの**：crisisPlan（746-757行目）、themes（242-244, 5351-5353行目、
`createTheme`/`updateThemeText`/`closeTheme`/`deleteThemesForSupporter`はstorage.jsの
pure関数で`prev`のみを引数に取る）、medEvents（185-214, 5225行目、`addMedEvent`/
`updateMedEvent`/`deleteMedEvent`も同様）、bridgeMemos（1734, 1947行目）は全て
`prev =>`かつコールバック内部も`prev`由来のデータのみで構成されており、パターンA/Bには
該当しない。

---

## 調査2：デッドコードの棚卸し

App.jsx（全state変数138個、トップレベル関数50個）、constants.js、styles.jsについて、
識別子としての出現回数を機械的に集計し、宣言行以外に0件のものを抽出。該当した
ものについては、文字列リテラルとしての参照有無も追加で確認した。

### 削除候補（確信あり）

| 場所（行番号） | 内容 | 未使用と判断した根拠 | 削除リスク |
|---|---|---|---|
| App.jsx L111 | `const [graphType, setGraphType] = useState("line");` | 識別子`graphType`/`setGraphType`とも宣言行以外に0件。文字列リテラル`"line"`/`"bar"`もこの行以外どこにも出現せず、リポジトリ全体で他に参照なし。現在のチェックイン履歴グラフ（L3824〜）はbar描画のみで`graphType`分岐は存在しない＝過去のライン/バー切替UIの残骸。 | 低 |
| App.jsx L63 | `const [psSolutionInput, setPsSolutionInput] = useState("");` | 識別子・文字列リテラルともリポジトリ全体で宣言行以外に0件。類似の`psSolutionItems`（L62）は実際に使われているが、こちらは完全に孤立。 | 低 |
| App.jsx L554-567 | `const recentCheckins = (() => { ... 14日分のcheckinsを集計 ... })();` というIIFE | `recentCheckins`という識別子が宣言行以外どこにも出現しない（呼び出し・JSX参照ゼロ）。副作用のない純粋な計算のみのブロック。 | 低 |
| App.jsx L1259-1278（JSX）、`showFeedbackBanner`（L314）、import `hasFeedbackBannerDismissed` | フィードバックバナー機能一式 | `setShowFeedbackBanner(true)`という呼び出しがファイル内に一つもなく、`setShowFeedbackBanner`は「閉じるボタン」でfalseにする1箇所のみ。つまり`showFeedbackBanner`は常にfalseで、L1260の`{showFeedbackBanner && (...)}`ブロックは実行時に絶対に表示されない。`hasFeedbackBannerDismissed`（表示要否判定用と思われる関数）もimportされているのに呼び出し箇所がゼロ＝表示トリガーの実装が失われた（または未実装の）残骸機能。 | 中（JSX削除自体は問題ないが、`setFeedbackBannerDismissed`は現在も呼ばれておりstorage.js側の`FEEDBACK_BANNER_KEY`ごと消すかは要判断＝下記「要確認」参照） |
| App.jsx L6（import文中の`daysInMonth`） | storage.jsからの`daysInMonth`importがApp.jsx内で一度も呼ばれていない | App.jsx内で`daysInMonth`という識別子はimport文以外に0件。代わりにL2345で`daysInMonth2 = new Date(year, month + 1, 0).getDate()`という同等ロジックをインライン重複実装している。`daysInMonth`自体はcomponents/DateSelector.jsxで別途importされ実際に使われているため、storage.js側の定義削除は不可、App.jsxのimportリストから外すことのみ可能。 | 低 |
| constants.js L17 `export const SLEEP_DISPLAY = {...}` | `export`されているが、App.jsxからも他のcomponents/*.jsxからもimportされていない | リポジトリ全体でgrepしても`SLEEP_DISPLAY`はconstants.js内での定義（L17）と、同ファイル内の`sleepLabel`（L18）からの参照のみ。`sleepLabel`自体はApp.jsxで使われているため値自体は必要だが、`export`は不要（＝`export`キーワードのみ削除可能、中身は残す）。 | 低 |

### 要確認（確信が持てないもの）

| 場所（行番号） | 内容 | なぜ確信が持てないか |
|---|---|---|
| components/DateSelector.jsx L4-17 の`selStyle`（ローカル定義） | styles.jsの`export const selStyle`（L3-16）と中身がほぼ完全に重複したローカル関数 | 「未使用コード」ではなく「重複コード」であり、両方とも実際に使われているため今回の削除対象カテゴリには厳密には合致しない。保守性の観点で統合候補として記録（削除ではなく重複解消のリファクタ候補）。 |
| storage.jsの`FEEDBACK_BANNER_KEY` / `hasFeedbackBannerDismissed` / `setFeedbackBannerDismissed` | 上記フィードバックバナー機能が丸ごと死んでいる可能性が高いが、これらはstorage.js側の実装で今回の調査対象範囲（App.jsx/constants.js/styles.js）外。`setFeedbackBannerDismissed`は現状App.jsxから呼ばれている | 意図的な未実装（対応中の機能）なのか完全な残骸なのか、コードだけからは判断がつかない。 |

### 補足

- state変数138個中、宣言行以外での識別子出現がゼロだったのは`graphType`と
  `psSolutionInput`の2つのみ。他136個はJSX内やロジック内で最低1回以上読まれている
  （`activeTab`のようにJSX propへの1回渡しのみのものも、渡し先コンポーネント側での
  使用まで確認済み）。
- トップレベル関数50個中、宣言行以外で参照ゼロだったのは`recentCheckins`（実質は
  constだが同カテゴリとして調査）の1件のみ。他49関数はすべてonClick等から呼ばれている。
- tabler-icons全29種、dnd-kit全8種、storage.js由来の52個のimport、constants.js由来の
  22個のimportについても全て機械的にカウントし、上記`daysInMonth`以外はすべて2箇所
  以上（import＋実使用）で参照されていることを確認済み。

---

## まとめ

- 今回の調査では、tellMemos周り（動線4）の**現状のコードは修正済みで安全**だが、
  構造的に「関数型を使っていても外側スコープの変数を参照すれば同じバグが起きる」
  脆弱なパターンであり、リファクタ時の再発リスクが最も高い箇所であることを確認した。
- checkins（動線1）にも同種の脆弱な書き方（パターンA）があり、現状は単独呼び出しで
  安全だが将来の機能追加で顕在化しうる。
- デッドコードとしては、`graphType`（旧グラフ切替UI残骸）、`psSolutionInput`、
  `recentCheckins`（未参照IIFE）、フィードバックバナー機能一式、未使用importの
  `daysInMonth`、不要な`export`である`SLEEP_DISPLAY`を確認した。いずれも削除リスクは
  低〜中で、削除しても動作に影響しないと判断できる。
- 本レポートは調査のみで、コードの変更・削除は一切行っていない。
