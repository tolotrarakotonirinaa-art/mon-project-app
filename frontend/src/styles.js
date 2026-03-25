// ════════════════════════════════════════════════
//  DevEnviron 4D — Design System (CSS-in-JS pur)
// ════════════════════════════════════════════════

export const C = {
  bg:      '#020408',
  bg2:     '#040c14',
  surface: '#0a1628',
  panel:   '#0d1e35',
  border:  'rgba(0,200,255,0.10)',
  border2: 'rgba(0,200,255,0.22)',
  cyan:    '#00c8ff',
  plasma:  '#7c3aed',
  neon:    '#00ff88',
  solar:   '#ff6b35',
  nova:    '#ff2d78',
  quantum: '#ffce00',
  t1:      '#e8f4ff',
  t2:      '#7ab0d4',
  t3:      '#2a4a6a',
}

export const ROLE_META = {
  admin:  { color:C.nova,   bg:'rgba(255,45,120,0.10)',  border:'rgba(255,45,120,0.28)',  label:'ADMIN'  },
  dev:    { color:C.cyan,   bg:'rgba(0,200,255,0.10)',   border:'rgba(0,200,255,0.28)',   label:'DEV'    },
  client: { color:C.neon,   bg:'rgba(0,255,136,0.10)',   border:'rgba(0,255,136,0.28)',   label:'CLIENT' },
}

export const STATUS_META = {
  active:     { label:'Actif',      color:C.neon    },
  pending:    { label:'En attente', color:C.quantum  },
  completed:  { label:'Terminé',    color:C.plasma   },
  running:    { label:'Running',    color:C.neon     },
  stopped:    { label:'Arrêté',     color:C.nova     },
  todo:       { label:'À faire',    color:C.quantum  },
  inprogress: { label:'En cours',   color:C.cyan     },
  done:       { label:'Terminé',    color:C.neon     },
  high:       { label:'Haute',      color:C.nova     },
  medium:     { label:'Moyenne',    color:C.quantum  },
  low:        { label:'Faible',     color:C.t2       },
  urgent:     { label:'Urgente',    color:'#ff0000'  },
}

const btnBase = {
  display:'inline-flex',alignItems:'center',justifyContent:'center',gap:7,
  padding:'10px 20px',border:'none',borderRadius:10,
  fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:12,
  letterSpacing:'0.07em',cursor:'pointer',transition:'all 0.22s',
  clipPath:'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)',
}

export const S = {
  panel: (extra={}) => ({
    background:'linear-gradient(135deg,rgba(10,22,40,0.97),rgba(6,15,26,0.99))',
    border:`1px solid ${C.border}`,
    borderRadius:14,
    ...extra,
  }),
  input: {
    width:'100%',padding:'10px 13px',
    background:'rgba(0,200,255,0.05)',
    border:`1px solid rgba(0,200,255,0.14)`,
    borderRadius:9,fontSize:14,color:C.t1,
    fontFamily:'Rajdhani,sans-serif',outline:'none',transition:'border-color 0.2s',
  },
  label: {
    display:'block',fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,
    letterSpacing:'0.12em',textTransform:'uppercase',
    color:'rgba(0,200,255,0.65)',marginBottom:6,
  },
  gridBg: {
    backgroundImage:'linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)',
    backgroundSize:'40px 40px',
  },
  get btnCyan()   { return {...btnBase,color:'#020408',background:'linear-gradient(135deg,#00c8ff,#0095cc)',boxShadow:'0 0 18px rgba(0,200,255,0.32)'} },
  get btnNeon()   { return {...btnBase,color:'#020408',background:'linear-gradient(135deg,#00ff88,#00cc6a)',boxShadow:'0 0 18px rgba(0,255,136,0.32)'} },
  get btnNova()   { return {...btnBase,color:'#fff',   background:'linear-gradient(135deg,#ff2d78,#cc1a55)',boxShadow:'0 0 18px rgba(255,45,120,0.32)'} },
  get btnSolar()  { return {...btnBase,color:'#fff',   background:'linear-gradient(135deg,#ff6b35,#cc4a18)',boxShadow:'0 0 18px rgba(255,107,53,0.32)'} },
  get btnPlasma() { return {...btnBase,color:'#fff',   background:'linear-gradient(135deg,#7c3aed,#5b21b6)',boxShadow:'0 0 18px rgba(124,58,237,0.32)'} },
  get btnGhost()  { return {...btnBase,color:C.t2,background:'rgba(0,200,255,0.06)',border:`1px solid rgba(0,200,255,0.18)`,clipPath:'none',borderRadius:9} },
}
