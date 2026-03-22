import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/directus';
import { Badge } from '@/components/shared/badge';
import { getAssetUrl } from '@/lib/schemas';
import { formatDate } from '@/lib/utils';
import { DEFAULT_LOCALE, type Locale, withLocalePath } from '@/lib/i18n';

type Props = {
  project: Project;
  locale?: Locale;
};

export function ProjectCard({ project, locale = DEFAULT_LOCALE }: Props) {
  return (
    <Link
      href={withLocalePath(locale, `/projects/${project.slug}`)}
      className="block border-[3px] border-black bg-surface shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
    >
      <div className="relative aspect-video overflow-hidden border-b-[3px] border-black">
        <Image
          src={getAssetUrl(project.thumbnail)}
          alt={project.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
        <p className="text-sm text-ink/80 mb-3 line-clamp-2">{project.short_summary}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">{project.status}</Badge>
          {project.domains?.slice(0, 2).map((d) => (
            <Badge key={d}>{d}</Badge>
          ))}
        </div>
        <p className="text-xs text-ink/60 mt-2">{formatDate(project.start_date ?? undefined)}</p>
      </div>
    </Link>
  );
}
