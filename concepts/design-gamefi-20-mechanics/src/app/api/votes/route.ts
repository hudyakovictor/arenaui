import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { mechanicVotes } from "@/db/schema";
import { mechanics } from "@/lib/content";

export const dynamic = "force-dynamic";

const allowed = new Set(mechanics.map((m) => m.id));

async function tally() {
  const rows = await db
    .select({
      mechanicId: mechanicVotes.mechanicId,
      count: sql<number>`count(*)::int`,
    })
    .from(mechanicVotes)
    .groupBy(mechanicVotes.mechanicId);
  const out: Record<string, number> = {};
  for (const m of mechanics) out[m.id] = 0;
  for (const r of rows) out[r.mechanicId] = r.count;
  return out;
}

export async function GET() {
  return NextResponse.json(await tally());
}

export async function POST(req: Request) {
  let body: { mechanicId?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }
  const id = body.mechanicId ?? "";
  if (!allowed.has(id)) {
    return NextResponse.json({ error: "Такой механики нет. Рынок принял твоё решение." }, { status: 400 });
  }
  await db.insert(mechanicVotes).values({ mechanicId: id });
  return NextResponse.json(await tally(), { status: 201 });
}
