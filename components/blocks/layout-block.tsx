import { BlockRenderer } from './block-renderer';
import type { ContentBlock } from '@/lib/schemas';

type Props = Extract<ContentBlock, { type: 'layout' }>;

const gapClasses = {
  small: 'gap-4',
  medium: 'gap-8',
  large: 'gap-12',
};

const gridClasses = {
  'two-column': 'md:grid-cols-2',
  'sidebar-left': 'md:grid-cols-[300px_1fr]',
  'sidebar-right': 'md:grid-cols-[1fr_300px]',
};

export function LayoutBlock({
  layout_type = 'two-column',
  left_blocks = [],
  right_blocks = [],
  gap = 'medium',
}: Props) {
  const layoutClass = gridClasses[layout_type as keyof typeof gridClasses];
  const gapClass = gapClasses[gap as keyof typeof gapClasses];

  return (
    <div
      className={`grid grid-cols-1 ${layoutClass} ${gapClass} mb-8`}
    >
      <BlockRenderer blocks={left_blocks ?? []} />
      <BlockRenderer blocks={right_blocks ?? []} />
    </div>
  );
}
