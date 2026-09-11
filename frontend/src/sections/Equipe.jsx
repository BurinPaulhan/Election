import staff1 from '../assets/images/staff1.jpg'
import staff2 from '../assets/images/staff2.png'
import staff3 from '../assets/images/staff3.jpg'
import staff4 from '../assets/images/staff4.jpg'
import staff5 from '../assets/images/staff5.jpg'
const teamPhotos = [staff1, staff2, staff3, staff4, staff5]
function Equipe() { return <section className="section team-section" id="equipe" aria-labelledby="team-title"><div className="container"><div className="section-heading team-heading"><p className="eyebrow">L’équipe</p><h2 id="team-title">Une campagne qui se prépare collectivement.</h2></div><div className="team-grid">{teamPhotos.map((photo, index) => <article className="team-member" key={photo}><img src={photo} alt={`Portrait d’un membre de l’équipe de campagne — informations à compléter (${index + 1})`} /><div><p className="team-role">Équipe de campagne</p><h3>Présentation à compléter</h3><p>Nom et rôle à confirmer.</p></div></article>)}</div></div></section> }
export default Equipe
