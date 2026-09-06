# Signal Arena — Design System

## External reference

Этот design system — **внешний референс** из `Downloads/signal-arena-design-system.zip`:

- `design-system.html` — полная responsive UI gallery (12 mobile-first скринов)
- `design-system.tokens.json` — machine-readable tokens + invariant rules
- `COMPONENT_CONTRACTS.md` — behavior, states and acceptance contracts

Эти файлы **вне репозитория** — используются как вдохновение. Локальные копии токенов находятся в `docs/specs/design-system.tokens.json`.

## Technology target

- Phaser 4.2.1
- TypeScript
- Vite
- Mobile-first, RU-first
- PWA-ready

## Canonical constraints

- Four equal navigation items (Arena, Academy, Collection, More)
- Browser Widget as Arena focus
- Four equal answers
- Up to four compact skill cards
- Enemy hidden until the decision
- No HP, FOMO meter, Attention Points, fake profit or pay-to-win
- Terminal chrome is independent from enemy/card master art
- Reduced motion is mandatory