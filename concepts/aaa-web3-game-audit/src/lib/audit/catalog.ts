import {
  type Analysis,
  type ScanContext,
  CODE_EXTS,
  STYLE_EXTS,
  UI_EXTS,
  SERVER_PATH_RE,
  pass,
  warn,
  fail,
  manual,
} from "./types";

export const CATEGORIES = [
  "Onboarding & Web3 Entry",
  "Transaction UX",
  "Game Feel & Feedback",
  "Navigation & IA",
  "Economy & Assets",
  "Security & Trust",
  "Performance",
  "Accessibility",
  "Backend & Data",
  "Live-ops & Spec Quality",
] as const;

const C = CATEGORIES;
const TSX = ["tsx", "jsx", "vue", "svelte"];

function noUi(ctx: ScanContext) {
  return ctx.filesMatching(/\.(tsx|jsx|vue|svelte|html)$/).length === 0;
}
function apiRoutes(ctx: ScanContext) {
  return ctx.filesMatching(/(\/api\/.*route\.(ts|js)$|\/pages\/api\/.*\.(ts|js)$|\/(controllers?|routes?|handlers?)\/.*\.(ts|js|py|go|rs)$)/);
}
function noSpec(ctx: ScanContext) {
  return ctx.spec.trim().length < 40;
}

