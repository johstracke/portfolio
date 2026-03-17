import type { ContentBlock } from '@/lib/schemas';

type Props = Extract<ContentBlock, { type: 'code' }>;

export function CodeBlock({ code, language, description, filename }: Props) {
  return (
    <div className="space-y-3 bg-surface border-[3px] border-black p-6 shadow-brutal-sm">
      {filename && (
        <div className="flex items-center gap-2 border-b-[2px] border-black pb-2 mb-2">
          <span className="text-xs font-mono font-bold text-ink/50 uppercase tracking-widest">File:</span>
          <span className="text-xs font-mono font-bold text-brand">{filename}</span>
        </div>
      )}
      {description && <p className="text-sm font-medium text-ink/70">{description}</p>}
      <div className="relative overflow-x-auto bg-[#1A1A1A] p-4 text-sm text-pink-400 font-mono border-[2px] border-black">
        <pre className="whitespace-pre-wrap break-all">
          <code className={language ? `language-${language}` : ''}>{code}</code>
        </pre>
      </div>
    </div>
  );
}
