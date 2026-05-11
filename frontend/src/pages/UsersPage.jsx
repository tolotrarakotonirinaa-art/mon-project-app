import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, RefreshCw, Eye, EyeOff,
  Search, Filter, Edit2, Upload, ChevronUp,
  ChevronDown, ChevronsUpDown, X, Check,
  UserCheck, AlertTriangle, Download
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Loader, PermGuard } from '../components/ui/UI.jsx'
import { C, S, ROLE_META } from '../styles.js'
import { ini } from '../data.js'
import { MShell, PT, useConfirm } from './shared/PageUtils.jsx'

// ════════════════════════════════════════════
//  SKELETON ROW
// ════════════════════════════════════════════
function SkeletonRow() {
  const pulse = {
    background: `linear-gradient(90deg, ${C.border}44 25%, ${C.border}99 50%, ${C.border}44 75%)`,
    backgroundSize: '200% 100%',
    animation: 'skeletonPulse 1.4s ease infinite',
    borderRadius: 6,
  }
  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      <td style={{ padding: '13px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ ...pulse, width: 34, height: 34, borderRadius: 9, flexShrink: 0 }} />
          <div style={{ ...pulse, width: 110, height: 12 }} />
        </div>
      </td>
      <td style={{ padding: '13px 16px' }}><div style={{ ...pulse, width: 160, height: 11 }} /></td>
      <td style={{ padding: '13px 16px' }}><div style={{ ...pulse, width: 60, height: 22, borderRadius: 6 }} /></td>
      <td style={{ padding: '13px 16px' }}><div style={{ ...pulse, width: 80, height: 11 }} /></td>
      <td style={{ padding: '13px 16px' }}><div style={{ ...pulse, width: 24, height: 24, borderRadius: 4 }} /></td>
    </tr>
  )
}

// ════════════════════════════════════════════
//  EMPTY STATE
// ════════════════════════════════════════════
function EmptyState({ hasFilter, onClear, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '56px 24px', gap: 12,
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: `${C.cyan}14`, border: `1px solid ${C.cyan}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
      }}>
        <UserCheck size={24} color={C.cyan} />
      </div>
      <p style={{ fontSize: 13, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: C.t1 }}>
        {hasFilter ? 'AUCUN RÉSULTAT' : 'AUCUN MEMBRE'}
      </p>
      <p style={{ fontSize: 11, color: C.t3, textAlign: 'center', maxWidth: 280 }}>
        {hasFilter
          ? 'Aucun utilisateur ne correspond à vos filtres.'
          : 'Commencez par ajouter un membre à votre équipe.'}
      </p>
      {hasFilter
        ? <button onClick={onClear} style={{ ...S.btnGhost, marginTop: 4, fontSize: 11 }}>
            <X size={11} /> Effacer les filtres
          </button>
        : <button onClick={onAdd} style={{ ...S.btnCyan, marginTop: 4 }}>
            <Plus size={13} /> Ajouter un membre
          </button>
      }
    </motion.div>
  )
}

// ════════════════════════════════════════════
//  BADGE RÔLE
// ════════════════════════════════════════════
function RoleBadge({ role }) {
  const rc = ROLE_META[role] || ROLE_META.dev
  return (
    <span style={{
      fontSize: 10, fontFamily: 'Orbitron,sans-serif', fontWeight: 700,
      padding: '4px 8px', borderRadius: 6,
      background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
    }}>
      {role.toUpperCase()}
    </span>
  )
}

// ════════════════════════════════════════════
//  MODAL EDITION
// ════════════════════════════════════════════
function EditModal({ user, onClose, onSave }) {
  const [f, setF] = useState({ name: user.name || '', email: user.email || '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState({})

  const validate = () => {
    const e = {}
    if (!f.name.trim()) e.name = 'Nom requis'
    if (!f.email.trim()) e.email = 'Email requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Email invalide'
    setErr(e)
    return !Object.keys(e).length
  }

  const submit = async () => {
    if (!validate()) return
    setBusy(true)
    try { await onSave(user.id, f) }
    finally { setBusy(false) }
  }

  return (
    <MShell title="MODIFIER LE MEMBRE" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div>
          <label style={S.label}>Nom complet *</label>
          <input style={{ ...S.input, ...(err.name ? { borderColor: C.nova } : {}) }}
            value={f.name} onChange={e => { setF(x => ({ ...x, name: e.target.value })); setErr(x => ({ ...x, name: '' })) }}
            placeholder="Jean Dupont" />
          {err.name && <p style={{ color: C.nova, fontSize: 10, marginTop: 4 }}>{err.name}</p>}
        </div>
        <div>
          <label style={S.label}>Email *</label>
          <input type="email" style={{ ...S.input, ...(err.email ? { borderColor: C.nova } : {}) }}
            value={f.email} onChange={e => { setF(x => ({ ...x, email: e.target.value })); setErr(x => ({ ...x, email: '' })) }}
            placeholder="email@exemple.com" />
          {err.email && <p style={{ color: C.nova, fontSize: 10, marginTop: 4 }}>{err.email}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={onClose} style={S.btnGhost} disabled={busy}>Annuler</button>
          <button onClick={submit} style={S.btnNeon} disabled={busy}>
            {busy ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <><Check size={12} /> Enregistrer</>}
          </button>
        </div>
      </div>
    </MShell>
  )
}

// ════════════════════════════════════════════
//  MODAL IMPORT CSV
// ════════════════════════════════════════════
function ImportModal({ onClose, onImport }) {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef()

  const parseCSV = (text) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) { setError('Fichier vide ou invalide'); return }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const required = ['name', 'email', 'role']
    const missing = required.filter(r => !headers.includes(r))
    if (missing.length) { setError(`Colonnes manquantes : ${missing.join(', ')}`); return }
    const parsed = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim())
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] || '']))
    }).filter(r => r.name && r.email)
    if (!parsed.length) { setError('Aucune ligne valide trouvée'); return }
    setError('')
    setRows(parsed)
  }

  const handleFile = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => parseCSV(ev.target.result)
    reader.readAsText(file)
  }

  const submit = async () => {
    setBusy(true)
    try { await onImport(rows); onClose() }
    catch (e) { setError(e?.message || 'Erreur import') }
    finally { setBusy(false) }
  }

  return (
    <MShell title="IMPORTER CSV" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 11, color: C.t3 }}>
          Format attendu : <span style={{ color: C.cyan, fontFamily: 'JetBrains Mono,monospace' }}>name, email, role</span>
        </p>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${C.border}`, borderRadius: 10, padding: '28px 16px',
            textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.cyan}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >
          <Upload size={22} color={C.t3} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 11, color: C.t2 }}>Cliquez pour choisir un fichier .csv</p>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.nova, fontSize: 11, background: `${C.nova}11`, padding: '8px 12px', borderRadius: 8 }}>
            <AlertTriangle size={13} /> {error}
          </div>
        )}
        {rows.length > 0 && (
          <div style={{ maxHeight: 160, overflowY: 'auto' }}>
            <p style={{ fontSize: 10, color: C.cyan, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, marginBottom: 8 }}>
              {rows.length} MEMBRE{rows.length > 1 ? 'S' : ''} DÉTECTÉ{rows.length > 1 ? 'S' : ''}
            </p>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 10, color: C.t2, fontFamily: 'JetBrains Mono,monospace', padding: '3px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.t1, minWidth: 100 }}>{r.name}</span>
                <span style={{ minWidth: 140 }}>{r.email}</span>
                <RoleBadge role={r.role || 'dev'} />
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={S.btnGhost} disabled={busy}>Annuler</button>
          <button onClick={submit} style={S.btnNeon} disabled={busy || !rows.length}>
            {busy ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <><Upload size={12} /> Importer</>}
          </button>
        </div>
      </div>
    </MShell>
  )
}

