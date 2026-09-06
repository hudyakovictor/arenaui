# Механики M1–M15: матрица появления и UI

> Статус аудита: 2026-09-06. Все 15 механик имеют **данные** или **код**,
> но не все включены в геймплей. См. колонку «Статус».

## Как устроена прогрессия

Игрок растёт **по уровню** (1→99). Эпоха — это **пороги уровня**, которые
раскрывают новые механики:

| Эпоха | Уровни | ID | Что включает |
|-------|--------|------|-------------|
| Улица | 1–20 | `street` | M1, M11, M12(S1), M14, M15 |
| Кабинет | 21–50 | `cabinet` | + M3, M4, M5, M12(S2), M7(журнал) |
| Терминал | 51–80 | `terminal` | + M2(stack), M8, M9, M12(S3-S4), M10 |
| Система | 81–99 | `system` | + M13(лёд), M14(с noise), M12(E33) |

**Пороги уровней** (из `balanceConfig.ts:10`):
```
[0, 100, 250, 500, 1000, 1800, 3000, 4800, 7200, 10000, 15000,
 22000, 31000, 42000, 56000]
```
Уровень = индекс порога, когда XP превышает его значение.

**Дополнительные пороги по уровню** (из `epochStructure.ts:112`):
- level < 3 → confidence выключен
- level < 8 → identifyOptions = 0
- level < 14 → stackSlots = 0

---

## Матрица механик

| № | Механика | Эпоха появления | Уровень | UI-компонент | Статус | Файлы |
|---|----------|-----------------|---------|--------------|--------|-------|
| M1 | **Улика** (Evidence) | Улица | 1 | `EvidenceStrip` + подсветка на графике | ✅ Working | `ArenaScene.selectedEvidence`, `scenes/arena/EvidenceStrip.ts`, `epochStructure.evidenceRequired`, `epochStructure.evidenceHighlight` |
| M2 | **Стек решений** (Decision Stack) | Терминал | 51 | `CardRail` в режиме `stack` + слоты плана | ✅ Working (partially gated) | `ArenaScene.cardStack`, `scenes/arena/CardRail.ts`, `epochStructure.stackSlots`, `epochStructure.cardMode='stack'` |
| M3 | **Ставка уверенности** (Confidence) | Кабинет | 21 | `ConfidencePicker` | ✅ Working | `ArenaScene.confidence`, `scenes/arena/ConfidencePicker.ts`, `epochStructure.confidence`, `scoring.ts:confMul` |
| M4 | **Вердикт конфликта** (Conflict Verdict) | Кабинет | 21 | `VerdictRow` | ✅ Working | `ArenaScene.encounter.verdict`, `scenes/arena/VerdictRow.ts`, `epochStructure.verdict`, `scoring.ts` |
| M5 | **Опознание врага** (Enemy Identify) | Кабинет | 8* | `FeedbackOverlay.showIdentify` — карточки врагов | ✅ Working (but see bug) | `scenes/arena/FeedbackOverlay.ts:130`, `data/enemies.ts`, `epochStructure.identifyOptions` |
| M6 | **Проигрыш вперёд** (Forward Playback) | Улица | 1 | `CandleChart.playForward` в `FeedbackOverlay` | ✅ Working | `scenes/arena/FeedbackOverlay.ts:112`, `engine/scenarioGen.ts:58`, `ui/CandleChart.ts` |
| M7 | **Журнал ошибок** (Error Scroll) | Кабинет | 21 | `ErrorJournalScene` + счётчик в `MoreScene` | ✅ Working | `state/GameState.pushError`, `scenes/ErrorJournalScene.ts`, `ArenaScene.ts:658` |
| M8 | **Комбо карт** (Card Combos) | Терминал | 51 | — (нет UI) | ⚠️ Data only | `data/combos.ts`, `types.ComboDef`, `progress.combosUnlocked` — **NO detection logic** |
| M9 | **Слепой источник** (Blind Source) | Терминал | 51 | `SourceBrowser` с кнопкой "открыть за бюджет" | ✅ Working | `scenes/arena/SourceBrowser.ts`, `ArenaScene.openBlindSource()`, `epochStructure.blindTab` |
| M10 | **Холодная голова** (Cold Head) | Терминал | 51 | `showColdHead` — пауза после серии ошибок | ✅ Working | `ArenaScene.showColdHead()`, `config.balanceConfig.coldHead`, `ArenaScene.ts:534` |
| M11 | **Мутация сценария** (Scenario Mutation) | Улица | 1 | (скрыт в `mutate`) | ✅ Working | `engine/mutator.ts`, `engine/seed.ts`, `engine/scenarioGen.ts` |
| M12 | **Кампания врага** (Enemy Campaign) | Улица | 1 (S1) | `arena.stage` на враге, `enemyStagesReached` | ✅ Working | `data/enemies.ts`, `ArenaScene.ts:135`, `progress.enemyStagesReached` |
| M13 | **Погода рынка** (Market Weather) | Система | 81* | `TREND`/`RANGE`/`VOLATILE` в `DailyWarmupScene` | ✅ Working (budget-only) | `state/GameState.weather`, `scenes/DailyWarmupScene.ts:56`, `ui/copy.ts` |
| M14 | **Тень арены** (Arena Shadow) | Улица | 1 | `scenario.shadow` бары в `FeedbackOverlay` | ✅ Working | `engine/scenarioGen.ts:203`, `FeedbackOverlay.ts:177` |
| M15 | **Бюджет риска** (Risk Budget) | Улица | 1 | Top-bar budget counter, blind cost | ✅ Working | `state/GameState.changeBudget`, `ArenaScene.ts:274`, `feedback/verdict.budgetDelta` |

