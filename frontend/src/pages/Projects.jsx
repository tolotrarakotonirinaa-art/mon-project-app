import React,{useState,useEffect,useMemo} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {
  FolderGit2,Plus,Trash2,Edit,Users,Calendar,Search,X,
  ChevronRight,Target,Code2,User,Clock,TrendingUp,
  RefreshCw,Zap,CheckCircle2,AlertTriangle,Timer,
  BarChart3,Filter,Info,ListTodo,GitBranch
} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {StatusBadge,Progress,Empty,Loader} from '../components/ui/UI.jsx'
import {C,S} from '../styles.js'

const COLORS = ['#00c8ff','#7c3aed','#00ff88','#ff6b35','#ff2d78','#ffce00']
const TECHS  = ['React','Laravel','PostgreSQL','Vue.js','Node.js','Docker',
                'Python','TypeScript','MongoDB','Redis','GraphQL','Tailwind',
                'Next.js','FastAPI','MySQL','Nginx']

// ─────────────────────────────────────────────────────────
//  Statut automatique selon dates
// ─────────────────────────────────────────────────────────
function computeProjectStatus(p) {
  const now   = new Date()
  const start = p.start_date ? new Date(p.start_date) : null
  const end   = p.end_date   ? new Date(p.end_date)   : null

  if (p.status === 'completed') return 'completed'
  if (end && end < now && p.progress < 100) return 'overdue'
  if (start && start > now) return 'pending'
  return p.status || 'active'
}

function getDaysLeft(end_date) {
  if (!end_date) return null
  return Math.ceil((new Date(end_date) - new Date()) / (1000*60*60*24))
}

function parseTechs(t) {
  if (!t) return []
  if (Array.isArray(t)) return t
  try { return JSON.parse(t) } catch { return typeof t==='string' ? t.split(',').map(x=>x.trim()).filter(Boolean) : [] }
}

// ─────────────────────────────────────────────────────────
//  Modal Shell
// ─────────────────────────────────────────────────────────
function MShell({title,onClose,children,wide}){
  return(
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',backdropFilter:'blur(8px)',zIndex:900}}
        onClick={onClose}/>
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
        zIndex:901,padding:20,overflowY:'auto'}}>
        <motion.div initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}}
          exit={{opacity:0,scale:0.9}} transition={{type:'spring',damping:25,stiffness:300}}
          style={{width:'100%',maxWidth:wide?720:520,
            background:'linear-gradient(135deg,rgba(10,22,40,0.98),rgba(6,15,26,0.99))',
            border:`1px solid ${C.border2}`,borderRadius:16,
            boxShadow:'0 24px 80px rgba(0,0,0,0.8)',margin:'auto',overflow:'hidden'}}>
          <div style={{height:2,background:'linear-gradient(90deg,#00c8ff,#7c3aed,#00ff88)'}}/>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'16px 22px',borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:13,color:C.t1}}>{title}</span>
            <button onClick={onClose} style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,
              color:C.t3,cursor:'pointer',width:28,height:28,borderRadius:6,display:'flex',
              alignItems:'center',justifyContent:'center'}}>
              <X size={13}/>
            </button>
          </div>
          <div style={{padding:'22px',maxHeight:'82vh',overflowY:'auto'}}>{children}</div>
        </motion.div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────
