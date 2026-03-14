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

## Schema Source of Truth

The live instance is provisioned via `scripts/directus-schema-setup.ts`. That script creates:
- `projects.id` and `content_blocks.project_id` as **integer** (auto-increment)
- M2M relations: `projects_tags`, `blog_posts_tags`, `blog_posts_projects`

The `directus-schema.json` file is aligned with this setup. Use the setup script for new instances.

## Environment Variables

See `.env.example` for required variables. Key ones:

- `DIRECTUS_URL` / `NEXT_PUBLIC_DIRECTUS_URL` - Directus instance URL
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (or `DIRECTUS_EMAIL` / `DIRECTUS_PASSWORD`) - For schema setup script and **app data fetching**. The Next.js app logs in with these credentials to read projects, blog posts, and profile. Without them, you may see 403 errors and empty content.
- `DB_PASSWORD` - PostgreSQL password (use a strong value in production)

**For local development:** Copy `.env.example` to `.env.local` and set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to match your Directus admin user.
