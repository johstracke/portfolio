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

Copy [.env.example](./.env.example) to `.env.local` (development) or `.env` (production) and configure:

### Next.js (Frontend)
- **`NEXT_PUBLIC_SITE_URL`** – Your site's public URL (e.g., `https://example.com` or `http://localhost:3000`). Used for sitemaps, Open Graph meta tags, and canonical URLs.
- **`NEXT_PUBLIC_DIRECTUS_URL`** – Public Directus endpoint accessible from browsers (e.g., `http://localhost:8055` in dev or `https://cms.example.com` in production).

### Directus API (For Next.js Data Fetching)
- **`DIRECTUS_URL`** – Internal Directus URL (e.g., `http://directus:8055` inside Docker, or `http://localhost:8055` locally). Used by Next.js to fetch projects, blog posts, and profile data.
- **`DIRECTUS_STATIC_TOKEN`** – (Optional) Static API token for headless API access. Skips login overhead. If set, `DIRECTUS_EMAIL` and `DIRECTUS_PASSWORD` are ignored.
- **`DIRECTUS_EMAIL`** / **`DIRECTUS_PASSWORD`** – Admin account credentials. Used by schema setup script (`npm run directus:setup`) and as fallback for data fetching if no static token is set. **Must match the admin user created in Directus.**

### Directus Server (Docker)
- **`KEY`** – Random 32+ character string for session encryption. Generate: `openssl rand -base64 32`
- **`SECRET`** – Random 32+ character string for token signing. Generate: `openssl rand -base64 32`
- **`ADMIN_EMAIL`** – Initial admin email (created on first startup)
- **`ADMIN_PASSWORD`** – Initial admin password (created on first startup)
- **`PUBLIC_URL`** – Public Directus URL exposed to clients (same as `NEXT_PUBLIC_DIRECTUS_URL`)

### Database (PostgreSQL)
- **`DB_USER`** – Postgres username (default: `directus`)
- **`DB_PASSWORD`** – Postgres password. **Use a strong random value in production.** (Default in `.env.example` is placeholder.)
- **`DB_NAME`** – Database name (default: `directus`)

### Development vs. Production

**Local Development (.env.local):**
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DIRECTUS_URL=http://localhost:8055
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_EMAIL=admin@example.com
DIRECTUS_PASSWORD=your_password_here
DB_PASSWORD=your_secure_password_here
DIRECTUS_KEY=random-key-min-32-chars
DIRECTUS_SECRET=random-secret-min-32-chars
```

**Production (.env on VPS):**
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
DIRECTUS_URL=http://directus:8055  # Internal Docker network
NEXT_PUBLIC_DIRECTUS_URL=https://cms.your-domain.com
DIRECTUS_EMAIL=admin@your-domain.com
DIRECTUS_PASSWORD=strong_random_password
DB_PASSWORD=strong_random_password
DIRECTUS_KEY=<random 32+ char string>
DIRECTUS_SECRET=<random 32+ char string>
```

See [DIRECTUS_SETUP.md](./DIRECTUS_SETUP.md) for detailed setup instructions.

## License

Private – See LICENSE file or contact author.