\* M5 появляется на level 21, но `identifyOptions` выключен до level 8 через `structureForLevel`.
\** M13 погода есть в GameState, но активирует задачу в DailyWarmup только как source карты задач.

---

## Последовательность появления (chronological)

Игроки видят механики в этом порядке по мере прогрессии:

```
Level 1:  M1, M6, M11, M14, M15  →  "Найди улику → ответ → посмотри проигрыш вперёд → получи награду"
Level 21: +M3, M4, M7, M5          →  "Оцени уверенность → дай вердикт → запиши ошибку → опознай врага"
Level 51: +M2, M8, M9, M10         →  "Собирай стек карт → открывай слепые вкладки за бюджет → если тilt — остынь"
Level 81: +M13                     →  "Погода: выбирай задачи по условиям рынка"
```

**M8 Combo** — это **сокрытая механика**: враги на S3/S4 этапах требуют определённые
комбо (`comboRequired: ['K01', 'T05' ...]`), но **никодж код не проверяет**, есть ли
у игрока разблокированное комбо. Комбо открывается при N верных ответах с нужными картами,
но логика обнаружения отсутствует.

---

## Баги, найденные в ходе аудита

### Баг 1: Переход эпох никогда не срабатывает

**Файл:** `ArenaScene.ts:702-703`

```typescript
onNext: () => {
  const before = this.epoch.id;           // getter → epochOf(this.progress.level)
  const after = getEpochForLevel(this.progress.level);  // level уже обновлён!
  if (before !== after) showEpochTransition(this, after, () => this.restartEncounter());
  else this.restartEncounter();
}
```

`this.epoch` — это **getter** (line 72-73): `return epochOf(this.progress.level)`.
К моменту вызова `onNext`, `this.progress.level` **уже обновлён** в `addXp()`,
а `progress.epoch` — обновлён в `refreshEpoch()`. Обе ветки читают **одно и то же**
уже-обновлённое значение. `before === after` всегда `true`.

**Следствие:** игроки 20→21, 50→51, 80→81 никогда не видят анимацию перехода эпохи.
Ни `StatusOverlays.showEpochTransition`, ни `restartEncounter` с новой палитрой не вызываются.

**Фикс:** запоминать предыдущую эпоху до `addXp`, либо сравнивать `progress.epoch`
с сохранённым `this.lastEpoch` до обновления.

### Баг 2: M8 Combo — данные есть, логика нет

`scoreEncounter()` в `scoring.ts` никогда не:
- не проверяет `enemy.comboRequired`
- не сравнивает выбранные карты с `combos[].cards`
- не ставит `comboProgress: true`
- не добавляет в `progress.combosUnlocked`

**Фикс:** в `ArenaScene.onSubmit` перед scoring добавить проверку комбо.

### Баг 3: M5 Identify — перемешивание не детерминировано по seed

`FeedbackOverlay.ts:144` использует `shuffle` на основе `encounter.seed`, но
алгоритм сортировки `(seed + charCode) % 7` может давать одинаковые значения
для разных врагов, что приводит к нестабильному порядке в ES2020.

---

## Резюме: что реализовано vs что требует доработки

| Статус | Механики |
|--------|----------|
| ✅ Полностью работает | M1, M3, M4, M5, M6, M7, M9, M10, M11, M12, M14, M15 |
| ✅ Работает с ограничениями | M2 (stackSlots открывается на L51, но M8 combo gates не работают) |
| ⚠️ Данные есть, логика нет | M8 (комбо не детектируются, comboRequired не проверяются) |
| ⚠️ Баг в триггере | M13 (погода активна как source задач, но не влияет на сценарии) |
| ❌ Переход эпох не работает | M2/M3/M4/M5/M8/M9/M10 (все "входят" через переход эпох, который не срабатывает) |
