import React,{useState,useEffect,useMemo,useCallback,useRef} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {
  FolderGit2,Plus,Trash2,Edit,Users,Calendar,Search,X,
  ChevronRight,Target,Code2,User,Clock,TrendingUp,
  RefreshCw,Zap,CheckCircle2,AlertTriangle,Timer,
  BarChart3,Filter,Info,ListTodo,GitBranch,
  UserPlus,UserMinus,Crown,LayoutGrid,List,
  ChevronUp,ChevronDown,ChevronsUpDown,Check,
  Shield,Code,Briefcase
} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {StatusBadge,Progress,Empty,Loader} from '../components/ui/UI.jsx'
import {C,S,ROLE_META} from '../styles.js'
import {ini} from '../data.js'
import {useConfirm} from './shared/PageUtils.jsx'

const COLORS = ['#00c8ff','#7c3aed','#00ff88','#ff6b35','#ff2d78','#ffce00']
const TECHS  = ['React','Laravel','PostgreSQL','Vue.js','Node.js','Docker',
                'Python','TypeScript','MongoDB','Redis','GraphQL','Tailwind',
                'Next.js','FastAPI','MySQL','Nginx']

// ─────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────
function computeProjectStatus(p){
  const now=new Date(), start=p.start_date?new Date(p.start_date):null, end=p.end_date?new Date(p.end_date):null
  if(p.status==='completed') return 'completed'
  if(end&&end<now&&p.progress<100) return 'overdue'
  if(start&&start>now) return 'pending'
  return p.status||'active'
}
function getDaysLeft(end_date){
  if(!end_date) return null
  return Math.ceil((new Date(end_date)-new Date())/(1000*60*60*24))
}
function parseTechs(t){
  if(!t) return []
  if(Array.isArray(t)) return t
  try{return JSON.parse(t)}catch{return typeof t==='string'?t.split(',').map(x=>x.trim()).filter(Boolean):[]}
}
function parseTeam(t){
  if(!t) return []
  if(Array.isArray(t)) return t.map(x=>typeof x==='object'?x.id??x:x)
  try{const p=JSON.parse(t); return Array.isArray(p)?p.map(x=>typeof x==='object'?x.id??x:x):[]}
  catch{return []}
}
function stColor(st){
  return st==='overdue'?'#ff2d78':st==='completed'?'#00ff88':st==='pending'?'#ffce00':'#00c8ff'
}
function stLabel(st){
  return st==='overdue'?'RETARD':st==='completed'?'TERMINÉ':st==='pending'?'ATTENTE':'ACTIF'
}

