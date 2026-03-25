import React,{useEffect,useState} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {CheckCircle,AlertTriangle,XCircle,Info,Bell,X} from 'lucide-react'
import {C,S,STATUS_META} from '../../styles.js'
import {useApp} from '../../context/AppContext.jsx'

// ── Badge coloré ──────────────────────────────────────────
export function Badge({color=C.cyan,children}){
  return(
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 9px',borderRadius:6,fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,letterSpacing:'0.05em',background:`${color}18`,color,border:`1px solid ${color}35`}}>
      {children}
    </span>
  )
}

// ── Badge statut ──────────────────────────────────────────
export function StatusBadge({status}){
  const m=STATUS_META[status]||{label:status||'—',color:C.t2}
  return <Badge color={m.color}>{m.label}</Badge>
}

// ── Barre de progression ──────────────────────────────────
export function Progress({value=0,color=C.cyan}){
  return(
    <div style={{height:5,background:'rgba(255,255,255,0.07)',borderRadius:10,overflow:'hidden'}}>
      <motion.div style={{height:'100%',borderRadius:10,background:`linear-gradient(90deg,${color},${C.plasma})`,boxShadow:`0 0 8px ${color}50`}}
        initial={{width:0}} animate={{width:`${Math.min(100,Math.max(0,value))}%`}} transition={{duration:1.1,ease:[0.4,0,0.2,1]}}/>
    </div>
  )
}

// ── Loader animé ──────────────────────────────────────────
export function Loader({fullScreen}){
  const inner=(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18}}>
      <div style={{position:'relative',width:56,height:56}}>
        {[C.cyan,C.plasma,C.neon].map((c,i)=>(
          <motion.div key={i} style={{position:'absolute',inset:0,borderRadius:'50%',border:`2px solid ${c}`,borderTopColor:'transparent',borderRightColor:'transparent'}}
            animate={{rotate:360}} transition={{duration:1+i*0.3,repeat:Infinity,ease:'linear'}}/>
        ))}
      </div>
      <div style={{display:'flex',gap:1}}>
        {'DEVENVIRON'.split('').map((ch,i)=>(
          <motion.span key={i} style={{fontFamily:'Orbitron,sans-serif',fontSize:10,fontWeight:700,color:C.t2}}
            animate={{opacity:[0.2,1,0.2]}} transition={{duration:1.5,repeat:Infinity,delay:i*0.07}}>{ch}</motion.span>
        ))}
      </div>
    </div>
  )
  if(fullScreen) return <div style={{position:'fixed',inset:0,background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>{inner}</div>
  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'60px 0'}}>{inner}</div>
}

// ── Toast notification ────────────────────────────────────
const TICONS={success:CheckCircle,warning:AlertTriangle,danger:XCircle,info:Info}
const TCOLS ={success:C.neon,warning:C.quantum,danger:C.nova,info:C.cyan}

export function ToastContainer(){
  const {toast}=useApp()
  if(!toast) return null
  const Icon=TICONS[toast.type]||Info
  const col=TCOLS[toast.type]||C.cyan
  return(
    <AnimatePresence>
      <motion.div key={toast.id} initial={{opacity:0,x:50,y:0}} animate={{opacity:1,x:0}} exit={{opacity:0,x:50}}
        style={{position:'fixed',top:76,right:20,zIndex:3000,...S.panel({padding:'12px 16px',display:'flex',alignItems:'center',gap:10,minWidth:280,maxWidth:380,borderLeft:`3px solid ${col}`,backdropFilter:'blur(16px)',boxShadow:`0 8px 32px rgba(0,0,0,0.4),0 0 20px ${col}20`})}}>
        <Icon size={16} style={{color:col,flexShrink:0}}/>
        <span style={{fontSize:13,color:C.t1,fontFamily:'Rajdhani,sans-serif',flex:1}}>{toast.msg}</span>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Modal global ──────────────────────────────────────────
export function Modal(){
  const {modal,closeModal}=useApp()
  useEffect(()=>{
    if(modal) document.body.style.overflow='hidden'
    else document.body.style.overflow=''
    return()=>{ document.body.style.overflow='' }
  },[modal])
  return(
    <AnimatePresence>
      {modal&&(
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',zIndex:900}}
            onClick={closeModal}/>
          <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:901,padding:20}}>
            <motion.div initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9,y:20}}
              transition={{type:'spring',damping:25,stiffness:300}}
              style={{width:'100%',maxWidth:520,...S.panel()}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 22px',borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:14,color:C.t1}}>{modal.title}</span>
                <button onClick={closeModal} style={{background:'none',border:'none',color:C.t3,cursor:'pointer',fontSize:20,lineHeight:1,display:'flex',alignItems:'center'}}>
                  <X size={16}/>
                </button>
              </div>
              <div style={{padding:'20px 22px'}}>{modal.content}</div>
              {modal.footer&&(
                <div style={{padding:'14px 22px',borderTop:`1px solid ${C.border}`,display:'flex',justifyContent:'flex-end',gap:10}}>
                  {modal.footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Champ de saisie ───────────────────────────────────────
export function Field({label,error,type='text',style:xs,...props}){
  const [focus,setFocus]=useState(false)
  return(
    <div style={{marginBottom:4}}>
      {label&&<label style={S.label}>{label}</label>}
      {type==='textarea'
        ?<textarea {...props} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
            style={{...S.input,resize:'none',...xs,borderColor:error?C.nova:focus?'rgba(0,200,255,0.5)':undefined,boxShadow:focus&&!error?'0 0 0 3px rgba(0,200,255,0.10)':undefined}}/>
        :<input type={type} {...props} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
            style={{...S.input,...xs,borderColor:error?C.nova:focus?'rgba(0,200,255,0.5)':undefined,boxShadow:focus&&!error?'0 0 0 3px rgba(0,200,255,0.10)':undefined}}/>
      }
      {error&&<p style={{fontSize:11,color:C.nova,marginTop:4}}>{error}</p>}
    </div>
  )
}

// ── En-tête de panneau ────────────────────────────────────
export function PanelHeader({icon:Icon,title,color=C.cyan,actions}){
  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,paddingBottom:14,borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:34,height:34,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:`${color}15`,border:`1px solid ${color}28`,flexShrink:0}}>
          <Icon size={16} style={{color}}/>
        </div>
        <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:14,color:C.t1}}>{title}</span>
      </div>
      {actions&&<div style={{display:'flex',alignItems:'center',gap:8}}>{actions}</div>}
    </div>
  )
}

// ── Carte statistique ─────────────────────────────────────
export function StatCard({icon:Icon,label,value,sub,color=C.cyan,delay=0}){
  return(
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay,duration:0.45}}
      style={{...S.panel({padding:20,position:'relative',overflow:'hidden'})}}>
      <div style={{position:'absolute',top:-20,right:-20,width:70,height:70,borderRadius:'50%',background:`radial-gradient(circle,${color},transparent)`,filter:'blur(18px)',opacity:0.14}}/>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',position:'relative'}}>
        <div>
          <p style={{fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:C.t2,marginBottom:8}}>{label}</p>
          <motion.p initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:delay+0.2,type:'spring',stiffness:200}}
            style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:30,color,lineHeight:1}}>{value}</motion.p>
          {sub&&<p style={{fontSize:11,color:C.t3,marginTop:4}}>{sub}</p>}
        </div>
        <div style={{width:42,height:42,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',background:`${color}15`,border:`1px solid ${color}28`,flexShrink:0}}>
          <Icon size={19} style={{color}}/>
        </div>
      </div>
    </motion.div>
  )
}

