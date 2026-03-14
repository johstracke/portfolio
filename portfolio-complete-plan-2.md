# Portfolio Website - Complete Plan

## Project Overview

Building a portfolio website for an 18-year-old aspiring mechatronics engineer that showcases interdisciplinary work across hardware, software, and sustainable systems (agritech, permaculture, automation).

**Tech Stack:**
- Frontend: Next.js 15+ with App Router (React Server Components)
- Language: TypeScript with Zod validation
- CMS: Directus (flexible, self-hostable)
- Style: Neobrutalist (bold, colorful, structured)

**Core Philosophy:** 
Structured content, flexible presentation. The schema captures what exists, but stays agnostic about how it's displayed.

---

## Site Structure

```
/
├── Home (landing page)
├── /projects
│   ├── Index (searchable/filterable grid)
│   └── /[slug] (individual project pages)
├── /blog  
│   ├── Index (chronological feed)
│   └── /[slug] (individual blog posts)
├── /about (personal story, context, capabilities)
├── /now (current status, availability, what you're working on)
└── /contact (or integrated into about/now)
```

---

## Data Schema

### 1. Projects

**Required Fields:**
- `title` (string) - Project name
- `slug` (string) - URL-friendly identifier
- `thumbnail` (image reference) - Main project image
- `start_date` (date) - When project started
- `status` (enum) - "completed" | "ongoing" | "paused"
- `short_summary` (text) - 1-2 sentence overview

**Optional Fields:**
- `end_date` (date) - When project completed
- `context` (enum) - "Personal" | "NGO" | "Academic" | "Commercial" | "Collaboration"
- `domains` (array) - ["hardware", "software", "agritech", "automation", etc.]
- `tags` (flexible array) - User-defined, emergent categories
- `collaborators` (array) - Names/links of people involved
- `duration` (string) - "3 months" or computed from dates
- `tools_used` (array) - Specific tools, software, hardware used
- `github_repo` (URL) - Link to code repository
- `external_links` (array of URLs) - Related resources

**Content:**
- `content_blocks` (ordered array) - See Content Blocks section below

### 2. Blog Posts

**Required Fields:**
- `title` (string) - Post title
- `slug` (string) - URL-friendly identifier
- `published_date` (date) - When published
- `summary` (text) - 1-2 sentence overview

**Optional Fields:**
- `tags` (flexible array) - Same system as projects
- `linked_projects` (array) - References to related projects
- `is_draft` (boolean) - Hide from public view
- `last_updated` (date) - Track updates

**Content:**
- `body` (markdown/rich text) - Post content
- OR `content_blocks` (array) - Same flexibility as projects

### 3. Media Assets (Central Library)

**Fields:**
- `file` (uploaded asset) - The actual file
- `type` (enum) - "image" | "video" | "cad" | "code" | "document"
- `caption` (text) - Description
- `alt_text` (text) - For accessibility
- `filename` (string) - Original filename
- `uploaded_date` (date) - When uploaded

**Usage:**
- Centrally managed in Directus
- Referenced by ID in content blocks
- Reusable across projects and blog posts

### 4. User Profile/Metadata

**Fields:**
- `current_location` (string) - e.g., "Graz, Austria"
- `next_location` (string) - e.g., "Linz"
- `location_change_date` (date) - When moving
- `availability_status` (text) - Current work availability
- `bio` (text) - Personal description
- `skills` (array) - List of capabilities
- `languages` (array) - e.g., ["German", "English"]
- `contact_email` (string)
- `github_url` (string)
- `linkedin_url` (string, optional)

---

## Content Blocks System

**Philosophy:** Each project is metadata + an ordered array of flexible content blocks. This allows completely different presentations while maintaining a consistent data structure.

### Block Types

#### 1. Text Block
```
type: "text"
content: (markdown/rich text)
```
Use for: Descriptions, explanations, narratives

#### 2. Image Block
```
type: "image"
image_id: (reference to media asset)
caption: (optional text)
size: "small" | "medium" | "large" | "full-width"
```
Use for: Single photos, diagrams, screenshots

#### 3. Gallery Block
```
type: "gallery"
images: (array of media asset references)
layout: "grid" | "carousel" | "masonry"
caption: (optional text)
```
Use for: Multiple related images, photo series, process documentation

#### 4. Video Block
```
type: "video"
video_id: (reference to media asset OR external URL)
caption: (optional text)
autoplay: (boolean)
```
Use for: Demos, tutorials, time-lapses

#### 5. CAD Viewer Block
```
type: "cad"
file_id: (reference to CAD file)
viewer_type: "embed" | "download_link" | "preview_image"
description: (optional text)
```
Use for: 3D models, technical drawings

#### 6. Code Snippet Block
```
type: "code"
code: (text)
language: (string for syntax highlighting)
filename: (optional)
description: (optional text)
```
Use for: Small code examples, configuration snippets

#### 7. Specs Table Block
```
type: "specs"
rows: (array of {key: string, value: string})
title: (optional)
```
Use for: Technical specifications, bill of materials, parameters

#### 8. Callout Block
```
type: "callout"
content: (text)
callout_type: "info" | "warning" | "success" | "tip"
```
Use for: Important notes, lessons learned, tips

### Why This Works

**Example 1: CubeSat Project**
```
- Hero image (Image Block)
- Overview text (Text Block)
- Technical specs (Specs Table Block)
- Process photos (Gallery Block)
- CAD model (CAD Viewer Block)
- Lessons learned (Callout Block)
```

**Example 2: CNC Mill Build**
```
- Text introduction (Text Block)
- Build video (Video Block)
- Progress photos (Gallery Block)
- Text explanation (Text Block)
- Final result (Image Block)
```