export const ANALYSES: Analysis[] = [
  // ───────────── A. Onboarding & Web3 Entry ─────────────
  {
    code: "A01", category: C[0], severity: "critical",
    title: "Подключение кошелька (Wallet Connect Layer)",
    description: "Есть ли слой подключения кошелька (wagmi/RainbowKit/AppKit/Privy/Solana adapter/TON Connect) — точка входа любой Web3 игры.",
    run(ctx) {
      const deps = ctx.hasDep("wagmi", "viem", "ethers", "web3", "thirdweb", /^@rainbow-me\//, /^@web3modal\//, /^@reown\//, /^@solana\/wallet-adapter/, /^@tonconnect\//, /^@privy-io\//, /^@dynamic-labs\//, /^@mysten\/dapp-kit/);
      const ev = ctx.grep(/useConnect\(|connectWallet|window\.ethereum|WalletConnect|useWallet\(|TonConnectButton|ConnectButton/, { exts: CODE_EXTS });
      if (deps.length && ev.length) return pass(`Найден Web3-стек: ${deps.join(", ")}; UI подключения обнаружен.`, ev);
      if (deps.length) return warn(`Зависимости есть (${deps.join(", ")}), но UI-компонент подключения не найден.`, "Добавить видимую кнопку Connect с состояниями: idle → connecting → connected(ENS/avatar) → error.", ev);
      return fail("Слой подключения кошелька отсутствует — игрок не может войти в Web3-контур.", "Внедрить wagmi + AppKit/RainbowKit (EVM) или wallet-adapter (Solana). Первый экран: одна кнопка, без жаргона.", ev);
    },
  },
  {
    code: "A02", category: C[0], severity: "high",
    title: "Гостевой режим / игра без кошелька",
    description: "AAA-стандарт: игрок должен попробовать core-loop до подключения кошелька (embedded/social login или guest).",
    run(ctx) {
      const ev = ctx.grep(/guest|без кошелька|playAsGuest|demo.?mode|tryWithout|anonymous|embedded.?wallet|social.?login/i, { exts: CODE_EXTS });
      const deps = ctx.hasDep(/^@privy-io\//, /^@dynamic-labs\//, /^@magic-sdk\//, /^@web3auth\//, "thirdweb");
      const inSpec = ctx.specHas(/гост|guest|без кошельк|social login|embedded/i);
      if (ev.length || deps.length) return pass(`Гостевой/embedded вход реализован${deps.length ? ` (${deps.join(", ")})` : ""}.`, ev);
      if (inSpec) return warn("ТЗ предусматривает гостевой режим, но в коде он не найден.", "Реализовать guest-сессию с миграцией прогресса в кошелёк (claim flow).", ev);
      return fail("Нет входа без кошелька — потеря до 70% Web2-аудитории на первом экране.", "Добавить Play-as-guest / social login (Privy, Web3Auth) и отложенное подключение кошелька в момент первой ценности.", ev);
    },
  },
  {
    code: "A03", category: C[0], severity: "medium",
    title: "Мультикошелёк и мобильный WalletConnect",
    description: "Поддержка нескольких провайдеров (injected, WalletConnect, Coinbase, мобильные deep-links).",
    run(ctx) {
      const deps = ctx.hasDep(/^@rainbow-me\//, /^@web3modal\//, /^@reown\//, /^@solana\/wallet-adapter-wallets/, /^@privy-io\//, /^@dynamic-labs\//);
      const n = ctx.count(/walletConnect\(|coinbaseWallet\(|injected\(|metaMask\(|safe\(|PhantomWalletAdapter|SolflareWalletAdapter/, { exts: CODE_EXTS });
      if (deps.length || n >= 2) return pass(`Мультикошелёк: ${deps.length ? deps.join(", ") : `${n} коннекторов`}.`, ctx.grep(/walletConnect\(|coinbaseWallet\(|injected\(|WalletAdapter/, { exts: CODE_EXTS }));
      if (n === 1) return warn("Только один коннектор — мобильные игроки без расширения останутся за бортом.", "Добавить WalletConnect v2 и Coinbase Wallet; проверить deep-link на iOS/Android.");
      return fail("Коннекторы не настроены.", "Использовать модалку с 4+ провайдерами и «Recent» секцией; иконки и статусы установлен/не установлен.");
    },
  },
  {
    code: "A04", category: C[0], severity: "high",
    title: "Обработка неверной сети (Chain Guard)",
    description: "Детект и авто-переключение сети, понятный баннер «Вы в неправильной сети».",
    run(ctx) {
      const ev = ctx.grep(/switchChain|useSwitchChain|wallet_switchEthereumChain|wrongNetwork|unsupportedChain|isChainSupported|useChainId|неверн\w+ сет/i, { exts: CODE_EXTS });
      if (ev.length >= 2) return pass("Chain guard реализован.", ev);
      if (ev.length === 1) return warn("Есть упоминание переключения сети, но нет полноценного guard-а.", "Сделать глобальный ChainGuard: баннер + кнопка Switch + fallback на добавление сети (wallet_addEthereumChain).", ev);
      return fail("Нет обработки неправильной сети — транзакции будут падать без объяснений.", "Добавить ChainGuard-провайдер, блокирующий игровые действия до переключения сети.", ev);
    },
  },
  {
    code: "A05", category: C[0], severity: "high",
    title: "FTUE: туториал и первое впечатление",
    description: "First-Time User Experience: пошаговый ввод в core-loop, подсказки, прогресс-индикатор онбординга.",
    run(ctx) {
      const ev = ctx.grep(/tutorial|onboarding|ftue|firstTime|walkthrough|react-joyride|driver\.js|intro\.js|coachmark|hasSeenIntro/i, { exts: CODE_EXTS });
      const deps = ctx.hasDep("react-joyride", "driver.js", "intro.js", "shepherd.js");
      if (ev.length >= 2 || deps.length) return pass("FTUE/туториал присутствует.", ev);
      if (ctx.specHas(/туториал|обучени|onboarding|ftue/i)) return warn("Туториал описан в ТЗ, но не реализован.", "Реализовать 3-5 шаговый интерактивный туториал с пропуском и сохранением прогресса.", ev);
      return fail("FTUE отсутствует — D1 retention будет страдать.", "Спроектировать FTUE: первая награда ≤ 60 сек, объяснение Web3-механик по мере надобности, а не заранее.", ev);
    },
  },

  // ───────────── B. Transaction UX ─────────────
  {
    code: "B01", category: C[1], severity: "critical",
    title: "Состояния транзакции (pending / confirming / success / fail)",
    description: "Каждая on-chain операция должна иметь полный жизненный цикл в UI, а не «спиннер и тишина».",
    run(ctx) {
      const ev = ctx.grep(/isPending|isConfirming|waitForTransactionReceipt|useWaitForTransactionReceipt|confirmations|txStatus|TransactionStatus|signature.*confirmed/i, { exts: CODE_EXTS });
      if (ev.length >= 3) return pass("Жизненный цикл транзакции отслеживается.", ev);
      if (ev.length) return warn("Отслеживание частичное.", "Ввести единый TxTracker: очередь транзакций, статусы, повтор, ссылка на explorer, оптимистичный UI.", ev);
      return fail("Состояния транзакций не обрабатываются.", "Создать TxProvider с машиной состояний idle→signing→pending→confirmed/failed и глобальным виджетом активности.", ev);
    },
  },
  {
    code: "B02", category: C[1], severity: "critical",
    title: "Человекочитаемые ошибки транзакций",
    description: "User rejected, insufficient funds, nonce too low, slippage — должны маппиться на понятные сообщения с действием.",
    run(ctx) {
      const ev = ctx.grep(/UserRejected|4001|ACTION_REJECTED|insufficient funds|user denied|rejected the request|InsufficientFunds|parseTxError|mapTxError|ошибк\w* транзакц/i, { exts: CODE_EXTS });
      if (ev.length >= 2) return pass("Маппинг ошибок транзакций найден.", ev);
      if (ev.length === 1) return warn("Обрабатывается единичный случай.", "Сделать словарь ошибок (≥ 10 кейсов) + CTA: «Пополнить», «Повторить», «Сменить сеть».", ev);
      return fail("Ошибки контрактов показываются «как есть» или не показываются вовсе.", "Внедрить errorMapper с локализованными текстами и next-step кнопкой.", ev);
    },
  },
  {
    code: "B03", category: C[1], severity: "high",
    title: "Прозрачность комиссий (Gas Preview)",
    description: "Перед подписью игрок видит стоимость действия в токене и фиате.",
    run(ctx) {
      const ev = ctx.grep(/estimateGas|useEstimateGas|maxFeePerGas|getFeeData|gasPrice|feeEstimate|комисси|gas.?fee|priorityFee/i, { exts: CODE_EXTS });
      if (ev.length >= 2) return pass("Оценка газа выводится.", ev);
      if (ev.length) return warn("Газ считается, но не факт, что показывается игроку.", "Показывать сводку «Стоимость действия: 0.0012 ETH (~$3.1)» до подписи; при sponsored tx — явно писать «Бесплатно».", ev);
      if (ctx.hasDep(/^@solana\//).length) return warn("Solana: комиссии малы, но priority fee и rent всё равно надо показывать.", "Добавить fee preview для rent-exempt аккаунтов и priority fee.", ev);
      return fail("Комиссии не показываются — игрок подписывает вслепую.", "Добавить fee preview + режим gasless (paymaster / ERC-4337) для core-loop действий.", ev);
    },
  },
  {
    code: "B04", category: C[1], severity: "medium",
    title: "Ссылки на explorer и история транзакций",
    description: "После отправки — ссылка на etherscan/solscan, а в профиле — история on-chain действий.",
    run(ctx) {
      const ev = ctx.grep(/etherscan|polygonscan|basescan|arbiscan|solscan|tonviewer|blockExplorer|explorerUrl|\/tx\/\$\{/i, { exts: CODE_EXTS });
      if (ev.length >= 2) return pass("Ссылки на explorer присутствуют.", ev);
      if (ev.length) return warn("Explorer упоминается лишь однажды.", "Добавить ссылку в toast, в TxTracker и в историю активности профиля.", ev);
      return fail("Нет ссылок на explorer — игрок не может верифицировать результат.", "Добавить утилиту getExplorerUrl(chainId, hash) и историю транзакций.", ev);
    },
  },
  {
    code: "B05", category: C[1], severity: "high",
    title: "Подписи: SIWE / EIP-712 с объяснением",
    description: "Аутентификация через Sign-In With Ethereum, типизированные данные вместо «слепых» подписей, объяснение зачем нужна подпись.",
    run(ctx) {
      const siwe = ctx.grep(/siwe|Sign-?In with Ethereum|signTypedData|EIP-?712|verifySiweMessage|createSiweMessage/i, { exts: CODE_EXTS });
      const raw = ctx.grep(/signMessage\(|personal_sign/, { exts: CODE_EXTS });
      if (siwe.length) return pass("SIWE/EIP-712 используется.", siwe);
      if (raw.length) return warn("Используется сырой signMessage без SIWE/типизированных данных.", "Перейти на SIWE (EIP-4361) с nonce/expiry и на EIP-712 для игровых действий; показывать модалку «Что вы подписываете».", raw);
      if (ctx.hasDep("wagmi", "viem", "ethers").length) return fail("Нет аутентификации подписью — сессия не привязана к кошельку.", "Внедрить SIWE + серверную верификацию, sessions в httpOnly cookie.", []);
      return manual("Web3-стек не обнаружен — проверка неприменима до появления фронтенда.", "Заложить SIWE в архитектуру авторизации.");
    },
  },

  // ───────────── C. Game Feel & Feedback ─────────────
  {
    code: "C01", category: C[2], severity: "high",
    title: "Motion-система (анимации и переходы)",
    description: "Есть ли согласованная система анимаций: библиотека, keyframes, тайминги, easing-токены.",
    run(ctx) {
      const deps = ctx.hasDep("framer-motion", "motion", "gsap", /^@react-spring\//, "animejs", "lottie-react", /^@rive-app\//);
      const kf = ctx.count(/@keyframes/, { exts: STYLE_EXTS });
      const ev = ctx.grep(/@keyframes|animate=\{|useSpring|gsap\./, { exts: UI_EXTS });
      if (deps.length || kf >= 4) return pass(`Motion-стек: ${deps.length ? deps.join(", ") : `${kf} keyframes`}.`, ev);
      if (kf > 0) return warn("Анимации точечные, нет системы.", "Ввести motion-токены (duration/easing), библиотеку (framer-motion/gsap) и анимации наград/переходов между экранами.", ev);
      return fail("Анимации отсутствуют — интерфейс ощущается «мёртвым».", "Добавить motion-систему: hover/press, page transitions, reward celebrations, number tickers.", ev);
    },
  },
  {
    code: "C02", category: C[2], severity: "medium",
    title: "Аудио-фидбек",
    description: "Звуки UI и игровых событий, мьют-переключатель, respect autoplay-policy.",
    run(ctx) {
      const deps = ctx.hasDep("howler", "use-sound", "tone", /^@pixi\/sound/);
      const ev = ctx.grep(/new Audio\(|AudioContext|useSound\(|Howl\(|\.play\(\)|isMuted|soundEnabled/i, { exts: CODE_EXTS });
      if ((deps.length || ev.length >= 2) && ctx.count(/mute|soundEnabled|volume/i, { exts: CODE_EXTS }) > 0) return pass("Аудио + управление громкостью найдены.", ev);
      if (deps.length || ev.length) return warn("Звук есть, но нет управления (mute/volume).", "Добавить настройки звука, сохранение в localStorage, отключение при prefers-reduced-motion.", ev);
      return fail("Аудио-фидбек отсутствует.", "Добавить звуковой слой: клики, награды, ошибки, ambient; мьют по умолчанию до первого взаимодействия.", ev);
    },
  },
  {
    code: "C03", category: C[2], severity: "medium",
    title: "Микро-взаимодействия (hover / press / transition)",
    description: "Плотность состояний наведения и нажатия, плавность переходов на интерактивных элементах.",
    run(ctx) {
      const n = ctx.count(/hover:|active:|transition-|:hover|transition:|whileTap|whileHover/, { exts: UI_EXTS });
      const ev = ctx.grep(/hover:|active:|whileTap|:hover/, { exts: UI_EXTS, limit: 5 });
      if (n >= 25) return pass(`${n} микро-взаимодействий.`, ev);
      if (n >= 5) return warn(`Только ${n} состояний hover/press.`, "Стандартизовать: каждый интерактив имеет hover, active (scale .97), focus, disabled и loading состояния.", ev);
      return fail("Интерактивные элементы не имеют состояний.", "Создать Button/Card примитивы с полным набором состояний и использовать их везде.", ev);
    },
  },
  {
    code: "C04", category: C[2], severity: "high",
    title: "Loading-состояния и скелетоны",
    description: "loading.tsx / Suspense / skeleton вместо белого экрана при загрузке on-chain данных.",
    run(ctx) {
      const files = ctx.filesMatching(/loading\.(tsx|jsx)$/);
      const ev = [...files.map((f) => ({ path: f.path, line: 1, text: "loading boundary" })), ...ctx.grep(/<Suspense|Skeleton|animate-pulse|isLoading\s*\?/, { exts: CODE_EXTS, limit: 6 })];
      if (ev.length >= 3) return pass("Loading-состояния покрыты.", ev);
      if (ev.length) return warn("Loading покрыт частично.", "Добавить loading.tsx на каждый сегмент роутинга и скелетоны для карточек/инвентаря; on-chain данные всегда асинхронны.", ev);
      return fail("Нет loading-состояний — при RPC-задержках игрок видит пустой экран.", "Внедрить Suspense-границы, скелетоны и optimistic UI для чтения баланса/инвентаря.", ev);
    },
  },
  {
    code: "C05", category: C[2], severity: "high",
    title: "Система уведомлений (toasts)",
    description: "Централизованные уведомления об успехе/ошибке/прогрессе с действием и авто-закрытием.",
    run(ctx) {
      const deps = ctx.hasDep("sonner", "react-hot-toast", "react-toastify", /^@radix-ui\/react-toast/, "notistack", "@mantine/notifications");
      const ev = ctx.grep(/toast\(|toast\.(success|error|loading|promise)|useToast\(|notify\(/, { exts: CODE_EXTS });
      if (deps.length || ev.length >= 3) return pass(`Уведомления: ${deps.length ? deps.join(", ") : "собственная система"}.`, ev);
      if (ev.length) return warn("Уведомления используются эпизодически.", "Единый toast-слой с очередью, toast.promise для транзакций и ссылкой на explorer.", ev);
      return fail("Нет системы уведомлений.", "Подключить sonner; каждая транзакция → toast.promise(pending/success/error).", ev);
    },
  },

  // ───────────── D. Navigation & IA ─────────────
  {
    code: "D01", category: C[3], severity: "high",
    title: "Глобальная навигация и HUD",
    description: "Постоянный header/nav/HUD с балансом, профилем и ключевыми разделами.",
    run(ctx) {
      const ev = ctx.grep(/<nav\b|<header\b|role="navigation"|<Navbar|<Sidebar|<HUD|<Header/, { exts: TSX.concat("html") });
      if (ev.length >= 2) return pass("Навигация присутствует.", ev);
      if (ev.length) return warn("Навигация минимальна.", "Определить IA: Play / Inventory / Market / Quests / Profile; HUD с балансом и статусом сети.", ev);
      return fail("Глобальная навигация отсутствует.", "Спроектировать shell-layout с навигацией и HUD; мобильный bottom-tab-bar.", ev);
    },
  },
  {
    code: "D02", category: C[3], severity: "high",
    title: "Error / Not-found границы роутинга",
    description: "error.tsx, not-found.tsx, global-error.tsx или ErrorBoundary — игрок никогда не должен видеть stack trace.",
    run(ctx) {
      const files = ctx.filesMatching(/(error|not-found|global-error)\.(tsx|jsx)$/);
      const eb = ctx.grep(/ErrorBoundary|componentDidCatch|onError=\{/, { exts: CODE_EXTS });
      const ev = [...files.map((f) => ({ path: f.path, line: 1, text: "route boundary" })), ...eb];
      const hasErr = files.some((f) => /error\./.test(f.path)) || eb.length > 0;
      const hasNF = files.some((f) => /not-found/.test(f.path));
      if (hasErr && hasNF) return pass("Границы ошибок и 404 настроены.", ev);
      if (hasErr || hasNF) return warn(`Есть только ${hasErr ? "error boundary" : "not-found"}.`, "Добавить недостающие: error.tsx (с Retry), not-found.tsx (с возвратом в игру), global-error.tsx.", ev);
      return fail("Нет границ ошибок — любой сбой RPC уронит весь экран.", "Создать брендированные error/not-found экраны с CTA «Вернуться в игру».", ev);
    },
  },
  {
    code: "D03", category: C[3], severity: "low",
    title: "Обратная навигация и хлебные крошки",
    description: "Способ вернуться назад из вложенных экранов (детали предмета, лот маркетплейса).",
    run(ctx) {
      const ev = ctx.grep(/router\.back\(|history\.back\(|Breadcrumb|breadcrumbs|aria-label="Назад"|aria-label="Back"|← Back|Назад/i, { exts: TSX });
      if (ev.length >= 2) return pass("Обратная навигация реализована.", ev);
      if (ev.length) return warn("Обратная навигация есть не везде.", "Каждый вложенный экран: кнопка Back + хлебные крошки на desktop.", ev);
      if (noUi(ctx)) return manual("UI-файлы не найдены.", "Заложить паттерн Back/Breadcrumbs в дизайн-систему.");
      return fail("Нет обратной навигации.", "Добавить Back-кнопку в шапку вложенных экранов.", ev);
    },
  },
  {
    code: "D04", category: C[3], severity: "medium",
    title: "Empty-states (пустой инвентарь, нет лотов)",
    description: "Пустые состояния с иллюстрацией и CTA, а не голый список.",
    run(ctx) {
      const ev = ctx.grep(/EmptyState|empty-state|no items|nothing here|пока пусто|ничего не найдено|Ваш инвентарь пуст|length === 0 \?|isEmpty \?/i, { exts: TSX.concat("ts", "js") });
      if (ev.length >= 2) return pass("Empty-states обрабатываются.", ev);
      if (ev.length) return warn("Empty-state единичный.", "Компонент <EmptyState icon title cta/> для инвентаря, квестов, маркета, истории.", ev);
      if (noUi(ctx)) return manual("UI-файлы не найдены.", "Заложить EmptyState-компонент.");
      return fail("Пустые состояния не спроектированы.", "Добавить EmptyState с CTA («Купить первый предмет», «Начать квест»).", ev);
    },
  },
  {
    code: "D05", category: C[3], severity: "medium",
    title: "Поиск, фильтры и сортировка коллекций",
    description: "Инвентарь/маркет с фильтрами по редкости, типу, цене и поиском.",
    run(ctx) {
      const ev = ctx.grep(/placeholder="(Search|Поиск)|useState[^;]*(search|filter|sort|query)|sortBy|filterBy|rarity.*filter|<Select/i, { exts: TSX.concat("ts") });
      if (ev.length >= 3) return pass("Поиск/фильтры реализованы.", ev);
      if (ev.length) return warn("Фильтрация минимальна.", "Фильтры: редкость, тип, цена, «только мои»; сортировка; сохранение в URL (searchParams).", ev);
      if (noUi(ctx)) return manual("UI-файлы не найдены.", "Заложить фильтры коллекций в IA.");
      return fail("Нет поиска и фильтров.", "Добавить панель фильтров с чипами и URL-состоянием.", ev);
    },
  },

  // ───────────── E. Economy & Assets ─────────────
  {
    code: "E01", category: C[4], severity: "high",
    title: "Форматирование балансов и десятичных",
    description: "formatUnits/Intl.NumberFormat, обработка decimals, сокращения (1.2K), фиатный эквивалент.",
    run(ctx) {
      const ev = ctx.grep(/formatUnits|formatEther|parseUnits|Intl\.NumberFormat|useBalance\(|decimals|toLocaleString\(|compactNumber/, { exts: CODE_EXTS });
      if (ev.length >= 3) return pass("Форматирование балансов есть.", ev);
      if (ev.length) return warn("Форматирование частичное.", "Утилита formatToken(amount, decimals, {compact, fiat}) + запрет на отображение wei/lamports.", ev);
      return fail("Балансы не форматируются — риск показать 1000000000000000000.", "Ввести formatToken и fiat-конвертер через прайс-оракул/API.", ev);
    },
  },
  {
    code: "E02", category: C[4], severity: "medium",
    title: "Метаданные NFT/ассетов и IPFS-фолбэки",
    description: "tokenURI → metadata, IPFS-шлюзы с фолбэком, плейсхолдеры при недоступности.",
    run(ctx) {
      const ev = ctx.grep(/tokenURI|ipfs:\/\/|ipfs\.io|pinata|nft\.storage|arweave|metadata\.image|resolveIpfs|useNFT|getNFTs/i, { exts: CODE_EXTS });
      const fallback = ctx.count(/onError=\{|placeholder|fallbackSrc|ipfsGateways/i, { exts: CODE_EXTS });
      if (ev.length && fallback) return pass("Метаданные обрабатываются с фолбэками.", ev);
      if (ev.length) return warn("Метаданные грузятся без фолбэков.", "Список IPFS-шлюзов с ротацией, кеш метаданных на бэкенде, плейсхолдер при ошибке.", ev);
      if (ctx.specHas(/nft|нфт|предмет|скин|ассет/i)) return fail("ТЗ предполагает NFT-ассеты, но их загрузка не реализована.", "Индексатор (Alchemy/Helius/собственный) + кеш метаданных.", ev);
      return manual("NFT-логика не обнаружена.", "Если ассеты планируются — заложить индексатор и кеш метаданных.");
    },
  },
  {
    code: "E03", category: C[4], severity: "medium",
    title: "Маркетплейс / обмен ассетами",
    description: "Листинг, покупка, офферы; ясная воронка покупки с подтверждением.",
    run(ctx) {
      const ev = ctx.grep(/marketplace|listing|buyNow|placeBid|makeOffer|seaport|reservoir|createListing|cancelListing/i, { exts: CODE_EXTS });
      if (ev.length >= 3) return pass("Маркетплейс-флоу реализован.", ev);
      if (ev.length) return warn("Маркетплейс в зачаточном состоянии.", "Полный флоу: лот → предпросмотр → approve → buy → success; royalty и комиссия отображаются заранее.", ev);
      if (ctx.specHas(/маркет|marketplace|торгов|аукцион|обмен/i)) return fail("Маркет описан в ТЗ, но не реализован.", "Использовать Seaport/Reservoir или собственный escrow-контракт.", ev);
      return manual("Маркетплейс не предусмотрен или не найден.", "Решить: нужен ли P2P-обмен для экономики игры.");
    },
  },
  {
    code: "E04", category: C[4], severity: "high",
    title: "Анти-абьюз наград (rate-limit / cooldown / captcha)",
    description: "Защита рекламных, ежедневных и квестовых наград от ботов и мультиаккаунтов.",
    run(ctx) {
      const deps = ctx.hasDep(/^@upstash\/ratelimit/, "express-rate-limit", "rate-limiter-flexible", /^@marsidev\/react-turnstile/, "react-google-recaptcha");
      const ev = ctx.grep(/rateLimit|rate-limit|cooldown|cooldownUntil|captcha|turnstile|hcaptcha|dailyClaimAt|lastClaim/i, { exts: CODE_EXTS.concat("sol", "rs", "py", "go") });
      if (deps.length || ev.length >= 2) return pass("Анти-абьюз механики присутствуют.", ev);
      if (ev.length) return warn("Защита частичная.", "Комбинировать: server-side cooldown, rate-limit по IP+wallet, proof-of-humanity для крупных наград.", ev);
      return fail("Награды не защищены от абьюза — экономику выкачают боты.", "Rate-limit (Upstash), cooldown в БД, Turnstile, серверная выдача наград с подписью.", ev);
    },
  },
  {
    code: "E05", category: C[4], severity: "high",
    title: "Токеномика в ТЗ: sinks / faucets / эмиссия",
    description: "Документирован ли баланс притока и оттока токенов, burn-механики, вестинг.",
    run(ctx) {
      if (noSpec(ctx)) return fail("ТЗ не найдено — токеномика не описана.", "Приложить ТЗ: раздел «Экономика» с faucets/sinks, эмиссией, burn и симуляцией на 12 мес.");
      const hits = [/burn|сжиган/i, /sink|сток|расход/i, /эмисси|supply|emission/i, /vesting|вестинг|разлок/i, /инфляц|дефляц/i, /faucet|источник|приток/i].filter((r) => ctx.specHas(r)).length;
      if (hits >= 4) return pass(`Токеномика описана (${hits}/6 аспектов).`);
      if (hits >= 2) return warn(`Токеномика описана частично (${hits}/6).`, "Дописать: sinks, эмиссию по времени, вестинг команды/инвесторов, сценарии стресс-теста.");
      return fail("Токеномика в ТЗ не проработана.", "Провести economy design: таблица faucets/sinks, кривая эмиссии, симуляция.");
    },
  },

  // ───────────── F. Security & Trust ─────────────
  {
    code: "F01", category: C[5], severity: "critical",
    title: "Секреты и приватные ключи в коде",
    description: "Поиск приватных ключей, seed-фраз, секретов под NEXT_PUBLIC_ и live-ключей.",
    run(ctx) {
      const ev = ctx.grep(/(["'`]0x[a-fA-F0-9]{64}["'`])|sk_live_[0-9a-zA-Z]{10,}|NEXT_PUBLIC_[A-Z_]*(SECRET|PRIVATE|MNEMONIC)|PRIVATE_KEY\s*=\s*["']?0x[a-fA-F0-9]{20,}|mnemonic\s*[:=]\s*["'][a-z ]{40,}/, { excludePathRe: /(\.example|test|spec|fixture|mock)/i });
      if (ev.length) return fail(`Найдено ${ev.length} потенциальных утечек секретов.`, "Немедленно ротировать ключи; хранить только в env; серверный подписант через KMS.", ev, 0);
      return pass("Хардкод секретов не обнаружен.");
    },
  },
  {
    code: "F02", category: C[5], severity: "critical",
    title: "Серверная валидация входных данных",
    description: "zod/valibot/yup на API-границе; никакого доверия к клиенту в игровых действиях.",
    run(ctx) {
      const deps = ctx.hasDep("zod", "valibot", "yup", "joi", "class-validator", "@sinclair/typebox", "pydantic");
      const routes = apiRoutes(ctx);
      const ev = ctx.grep(/\.safeParse\(|\.parse\(|z\.object|v\.object|validate\(|schema\.validate/, { exts: CODE_EXTS.concat("py"), pathRe: SERVER_PATH_RE });
      if (deps.length && ev.length) return pass(`Валидация: ${deps.join(", ")}.`, ev);
      if (routes.length === 0) return manual("API-роуты не найдены — бэкенд отсутствует или вне сканируемого пути.", "Все игровые действия валидируются на сервере (zod), клиентские числа не доверяются.");
      if (deps.length) return warn("Валидатор установлен, но в роутах не применяется.", "Обернуть каждый handler в parseBody(schema).", ev);
      return fail(`${routes.length} API-роутов без схемной валидации.`, "Внедрить zod-схемы на входе каждого роута; отклонять неизвестные поля.", ev);
    },
  },
  {
    code: "F03", category: C[5], severity: "critical",
    title: "Аутентификация и авторизация API",
    description: "Сессии/JWT/SIWE-cookie на защищённых эндпоинтах, проверка владения кошельком.",
    run(ctx) {
      const deps = ctx.hasDep("next-auth", /^@auth\//, "lucia", "iron-session", "jose", "jsonwebtoken", /^@clerk\//, /^@supabase\/ssr/, /^@privy-io\/server-auth/);
      const routes = apiRoutes(ctx).filter((f) => !/health/.test(f.path));
      const ev = ctx.grep(/getServerSession|auth\(\)|verifyToken|verifyJwt|jwtVerify|getSession\(|requireAuth|Authorization|Bearer /, { pathRe: SERVER_PATH_RE, exts: CODE_EXTS.concat("py", "go") });
      if (ev.length >= 2 || (deps.length && ev.length)) return pass("Авторизация на API присутствует.", ev);
      if (routes.length === 0) return manual("Защищаемых API-роутов нет.", "При появлении бэкенда — SIWE-сессия в httpOnly cookie + middleware.");
      if (deps.length || ev.length) return warn("Авторизация настроена частично.", "Middleware на /api/game/*: проверка сессии и соответствия адреса кошелька.", ev);
      return fail(`${routes.length} роутов без авторизации.`, "SIWE → session; middleware; RBAC для админ-эндпоинтов.", ev);
    },
  },
  {
    code: "F04", category: C[5], severity: "high",
    title: "Серверная верификация подписей",
    description: "Бэкенд проверяет подпись (recoverAddress/verifyMessage/nacl) перед выдачей наград и связыванием аккаунта.",
    run(ctx) {
      const ev = ctx.grep(/verifyMessage|recoverMessageAddress|recoverTypedDataAddress|recoverAddress|verifySiweMessage|nacl\.sign\.detached\.verify|ed25519.*verify|verifyTypedData/, { serverOnly: true, exts: CODE_EXTS.concat("py", "go", "rs") });
      if (ev.length) return pass("Подписи верифицируются на сервере.", ev);
      const hasWeb3 = ctx.hasDep("wagmi", "viem", "ethers", /^@solana\//).length > 0;
      if (hasWeb3) return fail("Верификации подписей на бэкенде нет — можно выдать себя за любой кошелёк.", "Проверять SIWE-подпись сервером с nonce (одноразовый) и expiry.", ev);
      return manual("Web3-стек не найден.", "При интеграции — обязательная серверная верификация.");
    },
  },
  {
    code: "F05", category: C[5], severity: "high",
    title: "Гигиена окружения (.gitignore / .env.example)",
    description: ".env исключён из репозитория, есть .env.example для онбординга разработчиков.",
    run(ctx) {
      const gi = ctx.filesMatching(/(^|\/)\.gitignore$/);
      const ignoresEnv = gi.some((f) => /^\s*\.env/m.test(f.content));
      const example = ctx.filesMatching(/\.env\.(example|sample|template)$/).length > 0;
      const envs = ctx.filesMatching(/(^|\/)\.env(\.local|\.production)?$/);
      const ev = envs.map((f) => ({ path: f.path, line: 1, text: "env file present" }));
      if (ignoresEnv && example) return pass("Env-гигиена соблюдена.");
      if (!gi.length) return fail(".gitignore отсутствует — .env может утечь в репозиторий.", "Добавить .gitignore (.env*, !.env.example) и .env.example.", ev);
      if (!ignoresEnv) return fail(".gitignore не исключает .env.", "Добавить .env* в .gitignore и ротировать ключи, если уже закоммичено.", ev);
      return warn("Нет .env.example.", "Добавить .env.example со всеми ключами и комментариями.", ev);
    },
  },

  // ───────────── G. Performance ─────────────
  {
    code: "G01", category: C[6], severity: "medium",
    title: "Оптимизация изображений",
    description: "next/image или эквивалент вместо сырых <img>; lazy-loading для инвентарей.",
    run(ctx) {
      const raw = ctx.grep(/<img\b/, { exts: TSX });
      const opt = ctx.count(/from ["']next\/image["']|loading="lazy"|<picture/, { exts: TSX });
      if (opt && !raw.length) return pass("Изображения оптимизированы.");
      if (opt && raw.length) return warn(`${raw.length} сырых <img> при наличии next/image.`, "Заменить <img> на <Image> с sizes/priority; для IPFS настроить remotePatterns или loader.", raw);
      if (raw.length) return fail("Изображения без оптимизации.", "next/image + CDN-прокси для IPFS, blur placeholder.", raw);
      return manual("Изображений не найдено.", "Заложить Image-пайплайн с CDN для NFT-медиа.");
    },
  },
  {
    code: "G02", category: C[6], severity: "high",
    title: "Code-splitting тяжёлых модулей (3D / Web3 / модалки)",
    description: "next/dynamic / React.lazy для three.js, кошелёк-модалок, редко открываемых экранов.",
    run(ctx) {
      const heavy = ctx.hasDep("three", /^@react-three\//, "phaser", "pixi.js", /^@babylonjs\//, "playcanvas", /^@rive-app\//, "lottie-web");
      const ev = ctx.grep(/next\/dynamic|React\.lazy\(|lazy\(\(\) => import|import\(["']/, { exts: CODE_EXTS });
      if (ev.length) return pass(`Динамические импорты есть${heavy.length ? ` (тяжёлые: ${heavy.join(", ")})` : ""}.`, ev);
      if (heavy.length) return fail(`Тяжёлые зависимости (${heavy.join(", ")}) грузятся синхронно.`, "Обернуть игровой канвас и wallet-модалки в next/dynamic({ ssr:false }).", ev);
      return warn("Динамических импортов нет.", "Разделить бандл: wallet-модалка, маркет, настройки — ленивые.", ev);
    },
  },
  {
    code: "G03", category: C[6], severity: "medium",
    title: "Гигиена бандла (lodash / moment / дубли)",
    description: "Тяжёлые устаревшие библиотеки и полные импорты раздувают бандл.",
    run(ctx) {
      const bad = ctx.hasDep("moment", "lodash", "jquery", "web3");
      const full = ctx.grep(/from ["']lodash["']|require\(["']lodash["']\)|from ["']moment["']/, { exts: CODE_EXTS });
      const dup = ["ethers", "viem", "web3"].filter((d) => ctx.hasDep(d).length).length;
      if (!bad.length && dup <= 1) return pass("Бандл чистый.");
      const issues = [bad.length ? `устаревшие: ${bad.join(", ")}` : "", dup > 1 ? `дублируются web3-библиотеки (${dup})` : ""].filter(Boolean).join("; ");
      return warn(issues, "Заменить moment→dayjs, lodash→lodash-es/ES2023, оставить одну web3-либу (viem). Проверить @next/bundle-analyzer.", full);
    },
  },
  {
    code: "G04", category: C[6], severity: "high",
    title: "Кеширование и стратегия данных",
    description: "revalidate / react-query / swr / Cache-Control — RPC-чтения не должны дёргаться на каждый рендер.",
    run(ctx) {
      const deps = ctx.hasDep(/^@tanstack\/react-query/, "swr");
      const ev = ctx.grep(/revalidate\s*=|unstable_cache|cacheTag|cacheLife|Cache-Control|staleTime|useQuery\(|useSWR\(/, { exts: CODE_EXTS });
      if ((deps.length || ev.length >= 2)) return pass(`Стратегия кеширования: ${deps.length ? deps.join(", ") : "Next cache"}.`, ev);
      if (ev.length) return warn("Кеширование точечное.", "Ввести react-query с staleTime по типам данных: баланс 10с, метаданные 1ч, лидерборд 30с.", ev);
      return fail("Кеширования нет — RPC-лимиты и лаги гарантированы.", "react-query + серверный кеш индексатора; websockets/polling только для критичных данных.", ev);
    },
  },
  {
    code: "G05", category: C[6], severity: "low",
    title: "Оптимизация шрифтов",
    description: "next/font или self-hosted @font-face с font-display: swap; избегать FOIT на первом экране.",
    run(ctx) {
      const ev = ctx.grep(/next\/font|font-display:\s*swap|@font-face/, { exts: UI_EXTS });
      const remote = ctx.grep(/fonts\.googleapis\.com/, { exts: UI_EXTS });
      if (ev.length && !remote.length) return pass("Шрифты оптимизированы.", ev);
      if (remote.length) return warn("Шрифты грузятся с Google Fonts напрямую (лишний DNS/round-trip).", "Перейти на next/font/google или self-host с preload.", remote);
      return warn("Кастомные шрифты не настроены (или системные).", "Для AAA-стиля: display-шрифт через next/font/local с preload и swap.", ev);
    },
  },

  // ───────────── H. Accessibility ─────────────
  {
    code: "H01", category: C[7], severity: "medium",
    title: "Alt-тексты у изображений",
    description: "Все <img>/<Image> имеют осмысленный alt (или alt=\"\" для декоративных).",
    run(ctx) {
      const all = ctx.grep(/<(img|Image)\b/, { exts: TSX, limit: 100000 });
      const noAlt = all.filter((e) => !/alt=/.test(e.text));
      if (!all.length) return manual("Изображений не найдено.", "При добавлении — обязательный alt в Image-примитиве.");
      if (!noAlt.length) return pass(`Все ${all.length} изображений с alt.`);
      return fail(`${noAlt.length} из ${all.length} изображений без alt.`, "Сделать alt обязательным пропом в AssetImage-компоненте.", noAlt.slice(0, 8));
    },
  },
  {
    code: "H02", category: C[7], severity: "medium",
    title: "ARIA и семантика",
    description: "aria-label на иконках-кнопках, role, семантические теги <main>/<section>/<button>.",
    run(ctx) {
      const n = ctx.count(/aria-[a-z]+=|role=["']/, { exts: TSX.concat("html") });
      const divClicks = ctx.grep(/<div[^>]*onClick/, { exts: TSX });
      const ev = ctx.grep(/aria-label=/, { exts: TSX, limit: 5 });
      if (n >= 8 && divClicks.length === 0) return pass(`${n} ARIA-атрибутов, кликабельных div нет.`, ev);
      if (n >= 3) return warn(`${n} ARIA-атрибутов; кликабельных <div>: ${divClicks.length}.`, "Заменить <div onClick> на <button>; aria-label на все иконочные кнопки; aria-live для балансов.", divClicks.length ? divClicks : ev);
      if (noUi(ctx)) return manual("UI-файлы не найдены.", "Заложить a11y-линтер (eslint-plugin-jsx-a11y).");
      return fail("ARIA-разметка практически отсутствует.", "Подключить eslint-plugin-jsx-a11y, пройти axe-аудит.", divClicks);
    },
  },
  {
    code: "H03", category: C[7], severity: "medium",
    title: "Клавиатурный фокус (focus-visible)",
    description: "Видимые focus-стили и навигация Tab по всем интерактивам, в т.ч. в модалках.",
    run(ctx) {
      const n = ctx.count(/focus-visible|focus:|:focus|outline-offset|focus-ring/, { exts: UI_EXTS });
      const ev = ctx.grep(/focus-visible|focus:/, { exts: UI_EXTS, limit: 5 });
      if (n >= 8) return pass(`${n} focus-стилей.`, ev);
      if (n >= 1) return warn(`Только ${n} focus-стилей.`, "Глобальный :focus-visible ring в токенах; focus-trap в модалках (Radix Dialog).", ev);
      return fail("Фокус не стилизован — клавиатурные игроки не видят, где они.", "Добавить focus-visible кольцо и проверить tab-порядок.", ev);
    },
  },
  {
    code: "H04", category: C[7], severity: "low",
    title: "prefers-reduced-motion",
    description: "Тяжёлые анимации и партиклы отключаются для пользователей с чувствительностью к движению.",
    run(ctx) {
      const ev = ctx.grep(/prefers-reduced-motion|motion-reduce:|motion-safe:|useReducedMotion/, { exts: UI_EXTS });
      if (ev.length) return pass("Reduced-motion поддерживается.", ev);
      if (ctx.hasDep("framer-motion", "motion", "gsap").length) return fail("Анимационная библиотека есть, reduced-motion нет.", "MotionConfig reducedMotion=\"user\" (framer) + CSS media query для keyframes.", ev);
      return warn("Reduced-motion не учитывается.", "Добавить media-query и глобальный флаг в motion-токены.", ev);
    },
  },
  {
    code: "H05", category: C[7], severity: "medium",
    title: "Дизайн-токены и контраст",
    description: "Цветовая система через переменные/@theme, тёмная тема, проверяемый контраст (WCAG AA 4.5:1).",
    run(ctx) {
      const tokens = ctx.count(/--[a-z][a-z0-9-]*:\s*(#|oklch|hsl|rgb)/, { exts: STYLE_EXTS });
      const theme = ctx.count(/@theme|dark:|data-theme|ThemeProvider/, { exts: UI_EXTS });
      const hard = ctx.count(/#[0-9a-fA-F]{6}\b/, { exts: TSX });
      const ev = ctx.grep(/--[a-z][a-z0-9-]*:\s*(#|oklch|hsl)/, { exts: STYLE_EXTS, limit: 5 });
      if (tokens >= 8 && hard < 15) return pass(`${tokens} цветовых токенов, тема: ${theme > 0 ? "да" : "нет"}.`, ev);
      if (tokens > 0) return warn(`${tokens} токенов, но ${hard} хардкод-цветов в компонентах.`, "Перенести все цвета в токены; прогнать контраст (Stark/axe); тёмная тема как default для игр.", ev);
      return fail("Дизайн-токенов нет — контраст и консистентность не контролируются.", "Определить палитру (bg/surface/primary/accent/danger) в @theme, проверить AA-контраст.", ev);
    },
  },

  // ───────────── I. Backend & Data ─────────────
  {
    code: "I01", category: C[8], severity: "high",
    title: "Схема БД: таблицы и индексы",
    description: "Модель данных для игроков, инвентаря, транзакций; индексы на wallet/txHash/createdAt.",
    run(ctx) {
      const schemas = ctx.filesMatching(/(schema\.(ts|js|prisma|sql)$|\/migrations\/|models\.py$|entities?\/)/);
      const tables = ctx.count(/pgTable\(|mysqlTable\(|sqliteTable\(|^model \w+|CREATE TABLE|class \w+\(.*Model\)/im, { pathRe: /(schema|migration|models|entit)/i });
      const idx = ctx.count(/index\(|uniqueIndex\(|@@index|@@unique|CREATE (UNIQUE )?INDEX|db_index=True/i, { pathRe: /(schema|migration|models|entit)/i });
      const ev = schemas.slice(0, 5).map((f) => ({ path: f.path, line: 1, text: "schema file" }));
      if (tables >= 3 && idx >= 2) return pass(`${tables} таблиц, ${idx} индексов.`, ev);
      if (tables >= 1) return warn(`${tables} таблиц, ${idx} индексов.`, "Добавить таблицы players/inventory/tx_log/quests и индексы на wallet_address, tx_hash (unique), created_at.", ev);
      return fail("Схема БД пуста — нет модели игрока, инвентаря, журнала транзакций.", "Спроектировать схему: players, sessions, inventory, rewards, tx_log(tx_hash unique), leaderboard.", ev);
    },
  },
  {
    code: "I02", category: C[8], severity: "medium",
    title: "Миграции и управление схемой",
    description: "drizzle-kit / prisma migrate / alembic с зафиксированными миграциями, а не push в прод.",
    run(ctx) {
      const cfg = ctx.filesMatching(/(drizzle\.config\.(ts|js|json)|prisma\/schema\.prisma|alembic\.ini|knexfile)/);
      const mig = ctx.filesMatching(/(\/drizzle\/|\/migrations\/|\/prisma\/migrations\/).*\.(sql|ts|js|py)$/);
      if (cfg.length && mig.length) return pass(`${mig.length} миграций.`, mig.slice(0, 5).map((f) => ({ path: f.path, line: 1, text: "migration" })));
      if (cfg.length) return warn("Конфиг есть, миграций нет (schema push).", "Перейти на drizzle-kit generate + migrate в CI; хранить миграции в репо.", cfg.map((f) => ({ path: f.path, line: 1, text: "config" })));
      return fail("Инструмент миграций не настроен.", "Добавить drizzle-kit/prisma и пайплайн миграций.");
    },
  },
  {
    code: "I03", category: C[8], severity: "high",
    title: "Обработка ошибок в API-хендлерах",
    description: "try/catch, корректные HTTP-статусы, единый формат ошибки, без утечки stack trace.",
    run(ctx) {
      const routes = apiRoutes(ctx);
      if (!routes.length) return manual("API-роутов не найдено.", "Единый apiHandler-wrapper с логированием и форматом { error: { code, message } }.");
      const good = routes.filter((f) => /try\s*\{/.test(f.content) && /status:\s*(4|5)\d\d|\.status\((4|5)\d\d\)/.test(f.content));
      const bad = routes.filter((f) => !good.includes(f));
      const ev = bad.slice(0, 8).map((f) => ({ path: f.path, line: 1, text: "handler без try/catch или статусов" }));
      if (!bad.length) return pass(`Все ${routes.length} хендлеров с обработкой ошибок.`);
      if (good.length >= bad.length) return warn(`${bad.length} из ${routes.length} хендлеров без полноценной обработки.`, "Общий wrapper withErrorHandling(handler); маппинг ошибок БД/RPC на 4xx/5xx.", ev);
      return fail(`${bad.length} из ${routes.length} хендлеров без обработки ошибок.`, "Внедрить wrapper и стандарт ошибок; логирование в Sentry.", ev);
    },
  },
  {
    code: "I04", category: C[8], severity: "medium",
    title: "Health-check и observability",
    description: "/api/health с проверкой БД/RPC, логирование, Sentry/OpenTelemetry.",
    run(ctx) {
      const health = ctx.filesMatching(/health.*route\.(ts|js)$|\/health\.(ts|js|py)$/);
      const obs = ctx.hasDep(/^@sentry\//, /^@opentelemetry\//, "pino", "winston", /^@axiomhq\//, /^@logtail\//);
      const rpcCheck = health.some((f) => /rpc|getBlockNumber|chain|provider/i.test(f.content));
      const ev = health.map((f) => ({ path: f.path, line: 1, text: "health endpoint" }));
      if (health.length && obs.length && rpcCheck) return pass(`Health + RPC-check + ${obs.join(", ")}.`, ev);
      if (health.length) return warn(`Health есть; RPC-проверка: ${rpcCheck ? "да" : "нет"}; observability: ${obs.length ? obs.join(", ") : "нет"}.`, "Добавить в health проверку RPC-провайдера и индексатора; подключить Sentry с tx-контекстом.", ev);
      return fail("Health-check отсутствует.", "Добавить /api/health (db, rpc, indexer) и мониторинг.", ev);
    },
  },
  {
    code: "I05", category: C[8], severity: "critical",
    title: "Идемпотентность наград и минтов",
    description: "Повторный запрос/ретрай не должен выдать награду дважды: unique tx_hash, nonce, idempotency-key, ON CONFLICT.",
    run(ctx) {
      const ev = ctx.grep(/idempoten|Idempotency-Key|onConflictDoNothing|ON CONFLICT|txHash.*unique|unique.*tx_?hash|nonce.*used|claimedAt|FOR UPDATE|SELECT .* FOR UPDATE|\.transaction\(/i, { serverOnly: true, exts: CODE_EXTS.concat("sql", "py", "go", "rs", "sol") });
      const hasRewards = ctx.count(/reward|claim|mint|airdrop/i, { pathRe: SERVER_PATH_RE }) > 0;
      if (ev.length >= 2) return pass("Идемпотентность обеспечена.", ev);
      if (!hasRewards && !apiRoutes(ctx).length) return manual("Эндпоинтов наград нет.", "Проектировать выдачу наград как идемпотентную операцию с unique-ключом.");
      if (ev.length) return warn("Защита от двойной выдачи частичная.", "Unique(wallet, reward_id) + транзакция БД + idempotency-key от клиента.", ev);
      return fail("Награды/минты не идемпотентны — двойные клики и ретраи дублируют выдачу.", "Unique-ограничения, транзакции, очередь (BullMQ) с dedupe.", ev);
    },
  },

  // ───────────── J. Live-ops & Spec Quality ─────────────
  {
    code: "J01", category: C[9], severity: "high",
    title: "Аналитика и продуктовые события",
    description: "PostHog/Mixpanel/Amplitude: воронка connect→first action→first tx→retention; без данных нет баланса игры.",
    run(ctx) {
      const deps = ctx.hasDep("posthog-js", "posthog-node", /^@vercel\/analytics/, "mixpanel-browser", /^@amplitude\//, "react-ga4", /^@segment\//);
      const ev = ctx.grep(/posthog\.capture|track\(["']|gtag\(|analytics\.track|logEvent\(|plausible\(/, { exts: CODE_EXTS });
      if (deps.length && ev.length) return pass(`Аналитика: ${deps.join(", ")}, ${ev.length}+ событий.`, ev);
      if (deps.length || ev.length) return warn("Аналитика подключена, событий мало/нет.", "Event-план: wallet_connected, tx_initiated/confirmed/failed, quest_completed, purchase; свойства chain, wallet_type.", ev);
      return fail("Аналитики нет — решения по UX будут слепыми.", "PostHog (self-host) + event taxonomy + воронки и retention-когорты.", ev);
    },
  },
  {
    code: "J02", category: C[9], severity: "medium",
    title: "Feature flags и удалённая конфигурация",
    description: "Возможность выключить минт/маркет/ивент без деплоя; kill-switch на случай инцидента с контрактом.",
    run(ctx) {
      const deps = ctx.hasDep("launchdarkly-js-client-sdk", /^@growthbook\//, "unleash-client", /^@vercel\/flags/, "flags", /^@openfeature\//, "posthog-js");
      const ev = ctx.grep(/featureFlag|feature_flag|isFeatureEnabled|useFlag\(|killSwitch|maintenanceMode|NEXT_PUBLIC_FEATURE_/i, { exts: CODE_EXTS });
      if (deps.length && ev.length) return pass("Feature flags используются.", ev);
      if (deps.length || ev.length) return warn("Флаги есть, но без системного подхода.", "Ввести флаги: mint_enabled, market_enabled, maintenance; серверная проверка, не только UI.", ev);
      return fail("Нет kill-switch — при баге контракта придётся катить хотфикс под нагрузкой.", "Remote config (PostHog flags/GrowthBook) + баннер maintenance.", ev);
    },
  },
  {
    code: "J03", category: C[9], severity: "medium",
    title: "Локализация (i18n)",
    description: "Web3-аудитория глобальна: EN + RU/ES/PT/TR/ZH; строки не хардкодятся.",
    run(ctx) {
      const deps = ctx.hasDep("next-intl", "i18next", "react-i18next", "next-i18next", /^@lingui\//, /^@formatjs\//);
      const locales = ctx.filesMatching(/\/(locales|messages|i18n)\/.*\.(json|ts)$/);
      if (deps.length && locales.length >= 2) return pass(`i18n: ${deps.join(", ")}, ${locales.length} файлов локалей.`, locales.slice(0, 5).map((f) => ({ path: f.path, line: 1, text: "locale" })));
      if (deps.length || locales.length) return warn("i18n настроен частично.", "Минимум EN+RU; вынести все строки; форматирование чисел/дат через Intl.");
      return fail("Локализации нет.", "next-intl с маршрутами /[locale]; строки в messages/*.json; отдельные строки для ошибок транзакций.");
    },
  },
  {
    code: "J04", category: C[9], severity: "critical",
    title: "Полнота ТЗ (Spec Completeness)",
    description: "ТЗ содержит: цели, аудиторию, экраны/флоу, Web3-контур, экономику, метрики, edge-cases.",
    run(ctx) {
      if (noSpec(ctx)) return fail("ТЗ не найдено ни в файлах проекта, ни во вставленном тексте.", "Приложить ТЗ (README/SPEC.md или вставить текст) — без него 12 из 50 анализов работают вслепую.", [], 0);
      const sections: [string, RegExp][] = [
        ["Цели", /цел[ьи]|goal|vision|objective/i],
        ["Аудитория", /аудитор|persona|audience|целев\w+ игрок/i],
        ["Экраны/флоу", /экран|screen|wireframe|user ?flow|флоу|сценари/i],
        ["Web3-контур", /кошел|wallet|chain|сеть|смарт|contract|токен|nft/i],
        ["Экономика", /эконом|tokenomic|токеномик|награ|reward/i],
        ["Метрики", /метрик|kpi|retention|dau|конверси|воронк/i],
        ["Edge-cases", /edge|ошибк|error|отказ|offline|исключ|fallback/i],
        ["Безопасность", /безопас|security|аудит|audit|мошенн|fraud/i],
      ];
      const found = sections.filter(([, r]) => ctx.specHas(r)).map(([n]) => n);
      const missing = sections.filter(([n]) => !found.includes(n)).map(([n]) => n);
      const ratio = found.length / sections.length;
      const detail = `Покрыто ${found.length}/${sections.length}: ${found.join(", ")}${missing.length ? `. Нет: ${missing.join(", ")}` : ""}. Источник: ${ctx.specSource}.`;
      if (ratio >= 0.85) return pass(detail);
      if (ratio >= 0.5) return warn(detail, `Дописать разделы: ${missing.join(", ")}.`, [], Math.round(ratio * 100));
      return fail(detail, `ТЗ поверхностное. Обязательные разделы: ${missing.join(", ")}.`, [], Math.round(ratio * 100));
    },
  },
  {
    code: "J05", category: C[9], severity: "high",
    title: "Тесты (unit / e2e / контракты)",
    description: "vitest/jest, Playwright e2e для connect→tx флоу, тесты контрактов (foundry/hardhat).",
    run(ctx) {
      const deps = ctx.hasDep("vitest", "jest", /^@playwright\/test/, "cypress", /^@testing-library\//, "hardhat", /^@nomicfoundation\//);
      const tests = ctx.filesMatching(/(\.(test|spec)\.(ts|tsx|js|jsx)$|\/(__tests__|e2e|test)\/.*\.(ts|js|sol|t\.sol)$)/);
      const ev = tests.slice(0, 6).map((f) => ({ path: f.path, line: 1, text: "test file" }));
      if (deps.length && tests.length >= 5) return pass(`${tests.length} тестовых файлов (${deps.join(", ")}).`, ev);
      if (deps.length || tests.length) return warn(`Тестов: ${tests.length}.`, "Покрыть критичное: errorMapper, formatToken, reward-идемпотентность, e2e connect→tx с моком кошелька (synpress).", ev);
      return fail("Тестов нет.", "vitest для утилит, Playwright+synpress для Web3-флоу, foundry для контрактов; CI-гейт.", ev);
    },
  },
];

if (ANALYSES.length !== 50) {
  throw new Error(`Каталог должен содержать ровно 50 анализов, сейчас ${ANALYSES.length}`);
}
