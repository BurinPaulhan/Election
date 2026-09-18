import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'https://campaignaema.onrender.com'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function EmailIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
}

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
}

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
}

const coordonnees = [
  { href: 'mailto:r.thierry@edu.esss.dz', label: 'r.thierry@edu.esss.dz', icon: EmailIcon },
  { href: 'https://wa.me/213561322850', label: '+213 561 32 28 50', icon: WhatsAppIcon, external: true },
  { href: 'https://web.facebook.com/kirix.broscarter#', label: 'Thierry Arphax', icon: FacebookIcon, external: true },
]

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

  return <section className="section contact-section" id="contact" aria-labelledby="contact-title"><div className="container contact-grid"><div><p className="eyebrow">Échanger</p><h2 id="contact-title">Une question ?<br />Une suggestion ?</h2><p>Votre message aidera l’équipe à mieux comprendre les attentes des étudiants malagasy en Algérie.</p><ul className="contact-info">{coordonnees.map((item) => { const Icon = item.icon; return <li key={item.href}><a className="contact-item" href={item.href} {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><Icon /><span>{item.label}</span></a></li> })}</ul></div><form className="contact-form" onSubmit={handleSubmit} noValidate><div className="form-row"><label htmlFor="name">Nom <span>(facultatif)</span></label><input id="name" name="name" autoComplete="name" disabled={formStatus === 'sending'} /></div><div className="form-row"><label htmlFor="email">E-mail <span>(facultatif)</span></label><input id="email" name="email" type="email" autoComplete="email" disabled={formStatus === 'sending'} /></div><div className="form-row"><label htmlFor="message">Votre message</label><textarea id="message" name="message" required rows="5" disabled={formStatus === 'sending'} /></div><button className="button" type="submit" disabled={formStatus === 'sending'}>{formStatus === 'sending' ? 'Envoi…' : 'Envoyer le message'}</button>{formStatus === 'success' && <p className="form-status" role="status">Votre message a bien été envoyé.</p>}{formStatus === 'error' && <p className="form-status" role="status">{errorMessage}</p>}</form></div></section>
}

export default Contact