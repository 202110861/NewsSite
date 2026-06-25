import type { SectionId } from '../types/news'
import { sectionMap } from '../data/sections'

const accentBg: Record<SectionId, string> = {
  politics: 'bg-section-politics',
  economy: 'bg-section-economy',
  society: 'bg-section-society',
  culture: 'bg-section-culture',
  entertainment: 'bg-section-entertainment',
  local: 'bg-section-local',
  event: 'bg-section-event',
  video: 'bg-section-video',
}

export default function SectionTag({ section }: { section: SectionId }) {
  const meta = sectionMap[section]
  if (!meta) return null

  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[11px] font-bold tracking-tight text-white ${accentBg[section]}`}
    >
      {meta.label}
    </span>
  )
}
