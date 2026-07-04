import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, Plus, Trash2, RefreshCw, ExternalLink, Copy } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Loader, Empty } from '../components/ui/UI.jsx'
import { api } from '../services/api.js'
import { C, S } from '../styles.js'
import { MShell, PT, useConfirm } from './shared/PageUtils.jsx'

// ════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════

const ENV_COLORS = {
  dev:        'var(--accent)',
  staging:    'var(--accent3)',
  production: 'var(--accent2)',
}

const ENV_ICONS = {
  dev:        '💻',
  staging:    '🧪',
  production: '🚀',
}

const EMPTY_FORM = { name: '', type: 'dev', url: '', version: '1.0.0' }

// ════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════

function isValidUrl(str) {
  if (!str) return true
  try { new URL(str); return true } catch { return false }
}

function isValidVersion(str) {
  return /^\d+\.\d+(\.\d+)?(-[\w.]+)?$/.test(str)
}

function getMetricColor(value, baseColor) {
  if (value > 80) return '#ff2d78'
  if (value > 60) return '#ffce00'
  return baseColor
}

function formatDate(val) {
  if (!val) return '—'
  try { return new Date(val).toLocaleString('fr-FR') } catch { return val }
}

// ════════════════════════════════════════════
//  CUSTOM HOOKS
// ════════════════════════════════════════════

