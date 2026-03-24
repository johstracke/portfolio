import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPosts } from '@/lib/directus';
import { BlogCard } from '@/components/cards/blog-card';
import { isLocale, type Locale, SUPPORTED_LOCALES } from '@/lib/i18n';

const METADATA = {
  en: {
    title: 'Blog',
    description: 'Posts about projects, learnings, and reflections.',
  },
  de: {
    title: 'Blog',
    description: 'Beiträge über Projekte, Erkenntnisse und Überlegungen.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : 'en';
  const meta = METADATA[locale] || METADATA.en;

  const alternates = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `https://johannesjohannes.de/${l}/blog`])
  );

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      languages: alternates,
      canonical: `https://johannesjohannes.de/${locale}/blog`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
    },
  };
}

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
