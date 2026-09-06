import { useEffect, useMemo, useRef, useState } from "react";
import { CandleChart } from "../components/CandleChart";
import { IconBack, IconChart, IconCheck, IconCheckList, IconExpand, IconEyeOff, IconLock, IconNews, IconPause, IconSkull, IconTrend, IconTrendDown, IconWind, IconThermo, IconBolt, IconStar, IconScroll } from "../components/icons";
import { Button, Card, SectionTitle, Sheet, Tag, Stars } from "../components/ui";
import { enemies, skillCards, type Direction, type Level, type SkillCardId } from "../data/game";
import { useStore } from "../store";
import { cn } from "../utils/cn";
import { generateScenario, pnlPercent } from "../utils/scenario";

type Step = "brief" | "evidence" | "decision" | "play" | "feedback";
type StopKind = "level" | "market" | "none";

export function Battle({ level, onExit, onNext }: { level: Level; onExit: () => void; onNext: () => void }) {
  const { s, d } = useStore();
  const enemy = enemies.find((e) => e.id === level.enemyId)!;
  const sc = useMemo(() => generateScenario(level.id + "-" + level.kind, level.kind), [level]);
  const [step, setStep] = useState<Step>("brief");
  const [tab, setTab] = useState<"chart" | "news" | "check">("chart");
  const [marked, setMarked] = useState<number[]>([]);
  const [blinded, setBlinded] = useState(false);
  const [card, setCard] = useState<SkillCardId | null>(null);
  const [dir, setDir] = useState<Direction | null>(null);
  const [risk, setRisk] = useState(2);
  const [stop, setStop] = useState<StopKind>("level");
  const [revealed, setRevealed] = useState(0);
  const [newsFull, setNewsFull] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [coldTimer, setColdTimer] = useState(0);

  const evidence = marked.filter((i) => level.news[i].key).length;
  const noise = marked.filter((i) => level.news[i].conflict).length;
  const confidence = Math.max(0, evidence - noise);
  const cardOk = card === level.correctCard;
  const known = (s.enemyStage[enemy.id] ?? 0) >= 2;

  // scenario playback
  const entry = sc.history[sc.history.length - 1].c;
  const stopPrice = dir && dir !== "flat"
    ? stop === "level" ? (dir === "long" ? Math.min(sc.level, entry) * 0.994 : Math.max(sc.level, entry) * 1.006)
      : stop === "market" ? (dir === "long" ? entry * 0.985 : entry * 1.015) : undefined
    : undefined;

  const outcome = useMemo(() => {
    if (!dir) return null;
    if (dir === "flat") return { pnl: 0, stopped: false, exitIdx: sc.future.length, win: level.correctDir === "flat" };
    let stopped = false; let exitIdx = sc.future.length; let exit = sc.future[sc.future.length - 1].c;
    for (let i = 0; i < sc.future.length; i++) {
      const c = sc.future[i];
      if (stopPrice && ((dir === "long" && c.l <= stopPrice) || (dir === "short" && c.h >= stopPrice))) { stopped = true; exitIdx = i + 1; exit = stopPrice; break; }
    }
    const raw = pnlPercent(entry, exit, dir);
    const stopDist = stopPrice ? Math.abs((entry - stopPrice) / entry) * 100 : 3;
    const lev = Math.min(20, risk / Math.max(0.3, stopDist));
    const pnl = Math.max(-100, raw * lev);
    return { pnl, stopped, exitIdx, win: dir === level.correctDir && pnl > 0 };
  }, [dir, stopPrice, entry, risk, sc, level.correctDir]);

  useEffect(() => {
    if (step !== "play") return;
    setRevealed(0);
    const stopAt = outcome?.exitIdx ?? sc.future.length;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setRevealed(i);
      if (i >= stopAt) { clearInterval(t); setTimeout(() => { setStep("feedback"); setShowResult(true); }, 700); }
    }, 260);
    return () => clearInterval(t);
  }, [step, outcome, sc.future.length]);

  useEffect(() => {
    if (step !== "decision" || risk < 10) { setColdTimer(0); return; }
    setColdTimer(3);
    const t = setInterval(() => setColdTimer((v) => (v <= 1 ? (clearInterval(t), 0) : v - 1)), 1000);
    return () => clearInterval(t);
  }, [step, risk]);

  const shown = [...sc.history, ...sc.future.slice(0, step === "play" || step === "feedback" ? revealed : 0)];
  const full = [...sc.history, ...sc.future];

  // scoring
  const result = useMemo(() => {
    if (!outcome) return null;
    const win = outcome.win;
    const base = win ? level.xp : Math.round(level.xp * 0.3);
    const ev = evidence >= 2 ? 40 : evidence === 1 ? 15 : 0;
    const cd = cardOk ? 40 : 0;
    const comboMult = win ? 1 + Math.min(0.5, s.combo * 0.1) : 1;
    const total = Math.round((base + ev + cd) * comboMult);
    const stars = win ? 1 + (evidence >= 2 ? 1 : 0) + (cardOk ? 1 : 0) : 0;
    return { win, base, ev, cd, comboMult, total, stars };
  }, [outcome, evidence, cardOk, level.xp, s.combo]);

  const committed = useRef(false);
  useEffect(() => {
    if (step !== "feedback" || !result || !outcome || committed.current) return;
    committed.current = true;
    d({
      type: "FINISH_BATTLE", levelId: level.id, enemyId: enemy.id, win: result.win, xp: result.total,
      pnl: dir === "flat" ? 0 : outcome.pnl, stars: result.stars, evidence, flat: dir === "flat",
      mistake: result.win ? undefined : { levelId: level.id, enemyId: enemy.id, text: level.feedback.lose, lesson: enemy.weakness },
    });
  }, [step, result, outcome, d, level, enemy, dir, evidence]);

  const headline =
    step === "feedback" ? (result?.win ? (dir === "flat" ? "Терпение зачтено." : "Прибыль зафиксирована.") : "Рынок принял решение.")
    : step === "decision" ? "Твоё движение"
    : step === "play" ? "Рынок отвечает…"
    : level.headline;
  const subline =
    step === "feedback" ? (result?.win ? "Не привыкай. Рынок уже заметил твою самоуверенность." : level.feedback.lose)
    : step === "decision" ? "Помни: не войти — тоже решение. Обычно лучшее."
    : step === "play" ? "Кнопка нажата. Дальше от тебя ничего не зависит."
    : level.sub;

  return (
    <div className="slide-in space-y-4 px-3 pb-28 pt-3">
      {/* header */}
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="press flex items-center gap-1 font-display text-[14px] uppercase text-sub"><IconBack size={18} /> Кампания</button>
        <div className="flex items-center gap-2">
          <Tag>{level.id}</Tag>
          <span className="flex items-center gap-1 font-display text-[12px] uppercase text-muted"><IconStar size={12} className="text-gold" /> до {level.xp} XP</span>
        </div>
      </div>

      {/* step rail */}
      <div className="flex items-center gap-1">
        {(["brief", "evidence", "decision", "play", "feedback"] as Step[]).map((st, i) => {
          const idx = ["brief", "evidence", "decision", "play", "feedback"].indexOf(step);
          return <span key={st} className={cn("h-1 flex-1 rounded-full transition-colors", i <= idx ? "bg-acid" : "bg-line")} />;
        })}
      </div>

      <div className="text-center">
        <h2 className={cn("stencil drip drip-right relative inline-block text-[30px] leading-none", step === "feedback" && !result?.win ? "text-bad bad-glow-text drip-bad" : "text-acid acid-glow-text")}>{headline}</h2>
        <p className="mt-3 text-[15px] text-sub">{subline}</p>
      </div>

      {/* BRIEF: market weather + shadow enemy */}
      {step === "brief" && (
        <>
          <Card className="fade-up">
            <SectionTitle>Погода на рынке</SectionTitle>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { Icon: IconWind, l: "Режим", v: level.weather.regime },
                { Icon: IconThermo, l: "Волатильность", v: level.weather.volatility, tone: level.weather.volatility === "Экстремальная" || level.weather.volatility === "Высокая" ? "text-bad" : level.weather.volatility === "Средняя" ? "text-warn" : "text-good" },
                { Icon: IconChart, l: "Пара", v: level.pair },
              ].map(({ Icon, l, v, tone }) => (
                <div key={l} className="card-inset p-3">
                  <Icon size={18} className="text-muted" />
                  <p className="mt-2 text-[10px] uppercase tracking-wider text-muted">{l}</p>
                  <p className={cn("font-display text-[14px] font-bold uppercase leading-tight text-text", tone)}>{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13px] italic text-muted">«{level.weather.mood}»</p>
          </Card>

          <Card className="fade-up fade-up-1 flex items-center gap-4 overflow-hidden">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-ink">
              <span className={cn("text-[44px] transition-all", known ? "" : "blur-md grayscale opacity-60")}>{enemy.emoji}</span>
              {!known && <span className="stencil absolute text-[40px] text-line-strong">?</span>}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 tape text-[9px]">{known ? "раскрыт" : "силуэт"}</span>
            </div>
            <div className="min-w-0">
              <SectionTitle>Противник</SectionTitle>
              <p className="font-display text-[20px] font-bold uppercase leading-tight text-text">{known ? enemy.name : "Неизвестная угроза"}</p>
              <p className="mt-1 text-[12px] text-sub">{known ? enemy.headline : "Домен: " + enemy.domain + ". Детали — после боя. Обычно после проигранного."}</p>
            </div>
          </Card>

          <Card className="fade-up fade-up-2 border-line-strong">
            <SectionTitle>Правила боя</SectionTitle>
            <ul className="mt-2 space-y-1.5 text-[14px] text-text">
              <li className="flex gap-2"><span className="text-acid">01</span> Собери улики. Слухи не считаются.</li>
              <li className="flex gap-2"><span className="text-acid">02</span> Разыграй карту навыка. Одну.</li>
              <li className="flex gap-2"><span className="text-acid">03</span> Прими решение. Рынок ответит.</li>
            </ul>
          </Card>

          <Button size="lg" className="w-full" onClick={() => setStep("evidence")}>Собрать улики</Button>
        </>
      )}

      {/* EVIDENCE: browser shell + skill cards */}
      {(step === "evidence" || step === "decision" || step === "play" || step === "feedback") && (
        <div className="card overflow-hidden rounded-2xl p-0">
          <div className="flex items-center gap-1 border-b border-line bg-ink/60 px-2 pt-2">
            {[
              { id: "chart", Icon: IconChart, l: "График" },
              { id: "news", Icon: IconNews, l: "Лента", badge: level.news.length },
              { id: "check", Icon: IconCheckList, l: "Чек-лист" },
            ].map(({ id, Icon, l, badge }) => {
              const on = tab === id;
              return (
                <button key={id} onClick={() => setTab(id as typeof tab)} className={cn("press relative flex h-10 items-center gap-1.5 rounded-t-xl px-3 font-display text-[13px] font-semibold uppercase", on ? "bg-bg text-acid" : "text-muted")}>
                  <Icon size={16} /> {l}
                  {badge && !on && <span className="absolute -right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink px-1 text-[9px] text-white">{badge}</span>}
                </button>
              );
            })}
            <button className="ml-auto flex h-10 items-center gap-1 px-2 font-display text-[11px] uppercase text-muted"><IconLock size={12} /> Стакан</button>
          </div>

          <div className="relative bg-bg p-2">
            {tab === "chart" && (
              <div className="relative rounded-xl border border-line bg-[#0e1013] p-1">
                <div className="absolute left-3 top-2 z-10 flex items-center gap-2">
                  <p className="font-display text-[14px] font-semibold text-text">{level.pair}</p>
                  {step === "play" && <span className="flex items-center gap-1 font-display text-[10px] uppercase text-bad"><span className="live-dot h-1.5 w-1.5 rounded-full bg-bad" /> live</span>}
                </div>
                <CandleChart candles={step === "feedback" ? full : shown} level={sc.level} entry={dir && dir !== "flat" && step !== "evidence" ? entry : undefined} stop={step !== "evidence" ? stopPrice : undefined} dir={dir ?? "flat"} height={230} revealFrom={step === "evidence" ? undefined : sc.history.length} />
                <span className="tape absolute bottom-10 right-3">Не финрекомендация</span>
              </div>
            )}

            {tab === "news" && (
              <div className="p-1">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] text-muted">Нажми на новость, чтобы записать в улики.</p>
                  <div className="flex gap-1">
                    <button onClick={() => setBlinded((b) => !b)} title="Слепой источник" className={cn("press flex h-8 w-8 items-center justify-center rounded-lg border", blinded ? "border-pink text-pink" : "border-line text-muted")}><IconEyeOff size={15} /></button>
                    <button onClick={() => setNewsFull(true)} className="press flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted"><IconExpand size={15} /></button>
                  </div>
                </div>
                <NewsList level={level} marked={marked} blinded={blinded} onToggle={(i) => step === "evidence" && setMarked((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))} />
              </div>
            )}

            {tab === "check" && (
              <ul className="space-y-2 p-1">
                {level.checklist.map(([t, ok]) => (
                  <li key={t} className="flex items-center justify-between rounded-xl border border-line bg-surface/70 px-3 py-2.5 text-[15px]">
                    <span className="text-text">{t}</span>
                    <span className={cn("font-display text-[13px] font-bold uppercase", ok ? "text-good" : "text-bad")}>{ok ? "есть" : "нет"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* confidence meter */}
          <div className="flex items-center gap-3 border-t border-line bg-ink/40 px-3 py-2">
            <SectionTitle>Уверенность</SectionTitle>
            <div className="flex flex-1 gap-1">
              {[1, 2, 3].map((i) => <span key={i} className={cn("h-2 flex-1 rounded-sm transition-colors", i <= confidence ? "bg-acid shadow-acid-soft" : "bg-line")} />)}
            </div>
            <span className="font-display text-[12px] font-bold uppercase text-sub">{confidence}/3 · {confidence >= 3 ? "силуэт подтверждён" : confidence >= 2 ? "силуэт виден" : "силуэт скрыт"}</span>
          </div>
        </div>
      )}

      {/* SKILL CARDS (hand) */}
      {step === "evidence" && (
        <>
          <div>
            <div className="flex items-center justify-between">
              <SectionTitle>Карта навыка · выбери одну</SectionTitle>
              {noise > 0 && <span className="text-[11px] text-bad">в уликах шум: {noise}</span>}
            </div>
            <div className="hand mt-2 grid grid-cols-4 gap-2">
              {level.cards.map((cid, i) => {
                const c = skillCards.find((k) => k.id === cid)!;
                const locked = !s.cardsUnlocked.includes(cid) && c.locked && level.correctCard !== cid;
                const on = card === cid;
                const rank = s.cardRank[cid] ?? c.rank;
                return (
                  <div key={cid} className="deal" style={{ animationDelay: `${i * 70}ms` }}>
                    <button disabled={locked} onClick={() => setCard(cid)}
                      className={cn("hand-card press relative flex aspect-[3/4.2] w-full flex-col items-center justify-between rounded-xl border-2 bg-gradient-to-b from-elevated to-surface p-2 text-center",
                        on ? "on acid-ring" : "border-line-strong", locked && "opacity-50")}>
                      <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink font-display text-[10px] font-bold text-acid">{rank}</span>
                      <span className="mt-4 text-[30px]">{locked ? "🔒" : c.emoji}</span>
                      <div>
                        <p className="font-display text-[11px] font-bold uppercase leading-tight text-text">{c.name}</p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            {card && <p className="fade-up mt-2 text-center text-[12px] text-sub">{skillCards.find((k) => k.id === card)!.short}</p>}
          </div>
          <Button size="lg" className="w-full" disabled={!card} onClick={() => setStep("decision")}>
            {card ? "К решению" : "Выбери карту"}
          </Button>
          <p className="text-center text-[11px] text-muted">Улик собрано: {marked.length}. Уверенность считается по фактам, а не по количеству нажатий.</p>
        </>
      )}

      {/* DECISION */}
      {step === "decision" && (
        <>
          <Card className="fade-up space-y-4">
            <div>
              <p className="font-display text-[15px] font-semibold uppercase text-sub">Направление</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { id: "long", label: "Лонг", sub: "поехали", Icon: IconTrend, c: "text-good" },
                  { id: "short", label: "Шорт", sub: "едем вниз", Icon: IconTrendDown, c: "text-bad" },
                  { id: "flat", label: "Вне рынка", sub: "и так бывает", Icon: IconPause, c: "text-sub" },
                ].map(({ id, label, sub, Icon, c }) => {
                  const on = dir === id;
                  return (
                    <button key={id} onClick={() => setDir(id as Direction)} className={cn("press flex flex-col items-center rounded-xl border-2 py-3", on ? "acid-ring bg-acid/5" : "border-line-strong bg-ink/40")}>
                      <Icon size={22} className={c} />
                      <span className="mt-1 font-display text-[15px] font-bold uppercase text-text">{label}</span>
                      <span className="text-[10px] text-muted">{sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={cn(dir === "flat" && "pointer-events-none opacity-40")}>
              <div className="flex items-baseline justify-between">
                <p className="font-display text-[15px] font-semibold uppercase text-sub">Риск на сделку</p>
                <p className={cn("stencil text-[22px]", risk >= 10 ? "text-bad" : "text-acid")}>{risk}% депозита</p>
              </div>
              <div className="relative mt-3">
                <input type="range" min={1} max={25} value={risk} onChange={(e) => setRisk(Number(e.target.value))} className={cn("range-acid", risk >= 10 && "danger")} style={{ ["--pct" as string]: `${((risk - 1) / 24) * 100}%` }} />
                <IconSkull size={18} className="pointer-events-none absolute -right-1 -top-5 text-bad" />
              </div>
              <div className="relative mt-1 h-8 text-[11px]">
                {[1, 2, 5, 10, 25].map((m) => (
                  <span key={m} style={{ left: `${((m - 1) / 24) * 100}%` }} className={cn("absolute -translate-x-1/2 font-display font-semibold", m === 25 ? "translate-x-[-90%] text-bad" : risk === m ? "text-acid" : "text-muted")}>
                    {m}%{m === 25 && <span className="block text-[10px] leading-tight text-bad/80">легенды начинают отсюда</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className={cn(dir === "flat" && "pointer-events-none opacity-40")}>
              <p className="font-display text-[15px] font-semibold uppercase text-sub">Стоп-лосс</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[{ id: "level", label: "За уровнем" }, { id: "market", label: "По маркету" }, { id: "none", label: "Без стопа", danger: true }].map(({ id, label, danger }) => {
                  const on = stop === id;
                  return (
                    <button key={id} onClick={() => setStop(id as StopKind)} className={cn("press h-11 rounded-xl border-2 font-display text-[13px] font-bold uppercase", on ? (danger ? "border-bad text-bad shadow-[0_0_14px_rgba(255,77,94,0.3)]" : "acid-ring text-acid") : "border-line-strong text-sub")}>{label}</button>
                  );
                })}
              </div>
              {stop === "none" && <p className="mt-1 text-right text-[12px] text-bad">так делают герои. и банкроты</p>}
            </div>

            <p className="text-center text-[13px]">
              <span className="font-display font-bold uppercase text-good">Уверенность: {confidence}/3</span>
              <span className="text-sub"> · карта: {skillCards.find((k) => k.id === card)?.name}</span>
            </p>
          </Card>

          {risk >= 10 && dir !== "flat" && (
            <Card bad className="fade-up flex items-center gap-3">
              <span className="text-[28px]">🧊</span>
              <div className="flex-1">
                <p className="font-display text-[13px] font-bold uppercase text-bad">Холодная голова</p>
                <p className="text-[12px] text-sub">Риск {risk}%. Департамент управляемой паники одобряет. Мы — нет.</p>
              </div>
              {coldTimer > 0 && <span className="stencil text-[26px] text-bad">{coldTimer}</span>}
            </Card>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => setStep("evidence")}>Назад к уликам</Button>
            <Button disabled={!dir || coldTimer > 0} onClick={() => setStep("play")}>{dir === "flat" ? "Остаться вне" : "Войти"}</Button>
          </div>
        </>
      )}

      {/* PLAY FORWARD */}
      {step === "play" && (
        <Card className="fade-up">
          <div className="flex items-center justify-between">
            <SectionTitle>Play-forward</SectionTitle>
            <span className="font-display text-[12px] uppercase text-muted">свеча {Math.min(revealed, sc.future.length)}/{sc.future.length}</span>
          </div>
          <LivePnl dir={dir!} entry={entry} shown={shown} risk={risk} stopPrice={stopPrice} />
        </Card>
      )}

      {/* FEEDBACK */}
      {step === "feedback" && result && outcome && (
        <>
          <Card acid={result.win} bad={!result.win} className="fade-up relative overflow-hidden">
            {showResult && <span className={cn("stamp absolute right-3 top-3 tape !text-[13px] !px-3", result.win ? "tape-acid" : "tape-bad")}>{result.win ? "Зачтено" : "Ликвидность"}</span>}
            <SectionTitle className={result.win ? "text-acid" : "text-bad"}>Обратная связь</SectionTitle>
            <p className="mt-2 text-[15px] text-text"><span className="text-sub">Сигнал:</span> {level.feedback.signal}</p>
            <p className="mt-1 text-[15px] text-text"><span className="text-sub">Последствие:</span> {result.win ? level.feedback.win : level.feedback.lose}</p>
            {dir !== "flat" && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="card-inset p-2 text-center"><p className={cn("stencil text-[20px]", outcome.pnl >= 0 ? "text-good" : "text-bad")}>{outcome.pnl >= 0 ? "+" : ""}{outcome.pnl.toFixed(1)}%</p><p className="text-[10px] uppercase text-muted">к депозиту</p></div>
                <div className="card-inset p-2 text-center"><p className="stencil text-[20px] text-text">{outcome.stopped ? "Да" : "Нет"}</p><p className="text-[10px] uppercase text-muted">стоп сработал</p></div>
                <div className="card-inset p-2 text-center"><p className="stencil text-[20px] text-text">{outcome.exitIdx}</p><p className="text-[10px] uppercase text-muted">свечей в сделке</p></div>
              </div>
            )}
          </Card>

          {/* Enemy ID */}
          <Card className="fade-up fade-up-1 flex items-center gap-4">
            <div className="pop flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-ink text-[44px]">{enemy.emoji}</div>
            <div className="min-w-0">
              <SectionTitle>Враг раскрыт</SectionTitle>
              <p className="font-display text-[20px] font-bold uppercase leading-tight text-text">{enemy.name}</p>
              <p className="mt-1 text-[12px] text-sub">{enemy.headline}</p>
              <p className="mt-1 text-[11px] text-muted">Слабость: {enemy.weakness}</p>
            </div>
          </Card>

          {/* XP breakdown */}
          <Card className="fade-up fade-up-2">
            <div className="flex items-center justify-between">
              <SectionTitle>Награда</SectionTitle>
              <Stars n={result.stars} size={18} />
            </div>
            <ul className="mt-2 space-y-1 text-[14px]">
              <li className="flex justify-between text-text"><span>Бой</span><span className="font-display font-bold">+{result.base}</span></li>
              <li className={cn("flex justify-between", result.ev ? "text-text" : "text-muted")}><span>Улики ({evidence})</span><span className="font-display font-bold">+{result.ev}</span></li>
              <li className={cn("flex justify-between", result.cd ? "text-text" : "text-muted")}><span>Карта {cardOk ? "в цель" : "мимо"}</span><span className="font-display font-bold">+{result.cd}</span></li>
              {result.comboMult > 1 && <li className="flex justify-between text-acid"><span className="flex items-center gap-1"><IconBolt size={14} /> Комбо</span><span className="font-display font-bold">×{result.comboMult.toFixed(1)}</span></li>}
            </ul>
            <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
              <span className="font-display text-[13px] uppercase text-sub">Итого</span>
              <span className="stencil count-flash text-[32px] leading-none text-acid acid-glow-text">+{result.total} XP</span>
            </div>
          </Card>

          {!result.win && (
            <Card className="fade-up fade-up-3 flex items-center gap-3 border-warn/50">
              <IconScroll size={22} className="text-warn" />
              <div className="flex-1">
                <p className="font-display text-[13px] font-bold uppercase text-warn">Записано в свиток ошибок</p>
                <p className="text-[12px] text-sub">Урок: {enemy.weakness}. Свиток — в профиле. Он не забывает.</p>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={onExit}>К карте</Button>
            <Button onClick={result.win ? onNext : onExit}>{result.win ? "Следующий бой" : "Назад в кампанию"}</Button>
          </div>
        </>
      )}

      <Sheet open={newsFull} onClose={() => setNewsFull(false)} title="Лента · развёрнуто" full>
        <NewsList level={level} marked={marked} blinded={blinded} big onToggle={(i) => step === "evidence" && setMarked((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))} />
        <p className="mt-4 text-center text-[12px] text-muted">Регуляторы обеспокоены. Рынок делает вид, что удивлён.</p>
      </Sheet>
    </div>
  );
}

function NewsList({ level, marked, blinded, onToggle, big }: { level: Level; marked: number[]; blinded: boolean; onToggle: (i: number) => void; big?: boolean }) {
  return (
    <ul className="space-y-2">
      {level.news.map((n, i) => {
        const on = marked.includes(i);
        return (
          <li key={n.title}>
            <button onClick={() => onToggle(i)} className={cn("press relative flex w-full gap-3 rounded-xl border p-3 text-left", on ? "border-acid bg-acid/5 shadow-acid-soft" : "border-line bg-surface/70")}>
              {on && <span className="pop absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-acid text-ink"><IconCheck size={12} /></span>}
              <span className={cn("leading-none", big ? "text-[40px]" : "text-[30px]")}>{n.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("font-display font-bold uppercase leading-tight text-text", big ? "text-[18px]" : "text-[15px]")}>{n.title}</p>
                  <span className="shrink-0 text-[11px] text-muted">{n.time}</span>
                </div>
                <p className={cn("mt-1 leading-snug text-sub", big ? "text-[15px]" : "text-[13px]")}>{n.text}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Tag color={n.tagColor}>{n.tag}</Tag>
                  <span className={cn("text-[11px]", blinded || n.blind ? "text-pink" : "text-muted")}>{blinded || n.blind ? "источник скрыт" : n.source}</span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function LivePnl({ dir, entry, shown, risk, stopPrice }: { dir: Direction; entry: number; shown: { c: number }[]; risk: number; stopPrice?: number }) {
  const last = shown[shown.length - 1].c;
  const raw = pnlPercent(entry, last, dir);
  const stopDist = stopPrice ? Math.abs((entry - stopPrice) / entry) * 100 : 3;
  const lev = Math.min(20, risk / Math.max(0.3, stopDist));
  const pnl = dir === "flat" ? 0 : raw * lev;
  return (
    <div className="mt-2 flex items-end justify-between">
      <div>
        <p className="text-[12px] text-muted">{dir === "flat" ? "Ты вне рынка. Смотри, что бы с тобой сделали." : `Вход ${entry.toFixed(0)} → сейчас ${last.toFixed(0)}`}</p>
        <p className={cn("stencil mt-1 text-[36px] leading-none transition-colors", pnl > 0 ? "text-good" : pnl < 0 ? "text-bad" : "text-sub")}>{pnl > 0 ? "+" : ""}{pnl.toFixed(2)}%</p>
      </div>
      <span className="live-dot font-display text-[12px] uppercase text-acid">рынок думает…</span>
    </div>
  );
}
