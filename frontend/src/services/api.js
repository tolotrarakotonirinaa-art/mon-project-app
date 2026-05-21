// ────────────────────────────────────────────────────────
//  DevEnviron 4D — Service API
//  Mode STRICT : le backend Laravel est obligatoire
// ────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export let serverStatus = {
  online:  false,
  checked: false,
  message: '',
}

export async function checkServer(){
  try {
    const res = await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(4000),
    })
    if(res.ok){
      serverStatus = { online:true, checked:true, message:'' }
      return true
    }
    serverStatus = { online:false, checked:true, message:`Le serveur repond avec une erreur (${res.status})` }
    return false
  } catch(err) {
    serverStatus = {
      online:  false,
      checked: true,
      message: 'Impossible de contacter le serveur Laravel sur http://localhost:8000',
    }
    return false
  }
}

async function request(method, endpoint, body=null, timeout=15000){
  const token = localStorage.getItem('dv4_token')

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    },
    signal: AbortSignal.timeout(timeout),
  }

  if(token) options.headers['Authorization'] = `Bearer ${token}`
  if(body && method !== 'GET') options.body = JSON.stringify(body)

  try {
    const res = await fetch(`${API_URL}${endpoint}`, options)
    serverStatus.online = true

    if(res.status === 401){
      localStorage.removeItem('dv4_token')
      localStorage.removeItem('dv4_current')
      window.location.href = '/login'
      return { success:false, message:'Session expiree. Veuillez vous reconnecter.' }
    }

    const data = await res.json()
    data.status = res.status
    return data

  } catch(err) {
    if(err?.name === 'TimeoutError'){
      return {
        success: false,
        offline: false,
        message: 'Le serveur met trop de temps a repondre. Reessayez.',
      }
    }
    serverStatus.online  = false
    serverStatus.message = 'Impossible de contacter le serveur Laravel sur http://localhost:8000'
    return {
      success: false,
      offline: true,
      message: 'Impossible de contacter le serveur Laravel. Assurez-vous que le backend est lance : php artisan serve',
    }
  }
}

export const api = {

  get:    (endpoint)        => request('GET',    endpoint),
  post:   (endpoint, body)  => request('POST',   endpoint, body),
  put:    (endpoint, body)  => request('PUT',    endpoint, body),
  patch:  (endpoint, body)  => request('PATCH',  endpoint, body),
  delete: (endpoint)        => request('DELETE', endpoint),

  health: () => request('GET', '/health'),

  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),

  register: (name, email, password, role) =>
    request('POST', '/auth/register', { name, email, password, role }, 30000),

  me:       () => request('GET',  '/auth/me'),
  logout:   () => request('POST', '/auth/logout'),

  changePassword: (current_password, new_password) =>
    request('PUT', '/auth/password', { current_password, new_password }),

  updateProfile: (data) => request('PUT', '/auth/profile', data),

  pendingUsers: () =>
    request('GET', '/auth/pending-users'),

  validateUser: (id) =>
    request('PATCH', `/auth/validate-user/${id}`, null, 30000),

  rejectUser: (id) =>
    request('DELETE', `/auth/reject-user/${id}`),

  dashboard: () => request('GET', '/dashboard'),

  getProjects: (f={}) => {
    const q = new URLSearchParams(f).toString()
    return request('GET', `/projects${q?'?'+q:''}`)
  },
  getProject:           (id)       => request('GET',    `/projects/${id}`),
  createProject:        (data)     => request('POST',   '/projects', data),
  updateProject:        (id, data) => request('PUT',    `/projects/${id}`, data),
  deleteProject:        (id)       => request('DELETE', `/projects/${id}`),
  projectStats:         (id)       => request('GET',    `/projects/${id}/stats`),
  recalculateProgress:  (id)       => request('POST',   `/projects/${id}/recalculate`),

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

  getUsers:   ()           => request('GET',    '/users'),
  getUser:    (id)         => request('GET',    `/users/${id}`),
  createUser: (data)       => request('POST',   '/users', data),
  updateUser: (id, data)   => request('PUT',    `/users/${id}`, data),
  deleteUser: (id)         => request('DELETE', `/users/${id}`),
  getAssignables: ()       => request('GET',    '/users/assignables'),

  // ── Dépôt de Fichiers (remplace Git repositories) ────
  getFiles:  ()            => request('GET',    '/files'),
  getFile:   (id)          => request('GET',    `/files/${id}`),
  deleteFile:(id)          => request('DELETE', `/files/${id}`),

  // Upload multipart/form-data — pas de JSON
  uploadFile: async (file, description='') => {
    const token = localStorage.getItem('dv4_token')
    const form  = new FormData()
    form.append('file', file)
    if(description) form.append('description', description)

    try {
      const res = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          // NE PAS mettre Content-Type ici — le browser le met automatiquement avec boundary
        },
        body: form,
        signal: AbortSignal.timeout(60000), // 60s pour les gros fichiers
      })
      if(res.status === 401){
        localStorage.removeItem('dv4_token')
        window.location.href = '/login'
        return { success:false, message:'Session expirée.' }
      }
      return await res.json()
    } catch(err) {
      return { success:false, message: err?.message||'Erreur upload' }
    }
  },

  // Téléchargement — crée un lien temporaire
  downloadFile: async (id, filename='fichier') => {
    const token = localStorage.getItem('dv4_token')
    const res = await fetch(`${API_URL}/files/${id}/download`, {
      headers: {
        'Accept': '*/*',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(60000),
    })
    if(!res.ok) throw new Error('Téléchargement échoué')
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    return { success:true }
  },

  getEnvs:    ()           => request('GET',    '/environments'),
  getEnv:     (id)         => request('GET',    `/environments/${id}`),
  createEnv:  (data)       => request('POST',   '/environments', data),
  updateEnv:  (id, data)   => request('PUT',    `/environments/${id}`, data),
  deleteEnv:  (id)         => request('DELETE', `/environments/${id}`),
  deployEnv:  (id)         => request('POST',   `/environments/${id}/deploy`),
  envMetrics: (id)         => request('GET',    `/environments/${id}/metrics`),

  pipeStatus:    () => request('GET',    '/pipeline/status'),
  pipeLogs:      () => request('GET',    '/pipeline/logs'),
  pipeRun:       () => request('POST',   '/pipeline/run'),
  pipeStop:      () => request('POST',   '/pipeline/stop'),
  pipeStage: (data) => request('PATCH',  '/pipeline/stage', data),
  pipeClearLogs: () => request('DELETE', '/pipeline/logs'),

  getMessages:  (ch='general') => request('GET',    `/chat/messages?channel=${ch}`),
  sendMessage:  (message, ch='general') => request('POST', '/chat/messages', { message, channel:ch }),
  clearChat:    ()             => request('DELETE', '/chat/messages'),
  deleteMsg:    (id)           => request('DELETE', `/chat/messages/${id}`),

  getNotifs:     () => request('GET',   '/notifications'),
  readNotif:    (id)=> request('PATCH', `/notifications/${id}/read`),
  readAllNotifs: () => request('PATCH', '/notifications/read-all'),
  deleteNotif:  (id)=> request('DELETE',`/notifications/${id}`),

  statistics: () => request('GET', '/statistics'),

  isOnline: () => serverStatus.online,
}