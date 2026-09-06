import { bugs, type Severity, type Area, SEVERITY_LABEL, AREA_LABEL } from '../data/bugs';
import { patches } from '../data/patches';
import { SEV_DOT, SeverityBadge } from './Badges';

const SEVS: Severity[] = ['critical', 'high', 'medium', 'low'];
const AREAS: Area[] = ['arena', 'engine', 'state', 'config', 'scenes', 'backend'];

export default function Overview({ onOpenBug }: { onOpenBug: (id: string) => void }) {
  const bySev = SEVS.map(s => ({ s, n: bugs.filter(b => b.severity === s).length }));
  const byArea = AREAS.map(a => ({ a, n: bugs.filter(b => b.area === a).length }));
  const maxArea = Math.max(...byArea.map(x => x.n));
  const covered = new Set(bugs.filter(b => b.patchId).map(b => b.id)).size;
  const top = bugs.filter(b => b.severity === 'critical' || b.severity === 'high');

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="дефектов" value={bugs.length} accent="text-slate-100" />
        <Kpi label="критичных" value={bySev[0].n} accent="text-rose-300" />
        <Kpi label="патчей" value={patches.length} accent="text-cyan-300" />
        <Kpi label="закрыто патчами" value={`${covered}/${bugs.length}`} accent="text-emerald-300" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="По серьёзности">
          <div className="space-y-2">
            {bySev.map(({ s, n }) => (
              <div key={s} className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${SEV_DOT[s]}`} />
                <span className="w-24 font-mono text-[11px] uppercase text-slate-400">{SEVERITY_LABEL[s]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-slate-800">
                  <div className={`h-full ${SEV_DOT[s]}`} style={{ width: `${(n / bugs.length) * 100}%` }} />
                </div>
                <span className="w-6 text-right font-mono text-xs text-slate-200">{n}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="По модулю">
          <div className="space-y-2">
            {byArea.map(({ a, n }) => (
              <div key={a} className="flex items-center gap-3">
                <span className="w-40 truncate font-mono text-[11px] text-slate-400">{AREA_LABEL[a]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-slate-800">
                  <div className="h-full bg-cyan-400/80" style={{ width: `${(n / maxArea) * 100}%` }} />
                </div>
                <span className="w-6 text-right font-mono text-xs text-slate-200">{n}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Главное за 60 секунд">
        <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
          <li>
            <b className="text-rose-300">Арена сейчас неиграбельна по задумке:</b> любой тап по вкладке источника или слепому источнику вызывает{' '}
            <code className="rounded bg-slate-800 px-1 font-mono text-[12px] text-cyan-200">scene.restart()</code>, а{' '}
            <code className="rounded bg-slate-800 px-1 font-mono text-[12px] text-cyan-200">create()</code> генерирует новую задачу и сбрасывает всё состояние (B01, B02).
          </li>
          <li>
            <b className="text-rose-300">Seed не детерминирован</b> (Date.now) — сервер не сможет валидировать попытки, «тень арены» и повтор задач невозможны (B03).
          </li>
          <li>
            <b className="text-rose-300">Битый localStorage = белый экран</b>, а экспоненциальный XP делает эпохи II–IV недостижимыми (B19, B20).
          </li>
          <li>
            <b className="text-rose-300">Backend продаёт всё за 0 SIG</b> — цена приходит от клиента (B28); секреты с дефолтами и admin-токен в query (B29).
          </li>
          <li>
            Плюс: смена эпохи никогда не показывается, иконки меню не грузятся, буквы ответов «едут» после перемешивания, улики теряют текст при мутации, двойной submit даёт двойную награду.
          </li>
        </ul>
      </Panel>

      <Panel title={`Критичные и высокие (${top.length})`}>
        <div className="divide-y divide-slate-800">
          {top.map(b => (
            <button
              key={b.id}
              onClick={() => onOpenBug(b.id)}
              className="flex w-full items-start gap-3 py-2.5 text-left transition hover:bg-slate-800/40"
            >
              <span className="mt-0.5 font-mono text-[11px] text-slate-500">{b.id}</span>
              <span className="flex-1 text-sm text-slate-200">{b.title}</span>
              <SeverityBadge s={b.severity} />
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Порядок внедрения">
        <div className="grid gap-3 md:grid-cols-3">
          <Step day="День 1" title="Игра становится играбельной" items={['P01 keep-restart', 'P02 seed', 'P11 GameState', 'P04 иконки', 'P09 dev-кнопка']} />
          <Step day="День 2" title="Корректность механик" items={['P05 pickTemplate', 'P06 опознание', 'P07 submit-гард', 'P08 evidence strip', 'P03 эпоха', 'P10 mutator']} />
          <Step day="День 3" title="Backend" items={['P13 цена с сервера', 'P14 секреты / admin / rate-limit', 'ENV: JWT_SECRET, ADMIN_TOKEN, SEED_SECRET']} />
        </div>
      </Panel>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-lg border border-slate-700/70 bg-[#0C1323] p-4">
      <div className={`font-mono text-2xl font-semibold ${accent}`}>{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-700/70 bg-[#0C1323] p-4">
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">{title}</h3>
      {children}
    </section>
  );
}

function Step({ day, title, items }: { day: string; title: string; items: string[] }) {
  return (
    <div className="rounded border border-slate-700/60 bg-[#060A12] p-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-amber-300">{day}</div>
      <div className="mb-2 text-sm text-slate-200">{title}</div>
      <ul className="space-y-1">
        {items.map(i => (
          <li key={i} className="font-mono text-[11px] text-slate-400">
            → {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
