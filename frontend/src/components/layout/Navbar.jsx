import React,{useState,useRef,useEffect} from 'react'
import {useLocation,useNavigate} from 'react-router-dom'
import {motion,AnimatePresence} from 'framer-motion'
import {Search,Bell,RefreshCw,Zap,X,LogOut,Settings,User} from 'lucide-react'
import {useAuth} from '../../context/AuthContext.jsx'
import {useApp} from '../../context/AppContext.jsx'
import {C,ROLE_META} from '../../styles.js'
import {ini} from '../../data.js'
import {NotifBadge} from '../ui/UI.jsx'

const LABELS={
  '/dashboard':'Tableau de bord','/projects':'Projets','/tasks':'Tâches',
  '/pipeline':'Pipeline CI/CD','/repositories':'Dépôts Git','/environments':'Environnements',
  '/devspace':'Espace Dev','/documentation':'Documentation','/communication':'Communication',
  '/statistics':'Statistiques','/users':'Utilisateurs','/settings':'Paramètres',
  '/help':'Aide & Support','/logout':'Déconnexion',
}

export default function Navbar(){
  const {user,logout}    = useAuth()
  const {showToast,notifBadge,getNotifs,readAllNotifs} = useApp()
  const location         = useLocation()
  const navigate         = useNavigate()
  const [search,setSearch]   = useState(false)
  const [query,setQuery]     = useState('')
  const [userMenu,setUserMenu]= useState(false)
  const [notifMenu,setNotifMenu]= useState(false)
  const [notifs,setNotifs]   = useState([])
  const menuRef  = useRef(null)
  const notifRef = useRef(null)
  const rc       = ROLE_META[user?.role]||ROLE_META.dev
  const label    = LABELS[location.pathname]||'DevEnviron'

  // Fermer menus en cliquant ailleurs
  useEffect(()=>{
    const handler=e=>{
      if(menuRef.current&&!menuRef.current.contains(e.target)) setUserMenu(false)
      if(notifRef.current&&!notifRef.current.contains(e.target)) setNotifMenu(false)
    }
    document.addEventListener('mousedown',handler)
    return()=>document.removeEventListener('mousedown',handler)
  },[])

  const handleNotifMenu=async()=>{
    if(!notifMenu){
      const items = await getNotifs()
      setNotifs(items)
    }
    setNotifMenu(v=>!v)
  }

  const handleReadAll=async()=>{
    await readAllNotifs()
    setNotifs(n=>n.map(x=>({...x,read:true})))
    showToast('Toutes les notifications lues','success')
  }

  const handleLogout=async()=>{
    setUserMenu(false)
    navigate('/logout')
  }

  const ib = (active=false) => ({
    width:34,height:34,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',
    background:active?'rgba(0,200,255,0.12)':'none',
    border:`1px solid ${active?C.border2:C.border}`,
    color:active?C.cyan:C.t2,cursor:'pointer',transition:'all 0.2s',flexShrink:0,
  })

  return(
    <header style={{position:'sticky',top:0,zIndex:100,height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',background:'rgba(2,4,8,0.96)',backdropFilter:'blur(20px)',borderBottom:`1px solid ${C.border}`}}>

      {/* ── Logo + breadcrumb ── */}
      <div style={{display:'flex',alignItems:'center',gap:14,flex:1,minWidth:0}}>
        <div onClick={()=>navigate('/dashboard')} style={{width:34,height:34,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#00c8ff,#7c3aed)',boxShadow:'0 0 16px rgba(0,200,255,0.4)',cursor:'pointer',flexShrink:0}}>
          <Zap size={15} style={{color:'#020408'}}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,minWidth:0}}>
          <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t3,letterSpacing:'0.12em',flexShrink:0,display:'none'}}>DEV ENVIRON</span>
          <motion.span key={label} initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}
            style={{fontFamily:'Orbitron,sans-serif',fontWeight:800,fontSize:13,letterSpacing:'0.05em',background:'linear-gradient(135deg,#00c8ff,#fff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {label.toUpperCase()}
          </motion.span>
        </div>
      </div>

      {/* ── Barre de recherche ── */}
      <AnimatePresence>
        {search&&(
          <motion.div initial={{width:0,opacity:0}} animate={{width:220,opacity:1}} exit={{width:0,opacity:0}}
            style={{position:'absolute',left:'50%',transform:'translateX(-50%)'}}>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Escape'){setSearch(false);setQuery('')} }}
              style={{width:'100%',height:34,padding:'0 14px',background:'rgba(0,200,255,0.06)',border:`1px solid ${C.border2}`,borderRadius:8,color:C.t1,fontFamily:'Rajdhani,sans-serif',fontSize:13,outline:'none'}}
              placeholder="Rechercher..." autoFocus onBlur={()=>{if(!query){setSearch(false)}}}/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Boutons droite ── */}
      <div style={{display:'flex',alignItems:'center',gap:8}}>

        {/* Recherche */}
        <button style={ib(search)} onClick={()=>{setSearch(v=>!v);setQuery('')}}>
          {search?<X size={15}/>:<Search size={15}/>}
        </button>

        {/* Actualiser */}
        <button style={ib()} onClick={()=>showToast('Page actualisée !','success')}>
          <RefreshCw size={14}/>
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{position:'relative'}}>
          <button style={{...ib(notifMenu),position:'relative'}} onClick={handleNotifMenu}>
            <Bell size={15}/>
            <NotifBadge count={notifBadge}/>
          </button>
          <AnimatePresence>
            {notifMenu&&(
              <motion.div initial={{opacity:0,y:-8,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:0.95}}
                style={{position:'absolute',top:42,right:0,width:320,zIndex:200,background:'linear-gradient(135deg,rgba(10,22,40,0.99),rgba(6,15,26,0.99))',border:`1px solid ${C.border2}`,borderRadius:12,boxShadow:'0 20px 40px rgba(0,0,0,0.6)',overflow:'hidden'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:12,color:C.t1}}>NOTIFICATIONS</span>
                  <button onClick={handleReadAll} style={{background:'none',border:'none',color:C.cyan,cursor:'pointer',fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>TOUT LIRE</button>
                </div>
                <div style={{maxHeight:280,overflowY:'auto'}}>
                  {notifs.length ? notifs.map(n=>(
                    <div key={n.id} style={{display:'flex',gap:12,padding:'11px 16px',borderBottom:`1px solid ${C.border}`,background:n.read?'transparent':'rgba(0,200,255,0.04)'}}>
                      <span style={{fontSize:16,flexShrink:0}}>{n.type==='task'?'✅':n.type==='deploy'?'🚀':n.type==='mention'?'💬':'🔔'}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:12,color:n.read?C.t2:C.t1,lineHeight:1.4}}>{n.message}</p>
                        <p style={{fontSize:10,color:C.t3,marginTop:3}}>{n.time}</p>
                      </div>
                      {!n.read&&<span style={{width:7,height:7,borderRadius:'50%',background:C.cyan,flexShrink:0,marginTop:4}}/>}
                    </div>
                  )) : (
                    <div style={{padding:24,textAlign:'center',color:C.t3,fontSize:12}}>Aucune notification</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Menu utilisateur */}
        <div ref={menuRef} style={{position:'relative'}}>
          <button onClick={()=>setUserMenu(v=>!v)}
            style={{display:'flex',alignItems:'center',gap:9,padding:'4px 12px 4px 4px',background:'none',border:`1px solid ${userMenu?rc.color+'40':rc.color+'20'}`,borderRadius:30,cursor:'pointer',transition:'all 0.2s'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${rc.color},${rc.color}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408',flexShrink:0}}>
              {ini(user?.name)}
            </div>
            <div style={{textAlign:'left',lineHeight:1.2}}>
              <p style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t1,whiteSpace:'nowrap'}}>{user?.name?.split(' ')[0]}</p>
              <p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:rc.color}}>{rc.label}</p>
            </div>
          </button>

          <AnimatePresence>
            {userMenu&&(
              <motion.div initial={{opacity:0,y:-8,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:0.95}}
                style={{position:'absolute',top:42,right:0,width:200,zIndex:200,background:'linear-gradient(135deg,rgba(10,22,40,0.99),rgba(6,15,26,0.99))',border:`1px solid ${C.border2}`,borderRadius:12,boxShadow:'0 20px 40px rgba(0,0,0,0.6)',overflow:'hidden'}}>
                {/* Info utilisateur */}
                <div style={{padding:'14px 16px',borderBottom:`1px solid ${C.border}`}}>
                  <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:13,color:C.t1}}>{user?.name}</p>
                  <p style={{fontSize:11,color:C.t3,marginTop:2}}>{user?.email}</p>
                  <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'2px 8px',borderRadius:5,background:rc.bg,color:rc.color,border:`1px solid ${rc.border}`,display:'inline-block',marginTop:6}}>{rc.label}</span>
                </div>
                {/* Liens */}
                {[
                  {icon:User,    label:'Mon profil',   action:()=>{navigate('/settings');setUserMenu(false)}},
                  {icon:Settings,label:'Paramètres',   action:()=>{navigate('/settings');setUserMenu(false)}},
                  {icon:Bell,    label:'Notifications', action:()=>{navigate('/settings');setUserMenu(false)}},
                ].map(item=>(
                  <button key={item.label} onClick={item.action}
                    style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 16px',background:'none',border:'none',color:C.t2,cursor:'pointer',fontSize:13,fontFamily:'Rajdhani,sans-serif',fontWeight:600,transition:'all 0.15s',textAlign:'left'}}>
                    <item.icon size={14}/>{item.label}
                  </button>
                ))}
                <div style={{borderTop:`1px solid ${C.border}`,margin:'4px 0'}}/>
                {/* Déconnexion */}
                <button onClick={handleLogout}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 16px',background:'none',border:'none',color:C.nova,cursor:'pointer',fontSize:13,fontFamily:'Rajdhani,sans-serif',fontWeight:700,textAlign:'left'}}>
                  <LogOut size={14}/> Déconnexion
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
