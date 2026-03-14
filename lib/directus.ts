import {
  authentication,
  createDirectus,
  readItems,
  readSingleton,
  rest,
} from '@directus/sdk';
import { z } from 'zod';
import {
  ProjectSchema as ProjectZod,
  BlogPostSchema as BlogPostZod,
  ProfileSchema as ProfileZod,
} from '@/lib/schemas';

const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_EMAIL = process.env.DIRECTUS_EMAIL || process.env.ADMIN_EMAIL;
const DIRECTUS_PASSWORD = process.env.DIRECTUS_PASSWORD || process.env.ADMIN_PASSWORD;

export type Project = z.infer<typeof ProjectZod>;
export type BlogPost = z.infer<typeof BlogPostZod>;
export type Profile = z.infer<typeof ProfileZod>;

export type ProjectsFilter = {
  domain?: string;
  tag?: string;
  status?: string;
  search?: string;
};

async function getCmsClient() {
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
      fields: ['*'],
      sort: ['-start_date'],
    };

    if (filters?.status) {
      query.filter = { ...(query.filter as object), status: { _eq: filters.status } };
    }
    if (filters?.domain) {
      query.filter = { ...(query.filter as object), domains: { _contains: filters.domain } };
    }
    if (filters?.search) {
      query.search = filters.search;
    }

    const items = await cmsClient.request(
      readItems('projects', query as never)
    ) as unknown[];

      return items
      .map((item) => ProjectZod.safeParse(item))
      .filter((r): r is { success: true; data: Project } => r.success)
      .map((r) => r.data);
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const cmsClient = await getCmsClient();
    const items = (await cmsClient.request(
      readItems('projects', {
        filter: { slug: { _eq: slug } },
        fields: ['*'],
        limit: 1,
      } as never)
    )) as unknown[];

    const item = items[0];
    if (!item) return null;

    const contentBlocks = (await cmsClient.request(
      readItems('content_blocks', {
        filter: { project_id: { _eq: (item as { id: string | number }).id } },
        fields: ['*'],
        sort: ['sort'],
      } as never)
    )) as unknown[];

    const result = ProjectZod.safeParse({
      ...item,
      content_blocks: contentBlocks,
    });
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function getBlogPosts(limit = 20): Promise<BlogPost[]> {
  try {
    const cmsClient = await getCmsClient();
    const items = (await cmsClient.request(
      readItems('blog_posts', {
        filter: { is_draft: { _eq: false } },
        fields: ['*'],
        sort: ['-published_date'],
        limit,
      } as never)
    )) as unknown[];

    return items
      .map((item) => BlogPostZod.safeParse(item))
      .filter((r): r is { success: true; data: BlogPost } => r.success)
      .map((r) => r.data);
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const cmsClient = await getCmsClient();
    const items = (await cmsClient.request(
      readItems('blog_posts', {
        filter: { slug: { _eq: slug }, is_draft: { _eq: false } },
        fields: ['*'],
        limit: 1,
      } as never)
    )) as unknown[];

    const item = items[0];
    if (!item) return null;
    const result = BlogPostZod.safeParse(item);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const cmsClient = await getCmsClient();
    const item = (await cmsClient.request(
      readSingleton('profile' as never) as never
    )) as unknown;
    const result = ProfileZod.safeParse(item);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
