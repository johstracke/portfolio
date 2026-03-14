import type { Metadata } from 'next';
import { getProfile, getProjects, getBlogPosts } from '@/lib/directus';
import { Button } from '@/components/shared/button';
import { ProjectCard } from '@/components/cards/project-card';
import { BlogCard } from '@/components/cards/blog-card';

export const metadata: Metadata = {
  description:
    'Portfolio showcasing hardware, software, automation, and sustainable systems.',
};

export default async function HomePage() {
  const [profile, projects, blogPosts] = await Promise.all([
    getProfile(),
    getProjects(),
    getBlogPosts(5),
  ]);
  const featuredProjects = projects.slice(0, 3);

  const recentActivity = [
    ...blogPosts.map((p) => ({ type: 'blog' as const, item: p, date: p.published_date })),
    ...projects.slice(0, 5).map((p) => ({
      type: 'project' as const,
      item: p,
      date: p.date_updated ?? p.date_created ?? p.start_date,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Portfolio</h1>
        <p className="text-lg text-ink/80 mb-4 max-w-2xl">
          {profile?.bio ??
            'Building things at the intersection of hardware, software, and sustainable systems.'}
        </p>
        {profile?.current_location && (
          <p className="text-ink/70 mb-2">
            Currently: {profile.current_location}
            {profile.next_location && ` → ${profile.next_location}`}
          </p>
        )}
        {profile?.availability_status && (
          <p className="text-ink/70 mb-6">{profile.availability_status}</p>
        )}
        <div className="flex gap-4">
          <Button href="/projects">View Projects</Button>
          <Button href="/about" variant="outline">
            About
          </Button>
        </div>
      </section>

      {featuredProjects.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold mb-6">Featured Projects</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="mt-6">
            <Button href="/projects" variant="secondary">
              All Projects
            </Button>
          </div>
        </section>
      )}

      {recentActivity.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((entry) =>
              entry.type === 'blog' ? (
                <BlogCard key={`blog-${entry.item.id}`} post={entry.item} />
              ) : (
                <ProjectCard key={`project-${entry.item.id}`} project={entry.item} />
              )
            )}
          </div>
          <div className="mt-6 flex gap-4">
            <Button href="/blog" variant="outline">
              All Posts
            </Button>
            <Button href="/projects" variant="outline">
              All Projects
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
