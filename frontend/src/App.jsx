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

// ── Autres pages — imports mivantana (meilleure performance) ──
import {Repositories}  from './pages/Repositories.jsx'
import {Environments}  from './pages/Environments.jsx'
import {DevSpace}      from './pages/DevSpace.jsx'
import {Documentation} from './pages/Documentation.jsx'
import {Communication} from './pages/Communication.jsx'
import {Statistics}    from './pages/Statistics.jsx'
import {UsersPage}     from './pages/UsersPage.jsx'
import {SettingsPage}  from './pages/SettingsPage.jsx'
import {HelpPage}      from './pages/HelpPage.jsx'
import {LogoutPage}    from './pages/LogoutPage.jsx'

// ── Guard: utilisateur connecté ───────────────────────────
function PrivateRoute({children}){
  const {user,loading} = useAuth()
  if(loading) return <Loader fullScreen/>
  if(!user)   return <Navigate to="/login" replace/>
  return children
}

// ── Guard: Admin uniquement ───────────────────────────────
function AdminRoute({children}){
  const {user,loading} = useAuth()
  if(loading)              return <Loader fullScreen/>
  if(!user)                return <Navigate to="/login"     replace/>
  if(user.role !== 'admin')return <Navigate to="/dashboard" replace/>
  return children
}

// ── Guard: rôle dev ou admin ──────────────────────────────
function DevRoute({children}){
  const {user,loading} = useAuth()
  if(loading)                                  return <Loader fullScreen/>
  if(!user)                                    return <Navigate to="/login"     replace/>
  if(user.role!=='admin'&&user.role!=='dev')   return <Navigate to="/dashboard" replace/>
  return children
}

// ── Routes ────────────────────────────────────────────────
function AppRoutes(){
  const {loading} = useAuth()
  if(loading) return <Loader fullScreen/>

  return(
    <Routes>
      {/* ── Publiques ── */}
      <Route element={<AuthLayout/>}>
        <Route path="/login"    element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
      </Route>

      {/* ── Protégées ── */}
      <Route element={<AppLayout/>}>

        {/* Accessibles à tous les rôles connectés */}
        <Route path="/dashboard"     element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
        <Route path="/projects"      element={<PrivateRoute><Projects/></PrivateRoute>}/>
        <Route path="/tasks"         element={<PrivateRoute><Tasks/></PrivateRoute>}/>
        <Route path="/documentation" element={<PrivateRoute><Documentation/></PrivateRoute>}/>
        <Route path="/communication" element={<PrivateRoute><Communication/></PrivateRoute>}/>
        <Route path="/statistics"    element={<PrivateRoute><Statistics/></PrivateRoute>}/>
        <Route path="/settings"      element={<PrivateRoute><SettingsPage/></PrivateRoute>}/>
        <Route path="/help"          element={<PrivateRoute><HelpPage/></PrivateRoute>}/>
        <Route path="/logout"        element={<PrivateRoute><LogoutPage/></PrivateRoute>}/>

        {/* Dev + Admin uniquement */}
        <Route path="/pipeline"      element={<DevRoute><Pipeline/></DevRoute>}/>
        <Route path="/repositories"  element={<DevRoute><Repositories/></DevRoute>}/>
        <Route path="/environments"  element={<DevRoute><Environments/></DevRoute>}/>
        <Route path="/devspace"      element={<DevRoute><DevSpace/></DevRoute>}/>

        {/* Admin uniquement */}
        <Route path="/users"         element={<AdminRoute><UsersPage/></AdminRoute>}/>
        <Route path="/admin/validation" element={<AdminRoute><AdminValidation/></AdminRoute>}/>

      </Route>

      {/* ── Redirections ── */}
      <Route path="/"  element={<Navigate to="/dashboard" replace/>}/>
      <Route path="*"  element={<Navigate to="/dashboard" replace/>}/>
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
