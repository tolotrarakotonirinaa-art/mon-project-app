// ════════════════════════════════════════════════
//  DevEnviron 4D — Données locales (fallback)
// ════════════════════════════════════════════════

export const KEYS = {
  USERS:'dv4_users', CURRENT:'dv4_current', PROJECTS:'dv4_projects',
  TASKS:'dv4_tasks', REPOS:'dv4_repos', ENVS:'dv4_envs',
  ACTIVITIES:'dv4_activities', CHAT:'dv4_chat', PIPE:'dv4_pipe',
}

export const DEFAULT_USERS = [
  {id:1,name:'Admin User',     email:'admin@devenviron.com',       role:'admin',  join_date:'2024-01-15',password:'password123',avatar:'AU',bio:'Administrateur plateforme'},
  {id:2,name:'John Doe',       email:'john.doe@example.com',       role:'dev',    join_date:'2024-03-10',password:'password123',avatar:'JD',bio:'Développeur fullstack'},
  {id:3,name:'Marie Dubois',   email:'marie.dubois@example.com',   role:'dev',    join_date:'2024-04-22',password:'password123',avatar:'MD',bio:'Développeuse frontend'},
  {id:4,name:'Jean Martin',    email:'jean.martin@example.com',    role:'dev',    join_date:'2024-05-05',password:'password123',avatar:'JM',bio:'Ingénieur backend'},
  {id:5,name:'Sophie Lambert', email:'sophie.lambert@example.com', role:'client', join_date:'2024-06-18',password:'password123',avatar:'SL',bio:'Chef de projet'},
]
export const DEFAULT_PROJECTS = [
  {id:1,name:'Site E-commerce',     description:'Interface React + Node.js pour boutique en ligne',status:'active',   progress:75,start_date:'2024-10-01',end_date:'2024-12-15',team:['JD','MD','SL'],color:'#00c8ff',tags:['React','Node.js']},
  {id:2,name:'API de paiement',     description:'API Stripe avec Node.js et MongoDB',              status:'active',   progress:60,start_date:'2024-09-15',end_date:'2024-11-30',team:['JM','AU'],     color:'#7c3aed',tags:['Node.js','Stripe']},
  {id:3,name:'App Mobile',          description:'React Native pour iOS et Android',                status:'pending',  progress:20,start_date:'2024-11-01',end_date:'2025-02-28',team:['JD','SL'],     color:'#00ff88',tags:['React Native']},
  {id:4,name:'Dashboard Analytics', description:'Dashboard temps réel avec WebSocket',             status:'active',   progress:45,start_date:'2024-10-15',end_date:'2025-01-30',team:['MD','JM'],     color:'#ff6b35',tags:['React','D3.js']},
]
export const DEFAULT_TASKS = [
  {id:1,title:'Corriger bug login',     project:'Site E-commerce',     status:'todo',       priority:'high',   assignee:'JD',due_date:'2024-11-10',description:'Bug connexion mobile Safari'},
  {id:2,title:'Implémenter API REST',   project:'API de paiement',     status:'inprogress', priority:'medium', assignee:'JM',due_date:'2024-11-15',description:'Endpoints CRUD paiements'},
  {id:3,title:'Tests unitaires',        project:'App Mobile',          status:'done',       priority:'low',    assignee:'SL',due_date:'2024-11-05',description:'Tests Jest composants'},
  {id:4,title:'Design responsive',      project:'Site E-commerce',     status:'todo',       priority:'medium', assignee:'MD',due_date:'2024-11-12',description:'Adaptation mobile/tablette'},
  {id:5,title:'Documentation API',      project:'API de paiement',     status:'inprogress', priority:'low',    assignee:'JD',due_date:'2024-11-20',description:'Swagger + README'},
  {id:6,title:'Config CI/CD',           project:'App Mobile',          status:'todo',       priority:'high',   assignee:'AU',due_date:'2024-11-08',description:'GitHub Actions pipeline'},
  {id:7,title:'Optimiser requêtes BDD', project:'Dashboard Analytics', status:'done',       priority:'high',   assignee:'JM',due_date:'2024-11-01',description:'Index + cache Redis'},
]
export const DEFAULT_REPOS = [
  {id:1,name:'frontend-ecommerce',description:'Interface React',   visibility:'public',  stars:12,forks:3,lang:'JavaScript',  branches:4,updated_at:'2024-11-08'},
  {id:2,name:'backend-api',       description:'API Node.js',       visibility:'private', stars:8, forks:1,lang:'Node.js',      branches:3,updated_at:'2024-11-09'},
  {id:3,name:'mobile-app',        description:'React Native',      visibility:'private', stars:5, forks:0,lang:'React Native', branches:2,updated_at:'2024-11-07'},
  {id:4,name:'devenviron-backend',description:'API Laravel PHP',   visibility:'private', stars:3, forks:0,lang:'PHP/Laravel',  branches:1,updated_at:'2024-11-10'},
]
export const DEFAULT_ENVS = [
  {id:1,name:'Développement',type:'dev',        status:'running',url:'https://dev.example.com',    version:'1.3.0',last_deploy:'2024-11-05',cpu:23,memory:45},
  {id:2,name:'Staging',      type:'staging',    status:'running',url:'https://staging.example.com',version:'1.2.5',last_deploy:'2024-11-03',cpu:45,memory:62},
  {id:3,name:'Production',   type:'production', status:'running',url:'https://example.com',        version:'1.2.0',last_deploy:'2024-10-28',cpu:67,memory:78},
]
export const DEFAULT_ACTIVITIES = [
  {id:1,user:'Marie Dubois',action:'a poussé du code sur frontend-ecommerce',icon:'code-branch', time:'Il y a 15 min',color:'#00c8ff'},
  {id:2,user:'Jean Martin', action:'a complété "Implémenter API REST"',       icon:'check-circle',time:'Il y a 1h',    color:'#00ff88'},
  {id:3,user:'Admin User',  action:'a déployé v1.3.0 en développement',       icon:'rocket',      time:'Il y a 3h',    color:'#ff6b35'},
  {id:4,user:'John Doe',    action:'a créé la tâche "Config CI/CD"',          icon:'plus-circle', time:'Il y a 4h',    color:'#7c3aed'},
]
export const DEFAULT_CHAT = [
  {id:1,sender:'Marie Dubois',avatar:'MD',message:'Bonjour ! Les tests v1.3 sont prêts 🎉',time:'14:20',user_id:3},
  {id:2,sender:'Admin User',  avatar:'AU',message:'Super ! Je prépare le déploiement.',    time:'14:22',user_id:1},
  {id:3,sender:'Jean Martin', avatar:'JM',message:"N'oubliez pas la documentation.",        time:'14:25',user_id:4},
]
export const DEFAULT_PIPE = {checkout:'completed',tests:'active',build:'pending',deploy:'pending'}
export const DEFAULT_NOTIFICATIONS = [
  {id:1,type:'task',    message:'Nouvelle tâche assignée : Corriger bug login',    read:false,time:'10 min'},
  {id:2,type:'deploy',  message:'Déploiement v1.3.0 terminé avec succès',          read:false,time:'3h'},
  {id:3,type:'mention', message:'Marie Dubois vous a mentionné dans #général',     read:true, time:'1 jour'},
]

