export type Severity = "critical" | "high" | "medium" | "low";
export type Status = "pass" | "warn" | "fail" | "manual";

export interface Evidence {
  path: string;
  line: number;
  text: string;
}

export interface ScannedFile {
  path: string;
  ext: string;
  content: string;
  isClient: boolean;
}

export interface GrepOptions {
  exts?: string[];
  pathRe?: RegExp;
  excludePathRe?: RegExp;
  limit?: number;
  serverOnly?: boolean;
}

export interface ScanContext {
  rootPath: string;
  files: ScannedFile[];
  deps: Record<string, string>;
  spec: string;
  specSource: string;
  hasDep: (...names: (string | RegExp)[]) => string[];
  grep: (re: RegExp, opts?: GrepOptions) => Evidence[];
  count: (re: RegExp, opts?: GrepOptions) => number;
  filesMatching: (pathRe: RegExp) => ScannedFile[];
  specHas: (re: RegExp) => boolean;
}

export interface AnalysisResult {
  status: Status;
  score: number;
  detail: string;
  recommendation: string;
  evidence: Evidence[];
}

export interface Analysis {
  code: string;
  category: string;
  title: string;
  description: string;
  severity: Severity;
  run: (ctx: ScanContext) => AnalysisResult;
}

export const CODE_EXTS = ["ts", "tsx", "js", "jsx", "mjs", "cjs", "vue", "svelte"];
export const STYLE_EXTS = ["css", "scss", "sass", "less"];
export const UI_EXTS = [...CODE_EXTS, ...STYLE_EXTS, "html"];
export const SERVER_PATH_RE = /(\/api\/|\/server\/|\/backend\/|\/actions?\/|\/lib\/|\/services?\/|route\.(ts|js)$|\/db\/)/;

export const SEVERITY_WEIGHT: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export function pass(detail: string, evidence: Evidence[] = [], recommendation = "Поддерживать текущий уровень; покрыть регрессионными тестами."): AnalysisResult {
  return { status: "pass", score: 100, detail, recommendation, evidence };
}
export function warn(detail: string, recommendation: string, evidence: Evidence[] = [], score = 55): AnalysisResult {
  return { status: "warn", score, detail, recommendation, evidence };
}
export function fail(detail: string, recommendation: string, evidence: Evidence[] = [], score = 10): AnalysisResult {
  return { status: "fail", score, detail, recommendation, evidence };
}
export function manual(detail: string, recommendation: string, evidence: Evidence[] = []): AnalysisResult {
  return { status: "manual", score: 50, detail, recommendation, evidence };
}
