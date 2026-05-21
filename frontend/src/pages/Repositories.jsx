import React,{useState,useCallback,useEffect,useRef} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {
  FolderOpen,Plus,Trash2,Download,Upload,
  RefreshCw,Search,X,FileText,FileImage,
  FileArchive,File,Eye,Clock,HardDrive
} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {Empty,Loader} from '../components/ui/UI.jsx'
import {C,S} from '../styles.js'
import {MShell,PT,useConfirm} from './shared/PageUtils.jsx'

// ─────────────────────────────────────────────────────────
//  UTILITAIRES
// ─────────────────────────────────────────────────────────
function formatSize(bytes){
  if(!bytes||bytes===0) return '0 B'
  const k=1024, sizes=['B','KB','MB','GB']
  const i=Math.floor(Math.log(bytes)/Math.log(k))
  return parseFloat((bytes/Math.pow(k,i)).toFixed(1))+' '+sizes[i]
}

function getFileIcon(filename){
  const ext=(filename||'').split('.').pop()?.toLowerCase()
  if(['jpg','jpeg','png','gif','svg','webp'].includes(ext)) return {icon:FileImage, color:C.cyan}
  if(['pdf'].includes(ext))                                  return {icon:FileText,  color:'#ff6b6b'}
  if(['zip','rar','tar','gz','7z'].includes(ext))            return {icon:FileArchive,color:C.solar}
  if(['doc','docx','xls','xlsx','ppt','pptx'].includes(ext)) return {icon:FileText,  color:C.plasma}
  return {icon:File, color:C.t2}
}

function getFileType(filename){
  const ext=(filename||'').split('.').pop()?.toLowerCase()
  if(['jpg','jpeg','png','gif','svg','webp'].includes(ext)) return 'Image'
  if(['pdf'].includes(ext))                                  return 'PDF'
  if(['zip','rar','tar','gz','7z'].includes(ext))            return 'Archive'
  if(['doc','docx'].includes(ext))                           return 'Word'
  if(['xls','xlsx'].includes(ext))                           return 'Excel'
  if(['ppt','pptx'].includes(ext))                           return 'PowerPoint'
  return ext?.toUpperCase()||'Fichier'
}

