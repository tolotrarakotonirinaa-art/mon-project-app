import React,{useState,useEffect,useCallback} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {Package,RefreshCw,Play,Square,RotateCcw,FileText,X,Server} from 'lucide-react'
import {PanelHeader} from '../ui/UI.jsx'
import {C,S} from '../../styles.js'
import {useApp} from '../../context/AppContext.jsx'
import {useConfirm} from '../../pages/shared/PageUtils.jsx'
import {devspaceApi} from '../../services/devspaceApi.js'

// ════════════════════════════════════════════
//  DOCKER — TENA MARINA (docker ps / docker stats
//  any amin'ny server, tsy Math.random() intsony)
// ════════════════════════════════════════════
export default function DockerPanel(){
  const {showToast} = useApp()
  const {confirm,Dialog} = useConfirm()

  const [containers,setContainers] = useState([])
  const [stats,setStats]           = useState({}) // id -> {cpu,memory,...}
  const [loading,setLoading]       = useState(true)
  const [refreshing,setRefreshing] = useState(false)
  const [unavailable,setUnavailable] = useState(false)
  const [busyId,setBusyId]         = useState(null) // container en cours d'action
  const [logsFor,setLogsFor]       = useState(null) // {id,name}
  const [logsText,setLogsText]     = useState('')
  const [logsLoading,setLogsLoading] = useState(false)

  const load = useCallback(async ()=>{
    const [resList, resStats] = await Promise.all([
      devspaceApi.dockerContainers(),
      devspaceApi.dockerStats(),
    ])

    if(resList?._status === 503 || resStats?._status === 503){
      setUnavailable(true)
      setContainers([])
      setStats({})
      return
    }
    setUnavailable(false)

    if(resList?.success !== false) setContainers(resList?.data || [])
    if(resStats?.success !== false){
      const map={}
      for(const s of (resStats?.data||[])) map[s.id]=s
      setStats(map)
    }
  },[])

  useEffect(()=>{
    (async()=>{ setLoading(true); await load(); setLoading(false) })()
  },[load])

  const refresh = async ()=>{
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const runAction = async (id, name, action, fn, doneMsg)=>{
    if(action!=='start'){
      const ok = await confirm(`Tena tianao ${action==='stop'?'jamboina':'avadika'} ny container "${name}" ?`)
      if(!ok) return
    }
    setBusyId(id)
    const res = await fn(id)
    setBusyId(null)
    if(res?.success===false){
      showToast(res.message||'Tsy nahomby ny hetsika.','error')
    }else{
      showToast(doneMsg,'success')
      await load()
    }
  }

  const openLogs = async (c)=>{
    setLogsFor(c)
    setLogsLoading(true)
    const res = await devspaceApi.dockerLogs(c.id, 200)
    setLogsText(res?.success===false ? (res.message||'Tsy nahazo logs.') : (res?.data?.logs || '(logs banga)'))
    setLogsLoading(false)
  }

  if(loading){
    return <p style={{color:C.t3,fontSize:12}}>Maka ny lisitry ny container…</p>
  }

  if(unavailable){
    return (
      <div style={{...S.panel({padding:18})}}>
        <PanelHeader icon={Package} title="Docker" color={C.nova}/>
        <p style={{fontSize:12,color:C.t2,marginTop:10,lineHeight:1.6}}>
          ⚠ Tsy mahazo miantso ny <code>docker</code> CLI amin'ity server ity ny backend Laravel.
          Tsara jerena raha: (1) misy docker voapetraka, (2) ny user mandeha ny PHP-FPM/artisan
          dia ao anatin'ny groupe <code>docker</code>.
        </p>
        <button onClick={refresh} style={{...S.btnCyan,marginTop:12}}>Andramana indray</button>
      </div>
    )
  }

  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
      {Dialog}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,margin:0}}>🐳 Containers (réel)</h3>
        <button onClick={refresh} disabled={refreshing}
          style={{...S.btnCyan,display:'flex',alignItems:'center',gap:6,opacity:refreshing?0.5:1}}>
          <RefreshCw size={12} style={refreshing?{animation:'spin 0.6s linear infinite'}:{}}/> Actualiser
        </button>
      </div>

      {containers.length===0 && (
        <p style={{fontSize:12,color:C.t3}}>Tsy misy container hita (<code>docker ps -a</code> dia maty foana).</p>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {containers.map(c=>{
          const s = stats[c.id]
          const running = (c.state||'').toLowerCase()==='running'
          const busy = busyId===c.id
          return (
            <div key={c.id} style={{...S.panel({padding:16})}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
                <div style={{minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{width:8,height:8,borderRadius:'50%',background:running?C.neon:C.t3,flexShrink:0}}/>
                    <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:13,color:C.t1}}>{c.name}</span>
                  </div>
                  <p style={{fontSize:11,color:C.t3,margin:'4px 0 0',fontFamily:'JetBrains Mono,monospace'}}>{c.image}</p>
                  <p style={{fontSize:10,color:C.t3,margin:'2px 0 0'}}>{c.status}</p>
                </div>

                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {!running && (
                    <button disabled={busy} onClick={()=>runAction(c.id,c.name,'start',devspaceApi.dockerStart,'Container natomboka.')}
                      style={{...S.btnGhost,display:'flex',alignItems:'center',gap:5,opacity:busy?0.5:1}}>
                      <Play size={12}/> Start
                    </button>
                  )}
                  {running && (
                    <button disabled={busy} onClick={()=>runAction(c.id,c.name,'stop',devspaceApi.dockerStop,'Container najanona.')}
                      style={{...S.btnGhost,display:'flex',alignItems:'center',gap:5,opacity:busy?0.5:1}}>
                      <Square size={12}/> Stop
                    </button>
                  )}
                  <button disabled={busy} onClick={()=>runAction(c.id,c.name,'restart',devspaceApi.dockerRestart,'Container naverina natomboka.')}
                    style={{...S.btnGhost,display:'flex',alignItems:'center',gap:5,opacity:busy?0.5:1}}>
                    <RotateCcw size={12}/> Restart
                  </button>
                  <button onClick={()=>openLogs(c)}
                    style={{...S.btnGhost,display:'flex',alignItems:'center',gap:5}}>
                    <FileText size={12}/> Logs
                  </button>
                </div>
              </div>

              {running && s && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:10,marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                  <Metric label="CPU"     value={s.cpu}/>
                  <Metric label="Mémoire" value={s.memory}/>
                  <Metric label="% RAM"   value={s.mem_perc}/>
                  <Metric label="Réseau"  value={s.net_io}/>
                  <Metric label="Disque"  value={s.block_io}/>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal Logs */}
      <AnimatePresence>
        {logsFor && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:9999,
              display:'flex',alignItems:'center',justifyContent:'center',padding:20}}
            onClick={()=>setLogsFor(null)}>
            <motion.div initial={{scale:0.95,y:10}} animate={{scale:1,y:0}}
              onClick={e=>e.stopPropagation()}
              style={{...S.panel({padding:20,maxWidth:720,width:'100%',maxHeight:'70vh',display:'flex',flexDirection:'column'})}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <PanelHeader icon={Server} title={`Logs — ${logsFor.name}`} color={C.cyan}/>
                <button onClick={()=>setLogsFor(null)} style={{...S.btnGhost,padding:6}}><X size={14}/></button>
              </div>
              <pre style={{flex:1,overflow:'auto',fontSize:11,color:C.t2,fontFamily:'JetBrains Mono,monospace',
                whiteSpace:'pre-wrap',margin:0,background:'rgba(0,0,0,0.3)',padding:12,borderRadius:8}}>
                {logsLoading ? 'Maka logs…' : logsText}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Metric({label,value}){
  return (
    <div>
      <p style={{fontSize:9,color:C.t3,marginBottom:3,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{label}</p>
      <p style={{fontSize:12,color:C.t1,fontFamily:'JetBrains Mono,monospace',margin:0}}>{value ?? '—'}</p>
    </div>
  )
}
