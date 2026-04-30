import React,{useState,useEffect} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {motion,AnimatePresence} from 'framer-motion'
import {Zap,ArrowRight,Code2,UserCheck,Eye,EyeOff,Check,X,WifiOff,RefreshCw,Server,Clock} from 'lucide-react'
import Canvas4D from '../components/auth/Canvas4D.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {C,S} from '../styles.js'
import {checkServer} from '../services/api.js'

// ← Admin fanesorana — dev sy client ihany
const ROLES=[
  {id:'dev',   icon:Code2,    color:'#00c8ff', label:'Développeur', desc:'Accès dev'},
  {id:'client',icon:UserCheck,color:'#00ff88', label:'Client',      desc:'Vue projet'},
]

function nameHasDigit(v){ return /[0-9]/.test(v) }

function pwRules(pw){
  return [
    { ok: pw.length >= 8,           label: '8 caractères minimum'         },
    { ok: /[A-Z]/.test(pw),         label: 'Une majuscule'                 },
    { ok: /[a-z]/.test(pw),         label: 'Une minuscule'                 },
    { ok: /[0-9]/.test(pw),         label: 'Un chiffre'                    },
    { ok: /[^A-Za-z0-9]/.test(pw),  label: 'Un caractère spécial (!@#...)' },
  ]
}
function pwStrength(pw){
  const score = pwRules(pw).filter(r=>r.ok).length
  if(score<=1) return {label:'Très faible', color:'#ff2d78', w:'20%'}
  if(score===2) return {label:'Faible',      color:'#ff6b35', w:'40%'}
  if(score===3) return {label:'Moyen',       color:'#ffce00', w:'60%'}
  if(score===4) return {label:'Fort',        color:'#00c8ff', w:'80%'}
  return               {label:'Très fort',   color:'#00ff88', w:'100%'}
}

