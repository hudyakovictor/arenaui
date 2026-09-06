import { useState } from "react";
import { Avatar, Bar, Button, Card, Chip, SectionTitle, Stat } from "../components/ui";
import { IconScroll, IconSettings } from "../components/icons";
import { enemies, skillCards } from "../data/game";
import { levelFromXp, rankTitle, useStore } from "../store";
import { cn } from "../utils/cn";

export function Profile({ onClose }: { onClose: () => void }) {
  const { s, d } = useStore();
  const L = levelFromXp(s.xp);
  const [tab, setTab] = useState<"stats" | "scroll" | "cards">("stats");
  const wr = s.battles ? Math.round((s.wins / s.battles) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar emoji="🫵" size={64} ring="border-acid" />
        <div className="flex-1">
          <p className="stencil text-[22px] leading-none text-text">{rankTitle(L.lvl)}</p>
          <p className="text-[12px] text-muted">Уровень {L.lvl} · {s.xp} XP · до следующего {L.next - s.xp}</p>
          <Bar pct={L.pct} className="mt-2" />
        </div>
      </div>

      <div className="flex gap-2">
        {([["stats", "Статистика"], ["scroll", "Свиток ошибок"], ["cards", "Карты"]] as const).map(([id, l]) => (
          <Chip key={id} active={tab === id} onClick={() => setTab(id)} className="px-3 text-[12px]">{l}</Chip>
        ))}
      </div>

      {tab === "stats" && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Боёв" value={s.battles} />
            <Stat label="Win rate" value={`${wr}%`} tone={wr >= 60 ? "text-good" : wr >= 40 ? "text-warn" : "text-bad"} />
            <Stat label="Лучшее комбо" value={`x${s.bestCombo}`} tone="text-acid" />
            <Stat label="Демо-депозит" value={`$${s.capital.toLocaleString("ru")}`} />
            <Stat label="Серия дней" value={s.streak} tone="text-orange" />
            <Stat label="Врагов раскрыто" value={enemies.filter((e) => (s.enemyStage[e.id] ?? 0) >= 2).length} />
          </div>
          <Card className="border-line-strong">
            <SectionTitle>Индекс веры в график</SectionTitle>
            <div className="mt-2 flex items-end gap-2">
              <span className="stencil text-[36px] leading-none text-acid">{Math.min(99, 40 + wr / 2 + s.bestCombo * 3).toFixed(0)}</span>
              <span className="mb-1 text-[12px] text-sub">/ 100. Растёт от побед. Падает от веры.</span>
            </div>
          </Card>
          <Button variant="ghost" className="w-full" onClick={() => { if (confirm("Сбросить прогресс? Рынок уже это сделал бы за тебя.")) { d({ type: "RESET" }); onClose(); } }}>
            <IconSettings size={16} /> Сбросить прогресс
          </Button>
        </>
      )}

      {tab === "scroll" && (
        <div className="space-y-2">
          {s.mistakes.length === 0 ? (
            <Card className="flex flex-col items-center py-8 text-center">
              <IconScroll size={28} className="text-muted" />
              <p className="stencil mt-2 text-[18px] text-text">Свиток пуст</p>
              <p className="mt-1 text-[13px] text-sub">Либо ты не торговал, либо тебе повезло. Оба варианта временные.</p>
            </Card>
          ) : s.mistakes.map((m) => {
            const en = enemies.find((e) => e.id === m.enemyId)!;
            return (
              <Card key={m.id} className="flex gap-3 p-3 border-warn/40">
                <span className="text-[28px]">{en.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[13px] font-bold uppercase text-warn">{en.name} · бой {m.levelId}</p>
                  <p className="mt-0.5 text-[13px] text-text">{m.text}</p>
                  <p className="mt-1 text-[12px] text-sub">Урок: {m.lesson}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "cards" && (
        <div className="grid grid-cols-4 gap-2">
          {skillCards.map((c) => {
            const has = s.cardsUnlocked.includes(c.id);
            const rank = s.cardRank[c.id] ?? 0;
            return (
              <div key={c.id} className={cn("relative flex aspect-[3/4.2] flex-col items-center justify-between rounded-xl border-2 bg-gradient-to-b from-elevated to-surface p-2 text-center", has ? "border-line-strong" : "border-line opacity-50")}>
                <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink font-display text-[10px] font-bold text-acid">{rank}</span>
                <span className="mt-4 text-[28px]">{has ? c.emoji : "🔒"}</span>
                <p className="font-display text-[10px] font-bold uppercase leading-tight text-text">{c.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
