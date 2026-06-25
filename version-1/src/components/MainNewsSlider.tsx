import { useEffect, useRef, useState } from "react";
import { MAIN_SLIDES } from "../data/newsData";

export default function MainNewsSlider() {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setActive((a) => (a + 1) % MAIN_SLIDES.length);
    }, 4000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const current = MAIN_SLIDES[active];

  return (
    <div className="border border-gray-100">
      <a href="#article" className="relative block">
        <img
          src={current.img}
          alt="메인사진"
          className="w-full block aspect-[16/10] sm:aspect-auto object-cover"
        />
        <span className="absolute left-0 bottom-0 right-0 bg-black/55 text-white text-sm sm:text-base font-medium px-3 sm:px-3.5 py-2 sm:py-2.5 line-clamp-2">
          {current.title}
        </span>
      </a>
      <ul className="list-none m-0 py-1.5">
        {MAIN_SLIDES.map((slide, i) => (
          <li
            key={slide.id}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`px-3 sm:px-3.5 py-1.5 text-[13px] sm:text-sm border-b border-gray-50 cursor-pointer flex gap-1.5 ${
              i === active ? "text-blue-600 font-medium" : "text-gray-700 font-normal"
            }`}
          >
            <span className="text-blue-600 w-3 shrink-0">{i === active ? "▶" : ""}</span>
            <a
              href="#article"
              className="text-inherit no-underline truncate sm:line-clamp-1 sm:whitespace-normal"
            >
              {slide.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
