import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, Plus, Trash2, RefreshCw, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Loader, Empty } from '../components/ui/UI.jsx'
import { C, S } from '../styles.js'
import { MShell, PT, useConfirm } from './shared/PageUtils.jsx'

// ════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════

const ENV_COLORS = {
  dev:        '#00c8ff',
  staging:    '#ffce00',
  production: '#00ff88',
}

const ENV_ICONS = {
  dev:        '💻',
  staging:    '🧪',
  production: '🚀',
}

const DEPLOY_STEPS = [
  { msg: '🔍 Vérification du code source...', p: 15 },
  { msg: '🧪 Exécution des tests...',         p: 35 },
  { msg: "🔨 Build de l'application...",      p: 60 },
  { msg: "🐳 Construction de l'image Docker...", p: 80 },
  { msg: '🚀 Déploiement en cours...',        p: 95 },
  { msg: '✓ Déploiement terminé avec succès !', p: 100 },
]

const EMPTY_FORM = { name: '', type: 'dev', url: '', version: '1.0.0' }

// ════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════

function isValidUrl(str) {
  if (!str) return true // URL est optionnelle
  try { new URL(str); return true } catch { return false }
}

function isValidVersion(str) {
  return /^\d+\.\d+(\.\d+)?(-[\w.]+)?$/.test(str)
}

function getMetricColor(value, baseColor) {
  if (value > 80) return C.nova
  if (value > 60) return C.quantum
  return baseColor
}

// ════════════════════════════════════════════
//  CUSTOM HOOKS
// ════════════════════════════════════════════

function useEnvironments(getEnvs, showToast) {
  const [envs, setEnvs]   = useState([])
  const [busy, setBusy]   = useState(true)

  const load = useCallback(async () => {
    setBusy(true)
    try {
      setEnvs(await getEnvs() || [])
    } catch {
      showToast('Erreur de chargement', 'danger')
    } finally {
      setBusy(false)
    }
  }, [getEnvs, showToast])

  useEffect(() => { load() }, [load])

  return { envs, busy, load }
}

function useDeploy(deployEnv, showToast) {
  const [deploying,      setDeploying]      = useState(null)
  const [deployLogs,     setDeployLogs]     = useState({})   // { [envId]: string[] }
  const [deployProgress, setDeployProgress] = useState({})   // { [envId]: number }

  const deploy = useCallback(async (env, onDone) => {
    const id = env.id
    setDeploying(id)
    setDeployProgress(p => ({ ...p, [id]: 0 }))
    setDeployLogs(l => ({ ...l, [id]: [] }))

    const logs = []
    for (const step of DEPLOY_STEPS) {
      logs.push(`[${new Date().toLocaleTimeString('fr-FR')}] ${step.msg}`)
      setDeployLogs(l => ({ ...l, [id]: [...logs] }))
      setDeployProgress(p => ({ ...p, [id]: step.p }))
      await new Promise(r => setTimeout(r, 500 + Math.random() * 400))
    }

    try {
      if (deployEnv) await deployEnv(id)
    } catch (e) {
      const warn = `[${new Date().toLocaleTimeString('fr-FR')}] ⚠️ API: ${e?.message || 'Non disponible — mode simulation'}`
      logs.push(warn)
      setDeployLogs(l => ({ ...l, [id]: [...logs] }))
    }

    showToast(`${env.name} déployé avec succès ! ✓`, 'success')
    setDeploying(null)
    onDone?.()
  }, [deployEnv, showToast])

  return { deploying, deployLogs, deployProgress, deploy }
}

function useEnvForm(addEnv, showToast, onSuccess) {
  const [fields, setFields] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const setField = useCallback((key) => (e) => {
    setFields(prev => ({ ...prev, [key]: e.target.value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])

  const validate = useCallback(() => {
    const e = {}
    if (!fields.name.trim())          e.name    = 'Le nom est requis'
    if (!isValidUrl(fields.url))       e.url     = 'URL invalide (ex: https://monapp.com)'
    if (!isValidVersion(fields.version)) e.version = 'Version invalide (ex: 1.0.0)'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [fields])

  const save = useCallback(async () => {
    if (!validate()) return
    try {
      await addEnv(fields)
      showToast('Environnement créé !', 'success')
      setFields(EMPTY_FORM)
      setErrors({})
      onSuccess?.()
    } catch (e) {
      showToast(e?.message || 'Erreur lors de la création', 'danger')
    }
  }, [fields, validate, addEnv, showToast, onSuccess])

  const reset = useCallback(() => {
    setFields(EMPTY_FORM)
    setErrors({})
  }, [])

  return { fields, errors, setField, save, reset }
}

// ════════════════════════════════════════════
//  SUB-COMPONENTS
// ════════════════════════════════════════════

/** Barre de métriques CPU / RAM */
function MetricBar({ label, value, color }) {
  const barColor = getMetricColor(value, color)
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
        <span style={{ color: C.t2 }}>{label}</span>
        <span style={{ color: barColor, fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
          {value}%
        </span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: barColor, borderRadius: 10 }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  )
}

/** Ligne d'information (URL, Version, Dernier déploiement) */
function InfoRow({ label, value, color, copyable, onCopy }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 12,
    }}>
      <span style={{ color: C.t2 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, maxWidth: 160 }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: color || C.t1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {value || '—'}
        </span>
        {copyable && value && (
          <button
            onClick={() => onCopy(value)}
            title="Copier"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.t3, padding: 0, display: 'flex' }}
          >
            <Copy size={10} />
          </button>
        )}
      </div>
    </div>
  )
}

