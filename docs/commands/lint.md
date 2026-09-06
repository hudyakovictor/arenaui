# lint — Проверка кода

## Фронтенд (Phaser)

```bash
cd phaser
npx tsc --noEmit
npx eslint .
```

Если ESLint не настроен — используйте только `tsc --noEmit`.

## Бэкенд (Fastify)

```bash
cd backend
npx tsc --noEmit
npx eslint .
```

## Правила

- `camelCase` для переменных и функций
- `PascalCase` для классов и компонентов
- Один класс сцены на файле в `phaser/src/scenes/`
- Импорты — относительные, без `src/`-алиасов
- Не используй `any` — всегда типизируй
