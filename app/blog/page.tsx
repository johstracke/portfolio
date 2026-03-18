import type { Metadata } from 'next';
import { getBlogPosts } from '@/lib/directus';
import { BlogCard } from '@/components/cards/blog-card';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Posts about projects, learnings, and reflections.',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = await getBlogPosts();

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
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
