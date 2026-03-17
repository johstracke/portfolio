# Portfolio

A full-stack portfolio site built with **Next.js**, **Directus CMS**, and **Tailwind CSS**. Features a block-based content system, project showcase, blog, and dynamic filtering.

## Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone <your-repo>
cd Portfolio
npm install

# 2. Start Directus + PostgreSQL
docker compose up -d postgres directus

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with a strong DB_PASSWORD and admin credentials

# 4. Initialize Directus schema and start dev server
npm run directus:setup
npm run dev
```

Visit:
- **Frontend:** http://localhost:3000
- **Directus CMS:** http://localhost:8055

## Architecture

### Stack
- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **CMS:** Directus (open-source headless CMS)
- **Database:** PostgreSQL 16
- **Content Blocks:** M2A (Many-to-Any) polymorphic system supporting 9 block types
- **Styling:** Tailwind CSS 3.4 + TypeScript

### Content Model

**Projects** contain polymorphic **Blocks** via Many-to-Any junction:
- Text, Image, Gallery, Video, CAD, Code, Specs, Callout blocks
- **Layout blocks** allow nested left/right columns for advanced composition
- All blocks render with full type safety via Zod validation

**Blog Posts** support metadata, tags, and full markdown content.

**Profile** data (bio, links, etc.) serves homepage and dynamic social meta.

## Development

```bash
# Start dev server (with hot reload)
npm run dev

# Type-check and build for production
npm run build

# Export current Directus schema (after editing in UI)
npm run directus:snapshot

# Lint code
npm run lint
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for full Docker + VPS instructions.

## Documentation

- **[DIRECTUS_SETUP.md](./DIRECTUS_SETUP.md)** – Detailed schema setup and environment config
- **[DEPLOY.md](./DEPLOY.md)** – Production deployment and SSL setup
- **[DIRECTUS_SCHEMA.md](./DIRECTUS_SCHEMA.md)** – Complete schema reference (collections, fields, relations)

## Project Structure

```
app/                    # Next.js pages (App Router)
├── page.tsx           # Homepage
├── projects/          # Project listing and detail
├── blog/              # Blog listing and detail
├── about/             # About page
└── now/               # Now/updates page

components/
├── blocks/            # 9 content block components + renderer
├── cards/             # Project/blog card previews
├── filters/           # Project filtering UI
├── layout/            # Header, footer
└── shared/            # Button, badge, markdown components

lib/
├── directus.ts        # Directus SDK client + data fetching
├── schemas.ts         # Zod validation schemas (all content types)
└── utils.ts           # Helpers (formatDate, getAssetUrl, etc.)

scripts/
└── directus-schema-setup.ts  # Canonical schema provisioning script

types/
└── index.ts           # TypeScript type definitions
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (Next.js + HMR) |
| `npm run build` | Build for production + static generation |
| `npm start` | Run production server |
| `npm run lint` | Check TypeScript and ESLint |
| `npm run directus:setup` | Initialize Directus schema (M2A blocks, relations) |
| `npm run directus:snapshot` | Export current Directus schema to JSON |

## Environment Variables

See [.env.example](./.env.example) for complete list. Key variables:

- `DIRECTUS_URL` – Directus API endpoint (internal, for Next.js)
- `NEXT_PUBLIC_DIRECTUS_URL` – Public Directus URL (for browser redirects)
- `DIRECTUS_EMAIL` / `DIRECTUS_PASSWORD` – Admin credentials for schema setup
- `DB_PASSWORD` – PostgreSQL password (use strong value in production)

## Code Quality

- **TypeScript:** Full type safety with strict mode
- **Validation:** Zod schemas for all CMS content at runtime
- **Linting:** ESLint via Next.js config (zero warnings)
- **Build:** Verified with `npm run build` (static generation + SSR)
- **Metrics:** 43 files, ~3,225 LOC, avg 75 LOC/file

## License

Private – See LICENSE file or contact author.
