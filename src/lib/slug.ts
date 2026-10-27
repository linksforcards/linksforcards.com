/**
 * Stable URL piece. Symbols that are not letters are spelled out so two Unown
 * and two Nidoran cards do not collapse into one slug.
 */
export function slugPart(value: string): string {
  const replaced = value
    .replace(/♂/g, "-m")
    .replace(/♀/g, "-f")
    .replace(/[δ∆Δ]/g, "-delta")
    .replace(/α/g, "-alpha")
    .replace(/β/g, "-beta")
    .replace(/γ/g, "-gamma")
    .replace(/★/g, "-star")
    .replace(/◇/g, "-prism")
    .replace(/!/g, "-excl")
    .replace(/\?/g, "-qmark")
    .replace(/['’]/g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return replaced.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function cardSlug(setId: string, card: { n: string; name: string }): string {
  const number = slugPart(card.n);
  const name = slugPart(card.name);
  if (!number) return name ? `${setId}-card-${name}` : `${setId}-card`;
  return name ? `${setId}-${number}-${name}` : `${setId}-${number}`;
}

export function cardPath(setId: string, card: { n: string; name: string }): string {
  return `/cards/${cardSlug(setId, card)}`;
}
