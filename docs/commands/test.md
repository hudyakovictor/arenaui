# test — Запуск тестов

## Unit-тесты (Vitest)

```bash
cd phaser
npx vitest run
```

Конфиг: `phaser/vitest.config.ts`. Тесты лежат в `phaser/src/` рядом с кодом
или в `phaser/src/__tests__/`.

## E2E-тесты (Playwright)

```bash
npx playwright test
```

> Playwright пока не настроен. Добавить после MVP.

## Бэкенд

```bash
cd backend && npm run start
```

Тесты для бэкенда пишутся по мере необходимости.
