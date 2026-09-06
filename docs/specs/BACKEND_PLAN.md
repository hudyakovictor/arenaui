# Бэкенд: план реализации (CRM + API)

> Статус: 💡 План к реализации. Не начато.
> Бэкенд реализуется **только после QA gate L0–20** (секция 6 DEVGUIDE.md).
> Фронтенд на старте работает **локально без бэкенда** — seed + scenario-Gen
> в клиенте. Сервер добавляется как слой данных, аналитики и CRM.

---

## 1. Архитектурные принципы

| Принцип | Как реализовано |
|---|---|
| **Транспортно-независимая логика** | `aibackend/` — чистый TS без Fastify/WS. `dispatch()` принимает `Request`, возвращает `Response`. Можно тестировать без сервера. |
| **SQLite + sql.js или SQLite** | Drizzle ORM. Локально — sql.js в браузере, на сервере — настоящий SQLite. |
| **Zod на всех границах** | Валидация входящего запроса + исходящего ответа. |
| **Deterministic engine на сервере** | seedrandom + scenario-gen. Сервер генерирует seed, клиент валидирует. |
| **Offline-first** | Клиент кэширует контент, работает в офлайне, синхронизирует attempts batch. |
| **AI-first operations** | Вся рутина: autotest, analytics, контент-драфты, balance tuning — автоматизирована через AI pipeline. |

---

## 2. Меню и навигация

### 2.1 Универсальный топ-бар (всегда виден)

```
┌─ Arena ─────────────────────────── ─────────────┐
  [линия прогресса] [XP: 1200/1500] [💰 340] [⚡ 18/20]  ⚙️
└──────────────────────────────────────────────────┘
```

| Элемент | Что показывает | Зачем |
|---|---|---|
| Линия прогресса | текущий уровень / следующая веха | визуальный KPI |
| XP | накопленный / до следующего уровня | мотивация |
| 💰 | монеты (SIG) | экономика |
| ⚡ | запас риска / энергия | ограничение сессии |
| ⚙️ | иконка настроек (всегда в правом углу) | быстрый доступ к настройкам |

**Аватарка игрока — НЕ в топ-баре.** Она избыточна для универсального виджета.
Аватарка — в профиле / коллекции.

### 2.2 Нижняя навигация (основное меню)

```
[Арена] [Академия] [Коллекция] [Магазин] [Ещё ⋯]
```

| Позиция | Иконка | Что внутри |
|---|---|---|
| **Арена** | nav-arena.svg | Бои, турниры, погода, ежедневные задачи |
| **Академия** | nav-academy.svg | Обучение по картам, микрокексы, рефакторинг ошибок |
| **Коллекция** | nav-collection.svg | Раскрытые карты, враги, комбо, трофеи |
| **Магазин** | nav-shop (в планах) | Косметика, темы, boosters |
| **Ещё ⋯** | nav-more.svg | Раскрывает: Профиль, Настройки, Статистика, Поддержка, Правила, Выйти |

**Принцип:** основное меню — 5 пунктов. "Ещё" — overflow для остального.
Никогда не больше 6 пунктов в основном меню.

---

## 3. Модули CRM (admin панель)

CRM — это одна страница в браузере, где сисадмин (или пользователь-одиночка)
управляет всей игрой. Разделы:

| № | Модуль | Описание | Ключевые экраны |
|---|---|---|---|
| 1 | **Контент** | Управление игровыми данными: карты, враги, источники, шаблоны | Таблицы с редактором + preview |
| 2 | **Конфиги** | Балансы, погода, правила роста, scoring | JSON-редактор + A/B сегменты |
| 3 | **Игроки** | Пользователи, устройства, прогресс, премиум | Поиск по ID/email, прогресс-линия |
| 4 | **Сессии** | Запуск/остановка, аналитика попыток | Replay viewer, scatter plot |
| 5 | **Ошибки** | Журнал всех ошибок игроков | Фильтр по навыку/врагу/игроку |
| 6 | **Турниры** | Создание, управление, лидерборды | Calendar + real-time leaderboard |
| 7 | **AI-конвейер** | Генерация контента, автотесты, аналитика | Draft queue, review panel, metrics |
| 8 | **Магазин** | SKU, цены, монетизация | Catalog editor, purchase logs |
| 9 | **Аналитика** | События, воронка, retention, LTV | Dashboard с графиками |
| 10 | **Система** | Health, deploy, logs, feature flags | Server status, config reload |

---

## 4. API контракт (REST /api/v1/)

### 4.1 Auth
| Метод | Путь | Auth | Тело | Ответ |
|---|---|---|---|---|
| POST | `/auth/anonymous` | none | `{ deviceId, userAgent }` | `{ token, userId, deviceId }` |
| POST | `/auth/link-email` | user | `{ email }` | `{ ok, emailSent }` |
| POST | `/auth/login-email` | none | `{ email, code }` | `{ token, userId }` |
| POST | `/auth/login-wallet` | none | `{ address, signature }` | `{ token, userId }` |