function useEnvironments(showToast) {
  const [envs, setEnvs] = useState([])
  const [busy, setBusy] = useState(true)

  const load = useCallback(async () => {
    setBusy(true)
    try {
      const res = await api.getEnvs()
      if (res?.success === false) {
        showToast(res.message || 'Erreur de chargement', 'danger')
      } else {
        setEnvs(res?.data || res?.environments || (Array.isArray(res) ? res : []))
      }
    } catch {
      showToast('Impossible de contacter le serveur', 'danger')
    } finally {
      setBusy(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  return { envs, setEnvs, busy, load }
}

// Hook deploy — miantso backend, manavao DB fotsiny
function useDeploy(showToast) {
  const [deploying, setDeploying] = useState(null)

  const deploy = useCallback(async (env, onDone) => {
    setDeploying(env.id)
    try {
      const res = await api.deployEnv(env.id)

      if (res?.success === false) {
        showToast(res.message || 'Erreur lors du déploiement', 'danger')
        return
      }

      // Manavao ny env card avy amin'ny response backend
      onDone?.(env.id, res?.data?.last_deploy, res?.data?.status, res?.data?.version)
      showToast(`${env.name} déployé avec succès ✓`, 'success')

    } catch {
      showToast('Erreur serveur — déploiement échoué', 'danger')
    } finally {
      setDeploying(null)
    }
  }, [showToast])

  return { deploying, deploy }
}

function useEnvForm(showToast, onSuccess) {
  const [fields, setFields] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const setField = useCallback((key) => (e) => {
    setFields(prev => ({ ...prev, [key]: e.target.value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])

  const validate = useCallback(() => {
    const e = {}
    if (!fields.name.trim())             e.name    = 'Le nom est requis'
    if (!isValidUrl(fields.url))         e.url     = 'URL invalide (ex: https://monapp.com)'
    if (!isValidVersion(fields.version)) e.version = 'Version invalide (ex: 1.0.0)'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [fields])

  const save = useCallback(async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const res = await api.createEnv(fields)
      if (res?.success === false) {
        if (res.errors) setErrors(res.errors)
        showToast(res.message || 'Erreur lors de la création', 'danger')
      } else {
        showToast('Environnement créé !', 'success')
        setFields(EMPTY_FORM)
        setErrors({})
        onSuccess?.()
      }
    } catch {
      showToast('Impossible de contacter le serveur', 'danger')
    } finally {
      setSaving(false)
    }
  }, [fields, validate, showToast, onSuccess])

  const reset = useCallback(() => { setFields(EMPTY_FORM); setErrors({}) }, [])

  return { fields, errors, saving, setField, save, reset }
}

// ════════════════════════════════════════════
//  SUB-COMPONENTS
// ════════════════════════════════════════════

function MetricBar({ label, value, color }) {
  const val      = typeof value === 'number' ? value : 0
  const barColor = getMetricColor(val, color)
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
        <span style={{ color: C.t2 }}>{label}</span>
        <span style={{ color: barColor, fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
          {val}%
        </span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: barColor, borderRadius: 10 }}
          initial={{ width: 0 }}
          animate={{ width: `${val}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  )
}

function InfoRow({ label, value, color, copyable }) {
  const copy = useCallback(() => {
    if (value) navigator.clipboard?.writeText(value).catch(() => {})
  }, [value])

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 12,
    }}>
      <span style={{ color: C.t2 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, maxWidth: 180 }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: color || C.t1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {value || '—'}
        </span>
        {copyable && value && (
          <button onClick={copy} title="Copier"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.t3, padding: 0, display: 'flex' }}>
            <Copy size={10} />
          </button>
        )}
      </div>
    </div>
  )
}

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

function EnvCard({ env, deploying, onDeploy, onDelete, can }) {
  const col   = ENV_COLORS[env.type] || C.cyan
  const isDep = deploying === env.id

  const statusLabel = env.status || 'unknown'
  const statusColor =
    statusLabel === 'running'  || statusLabel === 'active'   ? '#00ff88'
    : statusLabel === 'stopped' || statusLabel === 'inactive' ? '#ff2d78'
    : statusLabel === 'deploying'                             ? '#ffce00'
    : C.t3

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

        {/* Badge statut — avy amin'ny backend */}
        <span style={{
          fontSize: 9, fontFamily: 'Orbitron, sans-serif', fontWeight: 700,
          padding: '3px 8px', borderRadius: 5,
          background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}28`,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <motion.span
            style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor, display: 'inline-block' }}
            animate={{ opacity: isDep ? [1, 0.3, 1] : 1 }}
            transition={{ duration: 1.5, repeat: isDep ? Infinity : 0 }}
          />
          {isDep ? 'déploiement...' : statusLabel}
        </span>
      </div>

      {/* Infos */}
      <InfoRow label="URL"     value={env.url}     color="#7ab0d4" copyable />
      <InfoRow label="Version" value={env.version} />
      <InfoRow label="Dernier déploiement" value={formatDate(env.last_deploy || env.lastDeploy)} />

      {/* Métriques CPU / RAM — valeurs DB, tsy misy rand() */}
      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 9, fontFamily: 'Orbitron, sans-serif', fontWeight: 700, color: C.t3 }}>
            MÉTRIQUES
          </span>
        </div>
        <MetricBar label="CPU" value={env.cpu    ?? 0} color={col} />
        <MetricBar label="RAM" value={env.memory ?? 0} color={col} />
      </div>

      {/* Actions */}
      {can('environments') && (
        <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
          <button
            onClick={() => onDeploy(env)}
            disabled={isDep}
            style={{
              flex: 1, padding: '9px 13px', border: 'none', borderRadius: 9,
              background: isDep ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg,${col},${col}cc)`,
              color: isDep ? C.t3 : 'var(--bg)',
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
            disabled={isDep}
            title="Supprimer"
            style={{
              ...S.btnGhost, padding: '9px 11px', fontSize: 11,
              opacity: isDep ? 0.4 : 1, cursor: isDep ? 'not-allowed' : 'pointer',
            }}
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
  const { showToast }       = useApp()
  const { can }             = useAuth()
  const { confirm, Dialog } = useConfirm()

  const [modal, setModal] = useState(false)

  const { envs, setEnvs, busy, load } = useEnvironments(showToast)
  const { deploying, deploy }         = useDeploy(showToast)

  const closeModal = useCallback(() => { setModal(false); formHook.reset() }, [])
  const formHook   = useEnvForm(showToast, () => { closeModal(); load() })

  const handleDeploy = useCallback(async (env) => {
    const ok = await confirm(`Déployer "${env.name}" ? Le statut sera mis à jour.`)
    if (!ok) return

    deploy(env, (id, lastDeploy, status, version) => {
      setEnvs(prev => prev.map(e =>
        e.id === id
          ? { ...e, last_deploy: lastDeploy ?? e.last_deploy, status: status ?? 'running', version: version ?? e.version }
          : e
      ))
    })
  }, [confirm, deploy, setEnvs])

  const handleDelete = useCallback(async (id) => {
    const ok = await confirm('Supprimer cet environnement ? Cette action est irréversible.')
    if (!ok) return
    try {
      const res = await api.deleteEnv(id)
      if (res?.success === false) {
        showToast(res.message || 'Erreur lors de la suppression', 'danger')
      } else {
        showToast('Environnement supprimé', 'success')
        setEnvs(prev => prev.filter(e => e.id !== id))
      }
    } catch {
      showToast('Impossible de contacter le serveur', 'danger')
    }
  }, [confirm, setEnvs, showToast])

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
          <p style={{ color: C.t2, fontSize: 13, marginTop: 4 }}>
            Dev · Staging · Production
          </p>
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
                  onKeyDown={e => e.key === 'Enter' && !formHook.saving && formHook.save()}
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
                <button onClick={closeModal} disabled={formHook.saving} style={{ ...S.btnGhost, opacity: formHook.saving ? 0.5 : 1 }}>
                  Annuler
                </button>
                <button
                  onClick={formHook.save}
                  disabled={formHook.saving}
                  style={{
                    ...S.btnNeon,
                    opacity: formHook.saving ? 0.7 : 1,
                    cursor: formHook.saving ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {formHook.saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid #020408', borderTopColor: 'transparent' }}
                      />
                      Création...
                    </>
                  ) : 'Créer'}
                </button>
              </div>

            </div>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}
