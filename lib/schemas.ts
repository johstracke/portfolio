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
  images: z.array(z.string().uuid()),
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

export const ContentBlockSchema = z.discriminatedUnion('type', [
  z.object({
    id: DirectusIdSchema.optional(),
    project_id: DirectusIdSchema.optional(),
    type: z.literal('text'),
    sort: z.number().optional(),
    content: TextBlockContentSchema,
  }),
  z.object({
    id: DirectusIdSchema.optional(),
    project_id: DirectusIdSchema.optional(),
    type: z.literal('image'),
    sort: z.number().optional(),
    content: ImageBlockContentSchema,
  }),
  z.object({
    id: DirectusIdSchema.optional(),
    project_id: DirectusIdSchema.optional(),
    type: z.literal('gallery'),
    sort: z.number().optional(),
    content: GalleryBlockContentSchema,
  }),
  z.object({
    id: DirectusIdSchema.optional(),
    project_id: DirectusIdSchema.optional(),
    type: z.literal('video'),
    sort: z.number().optional(),
    content: VideoBlockContentSchema,
  }),
  z.object({
    id: DirectusIdSchema.optional(),
    project_id: DirectusIdSchema.optional(),
    type: z.literal('cad'),
    sort: z.number().optional(),
    content: CadBlockContentSchema,
  }),
  z.object({
    id: DirectusIdSchema.optional(),
    project_id: DirectusIdSchema.optional(),
    type: z.literal('code'),
    sort: z.number().optional(),
    content: CodeBlockContentSchema,
  }),
  z.object({
    id: DirectusIdSchema.optional(),
    project_id: DirectusIdSchema.optional(),
    type: z.literal('specs'),
    sort: z.number().optional(),
    content: SpecsBlockContentSchema,
  }),
  z.object({
    id: DirectusIdSchema.optional(),
    project_id: DirectusIdSchema.optional(),
    type: z.literal('callout'),
    sort: z.number().optional(),
    content: CalloutBlockContentSchema,
  }),
]);

export const TagSchema = z.object({
  id: DirectusIdSchema,
  name: z.string(),
  slug: z.string(),
  color: z.string().nullable().optional(),
});

export const ProjectSchema = z.object({
  id: DirectusIdSchema,
  title: z.string(),
  slug: z.string(),
  thumbnail: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string().nullable().optional(),
  status: z.enum(['completed', 'ongoing', 'paused']),
  short_summary: z.string(),
  context: z
    .enum(['Personal', 'NGO', 'Academic', 'Commercial', 'Collaboration'])
    .nullable()
    .optional(),
  domains: z.array(z.string()).nullable().optional(),
  tags: z.array(TagSchema).nullable().optional(),
  collaborators: z.array(z.unknown()).nullable().optional(),
  duration: z.string().nullable().optional(),
  tools_used: z.array(z.string()).nullable().optional(),
  github_repo: z.string().nullable().optional(),
  external_links: z.array(z.string()).nullable().optional(),
  content_blocks: z.array(ContentBlockSchema).nullable().optional(),
  date_created: z.string().nullable().optional(),
  date_updated: z.string().nullable().optional(),
});

const LinkedProjectSchema = z.object({
  id: DirectusIdSchema,
  title: z.string(),
  slug: z.string(),
});

export const BlogPostSchema = z.object({
  id: DirectusIdSchema,
  title: z.string(),
  slug: z.string(),
  published_date: z.string(),
  summary: z.string(),
  body: z.string(),
  tags: z.array(TagSchema).nullable().optional(),
  linked_projects: z.array(LinkedProjectSchema).nullable().optional(),
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

export function parseContentBlock(raw: unknown): z.infer<typeof ContentBlockSchema> | null {
  const parsed = z.record(z.unknown()).safeParse(raw);
  if (!parsed.success) return null;
  const obj = parsed.data;
  const type = obj.type;
  if (typeof type !== 'string') return null;
  const content = obj.content;
  const block = { ...obj, content: content ?? {} };
  const result = ContentBlockSchema.safeParse(block);
  return result.success ? result.data : null;
}

export function getAssetUrl(pathOrId: string): string {
  if (pathOrId.startsWith('http')) return pathOrId;
  const base = DIRECTUS_URL.replace(/\/$/, '');
  return pathOrId.startsWith('/') ? `${base}${pathOrId}` : `${base}/assets/${pathOrId}`;
}
