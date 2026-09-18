function Footer() {
  return <footer className="site-footer"><div className="container footer-inner"><p className="footer-slogan"><svg className="footer-quote-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><g><circle cx="4.4" cy="6.9" r="2.3" fill="currentColor" stroke="none" /><path d="M5.6 9c.8 1.4.6 3-.9 4.7" /></g><g transform="translate(7.6 0)"><circle cx="4.4" cy="6.9" r="2.3" fill="currentColor" stroke="none" /><path d="M5.6 9c.8 1.4.6 3-.9 4.7" /></g></g></svg>Ensemble, faisons avancer notre communauté.</p><p className="footer-copyright">© {new Date().getFullYear()} Thierry Arphax — Tous droits réservés.</p></div></footer>
}
export default Footer
