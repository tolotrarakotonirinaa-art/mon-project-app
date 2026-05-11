import React,{useState,useEffect} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {BarChart3,Database,Users,Activity,Target} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {PanelHeader,Progress,Empty,Loader} from '../components/ui/UI.jsx'
import {C,S,ROLE_META} from '../styles.js'
import {ini} from '../data.js'
import {PT} from './shared/PageUtils.jsx'

// ────────────────────────────────────────────────────────
//  ANIMATED COUNTER
// ────────────────────────────────────────────────────────
function AnimatedNumber({value,color,duration=1.4}){
  const [display,setDisplay]=useState(0)
  useEffect(()=>{
    const end=Number(value)
    const totalFrames=Math.round(duration*60)
    let frame=0
    const id=setInterval(()=>{
      frame++
      const ease=1-Math.pow(1-(frame/totalFrames),3)
      setDisplay(Math.floor(ease*end))
      if(frame>=totalFrames){setDisplay(end);clearInterval(id)}
    },1000/60)
    return()=>clearInterval(id)
  },[value])
  return <span style={{color}}>{display}</span>
}

// ────────────────────────────────────────────────────────
//  SPARKLINE
// ────────────────────────────────────────────────────────
function Sparkline({data,color,height=32,width=64}){
  const max=Math.max(...data,1)
  const pts=data.map((v,i)=>`${(i/(data.length-1))*width},${height-(v/max)*height}`).join(' ')
  const lastX=(data.length-1)/(data.length-1)*width
  const lastY=height-(data.at(-1)/max)*height
  return(
    <svg width={width} height={height} style={{overflow:'visible',flexShrink:0}}>
      <motion.polyline points={pts} fill="none" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"
        initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}}
        transition={{duration:1.6,ease:'easeOut'}}/>
      <motion.circle cx={lastX} cy={lastY} r={3} fill={color}
        initial={{scale:0}} animate={{scale:1}} transition={{delay:1.4,type:'spring'}}
        style={{filter:`drop-shadow(0 0 4px ${color})`}}/>
    </svg>
  )
}

