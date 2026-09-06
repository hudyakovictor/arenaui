import { db } from "@/db";
import { auditFindings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const RESOLUTIONS = new Set(["open", "in_progress", "fixed", "accepted"]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const findingId = Number(id);
    if (!Number.isInteger(findingId)) return Response.json({ ok: false, error: "Некорректный id" }, { status: 400 });

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Partial<{ resolution: string; note: string }> = {};
    if (typeof body.resolution === "string") {
      if (!RESOLUTIONS.has(body.resolution)) return Response.json({ ok: false, error: "Недопустимый resolution" }, { status: 400 });
      patch.resolution = body.resolution;
    }
    if (typeof body.note === "string") patch.note = body.note.slice(0, 2000);
    if (!Object.keys(patch).length) return Response.json({ ok: false, error: "Нечего обновлять" }, { status: 400 });

    const [updated] = await db.update(auditFindings).set(patch).where(eq(auditFindings.id, findingId)).returning();
    if (!updated) return Response.json({ ok: false, error: "Находка не найдена" }, { status: 404 });
    return Response.json({ ok: true, finding: updated });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
