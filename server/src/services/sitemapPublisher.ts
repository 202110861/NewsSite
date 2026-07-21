import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import { prisma } from "../db/client.js";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toLastmod(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return date.toISOString().slice(0, 10);
}

function resolveSiteUrl(): string {
  return env.CLIENT_URL.replace(/\/$/, "");
}

export function buildSitemapXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((url) => {
      const lines = [`    <loc>${escapeXml(url.loc)}</loc>`];
      if (url.lastmod) lines.push(`    <lastmod>${url.lastmod}</lastmod>`);
      if (url.changefreq) {
        lines.push(`    <changefreq>${url.changefreq}</changefreq>`);
      }
      if (url.priority) lines.push(`    <priority>${url.priority}</priority>`);
      return `  <url>\n${lines.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

async function collectSitemapUrls(): Promise<SitemapUrl[]> {
  const siteUrl = resolveSiteUrl();
  const [sections, articles] = await Promise.all([
    prisma.section.findMany({ orderBy: { id: "asc" } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, publishedAt: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const urls: SitemapUrl[] = [
    {
      loc: `${siteUrl}/`,
      changefreq: "hourly",
      priority: "1.0",
      lastmod: toLastmod(articles[0]?.updatedAt ?? new Date()),
    },
  ];

  for (const section of sections) {
    urls.push({
      loc: `${siteUrl}/section/${section.id}`,
      changefreq: "daily",
      priority: "0.8",
    });
  }

  for (const policy of ["youth", "personal", "terms"] as const) {
    urls.push({
      loc: `${siteUrl}/policy/${policy}`,
      changefreq: "monthly",
      priority: "0.3",
    });
  }

  for (const article of articles) {
    urls.push({
      loc: `${siteUrl}/article/${article.id}`,
      lastmod: toLastmod(article.updatedAt ?? article.publishedAt),
      changefreq: "weekly",
      priority: "0.7",
    });
  }

  return urls;
}

function getS3Client(): S3Client {
  return new S3Client({ region: env.AWS_REGION });
}

function getCloudFrontClient(): CloudFrontClient {
  return new CloudFrontClient({ region: env.AWS_REGION });
}

async function invalidateSitemap(): Promise<void> {
  if (!env.CLOUDFRONT_DISTRIBUTION_ID) return;

  await getCloudFrontClient().send(
    new CreateInvalidationCommand({
      DistributionId: env.CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `sitemap-${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: ["/sitemap.xml"],
        },
      },
    }),
  );
}

/** 발행/삭제 후 S3의 sitemap.xml을 최신 기사 목록으로 갱신 */
export async function publishSitemap(): Promise<void> {
  if (!env.FRONTEND_S3_BUCKET) {
    console.warn(
      "[sitemapPublisher] FRONTEND_S3_BUCKET 미설정 — sitemap 업로드를 건너뜁니다.",
    );
    return;
  }

  const urls = await collectSitemapUrls();
  const xml = buildSitemapXml(urls);

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: env.FRONTEND_S3_BUCKET,
      Key: "sitemap.xml",
      Body: xml,
      ContentType: "application/xml; charset=utf-8",
      CacheControl: "no-cache, no-store, must-revalidate",
    }),
  );

  await invalidateSitemap();
  console.log(
    `[sitemapPublisher] uploaded sitemap.xml (${urls.length} urls) → s3://${env.FRONTEND_S3_BUCKET}/sitemap.xml`,
  );
}
