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
