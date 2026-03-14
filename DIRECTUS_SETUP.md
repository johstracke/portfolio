# Directus Setup

## Quick Start

1. **Start Directus:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your ADMIN_EMAIL, ADMIN_PASSWORD, DB_PASSWORD, etc.
   docker compose up -d
   ```

2. **Apply schema (optional - if directus-schema.json exists):**
   ```bash
   # Install Directus CLI globally or use npx
   npx directus schema apply ./directus-schema.json
   ```
   Or create schema manually in Directus UI using [DIRECTUS_SCHEMA.md](./DIRECTUS_SCHEMA.md).

3. **Export schema (after creating/editing in UI):**
   ```bash
   npm run directus:snapshot
   # or: npx directus schema snapshot ./directus-schema.json
   ```

4. **Programmatic schema creation (alternative):**
   ```bash
   DIRECTUS_URL=http://localhost:8055 ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=admin npm run directus:schema
   ```

## Environment Variables

See `.env.example` for required variables. Key ones:

- `DIRECTUS_URL` / `NEXT_PUBLIC_DIRECTUS_URL` - Directus instance URL
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - For schema setup script
- `DB_PASSWORD` - PostgreSQL password (use a strong value in production)
