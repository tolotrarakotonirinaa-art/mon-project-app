// ════════════════════════════════════════════════
//  DevEnviron 4D — Service API
//  Mode STRICT : le backend Laravel est obligatoire
//  Sans backend → connexion impossible
// ════════════════════════════════════════════════

const API_URL = 'http://localhost:8000/api'

// État de connexion au backend
export let serverStatus = {
  online:  false,   // true si le backend répond
  checked: false,   // true après le 1er check
  message: '',      // message d'erreur si hors ligne
}

// ── Vérifier si le backend est accessible ────────────────
export async function checkServer(){
  try {
    const res = await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(4000), // 4 secondes max
    })
    if(res.ok){
      serverStatus = { online:true, checked:true, message:'' }
      return true
    }
    serverStatus = { online:false, checked:true, message:`Le serveur répond avec une erreur (${res.status})` }
    return false
  } catch(err) {
    serverStatus = {
      online:  false,
      checked: true,
      message: 'Impossible de contacter le serveur Laravel sur http://localhost:8000\nVérifiez que le backend est lancé avec : php artisan serve',
    }
    return false
  }
}

// ── Requête HTTP principale ───────────────────────────────
async function request(method, endpoint, body=null){
  const token = localStorage.getItem('dv4_token')

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    },
    signal: AbortSignal.timeout(8000), // 8 secondes max
  }

  if(token) options.headers['Authorization'] = `Bearer ${token}`
  if(body && method !== 'GET') options.body = JSON.stringify(body)

  try {
    const res = await fetch(`${API_URL}${endpoint}`, options)
    serverStatus.online = true

    // Token expiré → déconnexion automatique
    if(res.status === 401){
      localStorage.removeItem('dv4_token')
      localStorage.removeItem('dv4_current')
      window.location.href = '/login'
      return { success:false, message:'Session expirée. Veuillez vous reconnecter.' }
    }

    return await res.json()

  } catch(err) {
    // Backend inaccessible
    serverStatus.online  = false
    serverStatus.message = 'Impossible de contacter le serveur Laravel sur http://localhost:8000'
    return {
      success: false,
      offline: true,
      message: 'Impossible de contacter le serveur Laravel.\nAssurez-vous que le backend est lancé : php artisan serve',
    }
  }
}

// ── API publique — TOUTES les requêtes passent par le backend ──
export const api = {

  // ── Health ──────────────────────────────────────────────
  health: () => request('GET', '/health'),

  // ── Auth ────────────────────────────────────────────────
  login:    (email, password, role) =>
    request('POST', '/auth/login', { email, password, role }),

  register: (name, email, password, role) =>
    request('POST', '/auth/register', { name, email, password, role }),

  me:       () => request('GET',  '/auth/me'),
  logout:   () => request('POST', '/auth/logout'),

  changePassword: (current_password, new_password) =>
    request('PUT', '/auth/password', { current_password, new_password }),

  updateProfile: (data) => request('PUT', '/auth/profile', data),

  // ── Dashboard ───────────────────────────────────────────
  dashboard:  () => request('GET', '/dashboard'),

  // ── Projets ─────────────────────────────────────────────
  getProjects: (f={}) => {
    const q = new URLSearchParams(f).toString()
    return request('GET', `/projects${q?'?'+q:''}`)
  },
  getProject:    (id)       => request('GET',    `/projects/${id}`),
  createProject: (data)     => request('POST',   '/projects', data),
  updateProject: (id, data) => request('PUT',    `/projects/${id}`, data),
  deleteProject: (id)       => request('DELETE', `/projects/${id}`),
  projectStats:  (id)       => request('GET',    `/projects/${id}/stats`),

  // ── Tâches ──────────────────────────────────────────────
  getTasks: (f={}) => {
    const q = new URLSearchParams(f).toString()
    return request('GET', `/tasks${q?'?'+q:''}`)
  },
  getTask:    (id)         => request('GET',    `/tasks/${id}`),
  createTask: (data)       => request('POST',   '/tasks', data),
  updateTask: (id, data)   => request('PUT',    `/tasks/${id}`, data),
  moveTask:   (id, status) => request('PATCH',  `/tasks/${id}/move`, { status }),
  deleteTask: (id)         => request('DELETE', `/tasks/${id}`),
  taskStats:  ()           => request('GET',    '/tasks/stats'),

  // ── Utilisateurs ────────────────────────────────────────
  getUsers:   ()           => request('GET',    '/users'),
  getUser:    (id)         => request('GET',    `/users/${id}`),
  createUser: (data)       => request('POST',   '/users', data),
  updateUser: (id, data)   => request('PUT',    `/users/${id}`, data),
  deleteUser: (id)         => request('DELETE', `/users/${id}`),

  // ── Dépôts Git ──────────────────────────────────────────
  getRepos:   ()           => request('GET',    '/repositories'),
  getRepo:    (id)         => request('GET',    `/repositories/${id}`),
  createRepo: (data)       => request('POST',   '/repositories', data),
  updateRepo: (id, data)   => request('PUT',    `/repositories/${id}`, data),
  deleteRepo: (id)         => request('DELETE', `/repositories/${id}`),
  starRepo:   (id)         => request('POST',   `/repositories/${id}/star`),

  // ── Environnements ──────────────────────────────────────
  getEnvs:    ()           => request('GET',    '/environments'),
  getEnv:     (id)         => request('GET',    `/environments/${id}`),
  createEnv:  (data)       => request('POST',   '/environments', data),
  updateEnv:  (id, data)   => request('PUT',    `/environments/${id}`, data),
  deleteEnv:  (id)         => request('DELETE', `/environments/${id}`),
  deployEnv:  (id)         => request('POST',   `/environments/${id}/deploy`),
  envMetrics: (id)         => request('GET',    `/environments/${id}/metrics`),

  // ── Pipeline ────────────────────────────────────────────
  pipeStatus:    () => request('GET',    '/pipeline/status'),
  pipeLogs:      () => request('GET',    '/pipeline/logs'),
  pipeRun:       () => request('POST',   '/pipeline/run'),
  pipeStop:      () => request('POST',   '/pipeline/stop'),
  pipeStage: (data) => request('PATCH',  '/pipeline/stage', data),
  pipeClearLogs: () => request('DELETE', '/pipeline/logs'),

  // ── Chat ────────────────────────────────────────────────
  getMessages:  (ch='general') => request('GET',    `/chat/messages?channel=${ch}`),
  sendMessage:  (message, ch='general') => request('POST', '/chat/messages', { message, channel:ch }),
  clearChat:    ()             => request('DELETE', '/chat/messages'),
  deleteMsg:    (id)           => request('DELETE', `/chat/messages/${id}`),

  // ── Notifications ────────────────────────────────────────
  getNotifs:     () => request('GET',   '/notifications'),
  readNotif:    (id)=> request('PATCH', `/notifications/${id}/read`),
  readAllNotifs: () => request('PATCH', '/notifications/read-all'),
  deleteNotif:  (id)=> request('DELETE',`/notifications/${id}`),

  // ── Statistiques ────────────────────────────────────────
  statistics: () => request('GET', '/statistics'),

  // ── État serveur ────────────────────────────────────────
  isOnline: () => serverStatus.online,
}
