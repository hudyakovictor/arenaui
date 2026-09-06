# Signal Arena — Phaser клиент

## Статус

Клиент сброшен до **фундамента**. Всё игровое содержимое сохранено как идеи
в `docs/specs/CONCEPT_IDEAS.md`. Текущий код — только инфраструктура для старта.

## Что есть сейчас

```
phaser/
├── src/
│   ├── main.ts              # Точка входа
│   ├── gameConfig.ts        # Конфигурация игры (Phaser 4)
│   ├── scenes/
│   │   └── BootScene.ts     # Заставка: тёмно-серый квадрат bgN + прогресс-бар
│   └── ui/
│       ├── palette.ts       # Единая палитра (bgN = 0x0a0b0d)
│       ├── tokens.ts        # Размеры канвы, отступы, шрифты
│       ├── text.ts          # Текстовые стили
│       ├── widgets.ts       # Примитивы: progressBar и др.
│       ├── motion.ts        # Анимация/движение
│       ├── feedbackFx.ts    # Визуальные эффекты
│       └── layout.ts        # Константы раскладки
├── public/
│   └── assets/              # Пусто — procedural fallback
├── ART_SPEC.md              # Спецификация арта (placeholder статус)
├── USERFLOW.md              # Юзерфлоу (концептуальный)
├── THIRD_PARTY_ASSETS.md    # Реестр лицензий
└── vite.config.ts
```

## Фон (dark gray square)

Всё игровое содержимое пока не реализовано. Фон — **сплошной тёмно-серый
квадрат** из палитры (`PALETTE.bgN = 0x0a0b0d`). Больше никаких арт-ассетов.

## Запуск

```bash
cd phaser
npm install
npm run dev          # → http://localhost:3000
npm run build        # → dist/
```

## Следующие шаги

Разработка идёт по секциям из `DEVGUIDE.md`:

1. **Foundation** — ✅ (main.ts, gameConfig, BootScene, UI-примитивы)
2. **Core Loop (L0–20)** — TBD: Arena сцена с 4 блоками, карта навыков, враг
3. **Content** — TBD: данные о врагах, картах, источниках
4. **UI & Assets** — TBD: замена procedural fallback на арт
5. **Backend** — TBD: Fastify + WebSocket (после QA gate L0–20)