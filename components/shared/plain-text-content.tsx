type PlainTextContentProps = {
  content: string;
  className?: string;
};

export function PlainTextContent({
  content,
  className = '',
}: PlainTextContentProps) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return null;
  }

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
