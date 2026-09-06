"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STEPS = [
  "Сканирование файловой системы",
  "Индексация зависимостей",
  "Извлечение ТЗ",
  "Onboarding & Web3 Entry",
  "Transaction UX",
  "Game Feel",
  "Security & Backend",
  "Формирование отчёта",
];

export function NewRunForm({ defaultRoot }: { defaultRoot: string }) {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [rootPath, setRootPath] = useState(defaultRoot);
  const [specText, setSpecText] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 350);
    try {
      const res = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, rootPath, specText }),
      });
      const data = (await res.json()) as { ok: boolean; run?: { id: number }; error?: string };
      if (!data.ok || !data.run) throw new Error(data.error ?? "Не удалось запустить аудит");
      router.push(`/runs/${data.run.id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    } finally {
      clearInterval(timer);
    }
  }

  return (
    <form id="new-run" onSubmit={submit} className="glass rise rounded-2xl p-6" aria-busy={busy}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Новый аудит</h2>
          <p className="mt-1 text-sm text-muted">
            Укажите путь к проекту (фронтенд + бэкенд) и вставьте текст ТЗ. Движок прогонит все 50 анализов и сохранит отчёт.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-cyan/10 px-3 py-1 font-mono text-[11px] text-cyan ring-1 ring-cyan/30 sm:inline">
          50 / 50 checks
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted">Название проекта</span>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="например, Nebula Raiders"
            className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-text placeholder:text-muted/60 transition focus:border-primary"
            maxLength={120}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted">Путь к коду</span>
          <input
            value={rootPath}
            onChange={(e) => setRootPath(e.target.value)}
            required
            className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 font-mono text-sm text-text transition focus:border-primary"
          />
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted">Текст ТЗ (опционально — так же ищутся README/SPEC/GDD в проекте)</span>
          <textarea
            value={specText}
            onChange={(e) => setSpecText(e.target.value)}
            rows={6}
            placeholder="Вставьте ТЗ: цели, аудитория, экраны, Web3-контур, экономика, метрики, edge-cases…"
            className="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted/60 transition focus:border-primary"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-cyan px-6 py-3 text-sm font-bold text-bg transition hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
        >
          {busy && <span className="scan-line absolute inset-y-0 left-0 w-1/3 bg-white/30" aria-hidden="true" />}
          {busy ? "Анализирую…" : "Запустить 50 анализов"}
        </button>
        {busy && (
          <p className="font-mono text-xs text-cyan" aria-live="polite">
            [{String(step + 1).padStart(2, "0")}/{STEPS.length}] {STEPS[step]}
          </p>
        )}
      </div>
    </form>
  );
}
