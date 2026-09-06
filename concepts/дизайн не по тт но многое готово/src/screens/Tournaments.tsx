import { useEffect, useState } from "react";
import { Avatar, Button, Card, Chip, SectionTitle, Tag } from "../components/ui";
import { IconClock, IconCrown, IconFlame, IconSwords, IconTrophy, IconLock } from "../components/icons";
import { leaderboard } from "../data/game";
import { useStore } from "../store";
import { cn } from "../utils/cn";

function useCountdown(target: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), sec = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s: sec };
}

const END = (() => { const t = new Date(); t.setDate(t.getDate() + 2); t.setHours(21, 0, 0, 0); return t.getTime(); })();

export function Tournaments({ onGoArena }: { onGoArena: () => void }) {
  const { s } = useStore();
  const [scope, setScope] = useState<"week" | "season" | "friends">("week");
  const cd = useCountdown(END);

  const board = leaderboard.map((p) => (p.me ? { ...p, xp: s.xp, streak: s.streak, winrate: s.battles ? Math.round((s.wins / s.battles) * 100) : 0 } : p))
    .sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));
  const podium = [board[1], board[0], board[2]];
  const me = board.find((p) => p.me)!;

  return (
    <div className="fade-up space-y-4 px-3 pb-28 pt-4">
      <div>
        <h1 className="stencil drip drip-right drip-dark relative inline-block text-[34px] leading-none text-text">Турниры</h1>
        <p className="mt-3 text-[15px] text-sub">Служба по перераспределению чужих денег</p>
      </div>

      {/* Weekly event */}
      <Card acid className="overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-acid/15 blur-2xl" />
        <div className="flex items-start justify-between">
          <div>
            <SectionTitle className="text-acid">Недельный турнир</SectionTitle>
            <h2 className="stencil mt-1 text-[24px] leading-none text-text">Охота на Ложный Пробой</h2>
          </div>
          <IconTrophy size={28} className="text-gold" />
        </div>
        <p className="mt-2 text-[13px] text-sub">Больше всех XP против одного врага. Приз: рамка «Не ликвидность» и 2 000 SIG.</p>
        <div className="mt-3 flex items-center gap-3">
          <IconClock size={16} className="text-muted" />
          <div className="flex gap-1.5">
            {[[cd.d, "д"], [cd.h, "ч"], [cd.m, "м"], [cd.s, "с"]].map(([v, l]) => (
              <span key={l} className="flex items-baseline gap-0.5 rounded-lg bg-ink px-2 py-1 font-display"><span className="text-[18px] font-bold text-text tabular-nums">{String(v).padStart(2, "0")}</span><span className="text-[10px] uppercase text-muted">{l}</span></span>
            ))}
          </div>
        </div>
        <Button className="mt-4 w-full" onClick={onGoArena}><IconSwords size={18} /> Участвовать · бесплатно</Button>
      </Card>

      <div className="flex gap-2">
        {([["week", "Неделя"], ["season", "Сезон"], ["friends", "Друзья"]] as const).map(([id, l]) => (
          <Chip key={id} active={scope === id} onClick={() => setScope(id)}>{l}</Chip>
        ))}
      </div>

      {scope === "friends" ? (
        <Card className="flex flex-col items-center py-8 text-center">
          <IconLock size={28} className="text-muted" />
          <p className="stencil mt-2 text-[18px] text-text">Друзей пока нет</p>
          <p className="mt-1 text-[13px] text-sub">На рынке их и не бывает. Есть контрагенты.</p>
          <Button variant="ghost" size="sm" className="mt-3">Пригласить контрагента</Button>
        </Card>
      ) : (
        <>
          {/* Podium */}
          <div className="mt-2 grid grid-cols-3 items-end gap-1 px-2">
            {podium.map((p, i) => {
              const place = [2, 1, 3][i];
              const h = place === 1 ? 118 : place === 2 ? 88 : 72;
              const color = place === 1 ? "text-gold" : place === 2 ? "text-[#c9ced6]" : "text-orange";
              const ring = place === 1 ? "border-gold" : place === 2 ? "border-[#c9ced6]" : "border-orange";
              return (
                <div key={p.name} className="fade-up flex flex-col items-center" style={{ animationDelay: `${place * 80}ms` }}>
                  <Avatar emoji={p.emoji} size={place === 1 ? 64 : 56} ring={ring} className="mb-2 shadow-[0_0_14px_rgba(0,0,0,0.6)]" />
                  <p className="mb-1 max-w-full truncate font-display text-[12px] font-semibold uppercase text-sub">{p.name}</p>
                  <div style={{ height: h }} className={cn("flex w-full flex-col items-center justify-start rounded-t-lg border border-line-strong bg-gradient-to-b from-elevated to-surface pt-2", place === 1 && "from-hover")}>
                    {place === 1 && <IconCrown size={22} className="text-gold" />}
                    <span className={cn("stencil text-[36px] leading-none", color)}>{place}</span>
                    <span className="mt-1 font-display text-[11px] text-muted">{p.xp.toLocaleString("ru")} XP</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <Card className="p-0">
            <div className="grid grid-cols-[36px_1fr_64px_56px] items-center gap-2 border-b border-line px-3 py-2 font-display text-[10px] uppercase tracking-wider text-muted">
              <span>#</span><span>Игрок</span><span className="text-right">XP</span><span className="text-right">Win%</span>
            </div>
            {board.map((p) => (
              <div key={p.name} className={cn("grid grid-cols-[36px_1fr_64px_56px] items-center gap-2 border-b border-line/60 px-3 py-2.5 last:border-0", p.me && "bg-acid/10")}>
                <span className={cn("stencil text-[16px]", p.rank <= 3 ? "text-gold" : "text-sub")}>{p.rank}</span>
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar emoji={p.emoji} size={30} ring={p.me ? "border-acid" : undefined} />
                  <div className="min-w-0">
                    <p className={cn("truncate font-display text-[14px] font-semibold", p.me ? "text-acid" : "text-text")}>{p.name}</p>
                    <p className="flex items-center gap-1 text-[10px] text-muted"><IconFlame size={10} className="text-orange" /> {p.streak}</p>
                  </div>
                </div>
                <span className="text-right font-display text-[14px] font-bold text-text tabular-nums">{p.xp.toLocaleString("ru")}</span>
                <span className={cn("text-right font-display text-[13px] tabular-nums", p.winrate >= 60 ? "text-good" : p.winrate >= 50 ? "text-sub" : "text-bad")}>{p.winrate}%</span>
              </div>
            ))}
          </Card>

          <Card className="flex items-center gap-3 border-line-strong">
            <Avatar emoji="🫵" size={44} ring="border-acid" />
            <div className="flex-1">
              <p className="font-display text-[14px] font-bold uppercase text-text">Твоё место: #{me.rank}</p>
              <p className="text-[12px] text-sub">{me.rank > 3 ? `До подиума ${(board[2].xp - me.xp + 1).toLocaleString("ru")} XP. Стадо не ждёт.` : "Ты на подиуме. Рынок уже заметил."}</p>
            </div>
            <Tag color="bg-elevated text-sub">{scope === "week" ? "нед." : "сезон"}</Tag>
          </Card>
        </>
      )}
    </div>
  );
}
