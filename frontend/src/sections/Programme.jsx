const axesProgramme = [
  {
    title: 'STRUCTURER',
    subtitle: 'Une gouvernance structurée et partagée',
    need: 'Une association nationale a besoin d’une organisation claire, de responsabilités définies et d’un fonctionnement cohérent entre ses représentants.',
    goal: 'Nous voulons construire une gouvernance structurée, participative et transparente, au service de tous les étudiants malagasy.',
    actions: ['Mise en place d’équipes de travail pour accompagner les membres du Bureau dans la réalisation de leurs missions.', 'Réunions régulières de l’équipe dirigeante', 'Réseau de référents dans les Wilayas', 'Rapport d’activité et suivi des actions', 'Consultation régulière des étudiants'],
  },
  {
    title: 'UNIR',
    subtitle: 'Une association unie à travers toutes les Wilayas',
    need: 'Les étudiants malagasy sont répartis dans différentes Wilayas. Cette diversité doit devenir une force, grâce à une meilleure coordination et à des liens réguliers.',
    goal: 'Nous voulons renforcer la solidarité, l’entraide et la proximité entre les étudiants, quelle que soit leur Wilaya.',
    actions: ['Meeting tournant avec les représentants des Wilayas', 'Réseau de solidarité entre étudiants', 'Guide du nouvel arrivant', 'Parrainage des nouveaux étudiants', 'Cellule d’orientation et d’information', 'Cellule d’urgence et d’accompagnement', 'Accompagnement des étudiants hospitalisés'],
  },
  {
    title: 'VALORISER',
    subtitle: 'Une vitrine d’excellence pour nos talents',
    need: 'Les étudiants malagasy disposent de compétences, de talents et d’expériences qui méritent d’être davantage valorisés et partagés.',
    goal: 'Nous voulons créer davantage d’occasions d’apprendre, de transmettre, de se rencontrer et de mettre en lumière les talents de notre communauté.',
    actions: ['AEMA Académie', 'Programme de mentorat académique', 'Ateliers de compétences', 'Interapprentissage', 'Concours et activités culturelles', 'Évènements sportifs', 'Talents Malagasy', 'Réseau professionnel des anciens étudiants'],
  },
  {
    title: 'RAYONNER',
    subtitle: 'Une communication moderne, transparente et visible',
    need: 'Une association active doit pouvoir informer ses membres efficacement et rendre visibles ses actions auprès de la communauté.',
    goal: 'Nous voulons développer une communication moderne, régulière et accessible, tout en renforçant la visibilité de l’AEMA.',
    actions: ['Création et animation des réseaux sociaux', 'Communication régulière sur les activités et informations importantes', 'Diffusion de photos, vidéos et interviews', 'AEMA numérique', 'Création de supports et goodies aux couleurs de l’association', 'Valorisation des initiatives et réussites des étudiants', 'Développement de partenariats'],
  },
]

function Programme() {
  return <section className="section" id="programme" aria-labelledby="programme-title"><div className="container"><div className="section-heading narrow"><p className="eyebrow">Le programme</p><h2 id="programme-title">NOTRE VISION, NOTRE PROGRAMME</h2><p>Quatre visions pour structurer, unir, valoriser et faire rayonner l’AEMA.</p></div><ol className="programme-list">{axesProgramme.map((axis, index) => <li key={axis.title}><div className="programme-number">0{index + 1}</div><div><h3>{axis.title}</h3><p className="programme-subtitle">{axis.subtitle}</p><p><strong>Besoin.</strong> {axis.need}</p><p><strong>Objectif.</strong> {axis.goal}</p></div><div className="programme-actions"><span>Actions proposées</span><ul>{axis.actions.map((action) => <li key={action}>{action}</li>)}</ul></div></li>)}</ol></div></section>
}

export default Programme