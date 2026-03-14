# Directus Schema Reference

Complete schema definition for the portfolio Directus instance. Use this as reference when creating collections manually in the Directus UI.

## Collections Overview

1. **projects** - Main project collection
2. **blog_posts** - Blog content
3. **content_blocks** - Flexible content blocks for projects
4. **media_library** - Central media storage (uses Directus Files)
5. **profile** - User/site metadata (singleton)
6. **tags** - Tag system (shared by projects and blog)

---

## 1. Projects Collection

**Collection Settings:**
- Collection Name: `projects`
- Icon: `folder`
- Display Template: `{{title}}`
- Note: "Main project portfolio items"

### Fields:

#### id (Primary Key)
- Type: UUID
- Interface: Input (read-only)
- Auto-generated

#### title
- Type: String
- Interface: Input
- Required: Yes
- Max Length: 255
- Note: "Project title"

#### slug
- Type: String
- Interface: Input
- Required: Yes
- Unique: Yes
- Max Length: 255
- Note: "URL-friendly identifier (e.g., cubesat-2024)"

#### thumbnail
- Type: UUID (File)
- Interface: File
- Required: Yes
- Note: "Main project image"

#### start_date
- Type: Date
- Interface: Date
- Required: Yes

#### end_date
- Type: Date
- Interface: Date
- Required: No

#### status
- Type: String
- Interface: Dropdown
- Options: 
  - completed
  - ongoing
  - paused
- Default: ongoing
- Required: Yes

#### short_summary
- Type: Text
- Interface: Input (Multiline)
- Required: Yes
- Max Length: 500
- Note: "1-2 sentence overview for cards"

#### context
- Type: String
- Interface: Dropdown
- Options:
  - Personal
  - NGO
  - Academic
  - Commercial
  - Collaboration
- Required: No

#### domains
- Type: JSON
- Interface: Tags
- Note: "Array of domain strings (hardware, software, agritech, automation)"

#### tags
- Type: Many-to-Many (M2M)
- Related Collection: tags
- Junction Collection: projects_tags

#### collaborators
- Type: JSON
- Interface: List
- Note: "Array of collaborator names/links"

#### duration
- Type: String
- Interface: Input
- Note: "e.g., '3 months' or computed from dates"

#### tools_used
- Type: JSON
- Interface: Tags
- Note: "Array of tool names"

#### github_repo
- Type: String
- Interface: Input
- Note: "GitHub repository URL"

#### external_links
- Type: JSON
- Interface: List
- Note: "Array of external URLs"

#### content_blocks
- Type: One-to-Many (O2M)
- Related Collection: content_blocks
- Note: "Ordered array of content blocks"

#### date_created
- Type: Timestamp
- Auto-generated

#### date_updated
- Type: Timestamp
- Auto-generated

---

## 2. Blog Posts Collection

**Collection Settings:**
- Collection Name: `blog_posts`
- Icon: `article`
- Display Template: `{{title}}`

### Fields:

#### id (Primary Key)
- Type: UUID

#### title
- Type: String
- Interface: Input
- Required: Yes
- Max Length: 255

#### slug
- Type: String
- Interface: Input
- Required: Yes
- Unique: Yes
- Max Length: 255

#### published_date
- Type: Date
- Interface: Date
- Required: Yes

#### summary
- Type: Text
- Interface: Input (Multiline)
- Required: Yes
- Max Length: 500

#### body
- Type: Text
- Interface: Markdown (or WYSIWYG)
- Required: Yes
- Note: "Main blog post content"

#### tags
- Type: Many-to-Many (M2M)
- Related Collection: tags
- Junction Collection: blog_posts_tags

#### linked_projects
- Type: Many-to-Many (M2M)
- Related Collection: projects
- Junction Collection: blog_posts_projects

#### is_draft
- Type: Boolean
- Interface: Toggle
- Default: false

#### last_updated
- Type: Timestamp
- Auto-generated on update

#### date_created
- Type: Timestamp
- Auto-generated

---

## 3. Content Blocks Collection

**Collection Settings:**
- Collection Name: `content_blocks`
- Icon: `widgets`
- Display Template: `{{type}}: {{id}}`
- Sort Field: `sort`

### Fields:

#### id (Primary Key)
- Type: UUID

#### project_id
- Type: Many-to-One (M2O)
- Related Collection: projects
- Required: Yes

#### type
- Type: String
- Interface: Dropdown
- Required: Yes
- Options:
  - text
  - image
  - gallery
  - video
  - cad
  - code
  - specs
  - callout

#### sort
- Type: Integer
- Interface: Input
- Note: "Determines display order"

#### content
- Type: JSON
- Interface: Code (JSON mode)
- Note: "Type-specific data structure"

**Content JSON Structures by Type:**

