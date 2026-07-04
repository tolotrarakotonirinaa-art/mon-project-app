import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitBranch, Play, Square, Trash2, RefreshCw,
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Terminal, BarChart3, Zap, GitCommit, Download,
  ChevronDown, Search, Package, Shield, Activity,
  RotateCcw, FileText, TrendingUp, Copy, Eye
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Loader } from '../components/ui/UI.jsx'
import { api } from '../services/api.js'
import { C, S } from '../styles.js'

// ════════════════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════════════════
const STAGES = [
  { id: 'checkout', label: 'Checkout', icon: '📦', desc: 'Récupération du code source',   color: '#7c3aed' },
  { id: 'tests',    label: 'Tests',    icon: '🧪', desc: 'Tests unitaires & intégration', color: '#00c8ff' },
  { id: 'build',    label: 'Build',    icon: '🔨', desc: 'Compilation et optimisation',   color: '#ffce00' },
  { id: 'deploy',   label: 'Deploy',   icon: '🚀', desc: 'Déploiement en production',     color: '#00ff88' },
]

const ENVS = [
  { id: 'development', label: 'Development', color: '#00c8ff', icon: '💻' },
  { id: 'testing',     label: 'Testing',     color: '#7c3aed', icon: '🧪' },
  { id: 'staging',     label: 'Staging',     color: '#ffce00', icon: '🔬' },
  { id: 'production',  label: 'Production',  color: '#00ff88', icon: '🚀' },
]

const ST = {
  completed: { color: '#00ff88', label: 'TERMINÉ',    bg: 'rgba(0,255,136,0.07)' },
  active:    { color: '#00c8ff', label: 'EN COURS',   bg: 'rgba(0,200,255,0.07)' },
  pending:   { color: '#2a4a6a', label: 'EN ATTENTE', bg: 'rgba(42,74,106,0.04)' },
  failed:    { color: '#ff2d78', label: 'ÉCHEC',      bg: 'rgba(255,45,120,0.07)' },
}

const LOG_COLORS = { success: '#00ff88', error: '#ff2d78', warning: '#ffce00', info: '#00c8ff' }
const LOG_LEVELS = ['all', 'info', 'success', 'warning', 'error']

// Polling interval (ms) rehefa running ny pipeline
const POLL_INTERVAL = 4000

// ════════════════════════════════════════════════════════
//  SOUS-COMPOSANTS (mémoïsés)
// ════════════════════════════════════════════════════════

const StageCard = memo(({ stage, statusVal, isRunning, isLast, stageDuration, onRetry }) => {
  const st = ST[statusVal] || ST.pending
  const isActive = statusVal === 'active' && isRunning

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <motion.div
        style={{
          padding: '18px 10px', textAlign: 'center', background: st.bg,
          borderRadius: 12, border: `1px solid ${st.color}22`,
          height: '100%', position: 'relative', overflow: 'hidden'
        }}
        animate={isActive ? { boxShadow: [`0 0 0 1px ${stage.color}22`, `0 0 18px ${stage.color}44`, `0 0 0 1px ${stage.color}22`] } : { boxShadow: 'none' }}
        transition={isActive ? { duration: 1.4, repeat: Infinity } : {}}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: statusVal === 'pending' ? 'transparent' : stage.color, opacity: 0.7 }} />
        <div style={{ fontSize: 24, marginBottom: 8 }}>{stage.icon}</div>
        <div style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 800, fontSize: 10, color: C.t1, marginBottom: 4 }}>{stage.label}</div>
        <div style={{ fontSize: 9, color: C.t3, marginBottom: 8, lineHeight: 1.4, minHeight: 24 }}>{stage.desc}</div>
        {stageDuration > 0 && <div style={{ fontSize: 9, color: C.t3, fontFamily: 'JetBrains Mono,monospace', marginBottom: 6 }}>⏱ {stageDuration}s</div>}
        <motion.span
          style={{ fontSize: 8, fontFamily: 'Orbitron,sans-serif', fontWeight: 800, padding: '3px 7px', borderRadius: 5, background: `${st.color}18`, color: st.color, border: `1px solid ${st.color}30`, display: 'inline-flex', alignItems: 'center', gap: 4 }}
          animate={isActive ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
          transition={isActive ? { duration: 0.9, repeat: Infinity } : {}}>
          {isActive && <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} style={{ width: 7, height: 7, borderRadius: '50%', border: `1.5px solid ${st.color}`, borderTopColor: 'transparent' }} />}
          {statusVal === 'completed' && <CheckCircle2 size={8} />}
          {statusVal === 'failed'    && <XCircle size={8} />}
          {st.label}
        </motion.span>
        {statusVal === 'failed' && onRetry && (
          <button onClick={onRetry} style={{ display: 'block', margin: '8px auto 0', padding: '3px 9px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)', borderRadius: 5, color: '#ff2d78', fontSize: 8, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, cursor: 'pointer' }}>
            ↺ Retry
          </button>
        )}
      </motion.div>
      {!isLast && (
        <div style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', zIndex: 10, fontSize: 18, fontWeight: 700, color: statusVal === 'completed' ? '#00ff88' : C.t3 }}>›</div>
      )}
    </div>
  )
})

