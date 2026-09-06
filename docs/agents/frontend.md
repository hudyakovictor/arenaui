# Frontend Agent — Phaser 4 разработчик

## Обязанности

- Реализация игровых сцен на Phaser 4
- Игровой цикл, твины, камера, партиклы, звук
- UI внутри сцен (через Graphics или проверенный rexUI)
- Интеграция CandleChart на Graphics (не iframe!)
- Управление состоянием через Zustand (см. ниже — почему именно Zustand)

## Технологии

| Технология | Статус | Примечание |
|---|---|---|
| Phaser 4 | ✅ Обязательно | `phaser@^4.2.1` |
| TypeScript | ✅ Обязательно | Строгая типизация |
| Vite | ✅ Обязательно | target es2020, `phaser/vite.config.ts` |
| Zustand | ✅ Обязательно | Стейт-менеджер без React |
| Vitest | ✅ Обязательно | Unit-тесты |
| vite-plugin-pwa | ⚠️ Опционально | PWA — после MVP |

## Что НЕ использовать

- React, Vue, Angular — только Phaser 4
- lightweight-charts / TradingView / iframe — только Canvas/Graphics
- Phaser 3 — только 4-я версия

## Конвенции

- Один класс сцены на файле: `phaser/src/scenes/<Name>Scene.ts`
- Импорты относительные (без `src/`-алиасов)
- `camelCase` — переменные, `PascalCase` — классы
- Тексты — в стиле `стиль_тон.txt`

---

## Почему Zustand (а не Redux / Context / singletons)

Phaser 4 рендерит на Canvas — **React здесь не используется**. Менеджер состояния
должен быть:

1. **Framework-agnostic** — работать с обычными TS-классами, без компонентов
2. **Минимальный** — без Actions/Reducers/Dispatch, как в Redux
3. **С реактивностью** — чтобы UI-оверлеи (HTML/CSS поверх канвы) подписывались на изменения
4. **Предсказуемый для AI** — чтобы arena.ai и другие агенты писали код без выдуманных паттернов

**Zustand** — единственный выбор, который удовлетворяет всем пунктам:
- 1 КБ в бандле, простой API `create()`, `getState()`, `setState()`
- Подписки через `.subscribe()` для HTML-оверлеев
- Если позже добавят React-UI — Zustand интегрируется без миграций
- LLM пишут код на нём предсказуемо, без boilerplate

**Что НЕ использовать:**
- Redux (тяжёлый, boilerplate, LLM путаются в actions/reducers)
- React Context (требует React)
- MobX (magic-реактивность, сложно отлаживать)
- Синглтоны вручную (нет реактивности, нет типизации структуры)

## Паттерн Zustand в Phaser

```typescript
// phaser/src/stores/useGameState.ts
import { create } from 'zustand'

interface GameState {
  score: number
  playerHealth: number
  addScore: (points: number) => void
  setHealth: (hp: number) => void
  reset: () => void
}

export const useGameState = create<GameState>((set) => ({
  score: 0,
  playerHealth: 100,
  addScore: (points) => set((s) => ({ score: s.score + points })),
  setHealth: (hp) => set({ playerHealth: hp }),
  reset: () => set({ score: 0, playerHealth: 100 }),
}))
```

В сценах Phaser:
```typescript
// чтение (без подписки — каждый кадр)
const score = useGameState.getState().score

// запись
useGameState.getState().addScore(10)
```

Для HTML-оверлеев (кнопки, инвентарь):
```typescript
// подписка с cleanup
const unsub = useGameState.subscribe((state) => {
  // обновить DOM
})
// unsub() при уничожении сцены
```

**Важно для AI:** используй только `create()`, `getState()`, `setState()`, `subscribe()`.
Никаких middleware, плагинов, middlewares. Если понадобится — спрашивать.

## Полезные команды

```bash
cd phaser && npm run dev        # dev-сервер
npx vitest run                  # unit-тесты
npx tsc --noEmit                # типизация
npx vite build                  # production
```
