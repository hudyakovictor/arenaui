import { promises as fs } from "fs";
import path from "path";
import type { Evidence, GrepOptions, ScanContext, ScannedFile } from "./types";

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
  ".turbo",
  ".vercel",
  ".cache",
  "artifacts",
  "cache",
  "typechain-types",
]);

// Файлы самого аудит-инструмента исключаются, чтобы он не анализировал сам себя.
const SELF_PATH_RE = /^(src\/lib\/audit\/|src\/components\/audit\/|src\/app\/api\/audit\/|src\/app\/runs\/|src\/app\/(page|layout|error|not-found|loading)\.tsx$|src\/app\/globals\.css$|src\/db\/schema\.ts$)/;

const TEXT_EXTS = new Set([
  "ts", "tsx", "js", "jsx", "mjs", "cjs", "vue", "svelte", "json", "md", "mdx", "txt",
  "css", "scss", "sass", "less", "html", "sol", "rs", "py", "go", "yaml", "yml", "toml",
  "sql", "prisma", "graphql", "gql", "env", "example", "local", "gitignore", "move", "cairo",
]);

const MAX_FILE_BYTES = 600 * 1024;
const MAX_FILES = 6000;
const SPEC_NAME_RE = /(тз|техзадан|tz|spec|requirement|brief|gdd|design[-_ ]?doc|readme|prd)/i;

async function walk(root: string, rel: string, acc: string[]): Promise<void> {
  if (acc.length >= MAX_FILES) return;
  let entries: import("fs").Dirent[];
  try {
    entries = await fs.readdir(path.join(root, rel), { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (acc.length >= MAX_FILES) return;
    const relPath = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walk(root, relPath, acc);
    } else if (e.isFile()) {
      acc.push(relPath);
    }
  }
}

function extOf(p: string): string {
  const base = path.basename(p);
  if (base.startsWith(".env")) return "env";
  if (base === ".gitignore") return "gitignore";
  const i = base.lastIndexOf(".");
  return i >= 0 ? base.slice(i + 1).toLowerCase() : "";
}

export async function buildContext(rootPath: string, pastedSpec: string, isSelfProject: boolean): Promise<ScanContext> {
  const root = path.resolve(rootPath);
  const stat = await fs.stat(root).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    throw new Error(`Путь не найден или не является директорией: ${root}`);
  }

  const relPaths: string[] = [];
  await walk(root, "", relPaths);

  const files: ScannedFile[] = [];
  for (const rel of relPaths) {
    if (isSelfProject && SELF_PATH_RE.test(rel)) continue;
    const ext = extOf(rel);
    if (!TEXT_EXTS.has(ext)) continue;
    try {
      const st = await fs.stat(path.join(root, rel));
      if (st.size > MAX_FILE_BYTES) continue;
      const content = await fs.readFile(path.join(root, rel), "utf8");
      files.push({ path: rel, ext, content, isClient: /^\s*["']use client["']/m.test(content) });
    } catch {
      /* ignore unreadable */
    }
  }

  // package.json deps (все найденные, монорепо тоже)
  const deps: Record<string, string> = {};
  for (const f of files.filter((f) => path.basename(f.path) === "package.json")) {
    try {
      const pkg = JSON.parse(f.content) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      Object.assign(deps, pkg.dependencies ?? {}, pkg.devDependencies ?? {});
    } catch {
      /* ignore */
    }
  }

  // ТЗ: вставленный текст + документы по имени
  const specDocs = files.filter((f) => ["md", "mdx", "txt"].includes(f.ext) && SPEC_NAME_RE.test(f.path));
  const specParts: string[] = [];
  if (pastedSpec.trim()) specParts.push(pastedSpec);
  for (const d of specDocs) specParts.push(`\n\n# FILE: ${d.path}\n${d.content}`);
  const spec = specParts.join("\n");
  const specSource = pastedSpec.trim()
    ? specDocs.length
      ? `вставленный текст + ${specDocs.length} док.`
      : "вставленный текст"
    : specDocs.length
      ? specDocs.map((d) => d.path).slice(0, 3).join(", ")
      : "none";

  const grep = (re: RegExp, opts: GrepOptions = {}): Evidence[] => {
    const limit = opts.limit ?? 8;
    const out: Evidence[] = [];
    const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
    for (const f of files) {
      if (opts.exts && !opts.exts.includes(f.ext)) continue;
      if (opts.pathRe && !opts.pathRe.test(f.path)) continue;
      if (opts.excludePathRe && opts.excludePathRe.test(f.path)) continue;
      if (opts.serverOnly && f.isClient) continue;
      const lines = f.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const r = new RegExp(re.source, flags);
        if (r.test(lines[i])) {
          out.push({ path: f.path, line: i + 1, text: lines[i].trim().slice(0, 160) });
          if (out.length >= limit) return out;
        }
      }
    }
    return out;
  };

  const count = (re: RegExp, opts: GrepOptions = {}): number => grep(re, { ...opts, limit: 100000 }).length;

  const hasDep = (...names: (string | RegExp)[]): string[] => {
    const keys = Object.keys(deps);
    const found = new Set<string>();
    for (const n of names) {
      for (const k of keys) {
        if (typeof n === "string" ? k === n : n.test(k)) found.add(k);
      }
    }
    return [...found];
  };

  return {
    rootPath: root,
    files,
    deps,
    spec,
    specSource,
    hasDep,
    grep,
    count,
    filesMatching: (pathRe) => files.filter((f) => pathRe.test(f.path)),
    specHas: (re) => re.test(spec),
  };
}
