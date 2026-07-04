import React,{useState,useEffect,useMemo,useCallback} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {
  CheckSquare,Plus,Trash2,Edit,Clock,Search,
  Filter,Calendar,User,Zap,X,RefreshCw,AlertTriangle,
  PlayCircle,CheckCircle2,Circle,LayoutGrid,List,Check
} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {Empty} from '../components/ui/UI.jsx'
import {C,S,ROLE_META} from '../styles.js'
import {ini} from '../data.js'
import {useConfirm} from './shared/PageUtils.jsx'

// ─────────────────────────────────────────────────────────
//  STATUT AUTO
// ─────────────────────────────────────────────────────────
function computeAutoStatus(task){
  if(task.status==='done'||task.status==='cancelled') return task.status
  const now=new Date()
  const start=task.date_debut?new Date(task.date_debut):null
  const end=task.due_date?new Date(task.due_date):null
  if(end&&end<now) return 'overdue'
  if(start&&start<=now&&(!end||end>=now)) return 'inprogress'
  if(start&&start>now) return 'todo'
  return task.status||'todo'
}

function getDaysLeft(due_date){
  if(!due_date) return null
  return Math.ceil((new Date(due_date)-new Date())/(1000*60*60*24))
}

// ─────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────
const COLS=[
  {id:'todo',       label:'À FAIRE',   color:'#ffce00', icon:Circle},
  {id:'inprogress', label:'EN COURS',  color:'#00c8ff', icon:PlayCircle},
  {id:'overdue',    label:'EN RETARD', color:'#ff2d78', icon:AlertTriangle},
  {id:'done',       label:'TERMINÉ',   color:'#00ff88', icon:CheckCircle2},
]
const PC={high:'#ff2d78',urgent:'#ff0000',medium:'#ffce00',low:'#7ab0d4'}

// ─────────────────────────────────────────────────────────
//  MODAL SHELL
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
          style={{width:'100%',maxWidth:wide?620:490,margin:'auto',
            background:'linear-gradient(135deg,rgba(10,22,40,0.98),rgba(6,15,26,0.99))',
            border:`1px solid ${C.border2}`,borderRadius:16,
            boxShadow:'0 24px 80px rgba(0,0,0,0.8)',overflow:'hidden'}}>
          <div style={{height:2,background:'linear-gradient(90deg,#00c8ff,#7c3aed,#00ff88)'}}/>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'16px 20px',borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:13,color:C.t1}}>{title}</span>
            <button onClick={onClose} style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,
              color:C.t3,cursor:'pointer',width:28,height:28,borderRadius:6,
              display:'flex',alignItems:'center',justifyContent:'center'}}>
              <X size={13}/>
            </button>
          </div>
          <div style={{padding:'20px',maxHeight:'82vh',overflowY:'auto'}}>{children}</div>
        </motion.div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────
