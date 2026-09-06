import Link from "next/link";
import { db } from "@/db";
import { auditRuns } from "@/db/schema";
import { desc } from "drizzle-orm";
import { executeAudit } from "@/lib/audit/run";
import { CATEGORIES } from "@/lib/audit/catalog";
import { NewRunForm } from "@/components/audit/NewRunForm";
import { Bar, ScoreRing, scoreColor, scoreGrade } from "@/components/audit/ui";

export const dynamic = "force-dynamic";

async function getRuns() {
  let runs = await db.select().from(auditRuns).orderBy(desc(auditRuns.createdAt)).limit(30);
  if (runs.length === 0) {
    // Первый визит: автоматически прогоняем 50 анализов по текущему проекту.
    await executeAudit({ projectName: "Текущий проект (sandbox)", rootPath: process.cwd() });
    runs = await db.select().from(auditRuns).orderBy(desc(auditRuns.createdAt)).limit(30);
  }
  return runs;
}

export default async function HomePage() {
  const runs = await getRuns();
  const latest = runs[0];

  return (
    <div className="space-y-8">
      <section className="rise grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass relative overflow-hidden rounded-3xl p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan">Level 99 · Interactive UX Audit</p>
          <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
            50 анализов, которые находят <span className="neon-text">99% недоработок</span> Web3-игры
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Движок сканирует фронтенд, бэкенд и ТЗ по 10 доменам: вход через кошелёк, транзакционный UX, game feel, навигация,
            экономика, безопасность, производительность, доступность, данные и live-ops. Каждая находка — с evidence, severity и
            конкретной рекомендацией.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <span key={c} className="rounded-full border border-line bg-surface/60 px-3 py-1 text-xs text-muted">
                {c}
              </span>
            ))}
          </div>
        </div>

        {latest && (
          <Link href={`/runs/${latest.id}`} className="glass group flex flex-col justify-between rounded-3xl p-6 transition hover:border-primary/60">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted">Последний прогон</p>
                <h2 className="mt-1 text-lg font-bold">{latest.projectName}</h2>
                <p className="font-mono text-xs text-muted">{new Date(latest.createdAt).toLocaleString("ru-RU")}</p>
              </div>
              <ScoreRing score={latest.totalScore} size={112} />
            </div>
            <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
              {[
                ["PASS", latest.passCount, "text-success"],
                ["WARN", latest.warnCount, "text-warn"],
                ["FAIL", latest.failCount, "text-danger"],
                ["MANUAL", latest.manualCount, "text-manual"],
              ].map(([l, v, c]) => (
                <div key={l as string} className="rounded-xl bg-surface/70 py-2">
                  <dt className="text-[10px] tracking-wider text-muted">{l}</dt>
                  <dd className={`font-mono text-xl font-bold ${c}`}>{v}</dd>
                </div>
              ))}
            </dl>
            <span className="mt-4 text-sm font-semibold text-cyan group-hover:underline">Открыть отчёт →</span>
          </Link>
        )}
      </section>

      {latest && (
        <section className="glass rise rounded-3xl p-6" aria-labelledby="cat-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="cat-heading" className="text-lg font-bold">
              Профиль зрелости по доменам
            </h2>
            <span className="font-mono text-xs text-muted">{latest.filesScanned} файлов · ТЗ: {latest.specSource}</span>
          </div>
          <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
            {latest.categories.map((c) => (
              <div key={c.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="font-mono text-xs" style={{ color: scoreColor(c.score) }}>
                    {c.score} · {scoreGrade(c.score)}
                  </span>
                </div>
                <Bar value={c.score} />
              </div>
            ))}
          </div>
        </section>
      )}

      <NewRunForm defaultRoot={process.cwd()} />

      <section className="glass rise rounded-3xl p-6" aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-4 text-lg font-bold">
          История прогонов
        </h2>
        {runs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">Прогонов ещё нет — запустите первый аудит выше.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted">
                <tr className="border-b border-line">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Проект</th>
                  <th className="py-2 pr-4">Оценка</th>
                  <th className="py-2 pr-4">P / W / F / M</th>
                  <th className="py-2 pr-4">Файлов</th>
                  <th className="py-2 pr-4">Дата</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-line/50 transition hover:bg-surface-2/60">
                    <td className="py-3 pr-4 font-mono text-muted">{r.id}</td>
                    <td className="py-3 pr-4 font-semibold">{r.projectName}</td>
                    <td className="py-3 pr-4 font-mono font-bold" style={{ color: scoreColor(r.totalScore) }}>
                      {r.totalScore}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      <span className="text-success">{r.passCount}</span> / <span className="text-warn">{r.warnCount}</span> /{" "}
                      <span className="text-danger">{r.failCount}</span> / <span className="text-manual">{r.manualCount}</span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-muted">{r.filesScanned}</td>
                    <td className="py-3 pr-4 text-muted">{new Date(r.createdAt).toLocaleString("ru-RU")}</td>
                    <td className="py-3 text-right">
                      <Link href={`/runs/${r.id}`} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan ring-1 ring-cyan/30 transition hover:bg-cyan/10">
                        Отчёт
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
