import type { Section } from "../types/news";

export const sections: Section[] = [
  { id: "politics", label: "정치", accent: "bg-section-politics" },
  { id: "economy", label: "경제", accent: "bg-section-economy" },
  { id: "society", label: "사회", accent: "bg-section-society" },
  { id: "culture", label: "문화/전시", accent: "bg-section-culture" },
  {
    id: "entertainment",
    label: "연예/스포츠",
    accent: "bg-section-entertainment",
  },
  { id: "local", label: "지역뉴스", accent: "bg-section-local" },
  { id: "video", label: "영상뉴스", accent: "bg-section-video" },
  { id: "cardNews", label: "카드뉴스", accent: "bg-section-cardNews" },
  { id: "publisher", label: "발행인칼럼", accent: "bg-section-publisher" },
  // { id: "shorts", label: "숏컷뉴스", accent: "bg-section-shorts" },
];

export const sectionMap: Record<string, Section> = {
  ...sections.reduce(
    (acc, s) => ({ ...acc, [s.id]: s }),
    {} as Record<string, Section>,
  ),
  // 내비에서는 숨기지만, 기존 기사 태그 표시용으로 유지
  shorts: { id: "shorts", label: "숏컷뉴스", accent: "bg-section-shorts" },
};
