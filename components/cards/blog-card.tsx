import Link from 'next/link';
import type { BlogPost } from '@/lib/directus';
import { Badge } from '@/components/shared/badge';
import { formatDate } from '@/lib/utils';
import { DEFAULT_LOCALE, type Locale, withLocalePath } from '@/lib/i18n';

type Props = {
  post: BlogPost;
  locale?: Locale;
};

export function BlogCard({ post, locale = DEFAULT_LOCALE }: Props) {
  return (
    <Link
      href={withLocalePath(locale, `/blog/${post.slug}`)}
      className="block border-[3px] border-black bg-surface p-6 shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
    >
      <h2 className="text-xl font-bold mb-2">{post.title}</h2>
      <p className="text-ink/80 mb-2">{post.summary}</p>
      <div className="flex flex-wrap items-center gap-2">
        <time className="text-sm text-ink/60">{formatDate(post.published_date)}</time>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((t) => (
              <Badge key={t.id} variant="secondary">
                {t.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
