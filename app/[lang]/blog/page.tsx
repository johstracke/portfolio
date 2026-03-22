import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPosts } from '@/lib/directus';
import { BlogCard } from '@/components/cards/blog-card';
import { isLocale, type Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Posts about projects, learnings, and reflections.',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function BlogPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  const locale = lang as Locale;
  const posts = await getBlogPosts(20, locale);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold mb-8">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-ink/80">
          No blog posts yet. Add content in Directus to see posts here.
        </p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.id}>
              <BlogCard post={post} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
