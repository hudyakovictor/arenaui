import type { Tab } from "../store";
import { cn } from "../utils/cn";
import { IconBook, IconShop, IconSkull, IconSwords, IconTrophy } from "./icons";

const items: { id: Tab; label: string; Icon: typeof IconSwords }[] = [
  { id: "academy", label: "Академия", Icon: IconBook },
  { id: "bestiary", label: "Бестиарий", Icon: IconSkull },
  { id: "arena", label: "Арена", Icon: IconSwords },
  { id: "market", label: "Маркет", Icon: IconShop },
  { id: "tournaments", label: "Турниры", Icon: IconTrophy },
];

export function BottomNav({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 border-t border-line bg-ink/95 pb-[max(env(safe-area-inset-bottom),8px)] pt-1 backdrop-blur">
      <div className="grid grid-cols-5">
        {items.map(({ id, label, Icon }) => {
          const on = tab === id;
          const center = id === "arena";
          return (
            <button key={id} onClick={() => onTab(id)} className="press relative flex flex-col items-center justify-center gap-0.5 py-1.5">
              {center ? (
                <span className={cn("-mt-6 flex h-14 w-14 items-center justify-center rounded-full border-4 border-ink transition-all", on ? "bg-acid text-ink shadow-[0_0_24px_rgba(200,255,0,0.5)]" : "bg-elevated text-sub")}>
                  <Icon size={26} />
                </span>
              ) : (
                <Icon size={22} className={cn("transition-colors", on ? "text-acid" : "text-muted")} />
              )}
              <span className={cn("font-display text-[10px] font-semibold uppercase tracking-wide", on ? "text-acid" : "text-muted")}>{label}</span>
              {on && !center && <span className="absolute -top-1 h-0.5 w-8 rounded-full bg-acid" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
