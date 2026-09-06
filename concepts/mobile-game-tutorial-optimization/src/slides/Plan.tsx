import { useMemo, useState } from "react";
import { ScoreRing } from "../components/charts";
import { Card, Chip, Eyebrow, Lead, SeverityBadge, Title } from "../components/ui";
import { BASE_SCORE, categories, dodChecklist, findings, sprints } from "../data/audit";
import { cn } from "../utils/cn";

export function RoadmapSlide() {
  return (
    <div>
      <Eyebrow>План</Eyebrow>
      <Title className="mt-2">Четыре спринта — четыре контрольные точки</Title>
      <Lead className="mt-3">
        Порядок выбран по принципу «сначала то, что видит игрок, потом то, что видит оценщик, потом то, что видит сервер». Каждый спринт
        завершается измеримым баллом, а не «стало лучше».
      </Lead>
      <div className="mt-8 relative">
        <div className="absolute left-0 right-0 top-6 hidden h-0.5 bg-border lg:block" />
        <div className="grid gap-4 lg:grid-cols-4">
          {sprints.map((s, i) => {
            const prev = i === 0 ? BASE_SCORE : sprints[i - 1].score;
            const list = findings.filter((f) => f.sprint === s.n);
            return (
              <div key={s.n} className={cn("anim-in relative", `delay-${i + 1}`)}>
                <div
                  className="relative z-10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 font-display text-lg font-bold lg:mx-0"
                  style={{ borderColor: "#31d6c4", background: "#070b14", color: "#31d6c4", animation: i === 3 ? "pulse-ring 1.8s infinite" : undefined }}
                >
                  {s.n}
                </div>
                <Card className="h-full">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-muted">{s.weeks}</div>
                  <div className="mt-1 text-lg font-semibold leading-tight">{s.name}</div>
                  <div className="mt-2 flex items-baseline gap-2 font-mono">
                    <span className="text-muted">{prev}</span>
                    <span className="text-muted">→</span>
                    <span className="text-2xl font-bold text-good">{s.score}</span>
                    <span className="text-[11px] text-good">+{s.score - prev}</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-sub">{s.goal}</p>
                  <ul className="mt-3 space-y-1.5 text-[13px]">
                    {s.deliverables.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="text-accent">▸</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 border-t border-border pt-2 font-mono text-[11px] text-muted">
                    {list.length} находок · {list.filter((f) => f.severity === "critical").length} критичных
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SimulatorSlide() {
  const [on, setOn] = useState<Set<string>>(() => new Set());
  const score = useMemo(() => BASE_SCORE + findings.filter((f) => on.has(f.id)).reduce((s, f) => s + f.gain, 0), [on]);
  const toggle = (id: string) => {
    const n = new Set(on);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setOn(n);
  };
  const setSprint = (upTo: number) => setOn(new Set(findings.filter((f) => f.sprint <= upTo).map((f) => f.id)));
  const days = findings.filter((f) => on.has(f.id)).reduce((s, f) => s + (f.effort === "S" ? 1.5 : f.effort === "M" ? 4 : 8), 0);

  return (
    <div>
      <Eyebrow>План · Интерактив</Eyebrow>
      <Title className="mt-2">Симулятор: соберите свои 99</Title>
      <Lead className="mt-3">Включайте исправления и смотрите, как меняется итоговая оценка. Быстрые пресеты — по спринтам.</Lead>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Card className="flex flex-col items-center">
            <ScoreRing value={Math.min(100, Math.round(score * 10) / 10)} size={190} label="прогноз" />
            <div className="mt-3 grid w-full grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-border bg-inset p-2">
                <div className="font-mono text-[10px] uppercase text-muted">включено</div>
                <div className="font-mono text-lg">
                  {on.size}/{findings.length}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-inset p-2">
                <div className="font-mono text-[10px] uppercase text-muted">чел.-дней</div>
                <div className="font-mono text-lg">{Math.round(days)}</div>
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setSprint(n)}
                className={cn(
                  "min-h-11 rounded-xl border px-3 text-[13px] font-medium transition",
                  n === 0 ? "col-span-2 border-border text-sub hover:border-strong" : "border-accent/40 text-accent hover:bg-accent/10",
                )}
              >
                {n === 0 ? "Сбросить" : `Спринты 1–${n}`}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {categories.map((c) => {
            const list = findings.filter((f) => f.cat === c.id);
            return (
              <div key={c.id}>
                <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
                  <span>{c.icon}</span>
                  {c.name}
                </div>
                <div className="grid gap-1.5 md:grid-cols-2">
                  {list.map((f) => {
                    const a = on.has(f.id);
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggle(f.id)}
                        className={cn(
                          "flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-left transition",
                          a ? "border-good/50 bg-good/10" : "border-border bg-surface hover:border-strong",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[12px]",
                            a ? "border-good bg-good text-bg" : "border-strong text-transparent",
                          )}
                        >
                          ✓
                        </span>
                        <span className="flex-1 truncate text-[13px]">{f.title}</span>
                        <span className={cn("font-mono text-[12px]", a ? "text-good" : "text-muted")}>+{f.gain}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DodSlide() {
  const crit = findings.filter((f) => f.severity === "critical");
  return (
    <div>
      <Eyebrow>План · Контроль</Eyebrow>
      <Title className="mt-2">Definition of Done: как поймём, что дошли до 99</Title>
      <Lead className="mt-3">
        Не «выглядит лучше», а проверяемые условия. Каждое — автоматизировано в CI или проверяется за минуту по чек-листу перед релизом.
      </Lead>
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {dodChecklist.map((g, i) => (
          <Card key={g.group} className={cn("anim-in", `delay-${Math.min(6, i + 1)}`)}>
            <div className="font-semibold">{g.group}</div>
            <ul className="mt-2 space-y-1.5">
              {g.items.map((it) => (
                <li key={it} className="flex gap-2 text-[13px] text-sub">
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-strong" />
                  {it}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <Card className="mt-5 anim-in delay-5">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Критичные находки — закрываются в первую очередь</div>
          <Chip tone="bad">{crit.length} шт.</Chip>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {crit.map((f) => (
            <span key={f.id} className="inline-flex items-center gap-2 rounded-lg border border-border bg-inset px-2.5 py-1.5 text-[12px]">
              <span className="font-mono text-muted">{f.id}</span>
              <span className="max-w-[260px] truncate">{f.title}</span>
              <SeverityBadge s={f.severity} />
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function FinalSlide() {
  const week1 = findings.filter((f) => f.sprint === 1 && f.effort === "S");
  return (
    <div className="flex min-h-[70vh] flex-col justify-center">
      <Eyebrow>Итог</Eyebrow>
      <h2 className="anim-in mt-3 font-display text-3xl font-bold leading-tight md:text-5xl">
        Механики есть. <span className="text-accent">Не хватает уважения к пальцу, глазу и тестам.</span>
      </h2>
      <div className="anim-in delay-2 mt-8 grid gap-4 md:grid-cols-3">
        <Card accent="#ff596d">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Что было</div>
          <div className="mt-1 font-display text-4xl font-bold text-bad">25</div>
          <p className="mt-2 text-[14px] text-sub">Шрифты 7px, тап-зоны 14px, «M3 СТАВКА» на экране, 0 тестов, seed от Date.now().</p>
        </Card>
        <Card accent="#ffb341">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Что делаем</div>
          <div className="mt-1 font-display text-4xl font-bold text-warn">30</div>
          <p className="mt-2 text-[14px] text-sub">исправлений в 4 спринта по 2 недели. Механики M1–M15 не трогаем — только оболочку, стек и связь.</p>
        </Card>
        <Card accent="#3bde8a">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Что получим</div>
          <div className="mt-1 font-display text-4xl font-bold text-good">99</div>
          <p className="mt-2 text-[14px] text-sub">Читаемая, отзывчивая, устанавливаемая игра, ответы которой проверяет сервер, а поведение — CI.</p>
        </Card>
      </div>
      <Card className="anim-in delay-3 mt-6">
        <div className="font-semibold">Начать можно завтра — первые {week1.length} правок укладываются в неделю и дают +{week1.reduce((s, f) => s + f.gain, 0)} баллов:</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {week1.map((f) => (
            <Chip key={f.id} tone="accent">
              {f.id} · {f.title.split(" — ")[0].split(":")[0]}
            </Chip>
          ))}
        </div>
      </Card>
      <p className="anim-in delay-4 mt-6 font-mono text-[12px] text-muted">
        Источники: phaser/src/scenes/ArenaScene.ts · phaser/src/state/GameState.ts · phaser/package.json · backend/aibackend/http/index.ts · README.md · tz.txt
      </p>
    </div>
  );
}
