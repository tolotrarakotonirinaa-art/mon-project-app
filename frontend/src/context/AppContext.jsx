import React,{createContext,useContext,useState,useCallback} from 'react'
import {api} from '../services/api.js'

const Ctx = createContext(null)

function getData(res, fallback=[]){
  if(!res)         return fallback
  if(res.offline)  return fallback
  if(!res.success) return fallback
  return res.data ?? fallback
}

export function AppProvider({children}){
  const [sidebar,    setSidebar]     = useState(true)
  const [toast,      setToast]       = useState(null)
  const [modal,      setModal]       = useState(null)
  const [notifBadge, setNotifBadge]  = useState(0)

  const showToast = useCallback((msg, type='info')=>{
    setToast({msg, type, id:Date.now()})
    setTimeout(()=>setToast(null), 3800)
  },[])

  const openModal  = useCallback(cfg=>setModal(cfg),[])
  const closeModal = useCallback(()=>setModal(null),[])

  // ── Projets ───────────────────────────────────────────
  const getProjects   = ()       => api.getProjects().then(r=>getData(r,[]))
  const addProject    = data     => api.createProject(data)
  const updateProject = (id,d)   => api.updateProject(id,d)
  const deleteProject = id       => api.deleteProject(id)

  // ── Tâches ────────────────────────────────────────────
  const getTasks   = ()       => api.getTasks().then(r=>getData(r,[]))
  const addTask    = data     => api.createTask(data)
  const updateTask = (id,d)   => api.updateTask(id,d)
  const deleteTask = id       => api.deleteTask(id)
  const moveTask   = (id,s)   => api.moveTask(id,s)

  // ── Dépôt de Fichiers (remplace Git repos) ────────────
  const getFiles    = ()              => api.getFiles().then(r=>getData(r,[]))
  const uploadFile  = (file, desc='') => api.uploadFile(file, desc)
  const deleteFile  = id              => api.deleteFile(id)
  const downloadFile= (id, filename)  => api.downloadFile(id, filename)

  // ── Environnements ────────────────────────────────────
  const getEnvs   = ()      => api.getEnvs().then(r=>getData(r,[]))
  const addEnv    = data    => api.createEnv(data)
  const deleteEnv = id      => api.deleteEnv(id)

  // ── Pipeline ──────────────────────────────────────────
  const getPipe     = ()    => api.pipeStatus().then(r=>getData(r,{status:{}}))
  const getPipeLogs = ()    => api.pipeLogs().then(r=>getData(r,[]))

  // ── Chat ──────────────────────────────────────────────
  const getChat   = ch      => api.getMessages(ch||'general').then(r=>getData(r,[]))
  const addMsg    = msg     => api.sendMessage(msg.msg||msg.message||'')
  const clearChat = ()      => api.clearChat()

  // ── Activités ─────────────────────────────────────────
  const getActivities   = () => api.dashboard().then(r=>getData(r,{recent_activities:[]}).recent_activities||[])
  const clearActivities = () => Promise.resolve()
  const addActivity     = () => Promise.resolve()

  // ── Utilisateurs ──────────────────────────────────────
  const getUsers = ()       => api.getUsers().then(r=>getData(r,[]))
  const addUser  = data     => api.createUser(data)
  const updUser  = (id,d)   => api.updateUser(id,d)
  const delUser  = id       => api.deleteUser(id)

  // ── Notifications ─────────────────────────────────────
  const getNotifs = () => api.getNotifs().then(r=>{
    const d = r?.data || {}
    setNotifBadge(d.unread||0)
    return d.items||[]
  })
  const readNotif     = id  => api.readNotif(id)
  const readAllNotifs = ()  => api.readAllNotifs().then(r=>{ setNotifBadge(0); return r })

  // ── Statistiques ──────────────────────────────────────
  const getStats = () => api.statistics().then(r=>getData(r,{}))

  return(
    <Ctx.Provider value={{
      sidebar, setSidebar,
      toast, showToast,
      modal, openModal, closeModal,
      notifBadge, setNotifBadge,
      getProjects, addProject, updateProject, deleteProject,
      getTasks, addTask, updateTask, deleteTask, moveTask,
      getFiles, uploadFile, deleteFile, downloadFile,
      getEnvs, addEnv, deleteEnv,
      getPipe, getPipeLogs,
      getChat, addMsg, clearChat,
      getActivities, clearActivities, addActivity,
      getUsers, addUser, updUser, delUser,
      getNotifs, readNotif, readAllNotifs,
      getStats,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = ()=>useContext(Ctx)