```json
// text
{
  "content": "Markdown or plain text"
}

// image
{
  "image_id": "uuid-of-file",
  "caption": "Optional caption",
  "size": "medium" // small, medium, large, full-width
}

// gallery
{
  "images": ["uuid1", "uuid2", "uuid3"],
  "layout": "grid", // grid, carousel, masonry
  "caption": "Optional caption"
}

// video
{
  "video_id": "uuid-of-file-or-url",
  "caption": "Optional caption",
  "autoplay": false
}

// cad
{
  "file_id": "uuid-of-file",
  "viewer_type": "preview_image", // embed, download_link, preview_image
  "description": "Optional description"
}

// code
{
  "code": "const example = 'code here'",
  "language": "javascript",
  "filename": "example.js",
  "description": "Optional description"
}

// specs
{
  "rows": [
    {"key": "Weight", "value": "2.5kg"},
    {"key": "Material", "value": "Aluminum"}
  ],
  "title": "Technical Specifications"
}

// callout
{
  "content": "Important note or tip",
  "callout_type": "info" // info, warning, success, tip
}
```

---

## 4. Media Library

Uses Directus built-in Files collection (`directus_files`).

**Additional Metadata Fields to Add:**

#### type
- Type: String
- Interface: Dropdown
- Options:
  - image
  - video
  - cad
  - code
  - document

#### caption
- Type: Text
- Interface: Input (Multiline)

#### alt_text
- Type: String
- Interface: Input
- Note: "For accessibility"

---

## 5. Profile Collection (Singleton)

**Collection Settings:**
- Collection Name: `profile`
- Icon: `person`
- Singleton: Yes

### Fields:

#### id (Primary Key)
- Type: UUID

#### current_location
- Type: String
- Interface: Input
- Example: "Graz, Austria"

#### next_location
- Type: String
- Interface: Input

#### location_change_date
- Type: Date
- Interface: Date

#### availability_status
- Type: Text
- Interface: Input (Multiline)

#### bio
- Type: Text
- Interface: Markdown

#### skills
- Type: JSON
- Interface: Tags
- Note: "Array of skill strings"

#### languages
- Type: JSON
- Interface: Tags
- Note: "Array of languages (e.g., German, English)"

#### contact_email
- Type: String
- Interface: Input (Email)

#### github_url
- Type: String
- Interface: Input

#### linkedin_url
- Type: String
- Interface: Input

---

## 6. Tags Collection

**Collection Settings:**
- Collection Name: `tags`
- Icon: `label`
- Display Template: `{{name}}`

### Fields:

#### id (Primary Key)
- Type: UUID

#### name
- Type: String
- Interface: Input
- Required: Yes
- Unique: Yes
- Note: "Tag name (e.g., 'robotics', 'embedded')"

#### slug
- Type: String
- Interface: Input
- Required: Yes
- Unique: Yes
- Note: "URL-friendly version"

#### color
- Type: String
- Interface: Color Picker
- Note: "Optional: color for tag badges"

---

## Relationships Summary

### Many-to-Many (M2M)

**projects ↔ blog_posts**
- Junction: `blog_posts_projects`
- Fields: `id`, `blog_posts_id`, `projects_id`

**projects ↔ tags**
- Junction: `projects_tags`
- Fields: `id`, `projects_id`, `tags_id`

**blog_posts ↔ tags**
- Junction: `blog_posts_tags`
- Fields: `id`, `blog_posts_id`, `tags_id`

### One-to-Many (O2M)

**projects → content_blocks**
- Foreign key in `content_blocks`: `project_id`

### Many-to-One (M2O)

**content_blocks → directus_files**
- Reference via UUID in JSON content field

---

## Setup Instructions

### Manual Creation in Directus UI

1. Log in to Directus admin panel
2. Go to Settings → Data Model
3. Create each collection listed above
4. Add fields as specified
5. Configure relationships
6. Test with sample data

### Export Schema

After creating schema manually:

```bash
# Using Directus CLI
npx directus schema snapshot ./directus-schema.json

# Commit to version control
git add directus-schema.json
git commit -m "chore: add directus schema"
```

### Import Schema to New Instance

```bash
# Apply schema to fresh Directus
npx directus schema apply ./directus-schema.json
```

---

## Validation with Zod

Ensure your Zod schemas in `lib/schemas.ts` match this Directus schema exactly:

```typescript
// Example validation
const project = await getProject(slug)
const validated = ProjectSchema.safeParse(project)

if (!validated.success) {
  console.error('Schema mismatch:', validated.error)
  // Handle error
}
```

---

## Notes

- **UUID vs Auto-increment:** Use UUID for all primary keys (Directus default)
- **Timestamps:** `date_created` and `date_updated` are auto-managed by Directus
- **Sort Field:** Content blocks need a `sort` field for ordering
- **JSON Fields:** Store complex data in JSON, validate with Zod before use
- **File References:** Store file UUIDs, fetch full file data when needed

---

## Common Queries

### Get all projects with content blocks:
```typescript
const projects = await directus.request(
  readItems('projects', {
    fields: ['*', 'content_blocks.*'],
  })
)
```

### Get project with linked blog posts:
```typescript
const project = await directus.request(
  readItem('projects', slug, {
    fields: ['*', 'content_blocks.*', 'linked_posts.*'],
  })
)
```

### Filter projects by domain:
```typescript
const projects = await directus.request(
  readItems('projects', {
    filter: {
      domains: { _contains: 'hardware' }
    }
  })
)
```
