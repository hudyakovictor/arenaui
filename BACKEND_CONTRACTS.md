# Signal Arena — Backend keys and API contract

**Status:** canonical draft for frontend/backend alignment  
**Contract version:** `1.0.0-draft`  
**API prefix:** `/api/v1`  
**Source:** `new.txt`, Phaser vertical slice and design-system contracts

This document fixes stable identifiers, JSON keys, endpoint payloads and ownership boundaries before backend implementation. It does **not** contain credentials or secret values.

## 1. Naming and versioning rules

- Wire JSON uses `snake_case`; TypeScript client may map it to `camelCase` internally.
- IDs and enum values are ASCII, lowercase and never localized.
- UI text is addressed by `*_text_key` and stored in locale packs, not used as an ID.
- Database primary IDs use UUID/ULID. Content IDs are stable slugs.
- Every mutating request carries `Idempotency-Key`.
- A played task is reproduced by `(template_id, seed, content_version, engine_version)`.
- Old `content_version` and `engine_version` remain available for attempt verification.
- Additive response fields are backward compatible. Renaming/removing a field requires a new API version.

### Required headers

| Header | Direction | Meaning |
|---|---|---|
| `Authorization: Bearer <jwt>` | client → server | Account/session token |
| `Idempotency-Key` | client → server | UUID generated per mutation or queued offline operation |
| `X-Client-Version` | client → server | App build, e.g. `0.4.0` |
| `X-Engine-Version` | both | Shared deterministic engine version |
| `X-Content-Version` | both | Content package used for the task |
| `ETag` / `If-None-Match` | both | Config/content caching |
| `X-Request-Id` | both | Trace identifier |

## 2. Stable ID namespaces

| Entity | Format | Examples |
|---|---|---|
| User | `usr_<ulid>` | `usr_01J...` |
| Device | `dev_<ulid>` | `dev_01J...` |
| Session | `ses_<ulid>` | `ses_01J...` |
| Attempt | `att_<ulid>` | `att_01J...` |
| Card | `card.c01`…`card.c17` | `card.c04` |
| Atom | `atom.cNN.N` | `atom.c04.2` |
| Enemy | `enemy.e01`…`enemy.e33` | `enemy.e02` |
| Stage | `<enemy_id>.sN` | `enemy.e02.s1` |
| Source | `source.<type>` | `source.chart`, `source.wallet` |
| Template | `task.<domain>.<goal>.vN` | `task.ta.false_breakout.v1` |
| Combo | `combo.k01`…`combo.k17`, `combo.t01`…`combo.t08` | `combo.k03` |
| Skin | `skin.<slug>` | `skin.terminal`, `skin.field_notes` |
| Tournament | `trn_<ulid>` | `trn_01J...` |
| Notification | `ntf_<ulid>` | `ntf_01J...` |
| Content package | semantic version/hash | `2026.09.03.1` |
| Config | semantic version | `1.0.0` |

### Prototype-to-wire ID mapping

The current Phaser prototype keeps compact IDs for readability. API adapters must map them explicitly:

- `C1`…`C17` → `card.c01`…`card.c17`
- `C1.1` → `atom.c01.1`
- `E01`…`E33` → `enemy.e01`…`enemy.e33`
- `K01` / `T01` → `combo.k01` / `combo.t01`
- `chart | news | position | wallet | tokenomics | onchain | orderbook | sentiment` → corresponding `source.*`

Compact IDs must not leak into new database foreign keys.

## 3. Common response envelope

### Success

```json
{
  "data": {},
  "meta": {
    "request_id": "req_01J...",
    "server_time": "2026-09-03T16:00:00Z",
    "api_version": "v1"
  }
}
```

### Error

```json
{
  "error": {
    "code": "ATTEMPT_INVALID_EVIDENCE",
    "message_key": "error.attempt.invalid_evidence",
    "details": { "evidence_id": "ev-volume" },
    "retryable": false
  },
  "meta": {
    "request_id": "req_01J...",
    "server_time": "2026-09-03T16:00:00Z",
    "api_version": "v1"
  }
}
```

