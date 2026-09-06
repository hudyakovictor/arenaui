import { BottomNav, Btn, Candles, Chip, PaperCard, Phone, SectionLabel, TopBar } from "./Frame";

/* ───────────── 05 · INSIDER RAID ───────────── */
export function InsiderRaidScreen() {
  const players = [
    { n: "ТЫ", src: "chart", sus: 0, c: "var(--color-primary)" },
    { n: "mara_x", src: "on_chain", sus: 12, c: "var(--color-sub)" },
    { n: "0xNikita", src: "news", sus: 61, c: "var(--color-bad)" },
    { n: "sato_k", src: "funding", sus: 8, c: "var(--color-sub)" },
    { n: "dima.eth", src: "order_book", sus: 19, c: "var(--color-sub)" },
  ];
  return (
    <Phone
      mechanic="МЕХАНИКА 04 · РЕЙД «ИНСАЙДЕР»"
      title="Пятеро против Кита. Один — предатель"
      caption="Каждый видит свой источник. Команда сводит выводы в чате и голосует. Инсайдер подсовывает ложные данные. Разоблачение — через несоответствие источников."
    >
      <TopBar level="L7" label="КИТ · ФАЗА 2 / 3" value="ХП КИТА 58%" xp={58} />
      <div className="relative mx-3.5 mt-2 h-[120px] shrink-0 overflow-hidden rounded-xl border border-info/40">
        <div className="absolute inset-0 bg-[url(/img/whale.jpg)] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
        <div className="absolute bottom-2 left-3">
          <div className="font-mono text-[8px] tracking-wider text-info">БОСС · СЕМЕЙСТВО «ВЛИЯНИЕ»</div>
          <div className="text-[16px] font-bold">Синдикат Китов</div>
        </div>
        <div className="absolute right-2 top-2"><Chip tone="bad">● 5 В РЕЙДЕ</Chip></div>
      </div>
      <div className="mx-3.5 mt-2 shrink-0">
        <SectionLabel right="ПОДОЗРЕНИЕ">КОМАНДА · КТО ЧТО ВИДИТ</SectionLabel>
        <div className="grid grid-cols-5 gap-1">
          {players.map((p) => (
            <div key={p.n} className="flex flex-col items-center gap-1 rounded-[9px] border border-border bg-surface p-1.5" style={{ borderColor: p.sus > 50 ? "var(--color-bad)" : undefined }}>
              <div className="grid h-7 w-7 place-items-center rounded-full border font-mono text-[10px]" style={{ borderColor: p.c, color: p.c }}>
                {p.n[0].toUpperCase()}
              </div>
              <div className="w-full truncate text-center font-mono text-[7px] text-sub">{p.n}</div>
              <div className="font-mono text-[6px] text-muted">{p.src}</div>
              <div className="h-1 w-full rounded-full bg-inset"><i className="block h-full rounded-full bg-bad" style={{ width: `${p.sus}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-3.5 mt-2 shrink-0 overflow-hidden rounded-xl border border-strong bg-inset">
        <div className="flex border-b border-border">
          {["ТВОЙ ГРАФИК", "ЧАТ РЕЙДА"].map((t, i) => (
            <div key={t} className={`flex h-8 flex-1 items-center justify-center font-mono text-[9px] ${i === 0 ? "bg-hover text-primary shadow-[inset_0_-2px_var(--color-primary)]" : "bg-surface text-muted"}`}>{t}</div>
          ))}
        </div>
        <Candles seed={13} count={26} className="grid-panel h-[80px]" />
      </div>
      <div className="mx-3.5 mt-2 min-h-0 flex-1 space-y-1 overflow-hidden">
        {[
          ["0xNikita", "Новости: ETF одобрен, лонг всем составом. Источник надёжный.", "bad"],
          ["mara_x", "Ончейн: киты выводят на биржи 40k. Это не покупка.", "sub"],
          ["sato_k", "Фандинг +0.19%. Кто-то очень хочет, чтобы мы зашли в лонг.", "sub"],
          ["СИСТЕМА", "Несоответствие: news ≠ on_chain. Один источник лжёт.", "warn"],
        ].map(([n, m, tone]) => (
          <div key={n + m} className="flex gap-2 rounded-[9px] border border-border bg-surface px-2.5 py-1.5">
            <span className={`shrink-0 font-mono text-[8px] font-bold ${tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : "text-primary"}`}>{n}</span>
            <span className="text-[10px] leading-snug text-sub">{m}</span>
          </div>
        ))}
      </div>
      <div className="mx-3.5 my-2 grid shrink-0 grid-cols-3 gap-1.5">
        <Btn ghost className="text-[11px]">ЛОНГ</Btn>
        <Btn primary className="text-[11px]">ЖДАТЬ</Btn>
        <Btn danger className="text-[11px]">ОБВИНИТЬ</Btn>
      </div>
      <BottomNav active="raid" />
    </Phone>
  );
}

/* ───────────── 06 · TABLOID + NARRATIVE MARKET ───────────── */
export function TabloidScreen() {
  const narratives = [
    { n: "«ETF-сезон продолжится»", odds: 0.72, faith: 1240, trend: "+8" },
    { n: "«AI-токены — новый DeFi»", odds: 0.44, faith: 860, trend: "−12" },
    { n: "«Кит просто перекладывается»", odds: 0.18, faith: 310, trend: "−3" },
  ];
  return (
    <Phone
      mechanic="МЕХАНИКА 05 · ГАЗЕТА"
      title="«Департамент управляемой паники» · выпуск 3/7"
      caption="ИИ генерирует газету каждого дня рейда из реальных исторических паттернов. Ниже — нарративный рынок: ставишь Веру на выживание нарратива. Индекс веры виден всем."
    >
      <TopBar level="R3" label="РЕЙД · ДЕНЬ 3 / 7" value="ВЕРА 420" xp={42} right={<span className="font-mono text-[11px] font-bold text-warn">✝ 420 ВЕРЫ</span>} />
      <div className="paper mx-3.5 mt-2 shrink-0 rounded-[10px] p-3">
        <div className="flex items-center justify-between border-b border-ink/20 pb-1 font-mono text-[8px] font-bold tracking-[0.15em] text-ink/60">
          <span>ДЕПАРТАМЕНТ УПРАВЛЯЕМОЙ ПАНИКИ</span>
          <span>№ 8 812</span>
        </div>
        <div className="tabloid-title mt-2 text-[22px] leading-[0.95]">
          Кит проснулся.<br />Мелкие инвесторы снова стали завтраком
        </div>
        <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
          <p className="text-[10px] leading-snug text-ink/80">
            Ночью с кошелька, о котором никто не знал, ушло 40 000 монет на биржу, о которой знали все. Аналитики называют это «перекладкой». Ваш стоп-лосс называет это иначе. Регуляторы обеспокоены.
          </p>
          <div className="h-[64px] w-[64px] rounded-sm border border-ink/30 bg-[url(/img/whale.jpg)] bg-cover bg-center grayscale" />
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-ink/20 pt-1 font-mono text-[7px] text-ink/60">
          <span>ИСТОЧНИК: ИИ-СИНТЕЗ ИЗ 14 ИСТОРИЧЕСКИХ СОБЫТИЙ</span>
          <span className="rounded-sm bg-ink px-1 text-paper">РЕКЛАМА ПЛЕЧА ×100</span>
        </div>
      </div>
      <div className="mx-3.5 mt-2 shrink-0">
        <SectionLabel right="ИНДЕКС ВЕРЫ В ГРАФИК · 61">НАРРАТИВНЫЙ РЫНОК</SectionLabel>
        <div className="space-y-1">
          {narratives.map((n) => (
            <div key={n.n} className="rounded-[9px] border border-border bg-surface px-2.5 py-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold">{n.n}</span>
                <span className={`font-mono text-[9px] ${n.trend.startsWith("+") ? "text-good" : "text-bad"}`}>{n.trend}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-inset">
                  <i className="block h-full bg-context" style={{ width: `${n.odds * 100}%` }} />
                </div>
                <span className="font-mono text-[8px] text-muted">{Math.round(n.odds * 100)}% · {n.faith} веры</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-3.5 mt-2 min-h-0 flex-1">
        <PaperCard kicker="ПРЕДУПРЕЖДЕНИЕ РЕДАКЦИИ" title="Вера — не деньги. Но её жалко. Именно поэтому она работает." accent="var(--color-context)" />
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <div className="rounded-[9px] border border-border bg-surface p-2 text-center">
            <div className="font-mono text-[8px] text-muted">ТВОЯ КАЛИБРОВКА</div>
            <div className="font-mono text-[16px] font-bold text-primary">0.71</div>
            <div className="font-mono text-[7px] text-good">ТОП 18%</div>
          </div>
          <div className="rounded-[9px] border border-border bg-surface p-2 text-center">
            <div className="font-mono text-[8px] text-muted">СТАДО СЕЙЧАС</div>
            <div className="font-mono text-[16px] font-bold text-bad">ЖАДНО</div>
            <div className="font-mono text-[7px] text-muted">78% лонгов</div>
          </div>
        </div>
      </div>
      <div className="mx-3.5 my-2 grid shrink-0 grid-cols-2 gap-2">
        <Btn ghost>ПОСТАВИТЬ ПРОТИВ</Btn>
        <Btn primary>ПОСТАВИТЬ 50 ВЕРЫ</Btn>
      </div>
      <BottomNav active="raid" />
    </Phone>
  );
}

/* ───────────── 07 · AUTOPSY ───────────── */
export function AutopsyScreen() {
  return (
    <Phone
      mechanic="МЕХАНИКА 06 · ВСКРЫТИЕ"
      title="Протокол вскрытия рейда №0931"
      caption="ИИ-коуч: таймлайн решений, ловушка, которая тебя съела, сравнение с Призраком и топ-1%, одна конкретная тренировка на завтра. Холодно, официально."
    >
      <TopBar level="L7" right={<Chip tone="bad">ЛИКВИДИРОВАН · ДЕНЬ 5</Chip>} />
      <div className="paper mx-3.5 mt-2 shrink-0 rounded-[10px] p-3">
        <div className="font-mono text-[8px] font-bold tracking-[0.15em] text-ink/60">СЛУЖБА ПО ПЕРЕРАСПРЕДЕЛЕНИЮ ЧУЖИХ ДЕНЕГ · ОТЧЁТ</div>
        <div className="tabloid-title mt-1.5 text-[19px] leading-[0.95]">Причина смерти: уверенность</div>
        <p className="mt-1.5 text-[10px] leading-snug text-ink/80">
          Пациент прожил 5 дней из 7. Капитал вырос до 1.62× к дню 4, после чего пациент удвоил позицию на новости, которую сам назвал «подозрительной». Виноват пользователь.
        </p>
      </div>
      <div className="mx-3.5 mt-2 shrink-0">
        <SectionLabel right="5 ДНЕЙ · 11 РЕШЕНИЙ">ТАЙМЛАЙН</SectionLabel>
        <div className="relative h-[88px] overflow-hidden rounded-xl border border-strong bg-inset">
          <Candles seed={21} count={34} className="grid-panel h-full" />
          {[12, 30, 47, 63, 82].map((x, i) => (
            <span
              key={x}
              className={`absolute top-1 grid h-4 w-4 place-items-center rounded-full border font-mono text-[7px] font-bold ${i === 4 ? "border-bad bg-bad text-bg" : i === 2 ? "border-warn text-warn" : "border-good text-good"}`}
              style={{ left: `${x}%` }}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
      <div className="mx-3.5 mt-2 min-h-0 flex-1 space-y-1.5 overflow-hidden">
        <div className="flex items-center gap-2.5 rounded-[10px] border border-bad/50 bg-bad/5 p-2">
          <div className="h-11 w-11 shrink-0 rounded-lg border border-bad bg-[url(/ref/goblin.jpg)] bg-cover bg-center" />
          <div className="min-w-0">
            <div className="font-mono text-[8px] tracking-wider text-bad">ВРАГ РАСКРЫТ · РЕШЕНИЕ №5</div>
            <div className="text-[13px] font-bold leading-tight">Leverage Goblin</div>
            <div className="text-[10px] text-sub">Третья встреча. Каждый раз — новый контекст, одна и та же подпись.</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            ["ТЫ", "1.62× → 0", "text-bad"],
            ["ПРИЗРАК", "1.31× выжил", "text-cognitive"],
            ["ТОП-1%", "1.48× выжил", "text-good"],
          ].map(([l, v, c]) => (
            <div key={l} className="rounded-[9px] border border-border bg-surface p-2 text-center">
              <div className="font-mono text-[7px] text-muted">{l}</div>
              <div className={`font-mono text-[11px] font-bold ${c}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="rounded-[10px] border border-border bg-surface p-2.5">
          <div className="font-mono text-[8px] tracking-wider text-muted">ЧТО УЗНАЛ ПРИЗРАК</div>
          <div className="mt-1 flex flex-wrap gap-1">
            <Chip tone="bad">ДИСЦИПЛИНА РИСКА −3</Chip>
            <Chip tone="good">КАЛИБРОВКА +2</Chip>
            <Chip tone="good">ИММУНИТЕТ +1</Chip>
          </div>
        </div>
        <div className="rounded-[10px] border border-primary/40 bg-primary/5 p-2.5">
          <div className="font-mono text-[8px] tracking-wider text-primary">ТРЕНИРОВКА НА ЗАВТРА · 4 МИН</div>
          <div className="text-[11px] font-bold leading-tight">«Половина позиции»: 5 встреч с Гоблином, где выигрыш возможен только при размере ≤ 25%.</div>
        </div>
      </div>
      <div className="mx-3.5 my-2 grid shrink-0 grid-cols-2 gap-2">
        <Btn ghost>В ЖУРНАЛ ОШИБОК</Btn>
        <Btn primary>НОВЫЙ РЕЙД</Btn>
      </div>
      <BottomNav active="more" />
    </Phone>
  );
}

/* ───────────── 08 · VAULT / PROOF OF SKILL ───────────── */
export function VaultScreen() {
  return (
    <Phone
      mechanic="ЭКОНОМИКА · PROOF-OF-SKILL"
      title="Хранилище: единственный актив — навык"
      caption="$SIG начисляется только за верифицированную калибровку (Brier score), победы культов и аренду Призрака. Покупка не даёт преимуществ. Всё, что за деньги, — косметика и сезон."
    >
      <TopBar level="L7" right={<span className="font-mono text-[11px] font-bold text-warn">◈ 312 $SIG</span>} />
      <div className="mx-3.5 mt-2 shrink-0 rounded-xl border border-border bg-surface p-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[8px] tracking-wider text-muted">СТОИМОСТЬ ПРИЗРАКА · 90Д КАЛИБРОВКА</div>
            <div className="font-mono text-[26px] font-bold leading-none text-primary">1 840 <span className="text-[12px] text-sub">$SIG</span></div>
          </div>
          <Chip tone="good">+12% ЗА НЕДЕЛЮ</Chip>
        </div>
        <div className="mt-2 flex h-9 items-end gap-[3px]">
          {[30, 34, 31, 40, 44, 42, 50, 48, 55, 61, 58, 66, 70, 68, 74, 80].map((h, i) => (
            <i key={i} className="flex-1 rounded-t-sm bg-primary/70" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mt-1.5 font-mono text-[7px] text-muted">Цена — функция измеренного навыка. Медвежий сезон её не обнуляет. Твоя лень — да.</div>
      </div>
      <div className="mx-3.5 mt-2 shrink-0">
        <SectionLabel right="ЗА 30 ДНЕЙ">ИСТОЧНИКИ ДОХОДА</SectionLabel>
        <div className="space-y-1">
          {[
            ["КАЛИБРОВКА ПРОГНОЗОВ", "Brier 0.19 · топ 18%", "+184", "var(--color-primary)"],
            ["ПОБЕДЫ КУЛЬТА", "Орден удержал доки ×2", "+60", "var(--color-risk)"],
            ["АРЕНДА ПРИЗРАКА", "3 новичка · 21 день", "+96", "var(--color-cognitive)"],
            ["ЛИГА ПРИЗРАКОВ", "серебро · #212", "+28", "var(--color-warn)"],
          ].map(([t, s, v, c]) => (
            <div key={t} className="flex items-center gap-2.5 rounded-[9px] border border-border bg-surface px-2.5 py-1.5">
              <span className="h-6 w-1 rounded-full" style={{ background: c }} />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[9px] font-bold text-text">{t}</div>
                <div className="font-mono text-[8px] text-muted">{s}</div>
              </div>
              <span className="font-mono text-[11px] font-bold text-good">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-3.5 mt-2 min-h-0 flex-1">
        <SectionLabel>ЧТО НЕЛЬЗЯ КУПИТЬ</SectionLabel>
        <div className="grid grid-cols-3 gap-1.5">
          {["ТОЧНОСТЬ", "ЧЕРТЫ ПРИЗРАКА", "ВЛИЯНИЕ КУЛЬТА"].map((t) => (
            <div key={t} className="rounded-[9px] border border-dashed border-bad/50 bg-bad/5 p-2 text-center font-mono text-[8px] font-bold text-bad">🚫 {t}</div>
          ))}
        </div>
        <div className="mt-2 paper rounded-[9px] px-2.5 py-1.5" style={{ borderLeft: "4px solid var(--color-warn)" }}>
          <div className="font-mono text-[8px] font-bold tracking-wider text-ink/50">СЕЗОННЫЙ ПРОПУСК «ХАЛВИНГ»</div>
          <div className="text-[11px] font-bold leading-tight">Косметика культа, скины призрака, архивные газеты. Ноль влияния на исход. Мы проверяли.</div>
        </div>
      </div>
      <div className="mx-3.5 my-2 grid shrink-0 grid-cols-2 gap-2">
        <Btn ghost>ВЫВЕСТИ</Btn>
        <Btn primary>МИНТ ПРИЗРАКА</Btn>
      </div>
      <BottomNav active="more" />
    </Phone>
  );
}
