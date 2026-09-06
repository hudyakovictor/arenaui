import { useState } from "react";
import { Button, Card, SectionTitle, Sheet, Tag } from "../components/ui";
import { IconBack, IconBook, IconCheck, IconExpand, IconLock, IconSwords, IconArrowRight } from "../components/icons";
import { chapters, levels, skillCards, type Chapter } from "../data/game";
import { useStore } from "../store";
import { cn } from "../utils/cn";

export function Academy({ onGoArena, toast }: { onGoArena: () => void; toast: (m: string) => void }) {
  const { s } = useStore();
  const [open, setOpen] = useState<Chapter | null>(null);

  if (open) return <Lesson chapter={open} onBack={() => setOpen(null)} onGoArena={onGoArena} toast={toast} />;

  const doneCount = s.academyDone.length;

  return (
    <div className="fade-up space-y-4 px-3 pb-28 pt-4">
      <div>
        <h1 className="stencil drip drip-right drip-dark relative inline-block text-[34px] leading-none text-text">Академия</h1>
        <p className="mt-3 text-[15px] text-sub">Обучение слегка угрожает. Это нормально.</p>
      </div>

      <Card className="flex items-center gap-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
            <circle cx="28" cy="28" r="24" stroke="#33383f" strokeWidth="5" fill="none" />
            <circle cx="28" cy="28" r="24" stroke="#c8ff00" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 * (1 - doneCount / chapters.length)} className="transition-all duration-700" />
          </svg>
          <span className="absolute stencil text-[14px] text-text">{Math.round((doneCount / chapters.length) * 100)}%</span>
        </div>
        <div className="flex-1">
          <p className="font-display text-[15px] font-bold uppercase text-text">Программа выживания</p>
          <p className="text-[12px] text-sub">{doneCount} из {chapters.length} глав. Каждая глава открывает карту навыка.</p>
        </div>
      </Card>

      <div className="space-y-3">
        {chapters.map((ch, i) => {
          const done = s.academyDone.includes(ch.n);
          const locked = ch.locked && !s.academyDone.includes(ch.n - 1);
          const card = skillCards.find((c) => c.id === ch.cardId)!;
          const battles = levels.filter((l) => l.chapter === ch.n).length;
          return (
            <button key={ch.n} disabled={locked} onClick={() => setOpen(ch)} style={{ animationDelay: `${i * 50}ms` }}
              className={cn("fade-up press card flex w-full items-center gap-3 p-3 text-left", done && "border-acid/50", locked && "opacity-60")}>
              <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[28px]", done ? "bg-acid/15" : "bg-ink")}>{locked ? <IconLock size={22} className="text-muted" /> : card.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="stencil text-[12px] text-muted">Глава {ch.n}</span>
                  {done && <Tag color="bg-acid text-ink">пройдено</Tag>}
                </div>
                <p className="font-display text-[17px] font-bold uppercase leading-tight text-text">{ch.title}</p>
                <p className="text-[12px] text-sub">{ch.sub}</p>
                <p className="mt-1 text-[11px] text-muted">Карта: {card.name} · {battles > 0 ? `${battles} боя` : "бои скоро"} · vs {ch.enemy}</p>
              </div>
              <IconArrowRight size={18} className="text-muted" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Lesson({ chapter, onBack, onGoArena, toast }: { chapter: Chapter; onBack: () => void; onGoArena: () => void; toast: (m: string) => void }) {
  const { s, d } = useStore();
  const lvl = levels.find((l) => l.chapter === chapter.n) ?? levels[0];
  const [picked, setPicked] = useState<number | null>(null);
  const [full, setFull] = useState(false);
  const card = skillCards.find((c) => c.id === chapter.cardId)!;
  const done = s.academyDone.includes(chapter.n);
  const correct = lvl.quiz.correct;

  const Atoms = ({ big }: { big?: boolean }) => (
    <div className={cn("grid gap-2", big ? "grid-cols-1" : "grid-cols-2")}>
      {chapter.atoms.map(([t, dsc]) => (
        <div key={t} className={cn("rounded-xl border border-line bg-ink/50", big ? "p-4" : "p-3")}>
          <p className={cn("font-display font-bold uppercase text-acid", big ? "text-[18px]" : "text-[14px]")}>{t}</p>
          <p className={cn("mt-1 text-sub", big ? "text-[15px] leading-relaxed" : "text-[12px] leading-snug")}>{dsc}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="slide-in space-y-4 px-3 pb-28 pt-3">
      <button onClick={onBack} className="press flex items-center gap-1 font-display text-[14px] uppercase text-sub"><IconBack size={18} /> Академия</button>

      <div>
        <span className="stencil text-[12px] text-muted">Глава {chapter.n}</span>
        <h1 className="stencil drip relative text-[30px] leading-none text-acid acid-glow-text">{chapter.title}</h1>
        <p className="mt-4 text-[14px] text-sub">{chapter.sub}</p>
      </div>

      {/* enemy silhouette */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-ink/70 p-4">
        <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-acid/10 blur-2xl" />
        <SectionTitle>Против кого нужна эта карта</SectionTitle>
        <div className="mt-2 flex items-center gap-3">
          <span className="stencil flex h-12 w-12 items-center justify-center rounded-xl bg-elevated text-[28px] text-line-strong">?</span>
          <div>
            <p className="font-display text-[18px] font-bold uppercase text-text">{chapter.enemy}</p>
            <p className="text-[12px] text-sub">Силуэт. Подробности — в Арене. Если доживёшь.</p>
          </div>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-acid"><IconBook size={18} /><p className="font-display text-[13px] font-bold uppercase tracking-wider">Цель урока</p></div>
          <button onClick={() => setFull(true)} className="press flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted" title="Развернуть"><IconExpand size={15} /></button>
        </div>
        <p className="text-[15px] text-text">{chapter.goal}</p>
        <Atoms />
      </Card>

      {/* skill card reward */}
      <Card className="flex items-center gap-3 border-line-strong">
        <span className="flex h-16 w-12 items-center justify-center rounded-lg border-2 border-line-strong bg-gradient-to-b from-elevated to-surface text-[26px]">{card.emoji}</span>
        <div className="flex-1">
          <SectionTitle>Награда главы</SectionTitle>
          <p className="font-display text-[16px] font-bold uppercase text-text">Карта «{card.name}» {done ? `· ранг ${s.cardRank[card.id] ?? 1}` : "+1 ранг"}</p>
          <p className="text-[12px] text-sub">{card.short}</p>
        </div>
      </Card>

      <Card>
        <p className="font-display text-[13px] font-bold uppercase tracking-wider text-acid">Микро-проверка</p>
        <p className="mt-1 text-[15px] text-text">{lvl.quiz.q}</p>
        <div className="mt-3 space-y-2">
          {lvl.quiz.options.map((o, i) => {
            const on = picked === i;
            const show = picked !== null;
            return (
              <button key={o} disabled={show} onClick={() => { setPicked(i); if (i === correct && !done) { d({ type: "ACADEMY_DONE", chapter: chapter.n, cardId: card.id }); toast(`Карта «${card.name}» +1 ранг · +60 XP`); } }}
                className={cn("press flex w-full items-center justify-between rounded-xl border-2 px-3 py-3 text-left text-[14px]",
                  show && i === correct ? "border-good bg-good/10 text-text" : on ? "border-bad bg-bad/10 text-text shake" : "border-line-strong text-text")}>
                <span>{o}</span>
                <span className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-strong font-display text-[11px] text-muted">{show && i === correct ? <IconCheck size={12} className="text-good" /> : String.fromCharCode(65 + i)}</span>
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="fade-up mt-4 rounded-xl border border-acid bg-ink/60 p-3 shadow-acid-soft">
            <p className="font-display text-[16px] font-bold uppercase text-acid">{picked === correct ? `Атом освоен. Карта «${card.name}» +1 ранг.` : "Рынок принял твоё решение."}</p>
            <p className="mt-1 text-[13px] text-sub">{lvl.quiz.why[picked]}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {picked !== correct && <Button variant="ghost" size="sm" onClick={() => setPicked(null)}>Ещё раз</Button>}
              <Button size="sm" className={picked === correct ? "col-span-2" : ""} onClick={onGoArena}><IconSwords size={16} /> Проверить в Арене</Button>
            </div>
          </div>
        )}
      </Card>

      <Sheet open={full} onClose={() => setFull(false)} title={chapter.title} full>
        <p className="text-[16px] leading-relaxed text-text">{chapter.goal}</p>
        <div className="mt-4"><Atoms big /></div>
        <p className="mt-6 text-center text-[12px] text-muted">Ты учишься. Система всё равно хочет тебя съесть.</p>
      </Sheet>
    </div>
  );
}
