export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Area = 'arena' | 'engine' | 'state' | 'config' | 'scenes' | 'backend';

export interface Bug {
  id: string;
  severity: Severity;
  area: Area;
  file: string;
  title: string;
  description: string;
  impact: string;
  patchId?: string;
}

export const AREA_LABEL: Record<Area, string> = {
  arena: 'ArenaScene',
  engine: 'Движок (rng/mutator/scoring)',
  state: 'GameState',
  config: 'Конфиги',
  scenes: 'Прочие сцены',
  backend: 'Backend',
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Критично',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

export const bugs: Bug[] = [
  // ───────────── ARENA ─────────────
  {
    id: 'B01',
    severity: 'critical',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → createBrowser()',
    title: 'Переключение вкладки источника генерирует новую задачу',
    description:
      'Тап по вкладке делает this.activeSource = sid; this.scene.restart(). Но create() заново считает seed (с Date.now()), вызывает pickTemplate()/mutate() и принудительно ставит activeSource = sources[0]. Улики (selectedEvidence) очищаются.',
    impact:
      'Игрок не может открыть вторую вкладку вообще: каждый тап — другой враг, другой вопрос, другой тикер. Сломаны M1 (улики), M9 (слепой источник) и сам смысл «браузера источников».',
    patchId: 'P01',
  },
  {
    id: 'B02',
    severity: 'critical',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → createBrowser() (isBlind)',
    title: 'Слепой источник (M9) списывает бюджет, но не открывается',
    description:
      'При открытии: gameState.changeBudget(-6); this.blindOpened = true; this.scene.restart(). В create() первой строкой this.blindOpened = false → вкладка снова закрыта.',
    impact:
      'Бюджет риска утекает при каждом тапе, источник никогда не открывается. Можно «случайно» довести себя до Левиафана простым кликаньем.',
    patchId: 'P01',
  },
  {
    id: 'B03',
    severity: 'critical',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → create()',
    title: 'Seed недетерминирован (Date.now())',
    description:
      'seed = (level*100000 + xp + Date.now()) >>> 0. Комментарий говорит «M11 — детерминированный seed», но реально задача невоспроизводима: ни сервером, ни при повторе, ни в «тени арены».',
    impact:
      'Невозможна серверная валидация попыток (POST /attempts валидирует по seed), невозможна честная «тень арены» (M14), невозможен баг-репорт «переиграй seed N».',
    patchId: 'P02',
  },
  {
    id: 'B04',
    severity: 'high',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → showShadowAndReward() CTA',
    title: 'Экран смены эпохи никогда не показывается',
    description:
      'const oldEp = this.epoch.id вычисляется в момент нажатия «ДАЛЕЕ», когда gameState.addXp() уже поднял уровень. this.epoch — геттер от текущего level, поэтому oldEp === newEp всегда.',
    impact:
      'Переход Улица→Кабинет (и все остальные) проходит молча, showEpochTransition — мёртвый код.',
    patchId: 'P03',
  },
  {
    id: 'B05',
    severity: 'high',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → createBottomNav()',
    title: 'Иконки нижней навигации не рендерятся',
    description:
      'Boot грузит текстуры с ключом iconKey(id) = "icon_nav-academy", а Арена проверяет this.textures.exists("nav-academy"). Переменная k = "icon_"+... объявлена, но не используется.',
    impact: 'В главной сцене нижнее меню без иконок — только 7px подписи.',
    patchId: 'P04',
  },
  {
    id: 'B06',
    severity: 'high',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → pickTemplate()',
    title: 'Свиток ошибок проверяется только по [0]',
    description:
      'if(errorScroll.length>0 && !errorScroll[0].closed). pushError делает unshift, closeError закрывает на месте. Если последняя запись закрыта, а более старые открыты — приоритет M7 игнорируется. Плюс enemy.stages.find(s=>s.level<=lvl) возвращает ПЕРВУЮ (самую низкую) стадию, а не максимальную доступную.',
    impact: 'M7 работает через раз; игроку с уровнем 40 выдают стадию S1 вместо S3.',
    patchId: 'P05',
  },
  {
    id: 'B07',
    severity: 'high',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → showIdentify()',
    title: 'Опознание врага (M5) предсказуемо и ломается в эпохе «Система»',
    description:
      'Список кандидатов = enemies.filter(domain).slice(0,N) без перемешивания; если верный враг не попал — он ставится в opts[0]. Для system optionsByEpoch = 0 → slice(0,0) → один-единственный вариант (правильный). Повторные тапы по портретам запускают showShadowAndReward несколько раз (наложение).',
    impact: 'Правильный ответ почти всегда первый; в поздней эпохе M5 деградирует в одну кнопку; двойные награды-оверлеи.',
    patchId: 'P06',
  },
  {
    id: 'B08',
    severity: 'high',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → handleResult()',
    title: 'Нет защиты от двойного submit, стрик не обновляется',
    description:
      'После выбора уверенности нет флага «уже отправлено»: быстрый двойной тап по кнопке ставки вызывает submitAnswer() дважды до появления оверлея → XP/монеты/бюджет считаются дважды. progress.streak никогда не меняется (всегда 2), хотя показывается в топ-баре и передаётся в scoreEncounter.',
    impact: 'Дюп наград на мобильном (multi-touch), фейковый стрик в UI.',
    patchId: 'P07',
  },
  {
    id: 'B09',
    severity: 'medium',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → refreshEvidenceStrip()',
    title: 'Утечка объектов при каждом тапе по улике',
    description:
      'Каждый вызов добавляет новый Rectangle + Text поверх старых, ничего не удаляя. Также маркеры выбора внутри панели источника (✓/○, кружок) не перерисовываются, потому что restart не вызывается.',
    impact: 'Display list растёт на 2 объекта за тап; визуально улика «не отмечается» в самой панели.',
    patchId: 'P08',
  },
  {
    id: 'B10',
    severity: 'medium',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → showConfidencePicker() / M10',
    title: 'Пикер уверенности дублируется, «холодная голова» ставит несколько таймеров',
    description:
      'if(this.confidence) return — но confidence остаётся null до submit, поэтому каждый тап по другому ответу рисует ещё один пикер поверх. В tilt-режиме каждый тап создаёт новый delayedCall и новый текст «вдох...».',
    impact: 'Нагромождение UI, несколько отложенных submit после задержки.',
    patchId: 'P07',
  },
  {
    id: 'B11',
    severity: 'medium',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → createDebugEpochSwitcher()',
    title: 'Dev-кнопка LVL+8 в проде',
    description: 'Кнопка всегда рендерится и позволяет за 10 тапов дойти до уровня 85.',
    impact: 'Любой игрок ломает прогрессию и метрики.',
    patchId: 'P09',
  },
  {
    id: 'B12',
    severity: 'medium',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → submitAnswer()',
    title: 'M4 вердикт: при неотвеченном факторе всё считается ошибкой',
    description:
      'Если encounter.verdict есть и level ≥ 21, то verdictFactor === null !== correctFactor → сразу «неверно», без подсказки игроку, что нужно сначала выбрать фактор. Проверка на «введённость» M3/M5 по introducedAt отсутствует вовсе (пикер уверенности и опознание показываются с уровня 1, хотя конфиг говорит 3 и 8).',
    impact: 'Неочевидные проигрыши; balanceConfig.*.introducedAt игнорируется.',
    patchId: 'P07',
  },
  {
    id: 'B13',
    severity: 'low',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → refreshActionButton()',
    title: 'Кнопка «К решению» (Улица) — пустая заглушка',
    description: 'Метод объявлен, вызывается, но тело — два комментария. Костыль toActionButton из epochConfig не реализован.',
    impact: 'Обещанная эпохой I механика отсутствует.',
  },
  {
    id: 'B14',
    severity: 'low',
    area: 'arena',
    file: 'phaser/src/scenes/ArenaScene.ts → showShadowAndReward()',
    title: '«Тень арены» — захардкоженные проценты и подписи A–D',
    description:
      'dist = [12,58,22,8] / [38,18,32,12] не зависят от задачи; текст «42% попались на ловушку C» противоречит числам. Подписи A–D не совпадают с перемешанными a.label из mutator.',
    impact: 'M14 выглядит фейком, мешает доверию.',
  },

  // ───────────── ENGINE ─────────────
  {
    id: 'B15',
    severity: 'high',
    area: 'engine',
    file: 'phaser/src/engine/mutator.ts',
    title: 'После перемешивания вариантов буквы A/B/C/D «едут»',
    description:
      'mutatedAnswers = order.map(i => template.answers[i]) сохраняет исходные label, поэтому сетка выглядит как C, A, D, B. Код молча предполагает ровно 4 варианта ([0,1,2,3]).',
    impact: 'Визуальный хаос + рассинхрон с «тенью арены» и с сервером.',
    patchId: 'P10',
  },
  {
    id: 'B16',
    severity: 'high',
    area: 'engine',
    file: 'phaser/src/engine/mutator.ts',
    title: 'Мутация чисел затирает текст улики',
    description:
      "if(label.includes('40%')) label = `${rng.int(30,55)}%` — ВЕСЬ ярлык заменяется на одно число. if(label.includes('20')) срабатывает на '2000', '120', '2024' и после предыдущей замены.",
    impact: 'Улика «объём -40% к среднему» превращается в «47%»; двойные мутации ломают смысл.',
    patchId: 'P10',
  },
  {
    id: 'B17',
    severity: 'medium',
    area: 'engine',
    file: 'phaser/src/engine/mutator.ts',
    title: 'Зеркалирование (лонг↔шорт) меняет только текст вопроса',
    description:
      "isMirrored заменяет 'рост'→'снижение' в вопросе, но варианты ответов и correct не зеркалятся. Тикер/таймфрейм выбираются случайно независимо от шаблона.",
    impact: 'Половина задач семантически противоречива: вопрос про снижение, «верный» ответ — лонг.',
    patchId: 'P10',
  },
  {
    id: 'B18',
    severity: 'low',
    area: 'engine',
    file: 'phaser/src/engine/scoring.ts',
    title: 'Параметры level/epoch/streak не используются',
    description: 'scoreEncounter принимает их, но формула их игнорирует. Дублируются confidenceMul и confidence.multipliers, blind.cost и riskBudget.blindSourceCost.',
    impact: 'Ложное ощущение, что стрик и эпоха влияют на награду; два источника правды в конфиге.',
  },

  // ───────────── STATE ─────────────
  {
    id: 'B19',
    severity: 'critical',
    area: 'state',
    file: 'phaser/src/state/GameState.ts → constructor / addXp',
    title: 'Битый localStorage роняет игру на старте; возможен бесконечный цикл',
    description:
      'JSON.parse(saved) без try/catch выполняется в module-scope (export const gameState = new GameState()). Любая порча → белый экран до очистки хранилища. addXp: while(xp >= xpMax) — если из сейва пришёл xpMax = 0/NaN/undefined, цикл бесконечный (NaN сравнения — false, но 0 — зависание вкладки).',
    impact: 'Невосстановимый краш для игрока; зависание вкладки при мигрировании старых сейвов.',
    patchId: 'P11',
  },
  {
    id: 'B20',
    severity: 'high',
    area: 'state',
    file: 'phaser/src/state/GameState.ts → addXp',
    title: 'Прогрессия XP не совпадает с конфигом',
    description:
      'xpMax *= 1.4 экспоненциально (уровень 20 ≈ 218 000 XP при +24 за задачу ≈ 9 000 верных ответов). balanceConfig.xp.levelThresholds есть, но не используется.',
    impact: 'Эпохи II–IV практически недостижимы честно; конфиг — мёртвый.',
    patchId: 'P11',
  },
  {
    id: 'B21',
    severity: 'medium',
    area: 'state',
    file: 'phaser/src/state/GameState.ts → defaultProgress / pushError',
    title: 'Новый игрок стартует с L4/680 XP; id ошибок могут совпасть',
    description:
      'defaultProgress() — демо-состояние (level 4, 1240 SIG, streak 2), а онбординг говорит «первый вход, бюджет 100». id = "e"+Date.now() — две ошибки в одну мс (batch) получат один id → closeError закроет не ту.',
    impact: 'Противоречие с онбордингом и метриками; редкий, но реальный баг закрытия записей.',
    patchId: 'P11',
  },
  {
    id: 'B22',
    severity: 'medium',
    area: 'state',
    file: 'phaser/src/state/GameState.ts',
    title: 'Погода (M13) никогда не меняется',
    description: "weather: 'TREND' задаётся один раз в defaultProgress и нигде не пересчитывается. Разминка дня и Арена показывают вечный ТРЕНД.",
    impact: 'M13 фактически не реализована на клиенте.',
    patchId: 'P11',
  },

  // ───────────── CONFIG ─────────────
  {
    id: 'B23',
    severity: 'low',
    area: 'config',
    file: 'phaser/src/config/gameConfig.ts',
    title: 'Подключена arcade-физика, которая нигде не используется; нет roundPixels/resolution',
    description: 'physics: { default: "arcade" } увеличивает бандл и тик апдейта. Тексты 6–7px без roundPixels мылятся на FIT-масштабе.',
    impact: 'Лишние ~30 КБ и размытый UI на не-retina.',
    patchId: 'P09',
  },
  {
    id: 'B24',
    severity: 'low',
    area: 'config',
    file: 'phaser/src/scenes/BootScene.ts',
    title: 'Boot грузит все 33 врага × стадии × 3 SVG сразу, без обработки ошибок',
    description: 'Порядка 150+ SVG растрируются до первого экрана (512×512 каждый); нет loaderror-хендлера и прогресс-бара.',
    impact: 'Долгий чёрный экран на мобильном, тихие 404.',
  },

  // ───────────── SCENES ─────────────
  {
    id: 'B25',
    severity: 'medium',
    area: 'scenes',
    file: 'phaser/src/scenes/ErrorJournalScene.ts → openEntry()',
    title: 'Кнопка «ЗАКРЫТЬ» убирает только фон оверлея',
    description: 'overlay.destroy() удаляет один Rectangle; тексты FIX MISSION, «КОРЕНЬ», кнопка остаются на экране и остаются интерактивными.',
    impact: 'После первого открытия записи экран журнала замусорен.',
    patchId: 'P12',
  },
  {
    id: 'B26',
    severity: 'medium',
    area: 'scenes',
    file: 'phaser/src/scenes/OnboardingScene.ts → showStep()',
    title: 'children.removeAll(true) внутри обработчика pointerdown + потеря фона',
    description: 'Удаление всех объектов (включая тот, чей обработчик исполняется) во время диспатча ввода; фон bg-wall, добавленный в create(), удаляется на первом же showStep().',
    impact: 'Риск исключений в InputPlugin на некоторых версиях Phaser; кирпичный фон виден 0 мс.',
    patchId: 'P12',
  },
  {
    id: 'B27',
    severity: 'low',
    area: 'scenes',
    file: 'phaser/src/scenes/DailyWarmupScene.ts',
    title: 'Разминка не даёт награды и просто открывает Арену',
    description: 'balanceConfig.xp.perDailyWarmup / coins.perDailyWarmup не используются; кнопка «ДАЛЕЕ → РАЗМИНКА» в Арене ведёт на restart Арены, а не в разминку.',
    impact: 'Обещанный луп «разминка → арена» отсутствует.',
  },

  // ───────────── BACKEND ─────────────
  {
    id: 'B28',
    severity: 'critical',
    area: 'backend',
    file: 'backend/aibackend/http/router.ts → POST /billing/purchase',
    title: 'Цена покупки приходит от клиента',
    description: 'z.object({ sku, kind, priceSig: z.number().min(0) }) → клиент передаёт priceSig: 0 и получает любой премиум/косметику бесплатно.',
    impact: 'Полный обход экономики SIG.',
    patchId: 'P13',
  },
  {
    id: 'B29',
    severity: 'high',
    area: 'backend',
    file: 'backend/aibackend/http/index.ts → requireAdmin / verifyToken',
    title: 'Небезопасный админ-доступ и дефолтные секреты',
    description:
      "JWT_SECRET и ADMIN_TOKEN имеют захардкоженные fallback-значения; сравнение админ-токена через !== (не constant-time); токен принимается из query-string (попадает в логи/рефереры). verifyToken: JSON.parse payload без try/catch → 500 вместо 401.",
    impact: 'Прод без env = открытая админка; timing-атака на токен.',
    patchId: 'P14',
  },
  {
    id: 'B30',
    severity: 'medium',
    area: 'backend',
    file: 'backend/aibackend/http/index.ts → rateLimit / deterministicSeed',
    title: 'Утечка памяти в rateLimit; seed зависит от JWT_SECRET',
    description: 'Map buckets никогда не чистится (ключ = ip/uid). deterministicSeed использует HMAC на секрете авторизации: ротация секрета меняет все seed и ломает воспроизводимость задач.',
    impact: 'Рост RSS на длинном аптайме; смена секрета = невоспроизводимые попытки.',
    patchId: 'P14',
  },
  {
    id: 'B31',
    severity: 'medium',
    area: 'backend',
    file: 'backend/aibackend/http/router.ts → dispatch()',
    title: '404 раскрывает полную карту маршрутов; decodeURIComponent без защиты',
    description: 'ApiError(404, ..., { routes: listRoutes() }) отдаёт все админ-роуты любому. decodeURIComponent("%") бросает URIError → 500. IP берётся из X-Forwarded-For без доверенного прокси → rate-limit обходится заголовком.',
    impact: 'Разведка API, обход лимитов, шумные 500.',
    patchId: 'P14',
  },
  {
    id: 'B32',
    severity: 'low',
    area: 'backend',
    file: 'backend/aibackend/http/router.ts',
    title: 'Смешение Next.js и Fastify',
    description: "Комментарий «catch-all handler Next.js», импорт db из '@/db' (алиас Next), при этом README и npm start описывают Fastify. Один из вариантов не соберётся без tsconfig paths.",
    impact: 'Хрупкая сборка, непонятно какой рантайм — источник правды.',
  },
];
