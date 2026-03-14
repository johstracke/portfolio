import type { Metadata } from 'next';
import { getProfile, getProjects, getBlogPosts } from '@/lib/directus';
import { Button } from '@/components/shared/button';
import { ProjectCard } from '@/components/cards/project-card';
import { BlogCard } from '@/components/cards/blog-card';

export const metadata: Metadata = {
  description:
    'Portfolio showcasing hardware, software, automation, and sustainable systems.',
};

const WHAT_I_BUILD = [
  {
    label: 'Hardware',
    description: 'Embedded systems, PCB design, mechanical builds, and physical prototypes.',
  },
  {
    label: 'Software',
    description: 'Web apps, automation scripts, data pipelines, and developer tooling.',
  },
  {
    label: 'Systems',
    description: 'Closing the loop between hardware and software in sustainable, practical work.',
  },
] as const;

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
      {/* Hero */}
      <section className="mb-16 max-w-2xl">
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 leading-tight">
          {profile?.bio ? 'Hi, I\'m Johannes.' : 'Portfolio'}
        </h1>
        <p className="text-lg text-ink/80 mb-6 leading-relaxed">
          {profile?.bio ??
            'Building things at the intersection of hardware, software, and sustainable systems.'}
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {profile?.current_location && (
            <span className="border-[3px] border-black bg-surface px-3 py-1 text-sm font-bold shadow-brutal-sm">
              📍 {profile.current_location}
              {profile.next_location && ` → ${profile.next_location}`}
            </span>
          )}
          {profile?.availability_status && (
            <span className="border-[3px] border-black bg-primary px-3 py-1 text-sm font-bold shadow-brutal-sm">
              {profile.availability_status}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <Button href="/projects">View Projects</Button>
          <Button href="/about" variant="outline">About</Button>
        </div>
      </section>

      {/* What I Build */}
      <section className="mb-16">
        <h2 className="font-display text-2xl font-bold mb-6">What I Build</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {WHAT_I_BUILD.map(({ label, description }) => (
            <div
              key={label}
              className="border-[3px] border-black bg-surface p-5 shadow-brutal-sm"
            >
              <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">{label}</h3>
              <p className="text-sm text-ink/75 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6">Featured Projects</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="mt-6">
            <Button href="/projects" variant="secondary">All Projects</Button>
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <section>
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
          <div className="mt-6 flex flex-wrap gap-4">
            <Button href="/blog" variant="outline">All Posts</Button>
            <Button href="/projects" variant="outline">All Projects</Button>
          </div>
        </section>
      )}
    </div>
  );
}
