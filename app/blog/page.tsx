import Link from 'next/link';
import { getBlogPosts } from '@/lib/directus';
import { formatDate } from '@/lib/utils';

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-ink/80">
          No blog posts yet. Add content in Directus to see posts here.
        </p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="block border-[3px] border-black bg-surface p-6 shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-ink/80 mb-2">{post.summary}</p>
                <time className="text-sm text-ink/60">{formatDate(post.published_date)}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