**Same schema, completely different presentations.**

---

## Data Relationships

### Project ↔ Blog Posts (Many-to-Many)
- Projects can have multiple related blog posts
- Blog posts can reference multiple projects
- Shown as "Related Posts" on project pages
- Shown as "Linked Projects" on blog posts

### Project → Media (One-to-Many via blocks)
- Projects reference media through content blocks
- Media assets stored centrally
- Same asset can be used in multiple projects

### Project → Tags (Many-to-Many)
- Flexible, user-defined tagging
- No preset categories
- Tags emerge organically from content

### Blog → Tags (Many-to-Many)
- Same flexible system as projects
- Allows filtering blog by topic

### Profile → Pages (One-to-Many)
- Profile data populates Home, About, Now pages
- Single source of truth for personal info

---

## Page Designs

### Homepage

**Purpose:** Answer "Who are you? What can you do? Why should I care?" in 10 seconds.

**Sections:**

1. **Hero Section**
   - Name
   - Brief intro (1-2 sentences)
     - "18, building things at the intersection of hardware, software, and sustainable systems"
   - Current status
     - "Currently: Graz → Linz (JKU Mechatronics, Fall 2026)"
     - "Working on: [NGO automation project], [current learning]"
   - Availability
     - "Available for: Remote work, local projects (Graz/Linz), collaborations"

2. **What I Do** (Capabilities Showcase)
   - Three categories with brief descriptions:
     - **Hardware:** PCB design, CAD/CAM, CNC machining, embedded systems
     - **Software:** Full-stack web (TypeScript/JS), automation, data migration
     - **Systems:** Low-budget/high-constraint problem solving, integration work
   - Each with representative project image

3. **Featured Projects** (3-4 projects)
   - Manually selected or auto-selected (recent + pinned)
   - Display: thumbnail, title, short summary, domains/tags
   - Diverse selection showing range

4. **Recent Activity**
   - Latest blog post OR
   - Recently updated project OR
   - Mix of both (small feed)

5. **Contact/Availability**
   - Email, GitHub, other links
   - Current availability status
   - "Interested in: [agritech, sustainable automation, mechatronics opportunities, interesting problems]"

### Projects Index (`/projects`)

**Purpose:** Browsable, searchable archive of all work.

**Layout:** Grid of project cards

**Each Card Shows:**
- Thumbnail image
- Title
- Short summary (1 sentence)
- Tags/domains (as colored badges)
- Date
- Status badge (if ongoing/paused)

**Features:**

**Search Bar:**
- Real-time text search
- Searches title + summary fields

**Filters (Sidebar or Dropdown):**
- By domain: All | Hardware | Software | Agritech | Automation | Other
- By tag: Dynamic list of all tags used
- By status: All | Completed | Ongoing | Paused
- By context: All | Personal | NGO | Academic | Commercial
- By year: All | 2026 | 2025 | 2024 | etc.

**Sorting:**
- Newest first (default)
- Oldest first
- Alphabetical (A-Z)
- Last updated

**Interaction:**
- Click card → navigate to project detail page
- Filters update URL (shareable filtered views)
- Results count shown: "Showing 12 projects"

### Individual Project Page (`/projects/[slug]`)

**Purpose:** Deep dive into a specific project with flexible content presentation.

**Structure:**

1. **Hero Section**
   - Large title
   - Hero image/thumbnail
   - Metadata bar:
     - Date range
     - Status badge
     - Context badge
     - Domain badges
   - Tags (clickable → filter projects by tag)

2. **Content Area**
   - Dynamic rendering of content blocks
   - Each block type has corresponding component
   - Blocks flow naturally in reading order
   - Neobrutalist styling consistent across blocks

3. **Metadata Sidebar** (or section at bottom)
   - **Tools Used:** List of technologies/hardware
   - **Collaborators:** Names/links (if any)
   - **Duration:** Time spent
   - **Links:**
     - GitHub repository
     - External resources
     - Related documentation

4. **Related Blog Posts**
   - "Posts about this project"
   - Cards showing: title, date, summary
   - Links to blog posts

5. **Navigation**
   - Breadcrumb: Home > Projects > [Project Title]
   - Previous/Next project links
   - "Back to Projects" button

### Blog Index (`/blog`)

**Purpose:** Chronological feed of thoughts, updates, and learning.

**Layout:** List/card view

**Each Card Shows:**
- Title
- Published date
- Summary (1-2 sentences)
- Linked projects (as small badges/chips)
- Tags
- "Read more" link

**Features:**

**Optional Filters:**
- By linked project (dropdown)
- By tag
- By date range

**Sorting:**
- Newest first (default)
- Oldest first

**Interaction:**
- Click card → navigate to blog post
- Click project badge → filter by that project
- Click tag → filter by that tag

### Individual Blog Post (`/blog/[slug]`)

**Purpose:** Share thoughts, updates, lessons learned.

**Structure:**

1. **Header**
   - Title
   - Published date
   - Last updated (if different from published)
   - Tags (clickable)

2. **Content**
   - Markdown/rich text body
   - OR content blocks (same flexibility as projects)
   - Images embedded naturally
   - Code snippets with syntax highlighting

3. **Linked Projects Section**
   - "Related Projects"
   - Cards showing linked projects
   - Brief description of relevance

4. **Navigation**
   - Breadcrumb: Home > Blog > [Post Title]
   - Previous/Next post links
   - "Back to Blog" button

### About Page

**Purpose:** Tell the full story and establish credibility.

**Structure:**

1. **Personal Story**
   - Who you are beyond the resume
   - Why you do this work
   - Journey so far (brief narrative)
   - Core interests and what drives you
   - The interdisciplinary angle as a feature:
     - "I see mechatronics + agritech + permaculture as connected: sustainable tech needs hardware + software + domain knowledge"

