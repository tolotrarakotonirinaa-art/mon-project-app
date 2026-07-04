import React,{useState,useEffect} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {Shield,Check,X,Clock,User,Mail,Calendar,RefreshCw} from 'lucide-react'
import {useAuth} from '../../context/AuthContext.jsx'
import {api} from '../../services/api.js'
import {C,S} from '../../styles.js'
import {Loader,Empty} from '../../components/ui/UI.jsx'

export default function AdminValidation(){
  const {user} = useAuth()
  const [pending,setPending] = useState([])
  const [busy,setBusy]       = useState(true)
  const [loading,setLoading] = useState({})
  const [msg,setMsg]         = useState(null)

  const load = async() => {
    setBusy(true)
    try{
      const res = await api.get('/auth/pending-users')
      if(res?.success) setPending(res.data||[])
    } catch(e){ console.error(e) }
    finally{ setBusy(false) }
  }

  useEffect(()=>{ load() },[])

  const validate = async(id) => {
    setLoading(l=>({...l,[id]:'validating'}))
    try{
      const res = await api.patch(`/auth/validate-user/${id}`)
      if(res?.success){
        setPending(p=>p.filter(u=>u.id!==id))
        setMsg({type:'success',text:'Utilisateur valide avec succes!'})
        setTimeout(()=>setMsg(null),3000)
      }
    } catch(e){ console.error(e) }
    finally{
      setLoading(l=>({...l,[id]:null}))
      setBusy(false)
    }
  }

  const reject = async(id) => {
    setLoading(l=>({...l,[id]:'rejecting'}))
    try{
      const res = await api.delete(`/auth/reject-user/${id}`)
      if(res?.success){
        setPending(p=>p.filter(u=>u.id!==id))
        setMsg({type:'error',text:'Utilisateur rejete.'})
        setTimeout(()=>setMsg(null),3000)
      }
    } catch(e){ console.error(e) }
    finally{
      setLoading(l=>({...l,[id]:null}))
      setBusy(false)
    }
  }

  if(user?.role!=='admin') return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300}}>
      <p style={{color:C.nova,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>ACCES REFUSE — Admin uniquement</p>
    </div>
  )

  return(
    <div>
      {/* Header */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28,flexWrap:'wrap',gap:14}}>
        <div>
          <p style={{fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t3,letterSpacing:'0.15em',marginBottom:4}}>
            ADMINISTRATION
          </p>
          <h1 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:24,lineHeight:1}}>
            <span style={{color:C.t1}}>VALIDATION </span>
            <span style={{background:'linear-gradient(135deg,#ff2d78,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>UTILISATEURS</span>
          </h1>
          <p style={{color:C.t2,fontSize:13,marginTop:5}}>
            {pending.length} compte{pending.length!==1?'s':''} en attente de validation
          </p>
        </div>
        <button onClick={load} style={S.btnGhost}>
          <RefreshCw size={13}/> Actualiser
        </button>
      </motion.div>

      {/* Message feedback */}
      <AnimatePresence>
        {msg&&(
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            style={{marginBottom:16,padding:'10px 16px',borderRadius:10,
              background:msg.type==='success'?'rgba(0,255,136,0.08)':'rgba(255,45,120,0.08)',
              border:`1px solid ${msg.type==='success'?'rgba(0,255,136,0.3)':'rgba(255,45,120,0.3)'}`,
              color:msg.type==='success'?C.neon:C.nova,
              display:'flex',alignItems:'center',gap:8,fontSize:13}}>
            {msg.type==='success'?<Check size={14}/>:<X size={14}/>}
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu */}
      {busy ? <Loader/> : pending.length===0 ? (
        <motion.div
          key="empty"
          initial={{opacity:0,y:16}}
          animate={{opacity:1,y:0}}
          transition={{duration:0.4}}
          style={S.panel({padding:48,textAlign:'center'})}>
          <motion.div
            initial={{scale:0.7,opacity:0}}
            animate={{scale:1,opacity:1}}
            transition={{delay:0.1,type:'spring',stiffness:200}}>
            <Shield size={48} style={{color:C.neon,margin:'0 auto 18px'}}/>
          </motion.div>
          <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,marginBottom:10}}>
            AUCUN COMPTE EN ATTENTE
          </p>
          <p style={{fontSize:13,color:C.t3}}>Tous les comptes ont ete traites.</p>
        </motion.div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {pending.map((u,i)=>(
            <motion.div key={u.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
              style={{...S.panel({padding:20}),display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>

              {/* Avatar */}
              <div style={{width:48,height:48,borderRadius:12,background:'rgba(255,206,0,0.1)',border:'1px solid rgba(255,206,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:16,color:'#ffce00'}}>
                  {u.avatar||u.name?.substring(0,2).toUpperCase()}
                </span>
              </div>

              {/* Infos */}
              <div style={{flex:1,minWidth:200}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
                  <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:14,color:C.t1}}>{u.name}</span>
                  <span style={{padding:'3px 10px',borderRadius:20,fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                    background:u.role==='dev'?'rgba(0,200,255,0.1)':'rgba(0,255,136,0.1)',
                    color:u.role==='dev'?C.cyan:C.neon,
                    border:`1px solid ${u.role==='dev'?'rgba(0,200,255,0.3)':'rgba(0,255,136,0.3)'}`}}>
                    {u.role?.toUpperCase()}
                  </span>
                  <span style={{padding:'3px 10px',borderRadius:20,fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                    background:'rgba(255,206,0,0.1)',color:'#ffce00',border:'1px solid rgba(255,206,0,0.3)'}}>
                    EN ATTENTE
                  </span>
                </div>
                <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                  <div style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:C.t2}}>
                    <Mail size={11} style={{color:C.t3}}/>{u.email}
                  </div>
                  {u.join_date&&(
                    <div style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:C.t2}}>
                      <Calendar size={11} style={{color:C.t3}}/>
                      Inscrit le {new Date(u.join_date).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{display:'flex',gap:10,flexShrink:0}}>
                <motion.button whileTap={{scale:0.95}}
                  onClick={()=>validate(u.id)}
                  disabled={!!loading[u.id]}
                  style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:10,
                    background:'rgba(0,255,136,0.1)',border:'1px solid rgba(0,255,136,0.35)',
                    color:C.neon,fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:11,
                    cursor:loading[u.id]?'not-allowed':'pointer',opacity:loading[u.id]?0.6:1}}>
                  {loading[u.id]==='validating'
                    ?<motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.7,ease:'linear'}}
                        style={{width:12,height:12,borderRadius:'50%',border:'2px solid currentColor',borderTopColor:'transparent',display:'inline-block'}}/>
                    :<Check size={13}/>
                  }
                  VALIDER
                </motion.button>

                <motion.button whileTap={{scale:0.95}}
                  onClick={()=>reject(u.id)}
                  disabled={!!loading[u.id]}
                  style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:10,
                    background:'rgba(255,45,120,0.1)',border:'1px solid rgba(255,45,120,0.35)',
                    color:C.nova,fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:11,
                    cursor:loading[u.id]?'not-allowed':'pointer',opacity:loading[u.id]?0.6:1}}>
                  {loading[u.id]==='rejecting'
                    ?<motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.7,ease:'linear'}}
                        style={{width:12,height:12,borderRadius:'50%',border:'2px solid currentColor',borderTopColor:'transparent',display:'inline-block'}}/>
                    :<X size={13}/>
                  }
                  REJETER
                </motion.button>
              </div>

            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
