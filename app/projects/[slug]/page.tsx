import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProjectBySlug } from '@/lib/directus';
import { BlockRenderer } from '@/components/blocks/block-renderer';
import { Badge } from '@/components/shared/badge';
import { getAssetUrl } from '@/lib/schemas';
import { formatDate } from '@/lib/utils';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const blocks = project.content_blocks ?? [];

  return (
    <article className="container mx-auto px-4 py-12">
      <Link
        href="/projects"
        className="inline-block text-sm font-bold text-ink/70 hover:text-ink mb-6"
      >
        ← Back to Projects
      </Link>

      <header className="mb-8">
        <div className="relative aspect-video max-w-4xl mx-auto mb-6 overflow-hidden border-[3px] border-black shadow-brutal">
          <Image
            src={getAssetUrl(project.thumbnail)}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
        <p className="text-lg text-ink/80 mb-4">{project.short_summary}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="primary">{project.status}</Badge>
          {project.domains?.map((d) => (
            <Badge key={d}>{d}</Badge>
          ))}
          {project.tags?.map((t) => (
            <Badge key={t.id} variant="secondary">
              {t.name}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-ink/60">
          {formatDate(project.start_date)}
          {project.end_date && ` – ${formatDate(project.end_date)}`}
        </p>
      </header>

      <div className="max-w-3xl">
        <BlockRenderer blocks={blocks} />
      </div>
    </article>
  );
}
