import { getAssetUrl } from '@/lib/schemas';
import type { ContentBlock } from '@/types';

type Props = Extract<ContentBlock, { type: 'video' }>;

function canRenderInlineVideo(source: string) {
  return /\.(mp4|webm|ogg)$/i.test(source);
}

export function VideoBlock({ content }: Props) {
  const source = content.video_id.startsWith('http')
    ? content.video_id
    : getAssetUrl(content.video_id);

  return (
    <figure className="border-[3px] border-black bg-surface p-4 shadow-brutal-sm">
      {canRenderInlineVideo(source) ? (
        <video
          controls
          autoPlay={content.autoplay}
          className="w-full border-[2px] border-black"
          src={source}
        />
      ) : (
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          className="inline-flex border-[3px] border-black bg-primary px-5 py-3 text-sm font-bold uppercase shadow-brutal-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          Open Video
        </a>
      )}
      {content.caption ? (
        <figcaption className="mt-3 text-sm text-ink/80">{content.caption}</figcaption>
      ) : null}
    </figure>
  );
}
