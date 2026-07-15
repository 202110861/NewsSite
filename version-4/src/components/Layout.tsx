import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import MastheadBar from "./MastheadBar";
import Header from "./Header";
import CategoryNav from "./CategoryNav";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div id="top" className="min-h-screen bg-paper-50">
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
