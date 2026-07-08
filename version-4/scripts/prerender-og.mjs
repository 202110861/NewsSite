import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_NAME = '경제인뉴스'
const HOME_DESCRIPTION =
  '경기 김포 기반 종합 뉴스 포털 — 정치, 경제, 사회, 문화, 연예, 지역뉴스를 전합니다.'
const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
])

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
    'https://newsin.kr'

  return raw.replace(/\/$/, '')
}

function filenameFromSrc(src) {
  return src.replace(/^\/?(?:src\/)?images\//, '').split('/').pop() ?? src
}

/** Vite 빌드 결과(dist/assets)에서 원본 파일명 → /assets/해시파일 경로 매핑 */
function buildAssetMap(outDir) {
  const assetsDir = path.join(outDir, 'assets')
  const map = new Map()

  if (!fs.existsSync(assetsDir)) return map

  for (const file of fs.readdirSync(assetsDir)) {
    const ext = file.split('.').pop()?.toLowerCase()
    if (!ext || !IMAGE_EXTENSIONS.has(ext)) continue

    // pg1-Cva78-BF.jpg → pg1.jpg / image_a16a17-CBIGLGia.png → image_a16a17.png
    const dashIndex = file.indexOf('-')
    if (dashIndex === -1) continue

    const base = file.slice(0, dashIndex)
    map.set(`${base}.${ext}`, `/assets/${file}`)
  }

  return map
}

function resolveOgImageUrl(siteUrl, image, assetMap, fallback) {
  const candidate = image || fallback
  if (!candidate) return `${siteUrl}/og-default.jpg`
  if (/^https?:\/\//i.test(candidate)) return candidate

  const filename = filenameFromSrc(candidate)
  const bundled = assetMap.get(filename)
  if (bundled) return `${siteUrl}${bundled}`

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

function writeOgPage(outDir, segments, html) {
  const pageDir = path.join(outDir, ...segments)
  fs.mkdirSync(pageDir, { recursive: true })
  fs.writeFileSync(path.join(pageDir, 'index.html'), html)
}

async function main() {
  const { articlesById, heroArticles, allArticlesSorted } = await import(
    '../src/data/articles.ts'
  )
  const { sections } = await import('../src/data/sections.ts')

  const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
  const indexPath = path.join(outDir, 'index.html')

  if (!fs.existsSync(indexPath)) {
    throw new Error('dist/index.html not found — run vite build first.')
  }

  const baseHtml = fs.readFileSync(indexPath, 'utf-8')
  const siteUrl = resolveSiteUrl()
  const assetMap = buildAssetMap(outDir)
  const defaultImage = resolveOgImageUrl(
    siteUrl,
    heroArticles[0]?.image,
    assetMap,
  )

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

    writeOgPage(
      outDir,
      ['article', article.id],
      injectMeta(baseHtml, {
        title: `${article.title} - ${SITE_NAME}`,
        description,
        url: `${siteUrl}/article/${article.id}`,
        image: resolveOgImageUrl(siteUrl, article.image, assetMap, defaultImage),
        type: 'article',
      }),
    )
  }

  for (const section of sections) {
    const articles = allArticlesSorted.filter((a) => a.section === section.id)
    const lead = articles.find((a) => a.image) ?? articles[0]

    writeOgPage(
      outDir,
      ['section', section.id],
      injectMeta(baseHtml, {
        title: `${section.label} - ${SITE_NAME}`,
        description: `${section.label} 섹션 최신 뉴스를 확인하세요.`,
        url: `${siteUrl}/section/${section.id}`,
        image: lead
          ? resolveOgImageUrl(siteUrl, lead.image, assetMap, defaultImage)
          : defaultImage,
        type: 'website',
      }),
    )
  }

  console.log(
    `[prerender-og] ${Object.keys(articlesById).length} articles + ${sections.length} sections + home (site: ${siteUrl})`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
