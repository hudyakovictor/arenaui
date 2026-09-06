import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { auditFindings, auditRuns } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { CATEGORIES } from "@/lib/audit/catalog";
import { FindingsBoard } from "@/components/audit/FindingsBoard";
import { Bar, ScoreRing, SeverityBadge, scoreColor, scoreGrade } from "@/components/audit/ui";

export const dynamic = "force-dynamic";

const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const runId = Number(id);
  if (!Number.isInteger(runId)) notFound();

  const [run] = await db.select().from(auditRuns).where(eq(auditRuns.id, runId));
  if (!run) notFound();
  const findings = await db.select().from(auditFindings).where(eq(auditFindings.runId, runId)).orderBy(asc(auditFindings.code));

  const top = findings
    .filter((f) => f.status === "fail" && f.resolution === "open")
    .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || a.code.localeCompare(b.code))
    .slice(0, 8);

  const critFails = findings.filter((f) => f.status === "fail" && f.severity === "critical").length;
  const verdict =
    run.totalScore >= 80
      ? "Готово к soft-launch: закрыть остаточные WARN и провести ручной playtest."
      : run.totalScore >= 55
        ? "Ядро есть, но AAA-уровень не достигнут: закрыть critical/high до публичного теста."
        : "Продукт не готов к показу игрокам: базовые Web3-UX контуры отсутствуют.";

  return (
    <div className="space-y-6">
      <nav aria-label="Хлебные крошки" className="text-xs text-muted">
        <Link href="/" className="hover:text-text">
          Прогоны
        </Link>{" "}
        / <span className="text-text">#{run.id}</span>
      </nav>

      <section className="rise grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="glass flex flex-col items-center gap-4 rounded-3xl p-6">
          <ScoreRing score={run.totalScore} size={170} />
          <div className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">Weighted Score</p>
            <p className="text-2xl font-black" style={{ color: scoreColor(run.totalScore) }}>
              Grade {scoreGrade(run.totalScore)}
            </p>
          </div>
          <a
            href={`/api/audit/runs/${run.id}?format=md`}
            className="w-full rounded-xl bg-surface-2 px-4 py-2 text-center text-sm font-semibold ring-1 ring-line transition hover:ring-primary/60"
          >
            ⬇ Экспорт Markdown
          </a>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-cyan">Audit report #{run.id}</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">{run.projectName}</h1>
              <p className="mt-1 font-mono text-xs text-muted">
                {run.rootPath} · {run.filesScanned} файлов · {new Date(run.createdAt).toLocaleString("ru-RU")}
              </p>
              <p className="mt-1 text-xs text-muted">Источник ТЗ: {run.specSource === "none" ? "не найдено" : run.specSource}</p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ["PASS", run.passCount, "text-success"],
                ["WARN", run.warnCount, "text-warn"],
                ["FAIL", run.failCount, "text-danger"],
                ["MANUAL", run.manualCount, "text-manual"],
              ].map(([l, v, c]) => (
                <div key={l as string} className="min-w-16 rounded-xl bg-surface/70 px-2 py-2">
                  <div className="text-[10px] tracking-wider text-muted">{l}</div>
                  <div className={`font-mono text-xl font-bold ${c}`}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`mt-5 rounded-2xl border p-4 ${critFails ? "border-danger/40 bg-danger/10" : "border-success/40 bg-success/10"}`}>
            <p className="text-[11px] uppercase tracking-wider text-muted">Вердикт</p>
            <p className="mt-1 text-sm font-semibold">{verdict}</p>
            <p className="mt-1 text-xs text-muted">Критических провалов: {critFails}. Оценка взвешена по severity — один critical FAIL стоит четырёх low.</p>
          </div>

          <div className="mt-5 grid gap-x-8 gap-y-3 md:grid-cols-2">
            {run.categories.map((c) => (
              <div key={c.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="font-mono text-xs" style={{ color: scoreColor(c.score) }}>
                    {c.score} · {c.fail}F {c.warn}W
                  </span>
                </div>
                <Bar value={c.score} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {top.length > 0 && (
        <section className="glass rise rounded-3xl p-6" aria-labelledby="top-heading">
          <h2 id="top-heading" className="text-lg font-bold">
            Приоритетный бэклог — что чинить первым
          </h2>
          <ol className="mt-4 grid gap-2 md:grid-cols-2">
            {top.map((f, i) => (
              <li key={f.id} className="flex gap-3 rounded-2xl border border-line bg-surface/60 p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-danger/15 font-mono text-sm font-black text-danger">{i + 1}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted">{f.code}</span>
                    <span className="font-semibold">{f.title}</span>
                    <SeverityBadge severity={f.severity} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{f.recommendation}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <FindingsBoard initial={findings} categories={[...CATEGORIES]} />
    </div>
  );
}
