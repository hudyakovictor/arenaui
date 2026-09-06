# Backend Agent — Fastify разработчик

## Обязанности

- API на Fastify (роуты, валидация, аутентификация)
- Работа с SQLite через Drizzle ORM
- Валидация схем через Zod
- WebSocket — relay между клиентом и сервером
- CRM-интерфейс для управления контентом

## Технологии

| Технология | Статус | Примечание |
|---|---|---|
| Fastify | ✅ Обязательно | `fastify@^5` |
| SQLite (sql.js) | ✅ Обязательно | Детерминированная БД |
| Drizzle ORM | ✅ Обязательно | `drizzle-orm` + `drizzle-kit` |
| Zod | ✅ Обязательно | Валидация запросов/ответов |
| WebSocket | ✅ Обязательно | `@fastify/websocket` |
| @fastify/cors | ✅ Обязательно | CORS для клиента |

## Что НЕ использовать

- Express — только Fastify
- PostgreSQL / MySQL — только SQLite (sql.js)
- JWT без необходимости — упрощать

## Структура

```
backend/
├── server.ts           # Точка входа Fastify
├── src/
│   ├── routes/         # API-роуты (/api/v1/*)
│   ├── db/             # Drizzle schema + connection
│   ├── schemas/        # Zod-схемы
│   └── ws/             # WebSocket-обработчики
├── drizzle/            # Миграции
└── drizzle.config.json
```

## Команды

```bash
cd backend && npm run start    # dev-сервер :8080
npm run dev                    # альтернативный запуск
```
