# Portfolio

A full-stack portfolio site built with **Next.js**, **Directus CMS**, and **Tailwind CSS**. Features a block-based content system, project showcase, blog, and dynamic filtering.

## Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone <your-repo>
cd Portfolio
npm install

# 2. Set up both environment files
cp .env.example .env
cp .env.local.example .env.local
# Edit .env and .env.local credentials to match your setup

# 3. Start Directus + PostgreSQL (Docker)
npm run dev:services

# 4. Bootstrap Directus (schema + permissions) and start frontend on host
npm run directus:bootstrap
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
# Hybrid mode (recommended): Docker services + host Next.js
npm run dev:services
npm run dev

# One-command hybrid start
npm run dev:hybrid

# Full Docker mode (frontend + directus + postgres)
npm run dev:docker

# Stop Docker services
npm run dev:down

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
├── directus-setup.sh         # Snapshot apply helper (with idempotency fallback)
└── directus-post-setup.ts    # Public read permission bootstrap

types/
└── index.ts           # TypeScript type definitions
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (Next.js + HMR on host) |
| `npm run dev:services` | Start only PostgreSQL + Directus in Docker |
| `npm run dev:hybrid` | Start PostgreSQL + Directus and then run Next.js on host |
| `npm run dev:docker` | Start full stack in Docker (frontend + Directus + PostgreSQL) |
| `npm run dev:down` | Stop Docker services |
| `npm run build` | Build for production + static generation |
| `npm start` | Run production server |
| `npm run lint` | Check TypeScript and ESLint |
| `npm run directus:setup` | Apply schema snapshot into Directus |
| `npm run directus:permissions` | Ensure required public read permissions exist |
| `npm run directus:bootstrap` | Run setup + permissions for a fresh instance |
| `npm run directus:snapshot` | Export current Directus schema to YAML |

## Environment Variables

Use two files for a smooth local workflow:
- `.env` from [.env.example](./.env.example): Docker Compose variables
- `.env.local` from [.env.local.example](./.env.local.example): host Next.js (`npm run dev`) variables

### Next.js (Frontend)
- **`NEXT_PUBLIC_SITE_URL`** – Your site's public URL (e.g., `https://example.com` or `http://localhost:3000`). Used for sitemaps, Open Graph meta tags, and canonical URLs.
- **`NEXT_PUBLIC_DIRECTUS_URL`** – Public Directus endpoint accessible from browsers (e.g., `http://localhost:8055` in dev or `https://cms.example.com` in production).

### Directus API (For Next.js Data Fetching)
- **`DIRECTUS_URL`** – Internal Directus URL (e.g., `http://directus:8055` inside Docker, or `http://localhost:8055` locally). Used by Next.js to fetch projects, blog posts, and profile data.
- **`DIRECTUS_STATIC_TOKEN`** – (Optional) Static API token for headless API access. Skips login overhead. If set, `DIRECTUS_EMAIL` and `DIRECTUS_PASSWORD` are ignored.
- **`DIRECTUS_EMAIL`** / **`DIRECTUS_PASSWORD`** – Admin account credentials. Used by setup/permissions scripts and as fallback for data fetching if no static token is set. **Must match the admin user created in Directus.**

### Directus Server (Docker)
- **`DIRECTUS_KEY`** – Random 32+ character string for session encryption. Generate: `openssl rand -base64 32`
- **`DIRECTUS_SECRET`** – Random 32+ character string for token signing. Generate: `openssl rand -base64 32`
- **`ADMIN_EMAIL`** – Initial admin email (created on first startup)
- **`ADMIN_PASSWORD`** – Initial admin password (created on first startup)
- **`DIRECTUS_PUBLIC_URL`** – Public Directus URL exposed to clients (same as `NEXT_PUBLIC_DIRECTUS_URL`)

### Database (PostgreSQL)
- **`DB_USER`** – Postgres username (default: `directus`)
- **`DB_PASSWORD`** – Postgres password. **Use a strong random value in production.** (Default in `.env.example` is placeholder.)
- **`DB_NAME`** – Database name (default: `directus`)

### Recommended Local Setup (Two Files)

**Docker Compose (`.env`):**
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_PUBLIC_URL=http://localhost:8055
DIRECTUS_URL=http://directus:8055
DB_USER=directus
DB_PASSWORD=your_secure_password_here
DB_NAME=directus
DIRECTUS_KEY=random-key-min-32-chars
DIRECTUS_SECRET=random-secret-min-32-chars
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your_admin_password_here
```

**Host Next.js (`.env.local`):**
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_URL=http://localhost:8055
DIRECTUS_STATIC_TOKEN=your_static_token_here
DIRECTUS_EMAIL=admin@example.com
DIRECTUS_PASSWORD=your_admin_password_here
```

**Production (`.env` on VPS):**
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
DIRECTUS_URL=http://directus:8055  # Internal Docker network
NEXT_PUBLIC_DIRECTUS_URL=https://cms.your-domain.com
DIRECTUS_PUBLIC_URL=https://cms.your-domain.com
DIRECTUS_EMAIL=admin@your-domain.com
DIRECTUS_PASSWORD=strong_random_password
DB_PASSWORD=strong_random_password
DIRECTUS_KEY=<random 32+ char string>
DIRECTUS_SECRET=<random 32+ char string>
```

See [DIRECTUS_SETUP.md](./DIRECTUS_SETUP.md) for detailed setup instructions.

## License

Private – See LICENSE file or contact author.
