import { z } from 'zod';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL || '';
const DirectusIdSchema = z.union([z.string(), z.number()]);

export const TextBlockContentSchema = z.object({
  content: z.string(),
});

export const ImageBlockContentSchema = z.object({
  image_id: z.string().uuid(),
  caption: z.string().optional(),
  size: z.enum(['small', 'medium', 'large', 'full-width']).optional().default('medium'),
});

export const GalleryBlockContentSchema = z.object({
  images: z.preprocess((val) => {
    if (!Array.isArray(val)) return val;
    return val.map((item: any) => {
      if (item && typeof item === 'object' && 'directus_files_id' in item) {
        return item.directus_files_id;
      }
      return item;
    });
  }, z.array(z.string().uuid())),
  layout: z.enum(['grid', 'carousel', 'masonry']).optional().default('grid'),
  caption: z.string().optional(),
});

export const VideoBlockContentSchema = z.object({
  video_id: z.string(),
  caption: z.string().optional(),
  autoplay: z.boolean().optional().default(false),
});

export const CadBlockContentSchema = z.object({
  file_id: z.string().uuid(),
  viewer_type: z.enum(['embed', 'download_link', 'preview_image']).optional().default('preview_image'),
  description: z.string().optional(),
});

export const CodeBlockContentSchema = z.object({
  code: z.string(),
  language: z.string().optional().default('text'),
  filename: z.string().optional(),
  description: z.string().optional(),
});

export const SpecsRowSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const SpecsBlockContentSchema = z.object({
  rows: z.array(SpecsRowSchema),
  title: z.string().optional(),
});

export const CalloutBlockContentSchema = z.object({
  content: z.string(),
  callout_type: z.enum(['info', 'warning', 'success', 'tip']).optional().default('info'),
});

// Base blocks (no layout) - used for layout's nested blocks to avoid infinite recursion
const BaseContentBlockSchema = z.discriminatedUnion('type', [
  TextBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('text'),
    sort: z.number().optional(),
  }),
  ImageBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('image'),
    sort: z.number().optional(),
  }),
  GalleryBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('gallery'),
    sort: z.number().optional(),
  }),
  VideoBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('video'),
    sort: z.number().optional(),
  }),
  CadBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('cad'),
    sort: z.number().optional(),
  }),
  CodeBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('code'),
    sort: z.number().optional(),
  }),
  SpecsBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('specs'),
    sort: z.number().optional(),
  }),
  CalloutBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('callout'),
    sort: z.number().optional(),
  }),
]);

export const LayoutBlockSchema = z.object({
  id: DirectusIdSchema.optional(),
  type: z.literal('layout'),
  sort: z.number().optional(),
  layout_type: z.enum(['two-column', 'sidebar-left', 'sidebar-right']).optional().default('two-column'),
  left_blocks: z.array(z.preprocess((val) => {
    if (typeof val !== 'object' || val === null) return val;
    const raw = val as any;
    if (raw.collection && raw.item && typeof raw.item === 'object') {
      const type = raw.collection.replace('project_blocks_', '');
      return { ...raw.item, type, id: raw.item.id };
    }
    return raw;
  }, BaseContentBlockSchema)).optional().default([]),
  right_blocks: z.array(z.preprocess((val) => {
    if (typeof val !== 'object' || val === null) return val;
    const raw = val as any;
    if (raw.collection && raw.item && typeof raw.item === 'object') {
      const type = raw.collection.replace('project_blocks_', '');
      return { ...raw.item, type, id: raw.item.id };
    }
    return raw;
  }, BaseContentBlockSchema)).optional().default([]),
  gap: z.enum(['small', 'medium', 'large']).optional().default('medium'),
});

export const ContentBlockSchema = z.lazy(() => z.discriminatedUnion('type', [
  TextBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('text'),
    sort: z.number().optional(),
  }),
  ImageBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('image'),
    sort: z.number().optional(),
  }),
  GalleryBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('gallery'),
    sort: z.number().optional(),
  }),
  VideoBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('video'),
    sort: z.number().optional(),
  }),
  CadBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('cad'),
    sort: z.number().optional(),
  }),
  CodeBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('code'),
    sort: z.number().optional(),
  }),
  SpecsBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('specs'),
    sort: z.number().optional(),
  }),
  CalloutBlockContentSchema.extend({
    id: DirectusIdSchema.optional(),
    type: z.literal('callout'),
    sort: z.number().optional(),
  }),
  LayoutBlockSchema,
]) as any);

export type ContentBlock = z.infer<typeof ContentBlockSchema>;

