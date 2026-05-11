import React,{useState,useCallback} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {AlertTriangle} from 'lucide-react'
import {C,S} from '../../styles.js'

// ── Shell modale réutilisable ─────────────────────────────
export function MShell({title,onClose,children,maxW=480}){
  React.useEffect(()=>{
    const h=e=>{ if(e.key==='Escape') onClose() }
    window.addEventListener('keydown',h)
    return ()=>window.removeEventListener('keydown',h)
  },[onClose])
  return(
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',zIndex:900}}
        onClick={onClose}/>
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:901,padding:20}}>
        <motion.div initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}}
          exit={{opacity:0,scale:0.9}} transition={{type:'spring',damping:25,stiffness:300}}
          style={{width:'100%',maxWidth:maxW,...S.panel({padding:0})}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'14px 20px',borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:13,color:C.t1}}>{title}</span>
            <button onClick={onClose}
              style={{background:'none',border:'none',color:C.t3,cursor:'pointer',fontSize:20,lineHeight:1,transition:'color 0.15s'}}
              onMouseEnter={e=>e.target.style.color=C.nova}
              onMouseLeave={e=>e.target.style.color=C.t3}>×</button>
          </div>
          <div style={{padding:'18px 20px'}}>{children}</div>
        </motion.div>
      </div>
    </>
  )
}

// ── Titre de page stylé ──────────────────────────────────
export const PT=t=>(
  <h1 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:24,
    background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',
    WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',margin:0}}>
    {t}
  </h1>
)

// ── Confirmation custom (remplace window.confirm) ────────
export function useConfirm(){
  const [state,setState]=useState(null)
  const confirm=useCallback((msg)=>new Promise(resolve=>{
    setState({msg,resolve})
  }),[])
  const Dialog=state?(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:9999,
          display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
          style={{...S.panel({padding:28,maxWidth:380,width:'100%',textAlign:'center'})}}>
          <AlertTriangle size={32} style={{color:C.quantum,marginBottom:12}}/>
          <p style={{color:C.t1,fontSize:14,marginBottom:22,lineHeight:1.6}}>{state.msg}</p>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <button onClick={()=>{state.resolve(false);setState(null)}} style={S.btnGhost}>Annuler</button>
            <button onClick={()=>{state.resolve(true);setState(null)}}
              style={{...S.btnNeon,background:'rgba(255,45,120,0.15)',color:C.nova,border:`1px solid ${C.nova}44`}}>
              Confirmer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ):null
  return {confirm,Dialog}
}
