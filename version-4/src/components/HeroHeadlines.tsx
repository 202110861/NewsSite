import {
  useEffect,
  useRef,
  useState,
  type TransitionEvent as ReactTransitionEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { Link } from "react-router-dom";
import type { Article } from "../types/news";
import SectionTag from "./SectionTag";
import { resolveMediaUrl } from "../utils/media";

const AUTO_MS = 5000;
const SWIPE_THRESHOLD = 40;

export default function HeroHeadlines({ articles }: { articles: Article[] }) {
  const count = articles.length;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const suppressClick = useRef(false);

  // 끝 → 처음 루프를 위해 첫 슬라이드를 맨 뒤에 복제
  const slides = count > 1 ? [...articles, articles[0]] : articles;

  useEffect(() => {
    setIndex(0);
    setAnimate(true);
  }, [count]);

  useEffect(() => {
    if (count <= 1 || paused) return;

    const timer = window.setInterval(() => {
      setAnimate(true);
      setIndex((prev) => prev + 1);
    }, AUTO_MS);

    return () => window.clearInterval(timer);
  }, [count, paused]);

  function goTo(next: number) {
    if (count <= 1) return;
    setAnimate(true);
    setIndex(next);
  }

  function goNext() {
    goTo(index + 1);
  }

  function goPrev() {
    if (count <= 1) return;

    if (index === 0) {
      setAnimate(false);
      setIndex(count);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setAnimate(true);
          setIndex(count - 1);
        });
      });
      return;
    }

    goTo(index - 1);
  }

  function handleTransitionEnd(e: ReactTransitionEvent<HTMLAnchorElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    if (count <= 1 || index < count) return;
    // 복제 슬라이드 도착 → 실제 첫 장으로 점프 (애니메이션 없이)
    setAnimate(false);
    setIndex(0);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimate(true));
    });
  }

  function onTouchStart(e: ReactTouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    suppressClick.current = false;
    setPaused(true);
  }

  function onTouchEnd(e: ReactTouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    setPaused(false);
    if (start == null) return;

    const end = e.changedTouches[0]?.clientX;
    if (end == null) return;

    const delta = start - end;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;

    suppressClick.current = true;
    if (delta > 0) goNext();
    else goPrev();
  }

  if (count === 0) return null;

  const activeDot = index % count;

  return (
    <section
      className="mx-auto w-full min-w-0 max-w-6xl px-6 pt-6 sm:px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-w-0 aspect-video w-full overflow-hidden rounded-lg bg-ink-950">
        <div
          className="relative h-full w-full"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {slides.map((article, i) => (
            <Link
              key={`${article.id}-${i}`}
              to={`/article/${article.id}`}
              className="group absolute inset-0 block h-full w-full overflow-hidden"
              style={{
                transform: `translate3d(${(i - index) * 100}%, 0, 0)`,
                transition: animate ? "transform 500ms ease" : "none",
              }}
              onTransitionEnd={
                i === count ? handleTransitionEnd : undefined
              }
              draggable={false}
              onClick={(e) => {
                if (suppressClick.current) {
                  e.preventDefault();
                  suppressClick.current = false;
                }
              }}
            >
              <div className="relative h-full w-full flex justify-center">
                <img
                  src={resolveMediaUrl(article.image ?? "")}
                  alt=""
                  className="inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                  loading={i === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink-950 via-ink-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
                  <SectionTag section={article.section} />
                  <h1 className="mt-2 text-lg font-bold leading-snug text-white sm:mt-3 sm:text-2xl lg:text-3xl">
                    {article.title}
                  </h1>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="이전 헤드라인"
              className="absolute left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink-950/50 text-lg text-white backdrop-blur-sm hover:bg-ink-950/70 sm:left-3 lg:flex"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="다음 헤드라인"
              className="absolute right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink-950/50 text-lg text-white backdrop-blur-sm hover:bg-ink-950/70 sm:right-3 lg:flex"
            >
              ›
            </button>

            <div className="absolute bottom-3 right-3 z-10 flex gap-1.5 sm:bottom-4 sm:right-4">
              {articles.map((article, i) => (
                <button
                  key={article.id}
                  type="button"
                  aria-label={`${i + 1}번째 헤드라인`}
                  aria-current={i === activeDot}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeDot
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/45 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