2. **Capabilities**
   - **Hardware Skills:**
     - PCB design, CAD/CAM, CNC machining
     - Embedded systems, sensor integration
     - Prototyping and fabrication
   - **Software Skills:**
     - Full-stack web development (TypeScript, React, Next.js)
     - Automation scripting
     - Database design, API integration
   - **Systems Thinking:**
     - Constraint-based design
     - Integration across domains
     - Practical problem solving

3. **Tools & Technologies**
   - Software: [list]
   - Hardware: [list]
   - Platforms: [list]
   - Languages: German, English

4. **What I'm Looking For**
   - Types of opportunities:
     - Part-time/remote work during studies
     - Summer projects
     - Collaborations on interesting problems
   - Interests:
     - Agricultural tech and appropriate technology
     - Sustainable automation
     - Mechatronics challenges
     - Building useful things with constraints

5. **Contact**
   - Email (primary)
   - GitHub
   - LinkedIn (optional)
   - "Feel free to reach out about opportunities, collaborations, or just to chat"

### Now Page (`/now`)

**Purpose:** Show current status and availability (updated monthly).

**Content:**
- **What I'm Working On:**
  - Current projects
  - Learning focus
  - Recent accomplishments

- **Where I Am:**
  - Current location: "Graz, Austria"
  - Next location: "Linz (JKU Mechatronics, starting Oct 2026)"
  - Timeline

- **Availability:**
  - Current: "Interning 34hr/week until July 2026"
  - Summer: "Available for projects Aug-Sept 2026"
  - Fall: "Part-time/remote during university"

- **Looking For:**
  - Types of work interested in
  - Types of work NOT interested in (if relevant)
  - Collaboration opportunities

- **What I'm Learning:**
  - Current technical focus
  - Books/resources exploring
  - New skills developing

- **Last Updated:** [Date]

---

## Key Features

### Search & Filter System

**Server-Side Implementation (Recommended):**

All filtering happens server-side using Next.js searchParams and Directus query parameters. This provides:
- SEO-friendly filtered pages
- Shareable filter URLs
- No client-side JavaScript required for basic filtering
- Scales automatically with content growth

**Projects Page Implementation:**
```typescript
// app/projects/page.tsx
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { 
    domain?: string
    tag?: string
    status?: string
    context?: string
    year?: string
    search?: string
    sort?: string
  }
}) {
  // Server-side data fetching with filters applied
  const projects = await getProjects(searchParams)
  
  return (
    <div className="projects-container">
      <FilterSidebar 
        currentFilters={searchParams}
      />
      <ProjectsGrid projects={projects} />
    </div>
  )
}
```

**Filter Sidebar (Client Component):**
```typescript
// components/filters/FilterSidebar.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function FilterSidebar({ currentFilters }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/projects?${params.toString()}`)
  }
  
  return (
    <aside className="filter-sidebar">
      {/* Search */}
      <input 
        type="search"
        placeholder="Search projects..."
        onChange={(e) => updateFilter('search', e.target.value)}
        defaultValue={currentFilters.search}
      />
      
      {/* Domain filter */}
      <select onChange={(e) => updateFilter('domain', e.target.value)}>
        <option value="">All Domains</option>
        <option value="hardware">Hardware</option>
        <option value="software">Software</option>
        <option value="agritech">Agritech</option>
        <option value="automation">Automation</option>
      </select>
      
      {/* Tag filter */}
      <TagFilter onSelect={(tag) => updateFilter('tag', tag)} />
      
      {/* Status filter */}
      <select onChange={(e) => updateFilter('status', e.target.value)}>
        <option value="">All Status</option>
        <option value="completed">Completed</option>
        <option value="ongoing">Ongoing</option>
        <option value="paused">Paused</option>
      </select>
      
      {/* Clear filters */}
      <button onClick={() => router.push('/projects')}>
        Clear All Filters
      </button>
    </aside>
  )
}
```

**Directus Query Builder:**
```typescript
// lib/directus.ts
export const getProjects = async (filters?: {
  domain?: string
  tag?: string
  status?: string
  search?: string
  sort?: string
}) => {
  const query: any = {
    sort: filters?.sort || '-start_date',
    limit: -1,
  }
  
  // Build filter object
  const filterObj: any = {}
  
  if (filters?.domain) {
    filterObj.domains = { _contains: filters.domain }
  }
  
  if (filters?.tag) {
    filterObj.tags = { _contains: filters.tag }
  }
  
  if (filters?.status) {
    filterObj.status = { _eq: filters.status }
  }
  
  if (filters?.search) {
    filterObj._or = [
      { title: { _contains: filters.search } },
      { short_summary: { _contains: filters.search } },
    ]
  }
  
  if (Object.keys(filterObj).length > 0) {
    query.filter = filterObj
  }
  
  return directus.request(readItems('projects', query))
}
```

**Benefits:**
- URLs like `/projects?domain=hardware&tag=robotics&status=completed` are shareable
- Search engines can index filtered views
- Works without JavaScript (progressive enhancement)
- No loading spinners for filter changes (instant server response)
- Scales to thousands of projects

### Cross-Linking System

**Project → Blog:**
- Project pages show "Related Posts" section
- Automatically populated from linked_projects field
- Shows post title, date, summary
- "Read more" links to full post

**Blog → Project:**
- Blog posts show "Linked Projects" section
- Can reference multiple projects
- Shows project cards with thumbnails
- Links back to project pages

**Tag System:**
- Shared tags across projects and blog
- Clicking tag shows all content with that tag
- Tag cloud/list on relevant pages
- Emergent organization (tags added as needed)

**Benefits:**
- Discover related content naturally
- Shows project depth (project + multiple blog posts)
- Creates narrative threads
- SEO benefits from internal linking

### Media Management

**Central Library Approach:**
- All media uploaded to Directus once
- Assets stored with metadata (caption, alt text, type)
- Referenced by ID in content blocks
- Same asset can be used multiple times
- Easy to update/replace assets
- Organized by type/date/project

**Supported Types:**
- Images: JPG, PNG, WebP, GIF
- Videos: MP4, WebM, or external embeds (YouTube, Vimeo)
- CAD files: STEP, STL, or links to viewers
- Code files: Any text format
- Documents: PDFs

**Benefits:**
- Single source of truth for media
- Easy batch operations (compress, convert, etc.)
- Reusability across projects
- Clean file organization

### Responsive Design

**Mobile First:**
- Navigation collapses to hamburger menu
- Project cards stack vertically
- Content blocks adapt to small screens
- Touch-friendly filter UI
- Images scale appropriately

**Desktop:**
- Wide layouts for content
- Sidebar filters
- Multi-column grids
- Hover states and transitions

**Accessibility:**
- Alt text on all images
- Semantic HTML
- Keyboard navigation
- Color contrast compliance
- Screen reader friendly

---

## Technical Implementation

### Frontend Architecture

**App Directory Structure (Next.js 15+ App Router):**
```
app/
├── page.tsx (Home - server component)
├── layout.tsx (Root layout with global nav/footer)
├── loading.tsx (Global loading state)
├── error.tsx (Global error boundary)
├── projects/
│   ├── page.tsx (Projects Index - server component with searchParams)
│   ├── loading.tsx (Projects loading state)
│   └── [slug]/
│       ├── page.tsx (Project Detail - server component)
│       └── loading.tsx (Project loading state)
├── blog/
│   ├── page.tsx (Blog Index - server component)
│   └── [slug]/
│       └── page.tsx (Blog Post - server component)
├── about/
│   └── page.tsx (About page)
├── now/
│   └── page.tsx (Now page)
└── api/ (API routes if needed)
```

**Library & Components:**
```
app/
├── components/ (client components - marked with 'use client')
│   ├── blocks/
│   │   ├── TextBlock.tsx
│   │   ├── ImageBlock.tsx
│   │   ├── GalleryBlock.tsx
│   │   ├── VideoBlock.tsx
│   │   ├── CADBlock.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── SpecsBlock.tsx
│   │   └── CalloutBlock.tsx
│   ├── cards/
│   │   ├── ProjectCard.tsx
│   │   └── BlogCard.tsx
│   ├── filters/
│   │   ├── SearchBar.tsx (client component for interactivity)
│   │   ├── FilterSidebar.tsx
│   │   └── TagFilter.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── shared/
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── ... (other reusable components)
└── lib/
    ├── directus.ts (Directus API client)
    ├── schemas.ts (Zod validation schemas)
    └── types.ts (TypeScript types)