## 4. Authentication and bootstrap

### `POST /api/v1/auth/anonymous`

Request keys:

```json
{
  "device_id": "dev_01J...",
  "install_id": "ins_01J...",
  "platform": "web",
  "locale": "ru-RU",
  "timezone": "Europe/Moscow"
}
```

Response `data` keys:

```json
{
  "user_id": "usr_01J...",
  "access_token": "<jwt>",
  "refresh_token": "<opaque>",
  "access_expires_at": "2026-09-03T17:00:00Z",
  "is_new_user": true
}
```

### `POST /api/v1/auth/refresh`

Request: `refresh_token`, `device_id`.  
Response: `access_token`, `refresh_token`, `access_expires_at`.

### `GET /api/v1/bootstrap`

Response `data` keys:

- `user`
- `progress`
- `wallet`
- `active_skin_id`
- `owned_skin_ids`
- `config_version`
- `content_version`
- `engine_version`
- `config_url`
- `content_url`
- `schedule`
- `daily_seed_bundle`
- `feature_flags`
- `server_time`

## 5. Player and progress objects

### `user`

| Key | Type | Owner |
|---|---|---|
| `user_id` | string | server |
| `created_at` | ISO datetime | server |
| `account_type` | `anonymous \| linked` | server |
| `locale` | BCP-47 string | user |
| `timezone` | IANA string | user |
| `segment_id` | string | server |
| `display_name` | string/null | user |

### `progress`

| Key | Type | Notes |
|---|---|---|
| `level` | integer 0–99 | Server authority |
| `xp` | integer | XP inside current level |
| `xp_to_next_level` | integer | From versioned config |
| `epoch` | enum | Derived from level/config |
| `risk_budget` | integer | Cannot be purchased |
| `risk_budget_max` | integer | Config-driven |
| `streak` | integer | Learning streak |
| `weather_mode` | enum | Current daily mode |
| `card_progress` | array | One item per encountered card |
| `enemy_progress` | array | Trophy/stage state |
| `combo_progress` | array | Counts and unlocks |
| `mistake_scroll_open_count` | integer | Compact top-bar value |
| `calibration_summary` | object/null | Available when unlocked |
| `revision` | integer | Optimistic sync revision |
| `updated_at` | ISO datetime | Server timestamp |

### `card_progress[]`

`card_id`, `rank`, `atoms_completed`, `practice_count`, `justified_win_count`, `unlocked_at`, `ranked_up_at`.

### `enemy_progress[]`

`enemy_id`, `stage_reached`, `trophy_layers`, `wins`, `losses`, `next_stage_due_at`, `updated_at`.

### `combo_progress[]`

`combo_id`, `count`, `required_count`, `unlocked`, `unlocked_at`, `last_progress_at`.

### `calibration_summary`

`sample_size`, `predicted_mean`, `actual_mean`, `calibration_gap`, `hubris_risk`, `buckets`.

## 6. Content and configuration

### `GET /api/v1/config`

Query: `version` (optional), `segment_id` (server may override).  
Response headers use ETag. Response data:

- `version`
- `published_at`
- `signature`
- `levels`
- `epochs`
- `crutches`
- `mechanics`
- `risk_budget`
- `confidence`
- `scheduler`
- `mutation`
- `bots`
- `combo`
- `weather`
- `economy`
- `tournament`
- `feature_flags`

### `GET /api/v1/content/packages/:content_version`

Response data:

- `content_version`
- `engine_version_min`
- `schema_version`
- `published_at`
- `signature`
- `locale_versions`
- `cards`
- `atoms`
- `enemies`
- `stages`
- `combos`
- `sources`
- `task_templates`
- `skins`
- `asset_manifest`

### Public task instance

The backend/client generator may expose:

