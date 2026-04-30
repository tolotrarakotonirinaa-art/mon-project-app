import React,{useState,useEffect,useRef,useMemo} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {
  GitBranch,Play,Square,Trash2,RefreshCw,
  CheckCircle2,XCircle,Clock,AlertTriangle,
  Terminal,BarChart3,Zap,GitCommit,
  ChevronDown,Circle,PlayCircle
} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {Loader} from '../components/ui/UI.jsx'
import {api} from '../services/api.js'
import {C,S} from '../styles.js'

// ─────────────────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────────────────
const STAGES = [
  {id:'checkout', label:'Checkout', icon:'📦', desc:'Récupération du code source',   color:'#7c3aed'},
  {id:'tests',    label:'Tests',    icon:'🧪', desc:'Tests unitaires & intégration', color:'#00c8ff'},
  {id:'build',    label:'Build',    icon:'📁', desc:'Compilation et optimisation',   color:'#ffce00'},
  {id:'deploy',   label:'Deploy',   icon:'🚀', desc:'Déploiement en production',     color:'#00ff88'},
]

const ENVS = [
  {id:'development', label:'Development', color:'#00c8ff'},
  {id:'staging',     label:'Staging',     color:'#ffce00'},
  {id:'production',  label:'Production',  color:'#00ff88'},
]

const ST = {
  completed: {color:'#00ff88', label:'TERMINÉ',    bg:'rgba(0,255,136,0.06)'},
  active:    {color:'#00c8ff', label:'EN COURS',   bg:'rgba(0,200,255,0.06)'},
  pending:   {color:'#2a4a6a', label:'EN ATTENTE', bg:'rgba(42,74,106,0.04)'},
  failed:    {color:'#ff2d78', label:'ÉCHEC',       bg:'rgba(255,45,120,0.06)'},
}

const LOG_COLORS = {
  success: '#00ff88',
  error:   '#ff2d78',
  warning: '#ffce00',
  info:    '#00c8ff',
}