```

**Rendering Logic (Server Component with Validation):**
```typescript
// app/projects/[slug]/page.tsx - Server Component
import { getProject } from '@/lib/directus'
import { ContentBlockSchema } from '@/lib/schemas'
import { TextBlock, ImageBlock, GalleryBlock } from '@/components/blocks'

export default async function ProjectDetail({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const project = await getProject(params.slug)
  
  // Validate blocks before rendering
  const validatedBlocks = project.content_blocks
    .map(block => ContentBlockSchema.safeParse(block))
    .filter(result => result.success)
    .map(result => result.data)
  
  return (
    <div>
      {validatedBlocks.map((block, index) => {
        switch (block.type) {
          case 'text':
            return <TextBlock key={index} {...block} />
          case 'image':
            return <ImageBlock key={index} {...block} />
          case 'gallery':
            return <GalleryBlock key={index} {...block} />
          // ... other block types
          default:
            return null
        }
      })}
    </div>
  )
}
```

**Server-Side Filtering (Projects Index):**
```typescript
// app/projects/page.tsx - Server Component with searchParams
import { getProjects } from '@/lib/directus'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { FilterSidebar } from '@/components/filters/FilterSidebar'

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { 
    domain?: string
    tag?: string
    status?: string
    search?: string
  }
}) {
  // Server-side data fetching with filters
  const projects = await getProjects(searchParams)
  
  return (
    <div>
      <FilterSidebar /> {/* Client component for interactivity */}
      <div className="grid">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
```

### Backend/CMS (Directus)

**Collections Setup:**
- `projects` - Main project collection
- `blog_posts` - Blog content
- `media_library` - Central media storage
- `content_blocks` - Block components (see implementation options below)
- `profile` - User/site metadata
- `tags` - Optional: dedicated tags table with metadata

**Content Blocks Implementation Options:**

*Option 1: Simple O2M Array (Recommended for Start)*

A straightforward One-to-Many relationship where `content_blocks` is a collection with:
- `project_id` (M2O relation to projects)
- `type` (dropdown: text, image, gallery, etc.)
- `sort` (number for ordering)
- Type-specific data in JSON field or separate columns

**Benefits:**
- Simpler schema, easier to understand initially
- Works better with AI coding tools (Cursor, etc.)
- Clear data structure
- Direct mapping to frontend components

*Option 2: Directus Blocks Pattern (Future Upgrade)*

Directus has a built-in Blocks interface providing:
- Visual drag-and-drop block editor UI
- Better content editing experience
- Built-in ordering and type management

**When to upgrade:** After you have a working site and understand the data flow, especially if adding more content editors or wanting enhanced UX.

**Recommendation:** Start with Option 1 for Phase 1-2. The schemas are similar enough that migrating to Option 2 later is straightforward when you want the better editing UI.

**API Integration:**
```typescript
// lib/directus.ts
import { createDirectus, rest } from '@directus/sdk'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())

export const getProjects = async (filters?: {
  domain?: string
  tag?: string
  status?: string
  search?: string
}) => {
  const query: any = {
    sort: '-start_date',
    limit: -1,
  }
  
  if (filters?.domain) {
    query.filter = { domains: { _contains: filters.domain } }
  }
  if (filters?.tag) {
    query.filter = { ...query.filter, tags: { _contains: filters.tag } }
  }
  if (filters?.status) {
    query.filter = { ...query.filter, status: { _eq: filters.status } }
  }
  if (filters?.search) {
    query.search = filters.search
  }
  
  return directus.request(readItems('projects', query))
}

export const getProject = async (slug: string) => {
  return directus.request(
    readItems('projects', {
      filter: { slug: { _eq: slug } },
      limit: 1,
    })
  ).then(items => items[0])
}
```

**Relationships in Directus:**
- Many-to-Many (M2M): projects ↔ blog_posts
- Many-to-Many (M2M): projects ↔ tags
- Many-to-Many (M2M): blog_posts ↔ tags
- One-to-Many (O2M): projects → content_blocks
- Many-to-One (M2O): content_blocks → media_library

### Directus Schema Management

**Phase 1: Manual Setup + Export**

For initial development, create schema manually in Directus admin UI, then export for version control:

1. **Create Collections Manually:**
   - Navigate to Settings → Data Model
   - Create collections: projects, blog_posts, content_blocks, media_library, profile, tags
   - Add fields as defined in schema above
   - Configure relationships

2. **Export Schema:**
```bash
# Using Directus CLI
npx directus schema snapshot ./directus-schema.json

# Or via API
curl -X GET "http://localhost:8055/schema/snapshot" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o directus-schema.json
```

3. **Version Control:**
```bash
git add directus-schema.json
git commit -m "chore: add directus schema snapshot"
```

4. **Apply to Fresh Instance:**
```bash
# Import schema to new Directus instance
npx directus schema apply ./directus-schema.json

# Or via API
curl -X POST "http://localhost:8055/schema/apply" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @directus-schema.json
```

**Benefits:**
- Visual feedback while designing
- Export once, apply anywhere
- Easy to understand and modify
- Version controlled

**Phase 2/3: Schema-as-Code (Optional)**

For more advanced setup, define schema programmatically:

```typescript
// scripts/create-directus-schema.ts
import { createDirectus, rest, createCollection, createField } from '@directus/sdk'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())

