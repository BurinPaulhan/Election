// Remplacement facile d'une illustration par une photo :
// ajouter le champ `photo` au projet concerné, ex. :
// import reunionPhoto from '../assets/images/projets/reunion.jpg'
// photo: reunionPhoto,
const projets = [
  {
    number: '01',
    title: 'AEMA renforce l’organisation interne',
    actions: [
      'Mise en place des équipes dirigées par chaque membre du bureau afin de faciliter les organisations.',
      'Réunions régulières de l’équipe dirigeante.',
    ],
    objectives: [
      'Développer les compétences, clarifier les attentes et faciliter la passation.',
      'Mobiliser les équipes.',
    ],
    media: 'reunion',
    mediaTitle: '',
    alt: 'Illustration d’une réunion de l’équipe autour d’une table',
  },
  {
    number: '02',
    title: 'AEMA favorise l’engagement des membres',
    actions: [
      'Meeting tournant chaque début du mois avec les représentants des Wilayas.',
    ],
    objectives: [
      'Se tenir informé de l’actualité de chaque Wilaya.',
    ],
    media: 'conference',
    mediaTitle: '',
    alt: 'Illustration d’une réunion en salle de conférence avec les représentants des Wilayas',
  },
  {
    number: '03',
    title: 'AEMA organise des évènements marquants',
    actions: [
      'Évènements sportifs : Basket, Football, etc.',
      'Concours : culture générale, etc.',
      'Interapprentissage.',
    ],
    objectives: [
      'Valoriser les étudiants.',
      'Stimuler et valoriser la créativité.',
      'Révéler les talents et partager les compétences.',
    ],
    media: 'mains',
    mediaTitle: '',
    alt: 'Illustration de mains jointes en cercle symbolisant la cohésion des membres',
  },
  {
    number: '04',
    title: 'AEMA améliore la communication',
    actions: [
      'Création de comptes sur les réseaux sociaux.',
      'Création de goodies : bracelets, etc.',
    ],
    objectives: [
      'Diffuser des contenus attractifs : photos, vidéos, interviews, etc.',
      'Relayer les informations.',
      'Assurer la visibilité.',
    ],
    media: 'communication',
    mediaTitle: '',
    alt: 'Illustration de la communication de l’AEMA : réseaux sociaux et partage de contenus',
  },
]

function Person({ cx, cy, scale = 1 }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      <circle cx="0" cy="0" r="19" fill="#ffffff" stroke="#799816" strokeWidth="3" />
      <path d="M -27 27 Q 0 56 27 27 Z" fill="#dce8bd" stroke="#799816" strokeWidth="3" strokeLinejoin="round" />
    </g>
  )
}

function Blob({ id }) {
  return (
    <path
      d="M168 70 C300 28 428 52 512 130 C600 212 596 336 516 402 C440 468 318 488 208 448 C92 408 36 264 98 158 C124 118 144 82 168 70 Z"
      fill={`url(#${id})`}
      stroke="rgba(121, 152, 22, .18)"
      strokeWidth="2"
    />
  )
}

