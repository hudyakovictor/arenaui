import { useState } from "react";
import { Eye, EyeOff, Swords, Shield } from "lucide-react";
import { Button, Headline, Modal, Progress, Tag } from "../components/ui";
import { enemies, type Enemy } from "../data/game";
import { useGame } from "../store";
import { cn } from "../utils/cn";

const stageLabel = ["Силуэт", "Замечен", "Изучен", "Раскрыт"];

export default function Bestiary({ onGoArena }: { onGoArena: () => void }) {
  const g = useGame();
  const [open, setOpen] = useState<Enemy | null>(null);
  const [filter, setFilter] = useState<"all" | "known" | "unknown">("all");

  const stageOf = (e: Enemy) => (g.revealed.has(e.id) ? Math.max(e.stage, 2) : e.stage);
  const list = enemies.filter((e) => (filter === "all" ? true : filter === "known" ? stageOf(e) > 0 : stageOf(e) === 0));
  const known = enemies.filter((e) => stageOf(e) > 0).length;

  return (
    <div className="space-y-4 pb-6">
      <Headline kicker="Бестиарий" title="Они не злодеи. Они — рынок." sub="Каждый враг — паттерн, на котором ты уже терял. Раскрой его, чтобы перестать." />

      <div className="card flex items-center gap-3 p-3">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-display text-[11px] uppercase tracking-[0.16em] text-muted">Раскрыто</span>
            <span className="font-display text-sm font-semibold">
              {known}/{enemies.length}
            </span>
          </div>
          <Progress value={(known / enemies.length) * 100} className="mt-2" color="bg-violet" />
        </div>
        <div className="flex gap-1">
          {(["all", "known", "unknown"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("press rounded-lg px-2 py-1.5 font-display text-[10px] font-bold uppercase tracking-wider", filter === f ? "bg-acid text-ink" : "bg-elevated text-sub")}>
              {f === "all" ? "Все" : f === "known" ? "Известны" : "Тени"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {list.map((e, i) => {
          const st = stageOf(e);
          const hidden = st === 0;
          return (
            <button
              key={e.id}
              onClick={() => setOpen(e)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={cn("press card group relative animate-fade-up overflow-hidden p-0 text-left transition-transform hover:-translate-y-1", st >= 3 && "border-acid/40")}
            >
              <div className={cn("absolute inset-x-0 top-0 h-1", hidden ? "bg-line" : e.domainColor.split(" ")[0])} />
              <div className="relative grid h-32 place-items-center bg-gradient-to-b from-ink/40 to-transparent">
                <div className={cn("text-6xl transition-transform duration-300 group-hover:scale-110", hidden && "silhouette", !hidden && "animate-float")}>{e.emoji}</div>
                <div className="absolute left-2 top-2">
                  <Tag className={hidden ? "bg-elevated text-muted" : e.domainColor}>{hidden ? "???" : e.domain}</Tag>
                </div>
                <div className="absolute right-2 top-2 rounded-md bg-ink/80 px-1.5 py-0.5 font-display text-[10px] font-bold uppercase text-sub">
                  {stageLabel[st]}
                </div>
              </div>
              <div className="border-t border-line p-3">
                <div className="stencil truncate text-[15px]">{hidden ? "Не раскрыт" : e.name}</div>
                <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-sub">{hidden ? "Ты его ещё не встречал. Или не заметил." : e.headline}</div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
                  <span>Встреч: {e.met}</span>
                  <span>
                    Побед: <span className={e.beaten > 0 ? "text-acid" : ""}>{e.beaten}</span>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} kicker={open ? `Досье · ${stageLabel[stageOf(open)]}` : ""} title={open && stageOf(open) > 0 ? open.name : "Не раскрыт"} expandable>
        {open && (
          <div className="space-y-4">
            <div className="relative grid h-44 place-items-center overflow-hidden rounded-2xl border border-line bg-ink/60">
              <div className={cn("text-8xl", stageOf(open) === 0 ? "silhouette" : "animate-float")}>{open.emoji}</div>
              <div className="absolute left-3 top-3">
                <Tag className={stageOf(open) === 0 ? "bg-elevated text-muted" : open.domainColor}>{stageOf(open) === 0 ? "???" : open.domain}</Tag>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-ink/80 px-2 py-1 text-[11px] text-sub">
                {stageOf(open) === 0 ? <EyeOff size={12} /> : <Eye size={12} className="text-acid" />} {stageLabel[stageOf(open)]}
              </div>
            </div>

            <div>
              <div className="stencil text-xl leading-tight text-text">{stageOf(open) === 0 ? "СИЛУЭТ В ТУМАНЕ" : open.headline}</div>
              <p className="mt-1 text-[13px] text-sub">{stageOf(open) === 0 ? "Досье засекречено. Департамент управляемой паники не даёт комментариев." : open.truth}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="card-inset px-3 py-2">
                <div className="font-display text-[10px] uppercase tracking-widest text-muted">Встреч</div>
                <div className="font-display text-lg font-bold">{open.met}</div>
              </div>
              <div className="card-inset px-3 py-2">
                <div className="font-display text-[10px] uppercase tracking-widest text-muted">Побед</div>
                <div className="font-display text-lg font-bold text-acid">{open.beaten}</div>
              </div>
              <div className="card-inset px-3 py-2">
                <div className="font-display text-[10px] uppercase tracking-widest text-muted">Винрейт</div>
                <div className="font-display text-lg font-bold">{open.met ? Math.round((open.beaten / open.met) * 100) : 0}%</div>
              </div>
            </div>

            <div className="card-inset p-3">
              <div className="mb-1 flex items-center gap-1.5 font-display text-[10px] uppercase tracking-widest text-muted">
                <Shield size={12} /> Контр-карты
              </div>
              <div className="flex flex-wrap gap-1.5">
                {open.counter.split(" · ").map((c) => (
                  <Tag key={c} className={stageOf(open) === 0 ? "bg-elevated text-muted" : "bg-acid text-ink"}>
                    {stageOf(open) === 0 ? "???" : c}
                  </Tag>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted">Что о нём известно</div>
              <ul className="space-y-1.5 text-[13px] text-sub">
                {open.dossier.map((d, i) => (
                  <li key={i} className={cn("flex gap-2", stageOf(open) < i && "blur-[3px] select-none")}>
                    <span className="text-acid">▸</span> {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-bad/30 bg-bad/5 p-3 text-[12px]">
              <span className="font-display text-[10px] uppercase tracking-widest text-bad">Удар: </span>
              <span className="text-sub">{stageOf(open) === 0 ? "…" : open.hit}</span>
            </div>

            <Button full onClick={() => { setOpen(null); onGoArena(); }}>
              <Swords size={16} /> Найти в Арене
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
