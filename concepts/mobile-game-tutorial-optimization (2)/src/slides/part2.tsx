import { Slide, Card, Tag, StatusDot, Code } from '../components/ui';
import { archBefore, archAfter, typeScale, mechanics, learningLoop, toneTable } from '../data/audit';

export function ArchitectureSlide() {
  return (
    <Slide kicker="05 · Архитектура" title="Из god-scene в компоненты" subtitle="Одна сцена делает всё: раскладку, данные, анимации, хардкод и debug. Цель — сцена собирает, компоненты рисуют, стор хранит.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card accent="#FF596D">
          <div className="mb-3 flex items-center gap-2">
            <Tag color="#FF596D">сейчас</Tag>
            <span className="text-sm text-slate-400">ArenaScene.ts</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {archBefore.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-rose-400">✕</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card accent="#3BDE8A">
          <div className="mb-3 flex items-center gap-2">
            <Tag color="#3BDE8A">цель</Tag>
            <span className="text-sm text-slate-400">scenes/ + components/ + store/</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {archAfter.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Code>{`// components/EvidenceStrip.ts
export class EvidenceStrip extends Container {
  private chips: Text;
  update(ids: string[]) {
    this.chips.setText(ids.join(' · ') || 'Тапни зону');
  }
}`}</Code>
        <Code>{`// store/useGame.ts (Zustand vanilla)
export const game = createStore<GameState>()(
  persist((set) => ({ ... }), {
    name: 'sa:v3', version: 3, migrate })
);
game.subscribe(s => s.selected, strip.update);`}</Code>
        <Code>{`// engine/seed.ts
import seedrandom from 'seedrandom';
export const rngFor = (s: string) =>
  seedrandom(s); // "u42:L7:a3" — с сервера
// никакого Date.now()`}</Code>
      </div>
    </Slide>
  );
}

export function MobileTypoSlide() {
  return (
    <Slide kicker="06 · Mobile UX + типографика" title="Читаемо и нажимаемо" subtitle="Самая дешёвая и самая заметная правка: 6 размеров шрифта вместо 12, touch-цели 44 pt, холст под любой телефон.">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-slate-400">Типографическая шкала</div>
          <div className="space-y-2">
            {typeScale.map((t) => (
              <div key={t.name} className="flex items-baseline gap-3 border-b border-white/5 pb-2 last:border-0">
                <div className="w-16 font-mono text-[11px] text-cyan-300">{t.name}</div>
                <div className="w-14 font-mono text-[11px] text-slate-500">{t.px} px</div>
                <div className="truncate font-semibold text-white" style={{ fontSize: Math.min(t.px, 26) }}>
                  Улика найдена
                </div>
                <div className="ml-auto hidden text-right text-xs text-slate-400 sm:block">{t.use}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-end gap-4 rounded-lg border border-rose-400/30 bg-rose-400/5 p-3">
            <div>
              <div className="font-mono text-[10px] text-rose-300">сейчас</div>
              <div className="text-[7px] text-slate-300">M1: выбери улику в источнике, затем ответ — иначе неполная награда</div>
            </div>
            <div className="text-slate-500">→</div>
            <div>
              <div className="font-mono text-[10px] text-emerald-300">цель</div>
              <div className="text-[14px] text-slate-100">Улика → ответ. Без улики награда меньше</div>
            </div>
          </div>
        </Card>
        <div className="grid gap-3">
          {[
            { t: 'Холст', d: 'Scale.RESIZE вместо FIT 390×844. Ширина 360–430, высота любая, safe-area через env(). resolution = DPR.', c: '#31D6C4' },
            { t: 'Touch-цели', d: 'Минимум 44×44 pt: строки улик 48 px, чекбоксы 24 px + hit-area 44, вкладки 48 px, кнопка ответа 56 px.', c: '#3BDE8A' },
            { t: 'Состояния', d: 'pressed (scale .96), disabled (alpha .4), loading (спиннер), success/error. Haptic на подтверждение.', c: '#FFB341' },
            { t: 'Длинный текст', d: 'Академия и разбор: скролл-панель rexUI + иконка «развернуть» на весь экран (по ТЗ).', c: '#A78BFA' },
            { t: 'Шаги задачи', d: 'Индикатор 1/4 → 4/4: улика · ответ · ставка · разбор. Главная кнопка всегда внизу.', c: '#F472B6' },
          ].map((x) => (
            <Card key={x.t} accent={x.c} className="py-3">
              <div className="text-sm font-semibold text-white">{x.t}</div>
              <div className="mt-1 text-[13px] text-slate-400">{x.d}</div>
            </Card>
          ))}
        </div>
      </div>
    </Slide>
  );
}

export function MechanicsSlide() {
  return (
    <Slide kicker="07 · Механики" title="M1–M15: что работает, что заглушка" subtitle="README обещает 15 механик. Реально работают 4, семь — частично, четыре — заглушки или отсутствуют. Оценщик проверяет каждую.">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {mechanics.map((m) => (
          <div key={m.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
            <div className="w-10 shrink-0 font-mono text-sm font-bold text-cyan-300">{m.id}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-semibold text-white">{m.name}</div>
                <StatusDot status={m.status as 0 | 1 | 2} />
              </div>
              <div className="mt-0.5 text-[12px] leading-snug text-slate-400">{m.note}</div>
            </div>
          </div>
        ))}
      </div>
    </Slide>
  );
}

export function LearningSlide() {
  return (
    <Slide kicker="08 · Обучение" title="Петля Duolingo: урок → задача → разбор → повтор" subtitle="Главная цель игры — научить. Сейчас после ошибки игрок видит одну строку. Нужен разбор, повторение и видимый прогресс навыков.">
      <div className="grid gap-3 md:grid-cols-5">
        {learningLoop.map((s, i) => (
          <Card key={s.step} className="relative">
            <div className="absolute right-3 top-3 font-mono text-[10px] text-slate-600">0{i + 1}</div>
            <div className="text-3xl">{s.icon}</div>
            <div className="mt-2 text-base font-semibold text-white">{s.step}</div>
            <div className="mt-1 text-[13px] leading-snug text-slate-400">{s.desc}</div>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Card accent="#3BDE8A">
          <div className="text-sm font-semibold text-white">Разбор после каждого ответа</div>
          <ul className="mt-2 space-y-1 text-[13px] text-slate-400">
            <li>• Подсветить улику на графике, которую игрок пропустил</li>
            <li>• Одно предложение: почему ловушка сработала</li>
            <li>• Ссылка на микроурок и карту-навык</li>
            <li>• «Повторить без штрафа» — сразу</li>
          </ul>
        </Card>
        <Card accent="#FFB341">
          <div className="text-sm font-semibold text-white">Интервальное повторение</div>
          <ul className="mt-2 space-y-1 text-[13px] text-slate-400">
            <li>• Ошибка попадает в свиток с датой повтора: +1, +3, +7, +21 день</li>
            <li>• Разминка дня = 3 повтора + 1 новая задача</li>
            <li>• Атом закрывается после 3 верных подряд</li>
            <li>• Мастер-чек эпохи — только из закрытых атомов</li>
          </ul>
        </Card>
        <Card accent="#59A7FF">
          <div className="text-sm font-semibold text-white">Видимый прогресс</div>
          <ul className="mt-2 space-y-1 text-[13px] text-slate-400">
            <li>• Радар навыков: структура, объём, риск, источники, психология</li>
            <li>• График калибровки: уверенность vs точность</li>
            <li>• Карта кампании с 33 врагами и стадиями</li>
            <li>• Цель дня и недели, серия</li>
          </ul>
        </Card>
      </div>
    </Slide>
  );
}

export function ToneSlide() {
  return (
    <Slide kicker="09 · Тексты" title="Игрок не должен видеть «M3» и «ТЗ Часть 3»" subtitle="Внутренние метки механик, цитаты из документов и англо-русская смесь — это черновик. Все строки выносим в словарь и переписываем по правилам тона.">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] font-mono text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 w-1/2">Сейчас в интерфейсе</th>
              <th className="px-4 py-3">После</th>
            </tr>
          </thead>
          <tbody>
            {toneTable.map((r) => (
              <tr key={r.before} className="border-t border-white/5">
                <td className="px-4 py-2 font-mono text-[12px] text-rose-300/90">{r.before}</td>
                <td className="px-4 py-2 text-slate-100">{r.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Tag color="#31D6C4">i18n: ru.json + en.json</Tag>
        <Tag color="#31D6C4">lint-правило: нет строк в сценах</Tag>
        <Tag color="#31D6C4">глоссарий: Улика · Стек · Ставка · Погода · Свиток</Tag>
        <Tag color="#31D6C4">иконки вместо emoji 🔒</Tag>
        <Tag color="#31D6C4">вычитка редактором перед релизом</Tag>
      </div>
    </Slide>
  );
}

export function BackendSlide() {
  return (
    <Slide kicker="10 · Backend" title="Мост клиент → сервер" subtitle="Сервер готов на 70 %, но игра его не знает. Без моста нет античита, турниров, тени арены и синхронизации между устройствами.">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-slate-400">Поток одной задачи</div>
          <ol className="space-y-2 text-sm text-slate-300">
            {[
              ['POST /v1/encounters', 'сервер выдаёт сид, шаблон и стадию — клиент только мутирует и рисует'],
              ['клиент', 'улика → ответ → ставка; всё копится в локальной очереди'],
              ['POST /v1/encounters/:id/answer', 'сервер считает скоринг, XP, бюджет — клиент показывает'],
              ['GET /v1/shadow/:templateId', 'реальное распределение ответов вместо [12,58,22,8]'],
              ['WS /v1/live', 'турниры, лидерборд, события Левиафана'],
              ['offline', 'очередь в IndexedDB, при сети — replay с идемпотентными ключами'],
            ].map(([a, b], i) => (
              <li key={a} className="flex gap-3">
                <span className="font-mono text-xs text-cyan-300">{i + 1}</span>
                <div>
                  <span className="font-mono text-[12px] text-amber-200/90">{a}</span>
                  <span className="text-slate-400"> — {b}</span>
                </div>
              </li>
            ))}
          </ol>
        </Card>
        <div className="grid gap-3">
          {[
            ['Общий пакет типов', 'packages/shared: Encounter, Verdict, Progress — один Zod-схемой для клиента и сервера.'],
            ['Авторизация ступенями', 'Гость (device id) → email/Telegram → кошелёк по желанию. Web3 не барьер входа.'],
            ['Античит', 'Сид и скоринг только на сервере. localStorage — кэш, а не источник правды.'],
            ['Эксплуатация', 'SQLite на диске + бэкап, rate-limit, OpenAPI, Docker, health-check, логи.'],
          ].map(([t, d]) => (
            <Card key={t} className="py-3">
              <div className="text-sm font-semibold text-white">{t}</div>
              <div className="mt-1 text-[13px] text-slate-400">{d}</div>
            </Card>
          ))}
        </div>
      </div>
    </Slide>
  );
}

export function MotionSlide() {
  const items = [
    ['Переход сцены', 'fade 200 мс + сдвиг контента 16 px по направлению навигации'],
    ['Появление блоков', 'stagger 40 мс сверху вниз, alpha 0→1, y +8→0'],
    ['Кнопка', 'down: scale .96 за 80 мс; up: пружина обратно; disabled без анимации'],
    ['Улика', 'зона вспыхивает, чип летит в полосу улик (300 мс, cubic-out)'],
    ['График доигрывает', 'свечи появляются по одной 120 мс, линия «твоя vs верная»'],
    ['Раскрытие врага', 'силуэт → портрет: маска снизу вверх 400 мс + имя печатается'],
    ['Награда', 'XP тикает 600 мс, монеты летят в топбар, бюджет плавно меняется'],
    ['Серия', 'streak-огонёк пульсирует при ×3, ×5, ×10'],
    ['Смена эпохи', 'токены палитры перекрашиваются твином 800 мс, девиз печатается'],
    ['Звук', '8 SFX: тап, улика, верно, неверно, награда, серия, эпоха, Левиафан'],
  ];
  return (
    <Slide kicker="11 · Анимации и отклик" title="Что двигается и куда" subtitle="ТЗ отдельно требует продумать движение каждого интерактивного элемента. Сейчас — два вызова flash и shake. Ниже — карта движений по методу 20/70.">
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([t, d]) => (
          <div key={t} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5">
            <div className="w-40 shrink-0 text-sm font-semibold text-white">{t}</div>
            <div className="text-[13px] text-slate-400">{d}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Tag color="#22D3EE">easing: cubic-out / back-out</Tag>
        <Tag color="#22D3EE">длительности 150–400 мс</Tag>
        <Tag color="#22D3EE">reduce-motion в настройках</Tag>
        <Tag color="#22D3EE">анимации не блокируют ввод</Tag>
        <Tag color="#22D3EE">без анимаций персонажей (ТЗ)</Tag>
      </div>
    </Slide>
  );
}

export function TestingSlide() {
  return (
    <Slide kicker="12 · Тесты и CI" title="Из 0 тестов в quality-gate" subtitle="Категория с самым низким счётом (2/100) и самым быстрым ростом: детерминированный движок тестируется идеально.">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card accent="#34D399">
          <div className="text-sm font-semibold text-white">Vitest — unit</div>
          <ul className="mt-2 space-y-1 text-[13px] text-slate-400">
            <li>• mutate(tpl, seed) одинаков при одном сиде</li>
            <li>• scoreEncounter: таблица 40 кейсов</li>
            <li>• epochOf, balanceConfig, стор и миграции</li>
            <li>• Симуляция 1 000 партий: экономика не улетает</li>
          </ul>
        </Card>
        <Card accent="#60A5FA">
          <div className="text-sm font-semibold text-white">Playwright — e2e</div>
          <ul className="mt-2 space-y-1 text-[13px] text-slate-400">
            <li>• Онбординг → первая задача → награда</li>
            <li>• Смена эпохи на L20 → L21</li>
            <li>• Навигация по 12 сценам, назад везде</li>
            <li>• Скриншоты 360×800 и 430×932</li>
          </ul>
        </Card>
        <Card accent="#FACC15">
          <div className="text-sm font-semibold text-white">GitHub Actions</div>
          <Code className="mt-2">{`on: [push, pull_request]
jobs:
  quality:
    - npm ci
    - npm run lint
    - npm run typecheck
    - npm test -- --coverage
    - npx playwright test
    - npm run build
    - deploy preview (PR)`}</Code>
        </Card>
      </div>
    </Slide>
  );
}
