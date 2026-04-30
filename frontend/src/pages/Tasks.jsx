import React,{useState,useEffect,useMemo} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {CheckSquare,Plus,Trash2,Edit,AlertCircle,Clock,Search,
        Filter,Calendar,User,Zap,ChevronDown,X,RefreshCw,
        AlertTriangle,PlayCircle,CheckCircle2,Circle} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {Empty,Loader} from '../components/ui/UI.jsx'
import {C,S} from '../styles.js'

// ─────────────────────────────────────────────────────────
//  STATUT AUTOMATIQUE — logique calculée selon les dates
// ─────────────────────────────────────────────────────────
function computeAutoStatus(task) {
  // Si déjà terminé ou annulé → on respecte
  if (task.status === 'done' || task.status === 'cancelled') return task.status

  const now   = new Date()
  const start = task.date_debut ? new Date(task.date_debut) : null
  const end   = task.due_date   ? new Date(task.due_date)   : null

  // En retard — date fin dépassée et pas terminé
  if (end && end < now) return 'overdue'

  // En cours — date début atteinte
  if (start && start <= now && (!end || end >= now)) return 'inprogress'

  // À faire — date début pas encore atteinte
  if (start && start > now) return 'todo'

  // Fallback → statut manuel
  return task.status || 'todo'
}

function getDaysLeft(due_date) {
  if (!due_date) return null
  const diff = new Date(due_date) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─────────────────────────────────────────────────────────
//  COLONNES KANBAN — 4 colonnes avec EN RETARD
// ─────────────────────────────────────────────────────────
const COLS = [
  { id:'todo',       label:'À FAIRE',    color:'#ffce00', icon:Circle,        emoji:'📋' },
  { id:'inprogress', label:'EN COURS',   color:'#00c8ff', icon:PlayCircle,    emoji:'⚡' },
  { id:'overdue',    label:'EN RETARD',  color:'#ff2d78', icon:AlertTriangle, emoji:'🚨' },
  { id:'done',       label:'TERMINÉ',    color:'#00ff88', icon:CheckCircle2,  emoji:'✅' },
]

const PC = { high:'#ff2d78', urgent:'#ff0000', medium:'#ffce00', low:'#7ab0d4' }
const PL = { urgent:'🔴 Urgente', high:'🔥 Haute', medium:'🔶 Moyenne', low:'🔵 Faible' }

// ─────────────────────────────────────────────────────────
//  MODAL SHELL
// ─────────────────────────────────────────────────────────
function MShell({ title, onClose, children, wide }) {
  return (
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)',zIndex:900}}
        onClick={onClose}/>
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:901,padding:20,overflowY:'auto'}}>
        <motion.div initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}}
          exit={{opacity:0,scale:0.9}} transition={{type:'spring',damping:25,stiffness:300}}
          style={{width:'100%',maxWidth:wide?600:490,background:'linear-gradient(135deg,rgba(10,22,40,0.98),rgba(6,15,26,0.99))',
            border:`1px solid ${C.border2}`,borderRadius:16,boxShadow:'0 24px 80px rgba(0,0,0,0.8)',position:'relative',overflow:'hidden'}}>
          {/* Barre top colorée */}
          <div style={{height:2,background:'linear-gradient(90deg,#00c8ff,#7c3aed,#00ff88)'}}/>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:13,color:C.t1}}>{title}</span>
            <button onClick={onClose} style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,color:C.t3,cursor:'pointer',width:28,height:28,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <X size={13}/>
            </button>
          </div>
          <div style={{padding:'20px'}}>{children}</div>
        </motion.div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────
