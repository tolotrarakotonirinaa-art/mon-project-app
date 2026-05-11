import React,{useState} from 'react'
import {motion} from 'framer-motion'
import {Copy} from 'lucide-react'
import {useApp} from '../context/AppContext.jsx'
import {C,S} from '../styles.js'
import {PT} from './shared/PageUtils.jsx'

// ════════════════════════════════════════════
//  DOCUMENTATION
// ════════════════════════════════════════════
const DOCS={
  intro:   {title:'Introduction',      icon:'🏠',content:'DevEnviron 4D est une plateforme SaaS de développement collaboratif next-generation.\n\nElle centralise gestion de projets, CI/CD, dépôts Git, documentation et communication en temps réel dans une interface 4D immersive.\n\nStack technique :\n• Frontend : React 18 + Vite + Framer Motion\n• Backend : Laravel 11 + JWT\n• Base de données : PostgreSQL 16\n• Déploiement : Docker'},
  install: {title:'Installation',      icon:'⚡',content:'Prérequis : PHP 8.2+, Composer 2+, Node.js 18+, npm 9+',code:'# 1. Frontend\ngit clone https://github.com/devenviron/platform\ncd devenviron4d\nnpm install\nnpm run dev\n\n# 2. Backend\ncd devenviron-backend\ncomposer install\ncp .env.example .env\nphp artisan key:generate\nphp artisan serve\n\n# 3. Base de données\npsql -U postgres -f 00_RUN_ALL.sql'},
  config:  {title:'Configuration',     icon:'⚙️',content:'Configurez le fichier .env dans le dossier backend :',code:'APP_NAME="DevEnviron 4D"\nAPP_ENV=local\nAPP_DEBUG=true\nAPP_URL=http://localhost:8000\n\nFRONTEND_URL=http://localhost:5173\n\nJWT_SECRET=votre-secret-ici\n\nDB_CONNECTION=pgsql\nDB_HOST=127.0.0.1\nDB_PORT=5432\nDB_DATABASE=devenviron\nDB_USERNAME=postgres\nDB_PASSWORD=postgres'},
  api:     {title:'API Reference',     icon:'📡',content:'API REST disponible sur http://localhost:8000/api\nAuthentification via JWT Bearer token.',code:'# Auth\nPOST   /api/auth/login\nPOST   /api/auth/register\nGET    /api/auth/me\nPOST   /api/auth/logout\n\n# Projets\nGET    /api/projects\nPOST   /api/projects\nPUT    /api/projects/:id\nDELETE /api/projects/:id\n\n# Tâches\nGET    /api/tasks\nPOST   /api/tasks\nPATCH  /api/tasks/:id/move\n\n# Pipeline\nGET    /api/pipeline/status\nPOST   /api/pipeline/run\nGET    /api/pipeline/logs'},
  roles:   {title:'Rôles & Permissions',icon:'🛡️',content:'3 rôles disponibles :\n\n• ADMIN — Accès total. Gère utilisateurs, projets, déploiements et configuration.\n\n• DEV — Accès développeur. Pipeline, dépôts, environnements, tâches. Ne peut pas gérer les utilisateurs.\n\n• CLIENT — Vue lecture. Dashboard, projets (consultation), documentation, communication.'},
  deploy:  {title:'Déploiement',       icon:'🚀',content:'Docker supporté nativement.',code:'# Build & Run\ndocker build -t devenviron-backend .\ndocker run -p 8000:8000 \\\n  -e DB_HOST=host.docker.internal \\\n  devenviron-backend\n\n# Avec docker-compose\ndocker-compose up -d\n\n# Base de données\npsql -U postgres -d devenviron -f 05_seed_data.sql'},
}

export function Documentation(){
  const {showToast}=useApp()
  const [active,setActive]=useState('intro')
  const [copied,setCopied]=useState(false)
  const doc=DOCS[active]

  const copyCode=async()=>{
    if(!doc.code) return
    try{
      await navigator.clipboard.writeText(doc.code)
      setCopied(true)
      showToast('Code copié !','success')
      setTimeout(()=>setCopied(false),2000)
    }catch{ showToast('Impossible de copier','warning') }
  }

  return(
    <div>
      <div style={{marginBottom:24}}>
        {PT('DOCUMENTATION')}
        <p style={{color:C.t2,fontSize:13,marginTop:4}}>Guides, API Reference et déploiement</p>
      </div>
      <div style={{...S.panel({padding:0,overflow:'hidden',display:'flex',minHeight:520})}}>
        {/* Sidebar */}
        <div style={{width:200,flexShrink:0,borderRight:`1px solid ${C.border}`,padding:14}}>
          <p style={{...S.label,marginBottom:12}}>SECTIONS</p>
          {Object.entries(DOCS).map(([key,d])=>(
            <button key={key} onClick={()=>setActive(key)}
              style={{width:'100%',textAlign:'left',padding:'9px 12px',borderRadius:9,marginBottom:3,border:'none',
                background:active===key?'rgba(0,200,255,0.10)':'none',color:active===key?C.cyan:C.t3,
                cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:600,fontSize:13,
                transition:'all 0.15s',display:'flex',alignItems:'center',gap:8}}>
              <span>{d.icon}</span>{d.title}
            </button>
          ))}
        </div>
        {/* Contenu */}
        <div style={{flex:1,padding:28,overflowY:'auto'}}>
          <motion.div key={active} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <h2 style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:20,
              background:'linear-gradient(135deg,#00c8ff,#e8f4ff)',WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:14}}>
              {doc.icon} {doc.title}
            </h2>
            <p style={{color:C.t2,fontSize:14,lineHeight:1.8,whiteSpace:'pre-line',marginBottom:16}}>{doc.content}</p>
            {doc.code&&(
              <div style={{background:'#000',border:'1px solid rgba(0,255,136,0.2)',borderRadius:10,overflow:'hidden'}}>
                <div style={{padding:'8px 14px',borderBottom:'1px solid rgba(0,255,136,0.1)',
                  display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:10,color:'#444',fontFamily:'JetBrains Mono,monospace'}}>bash</span>
                  <button onClick={copyCode}
                    style={{background:'none',border:'none',color:copied?C.neon:'#555',cursor:'pointer',
                      fontSize:10,fontFamily:'Orbitron,sans-serif',display:'flex',alignItems:'center',gap:4,transition:'color 0.2s'}}>
                    <Copy size={10}/> {copied?'COPIÉ !':'COPIER'}
                  </button>
                </div>
                <div style={{padding:14,fontFamily:'JetBrains Mono,monospace',fontSize:12,color:C.neon,
                  whiteSpace:'pre-wrap',lineHeight:1.7}}>
                  {doc.code}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

