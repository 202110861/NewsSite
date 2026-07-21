import { useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import MastheadBar from "./MastheadBar";
import Header from "./Header";
import CategoryNav from "./CategoryNav";
import Footer from "./Footer";

const NOINDEX_EXACT = new Set([
  "/login",
  "/signup",
  "/mypage",
  "/search",
  "/support",
  "/support/complete",
  "/support/portone-return",
]);

function shouldNoindex(pathname: string): boolean {
  if (NOINDEX_EXACT.has(pathname)) return true;
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/support/")
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const noindex = shouldNoindex(pathname);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div id="top" className="min-h-screen bg-paper-50">
      {noindex && (
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
      )}
      <MastheadBar />
      <Header
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen((open) => !open)}
      />
      <CategoryNav
        mobileNavOpen={mobileNavOpen}
        onCloseMobileNav={() => setMobileNavOpen(false)}
      />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