function Illustration({ name }) {
  const uid = `projets-grad-${name}`
  const defs = (
    <defs>
      <radialGradient id={uid} cx="50%" cy="42%" r="72%">
        <stop offset="0%" stopColor="#f4f7ec" />
        <stop offset="55%" stopColor="#e9efd8" />
        <stop offset="100%" stopColor="#dce6c4" />
      </radialGradient>
    </defs>
  )

  if (name === 'reunion') {
    return (
      <svg viewBox="0 0 640 480" aria-hidden="true" focusable="false">
        {defs}
        <Blob id={uid} />
        <circle cx="540" cy="122" r="52" fill="none" stroke="rgba(121, 152, 22, .2)" strokeWidth="2" strokeDasharray="2 8" />
        <ellipse cx="320" cy="300" rx="205" ry="74" fill="rgba(121, 152, 22, .1)" />
        <ellipse cx="320" cy="300" rx="205" ry="74" fill="none" stroke="#799816" strokeWidth="3" />
        <rect x="258" y="276" width="52" height="12" rx="4" fill="#ffffff" stroke="#799816" strokeWidth="2" />
        <rect x="330" y="292" width="46" height="11" rx="4" fill="#ffffff" stroke="#799816" strokeWidth="2" />
        <Person cx={320} cy={206} />
        <Person cx={168} cy={246} />
        <Person cx={472} cy={246} />
        <Person cx={320} cy={394} />
      </svg>
    )
  }

  if (name === 'conference') {
    return (
      <svg viewBox="0 0 640 480" aria-hidden="true" focusable="false">
        {defs}
        <Blob id={uid} />
        <circle cx="112" cy="392" r="56" fill="none" stroke="rgba(121, 152, 22, .2)" strokeWidth="2" strokeDasharray="2 8" />
        <rect x="250" y="76" width="140" height="96" rx="10" fill="rgba(121, 152, 22, .1)" stroke="#799816" strokeWidth="3" />
        <rect x="272" y="94" width="96" height="60" rx="6" fill="#ffffff" stroke="none" />
        <rect x="284" y="106" width="72" height="8" rx="4" fill="rgba(121, 152, 22, .7)" />
        <rect x="292" y="126" width="56" height="8" rx="4" fill="#d6e0c2" />
        <rect x="312" y="172" width="16" height="34" fill="none" stroke="#799816" strokeWidth="3" />
        <Person cx={320} cy={286} />
        <path d="M344 300 L384 278" fill="none" stroke="#799816" strokeWidth="3" strokeLinecap="round" />
        <Person cx={196} cy={392} scale={0.62} />
        <Person cx={320} cy={404} scale={0.62} />
        <Person cx={444} cy={392} scale={0.62} />
      </svg>
    )
  }

  if (name === 'mains') {
    return (
      <svg viewBox="0 0 640 480" aria-hidden="true" focusable="false">
        {defs}
        <Blob id={uid} />
        <circle cx="540" cy="122" r="52" fill="none" stroke="rgba(121, 152, 22, .2)" strokeWidth="2" strokeDasharray="2 8" />
        <circle cx="320" cy="240" r="84" fill="none" stroke="rgba(121, 152, 22, .18)" strokeWidth="2" strokeDasharray="3 9" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 320 240)`}>
            <circle cx="320" cy="150" r="16" fill="#ffffff" stroke="#799816" strokeWidth="3" />
            <path
              d="M305 163 q -2 20 8 34 M320 155 v45 M335 163 q 2 20 -8 34"
              fill="none"
              stroke="#799816"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 640 480" aria-hidden="true" focusable="false">
      {defs}
      <Blob id={uid} />
      <circle cx="520" cy="142" r="50" fill="none" stroke="rgba(121, 152, 22, .2)" strokeWidth="2" strokeDasharray="2 8" />
      <rect x="176" y="176" width="132" height="226" rx="20" fill="none" stroke="#799816" strokeWidth="3" />
      <rect x="236" y="188" width="12" height="4" rx="2" fill="rgba(121, 152, 22, .5)" />
      <rect x="198" y="226" width="92" height="30" rx="15" fill="#ffffff" stroke="#799816" strokeWidth="2" />
      <circle cx="216" cy="241" r="4" fill="#799816" />
      <circle cx="232" cy="241" r="4" fill="#799816" />
      <circle cx="248" cy="241" r="4" fill="#799816" />
      <rect x="198" y="272" width="72" height="30" rx="15" fill="#ffffff" stroke="#799816" strokeWidth="2" />
      <rect x="212" y="282" width="30" height="4" rx="2" fill="rgba(121, 152, 22, .55)" />
      <rect x="212" y="292" width="46" height="4" rx="2" fill="#d6e0c2" />
      <circle cx="242" cy="336" r="17" fill="#256f4f" />
      <path d="M234 338 l6 6 l12 -12" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="392" y="298" width="52" height="14" rx="7" fill="#799816" />
      <path d="M444 284 L548 254 L548 356 L444 326 Z" fill="#dce8bd" stroke="#799816" strokeWidth="3" strokeLinejoin="round" />
      <path d="M488 264 a44 44 0 0 1 0 82" fill="none" stroke="#799816" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M516 252 a66 66 0 0 1 0 106" fill="none" stroke="#799816" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
    </svg>
  )
}

function Projets() {
  return (
    <section className="section projets-section" id="projets" aria-labelledby="projets-title">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Les projets associatifs</p>
          <h2 id="projets-title">Projets de développement communautaire</h2>
          <p>Ces projets associatifs de l’AEMA incarnent l’engagement et la créativité des membres.</p>
        </div>
        <div className="projets-list">
          {projets.map((projet) => (
            <article className="projet" key={projet.number}>
              <div className="projet-copy">
                <p className="projet-number">{projet.number}</p>
                <h3 className="projet-title">{projet.title}</h3>
                <div className="projet-cols">
                  <div className="projet-block">
                    <span>Actions</span>
                    <ul>{projet.actions.map((action) => <li key={action}>{action}</li>)}</ul>
                  </div>
                  <div className="projet-block">
                    <span>Objectifs</span>
                    <ul>{projet.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
                  </div>
                </div>
              </div>
              <figure className="projet-media">
                {projet.photo
                  ? <img src={projet.photo} alt={projet.alt} loading="lazy" />
                  : <Illustration name={projet.media} />}
                <figcaption>{projet.mediaTitle}</figcaption>
              </figure>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projets