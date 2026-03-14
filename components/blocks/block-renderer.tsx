import type { ContentBlock } from '@/types';
import { parseContentBlock } from '@/lib/schemas';
import { TextBlock } from './text-block';
import { ImageBlock } from './image-block';
import { GalleryBlock } from './gallery-block';
import { CodeBlock } from './code-block';
import { VideoBlock } from './video-block';
import { CadBlock } from './cad-block';
import { SpecsBlock } from './specs-block';
import { CalloutBlock } from './callout-block';

type Props = {
  blocks: unknown[];
};

export function BlockRenderer({ blocks }: Props) {
  const validated = blocks
    .map((raw) => parseContentBlock(raw))
    .filter((b): b is ContentBlock => b !== null)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

  return (
    <div className="space-y-8">
      {validated.map((block, i) => {
        switch (block.type) {
          case 'text':
            return <TextBlock key={block.id ?? i} {...block} />;
          case 'image':
            return <ImageBlock key={block.id ?? i} {...block} />;
          case 'gallery':
            return <GalleryBlock key={block.id ?? i} {...block} />;
          case 'code':
            return <CodeBlock key={block.id ?? i} {...block} />;
          case 'video':
            return <VideoBlock key={block.id ?? i} {...block} />;
          case 'cad':
            return <CadBlock key={block.id ?? i} {...block} />;
          case 'specs':
            return <SpecsBlock key={block.id ?? i} {...block} />;
          case 'callout':
            return <CalloutBlock key={block.id ?? i} {...block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