- `task_instance_id`
- `template_id`
- `content_version`
- `engine_version`
- `seed`
- `mode`
- `ticker`
- `timeframe`
- `question_text_key` / resolved `question_text`
- `source_payloads`
- `evidence_zones` without correctness flags
- `available_card_ids`
- `required_card_count`
- `answer_options` without correctness flags
- `verdict_options`
- `enemy_presence` (`hidden | unknown | silhouette`)
- `expires_at`

**Forbidden before resolution:** `correct_answer`, `is_correct`, `correct_evidence_ids`, enemy identity/name, distractor truth labels and future play-forward outcome.

## 7. Seeds and schedule

### `POST /api/v1/seeds/session`

Request: `session_id`, `mode`, `content_version`.  
Response: `seed_set_id`, `seeds[]`, `expires_at`, `signature`.

### `GET /api/v1/schedule`

Query: `from`, `limit`. Response `schedule_item[]` keys:

- `schedule_item_id`
- `item_type` (`warmup | new_atom | enemy_stage | mistake_retry | event | tournament`)
- `reference_id`
- `template_id`
- `seed`
- `due_at`
- `priority`
- `reason`
- `difficulty_step`
- `weather_mode`
- `content_version`

### `POST /api/v1/sessions`

Request: `client_session_id`, `mode`, `started_at`, `content_version`, `engine_version`.  
Response: `session_id`, `risk_budget_start`, `weather_mode`, `seed_set_id`.

### `POST /api/v1/sessions/:session_id/end`

Request: `ended_by`, `client_ended_at`, `last_attempt_id`.  
`ended_by`: `user | risk_budget_zero | warmup_complete | app_background | network_failure`.

## 8. Attempt submission and resolution

### `POST /api/v1/attempts/batch`

Request keys:

```json
{
  "base_progress_revision": 12,
  "attempts": [
    {
      "client_attempt_id": "att_local_01J...",
      "session_id": "ses_01J...",
      "template_id": "task.ta.false_breakout.v1",
      "content_version": "2026.09.03.1",
      "engine_version": "1.0.0",
      "seed": 318294721,
      "mode": "standard",
      "selected_answer_id": "option.b",
      "selected_evidence_ids": ["ev.volume.breakout"],
      "selected_card_ids": ["card.c02"],
      "sequence_card_ids": [],
      "verdict_factor_id": null,
      "confidence": "mid",
      "opened_source_ids": ["source.chart"],
      "blind_source_spend": 0,
      "started_at": "2026-09-03T16:00:00Z",
      "answered_at": "2026-09-03T16:00:42Z",
      "duration_ms": 42000,
      "offline": false
    }
  ]
}
```

Each attempt requires its own `Idempotency-Key` inside queued metadata or a deterministic `client_attempt_id`; retries must not double-award progress.

Response item keys:

- `client_attempt_id`
- `server_attempt_id`
- `status` (`accepted | rejected | conflict`)
- `result` (`correct | correct_unfounded | wrong`)
- `correct_answer_id`
- `correct_evidence_ids`
- `enemy_id`
- `enemy_stage`
- `explanation_text_key`
- `consequence_text_key`
- `countermeasure_text_key`
- `play_forward_payload`
- `answer_distribution`
- `xp_delta`
- `sig_delta`
- `risk_budget_delta`
- `card_progress_delta`
- `combo_progress_delta`
- `enemy_progress_delta`
- `mistake_scroll_delta`
- `epoch_transition`
- `event_trigger`
- `progress_revision`
- `server_received_at`

The server regenerates the task and scoring. Client-sent correctness, XP, SIG, budget delta, enemy result and trophy result are ignored.

### Attempt validation error codes

- `ATTEMPT_DUPLICATE`
- `ATTEMPT_UNKNOWN_TEMPLATE`
- `ATTEMPT_CONTENT_VERSION_EXPIRED`
- `ATTEMPT_ENGINE_VERSION_UNSUPPORTED`
- `ATTEMPT_SEED_INVALID`
- `ATTEMPT_OPTION_INVALID`
- `ATTEMPT_INVALID_EVIDENCE`
- `ATTEMPT_CARD_LOCKED`
- `ATTEMPT_SEQUENCE_INVALID`
- `ATTEMPT_SESSION_CLOSED`
- `ATTEMPT_TOO_FAST`
- `ATTEMPT_TOURNAMENT_WINDOW_CLOSED`
- `PROGRESS_REVISION_CONFLICT`

