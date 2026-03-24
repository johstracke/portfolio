import {
  authentication,
  createDirectus,
  readItems,
  readSingleton,
  rest,
  staticToken,
} from '@directus/sdk';
import { z } from 'zod';
import {
  ProjectSchema as ProjectZod,
  BlogPostSchema as BlogPostZod,
  ProfileSchema as ProfileZod,
} from '@/lib/schemas';
import { DEFAULT_LOCALE, type Locale, toDirectusLocale } from '@/lib/i18n';

const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;
const DIRECTUS_EMAIL = process.env.DIRECTUS_EMAIL || process.env.ADMIN_EMAIL;
const DIRECTUS_PASSWORD = process.env.DIRECTUS_PASSWORD || process.env.ADMIN_PASSWORD;

export type Project = z.infer<typeof ProjectZod>;
export type BlogPost = z.infer<typeof BlogPostZod>;
export type Profile = z.infer<typeof ProfileZod>;

export type ProjectsFilter = {
  domain?: string;
  tag?: string;
  status?: string;
  context?: string;
  search?: string;
};

// Use a static token when available (preferred — no login overhead or race conditions).
// Fall back to email/password auth if no static token is set.
async function getCmsClient() {
  const token = process.env.DIRECTUS_STATIC_TOKEN;
  if (token) {
    return createDirectus(DIRECTUS_URL).with(rest()).with(staticToken(token));
  }
  const cmsClient = createDirectus(DIRECTUS_URL).with(rest()).with(authentication('json'));
  if (DIRECTUS_EMAIL && DIRECTUS_PASSWORD) {
    await cmsClient.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD, { mode: 'json' });
  }
  return cmsClient;
}

/**
 * Recursively merge a data object with fallback data, filling null/undefined values.
 * Deep merges nested objects and arrays.
 */
function mergeWithFallback(data: unknown, fallbackData: unknown): unknown {
  // If primary data is null/undefined, use fallback
  if (data === null || data === undefined) {
    return fallbackData ?? null;
  }

  // Don't merge non-objects
  if (typeof data !== 'object') {
    return data;
  }

  // Handle arrays: merge each element with corresponding fallback element
  if (Array.isArray(data)) {
    return (data as unknown[]).map((item, idx) => {
      const fbItem = Array.isArray(fallbackData) ? (fallbackData as unknown[])[idx] : undefined;
      return mergeWithFallback(item, fbItem);
    });
  }

  // Handle objects: recursively merge properties
  const result = { ...data } as Record<string, unknown>;
  const fb = fallbackData as Record<string, unknown> | null | undefined;

  for (const key in result) {
    if (result[key] === null || result[key] === undefined) {
      // Replace null/undefined with fallback value
      if (fb && key in fb) {
        result[key] = fb[key];
      }
    } else if (typeof result[key] === 'object' && result[key] !== null && fb && key in fb) {
      // Recursively merge nested objects
      result[key] = mergeWithFallback(result[key], fb[key]);
    }
  }

  return result as unknown;
}

const PROJECT_BASE_FIELDS = [
  'id',
  'title',
  'slug',
  'thumbnail',
  'start_date',
  'end_date',
  'status',
  'short_summary',
  'context',
  'domains',
  'collaborators',
  'duration',
  'tools_used',
  'github_repo',
  'external_links',
] as const;

const PROJECT_BLOCK_FIELDS = [
  'blocks.*',
  'blocks.item:project_blocks_text.id',
  'blocks.item:project_blocks_text.content',
  'blocks.item:project_blocks_image.id',
  'blocks.item:project_blocks_image.image_id',
  'blocks.item:project_blocks_image.caption',
  'blocks.item:project_blocks_image.size',
  'blocks.item:project_blocks_gallery.id',
  'blocks.item:project_blocks_gallery.caption',
  'blocks.item:project_blocks_gallery.layout',
  'blocks.item:project_blocks_gallery.images.*',
  'blocks.item:project_blocks_video.id',
  'blocks.item:project_blocks_video.video_id',
  'blocks.item:project_blocks_video.caption',
  'blocks.item:project_blocks_video.autoplay',
  'blocks.item:project_blocks_cad.id',
  'blocks.item:project_blocks_cad.file_id',
  'blocks.item:project_blocks_cad.viewer_type',
  'blocks.item:project_blocks_cad.description',
  'blocks.item:project_blocks_code.id',
  'blocks.item:project_blocks_code.code',
  'blocks.item:project_blocks_code.language',
  'blocks.item:project_blocks_code.filename',
  'blocks.item:project_blocks_code.description',
  'blocks.item:project_blocks_specs.id',
  'blocks.item:project_blocks_specs.title',
  'blocks.item:project_blocks_specs.rows',
  'blocks.item:project_blocks_callout.id',
  'blocks.item:project_blocks_callout.content',
  'blocks.item:project_blocks_callout.callout_type',
  'blocks.item:project_blocks_layout.id',
  'blocks.item:project_blocks_layout.layout_type',
  'blocks.item:project_blocks_layout.gap',
  // Nested left_blocks with collection-specific M2A expansions
  'blocks.item:project_blocks_layout.left_blocks.*',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_text.id',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_text.content',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_image.id',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_image.image_id',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_image.caption',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_image.size',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_gallery.id',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_gallery.caption',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_gallery.layout',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_gallery.images.*',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_video.id',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_video.video_id',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_video.caption',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_video.autoplay',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_cad.id',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_cad.file_id',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_cad.viewer_type',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_cad.description',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_code.id',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_code.code',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_code.language',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_code.filename',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_code.description',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_specs.id',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_specs.title',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_specs.rows',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_callout.id',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_callout.content',
  'blocks.item:project_blocks_layout.left_blocks.item:project_blocks_callout.callout_type',
  // Nested right_blocks with collection-specific M2A expansions
  'blocks.item:project_blocks_layout.right_blocks.*',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_text.id',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_text.content',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_image.id',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_image.image_id',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_image.caption',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_image.size',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_gallery.id',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_gallery.caption',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_gallery.layout',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_gallery.images.*',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_video.id',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_video.video_id',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_video.caption',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_video.autoplay',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_cad.id',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_cad.file_id',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_cad.viewer_type',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_cad.description',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_code.id',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_code.code',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_code.language',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_code.filename',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_code.description',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_specs.id',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_specs.title',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_specs.rows',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_callout.id',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_callout.content',
  'blocks.item:project_blocks_layout.right_blocks.item:project_blocks_callout.callout_type',
] as const;

