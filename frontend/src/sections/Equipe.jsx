import staff1 from '../assets/images/staff1.jpg'
import staff2 from '../assets/images/staff2.png'
import staff3 from '../assets/images/staff3.jpg'
import staff4 from '../assets/images/staff4.jpg'
import staff5 from '../assets/images/staff5.jpg'
import staff6 from '../assets/images/staff6.jpg'
const teamMembers = [
  { nom: 'RANDRIANATOANDRO Fanasina Ny Aina Ezekelah', formation: 'Lettres et langue Anglaise', promotion: '2024', photo: staff1 },
  { nom: 'RAZAFIMAMONJY Burin Paulhan', formation: 'Ingénieur informatique', promotion: '2025', photo: staff2 },
  { nom: 'HERITINA Avotriniaina', formation: 'Spécialité : Géotechnique', promotion: '2023', photo: staff3 },
  { nom: 'ANDRIAMASINIRINA Tolo-Janahary Julia', formation: 'Spécialité : Biotechnologie et pathologie moléculaire', promotion: '2023', photo: staff4 },
  { nom: 'NOTAHINJANAHARY P. S. Mark', formation: 'Agronome', promotion: '2023', photo: staff5 },
  { nom: 'RAZANAJATOVO Andriamampionona Fenohery ', formation: 'Télécommunications', promotion: '2025', photo: staff6 },
]
function Equipe() { return <section className="section team-section" id="equipe" aria-labelledby="team-title"><div className="container"><div className="section-heading team-heading"><p className="eyebrow">L’équipe</p><h2 id="team-title">Une campagne qui se prépare collectivement.</h2></div><div className="team-grid">{teamMembers.map((member, index) => <article className="team-member" key={member.photo}><img src={member.photo} alt={`Portrait de ${member.nom}`} /><div><p className="team-role">Équipe de campagne</p><h3> {member.nom}</h3><p className="team-formation">{member.formation}</p><p>Promotion {member.promotion}</p></div></article>)}</div></div></section> }
export default Equipe