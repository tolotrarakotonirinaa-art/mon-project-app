import React,{createContext,useContext,useState,useEffect} from 'react'
import {api, checkServer, serverStatus} from '../services/api.js'
import {PERMISSIONS} from '../data.js'

const Ctx = createContext(null)

export function AuthProvider({children}){
  const [user,    setUser]    = useState(null)
  const [loading, setLoad]    = useState(true)
  const [backendOk,  setBackendOk]  = useState(false)
  const [backendMsg, setBackendMsg] = useState('')

  useEffect(()=>{
    const init = async () => {
      const online = await checkServer()
      setBackendOk(online)
      setBackendMsg(serverStatus.message)

      if(!online){
        localStorage.removeItem('dv4_token')
        localStorage.removeItem('dv4_current')
        setLoad(false)
        return
      }

      const token = localStorage.getItem('dv4_token')
      if(!token){ setLoad(false); return }

      const res = await api.me()
      if(res?.success && res.data){
        setUser(res.data)
        localStorage.setItem('dv4_current', JSON.stringify(res.data))
      } else {
        localStorage.removeItem('dv4_token')
        localStorage.removeItem('dv4_current')
      }
      setLoad(false)
    }
    init()
  },[])

  const login = async(email, password) => {
    const online = await checkServer()
    setBackendOk(online)
    setBackendMsg(serverStatus.message)

    if(!online){
      return {
        ok: false,
        error: 'Impossible de contacter le serveur Laravel. Lancez le backend avec : php artisan serve',
        offline: true,
      }
    }

    const res = await api.login(email, password)

    if(!res?.success){
      if(res?.status === 403 || res?.message?.toLowerCase().includes('attente')){
        return {
          ok: false,
          pending: true,
          error: res?.message || "Votre compte est en attente de validation par l'administrateur.",
        }
      }
      return { ok:false, error: res?.message || 'Email ou mot de passe incorrect' }
    }

    localStorage.setItem('dv4_token',   res.data.token)
    localStorage.setItem('dv4_current', JSON.stringify(res.data.user))
    setUser(res.data.user)
    setBackendOk(true)
    return { ok:true }
  }

  const register = async(data) => {
    const online = await checkServer()
    setBackendOk(online)
    setBackendMsg(serverStatus.message)

    if(!online){
      return {
        ok: false,
        offline: true,
        error: 'Impossible de contacter le serveur Laravel. Lancez le backend avec : php artisan serve',
      }
    }

    try {
      const res = await api.register(data.name, data.email, data.password, data.role)

      if(!res?.success){
        return { ok:false, error: res?.message || "Erreur lors de l'inscription" }
      }

      // tsy mametraka token — miandry validation admin
      return { ok:true }

    } catch(e) {
      return { ok:false, error: "Erreur reseau. Verifiez que le backend est lance." }
    }
  }

  const logout = async() => {
    await api.logout().catch(()=>{})
    localStorage.removeItem('dv4_token')
    localStorage.removeItem('dv4_current')
    setUser(null)
  }

  const updateMe = upd => {
    const updated = {...user, ...upd}
    setUser(updated)
    localStorage.setItem('dv4_current', JSON.stringify(updated))
  }

  const can = perm => user ? (PERMISSIONS[user.role]?.[perm] === true) : false

  return(
    <Ctx.Provider value={{
      user, loading, login, register, logout, updateMe, can,
      backendOk, backendMsg,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
