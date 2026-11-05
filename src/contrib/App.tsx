import { useEffect, useState } from 'react'
import { DetailsHost } from '../components/DetailsModal'
import './contrib.css'
import { PAGES } from './pageRegistry'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Home } from './pages/Home'
import { useGuideSlug } from './router'

export function ContribApp() {
  const slug = useGuideSlug()
  const [sideOpen, setSideOpen] = useState(false)
  const Page = PAGES[slug] ?? Home

  // The presentation deck locks body scroll (fixed, 100dvh). The guide is a normal scrolling
  // document, so toggle a class on <html> for as long as the guide is mounted, and restore on exit.
  useEffect(() => {
    document.documentElement.classList.add('guide-mode')
    return () => document.documentElement.classList.remove('guide-mode')
  }, [])

  // Jumping to a new guide page should start at the top, and close the mobile section list.
  useEffect(() => {
    window.scrollTo(0, 0)
    setSideOpen(false)
  }, [slug])

  return (
    <div className="contrib-app">
      <TopBar onBurger={() => setSideOpen((v) => !v)} />
      <div className="doc-body">
        <Sidebar current={slug} open={sideOpen} />
        <main className="doc-main" id="main">
          <Page />
        </main>
      </div>
      <DetailsHost />
    </div>
  )
}
