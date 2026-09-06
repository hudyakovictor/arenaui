# Signal Arena — Asset Kit: реестр временных ассетов

| asset_id | source_url | author | license | attribution_required | used_in | modified |
|---|---|---|---|---|---|---|
| `src/game/assets/iconSet.ts` (44 иконок stroke 24×24) | https://lucide.dev | Lucide Contributors | ISC | нет | TopBar, BottomNav, чипы, кнопки, строки, галерея | да: сокращены/упрощены path, белый stroke под setTint |
| `assets/bg-wall.jpg` | сгенерировано (AI) для проекта | Signal Arena | proprietary (project) | нет | фон эпохи «Улица» (tileSprite) | нет |
| `assets/render/enemies/E01_s1.png … E03_s1.png` | сгенерировано (AI) для проекта | Signal Arena | proprietary (project) | нет | Арена (рендер 240), задание (40) | нет |
| процедурные заглушки: `enemy_*_avatar`, `enemy_*_icon`, `enemy_*_s1..s4`, `card_C*`, `card_Cwait` | `src/game/assets/AssetKit.ts` (Graphics.generateTexture) | Signal Arena | proprietary | нет | всё, где нет файла | — |

## Правило
Любой файл, который **не загрузился**, автоматически заменяется процедурной заглушкой того же размера
(см. `installLoadGuards` + `ensureAllTextures`). Список подмен виден в «Ещё → Галерея ассетов».

## Куда идти за следующими бесплатными ассетами
- game-icons.net — CC BY 3.0 (нужна атрибуция автора) — метафоры врагов, событий.
- kenney.nl/assets/ui-pack — CC0 — рамки/кнопки, если понадобится 9-slice.
- kenney.nl/assets/retro-textures-1 — CC0 — шум/сканлайны 3–8% opacity.
