import type { ContentBlock } from '@/types';

type Props = Extract<ContentBlock, { type: 'specs' }>;

export function SpecsBlock({ title, rows }: Props) {
  return (
    <div className="border-[3px] border-black bg-surface p-6 shadow-brutal-sm">
      {title && <h3 className="mb-4 text-xl font-bold uppercase tracking-tight">{title}</h3>}
      <div className="divide-y-[2px] divide-black/10">
        {rows.map((row: { key: string; value: string }, i: number) => (
          <div key={i} className="flex justify-between py-3 text-sm">
            <span className="font-medium text-ink/60">{row.key}</span>
            <span className="font-bold text-ink">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