// ────────────────────────────────────────────────────────
//  STAT CARD
// ────────────────────────────────────────────────────────
function StatCard({v,l,c,icon,delay=0,sparkData}){
  const [hov,setHov]=useState(false)
  return(
    <motion.div
      initial={{opacity:0,y:20,scale:0.95}}
      animate={{opacity:1,y:0,scale:1}}
      transition={{duration:0.5,delay,ease:[0.22,1,0.36,1]}}
      onHoverStart={()=>setHov(true)}
      onHoverEnd={()=>setHov(false)}
      style={{position:'relative',overflow:'hidden',
        background:hov?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.02)',
        border:`1px solid ${hov?c+'55':'rgba(255,255,255,0.07)'}`,
        borderRadius:14,padding:'18px 20px',cursor:'default',
        transition:'all 0.3s ease',
        boxShadow:hov?`0 8px 32px ${c}22,inset 0 1px 0 rgba(255,255,255,0.05)`:'none'}}>

      {/* Ambient glow */}
      <motion.div animate={{opacity:hov?1:0}} transition={{duration:0.3}}
        style={{position:'absolute',inset:0,
          background:`radial-gradient(circle at 30% 60%,${c}14,transparent 65%)`,
          pointerEvents:'none'}}/>

      {/* Top shimmer bar */}
      <motion.div
        initial={{scaleX:0,opacity:0}} animate={{scaleX:1,opacity:1}}
        transition={{duration:0.9,delay:delay+0.25,ease:'easeOut'}}
        style={{position:'absolute',top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,transparent,${c},transparent)`,
          transformOrigin:'left',borderRadius:'2px 2px 0 0'}}/>

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
        <div style={{width:38,height:38,borderRadius:11,flexShrink:0,
          background:`${c}18`,border:`1px solid ${c}30`,
          display:'flex',alignItems:'center',justifyContent:'center',
          transition:'all 0.3s',
          boxShadow:hov?`0 0 12px ${c}44`:undefined}}>
          <span style={{fontSize:17}}>{icon}</span>
        </div>
        {sparkData&&<Sparkline data={sparkData} color={c} height={30} width={60}/>}
      </div>

      <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:30,
        lineHeight:1,marginBottom:4,
        textShadow:`0 0 24px ${c}55`}}>
        <AnimatedNumber value={v} color={c} duration={1.2+delay*0.5}/>
      </div>
      <div style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
        color:'rgba(255,255,255,0.32)',letterSpacing:'0.12em'}}>
        {l.toUpperCase()}
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────
//  DONUT INTERACTIF
// ────────────────────────────────────────────────────────
function DonutChart({tasks}){
  const [active,setActive]=useState(null)
  const done  =tasks.filter(t=>t.status==='done').length
  const inp   =tasks.filter(t=>t.status==='inprogress').length
  const todo  =tasks.filter(t=>t.status==='todo').length
  const ovr   =tasks.filter(t=>t.status==='overdue').length
  const total =Math.max(tasks.length,1)
  const r=48, circ=2*Math.PI*r

  const segs=[
    {v:done/total, c:C.neon,    l:'Terminées',n:done},
    {v:inp/total,  c:C.cyan,    l:'En cours', n:inp},
    {v:todo/total, c:C.quantum, l:'À faire',  n:todo},
    {v:ovr/total,  c:'#ff2d78', l:'En retard',n:ovr},
  ].filter(s=>s.n>0)

  let cumOff=0
  return(
    <div style={{display:'flex',alignItems:'center',gap:24}}>
      <div style={{position:'relative',flexShrink:0}}>
        <svg width={130} height={130} viewBox="0 0 130 130" style={{transform:'rotate(-90deg)'}}>
          <circle cx={65} cy={65} r={r} fill="none"
            stroke="rgba(255,255,255,0.04)" strokeWidth={14}/>
          {segs.map((s,i)=>{
            const startOff=cumOff
            cumOff+=s.v
            const isAct=active===i
            return(
              <motion.circle key={i}
                cx={65} cy={65} r={isAct?r+2:r} fill="none"
                stroke={s.c}
                strokeWidth={isAct?16:13}
                strokeLinecap="round"
                strokeDasharray={`${s.v*circ} ${circ}`}
                strokeDashoffset={-startOff*circ}
                initial={{strokeDasharray:`0 ${circ}`}}
                animate={{
                  strokeDasharray:`${s.v*circ} ${circ}`,
                  filter:isAct?`drop-shadow(0 0 10px ${s.c})`:'none'
                }}
                transition={{duration:1.3,delay:i*0.22,ease:[0.4,0,0.2,1]}}
                style={{cursor:'pointer',transition:'r 0.2s,stroke-width 0.2s'}}
                onMouseEnter={()=>setActive(i)}
                onMouseLeave={()=>setActive(null)}/>
            )
          })}
        </svg>
        {/* Centre */}
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',
          alignItems:'center',justifyContent:'center'}}>
          <AnimatePresence mode="wait">
            {active!==null?(
              <motion.div key={'seg'+active}
                initial={{opacity:0,scale:0.75}} animate={{opacity:1,scale:1}}
                exit={{opacity:0,scale:0.75}} transition={{duration:0.15}}
                style={{textAlign:'center'}}>
                <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,
                  fontSize:22,color:segs[active]?.c}}>
                  {segs[active]?.n}
                </span>
                <br/>
                <span style={{fontSize:7,color:'rgba(255,255,255,0.38)',
                  fontFamily:'Orbitron,sans-serif',fontWeight:700}}>
                  {Math.round((segs[active]?.n/total)*100)}%
                </span>
              </motion.div>
            ):(
              <motion.div key="total"
                initial={{opacity:0}} animate={{opacity:1}}
                style={{textAlign:'center'}}>
                <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:24,color:C.t1}}>
                  {tasks.length}
                </span>
                <br/>
                <span style={{fontSize:7,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>
                  TÂCHES
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Légende */}
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
        {segs.map((d,i)=>(
          <motion.div key={d.l}
            initial={{opacity:0,x:14}} animate={{opacity:1,x:0}}
            transition={{delay:0.35+i*0.1,duration:0.4}}
            onHoverStart={()=>setActive(i)} onHoverEnd={()=>setActive(null)}
            style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'6px 9px',borderRadius:9,cursor:'default',
              background:active===i?`${d.c}14`:'transparent',
              border:`1px solid ${active===i?d.c+'35':'transparent'}`,
              transition:'all 0.2s'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <motion.span animate={{scale:active===i?1.35:1}}
                style={{width:7,height:7,borderRadius:'50%',background:d.c,flexShrink:0,
                  boxShadow:active===i?`0 0 8px ${d.c}`:undefined,transition:'box-shadow 0.2s'}}/>
              <span style={{fontSize:12,color:active===i?C.t1:C.t2,transition:'color 0.2s'}}>{d.l}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:14,color:d.c}}>{d.n}</span>
              <span style={{fontSize:10,color:'rgba(255,255,255,0.28)'}}>
                ({Math.round(d.n/total*100)}%)
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
//  BAR CHART AVEC TOOLTIP
// ────────────────────────────────────────────────────────
function BarChartWidget({bars}){
  const [hov,setHov]=useState(null)
  const max=Math.max(...bars.map(b=>b.v),1)
  return(
    <div style={{position:'relative'}}>
      <div style={{display:'flex',alignItems:'flex-end',gap:8,height:110,marginBottom:10}}>
        {bars.map((b,i)=>{
          const pct=(b.v/max)*100
          const isH=hov===i
          return(
            <div key={b.m} style={{flex:1,display:'flex',flexDirection:'column',
              alignItems:'center',gap:4,height:'100%',justifyContent:'flex-end',
              position:'relative'}}
              onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
              <AnimatePresence>
                {isH&&(
                  <motion.div initial={{opacity:0,y:4,scale:0.9}}
                    animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:4}}
                    transition={{duration:0.12}}
                    style={{position:'absolute',bottom:'100%',marginBottom:6,
                      background:'rgba(6,15,26,0.95)',
                      border:`1px solid ${C.cyan}44`,borderRadius:7,
                      padding:'3px 8px',fontSize:10,
                      fontFamily:'Orbitron,sans-serif',fontWeight:700,
                      color:C.cyan,whiteSpace:'nowrap',zIndex:10,
                      boxShadow:`0 4px 14px rgba(0,0,0,0.5)`}}>
                    {b.v}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                initial={{height:0,opacity:0}}
                animate={{height:`${pct}%`,opacity:1}}
                transition={{duration:0.85,delay:i*0.07,ease:[0.4,0,0.2,1]}}
                style={{width:'100%',borderRadius:'5px 5px 0 0',minHeight:4,
                  background:isH
                    ?`linear-gradient(180deg,${C.neon},${C.cyan})`
                    :`linear-gradient(180deg,${C.cyan},${C.plasma})`,
                  boxShadow:isH?`0 0 14px ${C.cyan}66`:`0 0 5px ${C.cyan}22`,
                  transition:'background 0.25s,box-shadow 0.25s'}}/>
              <span style={{fontSize:8,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                color:isH?C.cyan:C.t3,transition:'color 0.2s'}}>{b.m}</span>
            </div>
          )
        })}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,fontSize:10,color:C.t3}}>
        <span style={{width:12,height:3,display:'inline-block',
          background:`linear-gradient(90deg,${C.cyan},${C.plasma})`,borderRadius:2}}/>
        Commits mensuels
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
//  PROJECT ROW
// ────────────────────────────────────────────────────────
function ProjectRow({p,delay}){
  const [hov,setHov]=useState(false)
  return(
    <motion.div
      initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
      transition={{delay,duration:0.4,ease:'easeOut'}}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      style={{marginBottom:12,padding:'9px 11px',borderRadius:10,
        background:hov?`${p.color}08`:'transparent',
        border:`1px solid ${hov?p.color+'28':'transparent'}`,
        transition:'all 0.25s'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
        <span style={{fontSize:12,color:hov?C.t1:C.t2,overflow:'hidden',
          textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,marginRight:8,
          transition:'color 0.2s'}}>{p.name}</span>
        <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,
          fontSize:11,color:p.color,flexShrink:0}}>{p.progress}%</span>
      </div>
      <Progress value={p.progress} color={p.color}/>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────
//  MEMBER ROW
// ────────────────────────────────────────────────────────
function MemberRow({u,i,total}){
  const [hov,setHov]=useState(false)
  const rc=ROLE_META[u.role]||ROLE_META.dev
  return(
    <motion.div
      initial={{opacity:0,x:10}} animate={{opacity:1,x:0}}
      transition={{delay:0.1+i*0.06,duration:0.4,ease:'easeOut'}}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      style={{display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'8px 10px',borderRadius:10,cursor:'default',
        background:hov?`${rc.color}0a`:'transparent',
        border:`1px solid ${hov?rc.color+'28':'transparent'}`,
        marginBottom:i<total-1?3:0,
        transition:'all 0.25s'}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <motion.div
          animate={{scale:hov?1.08:1,boxShadow:hov?`0 0 14px ${rc.color}55`:'none'}}
          transition={{duration:0.2}}
          style={{width:32,height:32,borderRadius:9,flexShrink:0,
            background:`linear-gradient(135deg,${rc.color},${rc.color}88)`,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408'}}>
          {ini(u.name)}
        </motion.div>
        <div>
          <p style={{fontSize:12,color:C.t1,fontWeight:600,marginBottom:1}}>{u.name}</p>
          <p style={{fontSize:10,color:C.t3}}>{u.email}</p>
        </div>
      </div>
      <motion.span animate={{scale:hov?1.06:1}} transition={{duration:0.2}}
        style={{fontSize:8,fontFamily:'Orbitron,sans-serif',fontWeight:700,
          padding:'3px 8px',borderRadius:6,flexShrink:0,
          background:hov?rc.color+'28':rc.bg,
          color:rc.color,border:`1px solid ${rc.border}`,
          transition:'background 0.2s'}}>
        {rc.label}
      </motion.span>
    </motion.div>
  )
}

// ════════════════════════════════════════════════════════
//  PAGE PRINCIPALE
// ════════════════════════════════════════════════════════
export function Statistics(){
  const {getTasks,getProjects,getUsers}=useApp()
  const [tasks,setTasks]=useState([])
  const [projects,setProjects]=useState([])
  const [users,setUsers]=useState([])
  const [busy,setBusy]=useState(true)
  const [error,setError]=useState(null)

  useEffect(()=>{
    Promise.all([getTasks(),getProjects(),getUsers()])
      .then(([t,p,u])=>{setTasks(t||[]);setProjects(p||[]);setUsers(u||[])})
      .catch(e=>setError(e?.message||'Erreur de chargement'))
      .finally(()=>setBusy(false))
  },[])

  if(busy) return <Loader/>
  if(error) return(
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
      style={{padding:40,color:'#ff2d78',textAlign:'center',
        fontFamily:'Orbitron,sans-serif',fontSize:13}}>
      ⚠ {error}
    </motion.div>
  )

  const done=tasks.filter(t=>t.status==='done').length
  const bars=['Jan','Fév','Mar','Avr','Mai','Jun'].map((m,i)=>({m,v:30+((i*37+13)%60)}))

  // Fausse sparkline data (tendance montante)
  const sk=(end,base=0)=>[base+1,base+2,base+2,base+3,base+3,end]

  return(
    <div>
      {/* En-tête */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        transition={{duration:0.45}} style={{marginBottom:26}}>
        {PT('STATISTIQUES')}
        <p style={{color:C.t2,fontSize:13,marginTop:5}}>Métriques et analyses de performance</p>
      </motion.div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))',gap:14,marginBottom:22}}>
        <StatCard v={tasks.length}    l='Total tâches'  c={C.cyan}   icon='📋' delay={0}    sparkData={sk(tasks.length,0)}/>
        <StatCard v={done}            l='Terminées'     c={C.neon}   icon='✅' delay={0.07} sparkData={sk(done,0)}/>
        <StatCard v={projects.length} l='Projets'       c={C.plasma} icon='📁' delay={0.14} sparkData={sk(projects.length,0)}/>
        <StatCard v={users.length}    l='Utilisateurs'  c={C.solar}  icon='👥' delay={0.21} sparkData={sk(users.length,0)}/>
      </div>

      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:18}}>
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
          transition={{delay:0.28,duration:0.5}} style={S.panel({padding:22})}>
          <PanelHeader icon={BarChart3} title="Tâches par statut"/>
          <DonutChart tasks={tasks}/>
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
          transition={{delay:0.35,duration:0.5}} style={S.panel({padding:22})}>
          <PanelHeader icon={Activity} title="Activité mensuelle" color={C.plasma}/>
          <BarChartWidget bars={bars}/>
        </motion.div>
      </div>

      {/* Bottom */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
          transition={{delay:0.42,duration:0.5}} style={S.panel({padding:22})}>
          <PanelHeader icon={Target} title="Progression projets" color={C.neon}/>
          {projects.length===0
            ?<Empty icon={Database} msg="Aucun projet"/>
            :projects.map((p,i)=><ProjectRow key={p.id} p={p} delay={0.08+i*0.07}/>)
          }
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
          transition={{delay:0.48,duration:0.5}} style={S.panel({padding:22})}>
          <PanelHeader icon={Users} title="Membres & Rôles" color={C.solar}/>
          {users.length===0
            ?<Empty icon={Users} msg="Aucun membre"/>
            :users.map((u,i)=><MemberRow key={u.id} u={u} i={i} total={users.length}/>)
          }
        </motion.div>
      </div>
    </div>
  )
}

export default Statistics
