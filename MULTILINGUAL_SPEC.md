# Multilingual Portfolio Spec (Corrected for Current Repo)

## Goal
Implement English and German support with:
- Directus built-in translations for content
- Route-based language URLs in Next.js (`/en/*`, `/de/*`)
- Code-based dictionary for static UI strings
- Fallback behavior when a German translation is missing

## Current Reality (Important)
This repo does **not** store project content blocks as JSON.

Blocks are modeled as M2A/O2M relational collections:
- `projects.blocks` points to `projects_blocks`
- `projects_blocks` maps to block tables like:
  - `project_blocks_text`
  - `project_blocks_image`
  - `project_blocks_gallery`
  - `project_blocks_video`
  - `project_blocks_cad`
  - `project_blocks_code`
  - `project_blocks_specs`
  - `project_blocks_callout`
  - `project_blocks_layout` (+ nested left/right relations)

So translation setup must target real collections/fields, not a JSON blob strategy.

---

## Part 1: Directus Configuration

### 1.1 Enable Languages in Directus
In Directus Settings -> Project Settings -> Languages:
- Add `en-US` (default)
- Add `de-DE`

### 1.2 Enable Translations on Top-Level Collections

#### Projects (`projects`)
Translate:
- `title`
- `short_summary`
- `context` (optional: only if you want localized labels)
- `duration` (optional)

Do not translate:
- `slug` (keep stable)
- `status`
- `start_date`, `end_date`
- `thumbnail`
- `domains` (unless you intentionally localize these values)
- `tags` relation IDs
- `github_repo`, `external_links`

#### Blog Posts (`blog_posts`)
Translate:
- `title`
- `summary`
- `body`

Do not translate:
- `slug`
- `published_date`
- `is_draft`
- relation IDs (`tags`, `linked_projects`)

#### Profile (`profile`, singleton)
Translate:
- `bio`
- `availability_status`
- any descriptive text you want per language

Usually keep as-is:
- `contact_email`, `github_url`, `linkedin_url`
- `current_location`, `next_location` (team decision)
- `skills`, `languages` arrays (team decision)

### 1.3 Enable Translations on Block Collections (Critical)
Enable translations on textual fields in each block table:

- `project_blocks_text.content`
- `project_blocks_image.caption`
- `project_blocks_gallery.caption`
- `project_blocks_video.caption`
- `project_blocks_cad.description`
- `project_blocks_code.description`
- `project_blocks_specs.title`
- `project_blocks_callout.content`

Notes:
- `project_blocks_specs.rows` is JSON. Directus field-level translations are not ideal for partially translating JSON internals. Use one of:
  1. Keep rows language-neutral, only translate `title`.
  2. Split specs rows into relational rows in future if per-row translation is required.
- For `project_blocks_layout`, nested left/right blocks are relations to the same block tables above. Translate the child block text fields there.

### 1.4 Snapshot and Backups
After schema updates in Directus UI:
1. Export snapshot (`npm run directus:snapshot`)
2. Commit `directus-schema.snapshot.yaml`
3. Keep a DB backup before broad content migration

---

## Part 2: Next.js Routing and Locale Strategy

### 2.1 URL Structure
Adopt route groups under language segment:
- `/en/...`
- `/de/...`

Recommended structure:

```text
app/
  [lang]/
    layout.tsx
    page.tsx
    about/page.tsx
    now/page.tsx
    blog/page.tsx
    blog/[slug]/page.tsx
    projects/page.tsx
    projects/[slug]/page.tsx
  globals.css
  not-found.tsx
  sitemap.ts
middleware.ts
```

### 2.2 Middleware
Add `middleware.ts` to redirect non-localized paths to language paths.
Priority:
1. `NEXT_LOCALE` cookie
2. `Accept-Language` header
3. fallback `en`

Exclude:
- `_next/static`
- `_next/image`
- `api`
- `favicon.ico`
- `robots.txt`
- `sitemap.xml`

### 2.3 Route Param Validation
Create locale helpers:
- `isValidLocale(lang)`
- `toDirectusLanguageCode(lang)` mapping:
  - `en` -> `en-US`
  - `de` -> `de-DE`

If invalid locale in `[lang]`, call `notFound()`.

---

## Part 3: Directus Data Access Changes

## 3.1 Keep Existing Access Patterns
Current repo conventions to preserve:
- Use authenticated `getCmsClient()` in `lib/directus.ts`
- Keep `getProfile()` as singleton read pattern
- Keep current M2A block field expansion list

### 3.2 Add Language-Aware Read Functions
Extend signatures with locale, for example:
- `getProjects(filters?, lang?)`
- `getProjectBySlug(slug, lang?)`
- `getBlogPosts(limit?, lang?)`
- `getBlogPostBySlug(slug, lang?)`
- `getProfile(lang?)`

When querying Directus, include translations relation for requested locale and fallback source fields.

### 3.3 Translation Merge Helper
Add helper to merge translation payload into base item:
- Prefer requested language value
- Fallback to base field value
- Leave non-translatable fields untouched

Apply this after fetch and before Zod parse, or adapt schemas to include translation shape if you parse pre-merge.

### 3.4 Search and Filter Behavior
Current project filtering is application-side (`lib/project-filters.ts`).
Ensure search checks translated text in the active locale.

Do not assume Directus `search` on base fields is enough for translated fields.

---

## Part 4: UI Text Translation

Create a code dictionary for static UI copy (nav, buttons, labels, empty states).
Suggested file:
- `lib/ui-translations.ts`

Keep translated domains/status labels in UI dictionary while preserving canonical stored values in content.

Example:
- stored status: `ongoing`
- UI label in `de`: `Laufend`

---

## Part 5: Component and Page Impacts

### 5.1 Header and Footer
- Header links must be locale-aware (`/${lang}/projects` etc.)
- Add language switcher that preserves current path
- Footer static copy should use dictionary

### 5.2 Cards and Links
Components with hardcoded non-localized paths must be updated:
- project cards
- blog cards
- detail back-links
- related links

All links should include active locale segment.

### 5.3 Metadata and SEO
In localized layouts/pages:
- set `<html lang>` dynamically from route locale
- provide language alternates (`hreflang`) via Next metadata
- keep canonical per locale route

---

## Part 6: Rendering Strategy

Current repo uses `dynamic = 'force-dynamic'` on several pages.
That is fine for multilingual rollout.

Do not claim full static generation unless you intentionally remove dynamic mode and verify all data paths support static rendering.

---

## Part 7: Implementation Sequence (Recommended)

1. Enable Directus languages and translation fields (top-level + block tables).
2. Add middleware and locale helpers.
3. Introduce `[lang]` route segment and update layout/header/footer links.
4. Add locale-aware Directus fetch + merge helpers.
5. Update pages/components to pass locale through data and links.
6. Add UI dictionary and replace hardcoded strings.
7. Add SEO alternates and dynamic `<html lang>`.
8. Snapshot schema and test content fallback.

---

## Part 8: Testing Checklist

- `/en` and `/de` both render for home/projects/blog/about/now
- Switching language keeps user on same logical page
- Cookie locale persistence works
- Middleware redirects `/` and non-locale paths correctly
- Project/blog/profile translated fields display in active locale
- Block text fields translate (text/caption/description/title/callout)
- Missing `de-DE` content falls back to English
- Filters/search operate on active locale text
- All internal links preserve locale segment
- Metadata includes alternate language URLs

---

## Notes on Scope

What should remain language-neutral by default:
- slugs
- IDs
- dates
- asset/file IDs
- external URLs

What is safe and useful to localize:
- headings
- summaries
- body text
- captions and descriptive block text
- UI labels and empty states
