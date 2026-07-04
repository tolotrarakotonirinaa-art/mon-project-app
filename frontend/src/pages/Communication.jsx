import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Send, Trash2, RefreshCw,
  Phone, Video, Search, Smile
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Loader, Empty } from '../components/ui/UI.jsx'
import { C, S } from '../styles.js'
import { ini } from '../data.js'
import { PT, useConfirm } from './shared/PageUtils.jsx'

// ════════════════════════════════════════════
//  COMMUNICATION — Messagerie d'équipe en temps réel
// ════════════════════════════════════════════
//  NOTE : Les appels vocaux/vidéo nécessitent un service de
//  signalisation WebRTC (ex: Laravel Reverb, Pusher, Agora) qui
//  n'est pas encore configuré côté backend. Les boutons d'appel
//  sont donc affichés comme "Bientôt disponible" plutôt que
//  simulés, en attendant cette intégration.
// ════════════════════════════════════════════

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '✅', '👏', '🚀', '💡', '⚡']

// ─── Page principale ───────────────────────────────────────────────────────
export function Communication() {
  const { getChat, addMsg, clearChat, getUsers, showToast } = useApp()
  const { user } = useAuth()
  const { confirm, Dialog } = useConfirm()

  const [msgs, setMsgs] = useState([])
  const [contacts, setContacts] = useState([])
  const [input, setInput] = useState('')
  const [ai, setAi] = useState(-1)
  const [busy, setBusy] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [msgSearch, setMsgSearch] = useState('')
  const [showMsgSearch, setShowMsgSearch] = useState(false)

  const msgRef = useRef(null)
  const inputRef = useRef(null)

  const load = useCallback(async () => {
    setBusy(true)
    try {
      const [m, u] = await Promise.all([getChat('general'), getUsers()])
      setMsgs(m || [])
      setContacts((u || []).filter(u2 => u2.id !== user?.id))
    } catch { showToast('Erreur de chargement', 'danger') }
    finally { setBusy(false) }
  }, [getChat, getUsers, user?.id, showToast])

  useEffect(() => { load() }, [load])
  useEffect(() => { msgRef.current?.scrollTo(0, msgRef.current.scrollHeight) }, [msgs.length])

  // ── Auto-refresh polling (5s) ─────────────────────────────────────────
  const pollRef = useRef(null)
  const lastMsgId = useRef(null)
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const m = await getChat('general')
        if (!m || !m.length) return
        const latest = m[m.length - 1]?.id
        if (latest && latest !== lastMsgId.current) {
          lastMsgId.current = latest
          setMsgs(m)
        }
      } catch { /* ignore silently */ }
    }, 5000)
    return () => clearInterval(pollRef.current)
  }, [getChat])

  // ── Envoi message ───────────────────────────────────────────────────────
  const send = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const txt = input.trim()
    setInput('')
    setShowEmoji(false)
    try {
      await addMsg({ msg: txt })
      await load()
    } catch {
      showToast("Erreur d'envoi", 'danger')
      setInput(txt)
    } finally {
      setSending(false)
    }
  }

  const handleClear = async () => {
    const ok = await confirm('Vider le chat ? Tous les messages seront supprimés.')
    if (!ok) return
    try {
      await clearChat()
      await load()
      showToast('Chat vidé', 'success')
    } catch {
      showToast('Erreur lors du vidage', 'danger')
    }
  }

  // Filtres
  const filteredContacts = contacts.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )
  const filteredMsgs = msgSearch
    ? msgs.filter(m => (m.message || m.msg || '').toLowerCase().includes(msgSearch.toLowerCase()))
    : msgs

  if (busy) return <Loader />

  return (
    <div>
      {Dialog}

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
        <div>
          {PT('COMMUNICATION')}
          <p style={{ color: C.t2, fontSize: 13, marginTop: 4 }}>Messagerie d'équipe en temps réel</p>
        </div>
        <button onClick={load} style={S.btnGhost}><RefreshCw size={13} /></button>
      </div>

      {/* Corps principal */}
      <div style={{ ...S.panel({ padding: 0, overflow: 'hidden', display: 'flex', height: 580 }) }}>

        {/* ── Sidebar contacts ──────────────────────────────────────────── */}
        <div style={{ width: 205, flexShrink: 0, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '11px 13px', borderBottom: `1px solid ${C.border}` }}>
            <p style={S.label}>ÉQUIPE</p>
            <div style={{ position: 'relative', marginTop: 7 }}>
              <Search size={10} style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: C.t3 }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Chercher..."
                style={{
                  width: '100%', padding: '5px 7px 5px 22px', fontSize: 10,
                  background: 'rgba(0,200,255,0.04)', border: `1px solid ${C.border}`,
                  borderRadius: 7, color: C.t1, outline: 'none',
                  fontFamily: 'Rajdhani,sans-serif', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 7 }}>
            {/* Canal général */}
            <button onClick={() => setAi(-1)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
              padding: '9px 8px', borderRadius: 9, marginBottom: 3,
              border: 'none', background: ai === -1 ? 'rgba(0,200,255,0.1)' : 'none',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 7,
                background: 'linear-gradient(135deg,#00c8ff,#7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
              }}>💬</div>
              <div>
                <p style={{ fontSize: 11, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: ai === -1 ? C.cyan : C.t2 }}>#général</p>
                <p style={{ fontSize: 9, color: C.t3 }}>Tout le monde</p>
              </div>
            </button>

            <div style={{ height: 1, background: C.border, margin: '6px 4px' }} />

            {filteredContacts.map((u) => {
              const realI = contacts.indexOf(u)
              const isSelected = ai === realI
              return (
                <button key={u.id} onClick={() => setAi(realI)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  padding: '9px 8px', borderRadius: 9, marginBottom: 3,
                  border: 'none', background: isSelected ? 'rgba(0,200,255,0.1)' : 'none',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 7,
                      background: 'linear-gradient(135deg,#00c8ff,#7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: '#020408'
                    }}>
                      {ini(u.name)}
                    </div>
                    <div style={{
                      position: 'absolute', bottom: -1, right: -1,
                      width: 8, height: 8, borderRadius: '50%',
                      background: C.neon, border: `1.5px solid ${C.bg}`
                    }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      fontSize: 11, fontFamily: 'Orbitron,sans-serif', fontWeight: 700,
                      color: isSelected ? C.cyan : C.t2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {u.name.split(' ')[0]}
                    </p>
                    <p style={{ fontSize: 9, color: C.t3 }}>{u.role}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Statut en ligne */}
          <div style={{ padding: '10px 13px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: C.neon }} />
              <span style={{ fontSize: 9, color: C.t3, fontFamily: 'Orbitron,sans-serif' }}>
                {contacts.length + 1} EN LIGNE
              </span>
            </div>
          </div>
        </div>

        {/* ── Zone chat ─────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 14px', borderBottom: `1px solid ${C.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.span style={{ width: 7, height: 7, borderRadius: '50%', background: C.neon }}
                animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 700, fontSize: 12, color: C.t1 }}>
                {ai === -1 ? '#général' : contacts[ai]?.name || 'Chat'}
              </span>
              <span style={{ fontSize: 10, color: C.t3 }}>
                — {msgs.length} message{msgs.length > 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Recherche dans les messages */}
              <AnimatePresence>
                {showMsgSearch && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }} animate={{ width: 140, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                    value={msgSearch} onChange={e => setMsgSearch(e.target.value)}
                    placeholder="Rechercher..."
                    style={{
                      padding: '4px 8px', fontSize: 11,
                      background: 'rgba(0,200,255,0.06)', border: `1px solid ${C.border}`,
                      borderRadius: 7, color: C.t1, outline: 'none', fontFamily: 'Rajdhani,sans-serif'
                    }}
                  />
                )}
              </AnimatePresence>
              <button onClick={() => { setShowMsgSearch(v => !v); setMsgSearch('') }}
                style={{ background: 'none', border: 'none', color: showMsgSearch ? C.cyan : C.t3, cursor: 'pointer', padding: 4 }}>
                <Search size={13} />
              </button>

              {/* Appels — désactivés tant que la signalisation WebRTC n'est pas configurée côté backend */}
              <button disabled title="Appel vocal — bientôt disponible (configuration WebRTC requise)"
                style={{
                  padding: '5px 11px', borderRadius: 7, border: `1px solid ${C.border}`,
                  background: 'none', color: C.t3, cursor: 'not-allowed',
                  fontSize: 10, fontFamily: 'Orbitron,sans-serif', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 5, opacity: 0.4
                }}>
                <Phone size={12} /> Vocal
              </button>

              {ai !== -1 && (
                <button disabled title="Appel vidéo — bientôt disponible (configuration WebRTC requise)"
                  style={{
                    padding: '5px 11px', borderRadius: 7, border: `1px solid ${C.border}`,
                    background: 'none', color: C.t3, cursor: 'not-allowed',
                    fontSize: 10, fontFamily: 'Orbitron,sans-serif', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 5, opacity: 0.4
                  }}>
                  <Video size={12} /> Vidéo
                </button>
              )}

              <button onClick={handleClear} style={{ ...S.btnGhost, fontSize: 10, padding: '5px 9px' }}>
                <Trash2 size={10} /> Vider
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={msgRef} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {filteredMsgs.length === 0 && (
              <Empty icon={MessageSquare} msg="Aucun message" sub="Commencez la conversation !" />
            )}
            {filteredMsgs.map((m, i) => {
              const isMine = m.user_id === user?.id || m.sender === 'Vous' || m.type === 'sent'
              const isSystem = m.type === 'system' || m.sender === 'Système'

              if (isSystem) return (
                <div key={m.id || i} style={{ textAlign: 'center', margin: '4px 0' }}>
                  <span style={{
                    fontSize: 10, color: C.t3, fontFamily: 'JetBrains Mono,monospace',
                    background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: 20
                  }}>
                    {m.message || m.msg}
                  </span>
                </div>
              )

              return (
                <motion.div key={m.id || i} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', alignItems: 'flex-end', gap: 7, flexDirection: isMine ? 'row-reverse' : 'row' }}>
                  <div style={{
                    width: 27, height: 27, borderRadius: 7, flexShrink: 0,
                    background: isMine
                      ? 'linear-gradient(135deg,#7c3aed,#00c8ff)'
                      : 'linear-gradient(135deg,#00c8ff,#00ff88)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: '#020408'
                  }}>
                    {m.avatar || ini(m.sender || '?')}
                  </div>
                  <div style={{ maxWidth: '72%' }}>
                    {!isMine && (
                      <p style={{ fontSize: 9, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: C.cyan, marginBottom: 3 }}>
                        {m.sender}
                      </p>
                    )}
                    <div style={{
                      padding: '9px 13px', fontSize: 13, lineHeight: 1.5,
                      ...(isMine
                        ? { background: 'linear-gradient(135deg,#7c3aed,#00c8ff)', color: '#fff', borderRadius: '13px 4px 13px 13px' }
                        : { background: 'rgba(0,200,255,0.08)', border: `1px solid rgba(0,200,255,0.14)`, color: C.t1, borderRadius: '4px 13px 13px 13px' })
                    }}>
                      {m.message || m.msg}
                    </div>
                    <p style={{ fontSize: 9, color: C.t3, marginTop: 3, textAlign: isMine ? 'right' : 'left' }}>{m.time}</p>
                  </div>
                </motion.div>
              )
            })}

            {sending && (
              <div style={{ display: 'flex', gap: 4, padding: '4px 8px' }}>
                {[0, 1, 2].map(i => (
                  <motion.span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C.cyan }}
                    animate={{ y: [-3, 0, -3] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            )}
          </div>

          {/* Zone saisie */}
          <div style={{ borderTop: `1px solid ${C.border}` }}>
            {/* Picker emoji */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  style={{ padding: '8px 13px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: `1px solid ${C.border}` }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setInput(v => v + e)}
                      style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 2, borderRadius: 4 }}
                      onMouseEnter={ev => ev.currentTarget.style.transform = 'scale(1.3)'}
                      onMouseLeave={ev => ev.currentTarget.style.transform = 'scale(1)'}>
                      {e}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: 7, padding: '11px 13px', alignItems: 'center' }}>
              <button onClick={() => setShowEmoji(v => !v)}
                style={{ background: 'none', border: 'none', color: showEmoji ? C.cyan : C.t3, cursor: 'pointer', padding: 4 }}>
                <Smile size={16} />
              </button>
              <input
                ref={inputRef} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                style={{
                  flex: 1, padding: '10px 14px',
                  background: 'rgba(0,200,255,0.04)', border: `1px solid ${C.border}`,
                  borderRadius: 10, color: C.t1, fontFamily: 'Rajdhani,sans-serif',
                  fontSize: 13, outline: 'none'
                }}
                placeholder="Tapez votre message... (Entrée pour envoyer)"
              />
              <button onClick={send} disabled={!input.trim() || sending}
                style={{ ...S.btnCyan, padding: '10px 14px', opacity: !input.trim() || sending ? 0.5 : 1 }}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
