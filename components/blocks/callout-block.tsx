import { PlainTextContent } from '@/components/shared/plain-text-content';
import type { ContentBlock } from '@/types';

type Props = Extract<ContentBlock, { type: 'callout' }>;

const toneClasses = {
  info: 'bg-accent text-ink',
  warning: 'bg-primary text-ink',
  success: 'bg-[#C7F9CC] text-ink',
  tip: 'bg-secondary text-white',
};

export function CalloutBlock({ content }: Props) {
  const tone = content.callout_type ?? 'info';

  return (
    <section className={`border-[3px] border-black p-5 shadow-brutal-sm ${toneClasses[tone]}`}>
      <p className="mb-3 text-xs font-bold uppercase tracking-wide">
        {tone}
      </p>
      <PlainTextContent content={content.content} className="space-y-3 text-sm leading-6" />
    </section>
  );
}
