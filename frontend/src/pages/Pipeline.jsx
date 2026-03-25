import React,{useState,useEffect,useRef} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {GitBranch,Play,Square,Trash2,RefreshCw} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {PanelHeader,Loader} from '../components/ui/UI.jsx'
import {api} from '../services/api.js'
import {C,S} from '../styles.js'

const STAGES=[
  {id:'checkout',label:'Checkout',icon:'📥',desc:'Récupération du code source'},
  {id:'tests',   label:'Tests',   icon:'🧪',desc:'Tests unitaires & intégration'},
  {id:'build',   label:'Build',   icon:'📦',desc:'Compilation et optimisation'},
  {id:'deploy',  label:'Deploy',  icon:'🚀',desc:'Déploiement en production'},
]

const ST={
  completed:{color:'#00ff88',label:'TERMINÉ',    bg:'rgba(0,255,136,0.08)'},
  active:   {color:'#00c8ff',label:'EN COURS',   bg:'rgba(0,200,255,0.08)'},
  pending:  {color:'#2a4a6a',label:'EN ATTENTE', bg:'rgba(42,74,106,0.06)'},
  failed:   {color:'#ff2d78',label:'ÉCHEC',      bg:'rgba(255,45,120,0.08)'},
}

const LOG_INIT=[
  {time:'14:30:01',text:'Démarrage pipeline CI/CD v2.1.0',         color:'#00c8ff'},
  {time:'14:30:12',text:'Récupération depuis origin/main... ✓',    color:'#00ff88'},
  {time:'14:31:05',text:'npm install (125 packages)... ✓',          color:'#00ff88'},
  {time:'14:33:20',text:'Tests unitaires en cours...',              color:'#00c8ff'},
  {time:'14:35:44',text:'152 tests passés — 0 échecs ✓',           color:'#00ff88'},
  {time:'14:36:01',text:'Build en attente...',                      color:'#ffce00'},
]

