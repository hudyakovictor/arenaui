"use client";

import { useMemo, useState } from "react";
import { Candles, Chip, PaperCard, Radar } from "./phone/Frame";
import { cults } from "@/lib/content";
import {
  type Action,
  type CardId,
  CARDS,
  type Enemy,
  type Resolution,
  type Size,
  TRAIT_LABELS,
  type Traits,
  buildRun,
  drawHand,
  mulberry32,
  resolve,
} from "@/lib/sim";

type Phase = "lobby" | "encounter" | "result" | "autopsy";

const zeroTraits: Traits = { calibration: 0, patience: 0, immunity: 0, discipline: 0, antibias: 0 };

export default function Playable({ onSaved }: { onSaved?: () => void }) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [nick, setNick] = useState("");
  const [cult, setCult] = useState(cults[1].id);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e6));
  const run = useMemo(() => buildRun(seed), [seed]);
  const [node, setNode] = useState(0);
  const [composure, setComposure] = useState(100);
  const [capital, setCapital] = useState(1);
  const [traits, setTraits] = useState<Traits>(zeroTraits);
  const [hand, setHand] = useState<CardId[]>([]);
  const [played, setPlayed] = useState<CardId[]>([]);
  const [action, setAction] = useState<Action | null>(null);
  const [size, setSize] = useState<Size>(50);
  const [res, setRes] = useState<Resolution | null>(null);
  const [log, setLog] = useState<{ enemy: Enemy; res: Resolution; action: Action }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const enemy = run[node];
  const rng = useMemo(() => mulberry32(seed + node * 97), [seed, node]);

  function start() {
    setNode(0);
    setComposure(100);
    setCapital(1);
    setTraits(zeroTraits);
    setLog([]);
    setSaved(false);
    setHand(drawHand(mulberry32(seed), 3));
    setPlayed([]);
    setAction(null);
    setRes(null);
    setPhase("encounter");
  }

  function toggleCard(c: CardId) {
    setPlayed((p) => (p.includes(c) ? p.filter((x) => x !== c) : p.length < 2 ? [...p, c] : p));
  }

  function confirm() {
    if (!action) return;
    const r = resolve(enemy, action, size, played);
    const nextComp = Math.max(0, Math.min(100, composure + r.composureDelta));
    setComposure(nextComp);
    setCapital((c) => Math.max(0, +(c + r.capitalDelta).toFixed(2)));
    setTraits((t) => {
      const n = { ...t };
      (Object.keys(r.traitDelta) as (keyof Traits)[]).forEach((k) => (n[k] += r.traitDelta[k] ?? 0));
      return n;
    });
    setRes(r);
    setLog((l) => [...l, { enemy, res: r, action }]);
    setPhase("result");
  }

  function next() {
    const liquidated = composure <= 0;
    if (liquidated || node >= run.length - 1) {
      setPhase("autopsy");
      return;
    }
    setNode((n) => n + 1);
    setHand(drawHand(mulberry32(seed + (node + 1) * 31), 3));
    setPlayed([]);
    setAction(null);
    setRes(null);
    setPhase("encounter");
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nick.trim() || "аноним",
          cult,
          capital: Math.round(capital * 100),
          composure,
          nodesCleared: log.length,
          outcome: composure <= 0 ? "liquidated" : "exit",
          ghostDelta: traits,
        }),
      });
      setSaved(true);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  const hints = played.map((c) => enemy.hints[c]).filter(Boolean) as string[];
  const traitVals = (Object.keys(TRAIT_LABELS) as (keyof Traits)[]).map((k) => Math.max(0.08, Math.min(1, 0.4 + traits[k] / 25)));
  const cultObj = cults.find((c) => c.id === cult)!;

  return (
    <div className="phone scanlines">
      {/* top bar */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border bg-elevated px-3.5">
        <div className="grid h-[34px] w-[34px] place-items-center rounded-full border border-primary font-mono text-[11px] font-bold text-primary">
          {phase === "lobby" ? "R0" : `R${node + 1}`}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex justify-between font-mono text-[9px] text-muted">
            <span>ХЛАДНОКРОВИЕ</span>
            <span>{composure} / 100</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full border border-border bg-inset">
            <i className={`block h-full rounded-full ${composure > 40 ? "bg-primary" : "bg-bad"}`} style={{ width: `${composure}%` }} />
          </div>
        </div>
        <div className={`font-mono text-[11px] font-bold ${capital >= 1 ? "text-good" : "text-bad"}`}>{capital.toFixed(2)}×</div>
      </div>

      {phase === "lobby" && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3.5">
          <PaperCard kicker="ДЕПАРТАМЕНТ УПРАВЛЯЕМОЙ ПАНИКИ · ДОПУСК" title="Пять узлов. Один Кит. Хладнокровие кончится — ликвидация. Ты здесь ради денег. Именно поэтому ты уже в опасности." />
          <div>
            <div className="mb-1 font-mono text-[8px] tracking-wider text-muted">ПОЗЫВНОЙ</div>
            <input
              value={nick}
              onChange={(e) => setNick(e.target.value.slice(0, 18))}
              placeholder="кто будет виноват?"
              className="h-11 w-full rounded-[10px] border border-strong bg-surface px-3 font-mono text-[12px] text-text outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
          <div className="min-h-0 flex-1">
            <div className="mb-1 font-mono text-[8px] tracking-wider text-muted">КУЛЬТ · ВЫБЕРИ, КОГО ПОДВЕДЁШЬ</div>
            <div className="grid grid-cols-2 gap-1.5">
              {cults.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCult(c.id)}
                  className={`rounded-[10px] border bg-surface p-2 text-left ${cult === c.id ? "border-2 bg-hover" : "border-border"}`}
                  style={{ borderColor: cult === c.id ? c.color : undefined }}
                >
                  <div className="font-mono text-[10px] font-bold" style={{ color: c.color }}>{c.sigil} {c.name}</div>
                  <div className="mt-0.5 text-[9px] leading-snug text-sub">{c.doctrine}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSeed(Math.floor(Math.random() * 1e6))} className="grid h-11 flex-1 place-items-center rounded-[11px] border border-strong font-mono text-[11px] font-bold text-sub">
              НОВЫЙ ГОРОД #{seed % 1000}
            </button>
            <button onClick={start} className="grid h-11 flex-[2] place-items-center rounded-[11px] bg-primary text-[13px] font-bold text-[#03110f]">
              ВОЙТИ В РЕЙД
            </button>
          </div>
        </div>
      )}

      {phase === "encounter" && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center gap-1.5 px-3.5 pt-1.5 pb-1">
            <Chip tone="bad">● УЗЕЛ {node + 1}/{run.length}</Chip>
            <Chip>{enemy.id === "whale" ? "БОСС" : "БОЙ"}</Chip>
            <span className="flex-1" />
            <Chip tone="custom" style={{ borderColor: cultObj.color, color: cultObj.color }}>{cultObj.sigil} {cultObj.name.split(" ")[0]}</Chip>
          </div>
          <div className="mx-3.5 shrink-0">
            <PaperCard kicker="СИТУАЦИЯ" title={enemy.briefing} accent={enemy.id === "whale" ? "var(--color-info)" : "var(--color-primary)"} />
          </div>
          <div className="mx-3.5 mb-1 flex shrink-0 items-center gap-2 rounded-b-[10px] border border-dashed border-strong bg-surface px-3 py-1">
            <div className="grid h-6 w-6 place-items-center rounded-full border border-strong font-mono text-[13px] font-bold text-primary">?</div>
            <div className="font-mono text-[8px] tracking-wider text-muted">ВРАГ СКРЫТ · семейство: <b className="text-sub">{enemy.family}</b></div>
          </div>
          <div className="mx-3.5 shrink-0 overflow-hidden rounded-xl border border-strong bg-inset">
            <Candles seed={enemy.seed} count={28} className="grid-panel h-[92px]" decisionAt={6} />
            <div className="flex items-center justify-between border-t border-border px-2.5 py-1 font-mono text-[8px] text-muted">
              <span>ФАНДИНГ <b className="text-warn">{enemy.fundingVisible}</b></span>
              <span>СТАДО: <b className="text-bad">{enemy.sentiment}</b></span>
            </div>
          </div>
          <div className="mx-3.5 mt-1.5 shrink-0">
            <div className="mb-1 flex justify-between font-mono text-[8px] tracking-wider text-muted"><span>РУКА · МАКС 2 КАРТЫ</span><span>{played.length}/2</span></div>
            <div className="grid grid-cols-3 gap-1.5">
              {hand.map((id) => {
                const c = CARDS[id];
                const on = played.includes(id);
                return (
                  <button key={id} onClick={() => toggleCard(id)} className={`flex flex-col items-center gap-1 rounded-[9px] border bg-surface p-1.5 ${on ? "border-2 border-primary bg-hover" : "border-border"}`}>
                    <span className="h-5 w-5 rounded-md" style={{ background: `color-mix(in srgb, ${c.color} 22%, transparent)`, boxShadow: `inset 0 0 0 1px ${c.color}` }} />
                    <span className="font-mono text-[8px] font-bold text-sub">{c.name}</span>
                    <span className="text-center text-[8px] leading-tight text-muted">{c.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {hints.length > 0 && (
            <div className="mx-3.5 mt-1.5 shrink-0 space-y-1">
              {hints.map((h) => (
                <div key={h} className="rounded-[8px] border border-primary/40 bg-primary/5 px-2 py-1 font-mono text-[9px] text-primary">▸ {h}</div>
              ))}
            </div>
          )}
          <div className="mx-3.5 mt-auto shrink-0">
            <div className="mb-1 flex justify-between font-mono text-[8px] tracking-wider text-muted"><span>РАЗМЕР</span><span>{size}%</span></div>
            <div className="grid grid-cols-3 gap-1.5">
              {([25, 50, 100] as Size[]).map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`h-8 rounded-[8px] border font-mono text-[10px] font-bold ${size === s ? "border-primary bg-hover text-primary" : "border-border bg-surface text-muted"}`}>{s}%</button>
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5">
              {([["long", "ЛОНГ", "text-good"], ["short", "ШОРТ", "text-bad"], ["wait", "ЖДАТЬ", "text-primary"], ["hedge", "ХЕДЖ", "text-warn"]] as [Action, string, string][]).map(([a, l, c]) => (
                <button key={a} onClick={() => setAction(a)} className={`h-11 rounded-[10px] border bg-surface font-mono text-[10px] font-bold ${c} ${action === a ? "border-2 border-primary bg-hover" : "border-border"}`}>{l}</button>
              ))}
            </div>
            <button disabled={!action} onClick={confirm} className="my-2 grid h-11 w-full place-items-center rounded-[11px] bg-primary text-[13px] font-bold text-[#03110f] disabled:opacity-40">
              {action ? "ПОДТВЕРДИТЬ" : "ВЫБЕРИ ДЕЙСТВИЕ"}
            </button>
          </div>
        </div>
      )}

      {phase === "result" && res && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-5 text-center">
          <div
            className="grid h-24 w-24 place-items-center rounded-full border-2 bg-inset text-4xl"
            style={{ borderColor: res.correct ? "var(--color-good)" : "var(--color-bad)", boxShadow: `0 0 40px ${res.correct ? "rgba(59,222,138,.3)" : "rgba(255,89,109,.3)"}` }}
          >
            {enemy.id === "goblin" ? <span className="h-full w-full rounded-full bg-[url(/ref/goblin.jpg)] bg-cover bg-center" /> : enemy.id === "whale" ? "◎" : enemy.id === "siren" ? "♫" : enemy.id === "wraith" ? "☠" : enemy.id === "kraken" ? "҉" : "◈"}
          </div>
          <div>
            <div className="font-mono text-[9px] tracking-wider text-muted">ВРАГ РАСКРЫТ · {enemy.family}</div>
            <div className="text-[20px] font-bold">{enemy.name}</div>
          </div>
          <p className="text-[12px] leading-snug text-sub">{enemy.reveal}</p>
          <div className="paper w-full rounded-[10px] p-2.5 text-left" style={{ borderLeft: `4px solid ${res.correct ? "var(--color-good)" : "var(--color-bad)"}` }}>
            <div className="font-mono text-[8px] font-bold tracking-wider text-ink/50">ВЕРДИКТ</div>
            <div className="text-[12px] font-bold leading-tight">{res.verdict}</div>
          </div>
          <div className="flex gap-2">
            <div className="rounded-[9px] border border-border bg-surface px-3 py-2"><b className={`block font-mono text-[14px] ${res.composureDelta >= 0 ? "text-good" : "text-bad"}`}>{res.composureDelta >= 0 ? "+" : ""}{res.composureDelta}</b><small className="font-mono text-[8px] text-muted">ХЛАДНОКРОВИЕ</small></div>
            <div className="rounded-[9px] border border-border bg-surface px-3 py-2"><b className={`block font-mono text-[14px] ${res.capitalDelta >= 0 ? "text-good" : "text-bad"}`}>{res.capitalDelta >= 0 ? "+" : ""}{Math.round(res.capitalDelta * 100)}%</b><small className="font-mono text-[8px] text-muted">КАПИТАЛ</small></div>
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            {(Object.keys(res.traitDelta) as (keyof Traits)[]).map((k) => {
              const v = res.traitDelta[k] ?? 0;
              return <Chip key={k} tone={v >= 0 ? "good" : "bad"}>{TRAIT_LABELS[k]} {v >= 0 ? "+" : ""}{v}</Chip>;
            })}
          </div>
          <button onClick={next} className="mt-1 grid h-11 w-full place-items-center rounded-[11px] bg-primary text-[13px] font-bold text-[#03110f]">
            {composure <= 0 ? "К ВСКРЫТИЮ" : node >= run.length - 1 ? "ЗАВЕРШИТЬ РЕЙД" : "СЛЕДУЮЩИЙ УЗЕЛ"}
          </button>
        </div>
      )}

      {phase === "autopsy" && (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3.5">
          <div className="paper rounded-[10px] p-3">
            <div className="font-mono text-[8px] font-bold tracking-[0.15em] text-ink/60">ПРОТОКОЛ ВСКРЫТИЯ · РЕЙД #{seed % 10000}</div>
            <div className="tabloid-title mt-1 text-[19px] leading-[0.95]">
              {composure <= 0 ? "Причина смерти: уверенность" : capital >= 1.2 ? "Выжил. Это подозрительно" : "Выжил. Рынок был великодушен"}
            </div>
            <p className="mt-1.5 text-[10px] leading-snug text-ink/80">
              Пройдено узлов: {log.length} из {run.length}. Капитал: {capital.toFixed(2)}×. Хладнокровие: {composure}.
              {" "}Ошибок: {log.filter((l) => !l.res.correct).length}. Виноват пользователь.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="grid place-items-center rounded-xl border border-border bg-surface p-1"><Radar values={traitVals} size={130} /></div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              {(Object.keys(TRAIT_LABELS) as (keyof Traits)[]).map((k) => (
                <div key={k} className="flex items-center justify-between rounded-[8px] border border-border bg-surface px-2 py-1">
                  <span className="truncate font-mono text-[7px] text-muted">{TRAIT_LABELS[k]}</span>
                  <span className={`font-mono text-[10px] font-bold ${traits[k] >= 0 ? "text-good" : "text-bad"}`}>{traits[k] >= 0 ? "+" : ""}{traits[k]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto no-scrollbar">
            {log.map((l, i) => (
              <div key={i} className="flex items-center gap-2 rounded-[8px] border border-border bg-surface px-2 py-1">
                <span className={`grid h-5 w-5 place-items-center rounded-full border font-mono text-[8px] ${l.res.correct ? "border-good text-good" : "border-bad text-bad"}`}>{i + 1}</span>
                <span className="flex-1 truncate text-[10px] text-sub">{l.enemy.name}</span>
                <span className="font-mono text-[8px] uppercase text-muted">{l.action}</span>
              </div>
            ))}
          </div>
          <div className="rounded-[10px] border border-cognitive/40 bg-cognitive/5 p-2">
            <div className="font-mono text-[8px] tracking-wider text-cognitive">ПРИЗРАК ОБУЧЕН</div>
            <div className="text-[10px] text-sub">Дельта черт записана. Ночью он повторит твои ошибки — если ты не сохранишь их в архив.</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setPhase("lobby"); setSeed(Math.floor(Math.random() * 1e6)); }} className="grid h-11 place-items-center rounded-[11px] border border-strong text-[12px] font-bold text-text">НОВЫЙ РЕЙД</button>
            <button disabled={saving || saved} onClick={save} className="grid h-11 place-items-center rounded-[11px] bg-primary text-[12px] font-bold text-[#03110f] disabled:opacity-50">
              {saved ? "В АРХИВЕ ✓" : saving ? "..." : "В АРХИВ ПРИЗРАКОВ"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