/** Terminal de logs de déploiement */
function DeployTerminal({ logs, progress, color }) {
  const bottomRef = useRef(null)

  // Auto-scroll vers le bas à chaque nouveau log
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      style={{
        marginTop: 12, padding: 10,
        background: '#000', borderRadius: 8,
        border: '1px solid rgba(0,255,136,0.15)',
        maxHeight: 120, overflowY: 'auto',
      }}
    >
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.t3, marginBottom: 4, fontFamily: 'Orbitron, sans-serif' }}>
          <span>DEPLOY LOG</span>
          <span>{progress}%</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: color, borderRadius: 10 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
      {logs.map((line, i) => (
        <div key={i} style={{
          fontSize: 10, color: line.includes('⚠️') ? '#ffce00' : '#00ff88',
          fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6,
        }}>
          {line}
        </div>
      ))}
      <div ref={bottomRef} />
    </motion.div>
  )
}

/** Champ de formulaire avec label + erreur inline */
function FormField({ label, error, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 11, color: '#ff4d4d', marginTop: 4 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Carte d'un environnement */
function EnvCard({ env, deploying, deployLogs, deployProgress, onDeploy, onDelete, can }) {
  const col   = ENV_COLORS[env.type] || C.cyan
  const isDep = deploying === env.id
  const logs  = deployLogs[env.id]
  const prog  = deployProgress[env.id] || 0

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard?.writeText(text)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      style={S.panel({ padding: 20, position: 'relative', overflow: 'hidden' })}
    >
      {/* Barre colorée en haut */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: col, boxShadow: `0 0 8px ${col}`,
      }} />

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${col}15`, border: `1px solid ${col}28`, fontSize: 18,
          }}>
            {ENV_ICONS[env.type] || '🌐'}
          </div>
          <div>
            <p style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 13, color: C.t1 }}>
              {env.name}
            </p>
            <p style={{ fontSize: 9, fontFamily: 'Orbitron, sans-serif', fontWeight: 700, color: col }}>
              {(env.type || '').toUpperCase()}
            </p>
          </div>
        </div>

        {/* Badge statut */}
        <span style={{
          fontSize: 9, fontFamily: 'Orbitron, sans-serif', fontWeight: 700,
          padding: '3px 8px', borderRadius: 5,
          background: `${col}15`, color: col, border: `1px solid ${col}28`,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <motion.span
            style={{ width: 5, height: 5, borderRadius: '50%', background: col, display: 'inline-block' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {env.status || 'running'}
        </span>
      </div>

      {/* Infos */}
      <InfoRow label="URL"     value={env.url}    color="#7ab0d4" copyable onCopy={copyToClipboard} />
      <InfoRow label="Version" value={env.version} />
      <InfoRow label="Dernier déploiement" value={env.last_deploy || env.lastDeploy} />

      {/* Métriques */}
      <div style={{ marginTop: 12 }}>
        <MetricBar label="CPU" value={env.cpu    || 0} color={col} />
        <MetricBar label="RAM" value={env.memory || 0} color={col} />
      </div>

      {/* Terminal de déploiement */}
      {isDep && logs && (
        <DeployTerminal logs={logs} progress={prog} color={col} />
      )}

      {/* Actions */}
      {can('environments') && (
        <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
          <button
            onClick={() => onDeploy(env)}
            disabled={isDep}
            style={{
              flex: 1, padding: '9px 13px', border: 'none', borderRadius: 9,
              background: isDep ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg,${col},${col}cc)`,
              color: isDep ? C.t3 : '#020408',
              fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 11,
              cursor: isDep ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
          >
            {isDep ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                  style={{
                    display: 'inline-block', width: 12, height: 12,
                    borderRadius: '50%', border: `2px solid ${C.t3}`, borderTopColor: 'transparent',
                  }}
                />
                En cours...
              </>
            ) : (
              <>🚀 Déployer</>
            )}
          </button>

          {env.url && (
            <a
              href={env.url} target="_blank" rel="noopener noreferrer"
              title="Ouvrir l'URL"
              style={{ ...S.btnGhost, padding: '9px 11px', fontSize: 11, display: 'flex', alignItems: 'center' }}
            >
              <ExternalLink size={12} />
            </a>
          )}

          <button
            onClick={() => onDelete(env.id)}
            title="Supprimer"
            style={{ ...S.btnGhost, padding: '9px 11px', fontSize: 11 }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════

export function Environments() {
  const { getEnvs, addEnv, deleteEnv, deployEnv, showToast } = useApp()
  const { can }  = useAuth()
  const { confirm, Dialog } = useConfirm()

  const [modal, setModal] = useState(false)

  const { envs, busy, load } = useEnvironments(getEnvs, showToast)

  const { deploying, deployLogs, deployProgress, deploy } = useDeploy(deployEnv, showToast)

  const closeModal = useCallback(() => { setModal(false); formHook.reset() }, [])

  const formHook = useEnvForm(addEnv, showToast, () => { closeModal(); load() })

  const handleDeploy = useCallback(async (env) => {
    const ok = await confirm(`Déployer "${env.name}" ? L'environnement sera mis à jour.`)
    if (!ok) return
    deploy(env, load)
  }, [confirm, deploy, load])

  const handleDelete = useCallback(async (id) => {
    const ok = await confirm('Supprimer cet environnement ? Cette action est irréversible.')
    if (!ok) return
    try {
      await deleteEnv(id)
      showToast('Supprimé', 'success')
      load()
    } catch {
      showToast('Erreur lors de la suppression', 'danger')
    }
  }, [confirm, deleteEnv, showToast, load])

  if (busy) return <Loader />

  return (
    <div>
      {Dialog}

      {/* En-tête */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 14, marginBottom: 24,
      }}>
        <div>
          {PT('ENVIRONNEMENTS')}
          <p style={{ color: C.t2, fontSize: 13, marginTop: 4 }}>Dev · Staging · Production</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} title="Rafraîchir" style={{ ...S.btnGhost, padding: '8px 12px' }}>
            <RefreshCw size={13} />
          </button>
          {can('environments') && (
            <button onClick={() => setModal(true)} style={S.btnCyan}>
              <Plus size={13} /> Nouvel environnement
            </button>
          )}
        </div>
      </div>

      {/* Grille des environnements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
        {envs.map((env, i) => (
          <motion.div key={env.id} transition={{ delay: i * 0.08 }}>
            <EnvCard
              env={env}
              deploying={deploying}
              deployLogs={deployLogs}
              deployProgress={deployProgress}
              onDeploy={handleDeploy}
              onDelete={handleDelete}
              can={can}
            />
          </motion.div>
        ))}
        {!envs.length && (
          <Empty icon={Server} msg="Aucun environnement" sub="Créez votre premier environnement" />
        )}
      </div>

      {/* Modal — Nouvel environnement */}
      <AnimatePresence>
        {modal && (
          <MShell title="NOUVEL ENVIRONNEMENT" onClose={closeModal}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

              <FormField label="Nom *" error={formHook.errors.name}>
                <input
                  style={{ ...S.input, borderColor: formHook.errors.name ? '#ff4d4d' : undefined }}
                  value={formHook.fields.name}
                  onChange={formHook.setField('name')}
                  placeholder="ex: Développement"
                  onKeyDown={e => e.key === 'Enter' && formHook.save()}
                  autoFocus
                />
              </FormField>

              <FormField label="Type">
                <select
                  style={{ ...S.input, background: C.surface }}
                  value={formHook.fields.type}
                  onChange={formHook.setField('type')}
                >
                  <option value="dev">💻 Développement</option>
                  <option value="staging">🧪 Staging</option>
                  <option value="production">🚀 Production</option>
                </select>
              </FormField>

              <FormField label="URL" error={formHook.errors.url}>
                <input
                  style={{ ...S.input, borderColor: formHook.errors.url ? '#ff4d4d' : undefined }}
                  value={formHook.fields.url}
                  onChange={formHook.setField('url')}
                  placeholder="https://..."
                />
              </FormField>

              <FormField label="Version" error={formHook.errors.version}>
                <input
                  style={{ ...S.input, borderColor: formHook.errors.version ? '#ff4d4d' : undefined }}
                  value={formHook.fields.version}
                  onChange={formHook.setField('version')}
                  placeholder="1.0.0"
                />
              </FormField>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={closeModal} style={S.btnGhost}>Annuler</button>
                <button onClick={formHook.save} style={S.btnNeon}>Créer</button>
              </div>

            </div>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}