//  Formulaire Projet
// ─────────────────────────────────────────────────────────
function ProjectForm({project,onSave,onClose}){
  const [f,setF] = useState(project||{
    name:'',description:'',objectifs:'',responsable:'',
    technologies:[],status:'active',color:COLORS[0],
    start_date:'',end_date:'',progress:0,progress_manuel:false,
  })
  const s = (k,v) => setF(x=>({...x,[k]:v}))

  const techs = parseTechs(f.technologies)

  const toggleTech = t => {
    s('technologies', techs.includes(t) ? techs.filter(x=>x!==t) : [...techs,t])
  }

  // Statut auto preview
  const autoStatus = useMemo(()=>computeProjectStatus(f),[f.start_date,f.end_date,f.status,f.progress])
  const daysLeft   = getDaysLeft(f.end_date)

  return(
    <div style={{display:'flex',flexDirection:'column',gap:15}}>

      {/* Nom + Couleur */}
      <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'flex-end'}}>
        <div>
          <label style={S.label}>Nom du projet *</label>
          <input style={{...S.input,borderColor:f.color+'60'}} value={f.name}
            onChange={e=>s('name',e.target.value)} placeholder="Ex: Site E-commerce"/>
        </div>
        <div>
          <label style={S.label}>Couleur</label>
          <div style={{display:'flex',gap:6}}>
            {COLORS.map(c=>(
              <button key={c} type="button" onClick={()=>s('color',c)}
                style={{width:28,height:28,borderRadius:7,background:c,cursor:'pointer',
                  border:`2.5px solid ${f.color===c?'#fff':'transparent'}`,
                  boxShadow:f.color===c?`0 0 10px ${c}`:'none',transition:'all 0.15s'}}/>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={S.label}>
          Description *
          <span style={{fontSize:9,color:C.t3,marginLeft:6,fontWeight:400}}>— Contexte, enjeux, périmètre</span>
        </label>
        <textarea style={{...S.input,resize:'vertical',minHeight:80,fontFamily:'inherit'}}
          value={f.description} onChange={e=>s('description',e.target.value)}
          placeholder="Décrivez le projet en détail — contexte, enjeux, périmètre, public cible..."/>
      </div>

      {/* Objectifs */}
      <div>
        <label style={S.label}>
          Objectifs
          <span style={{fontSize:9,color:C.t3,marginLeft:6,fontWeight:400}}>— Résultats attendus</span>
        </label>
        <textarea style={{...S.input,resize:'vertical',minHeight:64,fontFamily:'inherit'}}
          value={f.objectifs||''} onChange={e=>s('objectifs',e.target.value)}
          placeholder="Ex: Augmenter les conversions de 20%, améliorer le temps de chargement..."/>
      </div>

      {/* Responsable + Statut */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <label style={S.label}>Responsable / Chef de projet</label>
          <input style={S.input} value={f.responsable||''} onChange={e=>s('responsable',e.target.value)}
            placeholder="Nom du responsable"/>
        </div>
        <div>
          <label style={S.label}>Statut</label>
          <select style={{...S.input,background:C.surface}} value={f.status} onChange={e=>s('status',e.target.value)}>
            <option value="active">🟢 Actif</option>
            <option value="pending">🟡 En attente</option>
            <option value="completed">✅ Terminé</option>
          </select>
        </div>
      </div>

      {/* Dates */}
      <div>
        <label style={{...S.label,display:'flex',alignItems:'center',gap:6}}>
          <Calendar size={11} style={{color:C.cyan}}/>
          Dates du projet
          <span style={{fontSize:9,color:C.cyan,fontWeight:700}}>— Statut calculé automatiquement</span>
        </label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <label style={{...S.label,fontSize:9,color:C.t3}}>Date de début</label>
            <input type="date" style={{...S.input,background:C.surface}}
              value={f.start_date||''} onChange={e=>s('start_date',e.target.value)}/>
          </div>
          <div>
            <label style={{...S.label,fontSize:9,color:C.t3}}>Date de fin prévue</label>
            <input type="date" style={{...S.input,background:C.surface}}
              value={f.end_date||''} onChange={e=>s('end_date',e.target.value)}/>
          </div>
        </div>
        {/* Preview statut auto */}
        {(f.start_date||f.end_date)&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            style={{marginTop:8,padding:'8px 12px',borderRadius:8,
              background:'rgba(0,200,255,0.05)',border:'1px solid rgba(0,200,255,0.15)',
              display:'flex',alignItems:'center',gap:10,fontSize:11,color:C.t2}}>
            <Zap size={12} style={{color:C.cyan}}/>
            <span>Statut auto : <strong style={{color:C.cyan}}>{
              autoStatus==='overdue'?'⚠️ En retard':
              autoStatus==='pending'?'⏳ En attente':
              autoStatus==='completed'?'✅ Terminé':'🟢 Actif'
            }</strong></span>
            {daysLeft!==null&&(
              <span style={{marginLeft:'auto',fontSize:10,
                color:daysLeft<0?'#ff2d78':daysLeft<=7?'#ffce00':C.t3}}>
                {daysLeft<0?`${Math.abs(daysLeft)}j de retard`:
                 daysLeft===0?"Aujourd'hui":
                 `${daysLeft}j restants`}
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Progression */}
      <div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
          <label style={S.label}>Progression — <strong style={{color:f.color}}>{f.progress||0}%</strong></label>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:9,color:C.t3}}>Mode :</span>
            <button type="button"
              onClick={()=>s('progress_manuel',!f.progress_manuel)}
              style={{padding:'3px 9px',borderRadius:6,fontSize:9,fontFamily:'Orbitron,sans-serif',
                fontWeight:700,cursor:'pointer',border:'none',
                background:f.progress_manuel?'rgba(255,206,0,0.15)':'rgba(0,200,255,0.1)',
                color:f.progress_manuel?'#ffce00':C.cyan}}>
              {f.progress_manuel?'✋ MANUEL':'⚡ AUTO'}
            </button>
          </div>
        </div>
        {f.progress_manuel ? (
          <>
            <input type="range" min="0" max="100" value={f.progress||0}
              onChange={e=>s('progress',parseInt(e.target.value))}
              style={{width:'100%',accentColor:f.color,cursor:'pointer'}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:C.t3,marginTop:2}}>
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </>
        ) : (
          <div style={{padding:'10px 12px',background:'rgba(0,200,255,0.04)',
            border:'1px solid rgba(0,200,255,0.12)',borderRadius:8,fontSize:11,color:C.t2,
            display:'flex',alignItems:'center',gap:8}}>
            <Zap size={12} style={{color:C.cyan}}/>
            Progression calculée automatiquement selon les tâches terminées
          </div>
        )}
        {/* Barre preview */}
        <div style={{marginTop:8,height:6,background:'rgba(255,255,255,0.06)',borderRadius:10,overflow:'hidden'}}>
          <motion.div animate={{width:`${f.progress||0}%`}} transition={{duration:0.5}}
            style={{height:'100%',background:`linear-gradient(90deg,${f.color},${f.color}88)`,borderRadius:10}}/>
        </div>
      </div>

      {/* Technologies */}
      <div>
        <label style={S.label}>Technologies utilisées
          {techs.length>0&&<span style={{color:C.cyan,marginLeft:6}}>{techs.length} sélectionnée{techs.length>1?'s':''}</span>}
        </label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>
          {TECHS.map(t=>{
            const sel = techs.includes(t)
            return(
              <button key={t} type="button" onClick={()=>toggleTech(t)}
                style={{padding:'4px 11px',borderRadius:7,fontSize:10,fontFamily:'Orbitron,sans-serif',
                  fontWeight:700,cursor:'pointer',transition:'all 0.15s',
                  background:sel?`${f.color}18`:'rgba(255,255,255,0.03)',
                  border:`1px solid ${sel?f.color:'rgba(255,255,255,0.1)'}`,
                  color:sel?f.color:C.t3,
                  boxShadow:sel?`0 0 8px ${f.color}20`:'none'}}>
                {sel&&'✓ '}{t}
              </button>
            )
          })}
        </div>
      </div>

      {/* Boutons */}
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:6,
        paddingTop:14,borderTop:`1px solid ${C.border}`}}>
        <button onClick={onClose} style={S.btnGhost}>Annuler</button>
        <button disabled={!f.name.trim()||f.name.trim().length<2}
          onClick={()=>{
            if(!f.name.trim()||f.name.trim().length<2) return
            onSave({...f, technologies: Array.isArray(f.technologies)?f.technologies:parseTechs(f.technologies)})
            onClose()
          }}
          style={{...S.btnCyan,opacity:(!f.name.trim()||f.name.trim().length<2)?0.4:1}}>
          {project?'Mettre à jour':'Créer le projet'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  Détail Projet — Tabs
// ─────────────────────────────────────────────────────────
function ProjectDetail({project:p,canEdit,canDelete,onEdit,onDelete,onClose,onRecalculate}){
  const [tab,setTab] = useState('general')
  const techs   = parseTechs(p.technologies)
  const daysLeft = getDaysLeft(p.end_date)
  const autoSt   = computeProjectStatus(p)

  const TABS = [
    {id:'general',  label:'Général',    icon:Info},
    {id:'objectifs',label:'Objectifs',  icon:Target},
    {id:'progress', label:'Progression',icon:BarChart3},
    {id:'team',     label:'Équipe',     icon:Users},
  ]

  const stColor = autoSt==='overdue'?'#ff2d78':autoSt==='completed'?'#00ff88':autoSt==='pending'?'#ffce00':'#00c8ff'
  const stLabel = autoSt==='overdue'?'EN RETARD':autoSt==='completed'?'TERMINÉ':autoSt==='pending'?'EN ATTENTE':'ACTIF'

  return(
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',gap:16,marginBottom:20}}>
        <div style={{width:52,height:52,borderRadius:13,display:'flex',alignItems:'center',
          justifyContent:'center',background:`${p.color}15`,border:`1.5px solid ${p.color}30`,flexShrink:0}}>
          <FolderGit2 size={22} style={{color:p.color}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4,flexWrap:'wrap'}}>
            <h2 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:16,color:C.t1}}>{p.name}</h2>
            <span style={{padding:'3px 9px',borderRadius:6,fontSize:9,fontFamily:'Orbitron,sans-serif',
              fontWeight:800,background:`${stColor}15`,color:stColor,border:`1px solid ${stColor}30`}}>
              {stLabel}
            </span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14,fontSize:11,color:C.t3,flexWrap:'wrap'}}>
            {p.responsable&&<span style={{display:'flex',alignItems:'center',gap:4}}><User size={10}/>{p.responsable}</span>}
            {p.start_date&&<span style={{display:'flex',alignItems:'center',gap:4}}><Calendar size={10}/>Début: {p.start_date}</span>}
            {p.end_date&&(
              <span style={{display:'flex',alignItems:'center',gap:4,
                color:daysLeft!==null&&daysLeft<0?'#ff2d78':daysLeft!==null&&daysLeft<=7?'#ffce00':C.t3}}>
                <Clock size={10}/>
                {daysLeft===null?`Fin: ${p.end_date}`:
                 daysLeft<0?`${Math.abs(daysLeft)}j de retard`:
                 daysLeft===0?"Échéance aujourd'hui":
                 `${daysLeft}j restants`}
              </span>
            )}
          </div>
        </div>
        <div style={{display:'flex',gap:6}}>
          {canEdit&&(
            <button onClick={onEdit}
              style={{...S.btnGhost,padding:'7px 12px',fontSize:11,display:'flex',alignItems:'center',gap:5}}>
              <Edit size={12}/> Modifier
            </button>
          )}
          {canDelete&&(
            <button onClick={onDelete}
              style={{...S.btnGhost,padding:'7px 10px',color:'#ff2d78',borderColor:'rgba(255,45,120,0.2)'}}>
              <Trash2 size={12}/>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:2,marginBottom:20,padding:4,
        background:'rgba(255,255,255,0.02)',borderRadius:10,border:`1px solid ${C.border}`}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:'8px 4px',borderRadius:7,fontSize:10,fontFamily:'Orbitron,sans-serif',
              fontWeight:700,border:'none',cursor:'pointer',display:'flex',alignItems:'center',
              justifyContent:'center',gap:5,transition:'all 0.15s',
              background:tab===t.id?p.color:'transparent',
              color:tab===t.id?'#020408':C.t3}}>
            <t.icon size={11}/>{t.label}
          </button>
        ))}
      </div>

      {/* Contenu tabs */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
          transition={{duration:0.2}}>

          {/* GÉNÉRAL */}
          {tab==='general'&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{padding:'14px 16px',background:'rgba(255,255,255,0.02)',
                border:`1px solid ${C.border}`,borderRadius:11}}>
                <p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                  color:C.t3,letterSpacing:'0.12em',marginBottom:8}}>DESCRIPTION</p>
                <p style={{fontSize:13,color:C.t1,lineHeight:1.7}}>
                  {p.description||<em style={{color:C.t3}}>Aucune description</em>}
                </p>
              </div>
              {techs.length>0&&(
                <div>
                  <p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                    color:C.t3,letterSpacing:'0.12em',marginBottom:8}}>TECHNOLOGIES</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {techs.map(t=>(
                      <span key={t} style={{padding:'4px 11px',borderRadius:7,fontSize:10,
                        fontFamily:'Orbitron,sans-serif',fontWeight:700,
                        background:`${p.color}12`,color:p.color,
                        border:`1px solid ${p.color}25`}}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OBJECTIFS */}
          {tab==='objectifs'&&(
            <div style={{padding:'14px 16px',background:'rgba(255,255,255,0.02)',
              border:`1px solid ${C.border}`,borderRadius:11,minHeight:120}}>
              <p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                color:C.t3,letterSpacing:'0.12em',marginBottom:10}}>OBJECTIFS DU PROJET</p>
              {p.objectifs ? (
                <p style={{fontSize:13,color:C.t1,lineHeight:1.8,whiteSpace:'pre-wrap'}}>{p.objectifs}</p>
              ) : (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',
                  justifyContent:'center',height:80,gap:8}}>
                  <Target size={24} style={{color:C.t3,opacity:0.4}}/>
                  <p style={{fontSize:12,color:C.t3}}>Aucun objectif défini</p>
                </div>
              )}
            </div>
          )}

          {/* PROGRESSION */}
          {tab==='progress'&&(
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {/* Grande barre progression */}
              <div style={{padding:'20px',background:'rgba(255,255,255,0.02)',
                border:`1px solid ${p.color}20`,borderRadius:11,textAlign:'center'}}>
                <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:48,
                  color:p.color,marginBottom:8}}>{p.progress||0}%</div>
                <div style={{height:10,background:'rgba(255,255,255,0.06)',borderRadius:10,
                  overflow:'hidden',marginBottom:8}}>
                  <motion.div initial={{width:0}} animate={{width:`${p.progress||0}%`}}
                    transition={{duration:1,ease:'easeOut'}}
                    style={{height:'100%',background:`linear-gradient(90deg,${p.color},${p.color}88)`,
                      borderRadius:10,boxShadow:`0 0 12px ${p.color}40`}}/>
                </div>
                <p style={{fontSize:11,color:C.t3}}>
                  {p.progress_manuel?'✋ Progression définie manuellement':'⚡ Calculée automatiquement selon les tâches'}
                </p>
              </div>
              {/* Bouton recalculer */}
              <button onClick={()=>onRecalculate&&onRecalculate(p.id)}
                style={{...S.btnGhost,width:'100%',padding:'11px',display:'flex',
                  alignItems:'center',justifyContent:'center',gap:8,fontSize:12,
                  borderColor:'rgba(0,200,255,0.2)',color:C.cyan}}>
                <RefreshCw size={13}/> Recalculer depuis les tâches
              </button>
              {/* Infos dates */}
              {(p.start_date||p.end_date)&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {[
                    {label:'Début',value:p.start_date,icon:Timer,color:'#00ff88'},
                    {label:'Fin prévue',value:p.end_date,icon:Clock,color:daysLeft!==null&&daysLeft<0?'#ff2d78':'#ffce00'},
                  ].map(({label,value,icon:Icon,color})=>value&&(
                    <div key={label} style={{padding:'12px',background:`${color}08`,
                      border:`1px solid ${color}20`,borderRadius:10,display:'flex',
                      alignItems:'center',gap:10}}>
                      <Icon size={16} style={{color,flexShrink:0}}/>
                      <div>
                        <div style={{fontSize:9,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{label.toUpperCase()}</div>
                        <div style={{fontSize:12,color,fontFamily:'JetBrains Mono,monospace',fontWeight:700}}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ÉQUIPE */}
          {tab==='team'&&(
            <div>
              {Array.isArray(p.team)&&p.team.length>0 ? (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {p.team.map((m,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:12,
                      padding:'10px 14px',background:'rgba(255,255,255,0.02)',
                      border:`1px solid ${C.border}`,borderRadius:10}}>
                      <div style={{width:36,height:36,borderRadius:9,flexShrink:0,
                        background:`linear-gradient(135deg,${p.color},${p.color}88)`,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:12,fontFamily:'Orbitron,sans-serif',fontWeight:800,color:'#020408'}}>
                        {typeof m==='string'?m.substring(0,2).toUpperCase():String(m).substring(0,2)}
                      </div>
                      <div>
                        <div style={{fontSize:12,color:C.t1,fontWeight:600}}>{m}</div>
                        <div style={{fontSize:10,color:C.t3}}>Membre de l'équipe</div>
                      </div>
                      {i===0&&p.responsable&&(
                        <span style={{marginLeft:'auto',fontSize:9,padding:'2px 8px',
                          borderRadius:5,background:`${p.color}15`,color:p.color,
                          fontFamily:'Orbitron,sans-serif',fontWeight:700}}>
                          RESPONSABLE
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',
                  justifyContent:'center',height:100,gap:8}}>
                  <Users size={28} style={{color:C.t3,opacity:0.4}}/>
                  <p style={{fontSize:12,color:C.t3}}>Aucun membre dans l'équipe</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  Page principale
// ─────────────────────────────────────────────────────────
export default function Projects(){
  const {getProjects,addProject,updateProject,deleteProject,showToast} = useApp()
  const {can} = useAuth()

  const [projects, setProjects] = useState([])
  const [modal,    setModal]    = useState(null)
  const [busy,     setBusy]     = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')

  const load = async () => {
    setBusy(true)
    try {
      const data = await getProjects()
      // Applique statut auto à chaque projet
      const enriched = (data||[]).map(p=>({...p, _autoStatus: computeProjectStatus(p)}))
      setProjects(enriched)
    } catch {
      showToast('Impossible de charger les projets.','danger')
    } finally { setBusy(false) }
  }
  useEffect(()=>{ load() },[])

  // Filtre + recherche
  const list = useMemo(()=>{
    return projects.filter(p=>{
      const matchFilter = filter==='all' || p.status===filter || p._autoStatus===filter
      const matchSearch = !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.responsable?.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
  },[projects,filter,search])

  // Stats
  const stats = useMemo(()=>({
    total:     projects.length,
    active:    projects.filter(p=>p._autoStatus==='active').length,
    overdue:   projects.filter(p=>p._autoStatus==='overdue').length,
    completed: projects.filter(p=>p._autoStatus==='completed').length,
  }),[projects])

  const handleSave = async data => {
    if (modal.type==='add') await addProject(data)
    else await updateProject(modal.p.id, data)
    showToast(modal.type==='add'?'Projet créé !':'Projet mis à jour !','success')
    load()
    setModal(null)
  }

  const handleDelete = async id => {
    if (!confirm('Supprimer ce projet ?')) return
    await deleteProject(id)
    showToast('Projet supprimé','success')
    load()
    setModal(null)
  }

  const handleRecalculate = async id => {
    try {
      const {api} = await import('../services/api.js')
      const res = await api.post(`/projects/${id}/recalculate`)
      if (res?.success) {
        showToast(`Progression recalculée : ${res.data.progress}%`,'success')
        load()
      }
    } catch { showToast('Erreur recalcul','danger') }
  }

  if (busy) return <Loader/>

  return(
    <div>
      {/* En-tête */}
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
          flexWrap:'wrap',gap:14,marginBottom:16}}>
          <div>
            <h1 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:24,
              background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              backgroundClip:'text',marginBottom:4}}>PROJETS</h1>
            <p style={{color:C.t2,fontSize:13}}>
              {stats.total} projet{stats.total>1?'s':''} •{' '}
              {stats.active} actif{stats.active>1?'s':''} •{' '}
              {stats.overdue>0&&<span style={{color:'#ff2d78'}}>{stats.overdue} en retard</span>}
            </p>
          </div>
          {can('canCreate')&&(
            <button onClick={()=>setModal({type:'add'})} style={S.btnCyan}>
              <Plus size={13}/> Nouveau projet
            </button>
          )}
        </div>

        {/* Stats cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[
            {label:'Total',    value:stats.total,     color:'#7c3aed',  icon:FolderGit2},
            {label:'Actifs',   value:stats.active,    color:'#00c8ff',  icon:Zap},
            {label:'Retard',   value:stats.overdue,   color:'#ff2d78',  icon:AlertTriangle},
            {label:'Terminés', value:stats.completed, color:'#00ff88',  icon:CheckCircle2},
          ].map(({label,value,color,icon:Icon})=>(
            <motion.div key={label} whileHover={{y:-2}}
              style={{background:`${color}08`,border:`1px solid ${color}20`,
                borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}
              onClick={()=>setFilter(label==='Total'?'all':label==='Actifs'?'active':label==='Retard'?'overdue':'completed')}>
              <Icon size={18} style={{color,flexShrink:0}}/>
              <div>
                <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:20,color}}>{value}</div>
                <div style={{fontSize:9,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{label.toUpperCase()}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recherche + filtres */}
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:200}}>
            <Search size={13} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:C.t3}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher un projet, responsable..."
              style={{...S.input,paddingLeft:34}}/>
            {search&&(
              <button onClick={()=>setSearch('')}
                style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',
                  background:'none',border:'none',color:C.t3,cursor:'pointer',display:'flex'}}>
                <X size={12}/>
              </button>
            )}
          </div>
          <div style={{display:'flex',gap:3,padding:4,borderRadius:10,
            background:'rgba(0,200,255,0.04)',border:`1px solid ${C.border}`}}>
            {[
              {id:'all',label:'TOUS'},
              {id:'active',label:'ACTIFS'},
              {id:'pending',label:'ATTENTE'},
              {id:'overdue',label:'RETARD'},
              {id:'completed',label:'TERMINÉS'},
            ].map(({id,label})=>(
              <button key={id} onClick={()=>setFilter(id)}
                style={{padding:'6px 10px',borderRadius:7,fontSize:9,fontFamily:'Orbitron,sans-serif',
                  fontWeight:700,border:'none',cursor:'pointer',transition:'all 0.15s',
                  background:filter===id?C.cyan:'transparent',
                  color:filter===id?'#020408':C.t3}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille projets */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:18}}>
        <AnimatePresence>
          {list.map((p,i)=>{
            const techs    = parseTechs(p.technologies)
            const autoSt   = p._autoStatus || computeProjectStatus(p)
            const daysLeft = getDaysLeft(p.end_date)
            const stColor  = autoSt==='overdue'?'#ff2d78':autoSt==='completed'?'#00ff88':autoSt==='pending'?'#ffce00':'#00c8ff'

            return(
              <motion.div key={p.id}
                initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}
                exit={{opacity:0,scale:0.95}} transition={{delay:i*0.04}}
                whileHover={{y:-4,transition:{duration:0.2}}}
                style={{background:'rgba(255,255,255,0.02)',
                  border:`1px solid rgba(255,255,255,0.07)`,
                  borderRadius:14,padding:20,position:'relative',overflow:'hidden',
                  cursor:'pointer',transition:'box-shadow 0.2s'}}
                onClick={()=>setModal({type:'detail',p})}>

                {/* Barre couleur top */}
                <div style={{position:'absolute',top:0,left:0,right:0,height:3,
                  background:`linear-gradient(90deg,${p.color},transparent)`}}/>
                {/* Glow bg */}
                <div style={{position:'absolute',top:-30,right:-30,width:90,height:90,
                  borderRadius:'50%',background:`radial-gradient(circle,${p.color},transparent)`,
                  filter:'blur(20px)',opacity:0.08,pointerEvents:'none'}}/>

                <div style={{position:'relative'}}>
                  {/* Header carte */}
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{width:42,height:42,borderRadius:11,display:'flex',
                      alignItems:'center',justifyContent:'center',
                      background:`${p.color}15`,border:`1px solid ${p.color}30`}}>
                      <FolderGit2 size={19} style={{color:p.color}}/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}} onClick={e=>e.stopPropagation()}>
                      {/* Badge statut auto */}
                      <span style={{padding:'2px 8px',borderRadius:5,fontSize:9,
                        fontFamily:'Orbitron,sans-serif',fontWeight:800,
                        background:`${stColor}12`,color:stColor,border:`1px solid ${stColor}25`}}>
                        {autoSt==='overdue'?'RETARD':autoSt==='completed'?'TERMINÉ':autoSt==='pending'?'ATTENTE':'ACTIF'}
                      </span>
                      {can('canEdit')&&(
                        <button onClick={e=>{e.stopPropagation();setModal({type:'edit',p})}}
                          style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:4,borderRadius:5,display:'flex'}}>
                          <Edit size={12}/>
                        </button>
                      )}
                      {can('canDelete')&&(
                        <button onClick={e=>{e.stopPropagation();handleDelete(p.id)}}
                          style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:4,borderRadius:5,display:'flex'}}>
                          <Trash2 size={12}/>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nom */}
                  <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:13,
                    color:C.t1,marginBottom:4,lineHeight:1.3}}>{p.name}</h3>

                  {/* Responsable */}
                  {p.responsable&&(
                    <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:C.t3,marginBottom:7}}>
                      <User size={10}/>{p.responsable}
                    </div>
                  )}

                  {/* Description */}
                  <p style={{fontSize:12,color:C.t2,marginBottom:12,lineHeight:1.6,
                    display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                    {p.description||<em style={{color:C.t3}}>Aucune description</em>}
                  </p>

                  {/* Technologies */}
                  {techs.length>0&&(
                    <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:10}}>
                      {techs.slice(0,3).map(t=>(
                        <span key={t} style={{fontSize:9,padding:'2px 8px',borderRadius:5,
                          background:`${p.color}10`,color:p.color,
                          border:`1px solid ${p.color}22`,
                          fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{t}</span>
                      ))}
                      {techs.length>3&&(
                        <span style={{fontSize:9,color:C.t3,padding:'2px 4px',
                          fontFamily:'Orbitron,sans-serif'}}>+{techs.length-3}</span>
                      )}
                    </div>
                  )}

                  {/* Progression */}
                  <div style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:9,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                        display:'flex',alignItems:'center',gap:4}}>
                        {p.progress_manuel?'✋ MANUEL':'⚡ AUTO'}
                      </span>
                      <span style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:800,color:p.color}}>
                        {p.progress||0}%
                      </span>
                    </div>
                    <div style={{height:5,background:'rgba(255,255,255,0.06)',borderRadius:10,overflow:'hidden'}}>
                      <motion.div initial={{width:0}} animate={{width:`${p.progress||0}%`}}
                        transition={{duration:0.8,delay:i*0.05}}
                        style={{height:'100%',background:`linear-gradient(90deg,${p.color},${p.color}88)`,
                          borderRadius:10}}/>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{display:'flex',justifyContent:'space-between',
                    alignItems:'center',fontSize:10,color:C.t3,
                    paddingTop:10,borderTop:`1px solid rgba(255,255,255,0.05)`}}>
                    <span style={{display:'flex',alignItems:'center',gap:4}}>
                      <Users size={9}/>
                      {Array.isArray(p.team)?p.team.length:0} membres
                    </span>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      {daysLeft!==null&&(
                        <span style={{color:daysLeft<0?'#ff2d78':daysLeft<=7?'#ffce00':C.t3,
                          display:'flex',alignItems:'center',gap:3}}>
                          <Clock size={9}/>
                          {daysLeft<0?`${Math.abs(daysLeft)}j retard`:
                           daysLeft===0?"Auj.":
                           `${daysLeft}j`}
                        </span>
                      )}
                      <ChevronRight size={12} style={{color:p.color,opacity:0.6}}/>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {list.length===0&&(
          <div style={{gridColumn:'1 / -1'}}>
            <Empty icon={FolderGit2}
              msg="Aucun projet trouvé"
              sub="Modifiez vos filtres ou créez un nouveau projet"/>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type==='detail'&&(
          <MShell wide title="DÉTAILS DU PROJET" onClose={()=>setModal(null)}>
            <ProjectDetail
              project={modal.p}
              canEdit={can('canEdit')}
              canDelete={can('canDelete')}
              onEdit={()=>setModal({type:'edit',p:modal.p})}
              onDelete={()=>handleDelete(modal.p.id)}
              onClose={()=>setModal(null)}
              onRecalculate={handleRecalculate}
            />
          </MShell>
        )}
        {(modal?.type==='add'||modal?.type==='edit')&&(
          <MShell wide title={modal.type==='add'?'NOUVEAU PROJET':'MODIFIER LE PROJET'}
            onClose={()=>setModal(null)}>
            <ProjectForm project={modal.p} onSave={handleSave} onClose={()=>setModal(null)}/>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}