const LogsTerminal = memo(({ logs, running, env, onClear }) => {
  const logRef = useRef(null)
  const [logFilter, setLogFilter] = useState('all')
  const [logSearch, setLogSearch] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  const filteredLogs = useMemo(() =>
    logs.filter(l => {
      const matchLevel  = logFilter === 'all' || l.level === logFilter
      const matchSearch = !logSearch || l.text.toLowerCase().includes(logSearch.toLowerCase())
      return matchLevel && matchSearch
    }), [logs, logFilter, logSearch])

  useEffect(() => {
    if (autoScroll && logRef.current) logRef.current.scrollTo(0, logRef.current.scrollHeight)
  }, [filteredLogs, autoScroll])

  const downloadLogs = () => {
    const content = logs.map(l => `[${l.time}] [${(l.level || 'info').toUpperCase()}] ${l.text}`).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    a.download = `pipeline-logs-${Date.now()}.txt`; a.click()
  }

  return (
    <div style={{ position: fullscreen ? 'fixed' : 'relative', inset: fullscreen ? 0 : 'auto', zIndex: fullscreen ? 999 : 'auto', background: fullscreen ? '#020408' : 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: fullscreen ? 0 : 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.3)', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ fontSize: 10, color: C.t3, marginLeft: 6, fontFamily: 'JetBrains Mono,monospace' }}>pipeline@{env} — {logs.length} lignes</span>
          {running && <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#00ff88', marginLeft: 4 }} />}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={10} style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: C.t3 }} />
            <input value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Rechercher..." style={{ padding: '4px 7px 4px 22px', fontSize: 10, width: 110, background: 'rgba(0,200,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 6, color: C.t1, outline: 'none', fontFamily: 'JetBrains Mono,monospace' }} />
          </div>
          <select value={logFilter} onChange={e => setLogFilter(e.target.value)} style={{ padding: '4px 7px', fontSize: 10, background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 6, color: C.t2, outline: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono,monospace' }}>
            {LOG_LEVELS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
          <button onClick={() => setAutoScroll(v => !v)} style={{ padding: '4px 8px', fontSize: 9, borderRadius: 6, border: `1px solid ${C.border}`, background: autoScroll ? 'rgba(0,255,136,0.1)' : 'none', color: autoScroll ? '#00ff88' : C.t3, cursor: 'pointer', fontFamily: 'Orbitron,sans-serif', fontWeight: 700 }}>AUTO</button>
          <button onClick={downloadLogs} style={{ background: 'none', border: 'none', color: C.t3, cursor: 'pointer', padding: 4 }} title="Télécharger"><Download size={12} /></button>
          <button onClick={() => setFullscreen(v => !v)} style={{ background: 'none', border: 'none', color: C.t3, cursor: 'pointer', padding: 4 }} title="Plein écran"><Eye size={12} /></button>
          <button onClick={onClear} style={{ ...S.btnGhost, padding: '4px 9px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={10} /> Effacer</button>
        </div>
      </div>
      {/* Logs */}
      <div ref={logRef} style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono,monospace', fontSize: 11, lineHeight: 2, minHeight: 240, maxHeight: fullscreen ? 'calc(100vh - 100px)' : 360, overflowY: 'auto', background: 'rgba(0,0,0,0.45)' }}>
        {filteredLogs.length === 0 && !running && <span style={{ color: C.t3 }}>$ Aucun log — lancez le pipeline pour commencer.</span>}
        {filteredLogs.map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.08 }} style={{ display: 'flex', gap: 12, marginBottom: 1, alignItems: 'flex-start' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ color: '#2a4a6a', flexShrink: 0, userSelect: 'none', fontSize: 10 }}>[{l.time}]</span>
            <span style={{ color: '#2a6a4a', flexShrink: 0, fontSize: 9, fontWeight: 700, width: 52, textAlign: 'right' }}>{(l.level || 'info').toUpperCase()}</span>
            <span style={{ color: l.color || C.cyan, flex: 1, wordBreak: 'break-all' }}>{l.text}</span>
            <button onClick={() => navigator.clipboard?.writeText(`[${l.time}] ${l.text}`).catch(() => {})} style={{ background: 'none', border: 'none', color: C.t3, cursor: 'pointer', padding: '0 2px', opacity: 0.4, flexShrink: 0 }} title="Copier"><Copy size={9} /></button>
          </motion.div>
        ))}
        {running && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ color: '#00ff88', display: 'inline-block', marginTop: 4, fontSize: 14 }}>█</motion.span>}
      </div>
    </div>
  )
})

const AnalyticsPanel = memo(({ logs, status, history }) => {
  const stats = useMemo(() => {
    const total     = logs.length
    const success   = logs.filter(l => l.level === 'success').length
    const errors    = logs.filter(l => l.level === 'error').length
    const warnings  = logs.filter(l => l.level === 'warning').length
    const completed = Object.values(status).filter(v => v === 'completed').length
    const successRate = history.length ? Math.round((history.filter(h => h.status === 'completed').length / history.length) * 100) : 0
    const avgDuration = history.length ? Math.round(history.reduce((a, h) => a + (h.duration || 0), 0) / history.length) : 0
    return { total, success, errors, warnings, completed, successRate, avgDuration }
  }, [logs, status, history])

  const cards = [
    { label: 'Taux de succès',   value: `${stats.successRate}%`, color: '#00ff88', icon: TrendingUp   },
    { label: 'Durée moyenne',    value: `${stats.avgDuration}s`, color: '#00c8ff', icon: Clock        },
    { label: 'Logs succès',      value: stats.success,           color: '#00ff88', icon: CheckCircle2 },
    { label: 'Erreurs',          value: stats.errors,            color: '#ff2d78', icon: XCircle      },
    { label: 'Avertissements',   value: stats.warnings,          color: '#ffce00', icon: AlertTriangle},
    { label: 'Stages OK',        value: `${stats.completed}/4`,  color: '#7c3aed', icon: Zap          },
    { label: 'Pipelines lancés', value: history.length,          color: '#00c8ff', icon: Activity     },
    { label: 'Total logs',       value: stats.total,             color: C.t2,      icon: FileText     },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 12, marginBottom: 20 }}>
        {cards.map(({ label, value, color, icon: Icon }) => (
          <motion.div key={label} whileHover={{ y: -3, transition: { duration: 0.2 } }}
            style={{ background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 12, padding: '14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon size={18} style={{ color, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 900, fontSize: 20, color }}>{value}</div>
              <div style={{ fontSize: 8, color: C.t3, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, marginTop: 2 }}>{label.toUpperCase()}</div>
            </div>
          </motion.div>
        ))}
      </div>
      {logs.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 10, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: C.t2, marginBottom: 12 }}>DISTRIBUTION DES LOGS</p>
          {[
            { label: 'Succès',         count: stats.success,  color: '#00ff88' },
            { label: 'Info',           count: stats.total - stats.success - stats.errors - stats.warnings, color: '#00c8ff' },
            { label: 'Avertissements', count: stats.warnings, color: '#ffce00' },
            { label: 'Erreurs',        count: stats.errors,   color: '#ff2d78' },
          ].map(({ label, count, color }) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                <span style={{ color: C.t2 }}>{label}</span>
                <span style={{ color, fontFamily: 'Orbitron,sans-serif', fontWeight: 700 }}>{count}</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: stats.total > 0 ? `${(count / stats.total) * 100}%` : '0%' }} transition={{ duration: 1 }}
                  style={{ height: '100%', background: color, borderRadius: 10 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

// ── Artifacts : avy amin'ny /files API (upload marina) ──
const ArtifactsPanel = memo(({ files, loadingFiles, onDeleteFile }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
      <Package size={13} style={{ color: C.cyan }} />
      <span style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 800, fontSize: 11, color: C.t1 }}>FICHIERS / ARTIFACTS</span>
      <span style={{ fontSize: 9, color: C.t3 }}>{files.length} fichier{files.length !== 1 ? 's' : ''}</span>
    </div>
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {loadingFiles && <p style={{ textAlign: 'center', color: C.t3, fontSize: 11, padding: 24 }}>⏳ Chargement...</p>}
      {!loadingFiles && files.length === 0 && (
        <p style={{ textAlign: 'center', color: C.t3, fontSize: 11, padding: 24 }}>📭 Aucun fichier — uploadez via la page Dépôt</p>
      )}
      {files.map(f => (
        <motion.div key={f.id} whileHover={{ x: 3 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 9, background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.12)' }}>
          <span style={{ fontSize: 20 }}>📄</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono,monospace', color: C.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name || f.original_name || f.filename}</p>
            <p style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>
              {f.size ? `${(f.size / 1024 / 1024).toFixed(2)} MB · ` : ''}
              {f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}
              {f.description ? ` · ${f.description}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => api.downloadFile(f.id, f.name || f.original_name || 'fichier')}
              style={{ padding: '4px 9px', borderRadius: 6, border: '1px solid rgba(0,200,255,0.3)', background: 'rgba(0,200,255,0.1)', color: '#00c8ff', cursor: 'pointer', fontSize: 9, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Download size={9} /> DL
            </button>
            <button onClick={() => onDeleteFile(f.id)} style={{ padding: '4px 7px', borderRadius: 6, border: '1px solid rgba(255,45,120,0.2)', background: 'rgba(255,45,120,0.06)', color: '#ff2d78', cursor: 'pointer' }}>
              <Trash2 size={9} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
))

// ── Git Panel : avy amin'ny /files API (tsy misy /pipeline/commits) ──
const GitPanel = memo(({ commits, loading }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
      <GitBranch size={13} style={{ color: '#7c3aed' }} />
      <span style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 800, fontSize: 11, color: C.t1 }}>GIT — COMMITS RÉCENTS</span>
      <span style={{ fontSize: 9, color: '#ffce00', padding: '2px 7px', borderRadius: 4, background: 'rgba(255,206,0,0.08)', border: '1px solid rgba(255,206,0,0.2)' }}>Nécessite intégration GitHub</span>
    </div>
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {loading && <p style={{ textAlign: 'center', color: C.t3, fontSize: 11, padding: 24 }}>⏳ Chargement...</p>}
      {!loading && commits.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: C.t3 }}>
          <GitCommit size={28} style={{ opacity: 0.3, margin: '0 auto 10px', display: 'block' }} />
          <p style={{ fontSize: 11 }}>Aucun commit disponible</p>
          <p style={{ fontSize: 9, marginTop: 6, color: C.t3 }}>Configurez un webhook GitHub pour afficher les commits ici</p>
        </div>
      )}
      {commits.map((c, i) => (
        <motion.div key={c.hash || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.12)' }}>
          <GitCommit size={12} style={{ color: '#7c3aed', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: C.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.msg || c.message}</p>
            <p style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>
              <span style={{ color: '#7c3aed', fontFamily: 'JetBrains Mono,monospace' }}>{c.hash}</span>{' · '}{c.author}{' · '}{c.time || c.created_at}
            </p>
          </div>
          <span style={{ fontSize: 8, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: c.branch === 'main' ? 'rgba(0,255,136,0.1)' : 'rgba(0,200,255,0.1)', color: c.branch === 'main' ? '#00ff88' : '#00c8ff', border: `1px solid ${c.branch === 'main' ? 'rgba(0,255,136,0.2)' : 'rgba(0,200,255,0.2)'}`, flexShrink: 0 }}>
            {c.branch || 'main'}
          </span>
        </motion.div>
      ))}
    </div>
  </div>
))

const HistoryPanel = memo(({ history, onRollback, rollbackId }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
    {history.length === 0
      ? <div style={{ textAlign: 'center', padding: 40, color: C.t3, fontSize: 12 }}>
          <GitCommit size={32} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
          Aucun historique — lancez votre premier pipeline
        </div>
      : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {history.map((h, i) => (
            <motion.div key={h.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.02)', border: `1px solid ${h.status === 'completed' ? 'rgba(0,255,136,0.14)' : 'rgba(255,45,120,0.14)'}` }}>
              {h.status === 'completed'
                ? <CheckCircle2 size={15} style={{ color: '#00ff88', flexShrink: 0 }} />
                : <XCircle size={15} style={{ color: '#ff2d78', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 700, fontSize: 11, color: C.t1 }}>{h.env ? h.env.toUpperCase() : ''}</span>
                <span style={{ fontSize: 10, color: C.t3, marginLeft: 10 }}>par {h.by}</span>
              </div>
              <span style={{ fontSize: 9, color: C.t3, fontFamily: 'JetBrains Mono,monospace' }}>{h.duration}s</span>
              <span style={{ fontSize: 9, color: C.t3 }}>{h.time}</span>
              {i > 0 && (
                <button
                  onClick={() => onRollback(h)}
                  disabled={rollbackId === h.id}
                  style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,206,0,0.25)', background: rollbackId === h.id ? 'rgba(255,206,0,0.15)' : 'rgba(255,206,0,0.06)', color: '#ffce00', cursor: rollbackId === h.id ? 'not-allowed' : 'pointer', fontSize: 8, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, opacity: rollbackId === h.id ? 0.6 : 1 }}>
                  {rollbackId === h.id
                    ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} style={{ width: 7, height: 7, borderRadius: '50%', border: '1.5px solid #ffce00', borderTopColor: 'transparent' }} /> En cours...</>
                    : <><RotateCcw size={8} /> Rollback</>}
                </button>
              )}
            </motion.div>
          ))}
        </div>
    }
  </div>
))

const ApprovalModal = memo(({ env, onApprove, onReject, approving }) => {
  const [note, setNote] = useState('')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(2,4,8,0.9)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ scale: 0.88, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: 'linear-gradient(135deg,#0d1f35,#091426)', border: '1px solid rgba(255,206,0,0.25)', borderRadius: 18, padding: 32, minWidth: 360, maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Shield size={20} style={{ color: '#ffce00' }} />
          <div>
            <p style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 800, fontSize: 13, color: '#ffce00' }}>APPROBATION REQUISE</p>
            <p style={{ fontSize: 11, color: C.t3 }}>Déploiement {env.toUpperCase()} — validation admin</p>
          </div>
        </div>
        <div style={{ padding: 14, background: 'rgba(255,206,0,0.06)', border: '1px solid rgba(255,206,0,0.15)', borderRadius: 10, marginBottom: 18 }}>
          <p style={{ fontSize: 11, color: C.t2, lineHeight: 1.6 }}>⚠️ Ce déploiement en <strong style={{ color: '#ffce00' }}>production</strong> nécessite une validation manuelle avant de continuer.</p>
        </div>
        <label style={S.label}>Note de déploiement (optionnel)</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: Déploiement v2.4.1 — nouvelles fonctionnalités..."
          style={{ width: '100%', minHeight: 72, marginTop: 6, marginBottom: 16, padding: '9px 12px', background: 'rgba(0,200,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 9, color: C.t1, fontFamily: 'Rajdhani,sans-serif', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onReject(note)} disabled={approving} style={{ flex: 1, padding: 10, borderRadius: 9, border: '1px solid rgba(255,45,120,0.3)', background: 'rgba(255,45,120,0.08)', color: '#ff2d78', fontFamily: 'Orbitron,sans-serif', fontWeight: 700, fontSize: 11, cursor: approving ? 'not-allowed' : 'pointer', opacity: approving ? 0.5 : 1 }}>✕ Rejeter</button>
          <button onClick={() => onApprove(note)} disabled={approving} style={{ flex: 1, padding: 10, borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#ffce00,#ff9500)', color: '#020408', fontFamily: 'Orbitron,sans-serif', fontWeight: 800, fontSize: 11, cursor: approving ? 'not-allowed' : 'pointer', opacity: approving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {approving
              ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid #020408', borderTopColor: 'transparent' }} /> En cours...</>
              : '✓ Approuver'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
})

// ════════════════════════════════════════════════════════
//  PAGE PRINCIPALE
// ════════════════════════════════════════════════════════
export default function Pipeline() {
  const { getPipe, getPipeLogs, showToast } = useApp()
  const { can, user }                       = useAuth()

  const [status,       setStatus]       = useState({ checkout: 'pending', tests: 'pending', build: 'pending', deploy: 'pending' })
  const [logs,         setLogs]         = useState([])
  const [running,      setRunning]      = useState(false)
  const [busy,         setBusy]         = useState(true)
  const [env,          setEnv]          = useState('development')
  const [tab,          setTab]          = useState('stats')
  const [history,      setHistory]      = useState([])
  const [elapsed,      setElapsed]      = useState(0)
  const [stageDurs,    setStageDurs]    = useState({})
  const [showApproval, setShowApproval] = useState(false)
  const [approving,    setApproving]    = useState(false)
  const [rollbackId,   setRollbackId]   = useState(null)

  // Artifacts = files avy amin'ny /files API
  const [files,        setFiles]        = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)

  // Git commits — vide raha tsy misy webhook
  const [commits,      setCommits]      = useState([])
  const [loadingGit,   setLoadingGit]   = useState(false)

  const canRun     = can('pipeline')
  const startAt    = useRef(null)
  const runningRef = useRef(false)
  const pollRef    = useRef(null)

  // ── Timer elapsed ──────────────────────────────────────
  useEffect(() => {
    let interval
    if (running) {
      startAt.current = startAt.current || Date.now()
      interval = setInterval(() => setElapsed(Math.floor((Date.now() - startAt.current) / 1000)), 1000)
    } else { startAt.current = null; setElapsed(0) }
    return () => clearInterval(interval)
  }, [running])

  // ── addLog helper ─────────────────────────────────────
  const addLog = useCallback((text, level = 'info') => {
    const now = new Date()
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, '0')).join(':')
    setLogs(l => [...l, { time, text, color: LOG_COLORS[level] || C.cyan, level }])
  }, [])

  // ── Charger status + logs depuis backend ──────────────
  const load = useCallback(async () => {
    setBusy(true)
    try {
      const [s, l] = await Promise.all([api.pipeStatus(), api.pipeLogs()])

      if (s?.success !== false && s) {
        const st = s.status || s
        if (st && typeof st === 'object' && !Array.isArray(st)) {
          setStatus(prev => ({ ...prev, ...st }))
        }
        if (s.running !== undefined) setRunning(!!s.running)
        if (s.history?.length) setHistory(s.history)
      }

      if (l?.success !== false && Array.isArray(l?.logs || l)) {
        const rawLogs = l.logs || l
        if (rawLogs.length) setLogs(rawLogs.map(lg => ({ ...lg, color: LOG_COLORS[lg.level] || C.cyan })))
      }
    } catch (err) {
      console.error('Pipeline load error:', err)
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Polling rehefa running (miandry backend) ──────────
  const startPolling = useCallback(() => {
    if (pollRef.current) return
    pollRef.current = setInterval(async () => {
      try {
        const s = await api.pipeStatus()
        if (s?.success === false) return

        const st = s.status || s
        if (st && typeof st === 'object' && !Array.isArray(st)) {
          setStatus(prev => ({ ...prev, ...st }))
        }

        // Azo amin'ny backend raha mbola running
        if (s.running === false || s.running === 0) {
          setRunning(false)
          runningRef.current = false
          stopPolling()
        }

        // Logs vaovao avy amin'ny backend
        const l = await api.pipeLogs()
        const rawLogs = l?.logs || (Array.isArray(l) ? l : [])
        if (rawLogs.length) setLogs(rawLogs.map(lg => ({ ...lg, color: LOG_COLORS[lg.level] || C.cyan })))

      } catch {}
    }, POLL_INTERVAL)
  }, [])

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  // ── Charger files (artifacts) ─────────────────────────
  const loadFiles = useCallback(async () => {
    setLoadingFiles(true)
    try {
      const res = await api.getFiles()
      if (res?.success !== false) {
        setFiles(res.files || res.data || (Array.isArray(res) ? res : []))
      } else {
        showToast(res.message || 'Erreur chargement fichiers', 'danger')
      }
    } catch {
      showToast('Impossible de charger les fichiers', 'danger')
    } finally {
      setLoadingFiles(false)
    }
  }, [showToast])

  // Charger quand on ouvre l'onglet artifacts
  useEffect(() => {
    if (tab === 'artifacts') loadFiles()
  }, [tab, loadFiles])

  // ── Supprimer un fichier ──────────────────────────────
  const handleDeleteFile = useCallback(async (id) => {
    try {
      const res = await api.deleteFile(id)
      if (res?.success !== false) {
        setFiles(f => f.filter(x => x.id !== id))
        showToast('Fichier supprimé', 'success')
      } else {
        showToast(res.message || 'Erreur suppression', 'danger')
      }
    } catch {
      showToast('Erreur lors de la suppression', 'danger')
    }
  }, [showToast])

  // ── Lancer le pipeline (miantso backend) ─────────────
  const _startPipeline = useCallback(async (note = '') => {
    runningRef.current = true
    setRunning(true)
    startAt.current = Date.now()
    setStageDurs({})
    setTab('logs')
    setStatus({ checkout: 'pending', tests: 'pending', build: 'pending', deploy: 'pending' })

    if (note) addLog(`📝 Note: ${note}`, 'info')
    addLog(`━━━━━━ PIPELINE DÉMARRÉ [${env.toUpperCase()}] ━━━━━━`, 'info')
    addLog(`👤 Déclenché par : ${user?.name || 'Admin'}`, 'info')
    addLog(`🌍 Environnement : ${env}`, 'info')

    // Appel backend pour lancer le pipeline
    try {
      const res = await api.pipeRun()
      if (res?.success === false) {
        const msg = res.message || 'Erreur lors du démarrage du pipeline'
        addLog(`❌ ${msg}`, 'error')
        showToast(msg, 'danger')
        runningRef.current = false
        setRunning(false)
        return
      }
      addLog('✅ Pipeline déclenché sur le serveur', 'success')
      showToast('Pipeline démarré ! 🚀', 'info')
    } catch (err) {
      addLog(`❌ Impossible de contacter le backend : ${err?.message || ''}`, 'error')
      showToast('Erreur serveur — pipeline non démarré', 'danger')
      runningRef.current = false
      setRunning(false)
      return
    }

    // Notifier chaque stage au backend + afficher dans les logs
    const labels = {
      checkout: 'Récupération du code source depuis Git',
      tests:    "Exécution des tests unitaires et d'intégration",
      build:    'Compilation, bundling et optimisation',
      deploy:   `Déploiement en ${env}`,
    }

    let failed = false
    for (let i = 0; i < STAGES.length; i++) {
      if (!runningRef.current && i > 0) { failed = true; break }
      const stage = STAGES[i]

      await new Promise(r => setTimeout(r, 300))
      setStatus(prev => ({ ...prev, [stage.id]: 'active' }))
      const stageStart = Date.now()
      addLog(`▶ [${stage.id.toUpperCase()}] ${labels[stage.id]}...`, 'info')

      // Notifier backend : stage active
      try {
        await api.pipeStage({ stage: stage.id, status: 'active', env })
      } catch {}

      // Polling : attendre que le backend confirme le stage completed/failed
      // Par défaut, on attend un délai raisonnable (le backend peut surcharger)
      const waitStage = new Promise(resolve => {
        let waited = 0
        const check = setInterval(async () => {
          waited += 1000
          if (!runningRef.current) { clearInterval(check); resolve('stopped'); return }
          try {
            const s = await api.pipeStatus()
            const st = s?.status || {}
            if (st[stage.id] === 'completed') { clearInterval(check); resolve('completed'); return }
            if (st[stage.id] === 'failed')    { clearInterval(check); resolve('failed');    return }
          } catch {}
          // Timeout après 60s par stage → on marque completed côté frontend
          if (waited >= 60000) { clearInterval(check); resolve('timeout'); }
        }, 1000)
      })

      const result = await waitStage

      if (!runningRef.current || result === 'stopped') { failed = true; break }

      const dur = Math.round((Date.now() - stageStart) / 1000)
      setStageDurs(prev => ({ ...prev, [stage.id]: dur }))

      if (result === 'failed') {
        setStatus(prev => ({ ...prev, [stage.id]: 'failed' }))
        addLog(`❌ [${stage.id.toUpperCase()}] Échec du stage`, 'error')
        showToast(`Échec : ${stage.label}`, 'danger')
        failed = true
        try { await api.pipeStage({ stage: stage.id, status: 'failed', env }) } catch {}
        break
      } else {
        setStatus(prev => ({ ...prev, [stage.id]: 'completed' }))
        addLog(`✓ [${stage.id.toUpperCase()}] Terminé en ${dur}s`, 'success')
        try { await api.pipeStage({ stage: stage.id, status: 'completed', env }) } catch {}
      }
    }

    if (!failed) {
      const totalDur = Math.floor((Date.now() - startAt.current) / 1000)
      addLog(`━━━━━━ PIPELINE COMPLET en ${totalDur}s ━━━━━━`, 'success')
      addLog(`🎉 Déploiement ${env} réussi !`, 'success')
      showToast('Pipeline terminé avec succès ! 🎉', 'success')
      setHistory(h => [{
        id: Date.now(), env, status: 'completed', duration: totalDur,
        time: new Date().toLocaleTimeString(), by: user?.name || 'Admin'
      }, ...h.slice(0, 14)])
    } else if (runningRef.current === false) {
      addLog('⛔ Pipeline arrêté par l\'utilisateur.', 'warning')
    }

    runningRef.current = false
    setRunning(false)
    stopPolling()
  }, [env, user, addLog, showToast, stopPolling])

  const runPipeline = useCallback(() => {
    if (runningRef.current) return
    if (env === 'production') { setShowApproval(true); return }
    _startPipeline()
  }, [env, _startPipeline])

  const stopPipeline = useCallback(async () => {
    if (!runningRef.current) return
    runningRef.current = false
    setRunning(false)
    stopPolling()
    setStatus({ checkout: 'pending', tests: 'pending', build: 'pending', deploy: 'pending' })
    addLog("⛔ Pipeline arrêté par l'utilisateur.", 'warning')
    showToast('Pipeline arrêté', 'warning')

    try {
      const res = await api.pipeStop()
      if (res?.success === false) {
        showToast(res.message || 'Erreur lors de l\'arrêt', 'danger')
      }
    } catch {
      showToast('Erreur lors de l\'arrêt du pipeline', 'danger')
    }
  }, [addLog, showToast, stopPolling])

  // ── Rollback : relancer le pipeline sur la version précédente ──
  const handleRollback = useCallback(async (h) => {
    if (rollbackId) return
    setRollbackId(h.id)
    addLog(`↩ ROLLBACK demandé vers version du ${h.time} (${h.env})`, 'warning')
    showToast(`↩ Rollback en cours...`, 'warning')

    try {
      const res = await api.pipeRun()
      if (res?.success === false) {
        showToast(res.message || 'Erreur rollback', 'danger')
        addLog(`❌ Rollback échoué : ${res.message || ''}`, 'error')
      } else {
        showToast('Rollback déclenché avec succès', 'success')
        addLog(`✅ Rollback lancé sur le serveur`, 'success')
      }
    } catch {
      showToast('Impossible de contacter le backend pour le rollback', 'danger')
      addLog('❌ Erreur serveur — rollback non effectué', 'error')
    } finally {
      setRollbackId(null)
    }
  }, [rollbackId, addLog, showToast])

  const handleApprove = useCallback(async (note) => {
    setApproving(true)
    try {
      await _startPipeline(note)
    } finally {
      setApproving(false)
      setShowApproval(false)
    }
  }, [_startPipeline])

  const handleReject = useCallback((note) => {
    setShowApproval(false)
    addLog(`❌ Déploiement rejeté${note ? ` — ${note}` : ''}`, 'error')
    showToast('Déploiement rejeté', 'danger')
  }, [addLog, showToast])

  const clearLogs = useCallback(async () => {
    setLogs([])
    try {
      const res = await api.pipeClearLogs()
      if (res?.success === false) {
        showToast(res.message || 'Erreur lors de l\'effacement', 'danger')
      } else {
        showToast('Logs effacés', 'success')
      }
    } catch {
      showToast('Erreur lors de l\'effacement des logs', 'danger')
    }
  }, [showToast])

  if (busy) return <Loader />

  const completedStages = Object.values(status).filter(v => v === 'completed').length
  const currentEnv = ENVS.find(e => e.id === env) || ENVS[0]
  const overallStatus = running ? 'running'
    : completedStages === 4 ? 'completed'
    : Object.values(status).some(v => v === 'failed') ? 'failed' : 'idle'

  const TABS = [
    { id: 'stats',     label: 'Analytiques', icon: BarChart3 },
    { id: 'logs',      label: 'Logs',        icon: Terminal  },
    { id: 'history',   label: 'Historique',  icon: GitCommit },
    { id: 'artifacts', label: 'Fichiers',    icon: Package   },
    { id: 'git',       label: 'Git',         icon: GitBranch },
  ]

  return (
    <div>
      <AnimatePresence>
        {showApproval && (
          <ApprovalModal
            env={env}
            approving={approving}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 900, fontSize: 22, background: 'linear-gradient(135deg,#00c8ff,#e8f4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 4 }}>PIPELINE CI/CD</h1>
          <p style={{ color: C.t2, fontSize: 12 }}>
            Build · Test · Deploy •{' '}
            <span style={{ color: overallStatus === 'running' ? '#00c8ff' : overallStatus === 'completed' ? '#00ff88' : overallStatus === 'failed' ? '#ff2d78' : C.t3 }}>
              {overallStatus === 'running' ? `⏳ En cours... ${elapsed}s` : overallStatus === 'completed' ? '✓ Succès' : overallStatus === 'failed' ? '✗ Échec' : '● En attente'}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Sélecteur d'environnement — envoyé avec api.pipeRun via l'état `env` */}
          <div style={{ position: 'relative' }}>
            <select value={env} onChange={e => setEnv(e.target.value)} disabled={running}
              style={{ ...S.input, paddingRight: 28, appearance: 'none', cursor: 'pointer', background: `${currentEnv.color}10`, borderColor: `${currentEnv.color}40`, color: currentEnv.color, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, fontSize: 10 }}>
              {ENVS.map(e2 => <option key={e2.id} value={e2.id} style={{ background: '#0a1628', color: e2.color }}>{e2.icon} {e2.label.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={10} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: currentEnv.color, pointerEvents: 'none' }} />
          </div>
          <button onClick={load} disabled={running} style={{ ...S.btnGhost, opacity: running ? 0.4 : 1 }}><RefreshCw size={12} /></button>
          {canRun && (
            <>
              <button
                onClick={stopPipeline}
                disabled={!running}
                style={{ ...S.btnGhost, opacity: running ? 1 : 0.35, cursor: running ? 'pointer' : 'not-allowed', borderColor: running ? 'rgba(255,45,120,0.4)' : undefined, color: running ? '#ff2d78' : undefined }}>
                <Square size={11} /> Arrêter
              </button>
              <motion.button
                onClick={runPipeline}
                disabled={running}
                whileTap={!running ? { scale: 0.96 } : {}}
                style={{ ...S.btnNeon, opacity: running ? 0.5 : 1, cursor: running ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                {running
                  ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid #020408', borderTopColor: 'transparent' }} /> En cours...</>
                  : <><Play size={11} /> {env === 'production' ? '🔐 Prod' : 'Lancer'}</>}
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Stages */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Zap size={13} style={{ color: C.cyan }} />
          <span style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 800, fontSize: 11, color: C.t1 }}>ÉTAPES DU PIPELINE</span>
          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', marginLeft: 8 }}>
            <motion.div animate={{ width: `${(completedStages / 4) * 100}%` }} transition={{ duration: 0.5 }}
              style={{ height: '100%', background: 'linear-gradient(90deg,#00c8ff,#00ff88)', borderRadius: 10 }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: C.cyan }}>{completedStages}/4</span>
          {running && <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono,monospace', color: C.t3 }}>{elapsed}s</span>}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {STAGES.map((stage, i) => (
            <StageCard key={stage.id} stage={stage} statusVal={status[stage.id] || 'pending'}
              isRunning={running} isLast={i === STAGES.length - 1}
              stageDuration={stageDurs[stage.id] || 0}
              onRetry={status[stage.id] === 'failed' ? runPipeline : null} />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 14, padding: 4, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: `1px solid ${C.border}`, width: 'fit-content' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '7px 13px', borderRadius: 7, fontSize: 10, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, background: tab === id ? C.cyan : 'transparent', color: tab === id ? '#020408' : C.t3, transition: 'all 0.15s' }}>
            <Icon size={10} />{label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {tab === 'stats'     && <AnalyticsPanel logs={logs} status={status} history={history} />}
          {tab === 'logs'      && <LogsTerminal logs={logs} running={running} env={env} onClear={clearLogs} />}
          {tab === 'history'   && <HistoryPanel history={history} onRollback={handleRollback} rollbackId={rollbackId} />}
          {tab === 'artifacts' && <ArtifactsPanel files={files} loadingFiles={loadingFiles} onDeleteFile={handleDeleteFile} />}
          {tab === 'git'       && <GitPanel commits={commits} loading={loadingGit} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
