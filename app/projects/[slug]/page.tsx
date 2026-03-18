import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProjectBySlug, getBlogPostsForProject } from '@/lib/directus';
import { BlockRenderer } from '@/components/blocks/block-renderer';
import { Badge } from '@/components/shared/badge';
import { getAssetUrl } from '@/lib/schemas';
import { formatDate } from '@/lib/utils';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title ?? '',
    description: project.short_summary ?? '',
    openGraph: {
      title: project.title ?? '',
      description: project.short_summary ?? '',
      images: [{ url: getAssetUrl(project.thumbnail ?? undefined), alt: project.title ?? '' }],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const relatedPosts = project ? await getBlogPostsForProject(project.id) : [];

  if (!project) {
    notFound();
  }

  const blocks = project.blocks ?? [];
  const hasMeta =
    (project.tools_used?.length ?? 0) > 0 ||
    (project.collaborators?.length ?? 0) > 0 ||
    project.duration ||
    project.github_repo ||
    (project.external_links?.length ?? 0) > 0;

  return (
    <article className="mx-auto w-full max-w-[1600px] px-4 py-12">
      <Link
        href="/projects"
        className="inline-block text-sm font-bold text-ink/70 hover:text-ink mb-6"
      >
        ← Back to Projects
      </Link>

      <header className="mb-8">
        <div className="relative aspect-video max-w-4xl mx-auto mb-6 overflow-hidden border-[3px] border-black shadow-brutal">
          <Image
            src={getAssetUrl(project.thumbnail ?? undefined)}
            alt={project.title ?? ''}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
        <p className="text-lg text-ink/80 mb-4">{project.short_summary}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="primary">{project.status}</Badge>
          {project.domains?.map((d) => (
            <Badge key={d}>{d}</Badge>
          ))}
          {project.tags?.map((t) => (
            <Link
              key={t.id}
              href={`/projects?tag=${encodeURIComponent(t.slug)}`}
              className="hover:opacity-80 transition-opacity"
            >
              <Badge variant="secondary">{t.name}</Badge>
            </Link>
          ))}
        </div>
        <p className="text-sm text-ink/60">
          {formatDate(project.start_date ?? undefined)}
          {project.end_date && ` – ${formatDate(project.end_date ?? undefined)}`}
        </p>
      </header>

      <div className={hasMeta ? 'grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]' : ''}>
        {hasMeta && (
          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="border-[3px] border-black bg-surface p-6 shadow-brutal-sm space-y-4">
              <h2 className="text-lg font-bold uppercase text-ink/70">Details</h2>
              {project.duration && (
                <p>
                  <span className="font-bold text-ink">Duration:</span> {project.duration}
                </p>
              )}
              {(project.tools_used?.length ?? 0) > 0 && (
                <div>
                  <p className="font-bold text-ink mb-1">Tools</p>
                  <div className="flex flex-wrap gap-1">
                    {project.tools_used!.map((tool) => (
                      <Badge key={tool ?? ''} variant="secondary">
                        {tool ?? ''}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(project.collaborators?.length ?? 0) > 0 && (
                <div>
                  <p className="font-bold text-ink mb-1">Collaborators</p>
                  <ul className="text-sm text-ink/80 space-y-1">
                    {project.collaborators!.map((c, i) => (
                      <li key={i}>{typeof c === 'string' ? c : String((c as { name?: string })?.name ?? c)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {project.github_repo && (
                <a
                  href={project.github_repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-secondary font-bold hover:underline"
                >
                  View on GitHub →
                </a>
              )}
              {(project.external_links?.length ?? 0) > 0 && (
                <div>
                  <p className="font-bold text-ink mb-1">Links</p>
                  <ul className="space-y-1">
                    {project.external_links!.map((url, i) => (
                      <li key={i}>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-secondary text-sm hover:underline">
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        )}
        <div className="min-w-0 w-full">
          <BlockRenderer blocks={blocks} />
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t-[3px] border-black">
          <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
          <ul className="space-y-3">
            {relatedPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug ?? ''}`}
                  className="block border-[3px] border-black bg-surface p-4 shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <h3 className="font-bold">{post.title}</h3>
                  <p className="text-sm text-ink/70">{formatDate(post.published_date ?? undefined)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
