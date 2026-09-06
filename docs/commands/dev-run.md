# dev-run — Запуск dev-серверов

## Фронтенд (Phaser 4)

```bash
cd phaser
npm run dev
```
→ http://localhost:3000

Сервер Vite с `allowedHosts: true` для работы через превью-прокси.

## Бэкенд (Fastify)

```bash
cd backend
npm run start
```
→ http://localhost:8080

Fastify + SQLite (sql.js) + WebSocket.

## Одновременный запуск

```bash
# Терминал 1
cd phaser && npm run dev

# Терминал 2
cd backend && npm run start
```

## Проверка

- Фронтенд: открыть http://localhost:3000 — должна появиться игровая сцена
- Бэкенд: открыть http://localhost:8080/health — должен вернуться статус 200
