import React,{useState,useEffect} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {motion,AnimatePresence} from 'framer-motion'
import {Zap,ArrowRight,Eye,EyeOff,Shield,Code2,UserCheck,WifiOff,RefreshCw,Server,Clock} from 'lucide-react'
import Canvas4D from '../components/auth/Canvas4D.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {checkServer} from '../services/api.js'
import {C,S} from '../styles.js'

// ─── Mettre le logo dans /public/mtefop-logo.jpg ───────────
const LOGO_SRC = '/mtefop-logo.jpg'

const NOM_ENTREPRISE = 'MINISTÈRE DU TRAVAIL, DE L\'EMPLOI ET DE LA FONCTION PUBLIQUE'
const NOM_COURT      = 'MTEFOP'

const ROLES=[
  {id:'admin', icon:Shield,    color:'#ff2d78',label:'Admin',       desc:'Acces total',  perms:['Gestion utilisateurs','Deploiements','Tous les outils','Config']},
  {id:'dev',   icon:Code2,     color:'#00c8ff',label:'Developpeur', desc:'Acces dev',    perms:['Pipeline CI/CD','Depots Git','Environnements','Espace dev']},
  {id:'client',icon:UserCheck, color:'#00ff88',label:'Client',      desc:'Vue projet',   perms:['Dashboard','Projets (lecture)','Documentation','Chat']},
]

