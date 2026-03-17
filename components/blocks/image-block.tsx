import Image from 'next/image';
import type { ContentBlock } from '@/types';
import { getAssetUrl } from '@/lib/schemas';

type Props = Extract<ContentBlock, { type: 'image' }>;

const sizeClasses = {
  small: 'max-w-sm',
  medium: 'max-w-md',
  large: 'max-w-2xl',
  'full-width': 'w-full',
};

export function ImageBlock({ image_id, caption, size }: Props) {
  const src = getAssetUrl(image_id);
  const currentSize = (size ?? 'medium') as keyof typeof sizeClasses;

  return (
    <figure className={`${sizeClasses[currentSize]} border-[3px] border-black bg-surface shadow-brutal-sm overflow-hidden`}>
      <Image
        src={src}
        alt={caption ?? ''}
        width={800}
        height={600}
        className="w-full h-auto object-cover"
      />
      {caption && (
        <figcaption className="p-3 text-sm text-ink/80 border-t-[3px] border-black">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
