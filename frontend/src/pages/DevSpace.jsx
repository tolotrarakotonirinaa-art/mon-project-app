import React,{useState,useEffect,useRef,useCallback} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {
  Database,Trash2,RefreshCw,Copy,Play,
  Terminal,FileCode,Package,Bug,TestTube,Gauge,Wrench,
  CheckCircle,XCircle,
} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {useAuth} from '../context/AuthContext.jsx'
import {C,S} from '../styles.js'
import {PT,useConfirm} from './shared/PageUtils.jsx'
import DevTerminal   from '../components/devspace/Terminal.jsx'
import DockerPanel   from '../components/devspace/DockerPanel.jsx'
import DbQueryPanel  from '../components/devspace/DbQueryPanel.jsx'
import ProfilerPanel from '../components/devspace/ProfilerPanel.jsx'
import {devspaceApi}  from '../services/devspaceApi.js'


// ════════════════════════════════════════════
//  PISTON API — Execute code tena miasa
// ════════════════════════════════════════════
const PISTON_URL = 'https://emkc.org/api/v2/piston'

const PISTON_LANG_MAP = {
  javascript: { language: 'javascript', version: '18.15.0' },
  jsx:        { language: 'javascript', version: '18.15.0' },
  python:     { language: 'python',     version: '3.10.0'  },
  php:        { language: 'php',        version: '8.2.3'   },
  bash:       { language: 'bash',       version: '5.2.0'   },
}