// ─────────────────────────────────────────────────────────
//  Avatar utilisateur
// ─────────────────────────────────────────────────────────
function UserAvatar({user,size=36,color='#00c8ff'}){
  const rc=ROLE_META?.[user?.role]||{color:'#00c8ff'}
  return(
    <div style={{width:size,height:size,borderRadius:Math.round(size*0.26),flexShrink:0,
      background:`linear-gradient(135deg,${rc.color},${rc.color}99)`,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontSize:Math.round(size*0.32),fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408'}}>
      {ini?.(user?.name)||user?.name?.substring(0,2).toUpperCase()||'??'}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  Badge Rôle
// ─────────────────────────────────────────────────────────
function RoleBadge({role}){
  const rc=ROLE_META?.[role]||{color:'#00c8ff',bg:'rgba(0,200,255,0.1)',border:'rgba(0,200,255,0.2)'}
  const icons={admin:<Shield size={9}/>,dev:<Code size={9}/>,client:<Briefcase size={9}/>}
  return(
    <span style={{display:'inline-flex',alignItems:'center',gap:4,
      fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
      padding:'3px 7px',borderRadius:5,background:rc.bg,color:rc.color,border:`1px solid ${rc.border}`}}>
      {icons[role]||null}{role?.toUpperCase()}
    </span>
  )
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
//  Skeleton Card
// ─────────────────────────────────────────────────────────
function SkeletonCard(){
  const p={background:`linear-gradient(90deg,${C.border}44 25%,${C.border}99 50%,${C.border}44 75%)`,
    backgroundSize:'200% 100%',animation:'skPulse 1.4s ease infinite',borderRadius:7}
  return(
    <div style={{background:'rgba(255,255,255,0.02)',border:`1px solid rgba(255,255,255,0.07)`,
      borderRadius:14,padding:20,display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <div style={{...p,width:42,height:42,borderRadius:11}}/>
        <div style={{...p,width:60,height:22}}/>
      </div>
      <div style={{...p,width:'70%',height:13}}/>
      <div style={{...p,width:'90%',height:11}}/>
      <div style={{...p,width:'90%',height:11}}/>
      <div style={{display:'flex',gap:6}}>
        <div style={{...p,width:50,height:20}}/>
        <div style={{...p,width:50,height:20}}/>
      </div>
      <div style={{...p,width:'100%',height:5,borderRadius:10,marginTop:4}}/>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  Member Picker — sélecteur de membres dans le formulaire
// ─────────────────────────────────────────────────────────
function MemberPicker({selectedIds,onChange,allUsers,color,responsable,onResponsableChange}){
  const [search,setSearch]=useState('')
  const filtered=useMemo(()=>{
    if(!search) return allUsers
    const q=search.toLowerCase()
    return allUsers.filter(u=>u.name?.toLowerCase().includes(q)||u.email?.toLowerCase().includes(q))
  },[allUsers,search])

  const toggle=id=>{
    onChange(selectedIds.includes(id)?selectedIds.filter(x=>x!==id):[...selectedIds,id])
  }

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <label style={S.label}>
          Membres de l'équipe
          {selectedIds.length>0&&<span style={{color,marginLeft:6}}>{selectedIds.length} sélectionné{selectedIds.length>1?'s':''}</span>}
        </label>
      </div>

      {/* Search */}
      <div style={{position:'relative',marginBottom:8}}>
        <Search size={12} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:C.t3}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Rechercher un membre…"
          style={{...S.input,paddingLeft:30,fontSize:11,height:34}}/>
        {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:8,top:'50%',
          transform:'translateY(-50%)',background:'none',border:'none',color:C.t3,cursor:'pointer'}}>
          <X size={11}/>
        </button>}
      </div>

      {/* Liste utilisateurs */}
      <div style={{maxHeight:220,overflowY:'auto',display:'flex',flexDirection:'column',gap:4,
        border:`1px solid ${C.border}`,borderRadius:10,padding:6}}>
        {filtered.length===0
          ? <p style={{fontSize:11,color:C.t3,textAlign:'center',padding:'16px 0'}}>Aucun membre trouvé</p>
          : filtered.map(u=>{
            const sel=selectedIds.includes(u.id)
            const isResp=responsable===u.id
            return(
              <div key={u.id}
                onClick={()=>toggle(u.id)}
                style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',
                  borderRadius:8,cursor:'pointer',transition:'background 0.15s',
                  background:sel?`${color}12`:'transparent',
                  border:`1px solid ${sel?color+40:C.border}`,}}>
                <UserAvatar user={u} size={32} color={color}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                      color:sel?color:C.t1,truncate:true}}>{u.name}</span>
                    {isResp&&<Crown size={10} style={{color:'#ffce00',flexShrink:0}}/>}
                  </div>
                  <span style={{fontSize:10,color:C.t3,fontFamily:'JetBrains Mono,monospace'}}>{u.email}</span>
                </div>
                <RoleBadge role={u.role}/>
                <div style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${sel?color:C.border}`,
                  background:sel?color:'transparent',display:'flex',alignItems:'center',
                  justifyContent:'center',flexShrink:0,transition:'all 0.15s'}}>
                  {sel&&<Check size={11} color="#020408"/>}
                </div>
              </div>
            )
          })}
      </div>

      {/* Responsable parmi les membres sélectionnés */}
      {selectedIds.length>0&&(
        <div style={{marginTop:10}}>
          <label style={{...S.label,display:'flex',alignItems:'center',gap:6}}>
            <Crown size={11} style={{color:'#ffce00'}}/> Responsable / Chef de projet
          </label>
          <select
            value={responsable||''}
            onChange={e=>onResponsableChange(e.target.value)}
            style={{...S.input,background:C.surface,fontSize:11}}>
            <option value="">— Aucun responsable désigné —</option>
            {selectedIds.map(id=>{
              const u=allUsers.find(x=>x.id===id)
              return u?<option key={id} value={id}>{u.name}</option>:null
            })}
          </select>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  Formulaire Projet
// ─────────────────────────────────────────────────────────
function ProjectForm({project,onSave,onClose,allUsers}){
  const [f,setF]=useState(project||{
    name:'',description:'',objectifs:'',responsable_id:null,
    technologies:[],team_ids:[],status:'active',color:COLORS[0],
    start_date:'',end_date:'',progress:0,progress_manuel:false,
  })
  const [err,setErr]=useState({})
  const s=(k,v)=>setF(x=>({...x,[k]:v}))

  const techs=parseTechs(f.technologies)
  const teamIds=useMemo(()=>parseTeam(f.team_ids||f.team||[]),[f.team_ids,f.team])

  const toggleTech=t=>s('technologies',techs.includes(t)?techs.filter(x=>x!==t):[...techs,t])
  const autoStatus=useMemo(()=>computeProjectStatus(f),[f.start_date,f.end_date,f.status,f.progress])
  const daysLeft=getDaysLeft(f.end_date)

  const validate=()=>{
    const e={}
    if(!f.name.trim()||f.name.trim().length<2) e.name='Nom requis (min 2 caractères)'
    if(f.start_date&&f.end_date&&new Date(f.end_date)<new Date(f.start_date))
      e.dates='La date de fin doit être après la date de début'
    setErr(e)
    return !Object.keys(e).length
  }

  const submit=()=>{
    if(!validate()) return
    const respUser=allUsers.find(u=>String(u.id)===String(f.responsable_id))
    onSave({
      ...f,
      technologies:Array.isArray(f.technologies)?f.technologies:parseTechs(f.technologies),
      team_ids:teamIds.map(id=>parseInt(id)).filter(Boolean),
      responsable_id:f.responsable_id?parseInt(f.responsable_id):null,
      responsable:respUser?.name||f.responsable||'',
      start_date:f.start_date||null,
      end_date:f.end_date||null,
      progress:parseInt(f.progress)||0,
    })
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:15}}>

      {/* Nom + Couleur */}
      <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'flex-end'}}>
        <div>
          <label style={S.label}>Nom du projet *</label>
          <input style={{...S.input,borderColor:f.color+'60',...(err.name?{borderColor:'#ff2d78'}:{})}}
            value={f.name} onChange={e=>{s('name',e.target.value);setErr(x=>({...x,name:''}))}}
            placeholder="Ex: Site E-commerce"/>
          {err.name&&<p style={{color:'#ff2d78',fontSize:10,marginTop:4}}>{err.name}</p>}
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
        <label style={S.label}>Description *
          <span style={{fontSize:9,color:C.t3,marginLeft:6,fontWeight:400}}>— Contexte, enjeux, périmètre</span>
        </label>
        <textarea style={{...S.input,resize:'vertical',minHeight:80,fontFamily:'inherit'}}
          value={f.description} onChange={e=>s('description',e.target.value)}
          placeholder="Décrivez le projet en détail…"/>
      </div>

      {/* Objectifs */}
      <div>
        <label style={S.label}>Objectifs
          <span style={{fontSize:9,color:C.t3,marginLeft:6,fontWeight:400}}>— Résultats attendus</span>
        </label>
        <textarea style={{...S.input,resize:'vertical',minHeight:64,fontFamily:'inherit'}}
          value={f.objectifs||''} onChange={e=>s('objectifs',e.target.value)}
          placeholder="Ex: Augmenter les conversions de 20%…"/>
      </div>

      {/* ════ MEMBRES ════ */}
      <div style={{padding:'14px 16px',background:'rgba(0,200,255,0.03)',
        border:`1px solid rgba(0,200,255,0.12)`,borderRadius:11}}>
        <MemberPicker
          selectedIds={teamIds}
          onChange={ids=>s('team_ids',ids)}
          allUsers={allUsers}
          color={f.color}
          responsable={f.responsable_id}
          onResponsableChange={id=>s('responsable_id',id||null)}
        />
      </div>

      {/* Statut */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <label style={S.label}>Statut</label>
          <select style={{...S.input,background:C.surface}} value={f.status} onChange={e=>s('status',e.target.value)}>
            <option value="active">🟢 Actif</option>
            <option value="pending">🟡 En attente</option>
            <option value="completed">✅ Terminé</option>
          </select>
        </div>
        <div>
          <label style={S.label}>&nbsp;</label>
          <div style={{padding:'9px 12px',background:'rgba(0,200,255,0.04)',
            border:'1px solid rgba(0,200,255,0.12)',borderRadius:8,fontSize:11,color:C.t2,
            display:'flex',alignItems:'center',gap:7,height:36}}>
            <Zap size={12} style={{color:C.cyan}}/>
            Auto : <strong style={{color:C.cyan}}>
              {autoStatus==='overdue'?'⚠️ Retard':autoStatus==='pending'?'⏳ Attente':autoStatus==='completed'?'✅ Terminé':'🟢 Actif'}
            </strong>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div>
        <label style={{...S.label,display:'flex',alignItems:'center',gap:6}}>
          <Calendar size={11} style={{color:C.cyan}}/> Dates du projet
        </label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <label style={{...S.label,fontSize:9,color:C.t3}}>Date de début</label>
            <input type="date" style={{...S.input,background:C.surface}}
              value={f.start_date||''} onChange={e=>{s('start_date',e.target.value);setErr(x=>({...x,dates:''}))}}/>
          </div>
          <div>
            <label style={{...S.label,fontSize:9,color:C.t3}}>Date de fin prévue</label>
            <input type="date" style={{...S.input,background:C.surface}}
              value={f.end_date||''} onChange={e=>{s('end_date',e.target.value);setErr(x=>({...x,dates:''}))}}/>
          </div>
        </div>
        {err.dates&&<p style={{color:'#ff2d78',fontSize:10,marginTop:4}}>{err.dates}</p>}
        {(f.start_date||f.end_date)&&!err.dates&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            style={{marginTop:8,padding:'8px 12px',borderRadius:8,
              background:'rgba(0,200,255,0.05)',border:'1px solid rgba(0,200,255,0.15)',
              display:'flex',alignItems:'center',gap:10,fontSize:11,color:C.t2}}>
            <Zap size={12} style={{color:C.cyan}}/>
            <span>Statut auto : <strong style={{color:C.cyan}}>{
              autoStatus==='overdue'?'⚠️ En retard':autoStatus==='pending'?'⏳ En attente':autoStatus==='completed'?'✅ Terminé':'🟢 Actif'
            }</strong></span>
            {daysLeft!==null&&(
              <span style={{marginLeft:'auto',fontSize:10,
                color:daysLeft<0?'#ff2d78':daysLeft<=7?'#ffce00':C.t3}}>
                {daysLeft<0?`${Math.abs(daysLeft)}j de retard`:daysLeft===0?"Aujourd'hui":`${daysLeft}j restants`}
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Progression */}
      <div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
          <label style={S.label}>Progression — <strong style={{color:f.color}}>{f.progress||0}%</strong></label>
          <button type="button" onClick={()=>s('progress_manuel',!f.progress_manuel)}
            style={{padding:'3px 9px',borderRadius:6,fontSize:9,fontFamily:'Orbitron,sans-serif',
              fontWeight:700,cursor:'pointer',border:'none',
              background:f.progress_manuel?'rgba(255,206,0,0.15)':'rgba(0,200,255,0.1)',
              color:f.progress_manuel?'#ffce00':C.cyan}}>
            {f.progress_manuel?'✋ MANUEL':'⚡ AUTO'}
          </button>
        </div>
        {f.progress_manuel?(
          <>
            <input type="range" min="0" max="100" value={f.progress||0}
              onChange={e=>s('progress',parseInt(e.target.value))}
              style={{width:'100%',accentColor:f.color,cursor:'pointer'}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:C.t3,marginTop:2}}>
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </>
        ):(
          <div style={{padding:'10px 12px',background:'rgba(0,200,255,0.04)',
            border:'1px solid rgba(0,200,255,0.12)',borderRadius:8,fontSize:11,color:C.t2,
            display:'flex',alignItems:'center',gap:8}}>
            <Zap size={12} style={{color:C.cyan}}/>
            Progression calculée automatiquement selon les tâches terminées
          </div>
        )}
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
            const sel=techs.includes(t)
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
        <button onClick={submit} style={{...S.btnCyan,opacity:(!f.name.trim()||f.name.trim().length<2)?0.4:1}}>
          {project?'Mettre à jour':'Créer le projet'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  Onglet Équipe — version enrichie
// ─────────────────────────────────────────────────────────
function TeamTab({project:p,allUsers,onUpdateTeam,canEdit}){
  const [adding,setAdding]=useState(false)
  const [search,setSearch]=useState('')
  const [busy,setBusy]=useState(false)

  const teamIds=useMemo(()=>parseTeam(p.team_ids||p.team||[]),[p.team_ids,p.team])
  const teamMembers=useMemo(()=>teamIds.map(id=>allUsers.find(u=>String(u.id)===String(id))).filter(Boolean),[teamIds,allUsers])
  const available=useMemo(()=>allUsers.filter(u=>!teamIds.includes(u.id)&&!teamIds.includes(String(u.id))),[allUsers,teamIds])

  // Membres filtrés pour ajout
  const filteredAvailable=useMemo(()=>{
    if(!search) return available
    const q=search.toLowerCase()
    return available.filter(u=>u.name?.toLowerCase().includes(q)||u.email?.toLowerCase().includes(q))
  },[available,search])

  const addMember=async user=>{
    if(busy) return
    setBusy(true)
    try{
      const newIds=[...teamIds,user.id]
      await onUpdateTeam(newIds)
    }finally{ setBusy(false) }
  }

  const removeMember=async id=>{
    if(busy) return
    setBusy(true)
    try{
      const newIds=teamIds.filter(x=>String(x)!==String(id))
      await onUpdateTeam(newIds)
    }finally{ setBusy(false) }
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>

      {/* Header équipe */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Users size={14} style={{color:p.color}}/>
          <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:11,color:C.t1}}>
            {teamMembers.length} MEMBRE{teamMembers.length>1?'S':''}
          </span>
        </div>
        {canEdit&&available.length>0&&(
          <button onClick={()=>setAdding(v=>!v)}
            style={{...S.btnGhost,padding:'6px 12px',fontSize:11,display:'flex',alignItems:'center',
              gap:6,borderColor:adding?p.color:`${C.border}`,color:adding?p.color:C.t3}}>
            {adding?<X size={12}/>:<UserPlus size={12}/>}
            {adding?'Fermer':'Ajouter un membre'}
          </button>
        )}
      </div>

      {/* Section ajout */}
      <AnimatePresence>
        {adding&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
            style={{overflow:'hidden'}}>
            <div style={{padding:'12px',background:`${p.color}08`,border:`1px solid ${p.color}25`,
              borderRadius:10,display:'flex',flexDirection:'column',gap:8}}>
              <p style={{fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:p.color,
                display:'flex',alignItems:'center',gap:6}}>
                <UserPlus size={11}/> AJOUTER UN MEMBRE
              </p>
              <div style={{position:'relative'}}>
                <Search size={12} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:C.t3}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Rechercher…"
                  style={{...S.input,paddingLeft:30,fontSize:11,height:32}}/>
              </div>
              <div style={{maxHeight:180,overflowY:'auto',display:'flex',flexDirection:'column',gap:4}}>
                {filteredAvailable.length===0
                  ? <p style={{fontSize:11,color:C.t3,textAlign:'center',padding:'12px 0'}}>
                      {available.length===0?'Tous les membres sont déjà dans l\'équipe':'Aucun résultat'}
                    </p>
                  : filteredAvailable.map(u=>(
                    <div key={u.id}
                      onClick={()=>!busy&&addMember(u)}
                      style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',
                        borderRadius:8,cursor:busy?'wait':'pointer',transition:'background 0.15s',
                        background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border}`}}
                      onMouseEnter={e=>e.currentTarget.style.background=`${p.color}10`}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}>
                      <UserAvatar user={u} size={30}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t1}}>{u.name}</div>
                        <div style={{fontSize:10,color:C.t3,fontFamily:'JetBrains Mono,monospace',
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.email}</div>
                      </div>
                      <RoleBadge role={u.role}/>
                      <UserPlus size={13} style={{color:p.color,flexShrink:0}}/>
                    </div>
                  ))
                }
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste membres actuels */}
      {teamMembers.length===0?(
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',
          justifyContent:'center',padding:'32px 16px',gap:10}}>
          <Users size={32} style={{color:C.t3,opacity:0.3}}/>
          <p style={{fontSize:12,color:C.t3,textAlign:'center'}}>
            Aucun membre dans l'équipe.<br/>
            {canEdit&&<span style={{color:p.color}}>Cliquez sur "Ajouter un membre" pour commencer.</span>}
          </p>
        </div>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {teamMembers.map((m,i)=>{
            const isResp=String(p.responsable_id)===String(m.id)||p.responsable===m.name
            const rc=ROLE_META?.[m.role]||{color:'#00c8ff'}
            return(
              <motion.div key={m.id}
                initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',
                  background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border}`,
                  borderRadius:11,transition:'border-color 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=`${p.color}40`}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>

                {/* Avatar */}
                <UserAvatar user={m} size={38}/>

                {/* Infos */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:3,flexWrap:'wrap'}}>
                    <span style={{fontSize:12,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t1}}>
                      {m.name}
                    </span>
                    {isResp&&(
                      <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:9,
                        padding:'2px 7px',borderRadius:5,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                        background:'rgba(255,206,0,0.12)',color:'#ffce00',border:'1px solid rgba(255,206,0,0.25)'}}>
                        <Crown size={9}/> RESPONSABLE
                      </span>
                    )}
                    <RoleBadge role={m.role}/>
                  </div>
                  <span style={{fontSize:10,color:C.t3,fontFamily:'JetBrains Mono,monospace',
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block'}}>{m.email}</span>
                </div>

                {/* Bouton retirer */}
                {canEdit&&(
                  <button
                    onClick={()=>removeMember(m.id)}
                    disabled={busy}
                    title="Retirer du projet"
                    style={{background:'none',border:'none',color:C.t3,cursor:busy?'wait':'pointer',
                      padding:5,borderRadius:6,display:'flex',transition:'all 0.15s'}}
                    onMouseEnter={e=>{ e.currentTarget.style.color='#ff2d78'; e.currentTarget.style.background='rgba(255,45,120,0.1)' }}
                    onMouseLeave={e=>{ e.currentTarget.style.color=C.t3; e.currentTarget.style.background='none' }}>
                    <UserMinus size={14}/>
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Footer résumé rôles */}
      {teamMembers.length>0&&(
        <div style={{display:'flex',gap:12,padding:'10px 14px',
          background:'rgba(255,255,255,0.01)',border:`1px solid ${C.border}`,
          borderRadius:9,flexWrap:'wrap'}}>
          {['admin','dev','client'].map(role=>{
            const count=teamMembers.filter(m=>m.role===role).length
            if(!count) return null
            const rc=ROLE_META?.[role]||{color:'#00c8ff'}
            return(
              <span key={role} style={{fontSize:10,fontFamily:'Orbitron,sans-serif',color:C.t3,
                display:'flex',alignItems:'center',gap:5}}>
                <span style={{color:rc.color,fontWeight:700}}>{count}</span> {role.toUpperCase()}
              </span>
            )
          })}
          <span style={{marginLeft:'auto',fontSize:10,color:C.t3}}>
            {teamMembers.length} / {allUsers.length} membres de l'équipe
          </span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  Détail Projet — Tabs
// ─────────────────────────────────────────────────────────
function ProjectDetail({project:p,canEdit,canDelete,onEdit,onDelete,onClose,onRecalculate,allUsers,onUpdateTeam}){
  const [tab,setTab]=useState('general')
  const techs=parseTechs(p.technologies)
  const daysLeft=getDaysLeft(p.end_date)
  const autoSt=computeProjectStatus(p)
  const sc=stColor(autoSt), sl=stLabel(autoSt)

  const TABS=[
    {id:'general',   label:'Général',     icon:Info},
    {id:'objectifs', label:'Objectifs',   icon:Target},
    {id:'progress',  label:'Progression', icon:BarChart3},
    {id:'team',      label:'Équipe',      icon:Users,
     badge:parseTeam(p.team_ids||p.team||[]).length||null},
  ]

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
              fontWeight:800,background:`${sc}15`,color:sc,border:`1px solid ${sc}30`}}>{sl}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14,fontSize:11,color:C.t3,flexWrap:'wrap'}}>
            {p.responsable&&<span style={{display:'flex',alignItems:'center',gap:4}}><Crown size={10} style={{color:'#ffce00'}}/>{p.responsable}</span>}
            {p.start_date&&<span style={{display:'flex',alignItems:'center',gap:4}}><Calendar size={10}/>Début : {p.start_date}</span>}
            {p.end_date&&(
              <span style={{display:'flex',alignItems:'center',gap:4,
                color:daysLeft!==null&&daysLeft<0?'#ff2d78':daysLeft!==null&&daysLeft<=7?'#ffce00':C.t3}}>
                <Clock size={10}/>
                {daysLeft===null?`Fin : ${p.end_date}`:daysLeft<0?`${Math.abs(daysLeft)}j de retard`:
                 daysLeft===0?"Échéance aujourd'hui":`${daysLeft}j restants`}
              </span>
            )}
          </div>
        </div>
        <div style={{display:'flex',gap:6}}>
          {canEdit&&(
            <button onClick={onEdit} style={{...S.btnGhost,padding:'7px 12px',fontSize:11,display:'flex',alignItems:'center',gap:5}}>
              <Edit size={12}/> Modifier
            </button>
          )}
          {canDelete&&(
            <button onClick={onDelete} style={{...S.btnGhost,padding:'7px 10px',color:'#ff2d78',borderColor:'rgba(255,45,120,0.2)'}}>
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
              justifyContent:'center',gap:5,transition:'all 0.15s',position:'relative',
              background:tab===t.id?p.color:'transparent',
              color:tab===t.id?'#020408':C.t3}}>
            <t.icon size={11}/>{t.label}
            {t.badge>0&&tab!==t.id&&(
              <span style={{position:'absolute',top:3,right:6,minWidth:16,height:16,
                borderRadius:8,background:p.color,color:'#020408',fontSize:9,
                fontFamily:'Orbitron,sans-serif',fontWeight:800,
                display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>
                {t.badge}
              </span>
            )}
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
                        background:`${p.color}12`,color:p.color,border:`1px solid ${p.color}25`}}>{t}</span>
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
              {p.objectifs?(
                <p style={{fontSize:13,color:C.t1,lineHeight:1.8,whiteSpace:'pre-wrap'}}>{p.objectifs}</p>
              ):(
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
              <button onClick={()=>onRecalculate&&onRecalculate(p.id)}
                style={{...S.btnGhost,width:'100%',padding:'11px',display:'flex',
                  alignItems:'center',justifyContent:'center',gap:8,fontSize:12,
                  borderColor:'rgba(0,200,255,0.2)',color:C.cyan}}>
                <RefreshCw size={13}/> Recalculer depuis les tâches
              </button>
              {(p.start_date||p.end_date)&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {[
                    {label:'Début',value:p.start_date,icon:Timer,color:'#00ff88'},
                    {label:'Fin prévue',value:p.end_date,icon:Clock,color:daysLeft!==null&&daysLeft<0?'#ff2d78':'#ffce00'},
                  ].map(({label,value,icon:Icon,color})=>value&&(
                    <div key={label} style={{padding:'12px',background:`${color}08`,
                      border:`1px solid ${color}20`,borderRadius:10,display:'flex',alignItems:'center',gap:10}}>
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

          {/* ÉQUIPE ← VERSION ENRICHIE */}
          {tab==='team'&&(
            <TeamTab
              project={p}
              allUsers={allUsers}
              onUpdateTeam={onUpdateTeam}
              canEdit={canEdit}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
//  Sort Icon
// ─────────────────────────────────────────────────────────
function SortIcon({field,sort}){
  if(sort.field!==field) return <ChevronsUpDown size={10} color={C.t3}/>
  return sort.dir==='asc'?<ChevronUp size={10} color={C.cyan}/>:<ChevronDown size={10} color={C.cyan}/>
}

// ─────────────────────────────────────────────────────────
//  Page principale
// ─────────────────────────────────────────────────────────
export default function Projects(){
  const {getProjects,addProject,updateProject,deleteProject,getUsers,showToast}=useApp()
  const {can}=useAuth()
  const {confirm,Dialog}=useConfirm()

  const [projects,setProjects]=useState([])
  const [allUsers,setAllUsers]=useState([])
  const [modal,setModal]=useState(null)
  const [busy,setBusy]=useState(true)
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState('all')
  const [view,setView]=useState('grid')  // grid | list
  const [sort,setSort]=useState({field:'name',dir:'asc'})

  // ── Chargement ─────────────────────────────────
  const load=useCallback(async()=>{
    setBusy(true)
    try{
      const [data,users]=await Promise.all([getProjects(),getUsers?.()||[]])
      const enriched=(data||[]).map(p=>({...p,_autoStatus:computeProjectStatus(p)}))
      setProjects(enriched)
      setAllUsers(users||[])
    }catch(e){
      showToast(e?.message||'Impossible de charger les projets.','danger')
    }finally{setBusy(false)}
  },[getProjects,getUsers,showToast])

  useEffect(()=>{load()},[load])

  // ── Filtre + Tri ────────────────────────────────
  const list=useMemo(()=>{
    let l=projects.filter(p=>{
      const mf=filter==='all'||p.status===filter||p._autoStatus===filter
      const ms=!search||
        p.name?.toLowerCase().includes(search.toLowerCase())||
        p.description?.toLowerCase().includes(search.toLowerCase())||
        p.responsable?.toLowerCase().includes(search.toLowerCase())||
        parseTechs(p.technologies).some(t=>t.toLowerCase().includes(search.toLowerCase()))
      return mf&&ms
    })
    l.sort((a,b)=>{
      let va=a[sort.field]||'', vb=b[sort.field]||''
      if(sort.field==='progress'){va=a.progress||0; vb=b.progress||0}
      if(sort.field==='end_date'){va=new Date(a.end_date||0); vb=new Date(b.end_date||0)}
      if(va<vb) return sort.dir==='asc'?-1:1
      if(va>vb) return sort.dir==='asc'?1:-1
      return 0
    })
    return l
  },[projects,filter,search,sort])

  const stats=useMemo(()=>({
    total:projects.length,
    active:projects.filter(p=>p._autoStatus==='active').length,
    overdue:projects.filter(p=>p._autoStatus==='overdue').length,
    completed:projects.filter(p=>p._autoStatus==='completed').length,
    pending:projects.filter(p=>p._autoStatus==='pending').length,
  }),[projects])

  const toggleSort=field=>setSort(s=>s.field===field?{field,dir:s.dir==='asc'?'desc':'asc'}:{field,dir:'asc'})

  // ── CRUD ────────────────────────────────────────
  const handleSave=async data=>{
    try{
      if(modal.type==='add'){
        const res=await addProject(data)
        if(!res?.success){
          const msg=res?.message||
            Object.values(res?.errors||{}).flat().join(' | ')||
            'Erreur création'
          showToast(msg,'danger')
          return
        }
        const newProject=res.data||res.project||res
        setProjects(prev=>[...prev,{...newProject,_autoStatus:computeProjectStatus(newProject)}])
        showToast('Projet créé !','success')
        setModal(null)
        load()
      }else{
        const res=await updateProject(modal.p.id,data)
        if(!res?.success){
          const msg=res?.message||
            Object.values(res?.errors||{}).flat().join(' | ')||
            'Erreur mise à jour'
          showToast(msg,'danger')
          return
        }
        const updated=res.data||res.project||{...modal.p,...data}
        setProjects(prev=>prev.map(p=>p.id===modal.p.id?{...updated,_autoStatus:computeProjectStatus(updated)}:p))
        showToast('Projet mis à jour !','success')
        setModal(null)
        load()
      }
    }catch(e){
      showToast(e?.message||'Erreur lors de la sauvegarde','danger')
      load()
    }
  }

  const handleDelete=async id=>{
    const ok=await confirm('Supprimer ce projet définitivement ?')
    if(!ok) return
    setProjects(prev=>prev.filter(p=>p.id!==id)) // optimistic
    try{
      await deleteProject(id)
      showToast('Projet supprimé','success')
      setModal(null)
    }catch(e){showToast(e?.message||'Erreur suppression','danger');load()}
  }

  const handleRecalculate=async id=>{
    try{
      const {api}=await import('../services/api.js')
      const res=await api.post(`/projects/${id}/recalculate`)
      if(res?.success){
        setProjects(prev=>prev.map(p=>p.id===id?{...p,progress:res.data.progress}:p))
        showToast(`Progression recalculée : ${res.data.progress}%`,'success')
        load()
      }
    }catch(e){showToast(e?.message||'Erreur recalcul','danger')}
  }

  // ── Mise à jour équipe depuis le détail ─────────
  const handleUpdateTeam=async(projectId,newIds)=>{
    try{
      await updateProject(projectId,{team_ids:newIds})
      setProjects(prev=>prev.map(p=>p.id===projectId?{...p,team_ids:newIds,team:newIds}:p))
      // Met à jour le modal courant si ouvert
      setModal(m=>m&&m.p&&m.p.id===projectId?{...m,p:{...m.p,team_ids:newIds,team:newIds}}:m)
      showToast('Équipe mise à jour !','success')
    }catch(e){showToast(e?.message||'Erreur mise à jour équipe','danger');throw e}
  }

  // ─────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────
  return(
    <div>
      <style>{`
        @keyframes skPulse{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      {Dialog}

      {/* ── En-tête ── */}
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
              {stats.active} actif{stats.active>1?'s':''}
              {stats.overdue>0&&<> • <span style={{color:'#ff2d78'}}>{stats.overdue} en retard</span></>}
            </p>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={load} style={{...S.btnGhost,padding:'8px 12px'}} title="Rafraîchir">
              <RefreshCw size={13}/>
            </button>
            {can('canCreate')&&(
              <button onClick={()=>setModal({type:'add'})} style={S.btnCyan}>
                <Plus size={13}/> Nouveau projet
              </button>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[
            {label:'Total',    value:stats.total,     color:'#7c3aed', icon:FolderGit2, id:'all'},
            {label:'Actifs',   value:stats.active,    color:'#00c8ff', icon:Zap,        id:'active'},
            {label:'Retard',   value:stats.overdue,   color:'#ff2d78', icon:AlertTriangle, id:'overdue'},
            {label:'Terminés', value:stats.completed, color:'#00ff88', icon:CheckCircle2,  id:'completed'},
          ].map(({label,value,color,icon:Icon,id})=>{
            const active=filter===id
            return(
              <motion.div key={label} whileHover={{y:-2}}
                onClick={()=>setFilter(active?'all':id)}
                style={{background:active?`${color}15`:`${color}08`,
                  border:`1px solid ${active?color:color+'20'}`,
                  borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,
                  cursor:'pointer',transition:'all 0.2s',
                  boxShadow:active?`0 0 20px ${color}25`:'none'}}>
                <Icon size={18} style={{color,flexShrink:0}}/>
                <div>
                  <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:20,color}}>{value}</div>
                  <div style={{fontSize:9,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{label.toUpperCase()}</div>
                </div>
                {active&&<Check size={12} style={{marginLeft:'auto',color,flexShrink:0}}/>}
              </motion.div>
            )
          })}
        </div>

        {/* Recherche + filtres + vue + tri */}
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          {/* Search */}
          <div style={{position:'relative',flex:1,minWidth:200}}>
            <Search size={13} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:C.t3}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher projet, responsable, technologie…"
              style={{...S.input,paddingLeft:34}}/>
            {search&&(
              <button onClick={()=>setSearch('')}
                style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',
                  background:'none',border:'none',color:C.t3,cursor:'pointer',display:'flex'}}>
                <X size={12}/>
              </button>
            )}
          </div>

          {/* Filtres statut */}
          <div style={{display:'flex',gap:3,padding:4,borderRadius:10,
            background:'rgba(0,200,255,0.04)',border:`1px solid ${C.border}`}}>
            {[{id:'all',label:'TOUS'},{id:'active',label:'ACTIFS'},{id:'pending',label:'ATTENTE'},
              {id:'overdue',label:'RETARD'},{id:'completed',label:'TERMINÉS'}].map(({id,label})=>(
              <button key={id} onClick={()=>setFilter(id)}
                style={{padding:'6px 10px',borderRadius:7,fontSize:9,fontFamily:'Orbitron,sans-serif',
                  fontWeight:700,border:'none',cursor:'pointer',transition:'all 0.15s',
                  background:filter===id?C.cyan:'transparent',
                  color:filter===id?'#020408':C.t3}}>
                {label}
              </button>
            ))}
          </div>

          {/* Tri */}
          <select value={`${sort.field}:${sort.dir}`}
            onChange={e=>{const[f,d]=e.target.value.split(':');setSort({field:f,dir:d})}}
            style={{...S.input,height:36,fontSize:10,fontFamily:'Orbitron,sans-serif',
              background:C.surface,minWidth:0,width:'auto',paddingRight:8}}>
            <option value="name:asc">Nom A→Z</option>
            <option value="name:desc">Nom Z→A</option>
            <option value="progress:desc">Progression ↓</option>
            <option value="progress:asc">Progression ↑</option>
            <option value="end_date:asc">Échéance ↑</option>
            <option value="end_date:desc">Échéance ↓</option>
          </select>

          {/* Toggle vue */}
          <div style={{display:'flex',gap:2,padding:3,borderRadius:8,
            background:'rgba(255,255,255,0.03)',border:`1px solid ${C.border}`}}>
            {[{id:'grid',Icon:LayoutGrid},{id:'list',Icon:List}].map(({id,Icon})=>(
              <button key={id} onClick={()=>setView(id)}
                style={{padding:'5px 8px',borderRadius:6,border:'none',cursor:'pointer',
                  background:view===id?C.cyan:'transparent',
                  color:view===id?'#020408':C.t3,display:'flex',alignItems:'center',transition:'all 0.15s'}}>
                <Icon size={13}/>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grille / Liste projets ── */}
      {busy?(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:18}}>
          {Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/>)}
        </div>
      ):(
        <div style={view==='grid'
          ?{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:18}
          :{display:'flex',flexDirection:'column',gap:10}}>
          <AnimatePresence>
            {list.map((p,i)=>{
              const techs=parseTechs(p.technologies)
              const autoSt=p._autoStatus||computeProjectStatus(p)
              const dl=getDaysLeft(p.end_date)
              const sc=stColor(autoSt), sl=stLabel(autoSt)
              const teamCount=parseTeam(p.team_ids||p.team||[]).length

              // ── Vue LISTE ──
              if(view==='list') return(
                <motion.div key={p.id}
                  initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} exit={{opacity:0}}
                  transition={{delay:i*0.02}}
                  onClick={()=>setModal({type:'detail',p})}
                  style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',
                    background:'rgba(255,255,255,0.02)',border:`1px solid rgba(255,255,255,0.07)`,
                    borderRadius:12,cursor:'pointer',transition:'all 0.15s',position:'relative',overflow:'hidden'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${p.color}40`;e.currentTarget.style.background=`${p.color}07`}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.background='rgba(255,255,255,0.02)'}}>
                  <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:p.color,borderRadius:'12px 0 0 12px'}}/>
                  <div style={{width:38,height:38,borderRadius:10,display:'flex',alignItems:'center',
                    justifyContent:'center',background:`${p.color}15`,border:`1px solid ${p.color}30`,flexShrink:0}}>
                    <FolderGit2 size={16} style={{color:p.color}}/>
                  </div>
                  <div style={{flex:2,minWidth:0}}>
                    <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:12,color:C.t1,
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</p>
                    {p.responsable&&<p style={{fontSize:10,color:C.t3,display:'flex',alignItems:'center',gap:4}}>
                      <Crown size={9} style={{color:'#ffce00'}}/>{p.responsable}</p>}
                  </div>
                  <span style={{padding:'2px 8px',borderRadius:5,fontSize:9,fontFamily:'Orbitron,sans-serif',
                    fontWeight:800,background:`${sc}12`,color:sc,border:`1px solid ${sc}25`,flexShrink:0}}>{sl}</span>
                  <div style={{flex:1,minWidth:80}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3,fontSize:10,color:C.t3}}>
                      <span>{p.progress||0}%</span>
                    </div>
                    <div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:10,overflow:'hidden'}}>
                      <div style={{width:`${p.progress||0}%`,height:'100%',
                        background:`linear-gradient(90deg,${p.color},${p.color}88)`,borderRadius:10}}/>
                    </div>
                  </div>
                  <span style={{fontSize:10,color:C.t3,display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                    <Users size={11}/>{teamCount}
                  </span>
                  {dl!==null&&<span style={{fontSize:10,color:dl<0?'#ff2d78':dl<=7?'#ffce00':C.t3,
                    display:'flex',alignItems:'center',gap:3,flexShrink:0}}>
                    <Clock size={10}/>{dl<0?`${Math.abs(dl)}j retard`:dl===0?'Auj.':`${dl}j`}
                  </span>}
                  <div style={{display:'flex',gap:4}} onClick={e=>e.stopPropagation()}>
                    {can('canEdit')&&<button onClick={e=>{e.stopPropagation();setModal({type:'edit',p})}}
                      style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:4,borderRadius:5,display:'flex'}}>
                      <Edit size={12}/>
                    </button>}
                    {can('canDelete')&&<button onClick={e=>{e.stopPropagation();handleDelete(p.id)}}
                      style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:4,borderRadius:5,display:'flex'}}>
                      <Trash2 size={12}/>
                    </button>}
                  </div>
                </motion.div>
              )

              // ── Vue GRILLE ──
              return(
                <motion.div key={p.id}
                  initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}
                  exit={{opacity:0,scale:0.95}} transition={{delay:i*0.04}}
                  whileHover={{y:-4,transition:{duration:0.2}}}
                  style={{background:'rgba(255,255,255,0.02)',border:`1px solid rgba(255,255,255,0.07)`,
                    borderRadius:14,padding:20,position:'relative',overflow:'hidden',cursor:'pointer',transition:'box-shadow 0.2s'}}
                  onClick={()=>setModal({type:'detail',p})}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:3,
                    background:`linear-gradient(90deg,${p.color},transparent)`}}/>
                  <div style={{position:'absolute',top:-30,right:-30,width:90,height:90,
                    borderRadius:'50%',background:`radial-gradient(circle,${p.color},transparent)`,
                    filter:'blur(20px)',opacity:0.08,pointerEvents:'none'}}/>
                  <div style={{position:'relative'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                      <div style={{width:42,height:42,borderRadius:11,display:'flex',
                        alignItems:'center',justifyContent:'center',
                        background:`${p.color}15`,border:`1px solid ${p.color}30`}}>
                        <FolderGit2 size={19} style={{color:p.color}}/>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:6}} onClick={e=>e.stopPropagation()}>
                        <span style={{padding:'2px 8px',borderRadius:5,fontSize:9,
                          fontFamily:'Orbitron,sans-serif',fontWeight:800,
                          background:`${sc}12`,color:sc,border:`1px solid ${sc}25`}}>{sl}</span>
                        {can('canEdit')&&<button onClick={e=>{e.stopPropagation();setModal({type:'edit',p})}}
                          style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:4,borderRadius:5,display:'flex'}}>
                          <Edit size={12}/>
                        </button>}
                        {can('canDelete')&&<button onClick={e=>{e.stopPropagation();handleDelete(p.id)}}
                          style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:4,borderRadius:5,display:'flex'}}>
                          <Trash2 size={12}/>
                        </button>}
                      </div>
                    </div>
                    <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:13,
                      color:C.t1,marginBottom:4,lineHeight:1.3}}>{p.name}</h3>
                    {p.responsable&&(
                      <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:C.t3,marginBottom:7}}>
                        <Crown size={10} style={{color:'#ffce00'}}/>{p.responsable}
                      </div>
                    )}
                    <p style={{fontSize:12,color:C.t2,marginBottom:12,lineHeight:1.6,
                      display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                      {p.description||<em style={{color:C.t3}}>Aucune description</em>}
                    </p>
                    {/* Avatars membres */}
                    {teamCount>0&&(
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
                        <div style={{display:'flex'}}>
                          {parseTeam(p.team_ids||p.team||[]).slice(0,4).map((id,idx)=>{
                            const u=allUsers.find(x=>String(x.id)===String(id))
                            if(!u) return null
                            const rc=ROLE_META?.[u.role]||{color:'#00c8ff'}
                            return(
                              <div key={id} title={u.name}
                                style={{width:24,height:24,borderRadius:7,flexShrink:0,
                                  marginLeft:idx>0?-8:0,
                                  background:`linear-gradient(135deg,${rc.color},${rc.color}99)`,
                                  border:`2px solid rgba(6,15,26,0.9)`,
                                  display:'flex',alignItems:'center',justifyContent:'center',
                                  fontSize:8,fontFamily:'Orbitron,sans-serif',fontWeight:800,color:'#020408',
                                  position:'relative',zIndex:4-idx}}>
                                {ini?.(u.name)||u.name?.substring(0,2).toUpperCase()}
                              </div>
                            )
                          })}
                          {teamCount>4&&(
                            <div style={{width:24,height:24,borderRadius:7,marginLeft:-8,
                              background:'rgba(255,255,255,0.1)',border:`2px solid rgba(6,15,26,0.9)`,
                              display:'flex',alignItems:'center',justifyContent:'center',
                              fontSize:8,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>
                              +{teamCount-4}
                            </div>
                          )}
                        </div>
                        <span style={{fontSize:10,color:C.t3}}>{teamCount} membre{teamCount>1?'s':''}</span>
                      </div>
                    )}
                    {techs.length>0&&(
                      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:10}}>
                        {techs.slice(0,3).map(t=>(
                          <span key={t} style={{fontSize:9,padding:'2px 8px',borderRadius:5,
                            background:`${p.color}10`,color:p.color,border:`1px solid ${p.color}22`,
                            fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{t}</span>
                        ))}
                        {techs.length>3&&<span style={{fontSize:9,color:C.t3,padding:'2px 4px',
                          fontFamily:'Orbitron,sans-serif'}}>+{techs.length-3}</span>}
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
                          style={{height:'100%',background:`linear-gradient(90deg,${p.color},${p.color}88)`,borderRadius:10}}/>
                      </div>
                    </div>
                    {/* Footer */}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:10,color:C.t3,
                      paddingTop:10,borderTop:`1px solid rgba(255,255,255,0.05)`}}>
                      <span style={{display:'flex',alignItems:'center',gap:4}}>
                        <Users size={9}/>{teamCount} membre{teamCount>1?'s':''}
                      </span>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        {dl!==null&&(
                          <span style={{color:dl<0?'#ff2d78':dl<=7?'#ffce00':C.t3,display:'flex',alignItems:'center',gap:3}}>
                            <Clock size={9}/>
                            {dl<0?`${Math.abs(dl)}j retard`:dl===0?"Auj.":`${dl}j`}
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
              <Empty icon={FolderGit2} msg="Aucun projet trouvé" sub="Modifiez vos filtres ou créez un nouveau projet"/>
            </div>
          )}
        </div>
      )}

      {/* ══ Modals ═══════════════════════════════ */}
      <AnimatePresence>
        {modal?.type==='detail'&&(
          <MShell wide title="DÉTAILS DU PROJET" onClose={()=>setModal(null)}>
            <ProjectDetail
              project={modal.p}
              allUsers={allUsers}
              canEdit={can('canEdit')}
              canDelete={can('canDelete')}
              onEdit={()=>setModal({type:'edit',p:modal.p})}
              onDelete={()=>handleDelete(modal.p.id)}
              onClose={()=>setModal(null)}
              onRecalculate={handleRecalculate}
              onUpdateTeam={(newIds)=>handleUpdateTeam(modal.p.id,newIds)}
            />
          </MShell>
        )}
        {(modal?.type==='add'||modal?.type==='edit')&&(
          <MShell wide title={modal.type==='add'?'NOUVEAU PROJET':'MODIFIER LE PROJET'}
            onClose={()=>setModal(null)}>
            <ProjectForm
              project={modal.p}
              allUsers={allUsers}
              onSave={handleSave}
              onClose={()=>setModal(null)}
            />
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}
