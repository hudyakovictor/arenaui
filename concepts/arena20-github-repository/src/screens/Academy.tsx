import { useState } from "react";
import { Lock, Check, Play, ChevronRight, BookOpen, Swords } from "lucide-react";
import { Button, Headline, Modal, Progress, Tag } from "../components/ui";
import { chapters, lessonAtoms, type Chapter } from "../data/game";
import { useGame } from "../store";
import { cn } from "../utils/cn";

export default function Academy({ onGoArena }: { onGoArena: () => void }) {
  const g = useGame();
  const [open, setOpen] = useState<Chapter | null>(null);
  const [atomIdx, setAtomIdx] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [passed, setPassed] = useState<Set<string>>(new Set());

  const openChapter = (c: Chapter) => {
    if (c.level > g.level) {
      g.toast(`Глава откроется на уровне ${c.level}`, "gold");
      return;
    }
    setOpen(c);
    setAtomIdx(0);
    setAnswer(null);
  };

  const atoms = open ? lessonAtoms[open.n] ?? lessonAtoms[4] : [];
  const atom = atoms[atomIdx];
  const key = open ? `${open.n}:${atomIdx}` : "";

  const doneTotal = chapters.reduce((a, c) => a + c.done, 0);
  const total = chapters.reduce((a, c) => a + c.atoms, 0);

  return (
    <div className="space-y-4 pb-6">
      <Headline kicker="Академия" title="Учись. Система всё равно хочет тебя съесть." sub="Каждая глава — карта. Каждая карта — контр-приём против конкретного врага." />

      <div className="card flex items-center gap-4 p-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-display text-[11px] uppercase tracking-[0.16em] text-muted">Прогресс курса</span>
            <span className="font-display text-sm font-semibold">
              {doneTotal}/{total} атомов
            </span>
          </div>
          <Progress value={(doneTotal / total) * 100} className="mt-2" />
          <div className="mt-2 text-[11px] text-sub">Текущая глава: <span className="text-text">4 · Риск-менеджмент</span></div>
        </div>
        <Button size="sm" onClick={() => openChapter(chapters[3])}>
          <Play size={14} /> Продолжить
        </Button>
      </div>

      {/* path */}
      <div className="relative">
        <div className="absolute bottom-6 left-[27px] top-6 w-0.5 bg-gradient-to-b from-acid via-line to-line" />
        <div className="space-y-3">
          {chapters.map((c, i) => {
            const locked = c.level > g.level;
            const done = c.done === c.atoms;
            const current = !locked && !done;
            return (
              <button
                key={c.n}
                onClick={() => openChapter(c)}
                className={cn("press relative flex w-full items-center gap-3 text-left", locked && "opacity-70")}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div
                  className={cn(
                    "relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 font-display text-lg font-bold transition-all",
                    done && "border-acid bg-acid text-ink shadow-[0_0_14px_rgba(200,255,0,0.4)]",
                    current && "animate-glow border-acid bg-surface text-acid",
                    locked && "border-line bg-ink text-muted"
                  )}
                >
                  {done ? <Check size={22} strokeWidth={3} /> : locked ? <Lock size={18} /> : c.n}
                </div>
                <div className={cn("card flex-1 p-3", current && "border-acid/40")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-display text-[10px] uppercase tracking-widest text-muted">Глава {c.n} · ур. {c.level}</div>
                      <div className="stencil truncate text-[15px]">{c.title}</div>
                    </div>
                    <ChevronRight size={16} className="mt-2 shrink-0 text-muted" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Progress value={(c.done / c.atoms) * 100} className="h-1.5 flex-1" color={done ? "bg-acid" : "bg-acid/70"} />
                    <span className="font-display text-[11px] text-sub">
                      {c.done}/{c.atoms}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Tag className="bg-elevated text-sub">Карта: {c.card}</Tag>
                    <Tag className="bg-bad/15 text-bad">Враг: {c.enemy}</Tag>
                  </div>
                  {!locked && <p className="mt-1.5 text-[11px] italic text-muted">«{c.quip}»</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* lesson modal */}
      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        kicker={open ? `Глава ${open.n} · Карта «${open.card}»` : ""}
        title={open?.title}
        expandable
        footer={
          open && (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {atoms.map((_, i) => (
                  <div key={i} className={cn("h-1.5 flex-1 rounded-full", i < atomIdx || passed.has(`${open.n}:${i}`) ? "bg-acid" : i === atomIdx ? "bg-acid/50" : "bg-line")} />
                ))}
              </div>
              {atomIdx < atoms.length - 1 ? (
                <Button size="sm" onClick={() => { setAtomIdx((a) => a + 1); setAnswer(null); }}>
                  Далее <ChevronRight size={14} />
                </Button>
              ) : (
                <Button size="sm" onClick={() => { setOpen(null); onGoArena(); }}>
                  <Swords size={14} /> В бой
                </Button>
              )}
            </div>
          )
        }
      >
        {atom && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <BookOpen size={12} /> Атом {atomIdx + 1} из {atoms.length} · ~2 мин
            </div>
            <div className="stencil text-2xl leading-tight">{atom.title}</div>
            <div className="space-y-3 text-[14px] leading-relaxed">
              {atom.body.map((p, i) => (
                <p key={i} className={cn(i === 0 && "stencil text-base text-acid", i > 0 && "text-sub")}>
                  {p}
                </p>
              ))}
            </div>

            {atom.quiz && (
              <div className="card-inset space-y-2 p-3">
                <div className="font-display text-[10px] uppercase tracking-widest text-muted">Проверка. Рынок не проверяет — он взыскивает.</div>
                <div className="text-[13px] font-medium">{atom.quiz.q}</div>
                <div className="grid gap-1.5">
                  {atom.quiz.options.map((o, i) => {
                    const picked = answer === i;
                    const revealed = answer != null;
                    const correct = i === atom.quiz!.correct;
                    return (
                      <button
                        key={o}
                        disabled={revealed}
                        onClick={() => {
                          setAnswer(i);
                          if (correct) {
                            if (!passed.has(key)) {
                              g.addXp(40);
                              g.addCoins(10);
                              setPassed((p) => new Set([...p, key]));
                            }
                            g.toast("Верно. +40 XP. Не привыкай.");
                          } else g.toast("Рынок принял твоё решение.", "bad");
                        }}
                        className={cn(
                          "press rounded-xl border px-3 py-2.5 text-left text-[13px] transition-all",
                          !revealed && "border-line bg-elevated hover:border-line-strong",
                          revealed && correct && "border-acid bg-acid/10 text-acid",
                          revealed && picked && !correct && "border-bad bg-bad/10 text-bad animate-shake",
                          revealed && !picked && !correct && "border-line opacity-50"
                        )}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
                {answer != null && <p className="animate-fade-up text-[12px] text-sub">{atom.quiz.why}</p>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
