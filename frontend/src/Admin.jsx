import { useState, useEffect } from 'react'
import './admin.css'

const API = import.meta.env.VITE_API_URL || 'https://campaignaema.onrender.com'

function apiFetch(path, { token, method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw { status: res.status, data }
    return data
  })
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return dateStr }
}

// ── Login ────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Email et mot de passe requis.')
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch('/api/admin/login', {
        method: 'POST',
        body: { email: email.trim(), password },
      })
      onLogin(data.token, data.admin)
    } catch (err) {
      const msg = err?.data?.message || 'Erreur de connexion.'
      setError(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className="login-layout">
      <div className="login-card">
        <div className="brand-row"><span className="dot" /><span>Administration</span></div>
        <h2>Connexion</h2>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="admin-email">Adresse e-mail</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="form-field">
            <label htmlFor="admin-password">Mot de passe</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="login-footer">Accès réservé aux administrateurs.</p>
      </div>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────
function Dashboard({ token, admin, onLogout }) {
  const [messages, setMessages] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError('')
      setLoading(true)
      try {
        const data = await apiFetch('/api/admin/messages', { token })
        if (cancelled) return
        setMessages(data.messages || [])
        setUnreadCount(data.unreadCount || 0)
      } catch (err) {
        if (cancelled) return
        if (err?.status === 401) { onLogout(); return }
        setError(err?.data?.message || 'Erreur lors du chargement des messages.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [token, onLogout])

  const openDetail = async (id) => {
    setDetailLoading(true)
    setSelected(null)
    try {
      const data = await apiFetch(`/api/admin/messages/${id}`, { token })
      setSelected(data.message)
      if (data.message.statut === 'UNREAD') {
        await apiFetch(`/api/admin/messages/${id}/read`, { token, method: 'PATCH' })
        await loadMessages()
      }
    } catch (err) {
      if (err?.status === 401) { onLogout(); return }
      setError(err?.data?.message || 'Erreur lors de la récupération du message.')
    } finally { setDetailLoading(false) }
  }

  const loadMessages = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await apiFetch('/api/admin/messages', { token })
      setMessages(data.messages || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      if (err?.status === 401) { onLogout(); return }
      setError(err?.data?.message || 'Erreur lors du chargement des messages.')
    } finally { setLoading(false) }
  }

  const toggleRead = async (id, currentStatut) => {
    try {
      const endpoint = currentStatut === 'READ' ? 'unread' : 'read'
      await apiFetch(`/api/admin/messages/${id}/${endpoint}`, { token, method: 'PATCH' })
      await loadMessages()
      if (selected?.id === id) {
        setSelected({ ...selected, statut: currentStatut === 'READ' ? 'UNREAD' : 'READ' })
      }
    } catch (err) {
      if (err?.status === 401) { onLogout(); return }
      setError(err?.data?.message || 'Erreur.')
    }
  }

  const deleteMessage = async (id) => {
    try {
      await apiFetch(`/api/admin/messages/${id}`, { token, method: 'DELETE' })
      setConfirmDelete(null)
      if (selected?.id === id) setSelected(null)
      await loadMessages()
    } catch (err) {
      if (err?.status === 401) { onLogout(); return }
      setError(err?.data?.message || 'Erreur lors de la suppression.')
    }
  }

  const handleLogout = () => { sessionStorage.removeItem('aema_admin_token'); onLogout() }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>Administration</h1>
          <span className="admin-badge" aria-label={`${unreadCount} messages non lus`}>
            {unreadCount > 0 ? `${unreadCount} non lu${unreadCount > 1 ? 's' : ''}` : 'Aucun non lu'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '.75rem', color: 'var(--admin-muted)' }}>{admin.email}</span>
          <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Se déconnecter">⏻</button>
        </div>
      </header>

      <main className="admin-main">
        {error && <div className="form-error" role="alert" style={{ marginBottom: 20 }}>{error}</div>}

        {selected ? (
          <MessageDetail
            message={selected}
            loading={detailLoading}
            onBack={() => setSelected(null)}
            onToggleRead={toggleRead}
            onDelete={setConfirmDelete}
          />
        ) : (
          <>
            <div className="messages-header">
              <h2>Messages</h2>
              <button className="btn btn-ghost btn-icon" onClick={loadMessages} disabled={loading} title="Rafraîchir">⟳</button>
            </div>
            {loading ? (
              <div className="empty-state"><p>Chargement…</p></div>
            ) : messages.length === 0 ? (
              <div className="empty-state">
                <div className="icon">✉</div>
                <p>Aucun message pour le moment.</p>
              </div>
            ) : (
              <div className="message-list" role="list">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`message-item${m.statut === 'UNREAD' ? ' is-unread' : ''}`}
                    role="listitem"
                    onClick={() => openDetail(m.id)}
                    onKeyDown={(e) => e.key === 'Enter' && openDetail(m.id)}
                    tabIndex={0}
                  >
                    <div>
                      <div className="message-item-header">
                        {m.statut === 'UNREAD' && <span className="dot" aria-label="Non lu" />}
                        <strong>{m.nom || 'Anonyme'}</strong>
                        <span className="email">{m.email || 'Non renseigné'}</span>
                      </div>
                      <div className="message-snippet">{m.message}</div>
                    </div>
                    <span className="message-date">{formatDate(m.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {confirmDelete !== null && (
          <ConfirmDialog
            title="Supprimer ce message ?"
            body="Cette action est irréversible."
            confirmLabel="Supprimer"
            onConfirm={() => deleteMessage(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </main>
    </div>
  )
}

function MessageDetail({ message, loading, onBack, onToggleRead, onDelete }) {
  if (loading) return <div className="empty-state"><p>Chargement du message…</p></div>
  if (!message) return null
  return (
    <div className="detail-panel">
      <button className="detail-back" onClick={onBack}>← Retour</button>
      <div className="detail-top">
        <div className="detail-meta">
          <span className="from">{message.nom || 'Anonyme'}</span>
          <span className="email">{message.email || 'Non renseigné'}</span>
          <span className="date">{formatDate(message.created_at)}</span>
        </div>
        <div className="detail-actions">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => onToggleRead(message.id, message.statut)}
            title={message.statut === 'READ' ? 'Marquer non lu' : 'Marquer lu'}
          >
            {message.statut === 'READ' ? '○' : '●'}
          </button>
          <button
            className="btn btn-danger btn-icon"
            onClick={() => onDelete(message.id)}
            title="Supprimer"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="detail-body">{message.message}</div>
    </div>
  )
}

function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCancel])

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Annuler</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ── Root Admin App ───────────────────────────────────────
export default function AdminApp() {
  const [token, setToken] = useState(() => sessionStorage.getItem('aema_admin_token'))
  const [admin, setAdmin] = useState(null)
  const [view, setView] = useState(token ? 'dashboard' : 'login')

  const handleLogin = (newToken, newAdmin) => {
    sessionStorage.setItem('aema_admin_token', newToken)
    setToken(newToken)
    setAdmin(newAdmin)
    setView('dashboard')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('aema_admin_token')
    setToken(null)
    setAdmin(null)
    setView('login')
  }

  if (view === 'login' || !token) {
    return <div className="admin-root"><Login onLogin={handleLogin} /></div>
  }

  return <div className="admin-root"><Dashboard token={token} admin={admin} onLogout={handleLogout} /></div>
}