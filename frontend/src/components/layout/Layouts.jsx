import React from 'react'
import {Outlet,Navigate} from 'react-router-dom'
import {motion} from 'framer-motion'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'
import {ToastContainer,Modal,OfflineBanner} from '../ui/UI.jsx'
import {useAuth} from '../../context/AuthContext.jsx'
import {C,S} from '../../styles.js'

export function AppLayout(){
  const {user,loading}=useAuth()
  if(loading) return null
  if(!user) return <Navigate to="/login" replace/>
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:C.bg,position:'relative'}}>
      {/* Grid background */}
      <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',...S.gridBg}}/>
      {/* Contenu */}
      <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',flex:1}}>
        <OfflineBanner/>
        <Navbar/>
        <div style={{display:'flex',flex:1,overflow:'hidden'}}>
          <Sidebar/>
          <main style={{flex:1,overflowY:'auto',overflowX:'hidden',minWidth:0}}>
            <motion.div
              key={window.location.pathname}
              initial={{opacity:0,y:12}}
              animate={{opacity:1,y:0}}
              transition={{duration:0.32,ease:[0.16,1,0.3,1]}}
              style={{padding:28,maxWidth:1600,margin:'0 auto'}}>
              <Outlet/>
            </motion.div>
          </main>
        </div>
      </div>
      <ToastContainer/>
      <Modal/>
    </div>
  )
}

export function AuthLayout(){
  const {user}=useAuth()
  if(user) return <Navigate to="/dashboard" replace/>
  return <Outlet/>
}
