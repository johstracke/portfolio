import { PlainTextContent } from '@/components/shared/plain-text-content';
import ReactMarkdown from 'react-markdown';
import { Info, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import type { ContentBlock } from '@/lib/schemas';

type Props = Extract<ContentBlock, { type: 'callout' }>;

const bgColors = {
  info: 'bg-accent text-ink',
  warning: 'bg-primary text-ink',
  success: 'bg-[#C7F9CC] text-ink',
  tip: 'bg-[#BDE0FE] text-ink',
};

const icons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  tip: Lightbulb,
};

export function CalloutBlock({ content, callout_type }: Props) {
  const type = (callout_type ?? 'info') as keyof typeof icons;
  const Icon = icons[type];

  return (
    <div className={`flex gap-4 border-[3px] border-black p-6 shadow-brutal-sm ${bgColors[type]}`}>
      <div className="mt-1 shrink-0">
        <Icon size={24} />
      </div>
      <div className="text-base leading-relaxed text-ink">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