### 4.2 Content
| Метод | Путь | Auth | Тело | Ответ |
|---|---|---|---|---|
| GET | `/content` | none | — | `{ version, cards, enemies, sources, templates, combos }` |
| GET | `/content/version` | none | — | `{ version }` |

### 4.3 Config
| Метод | Путь | Auth | Тело | Ответ |
|---|---|---|---|---|
| GET | `/config` | none | `?segment=` | `{ version, json }` |

### 4.4 Seeds & Scheduler
| Метод | Путь | Auth | Тело | Ответ |
|---|---|---|---|---|
| GET | `/seeds/daily` | user | — | `{ seeds: number[], weather }` |
| GET | `/schedule` | user | — | `{ weather, items: TaskItem[] }` |
| GET | `/warmup` | user | — | `{ tasks: WarmupTask[] }` |
| GET | `/tasks/next` | user | — | `{ template, seed, weather, mode }` |
| GET | `/tasks/{templateId}` | user | `?seed=` | `{ template, seed, weather, mode }` |

### 4.5 Attempts
| Метод | Путь | Auth | Тело | Ответ |
|---|---|---|---|---|
| POST | `/attempts` | user | `AttemptSchema` | `{ result, xp, coins, budgetDelta }` |
| POST | `/attempts/batch` | user | `{ attempts: AttemptSchema[] }` | `{ results, progress }` |

### 4.6 Progress & Academy
| Метод | Путь | Auth | Тело | Ответ |
|---|---|---|---|---|
| GET | `/progress` | user | — | `{ level, xp, xpMax, coins, stage, streak, cards, combos }` |
| GET | `/academy/chapters` | user | — | `{ chapters: ChapterView[] }` |
| GET | `/academy/chapters/{cardId}` | user | — | `{ cardId, skills, lessons, progress }` |
| POST | `/academy/microcheck` | user | `{ cardId, skillId, seed, answer }` | `{ correct, xp, newSkills }` |

### 4.7 Sessions
| Метод | Путь | Auth | Тело | Ответ |
|---|---|---|---|---|
| POST | `/sessions` | user | `{ weatherMode }` | `{ sessionId, startedAt }` |
| POST | `/sessions/{id}/end` | user | `{ endedBy }` | `{ sessionId, duration, attempts }` |

### 4.8 Shadow / Social
| Метод | Путь | Auth | Тело | Ответ |
|---|---|---|---|---|
| GET | `/shadow/{templateId}` | user | — | `{ distribution: { variant: count }[] }` |
| GET | `/tournaments` | none | — | `{ tournaments: TournamentInfo[] }` |
| POST | `/tournaments/{id}/join` | user | — | `{ joined, status }` |
| GET | `/tournaments/{id}/leaderboard` | user | — | `{ entries: LeaderboardEntry[] }` |

### 4.9 Analytics & Billing
| Метод | Путь | Auth | Тело | Ответ |
|---|---|---|---|---|
| POST | `/analytics/events` | user | `{ events: Event[] }` | `{ ingested: number }` |
| POST | `/billing/purchase` | user | `{ sku, kind, priceSig }` | `{ ok, receipt }` |

### 4.10 Admin (все `admin` — только для админа)
| Метод | Путь | Тело | Ответ |
|---|---|---|---|
| GET | `/admin/status` | — | `{ contentVersion, configVersion, stats }` |
| GET | `/admin/autotest` | — | `{ results: AutotestResult[] }` |
| GET | `/admin/preview/{templateId}` | `?level=&seeds=` | `{ template, mutations }` |
| POST | `/admin/config` | `{ version, segment, json }` | `{ published: string }` |
| GET | `/admin/analytics` | — | `{ dashboard: Metrics }` |
| POST | `/admin/tournaments` | `{ name, startsAt, durationHours, size }` | `{ id }` |
| GET | `/admin/ai/status` | — | `{ queue: number, running: number }` |
| POST | `/admin/ai/drafts` | `{ prompt, domain, level }` | `{ draftId }` |
| GET | `/admin/ai/drafts` | `?status=` | `{ drafts: Draft[] }` |
| GET | `/admin/ai/drafts/{id}` | — | `{ draft }` |
| POST | `/admin/ai/drafts/{id}/review` | `{ action, note }` | `{ updated }` |

**Итого:** ~30 роутов, все с Zod-валидацией.

### 4.11 WebSocket (`/ws`)
| Событие | Направление | Описание |
|---|---|---|
| `hello` | server → client | Приветствие + serverTs |
| `ping` | server → client | Keepalive каждые 30s |
| `weather:update` | server → client | Изменение погоды рынка |
| `tournament:update` | server → client | Обновление лидерборда в реальном времени |
| `content:refresh` | server → client | "Новая версия контента доступна" |

---

## 5. Модель данных (SQLite + Drizzle)

