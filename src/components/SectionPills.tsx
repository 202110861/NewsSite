import { SECTIONS } from "../data/newsData";

export default function SectionPills() {
  return (
    <div className="flex gap-1.5 max-w-[1280px] mx-auto my-2.5 px-3 overflow-x-auto sm:overflow-visible sm:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="shrink-0 text-[13px] text-gray-600 no-underline border border-gray-200 rounded-full px-3 py-1 bg-gray-50 hover:bg-gray-100 hover:text-blue-600"
        >
          {s.name}
        </a>
      ))}
    </div>
  );
}
