import { useState } from "react";
import { Button, Card, Chip, SectionTitle } from "../components/ui";
import { IconCheck, IconCoin, IconCrown, IconLock } from "../components/icons";
import { passTrack, shopPacks } from "../data/game";
import { useStore } from "../store";
import { cn } from "../utils/cn";

const tabs = ["Магазин", "Пасс", "Подписка", "Паки"] as const;

export function Market({ toast }: { toast: (m: string) => void }) {
  const { s, d } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Магазин");

  const buy = (id: string, price: number, title: string) => {
    if (s.owned.includes(id)) return toast("Уже куплено. Дважды не помогает.");
    if (s.coins < price) return toast("Недостаточно капитала. Паника бесплатна. Вход — нет.");
    d({ type: "BUY", id, price });
    toast(`«${title}» — твоё. Разочарование — бесплатно.`);
  };

  return (
    <div className="fade-up space-y-4 px-3 pb-28 pt-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="stencil drip drip-right drip-dark relative inline-block text-[34px] leading-none text-text">Маркет</h1>
          <p className="mt-3 text-[15px] text-sub">Департамент сбора денег</p>
        </div>
        <span className="flex h-9 items-center gap-1.5 rounded-full border border-gold/60 bg-surface px-3 font-display text-[15px] font-bold text-gold"><IconCoin size={16} /> {s.coins} SIG</span>
      </div>

      <div className="hide-scroll flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => <Chip key={t} active={tab === t} onClick={() => setTab(t)} className="shrink-0">{t}</Chip>)}
      </div>

      {(tab === "Магазин" || tab === "Пасс") && (
        <Card gold className="overflow-hidden bg-gradient-to-br from-[#2a2618]/90 to-surface">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
          <h2 className="stencil drip drip-right drip-gold relative inline-block text-[22px] leading-none text-text">Сигнал-пасс · Сезон 1</h2>
          <div className="relative mt-6 flex items-start justify-between">
            <div className="absolute left-6 right-6 top-6 h-1 bg-line-strong">
              <div className="h-full bg-gold transition-[width] duration-700" style={{ width: `${Math.min(100, (s.passLevel / 30) * 100)}%` }} />
            </div>
            {passTrack.map((p) => {
              const reached = s.passLevel >= p.n;
              return (
                <div key={p.n} className="relative flex w-12 flex-col items-center">
                  {p.premium && <IconCrown size={16} className="absolute -top-4 text-gold" />}
                  <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl border-2 text-[22px]", reached ? "border-gold bg-gold/15" : "border-line-strong bg-ink", !reached && "grayscale opacity-60")}>{p.icon}</span>
                  <span className={cn("mt-1 font-display text-[12px] font-bold", p.premium ? "text-gold" : "text-sub")}>{p.n}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="font-display text-[20px] font-bold text-text"><span className="text-acid">{s.passLevel}</span> <span className="text-sub">/ 30</span></p>
            <Button variant="gold" size="sm" onClick={() => toast("Премиум-дорожка: подключим после бэкенда. Кит уже в курсе.")}><IconCrown size={16} /> Премиум · 990</Button>
          </div>
          <p className="mt-2 text-[11px] text-muted">Уровень растёт за победы. Поражения тоже считаются. Как опыт.</p>
        </Card>
      )}

      {(tab === "Магазин" || tab === "Подписка") && (
        <Card cyan className="overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan/15 blur-2xl" />
          <div className="flex items-start justify-between">
            <h2 className="stencil relative inline-block text-[22px] leading-none text-text">PRO Сигнал</h2>
            <span className="tape">−30% сезон</span>
          </div>
          <ul className="mt-3 space-y-2 text-[15px] text-text">
            {["Без рекламы", "×2 XP за каждый бой", "Ранний доступ к новым ошибкам", "Свиток ошибок без лимита"].map((x) => (
              <li key={x} className="flex items-center gap-2"><IconCheck size={18} className="text-good" /> {x}</li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => toast("Месяц: 490 SIG. Подключим оплату позже.")}>490 / мес</Button>
            <Button onClick={() => toast("Сезон: 2 990 SIG. Навык всё равно не продаётся.")}>2 990 / сезон</Button>
          </div>
          <p className="mt-2 text-center text-[12px] text-muted">Навык не продаётся. Мы проверяли.</p>
        </Card>
      )}

      {(tab === "Магазин" || tab === "Паки") && (
        <div>
          <SectionTitle className="mb-2">Паки и косметика</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {shopPacks.map((p) => {
              const owned = s.owned.includes(p.id);
              return (
                <Card key={p.id} className="flex min-h-[220px] flex-col p-3">
                  <h3 className="stencil text-[17px] leading-tight text-text">{p.title}</h3>
                  <div className="relative mt-2 flex flex-1 items-center justify-center rounded-xl bg-ink/60">
                    <span className={cn("text-[52px]", owned ? "" : "float-y")}>{p.emoji}</span>
                    {p.old && <span className="tape tape-bad absolute bottom-1 right-1 !text-[13px] !px-2">−{Math.round((1 - p.price / p.old) * 100)}%</span>}
                    {owned && <span className="stamp tape tape-acid absolute !text-[12px]">Куплено</span>}
                  </div>
                  <ul className="mt-2 space-y-0.5 text-[11px] text-sub">
                    {p.items.map((x) => <li key={x}>· {x}</li>)}
                  </ul>
                  <Button size="sm" variant={owned ? "ghost" : "primary"} className="mt-2 w-full" disabled={owned} onClick={() => buy(p.id, p.price, p.title)}>
                    {owned ? <IconLock size={14} /> : <IconCoin size={14} />} {owned ? "Есть" : <>{p.price}{p.old && <s className="ml-1 text-[11px] opacity-60">{p.old}</s>}</>}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <p className="pb-2 text-center text-[12px] text-muted">Все покупки косметические. Разочарование — бесплатно.</p>
    </div>
  );
}
