import { levelFromXp, rankTitle, useStore } from "../store";
import { IconCoin, IconFlame, IconBolt } from "./icons";
import { Avatar, Bar } from "./ui";

export function TopBar({ onProfile }: { onProfile: () => void }) {
  const { s } = useStore();
  const L = levelFromXp(s.xp);
  return (
    <div className="sticky top-0 z-30 border-b border-line bg-bg/90 px-3 pb-2 pt-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button onClick={onProfile} className="press flex items-center gap-2">
          <div className="relative">
            <Avatar emoji="🫵" size={42} ring="border-acid" />
            <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-acid px-1 font-display text-[11px] font-bold text-ink">{L.lvl}</span>
          </div>
          <div className="text-left">
            <p className="font-display text-[14px] font-bold uppercase leading-none text-text">{rankTitle(L.lvl)}</p>
            <p className="mt-0.5 text-[11px] text-muted">{s.xp} / {L.next} XP</p>
          </div>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex h-8 items-center gap-1 rounded-full border border-line-strong bg-surface px-2.5 font-display text-[13px] font-bold text-orange">
            <IconFlame size={15} /> {s.streak}
          </span>
          <span className="flex h-8 items-center gap-1 rounded-full border border-line-strong bg-surface px-2.5 font-display text-[13px] font-bold text-gold">
            <IconCoin size={15} /> {s.coins}
          </span>
          {s.combo > 1 && (
            <span className="pop flex h-8 items-center gap-1 rounded-full border border-acid bg-acid/10 px-2.5 font-display text-[13px] font-bold text-acid">
              <IconBolt size={14} /> x{s.combo}
            </span>
          )}
        </div>
      </div>
      <Bar pct={L.pct} className="mt-2 h-1.5" />
    </div>
  );
}