### 5.1 Игрок
```
users(id PK, authKind, email, segment, premium)
  └─ devices(id PK, userId FK, userAgent)
  └─ progress(userId PK, level, xp, coins, riskBudget, streak, ...)
  └─ cardProgress(userId, cardId, rank, skillsDone[])
  └─ comboProgress(userId, comboId, count, unlockedAt)
  └─ enemyProgress(userId, enemyId, stageReached, errorProfile)
  └─ mistakeScroll(id PK, userId, skillId, enemyId, ..., ref template)
```

### 5.2 Игровые сессии
```
sessions(id PK, userId, weatherMode, riskBudgetStart/End, ...)
  └─ attempts(id PK, userId, sessionId FK, templateId, seed, result, ...)
  └─ dailySeeds(userId, day, seed, weather)
  └─ scheduleQueue(userId, ref, templateId, seed, dueAt)
  └─ answerDistribution(templateId, variant, count)  -- для "тени толпы"
```

### 5.3 Турниры
```
tournaments(id PK, name, startsAt/endsAt, seedSet)
  └─ shadowRuns(id PK, userId, tournamentId, answers, score)
```

### 5.4 Сервис
```
configs(version, segment, json, active)
  └─ contentPackages(version PK, json, autotest, active)
  └─ templateDrafts(id PK, status, provider, template, report)
  └─ purchases(id PK, userId, sku, kind, priceSig)
  └─ eventLog(id PK, userId, sessionId, name, payload)
  └─ calibration(id PK, userId, bucket, predicted, actual)
```

---

## 6. AI-конвейер

| Задача | Что делает | Инструменты |
|---|---|---|
| **Контент-генерация** | AI генерирует черновики шаблонов встреч | OpenAI API / синтетика |
| **Автотест** | Проверка полноты: каждый навык покрыт, нет дублей, S3 добавляет домен | `autotest.ts` — бот-тест |
| **Баланс-тюнинг** | Анализ attempts → регрессия на difficulty/success rate | regression + scoring |
| **Аналитика** | funnels, retention, LTV, cohort analysis | SQL aggregation |
| **Контент-ревью** | AI оценивает draft templates перед публикацией | LLM-as-judge |

**Принцип:** любая рутина, которую можно автоматизировать — автоматизируется.
Человек (сисадмин) только утверждает/отклоняет.

---

## 7. Фазы реализации бэкенда

| Фаза | Что | Тестовый шлюз | Когда |
|---|---|---|---|
| **7.1** | Fastify сервер + health + /api/v1 catch-all | `health` отвечает 200 | После QA gate L0–20 |
| **7.2** | Content API (`/content`, `/content/version`) | Content версии == клиентская | 7.1 |
| **7.3** | Auth + /me (`anonymous login`, `link-email`) | /me возвращает userId без ошибок | 7.2 |
| **7.4** | Seeds + Scheduler (`/seeds/daily`, `/schedule`, `/tasks/next`) | Seed воспроизводим на клиенте | 7.3 |
| **7.5** | Attempts (`/attempts`, batch) | Server-side валидация == клиентская | 7.4 |
| **7.6** | Progress (`/progress`, `/academy/`) | Progress сохраняется и восстанавливается | 7.5 |
| **7.7** | Sessions + Shadow (`/sessions`, `/shadow`) | Replay воспроизводит attempts | 7.6 |
| **7.8** | Tournaments (`/tournaments`) | Leaderboard обновляется в реальном времени | 7.7 |
| **7.9** | Analytics (`/analytics/events`) | События попадают в event_log | 7.8 |
| **7.10** | Billing (`/billing/purchase`) | Покупка за N монет списывает/начисляет | 7.9 |
| **7.11** | WebSocket (`/ws`) | Broadcast weather/tournament работает | 7.10 |
| **7.12** | Admin CRM панель (все `/admin/*` роуты) | CRUD через UI работает | 7.11 |
| **7.13** | AI-конвейер (`/admin/ai/*`) | Draft ревьюируется и публикуется | 7.12 |
| **7.14** | Autotest CI/CD | Автотест проходит для каждого контент-пакета | 7.13 |

**Шлюз на каждую фазу:** минимум 1 unit-тест + 1 integration-тест
(через `dispatch()` + in-memory SQLite). Без теста — не переходят.

---

## 8. Что НЕ входит в бэкенд

1. **Игровая логика движка** (scoring, generator, mutator, validator) —
   существует в `aibackend/engine/`, но считается **справочной**.
   Настоящий engine — в клиенте. Сервер валидирует, а не генерирует.
2. **UI бэкенда** — CRM пишется на React/Vite в отдельном каталоге,
   а не внутри Fastify. Сервер только API.
3. **База контента в БД** — контент в рантайме читается из пакета
   (`contentPackages.json`), а не из отдельной таблицы. БД хранит
   только прогресс игроков и аналитику.
4. **Логика монетизации** — backend принимает `priceSig` от клиента,
   а не вычисляет цену. Клиент подписывает (sig), бэкенд валидирует подпись.