async function createSchema() {
  // Create projects collection
  await directus.request(
    createCollection({
      collection: 'projects',
      meta: {
        icon: 'folder',
        display_template: '{{title}}',
      },
      schema: {
        name: 'projects',
      },
    })
  )

  // Add fields to projects
  await directus.request(
    createField('projects', {
      field: 'title',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 255,
      },
    })
  )

  await directus.request(
    createField('projects', {
      field: 'slug',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
        unique: true,
      },
      schema: {
        max_length: 255,
      },
    })
  )

  // ... add remaining fields

  console.log('Schema created successfully')
}

createSchema().catch(console.error)
```

**Run Schema Creation:**
```bash
# Add to package.json scripts
"scripts": {
  "directus:setup": "tsx scripts/create-directus-schema.ts"
}

# Run
npm run directus:setup
```

**Phase 3: Directus Migrations (Advanced)**

Use Directus's built-in migration system for production:

```typescript
// extensions/migrations/001-create-projects.ts
export default {
  async up(knex) {
    await knex.schema.createTable('projects', (table) => {
      table.uuid('id').primary()
      table.string('title', 255).notNullable()
      table.string('slug', 255).notNullable().unique()
      table.text('short_summary')
      table.timestamp('start_date')
      table.timestamp('end_date')
      table.string('status', 50).defaultTo('ongoing')
      table.json('domains')
      table.json('tags')
      table.timestamps(true, true)
    })
  },
  
  async down(knex) {
    await knex.schema.dropTable('projects')
  },
}
```

**Recommended Approach:**

1. **Start (Phase 1):** Manual UI setup → export schema → commit JSON
2. **Iterate:** Update schema in UI → re-export → commit
3. **Production:** Apply schema from JSON to fresh instances
4. **Later (Phase 3):** Convert to migrations if you need more control

**Schema Files Structure:**
```
directus/
├── schema.json              # Full schema snapshot
├── migrations/              # Optional: migration files
│   ├── 001-create-projects.ts
│   ├── 002-create-blog.ts
│   └── 003-create-blocks.ts
└── extensions/              # Optional: custom extensions
```

**Important Notes:**
- Always backup before applying schema changes
- Test schema imports on local instance first
- Schema snapshots include field settings, not data
- Use Directus version same as production when exporting/importing

### TypeScript & Zod Validation

**Schema Definitions:**
```typescript
// lib/schemas.ts
import { z } from 'zod'

// Block schemas
export const TextBlockSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
})

export const ImageBlockSchema = z.object({
  type: z.literal('image'),
  image_id: z.string(),
  caption: z.string().optional(),
  size: z.enum(['small', 'medium', 'large', 'full-width']).default('medium'),
})

export const GalleryBlockSchema = z.object({
  type: z.literal('gallery'),
  images: z.array(z.string()),
  layout: z.enum(['grid', 'carousel', 'masonry']).default('grid'),
  caption: z.string().optional(),
})

export const VideoBlockSchema = z.object({
  type: z.literal('video'),
  video_id: z.string(),
  caption: z.string().optional(),
  autoplay: z.boolean().default(false),
})

