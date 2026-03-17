import Image from 'next/image';
import type { ContentBlock } from '@/types';
import { getAssetUrl } from '@/lib/schemas';

type Props = Extract<ContentBlock, { type: 'gallery' }>;

const layoutClasses = {
  grid: 'grid grid-cols-2 md:grid-cols-3 gap-4',
  carousel: 'flex overflow-x-auto gap-4 snap-x snap-mandatory',
  masonry: 'columns-2 md:columns-3 gap-4 space-y-4',
};

export function GalleryBlock({ images, layout, caption }: Props) {
  const currentLayout = (layout ?? 'grid') as keyof typeof layoutClasses;

  return (
    <figure className="border-[3px] border-black bg-surface p-4 shadow-brutal-sm">
      <div className={layoutClasses[currentLayout]}>
        {images.map((id: string, i: number) => (
          <div key={id} className="relative overflow-hidden border-[2px] border-black">
            <Image
              src={getAssetUrl(id)}
              alt={`Gallery image ${i + 1}`}
              width={400}
              height={300}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm text-ink/80">{caption}</figcaption>
      )}
    </figure>
  );
}
