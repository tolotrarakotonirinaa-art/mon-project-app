import React,{useState,useEffect} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {FolderGit2,Plus,Trash2,Edit,Users,Calendar,Search} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {StatusBadge,Progress,PanelHeader,Empty,Loader} from '../components/ui/UI.jsx'
import {C,S} from '../styles.js'

const COLORS=['#00c8ff','#7c3aed','#00ff88','#ff6b35','#ff2d78','#ffce00']

function MShell({title,onClose,children}){
  return(
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',zIndex:900}} onClick={onClose}/>
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:901,padding:20}}>
        <motion.div initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9}} transition={{type:'spring',damping:25,stiffness:300}}
          style={{width:'100%',maxWidth:500,...S.panel({padding:0})}}>
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

function ProjectForm({project,onSave,onClose}){
  const [f,setF]=useState(project||{name:'',description:'',status:'active',color:COLORS[0],end_date:''})
  const s=(k,v)=>setF(x=>({...x,[k]:v}))
  return(
    <div style={{display:'flex',flexDirection:'column',gap:13}}>
      <div><label style={S.label}>Nom du projet *</label>
        <input style={S.input} value={f.name} onChange={e=>s('name',e.target.value)} placeholder="Ex: Site E-commerce"/>
      </div>
      <div><label style={S.label}>Description</label>
        <textarea style={{...S.input,resize:'none',height:72}} value={f.description} onChange={e=>s('description',e.target.value)} placeholder="Description du projet..."/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><label style={S.label}>Statut</label>
          <select style={{...S.input,background:C.surface}} value={f.status} onChange={e=>s('status',e.target.value)}>
            <option value="active">Actif</option>
            <option value="pending">En attente</option>
            <option value="completed">Terminé</option>
          </select>
        </div>
        <div><label style={S.label}>Date de fin</label>
          <input type="date" style={{...S.input,background:C.surface}} value={f.end_date||''} onChange={e=>s('end_date',e.target.value)}/>
        </div>
      </div>
      <div>
        <label style={S.label}>Couleur</label>
        <div style={{display:'flex',gap:8,marginTop:4}}>
          {COLORS.map(c=>(
            <button key={c} type="button" onClick={()=>s('color',c)}
              style={{width:30,height:30,borderRadius:7,background:c,border:`2.5px solid ${f.color===c?'#fff':'transparent'}`,cursor:'pointer',boxShadow:f.color===c?`0 0 10px ${c}`:'none',transition:'all 0.15s'}}/>
          ))}
        </div>
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
        <button onClick={onClose} style={S.btnGhost}>Annuler</button>
        <button onClick={()=>{if(!f.name.trim())return;onSave(f);onClose()}} style={S.btnCyan}>
          {project?'Mettre à jour':'Créer le projet'}
        </button>
      </div>
    </div>
  )
}

