import { useState, type ReactNode } from "react";
import { Card, Chip, Eyebrow, Lead, Title } from "../components/ui";
import { copyBeforeAfter } from "../data/audit";
import { cn } from "../utils/cn";

/* ───────────── Phone mock: before / after ───────────── */

function PhoneFrame({ children, label, tone }: { children: ReactNode; label: string; tone: "bad" | "good" }) {
  return (
    <div className="flex flex-col items-center">
      <div className={cn("mb-3 font-mono text-[11px] uppercase tracking-[0.2em]", tone === "bad" ? "text-bad" : "text-good")}>{label}</div>
      <div className="relative w-[260px] rounded-[32px] border-[6px] border-strong bg-bg shadow-2xl" style={{ aspectRatio: "390/844" }}>
        <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-strong" />
        <div className="absolute inset-0 overflow-hidden rounded-[26px] pt-7">{children}</div>
      </div>
    </div>
  );
}

function BeforeScreen() {
  const t = "font-mono text-[4.5px] leading-[1.2] text-muted";
  return (
    <div className="flex h-full flex-col px-2 text-[4.5px]">
      <div className={t}>УР.4 · УЛИЦА · ⚑ TREND · ☰ 0 · ×2</div>
      <div className="mt-1 border border-border bg-surface px-1 py-0.5 flex justify-between">
        <span className={t}>ПОГОДА: ТРЕНД — следуй структуре</span>
        <span className={t}>1–20</span>
      </div>
      <div className="mt-1 text-center font-bold text-[8px] text-accent leading-tight">ПАМП БЕЗ ОБЪЁМА — ВХОДИТЬ?</div>
      <div className={cn(t, "text-center")}>BTC · 15m · T-014 · атомы C2.3, C1.1</div>
      <div className="mt-1 flex items-center gap-1 border border-strong bg-surface px-1 py-0.5">
        <span className="h-3 w-3 rounded-full border border-strong text-center text-[6px] text-accent">?</span>
        <div>
          <div className="text-[5px] text-sub">UNKNOWN THREAT</div>
          <div className={t}>Враг раскроется после решения · M5</div>
        </div>
        <span className={cn(t, "ml-auto")}>силуэт 5–8% rim</span>
      </div>
      <div className="mt-1 border border-strong bg-inset">
        <div className="flex items-center gap-1 border-b border-border bg-elevated px-1 py-0.5">
          <span className="text-[3px] text-muted">● ● ●</span>
          <span className={t}>arena://sandbox/t-014</span>
          <span className={cn(t, "ml-auto")}>SEED 48213</span>
        </div>
        <div className="flex">
          {["ГРАФИК", "НОВОСТИ", "СТАКАН 🔒"].map((x, i) => (
            <div key={x} className={cn("flex-1 border-b border-r border-border py-1 text-center", i === 0 ? "bg-hover text-accent" : "text-sub")}>
              <span className="text-[4.5px]">{x}</span>
            </div>
          ))}
        </div>
        <div className="p-1">
          <div className={t}>BTC · 15m · свечи + объём</div>
          <div className="mt-1 flex items-end gap-[3px] h-8">
            {[3, 5, 4, 7, 6, 9, 8, 6, 10, 12, 9, 11, 14, 13, 12].map((h, i) => (
              <div key={i} className={cn("w-1.5", i % 3 === 0 ? "bg-bad" : "bg-good", i === 12 && "ring-1 ring-accent")} style={{ height: h * 2 }} />
            ))}
          </div>
          <div className="text-[3.5px] text-warn bg-elevated inline-block mt-0.5 px-0.5">ЯРЛЫК: ПАМP БЕЗ ОБЪЁМА ★</div>
          {["○ объём −38% к среднему", "○ фитиль сверху длиннее тела"].map((x) => (
            <div key={x} className="mt-0.5 h-[7px] border border-border bg-surface px-0.5 text-[4px] text-sub leading-[7px]">
              {x}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 h-2 border border-border bg-surface px-1 text-[4px] leading-[8px] text-muted">УЛИКИ: — тапни зону в источнике — нужно минимум 1</div>
      <div className="mt-1 grid grid-cols-4 gap-0.5">
        {["C1 СТОП", "C2 ОБЪЁМ", "C4 R:R", "ЖДАТЬ"].map((x) => (
          <div key={x} className="h-6 rounded-sm border border-border bg-surface text-center text-[4px] leading-[24px] text-sub">
            {x}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-2 gap-0.5">
        {["A · Купить сейчас", "B · Ждать ретест", "C · Шорт от хая", "D · Ждать объём"].map((x) => (
          <div key={x} className="h-7 rounded-sm border border-border bg-surface p-0.5">
            <div className="text-[4.5px] text-bad">{x.split(" · ")[0]}</div>
            <div className="text-[4px] text-text">{x.split(" · ")[1]}</div>
          </div>
        ))}
      </div>
      <div className={cn(t, "mt-1")}>M1: выбери улику в источнике, затем ответ — иначе неполная награда</div>
      <div className="absolute right-2 top-9 rounded-sm border border-border bg-elevated px-1 text-[4px] text-sub">LVL+8</div>
      <div className="mt-auto flex border-t border-border bg-[#0a0b0d] py-1">
        {["АКАДЕМИЯ", "АРЕНА", "КОЛЛЕКЦИЯ", "ЕЩЁ"].map((x, i) => (
          <div key={x} className={cn("flex-1 text-center text-[4px]", i === 1 ? "text-accent" : "text-muted")}>
            ▪<br />
            {x}
          </div>
        ))}
      </div>
    </div>
  );
}

function AfterScreen() {
  return (
    <div className="flex h-full flex-col px-2.5">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[7px] text-sub">
          Ур. <span className="text-text">4</span> · Улица
        </div>
        <div className="flex gap-1">
          <span className="rounded-md bg-elevated px-1.5 py-0.5 font-mono text-[7px] text-good">▮ 82</span>
          <span className="rounded-md bg-elevated px-1.5 py-0.5 font-mono text-[7px] text-warn">×2</span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-good" />
        <span className="text-[7px] text-sub">Тренд — следуй структуре</span>
      </div>
      <div className="mt-2.5 text-[11px] font-bold leading-tight text-text">Памп без объёма — входить?</div>
      <div className="mt-0.5 font-mono text-[6.5px] text-muted">BTC · 15m</div>

      <div className="mt-2 rounded-lg border border-strong bg-inset">
        <div className="flex">
          {["График", "Новости", "🔒 Стакан"].map((x, i) => (
            <div
              key={x}
              className={cn(
                "flex-1 py-1.5 text-center text-[7px] font-medium",
                i === 0 ? "border-b-2 border-accent text-accent" : "border-b border-border text-sub",
              )}
            >
              {x}
            </div>
          ))}
        </div>
        <div className="p-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[6px] text-muted">свечи + объём</span>
            <span className="rounded border border-border px-1 py-px text-[6px] text-sub">⤢ развернуть</span>
          </div>
          <div className="mt-1.5 flex items-end gap-[4px] h-14">
            {[3, 5, 4, 7, 6, 9, 8, 6, 10, 12, 9, 11, 14, 13, 12].map((h, i) => (
              <div key={i} className={cn("flex-1 rounded-sm", i % 3 === 0 ? "bg-bad" : "bg-good", i === 12 && "ring-2 ring-accent animate-pulse")} style={{ height: h * 3.5 }} />
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-1 rounded-md border border-accent/50 bg-accent/10 px-1.5 py-1">
            <span className="h-2.5 w-2.5 rounded-sm border border-accent bg-accent text-[6px] text-bg text-center leading-[10px]">✓</span>
            <span className="text-[7px] text-text">Объём −38% к среднему</span>
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {["Купить сейчас", "Ждать ретест", "Шорт от хая", "Ждать объём"].map((x, i) => (
          <div
            key={x}
            className={cn(
              "flex h-9 items-center rounded-lg border px-2 text-[7.5px] font-medium",
              i === 3 ? "border-accent bg-accent text-bg" : "border-border bg-surface text-text",
            )}
          >
            <span className="mr-1.5 font-mono text-[6.5px] opacity-70">{"ABCD"[i]}</span>
            {x}
          </div>
        ))}
      </div>
      <div className="mt-2 flex h-9 items-center justify-center rounded-xl bg-accent text-[8px] font-bold text-bg">Насколько ты уверен? →</div>
      <div className="mt-1 text-center text-[6px] text-muted">Доказательство найдено · ответ засчитается полностью</div>

      <div className="mt-auto flex border-t border-border bg-[#0a0b0d] py-1.5">
        {["Академия", "Арена", "Коллекция", "Ещё"].map((x, i) => (
          <div key={x} className={cn("flex-1 text-center text-[6px]", i === 1 ? "text-accent" : "text-sub")}>
            <div className="text-[8px]">▪</div>
            {x}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TypographySlide() {
  return (
    <div>
      <Eyebrow>Исправления · UX</Eyebrow>
      <Title className="mt-2">Читаемость и тач-зоны: тот же экран, другой опыт</Title>
      <Lead className="mt-3">
        Слева — реконструкция текущей Арены по коду (кегли и высоты блоков сохранены пропорционально). Справа — тот же макет
        после типографической шкалы, тап-зон 44px и фокуса на одном действии.
      </Lead>
      <div className="mt-8 grid gap-8 lg:grid-cols-[auto_1fr] items-start">
        <div className="flex flex-wrap justify-center gap-8">
          <div className="anim-in delay-1">
            <PhoneFrame label="Сейчас · 7px · 14px hit-area" tone="bad">
              <BeforeScreen />
            </PhoneFrame>
          </div>
          <div className="anim-in delay-2">
            <PhoneFrame label="После · 14–20px · 44px hit-area" tone="good">
              <AfterScreen />
            </PhoneFrame>
          </div>
        </div>
        <div className="space-y-3">
          <Card className="anim-in delay-3">
            <div className="font-semibold">Типографическая шкала</div>
            <div className="mt-3 space-y-2">
              {[
                ["Заголовок задачи", 20, "Inter 700"],
                ["Тело / ответы", 15, "Inter 500"],
                ["Подписи, чипы", 12, "Inter 500"],
                ["Числа, тикеры", 13, "Mono 500"],
              ].map(([n, s, f]) => (
                <div key={String(n)} className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
                  <span style={{ fontSize: Number(s) }} className={cn(String(f).startsWith("Mono") && "font-mono")}>
                    {n}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {s}px · {f}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="anim-in delay-4">
            <div className="font-semibold">Правила касания</div>
            <ul className="mt-2 space-y-1.5 text-[14px] text-sub">
              <li>• Любая интерактивная зона — не меньше 44×44 pt, шаг между зонами ≥ 8 pt</li>
              <li>• Главное действие всегда одно и всегда внизу — под большим пальцем</li>
              <li>• Список улик — строки 48 pt с чекбоксом 24 pt, а не 14 pt текст</li>
              <li>• Вкладки источников — 44 pt высотой, свайп между вкладками</li>
              <li>• Раскрытие графика на весь экран — кнопка «⤢», как просит ТЗ</li>
            </ul>
          </Card>
          <div className="anim-in delay-5 flex flex-wrap gap-2">
            <Chip tone="good">+5 типографика</Chip>
            <Chip tone="good">+2 роли шрифтов</Chip>
            <Chip tone="good">+4 тап-зоны</Chip>
            <Chip tone="good">+3 фокус экрана</Chip>
            <Chip tone="accent">= 14 баллов</Chip>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Copy ───────────── */

export function CopySlide() {
  return (
    <div>
      <Eyebrow>Исправления · Тексты</Eyebrow>
      <Title className="mt-2">Игрок не должен читать спецификацию</Title>
      <Lead className="mt-3">
        Метки M1–M15 — отличный инструмент для команды и телеметрии. На экране они превращают обучение в отчёт о выполнении ТЗ.
        Правило простое: если строку нельзя произнести вслух другу — её нельзя показывать игроку.
      </Lead>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-2 bg-inset font-mono text-[11px] uppercase tracking-wider">
          <div className="px-4 py-2.5 text-bad">Сейчас в коде</div>
          <div className="px-4 py-2.5 text-good">Как должно звучать</div>
        </div>
        {copyBeforeAfter.map((r, i) => (
          <div key={i} className={cn("grid grid-cols-2 border-t border-border anim-in", `delay-${Math.min(6, i + 1)}`)}>
            <div className="px-4 py-3 font-mono text-[12px] leading-relaxed text-sub line-through decoration-bad/60">{r.before}</div>
            <div className="px-4 py-3 text-[14px] leading-relaxed text-text">{r.after}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Card>
          <div className="font-semibold">1. Вынести строки</div>
          <p className="mt-1 text-[14px] text-sub">Все тексты — в `i18n/ru.json`. В коде — только ключи. Так редактор правит тон без разработчика.</p>
        </Card>
        <Card>
          <div className="font-semibold">2. Один голос</div>
          <p className="mt-1 text-[14px] text-sub">Тон по стиль_тон.txt: короткие фразы, «ты», без капса в теле текста, без англицизмов, где есть русское слово.</p>
        </Card>
        <Card>
          <div className="font-semibold">3. Проверка в CI</div>
          <p className="mt-1 text-[14px] text-sub">cspell с русским словарём + правило «нет паттерна `M\d+` и `ТЗ` в ru.json». Опечатки не доходят до сборки.</p>
        </Card>
      </div>
    </div>
  );
}

/* ───────────── Architecture ───────────── */

export function ArchitectureSlide() {
  const [mode, setMode] = useState<"before" | "after">("before");
  const before = ["create()", "createTopBar", "createWeatherStrip", "createQuestion", "createThreat", "createBrowser", "renderSource ×5", "createEvidenceStrip", "refreshEvidenceStrip", "createSkills", "createAnswerBlock", "showConfidencePicker", "submitSequence", "submitAnswer", "handleResult", "showFeedback", "showIdentify", "showShadowAndReward", "showLeviathan", "showStageTransition", "createBottomNav", "createDebugStageSwitcher"];
  const after = {
    scene: ["ArenaScene (композиция, ~120 строк)"],
    ui: ["TopBar", "WeatherStrip", "QuestionCard", "ThreatBadge", "SourceBrowser", "CandleChart", "NewsFeed", "OrderBook", "EvidenceStrip", "CardHand", "AnswerGrid", "ConfidencePicker", "BottomNav"],
    overlays: ["FeedbackOverlay", "IdentifyStep", "CrowdShadow", "RewardPanel", "LeviathanOverlay", "StageTransition"],
    state: ["store/arena.ts (Zustand)", "store/progress.ts", "selectors.ts"],
    engine: ["scenario-gen", "scoring", "mutator", "rng (seedrandom)"],
    infra: ["api/client.ts", "motion.ts", "typography.ts", "i18n/ru.json"],
  };
  return (
    <div>
      <Eyebrow>Исправления · Архитектура</Eyebrow>
      <Title className="mt-2">Из одной сцены на 1000 строк — в композицию компонентов</Title>
      <Lead className="mt-3">
        Сейчас ArenaScene знает всё: как рисовать свечи, как считать очки, как показывать Левиафана. Любая правка — риск сломать
        соседний блок, любая анимация — невозможна, потому что состояние меняется через scene.restart().
      </Lead>
      <div className="mt-6 flex gap-2">
        {(["before", "after"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "min-h-11 rounded-xl border px-4 text-[13px] font-medium transition",
              mode === m ? "border-accent bg-accent/10 text-accent" : "border-border text-sub hover:border-strong",
            )}
          >
            {m === "before" ? "Сейчас" : "После"}
          </button>
        ))}
      </div>
      {mode === "before" ? (
        <Card className="anim-in mt-4" accent="#ff596d">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[13px] text-bad">ArenaScene.ts · ~1000 строк · 1 строка кода · 0 тестов</div>
            <Chip tone="bad">god-object</Chip>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {before.map((m) => (
              <span key={m} className="rounded-md border border-bad/30 bg-bad/5 px-2 py-1 font-mono text-[11px] text-sub">
                {m}()
              </span>
            ))}
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3 text-[13px] text-sub">
            <div>• Рендер + логика + скоринг в одном классе</div>
            <div>• Каждое изменение — scene.restart()</div>
            <div>• Мок-данные внутри методов отрисовки</div>
          </div>
        </Card>
      ) : (
        <div className="anim-in mt-4 grid gap-3 md:grid-cols-3">
          {Object.entries(after).map(([k, items], i) => (
            <Card key={k} className={`anim-in delay-${i + 1}`} accent={["#31d6c4", "#3bde8a", "#b98cff", "#ffb341", "#59a7ff", "#9aa6bd"][i]}>
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted">{k}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {items.map((m) => (
                  <span key={m} className="rounded-md border border-border bg-inset px-2 py-1 font-mono text-[11px] text-text">
                    {m}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          ["Файл ≤ 300 строк", "линтер падает на большем"],
          ["Компонент = класс с create/update/destroy", "и подпиской на срез стора"],
          ["Стор — единственный источник правды", "сцена не хранит selectedEvidence"],
          ["Данные не знают о Phaser", "engine/ тестируется в Node без холста"],
        ].map(([t, d]) => (
          <Card key={t}>
            <div className="text-[14px] font-semibold">{t}</div>
            <div className="mt-1 text-[13px] text-sub">{d}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ───────────── Motion ───────────── */

export function MotionSlide() {
  const [play, setPlay] = useState(0);
  const rows = [
    { what: "Тап по карте / ответу", now: "ничего", after: "scale 1 → 0.96 → 1, 120 ms, Back.Out", pts: "+1" },
    { what: "Появление панели ставки", now: "мгновенно поверх", after: "slide-up 24 px + fade, 240 ms, Cubic.Out", pts: "+0.5" },
    { what: "«Проигрыш вперёд» (6 свечей)", now: "статичные прямоугольники", after: "по одной свече 200 ms, тело растёт от 0, линия входа подсвечивается", pts: "+2" },
    { what: "Счётчики XP / SIG / бюджет", now: "число меняется скачком", after: "tween числа 600 ms + всплывающий «+35»", pts: "+0.5" },
    { what: "Раскрытие врага (опознание)", now: "текст под кнопкой", after: "силуэт → портрет: маска rim-light 400 ms, лёгкий shake", pts: "+1" },
    { what: "Переход между сценами", now: "scene.start без перехода", after: "общий fade 180 ms, навигация остаётся на месте", pts: "+0.5" },
    { what: "Смена стадии", now: "оверлей с текстом", after: "палитра перетекает 800 ms, токены анимируются, без restart", pts: "+0.5" },
    { what: "Ошибка / промах", now: "camera.flash красным", after: "shake 80 ms + haptic 30 ms + SFX; flash убрать (утомляет)", pts: "+1" },
  ];
  return (
    <div>
      <Eyebrow>Исправления · Анимации</Eyebrow>
      <Title className="mt-2">Микро-движение вместо вспышек камеры</Title>
      <Lead className="mt-3">
        ТЗ ставит интерактив и анимации в приоритет, а в коде — только camera.flash и camera.shake. Ниже — спецификация motion.ts:
        что, куда и за сколько миллисекунд. Всё — штатные Phaser-твины, без внешних библиотек.
      </Lead>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[1.2fr_1fr_1.6fr_auto] bg-inset font-mono text-[11px] uppercase tracking-wider text-muted">
            <div className="px-3 py-2.5">Событие</div>
            <div className="px-3 py-2.5 text-bad">Сейчас</div>
            <div className="px-3 py-2.5 text-good">После</div>
            <div className="px-3 py-2.5">Б.</div>
          </div>
          {rows.map((r, i) => (
            <div key={r.what} className={cn("grid grid-cols-[1.2fr_1fr_1.6fr_auto] border-t border-border text-[13px] anim-in", `delay-${Math.min(6, i + 1)}`)}>
              <div className="px-3 py-2.5 font-medium">{r.what}</div>
              <div className="px-3 py-2.5 text-sub">{r.now}</div>
              <div className="px-3 py-2.5 text-text">{r.after}</div>
              <div className="px-3 py-2.5 font-mono text-good">{r.pts}</div>
            </div>
          ))}
        </div>
        <Card className="anim-in delay-3 flex flex-col items-center">
          <div className="font-semibold self-start">Демо: «проигрыш вперёд»</div>
          <div className="mt-4 flex h-32 items-end gap-2" key={play}>
            {[6, 9, 7, 11, 13, 16].map((h, i) => (
              <div
                key={i}
                className={cn("w-7 rounded-sm", i < 3 ? "bg-bad/80" : "bg-good/80")}
                style={{
                  height: h * 7,
                  transformOrigin: "bottom",
                  animation: `grow-y 0.35s cubic-bezier(.22,1,.36,1) ${i * 0.2}s both`,
                }}
              />
            ))}
          </div>
          <style>{`@keyframes grow-y{from{transform:scaleY(0);opacity:.3}to{transform:scaleY(1);opacity:1}}`}</style>
          <div className="mt-2 font-mono text-[11px] text-muted">6 × 200 ms · тело растёт от 0</div>
          <button onClick={() => setPlay((p) => p + 1)} className="mt-4 min-h-11 w-full rounded-xl bg-accent text-[13px] font-semibold text-bg">
            ▶ Проиграть ещё раз
          </button>
        </Card>
      </div>
    </div>
  );
}
