/** 외부 URL·업로드 파일 경로를 브라우저에서 쓸 수 있는 src로 변환 */
export function resolveMediaUrl(src: string): string {
  if (!src) return src;
  if (src.startsWith("data:") || /^https?:\/\//.test(src)) {
    return src;
  }

  if (src.startsWith("/uploads/")) {
    const apiBase = import.meta.env.VITE_API_URL ?? "/api";
    const origin = apiBase.replace(/\/api\/?$/, "");
    return `${origin}${src}`;
  }

  if (/^images\//.test(src)) {
    const apiBase = import.meta.env.VITE_API_URL ?? "/api";
    const origin = apiBase.replace(/\/api\/?$/, "");
    return `${origin}/uploads/${src}`;
  }

  return src.startsWith("/") ? src : `/${src}`;
}

/** OG·공유용 절대 URL */
export function resolveAbsoluteMediaUrl(src: string): string {
  const resolved = resolveMediaUrl(src);
  if (!resolved) return "";
  if (/^https?:\/\//i.test(resolved)) return resolved;

  const base = (
    import.meta.env.VITE_SITE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://newsin.kr")
  ).replace(/\/$/, "");

  return `${base}${resolved.startsWith("/") ? resolved : `/${resolved}`}`;
}
