import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import wasm from 'vite-plugin-wasm'
import { EMA } from './model.js'

const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)

test('real Rapier cord remains attached through drag, flip, handoff and cleanup', async t => {
    const vite=await createServer({configFile:false,root:fileURLToPath(new URL('../../',import.meta.url)),plugins:[wasm()],optimizeDeps:{noDiscovery:true,include:[]},ssr:{noExternal:['@dimforge/rapier3d']},server:{middlewareMode:true},appType:'custom'})
    t.after(()=>vite.close())
    const {createPhysics}=await vite.ssrLoadModule('/src/ema/physics.js')
    const physics=await createPhysics()
    t.after(()=>physics.dispose())
    const p=physics.add(0,0), neighbour=physics.add(EMA.spacing,0)
    for(let i=0;i<120;i++) physics.step(false)
    const start=p.body.translation()
    assert.ok(start.y > -.3 && start.y < 0, 'board hangs below the nail')
    physics.startDrag(p,{x:start.x,y:start.y,z:start.z},{x:0,y:0,z:0})
    let maxTurn = 0
    for(let i=0;i<60;i++) {
        physics.moveDrag({x:1.2,y:.2,z:.45})
        physics.twist(p,0,.045,0)
        physics.step(false)
        maxTurn=Math.max(maxTurn,Math.abs(p.body.rotation().y))
    }
    assert.ok(distance(start,p.body.translation())>.2, 'drag moves the actual rigid body')
    assert.ok(maxTurn>.7, 'free joint allows turning to expose side/back')
    physics.endDrag()
    for(let i=0;i<600;i++) physics.step(false)
    let previous=p.anchor.translation()
    for(const body of p.cords) {
        const point=body.translation()
        assert.ok(distance(previous,point)<EMA.segmentLength+.035, 'rope cannot stretch indefinitely')
        previous=point
    }
    // A released, back-facing plaque should recover, rather than parking there.
    p.body.setRotation({x:0,y:Math.sin(Math.PI*80/180),z:0,w:Math.cos(Math.PI*80/180)},true)
    p.body.setAngvel({x:0,y:0,z:0},true)
    for(let i=0;i<600;i++) physics.step(false)
    assert.ok(Math.abs(p.body.rotation().y)<.25, 'released board returns toward its printed face')
    const still={...p.body.translation()}
    physics.impulse(p,.09,0,.06)
    for(let i=0;i<12;i++) physics.step(false)
    assert.ok(distance(still,p.body.translation())>.01, 'pointer brush visibly moves the board')
    const before={...p.body.translation()}, rotation={...p.body.rotation()}, velocity={...p.body.linvel()}
    physics.relocate(p,2,-12)
    const after=p.body.translation()
    assert.ok(Math.abs(after.x-before.x-2)<1e-5)
    assert.ok(Math.abs(after.y-before.y+12)<1e-5)
    assert.deepEqual({...p.body.rotation()},rotation,'handoff preserves rotation')
    assert.deepEqual({...p.body.linvel()},velocity,'handoff preserves velocity')
    physics.enable(p,false)
    for(let i=0;i<20;i++) physics.step()
    assert.deepEqual(p.body.translation(),after,'culled body remains frozen')
    physics.enable(p,true)
    physics.configureRack(p,2,4,true)
    assert.equal(p.rack.translation().x,2)
    assert.ok(Math.abs(p.rack.translation().y-(-12+EMA.nailY))<1e-5)
    // Exercise narrow-phase contacts against both real fixtures, not just
    // their creation. Place the board across each fixture and step the solver.
    for(const fixture of [p.rack,p.nail]) {
        const target=fixture.translation()
        p.body.setTranslation(target,true)
        p.body.setRotation({x:0,y:0,z:0,w:1},true)
        physics.step(false)
        let contacts=0
        for(let i=0;i<p.body.numColliders();i++) for(let j=0;j<fixture.numColliders();j++) {
            physics.world.contactPair(p.body.collider(i),fixture.collider(j),manifold=>{contacts+=manifold.numContacts()})
        }
        assert.ok(contacts>0,'board makes contact with rack/nail fixture')
    }
    physics.remove(p);physics.remove(neighbour)
    assert.equal(physics.world.bodies.len(),0)
    assert.equal(physics.world.impulseJoints.len(),0)
})

test('6, 30 and 100 plaques remain finite and release all bodies',async t=>{
    const vite=await createServer({configFile:false,root:fileURLToPath(new URL('../../',import.meta.url)),plugins:[wasm()],optimizeDeps:{noDiscovery:true,include:[]},ssr:{noExternal:['@dimforge/rapier3d']},server:{middlewareMode:true},appType:'custom'})
    t.after(()=>vite.close())
    const {createPhysics}=await vite.ssrLoadModule('/src/ema/physics.js')
    for(const count of [6,30,100]) {
        const physics=await createPhysics()
        const plaques=Array.from({length:count},(_,i)=>physics.add(i%3*EMA.spacing,-Math.floor(i/3)*12))
        for(let i=6;i<count;i++) physics.enable(plaques[i],false)
        for(let i=0;i<120;i++) physics.step()
        for(const p of plaques) assert.ok(Object.values(p.body.translation()).every(Number.isFinite))
        for(const p of plaques) physics.remove(p)
        assert.equal(physics.world.bodies.len(),0)
        physics.dispose()
    }
})
