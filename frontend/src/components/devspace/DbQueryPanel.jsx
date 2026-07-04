import React,{useState,useEffect,useCallback} from 'react'
import {motion} from 'framer-motion'
import {Database,Play,RefreshCw,Table2,Lock} from 'lucide-react'
import {PanelHeader} from '../ui/UI.jsx'
import {C,S} from '../../styles.js'
import {useAuth} from '../../context/AuthContext.jsx'
import {useApp} from '../../context/AppContext.jsx'
import {devspaceApi} from '../../services/devspaceApi.js'

// ════════════════════════════════════════════
//  DB QUERY TOOL — TENA MARINA, LECTURE SEULE
//  (SELECT/EXPLAIN ihany, voarara ny INSERT/UPDATE/
//   DELETE/DROP/sns. any am-backend — jereo DbQueryService.php)
// ════════════════════════════════════════════
export default function DbQueryPanel(){
  const {user} = useAuth()
  const {showToast} = useApp()
  const isAdmin = user?.role === 'admin'

  const [tables,setTables]   = useState([])
  const [loadingTables,setLoadingTables] = useState(true)
  const [sql,setSql]         = useState('SELECT * FROM users')
  const [result,setResult]   = useState(null) // {columns,rows,count,duration_ms}
  const [error,setError]     = useState('')
  const [running,setRunning] = useState(false)

  const loadTables = useCallback(async ()=>{
    setLoadingTables(true)
    const res = await devspaceApi.dbTables()
    if(res?.success!==false) setTables(res?.data||[])
    setLoadingTables(false)
  },[])

  useEffect(()=>{ loadTables() },[loadTables])

  const runQuery = async ()=>{
    if(!sql.trim()) return
    setRunning(true)
    setError('')
    const res = await devspaceApi.dbQuery(sql)
    setRunning(false)
    if(res?.success===false){
      setError(res.message || 'Tsy nahomby ny baiko.')
      setResult(null)
    }else{
      setResult(res.data)
    }
  }

  const pickTable = (name)=>{
    setSql(`SELECT * FROM ${name}`)
  }

  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
      style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:16,alignItems:'start'}}>

      {/* Lisitry ny tableau */}
      <div style={{...S.panel({padding:14})}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <PanelHeader icon={Table2} title="Tableau" color={C.cyan}/>
          <button onClick={loadTables} style={{...S.btnGhost,padding:6}}>
            <RefreshCw size={12} style={loadingTables?{animation:'spin 0.6s linear infinite'}:{}}/>
          </button>
        </div>
        {loadingTables ? (
          <p style={{fontSize:11,color:C.t3}}>Maka...</p>
        ) : tables.length===0 ? (
          <p style={{fontSize:11,color:C.t3}}>Tsy misy tableau hita.</p>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:420,overflow:'auto'}}>
            {tables.map(t=>(
              <button key={t.name} onClick={()=>pickTable(t.name)}
                style={{background:'transparent',border:'none',textAlign:'left',padding:'6px 8px',
                  borderRadius:6,cursor:'pointer',display:'flex',justifyContent:'space-between',
                  fontFamily:'JetBrains Mono,monospace',fontSize:11,color:C.t2}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span>{t.name}</span>
                <span style={{color:C.t3}}>{t.rows ?? '—'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Éditeur + résultats */}
      <div>
        <div style={{...S.panel({padding:16,marginBottom:14})}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <h3 style={{fontFamily:'Orbitron,sans-serif',fontWeight:700,fontSize:14,color:C.t1,margin:0}}>
              🗄️ SQL (lecture seule)
            </h3>
            {!isAdmin && (
              <span style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:C.t3}}>
                <Lock size={11}/> Admin ihany no afaka manatanteraka
              </span>
            )}
          </div>
          <textarea value={sql} onChange={e=>setSql(e.target.value)} rows={5}
            placeholder="SELECT * FROM users WHERE role = 'admin'"
            style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid ${C.border}`,
              borderRadius:8,padding:10,color:C.t1,fontFamily:'JetBrains Mono,monospace',
              fontSize:12,resize:'vertical',outline:'none'}}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
            <p style={{fontSize:10,color:C.t3,margin:0}}>SELECT / EXPLAIN ihany — LIMIT 200 raha tsy voafaritra.</p>
            <button onClick={runQuery} disabled={running || !isAdmin}
              style={{...S.btnCyan,display:'flex',alignItems:'center',gap:6,opacity:(running||!isAdmin)?0.5:1}}>
              <Play size={13}/> {running?'Mandeha…':'Run'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{...S.panel({padding:14,marginBottom:14}),border:`1px solid ${C.nova}66`,background:'rgba(255,45,120,0.08)'}}>
            <p style={{fontSize:12,color:C.nova,margin:0}}>⚠ {error}</p>
          </div>
        )}

        {result && (
          <div style={{...S.panel({padding:0})}}>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 16px',borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,color:C.t3}}>{result.count} ligne(s)</span>
              <span style={{fontSize:11,color:C.t3}}>{result.duration_ms} ms</span>
            </div>
            <div style={{overflow:'auto',maxHeight:420}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                <thead>
                  <tr>
                    {result.columns.map(c=>(
                      <th key={c} style={{textAlign:'left',padding:'8px 12px',color:C.t3,
                        fontFamily:'Orbitron,sans-serif',fontWeight:700,borderBottom:`1px solid ${C.border}`,
                        whiteSpace:'nowrap'}}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                      {result.columns.map(c=>(
                        <td key={c} style={{padding:'7px 12px',color:C.t2,fontFamily:'JetBrains Mono,monospace',
                          whiteSpace:'nowrap',maxWidth:240,overflow:'hidden',textOverflow:'ellipsis'}}>
                          {row[c]===null ? <span style={{color:C.t3}}>NULL</span> : String(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
