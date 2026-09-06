"use client";

import { useCallback, useEffect, useState } from "react";
import type { Run } from "@/db/schema";
import { cults } from "@/lib/content";
import Playable from "./Playable";

export default function Leaderboard({ initial }: { initial: Run[] }) {
  const [rows, setRows] = useState<Run[]>(initial);

  const refresh = useCallback(async () => {
    const r = await fetch("/api/runs", { cache: "no-store" });
    if (r.ok) setRows(await r.json());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="grid gap-10 lg:grid-cols-[390px_1fr] lg:items-start">
      <Playable onSaved={refresh} />
      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-[0.12em] text-primary">АРХИВ ПРИЗРАКОВ · LIVE ИЗ БД</div>
            <h3 className="text-xl font-bold">Кто выжил в этом городе</h3>
          </div>
          <span className="font-mono text-[10px] text-muted">{rows.length} записей</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="grid grid-cols-[32px_1fr_120px_70px_70px_90px] gap-2 border-b border-border bg-elevated px-3 py-2 font-mono text-[9px] tracking-wider text-muted">
            <span>#</span><span>ПОЗЫВНОЙ</span><span>КУЛЬТ</span><span className="text-right">КАПИТАЛ</span><span className="text-right">ХЛАДН.</span><span className="text-right">ИСХОД</span>
          </div>
          {rows.length === 0 && (
            <div className="px-3 py-8 text-center font-mono text-[11px] text-muted">Архив пуст. Город ждёт первую жертву.</div>
          )}
          {rows.map((r, i) => {
            const c = cults.find((x) => x.id === r.cult);
            return (
              <div key={r.id} className="grid grid-cols-[32px_1fr_120px_70px_70px_90px] items-center gap-2 border-b border-border/60 px-3 py-2 last:border-b-0">
                <span className="font-mono text-[10px] text-muted">{i + 1}</span>
                <span className="truncate text-[13px] font-bold">{r.nickname}</span>
                <span className="truncate font-mono text-[10px]" style={{ color: c?.color ?? "var(--color-sub)" }}>{c ? `${c.sigil} ${c.name}` : r.cult}</span>
                <span className={`text-right font-mono text-[12px] font-bold ${r.capital >= 100 ? "text-good" : "text-bad"}`}>{(r.capital / 100).toFixed(2)}×</span>
                <span className="text-right font-mono text-[11px] text-sub">{r.composure}</span>
                <span className={`text-right font-mono text-[9px] ${r.outcome === "exit" ? "text-good" : "text-bad"}`}>{r.outcome === "exit" ? "ВЫШЕЛ" : "ЛИКВИДИРОВАН"}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["ЧТО ПРОВЕРЯЕТ ПРОТОТИП", "Держит ли серия решений с ресурсом лучше одиночного вопроса. Гипотеза: да, потому что цена ошибки переносится на следующий узел."],
            ["ЧТО ЗАПИСЫВАЕТСЯ", "Исход, капитал, хладнокровие, культ и дельта пяти черт Призрака — это и есть обучающий сигнал для AI-двойника."],
            ["ЧЕГО ЗДЕСЬ НЕТ", "ИИ-генерации рынка, лиги призраков, войны культов — они в рендерах выше. Здесь — только ядро цикла."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-border bg-surface p-3">
              <div className="font-mono text-[9px] tracking-wider text-primary">{t}</div>
              <p className="mt-1 text-[12px] leading-snug text-sub">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
