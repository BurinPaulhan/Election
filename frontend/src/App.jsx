import { useEffect, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import Hero from './sections/Hero'
import BanniereCandidature from './sections/BanniereCandidature'
import About from './sections/About'
import Programme from './sections/Programme'
import Projets from './sections/Projets'
import Equipe from './sections/Equipe'
import Engagements from './sections/Engagements'
import Actualites from './sections/Actualites'
import Contact from './sections/Contact'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('aema-theme', theme) } catch (e) { /* stockage indisponible */ }
  }, [theme])
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  useEffect(() => {
    const sections = document.querySelectorAll('main > section')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-revealed'))
      return undefined
    }

    document.documentElement.classList.add('has-scroll-reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      }),
      { rootMargin: '0px 0px -8%', threshold: 0.08 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => {
      observer.disconnect()
      document.documentElement.classList.remove('has-scroll-reveal')
    }
  }, [])

  return <>
    <a className="skip-link" href="#contenu">Aller au contenu principal</a>
    <Header isMenuOpen={isMenuOpen} onMenuToggle={() => setIsMenuOpen((open) => !open)} onNavigate={closeMenu} theme={theme} onThemeToggle={toggleTheme} />
    <main id="contenu"><Hero /><BanniereCandidature /><About /><Programme /><Projets /><Equipe /><Actualites /><Contact /></main>
    <Footer />
    <BackToTop />
  </>
}

export default App
