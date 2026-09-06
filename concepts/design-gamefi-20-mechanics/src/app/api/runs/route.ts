import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { runs } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(runs)
    .orderBy(desc(runs.capital), desc(runs.composure), desc(runs.createdAt))
    .limit(20);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Паника бесплатна. JSON — нет." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const nickname = String(b.nickname ?? "аноним").slice(0, 24) || "аноним";
  const cult = String(b.cult ?? "unknown").slice(0, 32);
  const capital = Number.isFinite(Number(b.capital)) ? Math.round(Number(b.capital)) : 0;
  const composure = Number.isFinite(Number(b.composure)) ? Math.round(Number(b.composure)) : 0;
  const nodesCleared = Number.isFinite(Number(b.nodesCleared)) ? Math.round(Number(b.nodesCleared)) : 0;
  const outcome = b.outcome === "liquidated" ? "liquidated" : "exit";
  const ghostDelta =
    b.ghostDelta && typeof b.ghostDelta === "object"
      ? Object.fromEntries(
          Object.entries(b.ghostDelta as Record<string, unknown>)
            .filter(([, v]) => Number.isFinite(Number(v)))
            .map(([k, v]) => [k.slice(0, 32), Number(v)]),
        )
      : {};

  const [row] = await db
    .insert(runs)
    .values({ nickname, cult, capital, composure, nodesCleared, outcome, ghostDelta })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
