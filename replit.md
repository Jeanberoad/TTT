# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Hotspot Middleware

A captive-portal payment middleware is implemented in the API server under:

- `artifacts/api-server/src/routes/hotspot.ts` — Express route handler
- `artifacts/api-server/src/lib/mvola.ts` — MVola payment helper
- `artifacts/api-server/src/lib/mikrotik.ts` — MikroTik RouterOS hotspot user creator

### Endpoint

`POST /api/hotspot/purchase`

**Body (JSON):**
- `phone` — customer's MVola phone number (e.g. `"0340000000"`)
- `amount` — ticket price in Ariary
- `profile` — MikroTik hotspot profile name (e.g. `"1h"`, `"1day"`)
- `uptime` *(optional)* — MikroTik `limit-uptime` value (e.g. `"01:00:00"`)

**Response (200):**
```json
{ "username": "hs-XXXXXX", "password": "...", "transactionId": "..." }
```

### Required Secrets
- `MVOLA_TEST_KEY` — MVola test API bearer token
- `MIKROTIK_IP` — public IP / hostname of the MikroTik router
- `MIKROTIK_USER` — MikroTik API username
- `MIKROTIK_PASS` — MikroTik API password
