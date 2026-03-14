import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PlainTextContent } from '@/components/shared/plain-text-content';
import { getBlogPostBySlug } from '@/lib/directus';
import { formatDate } from '@/lib/utils';

type Props = {
  params: Promise<{ slug: string }>;
};

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
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-lg text-ink/80 mb-4">{post.summary}</p>
        <time className="text-sm text-ink/60">{formatDate(post.published_date)}</time>
      </header>

      <PlainTextContent
        content={post.body}
        className="space-y-4 border-[3px] border-black bg-surface p-6 text-base leading-7 text-ink shadow-brutal-sm"
      />
    </article>
  );
}
