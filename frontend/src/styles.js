// ════════════════════════════════════════════════
//  DevEnviron 4D — Design System v2
//  4 themes complètes via CSS variables
//  Usage: import { C, S, ROLE_META, STATUS_META, THEMES, applyTheme } from './styles.js'
// ════════════════════════════════════════════════

// ── 4 Themes ────────────────────────────────────
export const THEMES = {
  sombre: {
    id: 'sombre',
    label: 'Mode sombre',
    desc: 'Bleu · Neutre',
    vars: {
      '--bg':        '#0f1117',
      '--bg2':       '#13161f',
      '--surface':   '#1a1e2e',
      '--panel':     '#1e2235',
      '--border':    'rgba(255,255,255,0.07)',
      '--border2':   'rgba(255,255,255,0.13)',
      '--accent':    '#4f7df3',
      '--accent-bg': 'rgba(79,125,243,0.10)',
      '--accent2':   '#22c98e',
      '--accent3':   '#f4a942',
      '--danger':    '#e05555',
      '--t1':        '#e8eaf2',
      '--t2':        '#7a8299',
      '--t3':        '#3d4460',
    },
    preview: ['#4f7df3','#22c98e','#f4a942'],
  },
  violet: {
    id: 'violet',
    label: 'Mode violet',
    desc: 'Violet · Teal',
    vars: {
      '--bg':        '#130d1e',
      '--bg2':       '#1a1028',
      '--surface':   '#221533',
      '--panel':     '#281a3c',
      '--border':    'rgba(139,92,246,0.12)',
      '--border2':   'rgba(139,92,246,0.25)',
      '--accent':    '#8b5cf6',
      '--accent-bg': 'rgba(139,92,246,0.12)',
      '--accent2':   '#06d6a0',
      '--accent3':   '#fbbf24',
      '--danger':    '#f87171',
      '--t1':        '#ede8ff',
      '--t2':        '#8b7faa',
      '--t3':        '#4a3d66',
    },
    preview: ['#8b5cf6','#06d6a0','#fbbf24'],
  },
  clair: {
    id: 'clair',
    label: 'Mode clair',
    desc: 'Blanc · Bleu',
    vars: {
      '--bg':        '#f0f2f8',
      '--bg2':       '#e8ebf4',
      '--surface':   '#ffffff',
      '--panel':     '#ffffff',
      '--border':    'rgba(0,0,0,0.07)',
      '--border2':   'rgba(0,0,0,0.13)',
      '--accent':    '#3b6ef5',
      '--accent-bg': 'rgba(59,110,245,0.08)',
      '--accent2':   '#17b97f',
      '--accent3':   '#e8930a',
      '--danger':    '#d04040',
      '--t1':        '#1a1d2e',
      '--t2':        '#5a627a',
      '--t3':        '#9aa0b4',
    },
    preview: ['#3b6ef5','#17b97f','#e8930a'],
  },
  original: {
    id: 'original',
    label: 'Mode original',
    desc: 'Cyan · DevEnviron',
    vars: {
      '--bg':        '#020408',
      '--bg2':       '#040c14',
      '--surface':   '#0a1628',
      '--panel':     '#0d1e35',
      '--border':    'rgba(0,200,255,0.10)',
      '--border2':   'rgba(0,200,255,0.22)',
      '--accent':    '#00c8ff',
      '--accent-bg': 'rgba(0,200,255,0.08)',
      '--accent2':   '#00ff88',
      '--accent3':   '#ffce00',
      '--danger':    '#ff2d78',
      '--t1':        '#e8f4ff',
      '--t2':        '#7ab0d4',
      '--t3':        '#2a4a6a',
    },
    preview: ['#00c8ff','#00ff88','#ff2d78'],
  },
}

// ── Applique un theme sur :root ──────────────────
export function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.sombre
  const root  = document.documentElement
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v))
  root.setAttribute('data-theme', themeId)
  localStorage.setItem('de4d-theme', themeId)
}

// ── Charge le theme sauvegardé (appelé au démarrage) ──
export function loadSavedTheme() {
  const saved = localStorage.getItem('de4d-theme') || 'sombre'
  applyTheme(saved)
  return saved
}