// ── Indicateur de badge notifications ────────────────────
export function NotifBadge({count}){
  if(!count) return null
  return(
    <span style={{position:'absolute',top:-4,right:-4,minWidth:16,height:16,borderRadius:8,background:C.nova,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#fff',padding:'0 4px',border:`1.5px solid ${C.bg}`}}>
      {count>99?'99+':count}
    </span>
  )
}

// ── État vide ─────────────────────────────────────────────
export function Empty({icon:Icon,msg,sub}){
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'50px 20px',gap:14}}>
      <div style={{width:56,height:56,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,200,255,0.06)',border:`1px solid rgba(0,200,255,0.12)`}}>
        <Icon size={24} style={{color:C.t3}}/>
      </div>
      <p style={{fontFamily:'Orbitron,sans-serif',fontSize:12,color:C.t2,fontWeight:700,textAlign:'center'}}>{msg}</p>
      {sub&&<p style={{fontSize:11,color:C.t3,textAlign:'center'}}>{sub}</p>}
    </div>
  )
}

// ── Garde de permission ───────────────────────────────────
export function PermGuard({can,children}){
  if(!can) return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:300,gap:16}}>
      <span style={{fontSize:48}}>🔒</span>
      <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:16,color:C.t2}}>Accès refusé</p>
      <p style={{fontSize:13,color:C.t3}}>Votre rôle ne permet pas d'accéder à cette section.</p>
    </div>
  )
  return children
}

// ── Modal de confirmation ─────────────────────────────────
export function ConfirmModal({title,message,onConfirm,onCancel,danger=false}){
  return(
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <p style={{fontSize:14,color:C.t2,lineHeight:1.6}}>{message}</p>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <button onClick={onCancel} style={S.btnGhost}>Annuler</button>
        <button onClick={onConfirm} style={danger?S.btnNova:S.btnCyan}>Confirmer</button>
      </div>
    </div>
  )
}

// ── Bannière mode hors-ligne ──────────────────────────────
export function OfflineBanner(){
  const [status,setStatus] = useState('checking') // 'checking' | 'online' | 'offline'
  useEffect(()=>{
    const check=async()=>{
      try{
        await fetch('http://localhost:8000/api/health',{method:'GET',signal:AbortSignal.timeout(3000)})
        setStatus('online')
      } catch{
        setStatus('offline')
      }
    }
    check()
    const iv=setInterval(check,15000)
    return()=>clearInterval(iv)
  },[])
  if(status==='online') return null
  return(
    <AnimatePresence>
      <motion.div initial={{y:-50}} animate={{y:0}} exit={{y:-50}}
        style={{position:'fixed',top:0,left:0,right:0,zIndex:9998,
          background: status==='checking'?'rgba(0,200,255,0.1)':'rgba(255,45,120,0.12)',
          borderBottom:`1px solid ${status==='checking'?'rgba(0,200,255,0.25)':'rgba(255,45,120,0.35)'}`,
          padding:'8px 20px',display:'flex',alignItems:'center',gap:10}}>
        {status==='checking'
          ? <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:'linear'}}
              style={{width:13,height:13,borderRadius:'50%',border:`2px solid ${C.cyan}`,borderTopColor:'transparent',flexShrink:0}}/>
          : <span style={{fontSize:14}}>🔌</span>
        }
        <span style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,
          color:status==='checking'?C.cyan:C.nova}}>
          {status==='checking'?'CONNEXION AU SERVEUR...':'BACKEND INACCESSIBLE'}
        </span>
        {status==='offline'&&(
          <span style={{fontSize:11,color:C.t2}}>
            — Lancez <code style={{color:C.neon,fontFamily:'JetBrains Mono,monospace',fontSize:11}}>php artisan serve</code> dans un terminal
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
