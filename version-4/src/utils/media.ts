const imageModules = import.meta.glob<string>(
  "../images/*.{jpg,jpeg,png,gif,webp,svg}",
  {
    eager: true,
    import: "default",
  },
);

const imageByFilename = Object.fromEntries(
  Object.entries(imageModules).map(([path, url]) => {
    const filename = path.split("/").pop()!;
    return [filename, url];
  }),
);

function filenameFromSrc(src: string): string {
  return (
    src
      .replace(/^\/?(?:src\/)?images\//, "")
      .split("/")
      .pop() ?? src
  );
}

/** src/images·public·외부 URL 이미지 경로를 브라우저에서 쓸 수 있는 src로 변환 */
export function resolveMediaUrl(src: string): string {
  if (!src) return src;
  if (src.startsWith("data:") || /^https?:\/\//.test(src)) {
    return src;
  }

  const filename = filenameFromSrc(src);
  const bundled = imageByFilename[filename];
  if (bundled) {
    return bundled;
  }

  return src.startsWith("/") ? src : `/${src}`;
}

/** OG·공유용 절대 URL (로컬 번들 이미지 포함) */
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
