import { useCallback, useEffect, useRef, useState } from 'react';
import { TitleSlide, DiagnosisSlide, ScorecardSlide, EvidenceSlide, StackSlide } from './slides/part1';
import {
  ArchitectureSlide,
  MobileTypoSlide,
  MechanicsSlide,
  LearningSlide,
  ToneSlide,
  BackendSlide,
  MotionSlide,
  TestingSlide,
} from './slides/part2';
import { RoadmapSlide, ChecklistSlide, DoDSlide } from './slides/part3';

const slides = [
  { id: 'title', name: 'Титул', el: <TitleSlide /> },
  { id: 'diag', name: 'Диагноз', el: <DiagnosisSlide /> },
  { id: 'score', name: 'Скоркард', el: <ScorecardSlide /> },
  { id: 'evidence', name: 'Улики из кода', el: <EvidenceSlide /> },
  { id: 'stack', name: 'Стек', el: <StackSlide /> },
  { id: 'arch', name: 'Архитектура', el: <ArchitectureSlide /> },
  { id: 'mobile', name: 'Mobile + типографика', el: <MobileTypoSlide /> },
  { id: 'mech', name: 'Механики', el: <MechanicsSlide /> },
  { id: 'learn', name: 'Обучение', el: <LearningSlide /> },
  { id: 'tone', name: 'Тексты', el: <ToneSlide /> },
  { id: 'backend', name: 'Backend', el: <BackendSlide /> },
  { id: 'motion', name: 'Анимации', el: <MotionSlide /> },
  { id: 'test', name: 'Тесты и CI', el: <TestingSlide /> },
  { id: 'roadmap', name: 'Дорожная карта', el: <RoadmapSlide /> },
  { id: 'checklist', name: 'Чек-лист 350', el: <ChecklistSlide /> },
  { id: 'dod', name: 'Definition of Done', el: <DoDSlide /> },
];

function initialIndex() {
  const h = window.location.hash.replace('#', '');
  const n = Number(h);
  return Number.isFinite(n) && n >= 1 && n <= slides.length ? n - 1 : 0;
}

export default function App() {
  const [i, setI] = useState(initialIndex);
  const [overview, setOverview] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const touch = useRef<number | null>(null);

  const go = useCallback(
    (n: number) => {
      const next = Math.max(0, Math.min(slides.length - 1, n));
      setDir(next >= i ? 1 : -1);
      setI(next);
      setOverview(false);
    },
    [i],
  );

  useEffect(() => {
    window.location.hash = String(i + 1);
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        go(i + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(i - 1);
      } else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(slides.length - 1);
      else if (e.key.toLowerCase() === 'o' || e.key === 'Escape') setOverview((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, go]);

  const progress = ((i + 1) / slides.length) * 100;

  return (
    <div className="deck-bg relative flex h-dvh w-full flex-col overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 grid-overlay" />
      <div className="absolute left-0 top-0 h-[3px] w-full bg-white/5">
        <div className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-300 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <main
        className="relative min-h-0 flex-1 overflow-y-auto"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 70) go(dx < 0 ? i + 1 : i - 1);
          touch.current = null;
        }}
      >
        <div key={i} className={`h-full ${dir === 1 ? 'slide-in-right' : 'slide-in-left'}`}>
          {slides[i].el}
        </div>
      </main>

      <footer className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-[#070B14]/80 px-4 py-2.5 backdrop-blur sm:px-8">
        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 sm:inline">Signal Arena · аудит</span>
          <span className="hidden text-slate-600 sm:inline">/</span>
          <span className="truncate text-sm text-slate-300">{slides[i].name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOverview((v) => !v)}
            className="hidden rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[11px] text-slate-300 transition hover:bg-white/5 sm:block"
            title="O — обзор"
          >
            обзор
          </button>
          <button
            onClick={() => go(i - 1)}
            disabled={i === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition hover:bg-white/5 disabled:opacity-30"
            aria-label="Назад"
          >
            ←
          </button>
          <span className="w-16 text-center font-mono text-xs tabular-nums text-slate-400">
            {i + 1} / {slides.length}
          </span>
          <button
            onClick={() => go(i + 1)}
            disabled={i === slides.length - 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/10 text-cyan-200 transition hover:bg-cyan-400/20 disabled:opacity-30"
            aria-label="Вперёд"
          >
            →
          </button>
        </div>
      </footer>

      {overview && (
        <div className="absolute inset-0 z-20 overflow-y-auto bg-[#070B14]/95 p-6 backdrop-blur-md sm:p-10" onClick={() => setOverview(false)}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Содержание</h3>
              <span className="font-mono text-xs text-slate-500">Esc — закрыть · ← → — листать</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    go(idx);
                  }}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    idx === i ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="font-mono text-[11px] text-slate-500">{String(idx + 1).padStart(2, '0')}</div>
                  <div className="text-sm font-semibold text-white">{s.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
