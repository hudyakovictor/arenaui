import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CandlestickChart, Newspaper, ListChecks, Lock, TrendingUp, TrendingDown, Pause, Search, ChevronRight, RotateCcw, FileText, CloudLightning, Eye, EyeOff } from "lucide-react";
import CandleChart from "../components/CandleChart";
import { Button, Tag, Modal, Progress } from "../components/ui";
import { scenarios, skillCards, enemies, weather, type SourceId, type CardId, type Direction, type StopMode, type Clue } from "../data/game";
import { useGame } from "../store";
import { cn } from "../utils/cn";

type Step = "evidence" | "decision" | "playforward" | "feedback";

const sources: { id: SourceId; label: string; Icon: typeof Newspaper; locked?: boolean }[] = [
  { id: "chart", label: "График", Icon: CandlestickChart },
  { id: "news", label: "Новости", Icon: Newspaper },
  { id: "check", label: "Чек-лист", Icon: ListChecks },
  { id: "blind", label: "Слепой", Icon: EyeOff, locked: true },
];

type Result = { pnlPct: number; win: boolean; xp: number; stopped: boolean; exit: number; coins: number };

export default function Arena({ onGoAcademy }: { onGoAcademy: () => void }) {
  const g = useGame();
  const [scIdx, setScIdx] = useState(0);
  const sc = scenarios[scIdx];
  const enemy = enemies.find((e) => e.id === sc.enemyId)!;

  const [step, setStep] = useState<Step>("evidence");
  const [tab, setTab] = useState<SourceId>("chart");
  const [card, setCard] = useState<CardId | null>(null);
  const [found, setFound] = useState<Clue[]>([]);
  const [tried, setTried] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [shake, setShake] = useState(false);
  const [lastClue, setLastClue] = useState<Clue | null>(null);

  const [dir, setDir] = useState<Direction | null>(null);
  const [risk, setRisk] = useState(2);
  const [stop, setStop] = useState<StopMode>("level");

  const [revealed, setRevealed] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [review, setReview] = useState(false);
  const iv = useRef<number | null>(null);

  const confidence = found.length;
  const entry = sc.candles[sc.candles.length - 1][3];

  const stopPrice = useMemo(() => {
    if (!dir || dir === "flat" || stop === "none") return undefined;
    if (stop === "market") return dir === "long" ? +(entry * 0.985).toFixed(1) : +(entry * 1.015).toFixed(1);
    if (dir === "long") return sc.level < entry ? sc.level - 0.5 : +(entry * 0.97).toFixed(1);
    return sc.level > entry ? sc.level + 0.5 : +(entry * 1.03).toFixed(1);
  }, [dir, stop, entry, sc.level]);

  const reset = useCallback((next?: number) => {
    if (iv.current) window.clearInterval(iv.current);
    if (next != null) setScIdx(next);
    setStep("evidence");
    setTab("chart");
    setCard(null);
    setFound([]);
    setTried(new Set());
    setScanning(false);
    setLastClue(null);
    setDir(null);
    setRisk(2);
    setStop("level");
    setRevealed(0);
    setResult(null);
  }, []);

  /* ---------- Evidence: scan source with card ---------- */
  const scan = (cid: CardId) => {
    if (scanning || step !== "evidence") return;
    if (tab === "blind") {
      g.toast("Слепой источник открывается на уровне 15", "gold");
      return;
    }
    const key = `${cid}:${tab}`;
    setCard(cid);
    if (tried.has(key)) {
      g.toast("Источник уже просканирован этой картой", "gold");
      return;
    }
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setTried((p) => new Set([...p, key]));
      const clue = sc.clues.find((c) => c.card === cid && c.source === tab && !found.some((f) => f.id === c.id));
      if (clue) {
        setFound((p) => [...p, clue]);
        setLastClue(clue);
        g.toast(`Улика найдена: ${clue.title}`);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 450);
        g.toast("Карта молчит. Источник не тот.", "bad");
      }
      setCard(null);
    }, 950);
  };

  /* ---------- Play-forward ---------- */
  const enter = () => {
    if (!dir) return;
    setStep("playforward");
    setRevealed(0);
  };

  useEffect(() => {
    if (step !== "playforward") return;
    let i = 0;
    iv.current = window.setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= sc.future.length) {
        if (iv.current) window.clearInterval(iv.current);
        setTimeout(() => finish(), 450);
      }
    }, 380);
    return () => {
      if (iv.current) window.clearInterval(iv.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // pnl after n revealed candles (pure, so it can be reused at finish)
  const computeLive = useCallback(
    (n: number) => {
      if (!dir || dir === "flat" || n === 0) return { pnlPct: 0, stopped: false, exit: entry };
      const riskAmt = (g.deposit * risk) / 100;
      const dist = stopPrice != null ? Math.abs(entry - stopPrice) : entry * 0.02;
      const size = riskAmt / dist;
      const sign = dir === "long" ? 1 : -1;
      let exit = entry;
      let stopped = false;
      for (let k = 0; k < n; k++) {
        const [, h, l, c] = sc.future[k];
        if (stopPrice != null && ((dir === "long" && l <= stopPrice) || (dir === "short" && h >= stopPrice))) {
          exit = stopPrice;
          stopped = true;
          break;
        }
        exit = c;
      }
      const pnl = size * (exit - entry) * sign;
      return { pnlPct: Math.max(-100, (pnl / g.deposit) * 100), stopped, exit };
    },
    [dir, entry, risk, stopPrice, sc.future, g.deposit]
  );

  const live = useMemo(() => computeLive(revealed), [computeLive, revealed]);

  const finish = () => {
    const flat = dir === "flat";
    const live = computeLive(sc.future.length);
    const win = flat ? sc.correct === "flat" : live.pnlPct > 0;
    let xp = 0;
    let coins = 0;
    if (win) {
      xp = 120 + confidence * 20;
      coins = 40 + confidence * 10;
    } else if (flat) {
      xp = 25;
      coins = 5;
    } else {
      xp = 30;
      coins = 5;
    }
    if (!flat && (risk >= 20 || stop === "none")) xp += 60; // "за храбрость"
    const r: Result = { pnlPct: flat ? 0 : live.pnlPct, win, xp, stopped: live.stopped, exit: live.exit, coins };
    setResult(r);
    if (!flat) g.applyPnl(r.pnlPct);
    g.addXp(xp);
    g.addCoins(coins);
    g.recordFight(win);
    if (confidence >= 2) g.reveal(enemy.id);
    setStep("feedback");
  };

  const next = () => reset((scIdx + 1) % scenarios.length);

  const stepIdx = ["evidence", "decision", "playforward", "feedback"].indexOf(step);

  return (
    <div className="space-y-4 pb-6">
      {/* weather + meta */}
      <div className="flex items-center gap-2">
        <div className="card flex flex-1 items-center gap-3 px-3 py-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lg">{weather.emoji}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-[10px] uppercase tracking-[0.16em] text-muted">Погода рынка</span>
              <Tag className="bg-bad text-white">{weather.state}</Tag>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-[11px] text-sub">
              <span className="flex items-center gap-1">
                <CloudLightning size={11} className="text-warn" /> Волатильность {weather.volatility}
              </span>
              <span>Индекс веры {weather.faith}</span>
            </div>
          </div>
        </div>
        <div className="card px-3 py-2 text-right">
          <div className="font-display text-[10px] uppercase tracking-[0.16em] text-muted">Бой</div>
          <div className="font-display text-lg font-semibold leading-tight">#{g.fights + 1}</div>
        </div>
      </div>

      {/* step indicator */}
      <div className="grid grid-cols-4 gap-1.5">
        {["Улики", "Решение", "Рынок", "Итог"].map((s, i) => (
          <div key={s} className="space-y-1">
            <div className={cn("h-1 rounded-full transition-all duration-500", i < stepIdx ? "bg-acid/50" : i === stepIdx ? "bg-acid shadow-[0_0_8px_#c8ff00]" : "bg-line")} />
            <div className={cn("font-display text-[10px] uppercase tracking-widest", i === stepIdx ? "text-acid" : "text-muted")}>{s}</div>
          </div>
        ))}
      </div>

      {/* headline */}
      <div className="space-y-1" key={`${sc.id}-${step === "feedback"}`}>
        <h1 className="stencil animate-fade-up text-[28px] leading-[1.02]">
          {step === "feedback"
            ? result?.win
              ? dir === "flat"
                ? "Терпение зачтено."
                : "Прибыль зафиксирована."
              : dir === "flat"
              ? "Ты ждал. Рынок — нет."
              : "Рынок принял решение."
            : step === "decision"
            ? "Твоё движение."
            : step === "playforward"
            ? "Рынок думает…"
            : sc.headline}
        </h1>
        <p className="animate-fade-up text-[13px] text-sub">
          {step === "feedback"
            ? result?.win
              ? "Не привыкай. Рынок уже заметил твою самоуверенность."
              : dir === "flat"
              ? "Не войти — тоже решение. Не всегда лучшее."
              : "Рынок благодарит за ликвидность."
            : step === "decision"
            ? "Помни: не войти — тоже решение. Обычно лучшее."
            : step === "playforward"
            ? "Он всегда думает дольше, чем ты надеялся."
            : sc.sub}
        </p>
      </div>

      {/* Browser shell */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-1 border-b border-line bg-ink/50 px-2 pt-2">
          {sources.map(({ id, label, Icon, locked }) => {
            const on = tab === id;
            const hasClue = found.some((c) => c.source === id);
            return (
              <button
                key={id}
                onClick={() => (locked ? g.toast("Слепой источник открывается на уровне 15", "gold") : setTab(id))}
                className={cn(
                  "press relative flex flex-1 items-center justify-center gap-1.5 rounded-t-xl border border-b-0 px-2 py-2 font-display text-[11px] font-semibold uppercase tracking-wider transition-all",
                  on ? "border-line bg-surface text-acid" : "border-transparent text-muted hover:text-sub",
                  locked && "opacity-60"
                )}
              >
                {locked ? <Lock size={12} /> : <Icon size={13} />}
                <span>{label}</span>
                {hasClue && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-acid shadow-[0_0_6px_#c8ff00]" />}
              </button>
            );
          })}
        </div>

        <div className="relative p-3">
          {/* url bar */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-wider text-sub">
              <span className="h-2 w-2 animate-pulse-live rounded-full bg-good" />
              {sc.pair} · {sc.tf}
            </div>
            <span className="text-[10px] text-muted">Не финрекомендация</span>
          </div>

          {tab === "chart" && (
            <CandleChart
              candles={sc.candles}
              future={sc.future}
              revealed={revealed}
              volumes={sc.volumes}
              level={sc.level}
              entry={step !== "evidence" && dir && dir !== "flat" ? entry : undefined}
              stop={step !== "evidence" && dir && dir !== "flat" ? stopPrice : undefined}
              scanning={scanning}
              highlightVolume={found.some((c) => c.card === "volume")}
              highlightWicks={found.some((c) => c.card === "candle")}
              height={250}
            />
          )}

          {tab === "news" && (
            <div className="relative space-y-2">
              {scanning && <div className="scan-line animate-scan z-10" />}
              {sc.news.map((n) => {
                const lit = n.key && found.some((c) => c.card === "mind");
                return (
                  <div key={n.id} className={cn("card-inset flex gap-3 p-3 transition-all", lit && "acid-ring")}>
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-elevated text-lg">{n.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="stencil text-[13px] leading-tight">{n.title}</div>
                        <span className="shrink-0 text-[10px] text-muted">{n.time}</span>
                      </div>
                      <div className="mt-0.5 text-[12px] text-sub">{n.text}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Tag className={n.tagColor}>{n.tag}</Tag>
                        {lit && <Tag className="bg-acid text-ink">Улика</Tag>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "check" && (
            <div className="relative space-y-1.5">
              {scanning && <div className="scan-line animate-scan z-10" />}
              {sc.checklist.map((k) => {
                const hidden = k.hidden && confidence < 2 && !found.some((c) => c.source === "check");
                return (
                  <div key={k.id} className="card-inset flex items-center justify-between px-3 py-2.5">
                    <span className={cn("text-[13px]", hidden && "text-muted")}>{hidden ? "??? — скрыто до 2 улик" : k.label}</span>
                    {hidden ? (
                      <Lock size={14} className="text-muted" />
                    ) : (
                      <Tag className={k.ok ? "bg-good/15 text-good" : "bg-bad/15 text-bad"}>{k.ok ? "есть" : "нет"}</Tag>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* live pnl overlay */}
          {step === "playforward" && dir && dir !== "flat" && (
            <div className={cn("absolute right-5 top-10 rounded-xl border px-3 py-1.5 font-display text-sm font-bold", live.pnlPct >= 0 ? "border-good/50 bg-ink/90 text-good" : "border-bad/50 bg-ink/90 text-bad")}>
              {live.pnlPct >= 0 ? "+" : ""}
              {live.pnlPct.toFixed(2)}% {live.stopped && "· СТОП"}
            </div>
          )}
          {step === "playforward" && dir === "flat" && (
            <div className="absolute right-5 top-10 rounded-xl border border-line bg-ink/90 px-3 py-1.5 font-display text-sm font-bold text-sub">ВНЕ РЫНКА</div>
          )}
        </div>
      </div>

      {/* ---------- EVIDENCE ---------- */}
      {step === "evidence" && (
        <>
          {/* confidence */}
          <div className="card p-3">
            <div className="flex items-center justify-between">
              <div className="font-display text-[11px] uppercase tracking-[0.16em] text-muted">Уверенность</div>
              <div className="font-display text-sm font-semibold">
                <span className={confidence >= 2 ? "text-acid" : "text-text"}>{confidence}</span>/3 сигнала ·{" "}
                <span className="text-sub">{confidence >= 3 ? "силуэт подтверждён" : confidence >= 2 ? "силуэт виден" : "силуэт скрыт"}</span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className={cn("h-2.5 rounded-full transition-all duration-500", i < confidence ? "bg-acid shadow-[0_0_10px_rgba(200,255,0,0.6)]" : "bg-ink")} />
              ))}
            </div>
            <div className="mt-3 flex min-h-[38px] flex-wrap gap-1.5">
              {found.length === 0 && <span className="text-[12px] text-muted">Выбери карту — она просканирует открытый источник.</span>}
              {found.map((c) => (
                <div key={c.id} className={cn("card-inset flex items-center gap-2 px-2.5 py-1.5", lastClue?.id === c.id && "animate-pop acid-ring")}>
                  <Search size={12} className="text-acid" />
                  <div>
                    <div className="font-display text-[11px] font-bold uppercase tracking-wide text-text">{c.title}</div>
                    <div className="text-[11px] text-sub">{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* skill cards (hand) */}
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="font-display text-[11px] uppercase tracking-[0.16em] text-muted">Карты навыка</div>
              <div className="text-[11px] text-sub">
                Сканируется: <span className="text-acid">{sources.find((s) => s.id === tab)?.label}</span>
              </div>
            </div>
            <div className={cn("grid grid-cols-4 gap-2", shake && "animate-shake")}>
              {skillCards.map((k, i) => {
                const on = card === k.id;
                const used = tried.has(`${k.id}:${tab}`);
                return (
                  <button
                    key={k.id}
                    onClick={() => scan(k.id)}
                    disabled={scanning}
                    style={{ transform: `rotate(${(i - 1.5) * 1.6}deg) translateY(${Math.abs(i - 1.5) * 3}px)` }}
                    className={cn(
                      "press group relative aspect-[3/4] overflow-hidden rounded-2xl border bg-gradient-to-b from-elevated to-surface p-2 text-left transition-all duration-200 hover:-translate-y-1.5 hover:border-line-strong",
                      on ? "acid-ring -translate-y-2" : "border-line",
                      used && "opacity-55"
                    )}
                  >
                    <div className={cn("absolute inset-x-0 top-0 h-1", k.bg)} />
                    <div className="mt-1.5 grid h-10 w-10 place-items-center rounded-xl bg-ink/60">
                      <span className={cn("h-5 w-5 rounded-md", k.bg, on && "animate-pulse-live")} />
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="font-display text-[9px] uppercase tracking-widest text-muted">{k.domain}</div>
                      <div className={cn("stencil text-[15px] leading-none", k.color)}>{k.label}</div>
                    </div>
                    {used && <div className="absolute right-1.5 top-1.5 rounded bg-ink/80 px-1 font-display text-[9px] uppercase text-muted">✓</div>}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 px-1 text-[11px] text-muted">{card ? skillCards.find((k) => k.id === card)?.hint : "Каждая карта читает только свой источник. Как и аналитики."}</p>
          </div>

          <Button size="lg" full onClick={() => setStep("decision")} variant={confidence >= 2 ? "acid" : "outline"}>
            Принять решение <ChevronRight size={18} />
          </Button>
          {confidence < 2 && <p className="-mt-2 text-center text-[11px] text-muted">Можно и вслепую. Рынок это ценит. В свою пользу.</p>}
        </>
      )}

      {/* ---------- DECISION ---------- */}
      {step === "decision" && (
        <div className="animate-fade-up space-y-3">
          <div className="card space-y-4 p-4">
            <div>
              <div className="mb-2 font-display text-[11px] uppercase tracking-[0.16em] text-muted">Направление</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "long" as Direction, label: "Лонг", sub: "поехали", Icon: TrendingUp, c: "text-good" },
                  { id: "short" as Direction, label: "Шорт", sub: "едем вниз", Icon: TrendingDown, c: "text-bad" },
                  { id: "flat" as Direction, label: "Вне рынка", sub: "и так бывает", Icon: Pause, c: "text-sub" },
                ].map(({ id, label, sub, Icon, c }) => {
                  const on = dir === id;
                  return (
                    <button key={id} onClick={() => setDir(id)} className={cn("press card-inset flex flex-col items-center gap-1 py-3 transition-all", on && "acid-ring bg-acid/5")}>
                      <Icon size={22} className={c} />
                      <div className="stencil text-sm">{label}</div>
                      <div className="text-[10px] text-muted">{sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={cn("transition-opacity", dir === "flat" && "pointer-events-none opacity-40")}>
              <div className="mb-2 flex items-center justify-between">
                <div className="font-display text-[11px] uppercase tracking-[0.16em] text-muted">Риск на сделку</div>
                <div className={cn("font-display text-sm font-bold", risk >= 10 ? "text-bad" : "text-acid")}>{risk}% депозита</div>
              </div>
              <input
                type="range"
                min={0.5}
                max={25}
                step={0.5}
                value={risk}
                onChange={(e) => setRisk(Number(e.target.value))}
                className={cn("range-acid", risk >= 10 && "range-danger")}
                style={{ ["--pct" as string]: `${((risk - 0.5) / 24.5) * 100}%` }}
              />
              <div className="mt-1.5 flex justify-between font-display text-[10px] uppercase tracking-wider text-muted">
                <span>0.5%</span>
                <span>2%</span>
                <span>5%</span>
                <span>10%</span>
                <span className="text-bad">25% · легенды начинают отсюда</span>
              </div>
              <div className="mt-2 text-[11px] text-sub">
                Ставка: <span className="text-text">{Math.round((g.deposit * risk) / 100)} USDT</span> из {g.deposit.toLocaleString("ru-RU")} · попыток до нуля: <span className="text-text">{Math.floor(100 / risk)}</span>
              </div>
            </div>

            <div className={cn("transition-opacity", dir === "flat" && "pointer-events-none opacity-40")}>
              <div className="mb-2 font-display text-[11px] uppercase tracking-[0.16em] text-muted">Стоп-лосс</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "level" as StopMode, label: "За уровнем" },
                  { id: "market" as StopMode, label: "По маркету" },
                  { id: "none" as StopMode, label: "Без стопа", danger: true },
                ].map(({ id, label, danger }) => {
                  const on = stop === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setStop(id)}
                      className={cn("press card-inset py-2.5 font-display text-[12px] font-semibold uppercase tracking-wide transition-all", on && (danger ? "border-bad! text-bad shadow-[0_0_14px_rgba(255,77,94,0.35)]" : "acid-ring text-acid"))}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {stop === "none" && <p className="mt-1.5 text-[11px] text-bad">Так делают герои. И банкроты. Обычно это одни и те же люди.</p>}
              {stopPrice != null && <p className="mt-1.5 text-[11px] text-sub">Стоп: {stopPrice.toFixed(1)} · вход: {entry}</p>}
            </div>

            <div className="card-inset flex items-center justify-between px-3 py-2 text-[12px]">
              <span className="text-sub">
                Уверенность: <span className="text-text">{confidence}/3</span>
              </span>
              <span className="text-muted">{confidence >= 3 ? "силуэт подтверждён" : confidence >= 2 ? "силуэт виден" : "силуэт скрыт"}</span>
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-2">
            <Button variant="ghost" size="lg" onClick={() => setStep("evidence")}>
              <RotateCcw size={16} />
            </Button>
            <Button size="lg" disabled={!dir} onClick={enter} variant={dir === "flat" ? "outline" : dir === "short" ? "danger" : "acid"}>
              {dir === "flat" ? "Остаться вне рынка" : dir === "short" ? "Открыть шорт" : "Открыть лонг"}
            </Button>
          </div>
        </div>
      )}

      {/* ---------- PLAY-FORWARD ---------- */}
      {step === "playforward" && (
        <div className="card animate-fade-up p-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-[11px] uppercase tracking-[0.16em] text-muted">Play-forward</div>
            <div className="font-display text-sm text-sub">
              {revealed}/{sc.future.length} свечей
            </div>
          </div>
          <Progress value={(revealed / sc.future.length) * 100} className="mt-2" />
          <p className="mt-3 text-[12px] text-sub">{live.stopped ? "Стоп сработал. Департамент управляемой паники благодарит." : "Свечи открываются. Твоя стратегия наблюдает."}</p>
        </div>
      )}

      {/* ---------- FEEDBACK ---------- */}
      {step === "feedback" && result && (
        <div className="space-y-3">
          <div className={cn("card animate-slide-in p-4", result.win ? "acid-ring" : "border-bad/40")}>
            <div className="grid grid-cols-3 gap-2">
              <div className="card-inset px-3 py-2">
                <div className="font-display text-[10px] uppercase tracking-widest text-muted">P&L</div>
                <div className={cn("font-display text-xl font-bold", result.pnlPct > 0 ? "text-good" : result.pnlPct < 0 ? "text-bad" : "text-sub")}>
                  {result.pnlPct > 0 ? "+" : ""}
                  {result.pnlPct.toFixed(2)}%
                </div>
              </div>
              <div className="card-inset px-3 py-2">
                <div className="font-display text-[10px] uppercase tracking-widest text-muted">XP</div>
                <div className="font-display text-xl font-bold text-acid">+{result.xp}</div>
              </div>
              <div className="card-inset px-3 py-2">
                <div className="font-display text-[10px] uppercase tracking-widest text-muted">Монеты</div>
                <div className="font-display text-xl font-bold text-gold">+{result.coins}</div>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-[13px]">
              <p>
                <span className="font-display text-[11px] uppercase tracking-widest text-muted">Сигнал: </span>
                <span className="text-sub">{sc.feedback.signal}</span>
              </p>
              <p>
                <span className="font-display text-[11px] uppercase tracking-widest text-muted">Последствие: </span>
                <span className="text-text">{result.win ? sc.feedback.good : sc.feedback.bad}</span>
              </p>
              {!dir || dir === "flat" ? null : (risk >= 20 || stop === "none") && <p className="text-[12px] text-warn">+60 XP за храбрость. Рынок пересмотрел твои жизненные планы.</p>}
            </div>

            {/* enemy reveal */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-ink/60 p-3">
              <div className={cn("grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-elevated text-4xl", confidence >= 2 ? "animate-flip-in" : "silhouette")}>{enemy.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[10px] uppercase tracking-widest text-muted">{confidence >= 2 ? "Враг раскрыт" : "Враг не раскрыт"}</span>
                  {confidence >= 2 ? <Eye size={12} className="text-acid" /> : <EyeOff size={12} className="text-muted" />}
                </div>
                <div className="stencil text-lg leading-tight">{confidence >= 2 ? enemy.name : "???"}</div>
                <div className="text-[11px] text-sub">{confidence >= 2 ? enemy.hit : "Ты действовал вслепую. Силуэт остался силуэтом."}</div>
              </div>
              {confidence >= 2 && <Tag className={enemy.domainColor}>{enemy.domain}</Tag>}
            </div>

            {/* clues summary */}
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {sc.clues.map((c) => {
                const ok = found.some((f) => f.id === c.id);
                return (
                  <div key={c.id} className={cn("card-inset px-2 py-1.5", !ok && "opacity-60")}>
                    <div className={cn("font-display text-[10px] uppercase tracking-wide", ok ? "text-acid" : "text-bad")}>{ok ? "найдено" : "пропущено"}</div>
                    <div className="text-[11px] leading-tight text-sub">{c.title}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" size="lg" onClick={() => setReview(true)}>
              <FileText size={16} /> Разбор
            </Button>
            <Button size="lg" onClick={next}>
              Следующий бой <ChevronRight size={18} />
            </Button>
          </div>
          {!result.win && (
            <button onClick={onGoAcademy} className="w-full text-center text-[12px] text-sub underline-offset-4 hover:text-acid hover:underline">
              Повторить главу «{enemy.counter.split(" · ")[0]}» в Академии
            </button>
          )}
        </div>
      )}

      {/* review modal */}
      <Modal open={review} onClose={() => setReview(false)} kicker="Отчёт о катастрофе" title={`Разбор боя #${g.fights}`} expandable>
        <div className="space-y-4 text-[13px] leading-relaxed">
          <div>
            <div className="stencil text-base text-acid">Что было на графике</div>
            <p className="text-sub">{sc.feedback.signal}</p>
          </div>
          <div>
            <div className="stencil text-base text-acid">Что сделал ты</div>
            <p className="text-sub">
              {dir === "flat" ? "Остался вне рынка." : `${dir === "long" ? "Лонг" : "Шорт"} с риском ${risk}% и стопом «${stop === "level" ? "за уровнем" : stop === "market" ? "по маркету" : "без стопа"}».`} Найдено улик: {confidence}/3.
            </p>
          </div>
          <div>
            <div className="stencil text-base text-acid">Что сделал рынок</div>
            <p className="text-text">{result?.win ? sc.feedback.good : sc.feedback.bad}</p>
          </div>
          <div>
            <div className="stencil text-base text-acid">Улики</div>
            <ul className="mt-1 space-y-1.5">
              {sc.clues.map((c) => (
                <li key={c.id} className="card-inset px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[11px] font-bold uppercase tracking-wide">{c.title}</span>
                    <Tag className={found.some((f) => f.id === c.id) ? "bg-acid text-ink" : "bg-bad/20 text-bad"}>{found.some((f) => f.id === c.id) ? "найдено" : "пропущено"}</Tag>
                  </div>
                  <div className="text-sub">{c.text}</div>
                  <div className="mt-1 text-[11px] text-muted">
                    Источник: {sources.find((s) => s.id === c.source)?.label} · Карта: {skillCards.find((k) => k.id === c.card)?.label}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-inset p-3">
            <div className="stencil text-sm">Досье: {enemy.name}</div>
            <p className="text-sub">{enemy.truth}</p>
            <p className="mt-1 text-[11px] text-muted">Контр-карты: {enemy.counter}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
