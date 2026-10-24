export function RelatedLinks({
  label,
  links,
}: {
  label: string;
  links: { href: string; name: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <nav className="related" aria-label={label}>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
