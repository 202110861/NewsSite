import type { ReactNode } from 'react'
import MastheadBar from './MastheadBar'
import Header from './Header'
import CategoryNav from './CategoryNav'
import Footer from './Footer'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div id="top" className="min-h-screen bg-paper-50">
      <MastheadBar />
      <Header />
      <CategoryNav />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
