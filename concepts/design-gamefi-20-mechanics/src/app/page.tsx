import { desc } from "drizzle-orm";
import { db } from "@/db";
import { runs } from "@/db/schema";
import { brand, cults, economy, headlines, mechanics, priorVersions, roadmap, thesis } from "@/lib/content";
import { CultWarScreen, GhostScreen, LiveEncounterScreen, RaidMapScreen } from "@/components/phone/ScreensA";
import { AutopsyScreen, InsiderRaidScreen, TabloidScreen, VaultScreen } from "@/components/phone/ScreensB";
import Leaderboard from "@/components/Leaderboard";
import Votes from "@/components/Votes";
import { mechanicVotes } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function loadData() {
  const [rows, votes] = await Promise.all([
    db.select().from(runs).orderBy(desc(runs.capital), desc(runs.composure)).limit(20),
    db
      .select({ mechanicId: mechanicVotes.mechanicId, count: sql<number>`count(*)::int` })
      .from(mechanicVotes)
      .groupBy(mechanicVotes.mechanicId),
  ]);
  const tally: Record<string, number> = {};
  for (const m of mechanics) tally[m.id] = 0;
  for (const v of votes) tally[v.mechanicId] = v.count;
  return { rows, tally };
}

function Kicker({ children }: { children: string }) {
  return <div className="font-mono text-[11px] tracking-[0.16em] text-primary">{children}</div>;
}

function H2({ children }: { children: string }) {
  return <h2 className="mt-2 text-3xl font-black leading-[1.05] tracking-tight md:text-4xl">{children}</h2>;
}

const nav = [
  ["#analysis", "АНАЛИЗ"],
  ["#formula", "ФОРМУЛА"],
  ["#renders", "РЕНДЕРЫ"],
  ["#play", "ПРОТОТИП"],
  ["#economy", "ЭКОНОМИКА"],
  ["#roadmap", "ДОРОЖНАЯ КАРТА"],
];

