import { Link, Navigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { allArticlesSorted } from '../data/articles'
import { sectionMap } from '../data/sections'
import SectionTag from '../components/SectionTag'
import { formatTimeAgo } from '../utils/format'
import { resolveMediaUrl } from '../utils/media'
import type { SectionId } from '../types/news'

export default function SectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [sectionId])

  const meta = sectionId ? sectionMap[sectionId] : undefined

  if (!sectionId || !meta) {
    return <Navigate to="/" replace />
  }

  const articles = allArticlesSorted.filter(
    (a) => a.section === (sectionId as SectionId),
  )

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* 브레드크럼 */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-ink-500">
        <Link to="/" className="hover:text-flash-600">
          홈
        </Link>
        <span>›</span>
        <span>{meta.label}</span>
      </nav>

      {/* 섹션 헤더 */}
      <div className="mb-6 flex items-baseline justify-between border-b-2 border-ink-900 pb-3">
        <h1 className="font-display text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
          {meta.label}
        </h1>
        <span className="text-sm text-ink-500">총 {articles.length}건</span>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-paper-100 py-20 text-center">
          <p className="text-base font-semibold text-ink-700">
            아직 등록된 {meta.label} 기사가 없습니다.
          </p>
          <p className="text-sm text-ink-500">곧 새로운 소식으로 채워드릴게요.</p>
        </div>
      ) : (
        <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link key={a.id} to={`/article/${a.id}`} className="group">
              <div className="relative overflow-hidden rounded-md bg-ink-100">
                <img
                  src={resolveMediaUrl(a.image ?? '')}
                  alt=""
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {a.isVideo && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950/60 text-white backdrop-blur-sm">
                      ▶
                    </span>
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex flex-col gap-1.5">
                <SectionTag section={a.section} />
                <h2 className="line-clamp-2 text-sm font-bold leading-snug text-ink-900 group-hover:text-flash-700 sm:text-base">
                  {a.title}
                </h2>
                {a.excerpt && (
                  <p className="line-clamp-2 text-xs text-ink-500">{a.excerpt}</p>
                )}
                <p className="text-xs text-ink-500">{formatTimeAgo(a.publishedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}