import { useEffect, useState } from 'react'
import aemaLogo from '../assets/images/logo.jpg'

const navigation = [['Accueil', '#accueil'], ['À propos', '#a-propos'], ['Programme', '#programme'], ['Projets', '#projets'], ['Équipe', '#equipe'], ['Actualités', '#actualites']]

function Header({ isMenuOpen, onMenuToggle, onNavigate }) {
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
      <a className="button button-small" href="#contact" onClick={onNavigate}>Nous contacter</a>
    </nav>
  </div></header>
}
export default Header
