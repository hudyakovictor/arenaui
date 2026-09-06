# dev-setup — Настройка среды разработки

## Требования

- Node.js 18+ (LTS)
- npm 9+

## Шаги

1. Установить Node.js 18+
2. Перейти в каталог проекта
3. Установить зависимости:
   ```bash
   cd phaser && npm i
   cd ../backend && npm i
   ```
4. Проверить версии ключевых пакетов:
   ```bash
   cd phaser && npm ls phaser  # должна быть ^4.x
   cd ../backend && npm ls fastify drizzle-orm zod sql.js
   ```
5. Запустить unit-тесты чтобы убедиться что всё работает:
   ```bash
   cd phaser && npx vitest run
   ```

## Что НЕ делать

- Не использовать React, Vue, Angular на фронтенде — только Phaser 4
- Не использовать Express на бэкенде — только Fastify
- Не устанавливать rexUI без проверки совместимости с Phaser 4
