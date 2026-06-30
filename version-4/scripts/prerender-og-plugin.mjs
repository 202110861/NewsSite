import fs from 'node:fs'
import path from 'node:path'

const SITE_NAME = '경제인뉴스'
const HOME_DESCRIPTION =
  '경기 김포 기반 종합 뉴스 포털 — 정치, 경제, 사회, 문화, 연예, 지역뉴스를 전합니다.'

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function resolveSiteUrl() {
  const raw =
    process.env.VITE_SITE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    'https://경제인뉴스.com'

  return raw.replace(/\/$/, '')
}

function toAbsoluteImageUrl(siteUrl, image, fallback) {
  const candidate = image || fallback
  if (!candidate) return `${siteUrl}/og-default.jpg`
  if (/^https?:\/\//i.test(candidate)) return candidate

  const normalized = candidate.startsWith('/') ? candidate : `/${candidate}`
  return `${siteUrl}${normalized}`
}

function stripSeoTags(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="description"[\s\S]*?>\s*/gi, '')
    .replace(/<meta\s+property="og:[^"]+"[\s\S]*?>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"[\s\S]*?>\s*/gi, '')
}

function buildSeoTags(meta) {
  const type = meta.type ?? 'article'

  return `
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${escapeHtml(meta.url)}" />
    <meta property="og:image" content="${escapeHtml(meta.image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(meta.image)}" />
    <meta property="og:locale" content="ko_KR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />`
}

function injectMeta(html, meta) {
  const cleaned = stripSeoTags(html)
  return cleaned.replace('</head>', `${buildSeoTags(meta)}\n  </head>`)
}

export default function prerenderOgPlugin() {
  return {
    name: 'prerender-og',
    apply: 'build',
    async closeBundle() {
      const { articlesById, heroArticles } = await import('../src/data/articles.ts')

      const outDir = path.resolve(process.cwd(), 'dist')
      const indexPath = path.join(outDir, 'index.html')

      if (!fs.existsSync(indexPath)) {
        throw new Error('dist/index.html not found — run vite build first.')
      }

      const baseHtml = fs.readFileSync(indexPath, 'utf-8')
      const siteUrl = resolveSiteUrl()
      const defaultImage = toAbsoluteImageUrl(siteUrl, heroArticles[0]?.image)

      fs.writeFileSync(
        indexPath,
        injectMeta(baseHtml, {
          title: SITE_NAME,
          description: HOME_DESCRIPTION,
          url: `${siteUrl}/`,
          image: defaultImage,
          type: 'website',
        }),
      )

      for (const article of Object.values(articlesById)) {
        const description =
          article.excerpt?.trim() ||
          article.subtitle?.trim() ||
          article.title

        const articleHtml = injectMeta(baseHtml, {
          title: `${article.title} - ${SITE_NAME}`,
          description,
          url: `${siteUrl}/article/${article.id}`,
          image: toAbsoluteImageUrl(siteUrl, article.image, defaultImage),
          type: 'article',
        })

        const articleDir = path.join(outDir, 'article', article.id)
        fs.mkdirSync(articleDir, { recursive: true })
        fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml)
      }

      console.log(
        `[prerender-og] ${Object.keys(articlesById).length} article pages + home (site: ${siteUrl})`,
      )
    },
  }
}
