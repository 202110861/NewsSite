import type { SectionId } from "../types/news";
import { sectionMap } from "../data/sections";

const accentBg: Record<SectionId, string> = {
  politics: "bg-section-politics",
  economy: "bg-section-economy",
  society: "bg-section-society",
  culture: "bg-section-culture",
  entertainment: "bg-section-entertainment",
  local: "bg-section-local",
  publisher: "bg-section-publisher",
  video: "bg-section-video",
  cardNews: "bg-section-cardNews",
  shorts: "bg-section-shorts",
};

export default function SectionTag({ section }: { section: SectionId }) {
  const meta = sectionMap[section];
  if (!meta) return null;

  return (
    <div
      className={`leading-none rounded-sm tracking-tight flex items-center ${accentBg[section]}`}
    >
      <span className="text-[11px] font-bold text-white px-1.5 py-1">{meta.label}</span>
    </div>
  );
}
