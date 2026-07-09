export const YOUTUBE_ID_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/;

export function extractYoutubeId(url: string): string | null {
  return url.match(YOUTUBE_ID_REGEX)?.[1] ?? null;
}

export function youtubeEmbedUrl(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function youtubeThumbnailUrl(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function isYoutubeUrl(url: string): boolean {
  return /youtu\.be|youtube\.com/.test(url);
}
