// Keep crawlers able to read these directives; robots.txt disallow can hide noindex.
export const ADMIN_ROBOTS = {
  index: false,
  follow: false,
  noarchive: true,
  nosnippet: true,
  noimageindex: true,
} as const;

export const ADMIN_ROBOTS_HEADER = "noindex, nofollow, noarchive, nosnippet, noimageindex";
