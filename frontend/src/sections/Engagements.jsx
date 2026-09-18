const engagements = ['Écouter', 'Communiquer ', 'Construire']
function Engagements() { return <section className="commitments" id="engagements" aria-labelledby="commitments-title"><div className="container commitments-inner"><div><p className="eyebrow">Les engagements</p><h2 id="commitments-title">Une méthode simple : rester proche, rester clair, avancer ensemble.</h2></div><ol>{engagements.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ol></div></section> }
export default Engagements
