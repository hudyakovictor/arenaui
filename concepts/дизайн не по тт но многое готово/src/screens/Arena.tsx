import { useState } from "react";
import { Battle } from "./Battle";
import { Button, Card, SectionTitle, Sheet, Stars, Tag } from "../components/ui";
import { IconCheck, IconLock, IconPlay, IconSkull, IconSwords, IconTarget, IconGift, IconBolt } from "../components/icons";
import { chapters, dailyQuests, enemies, levels, type Level } from "../data/game";
import { isLevelUnlocked, useStore } from "../store";
import { cn } from "../utils/cn";

export function Arena({ toast }: { toast: (m: string) => void }) {
  const { s, d } = useStore();
  const [active, setActive] = useState<Level | null>(null);
  const [preview, setPreview] = useState<Level | null>(null);

  if (active) {
    return (
      <Battle
        key={active.id}
        level={active}
        onExit={() => setActive(null)}
        onNext={() => {
          const idx = levels.findIndex((l) => l.id === active.id);
          const nx = levels[idx + 1];
          if (nx) setActive(nx); else { setActive(null); toast("Кампания пройдена. Пока что."); }
        }}
      />
    );
  }

  const current = levels.find((l) => !s.completed[l.id] && isLevelUnlocked(s, l.id)) ?? levels[levels.length - 1];
  const doneCount = Object.keys(s.completed).length;

  return (
    <div className="fade-up space-y-4 px-3 pb-28 pt-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="stencil drip drip-right relative inline-block text-[34px] leading-none text-text">Арена</h1>
          <p className="mt-3 text-[15px] text-sub">Сезон 1 · Ты здесь ради денег.</p>
        </div>
        <div className="text-right">
          <p className="stencil text-[22px] leading-none text-acid">{doneCount}/{levels.length}</p>
          <p className="text-[11px] uppercase text-muted">боёв пройдено</p>
        </div>
      </div>

      {/* Hero: continue */}
      <Card acid className="overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-acid/15 blur-2xl" />
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-ink text-[36px]">
            <span className={cn((s.enemyStage[current.enemyId] ?? 0) >= 2 ? "" : "blur-sm grayscale opacity-70")}>{enemies.find((e) => e.id === current.enemyId)!.emoji}</span>
          </div>
          <div className="min-w-0 flex-1">
            <SectionTitle className="text-acid">Следующий бой · {current.id}</SectionTitle>
            <p className="truncate font-display text-[20px] font-bold uppercase leading-tight text-text">{current.title}</p>
            <p className="text-[12px] text-sub">{current.pair} · до {current.xp} XP</p>
          </div>
        </div>
        <Button size="lg" className="mt-4 w-full" onClick={() => setActive(current)}><IconPlay size={18} /> В бой</Button>
      </Card>

      {/* Campaign path */}
      <div>
        <div className="flex items-center justify-between">
          <SectionTitle>Кампания</SectionTitle>
          {s.combo > 1 && <span className="flex items-center gap-1 font-display text-[12px] font-bold uppercase text-acid"><IconBolt size={12} /> комбо x{s.combo}</span>}
        </div>
        <div className="relative mt-3">
          {chapters.slice(0, 3).map((ch) => {
            const ls = levels.filter((l) => l.chapter === ch.n);
            return (
              <div key={ch.n} className="relative mb-2">
                <div className="mb-2 flex items-center gap-2">
                  <span className="stencil text-[13px] text-muted">Глава {ch.n}</span>
                  <span className="h-px flex-1 bg-line" />
                  <span className="font-display text-[12px] uppercase text-sub">{ch.title}</span>
                </div>
                {ls.length === 0 ? (
                  <div className="card-inset flex items-center justify-between px-4 py-4 opacity-70">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-line-strong text-muted"><IconLock size={18} /></span>
                      <div>
                        <p className="font-display text-[15px] font-bold uppercase text-sub">Скоро</p>
                        <p className="text-[12px] text-muted">Противник: {ch.enemy}. Ещё не проснулся.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative space-y-3">
                    <div className="absolute bottom-6 left-7 top-6 w-0.5 bg-line" />
                    {ls.map((l, i) => {
                      const done = s.completed[l.id];
                      const unlocked = isLevelUnlocked(s, l.id);
                      const isCur = current.id === l.id;
                      const en = enemies.find((e) => e.id === l.enemyId)!;
                      return (
                        <button key={l.id} disabled={!unlocked} onClick={() => setPreview(l)}
                          className={cn("press relative flex w-full items-center gap-3 rounded-2xl border p-2 pr-3 text-left", isCur ? "card acid-ring" : done ? "card" : "border-line bg-surface/40", !unlocked && "opacity-60", i % 2 === 1 && "ml-6 w-[calc(100%-1.5rem)]")}>
                          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-display text-[16px] font-bold", done ? "border-acid bg-acid text-ink" : isCur ? "border-acid bg-ink text-acid glow-pulse" : "border-line-strong bg-ink text-muted")}>
                            {done ? <IconCheck size={20} /> : unlocked ? l.n : <IconLock size={16} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-display text-[15px] font-bold uppercase text-text">{l.title}</p>
                              {isCur && <Tag color="bg-acid text-ink">сейчас</Tag>}
                            </div>
                            <p className="text-[12px] text-muted">{l.pair} · {en.domain}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {done ? <Stars n={done.stars} /> : <span className="font-display text-[11px] uppercase text-muted">{l.xp} XP</span>}
                            <span className={cn("text-[20px]", (s.enemyStage[l.enemyId] ?? 0) >= 2 ? "" : "blur-[3px] grayscale opacity-60")}>{en.emoji}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily quests */}
      <div>
        <SectionTitle>Задания дня · Департамент активности</SectionTitle>
        <div className="mt-2 space-y-2">
          {dailyQuests.map((q) => {
            const p = s.quests[q.id] ?? 0;
            const claimed = p === -1;
            const done = p >= q.total;
            return (
              <Card key={q.id} className={cn("flex items-center gap-3 p-3", claimed && "opacity-50")}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-acid"><IconTarget size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[14px] font-bold uppercase text-text">{q.title}</p>
                  <p className="text-[11px] text-muted">{q.sub}</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-acid transition-[width] duration-500" style={{ width: `${claimed ? 100 : (p / q.total) * 100}%` }} /></div>
                </div>
                {claimed ? <IconCheck size={18} className="text-acid" /> : done ? (
                  <Button size="sm" onClick={() => { d({ type: "CLAIM_QUEST", id: q.id, reward: q.reward }); toast(`+${q.reward} XP. Не привыкай.`); }}><IconGift size={14} /> +{q.reward}</Button>
                ) : <span className="font-display text-[13px] font-bold text-sub">{p}/{q.total}</span>}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Level preview sheet */}
      <Sheet open={!!preview} onClose={() => setPreview(null)} title={preview ? `Бой ${preview.id}` : ""}>
        {preview && (() => {
          const en = enemies.find((e) => e.id === preview.enemyId)!;
          const known = (s.enemyStage[en.id] ?? 0) >= 2;
          const done = s.completed[preview.id];
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-ink text-[44px]"><span className={cn(known ? "" : "blur-md grayscale opacity-60")}>{en.emoji}</span></div>
                <div>
                  <p className="stencil text-[24px] leading-none text-text">{preview.title}</p>
                  <p className="mt-1 text-[13px] text-sub">{preview.pair} · {preview.weather.regime}</p>
                  <div className="mt-2 flex items-center gap-2"><Tag color={en.domainColor}>{en.domain}</Tag>{done && <Stars n={done.stars} />}</div>
                </div>
              </div>
              <Card className="p-3">
                <p className="text-[14px] text-text">«{preview.headline}»</p>
                <p className="mt-1 text-[13px] text-sub">{preview.sub}</p>
              </Card>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="card-inset p-2"><p className="stencil text-[18px] text-acid">{preview.xp}</p><p className="text-[10px] uppercase text-muted">XP макс</p></div>
                <div className="card-inset p-2"><p className="stencil text-[18px] text-text">{preview.cards.length}</p><p className="text-[10px] uppercase text-muted">карт в руке</p></div>
                <div className="card-inset p-2"><p className="stencil text-[18px] text-text">{preview.news.length}</p><p className="text-[10px] uppercase text-muted">источника</p></div>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted"><IconSkull size={14} /> {known ? `Противник: ${en.name}. ${en.headline}` : "Противник не раскрыт. Досье откроется после боя."}</div>
              <Button size="lg" className="w-full" onClick={() => { setActive(preview); setPreview(null); }}><IconSwords size={20} /> {done ? "Переиграть" : "Начать бой"}</Button>
            </div>
          );
        })()}
      </Sheet>
    </div>
  );
}
