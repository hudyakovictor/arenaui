import { useState } from 'react';
import { brief } from '../data/brief';

export function Brief() {
  const [copied, setCopied] = useState(false);
  const chars = brief.length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    const blob = new Blob([brief], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signal-arena-plan-25-99.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="brief" className="mx-auto max-w-6xl px-5 py-16">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">Ёмкое описание</div>
          <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Текст для презентации</h2>
          <p className="mt-2 text-slate-400">
            {chars.toLocaleString('ru-RU')} знаков · 41 блок действий · без описания ошибок
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={copy} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-200">
            {copied ? 'Скопировано ✓' : 'Скопировать'}
          </button>
          <button onClick={download} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
            Скачать .txt
          </button>
        </div>
      </header>
      <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 md:p-10">
        {brief.split('\n').map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-3" />;
          const isHead = /^(СПРИНТ|SIGNAL ARENA|КАК СЧИТАЕТСЯ)/.test(trimmed);
          const m = trimmed.match(/^(\d+)\.\s(.*)$/);
          if (isHead)
            return (
              <h3 key={i} className="mb-3 mt-6 text-base font-black uppercase tracking-wide text-cyan-200 first:mt-0 md:text-lg">
                {trimmed}
              </h3>
            );
          if (m)
            return (
              <p key={i} className="mb-2 flex gap-3 text-sm leading-relaxed text-slate-200 md:text-[15px]">
                <span className="shrink-0 font-mono text-xs font-black text-amber-300 md:text-sm">{m[1]}</span>
                <span>{m[2]}</span>
              </p>
            );
          return (
            <p key={i} className="mb-2 text-sm leading-relaxed text-slate-300 md:text-[15px]">
              {trimmed}
            </p>
          );
        })}
      </article>
    </section>
  );
}
