import { useState } from 'react';
import ArenaMock from './ArenaMock';
import LegacySchematic from './LegacySchematic';
import Phone from './Phone';
import { EPOCH_ORDER, THEMES, type EpochId } from './themes';

const NOW = [
  {
    n: '1 · Эпоха',
    t: '4 эпохи по диапазонам уровней: street 1–20, cabinet 21–50, terminal 51–80, system 81–99. Скелет из 12 сцен Phaser и раскладка 390×844 не меняются — меняются только токены: цвета, шрифты, текстуры, декор.',
  },
  {
    n: '2 · Откуда берётся',
    t: 'GameState читает progress.level из localStorage → getEpochForLevel(level) → id эпохи раздаётся сценам как this.epoch.id.',
  },
  {
    n: '3 · Два источника токенов',
    t: 'palette.ts — 24 токена на эпоху, читают все 12 сцен через buildPalette. epochConfig.ts — 6 визуальных токенов + crutches, nav, motto, диапазон; читают BootScene и логика. Значения совпадают руками; правды две.',
  },
  {
    n: '4 · Как попадают в сцену',
    t: 'В create(): this.P = buildPalette(id) → this.COLORS дублирует каждый токен строкой #rrggbb для текста и числом 0xRRGGBB для фигур. Геймплейные различия — отдельно в balanceConfig.ts.',
  },
  {
    n: '5 · Вёрстка ArenaScene',
    t: 'Блоки сверху вниз с фиксированными Y: rail → вопрос → threat → браузер (табы, график, улики) → evidence strip → карты 4×1 → ответы 2×2 → нижняя навигация. Каждый блок позиционируется сам, соседей не знает.',
  },
  {
    n: '6 · Где ломается',
    t: 'Остаточная конфигурация 844×390 — всё сплющено. Рассинхрон palette/epochConfig — сплэш и арена разного цвета. brick:false делает блок вопроса выше, nav прибита к y=784 — дыра или перекрытие. Сессия (seed, activeSource, selectedEvidence) переживает restart — новая палитра на старых координатах.',
  },
  {
    n: '7 · Связь с обучением',
    t: 'Эпохи задуманы как стадии когнитивного роста, фактически — скины. Игрок учится механикам M1–M15, смена эпохи ничему не учит: нет смены операций, нет онбординга перехода.',
  },
  {
    n: '8 · После правок',
    t: 'Токены street выровнены; в ArenaScene есть calculateArenaLayout() (nav к низу, браузер — остаток); детектор границы + оверлей «ЭПОХА СМЕНИЛАСЬ» + restart. Осталось: монолит 810 строк, хардкоды в 11 сценах, два файла токенов. Балл 58 из 100.',
  },
];