//  FORMULAIRE TÂCHE — avec dates automatiques
// ─────────────────────────────────────────────────────────
function TaskForm({ task, projects, users, onSave, onClose }) {
  const [f, setF] = useState(task || {
    title:'', description:'', project_id:'', status:'todo',
    priority:'medium', assignee:'', date_debut:'', due_date:''
  })
  const s = (k,v) => setF(x=>({...x,[k]:v}))

  // Calcul statut automatique en temps réel
  const autoStatus = useMemo(() => computeAutoStatus(f), [f.date_debut, f.due_date, f.status])
  const autoCol    = COLS.find(c=>c.id===autoStatus)

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>

      {/* Titre */}
      <div>
        <label style={S.label}>Titre *</label>
        <input style={S.input} value={f.title} onChange={e=>s('title',e.target.value)}
          placeholder="Titre de la tâche..."/>
      </div>

      {/* Description */}
      <div>
        <label style={S.label}>Description</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:70,fontFamily:'inherit'}}
          value={f.description||''} onChange={e=>s('description',e.target.value)}
          placeholder="Description détaillée de la tâche..."/>
      </div>

      {/* Projet + Priorité */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <label style={S.label}>Projet</label>
          <select style={{...S.input,background:C.surface}}
            value={f.project_id||''} onChange={e=>s('project_id',e.target.value)}>
            <option value="">— Aucun projet —</option>
            {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={S.label}>Priorité</label>
          <select style={{...S.input,background:C.surface}}
            value={f.priority} onChange={e=>s('priority',e.target.value)}>
            <option value="urgent">🔴 Urgente</option>
            <option value="high">🔥 Haute</option>
            <option value="medium">🔶 Moyenne</option>
            <option value="low">🔵 Faible</option>
          </select>
        </div>
      </div>

      {/* Dates — clé de l'automatisation */}
      <div>
        <label style={{...S.label,display:'flex',alignItems:'center',gap:6}}>
          <Calendar size={11} style={{color:C.cyan}}/>
          Dates — <span style={{color:C.cyan,fontWeight:700}}>Statut calculé automatiquement</span>
        </label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <label style={{...S.label,fontSize:9,color:C.t3}}>Date de début</label>
            <input type="date" style={{...S.input,background:C.surface}}
              value={f.date_debut||''} onChange={e=>s('date_debut',e.target.value)}/>
          </div>
          <div>
            <label style={{...S.label,fontSize:9,color:C.t3}}>Date d'échéance</label>
            <input type="date" style={{...S.input,background:C.surface}}
              value={f.due_date||''} onChange={e=>s('due_date',e.target.value)}/>
          </div>
        </div>
      </div>

      {/* Preview statut automatique */}
      {(f.date_debut||f.due_date)&&autoCol&&(
        <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}
          style={{padding:'10px 14px',borderRadius:9,
            background:`${autoCol.color}10`,border:`1px solid ${autoCol.color}30`,
            display:'flex',alignItems:'center',gap:10}}>
          <autoCol.icon size={14} style={{color:autoCol.color,flexShrink:0}}/>
          <div>
            <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
              color:C.t3,letterSpacing:'0.1em'}}>STATUT CALCULÉ AUTOMATIQUEMENT : </span>
            <span style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:800,
              color:autoCol.color}}>{autoCol.label}</span>
          </div>
        </motion.div>
      )}

      {/* Assigné + Statut manuel */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <label style={S.label}>Assigné à</label>
          <select style={{...S.input,background:C.surface}}
            value={f.assignee||''} onChange={e=>s('assignee',e.target.value)}>
            <option value="">— Non assigné —</option>
            {users.map(u=>(
              <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
        {task && (
          <div>
            <label style={S.label}>Statut manuel</label>
            <select style={{...S.input,background:C.surface}}
              value={f.status} onChange={e=>s('status',e.target.value)}>
              <option value="todo">📋 À faire</option>
              <option value="inprogress">⚡ En cours</option>
              <option value="done">✅ Terminé</option>
              <option value="cancelled">❌ Annulé</option>
            </select>
          </div>
        )}
      </div>

      {/* Info automatisation */}
      <div style={{padding:'10px 12px',background:'rgba(0,200,255,0.04)',
        border:'1px solid rgba(0,200,255,0.15)',borderRadius:8,fontSize:11,color:C.t2,lineHeight:1.6}}>
        <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:9,
          color:C.cyan,display:'block',marginBottom:4}}>⚡ AUTOMATISATION</span>
        Le statut est mis à jour automatiquement chaque jour selon les dates :
        date début atteinte → <strong style={{color:'#00c8ff'}}>En cours</strong> •
        échéance dépassée → <strong style={{color:'#ff2d78'}}>En retard</strong>
      </div>

      {/* Boutons */}
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
        <button onClick={onClose} style={S.btnGhost}>Annuler</button>
        <button onClick={()=>{
          if(!f.title.trim()) return
          onSave({...f, status: f.date_debut||f.due_date ? autoStatus : f.status})
          onClose()
        }} style={S.btnCyan}>
          {task ? 'Mettre à jour' : 'Créer la tâche'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  CARTE TÂCHE
// ─────────────────────────────────────────────────────────
function TaskCard({ task, col, canEdit, onEdit, onDelete, onDragStart, onDragEnd }) {
  const daysLeft  = getDaysLeft(task.due_date)
  const isOverdue = daysLeft !== null && daysLeft < 0
  const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 2

  return (
    <motion.div layout key={task.id}
      draggable={canEdit}
      onDragStart={e=>onDragStart(e,task)}
      onDragEnd={onDragEnd}
      whileHover={{y:-2,boxShadow:`0 8px 24px rgba(0,0,0,0.4),0 0 0 1px ${col.color}20`}}
      style={{background:'rgba(255,255,255,0.03)',border:`1px solid rgba(255,255,255,0.07)`,
        borderRadius:11,padding:13,marginBottom:9,cursor:canEdit?'grab':'default',
        borderLeft:`3px solid ${PC[task.priority]||C.t3}`,transition:'box-shadow 0.2s'}}>

      {/* Header carte */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:8}}>
        <p style={{fontSize:12,fontFamily:'Orbitron,sans-serif',fontWeight:700,
          color:C.t1,lineHeight:1.3,flex:1}}>{task.title}</p>
        {canEdit&&(
          <div style={{display:'flex',gap:2,flexShrink:0}}>
            <button onClick={()=>onEdit(task)}
              style={{background:'none',border:'none',color:C.t3,cursor:'pointer',
                padding:3,borderRadius:4,display:'flex'}}>
              <Edit size={11}/>
            </button>
            <button onClick={()=>onDelete(task.id)}
              style={{background:'none',border:'none',color:C.t3,cursor:'pointer',
                padding:3,borderRadius:4,display:'flex'}}>
              <Trash2 size={11}/>
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {task.description&&(
        <p style={{fontSize:11,color:C.t3,marginBottom:8,lineHeight:1.5,
          display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
          {task.description}
        </p>
      )}

      {/* Badges */}
      <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',marginBottom:8}}>
        {/* Priorité */}
        <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
          padding:'2px 7px',borderRadius:5,background:`${PC[task.priority]||C.t2}15`,
          color:PC[task.priority]||C.t2,border:`1px solid ${PC[task.priority]||C.t2}28`}}>
          {(task.priority||'').toUpperCase()}
        </span>

        {/* Statut auto badge */}
        {task.status==='overdue'&&(
          <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
            padding:'2px 7px',borderRadius:5,background:'rgba(255,45,120,0.15)',
            color:'#ff2d78',border:'1px solid rgba(255,45,120,0.3)',
            display:'flex',alignItems:'center',gap:3}}>
            <AlertTriangle size={8}/> AUTO
          </span>
        )}
        {task.status==='inprogress'&&task.date_debut&&(
          <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
            padding:'2px 7px',borderRadius:5,background:'rgba(0,200,255,0.1)',
            color:'#00c8ff',border:'1px solid rgba(0,200,255,0.25)',
            display:'flex',alignItems:'center',gap:3}}>
            <Zap size={8}/> AUTO
          </span>
        )}

        {/* Projet */}
        {task.project&&(
          <span style={{fontSize:10,color:C.t3,maxWidth:90,
            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {task.project}
          </span>
        )}
      </div>

      {/* Footer — assigné + date */}
      {(task.assignee||task.due_date)&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          paddingTop:8,borderTop:`1px solid rgba(255,255,255,0.05)`}}>

          {task.assignee ? (
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:20,height:20,borderRadius:5,
                background:'linear-gradient(135deg,#00c8ff,#7c3aed)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:7,fontFamily:'Orbitron,sans-serif',fontWeight:800,color:'#020408'}}>
                {task.assignee.substring(0,2).toUpperCase()}
              </div>
              <span style={{fontSize:10,color:C.t2}}>{task.assignee}</span>
            </div>
          ) : <span/>}

          {task.due_date&&(
            <div style={{display:'flex',alignItems:'center',gap:4,
              padding:'2px 7px',borderRadius:5,
              background: isOverdue ? 'rgba(255,45,120,0.1)' : isDueSoon ? 'rgba(255,206,0,0.08)' : 'transparent',
              border: isOverdue ? '1px solid rgba(255,45,120,0.2)' : isDueSoon ? '1px solid rgba(255,206,0,0.2)' : 'none'}}>
              <Clock size={9} style={{color: isOverdue?'#ff2d78': isDueSoon?'#ffce00':C.t3}}/>
              <span style={{fontSize:9,fontFamily:'JetBrains Mono,monospace',
                color: isOverdue?'#ff2d78': isDueSoon?'#ffce00':C.t3}}>
                {isOverdue
                  ? `${Math.abs(daysLeft)}j retard`
                  : daysLeft===0 ? "Aujourd'hui"
                  : daysLeft===1 ? 'Demain'
                  : `${daysLeft}j`}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
//  PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────
export default function Tasks() {
  const { getTasks,addTask,updateTask,deleteTask,moveTask,getProjects,showToast } = useApp()
  const { can, user } = useAuth()

  const [tasks,    setTasks]    = useState([])
  const [projects, setProjects] = useState([])
  const [users,    setUsers]    = useState([])
  const [modal,    setModal]    = useState(null)
  const [dragging, setDragging] = useState(null)
  const [overCol,  setOverCol]  = useState(null)
  const [busy,     setBusy]     = useState(true)
  const [search,   setSearch]   = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterProject,  setFilterProject]  = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const canEdit = can('tasks')

  // ── Chargement ──────────────────────────────────────────
  const load = async () => {
    setBusy(true)
    try {
      const [t, p] = await Promise.all([getTasks(), getProjects()])
      const rawTasks = t || []

      // ← AUTOMATISATION FRONTEND: recalcule statut selon dates
      const autoTasks = rawTasks.map(task => ({
        ...task,
        status: computeAutoStatus(task),
        project: p?.find(proj=>proj.id===task.project_id)?.name || task.project || '',
      }))

      setTasks(autoTasks)
      setProjects(p || [])

      // Charger users si admin/dev
      if (can('users')) {
        try {
          const api = (await import('../services/api.js')).api
          const res = await api.get('/users')
          if (res?.success) setUsers(res.data || [])
        } catch {}
      }
    } catch {
      showToast('Impossible de contacter le serveur.', 'danger')
    } finally {
      setBusy(false)
    }
  }
  useEffect(() => { load() }, [])

  // ── Filtres + recherche ─────────────────────────────────
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch  = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase())
      const matchPrio    = filterPriority === 'all' || t.priority === filterPriority
      const matchProject = filterProject  === 'all' || String(t.project_id) === filterProject
      return matchSearch && matchPrio && matchProject
    })
  }, [tasks, search, filterPriority, filterProject])

  // ── Stats résumé ────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      tasks.length,
    todo:       tasks.filter(t=>t.status==='todo').length,
    inprogress: tasks.filter(t=>t.status==='inprogress').length,
    overdue:    tasks.filter(t=>t.status==='overdue').length,
    done:       tasks.filter(t=>t.status==='done').length,
  }), [tasks])

  // ── Actions ──────────────────────────────────────────────
  const handleSave = async data => {
    if (modal.type==='add') await addTask(data)
    else await updateTask(modal.task.id, data)
    showToast(modal.type==='add' ? 'Tâche créée !' : 'Tâche mise à jour !', 'success')
    load()
  }

  const handleDelete = async id => {
    if (!confirm('Supprimer cette tâche ?')) return
    await deleteTask(id)
    showToast('Tâche supprimée', 'success')
    load()
  }

  // ── Drag & Drop ─────────────────────────────────────────
  const onDragStart = (e, task) => {
    setDragging(task)
    e.dataTransfer.setData('taskId', String(task.id))
    e.currentTarget.style.opacity = '0.4'
  }
  const onDragEnd = e => {
    setDragging(null)
    setOverCol(null)
    e.currentTarget.style.opacity = '1'
  }
  const onDragOver = (e, colId) => {
    e.preventDefault()
    setOverCol(colId)
  }
  const onDrop = async (e, colId) => {
    e.preventDefault()
    setOverCol(null)
    const id   = Number(e.dataTransfer.getData('taskId'))
    const task = tasks.find(t=>t.id===id)
    if (!task || task.status===colId) return
    await moveTask(id, colId)
    showToast(`Tâche déplacée → "${COLS.find(c=>c.id===colId)?.label}"`, 'success')
    load()
  }

  if (busy) return <Loader/>

  return (
    <div>
      {/* ── En-tête ───────────────────────────────────────── */}
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:16}}>
          <div>
            <h1 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:24,
              background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:4}}>
              TÂCHES
            </h1>
            <p style={{color:C.t2,fontSize:13}}>
              {stats.total} tâche{stats.total>1?'s':''} •{' '}
              {canEdit ? 'Glissez-déposez entre colonnes — Statut automatique activé' : 'Vue lecture seule'}
            </p>
          </div>
          {canEdit&&(
            <button onClick={()=>setModal({type:'add'})} style={S.btnCyan}>
              <Plus size={13}/> Nouvelle tâche
            </button>
          )}
        </div>

        {/* Stats rapides */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[
            {label:'À faire',   value:stats.todo,       color:'#ffce00', icon:Circle},
            {label:'En cours',  value:stats.inprogress, color:'#00c8ff', icon:PlayCircle},
            {label:'En retard', value:stats.overdue,    color:'#ff2d78', icon:AlertTriangle},
            {label:'Terminées', value:stats.done,       color:'#00ff88', icon:CheckCircle2},
          ].map(({label,value,color,icon:Icon})=>(
            <motion.div key={label} whileHover={{y:-2}}
              style={{background:`${color}08`,border:`1px solid ${color}20`,
                borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
              <Icon size={18} style={{color,flexShrink:0}}/>
              <div>
                <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:18,color}}>{value}</div>
                <div style={{fontSize:10,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:9}}>{label.toUpperCase()}</div>
              </div>
              {/* Barre progression */}
              {stats.total>0&&(
                <div style={{flex:1,height:3,background:'rgba(255,255,255,0.05)',borderRadius:10,overflow:'hidden',marginLeft:'auto'}}>
                  <motion.div initial={{width:0}} animate={{width:`${(value/stats.total)*100}%`}}
                    transition={{duration:0.8,delay:0.2}}
                    style={{height:'100%',background:color,borderRadius:10}}/>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Barre de recherche + filtres */}
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:200}}>
            <Search size={13} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:C.t3}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher une tâche..."
              style={{...S.input,paddingLeft:34,width:'100%'}}/>
            {search&&(
              <button onClick={()=>setSearch('')}
                style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',
                  background:'none',border:'none',color:C.t3,cursor:'pointer',display:'flex'}}>
                <X size={12}/>
              </button>
            )}
          </div>

          <button onClick={()=>setShowFilters(v=>!v)}
            style={{...S.btnGhost,display:'flex',alignItems:'center',gap:6,
              borderColor:showFilters?C.cyan:undefined,color:showFilters?C.cyan:undefined}}>
            <Filter size={13}/> Filtres
            {(filterPriority!=='all'||filterProject!=='all')&&(
              <span style={{width:7,height:7,borderRadius:'50%',background:C.cyan,flexShrink:0}}/>
            )}
          </button>

          <button onClick={load}
            style={{...S.btnGhost,display:'flex',alignItems:'center',gap:6}}>
            <RefreshCw size={13}/> Actualiser
          </button>
        </div>

        {/* Filtres expandables */}
        <AnimatePresence>
          {showFilters&&(
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              style={{overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:10,
                padding:14,background:'rgba(0,200,255,0.03)',border:`1px solid rgba(0,200,255,0.12)`,borderRadius:10}}>
                <div>
                  <label style={S.label}>Priorité</label>
                  <select style={{...S.input,background:C.surface}} value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}>
                    <option value="all">Toutes les priorités</option>
                    <option value="urgent">🔴 Urgente</option>
                    <option value="high">🔥 Haute</option>
                    <option value="medium">🔶 Moyenne</option>
                    <option value="low">🔵 Faible</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Projet</label>
                  <select style={{...S.input,background:C.surface}} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
                    <option value="all">Tous les projets</option>
                    {projects.map(p=><option key={p.id} value={String(p.id)}>{p.name}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Kanban 4 colonnes ───────────────────────────────── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {COLS.map(col=>{
          const colTasks = filteredTasks.filter(t=>t.status===col.id)
          const isOver   = overCol===col.id && dragging?.status!==col.id

          return (
            <div key={col.id}
              onDragOver={e=>onDragOver(e,col.id)}
              onDragLeave={()=>setOverCol(null)}
              onDrop={e=>onDrop(e,col.id)}
              style={{background: isOver?`${col.color}06`:'rgba(255,255,255,0.015)',
                border:`1px solid ${isOver?col.color:col.id==='overdue'?'rgba(255,45,120,0.15)':'rgba(255,255,255,0.06)'}`,
                borderTop:`3px solid ${col.color}`,
                borderRadius:12,padding:14,minHeight:480,
                transition:'all 0.2s',
                boxShadow:isOver?`0 0 24px ${col.color}20`:undefined}}>

              {/* Header colonne */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <col.icon size={14} style={{color:col.color}}/>
                  <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:10,
                    letterSpacing:'0.08em',color:col.color}}>{col.label}</span>
                  <motion.span key={colTasks.length}
                    initial={{scale:1.3}} animate={{scale:1}}
                    style={{width:20,height:20,borderRadius:'50%',display:'flex',
                      alignItems:'center',justifyContent:'center',fontSize:10,
                      fontFamily:'Orbitron,sans-serif',fontWeight:800,
                      background:`${col.color}18`,color:col.color}}>
                    {colTasks.length}
                  </motion.span>
                </div>
                {canEdit&&(
                  <button onClick={()=>setModal({type:'add'})}
                    style={{background:'none',border:`1px solid ${C.border}`,borderRadius:5,
                      color:C.t3,cursor:'pointer',width:22,height:22,
                      display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>+</button>
                )}
              </div>

              {/* Note auto pour colonne EN RETARD */}
              {col.id==='overdue'&&colTasks.length>0&&(
                <div style={{padding:'6px 9px',background:'rgba(255,45,120,0.06)',
                  border:'1px solid rgba(255,45,120,0.15)',borderRadius:7,marginBottom:10,
                  fontSize:10,color:'#ff2d78',display:'flex',alignItems:'center',gap:6}}>
                  <Zap size={10}/> Statut mis à jour automatiquement
                </div>
              )}

              {/* Cartes */}
              <div>
                <AnimatePresence>
                  {colTasks.map(t=>(
                    <TaskCard key={t.id} task={t} col={col} canEdit={canEdit}
                      onEdit={task=>setModal({type:'edit',task})}
                      onDelete={handleDelete}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}/>
                  ))}
                </AnimatePresence>

                {/* Zone drop vide */}
                {colTasks.length===0&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',
                    justifyContent:'center',height:120,borderRadius:9,
                    border:`2px dashed ${isOver?col.color:col.color+'18'}`,
                    fontSize:10,color:isOver?col.color:C.t3,
                    fontFamily:'Orbitron,sans-serif',fontWeight:700,
                    transition:'all 0.2s',gap:6}}>
                    {isOver
                      ? <><col.icon size={16}/> DÉPOSER ICI</>
                      : <>Aucune tâche</>}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {modal&&(
          <MShell
            title={modal.type==='add'?'NOUVELLE TÂCHE':'MODIFIER LA TÂCHE'}
            onClose={()=>setModal(null)}
            wide>
            <TaskForm
              task={modal.task}
              projects={projects}
              users={users}
              onSave={handleSave}
              onClose={()=>setModal(null)}/>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}
