import type { EpochDef } from '../theme/epochs';
import type { PlayerState } from './ArenaScreen';

function Screen({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col px-4 pt-5 pb-6">
      <h1 className="text-[22px] font-semibold leading-none" style={{ color: 'var(--text)', fontFamily: 'var(--font-head)' }}>
        {title}
      </h1>
      <p className="mt-1.5 text-[12px]" style={{ color: 'var(--sub)' }}>
        {sub}
      </p>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: accent ? 'color-mix(in srgb, var(--accent) 50%, var(--border))' : 'var(--border)', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
      {children}
    </div>
  );
}

function Primary({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="mt-2 h-11 w-full rounded-xl text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: 'calc(var(--radius) - 4px)' }}>
      {label}
    </button>
  );
}

/* АКАДЕМИЯ — одна тема «на сегодня», остальное списком. Карта = мост в Арену. */
export function AcademyScreen({ epoch, onGoArena }: { epoch: EpochDef; onGoArena: () => void }) {
  const lessons = [
    { id: 'L1', t: 'Объём подтверждает движение', done: true },
    { id: 'L2', t: 'Источник важнее заголовка', done: epoch.index >= 2 },
    { id: 'L3', t: 'Стоп считается до входа', done: epoch.index >= 3 },
    { id: 'L4', t: 'Стакан: стены и пустоты', done: false },
  ];
  const current = lessons.find((l) => !l.done) ?? lessons[0];
  return (
    <Screen title="Академия" sub={`Эпоха ${epoch.short} · ${epoch.goal}`}>
      <Card accent>
        <Label>Урок дня · 4 минуты</Label>
        <div className="mt-1 text-[15px] font-medium" style={{ color: 'var(--text)' }}>
          {current.t}
        </div>
        <p className="mt-1 text-[12px]" style={{ color: 'var(--sub)' }}>
          Закончишь — карта «{current.t.split(' ')[0]}…» появится в Арене на следующей встрече.
        </p>
        <Primary label="Начать урок" onClick={onGoArena} />
      </Card>
      <Label>Программа эпохи</Label>
      <div className="divide-y rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
        {lessons.map((l) => (
          <div key={l.id} className="flex items-center gap-3 px-3 py-2.5" style={{ borderColor: 'var(--border)' }}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[10px]" style={{ borderColor: l.done ? 'var(--good)' : 'var(--strong)', background: l.done ? 'var(--good)' : 'transparent', color: '#04140a' }}>
              {l.done ? '✓' : ''}
            </span>
            <span className="flex-1 text-[13px]" style={{ color: l.done ? 'var(--sub)' : 'var(--text)' }}>
              {l.t}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {l.id}
            </span>
          </div>
        ))}
      </div>
    </Screen>
  );
}

