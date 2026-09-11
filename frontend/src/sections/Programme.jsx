const axesProgramme = [
  { title: 'Accueillir', need: 'Les nouveaux étudiants peuvent avoir besoin de repères pour comprendre leur environnement et ne pas rester isolés.', goal: 'Nous proposons de faciliter leurs premiers pas et leur intégration.', actions: ['Guide du nouvel arrivant', 'Parrainage des nouveaux étudiants', 'Cellule d’orientation et d’information', 'Réseau de référents locaux'] },
  { title: 'Soutenir', need: 'La solidarité doit pouvoir devenir une réponse concrète, notamment dans les situations difficiles.', goal: 'Nous voulons renforcer les liens d’entraide entre étudiants.', actions: ['Fonds de solidarité AEMA', 'Cellule d’urgence et d’accompagnement', 'Réseau de solidarité entre étudiants', 'Accompagnement des étudiants hospitalisés'] },
  { title: 'Réussir', need: 'Le parcours académique et le développement des compétences méritent des espaces de partage adaptés.', goal: 'Nous souhaitons encourager la réussite et la transmission d’expériences.', actions: ['AEMA Académie', 'Programme de mentorat académique', 'Ateliers de compétences', 'Réseau professionnel des anciens étudiants'] },
  { title: 'Rassembler', need: 'La vie étudiante gagne en force lorsque la culture, le sport et les rencontres créent du lien.', goal: 'Nous défendons une communauté active, ouverte et conviviale.', actions: ['Journée culturelle malagasy', 'AEMA Sport', 'Rencontres AEMA', 'Talents Malagasy'] },
  { title: 'Construire', need: 'Une association durable a besoin d’une organisation claire, transparente et connectée à ses étudiants.', goal: 'Notre ambition est de consolider une AEMA mieux organisée et plus accessible.', actions: ['AEMA numérique', 'Communication régulière', 'Rapport d’activité', 'Consultation des étudiants', 'Développement de partenariats'] },
]

function Programme() {
  return <section className="section" id="programme" aria-labelledby="programme-title"><div className="container"><div className="section-heading narrow"><p className="eyebrow">Le programme</p><h2 id="programme-title">Cinq axes pour donner une direction à l’action.</h2></div><ol className="programme-list">{axesProgramme.map((axis, index) => <li key={axis.title}><div className="programme-number">0{index + 1}</div><div><h3>{axis.title}</h3><p><strong>Besoin.</strong> {axis.need}</p><p><strong>Objectif.</strong> {axis.goal}</p></div><div className="programme-actions"><span>Actions proposées</span><ul>{axis.actions.map((action) => <li key={action}>{action}</li>)}</ul></div></li>)}</ol></div></section>
}

export default Programme
