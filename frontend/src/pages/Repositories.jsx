import React,{useState,useCallback,useEffect} from 'react'  // ✅ FIX 1: useEffect tsy import
import {motion,AnimatePresence} from 'framer-motion'
import {Database,Plus,Trash2,Star,GitFork,GitBranch,ExternalLink,Copy,RefreshCw,GitCommit,Lock,Globe,Search,X} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {Empty,Loader} from '../components/ui/UI.jsx'  // ✅ FIX 2: Loader tsy import
import {C,S} from '../styles.js'
import {MShell,PT,useConfirm} from './shared/PageUtils.jsx'

// ─────────────────────────────────────────────────────────
//  REPO CARD
// ─────────────────────────────────────────────────────────
function RepoCard({r,canEdit,onDelete,onCopy,index}){
  const [hov,setHov]=useState(false)
  const vc=r.visibility==='public'?C.neon:C.t2
  const isPublic=r.visibility==='public'

  return(
    <motion.div
      initial={{opacity:0,y:20,scale:0.97}}
      animate={{opacity:1,y:0,scale:1}}
      exit={{opacity:0,scale:0.95}}
      transition={{delay:index*0.06,duration:0.4,ease:[0.22,1,0.36,1]}}
      onHoverStart={()=>setHov(true)}
      onHoverEnd={()=>setHov(false)}
      style={{
        position:'relative',overflow:'hidden',
        background:hov?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.02)',
        border:`1px solid ${hov?vc+'55':'rgba(255,255,255,0.07)'}`,
        borderRadius:14,padding:20,
        transition:'all 0.3s ease',
        boxShadow:hov?`0 8px 32px ${vc}18,inset 0 1px 0 rgba(255,255,255,0.04)`:'none',
        display:'flex',flexDirection:'column',gap:0
      }}>

      {/* Top color bar */}
      <motion.div animate={{opacity:hov?1:0.6}} transition={{duration:0.3}}
        style={{position:'absolute',top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,${vc},transparent)`,borderRadius:'2px 2px 0 0'}}/>

      {/* Ambient glow */}
      <motion.div animate={{opacity:hov?1:0}} transition={{duration:0.3}}
        style={{position:'absolute',inset:0,pointerEvents:'none',
          background:`radial-gradient(circle at 20% 50%,${vc}10,transparent 60%)`}}/>

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:9,minWidth:0}}>
          {/* ✅ FIX 3: fa-git-alt → lucide icon (pas de FontAwesome garanti) */}
          <div style={{width:34,height:34,borderRadius:9,flexShrink:0,
            background:`linear-gradient(135deg,${C.solar}22,${C.solar}11)`,
            border:`1px solid ${C.solar}33`,
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            <GitCommit size={16} style={{color:C.solar}}/>
          </div>
          <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:13,
            color:hov?C.cyan:C.t1,overflow:'hidden',textOverflow:'ellipsis',
            whiteSpace:'nowrap',transition:'color 0.2s'}}>{r.name}</span>
        </div>
        <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
          padding:'3px 8px',borderRadius:6,flexShrink:0,marginLeft:8,
          background:`${vc}14`,color:vc,border:`1px solid ${vc}28`,
          display:'flex',alignItems:'center',gap:4}}>
          {isPublic?<Globe size={8}/>:<Lock size={8}/>}
          {isPublic?'PUBLIC':'PRIVÉ'}
        </span>
      </div>

      {/* Description */}
      <p style={{fontSize:12,color:C.t3,marginBottom:13,lineHeight:1.6,
        minHeight:36,overflow:'hidden',
        display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
        {r.description||'Aucune description'}
      </p>

      {/* Stats */}
      <div style={{display:'flex',gap:12,fontSize:11,color:C.t2,marginBottom:13,flexWrap:'wrap'}}>
        {r.lang&&(
          <span style={{display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:C.cyan,flexShrink:0}}/>
            {r.lang}
          </span>
        )}
        <span style={{display:'flex',alignItems:'center',gap:4}}>
          <Star size={11} style={{color:C.quantum}}/>{r.stars||0}
        </span>
        <span style={{display:'flex',alignItems:'center',gap:4}}>
          <GitFork size={11}/>{r.forks||0}
        </span>
        <span style={{display:'flex',alignItems:'center',gap:4}}>
          <GitBranch size={11}/>{r.branches||1}
        </span>
      </div>

      {/* Footer */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
        borderTop:`1px solid rgba(255,255,255,0.06)`,paddingTop:11,marginTop:'auto'}}>
        <span style={{fontSize:10,color:C.t3}}>
          {r.updated_at
            ?new Date(r.updated_at).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
            :r.updated||'—'}
        </span>
        <div style={{display:'flex',gap:6}}>
          {r.url&&(
            <>
              <button onClick={()=>onCopy(r.url)} title="Copier l'URL"
                style={{...S.btnGhost,padding:'5px 8px',display:'inline-flex',alignItems:'center',gap:4,fontSize:10}}>
                <Copy size={10}/>
              </button>
              <a href={r.url} target="_blank" rel="noreferrer" title="Ouvrir"
                style={{...S.btnGhost,padding:'5px 9px',textDecoration:'none',
                  display:'inline-flex',alignItems:'center',gap:4,fontSize:10}}>
                <ExternalLink size={10}/> Voir
              </a>
            </>
          )}
          {canEdit&&(
            <button onClick={()=>onDelete(r.id)} title="Supprimer"
              style={{background:'none',border:'none',color:C.t3,cursor:'pointer',
                padding:'5px 6px',borderRadius:6,display:'flex',transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.color='#ff2d78';e.currentTarget.style.background='rgba(255,45,120,0.1)'}}
              onMouseLeave={e=>{e.currentTarget.style.color=C.t3;e.currentTarget.style.background='none'}}>
              <Trash2 size={12}/>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
//  FORM MODAL
// ─────────────────────────────────────────────────────────
function RepoForm({f,setF,onSave,onClose,saving}){
  const [err,setErr]=useState({})

  const validate=()=>{
    const e={}
    if(!f.name.trim()||f.name.trim().length<2) e.name='Nom requis (min 2 caractères)'
    setErr(e)
    return !Object.keys(e).length
  }

  const submit=()=>{
    if(!validate()) return
    onSave()
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Nom */}
      <div>
        <label style={S.label}>Nom du dépôt *</label>
        <input
          style={{...S.input,...(err.name?{borderColor:'#ff2d78'}:{})}}
          value={f.name}
          onChange={e=>{
            setF(x=>({...x,name:e.target.value.replace(/\s+/g,'-').toLowerCase()}))
            setErr(x=>({...x,name:''}))
          }}
          placeholder="ex: mon-projet"
          onKeyDown={e=>e.key==='Enter'&&submit()}
          autoFocus/>
        {err.name&&<p style={{color:'#ff2d78',fontSize:10,marginTop:4}}>{err.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label style={S.label}>Description</label>
        <textarea
          style={{...S.input,resize:'vertical',minHeight:68,fontFamily:'inherit'}}
          value={f.description}
          onChange={e=>setF(x=>({...x,description:e.target.value}))}
          placeholder="Description du dépôt..."/>
      </div>

      {/* URL */}
      <div>
        <label style={S.label}>URL du dépôt</label>
        <input
          style={S.input}
          value={f.url||''}
          onChange={e=>setF(x=>({...x,url:e.target.value}))}
          placeholder="https://github.com/user/repo"/>
      </div>

      {/* Visibilité + Langage */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <label style={S.label}>Visibilité</label>
          <select style={{...S.input,background:C.surface}} value={f.visibility}
            onChange={e=>setF(x=>({...x,visibility:e.target.value}))}>
            <option value="public">🌐 Public</option>
            <option value="private">🔒 Privé</option>
          </select>
        </div>
        <div>
          <label style={S.label}>Langage principal</label>
          <select style={{...S.input,background:C.surface}} value={f.lang}
            onChange={e=>setF(x=>({...x,lang:e.target.value}))}>
            {['JavaScript','TypeScript','PHP','Python','Java','Go','Rust','C++','CSS','HTML'].map(l=>(
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
        <button onClick={onClose} style={S.btnGhost} disabled={saving}>Annuler</button>
        <button onClick={submit} style={S.btnNeon} disabled={saving}>
          {saving?'Création…':'Créer le dépôt'}
        </button>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
//  PAGE PRINCIPALE
// ═════════════════════════════════════════════════════════
export function Repositories(){
  const {getRepos,addRepo,deleteRepo,showToast}=useApp()
  const {can}=useAuth()
  const {confirm,Dialog}=useConfirm()

  const [repos,   setRepos]  =useState([])
  const [modal,   setModal]  =useState(false)
  const [busy,    setBusy]   =useState(true)
  const [saving,  setSaving] =useState(false)
  const [search,  setSearch] =useState('')
  const [filter,  setFilter] =useState('all')
  const [f,setF]=useState({name:'',description:'',url:'',visibility:'private',lang:'JavaScript'})

  // ── Load ─────────────────────────────────────────────
  const load=useCallback(async()=>{
    setBusy(true)
    try{ setRepos(await getRepos()||[]) }
    catch(e){ showToast(e?.message||'Erreur de chargement','danger') }
    finally{ setBusy(false) }
  },[getRepos,showToast])

  useEffect(()=>{ load() },[load])

  // ── Save ─────────────────────────────────────────────
  const save=async()=>{
    setSaving(true)
    try{
      await addRepo(f)
      showToast('Dépôt créé !','success')
      setModal(false)
      setF({name:'',description:'',url:'',visibility:'private',lang:'JavaScript'})
      load()
    }catch(e){
      showToast(e?.message||'Erreur lors de la création','danger')
    }finally{
      setSaving(false)
    }
  }

  // ── Delete ───────────────────────────────────────────
  const del=async id=>{
    const ok=await confirm('Supprimer ce dépôt ? Cette action est irréversible.')
    if(!ok) return
    try{
      await deleteRepo(id)
      showToast('Dépôt supprimé','success')
      // ✅ FIX 4: optimistic update — tsy reload complet
      setRepos(prev=>prev.filter(r=>r.id!==id))
    }catch(e){
      showToast(e?.message||'Erreur lors de la suppression','danger')
    }
  }

  // ── Copy URL ─────────────────────────────────────────
  const copyUrl=async url=>{
    try{
      await navigator.clipboard.writeText(url)
      showToast('URL copiée !','success')
    }catch{
      showToast('Impossible de copier','warning')
    }
  }

  // ── Filter ───────────────────────────────────────────
  const filtered=repos
    .filter(r=>filter==='all'||r.visibility===filter)
    .filter(r=>!search
      ||r.name?.toLowerCase().includes(search.toLowerCase())
      ||r.description?.toLowerCase().includes(search.toLowerCase())
      ||r.lang?.toLowerCase().includes(search.toLowerCase())
    )

  const canEdit=can('repositories')

  // ── Stats rapides ────────────────────────────────────
  const pub=repos.filter(r=>r.visibility==='public').length
  const priv=repos.filter(r=>r.visibility==='private').length

  // ── Render ───────────────────────────────────────────
  if(busy) return <Loader/>

  return(
    <div>
      {Dialog}

      {/* En-tête */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        transition={{duration:0.4}}
        style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
          flexWrap:'wrap',gap:14,marginBottom:22}}>
        <div>
          {PT('DÉPÔTS GIT')}
          <div style={{display:'flex',gap:14,marginTop:5,flexWrap:'wrap'}}>
            <span style={{fontSize:12,color:C.t2}}>{repos.length} dépôt{repos.length!==1?'s':''}</span>
            {pub>0&&<span style={{fontSize:12,color:C.neon}}>🌐 {pub} public{pub>1?'s':''}</span>}
            {priv>0&&<span style={{fontSize:12,color:C.t3}}>🔒 {priv} privé{priv>1?'s':''}</span>}
          </div>
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={load} style={{...S.btnGhost,padding:'8px 12px'}} title="Rafraîchir">
            <RefreshCw size={13}/>
          </button>
          {canEdit&&(
            <button onClick={()=>setModal(true)} style={S.btnCyan}>
              <Plus size={13}/> Nouveau dépôt
            </button>
          )}
        </div>
      </motion.div>

      {/* Filtres */}
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
        transition={{delay:0.1,duration:0.4}}
        style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>

        {/* Search input */}
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <Search size={13} style={{position:'absolute',left:11,top:'50%',
            transform:'translateY(-50%)',color:C.t3,pointerEvents:'none'}}/>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Rechercher un dépôt, langage…"
            style={{...S.input,paddingLeft:32,paddingRight:search?32:12}}/>
          {search&&(
            <button onClick={()=>setSearch('')}
              style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',
                background:'none',border:'none',color:C.t3,cursor:'pointer',
                display:'flex',padding:2}}>
              <X size={12}/>
            </button>
          )}
        </div>

        {/* Filtres visibilité */}
        {['all','public','private'].map(v=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:'7px 14px',borderRadius:8,cursor:'pointer',
              border:`1px solid ${filter===v?C.cyan:C.border}`,
              background:filter===v?'rgba(0,200,255,0.1)':'none',
              color:filter===v?C.cyan:C.t3,
              fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,
              transition:'all 0.15s'}}>
            {v==='all'?'Tous':v==='public'?'🌐 Publics':'🔒 Privés'}
          </button>
        ))}
      </motion.div>

      {/* Grille repos */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:18}}>
        <AnimatePresence>
          {filtered.map((r,i)=>(
            <RepoCard key={r.id} r={r} index={i}
              canEdit={canEdit}
              onDelete={del}
              onCopy={copyUrl}/>
          ))}
        </AnimatePresence>

        {/* État vide */}
        {!busy&&filtered.length===0&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            style={{gridColumn:'1/-1'}}>
            <Empty
              icon={Database}
              msg={search||filter!=='all'?'Aucun résultat':'Aucun dépôt'}
              sub={search?'Essayez un autre terme':filter!=='all'?'Changez le filtre':'Créez votre premier dépôt Git'}/>
          </motion.div>
        )}
      </div>

      {/* Modal création */}
      <AnimatePresence>
        {modal&&(
          <MShell title="NOUVEAU DÉPÔT GIT" onClose={()=>!saving&&setModal(false)}>
            <RepoForm f={f} setF={setF} onSave={save} onClose={()=>setModal(false)} saving={saving}/>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Repositories
