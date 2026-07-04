import React,{useState,useEffect,useRef,useCallback} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../context/AuthContext.jsx'
import {devspaceApi} from '../../services/devspaceApi.js'
import {C} from '../../styles.js'

// ════════════════════════════════════════════
//  TERMINAL — TENA MARINA, WHITELIST IHANY
//  Tsy exec libre: ny backend (TerminalService.php) dia
//  mametra ny baiko azo antso amin'ny lisitra voafaritra
//  mialoha. Admin ihany no afaka mampiasa azy ity.
// ════════════════════════════════════════════
export default function Terminal(){
  const {user} = useAuth()
  const isAdmin = user?.role === 'admin'

  const [lines,setLines]   = useState([
    {c:C.t3,t:'Terminal DevSpace (réel) — whitelist de commandes seulement.'},
    {c:C.t3,t:'Hazavao: tapez "help" raha tsy fantatrao ny baiko azo antso.'},
  ])
  const [input,setInput]   = useState('')
  const [hist,setHist]     = useState([])
  const [histIdx,setHistIdx] = useState(-1)
  const [allowed,setAllowed] = useState([])
  const [running,setRunning] = useState(false)
  const termRef  = useRef(null)
  const inputRef = useRef(null)

  useEffect(()=>{
    if(!isAdmin) return
    devspaceApi.terminalAllowed().then(res=>{
      if(res?.success!==false) setAllowed(res.data||[])
    })
  },[isAdmin])

  useEffect(()=>{
    termRef.current?.scrollTo({top:termRef.current.scrollHeight})
  },[lines])

  const push = (text,color=C.t1)=> setLines(p=>[...p,{c:color,t:text}])

  const run = useCallback(async (cmd)=>{
    const command = cmd.trim()
    if(!command) return
    push(`${user?.name||'dev'}@devenviron:~$ ${command}`, C.neon)
    setHist(p=>[...p,command])
    setHistIdx(-1)

    if(command==='help'){
      push('Baiko azo antso (whitelist):')
      allowed.forEach(c=>push('  '+c, C.t2))
      if(allowed.length===0) push('  (mbola tsy voarakitra — averina ny pejy)', C.t3)
      return
    }
    if(command==='clear'){ setLines([]); return }

    setRunning(true)
    const res = await devspaceApi.terminalExec(command)
    setRunning(false)

    if(res?.success===false && res?._status===403){
      push('⛔ Admin ihany no afaka mampiasa ny terminal.', C.nova)
      return
    }
    const r = res?.data
    if(!r){
      push(res?.message || 'Tsy nahomby ny baiko.', C.nova)
      return
    }
    if(r.out) push(r.out, C.t1)
    if(r.err) push(r.err, r.ok ? C.t3 : C.nova)
    push(`[exit ${r.code}]`, r.ok ? C.t3 : C.nova)
  },[allowed,user])

  const onKey = (e)=>{
    if(e.key==='Enter'){ run(input); setInput('') }
    if(e.key==='ArrowUp'){
      e.preventDefault()
      if(hist.length===0) return
      const idx = histIdx<0 ? hist.length-1 : Math.max(0,histIdx-1)
      setHistIdx(idx); setInput(hist[idx])
    }
    if(e.key==='ArrowDown'){
      e.preventDefault()
      if(histIdx<0) return
      const idx = histIdx+1
      if(idx>=hist.length){ setHistIdx(-1); setInput('') }
      else { setHistIdx(idx); setInput(hist[idx]) }
    }
    if(e.ctrlKey && e.key==='l'){ e.preventDefault(); setLines([]) }
  }

  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
      <div style={{background:'#000',border:'1px solid rgba(0,255,136,0.2)',borderRadius:12,overflow:'hidden',boxShadow:'0 0 30px rgba(0,255,136,0.05)'}}>
        <div style={{display:'flex',alignItems:'center',gap:7,padding:'10px 14px',borderBottom:'1px solid rgba(0,255,136,0.1)',background:'#080808'}}>
          <div style={{width:12,height:12,borderRadius:'50%',background:'#ff5f57',cursor:'pointer'}} onClick={()=>setLines([])}/>
          <div style={{width:12,height:12,borderRadius:'50%',background:'#ffbd2e'}}/>
          <div style={{width:12,height:12,borderRadius:'50%',background:'#28c840'}}/>
          <span style={{flex:1,textAlign:'center',fontSize:11,color:'#555',fontFamily:'JetBrains Mono,monospace'}}>
            terminal (réel) — {user?.name||'dev'}@devenviron — whitelist
          </span>
          <span style={{fontSize:10,color:'#555',fontFamily:'JetBrains Mono,monospace'}}>{hist.length} cmds</span>
          <button onClick={()=>setLines([])}
            style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:10,fontFamily:'Orbitron,sans-serif',letterSpacing:'0.05em'}}>
            ✕ CLEAR
          </button>
        </div>

        <div ref={termRef} onClick={()=>inputRef.current?.focus()}
          style={{padding:14,fontFamily:'JetBrains Mono,monospace',fontSize:13,lineHeight:1.75,minHeight:300,maxHeight:440,overflowY:'auto',cursor:'text'}}>
          {lines.map((l,i)=>(
            <div key={i} style={{color:l.c,whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{l.t}</div>
          ))}
          {running && <div style={{color:C.quantum}}>…</div>}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:9,padding:'10px 14px',borderTop:'1px solid rgba(0,255,136,0.1)',background:'#040404'}}>
          <span style={{color:'#00ff88',fontFamily:'JetBrains Mono,monospace',fontSize:13,flexShrink:0,userSelect:'none'}}>
            {user?.name||'dev'}@devenviron:~$
          </span>
          <input ref={inputRef} value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={!isAdmin || running}
            style={{flex:1,background:'transparent',border:'none',color:'#00ff88',fontFamily:'JetBrains Mono,monospace',fontSize:13,outline:'none',caretColor:'#00ff88'}}
            placeholder={isAdmin ? 'Tapez "help", ↑↓=historique, Ctrl+L=effacer' : 'Admin ihany no afaka mampiasa ity terminal ity'}
            autoFocus/>
        </div>
      </div>

      {allowed.length>0 && (
        <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}>
          {allowed.map(cmd=>(
            <button key={cmd} onClick={()=>{ run(cmd); inputRef.current?.focus() }}
              style={{padding:'4px 10px',borderRadius:6,fontSize:10,fontFamily:'JetBrains Mono,monospace',
                background:'rgba(0,200,255,0.06)',border:'1px solid rgba(0,200,255,0.18)',color:C.t2,cursor:'pointer',transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,200,255,0.12)';e.currentTarget.style.color=C.cyan}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,200,255,0.06)';e.currentTarget.style.color=C.t2}}>
              {cmd}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}
