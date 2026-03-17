import { File as FileIcon } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { getAssetUrl } from '@/lib/schemas';
import type { ContentBlock } from '@/lib/schemas';

type Props = Extract<ContentBlock, { type: 'cad' }>;

export function CADBlock({ file_id, description, viewer_type }: Props) {
  return (
    <div className="flex items-center gap-4 bg-surface border-[3px] border-black p-6 shadow-brutal-sm">
      <div className="bg-black p-3 text-white">
        <FileIcon size={32} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-1">{description || 'CAD Model'}</h3>
        <p className="text-sm text-ink/60 mb-4 capitalize">View Mode: {viewer_type?.replace('_', ' ')}</p>
        <Button
          href={getAssetUrl(file_id)}
          className="text-xs"
          variant="secondary"
        >
          Download CAD File
        </Button>
      </div>
    </div>
  );
}