## 9. Mistake scroll and calibration

### `GET /api/v1/mistakes`

Item keys: `mistake_id`, `enemy_id`, `atom_id`, `missed_evidence_id`, `created_at`, `closed_at`, `mutation_depth`, `recurrence_count`, `trend`, `counter_card_ids`, `fix_mission_status`.

### `POST /api/v1/mistakes/:mistake_id/close`

Request: `closing_attempt_id`. The server verifies that the mutated retry was passed with valid evidence.

### `GET /api/v1/calibration`

Response: `summary`, `buckets`, `history`, `hubris_risk`, `available_from_level`.

## 10. Skins, wallet and purchases

Skins are cosmetic and never appear in engine/scoring input.

### `GET /api/v1/store/skins`

Skin item keys:

- `skin_id`
- `name_text_key`
- `description_text_key`
- `price_sig`
- `owned`
- `active`
- `supported_epochs`
- `palette_token_set_id`
- `asset_pack_id`
- `preview_asset_url`
- `available_from`
- `available_until`

### `POST /api/v1/store/skins/:skin_id/purchase`

Request: `expected_price_sig`, `wallet_revision`.  
Response: `purchase_id`, `skin_id`, `sig_delta`, `sig_balance`, `wallet_revision`, `purchased_at`.

### `PUT /api/v1/profile/active-skin`

Request: `skin_id`.  
Response: `active_skin_id`, `updated_at`.

### Wallet keys

`sig_balance`, `wallet_revision`, `lifetime_earned`, `lifetime_spent`, `updated_at`.

**Forbidden:** purchasing risk budget, stronger cards, correct evidence, task data, retries or tournament advantage.

## 11. Tournament and shadow APIs

### REST

- `GET /api/v1/tournaments`
- `GET /api/v1/tournaments/:tournament_id`
- `POST /api/v1/tournaments/:tournament_id/join`
- `POST /api/v1/tournaments/:tournament_id/runs`
- `GET /api/v1/tournaments/:tournament_id/leaderboard`
- `GET /api/v1/shadow/distribution?template_id=...`

Tournament keys: `tournament_id`, `status`, `starts_at`, `ends_at`, `ruleset_version`, `content_version`, `engine_version`, `seed_set_id`, `eligibility`, `entry`, `player_rank`, `participants`, `rewards_cosmetic_only`.

### WebSocket `/api/v1/ws`

Client messages:

- `auth` — `access_token`
- `subscribe` — `channels[]`
- `tournament_presence` — `tournament_id`
- `ping` — `client_time`

Server messages:

- `ready`
- `progress_updated`
- `tournament_started`
- `leaderboard_updated`
- `shadow_available`
- `notification_created`
- `pong`
- `error`

Every WS message has `type`, `event_id`, `occurred_at`, `payload`.

## 12. Analytics event keys

All events include:

- `event_id`
- `event_name`
- `event_version`
- `occurred_at`
- `user_id`
- `device_id`
- `session_id`
- `level`
- `epoch`
- `content_version`
- `engine_version`
- `client_version`
- `platform`
- `locale`
- `offline`
- `properties`

Canonical `event_name` values:

- `onboarding_started`, `onboarding_completed`
- `lesson_started`, `lesson_completed`
- `microcheck_answered`
- `card_granted`, `card_ranked_up`
- `task_started`, `source_opened`, `evidence_selected`, `answer_submitted`, `task_resolved`
- `play_forward_skipped`, `enemy_identified`
- `risk_budget_changed`, `session_ended`
- `warmup_started`, `warmup_completed`
- `mistake_opened`, `mistake_closed`
- `combo_progressed`, `combo_unlocked`
- `enemy_stage_won`, `epoch_transitioned`
- `skin_previewed`, `skin_purchased`, `skin_equipped`
- `tournament_joined`, `tournament_run_completed`

