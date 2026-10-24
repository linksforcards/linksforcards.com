export function ShopLink({ name, website }: { name: string; website: string | null }) {
  if (!website) return <strong>{name}</strong>;
  return <a href={website}>{name}</a>;
}
