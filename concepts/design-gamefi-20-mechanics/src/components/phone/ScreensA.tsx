import {
  BottomNav,
  Btn,
  Candles,
  Chip,
  PaperCard,
  Phone,
  Radar,
  SectionLabel,
  TopBar,
} from "./Frame";

/* ───────────── 01 · RAID MAP ───────────── */
export function RaidMapScreen() {
  const nodes = [
    { x: 50, y: 92, t: "start", l: "ВХОД" },
    { x: 28, y: 78, t: "fight", l: "Бой" },
    { x: 72, y: 78, t: "news", l: "Газета" },
    { x: 20, y: 62, t: "fight", l: "Бой" },
    { x: 50, y: 64, t: "shrine", l: "Алтарь" },
    { x: 80, y: 60, t: "fight", l: "Бой" },
    { x: 35, y: 48, t: "cash", l: "Кэш" },
    { x: 65, y: 46, t: "fight", l: "Бой" },
    { x: 50, y: 32, t: "elite", l: "Элита" },
    { x: 25, y: 22, t: "news", l: "Газета" },
    { x: 75, y: 22, t: "shrine", l: "Алтарь" },
    { x: 50, y: 8, t: "boss", l: "КИТ" },
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7], [6, 8], [7, 8], [8, 9], [8, 10], [9, 11], [10, 11],
  ];
  const tone: Record<string, string> = {
    start: "var(--color-primary)",
    fight: "var(--color-bad)",
    news: "var(--color-context)",
    shrine: "var(--color-crypto)",
    cash: "var(--color-good)",
    elite: "var(--color-warn)",
    boss: "var(--color-info)",
  };
  const done = new Set([0, 1, 4]);
  return (
    <Phone
      mechanic="МЕХАНИКА 01 · РЕЙД"
      title="Карта рейда: Деривативные доки"
      caption="Roguelike-маршрут через район города. 12 узлов, 3 ветки, один Кит в конце. Хладнокровие — ресурс рейда; кончится — ликвидация."
    >
      <TopBar level="R3" label="РЕЙД · ДЕНЬ 3 / 7" value="ХЛАДНОКРОВИЕ 71" xp={71} />
      <div className="flex shrink-0 items-center gap-1.5 px-3.5 pt-1.5 pb-1">
        <Chip tone="primary">ДОКИ</Chip>
        <Chip>ВОЛАТИЛЬНОСТЬ ↑</Chip>
        <Chip tone="warn">ФАНДИНГ +0.12%</Chip>
        <span className="flex-1" />
        <Chip tone="good">КАПИТАЛ 1.42×</Chip>
      </div>
      <div className="mx-3.5 shrink-0">
        <PaperCard kicker="СВОДКА ДЕПАРТАМЕНТА" title="В доках пахнет плечом. Гоблин выдаёт кредит всем, кто не читал условия." accent="var(--color-risk)" />
      </div>
      <div className="grid-panel relative mx-3.5 mt-2 min-h-0 flex-1 overflow-hidden rounded-xl border border-strong bg-inset">
        <div className="absolute inset-0 bg-[url(/img/city.jpg)] bg-cover bg-center opacity-20" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {edges.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
              stroke={done.has(a) && done.has(b) ? "var(--color-primary)" : "var(--color-strong)"}
              strokeWidth="0.6" strokeDasharray={done.has(a) && done.has(b) ? "0" : "1.5 1.5"}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {nodes.map((n, i) => {
          const cur = i === 4;
          const big = n.t === "boss" || n.t === "elite";
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <div
                className={`mx-auto grid place-items-center rounded-full border-2 bg-surface font-mono font-bold ${big ? "h-11 w-11 text-[13px]" : "h-8 w-8 text-[10px]"} ${cur ? "pulse-ring" : ""}`}
                style={{
                  borderColor: tone[n.t],
                  color: tone[n.t],
                  opacity: done.has(i) || cur || i === 6 || i === 7 ? 1 : 0.55,
                  boxShadow: n.t === "boss" ? "0 0 24px rgba(89,167,255,.35)" : undefined,
                }}
              >
                {n.t === "fight" ? "?" : n.t === "boss" ? "◎" : n.t === "shrine" ? "✠" : n.t === "news" ? "¶" : n.t === "cash" ? "$" : n.t === "elite" ? "!" : "▲"}
              </div>
              <div className="mt-0.5 font-mono text-[7px] tracking-wider text-sub">{n.l}</div>
            </div>
          );
        })}
        <div className="absolute right-2 top-2 rounded-md border border-border bg-surface/90 px-2 py-1 font-mono text-[8px] text-muted">
          КОЛОДА 9 · РЕЛИКВИИ 2
        </div>
      </div>
      <div className="mx-3.5 mt-2 shrink-0">
        <SectionLabel right="ВЫБЕРИ УЗЕЛ">СЛЕДУЮЩИЙ ШАГ</SectionLabel>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-[10px] border border-good/40 bg-surface p-2">
            <div className="font-mono text-[9px] font-bold text-good">$ ВЫХОД В КЭШ</div>
            <div className="mt-0.5 text-[10px] text-sub">+15 хладнокровия. −1 день. Паника бесплатна, покой — нет.</div>
          </div>
          <div className="rounded-[10px] border border-border bg-surface p-2">
            <div className="font-mono text-[9px] font-bold text-bad">? БОЙ · СКРЫТЫЙ ВРАГ</div>
            <div className="mt-0.5 text-[10px] text-sub">Источники: chart, funding, order_book. Награда: карта.</div>
          </div>
        </div>
      </div>
      <div className="mx-3.5 my-2 shrink-0">
        <Btn primary>ИДТИ В ДОКИ</Btn>
      </div>
      <BottomNav active="raid" />
    </Phone>
  );
}

