import { getProfile, getProjects } from '@/lib/directus';
import { Button } from '@/components/shared/button';
import { ProjectCard } from '@/components/cards/project-card';

export default async function HomePage() {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Portfolio</h1>
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
          <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
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
    </div>
  );
}
