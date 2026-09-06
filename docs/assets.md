# Assets — Руководство по игровым ресурсам

## Статус ассетов

В проекте используются **бесплатные** и **временные** ассеты. Их наличие
**допустимо в финальном релизе** — по умолчанию. Замена на уникальные ассеты
планируется **по желанию** в будущем.

**Главное правило:** использовать максимум из доступного с первых дней разработки.
Не блокировать прогресс ради идеального арта.

## Что уже доступно

### `phaser/public/assets/` — основной набор (уже в проекте)

| Категория | Формат | Описание |
|---|---|---|
| `render/enemies/EXX_s1..s4.svg` | SVG | Рендеры врагов (E01–E33), 4 уровня детализации |
| `render/enemies/EXX_avatar.svg` | SVG | Круглая аватарка ( для профиля и диалогов) |
| `render/enemies/EXX_icon.svg` | SVG | Маленькая иконка (списки, коллекция) |
| `render/cards/C1–C17.svg` | SVG | Карты-события и `Cwait.svg` |
| `render/icons/dom-*.svg` | SVG | Иконки доменов (technical, risk, crypto, cognitive, human, context) |
| `render/icons/nav-*.svg` | SVG | Иконки навигации (academy, arena, collection, more) |
| `bg-wall.jpg` | JPG | Фон эпохи «Улица» |
| `manifest.json` | JSON | Метаданные: ID, имя, домен, уровни, пути к файлам |
| `icon-index.json` | JSON | Индекс иконок с локализованными подписями |

Все ассеты — **AI-сгенерированы для проекта** (proprietary). Прямых лицензий
от сторонних источников нет в основном наборе.

### `game_characters/` — концептуальные рендеры

JPG-рендеры сущностей от разных контрибуторов:
`enemy.leverage_goblin.jpg`, `enemy.fomo_wraith.jpg`, `enemy.paper_hands_poltergeist.jpg` и др.
Также: `concept_B_arhivarius.png` (помощник-скрепка).

**Статус:** концептуальные референсы. Не привязаны к ID в манифесте.

### `concepts/using-temporary-phaser-assets/` — временный набор

| asset_id | source | license | attribution |
|---|---|---|---|
| `iconSet.ts` (44 иконки 24×24) | lucide.dev | ISC | нет |
| `bg-wall.jpg`, `E01–E03_s1.png` | AI-сгенерировано | proprietary (project) | нет |
| Процедурные заглушки | `AssetKit.ts` (Graphics) | proprietary | — |

`THIRD_PARTY_ASSETS.md` в этой папке содержит полный реестр.

## Где брать бесплатные ассеты

| Источник | License | Что |
|---|---|---|
| game-icons.net | CC BY 3.0 | Метафоры врагов, событий |
| kenney.nl/assets/ui-pack | CC0 | Рамки, кнопки, 9-slice |
| kenney.nl/assets/retro-textures-1 | CC0 | Шум, сканлайны |

## Замена на уникальные ассеты

- **Когда:** по желанию, после MVP
- **Как:** заменяйте файлы в `phaser/public/assets/` — структура и идентификаторы
  сохраняются (меняйте только содержимое файлов)
- **Манифест**: `manifest.json` определяет какой файл за какой сущность —
  меняйте только пути в нём если структура поменяется
- **Иконки**: Lucide (ISC) из concepts — можно использовать вместо
  `render/icons/` если нужно быстро

## Fallback system

Если файл не загрузился — автоматически ставится процедурная заглушка
(Graphics.generateTexture) того же размера. Список заглушек виден в
AssetGalleryScene.
