import type { Section } from '../types/news'

export const sections: Section[] = [
  { id: 'politics', label: '정치', accent: 'bg-section-politics' },
  { id: 'economy', label: '경제', accent: 'bg-section-economy' },
  { id: 'society', label: '사회', accent: 'bg-section-society' },
  { id: 'culture', label: '문화/전시', accent: 'bg-section-culture' },
  { id: 'entertainment', label: '연예/스포츠', accent: 'bg-section-entertainment' },
  { id: 'local', label: '지역뉴스', accent: 'bg-section-local' },
  { id: 'event', label: '이벤트/행사', accent: 'bg-section-event' },
  { id: 'video', label: '영상뉴스', accent: 'bg-section-video' },
]

export const sectionMap: Record<string, Section> = sections.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<string, Section>,
)
