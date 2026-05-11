import React,{useState,useEffect} from 'react'
import {motion} from 'framer-motion'
import {LogOut,Check} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext.jsx'
import {C,S} from '../styles.js'

// ════════════════════════════════════════════
//  LOGOUT
// ════════════════════════════════════════════
export function LogoutPage(){
  const {logout}=useAuth()
  const navigate=useNavigate()
  const [prog,setProg]=useState(0)
  const [done,setDone]=useState(false)
  const [error,setError]=useState(null)

  useEffect(()=>{
    const iv=setInterval(()=>{
      setProg(p=>{
        if(p>=100){
          clearInterval(iv)
          setDone(true)
          setTimeout(async()=>{
            try{ await logout() }
            catch(e){ setError(e?.message||'Erreur lors de la déconnexion') }
            finally{ navigate('/login') }
          },700)
          return 100
        }
        return p+1.5
      })
    },45)
    return()=>clearInterval(iv)
  },[logout,navigate])

  const steps=[
    {l:'Sauvegarde des préférences',     done:prog>25},
    {l:'Fermeture des connexions actives',done:prog>55},
    {l:'Nettoyage de la session',         done:prog>80},
    {l:'Redirection vers la connexion',   done:prog>95},
  ]

  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'70vh'}}>
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
        style={{...S.panel({padding:44,maxWidth:420,width:'100%',textAlign:'center'})}}>

        <motion.div
          animate={done?{scale:[1,1.3,1]}:{rotate:[0,-8,8,-8,0]}}
          transition={done?{duration:0.5}:{delay:0.5,duration:0.6}}
          style={{width:72,height:72,borderRadius:18,margin:'0 auto 20px',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,
            background:done?'rgba(0,255,136,0.1)':'rgba(255,45,120,0.1)',
            border:`1px solid ${done?'rgba(0,255,136,0.3)':'rgba(255,45,120,0.3)'}`,transition:'all 0.5s'}}>
          {done?'✓':<LogOut size={30} style={{color:C.nova}}/>}
        </motion.div>

        <h2 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:19,color:C.t1,marginBottom:7}}>
          {error?'Erreur de déconnexion':done?'À bientôt ! 👋':'Déconnexion en cours...'}
        </h2>
        {error
          ?<p style={{color:C.nova,fontSize:13,marginBottom:24}}>{error}</p>
          :<p style={{color:C.t2,fontSize:13,marginBottom:24}}>Fermeture sécurisée de votre session DevEnviron</p>
        }

        {/* Barre progression */}
        {!error&&(
          <div style={{marginBottom:22}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:C.t3,marginBottom:6}}>
              <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700}}>Progression</span>
              <span style={{fontFamily:'JetBrains Mono,monospace'}}>{Math.round(prog)}%</span>
            </div>
            <div style={{height:5,background:'rgba(255,255,255,0.06)',borderRadius:10,overflow:'hidden'}}>
              <motion.div style={{height:'100%',borderRadius:10,background:'linear-gradient(90deg,#ff2d78,#7c3aed)',width:`${prog}%`}}/>
            </div>
          </div>
        )}

        {/* Étapes */}
        {!error&&(
          <div style={{textAlign:'left',marginBottom:24}}>
            {steps.map((s,i)=>(
              <motion.div key={i} initial={{opacity:0,x:-9}} animate={{opacity:1,x:0}} transition={{delay:0.2+i*0.1}}
                style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:20,height:20,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
                  background:s.done?'rgba(0,255,136,0.15)':'rgba(255,255,255,0.05)',
                  border:`1px solid ${s.done?'rgba(0,255,136,0.4)':'rgba(255,255,255,0.1)'}`,transition:'all 0.4s'}}>
                  {s.done
                    ?<Check size={10} style={{color:C.neon}}/>
                    :<motion.div animate={{opacity:[0.4,1,0.4]}} transition={{duration:1.2,repeat:Infinity}}
                      style={{width:5,height:5,borderRadius:'50%',background:C.t3}}/>}
                </div>
                <span style={{fontSize:12,color:s.done?C.t2:C.t3,transition:'color 0.4s'}}>{s.l}</span>
              </motion.div>
            ))}
          </div>
        )}

        <button onClick={async()=>{ try{ await logout() }catch{} finally{ navigate('/login') } }}
          style={{...S.btnNova,width:'100%',padding:'12px 18px',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
          <LogOut size={13}/> Déconnexion immédiate
        </button>
      </motion.div>
    </div>
  )
}
