import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/shared/badge';
import { PlainTextContent } from '@/components/shared/plain-text-content';
import { getBlogPostBySlug } from '@/lib/directus';
import { formatDate } from '@/lib/utils';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <Link
        href="/blog"
        className="inline-block text-sm font-bold text-ink/70 hover:text-ink mb-6"
      >
        ← Back to Blog
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-lg text-ink/80 mb-4">{post.summary}</p>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <time className="text-sm text-ink/60">{formatDate(post.published_date)}</time>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t.id} variant="secondary">
                  {t.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {(post.linked_projects?.length ?? 0) > 0 && (
          <div className="mt-3">
            <p className="text-sm font-bold text-ink/70 mb-1">Related projects</p>
            <div className="flex flex-wrap gap-2">
              {post.linked_projects!.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="text-secondary font-bold hover:underline"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <PlainTextContent
        content={post.body}
        markdown
        className="space-y-4 border-[3px] border-black bg-surface p-6 text-base leading-7 text-ink shadow-brutal-sm"
      />
    </article>
  );
}
