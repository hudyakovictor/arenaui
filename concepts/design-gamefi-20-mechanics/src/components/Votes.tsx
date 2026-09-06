"use client";

import { useState } from "react";
import { mechanics } from "@/lib/content";

export default function Votes({ initial }: { initial: Record<string, number> }) {
  const [tally, setTally] = useState(initial);
  const [voted, setVoted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const total = Object.values(tally).reduce((a, b) => a + b, 0) || 1;
  const max = Math.max(1, ...Object.values(tally));

  async function vote(id: string) {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mechanicId: id }),
      });
      if (r.ok) {
        setTally(await r.json());
        setVoted(id);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {mechanics.map((m) => {
        const n = tally[m.id] ?? 0;
        return (
          <button
            key={m.id}
            disabled={busy}
            onClick={() => vote(m.id)}
            className={`group flex w-full items-center gap-4 rounded-xl border bg-surface p-3 text-left transition hover:bg-hover ${voted === m.id ? "border-primary" : "border-border"}`}
          >
            <span className="w-8 font-mono text-[11px] text-muted">{m.num}</span>
            <span className="w-44 shrink-0 font-mono text-[12px] font-bold" style={{ color: m.color }}>{m.name}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-inset">
              <i className="block h-full rounded-full transition-all" style={{ width: `${(n / max) * 100}%`, background: m.color }} />
            </span>
            <span className="w-20 text-right font-mono text-[11px] text-sub">
              {n} · {Math.round((n / total) * 100)}%
            </span>
          </button>
        );
      })}
      <p className="font-mono text-[10px] text-muted">
        {voted ? "ГОЛОС УЧТЁН. Комитет по перераспределению приоритетов благодарит за ликвидность." : "Нажми на механику, чтобы проголосовать. Голосование ничего не обещает. Как и рынок."}
      </p>
    </div>
  );
}
