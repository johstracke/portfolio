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

export async function getProjects(filters?: ProjectsFilter): Promise<Project[]> {
  try {
    const cmsClient = await getCmsClient();
    const query: Record<string, unknown> = {
      fields: [
        '*',
        'tags.tags_id.id',
        'tags.tags_id.name',
        'tags.tags_id.slug',
        'tags.tags_id.color',
        'content_blocks',
        'blocks.*',
        'blocks.item.*',
        'blocks.item.images.*',
        'blocks.item.left_blocks.*',
        'blocks.item.left_blocks.item.*',
        'blocks.item.left_blocks.item.images.*',
        'blocks.item.right_blocks.*',
        'blocks.item.right_blocks.item.*',
        'blocks.item.right_blocks.item.images.*',
      ],
      sort: ['-start_date'],
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
      query.filter = filterParts;
    }
    if (filters?.search) {
      query.search = filters.search;
    }

    const items = await cmsClient.request(
      readItems('projects', query as never)
    ) as unknown[];

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

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const cmsClient = await getCmsClient();
    const items = (await cmsClient.request(
      readItems('projects', {
        filter: { slug: { _eq: slug } },
        fields: [
          '*',
          'tags.tags_id.id',
          'tags.tags_id.name',
          'tags.tags_id.slug',
          'tags.tags_id.color',
          'content_blocks',
          'blocks.*',
          'blocks.item.*',
          'blocks.item.images.*',
          'blocks.item.left_blocks.*',
          'blocks.item.left_blocks.item.*',
          'blocks.item.left_blocks.item.images.*',
          'blocks.item.right_blocks.*',
          'blocks.item.right_blocks.item.*',
          'blocks.item.right_blocks.item.images.*',
        ],
        limit: 1,
      } as never)
    )) as unknown[];

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

export async function getBlogPosts(limit = 20): Promise<BlogPost[]> {
  try {
    const cmsClient = await getCmsClient();
    const items = (await cmsClient.request(
      readItems('blog_posts', {
        filter: { is_draft: { _eq: false } },
        fields: ['*', 'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug', 'tags.tags_id.color', 'linked_projects.projects_id.id', 'linked_projects.projects_id.title', 'linked_projects.projects_id.slug'],
        sort: ['-published_date'],
        limit,
      } as never)
    )) as unknown[];

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

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const cmsClient = await getCmsClient();
    const items = (await cmsClient.request(
      readItems('blog_posts', {
        filter: { slug: { _eq: slug }, is_draft: { _eq: false } },
        fields: ['*', 'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug', 'tags.tags_id.color', 'linked_projects.projects_id.id', 'linked_projects.projects_id.title', 'linked_projects.projects_id.slug'],
        limit: 1,
      } as never)
    )) as unknown[];

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

export async function getBlogPostsForProject(projectId: string | number): Promise<BlogPost[]> {
  try {
    const cmsClient = await getCmsClient();
    const items = (await cmsClient.request(
      readItems('blog_posts', {
        filter: {
          is_draft: { _eq: false },
          linked_projects: {
            projects_id: { id: { _eq: projectId } },
          },
        },
        fields: ['*', 'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug', 'tags.tags_id.color', 'linked_projects.projects_id.id', 'linked_projects.projects_id.title', 'linked_projects.projects_id.slug'],
        sort: ['-published_date'],
        limit: 5,
      } as never)
    )) as unknown[];

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

export async function getProfile(): Promise<Profile | null> {
  try {
    const cmsClient = await getCmsClient();
    const item = (await cmsClient.request(
      readSingleton('profile' as never) as never
    )) as unknown;
    const result = ProfileZod.safeParse(item);
    if (result.success) return result.data;
    console.error('[Directus] Profile validation failed:', result.error.flatten());
    return null;
  } catch (err) {
    console.error('[Directus] getProfile failed:', err);
    return null;
  }
}
