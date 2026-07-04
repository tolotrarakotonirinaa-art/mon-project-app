import React,{useState,useEffect,useCallback} from 'react'
import {motion} from 'framer-motion'
import {RefreshCw,Server,BarChart3} from 'lucide-react'
import {PanelHeader} from '../ui/UI.jsx'
import {C,S} from '../../styles.js'
import {
  initWebVitals,
  subscribeVitals,
  getMemoryInfo,
  getApiStats,
} from '../../utils/perfMonitor.js'

// ════════════════════════════════════════════
//  PROFILER — TENA MARINA (tsy Math.random())
//  - Core Web Vitals : PerformanceObserver API
//  - Mémoire JS       : performance.memory (Chrome/Edge)
//  - Performance API  : antso tena niseho (services/api.js)
// ════════════════════════════════════════════
export default function ProfilerPanel(){
  const [vitals,setVitals]   = useState({lcp:null,fid:null,cls:0,ttfb:null,fcp:null,tti:null})
  const [memory,setMemory]   = useState(null)
  const [apiStats,setApiStats] = useState([])
  const [refreshing,setRefreshing] = useState(false)

  useEffect(()=>{
    initWebVitals()
    const unsub = subscribeVitals(setVitals)
    setMemory(getMemoryInfo())
    setApiStats(getApiStats())
    return unsub
  },[])

  const refresh = useCallback(async ()=>{
    setRefreshing(true)
    await new Promise(r=>setTimeout(r,250))
    setMemory(getMemoryInfo())
    setApiStats(getApiStats())
    setRefreshing(false)
  },[])

  const {lcp,fid,cls,ttfb,fcp,tti} = vitals

  const VITALS_DEF=[
    {k:'LCP', raw:lcp,        display:lcp!=null ?`${lcp}ms`:null,            label:'Largest Contentful Paint',              good:2500,bad:4000},
    {k:'FID', raw:fid,        display:fid!=null ?`${fid}ms`:null,            label:'First Input Delay (kasiho ny pejy)',    good:100, bad:300},
    {k:'CLS', raw:cls*1000,   display:cls.toFixed(3),                        label:'Cumulative Layout Shift',               good:100, bad:250},
    {k:'TTFB',raw:ttfb,       display:ttfb!=null?`${ttfb}ms`:null,           label:'Time to First Byte',                    good:800, bad:1800},
    {k:'FCP', raw:fcp,        display:fcp!=null ?`${fcp}ms`:null,            label:'First Contentful Paint',                good:1800,bad:3000},
    {k:'TTI', raw:tti,        display:tti!=null ?`${tti}ms`:null,            label:'Time to Interactive (approx. domInteractive)',good:3800,bad:7300},
  ]

  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,margin:0}}>📊 Core Web Vitals (réel)</h3>
        <button onClick={refresh} disabled={refreshing}
          style={{...S.btnCyan,display:'flex',alignItems:'center',gap:6,opacity:refreshing?0.5:1}}>
          <RefreshCw size={12} style={refreshing?{animation:'spin 0.6s linear infinite'}:{}}/> Actualiser
        </button>
      </div>

      {/* Vitals */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:12,marginBottom:20}}>
        {VITALS_DEF.map(m=>{
          const have  = m.raw!=null
          const color = !have ? C.t3 : m.raw<m.good ? C.neon : m.raw<m.bad ? C.quantum : C.nova
          return(
            <div key={m.k} style={{...S.panel({padding:14,textAlign:'center'})}}>
              <p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t3,marginBottom:6}}>{m.k}</p>
              <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:20,color,marginBottom:4}}>{have?m.display:'—'}</p>
              <p style={{fontSize:9,color:C.t3,lineHeight:1.3}}>{m.label}</p>
              <div style={{marginTop:6,fontSize:9,color,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>
                {!have ? 'En attente…' : m.raw<m.good?'✓ BON':m.raw<m.bad?'⚠ MOYEN':'✗ MAUVAIS'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mémoire JS réelle */}
      <div style={{...S.panel({padding:18,marginBottom:16})}}>
        <PanelHeader icon={BarChart3} title="Mémoire JS (réel)" color={C.plasma}/>
        {memory ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:10}}>
            {[
              {l:'Heap utilisé', v:memory.used, total:memory.total, c:C.cyan},
              {l:'Heap total',   v:memory.heap, total:memory.total, c:C.plasma},
              {l:'Limite libre', v:memory.total-memory.used, total:memory.total, c:C.neon},
            ].map(m=>(
              <div key={m.l}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:5}}>
                  <span style={{color:C.t2}}>{m.l}</span>
                  <span style={{color:m.c,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{m.v.toFixed(1)} MB</span>
                </div>
                <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:10,overflow:'hidden'}}>
                  <motion.div style={{height:'100%',background:m.c,borderRadius:10}}
                    initial={{width:0}} animate={{width:`${Math.min((m.v/m.total)*100,100)}%`}} transition={{duration:1}}/>
                </div>
              </div>
            ))}
          </div>
        ):(
          <p style={{fontSize:11,color:C.t3,marginTop:10}}>
            ⚠ performance.memory tsy raisin'ity navigateur ity (Chrome/Edge ihany no manana azy io, tsy Firefox/Safari).
          </p>
        )}
      </div>

      {/* Performance API réelle */}
      <div style={{...S.panel({padding:18})}}>
        <PanelHeader icon={Server} title="Performance API (réel)" color={C.solar}/>
        <div style={{marginTop:12}}>
          {apiStats.length===0 && (
            <p style={{fontSize:11,color:C.t3}}>
              Tsy mbola misy antso API voarakitra. Mandehana any amin'ny pejy hafa (Projects, Tasks, sns.) dia miverina eto.
            </p>
          )}
          {apiStats.map(a=>{
            const color=a.avg<20?C.neon:a.avg<50?C.quantum:C.nova
            return(
              <div key={a.endpoint} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:C.t2,flex:1}}>{a.endpoint}</span>
                <span style={{fontSize:10,color:C.t3}}>{a.calls} appels</span>
                <span style={{fontSize:10,color:C.t3}}>min:{a.min}ms</span>
                <span style={{fontSize:10,color:C.t3}}>max:{a.max}ms</span>
                <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:12,color,minWidth:55,textAlign:'right'}}>∅ {a.avg}ms</span>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
