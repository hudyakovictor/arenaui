import { useState } from "react";
import { Coins, Check, Sparkles } from "lucide-react";
import { Button, Headline, Tag } from "../components/ui";
import { shopItems, type ShopItem } from "../data/game";
import { useGame } from "../store";
import { cn } from "../utils/cn";

const rarityStyle: Record<ShopItem["rarity"], string> = {
  common: "border-line",
  rare: "border-sky/50",
  epic: "border-violet/60 shadow-[0_0_18px_rgba(168,85,247,0.25)]",
};
const rarityTag: Record<ShopItem["rarity"], string> = {
  common: "bg-elevated text-sub",
  rare: "bg-sky text-ink",
  epic: "bg-violet text-white",
};

export default function Market() {
  const g = useGame();
  const [kind, setKind] = useState<"all" | ShopItem["kind"]>("all");
  const [flash, setFlash] = useState<string | null>(null);

  const list = shopItems.filter((i) => kind === "all" || i.kind === kind);

  const buy = (it: ShopItem) => {
    if (g.owned.has(it.id)) return;
    if (!g.spend(it.price)) {
      g.toast("Недостаточно капитала. Паника бесплатна. Вход — нет.", "bad");
      return;
    }
    g.own(it.id);
    setFlash(it.id);
    setTimeout(() => setFlash(null), 600);
    g.toast(`Куплено: ${it.name}. Не финсовет.`, "gold");
  };

  return (
    <div className="space-y-4 pb-6">
      <Headline kicker="Магазин" title="Здесь деньги исчезают медленнее, чем на рынке." sub="Карты, усилители и косметика. Всё честно: цена написана заранее." />

      <div className="card flex items-center justify-between p-3">
        <div>
          <div className="font-display text-[11px] uppercase tracking-[0.16em] text-muted">Баланс</div>
          <div className="flex items-center gap-1.5 font-display text-2xl font-bold text-gold">
            <Coins size={20} /> {g.coins}
          </div>
        </div>
        <div className="text-right text-[11px] text-sub">
          Монеты — за бои и уроки.
          <br />
          <span className="text-muted">Купить нельзя. Пока.</span>
        </div>
      </div>

      <div className="flex gap-1.5">
        {(["all", "card", "boost", "cosmetic"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={cn("press rounded-xl px-3 py-2 font-display text-[11px] font-bold uppercase tracking-wider transition-all", kind === k ? "bg-acid text-ink" : "bg-elevated text-sub")}>
            {k === "all" ? "Всё" : k === "card" ? "Карты" : k === "boost" ? "Усилители" : "Косметика"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {list.map((it, i) => {
          const owned = g.owned.has(it.id);
          return (
            <div key={it.id} style={{ animationDelay: `${i * 40}ms` }} className={cn("card relative flex animate-fade-up flex-col overflow-hidden border p-0", rarityStyle[it.rarity], flash === it.id && "animate-pop acid-ring")}>
              <div className="relative grid h-24 place-items-center bg-gradient-to-b from-ink/40 to-transparent text-5xl">
                <span className="animate-float">{it.emoji}</span>
                <div className="absolute left-2 top-2">
                  <Tag className={rarityTag[it.rarity]}>{it.rarity === "common" ? "обычная" : it.rarity === "rare" ? "редкая" : "эпик"}</Tag>
                </div>
                {it.rarity === "epic" && <Sparkles size={14} className="absolute right-2 top-2 text-violet" />}
              </div>
              <div className="flex flex-1 flex-col border-t border-line p-3">
                <div className="stencil text-[14px] leading-tight">{it.name}</div>
                <p className="mt-1 flex-1 text-[11px] leading-snug text-sub">{it.desc}</p>
                <Button size="sm" full className="mt-3" variant={owned ? "ghost" : "acid"} disabled={owned} onClick={() => buy(it)}>
                  {owned ? (
                    <>
                      <Check size={14} /> В коллекции
                    </>
                  ) : (
                    <>
                      <Coins size={14} /> {it.price}
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-muted">Налог на надежду не взимается. Он уже включён в цену.</p>
    </div>
  );
}
