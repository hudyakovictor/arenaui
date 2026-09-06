import path from "path";
import { db } from "@/db";
import { auditFindings, auditRuns, type CategoryScore } from "@/db/schema";
import { ANALYSES, CATEGORIES } from "./catalog";
import { buildContext } from "./scanner";
import { SEVERITY_WEIGHT, type AnalysisResult } from "./types";

export interface RunInput {
  projectName?: string;
  rootPath?: string;
  specText?: string;
}

export async function executeAudit(input: RunInput) {
  const rootPath = path.resolve(input.rootPath?.trim() || process.cwd());
  const isSelf = rootPath === path.resolve(process.cwd());
  const ctx = await buildContext(rootPath, input.specText ?? "", isSelf);

  const results = ANALYSES.map((a) => {
    let r: AnalysisResult;
    try {
      r = a.run(ctx);
    } catch (e) {
      r = {
        status: "manual",
        score: 50,
        detail: `Анализ упал с ошибкой: ${(e as Error).message}`,
        recommendation: "Проверить вручную.",
        evidence: [],
      };
    }
    return { analysis: a, result: r };
  });

  let wSum = 0;
  let wTotal = 0;
  const counts = { pass: 0, warn: 0, fail: 0, manual: 0 };
  const catMap = new Map<string, CategoryScore & { sum: number; n: number }>();
  for (const c of CATEGORIES) catMap.set(c, { category: c, score: 0, pass: 0, warn: 0, fail: 0, manual: 0, sum: 0, n: 0 });

  for (const { analysis, result } of results) {
    const w = SEVERITY_WEIGHT[analysis.severity];
    wSum += result.score * w;
    wTotal += w;
    counts[result.status]++;
    const c = catMap.get(analysis.category)!;
    c[result.status]++;
    c.sum += result.score;
    c.n++;
  }
  const categories: CategoryScore[] = [...catMap.values()].map(({ sum, n, ...rest }) => ({ ...rest, score: n ? Math.round(sum / n) : 0 }));
  const totalScore = wTotal ? Math.round(wSum / wTotal) : 0;

  const projectName = input.projectName?.trim() || path.basename(rootPath) || "project";

  const [run] = await db
    .insert(auditRuns)
    .values({
      projectName,
      rootPath,
      specText: (input.specText ?? "").slice(0, 200_000),
      specSource: ctx.specSource,
      totalScore,
      filesScanned: ctx.files.length,
      passCount: counts.pass,
      warnCount: counts.warn,
      failCount: counts.fail,
      manualCount: counts.manual,
      categories,
    })
    .returning();

  await db.insert(auditFindings).values(
    results.map(({ analysis, result }) => ({
      runId: run.id,
      code: analysis.code,
      category: analysis.category,
      title: analysis.title,
      description: analysis.description,
      severity: analysis.severity,
      status: result.status,
      score: result.score,
      detail: result.detail,
      recommendation: result.recommendation,
      evidence: result.evidence,
    })),
  );

  return run;
}
