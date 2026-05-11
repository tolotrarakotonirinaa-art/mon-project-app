import React,{useState} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {Users,Bell,Lock,Shield,Palette,Eye,EyeOff,Check,X} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {PanelHeader} from '../components/ui/UI.jsx'
import {C,S,ROLE_META} from '../styles.js'
import {ini} from '../data.js'
import {PT} from './shared/PageUtils.jsx'

// ════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════
const STABS=[
  {id:'profile', icon:Users,   l:'Profil'},
  {id:'notifs',  icon:Bell,    l:'Notifications'},
  {id:'security',icon:Lock,    l:'Sécurité'},
  {id:'perms',   icon:Shield,  l:'Permissions'},
  {id:'theme',   icon:Palette, l:'Apparence'},
]
const PDATA=[
  ['Tableau de bord',      true,  true,   true],
  ['Créer des projets',    true,  true,   false],
  ['Supprimer projets',    true,  false,  false],
  ['Gérer les tâches',     true,  true,   'Lecture'],
  ['Pipeline CI/CD',       true,  true,   false],
  ['Dépôts Git',           true,  true,   false],
  ['Environnements',       true,  true,   false],
  ['Espace Dev',           true,  true,   false],
  ['Documentation',        true,  true,   true],
  ['Communication',        true,  true,   true],
  ['Statistiques',         true,  true,   'Limitées'],
  ['Gestion utilisateurs', true,  false,  false],
  ['Paramètres',           true,  'Profil','Profil'],
  ['Déconnexion',          true,  true,   true],
]

