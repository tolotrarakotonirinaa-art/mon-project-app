import React from 'react'
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import {AuthProvider,useAuth} from './context/AuthContext.jsx'
import {AppProvider} from './context/AppContext.jsx'
import {AppLayout,AuthLayout} from './components/layout/Layouts.jsx'
import {Loader} from './components/ui/UI.jsx'

// ── Pages Auth ────────────────────────────────────────────
import Login    from './pages/Login.jsx'
import Register from './pages/Register.jsx'

// ── Pages principales ─────────────────────────────────────
import Dashboard from './pages/Dashboard.jsx'
import Projects  from './pages/Projects.jsx'
import Tasks     from './pages/Tasks.jsx'
import Pipeline  from './pages/Pipeline.jsx'

// ── Page Admin ────────────────────────────────────────────
import AdminValidation from './pages/admin/AdminValidation.jsx'

// ── Autres pages ──────────────────────────────────────────
import {
  Repositories,
  Environments,
  DevSpace,
  Documentation,
  Communication,
  Statistics,
  UsersPage,
  SettingsPage,
  HelpPage,
  LogoutPage,
} from './pages/OtherPages.jsx'

// ── Guard Admin ───────────────────────────────────────────
function AdminRoute({children}){
  const {user} = useAuth()
  if(!user) return <Navigate to="/login" replace/>
  if(user.role !== 'admin') return <Navigate to="/dashboard" replace/>
  return children
}

// ── Routes avec protection ────────────────────────────────
function AppRoutes(){
  const {loading} = useAuth()
  if(loading) return <Loader fullScreen/>
  return(
    <Routes>
      {/* Routes publiques */}
      <Route element={<AuthLayout/>}>
        <Route path="/login"    element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
      </Route>

      {/* Routes protegees */}
      <Route element={<AppLayout/>}>
        <Route path="/dashboard"     element={<Dashboard/>}/>
        <Route path="/projects"      element={<Projects/>}/>
        <Route path="/tasks"         element={<Tasks/>}/>
        <Route path="/pipeline"      element={<Pipeline/>}/>
        <Route path="/repositories"  element={<Repositories/>}/>
        <Route path="/environments"  element={<Environments/>}/>
        <Route path="/devspace"      element={<DevSpace/>}/>
        <Route path="/documentation" element={<Documentation/>}/>
        <Route path="/communication" element={<Communication/>}/>
        <Route path="/statistics"    element={<Statistics/>}/>
        <Route path="/users"         element={<UsersPage/>}/>
        <Route path="/settings"      element={<SettingsPage/>}/>
        <Route path="/help"          element={<HelpPage/>}/>
        <Route path="/logout"        element={<LogoutPage/>}/>

        {/* Route Admin uniquement */}
        <Route path="/admin/validation" element={
          <AdminRoute>
            <AdminValidation/>
          </AdminRoute>
        }/>
      </Route>

      {/* Redirections */}
      <Route path="/"  element={<Navigate to="/login" replace/>}/>
      <Route path="*"  element={<Navigate to="/login" replace/>}/>
    </Routes>
  )
}

export default function App(){
  return(
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes/>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