export const PERMISSIONS = {
  admin:  {dashboard:true,projects:true,tasks:true,pipeline:true,repositories:true,environments:true,devspace:true,documentation:true,communication:true,statistics:true,users:true,settings:true,help:true,logout:true,canCreate:true,canEdit:true,canDelete:true},
  dev:    {dashboard:true,projects:true,tasks:true,pipeline:true,repositories:true,environments:true,devspace:true,documentation:true,communication:true,statistics:true,users:false,settings:true,help:true,logout:true,canCreate:true,canEdit:true,canDelete:false},
  client: {dashboard:true,projects:true,tasks:false,pipeline:false,repositories:false,environments:false,devspace:false,documentation:true,communication:true,statistics:false,users:false,settings:true,help:true,logout:true,canCreate:false,canEdit:false,canDelete:false},
}

// ── localStorage helpers ──────────────────────────────────
export const gs  = k => { try { const d=localStorage.getItem(k); return d?JSON.parse(d):null } catch { return null } }
export const ss  = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)) } catch {} }
export const uid = () => Date.now() + Math.floor(Math.random()*9999)
export const ini = name => (name||'??').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()

export function initStorage(){
  const map={
    [KEYS.USERS]:DEFAULT_USERS,[KEYS.PROJECTS]:DEFAULT_PROJECTS,
    [KEYS.TASKS]:DEFAULT_TASKS,[KEYS.REPOS]:DEFAULT_REPOS,
    [KEYS.ENVS]:DEFAULT_ENVS,[KEYS.ACTIVITIES]:DEFAULT_ACTIVITIES,
    [KEYS.CHAT]:DEFAULT_CHAT,[KEYS.PIPE]:DEFAULT_PIPE,
  }
  Object.entries(map).forEach(([k,v])=>{ if(!gs(k)) ss(k,v) })
}