export async function getProjects(
  filters?: ProjectsFilter,
  locale: Locale = DEFAULT_LOCALE
): Promise<Project[]> {
  try {
    const cmsClient = await getCmsClient();
    const directusLocale = toDirectusLocale(locale);
    const baseQuery: Record<string, unknown> = {
      fields: [
        ...PROJECT_BASE_FIELDS,
        'tags.tags_id.id',
        'tags.tags_id.name',
        'tags.tags_id.slug',
        'tags.tags_id.color',
        ...PROJECT_BLOCK_FIELDS,
      ],
      sort: ['-start_date'],
      language: directusLocale,
    };

    const filterParts: Record<string, unknown> = {};
    if (filters?.status) {
      filterParts.status = { _eq: filters.status };
    }
    if (filters?.domain) {
      filterParts.domains = { _contains: filters.domain };
    }
    if (filters?.tag) {
      filterParts.tags = { tags_id: { slug: { _eq: filters.tag } } };
    }
    if (filters?.context) {
      filterParts.context = { _eq: filters.context };
    }
    if (Object.keys(filterParts).length > 0) {
      baseQuery.filter = filterParts;
    }
    if (filters?.search) {
      baseQuery.search = filters.search;
    }

    let items = (await cmsClient.request(
      readItems('projects', baseQuery as never)
    )) as unknown[];

    // For German, fetch English fallback and merge where values are null
    if (locale === 'de') {
      const enQuery = { ...baseQuery, language: 'en-US' };
      const enItems = (await cmsClient.request(
        readItems('projects', enQuery as never)
      )) as unknown[];
      items = items.map((item, idx) => mergeWithFallback(item, enItems[idx]));
    }

    const results: Project[] = [];
    for (const item of items) {
      const parsed = ProjectZod.safeParse(item);
      if (parsed.success) {
        results.push(parsed.data);
      } else {
        console.error('[Directus] Project validation failed:', parsed.error.flatten());
      }
    }
    return results;
  } catch (err) {
    console.error('[Directus] getProjects failed:', err);
    return [];
  }
}

export async function getProjectBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<Project | null> {
  try {
    const cmsClient = await getCmsClient();
    const directusLocale = toDirectusLocale(locale);
    const baseQuery: Record<string, unknown> = {
      filter: { slug: { _eq: slug } },
      fields: [
        ...PROJECT_BASE_FIELDS,
        'tags.tags_id.id',
        'tags.tags_id.name',
        'tags.tags_id.slug',
        'tags.tags_id.color',
        ...PROJECT_BLOCK_FIELDS,
      ],
      limit: 1,
      language: directusLocale,
    };

    let items = (await cmsClient.request(
      readItems('projects', baseQuery as never)
    )) as unknown[];

    // For German, fetch English fallback and merge where values are null
    if (locale === 'de') {
      const enQuery = { ...baseQuery, language: 'en-US' };
      const enItems = (await cmsClient.request(
        readItems('projects', enQuery as never)
      )) as unknown[];
      items = items.map((item, idx) => mergeWithFallback(item, enItems[idx]));
    }

    const item = items[0];
    if (!item) return null;

    const result = ProjectZod.safeParse(item);
    if (result.success) return result.data;
    console.error('[Directus] Project validation failed for slug:', slug, result.error.flatten());
    return null;
  } catch (err) {
    console.error('[Directus] getProjectBySlug failed:', slug, err);
    return null;
  }
}

