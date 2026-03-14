import { PlainTextContent } from '@/components/shared/plain-text-content';
import type { ContentBlock } from '@/types';

type Props = Extract<ContentBlock, { type: 'text' }>;

export function TextBlock({ content }: Props) {
  return (
    <PlainTextContent
      content={content.content}
      className="space-y-4 border-[3px] border-black bg-surface p-6 text-base leading-7 text-ink shadow-brutal-sm"
    />
  );
}
