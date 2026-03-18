import type { Metadata } from 'next';
import { Badge } from '@/components/shared/badge';
import { Button } from '@/components/shared/button';
import { PlainTextContent } from '@/components/shared/plain-text-content';
import { getProfile, getProjects } from '@/lib/directus';

export const metadata: Metadata = {
  title: 'About',
  description: 'Personal story, context, and capabilities.',
};

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12 max-w-3xl">
        <h1 className="font-display mb-6 text-4xl font-bold md:text-5xl">About</h1>
        <PlainTextContent
          content={
            profile?.bio ??
            'I build across hardware, software, and sustainable systems, with a focus on learning in public and shipping practical work.'
          }
          markdown
          className="space-y-4 text-lg leading-8 text-ink/85"
        />
      </section>

      <section className="mb-12 grid gap-6 md:grid-cols-2">
        <div className="border-[3px] border-black bg-surface p-6 shadow-brutal-sm">
          <h2 className="mb-4 text-2xl font-bold">Context</h2>
          <div className="space-y-3 text-ink/80">
            <p>
              <span className="font-bold text-ink">Current location:</span>{' '}
              {profile?.current_location ?? 'Add this in Directus'}
            </p>
            <p>
              <span className="font-bold text-ink">Next location:</span>{' '}
              {profile?.next_location ?? 'Add this in Directus'}
            </p>
            <p>
              <span className="font-bold text-ink">Availability:</span>{' '}
              {profile?.availability_status ?? 'Set your current availability in Directus'}
            </p>
          </div>
        </div>

        <div className="border-[3px] border-black bg-surface p-6 shadow-brutal-sm">
          <h2 className="mb-4 text-2xl font-bold">Capabilities</h2>
          <div className="flex flex-wrap gap-2">
            {(profile?.skills?.length ? profile.skills : ['Hardware', 'Software', 'Automation']).map(
              (skill) => (
                <Badge key={skill} variant="primary">
                  {skill}
                </Badge>
              )
            )}
          </div>
          {profile?.languages?.length ? (
            <div className="mt-5">
              <p className="mb-2 text-sm font-bold uppercase text-ink/70">Languages</p>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((language) => (
                  <Badge key={language}>{language}</Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Recent Work</h2>
          <Button href="/projects" variant="outline">
            View All Projects
          </Button>
        </div>
        {recentProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="border-[3px] border-black bg-surface p-5 shadow-brutal-sm"
              >
                <h3 className="mb-2 text-xl font-bold">{project.title}</h3>
                <p className="text-sm text-ink/80">{project.short_summary}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink/80">Add projects in Directus to surface recent work here.</p>
        )}
      </section>

      <section className="border-[3px] border-black bg-secondary p-6 text-white shadow-brutal-sm">
        <h2 className="mb-3 text-2xl font-bold">Contact</h2>
        <p className="mb-4 text-white/90">
          {profile?.contact_email ? (
            <>
              Reach out at{' '}
              <a
                href={`mailto:${profile.contact_email}`}
                className="underline hover:no-underline"
              >
                {profile.contact_email}
              </a>{' '}
              for collaborations, project work, or conversations.
            </>
          ) : (
            'Add your contact email in Directus to make this section live.'
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          {profile?.github_url ? (
            <Button href={profile.github_url} variant="outline" className="bg-white text-ink">
              GitHub
            </Button>
          ) : null}
          {profile?.linkedin_url ? (
            <Button href={profile.linkedin_url} variant="outline" className="bg-white text-ink">
              LinkedIn
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