export default function Projects(){
  const {getProjects,addProject,updateProject,deleteProject,showToast}=useApp()
  const {can}=useAuth()
  const [projects,setProjects] = useState([])
  const [modal,setModal]       = useState(null)
  const [filter,setFilter]     = useState('all')
  const [search,setSearch]     = useState('')
  const [busy,setBusy]         = useState(true)

  const load=async()=>{
    setBusy(true)
    try{ setProjects(await getProjects()) }
    catch{ showToast('Impossible de contacter le serveur. Vérifiez que php artisan serve est lancé.','danger') }
    finally{ setBusy(false) }
  }
  useEffect(()=>{ load() },[])

  const handleSave=async data=>{
    const res=modal.type==='add'?await addProject(data):await updateProject(modal.p.id,data)
    showToast(modal.type==='add'?'Projet créé !':'Projet mis à jour !','success')
    load()
  }
  const handleDelete=async id=>{
    if(!confirm('Supprimer ce projet définitivement ?')) return
    await deleteProject(id)
    showToast('Projet supprimé','success')
    load()
  }

  const list = projects
    .filter(p=>filter==='all'||p.status===filter)
    .filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase()))

  if(busy) return <Loader/>

  return(
    <div>
      {/* En-tête */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:24}}>
        <div>
          <h1 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:24,background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
            PROJETS
          </h1>
          <p style={{color:C.t2,fontSize:13,marginTop:4}}>{projects.length} projet{projects.length>1?'s':''} · {list.length} affiché{list.length>1?'s':''}</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          {/* Recherche */}
          <div style={{position:'relative'}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:C.t3}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
              style={{...S.input,width:180,paddingLeft:30,height:34,fontSize:12}}/>
          </div>
          {/* Filtres */}
          <div style={{display:'flex',gap:3,padding:4,borderRadius:10,background:'rgba(0,200,255,0.06)',border:`1px solid ${C.border}`}}>
            {['all','active','pending','completed'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{padding:'6px 11px',borderRadius:7,fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,border:'none',cursor:'pointer',background:filter===f?C.cyan:'transparent',color:filter===f?'#020408':C.t3,transition:'all 0.15s'}}>
                {f==='all'?'TOUS':f.toUpperCase()}
              </button>
            ))}
          </div>
          {can('canCreate')&&(
            <button onClick={()=>setModal({type:'add'})} style={S.btnCyan}><Plus size={13}/> Nouveau</button>
          )}
        </div>
      </div>

      {/* Grille */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:18}}>
        <AnimatePresence>
          {list.map((p,i)=>(
            <motion.div key={p.id} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.95}} transition={{delay:i*0.05}}
              whileHover={{y:-3,transition:{duration:0.2}}}
              style={{...S.panel({padding:20,position:'relative',overflow:'hidden',cursor:'default'})}}>
              {/* Barre de couleur haut */}
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${p.color},transparent)`}}/>
              {/* Glow */}
              <div style={{position:'absolute',top:-16,right:-16,width:60,height:60,borderRadius:'50%',background:`radial-gradient(circle,${p.color},transparent)`,filter:'blur(16px)',opacity:0.13}}/>

              <div style={{position:'relative'}}>
                {/* Icône + actions */}
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:`${p.color}15`,border:`1px solid ${p.color}28`}}>
                    <FolderGit2 size={18} style={{color:p.color}}/>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <StatusBadge status={p.status}/>
                    {can('canEdit')&&(
                      <button onClick={()=>setModal({type:'edit',p})}
                        style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:3,borderRadius:6,transition:'color 0.15s'}}>
                        <Edit size={12}/>
                      </button>
                    )}
                    {can('canDelete')&&(
                      <button onClick={()=>handleDelete(p.id)}
                        style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:3,borderRadius:6,transition:'color 0.15s'}}>
                        <Trash2 size={12}/>
                      </button>
                    )}
                  </div>
                </div>

                {/* Nom + description */}
                <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:13,color:C.t1,marginBottom:5}}>{p.name}</h3>
                <p style={{fontSize:12,color:C.t3,marginBottom:12,lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                  {p.description||'Aucune description'}
                </p>

                {/* Tags */}
                {Array.isArray(p.tags)&&p.tags.length>0&&(
                  <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
                    {p.tags.slice(0,3).map(tag=>(
                      <span key={tag} style={{fontSize:9,padding:'2px 7px',borderRadius:5,background:`${p.color}12`,color:p.color,border:`1px solid ${p.color}25`,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Avatars équipe */}
                {Array.isArray(p.team)&&p.team.length>0&&(
                  <div style={{display:'flex',gap:3,marginBottom:12}}>
                    {p.team.slice(0,6).map((m,mi)=>(
                      <div key={mi} style={{width:22,height:22,borderRadius:6,background:`linear-gradient(135deg,${p.color},${p.color}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408',marginLeft:mi>0?-5:0,border:'1.5px solid rgba(2,4,8,0.8)',zIndex:6-mi}}>
                        {m}
                      </div>
                    ))}
                    {p.team.length>6&&<span style={{fontSize:10,color:C.t3,marginLeft:4}}>+{p.team.length-6}</span>}
                  </div>
                )}

                {/* Progression */}
                <div style={{marginBottom:9}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:9,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>PROGRESSION</span>
                    <span style={{fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:p.color}}>{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} color={p.color}/>
                </div>

                {/* Pied de carte */}
                <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:C.t3}}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}><Users size={9}/>{Array.isArray(p.team)?p.team.length:0} membres</span>
                  {(p.end_date||p.endDate)&&(
                    <span style={{display:'flex',alignItems:'center',gap:4}}><Calendar size={9}/>{p.end_date||p.endDate}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {list.length===0&&<div style={{gridColumn:'1 / -1'}}><Empty icon={FolderGit2} msg="Aucun projet trouvé" sub="Modifiez vos filtres ou créez un nouveau projet"/></div>}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal&&(
          <MShell title={modal.type==='add'?'NOUVEAU PROJET':'MODIFIER PROJET'} onClose={()=>setModal(null)}>
            <ProjectForm project={modal.p} onSave={handleSave} onClose={()=>setModal(null)}/>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}
