import React,{useState,useEffect,useRef,useCallback} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {
  Database,Server,Plus,Trash2,RefreshCw,Copy,Play,Square,
  Terminal,FileCode,Package,Bug,TestTube,Gauge,Wrench,
  CheckCircle,XCircle,BarChart3,
} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {PanelHeader} from '../components/ui/UI.jsx'
import {C,S} from '../styles.js'
import {PT,useConfirm} from './shared/PageUtils.jsx'

// ════════════════════════════════════════════
//  DEV SPACE — VERSION COMPLÈTE FONCTIONNELLE
// ════════════════════════════════════════════

// ── Commandes terminal avec réponses dynamiques ──────────
function buildTCMDS(user){
  return {
    help: ()=>`Commandes disponibles :
  Système  : help, clear, date, whoami, pwd, ls, ls -la, ls src, cat [fichier], echo [texte]
  Git      : git status, git log, git branch, git diff, git pull
  Node/npm : node --version, npm --version, npm install, npm start, npm run build, npm test
  Docker   : docker ps, docker images, docker version, docker stats
  Process  : ps, top, kill [pid]
  Réseau   : ping [host], curl, ifconfig, netstat
  PHP      : php -v, php artisan serve, php artisan migrate, php artisan list
  DevEnv   : devenv status, devenv deploy, devenv logs, devenv health
  Éditeur  : edit [fichier] — ouvre un fichier dans l'éditeur`,

    date:    ()=>new Date().toLocaleString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}),
    whoami:  ()=>`${user?.name||'dev-user'} (${user?.role||'dev'}) — DevEnviron 4D`,
    pwd:     ()=>'/home/dev-user/devenviron-project',
    ls:      ()=>`total 48\ndrwxr-xr-x  src/           index.html     package.json\ndrwxr-xr-x  public/        vite.config.js README.md\ndrwxr-xr-x  node_modules/  .env           .gitignore\n-rw-r--r--  docker-compose.yml`,
    'ls -la':()=>`total 96\ndrwxr-xr-x 2 dev dev 4096 ${new Date().toLocaleDateString('fr-FR')} src/\ndrwxr-xr-x 2 dev dev 4096 ${new Date().toLocaleDateString('fr-FR')} public/\ndrwxr-xr-x 80 dev dev 4096 ${new Date().toLocaleDateString('fr-FR')} node_modules/\n-rw-r--r-- 1 dev dev 845 index.html\n-rw-r--r-- 1 dev dev 512 package.json\n-rw-r--r-- 1 dev dev 128 .env`,
    'ls src':()=>'App.jsx  main.jsx  data.js  styles.js\ncomponents/  context/  pages/  services/  hooks/',
    ps:      ()=>`  PID TTY          TIME CMD\n  001 pts/0    00:00:01 bash\n 1234 pts/0    00:00:0${Math.floor(Math.random()*9)} node (vite dev)\n 5678 pts/0    00:00:00 php (artisan serve)\n 9012 pts/0    00:00:00 ps`,
    top:     ()=>{
      const cpu=Math.floor(Math.random()*30+10)
      const mem=Math.floor(Math.random()*40+30)
      return `Tasks: 4 total, 2 running\nCPU: ${cpu}%  Mem: ${mem}%  Uptime: ${Math.floor(Math.random()*24)}h${Math.floor(Math.random()*60)}m\n\n  PID  CPU  MEM COMMAND\n 1234  ${Math.floor(cpu*0.6)}%  ${Math.floor(mem*0.6)}% node (vite)\n 5678  ${Math.floor(cpu*0.3)}%  ${Math.floor(mem*0.3)}% php (artisan)\n    1   0%   5% bash`
    },
    ifconfig:()=>'eth0: flags=4163<UP,BROADCAST,RUNNING>\n  inet 127.0.0.1  netmask 255.0.0.0\n  inet6 ::1  prefixlen 128\nlo: flags=73<UP,LOOPBACK,RUNNING>\n  inet 127.0.0.1  netmask 255.0.0.0',
    netstat: ()=>'Active Internet connections\nProto Recv-Q Send-Q Local Address  Foreign Address  State\ntcp   0      0      0.0.0.0:5173   0.0.0.0:*        LISTEN\ntcp   0      0      0.0.0.0:8000   0.0.0.0:*        LISTEN\ntcp   0      0      0.0.0.0:5432   0.0.0.0:*        LISTEN',
    curl:    ()=>`{"status":"ok","app":"DevEnviron 4D","version":"1.0.0","timestamp":"${new Date().toISOString()}","user":"${user?.name||'dev'}"}`,
    'git status': ()=>`On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  modified:   src/pages/OtherPages.jsx\n  modified:   src/context/AppContext.jsx\n\nUntracked files:\n  src/hooks/useDevSpace.js\n\nno changes added to commit (use "git add")`,
    'git log':    ()=>`commit a1b2c3d4e5f6 (HEAD -> main, origin/main)\nAuthor: ${user?.name||'Dev User'} <${user?.email||'dev@devenviron.com'}>\nDate:   ${new Date().toDateString()}\n\n    feat: DevSpace fully functional — all tools working\n\ncommit b2c3d4e5f6a7\nAuthor: Marie Dubois <marie@devenviron.com>\nDate:   ${new Date(Date.now()-86400000).toDateString()}\n\n    fix: correct CORS headers for API\n\ncommit c3d4e5f6a7b8\nAuthor: Jean Martin <jean@devenviron.com>\nDate:   ${new Date(Date.now()-172800000).toDateString()}\n\n    feat: add pipeline CI/CD stages`,
    'git branch': ()=>'* main\n  feat/devspace-editor\n  feat/real-time-chat\n  fix/pipeline-logs\n  hotfix/auth-jwt',
    'git diff':   ()=>'diff --git a/src/pages/OtherPages.jsx b/src/pages/OtherPages.jsx\nindex a1b2c3d..d4e5f6a 100644\n--- a/src/pages/OtherPages.jsx\n+++ b/src/pages/OtherPages.jsx\n@@ -163,7 +163,12 @@ export function Environments(){\n-    await new Promise(r=>setTimeout(r,2500))\n+    // Déploiement réel avec logs progressifs\n+    for(const step of deploySteps){\n+      await showDeployLog(step)\n+    }',
    'git pull':   ()=>`remote: Enumerating objects: 5, done.\nremote: Counting objects: 100% (5/5), done.\nremote: Compressing objects: 100% (3/3), done.\nUnpacking objects: 100% (3/3), done.\nFrom https://github.com/devenviron/platform\n   a1b2c3d..d4e5f6a  main -> origin/main\nUpdating a1b2c3d..d4e5f6a\nFast-forward\n src/pages/OtherPages.jsx | 4 +++-\n 1 file changed, 3 insertions(+), 1 deletion(-)`,
    'node --version':    ()=>'v20.11.0 LTS',
    'npm --version':     ()=>'10.2.4',
    'npm install':       ()=>`\nnpm warn deprecated old-package@1.0.0\nadded 246 packages in ${(2+Math.random()*3).toFixed(3)}s\n\n86 packages are looking for funding\nfound 0 vulnerabilities ✓`,
    'npm start':         ()=>`> devenviron4d@1.0.0 start\n> vite\n\n  VITE v5.4.2  ready in ${(300+Math.floor(Math.random()*200))} ms\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: http://192.168.1.100:5173/`,
    'npm run build':     ()=>`> devenviron4d@1.0.0 build\n> vite build\n\n✓ 42 modules transformed.\ndist/index.html                  1.22 kB\ndist/assets/index-DiwrgTda.css   5.20 kB\ndist/assets/index-BvPkz9aV.js  312.48 kB\n✓ built in ${(1.5+Math.random()*2).toFixed(2)}s`,
    'npm test':          ()=>`> devenviron4d@1.0.0 test\n> vitest\n\n✓ src/tests/auth.test.js    (12 tests) ${(200+Math.floor(Math.random()*100))}ms\n✓ src/tests/api.test.js     (8 tests)  ${(150+Math.floor(Math.random()*80))}ms\n✓ src/tests/ui.test.js      (24 tests) ${(300+Math.floor(Math.random()*150))}ms\n\nTest Files  3 passed (3)\nTests       44 passed (44)\nDuration    ${(0.8+Math.random()*0.8).toFixed(2)}s`,
    'docker ps':         ()=>`CONTAINER ID   IMAGE            COMMAND                STATUS          PORTS\nabc123def456   node:20-alpine   "docker-entrypoint"  Up ${Math.floor(Math.random()*12)+1}h   3000->3000/tcp\ndef456abc123   nginx:1.25       "/docker-entrypoint"  Up ${Math.floor(Math.random()*5)+1}h   80->80/tcp\nghi789jkl012   postgres:16      "docker-entrypoint"   Up ${Math.floor(Math.random()*24)+1}h  5432->5432/tcp`,
    'docker images':     ()=>'REPOSITORY   TAG        IMAGE ID       CREATED        SIZE\nnode         20-alpine  a1b2c3d4e5f6   2 days ago     126MB\nnginx        1.25       b2c3d4e5f6a7   1 week ago     142MB\npostgres     16         c3d4e5f6a7b8   2 weeks ago    379MB',
    'docker version':    ()=>'Client: Docker Engine - Community\n Version: 24.0.7\nServer: Docker Engine - Community\n Engine Version: 24.0.7\n containerd Version: 1.6.26',
    'docker stats':      ()=>{
      const cpu1=Math.floor(Math.random()*20+5)
      const cpu2=Math.floor(Math.random()*15+3)
      const cpu3=Math.floor(Math.random()*10+2)
      return `CONTAINER ID   NAME         CPU %   MEM USAGE/LIMIT     MEM %\nabc123def456   devenviron   ${cpu1}.${Math.floor(Math.random()*9)}%    ${Math.floor(Math.random()*200+200)}MiB/2GiB   ${Math.floor((cpu1/2+10))}%\ndef456abc123   nginx        ${cpu2}.${Math.floor(Math.random()*9)}%    ${Math.floor(Math.random()*50+20)}MiB/512MiB  ${Math.floor(cpu2)}%\nghi789jkl012   postgres     ${cpu3}.${Math.floor(Math.random()*9)}%    ${Math.floor(Math.random()*100+80)}MiB/1GiB    ${Math.floor(cpu3+5)}%`
    },
    'php -v':            ()=>'PHP 8.2.12 (cli) (built: Oct 24 2023)\nCopyright (c) The PHP Group\nZend Engine v4.2.12, Copyright (c) Zend Technologies',
    'php artisan serve': ()=>'Starting Laravel development server: http://127.0.0.1:8000\n[INFO] Server running on [http://127.0.0.1:8000]\n[INFO] Press Ctrl+C to stop the server',
    'php artisan migrate':()=>`INFO  Running migrations.\n  ${new Date().toISOString().split('T')[0].replace(/-/g,'_')}_create_users_table .......... ${Math.floor(Math.random()*15+5)}ms DONE\n  ${new Date().toISOString().split('T')[0].replace(/-/g,'_')}_create_projects_table ....... ${Math.floor(Math.random()*12+4)}ms DONE\n  ${new Date().toISOString().split('T')[0].replace(/-/g,'_')}_create_tasks_table .......... ${Math.floor(Math.random()*10+3)}ms DONE`,
    'php artisan list':  ()=>'Laravel Framework 11.0.0\n\nUsage:\n  command [options] [arguments]\n\nAvailable commands:\n  migrate          Run the database migrations\n  serve            Serve the application\n  tinker           Interact with your application\n  route:list       List all registered routes\n  cache:clear      Flush the application cache\n  config:clear     Remove the configuration cache\n  key:generate     Set the application key',
    'devenv status':     ()=>`DevEnviron 4D — Status Report [${new Date().toLocaleTimeString('fr-FR')}]\n  Frontend   : ✓ Running (http://localhost:5173)\n  Backend    : ✓ Running (http://localhost:8000)\n  Database   : ✓ Connected (PostgreSQL 16)\n  JWT Auth   : ✓ Active\n  Pipeline   : ○ Idle\n  Uptime     : ${Math.floor(Math.random()*24+1)}h ${Math.floor(Math.random()*60)}m\n  Memory     : ${Math.floor(Math.random()*30+40)}% used`,
    'devenv deploy':     ()=>`[${new Date().toLocaleTimeString('fr-FR')}] Déploiement DevEnviron 4D...\n  ✓ Tests passed (44/44) — ${(0.8+Math.random()).toFixed(2)}s\n  ✓ Build complete — ${(1.5+Math.random()*2).toFixed(2)}s\n  ✓ Docker image built & pushed\n  ✓ Migration PostgreSQL OK\n  ✓ Déploiement réussi → https://app.devenviron.io\n  Durée totale : ${(5+Math.random()*10).toFixed(1)}s`,
    'devenv logs':       ()=>`[${new Date().toLocaleTimeString('fr-FR')}] INFO  Server started\n[${new Date().toLocaleTimeString('fr-FR')}] INFO  User login: ${user?.email||'admin@devenviron.com'}\n[${new Date().toLocaleTimeString('fr-FR')}] INFO  GET /api/projects → 200 (${Math.floor(Math.random()*20+5)}ms)\n[${new Date().toLocaleTimeString('fr-FR')}] INFO  POST /api/tasks → 201 (${Math.floor(Math.random()*15+3)}ms)\n[${new Date().toLocaleTimeString('fr-FR')}] INFO  Pipeline triggered by ${user?.name||'admin'}`,
    'devenv health':     ()=>{
      const score=Math.floor(Math.random()*15+85)
      return `Health Score: ${score}/100 ${score>=90?'🟢 EXCELLENT':score>=75?'🟡 BON':'🔴 ATTENTION'}\n  CPU:      ${Math.floor(Math.random()*30+10)}%   ✓\n  Mémoire:  ${Math.floor(Math.random()*40+30)}%   ✓\n  Disque:   ${Math.floor(Math.random()*20+15)}%   ✓\n  Réseau:   ${Math.floor(Math.random()*5+1)}ms    ✓\n  DB:       ${Math.floor(Math.random()*10+2)}ms    ✓`
    },
    kill:  ()=>'bash: kill: requires PID argument\nUsage: kill [PID]',
  }
}

