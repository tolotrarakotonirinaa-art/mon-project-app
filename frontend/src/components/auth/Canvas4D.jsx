import React,{useRef,useEffect} from 'react'

export default function Canvas4D(){
  const ref = useRef(null)
  useEffect(()=>{
    const el=ref.current; if(!el) return
    let renderer,animId,cleanup2
    import('three').then(THREE=>{
      try{
        const W=el.clientWidth||window.innerWidth,H=el.clientHeight||window.innerHeight
        renderer=new THREE.WebGLRenderer({alpha:true,antialias:true})
        renderer.setSize(W,H); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
        renderer.setClearColor(0x000000,0); el.appendChild(renderer.domElement)
        const scene=new THREE.Scene()
        const cam=new THREE.PerspectiveCamera(60,W/H,0.1,1000); cam.position.z=7
        // Particles
        const N=1500,pos=new Float32Array(N*3),col=new Float32Array(N*3)
        const pal=['#00c8ff','#7c3aed','#00ff88','#ff6b35','#ff2d78'].map(h=>new THREE.Color(h))
        for(let i=0;i<N;i++){
          const r=4+Math.random()*4,th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1)
          pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=r*Math.sin(ph)*Math.sin(th);pos[i*3+2]=r*Math.cos(ph)
          const c=pal[i%pal.length];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b
        }
        const pg=new THREE.BufferGeometry()
        pg.setAttribute('position',new THREE.BufferAttribute(pos,3))
        pg.setAttribute('color',new THREE.BufferAttribute(col,3))
        const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:0.04,vertexColors:true,transparent:true,opacity:0.8,blending:THREE.AdditiveBlending,depthWrite:false}))
        scene.add(pts)
        // Torus knot
        const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(1.3,0.32,100,14),new THREE.MeshBasicMaterial({color:0x00c8ff,wireframe:true,transparent:true,opacity:0.13}))
        scene.add(knot)
        // 4D Hypercube
        const v4=[];for(let i=0;i<16;i++)v4.push([(i&1)?1:-1,(i&2)?1:-1,(i&4)?1:-1,(i&8)?1:-1])
        const e4=[];for(let i=0;i<16;i++)for(let j=i+1;j<16;j++){let d=0;for(let k=0;k<4;k++)if(v4[i][k]!==v4[j][k])d++;if(d===1)e4.push([i,j])}
        const proj=(v,a)=>{const w=1/(3-v[3]*Math.sin(a)*0.3);return new THREE.Vector3(v[0]*w*1.5,v[1]*w*1.5,v[2]*w*1.5)}
        const cg=new THREE.Group()
        const lines=e4.map(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0x7c3aed,transparent:true,opacity:0.5}));cg.add(l);return g})
        scene.add(cg)
        ;[[2.5,0x00c8ff,0.22],[3.2,0x7c3aed,0.14],[3.9,0x00ff88,0.07]].forEach(([r,c,o])=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(r,0.015,8,100),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o}));ring.rotation.x=Math.random()*Math.PI;ring.rotation.y=Math.random()*Math.PI;scene.add(ring)})
        let mx=0,my=0
        const onMouse=e=>{mx=(e.clientX/window.innerWidth-0.5)*2;my=-(e.clientY/window.innerHeight-0.5)*2}
        window.addEventListener('mousemove',onMouse)
        const clock=new THREE.Clock()
        const tick=()=>{
          animId=requestAnimationFrame(tick)
          const t=clock.getElapsedTime()
          pts.rotation.y=t*0.04+mx*0.06;pts.rotation.x=t*0.02+my*0.03
          knot.rotation.x=t*0.13;knot.rotation.y=t*0.18;knot.scale.setScalar(1+Math.sin(t*0.8)*0.03)
          cg.rotation.y=t*0.18;cg.rotation.x=Math.sin(t*0.12)*0.25
          const a4=t*0.45
          e4.forEach(([i,j],idx)=>{const a=proj(v4[i],a4),b=proj(v4[j],a4),arr=lines[idx].attributes.position.array;arr[0]=a.x;arr[1]=a.y;arr[2]=a.z;arr[3]=b.x;arr[4]=b.y;arr[5]=b.z;lines[idx].attributes.position.needsUpdate=true})
          renderer.render(scene,cam)
        }
        tick()
        const onResize=()=>{const W2=el.clientWidth||window.innerWidth,H2=el.clientHeight||window.innerHeight;cam.aspect=W2/H2;cam.updateProjectionMatrix();renderer.setSize(W2,H2)}
        window.addEventListener('resize',onResize)
        cleanup2=()=>{window.removeEventListener('mousemove',onMouse);window.removeEventListener('resize',onResize)}
      }catch(e){console.warn('Canvas4D:',e)}
    }).catch(e=>console.warn('Three.js:',e))
    return()=>{cancelAnimationFrame(animId);cleanup2?.();try{renderer?.dispose()}catch{};try{if(el.firstChild)el.removeChild(el.firstChild)}catch{}}
  },[])
  return <div ref={ref} style={{position:'absolute',inset:0,zIndex:0,pointerEvents:'none'}}/>
}
