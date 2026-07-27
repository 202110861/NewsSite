export type SectionId =
  | "politics"
  | "economy"
  | "society"
  | "culture"
  | "entertainment"
  | "local"
  | "publisher"
  | "video"
  | "cardNews"
  | "shorts";

export interface Section {
  id: SectionId;
  label: string;
  /** Tailwind 클래스 조합 — 섹션별 마감 태그 색상 */
  accent: string;
}

export type ArticleBodyBlock =
  | string
  | { type: "image"; src: string; caption?: string }
  | { type: "video"; src: string; caption?: string };

/* 기사 타입 */
export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  section: SectionId;
  /** 목록 썸네일 — 본문 body의 첫 번째 이미지·영상에서 파생 */
  image?: string;
  isVideo?: boolean;
  videoUrl?: string;
  publishedAt: string; // ISO date
  excerpt?: string;
  /** 상세 페이지 본문 — 문단 단위 배열 */
  body?: ArticleBodyBlock[];
  reporter?: string;
  viewCount?: number;
  isAI?: boolean;
}

export interface HotIssueItem {
  id: string;
  title: string;
}

export type BodyBlockInput = {
  type: "TEXT" | "IMAGE" | "VIDEO";
  text?: string;
  mediaUrl?: string;
  filePath?: string;
  caption?: string;
};

export interface AdminArticle {
  id: string;
  title: string;
  sectionId: string;
  status: "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
  excerpt?: string | null;
  subtitle?: string | null;
  reporter: string;
  isAI?: boolean;
  createdAt: string;
  updatedAt: string;
  blocks: BodyBlockInput[];
}