//  AVATAR
// ─────────────────────────────────────────────────────────
function UserAvatar({user,size=24}){
  if(!user) return(
    <div style={{width:size,height:size,borderRadius:Math.round(size*0.28),
      background:'rgba(255,255,255,0.08)',border:`1px solid rgba(255,255,255,0.1)`,
      display:'flex',alignItems:'center',justifyContent:'center'}}>
      <User size={Math.round(size*0.5)} color={C.t3}/>
    </div>
  )
  const rc=ROLE_META?.[user.role]||{color:'#00c8ff'}
  return(
    <div title={user.name}
      style={{width:size,height:size,borderRadius:Math.round(size*0.28),flexShrink:0,
        background:`linear-gradient(135deg,${rc.color},${rc.color}88)`,
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:Math.round(size*0.33),fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408'}}>
      {ini?.(user.name)||user.name?.substring(0,2).toUpperCase()||'?'}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  SKELETON
// ─────────────────────────────────────────────────────────
function SkeletonCard(){
  const p={background:`linear-gradient(90deg,${C.border}44 25%,${C.border}99 50%,${C.border}44 75%)`,
    backgroundSize:'200% 100%',animation:'skPulse 1.4s ease infinite',borderRadius:6}
  return(
    <div style={{background:'rgba(255,255,255,0.02)',border:`1px solid rgba(255,255,255,0.06)`,
      borderRadius:11,padding:13,marginBottom:9,borderLeft:`3px solid rgba(255,255,255,0.08)`}}>
      <div style={{...p,width:'80%',height:12,marginBottom:10}}/>
      <div style={{...p,width:'95%',height:10,marginBottom:6}}/>
      <div style={{...p,width:'60%',height:10,marginBottom:12}}/>
      <div style={{display:'flex',gap:6}}>
        <div style={{...p,width:50,height:18}}/>
        <div style={{...p,width:40,height:18}}/>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  FORMULAIRE — FIXES APPLIQUÉS
// ─────────────────────────────────────────────────────────
function TaskForm({task,projects,users,onSave,onClose}){
  const [f,setF]=useState(task||{
    title:'',description:'',project_id:'',status:'todo',
    priority:'medium',assignee_id:'',date_debut:'',due_date:''
  })
  const [err,setErr]=useState({})
  const s=(k,v)=>setF(x=>({...x,[k]:v}))

  const autoStatus=useMemo(()=>computeAutoStatus(f),[f.date_debut,f.due_date,f.status])
  const autoCol=COLS.find(c=>c.id===autoStatus)
  const daysLeft=getDaysLeft(f.due_date)

  const validate=()=>{
    const e={}
    if(!f.title?.trim()||f.title.trim().length<2) e.title='Titre requis (min 2 caractères)'
    // ✅ FIX — project_id obligatoire
    if(!f.project_id) e.project_id='Veuillez sélectionner un projet'
    if(f.date_debut&&f.due_date&&new Date(f.due_date)<new Date(f.date_debut))
      e.dates="L'échéance doit être après la date de début"
    setErr(e)
    return !Object.keys(e).length
  }

  // ✅ FIX — types corrects, pas de onClose avant confirmation backend
  const submit=()=>{
    if(!validate()) return
    onSave({
      ...f,
      project_id:  f.project_id  ? parseInt(f.project_id)  : null,
      assignee_id: f.assignee_id ? parseInt(f.assignee_id) : null,
      date_debut:  f.date_debut  || null,
      due_date:    f.due_date    || null,
      status:      f.date_debut||f.due_date ? autoStatus : f.status,
    })
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>

      {/* Titre */}
      <div>
        <label style={S.label}>Titre *</label>
        <input style={{...S.input,...(err.title?{borderColor:'#ff2d78'}:{})}}
          value={f.title} onChange={e=>{s('title',e.target.value);setErr(x=>({...x,title:''}))}}
          placeholder="Titre de la tâche…"/>
        {err.title&&<p style={{color:'#ff2d78',fontSize:10,marginTop:4}}>{err.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label style={S.label}>Description</label>
        <textarea style={{...S.input,resize:'vertical',minHeight:70,fontFamily:'inherit'}}
          value={f.description||''} onChange={e=>s('description',e.target.value)}
          placeholder="Description détaillée…"/>
      </div>

      {/* Projet * + Priorité */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <label style={S.label}>Projet *</label>
          <select style={{...S.input,background:C.surface,...(err.project_id?{borderColor:'#ff2d78'}:{})}}
            value={f.project_id||''} onChange={e=>{s('project_id',e.target.value);setErr(x=>({...x,project_id:''}))}}>
            <option value="">— Sélectionner un projet —</option>
            {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {err.project_id&&<p style={{color:'#ff2d78',fontSize:10,marginTop:4}}>{err.project_id}</p>}
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

      {/* Dates */}
      <div>
        <label style={{...S.label,display:'flex',alignItems:'center',gap:6}}>
          <Calendar size={11} style={{color:C.cyan}}/>
          Dates — <span style={{color:C.cyan,fontWeight:700}}>Statut calculé automatiquement</span>
        </label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <label style={{...S.label,fontSize:9,color:C.t3}}>Date de début</label>
            <input type="date" style={{...S.input,background:C.surface}}
              value={f.date_debut||''} onChange={e=>{s('date_debut',e.target.value);setErr(x=>({...x,dates:''}))}}/>
          </div>
          <div>
            <label style={{...S.label,fontSize:9,color:C.t3}}>Date d'échéance</label>
            <input type="date" style={{...S.input,background:C.surface,...(err.dates?{borderColor:'#ff2d78'}:{})}}
              value={f.due_date||''} onChange={e=>{s('due_date',e.target.value);setErr(x=>({...x,dates:''}))}}/>
          </div>
        </div>
        {err.dates&&<p style={{color:'#ff2d78',fontSize:10,marginTop:4}}>{err.dates}</p>}
      </div>

      {/* Preview statut auto */}
      {(f.date_debut||f.due_date)&&autoCol&&(
        <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}
          style={{padding:'10px 14px',borderRadius:9,
            background:`${autoCol.color}10`,border:`1px solid ${autoCol.color}30`,
            display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <autoCol.icon size={14} style={{color:autoCol.color,flexShrink:0}}/>
            <div>
              <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                color:C.t3,letterSpacing:'0.1em'}}>STATUT AUTO : </span>
              <span style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:800,
                color:autoCol.color}}>{autoCol.label}</span>
            </div>
          </div>
          {daysLeft!==null&&(
            <span style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',flexShrink:0,
              color:daysLeft<0?'#ff2d78':daysLeft<=2?'#ffce00':C.t3}}>
              {daysLeft<0?`${Math.abs(daysLeft)}j retard`:daysLeft===0?"Aujourd'hui":`${daysLeft}j restants`}
            </span>
          )}
        </motion.div>
      )}

      {/* Assigné + Statut manuel */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <label style={S.label}>Assigné à</label>
          {users.length>0?(
            <select style={{...S.input,background:C.surface}}
              value={f.assignee_id||''} onChange={e=>s('assignee_id',e.target.value)}>
              <option value="">— Non assigné —</option>
              {users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          ):(
            <input style={S.input} value={f.assignee||''}
              onChange={e=>s('assignee',e.target.value)}
              placeholder="Nom de la personne…"/>
          )}
        </div>
        {task&&(
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

      {/* Info auto */}
      <div style={{padding:'10px 12px',background:'rgba(0,200,255,0.04)',
        border:'1px solid rgba(0,200,255,0.15)',borderRadius:8,fontSize:11,color:C.t2,lineHeight:1.6}}>
        <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:9,
          color:C.cyan,display:'block',marginBottom:4}}>⚡ AUTOMATISATION</span>
        date début atteinte → <strong style={{color:'#00c8ff'}}>En cours</strong> •{' '}
        échéance dépassée → <strong style={{color:'#ff2d78'}}>En retard</strong>
      </div>

      {/* Boutons */}
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4,
        paddingTop:14,borderTop:`1px solid ${C.border}`}}>
        <button onClick={onClose} style={S.btnGhost}>Annuler</button>
        <button onClick={submit} style={S.btnCyan}>
          {task?'Mettre à jour':'Créer la tâche'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  CARTE KANBAN
// ─────────────────────────────────────────────────────────
function TaskCard({task,col,canEdit,allUsers,onEdit,onDelete,onQuickDone,onDragStart,onDragEnd}){
  const daysLeft=getDaysLeft(task.due_date)
  const isOverdue=daysLeft!==null&&daysLeft<0
  const isDueSoon=daysLeft!==null&&daysLeft>=0&&daysLeft<=2
  const assignee=useMemo(()=>
    task.assignee_id?allUsers.find(u=>String(u.id)===String(task.assignee_id)):
    task.assignee?allUsers.find(u=>u.name===task.assignee)||{name:task.assignee}:null
  ,[task.assignee_id,task.assignee,allUsers])

  return(
    <motion.div layout draggable={canEdit}
      onDragStart={e=>onDragStart(e,task)} onDragEnd={onDragEnd}
      initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.95}}
      whileHover={{y:-2,boxShadow:`0 8px 24px rgba(0,0,0,0.4),0 0 0 1px ${col.color}22`}}
      style={{background:'rgba(255,255,255,0.03)',border:`1px solid rgba(255,255,255,0.07)`,
        borderRadius:11,padding:13,marginBottom:9,cursor:canEdit?'grab':'default',
        borderLeft:`3px solid ${PC[task.priority]||C.t3}`,
        transition:'box-shadow 0.2s',position:'relative'}}>

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:8}}>
        <p style={{fontSize:12,fontFamily:'Orbitron,sans-serif',fontWeight:700,
          color:C.t1,lineHeight:1.3,flex:1}}>{task.title}</p>
        {canEdit&&(
          <div style={{display:'flex',gap:2,flexShrink:0}}>
            {task.status!=='done'&&(
              <button onClick={e=>{e.stopPropagation();onQuickDone(task.id)}}
                style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:3,borderRadius:4,display:'flex'}}
                onMouseEnter={e=>e.currentTarget.style.color='#00ff88'}
                onMouseLeave={e=>e.currentTarget.style.color=C.t3}>
                <CheckCircle2 size={11}/>
              </button>
            )}
            <button onClick={()=>onEdit(task)}
              style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:3,borderRadius:4,display:'flex'}}
              onMouseEnter={e=>e.currentTarget.style.color=C.cyan}
              onMouseLeave={e=>e.currentTarget.style.color=C.t3}>
              <Edit size={11}/>
            </button>
            <button onClick={()=>onDelete(task.id)}
              style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:3,borderRadius:4,display:'flex'}}
              onMouseEnter={e=>e.currentTarget.style.color='#ff2d78'}
              onMouseLeave={e=>e.currentTarget.style.color=C.t3}>
              <Trash2 size={11}/>
            </button>
          </div>
        )}
      </div>

      {task.description&&(
        <p style={{fontSize:11,color:C.t3,marginBottom:8,lineHeight:1.5,
          display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
          {task.description}
        </p>
      )}

      <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap',marginBottom:8}}>
        <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
          padding:'2px 7px',borderRadius:5,
          background:`${PC[task.priority]||C.t2}15`,color:PC[task.priority]||C.t2,
          border:`1px solid ${PC[task.priority]||C.t2}28`}}>
          {(task.priority||'').toUpperCase()}
        </span>
        {task.project&&(
          <span style={{fontSize:9,color:C.t3,maxWidth:80,overflow:'hidden',
            textOverflow:'ellipsis',whiteSpace:'nowrap',
            padding:'2px 5px',borderRadius:4,background:'rgba(255,255,255,0.04)',
            border:`1px solid ${C.border}`}}>
            {task.project}
          </span>
        )}
      </div>

      {(assignee||task.due_date)&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          paddingTop:8,borderTop:`1px solid rgba(255,255,255,0.05)`}}>
          {assignee?(
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <UserAvatar user={assignee} size={20}/>
              <span style={{fontSize:10,color:C.t2,overflow:'hidden',
                textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:80}}>
                {assignee.name}
              </span>
            </div>
          ):<span/>}
          {task.due_date&&(
            <div style={{display:'flex',alignItems:'center',gap:4,padding:'2px 7px',borderRadius:5,
              background:isOverdue?'rgba(255,45,120,0.1)':isDueSoon?'rgba(255,206,0,0.08)':'transparent',
              border:isOverdue?'1px solid rgba(255,45,120,0.2)':isDueSoon?'1px solid rgba(255,206,0,0.2)':'none'}}>
              <Clock size={9} style={{color:isOverdue?'#ff2d78':isDueSoon?'#ffce00':C.t3}}/>
              <span style={{fontSize:9,fontFamily:'JetBrains Mono,monospace',
                color:isOverdue?'#ff2d78':isDueSoon?'#ffce00':C.t3}}>
                {isOverdue?`${Math.abs(daysLeft)}j retard`:daysLeft===0?"Aujourd'hui":daysLeft===1?'Demain':`${daysLeft}j`}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
//  LIGNE LISTE
// ─────────────────────────────────────────────────────────
function TaskRow({task,canEdit,allUsers,onEdit,onDelete,onQuickDone}){
  const daysLeft=getDaysLeft(task.due_date)
  const isOverdue=daysLeft!==null&&daysLeft<0
  const isDueSoon=daysLeft!==null&&daysLeft>=0&&daysLeft<=2
  const col=COLS.find(c=>c.id===task.status)||COLS[0]
  const assignee=useMemo(()=>
    task.assignee_id?allUsers.find(u=>String(u.id)===String(task.assignee_id)):
    task.assignee?allUsers.find(u=>u.name===task.assignee)||{name:task.assignee}:null
  ,[task.assignee_id,task.assignee,allUsers])

  return(
    <motion.div layout initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} exit={{opacity:0}}
      style={{display:'flex',alignItems:'center',gap:12,padding:'11px 16px',
        background:'rgba(255,255,255,0.02)',border:`1px solid rgba(255,255,255,0.07)`,
        borderRadius:11,borderLeft:`3px solid ${PC[task.priority]||C.t3}`,transition:'all 0.15s'}}
      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
      onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}>

      <div style={{width:8,height:8,borderRadius:'50%',background:col.color,flexShrink:0,boxShadow:`0 0 6px ${col.color}`}}/>

      <div style={{flex:2,minWidth:0}}>
        <p style={{fontSize:12,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t1,
          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{task.title}</p>
        {task.description&&(
          <p style={{fontSize:10,color:C.t3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:2}}>
            {task.description}
          </p>
        )}
      </div>

      {task.project&&(
        <span style={{fontSize:9,padding:'2px 8px',borderRadius:5,fontFamily:'Orbitron,sans-serif',
          background:'rgba(255,255,255,0.04)',color:C.t3,border:`1px solid ${C.border}`,
          whiteSpace:'nowrap',flexShrink:0}}>
          {task.project}
        </span>
      )}

      <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
        padding:'2px 8px',borderRadius:5,flexShrink:0,
        background:`${PC[task.priority]||C.t2}14`,color:PC[task.priority]||C.t2,
        border:`1px solid ${PC[task.priority]||C.t2}26`}}>
        {(task.priority||'').toUpperCase()}
      </span>

      <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
        padding:'2px 8px',borderRadius:5,flexShrink:0,
        background:`${col.color}12`,color:col.color,border:`1px solid ${col.color}28`}}>
        {col.label}
      </span>

      {assignee?(
        <div style={{display:'flex',alignItems:'center',gap:5,flexShrink:0}}>
          <UserAvatar user={assignee} size={20}/>
          <span style={{fontSize:10,color:C.t2}}>{assignee.name}</span>
        </div>
      ):<span style={{width:80}}/>}

      {task.due_date?(
        <span style={{fontSize:9,fontFamily:'JetBrains Mono,monospace',flexShrink:0,
          color:isOverdue?'#ff2d78':isDueSoon?'#ffce00':C.t3}}>
          {isOverdue?`${Math.abs(daysLeft)}j retard`:daysLeft===0?"Aujourd'hui":daysLeft===1?'Demain':`${daysLeft}j`}
        </span>
      ):<span style={{width:50}}/>}

      {canEdit&&(
        <div style={{display:'flex',gap:3,flexShrink:0}}>
          {task.status!=='done'&&(
            <button onClick={()=>onQuickDone(task.id)}
              style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:4,borderRadius:4,display:'flex'}}
              onMouseEnter={e=>e.currentTarget.style.color='#00ff88'}
              onMouseLeave={e=>e.currentTarget.style.color=C.t3}>
              <CheckCircle2 size={12}/>
            </button>
          )}
          <button onClick={()=>onEdit(task)}
            style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:4,borderRadius:4,display:'flex'}}
            onMouseEnter={e=>e.currentTarget.style.color=C.cyan}
            onMouseLeave={e=>e.currentTarget.style.color=C.t3}>
            <Edit size={12}/>
          </button>
          <button onClick={()=>onDelete(task.id)}
            style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:4,borderRadius:4,display:'flex'}}
            onMouseEnter={e=>e.currentTarget.style.color='#ff2d78'}
            onMouseLeave={e=>e.currentTarget.style.color=C.t3}>
            <Trash2 size={12}/>
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
//  PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────
export default function Tasks(){
  const {getTasks,addTask,updateTask,deleteTask,moveTask,getProjects,showToast}=useApp()
  const {can}=useAuth()
  const {confirm,Dialog}=useConfirm()

  const [tasks,         setTasks]         = useState([])
  const [projects,      setProjects]      = useState([])
  const [users,         setUsers]         = useState([])
  const [modal,         setModal]         = useState(null)
  const [dragging,      setDragging]      = useState(null)
  const [overCol,       setOverCol]       = useState(null)
  const [busy,          setBusy]          = useState(true)
  const [search,        setSearch]        = useState('')
  const [filterPriority,setFilterPriority]= useState('all')
  const [filterProject, setFilterProject] = useState('all')
  const [filterAssignee,setFilterAssignee]= useState('all')
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [showFilters,   setShowFilters]   = useState(false)
  const [view,          setView]          = useState('kanban')

  const canEdit=can('tasks')

  // ── Chargement ────────────────────────────────────────
  const load=useCallback(async()=>{
    setBusy(true)
    try{
      const [t,p]=await Promise.all([getTasks(),getProjects()])
      const enriched=(t||[]).map(task=>({
        ...task,
        status:computeAutoStatus(task),
        project:p?.find(proj=>String(proj.id)===String(task.project_id))?.name||task.project||'',
      }))
      setTasks(enriched)
      setProjects(p||[])
      try{
        const {api}=await import('../services/api.js')
        const res=await api.get('/users')
        if(res?.success) setUsers(res.data||[])
      }catch{}
    }catch(e){
      showToast(e?.message||'Impossible de contacter le serveur.','danger')
    }finally{setBusy(false)}
  },[getTasks,getProjects,showToast])

  useEffect(()=>{load()},[load])

  // ── Stats ────────────────────────────────────────────
  const stats=useMemo(()=>({
    total:     tasks.length,
    todo:      tasks.filter(t=>t.status==='todo').length,
    inprogress:tasks.filter(t=>t.status==='inprogress').length,
    overdue:   tasks.filter(t=>t.status==='overdue').length,
    done:      tasks.filter(t=>t.status==='done').length,
  }),[tasks])

  // ── Filtres ──────────────────────────────────────────
  const filteredTasks=useMemo(()=>tasks.filter(t=>{
    const mSearch=!search||
      t.title?.toLowerCase().includes(search.toLowerCase())||
      t.description?.toLowerCase().includes(search.toLowerCase())
    const mPrio    =filterPriority==='all'||t.priority===filterPriority
    const mProject =filterProject==='all'||String(t.project_id)===filterProject
    const mStatus  =filterStatus==='all'||t.status===filterStatus
    const mAssignee=filterAssignee==='all'||
      String(t.assignee_id)===filterAssignee||
      t.assignee===users.find(u=>String(u.id)===filterAssignee)?.name
    return mSearch&&mPrio&&mProject&&mStatus&&mAssignee
  }),[tasks,search,filterPriority,filterProject,filterStatus,filterAssignee,users])

  const hasActiveFilter=search||filterPriority!=='all'||filterProject!=='all'||
    filterAssignee!=='all'||filterStatus!=='all'

  const clearFilters=()=>{
    setSearch('');setFilterPriority('all');setFilterProject('all')
    setFilterAssignee('all');setFilterStatus('all')
  }

  // ── CRUD ─────────────────────────────────────────────
  const handleSave=async data=>{
    try{
      if(modal.type==='add'){
        const res=await addTask(data)
        if(!res?.success){
          const msg=res?.message||
            Object.values(res?.errors||{}).flat().join(' | ')||
            'Erreur création'
          showToast(msg,'danger')
          return
        }
        // ✅ FIX — res.data peut être array ou object
        if(Array.isArray(res.data)){
          setTasks(res.data.map(t=>({
            ...t,
            status:computeAutoStatus(t),
            project:projects.find(p=>String(p.id)===String(t.project_id))?.name||t.project||''
          })))
        }else{
          const newTask=res.data||res.task||res
          setTasks(prev=>[...prev,{
            ...newTask,
            status:computeAutoStatus(newTask),
            project:projects.find(p=>String(p.id)===String(newTask.project_id))?.name||''
          }])
        }
        showToast('Tâche créée !','success')
        setModal(null)
        load()
      }else{
        const res=await updateTask(modal.task.id,data)
        if(!res?.success){
          const msg=res?.message||
            Object.values(res?.errors||{}).flat().join(' | ')||
            'Erreur mise à jour'
          showToast(msg,'danger')
          return
        }
        const updated=res.data||res.task||{...modal.task,...data}
        setTasks(prev=>prev.map(t=>t.id===modal.task.id?{
          ...updated,
          status:computeAutoStatus(updated),
          project:projects.find(p=>String(p.id)===String(updated.project_id))?.name||t.project
        }:t))
        showToast('Tâche mise à jour !','success')
        setModal(null)
        load()
      }
    }catch(e){
      showToast(e?.message||'Erreur lors de la sauvegarde','danger')
      load()
    }
  }

  const handleDelete=async id=>{
    const ok=await confirm('Supprimer cette tâche définitivement ?')
    if(!ok) return
    setTasks(prev=>prev.filter(t=>t.id!==id))
    try{
      await deleteTask(id)
      showToast('Tâche supprimée','success')
    }catch(e){
      showToast(e?.message||'Erreur suppression','danger')
      load()
    }
  }

  const handleQuickDone=async id=>{
    setTasks(prev=>prev.map(t=>t.id===id?{...t,status:'done'}:t))
    try{
      await moveTask(id,'done')
      showToast('Tâche terminée ✅','success')
    }catch(e){
      showToast(e?.message||'Erreur','danger')
      load()
    }
  }

  // ── Drag & Drop ──────────────────────────────────────
  const onDragStart=(e,task)=>{setDragging(task);e.dataTransfer.setData('taskId',String(task.id));e.currentTarget.style.opacity='0.4'}
  const onDragEnd=e=>{setDragging(null);setOverCol(null);e.currentTarget.style.opacity='1'}
  const onDragOver=(e,colId)=>{e.preventDefault();setOverCol(colId)}
  const onDrop=async(e,colId)=>{
    e.preventDefault();setOverCol(null)
    const id=Number(e.dataTransfer.getData('taskId'))
    const task=tasks.find(t=>t.id===id)
    if(!task||task.status===colId) return
    setTasks(prev=>prev.map(t=>t.id===id?{...t,status:colId}:t))
    try{
      await moveTask(id,colId)
      showToast(`Déplacée → "${COLS.find(c=>c.id===colId)?.label}"`, 'success')
    }catch(e){
      showToast(e?.message||'Erreur déplacement','danger')
      load()
    }
  }

  // ─────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────
  return(
    <div>
      <style>{`
        @keyframes skPulse{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
      {Dialog}

      {/* En-tête */}
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:16}}>
          <div>
            <h1 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:24,
              background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:4}}>TÂCHES</h1>
            <p style={{color:C.t2,fontSize:13}}>
              {stats.total} tâche{stats.total>1?'s':''}{' '}
              {stats.overdue>0&&<>• <span style={{color:'#ff2d78'}}>{stats.overdue} en retard</span></>}
              {canEdit&&<span style={{color:C.t3}}> — Glissez-déposez entre colonnes</span>}
            </p>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={load} style={{...S.btnGhost,padding:'8px 12px'}} title="Rafraîchir"><RefreshCw size={13}/></button>
            <div style={{display:'flex',gap:2,padding:3,borderRadius:8,background:'rgba(255,255,255,0.03)',border:`1px solid ${C.border}`}}>
              {[{id:'kanban',Icon:LayoutGrid},{id:'list',Icon:List}].map(({id,Icon})=>(
                <button key={id} onClick={()=>setView(id)}
                  style={{padding:'5px 8px',borderRadius:6,border:'none',cursor:'pointer',
                    background:view===id?C.cyan:'transparent',color:view===id?'#020408':C.t3,
                    display:'flex',alignItems:'center',transition:'all 0.15s'}}>
                  <Icon size={13}/>
                </button>
              ))}
            </div>
            {canEdit&&(
              <button onClick={()=>setModal({type:'add'})} style={S.btnCyan}>
                <Plus size={13}/> Nouvelle tâche
              </button>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[
            {label:'À faire',   value:stats.todo,       color:'#ffce00',icon:Circle,        id:'todo'},
            {label:'En cours',  value:stats.inprogress, color:'#00c8ff',icon:PlayCircle,    id:'inprogress'},
            {label:'En retard', value:stats.overdue,    color:'#ff2d78',icon:AlertTriangle, id:'overdue'},
            {label:'Terminées', value:stats.done,       color:'#00ff88',icon:CheckCircle2,  id:'done'},
          ].map(({label,value,color,icon:Icon,id})=>{
            const active=filterStatus===id
            return(
              <motion.div key={id} whileHover={{y:-2}} onClick={()=>setFilterStatus(active?'all':id)}
                style={{background:active?`${color}15`:`${color}08`,border:`1px solid ${active?color:color+'20'}`,
                  borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,
                  cursor:'pointer',transition:'all 0.2s',position:'relative',
                  boxShadow:active?`0 0 20px ${color}20`:undefined}}>
                <Icon size={18} style={{color,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:18,color}}>{value}</div>
                  <div style={{fontSize:9,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{label.toUpperCase()}</div>
                </div>
                {active&&<Check size={12} style={{color,flexShrink:0}}/>}
                {stats.total>0&&(
                  <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,overflow:'hidden',borderRadius:'0 0 10px 10px'}}>
                    <motion.div initial={{width:0}} animate={{width:`${(value/stats.total)*100}%`}}
                      transition={{duration:0.8,delay:0.2}}
                      style={{height:'100%',background:color,borderRadius:10}}/>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Recherche + filtres */}
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:8}}>
          <div style={{position:'relative',flex:1,minWidth:200}}>
            <Search size={13} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:C.t3}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher une tâche…" style={{...S.input,paddingLeft:34}}/>
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
              borderColor:showFilters||hasActiveFilter?C.cyan:undefined,
              color:showFilters||hasActiveFilter?C.cyan:undefined}}>
            <Filter size={13}/> Filtres
            {hasActiveFilter&&<span style={{width:7,height:7,borderRadius:'50%',background:C.cyan}}/>}
          </button>
          {hasActiveFilter&&(
            <button onClick={clearFilters} style={{...S.btnGhost,display:'flex',alignItems:'center',gap:5,fontSize:11}}>
              <X size={11}/> Effacer
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters&&(
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              style={{overflow:'hidden',marginBottom:8}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,
                padding:14,background:'rgba(0,200,255,0.03)',border:`1px solid rgba(0,200,255,0.12)`,borderRadius:10}}>
                <div>
                  <label style={S.label}>Priorité</label>
                  <select style={{...S.input,background:C.surface}} value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}>
                    <option value="all">Toutes</option>
                    <option value="urgent">🔴 Urgente</option>
                    <option value="high">🔥 Haute</option>
                    <option value="medium">🔶 Moyenne</option>
                    <option value="low">🔵 Faible</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Projet</label>
                  <select style={{...S.input,background:C.surface}} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
                    <option value="all">Tous</option>
                    {projects.map(p=><option key={p.id} value={String(p.id)}>{p.name}</option>)}
                  </select>
                </div>
                {users.length>0&&(
                  <div>
                    <label style={S.label}>Assigné à</label>
                    <select style={{...S.input,background:C.surface}} value={filterAssignee} onChange={e=>setFilterAssignee(e.target.value)}>
                      <option value="all">Tous</option>
                      {users.map(u=><option key={u.id} value={String(u.id)}>{u.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label style={S.label}>Statut</label>
                  <select style={{...S.input,background:C.surface}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                    <option value="all">Tous</option>
                    <option value="todo">📋 À faire</option>
                    <option value="inprogress">⚡ En cours</option>
                    <option value="overdue">🚨 En retard</option>
                    <option value="done">✅ Terminé</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasActiveFilter&&(
          <p style={{fontSize:11,color:C.t3,marginBottom:4}}>
            <span style={{color:C.cyan,fontWeight:700}}>{filteredTasks.length}</span>
            {' '}tâche{filteredTasks.length>1?'s':''} sur {stats.total}
          </p>
        )}
      </div>

      {/* KANBAN */}
      {view==='kanban'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {COLS.map(col=>{
            const colTasks=filteredTasks.filter(t=>t.status===col.id)
            const isOver=overCol===col.id&&dragging?.status!==col.id
            return(
              <div key={col.id}
                onDragOver={e=>onDragOver(e,col.id)}
                onDragLeave={()=>setOverCol(null)}
                onDrop={e=>onDrop(e,col.id)}
                style={{background:isOver?`${col.color}07`:'rgba(255,255,255,0.015)',
                  border:`1px solid ${isOver?col.color:'rgba(255,255,255,0.06)'}`,
                  borderTop:`3px solid ${col.color}`,borderRadius:12,padding:14,minHeight:480,
                  transition:'all 0.2s',boxShadow:isOver?`0 0 24px ${col.color}20`:undefined}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <col.icon size={14} style={{color:col.color}}/>
                    <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:10,
                      letterSpacing:'0.08em',color:col.color}}>{col.label}</span>
                    <motion.span key={colTasks.length} initial={{scale:1.3}} animate={{scale:1}}
                      style={{width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',
                        justifyContent:'center',fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:800,
                        background:`${col.color}18`,color:col.color}}>
                      {colTasks.length}
                    </motion.span>
                  </div>
                  {canEdit&&(
                    <button onClick={()=>setModal({type:'add'})}
                      style={{background:'none',border:`1px solid ${C.border}`,borderRadius:5,
                        color:C.t3,cursor:'pointer',width:22,height:22,display:'flex',
                        alignItems:'center',justifyContent:'center',fontSize:14,transition:'all 0.15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=col.color;e.currentTarget.style.color=col.color}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.t3}}>
                      +
                    </button>
                  )}
                </div>
                <div>
                  {busy?Array.from({length:2}).map((_,i)=><SkeletonCard key={i}/>):(
                    <AnimatePresence>
                      {colTasks.map(t=>(
                        <TaskCard key={t.id} task={t} col={col} canEdit={canEdit} allUsers={users}
                          onEdit={task=>setModal({type:'edit',task})}
                          onDelete={handleDelete} onQuickDone={handleQuickDone}
                          onDragStart={onDragStart} onDragEnd={onDragEnd}/>
                      ))}
                    </AnimatePresence>
                  )}
                  {!busy&&colTasks.length===0&&(
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',
                      justifyContent:'center',height:120,borderRadius:9,
                      border:`2px dashed ${isOver?col.color:col.color+'18'}`,
                      fontSize:10,color:isOver?col.color:C.t3,
                      fontFamily:'Orbitron,sans-serif',fontWeight:700,transition:'all 0.2s',gap:6}}>
                      {isOver?<><col.icon size={16}/> DÉPOSER ICI</>:'Aucune tâche'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LISTE */}
      {view==='list'&&(
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <div style={{display:'grid',gridTemplateColumns:'8px 2fr 100px 80px 80px 100px 50px auto',
            gap:12,padding:'8px 16px',fontSize:9,fontFamily:'Orbitron,sans-serif',
            fontWeight:700,color:C.t3,letterSpacing:'0.1em'}}>
            <span/><span>TÂCHE</span><span>PROJET</span><span>PRIORITÉ</span>
            <span>STATUT</span><span>ASSIGNÉ</span><span>ÉCHÉANCE</span>
            {canEdit&&<span>ACTIONS</span>}
          </div>
          {busy?Array.from({length:6}).map((_,i)=>(
            <div key={i} style={{height:54,background:'rgba(255,255,255,0.02)',
              border:`1px solid rgba(255,255,255,0.06)`,borderRadius:11,
              animation:'skPulse 1.4s ease infinite',
              backgroundImage:`linear-gradient(90deg,${C.border}44 25%,${C.border}99 50%,${C.border}44 75%)`,
              backgroundSize:'200% 100%'}}/>
          )):(
            <AnimatePresence>
              {filteredTasks.length===0?(
                <Empty icon={CheckSquare}
                  msg={hasActiveFilter?'Aucune tâche ne correspond':'Aucune tâche'}
                  sub={hasActiveFilter?'Modifiez vos filtres':'Créez votre première tâche'}/>
              ):(
                filteredTasks.map((t,i)=>(
                  <motion.div key={t.id} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.02}}>
                    <TaskRow task={t} canEdit={canEdit} allUsers={users}
                      onEdit={task=>setModal({type:'edit',task})}
                      onDelete={handleDelete} onQuickDone={handleQuickDone}/>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          )}
          {!busy&&filteredTasks.length>0&&(
            <div style={{display:'flex',gap:16,padding:'10px 16px',borderTop:`1px solid ${C.border}`,marginTop:4,flexWrap:'wrap'}}>
              {COLS.map(col=>{
                const count=filteredTasks.filter(t=>t.status===col.id).length
                if(!count) return null
                return(
                  <span key={col.id} style={{fontSize:10,fontFamily:'Orbitron,sans-serif',
                    display:'flex',alignItems:'center',gap:5,color:C.t3}}>
                    <span style={{color:col.color,fontWeight:700}}>{count}</span> {col.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal&&(
          <MShell title={modal.type==='add'?'NOUVELLE TÂCHE':'MODIFIER LA TÂCHE'}
            onClose={()=>setModal(null)} wide>
            <TaskForm task={modal.task} projects={projects} users={users}
              onSave={handleSave} onClose={()=>setModal(null)}/>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}