// ════════════════════════════════════════════
//  SORT ICON
// ════════════════════════════════════════════
function SortIcon({ field, sort }) {
  if (sort.field !== field) return <ChevronsUpDown size={10} color={C.t3} />
  return sort.dir === 'asc' ? <ChevronUp size={10} color={C.cyan} /> : <ChevronDown size={10} color={C.cyan} />
}

// ════════════════════════════════════════════
//  USERS PAGE PRINCIPALE
// ════════════════════════════════════════════
export function UsersPage() {
  const { getUsers, addUser, updUser, delUser, showToast } = useApp()
  const { can, user: cu } = useAuth()
  const { confirm, Dialog } = useConfirm()

  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(false)         // add modal
  const [editUser, setEditUser] = useState(null)    // edit modal
  const [importModal, setImportModal] = useState(false)
  const [f, setF] = useState({ name: '', email: '', role: 'dev', password: '' })
  const [formErr, setFormErr] = useState({})
  const [busy, setBusy] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sort, setSort] = useState({ field: 'name', dir: 'asc' })
  const roleTimers = useRef({})

  if (!can('users')) return <PermGuard can={false} />

  // ── Chargement ──────────────────────────────
  const load = useCallback(async () => {
    setBusy(true)
    try { setUsers(await getUsers() || []) }
    catch (e) { showToast(e?.message || 'Erreur de chargement', 'danger') }
    finally { setBusy(false) }
  }, [getUsers, showToast])

  useEffect(() => { load() }, [load])

  // ── Filtre + Tri ─────────────────────────────
  const filtered = useMemo(() => {
    let list = [...users]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    }
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter)
    list.sort((a, b) => {
      let va = a[sort.field] || '', vb = b[sort.field] || ''
      if (sort.field === 'join_date' || sort.field === 'created_at') {
        va = new Date(a.join_date || a.joinDate || a.created_at || 0)
        vb = new Date(b.join_date || b.joinDate || b.created_at || 0)
      }
      if (va < vb) return sort.dir === 'asc' ? -1 : 1
      if (va > vb) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [users, search, roleFilter, sort])

  const toggleSort = field => setSort(s =>
    s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' }
  )

  const clearFilters = () => { setSearch(''); setRoleFilter('all') }
  const hasFilter = search || roleFilter !== 'all'

  // ── Validation formulaire ajout ──────────────
  const validateAdd = () => {
    const e = {}
    if (!f.name.trim()) e.name = 'Nom requis'
    if (!f.email.trim()) e.email = 'Email requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Email invalide'
    if (!f.password || f.password.length < 6) e.password = 'Min 6 caractères'
    setFormErr(e)
    return !Object.keys(e).length
  }

  // ── Ajouter ──────────────────────────────────
  const save = async () => {
    if (!validateAdd()) return
    try {
      const res = await addUser(f)
      if (!res?.success) { showToast(res?.message || 'Erreur', 'danger'); return }
      // Optimistic update
      setUsers(prev => [...prev, { ...f, id: res.id || Date.now(), join_date: new Date().toISOString() }])
      showToast('Utilisateur ajouté !', 'success')
      setModal(false)
      setF({ name: '', email: '', role: 'dev', password: '' })
      setFormErr({})
      load() // sync with server
    } catch (e) { showToast(e?.message || 'Erreur', 'danger') }
  }

  // ── Modifier ─────────────────────────────────
  const saveEdit = async (id, data) => {
    try {
      await updUser(id, data)
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))
      showToast('Membre mis à jour !', 'success')
      setEditUser(null)
    } catch (e) {
      showToast(e?.message || 'Erreur mise à jour', 'danger')
      throw e
    }
  }

  // ── Changer rôle (debounce 600ms) ─────────────
  const changeRole = (id, role) => {
    // Optimistic update immédiat
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    clearTimeout(roleTimers.current[id])
    roleTimers.current[id] = setTimeout(async () => {
      try { await updUser(id, { role }); showToast('Rôle mis à jour !', 'success') }
      catch (e) {
        showToast(e?.message || 'Erreur mise à jour rôle', 'danger')
        load() // rollback
      }
    }, 600)
  }

  // ── Supprimer ─────────────────────────────────
  const del = async id => {
    if (id === cu?.id) { showToast('Impossible de vous supprimer vous-même', 'danger'); return }
    const ok = await confirm('Supprimer cet utilisateur définitivement ?')
    if (!ok) return
    // Optimistic update
    setUsers(prev => prev.filter(u => u.id !== id))
    try { await delUser(id); showToast('Utilisateur supprimé', 'success') }
    catch (e) { showToast(e?.message || 'Erreur suppression', 'danger'); load() }
  }

  // ── Import CSV ────────────────────────────────
  const handleImport = async rows => {
    let ok = 0, fail = 0
    for (const row of rows) {
      try {
        const res = await addUser({ ...row, password: Math.random().toString(36).slice(-8) })
        if (res?.success) ok++
        else fail++
      } catch { fail++ }
    }
    showToast(`${ok} importé${ok > 1 ? 's' : ''}${fail ? `, ${fail} échoué${fail > 1 ? 's' : ''}` : ''}`, ok ? 'success' : 'danger')
    load()
  }

  // ── Export CSV ────────────────────────────────
  const exportCSV = () => {
    const header = 'name,email,role,join_date'
    const rows = filtered.map(u =>
      [u.name, u.email, u.role, u.join_date || u.joinDate || u.created_at || ''].join(',')
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'utilisateurs.csv'
    a.click()
  }

  // ── En-têtes triables ─────────────────────────
  const TH = ({ label, field, width }) => (
    <th
      onClick={() => field && toggleSort(field)}
      style={{
        padding: '11px 16px', textAlign: 'left', fontSize: 9, width,
        fontFamily: 'Orbitron,sans-serif', fontWeight: 700, letterSpacing: '0.14em',
        color: sort.field === field ? C.cyan : C.t3,
        cursor: field ? 'pointer' : 'default',
        userSelect: 'none', whiteSpace: 'nowrap',
        transition: 'color 0.15s',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        {label}
        {field && <SortIcon field={field} sort={sort} />}
      </span>
    </th>
  )

  // ════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════
  return (
    <div>
      {/* Keyframes globaux */}
      <style>{`
        @keyframes skeletonPulse {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {Dialog}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          {PT('UTILISATEURS')}
          <p style={{ color: C.t2, fontSize: 13, marginTop: 4 }}>
            {busy ? '…' : `${filtered.length} membre${filtered.length > 1 ? 's' : ''}${hasFilter ? ` (sur ${users.length})` : ` dans l'équipe`}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={exportCSV} style={{ ...S.btnGhost, padding: '8px 12px', gap: 6 }} title="Exporter CSV">
            <Download size={13} />
          </button>
          <button onClick={() => setImportModal(true)} style={{ ...S.btnGhost, padding: '8px 12px', gap: 6 }}>
            <Upload size={13} /> Import CSV
          </button>
          <button onClick={load} style={{ ...S.btnGhost, padding: '8px 12px' }} title="Rafraîchir">
            <RefreshCw size={13} />
          </button>
          <button onClick={() => setModal(true)} style={S.btnCyan}>
            <Plus size={13} /> Ajouter un membre
          </button>
        </div>
      </div>

      {/* ── Barre recherche + filtre ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
          <Search size={13} color={C.t3} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un membre…"
            style={{
              ...S.input, paddingLeft: 32, paddingRight: search ? 32 : 12,
              fontSize: 11, height: 36,
            }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.t3, cursor: 'pointer', padding: 2 }}>
              <X size={12} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={12} color={C.t3} />
          {['all', 'admin', 'dev', 'client'].map(r => {
            const rc = r !== 'all' ? (ROLE_META[r] || ROLE_META.dev) : null
            const active = roleFilter === r
            return (
              <button key={r} onClick={() => setRoleFilter(r)}
                style={{
                  fontSize: 9, fontFamily: 'Orbitron,sans-serif', fontWeight: 700,
                  padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                  border: `1px solid ${active ? (rc?.border || C.cyan) : C.border}`,
                  background: active ? (rc?.bg || `${C.cyan}22`) : 'transparent',
                  color: active ? (rc?.color || C.cyan) : C.t3,
                  transition: 'all 0.15s',
                }}>
                {r === 'all' ? 'TOUS' : r.toUpperCase()}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tableau ── */}
      <div style={S.panel({ padding: 0, overflow: 'hidden' })}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <TH label="Utilisateur" field="name" />
                <TH label="Email" field="email" />
                <TH label="Rôle" field="role" />
                <TH label="Inscrit le" field="join_date" />
                <TH label="Actions" />
              </tr>
            </thead>
            <tbody>
              {busy
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState hasFilter={!!hasFilter} onClear={clearFilters} onAdd={() => setModal(true)} />
                      </td>
                    </tr>
                  )
                  : filtered.map((u, i) => {
                    const rc = ROLE_META[u.role] || ROLE_META.dev
                    const dateStr = u.join_date || u.joinDate || u.created_at
                    return (
                      <motion.tr key={u.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.035 }}
                        style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = `${C.cyan}07`}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Avatar + Nom */}
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                              background: `linear-gradient(135deg,${rc.color},${rc.color}99)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: '#020408',
                            }}>
                              {ini(u.name)}
                            </div>
                            <div>
                              <p style={{ fontSize: 12, fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: C.t1 }}>{u.name}</p>
                              {u.id === cu?.id && (
                                <span style={{ fontSize: 9, color: C.cyan, fontFamily: 'Orbitron,sans-serif', fontWeight: 700 }}>● VOUS</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '13px 16px', fontSize: 11, color: C.t2, fontFamily: 'JetBrains Mono,monospace' }}>
                          {u.email}
                        </td>

                        {/* Rôle */}
                        <td style={{ padding: '13px 16px' }}>
                          {u.id === cu?.id
                            ? <RoleBadge role={u.role} />
                            : (
                              <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                                style={{
                                  fontSize: 10, fontFamily: 'Orbitron,sans-serif', fontWeight: 700,
                                  padding: '4px 8px', borderRadius: 6,
                                  background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                                  cursor: 'pointer', outline: 'none',
                                }}>
                                <option value="admin">ADMIN</option>
                                <option value="dev">DEV</option>
                                <option value="client">CLIENT</option>
                              </select>
                            )
                          }
                        </td>

                        {/* Date */}
                        <td style={{ padding: '13px 16px', fontSize: 10, color: C.t3, fontFamily: 'JetBrains Mono,monospace' }}>
                          {dateStr ? new Date(dateStr).toLocaleDateString('fr-FR') : '—'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {/* Bouton édition */}
                            <button
                              onClick={() => setEditUser(u)}
                              title="Modifier"
                              style={{
                                background: 'none', border: 'none', color: C.t3,
                                cursor: 'pointer', padding: 3, borderRadius: 4, transition: 'color 0.15s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = C.cyan}
                              onMouseLeave={e => e.currentTarget.style.color = C.t3}
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Bouton suppression */}
                            <button
                              onClick={() => del(u.id)}
                              disabled={u.id === cu?.id}
                              title="Supprimer"
                              style={{
                                background: 'none', border: 'none', color: C.t3,
                                cursor: u.id === cu?.id ? 'not-allowed' : 'pointer',
                                opacity: u.id === cu?.id ? 0.3 : 1,
                                padding: 3, borderRadius: 4, transition: 'color 0.15s',
                              }}
                              onMouseEnter={e => { if (u.id !== cu?.id) e.currentTarget.style.color = C.nova }}
                              onMouseLeave={e => e.currentTarget.style.color = C.t3}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Footer stats */}
        {!busy && users.length > 0 && (
          <div style={{
            display: 'flex', gap: 20, padding: '10px 16px',
            borderTop: `1px solid ${C.border}`, flexWrap: 'wrap',
          }}>
            {['admin', 'dev', 'client'].map(role => {
              const count = users.filter(u => u.role === role).length
              const rc = ROLE_META[role] || ROLE_META.dev
              return (
                <span key={role} style={{ fontSize: 10, fontFamily: 'Orbitron,sans-serif', color: C.t3 }}>
                  <span style={{ color: rc.color, fontWeight: 700 }}>{count}</span> {role.toUpperCase()}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* ══ Modal : AJOUTER ══════════════════════ */}
      <AnimatePresence>
        {modal && (
          <MShell title="AJOUTER UN MEMBRE" onClose={() => { setModal(false); setFormErr({}) }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {/* Nom */}
              <div>
                <label style={S.label}>Nom complet *</label>
                <input style={{ ...S.input, ...(formErr.name ? { borderColor: C.nova } : {}) }}
                  value={f.name}
                  onChange={e => { setF(x => ({ ...x, name: e.target.value })); setFormErr(x => ({ ...x, name: '' })) }}
                  placeholder="Jean Dupont" />
                {formErr.name && <p style={{ color: C.nova, fontSize: 10, marginTop: 4 }}>{formErr.name}</p>}
              </div>
              {/* Email */}
              <div>
                <label style={S.label}>Email *</label>
                <input type="email" style={{ ...S.input, ...(formErr.email ? { borderColor: C.nova } : {}) }}
                  value={f.email}
                  onChange={e => { setF(x => ({ ...x, email: e.target.value })); setFormErr(x => ({ ...x, email: '' })) }}
                  placeholder="email@exemple.com" />
                {formErr.email && <p style={{ color: C.nova, fontSize: 10, marginTop: 4 }}>{formErr.email}</p>}
              </div>
              {/* Mot de passe */}
              <div>
                <label style={S.label}>Mot de passe *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    style={{ ...S.input, paddingRight: 40, ...(formErr.password ? { borderColor: C.nova } : {}) }}
                    value={f.password}
                    onChange={e => { setF(x => ({ ...x, password: e.target.value })); setFormErr(x => ({ ...x, password: '' })) }}
                    placeholder="Min 6 caractères" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.t3, cursor: 'pointer' }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {formErr.password && <p style={{ color: C.nova, fontSize: 10, marginTop: 4 }}>{formErr.password}</p>}
              </div>
              {/* Rôle */}
              <div>
                <label style={S.label}>Rôle</label>
                <select style={{ ...S.input, background: C.surface }} value={f.role}
                  onChange={e => setF(x => ({ ...x, role: e.target.value }))}>
                  <option value="dev">👨‍💻 Développeur</option>
                  <option value="admin">🔴 Administrateur</option>
                  <option value="client">🟢 Client</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => { setModal(false); setFormErr({}) }} style={S.btnGhost}>Annuler</button>
                <button onClick={save} style={S.btnNeon}><Plus size={12} /> Ajouter le membre</button>
              </div>
            </div>
          </MShell>
        )}
      </AnimatePresence>

      {/* ══ Modal : ÉDITION ══════════════════════ */}
      <AnimatePresence>
        {editUser && (
          <EditModal user={editUser} onClose={() => setEditUser(null)} onSave={saveEdit} />
        )}
      </AnimatePresence>

      {/* ══ Modal : IMPORT CSV ═══════════════════ */}
      <AnimatePresence>
        {importModal && (
          <ImportModal onClose={() => setImportModal(false)} onImport={handleImport} />
        )}
      </AnimatePresence>
    </div>
  )
}
