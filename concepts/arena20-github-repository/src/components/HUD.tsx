import { Swords, GraduationCap, Skull, ShoppingBag, Trophy, Flame, Coins, Zap } from "lucide-react";
import { useGame, xpForLevel, type Tab } from "../store";
import { tickerLines } from "../data/game";
import { Progress, useCountUp } from "./ui";
import { cn } from "../utils/cn";

export function TopBar() {
  const g = useGame();
  const need = xpForLevel(g.level);
  const coins = useCountUp(g.coins);
  const xp = useCountUp(g.xp);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[640px] items-center gap-3 px-4 py-2.5">
        {/* avatar / level */}
        <div className="relative shrink-0">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-line bg-elevated text-xl">🐕</div>
          <div className="absolute -bottom-1.5 -right-1.5 rounded-md bg-acid px-1.5 font-display text-[10px] font-bold text-ink shadow-[0_0_10px_rgba(200,255,0,0.5)]">
            {g.level}
          </div>
        </div>
        {/* xp */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="truncate font-display text-[13px] font-semibold uppercase tracking-wide">@trader_pro</div>
            <div className="font-display text-[11px] text-sub">
              <span className="text-acid">{xp}</span> / {need} XP
            </div>
          </div>
          <Progress value={(g.xp / need) * 100} className="mt-1 h-1.5" />
        </div>
        {/* streak / coins */}
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-xl border border-line bg-elevated px-2 py-1.5 font-display text-sm font-semibold">
            <Flame size={14} className="text-orange" /> {g.streak}
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-line bg-elevated px-2 py-1.5 font-display text-sm font-semibold text-gold">
            <Coins size={14} /> {coins}
          </div>
        </div>
      </div>
      {/* ticker */}
      <div className="border-t border-line/60 bg-bg">
        <div className="mx-auto flex max-w-[640px] items-center">
          <div className="flex shrink-0 items-center gap-1 bg-bad px-2 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-white">
            <Zap size={10} className="animate-pulse-live" /> Срочно
          </div>
          <div className="mask-fade-x flex-1 overflow-hidden">
            <div className="flex w-max animate-ticker whitespace-nowrap font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-sub">
              {[...tickerLines, ...tickerLines].map((t, i) => (
                <span key={i} className="px-5">
                  {t} <span className="text-acid">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const tabs: { id: Tab; label: string; Icon: typeof Swords }[] = [
  { id: "arena", label: "Арена", Icon: Swords },
  { id: "academy", label: "Академия", Icon: GraduationCap },
  { id: "bestiary", label: "Бестиарий", Icon: Skull },
  { id: "market", label: "Магазин", Icon: ShoppingBag },
  { id: "tournaments", label: "Турниры", Icon: Trophy },
];

export function BottomNav({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur-md">
      <div className="mx-auto grid max-w-[640px] grid-cols-5 px-2 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5">
        {tabs.map(({ id, label, Icon }) => {
          const on = tab === id;
          return (
            <button key={id} onClick={() => onTab(id)} className="press group relative flex flex-col items-center gap-0.5 rounded-xl py-1.5">
              {on && <span className="absolute -top-1.5 h-0.5 w-8 rounded-full bg-acid shadow-[0_0_8px_#c8ff00]" />}
              <span
                className={cn(
                  "grid h-8 w-10 place-items-center rounded-xl transition-all duration-200",
                  on ? "bg-acid/12 text-acid" : "text-muted group-hover:text-sub"
                )}
              >
                <Icon size={20} strokeWidth={on ? 2.4 : 2} />
              </span>
              <span className={cn("font-display text-[10px] font-semibold uppercase tracking-wider", on ? "text-acid" : "text-muted")}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