// Normalize O2M format (content nested), Block Editor format (data nested), and M2A format before validating
export const SafeContentBlockSchema: z.ZodType<ContentBlock> = z.preprocess((val) => {
  if (typeof val !== 'object' || val === null) return val;
  const raw = val as any;

  // Handle M2A format: { collection: 'project_blocks_text', item: { ... } }
  if (raw.collection && raw.item && typeof raw.item === 'object') {
    const type = raw.collection.replace('project_blocks_', '');
    return { ...raw.item, type, id: raw.item.id };
  }

  const block = raw;
  if (block.content && typeof block.content === 'object') {
    return { ...block, ...block.content };
  }
  if (block.data && typeof block.data === 'object') {
    return { ...block, ...block.data };
  }
  return block;
}, z.lazy(() => ContentBlockSchema));

const NormalizedBlocksField = z.preprocess((val) => {
  if (!Array.isArray(val)) return val;

  // Keep valid blocks and drop malformed/null rows that can appear in M2A junctions.
  return val
    .map((item) => {
      const parsed = SafeContentBlockSchema.safeParse(item);
      return parsed.success ? parsed.data : null;
    })
    .filter((item): item is ContentBlock => item !== null);
}, z.array(ContentBlockSchema).nullable().optional());

export const TagSchema = z.object({
  id: DirectusIdSchema,
  name: z.string(),
  slug: z.string(),
  color: z.string().nullable().optional(),
});

// Directus M2M returns tags as junction rows: [{ tags_id: { id, name, slug, color } }]
// Normalize to flat TagSchema objects before validation.
const NormalizedTagsField = z.preprocess((val) => {
  if (!Array.isArray(val)) return val;
  return val
    .map((item) => {
      if (item && typeof item === 'object' && 'tags_id' in item) return item.tags_id;
      if (item && typeof item === 'object' && 'id' in item) return item;
      return null;
    })
    .filter(Boolean);
}, z.array(TagSchema).nullable().optional());

// Directus M2M returns linked_projects as junction rows: [{ projects_id: { id, title, slug } }]
const LinkedProjectSchema = z.object({
  id: DirectusIdSchema,
  title: z.string(),
  slug: z.string(),
});

const LinkedProjectsField = z.preprocess((val) => {
  if (!Array.isArray(val)) return val;
  return val
    .map((item) => {
      if (item && typeof item === 'object' && 'projects_id' in item) return item.projects_id;
      if (item && typeof item === 'object' && 'id' in item) return item;
      return null;
    })
    .filter((v) => v && typeof v === 'object');
}, z.array(LinkedProjectSchema).nullable().optional());

export const ProjectSchema = z.object({
  id: DirectusIdSchema,
  title: z.string(),
  slug: z.string(),
  thumbnail: z.string().uuid().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  status: z.enum(['completed', 'ongoing', 'paused', 'draft']),
  short_summary: z.string().nullable().optional(),
  context: z
    .enum(['Personal', 'NGO', 'Academic', 'Commercial', 'Collaboration'])
    .nullable()
    .optional(),
  domains: z.array(z.string()).nullable().optional(),
  tags: NormalizedTagsField,
  collaborators: z.array(z.unknown()).nullable().optional(),
  duration: z.string().nullable().optional(),
  tools_used: z.array(z.string()).nullable().optional(),
  github_repo: z.string().nullable().optional(),
  external_links: z.array(z.string()).nullable().optional(),
  blocks: NormalizedBlocksField,
  date_created: z.string().nullable().optional(),
  date_updated: z.string().nullable().optional(),
});

export const BlogPostSchema = z.object({
  id: DirectusIdSchema,
  title: z.string(),
  slug: z.string(),
  published_date: z.string(),
  summary: z.string(),
  body: z.string(),
  tags: NormalizedTagsField,
  linked_projects: LinkedProjectsField,
  is_draft: z.boolean().optional().default(false),
  last_updated: z.string().nullable().optional(),
  date_created: z.string().nullable().optional(),
});

export const ProfileSchema = z.object({
  id: DirectusIdSchema,
  current_location: z.string().nullable().optional(),
  next_location: z.string().nullable().optional(),
  location_change_date: z.string().nullable().optional(),
  availability_status: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  skills: z.array(z.string()).nullable().optional(),
  languages: z.array(z.string()).nullable().optional(),
  contact_email: z.string().nullable().optional(),
  github_url: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
});

export function parseContentBlock(raw: unknown): ContentBlock | null {
  const result = SafeContentBlockSchema.safeParse(raw);
  if (!result.success) {
    console.error('[Schema] Block validation failed:', result.error.flatten(), 'Raw:', raw);
  }
  return result.success ? result.data : null;
}

export function getAssetUrl(pathOrId: string | null | undefined): string {
  if (!pathOrId) return '/placeholder-thumbnail.svg';
  if (pathOrId.startsWith('http')) return pathOrId;
  const base = DIRECTUS_URL.replace(/\/$/, '');
  return pathOrId.startsWith('/') ? `${base}${pathOrId}` : `${base}/assets/${pathOrId}`;
}