// ─────────────────────────────────────────────────────────
//  FILE CARD
// ─────────────────────────────────────────────────────────
function FileCard({f,canEdit,onDelete,onDownload,index}){
  const [hov,setHov]=useState(false)
  const {icon:Icon,color}=getFileIcon(f.name||f.filename)
  const type=getFileType(f.name||f.filename)

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
        border:`1px solid ${hov?color+'55':'rgba(255,255,255,0.07)'}`,
        borderRadius:14,padding:20,
        transition:'all 0.3s ease',
        boxShadow:hov?`0 8px 32px ${color}18,inset 0 1px 0 rgba(255,255,255,0.04)`:'none',
        display:'flex',flexDirection:'column',gap:0
      }}>
      <motion.div animate={{opacity:hov?1:0.6}} transition={{duration:0.3}}
        style={{position:'absolute',top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,${color},transparent)`,borderRadius:'2px 2px 0 0'}}/>
      <motion.div animate={{opacity:hov?1:0}} transition={{duration:0.3}}
        style={{position:'absolute',inset:0,pointerEvents:'none',
          background:`radial-gradient(circle at 20% 50%,${color}10,transparent 60%)`}}/>

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:9,minWidth:0}}>
          <div style={{width:34,height:34,borderRadius:9,flexShrink:0,
            background:`linear-gradient(135deg,${color}22,${color}11)`,
            border:`1px solid ${color}33`,
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Icon size={16} style={{color}}/>
          </div>
          <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:12,
            color:hov?C.cyan:C.t1,overflow:'hidden',textOverflow:'ellipsis',
            whiteSpace:'nowrap',transition:'color 0.2s'}}
            title={f.name||f.filename}>
            {f.name||f.filename||'Fichier sans nom'}
          </span>
        </div>
        <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
          padding:'3px 8px',borderRadius:6,flexShrink:0,marginLeft:8,
          background:`${color}14`,color,border:`1px solid ${color}28`}}>
          {type}
        </span>
      </div>

      {f.description&&(
        <p style={{fontSize:12,color:C.t3,marginBottom:13,lineHeight:1.6,
          overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
          {f.description}
        </p>
      )}

      <div style={{display:'flex',gap:12,fontSize:11,color:C.t2,marginBottom:13,flexWrap:'wrap'}}>
        {f.size!=null&&(
          <span style={{display:'flex',alignItems:'center',gap:4}}>
            <HardDrive size={11} style={{color:C.t3}}/>{formatSize(f.size)}
          </span>
        )}
        {f.uploaded_by&&(
          <span style={{display:'flex',alignItems:'center',gap:4,color:C.t3}}>
            <Eye size={11}/>{f.uploaded_by}
          </span>
        )}
      </div>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
        borderTop:`1px solid rgba(255,255,255,0.06)`,paddingTop:11,marginTop:'auto'}}>
        <span style={{fontSize:10,color:C.t3,display:'flex',alignItems:'center',gap:4}}>
          <Clock size={9}/>
          {f.created_at
            ?new Date(f.created_at).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
            :'—'}
        </span>
        <div style={{display:'flex',gap:6}}>
          <button onClick={()=>onDownload(f)} title="Télécharger"
            style={{...S.btnGhost,padding:'5px 9px',display:'inline-flex',alignItems:'center',gap:4,fontSize:10}}>
            <Download size={10}/> Télécharger
          </button>
          {canEdit&&(
            <button onClick={()=>onDelete(f.id)} title="Supprimer"
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
//  UPLOAD MODAL
// ─────────────────────────────────────────────────────────
function UploadForm({onSave,onClose,saving}){
  const [file,setFile]=useState(null)
  const [desc,setDesc]=useState('')
  const [drag,setDrag]=useState(false)
  const [err,setErr]=useState('')
  const inputRef=useRef()

  const MAX_MB=50
  const ALLOWED=['pdf','doc','docx','xls','xlsx','ppt','pptx',
                 'jpg','jpeg','png','gif','svg','webp',
                 'zip','rar','tar','gz','7z','txt','csv','json','xml']

  const validate=(f)=>{
    if(!f) return 'Veuillez sélectionner un fichier'
    const ext=f.name.split('.').pop()?.toLowerCase()
    if(!ALLOWED.includes(ext)) return `Type non autorisé (.${ext})`
    if(f.size>MAX_MB*1024*1024) return `Fichier trop lourd (max ${MAX_MB} MB)`
    return ''
  }

  const handleFile=(f)=>{ const e=validate(f); setErr(e); if(!e) setFile(f) }
  const submit=()=>{ const e=validate(file); if(e){ setErr(e); return }; onSave({file,description:desc}) }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div
        onDragOver={e=>{e.preventDefault();setDrag(true)}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)handleFile(f)}}
        onClick={()=>inputRef.current?.click()}
        style={{
          border:`2px dashed ${drag?C.cyan:err?'#ff2d78':'rgba(255,255,255,0.15)'}`,
          borderRadius:12,padding:'28px 20px',textAlign:'center',cursor:'pointer',
          background:drag?'rgba(0,200,255,0.05)':file?'rgba(0,255,136,0.04)':'rgba(255,255,255,0.02)',
          transition:'all 0.2s'
        }}>
        <input ref={inputRef} type="file"
          accept={ALLOWED.map(e=>'.'+e).join(',')}
          style={{display:'none'}}
          onChange={e=>{ const f=e.target.files[0]; if(f) handleFile(f) }}/>
        <Upload size={28} style={{color:file?C.neon:drag?C.cyan:C.t3,marginBottom:10}}/>
        {file
          ?<p style={{color:C.neon,fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:12}}>
              {file.name}<br/><span style={{color:C.t3,fontWeight:400}}>{formatSize(file.size)}</span>
            </p>
          :<>
              <p style={{color:C.t1,fontSize:13,fontWeight:600,marginBottom:4}}>Glissez votre fichier ici</p>
              <p style={{color:C.t3,fontSize:11}}>ou cliquez pour parcourir</p>
              <p style={{color:C.t3,fontSize:10,marginTop:8}}>PDF, Word, Excel, Images, Archives — max {MAX_MB} MB</p>
            </>
        }
      </div>
      {err&&<p style={{color:'#ff2d78',fontSize:11,marginTop:-8}}>{err}</p>}

      <div>
        <label style={S.label}>Description (optionnel)</label>
        <textarea
          style={{...S.input,resize:'vertical',minHeight:60,fontFamily:'inherit'}}
          value={desc} onChange={e=>setDesc(e.target.value)}
          placeholder="Décrivez ce fichier..."/>
      </div>

      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
        <button onClick={onClose} style={S.btnGhost} disabled={saving}>Annuler</button>
        <button onClick={submit} style={S.btnNeon} disabled={saving||!file||!!err}>
          {saving?'Envoi en cours…':<><Upload size={12}/> Déposer le fichier</>}
        </button>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
//  PAGE PRINCIPALE — DÉPÔT DE FICHIERS
// ═════════════════════════════════════════════════════════
export function Repositories(){
  const {getFiles,uploadFile,deleteFile,downloadFile,showToast}=useApp()
  const {can}=useAuth()
  const {confirm,Dialog}=useConfirm()

  const [files,  setFiles] =useState([])
  const [modal,  setModal] =useState(false)
  const [busy,   setBusy]  =useState(true)
  const [saving, setSaving]=useState(false)
  const [search, setSearch]=useState('')
  const [filter, setFilter]=useState('all')

  const load=useCallback(async()=>{
    setBusy(true)
    try{ setFiles(await getFiles()||[]) }
    catch(e){ showToast(e?.message||'Erreur de chargement','danger') }
    finally{ setBusy(false) }
  },[getFiles,showToast])

  useEffect(()=>{ load() },[load])

  const save=async({file,description})=>{
    setSaving(true)
    try{
      await uploadFile(file,description)
      showToast('Fichier déposé avec succès !','success')
      setModal(false)
      load()
    }catch(e){
      showToast(e?.message||'Erreur lors du dépôt','danger')
    }finally{ setSaving(false) }
  }

  const del=async id=>{
    const ok=await confirm('Supprimer ce fichier ? Cette action est irréversible.')
    if(!ok) return
    try{
      await deleteFile(id)
      showToast('Fichier supprimé','success')
      setFiles(prev=>prev.filter(f=>f.id!==id))
    }catch(e){ showToast(e?.message||'Erreur','danger') }
  }

  const download=async(f)=>{
    try{
      await downloadFile(f.id, f.name||f.filename)
      showToast('Téléchargement démarré','success')
    }catch(e){ showToast(e?.message||'Erreur de téléchargement','danger') }
  }

  const TYPE_GROUPS={
    image:  ['jpg','jpeg','png','gif','svg','webp'],
    doc:    ['pdf','doc','docx','xls','xlsx','ppt','pptx'],
    archive:['zip','rar','tar','gz','7z'],
  }

  const filtered=files
    .filter(f=>{
      if(filter==='all') return true
      const ext=(f.name||f.filename||'').split('.').pop()?.toLowerCase()
      return TYPE_GROUPS[filter]?.includes(ext)
    })
    .filter(f=>!search
      ||(f.name||f.filename||'').toLowerCase().includes(search.toLowerCase())
      ||(f.description||'').toLowerCase().includes(search.toLowerCase())
    )

  const canEdit=can('repositories')
  const totalSize=files.reduce((s,f)=>s+(f.size||0),0)

  if(busy) return <Loader/>

  return(
    <div>
      {Dialog}

      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        transition={{duration:0.4}}
        style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
          flexWrap:'wrap',gap:14,marginBottom:22}}>
        <div>
          {PT('DÉPÔT DE FICHIERS')}
          <div style={{display:'flex',gap:14,marginTop:5,flexWrap:'wrap'}}>
            <span style={{fontSize:12,color:C.t2}}>{files.length} fichier{files.length!==1?'s':''}</span>
            {totalSize>0&&<span style={{fontSize:12,color:C.t3}}>
              {formatSize(totalSize)} utilisés
            </span>}
          </div>
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={load} style={{...S.btnGhost,padding:'8px 12px'}} title="Rafraîchir">
            <RefreshCw size={13}/>
          </button>
          {canEdit&&(
            <button onClick={()=>setModal(true)} style={S.btnCyan}>
              <Upload size={13}/> Déposer un fichier
            </button>
          )}
        </div>
      </motion.div>

      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
        transition={{delay:0.1,duration:0.4}}
        style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <Search size={13} style={{position:'absolute',left:11,top:'50%',
            transform:'translateY(-50%)',color:C.t3,pointerEvents:'none'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Rechercher un fichier…"
            style={{...S.input,paddingLeft:32,paddingRight:search?32:12}}/>
          {search&&(
            <button onClick={()=>setSearch('')}
              style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',
                background:'none',border:'none',color:C.t3,cursor:'pointer',display:'flex',padding:2}}>
              <X size={12}/>
            </button>
          )}
        </div>
        {[{v:'all',l:'Tous'},{v:'doc',l:'📄 Documents'},{v:'image',l:'🖼️ Images'},{v:'archive',l:'📦 Archives'}]
          .map(({v,l})=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:'7px 14px',borderRadius:8,cursor:'pointer',
              border:`1px solid ${filter===v?C.cyan:C.border}`,
              background:filter===v?'rgba(0,200,255,0.1)':'none',
              color:filter===v?C.cyan:C.t3,
              fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,
              transition:'all 0.15s'}}>
            {l}
          </button>
        ))}
      </motion.div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:18}}>
        <AnimatePresence>
          {filtered.map((f,i)=>(
            <FileCard key={f.id} f={f} index={i}
              canEdit={canEdit} onDelete={del} onDownload={download}/>
          ))}
        </AnimatePresence>
        {!busy&&filtered.length===0&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{gridColumn:'1/-1'}}>
            <Empty icon={FolderOpen}
              msg={search||filter!=='all'?'Aucun résultat':'Aucun fichier déposé'}
              sub={search?'Essayez un autre terme':filter!=='all'?'Changez le filtre':'Déposez votre premier fichier'}/>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modal&&(
          <MShell title="DÉPOSER UN FICHIER" onClose={()=>!saving&&setModal(false)}>
            <UploadForm onSave={save} onClose={()=>setModal(false)} saving={saving}/>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Repositories
