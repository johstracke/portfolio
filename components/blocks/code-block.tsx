import type { ContentBlock } from '@/types';

type Props = Extract<ContentBlock, { type: 'code' }>;

export function CodeBlock({ content }: Props) {
  return (
    <div className="border-[3px] border-black bg-ink text-white p-4 shadow-brutal-sm overflow-x-auto">
      {content.filename && (
        <div className="text-xs text-white/70 mb-2 font-mono">{content.filename}</div>
      )}
      <pre className="font-mono text-sm whitespace-pre">
        <code>{content.code}</code>
      </pre>
      {content.description && (
        <p className="mt-2 text-sm text-white/80">{content.description}</p>
      )}
    </div>
  );
}