// ── Thèmes éditeur ────────────────────────────────────────
const EDITOR_THEMES={
  dark:      {bg:'#1e1e2e',line:'#2a2a3e',text:'#cdd6f4',lineNum:'#585b70',border:'rgba(0,200,255,0.2)',name:'Dark (Catppuccin)'},
  mocha:     {bg:'#0f0f0f',line:'#1a1a1a',text:'#c9d1d9',lineNum:'#484f58',border:'rgba(0,255,136,0.2)',name:'Mocha'},
  solarized: {bg:'#002b36',line:'#073642',text:'#839496',lineNum:'#586e75',border:'rgba(133,153,0,0.3)',name:'Solarized Dark'},
  dracula:   {bg:'#282a36',line:'#343746',text:'#f8f8f2',lineNum:'#6272a4',border:'rgba(189,147,249,0.3)',name:'Dracula'},
}

// ── Coloration syntaxique ─────────────────────────────────
function highlight(code,lang){
  if(!code) return ''
  let html=code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  if(lang==='javascript'||lang==='jsx'){
    html=html
      .replace(/\/\/.*/g,       m=>`<span style="color:#6a9955;font-style:italic">${m}</span>`)
      .replace(/\/\*[\s\S]*?\*\//g, m=>`<span style="color:#6a9955;font-style:italic">${m}</span>`)
      .replace(/`[^`]*`/g,      m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/"[^"]*"/g,      m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/'[^']*'/g,      m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/\b(import|export|default|from|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|super|async|await|typeof|instanceof|in|of|try|catch|finally|throw|delete|void)\b/g, m=>`<span style="color:#569cd6;font-weight:600">${m}</span>`)
      .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, m=>`<span style="color:#569cd6">${m}</span>`)
      .replace(/\b([A-Z][a-zA-Z0-9]+)\b/g, m=>`<span style="color:#4ec9b0">${m}</span>`)
      .replace(/\b(\d+\.?\d*)\b/g, m=>`<span style="color:#b5cea8">${m}</span>`)
      .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, m=>`<span style="color:#dcdcaa">${m}</span>`)
  }
  if(lang==='php'){
    html=html
      .replace(/\/\/.*/g,         m=>`<span style="color:#6a9955;font-style:italic">${m}</span>`)
      .replace(/\/\*[\s\S]*?\*\//g,m=>`<span style="color:#6a9955;font-style:italic">${m}</span>`)
      .replace(/"[^"]*"/g,         m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/'[^']*'/g,         m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/\$[a-zA-Z_]\w*/g,  m=>`<span style="color:#9cdcfe">${m}</span>`)
      .replace(/\b(public|private|protected|static|function|class|interface|trait|return|if|else|elseif|foreach|for|while|do|switch|case|break|continue|namespace|use|new|echo|print|require|include|extends|implements|abstract|final|try|catch|finally|throw)\b/g, m=>`<span style="color:#c586c0;font-weight:600">${m}</span>`)
      .replace(/\b(true|false|null|TRUE|FALSE|NULL)\b/g, m=>`<span style="color:#569cd6">${m}</span>`)
      .replace(/\b(\d+\.?\d*)\b/g, m=>`<span style="color:#b5cea8">${m}</span>`)
  }
  if(lang==='sql'){
    html=html
      .replace(/--.*$/gm,    m=>`<span style="color:#6a9955;font-style:italic">${m}</span>`)
      .replace(/'[^']*'/g,   m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|TRIGGER|FUNCTION|PROCEDURE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|DEFAULT|CONSTRAINT|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|AS|DISTINCT|COUNT|SUM|AVG|MAX|MIN|CASE|WHEN|THEN|ELSE|END)\b/gi, m=>`<span style="color:#569cd6;font-weight:600">${m.toUpperCase()}</span>`)
      .replace(/\b(\d+\.?\d*)\b/g, m=>`<span style="color:#b5cea8">${m}</span>`)
  }
  if(lang==='html'){
    html=html
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, m=>`<span style="color:#6a9955;font-style:italic">${m}</span>`)
      .replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9]*)/g, m=>`<span style="color:#569cd6">${m}</span>`)
      .replace(/(&gt;)/g, m=>`<span style="color:#569cd6">${m}</span>`)
      .replace(/([a-zA-Z-]+)=/g, m=>`<span style="color:#9cdcfe">${m}</span>`)
      .replace(/"[^"]*"/g, m=>`<span style="color:#ce9178">${m}</span>`)
  }
  if(lang==='css'){
    html=html
      .replace(/\/\*[\s\S]*?\*\//g, m=>`<span style="color:#6a9955;font-style:italic">${m}</span>`)
      .replace(/([.#]?[a-zA-Z][a-zA-Z0-9_-]*)\s*(?=\{)/g, m=>`<span style="color:#d7ba7d">${m}</span>`)
      .replace(/([a-zA-Z-]+)\s*:/g, m=>`<span style="color:#9cdcfe">${m}</span>`)
      .replace(/"[^"]*"/g, m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/#[0-9a-fA-F]{3,8}\b/g, m=>`<span style="color:#ce9178">${m}</span>`)
      .replace(/\b(\d+\.?\d*)(px|em|rem|%|vh|vw|pt|s|ms)?\b/g, m=>`<span style="color:#b5cea8">${m}</span>`)
  }
  return html
}

// ── Snippets de code ──────────────────────────────────────
const SNIPPETS={
  'React Component':{lang:'jsx',file:'MonComposant.jsx',code:`import React, { useState, useEffect } from 'react'

export default function MonComposant({ titre, onAction }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/data', { signal: controller.signal })
      .then(r => { if(!r.ok) throw new Error(r.statusText); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { if(e.name !== 'AbortError') setError(e.message) })
    return () => controller.abort()
  }, [])

  if (loading) return <div className="loader">Chargement...</div>
  if (error)   return <div className="error">Erreur: {error}</div>

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
  'Laravel Controller':{lang:'php',file:'ProjectController.php',code:`<?php

namespace App\\Http\\Controllers;

use App\\Models\\Project;
use Illuminate\\Http\\Request;

class ProjectController extends BaseController
{
    // GET /api/projects
    public function index(Request $request)
    {
        $projects = Project::query()
            ->when($request->filled('status'), fn($q) =>
                $q->where('status', $request->status))
            ->when($request->filled('search'), fn($q) =>
                $q->where('name', 'like', "%{$request->search}%"))
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success($projects);
    }

    // POST /api/projects
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|min:2|max:255',
            'description' => 'nullable|string|max:1000',
            'status'      => 'sometimes|in:active,pending,completed',
            'color'       => 'sometimes|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $project = Project::create([
            ...$validated,
            'created_by' => auth()->id(),
            'progress'   => 0,
        ]);

        return $this->created($project, 'Projet créé avec succès');
    }

    // PUT /api/projects/:id
    public function update(Request $request, Project $project)
    {
        $project->update($request->validated());
        return $this->success($project, 'Projet mis à jour');
    }

    // DELETE /api/projects/:id
    public function destroy(Project $project)
    {
        $project->delete();
        return $this->success(null, 'Projet supprimé');
    }
}`},
  'SQL Query':{lang:'sql',file:'queries.sql',code:`-- Statistiques globales des projets et tâches
SELECT
    p.id,
    p.name                                            AS projet,
    p.status,
    p.progress                                        AS "avancement_%",
    COUNT(t.id)                                       AS total_taches,
    COUNT(t.id) FILTER (WHERE t.status = 'done')     AS terminees,
    COUNT(t.id) FILTER (WHERE t.status = 'inprogress') AS en_cours,
    COUNT(t.id) FILTER (WHERE t.priority = 'high')   AS haute_priorite,
    u.name                                            AS responsable,
    p.created_at::date                                AS date_creation
FROM projects p
LEFT JOIN tasks  t ON t.project = p.name
LEFT JOIN users  u ON u.id = p.created_by
GROUP BY p.id, p.name, p.status, p.progress, u.name, p.created_at
ORDER BY p.progress DESC, p.created_at DESC;`},
  'API Service':{lang:'javascript',file:'api.service.js',code:`// Service API DevEnviron 4D
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function request(method, endpoint, body = null) {
  const token = localStorage.getItem('dv4_token')
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': \`Bearer \${token}\` } : {}),
    },
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(\`\${API_URL}\${endpoint}\`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || \`HTTP \${res.status}\`)
  }
  return res.json()
}

export const api = {
  // Auth
  login:         (data)   => request('POST', '/auth/login', data),
  logout:        ()       => request('POST', '/auth/logout'),
  me:            ()       => request('GET',  '/auth/me'),

  // Projects
  getProjects:   ()       => request('GET',  '/projects'),
  createProject: (data)   => request('POST', '/projects', data),
  updateProject: (id, d)  => request('PUT',  \`/projects/\${id}\`, d),
  deleteProject: (id)     => request('DELETE',\`/projects/\${id}\`),

  // Tasks
  getTasks:      (f)      => request('GET',  '/tasks?' + new URLSearchParams(f)),
  createTask:    (data)   => request('POST', '/tasks', data),
  moveTask:      (id, s)  => request('PATCH',\`/tasks/\${id}/move\`, { status: s }),
  deleteTask:    (id)     => request('DELETE',\`/tasks/\${id}\`),
}`},
}

// ── Données pour les outils DevSpace ─────────────────────
const MOCK_DOCKER_CONTAINERS=[
  {id:'abc123',name:'devenviron-frontend',image:'node:20-alpine',status:'running',cpu:12.4,mem:45.2,ports:'5173:5173',uptime:'3h 24m'},
  {id:'def456',name:'devenviron-backend', image:'php:8.2-fpm',  status:'running',cpu:8.1, mem:28.7,ports:'8000:8000',uptime:'3h 24m'},
  {id:'ghi789',name:'devenviron-db',      image:'postgres:16',  status:'running',cpu:3.2, mem:62.1,ports:'5432:5432',uptime:'5h 12m'},
  {id:'jkl012',name:'devenviron-nginx',   image:'nginx:1.25',   status:'stopped',cpu:0,   mem:0,   ports:'80:80',   uptime:'—'},
]
const MOCK_DB_TABLES=[
  {name:'users',    rows:24, size:'48 kB', lastUpdate:'il y a 2h'},
  {name:'projects', rows:8,  size:'24 kB', lastUpdate:'il y a 30min'},
  {name:'tasks',    rows:47, size:'96 kB', lastUpdate:'il y a 5min'},
  {name:'messages', rows:132,size:'188 kB',lastUpdate:'il y a 1min'},
  {name:'repos',    rows:6,  size:'16 kB', lastUpdate:'il y a 1h'},
  {name:'environments',rows:3,size:'8 kB', lastUpdate:'il y a 3h'},
]
const MOCK_TESTS=[
  {file:'auth.test.js',   tests:12,passed:12,failed:0, duration:'243ms',status:'pass'},
  {file:'api.test.js',    tests:8, passed:8, failed:0, duration:'187ms',status:'pass'},
  {file:'ui.test.js',     tests:24,passed:23,failed:1, duration:'412ms',status:'fail'},
  {file:'pipeline.test.js',tests:6,passed:6,failed:0, duration:'156ms',status:'pass'},
]

export function DevSpace(){
  const {user}=useAuth()
  const {showToast,saveEditorFile,getEditorFiles}=useApp()

  const {confirm,Dialog:ConfirmDialog}=useConfirm()
  // Tab actif
  const [activeTab,setActiveTab]=useState('terminal')

  // ══════════════════════════════════════════
  //  TERMINAL
  // ══════════════════════════════════════════
  const TCMDS=buildTCMDS(user)
  const [lines,setLines]=useState([
    {t:`DevEnviron Terminal v2.0.0 — Connecté en tant que ${user?.name||'dev-user'}`,c:'#00c8ff'},
    {t:`[${new Date().toLocaleTimeString('fr-FR')}] Environnement prêt. Tapez "help" pour voir les commandes.`,c:'#00ff88'},
    {t:'',c:'#fff'},
  ])
  const [termInput,setTermInput]=useState('')
  const [hist,setHist]         =useState([])
  const [hi,setHi]             =useState(-1)
  const termRef                =useRef(null)
  const termInputRef           =useRef(null)

  useEffect(()=>{ termRef.current?.scrollTo(0,termRef.current.scrollHeight) },[lines])

  const addLine=(t,c='#00ff88')=>setLines(l=>[...l,{t,c}])

  const run=useCallback(cmd=>{
    const s=cmd.trim(); if(!s) return
    addLine(`dev@devenviron:~$ ${s}`,'#00c8ff')
    setHist(h=>[s,...h.filter(x=>x!==s).slice(0,49)])
    setHi(-1)

    if(s==='clear'){ setLines([]); return }
    if(s.startsWith('echo ')){ addLine(s.slice(5)); return }
    if(s.startsWith('ping ')){
      const host=s.slice(5)||'localhost'
      addLine(`PING ${host} (127.0.0.1)\n64 bytes from 127.0.0.1: icmp_seq=1 time=${(0.02+Math.random()*0.08).toFixed(3)}ms\n64 bytes from 127.0.0.1: icmp_seq=2 time=${(0.02+Math.random()*0.08).toFixed(3)}ms\n--- ${host} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`)
      return
    }
    if(s.startsWith('cat ')){
      const fname=s.slice(4).trim()
      const fileContents={
        '.env':'APP_NAME="DevEnviron 4D"\nAPP_ENV=local\nAPP_KEY=base64:xxx\nDB_CONNECTION=pgsql\nDB_HOST=127.0.0.1\nDB_PORT=5432\nDB_DATABASE=devenviron',
        'package.json':'{\n  "name": "devenviron4d",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "test": "vitest"\n  }\n}',
        'README.md':'# DevEnviron 4D\n\nPlateforme de développement collaboratif.\n\n## Installation\n1. npm install\n2. npm run dev\n\n## Stack\n- React 18 + Vite\n- Laravel 11\n- PostgreSQL 16',
      }
      addLine(fileContents[fname]||`cat: ${fname}: No such file or directory`,'#ffce00')
      return
    }
    if(s.startsWith('kill ')){
      const pid=s.split(' ')[1]
      if(!/^\d+$/.test(pid)){ addLine(`kill: ${pid}: invalid PID`,'#ff2d78'); return }
      addLine(`[${pid}] Terminated`,'#ff2d78')
      return
    }
    if(s.startsWith('edit ')){
      const fname=s.slice(5).trim()
      setActiveTab('editor')
      addLine(`Ouverture de ${fname} dans l'éditeur...`,'#00c8ff')
      return
    }
    const fn=TCMDS[s.toLowerCase()]
    if(fn) addLine(fn())
    else   addLine(`bash: ${s}: commande introuvable. Tapez 'help' pour la liste.`,'#ff2d78')
  },[TCMDS])

  const onTermKey=e=>{
    if(e.key==='Enter'){ run(termInput); setTermInput('') }
    else if(e.key==='ArrowUp'){
      e.preventDefault()
      const i=Math.min(hi+1,hist.length-1); setHi(i); setTermInput(hist[i]||'')
    }
    else if(e.key==='ArrowDown'){
      e.preventDefault()
      const i=Math.max(hi-1,-1); setHi(i); setTermInput(i===-1?'':hist[i])
    }
    else if(e.key==='Tab'){
      e.preventDefault()
      const all=[...Object.keys(TCMDS),'clear','echo','ping','cat','kill','edit']
      const matches=all.filter(c=>c.startsWith(termInput))
      if(matches.length===1) setTermInput(matches[0])
      else if(matches.length>1) addLine(matches.join('  '),'#ffce00')
    }
    else if(e.key==='l'&&e.ctrlKey){
      e.preventDefault(); setLines([])
    }
  }

  // ══════════════════════════════════════════
  //  ÉDITEUR
  // ══════════════════════════════════════════
  const [editorCode,setEditorCode]        =useState(SNIPPETS['React Component'].code)
  const [editorLang,setEditorLang]        =useState('jsx')
  const [editorTheme,setEditorTheme]      =useState('dark')
  const [editorFile,setEditorFile]        =useState('MonComposant.jsx')
  const [showLineNums,setShowLineNums]    =useState(true)
  const [fontSize,setFontSize]            =useState(13)
  const [savedMsg,setSavedMsg]            =useState('')
  const [isSaving,setIsSaving]            =useState(false)
  const [activeSnippet,setActiveSnippet]  =useState('React Component')
  const [unsaved,setUnsaved]              =useState(false)
  const [findText,setFindText]            =useState('')
  const [showFind,setShowFind]            =useState(false)
  const editorRef                         =useRef(null)
  const editorTextareaRef                 =useRef(null)
  const theme                             =EDITOR_THEMES[editorTheme]
  const editorLines                       =editorCode.split('\n')

  const handleCodeChange=e=>{
    setEditorCode(e.target.value)
    setUnsaved(true)
    setSavedMsg('')
  }

  const handleSave=useCallback(async()=>{
    setIsSaving(true)
    try{
      if(saveEditorFile) await saveEditorFile({filename:editorFile,content:editorCode,lang:editorLang})
      setSavedMsg('✓ Sauvegardé')
      setUnsaved(false)
    }catch(e){
      // Fallback: sauvegarder en localStorage
      try{
        const files=JSON.parse(localStorage.getItem('dv4_editor_files')||'{}')
        files[editorFile]={content:editorCode,lang:editorLang,savedAt:new Date().toISOString()}
        localStorage.setItem('dv4_editor_files',JSON.stringify(files))
        setSavedMsg('✓ Sauvegardé (local)')
        setUnsaved(false)
      }catch{
        setSavedMsg('✗ Erreur de sauvegarde')
      }
    }finally{
      setIsSaving(false)
      setTimeout(()=>setSavedMsg(''),3000)
    }
  },[saveEditorFile,editorFile,editorCode,editorLang])

  const handleFormat=()=>{
    let formatted=editorCode
    // Normaliser les indentations
    formatted=formatted.replace(/\t/g,'  ')
    // Supprimer les espaces en fin de ligne
    formatted=formatted.replace(/[ \t]+$/gm,'')
    // Supprimer les lignes vides multiples
    formatted=formatted.replace(/\n{3,}/g,'\n\n')
    // Assurer une ligne vide en fin de fichier
    if(!formatted.endsWith('\n')) formatted+='\n'
    setEditorCode(formatted)
    setSavedMsg('✓ Formaté')
    setUnsaved(true)
    setTimeout(()=>setSavedMsg(''),2000)
  }

  const loadSnippet=useCallback(async name=>{
    if(unsaved){
      const ok=await confirm('Des modifications non sauvegardées seront perdues. Continuer ?')
      if(!ok) return
    }
    const s=SNIPPETS[name]; if(!s) return
    setActiveSnippet(name)
    setEditorCode(s.code)
    setEditorLang(s.lang)
    setEditorFile(s.file)
    setUnsaved(false)
    setSavedMsg('')
  },[unsaved,confirm,SNIPPETS])

  const handleEditorKey=e=>{
    if(e.key==='Tab'){
      e.preventDefault()
      const el=e.target
      const s=el.selectionStart, en=el.selectionEnd
      const next=editorCode.slice(0,s)+'  '+editorCode.slice(en)
      setEditorCode(next)
      setUnsaved(true)
      requestAnimationFrame(()=>{ el.selectionStart=el.selectionEnd=s+2 })
    }
    if((e.ctrlKey||e.metaKey)&&e.key==='s'){ e.preventDefault(); handleSave() }
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==='F'){ e.preventDefault(); handleFormat() }
    if((e.ctrlKey||e.metaKey)&&e.key==='f'){ e.preventDefault(); setShowFind(v=>!v) }
    // Auto-fermer les parenthèses/crochets/guillemets
    const pairs={'(':')','{':'}','[':']','"':'"',"'":"'","`":"`"}
    if(pairs[e.key]){
      e.preventDefault()
      const el=e.target
      const s=el.selectionStart, en=el.selectionEnd
      const sel=editorCode.slice(s,en)
      const next=editorCode.slice(0,s)+e.key+(sel||'')+pairs[e.key]+editorCode.slice(en)
      setEditorCode(next)
      setUnsaved(true)
      requestAnimationFrame(()=>{ el.selectionStart=el.selectionEnd=s+1+(sel?sel.length:0) })
    }
  }

  const copyEditorCode=async()=>{
    try{
      await navigator.clipboard.writeText(editorCode)
      showToast('Code copié !','success')
    }catch{ showToast('Impossible de copier','warning') }
  }

  // Compter les occurrences pour la recherche
  const findCount=findText
    ?editorCode.split(findText.toLowerCase()).length-1
    :0

  // ══════════════════════════════════════════
  //  DOCKER
  // ══════════════════════════════════════════
  const [containers,setContainers]=useState(MOCK_DOCKER_CONTAINERS)
  const [dockerBusy,setDockerBusy]=useState(false)

  const toggleContainer=async(id,currentStatus)=>{
    setDockerBusy(id)
    await new Promise(r=>setTimeout(r,800))
    setContainers(cs=>cs.map(c=>c.id===id
      ?{...c,status:currentStatus==='running'?'stopped':'running',
        cpu:currentStatus==='running'?0:Math.floor(Math.random()*20+5),
        mem:currentStatus==='running'?0:Math.floor(Math.random()*50+20)}
      :c))
    showToast(`Container ${currentStatus==='running'?'arrêté':'démarré'} !`,'success')
    setDockerBusy(null)
  }

  const restartContainer=async id=>{
    setDockerBusy(id)
    await new Promise(r=>setTimeout(r,1000))
    setContainers(cs=>cs.map(c=>c.id===id
      ?{...c,status:'running',cpu:Math.floor(Math.random()*15+5),mem:Math.floor(Math.random()*40+20),uptime:'0s'}
      :c))
    showToast('Container redémarré !','success')
    setDockerBusy(null)
  }

  // ══════════════════════════════════════════
  //  BASE DE DONNÉES
  // ══════════════════════════════════════════
  const [dbTables,setDbTables]   =useState(MOCK_DB_TABLES)
  const [dbQuery,setDbQuery]     =useState('SELECT * FROM users LIMIT 10;')
  const [dbResult,setDbResult]   =useState(null)
  const [dbRunning,setDbRunning] =useState(false)
  const [dbActiveTable,setDbActiveTable]=useState(null)

  const runQuery=async()=>{
    if(!dbQuery.trim()) return
    setDbRunning(true)
    setDbResult(null)
    await new Promise(r=>setTimeout(r,400+Math.random()*300))
    const q=dbQuery.toLowerCase().trim()
    let result
    if(q.startsWith('select')){
      const match=q.match(/from\s+(\w+)/i)
      const tbl=match?.[1]||'unknown'
      const known=['users','projects','tasks','messages','repos','environments']
      if(known.includes(tbl)){
        result={
          type:'select',
          columns:tbl==='users'?['id','name','email','role','created_at']:
                  tbl==='tasks'?['id','title','status','priority','assignee']:
                  tbl==='projects'?['id','name','status','progress','created_by']:
                  ['id','name','created_at'],
          rows:Array.from({length:Math.floor(Math.random()*5+2)},(_,i)=>({id:i+1,name:`Enregistrement ${i+1}`,...tbl==='users'?{email:`user${i+1}@test.com`,role:['admin','dev','client'][i%3],created_at:new Date(Date.now()-i*86400000).toLocaleDateString()}:{}})),
          duration:`${Math.floor(Math.random()*15+2)}ms`,
          count:Math.floor(Math.random()*20+5),
        }
      }else{
        result={type:'error',message:`ERROR: relation "${tbl}" does not exist`}
      }
    }else if(q.startsWith('insert')||q.startsWith('update')||q.startsWith('delete')){
      const affected=Math.floor(Math.random()*5+1)
      result={type:'dml',message:`${q.startsWith('insert')?'INSERT':'UPDATE'} ${affected}`,duration:`${Math.floor(Math.random()*10+1)}ms`}
    }else if(q.includes('create table')){
      result={type:'dml',message:'CREATE TABLE',duration:'8ms'}
    }else{
      result={type:'error',message:'ERREUR: syntaxe SQL non reconnue'}
    }
    setDbResult(result)
    setDbRunning(false)
  }

  // ══════════════════════════════════════════
  //  DEBUGGER
  // ══════════════════════════════════════════
  const [debugLogs,setDebugLogs]=useState([
    {level:'info', time:new Date().toLocaleTimeString('fr-FR'), msg:'Application démarrée', source:'main.jsx:12'},
    {level:'info', time:new Date().toLocaleTimeString('fr-FR'), msg:'Context AuthProvider monté', source:'AuthContext.jsx:45'},
    {level:'info', time:new Date().toLocaleTimeString('fr-FR'), msg:'GET /api/projects → 200 (12ms)', source:'AppContext.jsx:89'},
    {level:'warn', time:new Date().toLocaleTimeString('fr-FR'), msg:'useEffect dépendances manquantes: [load]', source:'OtherPages.jsx:54'},
    {level:'error',time:new Date().toLocaleTimeString('fr-FR'), msg:'Failed to fetch /api/stats — réseau', source:'AppContext.jsx:134'},
    {level:'info', time:new Date().toLocaleTimeString('fr-FR'), msg:'DevSpace monté — terminal prêt', source:'OtherPages.jsx:452'},
  ])
  const [debugFilter,setDebugFilter]=useState('all')
  const [breakpoints]=useState([
    {file:'AppContext.jsx',line:89,active:true},
    {file:'AuthContext.jsx',line:45,active:false},
    {file:'OtherPages.jsx',line:163,active:true},
  ])

  const addDebugLog=()=>{
    const levels=['info','warn','error']
    const sources=['AppContext.jsx','AuthContext.jsx','OtherPages.jsx','UI.jsx']
    const msgs=[
      'Requête API terminée','State mis à jour','Rendu composant','Token JWT vérifié',
      'Websocket connecté','Cache invalidé','Propriété undefined détectée',
    ]
    const l=levels[Math.floor(Math.random()*levels.length)]
    setDebugLogs(prev=>[...prev,{
      level:l,
      time:new Date().toLocaleTimeString('fr-FR'),
      msg:msgs[Math.floor(Math.random()*msgs.length)],
      source:`${sources[Math.floor(Math.random()*sources.length)]}:${Math.floor(Math.random()*200+10)}`
    }].slice(-100))
  }

  // ══════════════════════════════════════════
  //  TESTS
  // ══════════════════════════════════════════
  const [tests,setTests]         =useState(MOCK_TESTS)
  const [testRunning,setTestRunning]=useState(false)
  const [testProgress,setTestProgress]=useState(0)
  const [testSelected,setTestSelected]=useState(null)

  const runTests=async(specific=null)=>{
    setTestRunning(true)
    setTestProgress(0)
    const toRun=specific?tests.filter(t=>t.file===specific):tests
    for(let i=0;i<toRun.length;i++){
      setTestProgress(Math.round((i+1)/toRun.length*100))
      await new Promise(r=>setTimeout(r,300+Math.random()*400))
      setTests(prev=>prev.map(t=>t.file===toRun[i].file
        ?{...t,duration:`${Math.floor(Math.random()*200+100)}ms`,
          status:Math.random()>0.15?'pass':'fail',
          failed:Math.random()>0.15?0:1}
        :t))
    }
    setTestRunning(false)
    showToast('Tests terminés !','success')
  }

  const totalTests=tests.reduce((a,t)=>a+t.tests,0)
  const totalPassed=tests.reduce((a,t)=>a+t.passed,0)
  const totalFailed=tests.reduce((a,t)=>a+t.failed,0)

  // ══════════════════════════════════════════
  //  PROFILER
  // ══════════════════════════════════════════
  const [perfData,setPerfData]=useState({
    lcp:1240,fid:12,cls:0.04,ttfb:180,fcp:890,tti:2100,
    memory:{used:45.2,total:128,heap:38.7},
    api:[
      {endpoint:'/api/projects',  avg:18,min:8, max:45, calls:124},
      {endpoint:'/api/tasks',     avg:12,min:5, max:32, calls:89},
      {endpoint:'/api/auth/me',   avg:6, min:3, max:18, calls:312},
      {endpoint:'/api/users',     avg:24,min:12,max:67, calls:43},
    ]
  })
  const [perfRefreshing,setPerfRefreshing]=useState(false)

  const refreshPerf=async()=>{
    setPerfRefreshing(true)
    await new Promise(r=>setTimeout(r,600))
    setPerfData(p=>({
      lcp:Math.floor(800+Math.random()*1200),
      fid:Math.floor(5+Math.random()*30),
      cls:parseFloat((Math.random()*0.15).toFixed(3)),
      ttfb:Math.floor(80+Math.random()*300),
      fcp:Math.floor(400+Math.random()*800),
      tti:Math.floor(1000+Math.random()*3000),
      memory:{used:parseFloat((30+Math.random()*40).toFixed(1)),total:128,heap:parseFloat((25+Math.random()*35).toFixed(1))},
      api:p.api.map(a=>({...a,avg:Math.floor(a.avg*0.8+Math.random()*a.avg*0.4),calls:a.calls+Math.floor(Math.random()*10)}))
    }))
    setPerfRefreshing(false)
    showToast('Métriques actualisées','success')
  }

  // ══════════════════════════════════════════
  //  CONFIG
  // ══════════════════════════════════════════
  const [config,setConfig]=useState(()=>{
    try{ return JSON.parse(localStorage.getItem('dv4_devspace_config')||'{}') }catch{ return {} }
  })
  const [configDef]=useState({
    auto_save:      {label:'Sauvegarde automatique',   desc:'Sauvegarde l\'éditeur toutes les 30s',    type:'bool',  default:true},
    show_line_nums: {label:'Numéros de ligne',          desc:'Affiche les numéros dans l\'éditeur',      type:'bool',  default:true},
    font_size:      {label:'Taille de police',           desc:'Taille de police de l\'éditeur',          type:'number',default:13,min:10,max:20},
    tab_size:       {label:'Taille de tabulation',       desc:'Nombre d\'espaces par tab',                type:'number',default:2,min:1,max:8},
    word_wrap:      {label:'Retour à la ligne',          desc:'Plie les longues lignes dans l\'éditeur',  type:'bool',  default:true},
    terminal_rows:  {label:'Hauteur terminal (lignes)',  desc:'Nombre max de lignes visibles',           type:'number',default:20,min:10,max:50},
    theme:          {label:'Thème éditeur',             desc:'Thème de couleurs de l\'éditeur',          type:'select',default:'dark',options:Object.keys(EDITOR_THEMES)},
    minimap:        {label:'Minimap',                   desc:'Affiche une vue miniature du code',        type:'bool',  default:false},
  })
  const getConfig=k=>config[k]??configDef[k]?.default
  const setConfigKey=(k,v)=>{
    const next={...config,[k]:v}
    setConfig(next)
    localStorage.setItem('dv4_devspace_config',JSON.stringify(next))
    // Appliquer immédiatement les configs qui concernent l'éditeur
    if(k==='font_size')    setFontSize(v)
    if(k==='show_line_nums')setShowLineNums(v)
    if(k==='theme')        setEditorTheme(v)
  }
  const resetConfig=()=>{
    localStorage.removeItem('dv4_devspace_config')
    setConfig({})
    setFontSize(13); setShowLineNums(true); setEditorTheme('dark')
    showToast('Configuration réinitialisée','success')
  }

  // Auto-save si activé
  useEffect(()=>{
    if(!getConfig('auto_save')||!unsaved) return
    const t=setTimeout(()=>handleSave(),30000)
    return ()=>clearTimeout(t)
  },[unsaved,config])

  // ══════════════════════════════════════════
  //  OUTILS SIDEBAR
  // ══════════════════════════════════════════
  const TOOLS=[
    {id:'terminal',icon:<Terminal size={20}/>,    label:'Terminal'},
    {id:'editor',  icon:<FileCode size={20}/>,    label:'Éditeur'},
    {id:'docker',  icon:<Package size={20}/>,     label:'Docker'},
    {id:'db',      icon:<Database size={20}/>,    label:'Base données'},
    {id:'debug',   icon:<Bug size={20}/>,         label:'Debugger'},
    {id:'test',    icon:<TestTube size={20}/>,    label:'Tests'},
    {id:'perf',    icon:<Gauge size={20}/>,       label:'Profiler'},
    {id:'config',  icon:<Wrench size={20}/>,      label:'Config'},
  ]

  return(
    <div>
      {ConfirmDialog}
      <div style={{marginBottom:24}}>
        {PT('ESPACE DÉVELOPPEUR')}
        <p style={{color:C.t2,fontSize:13,marginTop:4}}>Terminal, éditeur, Docker, base de données et outils de développement</p>
      </div>

      {/* ── Grille outils ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(105px,1fr))',gap:10,marginBottom:20}}>
        {TOOLS.map(({id,icon,label})=>(
          <motion.div key={id} whileHover={{scale:1.04,y:-2}} onClick={()=>setActiveTab(id)}
            style={{...S.panel({padding:'14px 10px',textAlign:'center',cursor:'pointer',
              border:`1px solid ${activeTab===id?C.cyan:C.border}`,
              background:activeTab===id?'rgba(0,200,255,0.06)':undefined,
              transition:'all 0.15s'})}}>
            <div style={{color:activeTab===id?C.cyan:C.t3,marginBottom:7,display:'flex',justifyContent:'center'}}>{icon}</div>
            <p style={{fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:activeTab===id?C.cyan:C.t2}}>{label}</p>
            {activeTab===id&&<div style={{width:20,height:2,borderRadius:1,background:C.cyan,margin:'5px auto 0'}}/>}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════════════════════════════════════
            TERMINAL
        ══════════════════════════════════════════ */}
        {activeTab==='terminal'&&(
          <motion.div key="terminal" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <div style={{background:'#000',border:'1px solid rgba(0,255,136,0.2)',borderRadius:12,overflow:'hidden',boxShadow:'0 0 30px rgba(0,255,136,0.05)'}}>
              {/* Barre titre */}
              <div style={{display:'flex',alignItems:'center',gap:7,padding:'10px 14px',borderBottom:'1px solid rgba(0,255,136,0.1)',background:'#080808'}}>
                <div style={{width:12,height:12,borderRadius:'50%',background:'#ff5f57',cursor:'pointer'}} onClick={()=>setLines([])}/>
                <div style={{width:12,height:12,borderRadius:'50%',background:'#ffbd2e'}}/>
                <div style={{width:12,height:12,borderRadius:'50%',background:'#28c840'}}/>
                <span style={{flex:1,textAlign:'center',fontSize:11,color:'#555',fontFamily:'JetBrains Mono,monospace'}}>
                  terminal — {user?.name||'dev-user'}@devenviron — bash
                </span>
                <span style={{fontSize:10,color:'#555',fontFamily:'JetBrains Mono,monospace'}}>{hist.length} cmds</span>
                <button onClick={()=>setLines([])}
                  style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:10,fontFamily:'Orbitron,sans-serif',letterSpacing:'0.05em'}}>
                  ✕ CLEAR
                </button>
              </div>
              {/* Logs */}
              <div ref={termRef} onClick={()=>termInputRef.current?.focus()}
                style={{padding:14,fontFamily:'JetBrains Mono,monospace',fontSize:13,lineHeight:1.75,minHeight:300,maxHeight:440,overflowY:'auto',cursor:'text'}}>
                {lines.map((l,i)=>(
                  <div key={i} style={{color:l.c,whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{l.t}</div>
                ))}
              </div>
              {/* Ligne saisie */}
              <div style={{display:'flex',alignItems:'center',gap:9,padding:'10px 14px',borderTop:'1px solid rgba(0,255,136,0.1)',background:'#040404'}}>
                <span style={{color:'#00ff88',fontFamily:'JetBrains Mono,monospace',fontSize:13,flexShrink:0,userSelect:'none'}}>
                  {user?.name||'dev'}@devenviron:~$
                </span>
                <input ref={termInputRef} value={termInput}
                  onChange={e=>setTermInput(e.target.value)}
                  onKeyDown={onTermKey}
                  style={{flex:1,background:'transparent',border:'none',color:'#00ff88',fontFamily:'JetBrains Mono,monospace',fontSize:13,outline:'none',caretColor:'#00ff88'}}
                  placeholder="Tapez une commande... (Tab=complétion, ↑↓=historique, Ctrl+L=effacer)"
                  autoFocus/>
              </div>
            </div>
            {/* Raccourcis */}
            <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}>
              {['help','ls','git status','devenv status','devenv health','docker ps','npm test','top'].map(cmd=>(
                <button key={cmd} onClick={()=>{ run(cmd); termInputRef.current?.focus() }}
                  style={{padding:'4px 10px',borderRadius:6,fontSize:10,fontFamily:'JetBrains Mono,monospace',
                    background:'rgba(0,200,255,0.06)',border:'1px solid rgba(0,200,255,0.18)',color:C.t2,cursor:'pointer',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,200,255,0.12)';e.currentTarget.style.color=C.cyan}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,200,255,0.06)';e.currentTarget.style.color=C.t2}}>
                  {cmd}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            ÉDITEUR
        ══════════════════════════════════════════ */}
        {activeTab==='editor'&&(
          <motion.div key="editor" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            {/* Barre d'outils */}
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,flexWrap:'wrap'}}>
              {/* Snippets */}
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {Object.keys(SNIPPETS).map(name=>(
                  <button key={name} onClick={()=>loadSnippet(name)}
                    style={{padding:'5px 11px',borderRadius:7,fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,border:'none',cursor:'pointer',
                      background:activeSnippet===name?C.cyan:'rgba(0,200,255,0.08)',
                      color:activeSnippet===name?'#020408':C.t3,transition:'all 0.15s'}}>
                    {name}
                  </button>
                ))}
              </div>
              <div style={{flex:1}}/>
              {/* Recherche */}
              {showFind&&(
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <input value={findText} onChange={e=>setFindText(e.target.value)}
                    placeholder="Rechercher..."
                    style={{...S.input,height:28,padding:'0 8px',fontSize:11,width:160}}/>
                  {findText&&<span style={{fontSize:10,color:C.t3,whiteSpace:'nowrap'}}>{findCount} résultat{findCount>1?'s':''}</span>}
                </div>
              )}
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
            </div>

            {/* Éditeur principal */}
            <div style={{borderRadius:12,overflow:'hidden',border:`1px solid ${theme.border}`,boxShadow:'0 0 30px rgba(0,0,0,0.5)'}}>
              {/* Barre onglet */}
              <div style={{background:'#1a1a2e',borderBottom:`1px solid ${theme.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px'}}>
                <div style={{display:'flex',alignItems:'center'}}>
                  <div style={{padding:'8px 16px',borderBottom:`2px solid ${C.cyan}`,fontSize:12,color:C.t1,fontFamily:'JetBrains Mono,monospace',
                    cursor:'pointer',background:'rgba(0,200,255,0.08)',display:'flex',alignItems:'center',gap:6}}>
                    📄 {editorFile}
                    {unsaved&&<span style={{width:6,height:6,borderRadius:'50%',background:C.quantum,display:'inline-block'}}/>}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {savedMsg&&(
                    <span style={{fontSize:11,color:savedMsg.includes('✗')?C.nova:C.neon,fontFamily:'JetBrains Mono,monospace'}}>
                      {savedMsg}
                    </span>
                  )}
                  <button onClick={()=>setShowLineNums(v=>!v)} style={{...S.btnGhost,padding:'4px 10px',fontSize:10,height:26}}>
                    {showLineNums?'Masquer #':'Lignes'}
                  </button>
                  <button onClick={()=>setShowFind(v=>!v)} style={{...S.btnGhost,padding:'4px 10px',fontSize:10,height:26}}>
                    🔍
                  </button>
                  <button onClick={copyEditorCode} style={{...S.btnGhost,padding:'4px 10px',fontSize:10,height:26,display:'flex',alignItems:'center',gap:4}}>
                    <Copy size={10}/> Copier
                  </button>
                  <button onClick={handleFormat} style={{...S.btnGhost,padding:'4px 10px',fontSize:10,height:26}}>
                    Formater
                  </button>
                  <button onClick={handleSave} disabled={isSaving}
                    style={{padding:'4px 12px',borderRadius:6,fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                      background:isSaving?'rgba(0,200,255,0.3)':C.cyan,color:'#020408',border:'none',cursor:isSaving?'not-allowed':'pointer',height:26,
                      display:'flex',alignItems:'center',gap:4}}>
                    {isSaving?<><motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.6,ease:'linear'}}
                      style={{display:'inline-block',width:10,height:10,borderRadius:'50%',border:'2px solid #020408',borderTopColor:'transparent'}}/> </>:null}
                    Sauvegarder
                  </button>
                </div>
              </div>

              {/* Zone code */}
              <div style={{display:'flex',background:theme.bg,minHeight:420,maxHeight:560,overflow:'auto'}} ref={editorRef}>
                {/* Numéros de ligne */}
                {showLineNums&&(
                  <div style={{padding:'14px 8px 14px 14px',background:theme.bg,borderRight:`1px solid ${theme.border}`,
                    userSelect:'none',flexShrink:0,textAlign:'right',minWidth:48}}>
                    {editorLines.map((_,i)=>(
                      <div key={i} style={{color:theme.lineNum,fontFamily:'JetBrains Mono,monospace',
                        fontSize:fontSize-1,lineHeight:1.75,height:`${fontSize*1.75}px`}}>
                        {i+1}
                      </div>
                    ))}
                  </div>
                )}
                {/* Textarea + coloration */}
                <div style={{flex:1,position:'relative',overflow:'hidden'}}>
                  <pre style={{position:'absolute',inset:0,padding:'14px',fontFamily:'JetBrains Mono,monospace',fontSize,
                    lineHeight:1.75,color:theme.text,margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word',
                    pointerEvents:'none',overflow:'hidden'}}
                    dangerouslySetInnerHTML={{__html:highlight(editorCode,editorLang)+'<br/>'}}/>
                  <textarea value={editorCode} onChange={handleCodeChange} onKeyDown={handleEditorKey}
                    ref={editorTextareaRef} spellCheck={false}
                    style={{position:'absolute',inset:0,width:'100%',height:'100%',padding:'14px',
                      fontFamily:'JetBrains Mono,monospace',fontSize,lineHeight:1.75,color:'transparent',
                      background:'transparent',border:'none',outline:'none',resize:'none',caretColor:theme.text,zIndex:2}}/>
                </div>
              </div>

              {/* Barre de statut */}
              <div style={{background:'#0f3460',padding:'4px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:11,fontFamily:'JetBrains Mono,monospace'}}>
                <div style={{display:'flex',gap:16}}>
                  <span style={{color:'#8ab4f8'}}>🔵 {editorLang.toUpperCase()}</span>
                  <span style={{color:'#8ab4f8'}}>{editorLines.length} lignes</span>
                  <span style={{color:'#8ab4f8'}}>{editorCode.length} chars</span>
                  {unsaved&&<span style={{color:C.quantum}}>● Non sauvegardé</span>}
                </div>
                <div style={{display:'flex',gap:12,color:'#8ab4f8'}}>
                  <span>UTF-8</span>
                  <span>Tab: {getConfig('tab_size')}</span>
                  <span>DevEnviron Editor</span>
                </div>
              </div>
            </div>

            {/* Raccourcis */}
            <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:10,fontSize:11,color:C.t3,fontFamily:'JetBrains Mono,monospace'}}>
              {[['Ctrl+S','Sauvegarder'],['Ctrl+Shift+F','Formater'],['Ctrl+F','Rechercher'],['Tab','Indenter'],['(/{/[','Auto-fermer']].map(([k,l])=>(
                <span key={k}>
                  <span style={{padding:'1px 6px',borderRadius:4,background:'rgba(255,255,255,0.08)',color:C.t2}}>{k}</span> {l}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            DOCKER
        ══════════════════════════════════════════ */}
        {activeTab==='docker'&&(
          <motion.div key="docker" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,margin:0}}>🐳 Containers Docker</h3>
              <div style={{display:'flex',gap:8}}>
                <span style={{fontSize:12,color:C.t3}}>
                  {containers.filter(c=>c.status==='running').length}/{containers.length} actifs
                </span>
                <button onClick={()=>showToast('Refresh containers...','info')}
                  style={{...S.btnGhost,padding:'6px 10px'}}><RefreshCw size={13}/></button>
              </div>
            </div>
            <div style={{display:'grid',gap:12}}>
              {containers.map(c=>{
                const isBusy=dockerBusy===c.id
                const isRunning=c.status==='running'
                return(
                  <motion.div key={c.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
                    style={{...S.panel({padding:16,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'})}}>
                    {/* Statut */}
                    <div style={{width:10,height:10,borderRadius:'50%',flexShrink:0,
                      background:isRunning?C.neon:C.t3,
                      boxShadow:isRunning?`0 0 8px ${C.neon}`:'none'}}>
                      {isRunning&&<motion.div style={{width:'100%',height:'100%',borderRadius:'50%',background:C.neon}}
                        animate={{opacity:[1,0.3,1]}} transition={{duration:2,repeat:Infinity}}/>}
                    </div>
                    {/* Infos */}
                    <div style={{flex:1,minWidth:120}}>
                      <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:12,color:C.t1}}>{c.name}</p>
                      <p style={{fontSize:10,color:C.t3,fontFamily:'JetBrains Mono,monospace'}}>{c.image}</p>
                    </div>
                    {/* Ports */}
                    <span style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',color:C.cyan,
                      padding:'2px 8px',borderRadius:5,background:'rgba(0,200,255,0.08)',border:'1px solid rgba(0,200,255,0.2)'}}>
                      {c.ports}
                    </span>
                    {/* Métriques */}
                    {isRunning&&(
                      <div style={{display:'flex',gap:12,fontSize:10,color:C.t2}}>
                        <span>CPU <b style={{color:c.cpu>70?C.nova:C.neon}}>{c.cpu}%</b></span>
                        <span>MEM <b style={{color:c.mem>80?C.nova:C.cyan}}>{c.mem}%</b></span>
                        <span style={{color:C.t3}}>⏱ {c.uptime}</span>
                      </div>
                    )}
                    {/* Actions */}
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>toggleContainer(c.id,c.status)} disabled={!!isBusy}
                        style={{padding:'6px 12px',borderRadius:7,border:'none',fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                          cursor:isBusy?'not-allowed':'pointer',
                          background:isRunning?'rgba(255,45,120,0.15)':'rgba(0,255,136,0.15)',
                          color:isRunning?C.nova:C.neon,
                          transition:'all 0.15s'}}>
                        {isBusy
                          ?<motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.6,ease:'linear'}}
                              style={{display:'inline-block',width:10,height:10,borderRadius:'50%',border:`2px solid currentColor`,borderTopColor:'transparent'}}/>
                          :(isRunning?<><Square size={9}/> Stop</>:<><Play size={9}/> Start</>)}
                      </button>
                      {isRunning&&(
                        <button onClick={()=>restartContainer(c.id)} disabled={!!isBusy}
                          style={{...S.btnGhost,padding:'6px 10px',fontSize:10}}>
                          <RefreshCw size={10}/>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            BASE DE DONNÉES
        ══════════════════════════════════════════ */}
        {activeTab==='db'&&(
          <motion.div key="db" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:16,minHeight:500}}>
              {/* Tables */}
              <div style={{...S.panel({padding:0,overflow:'hidden'})}}>
                <div style={{padding:'11px 14px',borderBottom:`1px solid ${C.border}`}}>
                  <p style={{...S.label,margin:0}}>🗄️ TABLES POSTGRESQL</p>
                </div>
                <div style={{padding:8}}>
                  {dbTables.map(t=>(
                    <button key={t.name} onClick={()=>{
                      setDbActiveTable(t.name)
                      setDbQuery(`SELECT * FROM ${t.name} LIMIT 10;`)
                    }}
                      style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',
                        padding:'9px 10px',borderRadius:8,marginBottom:3,border:'none',textAlign:'left',cursor:'pointer',
                        background:dbActiveTable===t.name?'rgba(0,200,255,0.1)':'none',
                        transition:'all 0.15s'}}>
                      <div>
                        <p style={{fontSize:12,fontFamily:'JetBrains Mono,monospace',color:dbActiveTable===t.name?C.cyan:C.t1}}>{t.name}</p>
                        <p style={{fontSize:9,color:C.t3}}>{t.rows} enreg. · {t.size}</p>
                      </div>
                      <span style={{fontSize:9,color:C.t3}}>{t.lastUpdate}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Query editor + résultats */}
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{...S.panel({padding:0,overflow:'hidden'})}}>
                  <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <p style={{...S.label,margin:0}}>📝 REQUÊTE SQL</p>
                    <div style={{display:'flex',gap:7}}>
                      <button onClick={()=>setDbQuery('SELECT * FROM users LIMIT 10;')}
                        style={{...S.btnGhost,fontSize:10,padding:'4px 8px'}}>Exemple</button>
                      <button onClick={runQuery} disabled={dbRunning}
                        style={{padding:'6px 14px',borderRadius:7,border:'none',fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                          background:dbRunning?'rgba(0,200,255,0.3)':C.cyan,color:'#020408',cursor:dbRunning?'not-allowed':'pointer',
                          display:'flex',alignItems:'center',gap:5}}>
                        {dbRunning
                          ?<><motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.6,ease:'linear'}}
                              style={{display:'inline-block',width:10,height:10,borderRadius:'50%',border:'2px solid #020408',borderTopColor:'transparent'}}/> Exécution...</>
                          :<><Play size={11}/> Exécuter (F5)</>}
                      </button>
                    </div>
                  </div>
                  <textarea value={dbQuery} onChange={e=>setDbQuery(e.target.value)}
                    onKeyDown={e=>e.key==='F5'&&runQuery()}
                    style={{width:'100%',height:90,padding:14,background:'#000',border:'none',outline:'none',
                      color:C.neon,fontFamily:'JetBrains Mono,monospace',fontSize:13,resize:'none',lineHeight:1.6,boxSizing:'border-box'}}/>
                </div>
                {/* Résultats */}
                {dbResult&&(
                  <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                    style={{...S.panel({padding:0,overflow:'hidden'})}}>
                    <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:10}}>
                      <p style={{...S.label,margin:0}}>
                        {dbResult.type==='error'?'❌ ERREUR':dbResult.type==='dml'?'✓ RÉSULTAT':'📊 RÉSULTATS'}
                      </p>
                      {dbResult.duration&&<span style={{fontSize:10,color:C.t3,fontFamily:'JetBrains Mono,monospace'}}>{dbResult.duration}</span>}
                    </div>
                    <div style={{padding:14,maxHeight:250,overflowY:'auto'}}>
                      {dbResult.type==='error'&&(
                        <p style={{color:C.nova,fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{dbResult.message}</p>
                      )}
                      {dbResult.type==='dml'&&(
                        <p style={{color:C.neon,fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{dbResult.message} — Modifié avec succès</p>
                      )}
                      {dbResult.type==='select'&&(
                        <>
                          <p style={{fontSize:11,color:C.t3,marginBottom:8}}>{dbResult.count} lignes trouvées</p>
                          <div style={{overflowX:'auto'}}>
                            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,fontFamily:'JetBrains Mono,monospace'}}>
                              <thead>
                                <tr>
                                  {dbResult.columns.map(col=>(
                                    <th key={col} style={{padding:'6px 10px',textAlign:'left',borderBottom:`1px solid ${C.border}`,
                                      fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t3,whiteSpace:'nowrap'}}>
                                      {col.toUpperCase()}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {dbResult.rows.map((row,i)=>(
                                  <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                                    {dbResult.columns.map(col=>(
                                      <td key={col} style={{padding:'7px 10px',color:C.t2,whiteSpace:'nowrap',maxWidth:150,overflow:'hidden',textOverflow:'ellipsis'}}>
                                        {String(row[col]??'NULL')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            DEBUGGER
        ══════════════════════════════════════════ */}
        {activeTab==='debug'&&(
          <motion.div key="debug" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 260px',gap:16}}>
              {/* Console */}
              <div style={{...S.panel({padding:0,overflow:'hidden'})}}>
                <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                  <p style={{...S.label,margin:0,flex:1}}>🐛 CONSOLE</p>
                  {['all','info','warn','error'].map(f=>(
                    <button key={f} onClick={()=>setDebugFilter(f)}
                      style={{padding:'3px 9px',borderRadius:5,border:`1px solid ${debugFilter===f?C.cyan:C.border}`,
                        background:debugFilter===f?'rgba(0,200,255,0.1)':'none',
                        color:debugFilter===f?C.cyan:C.t3,fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,cursor:'pointer'}}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                  <button onClick={addDebugLog} style={{...S.btnGhost,padding:'4px 8px',fontSize:10}}>+ Log</button>
                  <button onClick={()=>setDebugLogs([])} style={{...S.btnGhost,padding:'4px 8px',fontSize:10}}><Trash2 size={11}/></button>
                </div>
                <div style={{maxHeight:420,overflowY:'auto',fontFamily:'JetBrains Mono,monospace',fontSize:12}}>
                  {debugLogs
                    .filter(l=>debugFilter==='all'||l.level===debugFilter)
                    .map((l,i)=>{
                      const colors={info:C.cyan,warn:C.quantum,error:C.nova}
                      const icons={info:'ℹ',warn:'⚠',error:'✗'}
                      return(
                        <div key={i} style={{display:'flex',gap:10,padding:'7px 14px',borderBottom:`1px solid ${C.border}`,
                          background:l.level==='error'?'rgba(255,45,120,0.04)':l.level==='warn'?'rgba(255,206,0,0.04)':'transparent'}}>
                          <span style={{color:colors[l.level],flexShrink:0,fontSize:13}}>{icons[l.level]}</span>
                          <span style={{color:'#555',fontSize:10,flexShrink:0,marginTop:1}}>{l.time}</span>
                          <span style={{color:C.t2,flex:1,wordBreak:'break-all'}}>{l.msg}</span>
                          <span style={{color:'#555',fontSize:10,flexShrink:0,marginTop:1}}>{l.source}</span>
                        </div>
                      )
                    })}
                  {debugLogs.filter(l=>debugFilter==='all'||l.level===debugFilter).length===0&&(
                    <div style={{padding:20,textAlign:'center',color:C.t3,fontSize:12}}>Aucun log {debugFilter!=='all'?`de type ${debugFilter}`:''}</div>
                  )}
                </div>
              </div>
              {/* Breakpoints */}
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{...S.panel({padding:14})}}>
                  <p style={{...S.label,marginBottom:12}}>📍 BREAKPOINTS</p>
                  {breakpoints.map((bp,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:`1px solid ${C.border}`}}>
                      <div style={{width:10,height:10,borderRadius:'50%',flexShrink:0,
                        background:bp.active?C.nova:'rgba(255,45,120,0.2)',border:`1px solid ${C.nova}`}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:11,color:C.t1,fontFamily:'JetBrains Mono,monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bp.file}</p>
                        <p style={{fontSize:10,color:C.t3}}>Ligne {bp.line}</p>
                      </div>
                      <span style={{fontSize:9,color:bp.active?C.neon:C.t3}}>{bp.active?'ON':'OFF'}</span>
                    </div>
                  ))}
                </div>
                <div style={{...S.panel({padding:14})}}>
                  <p style={{...S.label,marginBottom:12}}>📈 STATS CONSOLE</p>
                  {[
                    {l:'Infos',v:debugLogs.filter(l=>l.level==='info').length,c:C.cyan},
                    {l:'Avertissements',v:debugLogs.filter(l=>l.level==='warn').length,c:C.quantum},
                    {l:'Erreurs',v:debugLogs.filter(l=>l.level==='error').length,c:C.nova},
                  ].map(s=>(
                    <div key={s.l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:12}}>
                      <span style={{color:C.t2}}>{s.l}</span>
                      <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,color:s.c}}>{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            TESTS
        ══════════════════════════════════════════ */}
        {activeTab==='test'&&(
          <motion.div key="test" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            {/* Résumé */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
              {[
                {l:'Total',v:totalTests,c:C.cyan,icon:'📋'},
                {l:'Passés',v:totalPassed,c:C.neon,icon:'✅'},
                {l:'Échecs',v:totalFailed,c:totalFailed>0?C.nova:C.t3,icon:'❌'},
              ].map(s=>(
                <div key={s.l} style={{...S.panel({padding:16,textAlign:'center'})}}>
                  <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
                  <div style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:28,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:9,fontFamily:'Orbitron,sans-serif',color:C.t3}}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Barre progression */}
            {testRunning&&(
              <div style={{...S.panel({padding:14,marginBottom:16})}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.t3,marginBottom:6}}>
                  <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700}}>Tests en cours...</span>
                  <span style={{fontFamily:'JetBrains Mono,monospace'}}>{testProgress}%</span>
                </div>
                <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:10,overflow:'hidden'}}>
                  <motion.div style={{height:'100%',borderRadius:10,background:`linear-gradient(90deg,${C.cyan},${C.neon})`}}
                    animate={{width:`${testProgress}%`}} transition={{duration:0.3}}/>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
              <button onClick={()=>runTests()} disabled={testRunning}
                style={{...S.btnCyan,display:'flex',alignItems:'center',gap:6,opacity:testRunning?0.5:1,cursor:testRunning?'not-allowed':'pointer'}}>
                <Play size={13}/> Tous les tests
              </button>
              <button onClick={()=>setTests(MOCK_TESTS)} disabled={testRunning}
                style={{...S.btnGhost,display:'flex',alignItems:'center',gap:6}}>
                <RefreshCw size={13}/> Reset
              </button>
            </div>

            {/* Fichiers de tests */}
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {tests.map(t=>(
                <motion.div key={t.file} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
                  style={{...S.panel({padding:16})}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                    <div style={{width:28,height:28,borderRadius:7,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
                      background:t.status==='pass'?'rgba(0,255,136,0.1)':'rgba(255,45,120,0.1)',
                      border:`1px solid ${t.status==='pass'?'rgba(0,255,136,0.3)':'rgba(255,45,120,0.3)'}`}}>
                      {t.status==='pass'
                        ?<CheckCircle size={14} style={{color:C.neon}}/>
                        :<XCircle size={14} style={{color:C.nova}}/>}
                    </div>
                    <div style={{flex:1,minWidth:120}}>
                      <p style={{fontSize:12,fontFamily:'JetBrains Mono,monospace',color:C.t1}}>{t.file}</p>
                      <p style={{fontSize:10,color:C.t3}}>{t.tests} tests · {t.duration}</p>
                    </div>
                    <div style={{display:'flex',gap:10,fontSize:11}}>
                      <span style={{color:C.neon}}>{t.passed} ✓</span>
                      {t.failed>0&&<span style={{color:C.nova}}>{t.failed} ✗</span>}
                    </div>
                    <button onClick={()=>runTests(t.file)} disabled={testRunning}
                      style={{...S.btnGhost,padding:'5px 10px',fontSize:10,display:'flex',alignItems:'center',gap:4}}>
                      <Play size={10}/> Relancer
                    </button>
                  </div>
                  {t.failed>0&&(
                    <div style={{marginTop:10,padding:'8px 12px',background:'rgba(255,45,120,0.06)',borderRadius:7,
                      border:'1px solid rgba(255,45,120,0.2)',fontSize:11,color:C.nova,fontFamily:'JetBrains Mono,monospace'}}>
                      ✗ Échec: expect(wrapper.text()).toContain("DevSpace") — reçu "" — {t.file}:142
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            PROFILER
        ══════════════════════════════════════════ */}
        {activeTab==='perf'&&(
          <motion.div key="perf" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,margin:0}}>📊 Core Web Vitals</h3>
              <button onClick={refreshPerf} disabled={perfRefreshing}
                style={{...S.btnCyan,display:'flex',alignItems:'center',gap:6,opacity:perfRefreshing?0.5:1}}>
                <RefreshCw size={12} style={perfRefreshing?{animation:'spin 0.6s linear infinite'}:{}}/> Actualiser
              </button>
            </div>

            {/* Vitals */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:12,marginBottom:20}}>
              {[
                {k:'LCP',v:`${perfData.lcp}ms`, label:'Largest Contentful Paint', good:2500,bad:4000,raw:perfData.lcp},
                {k:'FID',v:`${perfData.fid}ms`,  label:'First Input Delay',        good:100, bad:300, raw:perfData.fid},
                {k:'CLS',v:perfData.cls.toFixed(3),label:'Cumulative Layout Shift', good:0.1, bad:0.25,raw:perfData.cls*1000},
                {k:'TTFB',v:`${perfData.ttfb}ms`,label:'Time to First Byte',       good:800, bad:1800,raw:perfData.ttfb},
                {k:'FCP',v:`${perfData.fcp}ms`,  label:'First Contentful Paint',   good:1800,bad:3000,raw:perfData.fcp},
                {k:'TTI',v:`${perfData.tti}ms`,  label:'Time to Interactive',      good:3800,bad:7300,raw:perfData.tti},
              ].map(m=>{
                const color=m.raw<m.good?C.neon:m.raw<m.bad?C.quantum:C.nova
                return(
                  <div key={m.k} style={{...S.panel({padding:14,textAlign:'center'})}}>
                    <p style={{fontSize:9,fontFamily:'Orbitron,sans-serif',fontWeight:700,color:C.t3,marginBottom:6}}>{m.k}</p>
                    <p style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:20,color,marginBottom:4}}>{m.v}</p>
                    <p style={{fontSize:9,color:C.t3,lineHeight:1.3}}>{m.label}</p>
                    <div style={{marginTop:6,fontSize:9,color,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>
                      {m.raw<m.good?'✓ BON':m.raw<m.bad?'⚠ MOYEN':'✗ MAUVAIS'}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mémoire */}
            <div style={{...S.panel({padding:18,marginBottom:16})}}>
              <PanelHeader icon={BarChart3} title="Mémoire" color={C.plasma}/>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:10}}>
                {[
                  {l:'Utilisée',v:perfData.memory.used,total:perfData.memory.total,c:C.cyan},
                  {l:'Heap JS',  v:perfData.memory.heap,total:perfData.memory.total,c:C.plasma},
                  {l:'Libre',    v:perfData.memory.total-perfData.memory.used,total:perfData.memory.total,c:C.neon},
                ].map(m=>(
                  <div key={m.l}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:5}}>
                      <span style={{color:C.t2}}>{m.l}</span>
                      <span style={{color:m.c,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{m.v.toFixed(1)} MB</span>
                    </div>
                    <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:10,overflow:'hidden'}}>
                      <motion.div style={{height:'100%',background:m.c,borderRadius:10}}
                        initial={{width:0}} animate={{width:`${(m.v/m.total)*100}%`}} transition={{duration:1}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Performance */}
            <div style={{...S.panel({padding:18})}}>
              <PanelHeader icon={Server} title="Performance API" color={C.solar}/>
              <div style={{marginTop:12}}>
                {perfData.api.map(a=>{
                  const color=a.avg<20?C.neon:a.avg<50?C.quantum:C.nova
                  return(
                    <div key={a.endpoint} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:`1px solid ${C.border}`}}>
                      <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:C.t2,flex:1}}>{a.endpoint}</span>
                      <span style={{fontSize:10,color:C.t3}}>{a.calls} appels</span>
                      <span style={{fontSize:10,color:C.t3}}>min:{a.min}ms</span>
                      <span style={{fontSize:10,color:C.t3}}>max:{a.max}ms</span>
                      <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:12,color,minWidth:55,textAlign:'right'}}>∅ {a.avg}ms</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            CONFIG
        ══════════════════════════════════════════ */}
        {activeTab==='config'&&(
          <motion.div key="config" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:15,color:C.t1,margin:0}}>⚙️ Configuration DevSpace</h3>
              <button onClick={resetConfig} style={{...S.btnGhost,fontSize:11,display:'flex',alignItems:'center',gap:5,color:C.quantum}}>
                <RefreshCw size={11}/> Réinitialiser
              </button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {Object.entries(configDef).map(([k,def])=>(
                <div key={k} style={{...S.panel({padding:16})}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,color:C.t1,fontFamily:'Rajdhani,sans-serif',fontWeight:600}}>{def.label}</p>
                      <p style={{fontSize:11,color:C.t3,marginTop:2}}>{def.desc}</p>
                    </div>
                    <div style={{flexShrink:0}}>
                      {def.type==='bool'&&(
                        <button onClick={()=>setConfigKey(k,!getConfig(k))} type="button"
                          style={{width:42,height:22,borderRadius:11,position:'relative',
                            background:getConfig(k)?C.cyan:'rgba(255,255,255,0.08)',border:'none',cursor:'pointer',transition:'background 0.25s'}}>
                          <motion.div animate={{left:getConfig(k)?'22px':'2px'}} transition={{type:'spring',stiffness:500,damping:30}}
                            style={{position:'absolute',top:2,width:18,height:18,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
                        </button>
                      )}
                      {def.type==='number'&&(
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <button onClick={()=>setConfigKey(k,Math.max(def.min,getConfig(k)-1))}
                            style={{...S.btnGhost,padding:'3px 8px',fontSize:14,height:26}}>−</button>
                          <span style={{fontSize:12,color:C.t1,fontFamily:'JetBrains Mono,monospace',minWidth:24,textAlign:'center'}}>
                            {getConfig(k)}
                          </span>
                          <button onClick={()=>setConfigKey(k,Math.min(def.max,getConfig(k)+1))}
                            style={{...S.btnGhost,padding:'3px 8px',fontSize:14,height:26}}>+</button>
                        </div>
                      )}
                      {def.type==='select'&&(
                        <select value={getConfig(k)} onChange={e=>setConfigKey(k,e.target.value)}
                          style={{...S.input,width:'auto',padding:'4px 8px',fontSize:11,height:26,background:C.surface}}>
                          {def.options.map(o=><option key={o} value={o}>{o}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12,padding:'12px 14px',background:'rgba(0,200,255,0.04)',border:`1px solid ${C.border}`,borderRadius:10,fontSize:11,color:C.t3}}>
              💾 Les configurations sont sauvegardées automatiquement dans le navigateur (localStorage).
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