export default function Pipeline(){
  const {getPipe,getPipeLogs,showToast}=useApp()
  const {can}=useAuth()
  const [status,setStatus] = useState({checkout:'pending',tests:'pending',build:'pending',deploy:'pending'})
  const [logs,setLogs]     = useState(LOG_INIT)
  const [running,setRunning]= useState(false)
  const [busy,setBusy]     = useState(true)
  const logRef = useRef(null)
  const canRun = can('pipeline')

  const load=async()=>{
    setBusy(true)
    try{
      const [s,l]=await Promise.all([getPipe(),getPipeLogs()])
      if(s&&Object.keys(s).length) setStatus(s)
      if(l?.length) setLogs(l.map(lg=>({...lg,color:lg.level==='success'?C.neon:lg.level==='warning'?C.quantum:lg.level==='error'?C.nova:C.cyan})))
    }catch{ /* garder les defaults */ }
    finally{ setBusy(false) }
  }
  useEffect(()=>{ load() },[])
  useEffect(()=>{ logRef.current?.scrollTo(0,logRef.current.scrollHeight) },[logs])

  const addLog=(text,color=C.cyan)=>{
    const now=new Date()
    const time=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
    setLogs(l=>[...l,{time,text,color}])
  }

  const runPipeline=async()=>{
    if(running) return
    setRunning(true)
    showToast('Pipeline démarré !','info')
    await api.pipeRun()
    const steps=['checkout','tests','build','deploy']
    const labels={checkout:'Récupération du code',tests:'Exécution des tests',build:'Compilation',deploy:'Déploiement'}
    let s={checkout:'pending',tests:'pending',build:'pending',deploy:'pending'}
    setStatus({...s})

    for(let i=0;i<steps.length;i++){
      const step=steps[i]
      await new Promise(r=>setTimeout(r,i===0?300:2000))
      s={...s,[step]:'active'}; setStatus({...s})
      addLog(`[${step.toUpperCase()}] ${labels[step]}...`,C.cyan)
      await api.pipeStage({stage:step,status:'active'})
      await new Promise(r=>setTimeout(r,1400))
      s={...s,[step]:'completed'}; setStatus({...s})
      addLog(`[${step.toUpperCase()}] Terminé ✓`,C.neon)
      await api.pipeStage({stage:step,status:'completed'})
    }

    setRunning(false)
    showToast('Pipeline terminé avec succès ! 🚀','success')
    addLog('═══════ PIPELINE COMPLET ═══════',C.neon)
  }

  const stopPipeline=async()=>{
    if(!running) return
    setRunning(false)
    await api.pipeStop()
    setStatus({checkout:'pending',tests:'pending',build:'pending',deploy:'pending'})
    addLog('Pipeline arrêté par l\'utilisateur.',C.nova)
    showToast('Pipeline arrêté','warning')
  }

  const clearLogs=async()=>{
    setLogs([])
    await api.pipeClearLogs()
    showToast('Logs effacés','success')
  }

  if(busy) return <Loader/>

  return(
    <div>
      {/* En-tête */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:24}}>
        <div>
          <h1 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:24,background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
            PIPELINE CI/CD
          </h1>
          <p style={{color:C.t2,fontSize:13,marginTop:4}}>Automatisation du build, test et déploiement</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button onClick={load} style={S.btnGhost}><RefreshCw size={13}/> Actualiser</button>
          {canRun&&(
            <>
              <button onClick={stopPipeline} disabled={!running}
                style={{...S.btnGhost,opacity:running?1:0.4,cursor:running?'pointer':'not-allowed'}}>
                <Square size={12}/> Arrêter
              </button>
              <button onClick={runPipeline} disabled={running}
                style={{...S.btnNeon,opacity:running?0.6:1,cursor:running?'not-allowed':'pointer'}}>
                <Play size={12}/> {running?'En cours...':'Lancer Pipeline'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Étapes */}
      <div style={{...S.panel({padding:22,marginBottom:20})}}>
        <PanelHeader icon={GitBranch} title="Étapes du pipeline" color={C.plasma}/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,borderRadius:10,overflow:'hidden',border:`1px solid ${C.border}`}}>
          {STAGES.map((stage,i)=>{
            const st=ST[status[stage.id]||'pending']
            const isActive=status[stage.id]==='active'&&running
            return(
              <motion.div key={stage.id}
                style={{padding:'18px 12px',textAlign:'center',position:'relative',background:st.bg,borderRight:i<3?`1px solid ${C.border}`:'none',transition:'all 0.3s'}}
                animate={isActive?{boxShadow:[`inset 0 0 0 1px ${C.cyan}20`,`inset 0 0 0 2px ${C.cyan}50`,`inset 0 0 0 1px ${C.cyan}20`]}:{}}
                transition={isActive?{duration:1,repeat:Infinity}:{}}>
                <div style={{fontSize:26,marginBottom:8}}>{stage.icon}</div>
                <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:11,color:C.t1,marginBottom:4}}>{stage.label}</div>
                <div style={{fontSize:10,color:C.t3,marginBottom:8,lineHeight:1.3}}>{stage.desc}</div>
                <motion.span
                  style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'3px 8px',borderRadius:5,background:`${st.color}18`,color:st.color,border:`1px solid ${st.color}30`,display:'inline-block'}}
                  animate={isActive?{opacity:[1,0.4,1]}:{}} transition={isActive?{duration:0.8,repeat:Infinity}:{}}>
                  {st.label}
                </motion.span>
                {/* Flèche */}
                {i<STAGES.length-1&&(
                  <div style={{position:'absolute',right:-8,top:'50%',transform:'translateY(-50%)',color:status[stage.id]==='completed'?C.neon:C.t3,fontSize:12,zIndex:10,fontWeight:700}}>▶</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
        {[
          {l:'Durée totale',  v:'~8 min',     c:C.cyan,   icon:'⏱️'},
          {l:'Tests passés', v:'152/152',     c:C.neon,   icon:'✅'},
          {l:'Coverage',     v:'87%',         c:C.plasma, icon:'📊'},
          {l:'Artefacts',    v:'3 fichiers',  c:C.solar,  icon:'📦'},
        ].map(s=>(
          <div key={s.l} style={{...S.panel({padding:14,textAlign:'center'})}}>
            <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:16,color:s.c,marginBottom:2}}>{s.v}</div>
            <div style={{fontSize:9,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Terminal Logs */}
      <div style={S.panel({padding:22})}>
        <PanelHeader icon={GitBranch} title="Logs temps réel" color={C.neon}
          actions={
            <button onClick={clearLogs} style={{...S.btnGhost,fontSize:11,padding:'5px 10px'}}>
              <Trash2 size={11}/> Effacer
            </button>
          }/>
        <div style={{background:'#000',border:'1px solid rgba(0,255,136,0.2)',borderRadius:10,overflow:'hidden',boxShadow:'0 0 30px rgba(0,255,136,0.05)'}}>
          {/* Barre de titre terminal */}
          <div style={{display:'flex',alignItems:'center',gap:7,padding:'10px 14px',borderBottom:'1px solid rgba(0,255,136,0.1)'}}>
            <div style={{width:12,height:12,borderRadius:'50%',background:'#ff5f57'}}/>
            <div style={{width:12,height:12,borderRadius:'50%',background:'#ffbd2e'}}/>
            <div style={{width:12,height:12,borderRadius:'50%',background:'#28c840'}}/>
            <span style={{flex:1,textAlign:'center',fontSize:11,color:'#444',fontFamily:'JetBrains Mono,monospace'}}>
              pipeline@devenviron — bash
            </span>
            {running&&(
              <motion.div animate={{opacity:[1,0.2,1]}} transition={{duration:0.8,repeat:Infinity}}
                style={{width:8,height:8,borderRadius:'50%',background:C.neon}}/>
            )}
          </div>
          {/* Logs */}
          <div ref={logRef} style={{padding:14,fontFamily:'JetBrains Mono,monospace',fontSize:12,lineHeight:1.75,minHeight:200,maxHeight:300,overflowY:'auto'}}>
            {logs.map((l,i)=>(
              <motion.div key={i} initial={{opacity:0,x:-5}} animate={{opacity:1,x:0}} transition={{duration:0.1}}
                style={{display:'flex',gap:12}}>
                <span style={{color:'#2a4a6a',flexShrink:0,userSelect:'none'}}>[{l.time}]</span>
                <span style={{color:l.color||C.cyan}}>{l.text}</span>
              </motion.div>
            ))}
            {running&&(
              <motion.span animate={{opacity:[1,0,1]}} transition={{duration:0.8,repeat:Infinity}}
                style={{color:C.neon,display:'inline-block',marginTop:4}}>▌</motion.span>
            )}
            {!logs.length&&!running&&(
              <span style={{color:C.t3}}>Aucun log. Lancez le pipeline pour commencer.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
