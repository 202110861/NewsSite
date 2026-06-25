import { useEffect, useRef, useState } from "react";
import { PHOTO_SLIDES } from "../data/newsData";

export default function PhotoNewsTabs() {
  const [active, setActive] = useState(2);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setActive((a) => (a + 1) % PHOTO_SLIDES.length);
    }, 4000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const current = PHOTO_SLIDES[active];

  return (
    <div className="border border-gray-100 flex flex-col">
      <div className="bg-blue-600 text-white font-medium text-sm sm:text-base px-3 py-2">
        포토뉴스
      </div>
      <a href="#article" className="block">
        <img
          src={current.img}
          alt="메인사진"
          className="w-full block aspect-[16/9] sm:aspect-[16/9.5] object-cover"
        />
      </a>
      <p className="text-xs sm:text-[13px] px-3 py-2 m-0 leading-tight min-h-[34px] sm:min-h-[38px] line-clamp-2">
        <a href="#article" className="text-inherit no-underline">
          {current.title}
        </a>
      </p>
      <ul className="flex gap-1 list-none m-0 px-2 pb-2">
        {PHOTO_SLIDES.map((slide, i) => (
          <li
            key={slide.id}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`w-full h-10 sm:h-[45px] overflow-hidden cursor-pointer flex-1 border-[3px] ${
              i === active ? "border-blue-500" : "border-transparent"
            }`}
          >
            <img src={slide.img} alt="썸네일" className="w-full h-full object-cover" />
          </li>
        ))}
      </ul>
    </div>
  );
}
