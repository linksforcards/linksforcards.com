export function Breadcrumbs({ label, items }: { label: string; items: { name: string; href: string }[] }) {
  return (
    <nav className="crumbs" aria-label={label}>
      <ol>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.href}>
              {last ? <span aria-current="page">{item.name}</span> : <a href={item.href}>{item.name}</a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