export const CADBlockSchema = z.object({
  type: z.literal('cad'),
  file_id: z.string(),
  viewer_type: z.enum(['embed', 'download_link', 'preview_image']).default('preview_image'),
  description: z.string().optional(),
})

export const CodeBlockSchema = z.object({
  type: z.literal('code'),
  code: z.string(),
  language: z.string(),
  filename: z.string().optional(),
  description: z.string().optional(),
})

export const SpecsBlockSchema = z.object({
  type: z.literal('specs'),
  rows: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })),
  title: z.string().optional(),
})

export const CalloutBlockSchema = z.object({
  type: z.literal('callout'),
  content: z.string(),
  callout_type: z.enum(['info', 'warning', 'success', 'tip']).default('info'),
})

// Union of all block types with discriminated union
export const ContentBlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  ImageBlockSchema,
  GalleryBlockSchema,
  VideoBlockSchema,
  CADBlockSchema,
  CodeBlockSchema,
  SpecsBlockSchema,
  CalloutBlockSchema,
])

export type ContentBlock = z.infer<typeof ContentBlockSchema>

// Project schema
export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  thumbnail: z.string(),
  start_date: z.string(),
  end_date: z.string().optional(),
  status: z.enum(['completed', 'ongoing', 'paused']),
  short_summary: z.string(),
  context: z.enum(['Personal', 'NGO', 'Academic', 'Commercial', 'Collaboration']).optional(),
  domains: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  content_blocks: z.array(ContentBlockSchema),
  // ... other fields
})

export type Project = z.infer<typeof ProjectSchema>
```

**Usage in Components:**
```typescript
// Validate before rendering
const validatedBlocks = project.content_blocks
  .map(block => ContentBlockSchema.safeParse(block))
  .filter(result => {
    if (!result.success) {
      console.error('Invalid block:', result.error)
      return false
    }
    return true
  })
  .map(result => result.data)
```

**Benefits:**
- Prevents runtime errors from malformed data
- Auto-completion in your editor
- Type-safe component props
- Catches schema mismatches early
- Self-documenting code

### Styling (Neobrutalism)

**Design Principles:**
- Bold, thick borders (3-5px)
- High contrast colors
- Strong shadows
- Playful, imperfect alignment
- Chunky typography
- Bright color palette

**Example Styling:**
```css
/* Project card */
.project-card {
  border: 4px solid black;
  box-shadow: 8px 8px 0 black;
  background: var(--color-accent);
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 12px 12px 0 black;
}

/* Content block */
.content-block {
  border: 3px solid black;
  padding: 2rem;
  margin-bottom: 2rem;
  background: white;
}

/* Button */
.button {
  border: 3px solid black;
  padding: 1rem 2rem;
  font-weight: bold;
  text-transform: uppercase;
  box-shadow: 4px 4px 0 black;
  background: var(--color-primary);
  cursor: pointer;
}
```

**Color Palette Example:**
- Primary: Bright blue (#4ECDC4)
- Secondary: Warm yellow (#FFD93D)
- Accent: Coral red (#FF6B6B)
- Background: Off-white (#F8F9FA)
- Text: Deep black (#1A1A1A)
- Success: Bright green (#95E1D3)

### Performance Optimization

**Images:**
- Next.js Image component for automatic optimization
- Lazy loading below fold
- WebP format with automatic fallbacks
- Responsive sizes with srcset
- Remote patterns configured for Directus

**Next.js Configuration:**
```javascript
// next.config.mjs
export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-directus-instance.com', // Replace with your Directus URL
        pathname: '/assets/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
}
```

**Image Component Usage:**
```typescript
import Image from 'next/image'

<Image
  src={`${DIRECTUS_URL}/assets/${block.image_id}`}
  alt={block.caption || ''}
  width={800}
  height={600}
  className="project-image"
