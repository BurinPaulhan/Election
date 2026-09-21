import { useEffect, useState } from 'react'
import aemaLogo from '../assets/images/logo.jpg'

const navigation = [['Accueil', '#accueil'], ['À propos', '#a-propos'], ['Programme', '#programme'], ['Projets', '#projets'], ['Équipe', '#equipe'], ['Actualités', '#actualites']]

function Header({ isMenuOpen, onMenuToggle, onNavigate, theme, onThemeToggle }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <header className={isScrolled || isMenuOpen ? 'site-header is-scrolled' : 'site-header'}><div className="header-inner container">
    <a className="brand" href="#accueil" onClick={onNavigate} aria-label="Arphax Thierry Razafimahavy, retour à l’accueil"><img src={aemaLogo} alt="Logo de l’AEMA" /><span className="wordmark"><span>RAZAFIMAHAVY</span> Arphax Thierry</span></a>
    <button className="menu-toggle" type="button" aria-expanded={isMenuOpen} aria-controls="navigation-principale" onClick={onMenuToggle}><span className="sr-only">{isMenuOpen ? 'Fermer' : 'Ouvrir'} le menu</span><span aria-hidden="true">{isMenuOpen ? '×' : '☰'}</span></button>
    <nav id="navigation-principale" className={isMenuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Navigation principale">
      {navigation.map(([label, href]) => <a key={href} href={href} onClick={onNavigate}>{label}</a>)}
      <button className="theme-toggle" type="button" onClick={onThemeToggle} aria-pressed={theme === 'dark'} aria-label="Basculer le thème (clair / sombre)" title="Basculer le thème">
        <svg className="icon-moon-theme" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
        <svg className="icon-sun-theme" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-14v2m0 14v2m7.07-14.07-1.41 1.41M6.34 17.66l-1.41 1.41m14.14-1.41-1.41-1.41M6.34 6.34 4.93 4.93M21 12h-2M5 12H3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>
      <a className="button button-small" href="#contact" onClick={onNavigate}>Nous contacter</a>
    </nav>
  </div></header>
}
export default Header