export default function Register(){
  const {register} = useAuth()
  const navigate   = useNavigate()

  const [f,setF]             = useState({firstName:'',lastName:'',email:'',password:'',confirm:'',role:'dev'})
  const [errs,setErrs]       = useState({})
  const [busy,setBusy]       = useState(false)
  const [isOffline,setIsOffline] = useState(false)
  const [checking,setChecking]   = useState(false)
  const [showPw,setShowPw]   = useState(false)
  const [showCf,setShowCf]   = useState(false)
  const [pwFocus,setPwFocus] = useState(false)
  // ← VAOVAO: success state — miandry validation
  const [success,setSuccess] = useState(false)

  useEffect(()=>{
    const check=async()=>{ setChecking(true); const ok=await checkServer(); setIsOffline(!ok); setChecking(false) }
    check()
  },[])

  const retry=async()=>{ setChecking(true); setErrs({}); const ok=await checkServer(); setIsOffline(!ok); setChecking(false) }

  const set = (k,raw) => {
    let v = raw
    if(k==='firstName'||k==='lastName'){
      v = raw.replace(/[0-9]/g,'')
      v = v.replace(/\b(\w)/g, c=>c.toUpperCase())
    }
    setF(x=>({...x,[k]:v}))
    if(errs[k]) setErrs(e=>({...e,[k]:undefined}))
  }

  const validate = () => {
    const e = {}
    if(!f.firstName.trim())               e.firstName = 'Prénom requis'
    else if(f.firstName.trim().length < 2) e.firstName = 'Prénom trop court (min 2 lettres)'
    else if(nameHasDigit(f.firstName))     e.firstName = 'Les chiffres ne sont pas autorisés'

    if(!f.lastName.trim())                e.lastName = 'Nom requis'
    else if(f.lastName.trim().length < 2)  e.lastName = 'Nom trop court (min 2 lettres)'
    else if(nameHasDigit(f.lastName))      e.lastName = 'Les chiffres ne sont pas autorisés'

    if(!f.email.trim())                               e.email = 'Email requis'
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Adresse email invalide'

    const rules  = pwRules(f.password)
    const failed = rules.filter(r=>!r.ok)
    if(f.password.length===0)      e.password = 'Mot de passe requis'
    else if(failed.length > 0)     e.password = `Requis : ${failed.map(r=>r.label).join(', ')}`

    if(!f.confirm)                          e.confirm = 'Confirmation requise'
    else if(f.password !== f.confirm)        e.confirm = 'Les mots de passe ne correspondent pas'

    setErrs(e)
    return Object.keys(e).length === 0
  }

  const submit = async ev => {
    ev.preventDefault()
    if(!validate()) return
    setBusy(true)
    const fullName = `${f.firstName.trim()} ${f.lastName.trim()}`
    const res = await register({name:fullName, email:f.email, password:f.password, role:f.role})
    setBusy(false)
    if(res.ok){
      // ← VAOVAO: tsy navigate dashboard — mampiseho message fiandrasana
      setSuccess(true)
    } else {
      setErrs({server: res.error})
    }
  }

  const rules    = pwRules(f.password)
  const strength = f.password ? pwStrength(f.password) : null

  // ── VAOVAO: Page fiandrasana validation ──────────────────
  if(success){
    return(
      <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
        <Canvas4D/>
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.5}}
          style={{width:'100%',maxWidth:440,position:'relative',zIndex:10,margin:'20px',
            background:'linear-gradient(135deg,rgba(10,22,40,0.97),rgba(6,15,26,0.99))',
            border:`1px solid rgba(0,255,136,0.3)`,borderRadius:18,padding:40,
            boxShadow:'0 20px 60px rgba(0,0,0,0.7)',textAlign:'center'}}>

          {/* Icône */}
          <motion.div animate={{scale:[1,1.08,1]}} transition={{duration:2,repeat:Infinity}}
            style={{width:72,height:72,borderRadius:'50%',background:'rgba(0,255,136,0.1)',
              border:'2px solid rgba(0,255,136,0.4)',display:'flex',alignItems:'center',
              justifyContent:'center',margin:'0 auto 24px'}}>
            <Clock size={32} style={{color:'#00ff88'}}/>
          </motion.div>

          <h2 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:18,
            color:'#00ff88',marginBottom:12,letterSpacing:'0.05em'}}>
            COMPTE CRÉÉ !
          </h2>
          <p style={{color:C.t2,fontSize:14,lineHeight:1.7,marginBottom:8}}>
            Votre compte a été créé avec succès.
          </p>
          <p style={{color:C.t2,fontSize:13,lineHeight:1.7,marginBottom:24}}>
            ⏳ Votre compte est <span style={{color:'#ffce00',fontWeight:700}}>en attente de validation</span> par l'administrateur. Vous recevrez l'accès après validation.
          </p>

          <div style={{padding:'12px 16px',background:'rgba(255,206,0,0.06)',
            border:'1px solid rgba(255,206,0,0.2)',borderRadius:10,marginBottom:24,
            fontSize:12,color:C.t2,textAlign:'left'}}>
            <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:10,
              color:'#ffce00',marginBottom:6}}>PROCHAINES ÉTAPES</p>
            <p>1. L'admin examine votre demande</p>
            <p>2. Vous serez validé(e) manuellement</p>
            <p>3. Connectez-vous après validation</p>
          </div>

          <Link to="/login" style={{display:'inline-flex',alignItems:'center',gap:8,
            padding:'11px 22px',borderRadius:10,background:'rgba(0,200,255,0.1)',
            border:'1px solid rgba(0,200,255,0.3)',color:C.cyan,
            fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:12,
            textDecoration:'none'}}>
            <Zap size={14}/> RETOUR À LA CONNEXION
          </Link>
        </motion.div>
      </div>
    )
  }

  return(
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',padding:'20px 0'}}>
      <Canvas4D/>
      <div style={{position:'absolute',inset:0,zIndex:1,pointerEvents:'none',backgroundImage:'linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>

      <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:0.6}}
        style={{width:'100%',maxWidth:480,position:'relative',zIndex:10,margin:'20px 20px'}}>

        <div style={{background:'linear-gradient(135deg,rgba(10,22,40,0.97),rgba(6,15,26,0.99))',border:`1px solid ${C.border2}`,borderRadius:18,padding:32,boxShadow:'0 20px 60px rgba(0,0,0,0.7)',position:'relative'}}>

          {/* Coins déco */}
          {[{t:0,l:0},{t:0,r:0},{b:0,l:0},{b:0,r:0}].map((s,i)=>(
            <div key={i} style={{position:'absolute',width:18,height:18,
              borderTopWidth:(i<2)?2:0,borderBottomWidth:(i>=2)?2:0,
              borderLeftWidth:(i%2===0)?2:0,borderRightWidth:(i%2===1)?2:0,
              borderStyle:'solid',borderColor:'rgba(0,200,255,0.5)',
              top:s.t??'auto',left:s.l??'auto',right:s.r??'auto',bottom:s.b??'auto',
              borderRadius:i===0?'14px 0 0 0':i===1?'0 14px 0 0':i===2?'0 0 0 14px':'0 0 14px 0'}}/>
          ))}

          {/* Header */}
          <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:20}}>
            <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#00c8ff,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Zap size={15} style={{color:'#020408'}}/>
            </div>
            <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:12,background:'linear-gradient(135deg,#00c8ff,#fff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              DEV ENVIRON 4D
            </span>
          </div>

          <h2 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:20,color:C.t1,marginBottom:4}}>CRÉER UN COMPTE</h2>
          <p style={{fontSize:12,color:C.t3,marginBottom:18}}>Rejoignez la plateforme — votre accès sera validé par un admin</p>

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
                    {checking?'VÉRIFICATION DU SERVEUR...':'SERVEUR BACKEND INACCESSIBLE'}
                  </span>
                </div>
                {!checking&&(
                  <button type="button" onClick={retry}
                    style={{...S.btnGhost,fontSize:11,padding:'6px 12px',display:'inline-flex',alignItems:'center',gap:6}}>
                    <RefreshCw size={11}/> Réessayer
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
                <span style={{fontSize:11,color:C.neon,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>BACKEND CONNECTÉ</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:13}}>

            {/* Prénom + Nom */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[['firstName','Prénom *','Jean'],['lastName','Nom *','Dupont']].map(([k,label,ph])=>(
                <div key={k}>
                  <label style={S.label}>{label}</label>
                  <input value={f[k]} onChange={e=>set(k,e.target.value)} placeholder={ph}
                    style={{...S.input,borderColor:errs[k]?C.nova:undefined}}/>
                  {errs[k]&&<p style={{fontSize:10,color:C.nova,marginTop:3,display:'flex',alignItems:'center',gap:4}}><X size={10}/>{errs[k]}</p>}
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label style={S.label}>Adresse email *</label>
              <input type="email" value={f.email} onChange={e=>set('email',e.target.value)}
                placeholder="email@exemple.com"
                style={{...S.input,borderColor:errs.email?C.nova:undefined}}/>
              {errs.email&&<p style={{fontSize:10,color:C.nova,marginTop:3,display:'flex',alignItems:'center',gap:4}}><X size={10}/>{errs.email}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label style={S.label}>Mot de passe *</label>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} value={f.password}
                  onChange={e=>set('password',e.target.value)}
                  onFocus={()=>setPwFocus(true)} onBlur={()=>setPwFocus(false)}
                  placeholder="Min 8 car., maj., chiffre, spécial"
                  style={{...S.input,paddingRight:38,borderColor:errs.password?C.nova:f.password&&rules.every(r=>r.ok)?C.neon:undefined}}/>
                <button type="button" onClick={()=>setShowPw(v=>!v)}
                  style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:C.t3,cursor:'pointer',display:'flex'}}>
                  {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
              {f.password&&strength&&(
                <div style={{marginTop:6}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:10,marginBottom:3}}>
                    <span style={{color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:9}}>FORCE DU MOT DE PASSE</span>
                    <span style={{color:strength.color,fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:9}}>{strength.label.toUpperCase()}</span>
                  </div>
                  <div style={{height:3,background:'rgba(255,255,255,0.07)',borderRadius:10,overflow:'hidden'}}>
                    <motion.div animate={{width:strength.w}} transition={{duration:0.4}}
                      style={{height:'100%',borderRadius:10,background:strength.color}}/>
                  </div>
                </div>
              )}
              <AnimatePresence>
                {(pwFocus||errs.password)&&f.password&&(
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                    style={{marginTop:8,padding:'10px 12px',background:'rgba(0,0,0,0.4)',borderRadius:9,border:`1px solid ${C.border}`}}>
                    <p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t3,marginBottom:6,letterSpacing:'0.1em'}}>EXIGENCES</p>
                    {rules.map((r,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                        <div style={{width:14,height:14,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                          background:r.ok?'rgba(0,255,136,0.15)':'rgba(255,45,120,0.1)',
                          border:`1px solid ${r.ok?C.neon:C.nova}`,flexShrink:0}}>
                          {r.ok?<Check size={8} style={{color:C.neon}}/>:<X size={8} style={{color:C.nova}}/>}
                        </div>
                        <span style={{fontSize:11,color:r.ok?C.t1:C.t3}}>{r.label}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {errs.password&&<p style={{fontSize:10,color:C.nova,marginTop:3,display:'flex',alignItems:'center',gap:4}}><X size={10}/>{errs.password}</p>}
            </div>

            {/* Confirmation */}
            <div>
              <label style={S.label}>Confirmer le mot de passe *</label>
              <div style={{position:'relative'}}>
                <input type={showCf?'text':'password'} value={f.confirm}
                  onChange={e=>set('confirm',e.target.value)}
                  placeholder="Répétez le mot de passe"
                  style={{...S.input,paddingRight:38,
                    borderColor:errs.confirm?C.nova:f.confirm&&f.confirm===f.password?C.neon:undefined}}/>
                <button type="button" onClick={()=>setShowCf(v=>!v)}
                  style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:C.t3,cursor:'pointer',display:'flex'}}>
                  {showCf?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
              {errs.confirm&&<p style={{fontSize:10,color:C.nova,marginTop:3,display:'flex',alignItems:'center',gap:4}}><X size={10}/>{errs.confirm}</p>}
              {!errs.confirm&&f.confirm&&f.confirm===f.password&&(
                <p style={{fontSize:10,color:C.neon,marginTop:3,display:'flex',alignItems:'center',gap:4}}><Check size={10}/> Les mots de passe correspondent</p>
              )}
            </div>

            {/* Rôle — admin fanesorana */}
            <div>
              <label style={S.label}>Rôle du compte</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
                {ROLES.map(r=>(
                  <button key={r.id} type="button" onClick={()=>setF(x=>({...x,role:r.id}))}
                    style={{padding:'10px 7px',borderRadius:10,textAlign:'center',cursor:'pointer',transition:'all 0.18s',
                      background:f.role===r.id?`${r.color}12`:'rgba(255,255,255,0.02)',
                      border:`${f.role===r.id?2:1}px solid ${f.role===r.id?r.color:'rgba(255,255,255,0.08)'}`,
                      boxShadow:f.role===r.id?`0 0 12px ${r.color}25`:'none'}}>
                    <r.icon size={15} style={{color:r.color,display:'block',margin:'0 auto 5px'}}/>
                    <span style={{fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:f.role===r.id?r.color:C.t2,display:'block'}}>{r.label}</span>
                    <span style={{fontSize:9,color:C.t3}}>{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aperçu nom */}
            {(f.firstName||f.lastName)&&(
              <div style={{padding:'8px 12px',background:'rgba(0,200,255,0.04)',borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,color:C.t2,display:'flex',alignItems:'center',gap:8}}>
                <span style={{color:C.t3,fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>APERÇU :</span>
                <span style={{color:C.cyan,fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:13}}>
                  {[f.firstName,f.lastName].filter(Boolean).join(' ')}
                </span>
              </div>
            )}

            {/* Erreur serveur */}
            <AnimatePresence>
              {errs.server&&(
                <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  style={{fontSize:12,color:C.nova,background:'rgba(255,45,120,0.08)',border:'1px solid rgba(255,45,120,0.2)',borderRadius:7,padding:'7px 11px',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <X size={13}/>{errs.server}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Bouton */}
            <motion.button type="submit" disabled={busy||isOffline||checking} whileTap={{scale:0.97}}
              style={{...S.btnNeon,width:'100%',padding:'12px 18px',fontSize:13,
                opacity:(busy||isOffline||checking)?0.5:1,
                cursor:(busy||isOffline||checking)?'not-allowed':'pointer',marginTop:2}}>
              {busy
                ?<><motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.7,ease:'linear'}}
                    style={{display:'inline-block',width:13,height:13,borderRadius:'50%',border:'2px solid #020408',borderTopColor:'transparent'}}/> Création du compte...</>
                :<><Zap size={13}/> CRÉER LE COMPTE <ArrowRight size={13}/></>
              }
            </motion.button>
          </form>

          <p style={{textAlign:'center',marginTop:16,fontSize:12,color:C.t3}}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{color:C.cyan,textDecoration:'none',fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:11}}>CONNEXION</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}