/>
```

**Code Splitting:**
- Automatic route-based splitting with App Router
- Dynamic imports for heavy components
- React Server Components reduce client JS by default

**Data Fetching:**
- Server Components fetch data at build time or request time
- Streaming with Suspense boundaries
- Parallel data fetching where possible

**Caching:**
- Static generation for About, Now pages
- Revalidation for Projects and Blog (ISR)
- CDN for media assets
- Cache headers for API responses

**SEO:**
- Meta tags for all pages (generated in layout/page metadata)
- Open Graph for social sharing
- Structured data (JSON-LD)
- Sitemap generation
- Clean, semantic URLs

---

## Implementation Phases

### Phase 1: Core Foundation (Week 1-2)

**Goals:** Get the basic site working with essential features.

**Tasks:**
1. Set up project structure with Next.js 15+ App Router
   - Initialize with TypeScript
   - Configure `app/` directory structure
   - Set up `next.config.mjs` with Directus remote image patterns
2. Set up Directus instance
   - Deploy via Docker (see deployment section)
   - Create admin account
   - **Create schema manually in Directus UI:**
     - Collections: projects, blog_posts, media_library, content_blocks, profile, tags
     - Add all required fields per schema section
     - Configure relationships (M2M, O2M, M2O)
   - Export schema: `npx directus schema snapshot ./directus-schema.json`
   - Commit schema to repo
   - Use simple O2M blocks implementation (Option 1)
3. Create Zod schemas for validation
   - All content block types
   - Project and blog post schemas
   - Type definitions in `lib/schemas.ts`
   - **Important:** Zod schemas should match Directus schema exactly
4. Build Directus API client
   - Set up in `lib/directus.ts`
   - Implement basic fetch functions with filters
   - Test connection with sample data
5. Build frontend skeleton:
   - Home page (server component with basic layout)
   - Projects Index page (with server-side searchParams)
   - Project Detail page (with content blocks and validation)
   - Basic blog functionality
6. Implement 3-4 content block types:
   - Text, Image, Gallery, Code
   - Client components with proper validation
7. Style with neobrutalist theme
   - Set up color variables in tailwind.config.ts
   - Create base components (Button, Badge, etc.)
8. Deploy basic version
   - Docker compose setup on VPS OR Vercel deployment
   - Environment variables configured
   - Working on production URL

**Deliverables:**
- Working site with 1-2 sample projects
- Directus schema exported and committed
- Server-side filtering functional
- Type-safe rendering with Zod validation
- Basic navigation
- Responsive design
- Hosted and accessible

**Key Technical Points:**
- Use React Server Components by default
- Validate all data with Zod before rendering
- Server-side filtering from day 1
- Next.js Image with remote patterns configured
- Directus schema version controlled as JSON

### Phase 2: Enhanced Features (Week 3-4)

**Goals:** Add search, filtering, and cross-linking.

**Tasks:**
1. Implement search functionality:
   - Projects page search bar
   - Blog page search
2. Build filter system:
   - Domain filters
   - Tag filters
   - Status filters
   - Date filters
3. Add cross-linking:
   - Project ↔ Blog relationships in Directus
   - Related posts section on projects
   - Linked projects section on blog
4. Complete remaining block types:
   - Video, CAD, Specs, Callout
5. Build About page
6. Build Now page
7. Add real content:
   - Migrate existing projects
   - Write initial blog posts

**Deliverables:**
- Fully functional search and filter
- Cross-linked content
- About and Now pages complete
- At least 3-5 real projects live

### Phase 3: Polish & Optimization (Week 5-6)

**Goals:** Performance, SEO, and final touches.

**Tasks:**
1. Performance optimization:
   - Image optimization
   - Code splitting
   - Caching strategy
2. SEO implementation:
   - Meta tags
   - Open Graph
   - Structured data
   - Sitemap
3. Analytics setup (optional):
   - Privacy-friendly analytics
   - Track popular content
4. Final design polish:
   - Animations and transitions
   - Micro-interactions
   - Loading states
   - Error states
5. Content review:
   - Proofread all text
   - Optimize images
   - Test all links
6. Cross-browser testing
7. Mobile testing and fixes

**Deliverables:**
- Production-ready site
- Fast, optimized performance
- SEO-configured
- All content live and polished

### Phase 4: Future Enhancements (Ongoing)

**Possible Additions:**
- German language version
- Newsletter signup
- RSS feed for blog
- Project series/collections
- Advanced CAD viewer integration
- Interactive demos
- Download resume/CV
- Testimonials section
- Activity timeline
- GitHub integration (show recent commits)
- Webmentions for blog
- Dark mode toggle

---

## Content Strategy

### Initial Content Priorities

**Projects to Add First:**
1. CubeSat project (shows hardware + teamwork)
2. CNC mill build (shows fabrication skills)
3. NGO automation (shows real-world problem solving)
4. Any agritech-related work (shows interdisciplinary interest)

**Blog Posts to Write:**
- "Why I'm interested in agricultural automation"
- "Building [specific project]: What I learned"
- "Setting up Directus on a zero budget"
- "Permaculture principles applied to system design"
- "My journey from [X] to mechatronics"

### Ongoing Content Plan

**Projects:**
- Add new projects as completed (5-20/year)
- Update existing projects with new developments
- Document process through photos/videos
- Include failures and lessons learned

**Blog:**
- Project updates and milestones
- Technical tutorials and guides
- Reflections on learning
- Connections between different interests
- Industry observations (agritech, automation)
- Frequency: 1-2 posts per month (manageable)

**Now Page:**
- Update monthly
- Current projects and learning
- Availability changes
- New interests or directions

---

## Success Metrics

### Immediate Goals (First 3 Months)
- Site is live and functional
- 5+ projects documented
- 3+ blog posts published
- Mobile-responsive and fast
- Shows up in search for "[your name]"

### Medium-Term Goals (6-12 Months)
- 10+ projects documented
- Regular blog updates (1-2/month)
- Receiving inquiries about work
- Building audience/community
- Linked from other sites (backlinks)

### Long-Term Goals (1-2 Years)
- Portfolio reflects growth trajectory
- Strong online presence in niche
- Opportunities coming organically
- Content serves as reference for yourself
- Demonstrates interdisciplinary expertise

### Qualitative Measures
- Does it accurately represent you?
- Would you show it to anyone?
- Does it make finding you easy?
- Does it spark conversations?
- Are you proud of it?

---

## Maintenance & Updates

### Regular Tasks

**Weekly:**
- Check for spam/broken links (if contact form exists)
- Monitor analytics (if implemented)

**Monthly:**
- Update /now page
- Review and fix any bugs
- Check site performance

**Per Project:**
- Document as you go
- Take photos/videos during build
- Write blog post about learnings
- Add to portfolio within 1-2 weeks of completion

**Quarterly:**
- Review and update About page
- Audit existing content for accuracy
- Update availability/status
- Improve older project documentation

### Technical Maintenance

**As Needed:**
- Directus updates
- Frontend framework updates
- Security patches
- Backup verification

**Annually:**
- Review and optimize images
- Update dependencies
- Audit and remove unused content
- Performance review

---

## Budget & Resources

### Costs (Estimated)

**Domain:**
- ~$10-15/year for .com
- Consider .tech, .dev, .io as alternatives

**Hosting:**
- Frontend: Free (Vercel, Netlify, Cloudflare Pages)
- Directus: $0-5/month (self-host on cheap VPS)
- OR Directus Cloud: $15+/month (if budget allows)
- Storage: Minimal (under 5GB for start)

**Total:** $10-200/year depending on choices

### Time Investment

**Initial Build:**
- Phase 1: 15-20 hours
- Phase 2: 15-20 hours
- Phase 3: 10-15 hours
- Total: ~40-55 hours over 6 weeks

**Ongoing Maintenance:**
- Per project documentation: 2-4 hours
- Monthly updates: 30-60 minutes
- Blog post: 1-3 hours
- Total: 5-10 hours/month

---

## Risk Mitigation

### Technical Risks

**Risk:** Directus becomes too complex
**Mitigation:** Start with simple schema, expand gradually. Document decisions.

**Risk:** Content blocks system becomes unwieldy
**Mitigation:** Limit to 8 core block types. Add new types only when truly needed.

**Risk:** Performance issues with many projects
**Mitigation:** Implement pagination, lazy loading, and caching early.

**Risk:** Breaking changes in dependencies
**Mitigation:** Lock dependency versions, test updates in staging.

### Content Risks

**Risk:** Perfectionism prevents launching
**Mitigation:** Launch with 3-5 projects, add more iteratively. Done > perfect.

**Risk:** Running out of content
**Mitigation:** Document everything. Small projects count. Blog fills gaps.

**Risk:** Misrepresenting skill level
**Mitigation:** Be specific, honest, and show learning process.

### Strategic Risks

**Risk:** Site doesn't generate opportunities
**Mitigation:** Actively share in relevant communities, LinkedIn, etc.

**Risk:** Site becomes outdated
**Mitigation:** Now page + blog keep it current. Low-maintenance by design.

**Risk:** Pigeonholed into one domain
**Mitigation:** Emphasize breadth as feature. Show all interests.

---

## Next Steps

### Immediate Actions (This Week)
1. ✅ Finalize plan (this document)
2. Set up development environment
3. Initialize Directus instance
4. Create basic frontend structure
5. Design/finalize color palette
6. Gather content for first 2-3 projects

### Short-Term (Next 2 Weeks)
1. Complete Phase 1 implementation
2. Add first real project
3. Write first blog post
4. Get feedback from trusted people
5. Iterate on design

### Medium-Term (Next Month)
1. Complete Phase 2 features
2. Add 3-5 projects
3. Write 2-3 blog posts
4. Soft launch (share with close circle)
5. Gather feedback and iterate

### Long-Term (Next 3 Months)
1. Complete Phase 3 polish
2. Public launch
3. Share on relevant platforms
4. Build content library
5. Monitor and respond to opportunities

---

## Questions & Decisions

### Still To Decide

**Design:**
- [ ] Final color palette (specific hex codes)
- [ ] Typography choices (fonts)
- [ ] Logo/personal brand mark (if any)
- [ ] Favicon design

**Technical:**
- [ ] Exact hosting provider
- [ ] Domain name
- [ ] Directus self-host vs cloud
- [ ] Analytics solution (if any)

**Content:**
- [ ] Which projects to feature on homepage
- [ ] Tone for About page
- [ ] How much detail to include about NGO work
- [ ] Whether to include resume/CV download

**Features:**
- [ ] German version: now or later?
- [ ] Contact form vs email only?
- [ ] Newsletter signup: yes or no?
- [ ] Comments on blog: yes or no?

### Design Principles (Decided)
- ✅ Neobrutalist aesthetic
- ✅ Content blocks for flexibility
- ✅ Honest, learning-focused tone
- ✅ Interdisciplinary as strength
- ✅ Mobile-first responsive
- ✅ Performance-focused

### Technical Decisions (Decided)
- ✅ Next.js 15+ with App Router (not Pages Router)
- ✅ React Server Components by default
- ✅ TypeScript + Zod validation for all data
- ✅ Server-side filtering via searchParams
- ✅ Directus with simple O2M blocks (upgrade to Blocks UI later if needed)
- ✅ Remote image patterns configured for Directus assets
- ✅ Start with Option 1 content blocks, evaluate Option 2 in Phase 3

### Strategic Decisions (Decided)
- ✅ Portfolio as passive opportunity magnet
- ✅ Broad rather than niche-focused
- ✅ Show learning and growth
- ✅ Document constraints and solutions
- ✅ Blog as narrative connector
- ✅ Now page for currency

---

## Resources & References

### Inspiration
- [Personal portfolios in neobrutalist style]
- [Engineering portfolio examples]
- [Content-focused personal sites]

### Technical Documentation
- Next.js: https://nextjs.org/docs
- Directus: https://docs.directus.io
- Directus Schema Reference: https://docs.directus.io/reference/system/schema.html
- Directus SDK: https://docs.directus.io/guides/sdk/getting-started.html
- React: https://react.dev
- Zod: https://zod.dev

### Design Resources
- Neobrutalism examples and principles
- Color palette generators
- Font pairings

### Tools
- Directus (CMS)
- Next.js (Frontend framework)
- Vercel/Netlify (Hosting)
- Figma (Design, if needed)

---

## Conclusion

This portfolio is designed to:
- Show who you are authentically
- Demonstrate real capabilities
- Grow with you over time
- Generate opportunities passively
- Be maintainable long-term

The structure balances flexibility with consistency, allowing you to showcase diverse work while maintaining a coherent identity. The content blocks system means you can always adjust presentation without restructuring data.

**Modern Technical Foundation:**
- Next.js 15+ with App Router for best performance
- React Server Components reduce client JavaScript
- TypeScript + Zod validation prevents runtime errors
- Server-side filtering for SEO and shareability
- Directus with flexible schema that evolves with you

**Start small, ship early, iterate based on real feedback.** The site should work for you, not be another project that creates pressure.

**Most important:** Document as you build. This portfolio is itself a project worth showcasing.