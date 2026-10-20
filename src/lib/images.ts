/**
 * Unsplash photo URL from a photo page id (the trailing segment of
 * unsplash.com/photos/<slug>-<id>). The download endpoint redirects to the
 * sized CDN file, which next/image then optimises and caches.
 */
export const unsplash = (id: string, width = 1200) =>
  `https://unsplash.com/photos/${id}/download?w=${width}`;