// ── C : raccourcis CSS vars (utilisés dans les composants) ──
export const C = {
  get bg()       { return 'var(--bg)'        },
  get bg2()      { return 'var(--bg2)'       },
  get surface()  { return 'var(--surface)'   },
  get panel()    { return 'var(--panel)'     },
  get border()   { return 'var(--border)'    },
  get border2()  { return 'var(--border2)'   },
  get cyan()     { return 'var(--accent)'    },
  get accent()   { return 'var(--accent)'    },
  get accentBg() { return 'var(--accent-bg)' },
  get neon()     { return 'var(--accent2)'   },
  get accent2()  { return 'var(--accent2)'   },
  get solar()    { return 'var(--accent3)'   },
  get accent3()  { return 'var(--accent3)'   },
  get nova()     { return 'var(--danger)'    },
  get danger()   { return 'var(--danger)'    },
  get quantum()  { return 'var(--accent3)'   },
  get plasma()   { return 'var(--accent)'    },
  get t1()       { return 'var(--t1)'        },
  get t2()       { return 'var(--t2)'        },
  get t3()       { return 'var(--t3)'        },
}

// ── ROLE_META ────────────────────────────────────
export const ROLE_META = {
  admin:  { color:'var(--danger)',  bg:'rgba(var(--danger-rgb,224,85,85),0.10)',  border:'rgba(var(--danger-rgb,224,85,85),0.28)',  label:'ADMIN'  },
  dev:    { color:'var(--accent)',  bg:'var(--accent-bg)',                        border:'var(--border2)',                          label:'DEV'    },
  client: { color:'var(--accent2)', bg:'rgba(34,201,142,0.10)',                  border:'rgba(34,201,142,0.28)',                   label:'CLIENT' },
}

// ── STATUS_META ──────────────────────────────────
export const STATUS_META = {
  active:     { label:'Actif',      color:'var(--accent2)' },
  pending:    { label:'En attente', color:'var(--accent3)'  },
  completed:  { label:'Terminé',    color:'var(--accent)'   },
  running:    { label:'Running',    color:'var(--accent2)'  },
  stopped:    { label:'Arrêté',     color:'var(--danger)'   },
  todo:       { label:'À faire',    color:'var(--accent3)'  },
  inprogress: { label:'En cours',   color:'var(--accent)'   },
  done:       { label:'Terminé',    color:'var(--accent2)'  },
  high:       { label:'Haute',      color:'var(--danger)'   },
  medium:     { label:'Moyenne',    color:'var(--accent3)'  },
  low:        { label:'Faible',     color:'var(--t2)'       },
  urgent:     { label:'Urgente',    color:'var(--danger)'   },
}

// ── Bouton base ──────────────────────────────────
const btnBase = {
  display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7,
  padding:'9px 18px', border:'none', borderRadius:8,
  fontWeight:600, fontSize:12, letterSpacing:'0.05em',
  cursor:'pointer', transition:'all 0.18s',
}

// ── S : styles réutilisables ─────────────────────
export const S = {
  panel: (extra={}) => ({
    background: 'var(--panel)',
    border: '0.5px solid var(--border)',
    borderRadius: 12,
    ...extra,
  }),
  input: {
    width:'100%', padding:'10px 13px',
    background:'var(--accent-bg)',
    border:'1px solid var(--border2)',
    borderRadius:8, fontSize:14, color:'var(--t1)',
    outline:'none', transition:'border-color 0.2s',
  },
  label: {
    display:'block', fontSize:10, fontWeight:700,
    letterSpacing:'0.12em', textTransform:'uppercase',
    color:'var(--t3)', marginBottom:6,
  },
  gridBg: {
    backgroundImage:'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)',
    backgroundSize:'40px 40px',
  },
  get btnPrimary() { return {...btnBase, color:'var(--bg)', background:'var(--accent)', border:'none'} },
  get btnCyan()    { return {...btnBase, color:'var(--bg)', background:'var(--accent)', border:'none'} },
  get btnNeon()    { return {...btnBase, color:'var(--bg)', background:'var(--accent2)', border:'none'} },
  get btnNova()    { return {...btnBase, color:'#fff',      background:'var(--danger)',  border:'none'} },
  get btnSolar()   { return {...btnBase, color:'#fff',      background:'var(--accent3)', border:'none'} },
  get btnPlasma()  { return {...btnBase, color:'#fff',      background:'var(--accent)',  border:'none'} },
  get btnGhost()   { return {...btnBase, color:'var(--t2)', background:'transparent',    border:'0.5px solid var(--border2)', borderRadius:8} },
}
