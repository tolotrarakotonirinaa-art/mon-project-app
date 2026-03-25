import React,{useState,useEffect} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {CheckSquare,Plus,Trash2,Edit,AlertCircle} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {Empty,Loader} from '../components/ui/UI.jsx'
import {C,S} from '../styles.js'

const COLS=[
  {id:'todo',       label:'À FAIRE',  color:'#ffce00', emoji:'📋'},
  {id:'inprogress', label:'EN COURS', color:'#00c8ff', emoji:'⚡'},
  {id:'done',       label:'TERMINÉ',  color:'#00ff88', emoji:'✅'},
]
const PC={high:'#ff2d78',urgent:'#ff0000',medium:'#ffce00',low:'#7ab0d4'}

function MShell({title,onClose,children}){
  return(
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',zIndex:900}} onClick={onClose}/>
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:901,padding:20}}>
        <motion.div initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9}} transition={{type:'spring',damping:25,stiffness:300}}
          style={{width:'100%',maxWidth:490,...S.panel({padding:0})}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 20px',borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:13,color:C.t1}}>{title}</span>
            <button onClick={onClose} style={{background:'none',border:'none',color:C.t3,cursor:'pointer',fontSize:20,lineHeight:1}}>×</button>
          </div>
          <div style={{padding:'18px 20px'}}>{children}</div>
        </motion.div>
      </div>
    </>
  )
}

