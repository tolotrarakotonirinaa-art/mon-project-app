import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Send, Trash2, RefreshCw,
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff,
  Monitor, MonitorOff, Search, Smile, PhoneIncoming
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Loader, Empty } from '../components/ui/UI.jsx'
import { C, S } from '../styles.js'
import { ini } from '../data.js'
import { PT, useConfirm } from './shared/PageUtils.jsx'

// ════════════════════════════════════════════
//  COMMUNICATION — Messagerie + Appels Vocal & Vidéo
// ════════════════════════════════════════════

const AUTO = [
  'Bien reçu ! 👍', 'Je vais vérifier ça.', 'OK noté, merci !',
  "C'est noté ! On se call demain ?", "Super, merci pour l'info !",
  "Je m'en occupe maintenant.", "Parfait, je te tiens au courant.",
  "👌 Compris !", "Je regarde ça tout de suite.", "Merci ! 🙏"
]

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '✅', '👏', '🚀', '💡', '⚡']

// ─── Bannière appel actif ──────────────────────────────────────────────────
function CallBanner({ call, onEnd }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
      style={{
        background: 'linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,200,255,0.06))',
        border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12,
        padding: '10px 16px', marginBottom: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88' }} />
        <span style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 700, fontSize: 11, color: '#00ff88' }}>
          {call.type === 'video' ? '📹' : '📞'} APPEL EN COURS
        </span>
        <span style={{ fontSize: 11, color: C.t2, fontFamily: 'JetBrains Mono,monospace' }}>
          {call.with} — {fmt(elapsed)}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 7 }}>
        <button onClick={() => call.toggleMic()} style={{
          padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 10,
          background: call.micOn ? 'rgba(0,200,255,0.15)' : 'rgba(255,45,120,0.15)',
          color: call.micOn ? C.cyan : '#ff2d78', display: 'flex', alignItems: 'center', gap: 4
        }}>
          {call.micOn ? <Mic size={11} /> : <MicOff size={11} />}
        </button>
        {call.type === 'video' && (
          <button onClick={() => call.toggleVideo()} style={{
            padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 10,
            background: call.videoOn ? 'rgba(0,200,255,0.15)' : 'rgba(255,45,120,0.15)',
            color: call.videoOn ? C.cyan : '#ff2d78', display: 'flex', alignItems: 'center', gap: 4
          }}>
            {call.videoOn ? <Video size={11} /> : <VideoOff size={11} />}
          </button>
        )}
        <button onClick={onEnd} style={{
          padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 10,
          background: 'rgba(255,45,120,0.2)', color: '#ff2d78',
          fontFamily: 'Orbitron,sans-serif', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 5
        }}>
          <PhoneOff size={11} /> Raccrocher
        </button>
      </div>
    </motion.div>
  )
}

