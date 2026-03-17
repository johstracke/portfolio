import { getAssetUrl } from '@/lib/schemas';
import type { ContentBlock } from '@/types';

type Props = Extract<ContentBlock, { type: 'video' }>;

function canRenderInlineVideo(source: string) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(source);
}

export function VideoBlock({ video_id, caption, autoplay }: Props) {
  const isExternal = video_id.startsWith('http');
  const src = isExternal ? video_id : getAssetUrl(video_id);
  const renderInline = !isExternal || canRenderInlineVideo(src);

  return (
    <figure className="border-[3px] border-black bg-surface shadow-brutal-sm overflow-hidden">
      <div className="aspect-video bg-black relative">
        {renderInline ? (
          <video
            src={src}
            controls
            autoPlay={autoplay}
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <iframe
            src={src}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
          />
        )}
      </div>
      {caption && (
        <figcaption className="p-3 text-sm text-ink/80 border-t-[3px] border-black bg-white">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
