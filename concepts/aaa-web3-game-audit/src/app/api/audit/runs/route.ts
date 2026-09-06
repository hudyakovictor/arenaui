import { db } from "@/db";
import { auditRuns } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const runs = await db.select().from(auditRuns).orderBy(desc(auditRuns.createdAt)).limit(50);
    return Response.json({ ok: true, runs });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