export default async function HomePage() {
  const { rows, tally } = await loadData();

  return (
    <main className="min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-5">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-primary font-mono text-[10px] font-bold text-primary">v5</span>
            <span className="font-mono text-[12px] font-bold tracking-[0.12em]">{brand.name}</span>
          </div>
          <nav className="ml-auto hidden gap-5 md:flex">
            {nav.map(([h, l]) => (
              <a key={h} href={h} className="font-mono text-[10px] tracking-[0.12em] text-sub hover:text-primary">{l}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* TICKER */}
      <div className="overflow-hidden border-b border-border bg-paper text-ink">
        <div className="ticker flex w-max whitespace-nowrap py-1.5 font-mono text-[10px] font-bold tracking-[0.08em]">
          {[...headlines, ...headlines].map((h, i) => (
            <span key={i} className="px-6">◆ {h}</span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url(/ref/arena360.jpg)] bg-cover bg-center opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/70 to-bg" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <Kicker>КОНЦЕПТ-ДЕК · НОВАЯ КОМБИНАЦИЯ МЕХАНИК</Kicker>
            <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              ПРОТОКОЛ<br /><span className="text-primary">ПРИЗРАКА</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg font-bold text-text">{brand.tagline}</p>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-sub">{brand.sub}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#play" className="grid h-12 place-items-center rounded-xl bg-primary px-6 text-sm font-bold text-[#03110f]">СЫГРАТЬ ПРОТОТИП</a>
              <a href="#renders" className="grid h-12 place-items-center rounded-xl border border-strong px-6 text-sm font-bold text-text">СМОТРЕТЬ 8 РЕНДЕРОВ</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Roguelike", "AI-двойник", "Faction war", "Social deduction", "Narrative market", "AI-коуч", "Proof-of-Skill"].map((t) => (
                <span key={t} className="rounded-full border border-border bg-surface/70 px-3 py-1 font-mono text-[10px] text-sub">{t}</span>
              ))}
            </div>
          </div>
          <div className="paper self-center rounded-xl p-5 shadow-2xl md:rotate-1">
            <div className="flex justify-between border-b border-ink/20 pb-1 font-mono text-[9px] font-bold tracking-[0.15em] text-ink/60">
              <span>ДЕПАРТАМЕНТ УПРАВЛЯЕМОЙ ПАНИКИ</span><span>СПЕЦВЫПУСК</span>
            </div>
            <div className="tabloid-title mt-3 text-3xl leading-[0.92]">Игрок обучил ИИ-клона. Клон торгует лучше. Игрок требует долю</div>
            <p className="mt-3 text-[12px] leading-snug text-ink/80">
              В GameFi 1.0 продавали землю, которой не было, и мечи, которые не рубили. В v5 единственный актив — измеренный навык, упакованный в Призрака. Он не обнуляется в медвежий сезон. Обнуляется только лень владельца. Регуляторы обеспокоены.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-ink/20 pt-2 font-mono text-[9px] text-ink/70">
              <div><b className="block text-[16px] text-ink">6</b>механик</div>
              <div><b className="block text-[16px] text-ink">24</b>врага из v3</div>
              <div><b className="block text-[16px] text-ink">3</b>контура дохода</div>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYSIS */}
      <section id="analysis" className="mx-auto max-w-7xl px-5 py-20">
        <Kicker>01 · АНАЛИЗ РЕПОЗИТОРИЯ ARENAUI</Kicker>
        <H2>Что было в v1–v4 и что из этого мы забираем</H2>
        <p className="mt-3 max-w-2xl text-[15px] text-sub">
          Разобраны 27 рендеров, дизайн-система «Terminal 1.0», контракты компонентов, 12 экранов и 9 групп промптов. Вывод: ядро encounter и визуальный язык сильны; не хватает мира, ставок и социального давления.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {priorVersions.map((v) => (
            <div key={v.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] tracking-wider text-muted">{v.formula}</div>
                  <h3 className="mt-1 text-lg font-bold">{v.title}</h3>
                </div>
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] text-muted">{v.id}</span>
              </div>
              <p className="mt-2 text-[13px] text-sub">{v.core}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="font-mono text-[9px] tracking-wider text-good">ЗАБИРАЕМ</div>
                  <ul className="mt-1 space-y-0.5 text-[12px] text-text">{v.kept.map((k) => <li key={k}>+ {k}</li>)}</ul>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-wider text-bad">ОТБРАСЫВАЕМ</div>
                  <ul className="mt-1 space-y-0.5 text-[12px] text-sub">{v.dropped.map((k) => <li key={k}>− {k}</li>)}</ul>
                </div>
              </div>
              <div className="paper mt-3 rounded-lg px-3 py-2 text-[12px] font-bold" style={{ borderLeft: "4px solid var(--color-warn)" }}>{v.verdict}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            ["ПРОБЛЕМА 1 · НЕТ СТАВКИ", "В v2 одна попытка и статичный снапшот. Ошибка ничего не стоит завтра. Обучение без последствий не переносится."],
            ["ПРОБЛЕМА 2 · НЕТ МИРА", "24 великолепных врага позируют в коллекции. Город на арте есть, в игре — нет. Культы упомянуты в тоне, но не в механике."],
            ["ПРОБЛЕМА 3 · НЕТ АКТИВА", "Web3 заперт до «после GO». Но GameFi 2.0 — не токен поверх игры, а игра, где актив рождается из навыка. Это надо закладывать в ядро."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-bad/30 bg-bad/5 p-4">
              <div className="font-mono text-[10px] tracking-wider text-bad">{t}</div>
              <p className="mt-1 text-[13px] text-sub">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FORMULA */}
      <section id="formula" className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Kicker>02 · НОВАЯ ФОРМУЛА</Kicker>
          <H2>Шесть механик, один цикл: рейд → вскрытие → призрак → культ</H2>
          <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-lg border border-border bg-inset px-3 py-2 text-muted line-through">33% терминал + 33% карты + 33% Duolingo</span>
            <span className="text-primary">→</span>
            <span className="rounded-lg border border-primary bg-primary/10 px-3 py-2 text-primary">Roguelike × AI-двойник × война культов × social deduction × нарративный рынок × AI-коуч</span>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mechanics.map((m) => (
              <div key={m.id} className="flex flex-col rounded-2xl border border-border bg-surface p-5" style={{ borderTop: `3px solid ${m.color}` }}>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] text-muted">{m.num}</span>
                  <span className="font-mono text-[9px] tracking-wider text-muted">{m.genre}</span>
                </div>
                <h3 className="mt-2 text-2xl font-black tracking-tight" style={{ color: m.color }}>{m.name}</h3>
                <p className="mt-2 text-[14px] font-bold leading-snug text-text">{m.hook}</p>
                <p className="mt-2 text-[13px] leading-snug text-sub">{m.how}</p>
                <div className="mt-auto pt-3">
                  <div className="font-mono text-[9px] tracking-wider text-good">ЧЕМУ УЧИТ</div>
                  <p className="text-[12px] text-text">{m.learns}</p>
                </div>
              </div>
            ))}
          </div>

          {/* loop */}
          <div className="mt-10 rounded-2xl border border-border bg-inset p-6">
            <div className="font-mono text-[10px] tracking-[0.14em] text-primary">ЦИКЛ ОДНОГО ДНЯ ИГРОКА</div>
            <div className="mt-4 grid gap-3 md:grid-cols-6">
              {[
                ["07:40", "ГАЗЕТА", "Читает выпуск, ставит Веру на нарратив дня.", "var(--color-context)"],
                ["07:45", "РЕЙД · 12 МИН", "Проходит город, собирает колоду, встречает Кита.", "var(--color-primary)"],
                ["07:58", "ВСКРЫТИЕ", "Получает протокол: враг, ошибка, тренировка.", "var(--color-good)"],
                ["08:00", "ПРИЗРАК", "Дельта черт записана. Призрак стал чуть другим.", "var(--color-cognitive)"],
                ["21:00", "ИНСАЙДЕР", "Кооп-рейд с культом. Разоблачает предателя.", "var(--color-human)"],
                ["03:00", "НОЧНАЯ СМЕНА", "Призрак играет в лиге. Утром — отчёт и $SIG.", "var(--color-crypto)"],
              ].map(([t, n, d, c], i) => (
                <div key={n} className="relative rounded-xl border border-border bg-surface p-3">
                  <div className="font-mono text-[9px] text-muted">{t}</div>
                  <div className="mt-1 font-mono text-[11px] font-bold" style={{ color: c }}>{n}</div>
                  <p className="mt-1 text-[12px] leading-snug text-sub">{d}</p>
                  {i < 5 && <span className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-muted md:block">›</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RENDERS */}
      <section id="renders" className="mx-auto max-w-7xl px-5 py-20">
        <Kicker>03 · РЕНДЕРЫ ИНТЕРФЕЙСОВ · 390×844</Kicker>
        <H2>Восемь экранов на дизайн-системе Terminal 1.0</H2>
        <p className="mt-3 max-w-2xl text-[15px] text-sub">
          Сохранены все инварианты v4: top bar 56px, 4 равные nav-вкладки, paper-карточка ситуации, Browser Widget, скрытый враг, компактные skill cards, reveal overlay, reduced motion. Добавлены ресурс рейда, ИИ-двойник, карта города и кооп.
        </p>
        <div className="mt-10 grid justify-items-center gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
          <RaidMapScreen />
          <LiveEncounterScreen />
          <GhostScreen />
          <CultWarScreen />
          <InsiderRaidScreen />
          <TabloidScreen />
          <AutopsyScreen />
          <VaultScreen />
        </div>
      </section>

      {/* CULTS */}
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <Kicker>ФРАКЦИИ</Kicker>
          <H2>Шесть культов — шесть школ мышления о рынке</H2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cults.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-surface p-4" style={{ borderLeft: `4px solid ${c.color}` }}>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold" style={{ color: c.color }}>{c.sigil} {c.name}</div>
                  <span className="font-mono text-[10px] text-muted">{c.control}% города</span>
                </div>
                <div className="mt-0.5 font-mono text-[9px] tracking-wider text-muted">{c.district.toUpperCase()}</div>
                <p className="mt-2 text-[13px] italic text-sub">«{c.doctrine}»</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLAYABLE */}
      <section id="play" className="mx-auto max-w-7xl px-5 py-20">
        <Kicker>04 · ИГРАБЕЛЬНЫЙ ПРОТОТИП · ЯДРО РЕЙДА</Kicker>
        <H2>Пять узлов, шесть врагов, один Кит. Результат пишется в базу</H2>
        <p className="mt-3 max-w-2xl text-[15px] text-sub">
          Минимальный срез механики 01 + 06: ресурс «хладнокровие», рука карт, размер позиции, четыре действия, скрытый враг, вердикт, дельта черт Призрака. Каждый враг — реальная ловушка из бестиария v3.
        </p>
        <div className="mt-10">
          <Leaderboard initial={rows} />
        </div>
      </section>

      {/* ECONOMY */}
      <section id="economy" className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Kicker>05 · GAMEFI 2.0 · ЭКОНОМИКА И ИИ</Kicker>
          <H2>Актив, который не обнуляется в медвежий сезон</H2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {economy.map((e) => (
              <div key={e.title} className="rounded-2xl border border-border bg-surface p-5">
                <span className="rounded-full border border-warn/50 px-2 py-0.5 font-mono text-[9px] text-warn">{e.tag}</span>
                <h3 className="mt-3 text-base font-black tracking-tight">{e.title}</h3>
                <p className="mt-2 text-[13px] leading-snug text-sub">{e.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {thesis.map((t) => (
              <div key={t.k} className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                <div className="font-mono text-3xl font-black text-primary">{t.k}</div>
                <p className="mt-2 text-[12px] leading-snug text-sub">{t.v}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-inset p-5">
              <div className="font-mono text-[10px] tracking-[0.14em] text-cognitive">ГДЕ ИМЕННО ИИ</div>
              <ul className="mt-3 space-y-2 text-[13px] text-sub">
                <li><b className="text-text">Генератор рейдов.</b> Модель, обученная на исторических циклах, собирает город: последовательность ловушек, свечи, стакан, фандинг — согласованные между собой.</li>
                <li><b className="text-text">Газета.</b> LLM с тоном «Департамента» пишет выпуск дня из сгенерированных событий. Заголовок всегда серьёзный, концовка — нет.</li>
                <li><b className="text-text">Призрак.</b> Лёгкая policy-модель на решениях игрока (действие, размер, карты, время). Черты — интерпретируемые метрики, а не чёрный ящик.</li>
                <li><b className="text-text">Вскрытие.</b> LLM-коуч поверх структурированного лога: враг, ошибка, сравнение, одна тренировка.</li>
                <li><b className="text-text">Инсайдер-бот.</b> Когда людей не хватает, предателя играет ИИ, калиброванный под уровень группы.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-inset p-5">
              <div className="font-mono text-[10px] tracking-[0.14em] text-bad">ЧТО ЗАЩИЩАЕТ ОТ GAMEFI 1.0</div>
              <ul className="mt-3 space-y-2 text-[13px] text-sub">
                <li><b className="text-text">Нет эмиссии за активность.</b> Только за калибровку. Фермить кликами невозможно — Brier score не фермится.</li>
                <li><b className="text-text">Нет P2W.</b> Всё, что за деньги, не влияет на исход. Проверяется автоматически на каждом релизе.</li>
                <li><b className="text-text">Нет реальной торговли.</b> Рынок симулирован. Это образование и спорт, а не брокер.</li>
                <li><b className="text-text">Обратимость.</b> Каждая Web3-часть отключается флагом без потери ядра. Игра работает и без токена.</li>
                <li><b className="text-text">Три контура дохода.</b> Ни один не завязан на цену $SIG. Медвежий сезон — не смерть продукта.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP + VOTES */}
      <section id="roadmap" className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <Kicker>06 · ДОРОЖНАЯ КАРТА</Kicker>
            <H2>Пять фаз. Web3 — последней, и только после GO</H2>
            <ol className="mt-8 space-y-3">
              {roadmap.map((r, i) => (
                <li key={r.t} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary font-mono text-[11px] font-bold text-primary">{i}</span>
                  <div>
                    <div className="font-mono text-[9px] tracking-wider text-muted">{r.q}</div>
                    <div className="text-base font-bold">{r.t}</div>
                    <p className="mt-0.5 text-[13px] text-sub">{r.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <Kicker>ГОЛОСОВАНИЕ · ЧТО СТРОИТЬ ПЕРВЫМ</Kicker>
            <H2>Комитет по перераспределению приоритетов</H2>
            <p className="mt-3 text-[14px] text-sub">Голоса сохраняются в PostgreSQL. Используй для командного обсуждения, какую механику выносить в вертикальный срез.</p>
            <div className="mt-6">
              <Votes initial={tally} />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 font-mono text-[10px] text-muted md:flex-row md:justify-between">
          <span>{brand.name} · {brand.version}</span>
          <span>Игра не гарантирует доход и не является торговым сервисом. Волатильность временная. Твоя ошибка — навсегда.</span>
        </div>
      </footer>
    </main>
  );
}
