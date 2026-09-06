import type { AuditFinding, AuditRun } from "@/db/schema";

const STATUS_LABEL: Record<string, string> = { pass: "✅ PASS", warn: "⚠️ WARN", fail: "❌ FAIL", manual: "🔍 MANUAL" };
const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function buildMarkdownReport(run: AuditRun, findings: AuditFinding[]): string {
  const lines: string[] = [];
  lines.push(`# Web3 Game UX/Tech Audit — ${run.projectName}`);
  lines.push("");
  lines.push(`- Дата: ${new Date(run.createdAt).toISOString()}`);
  lines.push(`- Путь: \`${run.rootPath}\``);
  lines.push(`- Файлов просканировано: ${run.filesScanned}`);
  lines.push(`- Источник ТЗ: ${run.specSource}`);
  lines.push(`- **Итоговая оценка: ${run.totalScore}/100**`);
  lines.push(`- PASS ${run.passCount} · WARN ${run.warnCount} · FAIL ${run.failCount} · MANUAL ${run.manualCount}`);
  lines.push("");
  lines.push("## Оценки по категориям");
  lines.push("");
  lines.push("| Категория | Score | Pass | Warn | Fail | Manual |");
  lines.push("|---|---:|---:|---:|---:|---:|");
  for (const c of run.categories) lines.push(`| ${c.category} | ${c.score} | ${c.pass} | ${c.warn} | ${c.fail} | ${c.manual} |`);
  lines.push("");

  const critical = findings
    .filter((f) => f.status === "fail" && f.resolution === "open")
    .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || a.code.localeCompare(b.code));
  lines.push("## Приоритетный бэклог (открытые FAIL)");
  lines.push("");
  critical.forEach((f, i) => lines.push(`${i + 1}. **[${f.severity.toUpperCase()}] ${f.code} ${f.title}** — ${f.recommendation}`));
  if (!critical.length) lines.push("_Открытых критичных находок нет._");
  lines.push("");

  lines.push("## Все 50 анализов");
  lines.push("");
  let currentCat = "";
  for (const f of findings) {
    if (f.category !== currentCat) {
      currentCat = f.category;
      lines.push(`### ${currentCat}`);
      lines.push("");
    }
    lines.push(`#### ${f.code} · ${f.title} — ${STATUS_LABEL[f.status]} (${f.score}/100, ${f.severity})`);
    lines.push("");
    lines.push(`_${f.description}_`);
    lines.push("");
    lines.push(`**Результат:** ${f.detail}`);
    lines.push("");
    lines.push(`**Рекомендация:** ${f.recommendation}`);
    if (f.resolution !== "open") lines.push(`\n**Статус:** ${f.resolution}${f.note ? ` — ${f.note}` : ""}`);
    if (f.evidence.length) {
      lines.push("");
      lines.push("Evidence:");
      for (const e of f.evidence) lines.push(`- \`${e.path}:${e.line}\` — ${e.text.replace(/\|/g, "\\|")}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
