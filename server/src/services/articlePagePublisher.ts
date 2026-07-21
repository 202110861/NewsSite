import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { PutObjectCommand, S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import type { FrontendArticle } from "../modules/articles/article.mapper.js";

const SITE_NAME = "경제인뉴스";
const BASE_HTML_CACHE_MS = 5 * 60 * 1000;

interface PageMeta {
  title: string;
  description: string;
  url: string;
  image: string;
  type?: "website" | "article";
}

let cachedBaseHtml: { html: string; fetchedAt: number } | null = null;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function resolveSiteUrl(): string {
  return env.CLIENT_URL.replace(/\/$/, "");
}

function resolveApiOrigin(): string {
  if (env.API_PUBLIC_URL) {
    return env.API_PUBLIC_URL.replace(/\/$/, "");
  }
  if (env.NODE_ENV === "development") {
    return `http://localhost:${env.PORT}`;
  }
  return resolveSiteUrl();
}

function resolveOgImageUrl(
  siteUrl: string,
  apiOrigin: string,
  image: string | undefined,
  fallback: string,
): string {
  const candidate = image || fallback;
  if (!candidate) return `${siteUrl}/logo.png`;
  if (/^https?:\/\//i.test(candidate)) return candidate;
  if (candidate.startsWith("/uploads/")) return `${apiOrigin}${candidate}`;
  if (/^images\//.test(candidate)) return `${apiOrigin}/uploads/${candidate}`;

  const normalized = candidate.startsWith("/") ? candidate : `/${candidate}`;
  return `${siteUrl}${normalized}`;
}

function stripSeoTags(html: string): string {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+name="description"[\s\S]*?>\s*/gi, "")
    .replace(/<meta\s+name="robots"[\s\S]*?>\s*/gi, "")
    .replace(/<link\s+rel="canonical"[\s\S]*?>\s*/gi, "")
    .replace(/<meta\s+property="og:[^"]+"[\s\S]*?>\s*/gi, "")
    .replace(/<meta\s+name="twitter:[^"]+"[\s\S]*?>\s*/gi, "");
}

function buildSeoTags(meta: PageMeta): string {
  const type = meta.type ?? "article";

  return `
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${escapeHtml(meta.url)}" />
    <meta name="robots" content="index, follow" />
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
    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />`;
}

function injectMeta(html: string, meta: PageMeta): string {
  const cleaned = stripSeoTags(html);
  return cleaned.replace("</head>", `${buildSeoTags(meta)}\n  </head>`);
}

async function fetchBaseHtml(): Promise<string> {
  const now = Date.now();
  if (cachedBaseHtml && now - cachedBaseHtml.fetchedAt < BASE_HTML_CACHE_MS) {
    return cachedBaseHtml.html;
  }

  const siteUrl = resolveSiteUrl();
  const res = await fetch(`${siteUrl}/index.html`, {
    headers: { Accept: "text/html" },
  });

  if (!res.ok) {
    throw new Error(
      `프론트 index.html 조회 실패 (${res.status}): ${siteUrl}/index.html`,
    );
  }

  const html = await res.text();
  cachedBaseHtml = { html, fetchedAt: now };
  return html;
}

function buildArticlePageHtml(
  baseHtml: string,
  article: FrontendArticle,
): string {
  const siteUrl = resolveSiteUrl();
  const apiOrigin = resolveApiOrigin();
  const fallbackImage = `${siteUrl}/logo.png`;
  const description = article.excerpt?.trim() || article.title;

  return injectMeta(baseHtml, {
    title: `${article.title} - ${SITE_NAME}`,
    description,
    url: `${siteUrl}/article/${article.id}`,
    image: resolveOgImageUrl(
      siteUrl,
      apiOrigin,
      article.image,
      fallbackImage,
    ),
    type: "article",
  });
}

function getS3Client(): S3Client {
  return new S3Client({ region: env.AWS_REGION });
}

function getCloudFrontClient(): CloudFrontClient {
  return new CloudFrontClient({ region: env.AWS_REGION });
}

function assertBucketConfigured(): string {
  if (!env.FRONTEND_S3_BUCKET) {
    throw new Error("FRONTEND_S3_BUCKET 환경 변수가 설정되지 않았습니다.");
  }
  return env.FRONTEND_S3_BUCKET;
}

async function uploadArticleHtml(articleId: string, html: string): Promise<void> {
  const bucket = assertBucketConfigured();
  const key = `article/${articleId}/index.html`;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: html,
      ContentType: "text/html; charset=utf-8",
      CacheControl: "no-cache, no-store, must-revalidate",
    }),
  );

  console.log(`[articlePagePublisher] uploaded s3://${bucket}/${key}`);
}

async function invalidateArticlePage(articleId: string): Promise<void> {
  if (!env.CLOUDFRONT_DISTRIBUTION_ID) return;

  await getCloudFrontClient().send(
    new CreateInvalidationCommand({
      DistributionId: env.CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `${articleId}-${Date.now()}`,
        Paths: {
          Quantity: 2,
          Items: [`/article/${articleId}`, `/article/${articleId}/index.html`],
        },
      },
    }),
  );

  console.log(
    `[articlePagePublisher] invalidated CloudFront paths for article ${articleId}`,
  );
}

export async function publishArticlePage(
  article: FrontendArticle,
): Promise<void> {
  if (!env.FRONTEND_S3_BUCKET) {
    console.warn(
      "[articlePagePublisher] FRONTEND_S3_BUCKET 미설정 — S3 업로드를 건너뜁니다.",
    );
    return;
  }

  const baseHtml = await fetchBaseHtml();
  const html = buildArticlePageHtml(baseHtml, article);
  await uploadArticleHtml(article.id, html);
  await invalidateArticlePage(article.id);
}

export async function unpublishArticlePage(articleId: string): Promise<void> {
  if (!env.FRONTEND_S3_BUCKET) return;

  const bucket = assertBucketConfigured();
  const key = `article/${articleId}/index.html`;

  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  console.log(`[articlePagePublisher] deleted s3://${bucket}/${key}`);
  await invalidateArticlePage(articleId);
}
