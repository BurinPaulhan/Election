import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'https://campaignaema.onrender.com'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Contact() {
  const [formStatus, setFormStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.target
    const payload = {
      nom: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    }

    if (payload.email && !EMAIL_PATTERN.test(payload.email)) {
      setFormStatus('error')
      setErrorMessage("L'adresse e-mail est invalide.")
      return
    }
    if (!payload.message) {
      setFormStatus('error')
      setErrorMessage('Votre message est requis.')
      return
    }

    setFormStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && data.success) {
        setFormStatus('success')
        form.reset()
      } else {
        setFormStatus('error')
        setErrorMessage(data.message || "Une erreur est survenue. Réessayez.")
      }
    } catch {
      setFormStatus('error')
      setErrorMessage("Impossible d'envoyer le message. Vérifiez votre connexion.")
    }
  }

  return <section className="section contact-section" id="contact" aria-labelledby="contact-title"><div className="container contact-grid"><div><p className="eyebrow">Échanger</p><h2 id="contact-title">Une question ?<br />Une suggestion ?</h2><p>Votre message aidera l’équipe à mieux comprendre les attentes des étudiants malagasy en Algérie.</p></div><form className="contact-form" onSubmit={handleSubmit} noValidate><div className="form-row"><label htmlFor="name">Nom <span>(facultatif)</span></label><input id="name" name="name" autoComplete="name" disabled={formStatus === 'sending'} /></div><div className="form-row"><label htmlFor="email">E-mail <span>(facultatif)</span></label><input id="email" name="email" type="email" autoComplete="email" disabled={formStatus === 'sending'} /></div><div className="form-row"><label htmlFor="message">Votre message</label><textarea id="message" name="message" required rows="5" disabled={formStatus === 'sending'} /></div><button className="button" type="submit" disabled={formStatus === 'sending'}>{formStatus === 'sending' ? 'Envoi…' : 'Envoyer le message'}</button>{formStatus === 'success' && <p className="form-status" role="status">Votre message a bien été envoyé.</p>}{formStatus === 'error' && <p className="form-status" role="status">{errorMessage}</p>}</form></div></section>
}

export default Contact