async function executeCode(lang, code) {
  const langCfg = PISTON_LANG_MAP[lang]
  if (!langCfg) return { stdout: '', stderr: `Langage "${lang}" non supporté pour l'exécution.`, code: 1 }
  try {
    const res = await fetch(`${PISTON_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: langCfg.language,
        version:  langCfg.version,
        files: [{ name: 'main', content: code }],
      }),
    })
    if (!res.ok) throw new Error(`Piston API error: ${res.status}`)
    const data = await res.json()
    return {
      stdout: data.run?.stdout || '',
      stderr: data.run?.stderr || '',
      code:   data.run?.code   ?? 0,
    }
  } catch(e) {
    return { stdout: '', stderr: 'Erreur Piston API: ' + e.message, code: 1 }
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

export function DevSpace(){
  const {user}=useAuth()
  const {showToast,saveEditorFile,getEditorFiles}=useApp()

  const {confirm,Dialog:ConfirmDialog}=useConfirm()
  // Tab actif
  const [activeTab,setActiveTab]=useState('terminal')

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
  const [running,setRunning]               =useState(false)
  const [runOutput,setRunOutput]           =useState(null)
  const [showOutput,setShowOutput]         =useState(false)
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


  const handleRun=useCallback(async()=>{
    if(!editorCode.trim()){ showToast('Écrivez du code à exécuter !','warning'); return }
    if(!PISTON_LANG_MAP[editorLang]){
      showToast(`Exécution non disponible pour ${editorLang}. Utilisez JS, Python, PHP ou Bash.`,'warning')
      return
    }
    setRunning(true)
    setShowOutput(true)
    setRunOutput({stdout:'⏳ Exécution en cours via Piston API...',stderr:'',code:null})
    try{
      const result=await executeCode(editorLang, editorCode)
      setRunOutput(result)
      if(result.code===0) showToast('✓ Exécution réussie !','success')
      else showToast('✗ Erreur lors de l\'exécution','danger')
    }catch(e){
      setRunOutput({stdout:'',stderr:e.message,code:1})
    }finally{
      setRunning(false)
    }
  },[editorCode,editorLang,showToast])

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
    if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){ e.preventDefault(); handleRun() }
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
  //  TESTS — vendor/bin/phpunit tena miasa (tsy Math.random() intsony)
  // ══════════════════════════════════════════
  const [tests,setTests]             =useState([])
  const [testsLoading,setTestsLoading]=useState(true)
  const [testRunning,setTestRunning] =useState(false)
  const [testProgress,setTestProgress]=useState(0)
  const [testSelected,setTestSelected]=useState(null)
  const [testLastRaw,setTestLastRaw]  =useState('')

  const loadTestSuites=useCallback(async()=>{
    setTestsLoading(true)
    try{
      const res=await devspaceApi.testsList()
      if(res?.success===false){
        showToast(res.message||'Impossible de charger la liste des tests','danger')
        setTests([])
        return
      }
      setTests((res.data||[]).map(s=>({
        file:s.file, class:s.class, group:s.group,
        tests:s.testCount, passed:0, failed:0,
        duration:'—', status:'idle', cases:[],
      })))
    }catch(err){
      showToast('Erreur serveur — liste des tests indisponible','danger')
      setTests([])
    }finally{
      setTestsLoading(false)
    }
  },[showToast])

  useEffect(()=>{ loadTestSuites() },[loadTestSuites])

  const runTests=async(specificFile=null)=>{
    const target=specificFile?tests.find(t=>t.file===specificFile):null
    if(specificFile && !target) return

    setTestRunning(true)
    setTestProgress(35)
    try{
      const res=await devspaceApi.testsRun(target?target.class:null)
      setTestProgress(85)
      if(res?.success===false){
        showToast(res.message||'Échec de l\'exécution des tests','danger')
        setTestLastRaw(res?.errors?.raw||'')
        return
      }
      const suites=res?.data?.suites||[]
      setTestLastRaw(res?.data?.raw||'')
      setTests(prev=>prev.map(t=>{
        const match=suites.find(s=>s.class===t.class)
        return match
          ?{...t,tests:match.tests,passed:match.passed,failed:match.failed,
            duration:match.duration,status:match.status,cases:match.cases}
          :t
      }))
      const totalFail=suites.reduce((a,s)=>a+s.failed,0)
      showToast(totalFail>0?`Tests terminés — ${totalFail} échec(s)`:'Tests terminés — tout est vert ! 🎉',
        totalFail>0?'danger':'success')
    }catch(err){
      showToast('Erreur serveur — impossible de lancer les tests','danger')
    }finally{
      setTestProgress(100)
      setTestRunning(false)
      setTimeout(()=>setTestProgress(0),600)
    }
  }

  const totalTests=tests.reduce((a,t)=>a+t.tests,0)
  const totalPassed=tests.reduce((a,t)=>a+t.passed,0)
  const totalFailed=tests.reduce((a,t)=>a+t.failed,0)

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
            TERMINAL (réel — whitelist de commandes)
        ══════════════════════════════════════════ */}
        {activeTab==='terminal' && <DevTerminal key="terminal"/>}

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
                  <button onClick={handleRun} disabled={running}
                    style={{padding:'4px 14px',borderRadius:6,fontSize:10,fontFamily:'Orbitron,sans-serif',fontWeight:700,
                      background:running?'rgba(0,200,255,0.2)':C.neon,color:running?C.neon:'#020408',border:'none',
                      cursor:running?'not-allowed':'pointer',height:26,display:'flex',alignItems:'center',gap:5,marginRight:4}}>
                    {running
                      ?<><motion.span animate={{rotate:360}} transition={{repeat:Infinity,duration:0.6,ease:'linear'}}
                          style={{display:'inline-block',width:10,height:10,borderRadius:'50%',border:'2px solid currentColor',borderTopColor:'transparent'}}/> Running...</>
                      :<><Play size={10}/> Run (Ctrl+Enter)</>}
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


            {/* OUTPUT PISTON */}
            {showOutput&&(
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3}}
                style={{marginTop:10,borderRadius:12,overflow:'hidden',
                  border:`1px solid ${runOutput?.code===0?'rgba(0,255,136,0.3)':'rgba(255,45,120,0.3)'}`,
                  background:'#000'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',
                  background:'#080808',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                  <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:11,
                    color:running?'#ffce00':runOutput?.code===0?'#00ff88':'#ff2d78'}}>
                    {running?'⏳ EXÉCUTION EN COURS...':runOutput?.code===0?'✓ SUCCÈS':'✗ ERREUR'}
                  </span>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {!running&&runOutput?.code!==null&&(
                      <span style={{fontSize:10,color:'#555',fontFamily:'JetBrains Mono,monospace'}}>
                        Exit code: {runOutput?.code}
                      </span>
                    )}
                    <button onClick={()=>setShowOutput(false)}
                      style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:16,lineHeight:1}}>×</button>
                  </div>
                </div>
                <div style={{padding:14,fontFamily:'JetBrains Mono,monospace',fontSize:12,lineHeight:1.8,maxHeight:300,overflowY:'auto'}}>
                  {runOutput?.stdout&&(
                    <pre style={{color:'#00ff88',margin:0,whiteSpace:'pre-wrap'}}>{runOutput.stdout}</pre>
                  )}
                  {runOutput?.stderr&&(
                    <pre style={{color:'#ff6b6b',margin:0,whiteSpace:'pre-wrap',marginTop:runOutput?.stdout?8:0}}>{runOutput.stderr}</pre>
                  )}
                  {!runOutput?.stdout&&!runOutput?.stderr&&!running&&(
                    <span style={{color:'#555'}}>(aucune sortie)</span>
                  )}
                </div>
              </motion.div>
            )}

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
            DOCKER (réel)
        ══════════════════════════════════════════ */}
        {activeTab==='docker' && <DockerPanel key="docker"/>}

        {/* ══════════════════════════════════════════
            BASE DE DONNÉES (réel, lecture seule)
        ══════════════════════════════════════════ */}
        {activeTab==='db' && <DbQueryPanel key="db"/>}

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
              <button onClick={()=>runTests()} disabled={testRunning||testsLoading||tests.length===0}
                style={{...S.btnCyan,display:'flex',alignItems:'center',gap:6,opacity:(testRunning||testsLoading)?0.5:1,cursor:testRunning?'not-allowed':'pointer'}}>
                <Play size={13}/> Tous les tests
              </button>
              <button onClick={loadTestSuites} disabled={testRunning||testsLoading}
                style={{...S.btnGhost,display:'flex',alignItems:'center',gap:6}}>
                <RefreshCw size={13}/> Recharger la liste
              </button>
            </div>

            {testsLoading&&(
              <div style={{...S.panel({padding:20,textAlign:'center'}),fontSize:12,color:C.t3}}>
                Chargement des classes de test depuis le backend…
              </div>
            )}

            {!testsLoading&&tests.length===0&&(
              <div style={{...S.panel({padding:20,textAlign:'center'}),fontSize:12,color:C.t3}}>
                Aucune classe de test trouvée dans tests/Unit ou tests/Feature.
              </div>
            )}

            {/* Fichiers de tests */}
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {tests.map(t=>(
                <motion.div key={t.file} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
                  style={{...S.panel({padding:16})}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                    <div style={{width:28,height:28,borderRadius:7,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
                      background:t.status==='fail'?'rgba(255,45,120,0.1)':t.status==='pass'?'rgba(0,255,136,0.1)':'rgba(255,255,255,0.05)',
                      border:`1px solid ${t.status==='fail'?'rgba(255,45,120,0.3)':t.status==='pass'?'rgba(0,255,136,0.3)':'rgba(255,255,255,0.12)'}`}}>
                      {t.status==='fail'
                        ?<XCircle size={14} style={{color:C.nova}}/>
                        :t.status==='pass'
                          ?<CheckCircle size={14} style={{color:C.neon}}/>
                          :<TestTube size={14} style={{color:C.t3}}/>}
                    </div>
                    <div style={{flex:1,minWidth:120}}>
                      <p style={{fontSize:12,fontFamily:'JetBrains Mono,monospace',color:C.t1}}>{t.file}</p>
                      <p style={{fontSize:10,color:C.t3}}>{t.tests} tests · {t.duration}</p>
                    </div>
                    <div style={{display:'flex',gap:10,fontSize:11}}>
                      {t.status!=='idle'&&<span style={{color:C.neon}}>{t.passed} ✓</span>}
                      {t.failed>0&&<span style={{color:C.nova}}>{t.failed} ✗</span>}
                    </div>
                    <button onClick={()=>runTests(t.file)} disabled={testRunning}
                      style={{...S.btnGhost,padding:'5px 10px',fontSize:10,display:'flex',alignItems:'center',gap:4}}>
                      <Play size={10}/> Relancer
                    </button>
                  </div>
                  {t.failed>0&&t.cases.filter(c=>c.status==='fail').map(c=>(
                    <div key={c.name} style={{marginTop:10,padding:'8px 12px',background:'rgba(255,45,120,0.06)',borderRadius:7,
                      border:'1px solid rgba(255,45,120,0.2)',fontSize:11,color:C.nova,fontFamily:'JetBrains Mono,monospace',whiteSpace:'pre-wrap'}}>
                      ✗ {c.name} — {c.message||'Échec (voir la sortie phpunit)'}
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            PROFILER (réel — Web Vitals)
        ══════════════════════════════════════════ */}
        {activeTab==='perf' && <ProfilerPanel key="perf"/>}

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

