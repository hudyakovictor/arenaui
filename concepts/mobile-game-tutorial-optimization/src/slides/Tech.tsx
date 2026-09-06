import { Card, Chip, Code, Eyebrow, Lead, Title } from "../components/ui";
import { stackTable } from "../data/audit";
import { cn } from "../utils/cn";

export function StackSlide() {
  const icon = (s: string) => (s === "yes" ? "●" : s === "partial" ? "◐" : "○");
  const tone = (s: string) => (s === "yes" ? "text-good" : s === "partial" ? "text-warn" : "text-bad");
  const yes = stackTable.filter((s) => s.status === "yes").length;
  const part = stackTable.filter((s) => s.status === "partial").length;
  return (
    <div>
      <Eyebrow>Исправления · Стек</Eyebrow>
      <Title className="mt-2">ТЗ перечисляет 9 технологий. Полностью выполнена — ни одна</Title>
      <Lead className="mt-3">
        Оценщик проверяет соответствие заявленному стеку почти механически. Каждая строка «нет» — минус сразу в нескольких
        категориях: и в стеке, и в тестах, и в релизе. package.json клиента содержит одну зависимость.
      </Lead>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[auto_1fr_1.2fr] bg-inset font-mono text-[11px] uppercase tracking-wider text-muted">
            <div className="px-4 py-2.5">·</div>
            <div className="px-3 py-2.5">Пункт ТЗ</div>
            <div className="px-3 py-2.5">Факт в репозитории</div>
          </div>
          {stackTable.map((r, i) => (
            <div key={r.item} className={cn("grid grid-cols-[auto_1fr_1.2fr] items-center border-t border-border text-[13px] anim-in", `delay-${Math.min(6, i + 1)}`)}>
              <div className={cn("px-4 py-2.5 text-lg", tone(r.status))}>{icon(r.status)}</div>
              <div className="px-3 py-2.5 font-medium">{r.item}</div>
              <div className="px-3 py-2.5 text-sub">{r.note}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Card className="anim-in delay-2">
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Итого</div>
            <div className="mt-2 flex items-baseline gap-2 font-display text-3xl">
              <span className="text-good">{yes}</span>
              <span className="text-muted text-lg">/</span>
              <span className="text-warn">{part}</span>
              <span className="text-muted text-lg">/</span>
              <span className="text-bad">{stackTable.length - yes - part}</span>
            </div>
            <div className="mt-1 font-mono text-[11px] text-muted">полностью / частично / нет</div>
          </Card>
          <Card className="anim-in delay-3" accent="#ffb341">
            <div className="font-semibold">Решение по Phaser</div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-sub">
              Phaser 4 — свежий мажор, rexUI под него не стабилизирован. Два честных пути: <span className="text-text">(а)</span> откатиться на
              phaser@3.80 и взять rexUI как в ТЗ; <span className="text-text">(б)</span> остаться на 4, написать 6 своих UI-примитивов и
              согласовать отклонение письменно. Решение — первый день спринта 3.
            </p>
          </Card>
          <Card className="anim-in delay-4">
            <div className="font-semibold">package.json после</div>
            <Code>{`"dependencies": {
  "phaser": "3.80.1",
  "phaser3-rex-plugins": "^1.80",
  "zustand": "^5",
  "seedrandom": "^3"
},
"devDependencies": {
  "vitest", "@playwright/test",
  "vite-plugin-pwa", "eslint",
  "prettier", "husky", "cspell"
}`}</Code>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function PerfSlide() {
  return (
    <div>
      <Eyebrow>Исправления · Производительность</Eyebrow>
      <Title className="mt-2">Утечка объектов и график из прямоугольников</Title>
      <Lead className="mt-3">
        На среднем Android через 10 минут игры Арена начнёт дёргаться — не из-за сложности, а из-за того, что старые объекты никогда не
        удаляются, а каждая свеча — это 3–4 GameObject с собственной hit-зоной.
      </Lead>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card accent="#ff596d" className="anim-in delay-1">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Сейчас: «стирание» рисованием поверх</div>
            <Chip tone="bad">утечка</Chip>
          </div>
          <Code>{`private refreshEvidenceStrip(){
  // стираем область
  this.add.rectangle(58,ey+1,160,16, C.surface).setOrigin(0);
  this.add.text(58,ey+5, chips.slice(0,32), {...});
}
// вызывается на каждый тап по улике`}</Code>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              ["50 тапов", "+100 объектов"],
              ["1 сессия", "+1 200 объектов"],
              ["draw calls", "растут линейно"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-lg border border-bad/30 bg-bad/5 p-2">
                <div className="font-mono text-[11px] text-muted">{a}</div>
                <div className="text-[13px] font-semibold text-bad">{b}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card accent="#3bde8a" className="anim-in delay-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold">После: ссылки и обновление</div>
            <Chip tone="good">O(1)</Chip>
          </div>
          <Code>{`class EvidenceStrip extends Container {
  private label: Text;
  constructor(scene){ this.label = scene.add.text(...); }
  update(ids: string[]){
    this.label.setText(ids.join(' · ') || t('evidence.empty'));
  }
}
// подписка: store.subscribe(s => s.evidence, ids => strip.update(ids))`}</Code>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              ["50 тапов", "+0 объектов"],
              ["children.length", "константа"],
              ["тест", "assert stable"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-lg border border-good/30 bg-good/5 p-2">
                <div className="font-mono text-[11px] text-muted">{a}</div>
                <div className="text-[13px] font-semibold text-good">{b}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="anim-in delay-3">
          <div className="font-semibold">CandleChart на Graphics</div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-sub">
            Один объект `Graphics`, redraw по dirty-флагу. Hit-test — по индексу свечи из X-координаты, без отдельных зон. Зум и пан —
            жестами. Ровно то, что просит ТЗ вместо lightweight-charts.
          </p>
        </Card>
        <Card className="anim-in delay-4">
          <div className="font-semibold">Никакого scene.restart()</div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-sub">
            Перезапуск сцены на каждый ответ — это пересоздание ~200 объектов и потеря позиции скролла, вкладки, анимаций. Стор + точечные
            обновления снимают проблему целиком.
          </p>
        </Card>
        <Card className="anim-in delay-5">
          <div className="font-semibold">Бюджеты в CI</div>
          <ul className="mt-1.5 space-y-1 text-[13px] text-sub">
            <li>• 60 fps на Pixel 4a (Playwright trace)</li>
            <li>• бандл ≤ 1.5 MB gzip, атласы вместо файлов</li>
            <li>• `scene.children.length` — снимок до/после 100 действий</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function BackendSlide() {
  const endpoints = [
    ["POST /auth/device", "гостевой вход по deviceId", 1],
    ["GET /progress", "гидратация стора при старте", 1],
    ["GET /task/next", "seed + шаблон с сервера", 1],
    ["POST /task/submit", "серверная валидация ответа, XP/SIG", 1],
    ["GET /journal", "свиток ошибок", 2],
    ["WS /arena/shadow", "«как ответили другие» в реальном времени", 2],
    ["GET /academy/cards", "карты и ранги", 2],
    ["GET /daily", "разминка дня (офлайн-кэш)", 3],
  ];
  return (
    <div>
      <Eyebrow>Исправления · Backend</Eyebrow>
      <Title className="mt-2">36 роутов написаны — и ни один не вызван</Title>
      <Lead className="mt-3">
        Сервер уже умеет считать детерминированный seed, валидировать тело через Zod и выдавать ETag. Клиент про это не знает: играет на
        моках, хранит прогресс в localStorage и сам решает, верен ли ответ. Значит, «Proof of Skill» пока ничего не доказывает.
      </Lead>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="anim-in delay-1">
          <div className="font-semibold">Мост клиент → API: порядок подключения</div>
          <div className="mt-3 space-y-1.5">
            {endpoints.map(([e, d, w]) => (
              <div key={e} className="flex items-center gap-3 rounded-lg border border-border bg-inset px-3 py-2">
                <span className="font-mono text-[12px] text-accent w-40 shrink-0">{e}</span>
                <span className="flex-1 text-[13px] text-sub">{d}</span>
                <Chip tone={w === 1 ? "accent" : "muted"}>нед. {w}</Chip>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-3">
          <Card accent="#ffb341" className="anim-in delay-2">
            <div className="font-semibold">Документация ≠ код</div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-sub">
              README: «Fastify + SQLite + Drizzle». Код `http/index.ts`: `Response.json(...)`, `ctx.params: Promise` — это сигнатуры
              Next.js Route Handlers. Оценщик открывает README, открывает код, ставит минус за несоответствие.
            </p>
            <Code>{`export function handler(fn: (req: Request, ctx: Ctx) => Promise<Response>)
export async function params<T>(ctx: { params: Promise<T> | T })`}</Code>
          </Card>
          <Card accent="#ff596d" className="anim-in delay-3">
            <div className="font-semibold">Безопасность: три быстрых правки</div>
            <ul className="mt-1.5 space-y-1.5 text-[13px] text-sub">
              <li>
                • <span className="font-mono text-bad">JWT_SECRET ?? 'signal-arena-dev-secret-change-me'</span> → fail-fast в production
              </li>
              <li>• TTL токена 90 дней → access 15 мин + refresh 7 дней</li>
              <li>• CORS allowlist и проверка Origin на WS-upgrade</li>
            </ul>
          </Card>
          <Card className="anim-in delay-4">
            <div className="font-semibold">Детерминизм в один шаг</div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-sub">
              На сервере уже есть <span className="font-mono text-accent">deterministicSeed(userId, level, idx)</span>. Клиент должен
              получать seed оттуда, а офлайн — считать тем же алгоритмом через seedrandom. Тогда любую задачу можно воспроизвести, а любой
              ответ — проверить.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