// ════════════════════════════════════════════
//  Animation nom entreprise — lettre par lettre
// ════════════════════════════════════════════
function AnimatedEnterpriseName() {
  const words = NOM_ENTREPRISE.split(' ')

  return (
    <div style={{ textAlign: 'center', marginBottom: 6 }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: 'backOut' }}
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}
      >
        <motion.div
          animate={{ boxShadow: ['0 0 0px rgba(0,200,255,0)', '0 0 30px rgba(0,200,255,0.5)', '0 0 0px rgba(0,200,255,0)'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ borderRadius: '50%', padding: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,200,255,0.2)' }}
        >
          <img
            src={LOGO_SRC}
            alt="Logo MTEFOP"
            style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          />
        </motion.div>
      </motion.div>

      {/* Nom court animé */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 8 }}>
        {NOM_COURT.split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07, duration: 0.4, ease: 'backOut' }}
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 900,
              fontSize: 22,
              background: 'linear-gradient(135deg, #00c8ff, #7c3aed, #00ff88)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* Ligne décorative */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.5), transparent)',
          marginBottom: 8,
        }}
      />

      {/* Nom complet — mot par mot */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 6px', maxWidth: 420, margin: '0 auto' }}>
        {words.map((word, wi) => (
          <motion.span
            key={wi}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + wi * 0.08, duration: 0.35 }}
            style={{
              fontSize: 10,
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              color: C.t2,
              letterSpacing: '0.08em',
              lineHeight: 1.8,
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════
export default function Login(){
  const {login}  = useAuth()
  const navigate = useNavigate()

  const [email,setEmail]         = useState('admin@devenviron.com')
  const [pw,setPw]               = useState('password123')
  const [role,setRole]           = useState('admin')
  const [show,setShow]           = useState(false)
  const [busy,setBusy]           = useState(false)
  const [err,setErr]             = useState('')
  const [errType,setErrType]     = useState('')
  const [isOffline,setIsOffline] = useState(false)
  const [checking,setChecking]   = useState(false)
  const sel = ROLES.find(r=>r.id===role)

  useEffect(()=>{
    const check=async()=>{
      setChecking(true)
      const ok=await checkServer()
      setIsOffline(!ok)
      setChecking(false)
    }
    check()
  },[])

  const retry=async()=>{
    setChecking(true)
    setErr('')
    const ok=await checkServer()
    setIsOffline(!ok)
    setChecking(false)
  }

  const submit=async e=>{
    e.preventDefault()
    setErr('')
    setErrType('')
    setBusy(true)
    const res=await login(email,pw)
    setBusy(false)
    if(res.ok){
      navigate('/dashboard')
    } else {
      if(res.offline) setIsOffline(true)
      if(res.pending){
        setErrType('pending')
        setErr("Votre compte est en attente de validation par l'administrateur.")
      } else {
        setErrType('error')
        setErr(res.error)
      }
    }
  }

  return(
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',position:'relative',overflow:'hidden'}}>
      <Canvas4D/>
      <div style={{position:'absolute',inset:0,zIndex:1,pointerEvents:'none',backgroundImage:'linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
      <div style={{position:'absolute',inset:0,zIndex:1,pointerEvents:'none',background:'radial-gradient(ellipse 70% 50% at 50% 50%,rgba(0,200,255,0.04),transparent 65%)'}}/>

      {/* Panneau gauche */}
      <motion.div initial={{opacity:0,x:-40}} animate={{opacity:1,x:0}} transition={{duration:0.8}}
        style={{display:'flex',flexDirection:'column',justifyContent:'space-between',width:'50%',minWidth:400,padding:56,position:'relative',zIndex:10}}>

        {/* Logo + Nom entreprise — panneau gauche */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}
          >
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(0,200,255,0)', '0 0 20px rgba(0,200,255,0.4)', '0 0 0px rgba(0,200,255,0)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ borderRadius: '50%', flexShrink: 0 }}
            >
              <img
                src={LOGO_SRC}
                alt="Logo MTEFOP"
                style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '2px solid rgba(0,200,255,0.3)' }}
              />
            </motion.div>
            <div>
              {/* Nom court lettre par lettre */}
              <div style={{ display: 'flex', gap: 1 }}>
                {NOM_COURT.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.35, ease: 'backOut' }}
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontWeight: 900,
                      fontSize: 17,
                      background: 'linear-gradient(135deg,#00c8ff,#e8f4ff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: '0.25em', color: C.t3 }}
              >
                DEV EN EQUIPE
              </motion.div>
            </div>
          </motion.div>

          {/* Nom complet entreprise — marquee défilant (style plaque pharmacie) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{
              padding: '10px 0',
              background: 'linear-gradient(90deg, rgba(0,200,255,0.07), rgba(124,58,237,0.05))',
              borderLeft: '2px solid rgba(0,200,255,0.4)',
              borderRadius: '0 8px 8px 0',
              marginBottom: 0,
              overflow: 'hidden',
              position: 'relative',
              maxWidth: 400,
            }}
          >
            {/* Dégradés de fondu sur les bords pour effet plaque LED */}
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: 24, zIndex: 2,
              background: 'linear-gradient(90deg, rgba(8,16,28,1), transparent)',
            }} />
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 24, zIndex: 2,
              background: 'linear-gradient(270deg, rgba(8,16,28,1), transparent)',
            }} />

            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}
              >
                {[0, 1].map(rep => (
                  <span
                    key={rep}
                    style={{
                      fontSize: 11,
                      fontFamily: 'Orbitron, sans-serif',
                      fontWeight: 700,
                      color: C.cyan,
                      letterSpacing: '0.12em',
                      textShadow: '0 0 8px rgba(0,200,255,0.6)',
                      paddingRight: 48,
                    }}
                  >
                    {NOM_ENTREPRISE} &nbsp;•&nbsp;
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: 'easeOut' }}
            style={{ marginBottom: 18 }}
          >
            <p style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.35em',
              color: C.cyan,
              marginBottom: 8,
              opacity: 0.85,
            }}>
              PLATEFORME
            </p>
            <h1 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 800,
              fontSize: 32,
              lineHeight: 1.35,
              letterSpacing: '0.01em',
              background: 'linear-gradient(120deg,#e8f4ff 0%,#00c8ff 45%,#7c3aed 75%,#00ff88 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmerTitle 6s ease-in-out infinite',
            }}>
              ENVIRONNEMENT DE DÉVELOPPEMENT EN ÉQUIPE
            </h1>
            <style>{`
              @keyframes shimmerTitle {
                0%, 100% { background-position: 0% center; }
                50% { background-position: 100% center; }
              }
            `}</style>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            style={{ color: C.t2, fontSize: 14, lineHeight: 1.75, maxWidth: 370, marginBottom: 28, letterSpacing: '0.01em' }}
          >
            Plateforme interne de gestion de projets, pipelines CI/CD et environnements de développement collaboratif — <span style={{ color: C.cyan, fontWeight: 600 }}>MTEFOP</span>.
          </motion.p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,maxWidth:380,marginBottom:32}}>
            {[['Pipeline CI/CD','Automatise'],['Espace Dev','Collaboratif'],['3 Roles','Admin/Dev/Client'],['Deploiement','Dev/Staging/Prod']].map(([title,sub])=>(
              <div key={title} style={{background:'rgba(0,200,255,0.04)',border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 12px'}}>
                <p style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t1}}>{title}</p>
                <p style={{fontSize:10,color:C.t3}}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
        <p style={{fontSize:10,color:C.t3,fontFamily:'Orbitron,sans-serif'}}>2026 MTEFOP · Plateforme de Developpement en Equipe</p>
      </motion.div>

      {/* Panneau droit — formulaire */}
      <motion.div initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} transition={{duration:0.8}}
        style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:24,position:'relative',zIndex:10}}>
        <div style={{width:'100%',maxWidth:430}}>
          <motion.div animate={{y:[0,-5,0]}} transition={{duration:6,repeat:Infinity,ease:'easeInOut'}}
            style={{background:'linear-gradient(135deg,rgba(10,22,40,0.97),rgba(6,15,26,0.99))',border:`1px solid ${C.border2}`,borderRadius:18,padding:32,boxShadow:'0 20px 60px rgba(0,0,0,0.7)',position:'relative'}}>

            {/* Coins deco */}
            {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((s,i)=>(
              <div key={i} style={{position:'absolute',width:18,height:18,
                borderTopWidth:(i<2)?2:0,borderBottomWidth:(i>=2)?2:0,
                borderLeftWidth:(i%2===0)?2:0,borderRightWidth:(i%2===1)?2:0,
                borderStyle:'solid',borderColor:'rgba(0,200,255,0.5)',
                borderRadius:i===0?'14px 0 0 0':i===1?'0 14px 0 0':i===2?'0 0 0 14px':'0 0 14px 0',...s}}/>
            ))}

            {/* Logo + Nom — panneau droit (card) */}
            <AnimatedEnterpriseName />

            {/* Séparateur */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              style={{
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.3), transparent)',
                margin: '14px 0 18px',
              }}
            />

            <h2 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:18,color:C.t1,marginBottom:4,textAlign:'center'}}>CONNEXION</h2>
            <p style={{fontSize:12,color:C.t3,marginBottom:18,textAlign:'center'}}>Accedez a votre espace de developpement</p>

            {/* Banner offline */}
            <AnimatePresence>
              {(isOffline||checking)&&(
                <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  style={{marginBottom:14,padding:'12px 14px',borderRadius:10,
                    background:checking?'rgba(0,200,255,0.06)':'rgba(255,45,120,0.08)',
                    border:`1px solid ${checking?'rgba(0,200,255,0.25)':'rgba(255,45,120,0.35)'}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:checking?0:8}}>
                    {checking
                      ?<motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:'linear'}}
                          style={{width:14,height:14,borderRadius:'50%',border:`2px solid ${C.cyan}`,borderTopColor:'transparent',flexShrink:0}}/>
                      :<WifiOff size={15} style={{color:C.nova,flexShrink:0}}/>
                    }
                    <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:11,color:checking?C.cyan:C.nova}}>
                      {checking?'VERIFICATION DU SERVEUR...':'SERVEUR BACKEND INACCESSIBLE'}
                    </span>
                  </div>
                  {!checking&&(
                    <button type="button" onClick={retry}
                      style={{...S.btnGhost,fontSize:11,padding:'6px 12px',display:'inline-flex',alignItems:'center',gap:6}}>
                      <RefreshCw size={11}/> Reessayer la connexion
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Serveur OK */}
            <AnimatePresence>
              {!isOffline&&!checking&&(
                <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  style={{marginBottom:14,padding:'8px 12px',borderRadius:8,
                    background:'rgba(0,255,136,0.06)',border:'1px solid rgba(0,255,136,0.2)',
                    display:'flex',alignItems:'center',gap:8}}>
                  <Server size={12} style={{color:C.neon,flexShrink:0}}/>
                  <span style={{fontSize:11,color:C.neon,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>BACKEND CONNECTE</span>
                  <span style={{fontSize:10,color:C.t3}}>http://localhost:8000</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint admin credentials */}
            <div style={{background:'rgba(0,200,255,0.06)',border:'1px solid rgba(0,200,255,0.15)',borderRadius:8,padding:'8px 12px',marginBottom:16,fontSize:11,color:C.t2,display:'flex',alignItems:'center',gap:7}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:C.cyan,flexShrink:0}}/>
              <span>Admin : admin@devenviron.com / password123</span>
            </div>

            <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:13}}>

              {/* Email */}
              <div>
                <label style={S.label}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={S.input} placeholder="email@exemple.com"/>
              </div>

              {/* Mot de passe */}
              <div>
                <label style={S.label}>Mot de passe</label>
                <div style={{position:'relative'}}>
                  <input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} required style={{...S.input,paddingRight:38}} placeholder="Votre mot de passe"/>
                  <button type="button" onClick={()=>setShow(v=>!v)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:C.t3,cursor:'pointer',display:'flex'}}>
                    {show?<EyeOff size={14}/>:<Eye size={14}/>}
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label style={S.label}>Role de connexion</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:7,marginBottom:10}}>
                  {ROLES.map(r=>(
                    <button key={r.id} type="button" onClick={()=>setRole(r.id)}
                      style={{padding:'10px 6px',borderRadius:10,textAlign:'center',cursor:'pointer',transition:'all 0.18s',
                        background:role===r.id?`${r.color}12`:'rgba(255,255,255,0.02)',
                        border:`${role===r.id?2:1}px solid ${role===r.id?r.color:'rgba(255,255,255,0.08)'}`,
                        boxShadow:role===r.id?`0 0 16px ${r.color}22`:'none'}}>
                      <r.icon size={16} style={{color:r.color,display:'block',margin:'0 auto 5px'}}/>
                      <div style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:role===r.id?r.color:C.t2}}>{r.label}</div>
                      <div style={{fontSize:9,color:C.t3,marginTop:1}}>{r.desc}</div>
                    </button>
                  ))}
                </div>
                <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,padding:'8px 11px'}}>
                  <p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,letterSpacing:'0.18em',color:C.t3,marginBottom:6}}>ACCES INCLUS</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3px 8px'}}>
                    {sel&&sel.perms.map(p=>(
                      <div key={p} style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:C.t2}}>
                        <span style={{width:4,height:4,borderRadius:'50%',background:sel.color,flexShrink:0}}/>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message erreur ou pending */}
              <AnimatePresence>
                {err&&(
                  <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                    style={{fontSize:12,
                      color:errType==='pending'?'#ffce00':C.nova,
                      background:errType==='pending'?'rgba(255,206,0,0.08)':'rgba(255,45,120,0.08)',
                      border:`1px solid ${errType==='pending'?'rgba(255,206,0,0.3)':'rgba(255,45,120,0.2)'}`,
                      borderRadius:7,padding:'10px 12px',display:'flex',alignItems:'flex-start',gap:8}}>
                    {errType==='pending'
                      ?<Clock size={14} style={{color:'#ffce00',flexShrink:0,marginTop:1}}/>
                      :<WifiOff size={14} style={{color:C.nova,flexShrink:0,marginTop:1}}/>
                    }
                    <div>
                      {errType==='pending'&&(
                        <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:10,color:'#ffce00',marginBottom:3}}>COMPTE EN ATTENTE</p>
                      )}
                      <p>{err}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton connexion */}
              <motion.button type="submit" disabled={busy||isOffline||checking} whileTap={{scale:0.97}}
                style={{...S.btnCyan,width:'100%',padding:'12px 18px',fontSize:13,
                  opacity:(busy||isOffline||checking)?0.5:1,
                  cursor:(busy||isOffline||checking)?'not-allowed':'pointer'}}>
                {checking
                  ?<motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.7,ease:'linear'}} style={{width:13,height:13,borderRadius:'50%',border:'2px solid #020408',borderTopColor:'transparent',display:'inline-block'}}/>
                  :isOffline
                    ?<><WifiOff size={13}/> Serveur inaccessible</>
                    :busy
                      ?<motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.7,ease:'linear'}} style={{width:13,height:13,borderRadius:'50%',border:'2px solid #020408',borderTopColor:'transparent',display:'inline-block'}}/>
                      :<><Zap size={13}/> CONNEXION <ArrowRight size={13}/></>
                }
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
