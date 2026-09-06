# build — Сборка production

## Фронтенд

```bash
cd phaser
npx vite build
```

→ `phaser/dist/`

Сборка использует Vite с target `es2020`.

## Бэкенд

```bash
cd backend
npm run build 2>/dev/null || npx tsc
```

## PWA

vite-plugin-pwa включается в `vite.config.ts` для production build.
Для MVP PWA не обязательно.
