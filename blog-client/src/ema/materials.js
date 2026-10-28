import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { EMA } from './model.js'

const base='/textures/ema/'

const readImage = (url) => new Promise(resolve => {
    if(!url) return resolve(null)
    const image=new Image(); image.crossOrigin='anonymous'; image.decoding='async'
    const timer=setTimeout(()=>{image.src='';resolve(null)},10000)
    image.onload=()=>{clearTimeout(timer);resolve(image)}
    image.onerror=()=>{clearTimeout(timer);resolve(null)}
    image.src=url
})
const loadAvatar=async link => {
    // Ordinary image display and WebGL texture upload have different browser
    // rules. The stored-link image endpoint supplies a local raster when needed.
    const direct=await readImage(link.avatar)
    return direct || (link.id ? await readImage(`/api/links/${encodeURIComponent(link.id)}/avatar`) : null)
}
const wrap=(ctx,text,width,max)=>{
    const result=[]; let line=''
    for(const char of Array.from(text||'')) {
        if(line && ctx.measureText(line+char).width>width) {
            result.push(line);line=''
            if(result.length===max) {result[max-1]=result[max-1].slice(0,-1)+'…';return result}
        }
        line+=char
    }
    if(line) result.push(line)
    return result
}

export async function createMaterials() {
    const resources=[]
    const track=(value)=>{resources.push(value);return value}
    // Color is sRGB; roughness/normal maps remain linear data (Three.js default).
    const loader=new THREE.TextureLoader()
    const maps=await Promise.all(['maple-color.jpg','maple-normal.jpg','maple-roughness.jpg'].map(name=>loader.loadAsync(base+name)))
    const [color,normal,roughness]=maps
    color.colorSpace=THREE.SRGBColorSpace
    for(const map of maps) {track(map);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=8}
    const wood=track(new THREE.MeshStandardMaterial({map:color,normalMap:normal,normalScale:new THREE.Vector2(.35,.35),roughnessMap:roughness,roughness:.83}))
    const back=wood,edge=wood
    // Fibre bump is grayscale; the red is supplied once by the material. Actual
    // three-ply twist is geometry in BraidedCord, not painted diagonal stripes.
    const canvas=document.createElement('canvas');canvas.width=64;canvas.height=128
    const ctx=canvas.getContext('2d');ctx.fillStyle='#888';ctx.fillRect(0,0,64,128)
    for(let x=0;x<64;x+=4) {ctx.fillStyle=x%8?'#999':'#666';ctx.fillRect(x,0,1,128)}
    const fibre=track(new THREE.CanvasTexture(canvas));fibre.wrapS=fibre.wrapT=THREE.RepeatWrapping
    const rope=track(new THREE.MeshPhysicalMaterial({color:'#e71923',roughness:.48,bumpMap:fibre,bumpScale:.003,sheen:.25,sheenColor:new THREE.Color('#f28a84')}))
    const rail=wood
    const nailMaterial=track(new THREE.MeshStandardMaterial({color:'#6c6962',metalness:.8,roughness:.36}))
    const shape=new THREE.Shape()
    shape.moveTo(-EMA.halfWidth,EMA.bottom);shape.lineTo(EMA.halfWidth,EMA.bottom)
    shape.lineTo(EMA.halfWidth,EMA.shoulder);shape.lineTo(0,EMA.top);shape.lineTo(-EMA.halfWidth,EMA.shoulder);shape.closePath()
    const hole=new THREE.Path();hole.absarc(0,EMA.holeY,EMA.holeRadius,0,Math.PI*2,true);shape.holes.push(hole)
    const board=track(new THREE.ExtrudeGeometry(shape,{depth:EMA.thickness,bevelEnabled:true,bevelSize:EMA.bevel,bevelThickness:EMA.bevel,bevelSegments:3,steps:1,curveSegments:24}))
    board.translate(0,0,-EMA.thickness/2)
    const position=board.attributes.position,uv=board.attributes.uv,normals=board.attributes.normal
    for(let i=0;i<position.count;i++) {
        const x=position.getX(i),y=position.getY(i),z=position.getZ(i)
        if(Math.abs(normals.getZ(i))>.7) uv.setXY(i,(x+1.04)/2.08,(y+.82)/1.72)
        else if(Math.abs(normals.getX(i))>.6) uv.setXY(i,.5+z*.8,(y+.82)/1.72)
        else uv.setXY(i,(x+1.04)/2.08,.5+z*.8)
    }
    const face=track(new THREE.ShapeGeometry(shape,24))
    for(let i=0;i<face.attributes.position.count;i++) face.attributes.uv.setXY(i,(face.attributes.position.getX(i)+1.04)/2.08,(face.attributes.position.getY(i)+.82)/1.72)
    const railGeometry=track(new RoundedBoxGeometry(1,.21,.26,3,.025))
    const nailGeometry=track(new THREE.CylinderGeometry(.065,.065,.035,20))
    const nailStem=track(new THREE.CylinderGeometry(.023,.023,.22,12))
    let disposed=false;const fronts=new Set()
    return {
        wood,back,edge,rope,rail,nailMaterial,board,face,railGeometry,nailGeometry,nailStem,
        async front(link) {
            await document.fonts.ready
            const avatar=await loadAvatar(link)
            if(disposed) return null
            const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=850
            const ctx=canvas.getContext('2d')
            ctx.drawImage(color.image,0,0,1024,850)
            if(avatar) {
                ctx.save();ctx.beginPath();ctx.roundRect(402,185,220,220,28);ctx.clip()
                const size=Math.min(avatar.width,avatar.height)
                ctx.globalAlpha=.96;ctx.drawImage(avatar,(avatar.width-size)/2,(avatar.height-size)/2,size,size,402,185,220,220);ctx.restore()
            }
            ctx.textAlign='center';ctx.fillStyle='#382c24';ctx.font='600 82px "Noto Serif SC", serif'
            wrap(ctx,link.name,850,2).forEach((line,i)=>ctx.fillText(line,512,510+i*90))
            ctx.font='54px "Noto Serif SC", serif';ctx.fillStyle='#645244'
            wrap(ctx,link.description,800,2).forEach((line,i)=>ctx.fillText(line,512,680+i*62))
            ctx.fillStyle='#a3332a';ctx.font='46px "Noto Serif SC", serif';ctx.fillText(link.category === 'recommended' ? '推   薦' : '縁   結',512,815)
            const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8
            const material=new THREE.MeshStandardMaterial({map:texture,normalMap:normal,normalScale:new THREE.Vector2(.35,.35),roughnessMap:roughness,roughness:.83})
            fronts.add(material);return material
        },
        releaseFront(material) {if(fronts.delete(material)){material.map.dispose();material.dispose()}},
        dispose() {disposed=true;for(const material of fronts){material.map.dispose();material.dispose()}fronts.clear();for(const resource of resources.splice(0))resource.dispose()},
    }
}
