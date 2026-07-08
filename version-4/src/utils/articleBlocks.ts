import type { Article, ArticleBodyBlock, BodyBlockInput } from "../types/news";

export type EditableBlock = BodyBlockInput & { key: string };

function youtubeThumbnailUrl(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function blockMediaSrc(block: BodyBlockInput): string {
  if (block.mediaUrl) return block.mediaUrl;
  if (block.filePath) {
    return block.filePath.startsWith("/uploads/")
      ? block.filePath
      : `/uploads/${block.filePath}`;
  }
  return "";
}

export function deriveCoverFromBlocks(blocks: BodyBlockInput[]): {
  image?: string;
  isVideo?: boolean;
  videoUrl?: string;
} {
  const firstMedia = blocks.find(
    (block) => block.type === "IMAGE" || block.type === "VIDEO",
  );
  if (!firstMedia) return {};

  const src = blockMediaSrc(firstMedia);
  if (!src) return {};

  if (firstMedia.type === "VIDEO") {
    return {
      image: youtubeThumbnailUrl(src) ?? src,
      isVideo: true,
      videoUrl: firstMedia.mediaUrl ?? src,
    };
  }

  return { image: src, isVideo: false };
}

export function withBlockKeys(blocks: BodyBlockInput[]): EditableBlock[] {
  return blocks.map((block) => ({ ...block, key: crypto.randomUUID() }));
}

export function stripBlockKeys(blocks: EditableBlock[]): BodyBlockInput[] {
  return blocks.map(({ key: _key, ...block }) => block);
}

export function bodyBlockInputToArticleBlock(
  block: BodyBlockInput,
): ArticleBodyBlock | null {
  if (block.type === "TEXT") {
    const text = block.text?.trim();
    return text ? text : null;
  }

  const src =
    block.mediaUrl ??
    (block.filePath
      ? block.filePath.startsWith("/uploads/")
        ? block.filePath
        : `/uploads/${block.filePath}`
      : "");

  if (!src) return null;

  if (block.type === "IMAGE") {
    return { type: "image", src, caption: block.caption };
  }

  return { type: "video", src, caption: block.caption };
}

export function articleBlocksToBodyInput(
  body: ArticleBodyBlock[] | undefined,
): BodyBlockInput[] {
  return (body ?? [])
    .map((block) => {
      if (typeof block === "string") {
        return { type: "TEXT" as const, text: block };
      }

      if (block.type === "image") {
        if (/^https?:\/\//i.test(block.src)) {
          return {
            type: "IMAGE" as const,
            mediaUrl: block.src,
            caption: block.caption,
          };
        }

        const filePath = block.src.replace(/^\/?uploads\//, "");
        return {
          type: "IMAGE" as const,
          filePath,
          caption: block.caption,
        };
      }

      if (/^https?:\/\//i.test(block.src)) {
        return {
          type: "VIDEO" as const,
          mediaUrl: block.src,
          caption: block.caption,
        };
      }

      return {
        type: "VIDEO" as const,
        filePath: block.src.replace(/^\/?uploads\//, ""),
        caption: block.caption,
      };
    })
    .filter((block) => {
      if (block.type === "TEXT") return (block.text ?? "").trim().length > 0;
      return Boolean(block.mediaUrl || block.filePath);
    });
}

export function blocksToArticleBody(
  blocks: BodyBlockInput[],
): ArticleBodyBlock[] {
  return blocks
    .map(bodyBlockInputToArticleBlock)
    .filter((block): block is ArticleBodyBlock => block !== null);
}

export function mergeArticleWithBlocks(
  article: Article,
  blocks: BodyBlockInput[],
  patch: { title: string; sectionId: string },
): Article {
  const cover = deriveCoverFromBlocks(blocks);

  return {
    ...article,
    title: patch.title,
    section: patch.sectionId as Article["section"],
    body: blocksToArticleBody(blocks),
    image: cover.image,
    isVideo: cover.isVideo,
    videoUrl: cover.videoUrl,
  };
}