/* ЖУРНАЛ — свиток ошибок как список «долгов», закрываемых в Арене. */
export function JournalScreen({ epoch, onGoArena }: { epoch: EpochDef; onGoArena: () => void }) {
  const errors = [
    { enemy: 'FOMO-Шептун', atom: 'C2.3 · объём', evidence: 'нет улики', open: true },
    { enemy: 'Ложный пробой', atom: 'T1.4 · ретест', evidence: 'ev-break', open: epoch.index <= 2 },
    { enemy: 'Плечо-соблазн', atom: 'R3.1 · размер', evidence: 'ev-risk', open: false },
  ];
  const open = errors.filter((e) => e.open).length;
  return (
    <Screen title="Журнал" sub={open ? `${open} открытых ошибки. Закрываются повторной встречей.` : 'Открытых ошибок нет.'}>
      {open > 0 && (
        <Card accent>
          <Label>Приоритет</Label>
          <div className="mt-1 text-[15px] font-medium" style={{ color: 'var(--text)' }}>
            {errors[0].enemy}
          </div>
          <p className="mt-1 text-[12px]" style={{ color: 'var(--sub)' }}>
            Ошибка: {errors[0].atom}. В прошлый раз — {errors[0].evidence}.
          </p>
          <Primary label="Переиграть встречу" onClick={onGoArena} />
        </Card>
      )}
      <Label>Калибровка уверенности</Label>
      <Card>
        <div className="flex items-end gap-1" style={{ height: 56 }}>
          {[35, 52, 68, 80, 90].map((c, i) => {
            const real = [40, 50, 61, 66, 71][i];
            return (
              <div key={c} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-end gap-0.5" style={{ height: 40 }}>
                  <div className="flex-1 rounded-t" style={{ height: `${c}%`, background: 'var(--strong)' }} />
                  <div className="flex-1 rounded-t" style={{ height: `${real}%`, background: 'var(--accent)' }} />
                </div>
                <span className="text-[9px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  {c}%
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px]" style={{ color: 'var(--sub)' }}>
          При «Точно» ты прав в 71% случаев. Переоценка на 19 п.п. — ставь «Уверен».
        </p>
      </Card>
      <Label>Все записи</Label>
      <div className="divide-y rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
        {errors.map((e) => (
          <div key={e.enemy} className="flex items-center gap-3 px-3 py-2.5" style={{ borderColor: 'var(--border)' }}>
            <span className="h-2 w-2 rounded-full" style={{ background: e.open ? 'var(--bad)' : 'var(--good)' }} />
            <span className="flex-1 text-[13px]" style={{ color: 'var(--text)' }}>
              {e.enemy}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {e.atom}
            </span>
          </div>
        ))}
      </div>
    </Screen>
  );
}

/* КОЛЛЕКЦИЯ — враги как трофеи со стадиями; силуэт до победы. */
export function CollectionScreen({ epoch }: { epoch: EpochDef }) {
  const enemies = [
    { id: 'E05', name: 'FOMO-Шептун', stage: Math.min(epoch.index, 3), max: 3 },
    { id: 'E02', name: 'Ложный пробой', stage: epoch.index >= 2 ? 1 : 0, max: 3 },
    { id: 'E11', name: 'Кит-фантом', stage: epoch.index >= 3 ? 2 : 0, max: 4 },
    { id: 'E08', name: 'Плечо-соблазн', stage: 0, max: 3 },
    { id: 'E31', name: 'Левиафан', stage: 0, max: 1 },
    { id: 'E14', name: 'Ложный ярлык', stage: epoch.index >= 4 ? 1 : 0, max: 3 },
  ];
  return (
    <Screen title="Коллекция" sub="Враг раскрывается по стадиям. До первой победы — силуэт.">
      <div className="grid grid-cols-2 gap-2">
        {enemies.map((e) => {
          const known = e.stage > 0;
          return (
            <div key={e.id} className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
              <div className="mb-2 flex h-16 items-center justify-center rounded-lg" style={{ background: 'var(--elevated)' }}>
                <div className="h-10 w-10 rounded-full" style={{ background: known ? `color-mix(in srgb, var(--accent) ${30 + e.stage * 20}%, var(--strong))` : 'var(--strong)', filter: known ? 'none' : 'blur(1px)', opacity: known ? 1 : 0.5 }} />
              </div>
              <div className="text-[12px] font-medium" style={{ color: known ? 'var(--text)' : 'var(--muted)' }}>
                {known ? e.name : '???'}
              </div>
              <div className="mt-1 flex items-center gap-1">
                {Array.from({ length: e.max }).map((_, i) => (
                  <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < e.stage ? 'var(--accent)' : 'var(--border)' }} />
                ))}
              </div>
              <div className="mt-1 text-[9px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {e.id} · стадия {e.stage}/{e.max}
              </div>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}

/* ЕЩЁ — настройки, турниры, магазин: плоский список без визуального веса. */
export function MoreScreen({ epoch, player }: { epoch: EpochDef; player: PlayerState }) {
  const items = [
    { t: 'Турниры', s: epoch.index >= 3 ? 'Открыты · сезон 2' : 'Откроются в эпохе III', on: epoch.index >= 3 },
    { t: 'Магазин', s: epoch.index >= 4 ? `${player.sig} SIG` : 'Откроется в эпохе IV', on: epoch.index >= 4 },
    { t: 'Ежедневная разминка', s: '3 встречи · +8 XP', on: true },
    { t: 'Настройки', s: 'Звук, вибрация, размер текста', on: true },
    { t: 'О проекте', s: 'Signal Arena · v2', on: true },
  ];
  return (
    <Screen title="Ещё" sub="Всё второстепенное — здесь, а не на игровом экране.">
      <div className="divide-y rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
        {items.map((i) => (
          <div key={i.t} className="flex items-center gap-3 px-3 py-3" style={{ borderColor: 'var(--border)', opacity: i.on ? 1 : 0.5 }}>
            <div className="flex-1">
              <div className="text-[13px]" style={{ color: 'var(--text)' }}>
                {i.t}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                {i.s}
              </div>
            </div>
            <span style={{ color: 'var(--muted)' }}>›</span>
          </div>
        ))}
      </div>
    </Screen>
  );
}