const DECISIONS = [
  {
    k: 'Зона большого пальца',
    what: 'Всё, что нажимают чаще одного раза за встречу — улики, ответы, подтверждение, инструменты — живёт в нижних 60 % экрана. Rail и вопрос наверху только читаются.',
    why: 'Игрок держит телефон одной рукой 20–40 минут. Промахи по верхним элементам — главный источник злости.',
  },
  {
    k: 'Threat сливается с вопросом',
    what: 'Отдельный блок threat (28 px) уходит; шкала угрозы становится нижней линией блока вопроса.',
    why: 'Освобождает 36 px для браузера — там игрок читает и принимает решение. Угроза и так контекст вопроса.',
  },
  {
    k: 'Evidence strip = рабочий стол',
    what: 'Ровно N ячеек (1/2/3 по эпохе) с пунктирными пустыми слотами, счётчик N/N, тап по ячейке снимает улику. Улика показывает свой источник.',
    why: 'Игрок видит цель встречи до первого действия. Пустой слот — это инструкция без текста.',
  },
  {
    k: 'Ответы гейтятся уликами',
    what: 'Ответы затемнены (45 %), пока улик меньше N. Кнопка подтверждения сама объясняет, чего не хватает: «выберите улики · 1/2», «нужны разные источники», «выберите ответ».',
    why: 'Убирает угадывание — единственный способ «пройти» игру, ничему не научившись. Ошибка невозможна, а не «показывается».',
  },
  {
    k: 'Два тапа на ответ',
    what: 'Тап выбирает, вторая кнопка подтверждает. Ответы 2×2 + широкая CTA 40 px под ними.',
    why: 'Необратимое действие с потерей XP не должно висеть на одном промахе в сетке 11-пиксельного текста.',
  },
  {
    k: 'Инструменты убывают видимо',
    what: 'Карты 4×1 становятся рядом инструментов с ценой в SIG. Отключённые в эпохе — не исчезают, а стоят с замком до конца эпохи; в system слот схлопывается в 0 и отдаёт высоту браузеру.',
    why: 'Игрок видит траекторию: «раньше было четыре, теперь один». Прогрессия становится читаемой на самом экране.',
  },
  {
    k: 'Табы источников с памятью',
    what: 'Точка на табе — «отсюда уже взята улика». В cabinet это и есть подсказка правила «два разных источника».',
    why: 'При 3 источниках игрок теряет, где был. Точка снимает нагрузку на память, не давая ответа.',
  },
  {
    k: 'Результат на месте вопроса',
    what: 'После подтверждения блок вопроса становится блоком результата: вердикт, XP, правильный ответ, «Дальше». Ничего не всплывает поверх арены.',
    why: 'Модалки ломают ритм; глаз уже на верхней строке, там и ответ. Скелет не двигается.',
  },
  {
    k: 'Один шрифтовой масштаб',
    what: 'Три размера: 16–19 вопрос, 12 улики/ответы, 9–10 служебное. Меняются семейства, не сетка. Минимальная цель нажатия — 40 px.',
    why: 'Четыре эпохи — четыре характера, но одна читаемость. Иначе terminal превращается в нечитаемую стену.',
  },
  {
    k: 'Ритуал перехода — снизу вверх',
    what: 'Оверлей границы эпохи рисуется уже новыми токенами, содержит правило операции, число улик, число инструментов и строку «скелет экрана — без изменений». Один раз, переживает перезагрузку.',
    why: 'Это единственный момент, когда игрок готов читать. Здесь и объясняем, что переучивается мышление, а не интерфейс.',
  },
];

const LABELS: Record<EpochId, string> = {
  street: 'Одна улика → ответ. Все 4 инструмента. Кислотный акцент, кирпич, тени.',
  cabinet: 'Две улики из разных источников. Сверка и пропуск закрыты. Бумага, засечки.',
  terminal: 'Цепочка из трёх улик по порядку. Только подсказка. Плотная сетка, моно.',
  system: 'Синтез трёх улик. Инструментов нет — слот схлопнут, браузер выше. Одна краска.',
};

