# Deployment Guide

## Quick Start (Local / Dev)

```bash
cp .env.example .env
cp .env.local.example .env.local
# Edit both files with matching credentials where needed

# Start Directus only (Next.js runs locally)
npm run dev:services

# Apply schema and permissions
npm run directus:bootstrap

# Run Next.js on host
npm run dev
```

Visit http://localhost:3000 (frontend) and http://localhost:8055 (Directus).

## Full Docker Deployment (VPS)

For production, run everything in Docker:

```bash
# On your VPS
git clone <your-repo>
cd portfolio

cp .env.example .env
# Edit .env with production values:
# - NEXT_PUBLIC_SITE_URL=https://your-domain.com
# - DIRECTUS_PUBLIC_URL=https://cms.your-domain.com (or same domain)
# - Strong DB_PASSWORD, DIRECTUS_KEY, DIRECTUS_SECRET
# - ADMIN_EMAIL, ADMIN_PASSWORD

docker compose up -d --build

# Apply schema (first time only)
npm run directus:setup
```

- Frontend: http://localhost:3000 (or your domain)
- Directus: http://localhost:8055

## Adding SSL with Caddy

1. Point your domain DNS to the VPS IP.
2. Edit `Caddyfile`: replace `your-domain.com` and `cms.your-domain.com` with your domains.
3. Add the Caddy service to `docker-compose.yml` (see `.cursor/rules/portfolio-core.mdc` for the full config).
4. Set `NEXT_PUBLIC_SITE_URL` and `DIRECTUS_PUBLIC_URL` to your HTTPS URLs.

## Pre-Deployment Checklist

- [ ] .env configured with secure passwords
- [ ] Domain DNS pointed to VPS (if using custom domain)
- [ ] Firewall allows 80, 443, 22 (SSH)
- [ ] At least one image uploaded in Directus (for project thumbnails)
- [ ] Schema + permissions applied (`npm run directus:bootstrap`)
- [ ] Public read permissions verified (`npm run directus:permissions`)
