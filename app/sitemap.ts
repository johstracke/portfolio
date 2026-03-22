import type { MetadataRoute } from 'next';
import { getProjects, getBlogPosts } from '@/lib/directus';
import { SUPPORTED_LOCALES, withLocalePath } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    getProjects(),
    getBlogPosts(100),
  ]);

  const localizedStaticUrls: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) => [
    { url: `${SITE_URL}${withLocalePath(locale, '/')}`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}${withLocalePath(locale, '/projects')}`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}${withLocalePath(locale, '/blog')}`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}${withLocalePath(locale, '/about')}`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}${withLocalePath(locale, '/now')}`, changeFrequency: 'weekly', priority: 0.8 },
  ]);

  const projectUrls = SUPPORTED_LOCALES.flatMap((locale) =>
    projects.map((p) => ({
      url: `${SITE_URL}${withLocalePath(locale, `/projects/${p.slug}`)}`,
      lastModified: p.date_updated ? new Date(p.date_updated) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  );

  const blogUrls = SUPPORTED_LOCALES.flatMap((locale) =>
    posts.map((p) => ({
      url: `${SITE_URL}${withLocalePath(locale, `/blog/${p.slug}`)}`,
      lastModified: p.last_updated ? new Date(p.last_updated) : new Date(p.published_date),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  return [...localizedStaticUrls, ...projectUrls, ...blogUrls];
}