export default function App() {
  const [focus, setFocus] = useState<EpochId>('street');
  const [showSlots, setShowSlots] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [legacyBrickOff, setLegacyBrickOff] = useState(true);
  const [mockKey, setMockKey] = useState(0);
  const theme = THEMES[focus];

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-neutral-200 antialiased">
      {/* header */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-[#0b0b0d]/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-12 flex items-center justify-between text-[12px]">
          <div className="font-bold tracking-widest">
            SIGNAL ARENA <span className="text-neutral-500">· EPOCH UI · ARENA REDESIGN</span>
          </div>
          <nav className="hidden md:flex gap-5 text-neutral-400">
            <a href="#now" className="hover:text-white">Сейчас</a>
            <a href="#four" className="hover:text-white">4 эпохи</a>
            <a href="#arena" className="hover:text-white">Арена крупно</a>
            <a href="#how" className="hover:text-white">Как сделать</a>
            <a href="#density" className="hover:text-white">Плотность</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24">
        {/* intro */}
        <section className="pt-12 pb-8">
          <div className="text-[11px] tracking-widest text-lime-300 mb-3">ОПИСАНИЕ · ЧЕТЫРЕ МАКЕТА · РЕШЕНИЯ</div>
          <h1 className="text-3xl md:text-5xl font-bold leading-[1.05] max-w-4xl">
            Интерфейс по эпохам: как работает у нас, и как выглядит арена, за которой игрок проводит 80 % времени
          </h1>
          <p className="mt-5 max-w-3xl text-neutral-400 text-[15px] leading-relaxed">
            Ниже — текущая схема в восьми пунктах, четыре живых макета ArenaScene (по одному на эпоху) на стеке слотов
            с профилем плотности из единого реестра темы, и десять решений по игровому экрану. Макеты кликабельны:
            выбирайте улики, отвечайте, тратьте SIG.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-[11px]">
            {EPOCH_ORDER.map((id) => {
              const t = THEMES[id];
              return (
                <span key={id} className="px-2.5 py-1 rounded-full border border-neutral-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.colors.accent, boxShadow: `0 0 0 2px ${t.colors.bg}` }} />
                  {t.id} · {t.levels[0]}–{t.levels[1]} · {t.operation.label}
                </span>
              );
            })}
          </div>
        </section>

        {/* 01 now */}
        <section id="now" className="py-10 border-t border-neutral-800">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-neutral-600 font-mono text-sm">01</span>
            <h2 className="text-2xl font-bold">Как это работает у нас сейчас</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-800 rounded-xl overflow-hidden">
            {NOW.map((b) => (
              <div key={b.n} className="bg-[#111114] p-4">
                <div className="text-[10px] tracking-widest text-lime-300 mb-2 uppercase">{b.n}</div>
                <p className="text-[13px] leading-snug text-neutral-300">{b.t}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] text-neutral-500 max-w-3xl">
            Итог одной строкой: эпоха — это id, по которому 12 сцен вручную раскрашивают одни и те же фиксированные
            координаты из двух несинхронных файлов; переход между эпохами — смена краски, а не правил.
          </p>
        </section>

        {/* 02 four epochs */}
        <section id="four" className="py-10 border-t border-neutral-800">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-neutral-600 font-mono text-sm">02</span>
                <h2 className="text-2xl font-bold">Четыре эпохи — один скелет</h2>
              </div>
              <p className="mt-2 text-[13px] text-neutral-400 max-w-2xl">
                Один и тот же компонент, один стек слотов. Различаются только объект темы и операция. Обратите внимание:
                nav везде прижата к низу, браузер везде забирает остаток, в system слот инструментов схлопнут.
              </p>
            </div>
            <div className="flex gap-2 text-[12px]">
              <button
                onClick={() => setShowSlots((v) => !v)}
                className={`px-3 py-1.5 rounded-md border ${showSlots ? 'border-pink-500 text-pink-400' : 'border-neutral-700 text-neutral-300'}`}
              >
                {showSlots ? 'Скрыть слоты' : 'Показать слоты'}
              </button>
              <button
                onClick={() => {
                  setRitual((v) => !v);
                  setMockKey((k) => k + 1);
                }}
                className={`px-3 py-1.5 rounded-md border ${ritual ? 'border-lime-400 text-lime-300' : 'border-neutral-700 text-neutral-300'}`}
              >
                {ritual ? 'Ритуал: вкл' : 'Ритуал перехода'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
            {EPOCH_ORDER.map((id) => {
              const t = THEMES[id];
              return (
                <div key={id} className="flex flex-col gap-3">
                  <Phone>
                    <ArenaMock key={`${id}-${mockKey}`} theme={t} showSlots={showSlots} onboarding={ritual} />
                  </Phone>
                  <div className="px-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[14px]" style={{ color: t.colors.accent === '#111114' ? '#fff' : t.colors.accent }}>
                        {t.name}
                        <span className="text-neutral-500 font-normal ml-2 text-[11px]">ур. {t.levels[0]}–{t.levels[1]}</span>
                      </div>
                      <button onClick={() => { setFocus(id); document.getElementById('arena')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-[11px] text-neutral-400 hover:text-white">
                        крупно →
                      </button>
                    </div>
                    <p className="text-[12px] text-neutral-400 mt-1 leading-snug">{LABELS[id]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 03 arena focus */}
        <section id="arena" className="py-10 border-t border-neutral-800">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-neutral-600 font-mono text-sm">03</span>
            <h2 className="text-2xl font-bold">Арена крупно: было → стало</h2>
          </div>
          <p className="text-[13px] text-neutral-400 max-w-2xl mb-6">
            Слева — текущая вёрстка на фиксированных Y (схема). Справа — тот же экран на слотах. Переключайте эпоху:
            меняется тема, скелет — нет.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {EPOCH_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => setFocus(id)}
                className={`px-3 py-1.5 rounded-md text-[12px] border ${focus === id ? 'border-white text-white bg-neutral-900' : 'border-neutral-800 text-neutral-400'}`}
              >
                {THEMES[id].name} · {THEMES[id].operation.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr_1.1fr] gap-8 items-start">
            <div>
              <div className="flex items-center justify-between mb-3 text-[12px]">
                <span className="text-red-400 font-bold">БЫЛО · фиксированные Y</span>
                <label className="flex items-center gap-2 text-neutral-400 cursor-pointer">
                  <input type="checkbox" checked={legacyBrickOff} onChange={(e) => setLegacyBrickOff(e.target.checked)} className="accent-red-500" />
                  brick:false
                </label>
              </div>
              <Phone>
                <LegacySchematic theme={theme} brickOff={legacyBrickOff} />
              </Phone>
              <ul className="mt-4 text-[12px] text-neutral-400 space-y-1.5 leading-snug">
                <li>· каждый блок хранит свой y; сумма высот никогда не равна 844</li>
                <li>· блок вопроса растёт от контента → наезжает на threat</li>
                <li>· nav прибита к 784 → между answers и nav дыра 42 px</li>
                <li>· после restart сессия старая, координаты старые, палитра новая</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 text-[12px]">
                <span className="text-lime-300 font-bold">СТАЛО · стек слотов</span>
                <span className="text-neutral-500">{theme.id} · {theme.levels[0]}–{theme.levels[1]}</span>
              </div>
              <Phone>
                <ArenaMock key={`focus-${focus}`} theme={theme} showSlots />
              </Phone>
            </div>

            <div className="lg:pt-8">
              <div className="text-[11px] tracking-widest text-neutral-500 mb-3">СЛОТЫ СВЕРХУ ВНИЗ · {theme.name}</div>
              <ol className="space-y-3 text-[13px] leading-snug">
                {[
                  ['rail', `${theme.density.rail}px`, 'уровень-плашка, эпоха + операция, XP-бар, погода, SIG и бюджет. Одна строка, только чтение.'],
                  ['question', `min ${theme.density.questionMin}px`, 'вопрос крупно + шкала угрозы как нижняя линия. После ответа становится блоком результата.'],
                  ['browser', 'flex', 'табы источников (точка = отсюда взята улика), спарклайн, список улик по 44 px. Забирает всё, что осталось.'],
                  ['evidence', `${theme.density.evidence}px`, `${theme.operation.evidenceNeeded} ячеек по правилу операции. Пустая — пунктир и номер, полная — источник + текст.`],
                  ['cards', theme.density.cards ? `${theme.density.cards}px` : '0 → схлопнут', theme.density.cards ? `инструменты с ценой −20 SIG; закрытые в эпохе стоят с замком: ${Object.entries(theme.crutches).filter(([, v]) => v).map(([k]) => k).join(', ')} открыты.` : 'в system инструментов нет — слот не рисуется, высота уходит браузеру.'],
                  ['answers', `${theme.density.answers}px`, '2×2 затемнены, пока улик < N; под ними CTA 40 px с текстом-причиной. Два тапа до подтверждения.'],
                  ['nav', `${theme.density.nav}px · bottom`, 'якорь к низу. Всегда на месте, независимо от контента выше.'],
                ].map(([n, h, d]) => (
                  <li key={n} className="grid grid-cols-[84px_1fr] gap-3">
                    <div>
                      <div className="font-mono text-[12px] text-white">{n}</div>
                      <div className="font-mono text-[10px] text-neutral-500">{h}</div>
                    </div>
                    <div className="text-neutral-300">{d}</div>
                  </li>
                ))}
              </ol>
              <div className="mt-5 p-3 rounded-lg border border-neutral-800 bg-[#111114] text-[12px] text-neutral-400 leading-snug">
                <span className="text-white font-bold">Правило операции · {theme.operation.label}.</span> {theme.operation.rule}
              </div>
            </div>
          </div>
        </section>

        {/* 04 how */}
        <section id="how" className="py-10 border-t border-neutral-800">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-neutral-600 font-mono text-sm">04</span>
            <h2 className="text-2xl font-bold">Как сделать: 10 решений по игровому экрану</h2>
          </div>
          <p className="text-[13px] text-neutral-400 max-w-2xl mb-6">
            Всё уже применено в макетах выше. Порядок — по влиянию на ежедневный опыт игрока, не по сложности.
          </p>
          <div className="grid md:grid-cols-2 gap-px bg-neutral-800 rounded-xl overflow-hidden">
            {DECISIONS.map((d, i) => (
              <div key={d.k} className="bg-[#111114] p-4 grid grid-cols-[28px_1fr] gap-3">
                <div className="font-mono text-neutral-600 text-sm">{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div className="font-bold text-[14px] mb-1">{d.k}</div>
                  <p className="text-[13px] text-neutral-300 leading-snug">{d.what}</p>
                  <p className="text-[12px] text-neutral-500 leading-snug mt-1.5">
                    <span className="text-lime-300">Зачем.</span> {d.why}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 05 density table */}
        <section id="density" className="py-10 border-t border-neutral-800">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-neutral-600 font-mono text-sm">05</span>
            <h2 className="text-2xl font-bold">Профиль плотности — это данные темы</h2>
          </div>
          <p className="text-[13px] text-neutral-400 max-w-2xl mb-6">
            Все числа ниже лежат в объекте EpochTheme рядом с цветами. Сцена читает их один раз в create() и раздаёт
            слотам. Ни одна сцена не знает координат — только порядок и якоря.
          </p>
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-[12px]">
              <thead className="bg-[#111114] text-neutral-400 text-left">
                <tr>
                  <th className="p-3 font-normal">поле</th>
                  {EPOCH_ORDER.map((id) => (
                    <th key={id} className="p-3 font-bold" style={{ color: THEMES[id].colors.accent === '#111114' ? '#fff' : THEMES[id].colors.accent }}>
                      {id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {(
                  [
                    ['levels', (t) => `${t.levels[0]}–${t.levels[1]}`],
                    ['accent', (t) => t.colors.accent],
                    ['bg / panel', (t) => `${t.colors.bg} / ${t.colors.panel}`],
                    ['texture', (t) => t.texture],
                    ['radius / shadow', (t) => `${t.radius} / ${t.shadow ? 'on' : 'off'}`],
                    ['font.display', (t) => t.font.display.split(',')[0]],
                    ['rail', (t) => t.density.rail],
                    ['question (min)', (t) => t.density.questionMin],
                    ['browser', () => 'flex'],
                    ['evidence', (t) => t.density.evidence],
                    ['cards', (t) => t.density.cards || '0 (collapsed)'],
                    ['answers', (t) => t.density.answers],
                    ['nav', (t) => `${t.density.nav} · bottom`],
                    ['gap / pad', (t) => `${t.density.gap} / ${t.density.pad}`],
                    ['crutches', (t) => Object.values(t.crutches).filter(Boolean).length + '/4'],
                    ['operation', (t) => `${t.operation.id} · ${t.operation.evidenceNeeded} улик`],
                  ] as [string, (t: (typeof THEMES)[EpochId]) => string | number][]
                ).map(([name, fn]) => (
                  <tr key={name} className="border-t border-neutral-800">
                    <td className="p-3 text-neutral-400 font-sans">{name}</td>
                    {EPOCH_ORDER.map((id) => (
                      <td key={id} className="p-3 text-neutral-200">{fn(THEMES[id])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4 text-[13px]">
            <div className="p-4 rounded-xl border border-neutral-800 bg-[#111114]">
              <div className="font-bold mb-1">Что делаем первым</div>
              <p className="text-neutral-400 leading-snug">
                Слить palette.ts и epochConfig.ts в реестр EpochTheme; buildPalette читает из реестра как адаптер.
                Добавить density и operation в тот же объект. Снапшот-тест на все поля четырёх эпох.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-800 bg-[#111114]">
              <div className="font-bold mb-1">Что вторым</div>
              <p className="text-neutral-400 leading-snug">
                ArenaScene на стек слотов по макету выше: rail, question, browser(flex), evidence, cards, answers, nav(bottom).
                Скриншоты каждой эпохи до/после. Затем стек в BaseScene, остальные 11 сцен.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-800 bg-[#111114]">
              <div className="font-bold mb-1">Что третьим и четвёртым</div>
              <p className="text-neutral-400 leading-snug">
                Ритуал границы: сброс seed/activeSource/selectedEvidence, пересчёт темы и слотов, оверлей один раз.
                Потом операции: evidenceNeeded, crutches и гейт ответов — из темы, без if-ов по id эпохи.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-800 py-6 text-center text-[11px] text-neutral-600">
        SIGNAL ARENA · epoch-ui · arena redesign · 4 эпохи · 1 скелет · 7 слотов
      </footer>
    </div>
  );
}