/* ───────────── 02 · LIVE ENCOUNTER ───────────── */
export function LiveEncounterScreen() {
  const hand = [
    { n: "СТОП-ЛОСС", d: "risk", c: "var(--color-risk)", cost: 1 },
    { n: "ОБЪЁМ", d: "technical", c: "var(--color-technical)", cost: 1 },
    { n: "ФАНДИНГ", d: "crypto", c: "var(--color-crypto)", cost: 2 },
    { n: "ЖДАТЬ", d: "cognitive", c: "var(--color-cognitive)", cost: 0 },
    { n: "ПОЛОВИНА", d: "risk", c: "var(--color-risk)", cost: 1 },
  ];
  return (
    <Phone
      mechanic="МЕХАНИКА 01 · ЖИВОЙ БОЙ"
      title="Encounter: рынок идёт в реальном времени"
      caption="Вместо статичного вопроса — тикающий ИИ-рынок. Browser Widget остался (3 вкладки). Рука из 5 карт, размер позиции, таймер решения. Враг скрыт до конца."
    >
      <TopBar level="R3" label="БОЙ · ТИК 14 / 40" value="ХЛАДНОКРОВИЕ 71" xp={71} />
      <div className="flex shrink-0 items-center gap-1.5 px-3.5 pt-1.5 pb-1">
        <Chip tone="bad">● LIVE</Chip>
        <Chip>SIM/USDT · 15m</Chip>
        <span className="flex-1" />
        <Chip tone="warn">РЕШЕНИЕ ЧЕРЕЗ 0:23</Chip>
      </div>
      <div className="mx-3.5 shrink-0">
        <PaperCard kicker="ЦЕЛЬ ВСТРЕЧИ" title="Цена пробила уровень на росте фандинга. Стадо уже празднует. Твой ход." />
      </div>
      <div className="mx-3.5 mb-1 flex shrink-0 items-center gap-2 rounded-b-[10px] border border-dashed border-strong bg-surface px-3 py-1.5">
        <div className="grid h-7 w-7 place-items-center rounded-full border border-strong font-mono text-[15px] font-bold text-primary">?</div>
        <div className="font-mono text-[9px] tracking-wider text-muted">
          <b className="block text-[10px] text-sub">ВРАГ СКРЫТ ДО РЕШЕНИЯ</b>
          семейство: РИСК · сложность ●●●○
        </div>
      </div>
      <div className="mx-3.5 shrink-0 overflow-hidden rounded-xl border border-strong bg-inset">
        <div className="flex h-[30px] items-center gap-1.5 border-b border-border bg-elevated px-2.5">
          <div className="flex gap-[3px]"><i className="h-[5px] w-[5px] rounded-full bg-muted" /><i className="h-[5px] w-[5px] rounded-full bg-muted" /><i className="h-[5px] w-[5px] rounded-full bg-muted" /></div>
          <span className="flex-1 truncate font-mono text-[8px] text-muted">arena://docks/sim-usdt/live?tick=14</span>
          <span className="rounded-sm border border-good/30 px-1 font-mono text-[7px] text-good">SAFE</span>
        </div>
        <div className="flex border-b border-border">
          {["ГРАФИК", "ФАНДИНГ", "СТАКАН"].map((t, i) => (
            <div key={t} className={`flex h-9 flex-1 items-center justify-center border-r border-border font-mono text-[9px] last:border-r-0 ${i === 0 ? "bg-hover text-primary shadow-[inset_0_-2px_var(--color-primary)]" : "bg-surface text-muted"}`}>{t}</div>
          ))}
        </div>
        <Candles seed={7} count={30} className="grid-panel h-[140px]" decisionAt={6} />
        <div className="flex items-center justify-between border-t border-border px-2.5 py-1 font-mono text-[8px] text-muted">
          <span>ФАНДИНГ <b className="text-warn">+0.12%</b> · OI <b className="text-bad">+31%</b></span>
          <span>ЛОНГИ 78% <span className="text-bad">⚠</span></span>
        </div>
      </div>
      <div className="mx-3.5 mt-2 shrink-0">
        <SectionLabel right="ЭНЕРГИЯ 3 / 3">РУКА · 5 КАРТ</SectionLabel>
        <div className="flex gap-1.5">
          {hand.map((c, i) => (
            <div
              key={c.n}
              className={`relative flex h-[62px] flex-1 flex-col items-center justify-center gap-1 rounded-[9px] border bg-surface ${i === 0 || i === 3 ? "border-2 border-primary bg-hover" : "border-border"}`}
            >
              <span className="absolute left-1 top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-inset font-mono text-[7px] text-sub">{c.cost}</span>
              <span className="h-5 w-5 rounded-md" style={{ background: `color-mix(in srgb, ${c.c} 22%, transparent)`, boxShadow: `inset 0 0 0 1px ${c.c}` }} />
              <span className="font-mono text-[7px] font-bold tracking-wide text-sub">{c.n}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-3.5 mt-2 shrink-0">
        <SectionLabel right="РАЗМЕР 25%">ДЕЙСТВИЕ</SectionLabel>
        <div className="mb-1.5 h-1.5 overflow-hidden rounded-full border border-border bg-inset">
          <i className="block h-full w-1/4 bg-primary" />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            ["ЛОНГ", "text-good border-border"],
            ["ШОРТ", "text-bad border-border"],
            ["ЖДАТЬ", "text-primary border-2 border-primary bg-hover"],
            ["ХЕДЖ", "text-warn border-border"],
          ].map(([l, cls]) => (
            <div key={l} className={`grid h-11 place-items-center rounded-[10px] border bg-surface font-mono text-[10px] font-bold ${cls}`}>{l}</div>
          ))}
        </div>
      </div>
      <div className="mx-3.5 my-2 shrink-0">
        <Btn primary>ПОДТВЕРДИТЬ · ЖДАТЬ + СТОП-ЛОСС</Btn>
      </div>
      <BottomNav active="raid" />
    </Phone>
  );
}

/* ───────────── 03 · GHOST ───────────── */
export function GhostScreen() {
  const traits = ["КАЛИБРОВКА", "ТЕРПЕНИЕ", "ИММУНИТЕТ К НАРРАТИВАМ", "ДИСЦИПЛИНА РИСКА", "АНТИ-ПРЕДВЗЯТОСТЬ"];
  const you = [0.62, 0.41, 0.55, 0.7, 0.48];
  const gh = [0.66, 0.58, 0.52, 0.74, 0.5];
  return (
    <Phone
      mechanic="МЕХАНИКА 02 · ПРИЗРАК"
      title="Твой AI-двойник и его ночная смена"
      caption="Пять измеряемых черт. Пунктир — ты, заливка — Призрак. Он уже терпеливее тебя. Лог ночных боёв, лига, предложения аренды."
    >
      <TopBar level="L7" />
      <div className="relative mx-3.5 mt-2.5 shrink-0 overflow-hidden rounded-xl border border-cognitive/40 bg-surface">
        <div className="absolute inset-0 bg-[url(/img/ghost.jpg)] bg-cover bg-center opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-transparent" />
        <div className="relative flex items-center gap-3 p-3">
          <div className="ghost-float grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-cognitive bg-inset text-2xl text-cognitive shadow-[0_0_30px_rgba(156,168,255,.35)]">◌</div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[9px] tracking-wider text-cognitive">ПРИЗРАК №4471 · ПОКОЛЕНИЕ 3</div>
            <div className="text-[16px] font-bold leading-tight">«Холодный Тень»</div>
            <div className="mt-1 flex gap-1">
              <Chip tone="custom" style={{ borderColor: "var(--color-cognitive)", color: "var(--color-cognitive)" }}>ЛИГА СЕРЕБРО · #212</Chip>
              <Chip tone="good">ОБУЧЕН НА 1 284 РЕШ.</Chip>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-3.5 mt-2 flex shrink-0 gap-2">
        <div className="grid place-items-center rounded-xl border border-border bg-surface p-2">
          <Radar values={gh} ghost={you} size={150} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          {traits.map((t, i) => (
            <div key={t}>
              <div className="flex justify-between font-mono text-[7px] text-muted">
                <span className="truncate">{t}</span>
                <span className={gh[i] > you[i] ? "text-good" : "text-bad"}>
                  {gh[i] > you[i] ? "+" : ""}{Math.round((gh[i] - you[i]) * 100)}
                </span>
              </div>
              <div className="relative h-1 rounded-full bg-inset">
                <i className="absolute inset-y-0 left-0 rounded-full bg-cognitive" style={{ width: `${gh[i] * 100}%` }} />
                <i className="absolute -top-0.5 h-2 w-px bg-text" style={{ left: `${you[i] * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-3.5 mt-2 min-h-0 flex-1 overflow-hidden">
        <SectionLabel right="ПОКА ТЫ СПАЛ">НОЧНАЯ СМЕНА</SectionLabel>
        <div className="space-y-1">
          {[
            ["03:12", "Отказался от лонга на пампе. FOMO Wraith ушёл голодным.", "good", "+4 калибр."],
            ["03:41", "Проиграл Leverage Goblin. Скопировал твою ошибку от 12 мая.", "bad", "−2 дисц."],
            ["04:20", "Победа над Narrative Siren. Не читал газету вообще.", "good", "+18 $SIG"],
          ].map(([t, m, tone, r]) => (
            <div key={t} className="flex items-start gap-2 rounded-[9px] border border-border bg-surface px-2.5 py-1.5">
              <span className="font-mono text-[8px] text-muted">{t}</span>
              <span className="flex-1 text-[10px] leading-snug text-sub">{m}</span>
              <span className={`font-mono text-[8px] font-bold ${tone === "good" ? "text-good" : "text-bad"}`}>{r}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-[9px] border border-warn/40 bg-warn/5 px-2.5 py-1.5">
          <div className="font-mono text-[8px] tracking-wider text-warn">ПРЕДЛОЖЕНИЕ АРЕНДЫ</div>
          <div className="text-[10px] text-sub">Новичок L1 «ivan_2x» просит твоего Призрака ко-пилотом на 7 дней. Доход: 40 $SIG. Риск для твоей репутации: весь.</div>
        </div>
      </div>
      <div className="mx-3.5 my-2 grid shrink-0 grid-cols-2 gap-2">
        <Btn ghost>СЛИЯНИЕ</Btn>
        <Btn primary>ВЫПУСТИТЬ В ЛИГУ</Btn>
      </div>
      <BottomNav active="ghost" />
    </Phone>
  );
}

/* ───────────── 04 · CULT WAR ───────────── */
export function CultWarScreen() {
  const districts = [
    { n: "Биржевой квартал", c: "var(--color-technical)", own: "Культ Свечи", p: 34, x: 8, y: 8, w: 42, h: 30 },
    { n: "Регуляторный холм", c: "var(--color-context)", own: "Ложа Макро", p: 4, x: 54, y: 8, w: 38, h: 22 },
    { n: "Набережная Ликвидности", c: "var(--color-info)", own: "Синдикат Китов", p: 14, x: 54, y: 34, w: 38, h: 26 },
    { n: "Деривативные доки", c: "var(--color-risk)", own: "Орден Стоп-лосса", p: 22, x: 8, y: 42, w: 42, h: 24 },
    { n: "Старый Ончейн", c: "var(--color-crypto)", own: "Церковь Ходла", p: 18, x: 8, y: 70, w: 50, h: 22 },
    { n: "Мем-трущобы", c: "var(--color-human)", own: "Секта Мема", p: 8, x: 62, y: 64, w: 30, h: 28 },
  ];
  return (
    <Phone
      mechanic="МЕХАНИКА 03 · ВОЙНА КУЛЬТОВ"
      title="Город: недельная война за районы"
      caption="Шесть районов = шесть секторов рынка. Контроль определяется калиброванной точностью членов культа, не активностью. Спонсорские пулы районов — B2B-слой."
    >
      <TopBar level="L7" right={<Chip tone="custom" style={{ borderColor: "var(--color-risk)", color: "var(--color-risk)" }}>⛨ ОРДЕН СТОП-ЛОССА</Chip>} />
      <div className="flex shrink-0 items-center gap-1.5 px-3.5 pt-1.5 pb-1">
        <Chip tone="warn">ВОЙНА · 2д 14ч</Chip>
        <Chip>СЕЗОН «ХАЛВИНГ»</Chip>
        <span className="flex-1" />
        <Chip tone="primary">ТВОЙ ВКЛАД 0.71</Chip>
      </div>
      <div className="relative mx-3.5 h-[300px] shrink-0 overflow-hidden rounded-xl border border-strong bg-inset">
        <div className="absolute inset-0 bg-[url(/img/city.jpg)] bg-cover bg-center opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
        {districts.map((d) => (
          <div
            key={d.n}
            className="absolute rounded-lg border-2 p-1.5"
            style={{
              left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%`,
              borderColor: d.c,
              background: `color-mix(in srgb, ${d.c} ${d.n === "Деривативные доки" ? 28 : 12}%, transparent)`,
              boxShadow: d.n === "Деривативные доки" ? `0 0 20px ${d.c}` : undefined,
            }}
          >
            <div className="font-mono text-[7px] font-bold uppercase tracking-wider text-text drop-shadow">{d.n}</div>
            <div className="font-mono text-[7px] text-sub">{d.own} · {d.p}%</div>
          </div>
        ))}
        <div className="absolute bottom-2 left-2 rounded-md border border-border bg-surface/90 px-2 py-1 font-mono text-[8px] text-muted">
          КИТ-ФОНТАН · нейтральная зона
        </div>
      </div>
      <div className="mx-3.5 mt-2 min-h-0 flex-1 overflow-hidden">
        <SectionLabel right="ТОЧНОСТЬ ЗА НЕДЕЛЮ">ФРОНТ · ДЕРИВАТИВНЫЕ ДОКИ</SectionLabel>
        <div className="space-y-1">
          {[
            ["⛨ Орден Стоп-лосса", "var(--color-risk)", 0.68, "ДЕРЖИТ"],
            ["◎ Синдикат Китов", "var(--color-info)", 0.64, "АТАКУЕТ"],
            ["☺ Секта Мема", "var(--color-human)", 0.31, "ШУМИТ"],
          ].map(([n, c, v, s]) => (
            <div key={n as string} className="flex items-center gap-2 rounded-[9px] border border-border bg-surface px-2.5 py-1.5">
              <span className="w-[120px] truncate font-mono text-[9px] font-bold" style={{ color: c as string }}>{n as string}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-inset">
                <i className="block h-full" style={{ width: `${(v as number) * 100}%`, background: c as string }} />
              </div>
              <span className="font-mono text-[8px] text-muted">{s as string}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 paper rounded-[9px] px-2.5 py-1.5" style={{ borderLeft: "4px solid var(--color-risk)" }}>
          <div className="font-mono text-[8px] font-bold tracking-wider text-ink/50">ПРИКАЗ КУЛЬТА</div>
          <div className="text-[11px] font-bold leading-tight">Три рейда в доках до полуночи. Не выигрывай — не ошибайся. Разница есть.</div>
        </div>
      </div>
      <div className="mx-3.5 my-2 grid shrink-0 grid-cols-2 gap-2">
        <Btn ghost>СПОНСОР РАЙОНА</Btn>
        <Btn primary>РЕЙД ЗА ОРДЕН</Btn>
      </div>
      <BottomNav active="city" />
    </Phone>
  );
}
