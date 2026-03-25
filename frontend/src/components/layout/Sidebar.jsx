import React from 'react'
import {NavLink} from 'react-router-dom'
import {motion,AnimatePresence} from 'framer-motion'
import {
  LayoutDashboard,FolderGit2,CheckSquare,GitBranch,
  Server,Code2,BookOpen,MessageSquare,BarChart3,
  Users,Settings,HelpCircle,LogOut,Zap,
  ChevronLeft,ChevronRight,Database,Shield,
} from 'lucide-react'
import {useAuth} from '../../context/AuthContext.jsx'
import {useApp} from '../../context/AppContext.jsx'
import {C,S,ROLE_META} from '../../styles.js'
import {ini} from '../../data.js'

const NAV=[
  {sec:'GÉNÉRAL',items:[
    {to:'/dashboard',   icon:LayoutDashboard,label:'Tableau de bord',perm:'dashboard'},
    {to:'/projects',    icon:FolderGit2,     label:'Projets',        perm:'projects'},
    {to:'/tasks',       icon:CheckSquare,    label:'Tâches',         perm:'tasks'},
  ]},
  {sec:'DÉVELOPPEMENT',items:[
    {to:'/pipeline',     icon:GitBranch,label:'Pipeline CI/CD',  perm:'pipeline'},
    {to:'/repositories', icon:Database,  label:'Dépôts Git',     perm:'repositories'},
    {to:'/environments', icon:Server,    label:'Environnements', perm:'environments'},
    {to:'/devspace',     icon:Code2,     label:'Espace Dev',     perm:'devspace'},
  ]},
  {sec:'COLLABORATION',items:[
    {to:'/documentation', icon:BookOpen,     label:'Documentation', perm:'documentation'},
    {to:'/communication', icon:MessageSquare,label:'Communication', perm:'communication'},
    {to:'/statistics',    icon:BarChart3,    label:'Statistiques',  perm:'statistics'},
  ]},
  {sec:'ADMIN',items:[
    {to:'/users',    icon:Users,   label:'Utilisateurs', perm:'users', adminOnly:true},
    {to:'/settings', icon:Settings,label:'Paramètres',   perm:'settings'},
  ]},
  {sec:'SUPPORT',items:[
    {to:'/help',   icon:HelpCircle,label:'Aide & Support',perm:'help'},
    {to:'/logout', icon:LogOut,    label:'Déconnexion',   perm:'logout'},
  ]},
]

export default function Sidebar(){
  const {user,can}          = useAuth()
  const {sidebar,setSidebar} = useApp()
  const rc = ROLE_META[user?.role]||ROLE_META.dev
  const W  = sidebar ? 240 : 64

  return(
    <motion.aside animate={{width:W,minWidth:W}} transition={{duration:0.3,ease:[0.16,1,0.3,1]}}
      style={{height:'calc(100vh - 64px)',position:'sticky',top:64,background:'rgba(4,12,20,0.98)',borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',overflow:'hidden',flexShrink:0}}>

      {/* Pill utilisateur */}
      <AnimatePresence>
        {sidebar&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{margin:'10px 10px 0',padding:'10px 12px',borderRadius:11,background:`${rc.color}0d`,border:`1px solid ${rc.color}20`}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${rc.color},${rc.color}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408',flexShrink:0}}>
                {ini(user?.name)}
              </div>
              <div style={{minWidth:0}}>
                <p style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</p>
                <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'1px 6px',borderRadius:4,background:rc.bg,color:rc.color,border:`1px solid ${rc.border}`}}>{rc.label}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav style={{flex:1,overflowY:'auto',overflowX:'hidden',paddingBottom:8}}>
        {NAV.map(group=>{
          const vis = group.items.filter(it => can(it.perm))
          if(!vis.length) return null
          return(
            <div key={group.sec}>
              {sidebar&&(
                <p style={{padding:'10px 16px 4px',fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,letterSpacing:'0.18em',color:C.t3}}>
                  {group.sec}
                </p>
              )}
              {!sidebar&&<div style={{height:1,background:C.border,margin:'5px 8px'}}/>}
              {vis.map(it=>(
                <NavLink key={it.to} to={it.to} style={{textDecoration:'none'}}>
                  {({isActive})=>(
                    <motion.div whileHover={{x:sidebar?2:0}} title={!sidebar?it.label:undefined}
                      style={{
                        display:'flex',alignItems:'center',
                        gap:sidebar?10:0,
                        justifyContent:sidebar?'flex-start':'center',
                        padding:sidebar?'9px 14px 9px 16px':'10px',
                        margin:'1px 6px',borderRadius:9,
                        background:isActive?'rgba(0,200,255,0.10)':'transparent',
                        border:`1px solid ${isActive?'rgba(0,200,255,0.22)':'transparent'}`,
                        color:isActive?C.cyan:C.t2,
                        cursor:'pointer',transition:'all 0.18s',
                        borderLeft:isActive?`2px solid ${C.cyan}`:'2px solid transparent',
                        // Déconnexion en rouge subtil
                        ...(it.to==='/logout'&&!isActive?{color:'rgba(255,45,120,0.7)'}:{}),
                        ...(it.to==='/logout'&&isActive?{color:C.nova,borderLeftColor:C.nova,background:'rgba(255,45,120,0.10)',border:'1px solid rgba(255,45,120,0.22)'}:{}),
                      }}>
                      <it.icon size={16} style={{flexShrink:0}}/>
                      <AnimatePresence>
                        {sidebar&&(
                          <motion.span initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}} transition={{duration:0.15}}
                            style={{fontSize:13,fontFamily:'Rajdhani,sans-serif',fontWeight:600,whiteSpace:'nowrap',flex:1}}>
                            {it.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {it.adminOnly&&sidebar&&<Shield size={9} style={{color:C.nova,flexShrink:0}}/>}
                    </motion.div>
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      {/* Bouton réduire */}
      <div style={{padding:'8px 6px',borderTop:`1px solid ${C.border}`}}>
        <button onClick={()=>setSidebar(v=>!v)}
          style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px',borderRadius:8,background:'none',border:`1px solid ${C.border}`,color:C.t3,cursor:'pointer',transition:'all 0.2s',fontFamily:'Orbitron,sans-serif',fontSize:10,fontWeight:700}}>
          {sidebar?<><ChevronLeft size={13}/><span>Réduire</span></>:<ChevronRight size={13}/>}
        </button>
      </div>
    </motion.aside>
  )
}
