"use client";

import { useMemo, useState } from "react";
import type { AuditFinding } from "@/db/schema";
import { RESOLUTION_META, SeverityBadge, StatusBadge, scoreColor } from "./ui";

const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_ORDER: Record<string, number> = { fail: 0, warn: 1, manual: 2, pass: 3 };

type StatusFilter = "all" | "fail" | "warn" | "manual" | "pass";

export function FindingsBoard({ initial, categories }: { initial: AuditFinding[]; categories: string[] }) {
  const [findings, setFindings] = useState(initial);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [hideResolved, setHideResolved] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"priority" | "code">("priority");
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = findings.filter((f) => {
      if (status !== "all" && f.status !== status) return false;
      if (category !== "all" && f.category !== category) return false;
      if (severity !== "all" && f.severity !== severity) return false;
      if (hideResolved && (f.resolution === "fixed" || f.resolution === "accepted")) return false;
      if (needle && !`${f.code} ${f.title} ${f.detail} ${f.recommendation}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    if (sort === "code") return list.sort((a, b) => a.code.localeCompare(b.code));
    return list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || a.code.localeCompare(b.code));
  }, [findings, status, category, severity, hideResolved, q, sort]);

  async function updateResolution(id: number, resolution: string) {
    setSaving(id);
    const prev = findings;
    setFindings((fs) => fs.map((f) => (f.id === id ? { ...f, resolution } : f)));
    try {
      const res = await fetch(`/api/audit/findings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resolution }) });
      if (!res.ok) throw new Error();
    } catch {
      setFindings(prev);
    } finally {
      setSaving(null);
    }
  }

  async function saveNote(id: number, note: string) {
    setFindings((fs) => fs.map((f) => (f.id === id ? { ...f, note } : f)));
    await fetch(`/api/audit/findings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) }).catch(() => undefined);
  }

  function toggle(id: number) {
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const counts = {
    all: findings.length,
    fail: findings.filter((f) => f.status === "fail").length,
    warn: findings.filter((f) => f.status === "warn").length,
    manual: findings.filter((f) => f.status === "manual").length,
    pass: findings.filter((f) => f.status === "pass").length,
  };

  return (
    <section className="glass rounded-3xl p-6" aria-labelledby="findings-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="findings-heading" className="text-lg font-bold">
          Находки <span className="font-mono text-sm text-muted">({filtered.length} из {findings.length})</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setOpen(new Set(filtered.map((f) => f.id)))} className="rounded-lg px-3 py-1.5 text-xs text-muted ring-1 ring-line transition hover:text-text">
            Раскрыть все
          </button>
          <button type="button" onClick={() => setOpen(new Set())} className="rounded-lg px-3 py-1.5 text-xs text-muted ring-1 ring-line transition hover:text-text">
            Свернуть
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Фильтр по статусу">
        {(["all", "fail", "warn", "manual", "pass"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={status === s}
            onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider ring-1 transition ${
              status === s ? "bg-primary/20 text-[#c4b5ff] ring-primary/60" : "text-muted ring-line hover:text-text"
            }`}
          >
            {s === "all" ? "Все" : s} <span className="opacity-60">{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 grid gap-2 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по коду, названию, рекомендации…"
          aria-label="Поиск по находкам"
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted/60 focus:border-primary"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Категория" className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">
          <option value="all">Все домены</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} aria-label="Severity" className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">
          <option value="all">Любой severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as "priority" | "code")} aria-label="Сортировка" className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">
          <option value="priority">По приоритету</option>
          <option value="code">По коду</option>
        </select>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-muted">
          <input type="checkbox" checked={hideResolved} onChange={(e) => setHideResolved(e.target.checked)} className="accent-[#7c5cff]" />
          Скрыть закрытые
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-2xl">🛰️</p>
          <p className="mt-2 font-semibold">Ничего не найдено</p>
          <p className="text-sm text-muted">Сбросьте фильтры или измените запрос.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((f) => {
            const isOpen = open.has(f.id);
            const res = RESOLUTION_META[f.resolution] ?? RESOLUTION_META.open;
            return (
              <li key={f.id} className={`rounded-2xl border border-line bg-surface/60 transition ${isOpen ? "ring-1 ring-primary/40" : "hover:border-line/80 hover:bg-surface-2/60"}`}>
                <button type="button" onClick={() => toggle(f.id)} aria-expanded={isOpen} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <span className="w-1.5 self-stretch rounded-full" style={{ background: scoreColor(f.score) }} aria-hidden="true" />
                  <span className="font-mono text-xs text-muted">{f.code}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{f.title}</span>
                    <span className="block truncate text-xs text-muted">{f.category}</span>
                  </span>
                  <span className={`hidden font-mono text-[11px] sm:inline ${res.cls}`}>{res.label}</span>
                  <SeverityBadge severity={f.severity} />
                  <StatusBadge status={f.status} />
                  <span className="w-10 text-right font-mono text-sm font-bold" style={{ color: scoreColor(f.score) }}>
                    {f.score}
                  </span>
                  <span className={`text-muted transition ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <div className="rise border-t border-line/60 px-5 pb-5 pt-4">
                    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-muted">Что проверяем</p>
                          <p className="mt-1 text-sm text-muted">{f.description}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-muted">Результат</p>
                          <p className="mt-1 text-sm">{f.detail}</p>
                        </div>
                        <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                          <p className="text-[11px] uppercase tracking-wider text-[#c4b5ff]">Рекомендация</p>
                          <p className="mt-1 text-sm">{f.recommendation}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] uppercase tracking-wider text-muted">Статус:</span>
                          {Object.entries(RESOLUTION_META).map(([key, m]) => (
                            <button
                              key={key}
                              type="button"
                              disabled={saving === f.id}
                              onClick={() => updateResolution(f.id, key)}
                              aria-pressed={f.resolution === key}
                              className={`rounded-lg px-2.5 py-1 text-xs ring-1 transition ${
                                f.resolution === key ? `bg-surface-2 ring-primary/60 ${m.cls}` : "text-muted ring-line hover:text-text"
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                        <textarea
                          defaultValue={f.note}
                          onBlur={(e) => e.target.value !== f.note && saveNote(f.id, e.target.value)}
                          placeholder="Заметка команды (сохраняется при потере фокуса)…"
                          rows={2}
                          aria-label={`Заметка к ${f.code}`}
                          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs placeholder:text-muted/60 focus:border-primary"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted">Evidence ({f.evidence.length})</p>
                        {f.evidence.length === 0 ? (
                          <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-center text-xs text-muted">Совпадений в коде нет — это и есть находка.</p>
                        ) : (
                          <ul className="mt-2 max-h-72 space-y-1 overflow-auto">
                            {f.evidence.map((e, i) => (
                              <li key={i} className="rounded-lg bg-bg/70 px-3 py-2 font-mono text-[11px]">
                                <span className="text-cyan">{e.path}</span>
                                <span className="text-muted">:{e.line}</span>
                                <span className="mt-0.5 block truncate text-muted/90">{e.text}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