export async function getBlogPosts(
  limit = 20,
  locale: Locale = DEFAULT_LOCALE
): Promise<BlogPost[]> {
  try {
    const cmsClient = await getCmsClient();
    const directusLocale = toDirectusLocale(locale);
    const query: Record<string, unknown> = {
      filter: {
        _or: [
          { is_draft: { _eq: false } },
          { is_draft: { _null: true } },
        ],
      },
      fields: ['*', 'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug', 'tags.tags_id.color', 'linked_projects.projects_id.id', 'linked_projects.projects_id.title', 'linked_projects.projects_id.slug'],
      sort: ['-published_date'],
      limit,
      language: directusLocale,
    };

    let items = (await cmsClient.request(
      readItems('blog_posts', query as never)
    )) as unknown[];

    // For German, fetch English fallback and merge where values are null
    if (locale === 'de') {
      const enQuery = { ...query, language: 'en-US' };
      const enItems = (await cmsClient.request(
        readItems('blog_posts', enQuery as never)
      )) as unknown[];
      items = items.map((item, idx) => mergeWithFallback(item, enItems[idx]));
    }

    const results: BlogPost[] = [];
    for (const item of items) {
      const parsed = BlogPostZod.safeParse(item);
      if (parsed.success) {
        results.push(parsed.data);
      } else {
        console.error('[Directus] BlogPost validation failed:', parsed.error.flatten());
      }
    }
    return results;
  } catch (err) {
    console.error('[Directus] getBlogPosts failed:', err);
    return [];
  }
}

export async function getBlogPostBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<BlogPost | null> {
  try {
    const cmsClient = await getCmsClient();
    const directusLocale = toDirectusLocale(locale);
    const query: Record<string, unknown> = {
      filter: {
        slug: { _eq: slug },
        _or: [
          { is_draft: { _eq: false } },
          { is_draft: { _null: true } },
        ],
      },
      fields: ['*', 'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug', 'tags.tags_id.color', 'linked_projects.projects_id.id', 'linked_projects.projects_id.title', 'linked_projects.projects_id.slug'],
      limit: 1,
      language: directusLocale,
    };

    let items = (await cmsClient.request(
      readItems('blog_posts', query as never)
    )) as unknown[];

    // For German, fetch English fallback and merge where values are null
    if (locale === 'de') {
      const enQuery = { ...query, language: 'en-US' };
      const enItems = (await cmsClient.request(
        readItems('blog_posts', enQuery as never)
      )) as unknown[];
      items = items.map((item, idx) => mergeWithFallback(item, enItems[idx]));
    }

    const item = items[0];
    if (!item) return null;
    const result = BlogPostZod.safeParse(item);
    if (result.success) return result.data;
    console.error('[Directus] BlogPost validation failed for slug:', slug, result.error.flatten());
    return null;
  } catch (err) {
    console.error('[Directus] getBlogPostBySlug failed:', slug, err);
    return null;
  }
}

export async function getBlogPostsForProject(
  projectId: string | number,
  locale: Locale = DEFAULT_LOCALE
): Promise<BlogPost[]> {
  try {
    const cmsClient = await getCmsClient();
    const directusLocale = toDirectusLocale(locale);
    const query: Record<string, unknown> = {
      filter: {
        _or: [
          { is_draft: { _eq: false } },
          { is_draft: { _null: true } },
        ],
        linked_projects: {
          projects_id: { id: { _eq: projectId } },
        },
      },
      fields: ['*', 'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug', 'tags.tags_id.color', 'linked_projects.projects_id.id', 'linked_projects.projects_id.title', 'linked_projects.projects_id.slug'],
      sort: ['-published_date'],
      limit: 5,
      language: directusLocale,
    };

    let items = (await cmsClient.request(
      readItems('blog_posts', query as never)
    )) as unknown[];

    // For German, fetch English fallback and merge where values are null
    if (locale === 'de') {
      const enQuery = { ...query, language: 'en-US' };
      const enItems = (await cmsClient.request(
        readItems('blog_posts', enQuery as never)
      )) as unknown[];
      items = items.map((item, idx) => mergeWithFallback(item, enItems[idx]));
    }

    const results: BlogPost[] = [];
    for (const item of items) {
      const parsed = BlogPostZod.safeParse(item);
      if (parsed.success) results.push(parsed.data);
    }
    return results;
  } catch (err) {
    console.error('[Directus] getBlogPostsForProject failed:', projectId, err);
    return [];
  }
}

export async function getProfile(locale: Locale = DEFAULT_LOCALE): Promise<Profile | null> {
  try {
    const cmsClient = await getCmsClient();
    const directusLocale = toDirectusLocale(locale);
    let item = (await cmsClient.request(
      readSingleton('profile' as never, {
        language: directusLocale,
      } as never) as never
    )) as unknown;

    // For German, fetch English fallback and merge where values are null
    if (locale === 'de') {
      const enItem = (await cmsClient.request(
        readSingleton('profile' as never, {
          language: 'en-US',
        } as never) as never
      )) as unknown;
      item = mergeWithFallback(item, enItem);
    }

    const result = ProfileZod.safeParse(item);
    if (result.success) return result.data;
    console.error('[Directus] Profile validation failed:', result.error.flatten());
    return null;
  } catch (err) {
    console.error('[Directus] getProfile failed:', err);
    return null;
  }
}
