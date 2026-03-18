# Directus Setup

## Quick Start

1. **Start Directus:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your ADMIN_EMAIL, ADMIN_PASSWORD, DB_PASSWORD, etc.
   docker compose up -d
   ```

2. **Bootstrap schema + required permissions:**
   ```bash
   npm run directus:bootstrap
   ```

3. **Export schema (after creating/editing in UI):**
   ```bash
   npm run directus:snapshot
   ```

4. **Run independently (if needed):**
   ```bash
   npm run directus:setup        # schema apply only
   npm run directus:permissions  # permission bootstrap only
   ```

## Schema Source of Truth

The live instance is provisioned from `directus-schema.snapshot.yaml` using `npm run directus:setup`.
Permissions required for public content and assets are provisioned via `npm run directus:permissions`.

Use `npm run directus:bootstrap` for new instances.

## Environment Variables

See `.env.example` for required variables. Key ones:

- `DIRECTUS_URL` / `NEXT_PUBLIC_DIRECTUS_URL` - Directus instance URL
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (or `DIRECTUS_EMAIL` / `DIRECTUS_PASSWORD`) - For setup/permissions scripts and **app data fetching** when no static token is provided.
- `DIRECTUS_STATIC_TOKEN` - Preferred for app data fetching in production.
- `DB_PASSWORD` - PostgreSQL password (use a strong value in production)

**For local development:** Copy `.env.example` to `.env.local` and set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to match your Directus admin user.
