import { useEffect, useState } from "react";
import { Trophy, Users, Timer, ArrowUp, ArrowDown, Minus, Check } from "lucide-react";
import { Button, Headline, Progress, Tag } from "../components/ui";
import { leaders, tournaments } from "../data/game";
import { useGame } from "../store";
import { cn } from "../utils/cn";

function useCountdown(start: number) {
  const [s, setS] = useState(start);
  useEffect(() => {
    const iv = setInterval(() => setS((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, []);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function Tournaments() {
  const g = useGame();
  const [joined, setJoined] = useState<Set<string>>(new Set(tournaments.filter((t) => t.joined).map((t) => t.id)));
  const [view, setView] = useState<"season" | "week">("season");
  const cd = useCountdown(5 * 3600 + 12 * 60 + 40);

  const join = (id: string, entry: string) => {
    if (joined.has(id)) return;
    if (entry.includes("монет")) {
      const price = parseInt(entry);
      if (!g.spend(price)) {
        g.toast("Недостаточно капитала. Паника бесплатна. Вход — нет.", "bad");
        return;
      }
    }
    setJoined((p) => new Set([...p, id]));
    g.toast("Ты в списке. Список — в архиве катастроф.", "gold");
  };

  return (
    <div className="space-y-4 pb-6">
      <Headline kicker="Турниры · Сезон 01" title="Рейтинг — единственное, что не откатывается." sub="Proof of Skill: побеждает не тот, кто угадал, а тот, кто повторил." />

      {/* season banner */}
      <div className="card noise relative overflow-hidden p-4">
        <div className="absolute -right-6 -top-6 text-[120px] opacity-10">⛈️</div>
        <div className="flex items-center gap-2">
          <Tag className="bg-bad text-white">Сезон шторма</Tag>
          <span className="flex items-center gap-1 text-[11px] text-sub">
            <Timer size={12} /> до конца сезона 19д
          </span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="card-inset px-3 py-2">
            <div className="font-display text-[10px] uppercase tracking-widest text-muted">Твой ранг</div>
            <div className="font-display text-2xl font-bold text-acid">#2</div>
          </div>
          <div className="card-inset px-3 py-2">
            <div className="font-display text-[10px] uppercase tracking-widest text-muted">Очки</div>
            <div className="font-display text-2xl font-bold">2450</div>
          </div>
          <div className="card-inset px-3 py-2">
            <div className="font-display text-[10px] uppercase tracking-widest text-muted">Винрейт</div>
            <div className="font-display text-2xl font-bold">{Math.round((g.wins / Math.max(1, g.fights)) * 100)}%</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-sub">
            <span>До #1: 230 очков</span>
            <span>Лига: Золото</span>
          </div>
          <Progress value={91} className="mt-1.5" color="bg-gold" />
        </div>
      </div>

      {/* tournaments */}
      <div className="space-y-2">
        <div className="font-display text-[11px] uppercase tracking-[0.16em] text-muted">Активные события</div>
        {tournaments.map((t, i) => {
          const on = joined.has(t.id);
          return (
            <div key={t.id} style={{ animationDelay: `${i * 50}ms` }} className={cn("card animate-fade-up p-3", on && "border-acid/40")}>
              <div className="flex items-start gap-3">
                <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", t.color)}>
                  <Trophy size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Tag className={t.color}>{t.kind}</Tag>
                    <span className="flex items-center gap-1 text-[11px] text-sub">
                      <Timer size={11} /> {t.id === "daily" ? cd : t.endsIn}
                    </span>
                  </div>
                  <div className="stencil mt-1 text-[16px] leading-tight">{t.title}</div>
                  <p className="text-[12px] text-sub">{t.desc}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {t.players.toLocaleString("ru-RU")}
                    </span>
                    <span>
                      Приз: <span className="text-gold">{t.prize}</span>
                    </span>
                    <span>
                      Вход: <span className="text-text">{t.entry}</span>
                    </span>
                  </div>
                </div>
              </div>
              <Button size="sm" full className="mt-3" variant={on ? "ghost" : "acid"} disabled={on} onClick={() => join(t.id, t.entry)}>
                {on ? (
                  <>
                    <Check size={14} /> Участвуешь
                  </>
                ) : (
                  "Участвовать"
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* leaderboard */}
      <div className="card p-3">
        <div className="flex items-center justify-between">
          <div className="font-display text-[11px] uppercase tracking-[0.16em] text-muted">Таблица лидеров</div>
          <div className="flex gap-1">
            {(["season", "week"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cn("press rounded-lg px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wider", view === v ? "bg-acid text-ink" : "bg-elevated text-sub")}>
                {v === "season" ? "Сезон" : "Неделя"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 space-y-1.5">
          {leaders.map((l, i) => (
            <div
              key={l.name}
              style={{ animationDelay: `${i * 40}ms` }}
              className={cn("card-inset flex animate-fade-up items-center gap-3 px-3 py-2", l.you && "acid-ring bg-acid/5")}
            >
              <div className={cn("w-6 text-center font-display text-sm font-bold", l.rank === 1 ? "text-gold" : l.rank === 2 ? "text-sub" : l.rank === 3 ? "text-orange" : "text-muted")}>{l.rank}</div>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-elevated text-lg">{l.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-[13px] font-semibold">
                  {l.name} {l.you && <span className="text-acid">· ты</span>}
                </div>
                <div className="text-[10px] text-muted">{view === "season" ? "Сезон 01" : "Эта неделя"}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-sm font-bold">{(view === "season" ? l.score : Math.round(l.score * 0.31)).toLocaleString("ru-RU")}</div>
                <div className={cn("flex items-center justify-end gap-0.5 text-[10px]", l.trend === "up" ? "text-good" : l.trend === "down" ? "text-bad" : "text-muted")}>
                  {l.trend === "up" ? <ArrowUp size={10} /> : l.trend === "down" ? <ArrowDown size={10} /> : <Minus size={10} />}
                  {l.trend === "up" ? "+2" : l.trend === "down" ? "-1" : "0"}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-muted">Рейтинг обновляется каждый бой. Самооценка — реже.</p>
      </div>
    </div>
  );
}
