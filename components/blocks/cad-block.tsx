import { Button } from '@/components/shared/button';
import { getAssetUrl } from '@/lib/schemas';
import type { ContentBlock } from '@/types';

type Props = Extract<ContentBlock, { type: 'cad' }>;

export function CadBlock({ content }: Props) {
  return (
    <section className="border-[3px] border-black bg-surface p-5 shadow-brutal-sm">
      <h3 className="mb-3 text-xl font-bold">CAD File</h3>
      <p className="mb-4 text-sm text-ink/80">
        {content.description ?? 'Download or preview the referenced CAD asset.'}
      </p>
      <Button href={getAssetUrl(content.file_id)} variant="secondary">
        Open Asset
      </Button>
    </section>
  );
}
