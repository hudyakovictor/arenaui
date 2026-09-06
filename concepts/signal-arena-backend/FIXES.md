# Signal Arena — пакет исправлений (сервер `backend/`)

Проверки после правок: `tsc --noEmit` — 0 ошибок; сервер поднят и прогнан smoke-тестом по всем роутам `/api/v1` (auth/anonymous, me, content+ETag, config, seeds/daily, schedule, warmup, tasks/next, attempts и attempts/batch с идемпотентностью по clientAttemptId, progress, academy chapters/lesson/microcheck, sessions start/end+resume, shadow, tournaments, analytics/events, billing/purchase, admin status/autotest/preview). Автотест контента: 7/7 шаблонов зелёные (все боты), реестр комбо зелёный.

## Исправлено
1. `engine/autotest.ts`: боты играют **200 мутаций** вместо 50 — на 50 прогонах «случайный» бот флуктуировал ±0.07 и ложно ронял шаблон (T-E13-S1: 0.38 при пороге 0.35). Пороги не менялись — усилена только статистика.
2. `aibackend/README.md`: убран дрейф «PostgreSQL» — фактическое хранилище SQLite (sql.js, `data/arena.db`) по ТЗ Ч.6; миграция на PostgreSQL заложена через идентичные Drizzle-схемы.
3. `content/templates.ts`, `content/enemies.ts`: синхронизированы с исправленным клиентом (answerPool, математика T-E04-S1, атомы/skills T-E18-S1 и T-E08-S2/T-VERDICT, реестр комбо K03/K07/T07, comboRequired на S4-стадиях).

## Замечания по упаковке (не код)
- В исходном архиве лежал `node_modules` с darwin-бинарниками (`@rollup`, `esbuild`) — на Linux это не стартует. Зависимости нужно ставить свежим `npm i` (lockfile в порядке, платформенные пакеты подтянутся автоматически).
- `data/arena.db` — рантайм-файл, в пакет не входит; создаётся и мигрируется при старте.

## Что осталось за рамками (этап контента)
- `atom_coverage` в автотесте: 34 атома без шаблонов — контент-пакет ~60 шаблонов через AI-конвейер (`/admin/ai/drafts`, provider `synthetic` работает без ключа; `openai` — через OPENAI_API_KEY).
