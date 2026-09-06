import { db } from "@/db";
import { auditFindings, auditRuns } from "@/db/schema";
import { buildMarkdownReport } from "@/lib/audit/report";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const runId = Number(id);
    if (!Number.isInteger(runId)) return Response.json({ ok: false, error: "Некорректный id" }, { status: 400 });

    const [run] = await db.select().from(auditRuns).where(eq(auditRuns.id, runId));
    if (!run) return Response.json({ ok: false, error: "Прогон не найден" }, { status: 404 });
    const findings = await db.select().from(auditFindings).where(eq(auditFindings.runId, runId)).orderBy(asc(auditFindings.code));

    const format = new URL(req.url).searchParams.get("format");
    if (format === "md") {
      return new Response(buildMarkdownReport(run, findings), {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="audit-${run.id}-${run.projectName.replace(/[^a-z0-9_-]/gi, "_")}.md"`,
        },
      });
    }
    return Response.json({ ok: true, run, findings });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const runId = Number(id);
    if (!Number.isInteger(runId)) return Response.json({ ok: false, error: "Некорректный id" }, { status: 400 });
    await db.delete(auditRuns).where(eq(auditRuns.id, runId));
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
