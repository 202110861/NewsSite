type ArticleBlockType = "TEXT" | "IMAGE" | "VIDEO";
type ArticleStatus = "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";

interface ArticleBodyBlockRow {
  type: ArticleBlockType;
  sortOrder: number;
  text: string | null;
  mediaUrl: string | null;
  filePath: string | null;
  caption: string | null;
}

interface ArticleRow {
  id: string;
  title: string;
  sectionId: string;
  isVideo: boolean;
  isAI: boolean;
  excerpt: string | null;
  reporter: string;
  viewCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  bodyBlocks: ArticleBodyBlockRow[];
}

export type BodyBlockInput = {
  type: "TEXT" | "IMAGE" | "VIDEO";
  text?: string;
  mediaUrl?: string;
  filePath?: string;
  caption?: string;
};

export type FrontendBodyBlock =
  | string
  | { type: "image"; src: string; caption?: string }
  | { type: "video"; src: string; caption?: string };

export interface FrontendArticle {
  id: string;
  title: string;
  subtitle?: string;
  section: string;
  image?: string;
  isVideo?: boolean;
  isAI?: boolean;
  publishedAt: string;
  excerpt?: string;
  body?: FrontendBodyBlock[];
  reporter?: string;
  viewCount?: number;
}

export function resolveBlockSrc(
  block: Pick<ArticleBodyBlockRow, "mediaUrl" | "filePath">,
): string {
  if (block.mediaUrl) return block.mediaUrl;
  if (block.filePath) {
    return block.filePath.startsWith("/")
      ? block.filePath
      : `/uploads/${block.filePath}`;
  }
  return "";
}

export function youtubeThumbnailUrl(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export function resolveCoverSrc(
  block: Pick<ArticleBodyBlockRow, "type" | "mediaUrl" | "filePath">,
): string {
  const src = resolveBlockSrc(block);
  if (!src) return "";
  if (block.type === "VIDEO") {
    return youtubeThumbnailUrl(src) ?? src;
  }
  return src;
}

export function blockToFrontend(
  block: ArticleBodyBlockRow,
): FrontendBodyBlock | null {
  if (block.type === "TEXT") {
    const text = block.text?.trim();
    return text ? text : null;
  }
  const src = resolveBlockSrc(block);
  if (!src) return null;
  if (block.type === "IMAGE") {
    return { type: "image", src, caption: block.caption ?? undefined };
  }
  return { type: "video", src, caption: block.caption ?? undefined };
}

export function deriveCoverFromBlocks(
  blocks: ArticleBodyBlockRow[],
): { image?: string; isVideo: boolean } {
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);
  const firstMedia = sorted.find(
    (block) => block.type === "IMAGE" || block.type === "VIDEO",
  );

  if (!firstMedia) {
    return { isVideo: false };
  }

  const image = resolveCoverSrc(firstMedia);
  return {
    image: image || undefined,
    isVideo: firstMedia.type === "VIDEO",
  };
}

export function deriveArticleFlags(blocks: BodyBlockInput[]) {
  const firstMedia = blocks.find(
    (block) => block.type === "IMAGE" || block.type === "VIDEO",
  );
  return {
    isVideo: firstMedia?.type === "VIDEO",
  };
}

export function toFrontendArticle(article: ArticleRow): FrontendArticle {
  const sortedBlocks = [...article.bodyBlocks].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const body = sortedBlocks
    .map(blockToFrontend)
    .filter((block): block is FrontendBodyBlock => block !== null);
  const cover = deriveCoverFromBlocks(sortedBlocks);

  return {
    id: article.id,
    title: article.title,
    subtitle: article.excerpt ?? undefined,
    section: article.sectionId,
    image: cover.image,
    isVideo: cover.isVideo,
    isAI: article.isAI || undefined,
    publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
    excerpt: article.excerpt ?? undefined,
    body: body.length > 0 ? body : undefined,
    reporter: article.reporter,
    viewCount: article.viewCount,
  };
}

export const articleInclude = {
  bodyBlocks: true,
} as const;

export interface CreateArticleInput {
  title: string;
  sectionId: string;
  excerpt?: string;
  reporter?: string;
  sourceUrl?: string;
  isAI?: boolean;
  blocks?: BodyBlockInput[];
}

export function buildArticleCreateData(
  input: CreateArticleInput,
  status: ArticleStatus = "PENDING_REVIEW",
) {
  const flags = deriveArticleFlags(input.blocks ?? []);

  return {
    title: input.title,
    sectionId: input.sectionId,
    status,
    isVideo: flags.isVideo,
    isAI: input.isAI ?? false,
    excerpt: input.excerpt,
    reporter: input.reporter ?? "발행인",
    sourceUrl: input.sourceUrl,
    publishedAt: status === "PUBLISHED" ? new Date() : undefined,
    bodyBlocks: {
      create: buildBlocksCreateData(input.blocks ?? []),
    },
  };
}

export function buildBlocksCreateData(blocks: BodyBlockInput[]) {
  return blocks.map((block, index) => ({
    type: block.type,
    sortOrder: index,
    text: block.type === "TEXT" ? (block.text ?? "") : null,
    mediaUrl: block.type !== "TEXT" ? (block.mediaUrl ?? null) : null,
    filePath: block.type !== "TEXT" ? (block.filePath ?? null) : null,
    caption: block.caption ?? null,
  }));
}

export type { ArticleStatus };
