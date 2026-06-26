export type SectionId =
  | 'politics'
  | 'economy'
  | 'society'
  | 'culture'
  | 'entertainment'
  | 'local'
  | 'event'
  | 'video'

export interface Section {
  id: SectionId
  label: string
  /** Tailwind 클래스 조합 — 섹션별 마감 태그 색상 */
  accent: string
}

export interface Article {
  id: string
  title: string
  section: SectionId
  image?: string
  isVideo?: boolean
  publishedAt: string // ISO date
  excerpt?: string
  /** 상세 페이지 본문 — 문단 단위 배열 */
  body?: string[]
  reporter?: string
  viewCount?: number
}

export interface HotIssueItem {
  id: string
  title: string
}
