import { executeAudit } from "@/lib/audit/run";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const projectName = typeof body.projectName === "string" ? body.projectName.slice(0, 120) : undefined;
    const rootPath = typeof body.rootPath === "string" ? body.rootPath.slice(0, 500) : undefined;
    const specText = typeof body.specText === "string" ? body.specText : undefined;
    const run = await executeAudit({ projectName, rootPath, specText });
    return Response.json({ ok: true, run });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
