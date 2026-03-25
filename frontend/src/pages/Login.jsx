import React,{useState,useEffect} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {motion,AnimatePresence} from 'framer-motion'
import {Zap,ArrowRight,Eye,EyeOff,Shield,Code2,UserCheck,WifiOff,RefreshCw,Server} from 'lucide-react'
import Canvas4D from '../components/auth/Canvas4D.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {checkServer, serverStatus} from '../services/api.js'
import {C,S} from '../styles.js'

const ROLES=[
  {id:'admin', icon:Shield,    color:'#ff2d78',label:'Admin',      desc:'Contrôle total',  perms:['Gestion utilisateurs','Déploiements','Tous les outils','Config']},
  {id:'dev',   icon:Code2,     color:'#00c8ff',label:'Développeur',desc:'Accès dev',       perms:['Pipeline CI/CD','Dépôts Git','Environnements','Espace dev']},
  {id:'client',icon:UserCheck, color:'#00ff88',label:'Client',     desc:'Vue projet',      perms:['Dashboard','Projets (lecture)','Documentation','Chat']},
]

export default function Login(){
  const {login}=useAuth(); const navigate=useNavigate()
  const [email,setEmail]=useState('admin@devenviron.com')
  const [pw,setPw]=useState('password123')
  const [role,setRole]=useState('admin')
  const [show,setShow]=useState(false)
  const [busy,setBusy]=useState(false)
  const [err,setErr]=useState('')
  const [isOffline,setIsOffline]=useState(false)
  const [checking,setChecking]=useState(false)
  const sel=ROLES.find(r=>r.id===role)

  // Vérifier le serveur au chargement de la page
  useEffect(()=>{
    const check=async()=>{
      setChecking(true)
      const ok = await checkServer()
      setIsOffline(!ok)
      setChecking(false)
    }
    check()
  },[])

  // Retry — vérifier à nouveau le serveur
  const retry=async()=>{
    setChecking(true)
    setErr('')
    const ok = await checkServer()
    setIsOffline(!ok)
    setChecking(false)
  }

  const submit=async e=>{
    e.preventDefault(); setErr(''); setBusy(true)
    const res=await login(email,pw,role)
    setBusy(false)
    if(res.ok){
      navigate('/dashboard')
    } else {
      if(res.offline) setIsOffline(true)
      setErr(res.error)
    }
  }

  return(
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',position:'relative',overflow:'hidden'}}>
      <Canvas4D/>
      <div style={{position:'absolute',inset:0,zIndex:1,pointerEvents:'none',backgroundImage:'linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
      <div style={{position:'absolute',inset:0,zIndex:1,pointerEvents:'none',background:'radial-gradient(ellipse 70% 50% at 50% 50%,rgba(0,200,255,0.04),transparent 65%)'}}/>

      {/* Panneau gauche info */}
      <motion.div initial={{opacity:0,x:-40}} animate={{opacity:1,x:0}} transition={{duration:0.8}}
        style={{display:'flex',flexDirection:'column',justifyContent:'space-between',width:'50%',minWidth:400,padding:56,position:'relative',zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:42,height:42,borderRadius:12,background:'linear-gradient(135deg,#00c8ff,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 22px rgba(0,200,255,0.5)'}}>
            <Zap size={20} style={{color:'#020408'}}/>
          </div>
          <div>
            <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:17,background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>DEV ENVIRON</div>
            <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:9,letterSpacing:'0.25em',color:C.t3}}>4D PLATFORM</div>
          </div>
        </div>
        <div>
          <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
            style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:42,lineHeight:1.15,marginBottom:18}}>
            <span style={{color:C.t1}}>DÉVELOPPEZ<br/>EN </span>
            <span style={{background:'linear-gradient(135deg,#00c8ff,#7c3aed,#00ff88)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>4 DIMENSIONS</span>
          </motion.h1>
          <p style={{color:C.t2,fontSize:15,lineHeight:1.7,maxWidth:360,marginBottom:28}}>Plateforme SaaS next-gen. Pipeline CI/CD, espaces dev, chat d'équipe dans une interface immersive.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,maxWidth:380,marginBottom:32}}>
            {[['⚡','Pipeline CI/CD','Automatisé'],['🔮','Espace 4D','Immersif'],['🛡️','3 Rôles','Admin/Dev/Client'],['🚀','Deploy','Dev/Staging/Prod']].map(([icon,title,sub])=>(
              <div key={title} style={{background:'rgba(0,200,255,0.04)',border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 12px',display:'flex',alignItems:'center',gap:9}}>
                <span style={{fontSize:17}}>{icon}</span>
                <div><p style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t1}}>{title}</p><p style={{fontSize:10,color:C.t3}}>{sub}</p></div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:28}}>
            {[['2400+','Équipes'],['99.9%','Uptime'],['4D','Interface']].map(([v,l])=>(
              <div key={l}><div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:20,background:'linear-gradient(135deg,#00c8ff,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{v}</div><div style={{fontSize:11,color:C.t3}}>{l}</div></div>
            ))}
          </div>
        </div>
        <p style={{fontSize:10,color:C.t3,fontFamily:'Orbitron,sans-serif'}}>© 2024 DevEnviron 4D</p>
      </motion.div>

      {/* Panneau droit formulaire */}
      <motion.div initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} transition={{duration:0.8}}
        style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:24,position:'relative',zIndex:10}}>
        <div style={{width:'100%',maxWidth:430}}>
          <motion.div animate={{y:[0,-5,0]}} transition={{duration:6,repeat:Infinity,ease:'easeInOut'}}
            style={{background:'linear-gradient(135deg,rgba(10,22,40,0.97),rgba(6,15,26,0.99))',border:`1px solid ${C.border2}`,borderRadius:18,padding:32,boxShadow:'0 20px 60px rgba(0,0,0,0.7)',position:'relative'}}>
            {/* Coins */}
            {[{top:0,left:0,bt:'2px solid',bl:'2px solid'},{top:0,right:0,bt:'2px solid',br:'2px solid'},{bottom:0,left:0,bb:'2px solid',bl:'2px solid'},{bottom:0,right:0,bb:'2px solid',br:'2px solid'}].map((s,i)=>(
              <div key={i} style={{position:'absolute',width:18,height:18,borderColor:'rgba(0,200,255,0.5)',borderTopStyle:s.bt?'solid':'none',borderLeftStyle:s.bl?'solid':'none',borderRightStyle:s.br?'solid':'none',borderBottomStyle:s.bb?'solid':'none',borderTopWidth:s.bt?2:0,borderLeftWidth:s.bl?2:0,borderRightWidth:s.br?2:0,borderBottomWidth:s.bb?2:0,borderTopColor:'rgba(0,200,255,0.5)',borderLeftColor:'rgba(0,200,255,0.5)',borderRightColor:'rgba(0,200,255,0.5)',borderBottomColor:'rgba(0,200,255,0.5)',borderRadius:i===0?'14px 0 0 0':i===1?'0 14px 0 0':i===2?'0 0 0 14px':'0 0 14px 0',...s}}/>
            ))}

            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:20}}>
              <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#00c8ff,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center'}}><Zap size={15} style={{color:'#020408'}}/></div>
              <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:12,background:'linear-gradient(135deg,#00c8ff,#fff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>DEV ENVIRON 4D</span>
            </div>

            <h2 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:19,color:C.t1,marginBottom:3}}>CONNEXION</h2>
            <p style={{color:C.t2,fontSize:13,marginBottom:16}}>Accédez à votre espace DevEnviron</p>

            {/* ── Bannière serveur hors ligne ── */}
            <AnimatePresence>
              {(isOffline||checking)&&(
                <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                  style={{marginBottom:14,padding:'12px 14px',borderRadius:10,
                    background:checking?'rgba(0,200,255,0.06)':'rgba(255,45,120,0.08)',
                    border:`1px solid ${checking?'rgba(0,200,255,0.25)':'rgba(255,45,120,0.35)'}`,
                  }}>
                  <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:checking?0:8}}>
                    {checking
                      ?<motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:'linear'}}
                          style={{width:14,height:14,borderRadius:'50%',border:`2px solid ${C.cyan}`,borderTopColor:'transparent',flexShrink:0}}/>
                      :<WifiOff size={15} style={{color:C.nova,flexShrink:0}}/>
                    }
                    <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:11,
                      color:checking?C.cyan:C.nova}}>
                      {checking?'VÉRIFICATION DU SERVEUR...':'SERVEUR BACKEND INACCESSIBLE'}
                    </span>
                  </div>
                  {!checking&&(
                    <>
                      <p style={{fontSize:12,color:C.t2,lineHeight:1.6,marginBottom:10,fontFamily:'JetBrains Mono,monospace'}}>
                        Lancez le backend dans un terminal :<br/>
                        <span style={{color:C.neon}}>cd devenviron-backend</span><br/>
                        <span style={{color:C.neon}}>php artisan serve</span>
                      </p>
                      <button type="button" onClick={retry}
                        style={{...S.btnGhost,fontSize:11,padding:'6px 12px',display:'inline-flex',alignItems:'center',gap:6}}>
                        <RefreshCw size={11}/> Réessayer la connexion
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Indicateur serveur OK ── */}
            <AnimatePresence>
              {!isOffline&&!checking&&(
                <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  style={{marginBottom:14,padding:'8px 12px',borderRadius:8,
                    background:'rgba(0,255,136,0.06)',border:'1px solid rgba(0,255,136,0.2)',
                    display:'flex',alignItems:'center',gap:8}}>
                  <Server size={12} style={{color:C.neon,flexShrink:0}}/>
                  <span style={{fontSize:11,color:C.neon,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>BACKEND CONNECTÉ</span>
                  <span style={{fontSize:10,color:C.t3}}>→ http://localhost:8000</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint démo */}
            <div style={{background:'rgba(0,200,255,0.06)',border:'1px solid rgba(0,200,255,0.15)',borderRadius:8,padding:'8px 12px',marginBottom:16,fontSize:11,color:C.t2,display:'flex',alignItems:'center',gap:7}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:C.cyan,flexShrink:0,animation:'pulse 2s infinite'}}/>
              <span>Démo : <code style={{color:C.cyan,fontFamily:'JetBrains Mono,monospace'}}>admin@devenviron.com</code> / <code style={{color:C.cyan,fontFamily:'JetBrains Mono,monospace'}}>password123</code></span>
            </div>

            <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:13}}>
              <div>
                <label style={S.label}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={S.input} placeholder="email@exemple.com"/>
              </div>
              <div>
                <label style={S.label}>Mot de passe</label>
                <div style={{position:'relative'}}>
                  <input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} required style={{...S.input,paddingRight:38}} placeholder="Votre mot de passe"/>
                  <button type="button" onClick={()=>setShow(v=>!v)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:C.t3,cursor:'pointer',display:'flex'}}>
                    {show?<EyeOff size={14}/>:<Eye size={14}/>}
                  </button>
                </div>
              </div>

              {/* Sélecteur de rôle */}
              <div>
                <label style={S.label}>Rôle de connexion</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:7,marginBottom:10}}>
                  {ROLES.map(r=>(
                    <button key={r.id} type="button" onClick={()=>setRole(r.id)}
                      style={{padding:'10px 6px',borderRadius:10,textAlign:'center',cursor:'pointer',transition:'all 0.18s',background:role===r.id?`${r.color}12`:'rgba(255,255,255,0.02)',border:`${role===r.id?2:1}px solid ${role===r.id?r.color:'rgba(255,255,255,0.08)'}`,boxShadow:role===r.id?`0 0 16px ${r.color}22`:'none'}}>
                      <r.icon size={16} style={{color:r.color,display:'block',margin:'0 auto 5px'}}/>
                      <div style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:role===r.id?r.color:C.t2}}>{r.label}</div>
                      <div style={{fontSize:9,color:C.t3,marginTop:1}}>{r.desc}</div>
                    </button>
                  ))}
                </div>
                {/* Permissions */}
                <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,padding:'8px 11px'}}>
                  <p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,letterSpacing:'0.18em',color:C.t3,marginBottom:6}}>ACCÈS INCLUS</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3px 8px'}}>
                    {sel?.perms.map(p=>(
                      <div key={p} style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:C.t2}}>
                        <span style={{width:4,height:4,borderRadius:'50%',background:sel.color,flexShrink:0}}/>{p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {err&&<motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{fontSize:12,color:C.nova,background:'rgba(255,45,120,0.08)',border:'1px solid rgba(255,45,120,0.2)',borderRadius:7,padding:'7px 11px',textAlign:'center'}}>{err}</motion.p>}
              </AnimatePresence>

              <motion.button type="submit" disabled={busy||isOffline||checking} whileTap={{scale:0.97}}
                style={{...S.btnCyan,width:'100%',padding:'12px 18px',fontSize:13,
                  opacity:(busy||isOffline||checking)?0.5:1,
                  cursor:(busy||isOffline||checking)?'not-allowed':'pointer'}}>
                {checking?<><motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.7,ease:'linear'}} style={{width:13,height:13,borderRadius:'50%',border:'2px solid #020408',borderTopColor:'transparent',display:'inline-block'}}/> Vérification...</>
                :isOffline?<><WifiOff size={13}/> Serveur inaccessible</>
                :busy?<><motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.7,ease:'linear'}} style={{width:13,height:13,borderRadius:'50%',border:'2px solid #020408',borderTopColor:'transparent',display:'inline-block'}}/> Connexion...</>
                :<><Zap size={13}/> CONNEXION <ArrowRight size={13}/></>}
              </motion.button>
            </form>
            <p style={{textAlign:'center',marginTop:16,fontSize:12,color:C.t3}}>
              Pas de compte ? <Link to="/register" style={{color:C.cyan,textDecoration:'none',fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:11}}>INSCRIPTION</Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
