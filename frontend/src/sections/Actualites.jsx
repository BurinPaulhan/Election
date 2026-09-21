import { useCallback, useEffect, useRef, useState } from 'react'
import posterImg from '../assets/images/poster.png'
import programmeImg from '../assets/images/programme.png'
import parcoursImg from '../assets/images/parcours.png'
import equipeImg from '../assets/images/equipe.png'

const publications = [
  {
    id: 'poster',
    src: posterImg,
    category: 'Affiche',
    date: '21 septembre 2026',
    title: 'L’affiche officielle de la campagne',
    excerpt: 'Un visuel sobre et engageant pour porter le programme dans tous les campus et sur les réseaux de l’AEMA.',
    file: 'poster.png',
    note: 'Téléchargez l’affiche en pleine résolution : elle est prête à être affichée, imprimée et partagée partout.',
    alt: 'L’affiche officielle de la campagne de l’AEMA',
  },
  {
    id: 'programme',
    src: programmeImg,
    category: 'Programme',
    date: '21 septembre 2026',
    title: 'Le programme complet, réparti par axes',
    excerpt: 'Toutes nos propositions structurées en quatre axes : proximité, structuration, action et communication.',
    file: 'programme.png',
    note: 'Le fichier original conserve la mise en page complète : idéal à imprimer ou à partager en assemblée.',
    alt: 'Le programme complet de la campagne AEMA, réparti par axes',
  },
  {
    id: 'parcours',
    src: parcoursImg,
    category: 'Parcours',
    date: '21 septembre 2026',
    title: 'Le parcours, pas à pas',
    excerpt: 'Un chemin construit autour des étudiants : de l’engagement associatif à la prise de responsabilités.',
    file: 'parcours.png',
    note: 'Retrouvez chaque étape du parcours en haute résolution dans le fichier original.',
    alt: 'Le parcours de la campagne AEMA, pas à pas',
  },
  {
    id: 'equipe',
    src: equipeImg,
    category: 'Équipe',
    date: '21 septembre 2026',
    title: "L'équipe qui portera l'AEMA",
    excerpt: 'Une équipe soudée et complémentaire, unie par la même conviction : une AEMA proche des étudiants.',
    file: 'equipe.png',
    note: "Découvrez les visages de la campagne, en pleine résolution, dans le fichier original.",
    alt: "L'équipe de la campagne AEMA",
  },
]

function PublicationCard({ publication, onOpen }) {
  return (
    <figure className="publication-card">
      <button
        type="button"
        className="publication-card__thumb"
        onClick={onOpen}
        aria-label={`Ouvrir « ${publication.title} » en grand format et haute résolution`}
      >
        <img src={publication.src} alt="" loading="lazy" decoding="async" />
      </button>
      <figcaption className="publication-card__meta">
        <p className="publication-card__kicker">
          <span>{publication.category}</span>
          <span aria-hidden="true">·</span>
          <span>{publication.date}</span>
        </p>
        <h3 className="publication-card__title">{publication.title}</h3>
        <p className="publication-card__excerpt">{publication.excerpt}</p>
      </figcaption>
    </figure>
  )
}

function Viewer({ item, index, total, onClose, onPrev, onNext, publications }) {
  const stageRef = useRef(null)
  const focusRef = useRef(null)

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
    focusRef.current?.focus()
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
    a.download = item.file
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
      onClick={handleBackdrop}
    >
      <header className="viewer-topbar">
        <p className="viewer-count" aria-live="polite">
          {index + 1} <span aria-hidden="true">/</span> {total}
        </p>
        <h2 id="viewer-title" className="viewer-title">{item.title}</h2>
        <div className="viewer-actions">
          <button
            type="button"
            className="viewer-action viewer-action--download"
            onClick={download}
          >
            <span aria-hidden="true">⤓</span>
            <span>Télécharger</span>
          </button>
          <button
            type="button"
            className="viewer-action viewer-action--close"
            onClick={onClose}
            aria-label="Fermer la visionneuse"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </header>

      <div className="viewer-stage" ref={stageRef}>
        <img
          ref={focusRef}
          src={item.src}
          alt={item.title}
          tabIndex={-1}
        />
      </div>

      <footer className="viewer-footer">
        <button
          type="button"
          className="viewer-nav viewer-nav--prev"
          onClick={onPrev}
          aria-label="Publication précédente"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <div className="viewer-caption">
          <p className="viewer-kicker"><span>{item.category}</span><span aria-hidden="true">·</span><span>{item.date}</span></p>
          <p className="viewer-note">{item.note}</p>
        </div>
        <button
          type="button"
          className="viewer-nav viewer-nav--next"
          onClick={onNext}
          aria-label="Publication suivante"
        >
          <span aria-hidden="true">›</span>
        </button>
      </footer>
    </div>
  )
}

function Actualites() {
  const [openIndex, setOpenIndex] = useState(null)

  const closeViewer = useCallback(() => setOpenIndex(null), [])
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
        <Viewer
          item={publications[openIndex]}
          index={openIndex}
          total={publications.length}
          onClose={closeViewer}
          onPrev={goPrev}
          onNext={goNext}
          publications={publications}
        />
      )}
    </section>
  )
}

export default Actualites
