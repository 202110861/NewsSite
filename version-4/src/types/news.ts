export type SectionId =
  | "politics"
  | "economy"
  | "society"
  | "culture"
  | "entertainment"
  | "local"
  | "event"
  | "video";

export interface Section {
  id: SectionId;
  label: string;
  /** Tailwind 클래스 조합 — 섹션별 마감 태그 색상 */
  accent: string;
}

export type ArticleBodyBlock =
  | string
  | { type: "image"; src: string; caption?: string };

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  section: SectionId;
  /** 목록·상세 상단 커버 이미지 (본문 body와 별도) */
  image?: string;
  isVideo?: boolean;
  videoUrl?: string;
  publishedAt: string; // ISO date
  excerpt?: string;
  /** 상세 페이지 본문 — 문단 단위 배열 */
  body?: ArticleBodyBlock[];
  reporter?: string;
  viewCount?: number;
}

export interface HotIssueItem {
  id: string;
  title: string;
}
