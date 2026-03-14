import type { ContentBlock } from '@/types';

type Props = Extract<ContentBlock, { type: 'specs' }>;

export function SpecsBlock({ content }: Props) {
  return (
    <section className="border-[3px] border-black bg-surface p-5 shadow-brutal-sm">
      {content.title ? <h3 className="mb-4 text-xl font-bold">{content.title}</h3> : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {content.rows.map((row) => (
              <tr key={`${row.key}-${row.value}`} className="border-t-[2px] border-black first:border-t-0">
                <th className="w-1/3 py-3 pr-4 text-left align-top text-sm font-bold uppercase">
                  {row.key}
                </th>
                <td className="py-3 text-sm text-ink/85">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