// ─── Modal appel entrant ───────────────────────────────────────────────────
function IncomingCallModal({ caller, type, onAccept, onDecline }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(2,4,8,0.88)', backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
      <motion.div initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 24 }}
        style={{
          background: 'linear-gradient(135deg,#0d1f35,#091426)',
          border: '1px solid rgba(0,200,255,0.2)', borderRadius: 22,
          padding: 36, textAlign: 'center', minWidth: 290, position: 'relative', overflow: 'hidden'
        }}>
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0, 0.25] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{
            position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 100, height: 100, borderRadius: '50%',
            background: type === 'video' ? 'rgba(0,200,255,0.12)' : 'rgba(0,255,136,0.12)'
          }} />
        <div style={{
          width: 70, height: 70, borderRadius: 18, margin: '0 auto 16px',
          background: 'linear-gradient(135deg,#00c8ff,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: '#020408',
          position: 'relative', zIndex: 1
        }}>
          {ini(caller)}
        </div>
        <p style={{ fontSize: 9, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: C.t3, marginBottom: 6 }}>
          {type === 'video' ? '📹 APPEL VIDÉO ENTRANT' : '📞 APPEL VOCAL ENTRANT'}
        </p>
        <p style={{ fontSize: 17, fontFamily: 'Orbitron,sans-serif', fontWeight: 800, color: C.t1, marginBottom: 4 }}>
          {caller}
        </p>
        <motion.p animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
          style={{ fontSize: 11, color: C.t3, marginBottom: 28 }}>
          vous appelle...
        </motion.p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button onClick={onDecline} style={{
            width: 54, height: 54, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#ff2d78,#cc1a55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 22px rgba(255,45,120,0.45)'
          }}>
            <PhoneOff size={21} color="#fff" />
          </button>
          <button onClick={onAccept} style={{
            width: 54, height: 54, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#00ff88,#00cc66)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 22px rgba(0,255,136,0.45)'
          }}>
            {type === 'video' ? <Video size={21} color="#020408" /> : <Phone size={21} color="#020408" />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Fenêtre vidéo plein écran ─────────────────────────────────────────────
function VideoCallWindow({ call, onEnd, onToggleMic, onToggleVideo, onToggleScreen }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#020408', display: 'flex', flexDirection: 'column' }}>
      {/* Zone vidéo */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(160deg,#0a1628,#0d1f35,#070e1a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18
        }}>
          {/* Avatar distant */}
          <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity }}
            style={{
              width: 100, height: 100, borderRadius: 26,
              background: 'linear-gradient(135deg,#00c8ff,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontFamily: 'Orbitron,sans-serif', fontWeight: 800, color: '#020408',
              boxShadow: '0 0 40px rgba(0,200,255,0.25)'
            }}>
            {ini(call.with)}
          </motion.div>
          <p style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 700, fontSize: 15, color: C.t1 }}>
            {call.with}
          </p>
          <p style={{ fontSize: 13, color: C.t3, fontFamily: 'JetBrains Mono,monospace' }}>
            {fmt(elapsed)}
          </p>
        </div>

        {/* Miniature self */}
        <div style={{
          position: 'absolute', bottom: 18, right: 18,
          width: 130, height: 84, borderRadius: 11,
          background: 'linear-gradient(135deg,#1a2a40,#0d1f35)',
          border: `2px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <p style={{ fontSize: 9, color: C.t3, fontFamily: 'Orbitron,sans-serif' }}>
            {call.videoOn ? 'VOUS' : '📷 OFF'}
          </p>
        </div>

        {/* Info top */}
        <div style={{ position: 'absolute', top: 18, left: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88' }} />
          <span style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 700, fontSize: 12, color: C.t1 }}>
            {call.with}
          </span>
          {call.screenOn && (
            <span style={{
              fontSize: 9, fontFamily: 'Orbitron,sans-serif', fontWeight: 700,
              padding: '2px 7px', borderRadius: 4, background: 'rgba(0,200,255,0.15)', color: C.cyan
            }}>
              PARTAGE ÉCRAN
            </span>
          )}
        </div>
      </div>

      {/* Barre contrôles */}
      <div style={{
        padding: '18px 24px', background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(20px)', borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14
      }}>
        {[
          { icon: call.micOn ? Mic : MicOff, action: onToggleMic, active: call.micOn, label: 'Micro' },
          { icon: call.videoOn ? Video : VideoOff, action: onToggleVideo, active: call.videoOn, label: 'Caméra' },
          { icon: call.screenOn ? Monitor : MonitorOff, action: onToggleScreen, active: call.screenOn, label: 'Écran' },
        ].map(({ icon: Icon, action, active, label }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <button onClick={action} style={{
              width: 50, height: 50, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: active ? 'rgba(0,200,255,0.18)' : 'rgba(255,255,255,0.07)',
              color: active ? C.cyan : C.t2,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}>
              <Icon size={19} />
            </button>
            <span style={{ fontSize: 9, color: C.t3, fontFamily: 'Orbitron,sans-serif' }}>{label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <button onClick={onEnd} style={{
            width: 54, height: 54, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#ff2d78,#cc1a55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 22px rgba(255,45,120,0.4)'
          }}>
            <PhoneOff size={22} color="#fff" />
          </button>
          <span style={{ fontSize: 9, color: '#ff2d78', fontFamily: 'Orbitron,sans-serif' }}>Raccrocher</span>
        </div>
      </div>
    </motion.div>
  )
}

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

  // États appels
  const [activeCall, setActiveCall] = useState(null)
  const [incomingCall, setIncomingCall] = useState(null)
  const [videoCallOpen, setVideoCallOpen] = useState(false)

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
      setTimeout(async () => {
        const contact = contacts[ai]
        if (contact) {
          await addMsg({ msg: AUTO[Math.floor(Math.random() * AUTO.length)], sender: contact.name })
          await load()
        }
      }, 1200 + Math.random() * 800)
    } catch { showToast("Erreur d'envoi", 'danger'); setInput(txt) }
    finally { setSending(false) }
  }

  const handleClear = async () => {
    const ok = await confirm('Vider le chat ? Tous les messages seront supprimés.')
    if (!ok) return
    clearChat(); load(); showToast('Chat vidé', 'success')
  }

  // ── Logique appels ──────────────────────────────────────────────────────
  const buildCall = (type, withName) => ({
    type, with: withName,
    micOn: true,
    videoOn: type === 'video',
    screenOn: false,
    toggleMic: () => setActiveCall(c => c ? { ...c, micOn: !c.micOn } : c),
    toggleVideo: () => setActiveCall(c => c ? { ...c, videoOn: !c.videoOn } : c),
  })

  const startCall = (type) => {
    if (activeCall) { showToast('Un appel est déjà en cours', 'warning'); return }
    const contactName = ai === -1 ? 'Équipe' : contacts[ai]?.name || 'Contact'
    if (ai === -1 && type === 'video') {
      showToast('Appel vidéo disponible en message direct uniquement', 'warning'); return
    }
    // Simulation : 50% chance appel entrant (UX démo)
    if (ai !== -1 && Math.random() > 0.5) {
      setIncomingCall({ caller: contactName, type })
    } else {
      const call = buildCall(type, contactName)
      setActiveCall(call)
      if (type === 'video') setVideoCallOpen(true)
      showToast(`${type === 'video' ? '📹 Vidéo' : '📞 Vocal'} — ${contactName}`, 'success')
      addMsg({ msg: `📞 Appel ${type === 'video' ? 'vidéo' : 'vocal'} initié avec ${contactName}`, sender: 'Système', type: 'system' })
      load()
    }
  }

  const endCall = () => {
    const dur = Math.floor(Math.random() * 200 + 30)
    const m = Math.floor(dur / 60), s = dur % 60
    showToast(`Appel terminé — ${m}m${s}s`, 'info')
    if (activeCall) {
      addMsg({ msg: `📞 Appel terminé (${m}m${s}s)`, sender: 'Système', type: 'system' })
      load()
    }
    setActiveCall(null)
    setVideoCallOpen(false)
  }

  const toggleMic = () => setActiveCall(c => c ? { ...c, micOn: !c.micOn } : c)
  const toggleVideo = () => setActiveCall(c => c ? { ...c, videoOn: !c.videoOn } : c)
  const toggleScreen = () => {
    setActiveCall(c => {
      if (!c) return c
      showToast(c.screenOn ? "Partage d'écran arrêté" : "Partage d'écran activé", 'info')
      return { ...c, screenOn: !c.screenOn }
    })
  }

  const acceptIncoming = () => {
    const { caller, type } = incomingCall
    setIncomingCall(null)
    const call = buildCall(type, caller)
    setActiveCall(call)
    if (type === 'video') setVideoCallOpen(true)
    showToast(`Appel accepté avec ${caller}`, 'success')
    addMsg({ msg: `📞 Appel ${type === 'video' ? 'vidéo' : 'vocal'} avec ${caller}`, sender: 'Système', type: 'system' })
    load()
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

      {/* Modal appel entrant */}
      <AnimatePresence>
        {incomingCall && (
          <IncomingCallModal
            caller={incomingCall.caller}
            type={incomingCall.type}
            onAccept={acceptIncoming}
            onDecline={() => { setIncomingCall(null); showToast('Appel refusé', 'warning') }}
          />
        )}
      </AnimatePresence>

      {/* Fenêtre vidéo plein écran */}
      <AnimatePresence>
        {videoCallOpen && activeCall?.type === 'video' && (
          <VideoCallWindow
            call={activeCall}
            onEnd={endCall}
            onToggleMic={toggleMic}
            onToggleVideo={toggleVideo}
            onToggleScreen={toggleScreen}
          />
        )}
      </AnimatePresence>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
        <div>
          {PT('COMMUNICATION')}
          <p style={{ color: C.t2, fontSize: 13, marginTop: 4 }}>Messagerie & appels d'équipe en temps réel</p>
        </div>
        <button onClick={load} style={S.btnGhost}><RefreshCw size={13} /></button>
      </div>

      {/* Bannière appel actif (vocal uniquement — vidéo = plein écran) */}
      <AnimatePresence>
        {activeCall && !videoCallOpen && (
          <CallBanner call={activeCall} onEnd={endCall} />
        )}
      </AnimatePresence>

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
                  {/* Boutons appel rapide si contact sélectionné */}
                  {isSelected && (
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <button onClick={e => { e.stopPropagation(); startCall('audio') }}
                        style={{ background: 'none', border: 'none', color: '#00ff88', cursor: 'pointer', padding: 3, borderRadius: 4 }}
                        title="Appel vocal">
                        <Phone size={11} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); startCall('video') }}
                        style={{ background: 'none', border: 'none', color: C.cyan, cursor: 'pointer', padding: 3, borderRadius: 4 }}
                        title="Appel vidéo">
                        <Video size={11} />
                      </button>
                    </div>
                  )}
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

              {/* Bouton appel vocal */}
              <button onClick={() => startCall('audio')} disabled={!!activeCall}
                style={{
                  padding: '5px 11px', borderRadius: 7, border: `1px solid ${activeCall ? C.border : 'rgba(0,255,136,0.25)'}`,
                  background: activeCall ? 'none' : 'rgba(0,255,136,0.08)',
                  color: activeCall ? C.t3 : '#00ff88', cursor: activeCall ? 'not-allowed' : 'pointer',
                  fontSize: 10, fontFamily: 'Orbitron,sans-serif', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 5, opacity: activeCall ? 0.4 : 1, transition: 'all 0.2s'
                }}>
                <Phone size={12} /> Vocal
              </button>

              {/* Bouton appel vidéo (DM uniquement) */}
              {ai !== -1 && (
                <button onClick={() => startCall('video')} disabled={!!activeCall}
                  style={{
                    padding: '5px 11px', borderRadius: 7, border: `1px solid ${activeCall ? C.border : 'rgba(0,200,255,0.25)'}`,
                    background: activeCall ? 'none' : 'rgba(0,200,255,0.08)',
                    color: activeCall ? C.t3 : C.cyan, cursor: activeCall ? 'not-allowed' : 'pointer',
                    fontSize: 10, fontFamily: 'Orbitron,sans-serif', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 5, opacity: activeCall ? 0.4 : 1, transition: 'all 0.2s'
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
