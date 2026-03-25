import React,{useState,useEffect} from 'react'
import {motion} from 'framer-motion'
import {useNavigate} from 'react-router-dom'
import {FolderGit2,CheckSquare,Users,GitBranch,Activity,Clock,Zap,ArrowRight,TrendingUp} from 'lucide-react'
import {useAuth} from '../context/AuthContext.jsx'
import {useApp} from '../context/AppContext.jsx'
import {StatCard,Progress,StatusBadge,PanelHeader,Loader,Empty} from '../components/ui/UI.jsx'
import {C,S,ROLE_META} from '../styles.js'

export default function Dashboard(){
  const {user}=useAuth()
  const {getProjects,getTasks,getUsers,getActivities,clearActivities,showToast}=useApp()
  const navigate=useNavigate()
  const rc=ROLE_META[user?.role]||ROLE_META.dev

  const [projects,setProjects] = useState([])
  const [tasks,setTasks]       = useState([])
  const [users,setUsers]       = useState([])
  const [acts,setActs]         = useState([])
  const [busy,setBusy]         = useState(true)

  const load=async()=>{
    setBusy(true)
    try{
      const [p,t,u,a]=await Promise.all([getProjects(),getTasks(),getUsers(),getActivities()])
      setProjects(p||[]); setTasks(t||[]); setUsers(u||[]); setActs(a||[])
    }catch{ showToast('Impossible de contacter le serveur. Vérifiez que php artisan serve est lancé.','danger') }
    finally{ setBusy(false) }
  }
  useEffect(()=>{ load() },[])

  const done = tasks.filter(t=>t.status==='done').length
  const inp  = tasks.filter(t=>t.status==='inprogress').length
  const todo = tasks.filter(t=>t.status==='todo').length

  if(busy) return <Loader/>

  return(
    <div>
      {/* ── En-tête ── */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:28}}>
        <div>
          <p style={{fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t3,letterSpacing:'0.15em',marginBottom:4}}>
            {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}).toUpperCase()}
          </p>
          <h1 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:26,lineHeight:1}}>
            <span style={{color:C.t1}}>BONJOUR, </span>
            <span style={{background:'linear-gradient(135deg,#00c8ff,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              {user?.name?.split(' ')[0]?.toUpperCase()}
            </span>
          </h1>
          <p style={{color:C.t2,fontSize:13,marginTop:5}}>Voici ce qui se passe sur votre plateforme aujourd'hui.</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <span style={{padding:'6px 14px',borderRadius:20,fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,background:rc.bg,color:rc.color,border:`1px solid ${rc.border}`}}>
            ● {rc.label}
          </span>
          <button onClick={load} style={S.btnGhost}><Zap size={13}/> Actualiser</button>
          {user?.role!=='client'&&(
            <button onClick={()=>navigate('/projects')} style={S.btnCyan}>
              <FolderGit2 size={13}/> Nouveau projet
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16,marginBottom:24}}>
        <StatCard icon={FolderGit2} label="Projets actifs"   value={projects.filter(p=>p.status==='active').length} sub={`${projects.length} total`}       color={C.cyan}   delay={0}/>
        <StatCard icon={Clock}      label="En cours"          value={inp}   sub="Cette semaine"                                                              color={C.plasma} delay={0.07}/>
        <StatCard icon={CheckSquare}label="Terminées"         value={done}  sub={`${todo} restantes`}                                                        color={C.neon}   delay={0.14}/>
        <StatCard icon={Users}      label="Membres"           value={users.length} sub="Équipe active"                                                       color={C.solar}  delay={0.21}/>
      </div>

      {/* ── Grille principale ── */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginBottom:20}}>

        {/* Projets récents */}
        <div style={S.panel({padding:22})}>
          <PanelHeader icon={FolderGit2} title="Projets récents"
            actions={<button onClick={()=>navigate('/projects')} style={{...S.btnGhost,fontSize:11,padding:'5px 11px'}}>Voir tout <ArrowRight size={11}/></button>}/>
          {projects.length===0 ? <Empty icon={FolderGit2} msg="Aucun projet"/> :
            projects.slice(0,4).map((p,i)=>(
              <motion.div key={p.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
                onClick={()=>navigate('/projects')}
                style={{display:'flex',alignItems:'center',gap:13,padding:'11px 0',borderBottom:i<3?`1px solid ${C.border}`:'none',cursor:'pointer'}}>
                <div style={{width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:`${p.color}15`,border:`1px solid ${p.color}28`,flexShrink:0}}>
                  <FolderGit2 size={15} style={{color:p.color}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
                    <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:12,color:C.t1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginRight:8}}>
                      {p.name}
                    </span>
                    <StatusBadge status={p.status}/>
                  </div>
                  <Progress value={p.progress} color={p.color}/>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                    <span style={{fontSize:10,color:C.t3}}>{p.progress}% complété</span>
                    <span style={{fontSize:10,color:C.t3}}>{Array.isArray(p.team)?p.team.length:0} membres</span>
                  </div>
                </div>
              </motion.div>
            ))
          }
        </div>

        {/* Activité récente */}
        <div style={{...S.panel({padding:22}),display:'flex',flexDirection:'column',maxHeight:340}}>
          <PanelHeader icon={Activity} title="Activité" color={C.solar}
            actions={<button onClick={()=>{clearActivities();load();showToast('Effacé','success')}} style={{...S.btnGhost,fontSize:11,padding:'5px 10px'}}>Effacer</button>}/>
          <div style={{flex:1,overflowY:'auto'}}>
            {acts.length===0 ? <Empty icon={Activity} msg="Aucune activité"/> :
              acts.map((a,i)=>(
                <div key={a.id||i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:i<acts.length-1?`1px solid ${C.border}`:'none'}}>
                  <div style={{width:28,height:28,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',background:`${a.color||C.cyan}15`,border:`1px solid ${a.color||C.cyan}25`,flexShrink:0}}>
                    <i className={`fas fa-${a.icon||'user'}`} style={{color:a.color||C.cyan,fontSize:10}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.user||'Système'}</p>
                    <p style={{fontSize:11,color:C.t2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.action}</p>
                  </div>
                  <span style={{fontSize:9,color:C.t3,flexShrink:0}}>{a.time}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* ── Bas : Tâches + Pipeline ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>

        {/* Résumé tâches */}
        <div style={S.panel({padding:22})}>
          <PanelHeader icon={CheckSquare} title="Résumé tâches" color={C.neon}
            actions={user?.role!=='client'?<button onClick={()=>navigate('/tasks')} style={{...S.btnGhost,fontSize:11,padding:'5px 11px'}}>Kanban <ArrowRight size={11}/></button>:null}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
            {[{l:'À faire',v:todo,c:C.quantum},{l:'En cours',v:inp,c:C.cyan},{l:'Terminées',v:done,c:C.neon}].map(s=>(
              <div key={s.l} onClick={()=>user?.role!=='client'&&navigate('/tasks')}
                style={{borderRadius:10,padding:'12px 8px',textAlign:'center',background:`${s.c}08`,border:`1px solid ${s.c}20`,cursor:user?.role!=='client'?'pointer':'default'}}>
                <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:26,color:s.c,marginBottom:3}}>{s.v}</div>
                <div style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t3}}>{s.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
          {/* Par priorité */}
          {[{l:'Priorité haute',v:tasks.filter(t=>t.priority==='high').length,c:C.nova},
            {l:'Priorité moyenne',v:tasks.filter(t=>t.priority==='medium').length,c:C.quantum},
            {l:'Priorité faible',v:tasks.filter(t=>t.priority==='low').length,c:C.t2}].map(p=>(
            <div key={p.l} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:p.c,flexShrink:0}}/>
              <span style={{fontSize:12,color:C.t2,flex:1}}>{p.l}</span>
              <span style={{fontSize:12,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:p.c}}>{p.v}</span>
              <div style={{width:56,height:4,borderRadius:10,background:'rgba(255,255,255,0.05)',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${(p.v/Math.max(tasks.length,1))*100}%`,background:p.c,borderRadius:10}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline CI/CD */}
        <div style={S.panel({padding:22})}>
          <PanelHeader icon={GitBranch} title="Pipeline CI/CD" color={C.plasma}
            actions={user?.role!=='client'?<button onClick={()=>navigate('/pipeline')} style={{...S.btnGhost,fontSize:11,padding:'5px 11px'}}>Détails <ArrowRight size={11}/></button>:null}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {l:'Checkout',icon:'📥',c:C.neon,   s:'Terminé'},
              {l:'Tests',   icon:'🧪',c:C.cyan,   s:'En cours'},
              {l:'Build',   icon:'📦',c:C.quantum, s:'En attente'},
              {l:'Deploy',  icon:'🚀',c:C.t2,      s:'En attente'},
            ].map((s,i)=>(
              <motion.div key={s.l} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3+i*0.07}}
                style={{display:'flex',alignItems:'center',gap:9,padding:'11px',borderRadius:10,background:`${s.c}08`,border:`1px solid ${s.c}18`}}>
                <span style={{fontSize:18}}>{s.icon}</span>
                <div>
                  <p style={{fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t1}}>{s.l}</p>
                  <p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:s.c}}>{s.s.toUpperCase()}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Stats rapides */}
          <div style={{display:'flex',gap:12,marginTop:14,padding:'12px 0',borderTop:`1px solid ${C.border}`}}>
            {[{l:'Commits',v:'47',c:C.cyan},{l:'Builds',v:'12',c:C.plasma},{l:'Déploiements',v:'8',c:C.neon}].map(s=>(
              <div key={s.l} style={{flex:1,textAlign:'center'}}>
                <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:18,color:s.c}}>{s.v}</div>
                <div style={{fontSize:9,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{s.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
