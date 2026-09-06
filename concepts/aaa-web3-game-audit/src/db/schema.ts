import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export type CategoryScore = { category: string; score: number; pass: number; warn: number; fail: number; manual: number };

export const auditRuns = pgTable("audit_runs", {
  id: serial("id").primaryKey(),
  projectName: text("project_name").notNull(),
  rootPath: text("root_path").notNull(),
  specText: text("spec_text").notNull().default(""),
  specSource: text("spec_source").notNull().default("none"),
  totalScore: integer("total_score").notNull().default(0),
  filesScanned: integer("files_scanned").notNull().default(0),
  passCount: integer("pass_count").notNull().default(0),
  warnCount: integer("warn_count").notNull().default(0),
  failCount: integer("fail_count").notNull().default(0),
  manualCount: integer("manual_count").notNull().default(0),
  categories: jsonb("categories").$type<CategoryScore[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditFindings = pgTable(
  "audit_findings",
  {
    id: serial("id").primaryKey(),
    runId: integer("run_id")
      .notNull()
      .references(() => auditRuns.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    category: text("category").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    severity: text("severity").notNull(),
    status: text("status").notNull(),
    score: integer("score").notNull(),
    detail: text("detail").notNull().default(""),
    recommendation: text("recommendation").notNull().default(""),
    evidence: jsonb("evidence").$type<{ path: string; line: number; text: string }[]>().notNull().default([]),
    resolution: text("resolution").notNull().default("open"),
    note: text("note").notNull().default(""),
  },
  (t) => [index("audit_findings_run_idx").on(t.runId), index("audit_findings_code_idx").on(t.code)],
);

export type AuditRun = typeof auditRuns.$inferSelect;
export type AuditFinding = typeof auditFindings.$inferSelect;