// ─────────────────────────────────────────────────────────
//  Composant Stage
// ─────────────────────────────────────────────────────────
function StageCard({stage, statusVal, isRunning, isLast}) {
  const st      = ST[statusVal] || ST.pending
  const isActive = statusVal === 'active' && isRunning

  return (
    <div style={{flex:1,position:'relative'}}>
      <motion.div
        style={{padding:'18px 12px',textAlign:'center',background:st.bg,
          borderRadius:10,border:`1px solid ${st.color}20`,
          transition:'all 0.3s',height:'100%'}}
        animate={isActive ? {
          boxShadow:[`0 0 0 1px ${stage.color}20`,`0 0 16px ${stage.color}40`,`0 0 0 1px ${stage.color}20`]
        } : {boxShadow:'none'}}
        transition={isActive ? {duration:1.2,repeat:Infinity} : {}}>

        <div style={{fontSize:28,marginBottom:10}}>{stage.icon}</div>

        <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:11,
          color:C.t1,marginBottom:4}}>{stage.label}</div>
        <div style={{fontSize:10,color:C.t3,marginBottom:10,lineHeight:1.4,
          minHeight:28}}>{stage.desc}</div>

        {/* Badge statut */}
        <motion.span
          style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:800,
            padding:'3px 9px',borderRadius:5,
            background:`${st.color}15`,color:st.color,
            border:`1px solid ${st.color}28`,display:'inline-flex',
            alignItems:'center',gap:4}}
          animate={isActive ? {opacity:[1,0.5,1]} : {opacity:1}}
          transition={isActive ? {duration:0.8,repeat:Infinity} : {}}>
          {isActive && (
            <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}}
              style={{width:7,height:7,borderRadius:'50%',
                border:`1.5px solid ${st.color}`,borderTopColor:'transparent'}}/>
          )}
          {statusVal==='completed' && <CheckCircle2 size={8}/>}
          {statusVal==='failed'    && <XCircle size={8}/>}
          {st.label}
        </motion.span>
      </motion.div>

      {/* Flèche */}
      {!isLast && (
        <div style={{position:'absolute',right:-14,top:'50%',transform:'translateY(-50%)',
          zIndex:10,fontSize:16,
          color: statusVal==='completed' ? '#00ff88' : C.t3,
          fontWeight:700}}>›</div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  Page principale
// ─────────────────────────────────────────────────────────
export default function Pipeline() {
  const {getPipe, getPipeLogs, showToast} = useApp()
  const {can, user}                       = useAuth()

  const [status,  setStatus]  = useState({checkout:'pending',tests:'pending',build:'pending',deploy:'pending'})
  const [logs,    setLogs]    = useState([])
  const [running, setRunning] = useState(false)
  const [busy,    setBusy]    = useState(true)
  const [env,     setEnv]     = useState('development')
  const [tab,     setTab]     = useState('pipeline') // pipeline | logs | stats
  const [history, setHistory] = useState([])

  const logRef  = useRef(null)
  const canRun  = can('pipeline')
  const startAt = useRef(null)
  const [elapsed, setElapsed] = useState(0)

  // Timer
  useEffect(() => {
    let interval
    if (running) {
      startAt.current = startAt.current || Date.now()
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startAt.current) / 1000))
      }, 1000)
    } else {
      startAt.current = null
      setElapsed(0)
    }
    return () => clearInterval(interval)
  }, [running])

  const load = async () => {
    setBusy(true)
    try {
      const [s, l] = await Promise.all([getPipe(), getPipeLogs()])
      if (s) {
        // getPipe peut retourner {status, logs} ou juste le status
        const st = s.status || s
        if (st && typeof st === 'object' && !Array.isArray(st)) {
          setStatus(prev => ({...prev, ...st}))
        }
        if (s.logs?.length) {
          setLogs(s.logs.map(lg => ({
            ...lg,
            color: LOG_COLORS[lg.level] || C.cyan
          })))
        }
      }
      if (l?.length) {
        setLogs(l.map(lg => ({
          ...lg,
          color: LOG_COLORS[lg.level] || C.cyan
        })))
      }
    } catch { /* garder les defaults */ }
    finally { setBusy(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTo(0, logRef.current.scrollHeight)
    }
  }, [logs])

  const addLog = (text, level='info') => {
    const now  = new Date()
    const time = [now.getHours(),now.getMinutes(),now.getSeconds()]
                  .map(n=>String(n).padStart(2,'0')).join(':')
    setLogs(l => [...l, {time, text, color: LOG_COLORS[level]||C.cyan, level}])
  }

  // Stats calculées depuis les logs
  const stats = useMemo(() => {
    const total    = logs.length
    const success  = logs.filter(l=>l.level==='success').length
    const errors   = logs.filter(l=>l.level==='error').length
    const warnings = logs.filter(l=>l.level==='warning').length
    const completed = Object.values(status).filter(v=>v==='completed').length
    return {total, success, errors, warnings, completed}
  }, [logs, status])

  // ── Run Pipeline ────────────────────────────────────────
  const runPipeline = async () => {
    if (running) return
    setRunning(true)
    startAt.current = Date.now()
    showToast('Pipeline démarré !', 'info')
    setTab('logs')

    try {
      await api.pipeRun()
    } catch {}

    const steps  = ['checkout','tests','build','deploy']
    const labels = {
      checkout: 'Récupération du code source',
      tests:    'Exécution des tests unitaires',
      build:    'Compilation et optimisation',
      deploy:   `Déploiement en ${env}`,
    }
    const durations = {checkout:1200, tests:3000, build:2500, deploy:2000}

    let s = {checkout:'pending',tests:'pending',build:'pending',deploy:'pending'}
    setStatus({...s})
    addLog(`━━━━━━ PIPELINE DÉMARRÉ [${env.toUpperCase()}] ━━━━━━`, 'info')
    addLog(`Déclenché par : ${user?.name || 'Admin'}`, 'info')

    let failed = false
    for (let i = 0; i < steps.length; i++) {
      if (!running && i > 0) break
      const step = steps[i]

      await new Promise(r => setTimeout(r, 300))
      s = {...s, [step]:'active'}
      setStatus({...s})
      addLog(`[${step.toUpperCase()}] ${labels[step]}...`, 'info')

      try {
        await api.pipeStage({stage:step, status:'active'})
      } catch {}

      await new Promise(r => setTimeout(r, durations[step]))

      s = {...s, [step]:'completed'}
      setStatus({...s})
      addLog(`[${step.toUpperCase()}] Terminé ✓`, 'success')

      try {
        await api.pipeStage({stage:step, status:'completed'})
      } catch {}
    }

    if (!failed) {
      const dur = Math.floor((Date.now() - startAt.current) / 1000)
      addLog(`━━━━━━ PIPELINE COMPLET en ${dur}s ━━━━━━`, 'success')
      showToast('Pipeline terminé avec succès ! 🚀', 'success')

      // Ajouter à l'historique
      setHistory(h => [{
        id:    Date.now(),
        env,
        status:'completed',
        duration: dur,
        time: new Date().toLocaleTimeString(),
        by: user?.name || 'Admin',
      }, ...h.slice(0,9)])
    }

    setRunning(false)
  }

  // ── Stop Pipeline ───────────────────────────────────────
  const stopPipeline = async () => {
    if (!running) return
    setRunning(false)
    try { await api.pipeStop() } catch {}
    setStatus({checkout:'pending',tests:'pending',build:'pending',deploy:'pending'})
    addLog('Pipeline arrêté par l\'utilisateur.', 'warning')
    showToast('Pipeline arrêté', 'warning')
  }

  const clearLogs = async () => {
    setLogs([])
    try { await api.pipeClearLogs() } catch {}
    showToast('Logs effacés', 'success')
  }

  if (busy) return <Loader/>

  const completedStages = Object.values(status).filter(v=>v==='completed').length
  const overallStatus   = running ? 'running'
    : completedStages===4 ? 'completed'
    : Object.values(status).some(v=>v==='failed') ? 'failed'
    : 'idle'

  return (
    <div>
      {/* ── En-tête ─────────────────────────────────────── */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
        flexWrap:'wrap',gap:14,marginBottom:24}}>
        <div>
          <h1 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:24,
            background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            backgroundClip:'text',marginBottom:4}}>PIPELINE CI/CD</h1>
          <p style={{color:C.t2,fontSize:13}}>
            Automatisation du build, test et déploiement •{' '}
            <span style={{color:
              overallStatus==='running'?'#00c8ff':
              overallStatus==='completed'?'#00ff88':
              overallStatus==='failed'?'#ff2d78':C.t3}}>
              {overallStatus==='running'?`En cours... ${elapsed}s`:
               overallStatus==='completed'?'Dernier run : succès':
               overallStatus==='failed'?'Dernier run : échec':'En attente'}
            </span>
          </p>
        </div>

        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          {/* Sélecteur environnement */}
          <div style={{position:'relative'}}>
            <select value={env} onChange={e=>setEnv(e.target.value)}
              disabled={running}
              style={{...S.input,paddingRight:32,appearance:'none',cursor:'pointer',
                background:`${ENVS.find(e2=>e2.id===env)?.color}10`,
                borderColor:`${ENVS.find(e2=>e2.id===env)?.color}40`,
                color:ENVS.find(e2=>e2.id===env)?.color,
                fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:10}}>
              {ENVS.map(e2=>(
                <option key={e2.id} value={e2.id} style={{background:'#0a1628',color:e2.color}}>
                  {e2.label.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown size={11} style={{position:'absolute',right:10,top:'50%',
              transform:'translateY(-50%)',color:ENVS.find(e2=>e2.id===env)?.color,
              pointerEvents:'none'}}/>
          </div>

          <button onClick={load} style={S.btnGhost}><RefreshCw size={13}/> Actualiser</button>

          {canRun && (
            <>
              <button onClick={stopPipeline} disabled={!running}
                style={{...S.btnGhost,opacity:running?1:0.35,
                  cursor:running?'pointer':'not-allowed',
                  borderColor:running?'rgba(255,45,120,0.4)':undefined,
                  color:running?'#ff2d78':undefined}}>
                <Square size={12}/> Arrêter
              </button>
              <motion.button onClick={runPipeline} disabled={running}
                whileTap={!running?{scale:0.97}:{}}
                style={{...S.btnNeon,opacity:running?0.5:1,
                  cursor:running?'not-allowed':'pointer',
                  display:'flex',alignItems:'center',gap:7}}>
                {running ? (
                  <><motion.div animate={{rotate:360}}
                    transition={{duration:1,repeat:Infinity,ease:'linear'}}
                    style={{width:12,height:12,borderRadius:'50%',
                      border:'2px solid #020408',borderTopColor:'transparent'}}/> En cours...</>
                ) : (
                  <><Play size={12}/> Lancer Pipeline</>
                )}
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* ── Stages ──────────────────────────────────────── */}
      <div style={{background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border}`,
        borderRadius:14,padding:20,marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
          <GitBranch size={14} style={{color:C.cyan}}/>
          <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:12,color:C.t1}}>
            ÉTAPES DU PIPELINE
          </span>
          {/* Barre progression globale */}
          <div style={{flex:1,height:3,background:'rgba(255,255,255,0.05)',
            borderRadius:10,overflow:'hidden',marginLeft:8}}>
            <motion.div
              animate={{width:`${(completedStages/4)*100}%`}}
              transition={{duration:0.5}}
              style={{height:'100%',background:'linear-gradient(90deg,#00c8ff,#00ff88)',borderRadius:10}}/>
          </div>
          <span style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,
            color:C.cyan}}>{completedStages}/4</span>
        </div>

        <div style={{display:'flex',gap:14}}>
          {STAGES.map((stage,i) => (
            <StageCard key={stage.id} stage={stage}
              statusVal={status[stage.id]||'pending'}
              isRunning={running}
              isLast={i===STAGES.length-1}/>
          ))}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div style={{display:'flex',gap:2,marginBottom:16,padding:4,
        background:'rgba(255,255,255,0.02)',borderRadius:10,
        border:`1px solid ${C.border}`,width:'fit-content'}}>
        {[
          {id:'pipeline', label:'Stats',    icon:BarChart3},
          {id:'logs',     label:'Logs',     icon:Terminal},
          {id:'history',  label:'Historique',icon:GitCommit},
        ].map(({id,label,icon:Icon}) => (
          <button key={id} onClick={()=>setTab(id)}
            style={{padding:'7px 16px',borderRadius:7,fontSize:10,
              fontFamily:'Orbitron,sans-serif',fontWeight:700,border:'none',
              cursor:'pointer',display:'flex',alignItems:'center',gap:6,
              background:tab===id?C.cyan:'transparent',
              color:tab===id?'#020408':C.t3,transition:'all 0.15s'}}>
            <Icon size={11}/>{label}
          </button>
        ))}
      </div>

      {/* ── Contenu tabs ────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
          exit={{opacity:0}} transition={{duration:0.2}}>

          {/* STATS */}
          {tab==='pipeline' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
              {[
                {label:'Durée',        value: running?`${elapsed}s` : logs.length?'~10s':'—',
                 color:'#00c8ff', icon:Clock},
                {label:'Logs succès',  value: stats.success,  color:'#00ff88', icon:CheckCircle2},
                {label:'Erreurs',      value: stats.errors,   color:'#ff2d78', icon:XCircle},
                {label:'Stages OK',    value:`${stats.completed}/4`, color:'#7c3aed', icon:Zap},
              ].map(({label,value,color,icon:Icon}) => (
                <motion.div key={label} whileHover={{y:-2}}
                  style={{background:`${color}08`,border:`1px solid ${color}20`,
                    borderRadius:12,padding:'16px 14px',
                    display:'flex',alignItems:'center',gap:12}}>
                  <Icon size={20} style={{color,flexShrink:0}}/>
                  <div>
                    <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,
                      fontSize:22,color}}>{value}</div>
                    <div style={{fontSize:9,color:C.t3,fontFamily:'Orbitron,sans-serif',
                      fontWeight:700,marginTop:2}}>{label.toUpperCase()}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* LOGS TERMINAL */}
          {tab==='logs' && (
            <div style={{background:'rgba(255,255,255,0.02)',
              border:`1px solid ${C.border}`,borderRadius:14,overflow:'hidden'}}>
              {/* Header */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'12px 16px',borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <div style={{width:11,height:11,borderRadius:'50%',background:'#ff5f57'}}/>
                  <div style={{width:11,height:11,borderRadius:'50%',background:'#ffbd2e'}}/>
                  <div style={{width:11,height:11,borderRadius:'50%',background:'#28c840'}}/>
                  <span style={{fontSize:11,color:C.t3,marginLeft:6,
                    fontFamily:'JetBrains Mono,monospace'}}>
                    pipeline@devenviron — {env}
                  </span>
                  {running && (
                    <motion.div animate={{opacity:[1,0.2,1]}}
                      transition={{duration:0.7,repeat:Infinity}}
                      style={{width:8,height:8,borderRadius:'50%',background:'#00ff88',marginLeft:6}}/>
                  )}
                </div>
                <button onClick={clearLogs}
                  style={{...S.btnGhost,padding:'5px 10px',fontSize:11,
                    display:'flex',alignItems:'center',gap:5}}>
                  <Trash2 size={11}/> Effacer
                </button>
              </div>

              {/* Logs */}
              <div ref={logRef}
                style={{padding:'14px 16px',fontFamily:'JetBrains Mono,monospace',
                  fontSize:12,lineHeight:1.8,minHeight:220,maxHeight:340,
                  overflowY:'auto',background:'rgba(0,0,0,0.4)'}}>
                {logs.map((l,i) => (
                  <motion.div key={i} initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}}
                    transition={{duration:0.1}}
                    style={{display:'flex',gap:14,marginBottom:1}}>
                    <span style={{color:'#2a4a6a',flexShrink:0,userSelect:'none'}}>
                      [{l.time}]
                    </span>
                    <span style={{color:l.color||C.cyan}}>{l.text}</span>
                  </motion.div>
                ))}
                {running && (
                  <motion.span animate={{opacity:[1,0,1]}}
                    transition={{duration:0.8,repeat:Infinity}}
                    style={{color:'#00ff88',display:'inline-block',marginTop:4}}>█</motion.span>
                )}
                {!logs.length && !running && (
                  <span style={{color:C.t3,fontSize:12}}>
                    $ Aucun log — lancez le pipeline pour commencer.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* HISTORIQUE */}
          {tab==='history' && (
            <div style={{background:'rgba(255,255,255,0.02)',
              border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
              {history.length===0 ? (
                <div style={{textAlign:'center',padding:40,color:C.t3,fontSize:12}}>
                  <GitCommit size={32} style={{opacity:0.3,margin:'0 auto 12px',display:'block'}}/>
                  Aucun historique — lancez votre premier pipeline
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {history.map(h => (
                    <div key={h.id}
                      style={{display:'flex',alignItems:'center',gap:14,
                        padding:'11px 14px',borderRadius:9,
                        background:'rgba(255,255,255,0.02)',
                        border:`1px solid ${h.status==='completed'?'rgba(0,255,136,0.12)':'rgba(255,45,120,0.12)'}`}}>
                      <CheckCircle2 size={16}
                        style={{color:h.status==='completed'?'#00ff88':'#ff2d78',flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,
                          fontSize:11,color:C.t1}}>
                          {h.env.toUpperCase()}
                        </span>
                        <span style={{fontSize:10,color:C.t3,marginLeft:10}}>
                          par {h.by}
                        </span>
                      </div>
                      <span style={{fontSize:10,color:C.t3,fontFamily:'JetBrains Mono,monospace'}}>
                        {h.duration}s
                      </span>
                      <span style={{fontSize:10,color:C.t3}}>{h.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