export function SettingsPage(){
  const {user,updateMe}=useAuth()
  const {showToast}=useApp()
  const [tab,setTab]=useState('profile')
  const [prof,setProf]=useState({name:user?.name||'',email:user?.email||''})
  const [profSaving,setProfSaving]=useState(false)
  const [notifs,setNotifs]=useState({email:true,tasks:true,projects:true,messages:false,deploys:true,security:true})
  const [pw,setPw]=useState({cur:'',next:'',confirm:''})
  const [pwe,setPwe]=useState({})
  const [showPws,setShowPws]=useState({cur:false,next:false,confirm:false})
  const [pwSaving,setPwSaving]=useState(false)
  const [accentColor,setAccentColor]=useState(C.cyan)

  const handleProfileSave=async()=>{
    if(!prof.name.trim()){ showToast('Le nom est requis','warning'); return }
    const emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailRe.test(prof.email)){ showToast('Email invalide','warning'); return }
    setProfSaving(true)
    try{
      await updateMe(prof)
      showToast('Profil sauvegardé !','success')
    }catch(e){ showToast(e?.message||'Erreur lors de la sauvegarde','danger') }
    finally{ setProfSaving(false) }
  }

  const handlePw=async()=>{
    const e={}
    if(!pw.cur)            e.cur='Requis'
    if(pw.next.length<6)   e.next='Min 6 caractères'
    if(pw.next!==pw.confirm)e.confirm='Ne correspond pas'
    setPwe(e)
    if(Object.keys(e).length) return
    setPwSaving(true)
    try{
      await updateMe({current_password:pw.cur,password:pw.next,password_confirmation:pw.confirm})
      setPw({cur:'',next:'',confirm:''})
      showToast('Mot de passe changé !','success')
    }catch(err){
      showToast(err?.message||'Erreur lors du changement','danger')
    }finally{ setPwSaving(false) }
  }

  const Toggle=({v,onChange})=>(
    <button onClick={()=>onChange(!v)} type="button"
      style={{width:42,height:22,borderRadius:11,position:'relative',
        background:v?C.cyan:'rgba(255,255,255,0.08)',border:'none',cursor:'pointer',transition:'background 0.25s',flexShrink:0}}>
      <motion.div animate={{left:v?'22px':'2px'}} transition={{type:'spring',stiffness:500,damping:30}}
        style={{position:'absolute',top:2,width:18,height:18,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
    </button>
  )

  return(
    <div>
      <div style={{marginBottom:24}}>
        {PT('PARAMÈTRES')}
        <p style={{color:C.t2,fontSize:13,marginTop:4}}>Gérez vos préférences et la sécurité de votre compte</p>
      </div>
      <div style={{...S.panel({padding:0,overflow:'hidden',display:'flex',minHeight:520})}}>
        {/* Menu onglets */}
        <div style={{width:180,flexShrink:0,borderRight:`1px solid ${C.border}`,padding:12}}>
          {STABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'10px 12px',borderRadius:9,marginBottom:3,
                border:'none',background:tab===t.id?'rgba(0,200,255,0.10)':'none',color:tab===t.id?C.cyan:C.t3,
                cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:600,fontSize:13,transition:'all 0.15s',
                textAlign:'left',borderLeft:tab===t.id?`2px solid ${C.cyan}`:'2px solid transparent'}}>
              <t.icon size={14}/>{t.l}
            </button>
          ))}
        </div>
        {/* Contenu */}
        <div style={{flex:1,padding:26,overflowY:'auto'}}>
          <AnimatePresence mode="wait">
            {tab==='profile'&&(
              <motion.div key="p" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                style={{display:'flex',flexDirection:'column',gap:15}}>
                <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1}}>Profil utilisateur</h3>
                <div style={{display:'flex',alignItems:'center',gap:16,padding:'14px',
                  background:'rgba(0,200,255,0.04)',borderRadius:12,border:`1px solid ${C.border}`}}>
                  <div style={{width:56,height:56,borderRadius:14,flexShrink:0,
                    background:`linear-gradient(135deg,${C.cyan},${C.plasma})`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:18,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408'}}>
                    {ini(prof.name||user?.name)}
                  </div>
                  <div>
                    <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:14,color:C.t1}}>{prof.name||user?.name}</p>
                    <p style={{fontSize:12,color:C.t3,marginTop:2}}>{user?.email}</p>
                    <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'2px 8px',borderRadius:5,
                      background:ROLE_META[user?.role]?.bg,color:ROLE_META[user?.role]?.color,
                      border:`1px solid ${ROLE_META[user?.role]?.border}`,display:'inline-block',marginTop:4}}>
                      {ROLE_META[user?.role]?.label}
                    </span>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13}}>
                  <div>
                    <label style={S.label}>Nom complet</label>
                    <input style={S.input} value={prof.name} onChange={e=>setProf(f=>({...f,name:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={S.label}>Email</label>
                    <input type="email" style={S.input} value={prof.email} onChange={e=>setProf(f=>({...f,email:e.target.value}))}/>
                  </div>
                </div>
                <button onClick={handleProfileSave} disabled={profSaving}
                  style={{...S.btnCyan,alignSelf:'flex-start',fontSize:12,opacity:profSaving?0.7:1,display:'flex',alignItems:'center',gap:6}}>
                  {profSaving&&<motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.6,ease:'linear'}}
                    style={{display:'inline-block',width:10,height:10,borderRadius:'50%',border:'2px solid #020408',borderTopColor:'transparent'}}/>}
                  Enregistrer les modifications
                </button>
              </motion.div>
            )}

            {tab==='notifs'&&(
              <motion.div key="n" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,marginBottom:18}}>Préférences de notifications</h3>
                {[
                  ['email',    'Notifications par email',   'Recevoir les alertes par email'],
                  ['tasks',    'Tâches assignées',           'Notifications quand une tâche vous est assignée'],
                  ['projects', 'Mises à jour projets',       'Changements de statut et progression'],
                  ['messages', 'Messages reçus',             'Nouveaux messages dans le chat'],
                  ['deploys',  'Déploiements',               'Succès et échecs de déploiement'],
                  ['security', 'Alertes sécurité',           'Connexions suspectes et changements de mot de passe'],
                ].map(([k,l,desc])=>(
                  <div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'12px 0',borderBottom:`1px solid ${C.border}`}}>
                    <div>
                      <p style={{fontSize:13,color:C.t1,fontFamily:'Rajdhani,sans-serif',fontWeight:600}}>{l}</p>
                      <p style={{fontSize:11,color:C.t3,marginTop:2}}>{desc}</p>
                    </div>
                    <Toggle v={notifs[k]} onChange={v=>setNotifs(n=>({...n,[k]:v}))}/>
                  </div>
                ))}
                <button onClick={()=>showToast('Préférences sauvegardées !','success')}
                  style={{...S.btnCyan,marginTop:16,fontSize:12}}>
                  Sauvegarder
                </button>
              </motion.div>
            )}

            {tab==='security'&&(
              <motion.div key="s" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                style={{display:'flex',flexDirection:'column',gap:14}}>
                <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1}}>Sécurité du compte</h3>
                {[['cur','Mot de passe actuel'],['next','Nouveau mot de passe'],['confirm','Confirmer le nouveau']].map(([k,l])=>(
                  <div key={k}>
                    <label style={S.label}>{l}</label>
                    <div style={{position:'relative'}}>
                      <input type={showPws[k]?'text':'password'}
                        style={{...S.input,borderColor:pwe[k]?C.nova:undefined,paddingRight:40}}
                        value={pw[k]} onChange={e=>{ setPw(f=>({...f,[k]:e.target.value})); setPwe(x=>({...x,[k]:undefined})) }}
                        placeholder={k==='cur'?'••••••••':k==='next'?'Min 6 caractères':'Répétez le mot de passe'}
                        onKeyDown={e=>e.key==='Enter'&&handlePw()}/>
                      <button type="button" onClick={()=>setShowPws(s=>({...s,[k]:!s[k]}))}
                        style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',
                          background:'none',border:'none',color:C.t3,cursor:'pointer'}}>
                        {showPws[k]?<EyeOff size={14}/>:<Eye size={14}/>}
                      </button>
                    </div>
                    {pwe[k]&&<p style={{fontSize:11,color:C.nova,marginTop:3}}>{pwe[k]}</p>}
                  </div>
                ))}
                <button onClick={handlePw} disabled={pwSaving}
                  style={{...S.btnSolar,alignSelf:'flex-start',fontSize:12,opacity:pwSaving?0.7:1,display:'flex',alignItems:'center',gap:6}}>
                  {pwSaving&&<motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.6,ease:'linear'}}
                    style={{display:'inline-block',width:10,height:10,borderRadius:'50%',border:'2px solid #020408',borderTopColor:'transparent'}}/>}
                  Changer le mot de passe
                </button>
                <div style={{padding:14,background:'rgba(255,206,0,0.06)',border:`1px solid rgba(255,206,0,0.2)`,borderRadius:10,marginTop:8}}>
                  <p style={{fontSize:12,color:C.quantum,fontFamily:'Orbitron,sans-serif',fontWeight:700,marginBottom:6}}>⚠️ Sessions actives</p>
                  <p style={{fontSize:12,color:C.t2}}>Session active sur cet appareil. Pour déconnecter toutes les autres sessions, changez votre mot de passe.</p>
                </div>
              </motion.div>
            )}

            {tab==='perms'&&(
              <motion.div key="pm" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,marginBottom:6}}>Matrice des permissions</h3>
                <p style={{fontSize:12,color:C.t3,marginBottom:16}}>Définit les accès selon chaque rôle dans la plateforme.</p>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                    <thead>
                      <tr style={{borderBottom:`1px solid ${C.border}`}}>
                        {['Fonctionnalité',{l:'ADMIN',c:C.nova},{l:'DEV',c:C.cyan},{l:'CLIENT',c:C.neon}].map((h,i)=>(
                          <th key={i} style={{padding:'9px 13px',textAlign:'left',fontSize:9,
                            fontFamily:'Orbitron,sans-serif',fontWeight:700,color:typeof h==='string'?C.t3:h.c}}>
                            {typeof h==='string'?h:h.l}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PDATA.map(([feat,a,d,cl])=>(
                        <tr key={feat} style={{borderBottom:`1px solid ${C.border}`}}>
                          <td style={{padding:'9px 13px',color:C.t2}}>{feat}</td>
                          {[a,d,cl].map((p,i)=>(
                            <td key={i} style={{padding:'9px 13px'}}>
                              {p===true
                                ?<Check size={13} style={{color:C.neon}}/>
                                :p===false
                                  ?<X size={13} style={{color:C.nova}}/>
                                  :<span style={{fontSize:10,color:C.quantum}}>{p}</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {tab==='theme'&&(
              <motion.div key="t" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,marginBottom:18}}>Apparence</h3>
                <div style={{marginBottom:20}}>
                  <p style={{fontSize:12,color:C.t2,marginBottom:11}}>Couleur d'accent de l'interface</p>
                  <div style={{display:'flex',gap:10}}>
                    {[C.cyan,C.plasma,C.neon,C.solar,C.nova,C.quantum].map(c=>(
                      <button key={c} type="button" onClick={()=>{setAccentColor(c);showToast('Couleur appliquée !','success')}}
                        style={{width:36,height:36,borderRadius:9,background:c,
                          border:`2.5px solid ${accentColor===c?'#fff':'transparent'}`,cursor:'pointer',
                          boxShadow:accentColor===c?`0 0 12px ${c}`:'none',transition:'all 0.15s'}}/>
                    ))}
                  </div>
                </div>
                <div style={{padding:'12px 14px',background:'rgba(0,200,255,0.04)',
                  border:`1px solid ${C.border}`,borderRadius:10,marginBottom:16}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <p style={{fontSize:13,color:C.t1,fontFamily:'Rajdhani,sans-serif',fontWeight:600}}>Mode sombre (4D Cosmic)</p>
                      <p style={{fontSize:11,color:C.t3,marginTop:2}}>Interface sombre optimisée pour les longues sessions</p>
                    </div>
                    <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'2px 9px',borderRadius:5,
                      background:'rgba(0,200,255,0.1)',color:C.cyan,border:'1px solid rgba(0,200,255,0.2)'}}>ACTIF</span>
                  </div>
                </div>
                <button onClick={()=>showToast('Thème appliqué !','success')} style={{...S.btnPlasma,fontSize:12}}>
                  Appliquer le thème
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