function TaskForm({task,projects,onSave,onClose}){
  const [f,setF]=useState(task||{title:'',description:'',project:projects[0]?.name||'',status:'todo',priority:'medium',assignee:'',due_date:''})
  const s=(k,v)=>setF(x=>({...x,[k]:v}))
  return(
    <div style={{display:'flex',flexDirection:'column',gap:13}}>
      <div>
        <label style={S.label}>Titre *</label>
        <input style={S.input} value={f.title} onChange={e=>s('title',e.target.value)} placeholder="Titre de la tâche"/>
      </div>
      <div>
        <label style={S.label}>Description</label>
        <textarea style={{...S.input,resize:'none',height:60}} value={f.description||''} onChange={e=>s('description',e.target.value)} placeholder="Description optionnelle..."/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <label style={S.label}>Projet</label>
          <select style={{...S.input,background:C.surface}} value={f.project} onChange={e=>s('project',e.target.value)}>
            {projects.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
            {!projects.length&&<option value="">Aucun projet</option>}
          </select>
        </div>
        <div>
          <label style={S.label}>Priorité</label>
          <select style={{...S.input,background:C.surface}} value={f.priority} onChange={e=>s('priority',e.target.value)}>
            <option value="urgent">🔴 Urgente</option>
            <option value="high">🟠 Haute</option>
            <option value="medium">🟡 Moyenne</option>
            <option value="low">🔵 Faible</option>
          </select>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <label style={S.label}>Assigné à (initiales)</label>
          <input style={S.input} value={f.assignee||''} onChange={e=>s('assignee',e.target.value)} placeholder="Ex: JD"/>
        </div>
        <div>
          <label style={S.label}>Échéance</label>
          <input type="date" style={{...S.input,background:C.surface}} value={f.due_date||''} onChange={e=>s('due_date',e.target.value)}/>
        </div>
      </div>
      {task&&(
        <div>
          <label style={S.label}>Statut</label>
          <select style={{...S.input,background:C.surface}} value={f.status} onChange={e=>s('status',e.target.value)}>
            <option value="todo">À faire</option>
            <option value="inprogress">En cours</option>
            <option value="done">Terminé</option>
          </select>
        </div>
      )}
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
        <button onClick={onClose} style={S.btnGhost}>Annuler</button>
        <button onClick={()=>{if(!f.title.trim())return;onSave(f);onClose()}} style={S.btnCyan}>
          {task?'Mettre à jour':'Créer la tâche'}
        </button>
      </div>
    </div>
  )
}

export default function Tasks(){
  const {getTasks,addTask,updateTask,deleteTask,moveTask,getProjects,showToast}=useApp()
  const {can}=useAuth()
  const [tasks,setTasks]     = useState([])
  const [projects,setProjects]= useState([])
  const [modal,setModal]     = useState(null)
  const [dragging,setDragging]= useState(null)
  const [overCol,setOverCol]  = useState(null)
  const [busy,setBusy]       = useState(true)
  const canEdit = can('tasks')

  const load=async()=>{
    setBusy(true)
    try{
      const [t,p]=await Promise.all([getTasks(),getProjects()])
      setTasks(t||[]); setProjects(p||[])
    }catch{ showToast('Impossible de contacter le serveur. Vérifiez que php artisan serve est lancé.','danger') }
    finally{ setBusy(false) }
  }
  useEffect(()=>{ load() },[])

  const handleSave=async data=>{
    if(modal.type==='add') await addTask(data)
    else await updateTask(modal.task.id,data)
    showToast(modal.type==='add'?'Tâche créée !':'Tâche mise à jour !','success')
    load()
  }
  const handleDelete=async id=>{
    if(!confirm('Supprimer cette tâche ?')) return
    await deleteTask(id)
    showToast('Tâche supprimée','success')
    load()
  }

  // Drag & Drop
  const onDragStart=(e,task)=>{ setDragging(task); e.dataTransfer.setData('taskId',String(task.id)); e.currentTarget.style.opacity='0.4' }
  const onDragEnd  =e=>{ setDragging(null); setOverCol(null); e.currentTarget.style.opacity='1' }
  const onDragOver =(e,colId)=>{ e.preventDefault(); setOverCol(colId) }
  const onDrop     =async(e,colId)=>{
    e.preventDefault(); setOverCol(null)
    const id=Number(e.dataTransfer.getData('taskId'))
    const task=tasks.find(t=>t.id===id)
    if(!task||task.status===colId) return
    await moveTask(id,colId)
    showToast(`Tâche déplacée vers "${COLS.find(c=>c.id===colId)?.label}"`, 'success')
    load()
  }

  if(busy) return <Loader/>

  return(
    <div>
      {/* En-tête */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:24}}>
        <div>
          <h1 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:24,background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
            TÂCHES
          </h1>
          <p style={{color:C.t2,fontSize:13,marginTop:4}}>
            {tasks.length} tâche{tasks.length>1?'s':''} · {canEdit?'Glissez-déposez entre colonnes':'Vue lecture seule'}
          </p>
        </div>
        {canEdit&&(
          <button onClick={()=>setModal({type:'add'})} style={S.btnCyan}><Plus size={13}/> Nouvelle tâche</button>
        )}
      </div>

      {/* Kanban */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {COLS.map(col=>{
          const colTasks=tasks.filter(t=>t.status===col.id)
          const isOver=overCol===col.id&&dragging?.status!==col.id
          return(
            <div key={col.id}
              onDragOver={e=>onDragOver(e,col.id)}
              onDragLeave={()=>setOverCol(null)}
              onDrop={e=>onDrop(e,col.id)}
              style={{...S.panel({padding:16,minHeight:500,borderTopWidth:2,borderTopColor:col.color,transition:'all 0.2s',boxShadow:isOver?`0 0 20px ${col.color}30,inset 0 0 0 2px ${col.color}30`:undefined})}}
            >
              {/* En-tête colonne */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span>{col.emoji}</span>
                  <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:11,letterSpacing:'0.08em',color:col.color}}>{col.label}</span>
                  <span style={{width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,background:`${col.color}15`,color:col.color}}>
                    {colTasks.length}
                  </span>
                </div>
                {canEdit&&(
                  <button onClick={()=>setModal({type:'add'})}
                    style={{background:'none',border:`1px solid ${C.border}`,borderRadius:6,color:C.t3,cursor:'pointer',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,transition:'all 0.15s'}}>+</button>
                )}
              </div>

              {/* Cartes tâches */}
              <div>
                {colTasks.map(t=>(
                  <motion.div key={t.id} layout
                    draggable={canEdit}
                    onDragStart={e=>onDragStart(e,t)}
                    onDragEnd={onDragEnd}
                    style={{...S.panel({padding:13,marginBottom:9,cursor:canEdit?'grab':'default'})}}>
                    <div style={{display:'flex',alignItems:'flex-start',gap:9}}>
                      <div style={{flex:1,minWidth:0}}>
                        {/* Titre */}
                        <p style={{fontSize:12,fontFamily:'Orbitron,sans-serif',fontWeight:600,color:C.t1,marginBottom:7,lineHeight:1.3}}>{t.title}</p>
                        {/* Description */}
                        {t.description&&<p style={{fontSize:11,color:C.t3,marginBottom:7,lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{t.description}</p>}
                        {/* Badges */}
                        <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                          <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'2px 7px',borderRadius:5,background:`${PC[t.priority]||C.t2}15`,color:PC[t.priority]||C.t2,border:`1px solid ${PC[t.priority]||C.t2}28`}}>
                            {(t.priority||'').toUpperCase()}
                          </span>
                          <span style={{fontSize:10,color:C.t3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.project}</span>
                        </div>
                        {/* Assigné + date */}
                        {(t.assignee||t.due_date)&&(
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8}}>
                            {t.assignee&&(
                              <div style={{display:'flex',alignItems:'center',gap:5}}>
                                <div style={{width:18,height:18,borderRadius:4,background:'linear-gradient(135deg,#00c8ff,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408'}}>
                                  {t.assignee}
                                </div>
                                <span style={{fontSize:10,color:C.t3}}>{t.assignee}</span>
                              </div>
                            )}
                            {t.due_date&&(
                              <span style={{fontSize:9,color:new Date(t.due_date)<new Date()?C.nova:C.t3,fontFamily:'JetBrains Mono,monospace'}}>
                                {new Date(t.due_date)<new Date()&&<AlertCircle size={9} style={{display:'inline',marginRight:3}}/>}
                                {t.due_date}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Actions */}
                      {canEdit&&(
                        <div style={{display:'flex',flexDirection:'column',gap:3,flexShrink:0}}>
                          <button onClick={()=>setModal({type:'edit',task:t})} style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:2,borderRadius:4,transition:'color 0.15s'}}><Edit size={10}/></button>
                          <button onClick={()=>handleDelete(t.id)} style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:2,borderRadius:4,transition:'color 0.15s'}}><Trash2 size={10}/></button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Zone de dépôt vide */}
                {colTasks.length===0&&(
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:100,borderRadius:9,border:`2px dashed ${isOver?col.color:col.color+'20'}`,fontSize:10,color:isOver?col.color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700,transition:'all 0.2s'}}>
                    {isOver?'RELÂCHER ICI':'DÉPOSEZ ICI'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal&&(
          <MShell title={modal.type==='add'?'NOUVELLE TÂCHE':'MODIFIER LA TÂCHE'} onClose={()=>setModal(null)}>
            <TaskForm task={modal.task} projects={projects} onSave={handleSave} onClose={()=>setModal(null)}/>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}
