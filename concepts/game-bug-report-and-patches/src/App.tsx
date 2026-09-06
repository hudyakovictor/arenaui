import { useState } from 'react';
import Overview from './components/Overview';
import BugList from './components/BugList';
import PatchList from './components/PatchList';
import ReportView from './components/ReportView';
import { bugs } from './data/bugs';
import { patches } from './data/patches';

type Tab = 'overview' | 'bugs' | 'patches' | 'report';

const TABS: { id: Tab; label: string; count?: number }[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'bugs', label: 'Дефекты', count: bugs.length },
  { id: 'patches', label: 'Патчи', count: patches.length },
  { id: 'report', label: 'Отчёт .txt' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('overview');
  const [focusBug, setFocusBug] = useState<string | null>(null);
  const [focusPatch, setFocusPatch] = useState<string | null>(null);

  const openBug = (id: string) => {
    setFocusBug(id);
    setTab('bugs');
  };
  const openPatch = (id: string) => {
    setFocusPatch(id);
    setTab('patches');
  };

  const n = (s: string) => bugs.filter(b => b.severity === s).length;

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-200">
      <header className="border-b border-slate-800 bg-[#070B14]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-cyan-400/50 bg-[#0C1323] font-mono text-xs text-cyan-300">
              QA
            </div>
            <div>
              <h1 className="font-mono text-sm uppercase tracking-[0.25em] text-slate-100">Signal Arena · аудит кода</h1>
              <a
                href="https://github.com/hudyakovictor/arena20"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-slate-500 hover:text-cyan-300"
              >
                github.com/hudyakovictor/arena20 · main · phaser/ + backend/
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
            <span><span className="text-rose-300">{n('critical')}</span> crit</span>
            <span><span className="text-amber-300">{n('high')}</span> high</span>
            <span><span className="text-sky-300">{n('medium')}</span> med</span>
            <span><span className="text-slate-300">{n('low')}</span> low</span>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {TABS.map(t => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative whitespace-nowrap px-3 py-2.5 font-mono text-[12px] uppercase tracking-wider transition ${
                  on ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.label}
                {t.count !== undefined && <span className="ml-1.5 text-slate-600">{t.count}</span>}
                {on && <span className="absolute inset-x-2 bottom-0 h-0.5 bg-cyan-300" />}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'overview' && <Overview onOpenBug={openBug} />}
        {tab === 'bugs' && <BugList focusId={focusBug} onOpenPatch={openPatch} />}
        {tab === 'patches' && <PatchList focusId={focusPatch} onOpenBug={openBug} />}
        {tab === 'report' && <ReportView />}
      </div>

      <footer className="border-t border-slate-800 py-6 text-center font-mono text-[10px] text-slate-600">
        КОШЕЛЁК — НЕ ТЕРМИНАЛ. ТЕРМИНАЛ — НЕ КАЗИНО. · Статический аудит по исходникам, без запуска игры.
      </footer>
    </div>
  );
}
