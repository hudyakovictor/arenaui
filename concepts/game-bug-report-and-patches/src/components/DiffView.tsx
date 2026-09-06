import { useState } from 'react';

function lineClass(line: string): string {
  if (line.startsWith('+++') || line.startsWith('---')) return 'text-slate-400 font-semibold';
  if (line.startsWith('@@')) return 'text-violet-300 bg-violet-500/10';
  if (line.startsWith('+')) return 'text-emerald-300 bg-emerald-500/10';
  if (line.startsWith('-')) return 'text-rose-300 bg-rose-500/10';
  return 'text-slate-300';
}

export function CopyButton({ text, label = 'Копировать' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="rounded border border-cyan-400/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-400/10"
    >
      {done ? '✓ скопировано' : label}
    </button>
  );
}

export default function DiffView({ diff }: { diff: string }) {
  const lines = diff.split('\n');
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-700/70 bg-[#060A12]">
      <div className="absolute right-2 top-2 z-10">
        <CopyButton text={diff} label="Копировать diff" />
      </div>
      <pre className="overflow-x-auto p-3 pt-10 font-mono text-[11.5px] leading-[1.45]">
        {lines.map((l, i) => (
          <div key={i} className={`whitespace-pre px-1 ${lineClass(l)}`}>
            {l.length ? l : ' '}
          </div>
        ))}
      </pre>
    </div>
  );
}