Task event property keys: `task_instance_id`, `template_id`, `seed`, `mode`, `source_id`, `evidence_id`, `answer_id`, `card_ids`, `confidence`, `result`, `duration_ms`, `risk_budget_delta`.

## 13. Canonical enums

- `epoch`: `street | cabinet | terminal | system`
- `task_mode`: `standard | sequence | verdict | blind | cold`
- `confidence`: `low | mid | high`
- `result`: `correct | correct_unfounded | wrong`
- `source`: `chart | news | position | wallet | tokenomics | onchain | orderbook | sentiment`
- `weather_mode`: `trend | flat | volatile | news | late_cycle`
- `crutch_state`: `present | conditional | absent | false`
- `enemy_mode`: `normal | event | boss`
- `account_type`: `anonymous | linked`
- `platform`: `web | ios | android`
- `schedule_item_type`: `warmup | new_atom | enemy_stage | mistake_retry | event | tournament`

## 14. Environment variable names

Only names belong in documentation. Values belong in the deployment secret manager and must never be committed.

### Server

- `NODE_ENV`
- `HOST`
- `PORT`
- `DATABASE_URL`
- `JWT_SIGNING_KEY`
- `JWT_REFRESH_SIGNING_KEY`
- `CONTENT_SIGNING_PRIVATE_KEY`
- `CONTENT_CDN_BASE_URL`
- `CORS_ALLOWED_ORIGINS`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_WINDOW_MS`
- `LOG_LEVEL`
- `SENTRY_DSN`
- `PUSH_VAPID_PUBLIC_KEY`
- `PUSH_VAPID_PRIVATE_KEY`

### Client-safe build variables

- `VITE_API_BASE_URL`
- `VITE_WS_URL`
- `VITE_CONTENT_CDN_BASE_URL`
- `VITE_CONTENT_SIGNING_PUBLIC_KEY`
- `VITE_SENTRY_DSN`
- `VITE_APP_VERSION`

Never expose server signing keys, database credentials or refresh-token secrets through a `VITE_*` variable.

## 15. Ownership matrix

| Value | Client proposes | Server validates | Server authority |
|---|---:|---:|---:|
| Selected answer/cards/evidence | yes | yes | stored result |
| Seed | only from issued bundle | yes | yes |
| Correct answer | no | generated | yes |
| XP/SIG/budget delta | no | calculated | yes |
| Level/epoch/ranks | no | calculated | yes |
| Skin selection | yes | ownership | yes |
| Cosmetic purchase | yes | balance/idempotency | yes |
| Task presentation state | yes | no | client only |
| Tournament score | no | calculated | yes |

## 16. Required contract tests

1. Same template/seed/content/engine generates byte-equivalent canonical task data on client and server.
2. Replaying the same `Idempotency-Key` never duplicates XP, SIG, purchase or trophy progress.
3. Public task payload contains no correctness or enemy-reveal fields.
4. Evidence IDs not present in generated source payload are rejected.
5. Two-evidence epochs require two correct zones from distinct sources.
6. Progress revision conflict returns authoritative progress without silent overwrite.
7. Offline attempt batch preserves original order and timestamps.
8. Old content versions can validate attempts for the configured retention period.
9. A skin purchase/equip cannot change any engine input or score.
10. Tournament run uses the tournament-pinned content/config/engine versions.

## 17. Decisions still requiring product approval

- Authentication providers after anonymous mode.
- Content-version retention period for offline attempts.
- Whether SIG wallet is ledger-based from day one or introduced after MVP.
- Exact tournament eligibility and cosmetic rewards.
- Analytics retention/deletion periods and account export flow.
- Whether API IDs replace compact prototype IDs immediately or through an adapter.

Until these decisions are made, implementations must use the defaults and ownership boundaries above rather than inventing additional fields.
