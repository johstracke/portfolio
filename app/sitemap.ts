import type { MetadataRoute } from 'next';
import { getProjects, getBlogPosts } from '@/lib/directus';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    getProjects(),
    getBlogPosts(100),
  ]);

  const projectUrls = projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: p.date_updated ? new Date(p.date_updated) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const blogUrls = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.last_updated ? new Date(p.last_updated) : new Date(p.published_date),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/projects`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/now`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  return [...staticUrls, ...projectUrls, ...blogUrls];
}
