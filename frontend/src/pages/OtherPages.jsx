import React,{useState,useEffect,useRef} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {useNavigate} from 'react-router-dom'
import {
  Database,Server,Code2,BookOpen,MessageSquare,BarChart3,
  Users,Settings,HelpCircle,LogOut,Plus,Trash2,Send,
  Star,GitFork,Check,X,Bell,Palette,Lock,Shield,Eye,
  ChevronDown,RefreshCw,GitBranch,ExternalLink,
} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {PanelHeader,Progress,Empty,PermGuard,Loader,StatusBadge} from '../components/ui/UI.jsx'
import {C,S,ROLE_META} from '../styles.js'
import {ini} from '../data.js'

// ── Shell modale ──────────────────────────────────────────
function MShell({title,onClose,children,maxW=480}){
  return(
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',zIndex:900}} onClick={onClose}/>
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:901,padding:20}}>
        <motion.div initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9}} transition={{type:'spring',damping:25,stiffness:300}}
          style={{width:'100%',maxWidth:maxW,...S.panel({padding:0})}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:13,color:C.t1}}>{title}</span>
            <button onClick={onClose} style={{background:'none',border:'none',color:C.t3,cursor:'pointer',fontSize:20,lineHeight:1}}>×</button>
          </div>
          <div style={{padding:'18px 20px'}}>{children}</div>
        </motion.div>
      </div>
    </>
  )
}

const PT=t=>(
  <h1 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:24,background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
    {t}
  </h1>
)

// ════════════════════════════════════════════
//  REPOSITORIES
// ════════════════════════════════════════════
export function Repositories(){
  const {getRepos,addRepo,deleteRepo,showToast}=useApp()
  const {can}=useAuth()
  const [repos,setRepos]=useState([])
  const [modal,setModal]=useState(false)
  const [f,setF]=useState({name:'',description:'',visibility:'private',lang:'JavaScript'})
  const [busy,setBusy]=useState(true)

  const load=async()=>{ setBusy(true); setRepos(await getRepos()||[]); setBusy(false) }
  useEffect(()=>{ load() },[])

  const save=async()=>{
    if(!f.name.trim()) return
    await addRepo(f); showToast('Dépôt créé !','success')
    setModal(false); setF({name:'',description:'',visibility:'private',lang:'JavaScript'}); load()
  }
  const del=async id=>{
    if(!confirm('Supprimer ce dépôt ?')) return
    await deleteRepo(id); showToast('Dépôt supprimé','success'); load()
  }

  if(busy) return <Loader/>
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:24}}>
        <div>{PT('DÉPÔTS GIT')}<p style={{color:C.t2,fontSize:13,marginTop:4}}>{repos.length} dépôt{repos.length>1?'s':''}</p></div>
        {can('repositories')&&<button onClick={()=>setModal(true)} style={S.btnCyan}><Plus size={13}/> Nouveau dépôt</button>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:18}}>
        {repos.map((r,i)=>{
          const vc=r.visibility==='public'?C.neon:C.t2
          return(
            <motion.div key={r.id} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} whileHover={{y:-3,transition:{duration:0.2}}}
              style={{...S.panel({padding:20,position:'relative',overflow:'hidden'})}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${vc},transparent)`}}/>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:9}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <i className="fab fa-git-alt" style={{color:C.solar,fontSize:18}}/>
                  <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:13,color:C.cyan}}>{r.name}</span>
                </div>
                <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'2px 7px',borderRadius:5,background:`${vc}15`,color:vc,border:`1px solid ${vc}28`}}>
                  {r.visibility==='public'?'🌐 PUBLIC':'🔒 PRIVÉ'}
                </span>
              </div>
              <p style={{fontSize:12,color:C.t3,marginBottom:12,lineHeight:1.5}}>{r.description||'Aucune description'}</p>
              <div style={{display:'flex',gap:14,fontSize:12,color:C.t2,marginBottom:12}}>
                <span style={{display:'flex',alignItems:'center',gap:4}}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:C.cyan}}/>{r.lang}
                </span>
                <span style={{display:'flex',alignItems:'center',gap:4}}><Star size={11} style={{color:C.quantum}}/>{r.stars||0}</span>
                <span style={{display:'flex',alignItems:'center',gap:4}}><GitFork size={11}/>{r.forks||0}</span>
                <span style={{display:'flex',alignItems:'center',gap:4}}><GitBranch size={11}/>{r.branches||1}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:`1px solid ${C.border}`,paddingTop:11}}>
                <span style={{fontSize:10,color:C.t3}}>
                  {r.updated_at?new Date(r.updated_at).toLocaleDateString('fr-FR'):r.updated||'—'}
                </span>
                <div style={{display:'flex',gap:7}}>
                  {r.url&&<a href={r.url} target="_blank" rel="noreferrer" style={{...S.btnGhost,fontSize:10,padding:'5px 9px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}><ExternalLink size={10}/> Voir</a>}
                  {can('repositories')&&<button onClick={()=>del(r.id)} style={{background:'none',border:'none',color:C.t3,cursor:'pointer',padding:3}}><Trash2 size={12}/></button>}
                </div>
              </div>
            </motion.div>
          )
        })}
        {!repos.length&&<div style={{gridColumn:'1/-1'}}><Empty icon={Database} msg="Aucun dépôt" sub="Créez votre premier dépôt Git"/></div>}
      </div>
      <AnimatePresence>
        {modal&&(
          <MShell title="NOUVEAU DÉPÔT GIT" onClose={()=>setModal(false)}>
            <div style={{display:'flex',flexDirection:'column',gap:13}}>
              <div><label style={S.label}>Nom du dépôt *</label><input style={S.input} value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))} placeholder="ex: mon-projet"/></div>
              <div><label style={S.label}>Description</label><textarea style={{...S.input,resize:'none',height:64}} value={f.description} onChange={e=>setF(x=>({...x,description:e.target.value}))} placeholder="Description du dépôt..."/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={S.label}>Visibilité</label>
                  <select style={{...S.input,background:C.surface}} value={f.visibility} onChange={e=>setF(x=>({...x,visibility:e.target.value}))}>
                    <option value="public">🌐 Public</option><option value="private">🔒 Privé</option>
                  </select>
                </div>
                <div><label style={S.label}>Langage principal</label><input style={S.input} value={f.lang} onChange={e=>setF(x=>({...x,lang:e.target.value}))} placeholder="JavaScript"/></div>
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button onClick={()=>setModal(false)} style={S.btnGhost}>Annuler</button>
                <button onClick={save} style={S.btnNeon}>Créer le dépôt</button>
              </div>
            </div>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}

// ════════════════════════════════════════════
//  ENVIRONMENTS
// ════════════════════════════════════════════
const EC={dev:'#00c8ff',staging:'#ffce00',production:'#00ff88'}
export function Environments(){
  const {getEnvs,addEnv,deleteEnv,showToast}=useApp()
  const {can}=useAuth()
  const [envs,setEnvs]=useState([])
  const [modal,setModal]=useState(false)
  const [f,setF]=useState({name:'',type:'dev',url:'',version:'1.0.0'})
  const [busy,setBusy]=useState(true)
  const [deploying,setDeploying]=useState(null)

  const load=async()=>{ setBusy(true); setEnvs(await getEnvs()||[]); setBusy(false) }
  useEffect(()=>{ load() },[])

  const save=async()=>{
    if(!f.name.trim()) return
    await addEnv(f); showToast('Environnement créé !','success')
    setModal(false); load()
  }
  const del=async id=>{
    if(!confirm('Supprimer cet environnement ?')) return
    await deleteEnv(id); showToast('Supprimé','success'); load()
  }
  const deploy=async env=>{
    setDeploying(env.id)
    showToast(`Déploiement de ${env.name} en cours...`,'info')
    await new Promise(r=>setTimeout(r,2500))
    setDeploying(null)
    showToast(`${env.name} déployé avec succès ! ✓`,'success')
    load()
  }

  if(busy) return <Loader/>
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:24}}>
        <div>{PT('ENVIRONNEMENTS')}<p style={{color:C.t2,fontSize:13,marginTop:4}}>Dev · Staging · Production</p></div>
        {can('environments')&&<button onClick={()=>setModal(true)} style={S.btnCyan}><Plus size={13}/> Nouvel environnement</button>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:18}}>
        {envs.map((env,i)=>{
          const col=EC[env.type]||C.cyan
          const isDep=deploying===env.id
          return(
            <motion.div key={env.id} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}} whileHover={{y:-3,transition:{duration:0.2}}}
              style={{...S.panel({padding:20,position:'relative',overflow:'hidden'})}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:col,boxShadow:`0 0 8px ${col}`}}/>
              {/* En-tête */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:9}}>
                  <div style={{width:36,height:36,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:`${col}15`,border:`1px solid ${col}28`,fontSize:18}}>
                    {env.type==='production'?'🚀':env.type==='staging'?'🧪':'💻'}
                  </div>
                  <div>
                    <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:13,color:C.t1}}>{env.name}</p>
                    <p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:col}}>{(env.type||'').toUpperCase()}</p>
                  </div>
                </div>
                <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'3px 8px',borderRadius:5,background:`${col}15`,color:col,border:`1px solid ${col}28`,display:'flex',alignItems:'center',gap:4}}>
                  <motion.span style={{width:5,height:5,borderRadius:'50%',background:col,display:'inline-block'}} animate={{opacity:[1,0.3,1]}} transition={{duration:1.5,repeat:Infinity}}/>
                  {env.status||'running'}
                </span>
              </div>
              {/* Infos */}
              {[['URL',env.url,'#7ab0d4'],['Version',env.version,C.t1],['Dernier déploiement',env.last_deploy||env.lastDeploy,C.t1]].map(([k,v,vc])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border}`,fontSize:12}}>
                  <span style={{color:C.t2}}>{k}</span>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:vc,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v||'—'}</span>
                </div>
              ))}
              {/* Métriques */}
              <div style={{marginTop:12}}>
                {[['CPU',env.cpu||0,col],['RAM',env.memory||0,col]].map(([k,v,c])=>(
                  <div key={k} style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:10,marginBottom:3}}>
                      <span style={{color:C.t2}}>{k}</span>
                      <span style={{color:c,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{v}%</span>
                    </div>
                    <div style={{height:5,background:'rgba(255,255,255,0.06)',borderRadius:10,overflow:'hidden'}}>
                      <motion.div style={{height:'100%',background:c,borderRadius:10}} initial={{width:0}} animate={{width:`${v}%`}} transition={{duration:1}}/>
                    </div>
                  </div>
                ))}
              </div>
              {/* Actions */}
              {can('environments')&&(
                <div style={{display:'flex',gap:7,marginTop:14}}>
                  <button onClick={()=>deploy(env)} disabled={isDep}
                    style={{flex:1,padding:'9px 13px',border:'none',borderRadius:9,background:isDep?'rgba(255,255,255,0.05)':`linear-gradient(135deg,${col},${col}cc)`,color:isDep?C.t3:'#020408',fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:11,cursor:isDep?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                    {isDep?<><motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.7,ease:'linear'}} style={{display:'inline-block',width:12,height:12,borderRadius:'50%',border:`2px solid ${C.t3}`,borderTopColor:'transparent'}}/> En cours...</>:<>🚀 Déployer</>}
                  </button>
                  <button onClick={()=>del(env.id)} style={{...S.btnGhost,padding:'9px 11px',fontSize:11}}><Trash2 size={12}/></button>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
      <AnimatePresence>
        {modal&&(
          <MShell title="NOUVEL ENVIRONNEMENT" onClose={()=>setModal(false)}>
            <div style={{display:'flex',flexDirection:'column',gap:13}}>
              <div><label style={S.label}>Nom *</label><input style={S.input} value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))} placeholder="ex: Développement"/></div>
              <div><label style={S.label}>Type</label>
                <select style={{...S.input,background:C.surface}} value={f.type} onChange={e=>setF(x=>({...x,type:e.target.value}))}>
                  <option value="dev">💻 Développement</option><option value="staging">🧪 Staging</option><option value="production">🚀 Production</option>
                </select>
              </div>
              <div><label style={S.label}>URL</label><input style={S.input} value={f.url} onChange={e=>setF(x=>({...x,url:e.target.value}))} placeholder="https://..."/></div>
              <div><label style={S.label}>Version</label><input style={S.input} value={f.version} onChange={e=>setF(x=>({...x,version:e.target.value}))}/></div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button onClick={()=>setModal(false)} style={S.btnGhost}>Annuler</button>
                <button onClick={save} style={S.btnNeon}>Créer</button>
              </div>
            </div>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}


