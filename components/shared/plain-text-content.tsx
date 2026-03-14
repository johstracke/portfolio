import { MarkdownContent } from './markdown-content';

type PlainTextContentProps = {
  content: string;
  className?: string;
  /** When true, renders content as markdown. Use for blog body and rich-text fields. */
  markdown?: boolean;
};

export function PlainTextContent({
  content,
  className = '',
  markdown = false,
}: PlainTextContentProps) {
  if (!content?.trim()) return null;

  if (markdown) {
    return <MarkdownContent content={content} className={className} />;
  }

  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div className={className}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
