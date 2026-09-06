import { useState } from "react";
import { Button, Card, Chip, SectionTitle, Stat, Tag } from "../components/ui";
import { IconBack, IconLock, IconSwords } from "../components/icons";
import { enemies, type Enemy } from "../data/game";
import { useStore } from "../store";
import { cn } from "../utils/cn";

const stageLabel = ["Силуэт", "Замечен", "Раскрыт", "Трофей"];

export function Bestiary({ onGoArena }: { onGoArena: () => void }) {
  const { s } = useStore();
  const [open, setOpen] = useState<Enemy | null>(null);
  const [filter, setFilter] = useState<"all" | "met" | "locked">("all");

  if (open) return <Dossier e={open} onBack={() => setOpen(null)} onGoArena={onGoArena} />;

  const stage = (e: Enemy) => s.enemyStage[e.id] ?? 0;
  const list = enemies.filter((e) => (filter === "all" ? true : filter === "met" ? stage(e) > 0 : stage(e) === 0));
  const revealed = enemies.filter((e) => stage(e) >= 2).length;

  return (
    <div className="fade-up space-y-4 px-3 pb-28 pt-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="stencil drip drip-right drip-dark relative inline-block text-[34px] leading-none text-text">Бестиарий</h1>
          <p className="mt-3 text-[15px] text-sub">Каталог тех, кто уже забрал твои деньги.</p>
        </div>
        <div className="text-right">
          <p className="stencil text-[22px] leading-none text-acid">{revealed}/{enemies.length}</p>
          <p className="text-[11px] uppercase text-muted">раскрыто</p>
        </div>
      </div>

      <div className="flex gap-2">
        {([["all", "Все"], ["met", "Встречены"], ["locked", "Силуэты"]] as const).map(([id, l]) => (
          <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>{l}</Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {list.map((e, i) => {
          const st = stage(e);
          const hidden = st === 0;
          return (
            <button key={e.id} onClick={() => setOpen(e)} style={{ animationDelay: `${i * 40}ms` }}
              className={cn("fade-up press card relative flex flex-col overflow-hidden rounded-2xl p-0 text-left", st === 3 && "border-gold/70 shadow-[0_0_0_1px_rgba(245,197,66,0.4),0_0_16px_rgba(245,197,66,0.15)]")}>
              <div className="relative aspect-square w-full bg-gradient-to-b from-elevated to-ink">
                <div className="flex h-full w-full items-center justify-center">
                  {hidden ? <span className="stencil text-[72px] text-line-strong">?</span> : <span className={cn("text-[72px]", st === 1 && "blur-[2px] grayscale opacity-80")}>{e.emoji}</span>}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink to-transparent" />
                <Tag className="absolute left-2 top-2" color={e.domainColor}>{e.domain}</Tag>
                {hidden && <IconLock size={16} className="absolute right-2 top-2 text-muted" />}
              </div>
              <div className="p-3">
                <p className="font-display text-[16px] font-bold uppercase leading-tight text-text">{hidden ? "Неизвестная угроза" : e.name}</p>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3].map((x) => <span key={x} className={cn("h-1.5 flex-1 rounded-sm", x <= st ? (st === 3 ? "bg-gold" : "bg-acid") : "bg-line-strong")} />)}
                </div>
                <p className="mt-1 text-[11px] uppercase text-muted">{stageLabel[st]}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Dossier({ e, onBack, onGoArena }: { e: Enemy; onBack: () => void; onGoArena: () => void }) {
  const { s } = useStore();
  const st = s.enemyStage[e.id] ?? 0;
  const hidden = st === 0;
  return (
    <div className="slide-in space-y-4 px-3 pb-28 pt-3">
      <button onClick={onBack} className="press flex items-center gap-1 font-display text-[14px] uppercase text-sub"><IconBack size={18} /> Бестиарий</button>

      <div className="card relative overflow-hidden rounded-2xl p-0">
        <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-elevated to-ink">
          <div className="flex h-full w-full items-center justify-center">
            {hidden ? <span className="stencil text-[120px] text-line-strong">?</span> : <span className={cn("float-y text-[120px]", st === 1 && "blur-[3px] grayscale")}>{e.emoji}</span>}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Tag color={e.domainColor}>{e.domain}</Tag>
            <h1 className="stencil mt-2 text-[32px] leading-none text-text">{hidden ? "Неизвестная угроза" : e.name}</h1>
            <p className="stencil mt-1 text-[15px] text-acid">{hidden ? "Досье засекречено" : e.headline}</p>
          </div>
          {st === 3 && <span className="tape tape-gold absolute right-3 top-3 !text-[12px]">Трофей</span>}
        </div>
      </div>

      <Card>
        <SectionTitle>Досье</SectionTitle>
        <p className="mt-1 text-[16px] text-text">{hidden ? "Ты ещё не встречался. Это временно." : e.truth}</p>
        <p className="mt-2 text-[14px] text-sub">{hidden ? "Досье открывается после первого поражения. Обычно твоего." : e.hit}</p>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Встреч" value={s.enemyMet[e.id] ?? 0} />
        <Stat label="Побед" value={s.enemyBeaten[e.id] ?? 0} tone="text-good" />
        <Stat label="Стадия" value={`${st}/3`} />
      </div>

      <Card acid>
        <SectionTitle>Контр-карты</SectionTitle>
        <p className="font-display text-[20px] font-bold uppercase text-acid">{st >= 2 ? e.counter : "???"}</p>
        {st >= 2 && <p className="mt-1 text-[13px] text-sub">Слабость: {e.weakness}</p>}
        <Button className="mt-3 w-full" onClick={onGoArena}><IconSwords size={20} /> Найти в Арене</Button>
      </Card>
    </div>
  );
}
