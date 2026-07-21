import { Helmet } from "react-helmet-async";

const SITE_NAME = "경제인뉴스";
const DEFAULT_DESCRIPTION =
  "경기 김포 기반 종합 뉴스 포털 — 정치, 경제, 사회, 문화, 연예, 지역뉴스를 전합니다.";

function resolveSiteUrl() {
  return (
    import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://newsin.kr")
  );
}

type Props = {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

export default function SeoHead({
  title = SITE_NAME,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  type = "website",
  noindex = false,
}: Props) {
  const siteUrl = resolveSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const canonical = `${siteUrl}${normalizedPath === "/" ? "/" : normalizedPath}`;
  const ogImage = image || `${siteUrl}/logo.png`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