// ════════════════════════════════════════════
//  DEV SPACE
// ════════════════════════════════════════════

// ── Commandes terminal enrichies ─────────────
const TCMDS = {
  help:          ()=>'Commandes disponibles :\n  Système  : help, clear, date, whoami, pwd, ls, cat, echo\n  Git      : git status, git log, git branch, git diff\n  Node/npm : node --version, npm --version, npm install, npm start, npm run build, npm test\n  Docker   : docker ps, docker images, docker version\n  Process  : ps, top, kill\n  Réseau   : ping, curl, ifconfig\n  PHP      : php -v, php artisan serve, php artisan migrate\n  DevEnv   : devenv status, devenv deploy, devenv logs',
  date:          ()=>new Date().toLocaleString('fr-FR', {weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}),
  whoami:        ()=>'dev-user (DevEnviron 4D)',
  pwd:           ()=>'/home/dev-user/devenviron-project',
  ls:            ()=>'total 48\ndrwxr-xr-x  src/          index.html    package.json\ndrwxr-xr-x  public/       vite.config.js README.md\ndrwxr-xr-x  node_modules/ .env          .gitignore',
  'ls -la':      ()=>'total 96\ndrwxr-xr-x  2 dev  dev  4096 nov 10 14:30 src/\ndrwxr-xr-x  2 dev  dev  4096 nov 10 14:28 public/\ndrwxr-xr-x 80 dev  dev  4096 nov  8 09:12 node_modules/\n-rw-r--r--  1 dev  dev   845 nov 10 14:30 index.html\n-rw-r--r--  1 dev  dev   512 nov 10 14:28 package.json\n-rw-r--r--  1 dev  dev   128 nov 10 14:00 .env',
  'ls src':      ()=>'App.jsx  main.jsx  data.js  styles.js\ncomponents/  context/  pages/  services/',
  ps:            ()=>'  PID TTY          TIME CMD\n  001 pts/0    00:00:01 bash\n 1234 pts/0    00:00:03 node (vite dev)\n 5678 pts/0    00:00:00 php (artisan serve)\n 9012 pts/0    00:00:00 ps',
  top:           ()=>`Tasks: 4 total, 2 running\nCPU: ${Math.floor(Math.random()*30+10)}%  Mem: ${Math.floor(Math.random()*40+30)}%\n\n  PID  CPU  MEM COMMAND\n 1234  12%  45% node\n 5678   8%  28% php\n    1   0%   5% bash`,
  ifconfig:      ()=>'eth0: flags=4163<UP,BROADCAST,RUNNING>\n  inet 127.0.0.1  netmask 255.0.0.0\n  inet6 ::1  prefixlen 128\nlo:   flags=73<UP,LOOPBACK,RUNNING>\n  inet 127.0.0.1  netmask 255.0.0.0',
  ping:          ()=>'PING localhost (127.0.0.1)\n64 bytes from 127.0.0.1: icmp_seq=1 time=0.042ms\n64 bytes from 127.0.0.1: icmp_seq=2 time=0.038ms\n--- localhost ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss',
  curl:          ()=>'{"status":"ok","app":"DevEnviron 4D","version":"1.0.0","phase":"Phase 1"}',
  'git status':  ()=>'On branch main\nYour branch is up to date with \'origin/main\'.\nChanges not staged for commit:\n  modified:  src/pages/DevSpace.jsx\nUntracked files:\n  src/services/api.js\nno changes added to commit',
  'git log':     ()=>`commit a1b2c3d4e5f6 (HEAD -> main, origin/main)\nAuthor: Dev User <dev@devenviron.com>\nDate:   ${new Date().toDateString()}\n\n    feat: add DevSpace editor with syntax highlighting\n\ncommit b2c3d4e5f6a7\nAuthor: Marie Dubois <marie@devenviron.com>\nDate:   ${new Date(Date.now()-86400000).toDateString()}\n\n    fix: correct CORS headers for API`,
  'git branch':  ()=>'* main\n  feat/devspace-editor\n  fix/pipeline-logs\n  hotfix/auth-jwt',
  'git diff':    ()=>'diff --git a/src/pages/DevSpace.jsx b/src/pages/DevSpace.jsx\n@@ -1,4 +1,6 @@\n+import {useState, useRef} from \'react\'\n import React from \'react\'\n-export function DevSpace(){return <div>TODO</div>}\n+export function DevSpace(){\n+  // Terminal + Code Editor\n+}',
  'node --version':   ()=>'v20.11.0 LTS',
  'npm --version':    ()=>'10.2.4',
  'npm install':      ()=>'npm warn deprecated old-package@1.0.0\nadded 246 packages in 3.456s\n\n86 packages are looking for funding\nfound 0 vulnerabilities ✓',
  'npm start':        ()=>'> devenviron4d@1.0.0 start\n> vite\n\n  VITE v5.4.2  ready in 412 ms\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: http://192.168.1.100:5173/',
  'npm run build':    ()=>'> devenviron4d@1.0.0 build\n> vite build\n\n✓ 42 modules transformed.\ndist/index.html                 1.22 kB\ndist/assets/index-DiwrgTda.css  5.20 kB\ndist/assets/index-BvPkz9aV.js  312.48 kB\n✓ built in 2.34s',
  'npm test':         ()=>'> devenviron4d@1.0.0 test\n> vitest\n\n✓ src/tests/auth.test.js (12 tests)\n✓ src/tests/api.test.js  (8 tests)\n✓ src/tests/ui.test.js   (24 tests)\n\nTest Files  3 passed (3)\nTests       44 passed (44)\nDuration    1.23s',
  'docker ps':        ()=>'CONTAINER ID   IMAGE          COMMAND               STATUS       PORTS\nabc123def456   node:20-alpine "docker-entrypoint"  Up 3h        3000->3000/tcp\ndef456abc123   nginx:1.25     "/docker-entrypoint"  Up 1h        80->80/tcp\nghi789jkl012   postgres:16    "docker-entrypoint"   Up 5h        5432->5432/tcp',
  'docker images':    ()=>'REPOSITORY   TAG        IMAGE ID       CREATED        SIZE\nnode         20-alpine  a1b2c3d4e5f6   2 days ago     126MB\nnginx        1.25       b2c3d4e5f6a7   1 week ago     142MB\npostgres     16         c3d4e5f6a7b8   2 weeks ago    379MB',
  'docker version':   ()=>'Client: Docker Engine - Community\n Version: 24.0.7\nServer: Docker Engine - Community\n Engine Version: 24.0.7\n containerd Version: 1.6.26',
  'php -v':           ()=>'PHP 8.2.12 (cli)\nCopyright (c) The PHP Group\nZend Engine v4.2.12',
  'php artisan serve': ()=>'Starting Laravel development server: http://127.0.0.1:8000\n[2024-11-10 14:30:01] INFO Server running on [http://127.0.0.1:8000]',
  'php artisan migrate':()=>'INFO  Running migrations.\n  2024_01_01_000001_create_users_table ............ 12ms DONE\n  2024_01_01_000002_create_projects_table ......... 8ms  DONE\n  2024_01_01_000003_create_tasks_table ............ 7ms  DONE',
  'devenv status':    ()=>'DevEnviron 4D — Status Report\n  Frontend   : ✓ Running (http://localhost:5173)\n  Backend    : ✓ Running (http://localhost:8000)\n  Database   : ✓ Connected (PostgreSQL 16)\n  JWT Auth   : ✓ Active\n  Pipeline   : ○ Idle',
  'devenv deploy':    ()=>'Deploying DevEnviron 4D...\n  ✓ Tests passed (44/44)\n  ✓ Build complete (2.34s)\n  ✓ Docker image pushed\n  ✓ Deployment successful → https://app.devenviron.io',
  'devenv logs':      ()=>'[14:30:01] INFO  Server started\n[14:30:12] INFO  User login: admin@devenviron.com\n[14:31:05] INFO  GET /api/projects → 200 (12ms)\n[14:33:20] INFO  POST /api/tasks → 201 (8ms)\n[14:35:44] INFO  Pipeline started by admin',
  kill:               ()=>'bash: kill: requires PID argument\nUsage: kill [PID]',
}

// ── Thèmes de l'éditeur ───────────────────────────────────
const EDITOR_THEMES = {
  dark:  {bg:'#1e1e2e', line:'#2a2a3e', text:'#cdd6f4', lineNum:'#585b70', border:'rgba(0,200,255,0.2)', name:'Dark (Catppuccin)'},
  mocha: {bg:'#0f0f0f', line:'#1a1a1a', text:'#c9d1d9', lineNum:'#484f58', border:'rgba(0,255,136,0.2)', name:'Mocha'},
  solarized:{bg:'#002b36',line:'#073642',text:'#839496',lineNum:'#586e75',border:'rgba(133,153,0,0.3)',name:'Solarized Dark'},
}

