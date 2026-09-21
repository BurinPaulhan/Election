import { useCallback, useEffect, useRef, useState } from 'react'
import aemaPoster from '../assets/images/poster.png'
import aemaProgramme from '../assets/images/programme.png'
import aemaParcours from '../assets/images/parcours.png'
import aemaEquipe from '../assets/images/equipe.png'

const publications = [
  {
    id: 'poster',
    src: aemaPoster,
    name: 'poster.png',
    category: 'Affiche',
    date: '21 septembre 2026',
    title: 'L’affiche officielle de la campagne',
    excerpt: 'Une affiche qui est prête à partager et à afficher partout.',
    note: 'Téléchargez l’affiche en pleine résolution : elle est prête pour l’impression et l’affichage sur les réseaux.',
  },
  {
    id: 'programme',
    src: aemaProgramme,
    name: 'programme.png',
    category: 'Programme',
    date: '21 septembre 2026 ',
    title: 'Le programme complet, réparti par axes',
    excerpt: 'Toutes nos propositions structurées en quatre axes : proximité, structuration, action et communication.',
    note: 'Le fichier original conserve la mise en page complète : idéal à imprimer ou à partager en assemblée.',
  },
  {
    id: 'parcours',
    src: aemaParcours,
    name: 'parcours.png',
    category: 'Parcours',
    date: '12 octobre 2025',
    title: 'Le parcours, pas à pas',
    excerpt: 'Un chemin construit autour des étudiants : de l’engagement associatif à la prise de responsabilités.',
    note: 'Retrouvez chaque étape du parcours en haute résolution dans le fichier original.',
  },
  {
    id: 'equipe',
    src: aemaEquipe,
    name: 'equipe.png',
    category: 'Équipe',
    date: '21 septembre 2026',
    title: "Une campagne qui se prépare collectivement.",
    excerpt: 'Une équipe soudée et complémentaire, unie par la même conviction : une AEMA plus proche des étudiants.',
    note: 'Découvrez les visages de la campagne dans le fichier original, en pleine résolution.',
  },
]

function PublicationCard({ publication, onOpen }) {
  return (
    <figure className="publication-card">
      <button
        type="button"
        className="publication-card__thumb"
        onClick={onOpen}
        aria-label={`Ouvrir « ${publication.title} » en grand format et à haute résolution`}
      >
        <img src={publication.src} alt="" loading="lazy" decoding="async" />
      </button>
      <figcaption className="publication-card__meta">
        <p className="publication-card__kicker">
          <span>{publication.category}</span>
          <span aria-hidden="true">·</span>
          <time>{publication.date}</time>
        </p>
        <h3 className="publication-card__title">{publication.title}</h3>
        <p className="publication-card__excerpt">{publication.excerpt}</p>
      </figcaption>
    </figure>
  )
}

function Lightbox({ item, index, total, onClose, onPrev, onNext }) {
  const initialFocusRef = useRef(null)

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowRight') { e.preventDefault(); onNext(); return }
      if (e.key === 'ArrowLeft') { e.preventDefault(); onPrev(); return }
    },
    [onClose, onNext, onPrev],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.classList.add('no-scroll')
    initialFocusRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('no-scroll')
    }
  }, [handleKeyDown, item])

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = item.src
    a.download = item.name
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={handleBackdrop}
    >
      <figure className="lightbox-stage">
        <img
          ref={initialFocusRef}
          src={item.src}
          alt={item.title}
          tabIndex={-1}
          onClick={handleBackdrop}
        />
      </figure>

      <div className="lightbox-panel">
        <div className="lightbox-head">
          <p className="lightbox-head__kicker">
            <span>{item.category}</span>
            <span aria-hidden="true">·</span>
            <time>{item.date}</time>
          </p>
          <h3 className="lightbox-head__title">{item.title}</h3>
          <p className="lightbox-head__excerpt">{item.excerpt}</p>
          <p className="lightbox-note">{item.note}</p>
        </div>
        <div className="lightbox-tools" role="toolbar" aria-label="Actions">
          <button
            type="button"
            className="lightbox-tool lightbox-tool--download"
            onClick={download}
          >
            <span aria-hidden="true">⤓</span>
            <span>Télécharger le fichier original</span>
          </button>
        </div>
      </div>

      <div className="lightbox-controls">
        <button
          type="button"
          className="lightbox-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          <span aria-hidden="true">×</span>
        </button>
        <div className="lightbox-count" aria-live="polite">
          {index + 1} / {total}
        </div>
        <button
          type="button"
          className="lightbox-pager"
          onClick={onPrev}
          aria-label="Publication précédente"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          className="lightbox-pager"
          onClick={onNext}
          aria-label="Publication suivante"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  )
}

function Actualites() {
  const [openIndex, setOpenIndex] = useState(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const goPrev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + publications.length - 1) % publications.length)),
    [],
  )
  const goNext = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % publications.length)),
    [],
  )

  return (
    <section className="section news-section" id="actualites" aria-labelledby="actualites-title">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Actualités</p>
          <h2 id="actualites-title">La campagne en images, publications et documents.</h2>
          <p>Toutes les publications officielles : affiches, programme, parcours et équipe. Ouvrez une publication pour la lire en détail et téléchargez le fichier original.</p>
        </div>

        <div className="publications-grid">
          {publications.map((publication, index) => (
            <PublicationCard
              key={publication.id}
              publication={publication}
              onOpen={() => setOpenIndex(index)}
            />
          ))}
        </div>
      </div>

      {openIndex !== null && (
        <Lightbox
          item={publications[openIndex]}
          index={openIndex}
          total={publications.length}
          onClose={close}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </section>
  )
}

export default Actualites
