export function PlainText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter((block) => block.trim());
  return (
    <div className="plain">
      {blocks.map((block) => (
        <p key={block.slice(0, 40)}>{block}</p>
      ))}
    </div>
  );
}