// ── Coloration syntaxique simple ──────────────────────────
function highlight(code, lang){
  if(!code) return ''
  let html = code
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')

  if(lang==='javascript'||lang==='jsx'){
    html = html
      .replace(/\/\/.*/g,       m=>`<span style="color:#6a9955">${m}</span>`)
      .replace(/`[^`]*`/g,      m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/"[^"]*"/g,      m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/'[^']*'/g,      m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/\b(import|export|default|from|const|let|var|function|return|if|else|for|while|class|new|this|async|await|typeof|instanceof)\b/g, m=>`<span style="color:#569cd6">${m}</span>`)
      .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, m=>`<span style="color:#569cd6">${m}</span>`)
      .replace(/\b([A-Z][a-zA-Z]+)\b/g, m=>`<span style="color:#4ec9b0">${m}</span>`)
      .replace(/\b(\d+\.?\d*)\b/g,     m=>`<span style="color:#b5cea8">${m}</span>`)
  }
  if(lang==='php'){
    html = html
      .replace(/\/\/.*/g,       m=>`<span style="color:#6a9955">${m}</span>`)
      .replace(/"[^"]*"/g,      m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/\$[a-zA-Z_]\w*/g,m=>`<span style="color:#9cdcfe">${m}</span>`)
      .replace(/\b(public|private|protected|function|class|return|if|else|foreach|namespace|use|new|echo|require)\b/g, m=>`<span style="color:#c586c0">${m}</span>`)
  }
  if(lang==='sql'){
    html = html
      .replace(/--.*$/gm,       m=>`<span style="color:#6a9955">${m}</span>`)
      .replace(/'[^']*'/g,      m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|JOIN|ON|AND|OR|NOT|NULL|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE)\b/gi, m=>`<span style="color:#569cd6">${m.toUpperCase()}</span>`)
  }
  return html
}

// ── Snippets de code prêts à l'emploi ────────────────────
const SNIPPETS = {
  'React Component': {lang:'jsx', code:`import React, { useState, useEffect } from 'react'

export default function MonComposant({ titre, onAction }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger les données depuis l'API
    fetch('/api/data')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div>Chargement...</div>

  return (
    <div className="composant">
      <h1>{titre}</h1>
      {data.map(item => (
        <div key={item.id} onClick={() => onAction(item)}>
          {item.name}
        </div>
      ))}
    </div>
  )
}`},
  'Laravel Controller': {lang:'php', code:`<?php

namespace App\\Http\\Controllers;

use App\\Models\\Project;
use Illuminate\\Http\\Request;

class ProjectController extends BaseController
{
    // GET /api/projects
    public function index(Request $request)
    {
        $projects = Project::query();

        if ($request->filled('status')) {
            $projects->where('status', $request->status);
        }

        return $this->success($projects->get());
    }

    // POST /api/projects
    public function store(Request $request)
    {
        $request->validate([
            'name'   => 'required|string|min:2',
            'status' => 'sometimes|in:active,pending,completed',
        ]);

        $project = Project::create([
            'name'       => $request->name,
            'status'     => $request->input('status', 'active'),
            'created_by' => auth()->id(),
        ]);

        return $this->created($project, 'Projet créé avec succès');
    }
}`},
  'SQL Query': {lang:'sql', code:`-- Statistiques globales des projets et tâches
SELECT
    p.id,
    p.name                                          AS projet,
    p.status,
    p.progress                                      AS "avancement %",
    COUNT(t.id)                                     AS total_taches,
    COUNT(t.id) FILTER (WHERE t.status = 'done')   AS terminees,
    COUNT(t.id) FILTER (WHERE t.priority = 'high') AS haute_priorite,
    u.name                                          AS responsable
FROM projects p
LEFT JOIN tasks t  ON t.project = p.name
LEFT JOIN users u  ON u.id = p.created_by
GROUP BY p.id, p.name, p.status, p.progress, u.name
ORDER BY p.progress DESC;`},
  'API Service': {lang:'jsx', code:`// Service API DevEnviron 4D
const API_URL = 'http://localhost:8000/api'

async function request(method, endpoint, body = null) {
  const token = localStorage.getItem('dv4_token')
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? \`Bearer \${token}\` : '',
    },
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(\`\${API_URL}\${endpoint}\`, options)
  return res.json()
}

export const api = {
  getProjects: () => request('GET', '/projects'),
  createProject: (data) => request('POST', '/projects', data),
  updateProject: (id, data) => request('PUT', \`/projects/\${id}\`, data),
  deleteProject: (id) => request('DELETE', \`/projects/\${id}\`),
  getTasks: (filters) => request('GET', '/tasks?' + new URLSearchParams(filters)),
  moveTask: (id, status) => request('PATCH', \`/tasks/\${id}/move\`, { status }),
}`},
}

export function DevSpace(){
  // ── État outil actif ──────────────────────────────────
  const [activeTab, setActiveTab]   = useState('terminal') // 'terminal' | 'editor'

  // ── Terminal ──────────────────────────────────────────
  const [lines,setLines]   = useState([
    {t:'DevEnviron Terminal v2.0.0 — Tapez "help" pour voir les commandes',c:'#00c8ff'},
    {t:'Mode connecté à: ws://localhost:8000',c:'#00ff88'},
    {t:'',c:'#fff'},
  ])
  const [input,setInput]   = useState('')
  const [hist,setHist]     = useState([])
  const [hi,setHi]         = useState(-1)
  const termRef            = useRef(null)
  const inputRef           = useRef(null)

  useEffect(()=>{ termRef.current?.scrollTo(0,termRef.current.scrollHeight) },[lines])

  const addLine=(t,c='#00ff88')=>setLines(l=>[...l,{t,c}])
  const run=cmd=>{
    const s=cmd.trim(); if(!s) return
    addLine(`$ ${s}`,'#00c8ff')
    if(s==='clear'){ setLines([]); return }
    if(s.startsWith('echo ')){ addLine(s.slice(5)); setHist(h=>[s,...h.slice(0,49)]); setHi(-1); return }
    if(s.startsWith('cat ')){
      const fname=s.slice(4).trim()
      addLine(`cat: ${fname}: Fichier simulé\n[Ce terminal est en mode simulation — le contenu réel nécessite un backend]`,'#ffce00')
      setHist(h=>[s,...h.slice(0,49)]); setHi(-1); return
    }
    if(s.startsWith('kill ')){
      addLine(`[${s.split(' ')[1]}] Terminated`,'#ff2d78')
      setHist(h=>[s,...h.slice(0,49)]); setHi(-1); return
    }
    const fn=TCMDS[s.toLowerCase()]
    if(fn) addLine(fn())
    else   addLine(`bash: ${s}: commande introuvable. Tapez 'help' pour la liste.`,'#ff2d78')
    setHist(h=>[s,...h.slice(0,49)]); setHi(-1)
  }
  const onTermKey=e=>{
    if(e.key==='Enter'){ run(input); setInput('') }
    else if(e.key==='ArrowUp'){   e.preventDefault(); const i=Math.min(hi+1,hist.length-1); setHi(i); setInput(hist[i]||'') }
    else if(e.key==='ArrowDown'){ e.preventDefault(); const i=Math.max(hi-1,-1); setHi(i); setInput(i===-1?'':hist[i]) }
    else if(e.key==='Tab'){
      e.preventDefault()
      const cmds=Object.keys(TCMDS)
      const match=cmds.find(c=>c.startsWith(input))
      if(match) setInput(match)
    }
  }

  // ── Éditeur ───────────────────────────────────────────
  const [editorCode,setEditorCode]     = useState(SNIPPETS['React Component'].code)
  const [editorLang,setEditorLang]     = useState('jsx')
  const [editorTheme,setEditorTheme]   = useState('dark')
  const [editorFile,setEditorFile]     = useState('MonComposant.jsx')
  const [showLineNums,setShowLineNums] = useState(true)
  const [fontSize,setFontSize]         = useState(13)
  const [savedMsg,setSavedMsg]         = useState('')
  const [activeSnippet,setActiveSnippet]=useState('React Component')
  const editorRef                      = useRef(null)
  const theme                          = EDITOR_THEMES[editorTheme]

  const lines2 = editorCode.split('\n')
  const handleSave=()=>{ setSavedMsg('✓ Sauvegardé'); setTimeout(()=>setSavedMsg(''),2000) }
  const handleFormat=()=>{
    // Indentation simple
    const formatted = editorCode.replace(/\t/g,'  ')
    setEditorCode(formatted)
    setSavedMsg('✓ Formaté')
    setTimeout(()=>setSavedMsg(''),2000)
  }
  const loadSnippet=(name)=>{
    const s=SNIPPETS[name]
    if(!s) return
    setActiveSnippet(name)
    setEditorCode(s.code)
    setEditorLang(s.lang)
    setEditorFile(name==='React Component'?'MonComposant.jsx':name==='Laravel Controller'?'ProjectController.php':name==='SQL Query'?'queries.sql':'api.js')
  }

  // ── Outils sidebar ────────────────────────────────────
  const TOOLS=[
    {id:'terminal',icon:'⌨️',label:'Terminal'},
    {id:'editor',  icon:'💻',label:'Éditeur'},
    {id:'docker',  icon:'🐳',label:'Docker'},
    {id:'db',      icon:'🗄️',label:'Base données'},
    {id:'debug',   icon:'🐛',label:'Debugger'},
    {id:'test',    icon:'🧪',label:'Tests'},
    {id:'perf',    icon:'📊',label:'Profiler'},
    {id:'config',  icon:'🔧',label:'Config'},
  ]
  const clickTool=(id)=>{
    if(id==='terminal'||id==='editor') setActiveTab(id)
    // Les autres : simulation d'ouverture
  }

  return(
    <div>
      <div style={{marginBottom:24}}>
        {PT('ESPACE DÉVELOPPEUR')}
        <p style={{color:C.t2,fontSize:13,marginTop:4}}>Terminal interactif, éditeur de code et outils de développement</p>
      </div>

      {/* ── Grille outils ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:11,marginBottom:20}}>
        {TOOLS.map(({id,icon,label})=>(
          <motion.div key={id} whileHover={{scale:1.04,y:-2}} onClick={()=>clickTool(id)}
            style={{...S.panel({padding:'15px 10px',textAlign:'center',cursor:'pointer',
              border:`1px solid ${activeTab===id?C.cyan:C.border}`,
              background:activeTab===id?'rgba(0,200,255,0.06)':undefined})}}>
            <div style={{fontSize:22,marginBottom:8}}>{icon}</div>
            <p style={{fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:activeTab===id?C.cyan:C.t2}}>{label}</p>
            {activeTab===id&&<div style={{width:20,height:2,borderRadius:1,background:C.cyan,margin:'6px auto 0'}}/>}
          </motion.div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TERMINAL
      ══════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
      {activeTab==='terminal'&&(
        <motion.div key="terminal" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <div style={{background:'#000',border:'1px solid rgba(0,255,136,0.2)',borderRadius:12,overflow:'hidden',boxShadow:'0 0 30px rgba(0,255,136,0.05)'}}>
            {/* Barre de titre */}
            <div style={{display:'flex',alignItems:'center',gap:7,padding:'10px 14px',borderBottom:'1px solid rgba(0,255,136,0.1)',background:'#080808'}}>
              <div style={{width:12,height:12,borderRadius:'50%',background:'#ff5f57'}}/>
              <div style={{width:12,height:12,borderRadius:'50%',background:'#ffbd2e'}}/>
              <div style={{width:12,height:12,borderRadius:'50%',background:'#28c840'}}/>
              <span style={{flex:1,textAlign:'center',fontSize:11,color:'#555',fontFamily:'JetBrains Mono,monospace'}}>
                terminal — devenviron@dev — bash
              </span>
              <button onClick={()=>setLines([])} style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:10,fontFamily:'Orbitron,sans-serif',letterSpacing:'0.05em'}}>✕ CLEAR</button>
            </div>
            {/* Logs */}
            <div ref={termRef} onClick={()=>inputRef.current?.focus()}
              style={{padding:14,fontFamily:'JetBrains Mono,monospace',fontSize:13,lineHeight:1.75,minHeight:300,maxHeight:400,overflowY:'auto',cursor:'text'}}>
              {lines.map((l,i)=>(
                <div key={i} style={{color:l.c,whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{l.t}</div>
              ))}
            </div>
            {/* Ligne de saisie */}
            <div style={{display:'flex',alignItems:'center',gap:9,padding:'10px 14px',borderTop:'1px solid rgba(0,255,136,0.1)',background:'#040404'}}>
              <span style={{color:'#00ff88',fontFamily:'JetBrains Mono,monospace',fontSize:13,flexShrink:0,userSelect:'none'}}>
                dev@devenviron:~$
              </span>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onTermKey}
                style={{flex:1,background:'transparent',border:'none',color:'#00ff88',fontFamily:'JetBrains Mono,monospace',fontSize:13,outline:'none',caretColor:'#00ff88'}}
                placeholder="Tapez une commande... (Tab=complétion, ↑↓=historique)" autoFocus/>
            </div>
          </div>
          {/* Raccourcis */}
          <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}>
            {['help','ls','git status','devenv status','docker ps','npm test'].map(cmd=>(
              <button key={cmd} onClick={()=>{run(cmd)}}
                style={{padding:'4px 10px',borderRadius:6,fontSize:10,fontFamily:'JetBrains Mono,monospace',background:'rgba(0,200,255,0.06)',border:'1px solid rgba(0,200,255,0.18)',color:C.t2,cursor:'pointer',transition:'all 0.15s'}}>
                {cmd}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════
          ÉDITEUR VS CODE-LIKE
      ══════════════════════════════════════════ */}
      {activeTab==='editor'&&(
        <motion.div key="editor" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>

          {/* Barre d'outils éditeur */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,flexWrap:'wrap'}}>
            {/* Snippets */}
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {Object.keys(SNIPPETS).map(name=>(
                <button key={name} onClick={()=>loadSnippet(name)}
                  style={{padding:'5px 11px',borderRadius:7,fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,border:'none',cursor:'pointer',background:activeSnippet===name?C.cyan:'rgba(0,200,255,0.08)',color:activeSnippet===name?'#020408':C.t3,transition:'all 0.15s'}}>
                  {name}
                </button>
              ))}
            </div>
            <div style={{flex:1}}/>
            {/* Sélecteur langue */}
            <select value={editorLang} onChange={e=>setEditorLang(e.target.value)}
              style={{...S.input,width:'auto',padding:'5px 10px',fontSize:11,height:30,background:C.surface}}>
              {['jsx','php','sql','javascript','html','css'].map(l=><option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            {/* Sélecteur thème */}
            <select value={editorTheme} onChange={e=>setEditorTheme(e.target.value)}
              style={{...S.input,width:'auto',padding:'5px 10px',fontSize:11,height:30,background:C.surface}}>
              {Object.entries(EDITOR_THEMES).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}
            </select>
            {/* Taille police */}
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <button onClick={()=>setFontSize(f=>Math.max(10,f-1))} style={{...S.btnGhost,padding:'4px 9px',fontSize:14,height:30}}>−</button>
              <span style={{fontSize:11,color:C.t2,fontFamily:'JetBrains Mono,monospace',minWidth:28,textAlign:'center'}}>{fontSize}</span>
              <button onClick={()=>setFontSize(f=>Math.min(20,f+1))} style={{...S.btnGhost,padding:'4px 9px',fontSize:14,height:30}}>+</button>
            </div>
            <button onClick={()=>setShowLineNums(v=>!v)} style={{...S.btnGhost,padding:'4px 10px',fontSize:10,height:30}}>
              {showLineNums?'Masquer lignes':'Numéros'}
            </button>
          </div>

          {/* Éditeur principal */}
          <div style={{borderRadius:12,overflow:'hidden',border:`1px solid ${theme.border}`,boxShadow:'0 0 30px rgba(0,0,0,0.5)'}}>

            {/* Barre onglet fichier */}
            <div style={{background:'#1a1a2e',borderBottom:`1px solid ${theme.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px'}}>
              <div style={{display:'flex',alignItems:'center'}}>
                <div style={{padding:'8px 16px',borderBottom:`2px solid ${C.cyan}`,fontSize:12,color:C.t1,fontFamily:'JetBrains Mono,monospace',cursor:'pointer',background:'rgba(0,200,255,0.08)'}}>
                  📄 {editorFile}
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                {savedMsg&&<span style={{fontSize:11,color:C.neon,fontFamily:'JetBrains Mono,monospace'}}>{savedMsg}</span>}
                <button onClick={handleFormat} style={{...S.btnGhost,padding:'4px 10px',fontSize:10,height:26}}>
                  Formater
                </button>
                <button onClick={handleSave} style={{padding:'4px 12px',borderRadius:6,fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,background:`${C.cyan}`,color:'#020408',border:'none',cursor:'pointer',height:26}}>
                  Sauvegarder
                </button>
              </div>
            </div>

            {/* Zone de code */}
            <div style={{display:'flex',background:theme.bg,minHeight:420,maxHeight:520,overflow:'auto'}} ref={editorRef}>

              {/* Numéros de ligne */}
              {showLineNums&&(
                <div style={{padding:'14px 8px 14px 14px',background:theme.bg,borderRight:`1px solid ${theme.border}`,userSelect:'none',flexShrink:0,textAlign:'right',minWidth:48}}>
                  {lines2.map((_,i)=>(
                    <div key={i} style={{color:theme.lineNum,fontFamily:'JetBrains Mono,monospace',fontSize:fontSize-1,lineHeight:1.75,height:`${fontSize*1.75}px`}}>
                      {i+1}
                    </div>
                  ))}
                </div>
              )}

              {/* Textarea + coloration */}
              <div style={{flex:1,position:'relative',overflow:'hidden'}}>
                {/* Coloration syntaxique (en dessous) */}
                <pre style={{position:'absolute',inset:0,padding:'14px',fontFamily:'JetBrains Mono,monospace',fontSize,lineHeight:1.75,color:theme.text,margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word',pointerEvents:'none',overflow:'hidden'}}
                  dangerouslySetInnerHTML={{__html:highlight(editorCode,editorLang)+'<br/>'}}/>
                {/* Textarea (par dessus, transparent) */}
                <textarea
                  value={editorCode}
                  onChange={e=>setEditorCode(e.target.value)}
                  onKeyDown={e=>{
                    // Tab → insérer 2 espaces
                    if(e.key==='Tab'){
                      e.preventDefault()
                      const s=e.target.selectionStart, en=e.target.selectionEnd
                      const next=editorCode.slice(0,s)+'  '+editorCode.slice(en)
                      setEditorCode(next)
                      requestAnimationFrame(()=>{ e.target.selectionStart=e.target.selectionEnd=s+2 })
                    }
                    // Ctrl+S → sauvegarder
                    if((e.ctrlKey||e.metaKey)&&e.key==='s'){ e.preventDefault(); handleSave() }
                    // Ctrl+Shift+F → formater
                    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==='F'){ e.preventDefault(); handleFormat() }
                  }}
                  spellCheck={false}
                  style={{position:'absolute',inset:0,width:'100%',height:'100%',padding:'14px',fontFamily:'JetBrains Mono,monospace',fontSize,lineHeight:1.75,color:'transparent',background:'transparent',border:'none',outline:'none',resize:'none',caretColor:theme.text,zIndex:2}}
                />
              </div>
            </div>

            {/* Barre de statut */}
            <div style={{background:'#0f3460',padding:'4px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:11,fontFamily:'JetBrains Mono,monospace'}}>
              <div style={{display:'flex',gap:16}}>
                <span style={{color:'#8ab4f8'}}>🔵 {editorLang.toUpperCase()}</span>
                <span style={{color:'#8ab4f8'}}>{lines2.length} lignes</span>
                <span style={{color:'#8ab4f8'}}>{editorCode.length} caractères</span>
              </div>
              <div style={{display:'flex',gap:12,color:'#8ab4f8'}}>
                <span>UTF-8</span>
                <span>Tab: 2</span>
                <span>DevEnviron 4D Editor</span>
              </div>
            </div>
          </div>

          {/* Raccourcis clavier */}
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:10,fontSize:11,color:C.t3,fontFamily:'JetBrains Mono,monospace'}}>
            {[['Ctrl+S','Sauvegarder'],['Ctrl+Shift+F','Formater'],['Tab','Indenter']].map(([k,l])=>(
              <span key={k}><span style={{padding:'1px 6px',borderRadius:4,background:'rgba(255,255,255,0.08)',color:C.t2}}>{k}</span> {l}</span>
            ))}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}

// ════════════════════════════════════════════
//  DOCUMENTATION
// ════════════════════════════════════════════
const DOCS={
  intro:   {title:'Introduction',      icon:'🏠',content:'DevEnviron 4D est une plateforme SaaS de développement collaboratif next-generation.\n\nElle centralise gestion de projets, CI/CD, dépôts Git, documentation et communication en temps réel dans une interface 4D immersive.\n\nStack technique :\n• Frontend : React 18 + Vite + Framer Motion + Three.js\n• Backend : Laravel 11 + JWT\n• Base de données : PostgreSQL 16\n• Déploiement : Docker'},
  install: {title:'Installation',      icon:'⚡',content:'Prérequis : PHP 8.2+, Composer 2+, Node.js 18+, npm 9+',code:'# 1. Frontend\ngit clone https://github.com/devenviron/platform\ncd devenviron4d\nnpm install\nnpm run dev\n\n# 2. Backend\ncd devenviron-backend\ncomposer install\ncp .env.example .env\nphp artisan key:generate\nphp artisan serve\n\n# 3. Base de données\ncd devenviron-database\npsql -U postgres -f 00_RUN_ALL.sql'},
  config:  {title:'Configuration',     icon:'⚙️',content:'Configurez le fichier .env dans le dossier backend :',code:'APP_NAME="DevEnviron 4D"\nAPP_ENV=local\nAPP_DEBUG=true\nAPP_URL=http://localhost:8000\n\n# Frontend URL (CORS)\nFRONTEND_URL=http://localhost:5173\n\n# JWT\nJWT_SECRET=votre-secret-ici\n\n# PostgreSQL\nDB_CONNECTION=pgsql\nDB_HOST=127.0.0.1\nDB_PORT=5432\nDB_DATABASE=devenviron\nDB_USERNAME=postgres\nDB_PASSWORD=postgres'},
  api:     {title:'API Reference',     icon:'📡',content:'API REST disponible sur http://localhost:8000/api\nAuthentification via JWT Bearer token.',code:'# Connexion\nPOST   /api/auth/login\nPOST   /api/auth/register\nGET    /api/auth/me\nPOST   /api/auth/logout\n\n# Projets\nGET    /api/projects\nPOST   /api/projects\nPUT    /api/projects/:id\nDELETE /api/projects/:id\n\n# Tâches\nGET    /api/tasks\nPOST   /api/tasks\nPATCH  /api/tasks/:id/move\n\n# Pipeline\nGET    /api/pipeline/status\nPOST   /api/pipeline/run\nGET    /api/pipeline/logs'},
  roles:   {title:'Rôles & Permissions',icon:'🛡️',content:'3 rôles disponibles avec des permissions distinctes :\n\n• ADMIN — Accès total. Peut gérer utilisateurs, projets, déploiements et configuration.\n\n• DEV — Accès développeur complet. Pipeline, dépôts, environnements, tâches. Ne peut pas gérer les utilisateurs.\n\n• CLIENT — Vue lecture. Dashboard, projets (consultation), documentation, communication.'},
  deploy:  {title:'Déploiement',       icon:'🚀',content:'Docker supporté nativement. Configurations disponibles pour tous les environnements.',code:'# Build & Run avec Docker\ndocker build -t devenviron-backend .\ndocker run -p 8000:8000 \\\n  -e DB_HOST=host.docker.internal \\\n  devenviron-backend\n\n# Avec docker-compose\ndocker-compose up -d\n\n# Base de données\npsql -U postgres -d devenviron -f 05_seed_data.sql'},
}
export function Documentation(){
  const [active,setActive]=useState('intro')
  const doc=DOCS[active]
  return(
    <div>
      <div style={{marginBottom:24}}>{PT('DOCUMENTATION')}<p style={{color:C.t2,fontSize:13,marginTop:4}}>Guides, API Reference et déploiement</p></div>
      <div style={{...S.panel({padding:0,overflow:'hidden',display:'flex',minHeight:520})}}>
        <div style={{width:200,flexShrink:0,borderRight:`1px solid ${C.border}`,padding:14}}>
          <p style={{...S.label,marginBottom:12}}>SECTIONS</p>
          {Object.entries(DOCS).map(([key,d])=>(
            <button key={key} onClick={()=>setActive(key)}
              style={{width:'100%',textAlign:'left',padding:'9px 12px',borderRadius:9,marginBottom:3,border:'none',background:active===key?'rgba(0,200,255,0.10)':'none',color:active===key?C.cyan:C.t3,cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:600,fontSize:13,transition:'all 0.15s',display:'flex',alignItems:'center',gap:8}}>
              <span>{d.icon}</span>{d.title}
            </button>
          ))}
        </div>
        <div style={{flex:1,padding:28,overflowY:'auto'}}>
          <motion.div key={active} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <h2 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:20,background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:14}}>
              {doc.icon} {doc.title}
            </h2>
            <p style={{color:C.t2,fontSize:14,lineHeight:1.8,whiteSpace:'pre-line',marginBottom:16}}>{doc.content}</p>
            {doc.code&&(
              <div style={{background:'#000',border:'1px solid rgba(0,255,136,0.2)',borderRadius:10,overflow:'hidden'}}>
                <div style={{padding:'8px 14px',borderBottom:'1px solid rgba(0,255,136,0.1)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:10,color:'#444',fontFamily:'JetBrains Mono,monospace'}}>bash</span>
                  <button onClick={()=>{navigator.clipboard?.writeText(doc.code);}} style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:10,fontFamily:'Orbitron,sans-serif'}}>COPIER</button>
                </div>
                <div style={{padding:14,fontFamily:'JetBrains Mono,monospace',fontSize:12,color:C.neon,whiteSpace:'pre-wrap',lineHeight:1.7}}>{doc.code}</div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
//  COMMUNICATION
// ════════════════════════════════════════════
const AUTO=['Bien reçu ! 👍','Je vais vérifier ça.','OK noté, merci !','C\'est noté ! On se call demain ?','Super, merci pour l\'info !','Je m\'en occupe maintenant.']
export function Communication(){
  const {getChat,addMsg,clearChat,getUsers,showToast}=useApp()
  const {user}=useAuth()
  const [msgs,setMsgs]=useState([])
  const [contacts,setContacts]=useState([])
  const [input,setInput]=useState('')
  const [ai,setAi]=useState(0)
  const [busy,setBusy]=useState(true)
  const [sending,setSending]=useState(false)
  const msgRef=useRef(null)

  const load=async()=>{
    setBusy(true)
    const [m,u]=await Promise.all([getChat('general'),getUsers()])
    setMsgs(m||[])
    setContacts((u||[]).filter(u2=>u2.id!==user?.id))
    setBusy(false)
  }
  useEffect(()=>{ load() },[])
  useEffect(()=>{ msgRef.current?.scrollTo(0,msgRef.current.scrollHeight) },[msgs.length])

  const send=async()=>{
    if(!input.trim()||sending) return
    setSending(true)
    await addMsg({msg:input})
    const txt=input; setInput('')
    await load()
    // Réponse automatique simulée
    setTimeout(async()=>{
      const contact=contacts[ai]
      if(contact){
        await addMsg({msg:AUTO[Math.floor(Math.random()*AUTO.length)]})
        await load()
      }
    },1200+Math.random()*800)
    setSending(false)
  }

  if(busy) return <Loader/>
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:24}}>
        <div>{PT('COMMUNICATION')}<p style={{color:C.t2,fontSize:13,marginTop:4}}>Messagerie d'équipe en temps réel</p></div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={load} style={S.btnGhost}><RefreshCw size={13}/></button>
          <button style={S.btnGhost}><Plus size={13}/> Nouveau canal</button>
        </div>
      </div>
      <div style={{...S.panel({padding:0,overflow:'hidden',display:'flex',height:560})}}>
        {/* Liste contacts */}
        <div style={{width:180,flexShrink:0,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column'}}>
          <div style={{padding:'11px 13px',borderBottom:`1px solid ${C.border}`}}>
            <p style={S.label}>ÉQUIPE</p>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:7}}>
            {/* Canal général */}
            <button onClick={()=>setAi(-1)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'9px 8px',borderRadius:9,marginBottom:3,border:'none',background:ai===-1?'rgba(0,200,255,0.1)':'none',cursor:'pointer',textAlign:'left',transition:'all 0.15s'}}>
              <div style={{width:30,height:30,borderRadius:7,background:'linear-gradient(135deg,#00c8ff,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>💬</div>
              <div><p style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:ai===-1?C.cyan:C.t2}}>#général</p><p style={{fontSize:9,color:C.t3}}>Tout le monde</p></div>
            </button>
            <div style={{height:1,background:C.border,margin:'6px 4px'}}/>
            {/* Contacts */}
            {contacts.map((u,i)=>(
              <button key={u.id} onClick={()=>setAi(i)}
                style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'9px 8px',borderRadius:9,marginBottom:3,border:'none',background:ai===i?'rgba(0,200,255,0.1)':'none',cursor:'pointer',textAlign:'left',transition:'all 0.15s'}}>
                <div style={{position:'relative',flexShrink:0}}>
                  <div style={{width:30,height:30,borderRadius:7,background:'linear-gradient(135deg,#00c8ff,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408'}}>
                    {ini(u.name)}
                  </div>
                  <div style={{position:'absolute',bottom:-1,right:-1,width:8,height:8,borderRadius:'50%',background:C.neon,border:`1.5px solid ${C.bg}`}}/>
                </div>
                <div style={{minWidth:0}}>
                  <p style={{fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:ai===i?C.cyan:C.t2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.name.split(' ')[0]}</p>
                  <p style={{fontSize:9,color:C.t3}}>{u.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Zone de chat */}
        <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
          {/* En-tête canal */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <motion.span style={{width:7,height:7,borderRadius:'50%',background:C.neon}} animate={{opacity:[1,0.4,1]}} transition={{duration:2,repeat:Infinity}}/>
              <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:12,color:C.t1}}>
                {ai===-1?'#général':contacts[ai]?.name||'Chat'}
              </span>
              <span style={{fontSize:10,color:C.t3}}>— {msgs.length} message{msgs.length>1?'s':''}</span>
            </div>
            <button onClick={()=>{clearChat();load();showToast('Chat vidé','success')}} style={{...S.btnGhost,fontSize:10,padding:'5px 9px'}}>
              <Trash2 size={10}/> Vider
            </button>
          </div>

          {/* Messages */}
          <div ref={msgRef} style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:9}}>
            {msgs.length===0&&<Empty icon={MessageSquare} msg="Aucun message" sub="Commencez la conversation !"/>}
            {msgs.map((m,i)=>{
              const isMine=m.user_id===user?.id||m.sender==='Vous'||m.type==='sent'
              return(
                <motion.div key={m.id||i} initial={{opacity:0,y:7}} animate={{opacity:1,y:0}}
                  style={{display:'flex',alignItems:'flex-end',gap:7,flexDirection:isMine?'row-reverse':'row'}}>
                  <div style={{width:27,height:27,borderRadius:7,background:isMine?'linear-gradient(135deg,#7c3aed,#00c8ff)':'linear-gradient(135deg,#00c8ff,#00ff88)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408',flexShrink:0}}>
                    {m.avatar||ini(m.sender||'?')}
                  </div>
                  <div style={{maxWidth:'72%'}}>
                    {!isMine&&<p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.cyan,marginBottom:3}}>{m.sender}</p>}
                    <div style={{padding:'9px 13px',borderRadius:13,fontSize:13,lineHeight:1.5,...(isMine?
                      {background:'linear-gradient(135deg,#7c3aed,#00c8ff)',color:'#fff',borderRadius:'13px 4px 13px 13px'}:
                      {background:'rgba(0,200,255,0.08)',border:`1px solid rgba(0,200,255,0.14)`,color:C.t1,borderRadius:'4px 13px 13px 13px'})}}>
                      {m.message||m.msg}
                    </div>
                    <p style={{fontSize:9,color:C.t3,marginTop:3,textAlign:isMine?'right':'left'}}>{m.time}</p>
                  </div>
                </motion.div>
              )
            })}
            {sending&&<div style={{display:'flex',gap:4,padding:'4px 8px'}}>{[0,1,2].map(i=><motion.span key={i} style={{width:6,height:6,borderRadius:'50%',background:C.cyan}} animate={{y:[-3,0,-3]}} transition={{duration:0.6,repeat:Infinity,delay:i*0.15}}/>)}</div>}
          </div>

          {/* Zone saisie */}
          <div style={{display:'flex',gap:7,padding:'11px 13px',borderTop:`1px solid ${C.border}`}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
              style={{flex:1,padding:'10px 14px',background:'rgba(0,200,255,0.04)',border:`1px solid ${C.border}`,borderRadius:10,color:C.t1,fontFamily:'Rajdhani,sans-serif',fontSize:13,outline:'none'}}
              placeholder="Tapez votre message... (Entrée pour envoyer)"/>
            <button onClick={send} disabled={!input.trim()||sending} style={{...S.btnCyan,padding:'10px 14px',opacity:!input.trim()||sending?0.5:1}}>
              <Send size={14}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
//  STATISTICS
// ════════════════════════════════════════════
export function Statistics(){
  const {getTasks,getProjects,getUsers,getStats}=useApp()
  const [tasks,setTasks]=useState([])
  const [projects,setProjects]=useState([])
  const [users,setUsers]=useState([])
  const [busy,setBusy]=useState(true)

  useEffect(()=>{
    Promise.all([getTasks(),getProjects(),getUsers()])
      .then(([t,p,u])=>{ setTasks(t||[]); setProjects(p||[]); setUsers(u||[]) })
      .finally(()=>setBusy(false))
  },[])

  const done=tasks.filter(t=>t.status==='done').length
  const inp=tasks.filter(t=>t.status==='inprogress').length
  const todo=tasks.filter(t=>t.status==='todo').length
  const total=Math.max(tasks.length,1)
  const r=45,circ=2*Math.PI*r
  const segs=[{v:done/total,c:C.neon,off:0},{v:inp/total,c:C.cyan,off:done/total},{v:todo/total,c:C.quantum,off:(done+inp)/total}]
  const bars=['Jan','Fév','Mar','Avr','Mai','Jun'].map((m,i)=>({m,v:Math.floor(20+Math.random()*78),deploys:Math.floor(1+Math.random()*8)}))

  if(busy) return <Loader/>
  return(
    <div>
      <div style={{marginBottom:24}}>{PT('STATISTIQUES')}<p style={{color:C.t2,fontSize:13,marginTop:4}}>Métriques et analyses de performance</p></div>
      {/* Chiffres clés */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))',gap:13,marginBottom:22}}>
        {[{v:tasks.length,l:'Total tâches',c:C.cyan,icon:'📋'},{v:done,l:'Terminées',c:C.neon,icon:'✅'},{v:projects.length,l:'Projets',c:C.plasma,icon:'📁'},{v:users.length,l:'Utilisateurs',c:C.solar,icon:'👥'}].map(s=>(
          <motion.div key={s.l} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} style={{...S.panel({padding:18,textAlign:'center'})}}>
            <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
            <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:30,color:s.c,marginBottom:3}}>{s.v}</div>
            <div style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t3,letterSpacing:'0.1em'}}>{s.l.toUpperCase()}</div>
          </motion.div>
        ))}
      </div>
      {/* Graphiques */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:18}}>
        {/* Donut tâches */}
        <div style={S.panel({padding:22})}>
          <PanelHeader icon={BarChart3} title="Tâches par statut"/>
          <div style={{display:'flex',alignItems:'center',gap:24}}>
            <div style={{position:'relative',flexShrink:0}}>
              <svg width={120} height={120} viewBox="0 0 110 110" style={{transform:'rotate(-90deg)'}}>
                <circle cx={55} cy={55} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={13}/>
                {segs.map((s,i)=>(
                  <motion.circle key={i} cx={55} cy={55} r={r} fill="none" stroke={s.c} strokeWidth={13} strokeLinecap="round"
                    strokeDasharray={`${s.v*circ} ${circ}`} strokeDashoffset={-s.off*circ}
                    initial={{strokeDasharray:`0 ${circ}`}} animate={{strokeDasharray:`${s.v*circ} ${circ}`}} transition={{duration:1.2,delay:i*0.2}}/>
                ))}
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:20,color:C.t1}}>{tasks.length}</span>
                <span style={{fontSize:8,color:C.t3,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>TÂCHES</span>
              </div>
            </div>
            <div style={{flex:1}}>
              {[{l:'Terminées',v:done,c:C.neon},{l:'En cours',v:inp,c:C.cyan},{l:'À faire',v:todo,c:C.quantum}].map(d=>(
                <div key={d.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:11}}>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <span style={{width:8,height:8,borderRadius:'50%',background:d.c}}/><span style={{fontSize:12,color:C.t2}}>{d.l}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:14,color:d.c}}>{d.v}</span>
                    <span style={{fontSize:10,color:C.t3}}>({Math.round(d.v/total*100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Barres commits */}
        <div style={S.panel({padding:22})}>
          <PanelHeader icon={BarChart3} title="Activité mensuelle" color={C.plasma}/>
          <div style={{display:'flex',alignItems:'flex-end',gap:7,height:110,marginBottom:8}}>
            {bars.map(b=>(
              <div key={b.m} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <motion.div initial={{height:0}} animate={{height:`${b.v}%`}} transition={{duration:1,ease:[0.4,0,0.2,1]}}
                  style={{width:'100%',borderRadius:'4px 4px 0 0',background:`linear-gradient(180deg,${C.cyan},${C.plasma})`,minHeight:4,boxShadow:`0 0 6px ${C.cyan}40`}}/>
                <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t3}}>{b.m}</span>
              </div>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,fontSize:10,color:C.t3}}>
            <span style={{width:10,height:3,background:`linear-gradient(90deg,${C.cyan},${C.plasma})`,borderRadius:2}}/> Commits/Build
          </div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        {/* Progression projets */}
        <div style={S.panel({padding:22})}>
          <PanelHeader icon={BarChart3} title="Progression projets" color={C.neon}/>
          {projects.length===0?<Empty icon={Database} msg="Aucun projet"/>:projects.map(p=>(
            <div key={p.id} style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:12,color:C.t2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,marginRight:8}}>{p.name}</span>
                <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:11,color:p.color,flexShrink:0}}>{p.progress}%</span>
              </div>
              <Progress value={p.progress} color={p.color}/>
            </div>
          ))}
        </div>
        {/* Membres */}
        <div style={S.panel({padding:22})}>
          <PanelHeader icon={BarChart3} title="Membres & Rôles" color={C.solar}/>
          {users.map((u,i)=>{
            const rc=ROLE_META[u.role]||ROLE_META.dev
            return(
              <motion.div key={u.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 0',borderBottom:i<users.length-1?`1px solid ${C.border}`:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:9}}>
                  <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${rc.color},${rc.color}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408',flexShrink:0}}>
                    {ini(u.name)}
                  </div>
                  <div>
                    <p style={{fontSize:12,color:C.t1}}>{u.name}</p>
                    <p style={{fontSize:10,color:C.t3}}>{u.email}</p>
                  </div>
                </div>
                <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'2px 7px',borderRadius:5,background:rc.bg,color:rc.color,border:`1px solid ${rc.border}`,flexShrink:0}}>
                  {rc.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
//  USERS (Admin uniquement)
// ════════════════════════════════════════════
export function UsersPage(){
  const {getUsers,addUser,updUser,delUser,showToast}=useApp()
  const {can,user:cu}=useAuth()
  const [users,setUsers]=useState([])
  const [modal,setModal]=useState(false)
  const [f,setF]=useState({name:'',email:'',role:'dev',password:'password123'})
  const [busy,setBusy]=useState(true)

  if(!can('users')) return <PermGuard can={false}/>

  const load=async()=>{ setBusy(true); setUsers(await getUsers()||[]); setBusy(false) }
  useEffect(()=>{ load() },[])

  const save=async()=>{
    if(!f.name||!f.email){ showToast('Nom et email requis','warning'); return }
    const res=await addUser(f)
    if(!res?.success){ showToast(res?.message||'Erreur','danger'); return }
    showToast('Utilisateur ajouté !','success'); setModal(false)
    setF({name:'',email:'',role:'dev',password:'password123'}); load()
  }
  const changeRole=async(id,role)=>{ await updUser(id,{role}); showToast('Rôle mis à jour !','success'); load() }
  const del=async id=>{
    if(id===cu?.id){ showToast('Impossible de vous supprimer vous-même','danger'); return }
    if(!confirm('Supprimer cet utilisateur définitivement ?')) return
    await delUser(id); showToast('Utilisateur supprimé','success'); load()
  }

  if(busy) return <Loader/>
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:24}}>
        <div>{PT('UTILISATEURS')}<p style={{color:C.t2,fontSize:13,marginTop:4}}>{users.length} membre{users.length>1?'s':''} dans l'équipe</p></div>
        <button onClick={()=>setModal(true)} style={S.btnCyan}><Plus size={13}/> Ajouter un membre</button>
      </div>
      <div style={S.panel({padding:0,overflow:'hidden'})}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                {['Utilisateur','Email','Rôle','Inscrit le','Actions'].map(h=>(
                  <th key={h} style={{padding:'11px 16px',textAlign:'left',fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,letterSpacing:'0.14em',color:C.t3}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u,i)=>{
                const rc=ROLE_META[u.role]||ROLE_META.dev
                return(
                  <motion.tr key={u.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                    style={{borderBottom:`1px solid ${C.border}`,transition:'background 0.15s'}}>
                    <td style={{padding:'13px 16px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${rc.color},${rc.color}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408',flexShrink:0}}>
                          {ini(u.name)}
                        </div>
                        <div>
                          <p style={{fontSize:12,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t1}}>{u.name}</p>
                          {u.id===cu?.id&&<span style={{fontSize:9,color:C.cyan,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>● VOUS</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'13px 16px',fontSize:11,color:C.t2,fontFamily:'JetBrains Mono,monospace'}}>{u.email}</td>
                    <td style={{padding:'13px 16px'}}>
                      <select value={u.role} onChange={e=>changeRole(u.id,e.target.value)}
                        style={{fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'4px 8px',borderRadius:6,background:rc.bg,color:rc.color,border:`1px solid ${rc.border}`,cursor:'pointer',outline:'none'}}>
                        <option value="admin">ADMIN</option>
                        <option value="dev">DEV</option>
                        <option value="client">CLIENT</option>
                      </select>
                    </td>
                    <td style={{padding:'13px 16px',fontSize:10,color:C.t3,fontFamily:'JetBrains Mono,monospace'}}>{u.join_date||u.joinDate||'—'}</td>
                    <td style={{padding:'13px 16px'}}>
                      <button onClick={()=>del(u.id)} disabled={u.id===cu?.id}
                        style={{background:'none',border:'none',color:u.id===cu?.id?C.t3:C.t3,cursor:u.id===cu?.id?'not-allowed':'pointer',opacity:u.id===cu?.id?0.3:1,padding:3,borderRadius:4,transition:'color 0.15s'}}>
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {modal&&(
          <MShell title="AJOUTER UN MEMBRE" onClose={()=>setModal(false)}>
            <div style={{display:'flex',flexDirection:'column',gap:13}}>
              <div><label style={S.label}>Nom complet *</label><input style={S.input} value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))} placeholder="Jean Dupont"/></div>
              <div><label style={S.label}>Email *</label><input type="email" style={S.input} value={f.email} onChange={e=>setF(x=>({...x,email:e.target.value}))} placeholder="email@exemple.com"/></div>
              <div><label style={S.label}>Mot de passe *</label><input type="password" style={S.input} value={f.password} onChange={e=>setF(x=>({...x,password:e.target.value}))} placeholder="Min 6 caractères"/></div>
              <div><label style={S.label}>Rôle</label>
                <select style={{...S.input,background:C.surface}} value={f.role} onChange={e=>setF(x=>({...x,role:e.target.value}))}>
                  <option value="dev">👨‍💻 Développeur</option>
                  <option value="admin">🔴 Administrateur</option>
                  <option value="client">🟢 Client</option>
                </select>
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button onClick={()=>setModal(false)} style={S.btnGhost}>Annuler</button>
                <button onClick={save} style={S.btnNeon}>Ajouter le membre</button>
              </div>
            </div>
          </MShell>
        )}
      </AnimatePresence>
    </div>
  )
}

// ════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════
const STABS=[{id:'profile',icon:Users,l:'Profil'},{id:'notifs',icon:Bell,l:'Notifications'},{id:'security',icon:Lock,l:'Sécurité'},{id:'perms',icon:Shield,l:'Permissions'},{id:'theme',icon:Palette,l:'Apparence'}]
const PDATA=[['Tableau de bord',true,true,true],['Créer des projets',true,true,false],['Supprimer projets',true,false,false],['Gérer les tâches',true,true,'Lecture'],['Pipeline CI/CD',true,true,false],['Dépôts Git',true,true,false],['Environnements',true,true,false],['Espace Dev',true,true,false],['Documentation',true,true,true],['Communication',true,true,true],['Statistiques',true,true,'Limitées'],['Gestion utilisateurs',true,false,false],['Paramètres',true,'Profil','Profil'],['Déconnexion',true,true,true]]

export function SettingsPage(){
  const {user,updateMe}=useAuth()
  const {showToast}=useApp()
  const [tab,setTab]=useState('profile')
  const [prof,setProf]=useState({name:user?.name||'',email:user?.email||''})
  const [notifs,setNotifs]=useState({email:true,tasks:true,projects:true,messages:false,deploys:true,security:true})
  const [pw,setPw]=useState({cur:'',next:'',confirm:''})
  const [pwe,setPwe]=useState({})
  const [accentColor,setAccentColor]=useState(C.cyan)

  const handlePw=()=>{
    const e={}
    if(!pw.cur) e.cur='Requis'
    if(pw.next.length<6) e.next='Min 6 caractères'
    if(pw.next!==pw.confirm) e.confirm='Ne correspond pas'
    setPwe(e)
    if(!Object.keys(e).length){
      updateMe({password:pw.next})
      setPw({cur:'',next:'',confirm:''})
      showToast('Mot de passe changé !','success')
    }
  }

  const Toggle=({v,onChange})=>(
    <button onClick={()=>onChange(!v)} type="button"
      style={{width:42,height:22,borderRadius:11,position:'relative',background:v?C.cyan:'rgba(255,255,255,0.08)',border:'none',cursor:'pointer',transition:'background 0.25s',flexShrink:0}}>
      <motion.div animate={{left:v?'22px':'2px'}} transition={{type:'spring',stiffness:500,damping:30}}
        style={{position:'absolute',top:2,width:18,height:18,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
    </button>
  )

  return(
    <div>
      <div style={{marginBottom:24}}>{PT('PARAMÈTRES')}<p style={{color:C.t2,fontSize:13,marginTop:4}}>Gérez vos préférences et la sécurité de votre compte</p></div>
      <div style={{...S.panel({padding:0,overflow:'hidden',display:'flex',minHeight:520})}}>
        {/* Menu onglets */}
        <div style={{width:180,flexShrink:0,borderRight:`1px solid ${C.border}`,padding:12}}>
          {STABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'10px 12px',borderRadius:9,marginBottom:3,border:'none',background:tab===t.id?'rgba(0,200,255,0.10)':'none',color:tab===t.id?C.cyan:C.t3,cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:600,fontSize:13,transition:'all 0.15s',textAlign:'left',borderLeft:tab===t.id?`2px solid ${C.cyan}`:'2px solid transparent'}}>
              <t.icon size={14}/>{t.l}
            </button>
          ))}
        </div>
        {/* Contenu */}
        <div style={{flex:1,padding:26,overflowY:'auto'}}>
          <AnimatePresence mode="wait">
            {tab==='profile'&&(
              <motion.div key="p" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{display:'flex',flexDirection:'column',gap:15}}>
                <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1}}>Profil utilisateur</h3>
                {/* Avatar */}
                <div style={{display:'flex',alignItems:'center',gap:16,padding:'14px',background:'rgba(0,200,255,0.04)',borderRadius:12,border:`1px solid ${C.border}`}}>
                  <div style={{width:56,height:56,borderRadius:14,background:`linear-gradient(135deg,${C.cyan},${C.plasma})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:'#020408'}}>
                    {ini(prof.name||user?.name)}
                  </div>
                  <div>
                    <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:14,color:C.t1}}>{prof.name||user?.name}</p>
                    <p style={{fontSize:12,color:C.t3,marginTop:2}}>{user?.email}</p>
                    <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'2px 8px',borderRadius:5,background:ROLE_META[user?.role]?.bg,color:ROLE_META[user?.role]?.color,border:`1px solid ${ROLE_META[user?.role]?.border}`,display:'inline-block',marginTop:4}}>
                      {ROLE_META[user?.role]?.label}
                    </span>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13}}>
                  <div><label style={S.label}>Nom complet</label><input style={S.input} value={prof.name} onChange={e=>setProf(f=>({...f,name:e.target.value}))}/></div>
                  <div><label style={S.label}>Email</label><input type="email" style={S.input} value={prof.email} onChange={e=>setProf(f=>({...f,email:e.target.value}))}/></div>
                </div>
                <button onClick={()=>{updateMe(prof);showToast('Profil sauvegardé !','success')}} style={{...S.btnCyan,alignSelf:'flex-start',fontSize:12}}>
                  Enregistrer les modifications
                </button>
              </motion.div>
            )}
            {tab==='notifs'&&(
              <motion.div key="n" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,marginBottom:18}}>Préférences de notifications</h3>
                {[['email','Notifications par email','Recevoir les alertes par email'],['tasks','Tâches assignées','Notifications quand une tâche vous est assignée'],['projects','Mises à jour projets','Changements de statut et progression'],['messages','Messages reçus','Nouveaux messages dans le chat'],['deploys','Déploiements','Succès et échecs de déploiement'],['security','Alertes sécurité','Connexions suspectes et changements de mot de passe']].map(([k,l,desc])=>(
                  <div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:`1px solid ${C.border}`}}>
                    <div>
                      <p style={{fontSize:13,color:C.t1,fontFamily:'Rajdhani,sans-serif',fontWeight:600}}>{l}</p>
                      <p style={{fontSize:11,color:C.t3,marginTop:2}}>{desc}</p>
                    </div>
                    <Toggle v={notifs[k]} onChange={v=>setNotifs(n=>({...n,[k]:v}))}/>
                  </div>
                ))}
                <button onClick={()=>showToast('Préférences sauvegardées !','success')} style={{...S.btnCyan,marginTop:16,fontSize:12}}>
                  Sauvegarder
                </button>
              </motion.div>
            )}
            {tab==='security'&&(
              <motion.div key="s" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{display:'flex',flexDirection:'column',gap:14}}>
                <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1}}>Sécurité du compte</h3>
                {[['cur','Mot de passe actuel'],['next','Nouveau mot de passe'],['confirm','Confirmer le nouveau mot de passe']].map(([k,l])=>(
                  <div key={k}>
                    <label style={S.label}>{l}</label>
                    <input type="password" style={{...S.input,borderColor:pwe[k]?C.nova:undefined}} value={pw[k]} onChange={e=>setPw(f=>({...f,[k]:e.target.value}))} placeholder={k==='cur'?'••••••••':k==='next'?'Min 6 caractères':'Répétez le mot de passe'}/>
                    {pwe[k]&&<p style={{fontSize:11,color:C.nova,marginTop:3}}>{pwe[k]}</p>}
                  </div>
                ))}
                <button onClick={handlePw} style={{...S.btnSolar,alignSelf:'flex-start',fontSize:12}}>
                  Changer le mot de passe
                </button>
                <div style={{padding:14,background:'rgba(255,206,0,0.06)',border:`1px solid rgba(255,206,0,0.2)`,borderRadius:10,marginTop:8}}>
                  <p style={{fontSize:12,color:C.quantum,fontFamily:'Orbitron,sans-serif',fontWeight:700,marginBottom:6}}>⚠️ Sessions actives</p>
                  <p style={{fontSize:12,color:C.t2}}>Session active sur cet appareil. Pour déconnecter toutes les autres sessions, changez votre mot de passe.</p>
                </div>
              </motion.div>
            )}
            {tab==='perms'&&(
              <motion.div key="pm" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,marginBottom:6}}>Matrice des permissions</h3>
                <p style={{fontSize:12,color:C.t3,marginBottom:16}}>Définit les accès selon chaque rôle dans la plateforme.</p>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                    <thead>
                      <tr style={{borderBottom:`1px solid ${C.border}`}}>
                        {['Fonctionnalité',{l:'ADMIN',c:C.nova},{l:'DEV',c:C.cyan},{l:'CLIENT',c:C.neon}].map((h,i)=>(
                          <th key={i} style={{padding:'9px 13px',textAlign:'left',fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:typeof h==='string'?C.t3:h.c}}>
                            {typeof h==='string'?h:h.l}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PDATA.map(([feat,a,d,cl])=>(
                        <tr key={feat} style={{borderBottom:`1px solid ${C.border}`}}>
                          <td style={{padding:'9px 13px',color:C.t2}}>{feat}</td>
                          {[a,d,cl].map((p,i)=>(
                            <td key={i} style={{padding:'9px 13px'}}>
                              {p===true?<Check size={13} style={{color:C.neon}}/>:p===false?<X size={13} style={{color:C.nova}}/>:<span style={{fontSize:10,color:C.quantum}}>{p}</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
            {tab==='theme'&&(
              <motion.div key="t" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,marginBottom:18}}>Apparence</h3>
                <div style={{marginBottom:20}}>
                  <p style={{fontSize:12,color:C.t2,marginBottom:11}}>Couleur d'accent de l'interface</p>
                  <div style={{display:'flex',gap:10}}>
                    {[C.cyan,C.plasma,C.neon,C.solar,C.nova,C.quantum].map(c=>(
                      <button key={c} type="button" onClick={()=>{setAccentColor(c);showToast('Couleur appliquée !','success')}}
                        style={{width:36,height:36,borderRadius:9,background:c,border:`2.5px solid ${accentColor===c?'#fff':'transparent'}`,cursor:'pointer',boxShadow:accentColor===c?`0 0 12px ${c}`:'none',transition:'all 0.15s'}}/>
                    ))}
                  </div>
                </div>
                <div style={{padding:'12px 14px',background:'rgba(0,200,255,0.04)',border:`1px solid ${C.border}`,borderRadius:10,marginBottom:16}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <p style={{fontSize:13,color:C.t1,fontFamily:'Rajdhani,sans-serif',fontWeight:600}}>Mode sombre (4D Cosmic)</p>
                      <p style={{fontSize:11,color:C.t3,marginTop:2}}>Interface sombre optimisée pour les longues sessions de développement</p>
                    </div>
                    <span style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,padding:'2px 9px',borderRadius:5,background:'rgba(0,200,255,0.1)',color:C.cyan,border:'1px solid rgba(0,200,255,0.2)'}}>ACTIF</span>
                  </div>
                </div>
                <button onClick={()=>showToast('Thème appliqué !','success')} style={{...S.btnPlasma,fontSize:12}}>
                  Appliquer le thème
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
//  HELP
// ════════════════════════════════════════════
const FAQS=[
  {q:'Comment créer un projet ?',        a:'Allez dans Projets > "Nouveau projet". Remplissez le nom, la description, le statut et la couleur. Cliquez "Créer le projet".'},
  {q:'Comment déplacer une tâche ?',     a:'Dans la vue Kanban (Tâches), glissez-déposez la carte de tâche d\'une colonne à l\'autre. Le statut se met à jour automatiquement.'},
  {q:'Permissions du rôle client ?',     a:'Le client peut consulter le dashboard, les projets (lecture seule), la documentation et le chat. Il ne peut pas créer, modifier ou supprimer.'},
  {q:'Comment lancer le pipeline ?',     a:'Allez dans Pipeline CI/CD, cliquez "Lancer Pipeline". Les 4 étapes s\'exécutent automatiquement : Checkout, Tests, Build, Deploy.'},
  {q:'L\'application fonctionne-t-elle sans backend ?', a:'Oui ! En mode hors-ligne, les données sont chargées depuis le cache local (localStorage). Une bannière jaune vous l\'indique en haut de l\'écran.'},
  {q:'Comment changer le rôle d\'un utilisateur ?', a:'Allez dans Utilisateurs (admin uniquement). Dans le tableau, utilisez le sélecteur de rôle sur la ligne de l\'utilisateur. La modification est immédiate.'},
  {q:'Comment réinitialiser les données mock ?', a:'Si vous utilisez le backend Laravel : lancez "php artisan mock:reset" dans le terminal. En mode local : effacez le localStorage du navigateur.'},
]

export function HelpPage(){
  const {showToast}=useApp()
  const [open,setOpen]=useState(null)
  const [sub,setSub]=useState('')
  const [msg,setMsg]=useState('')

  return(
    <div>
      <div style={{marginBottom:24}}>{PT('AIDE & SUPPORT')}<p style={{color:C.t2,fontSize:13,marginTop:4}}>Documentation, tutoriels et assistance technique</p></div>

      {/* Ressources */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:14,marginBottom:24}}>
        {[
          ['📚','Documentation','Guides complets et API Reference','#00c8ff'],
          ['🎬','Tutoriels vidéo','Apprenez par l\'exemple','#7c3aed'],
          ['🎧','Support technique','Réponse en moins de 24h','#00ff88'],
          ['👥','Communauté','Forums et discussions dev','#ff6b35'],
        ].map(([icon,title,desc,color])=>(
          <motion.div key={title} whileHover={{y:-3,transition:{duration:0.2}}} onClick={()=>showToast(`Ouverture : ${title}...`,'info')}
            style={{...S.panel({padding:20,textAlign:'center',cursor:'pointer'})}}>
            <div style={{fontSize:28,marginBottom:10}}>{icon}</div>
            <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:12,color:C.t1,marginBottom:5}}>{title}</h3>
            <p style={{fontSize:11,color:C.t3,lineHeight:1.5,marginBottom:13}}>{desc}</p>
            <div style={{display:'inline-block',padding:'5px 14px',borderRadius:7,background:`${color}12`,color,border:`1px solid ${color}25`,fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,cursor:'pointer'}}>
              Accéder →
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{...S.panel({padding:22,marginBottom:20})}}>
        <PanelHeader icon={HelpCircle} title="Questions fréquentes (FAQ)"/>
        {FAQS.map((f,i)=>(
          <div key={i} style={{borderRadius:9,overflow:'hidden',marginBottom:7,border:`1px solid ${C.border}`}}>
            <button onClick={()=>setOpen(open===i?null:i)}
              style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'none',border:'none',color:C.t1,cursor:'pointer',textAlign:'left',gap:12}}>
              <span style={{fontSize:13,fontFamily:'Rajdhani,sans-serif',fontWeight:600,color:open===i?C.cyan:C.t1,flex:1}}>{f.q}</span>
              <motion.span animate={{rotate:open===i?180:0}} transition={{duration:0.2}} style={{color:C.cyan,fontSize:10,flexShrink:0}}>
                <ChevronDown size={14}/>
              </motion.span>
            </button>
            <AnimatePresence>
              {open===i&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.22}}>
                  <div style={{padding:'0 16px 14px',fontSize:13,color:C.t2,lineHeight:1.6,borderTop:`1px solid ${C.border}`,paddingTop:12}}>{f.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Contacter le support */}
      <div style={S.panel({padding:22})}>
        <PanelHeader icon={HelpCircle} title="Contacter le support" color={C.neon}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div>
            <label style={S.label}>Sujet</label>
            <input style={S.input} value={sub} onChange={e=>setSub(e.target.value)} placeholder="Décrivez brièvement votre problème"/>
          </div>
          <div>
            <label style={S.label}>Message</label>
            <textarea style={{...S.input,resize:'none',height:84}} value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Détails de votre demande..."/>
          </div>
        </div>
        <button
          onClick={()=>{ if(!sub.trim()||!msg.trim()){showToast('Remplissez tous les champs','warning');return}; showToast('Message envoyé au support !','success'); setSub(''); setMsg('') }}
          style={{...S.btnNeon,marginTop:16,fontSize:12}}>
          Envoyer le message
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
//  LOGOUT
// ════════════════════════════════════════════
export function LogoutPage(){
  const {logout}=useAuth()
  const navigate=useNavigate()
  const [prog,setProg]=useState(0)
  const [done,setDone]=useState(false)

  useEffect(()=>{
    const iv=setInterval(()=>{
      setProg(p=>{
        if(p>=100){
          clearInterval(iv)
          setDone(true)
          setTimeout(async()=>{ await logout(); navigate('/login') },700)
          return 100
        }
        return p+1.5
      })
    },45)
    return()=>clearInterval(iv)
  },[])

  const steps=[
    {l:'Sauvegarde des préférences',    done:prog>25},
    {l:'Fermeture des connexions actives',done:prog>55},
    {l:'Nettoyage de la session',       done:prog>80},
    {l:'Redirection vers la connexion', done:prog>95},
  ]

  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'70vh'}}>
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
        style={{...S.panel({padding:44,maxWidth:420,width:'100%',textAlign:'center'})}}>

        {/* Icône */}
        <motion.div
          animate={done?{scale:[1,1.3,1]}:{rotate:[0,-8,8,-8,0]}}
          transition={done?{duration:0.5}:{delay:0.5,duration:0.6}}
          style={{width:72,height:72,borderRadius:18,margin:'0 auto 20px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,background:done?'rgba(0,255,136,0.1)':'rgba(255,45,120,0.1)',border:`1px solid ${done?'rgba(0,255,136,0.3)':'rgba(255,45,120,0.3)'}`,transition:'all 0.5s'}}>
          {done?'✓':<LogOut size={30} style={{color:C.nova}}/>}
        </motion.div>

        <h2 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:19,color:C.t1,marginBottom:7}}>
          {done?'À bientôt ! 👋':'Déconnexion en cours...'}
        </h2>
        <p style={{color:C.t2,fontSize:13,marginBottom:24}}>Fermeture sécurisée de votre session DevEnviron</p>

        {/* Barre de progression */}
        <div style={{marginBottom:22}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:C.t3,marginBottom:6}}>
            <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700}}>Progression</span>
            <span style={{fontFamily:'JetBrains Mono,monospace'}}>{Math.round(prog)}%</span>
          </div>
          <div style={{height:5,background:'rgba(255,255,255,0.06)',borderRadius:10,overflow:'hidden'}}>
            <motion.div style={{height:'100%',borderRadius:10,background:'linear-gradient(90deg,#ff2d78,#7c3aed)',width:`${prog}%`}}/>
          </div>
        </div>

        {/* Étapes */}
        <div style={{textAlign:'left',marginBottom:24}}>
          {steps.map((s,i)=>(
            <motion.div key={i} initial={{opacity:0,x:-9}} animate={{opacity:1,x:0}} transition={{delay:0.2+i*0.1}}
              style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                background:s.done?'rgba(0,255,136,0.15)':'rgba(255,255,255,0.05)',
                border:`1px solid ${s.done?'rgba(0,255,136,0.4)':'rgba(255,255,255,0.1)'}`,transition:'all 0.4s'}}>
                {s.done
                  ?<Check size={10} style={{color:C.neon}}/>
                  :<motion.div animate={{opacity:[0.4,1,0.4]}} transition={{duration:1.2,repeat:Infinity}} style={{width:5,height:5,borderRadius:'50%',background:C.t3}}/>
                }
              </div>
              <span style={{fontSize:12,color:s.done?C.t2:C.t3,transition:'color 0.4s'}}>{s.l}</span>
            </motion.div>
          ))}
        </div>

        {/* Bouton déconnexion immédiate */}
        <button onClick={async()=>{ await logout(); navigate('/login') }} style={{...S.btnNova,width:'100%',padding:'12px 18px',fontSize:12}}>
          <LogOut size={13}/> Déconnexion immédiate
        </button>
      </motion.div>
    </div>
  )
}
