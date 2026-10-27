/** Keep map package aliases out of public guide URLs and the large guide data out of the homepage bundle. */
export function stateGuideHref(mapId: string) {
  const slug = mapId === "fct"
    ? "federal-capital-territory"
    : mapId === "nassarawa" ? "nasarawa" : mapId;
  return `/states/${encodeURIComponent(slug)}`;
}
