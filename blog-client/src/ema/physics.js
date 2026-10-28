import RAPIER from '@dimforge/rapier3d'
import { clamp } from './interaction.js'
import { EMA } from './model.js'
export const STEP = 1 / 60

// Same articulation principle as Vercel's interactive badge: max-distance rope
// constraints between particles, then a freely rotating spherical board joint.
// Bending is free; stretching is constrained. No spring with a nonzero rest
// length is inserted at coincident endpoints.
export async function createPhysics() {
    const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })
    world.timestep = STEP
    world.numSolverIterations = 10
    const plaques = new Set()
    let drag = null, time = 0
    const zero = { x: 0, y: 0, z: 0 }
    const endDrag = () => {
        if (!drag) return
        world.removeRigidBody(drag.target)
        drag = null
    }
    return {
        world,
        add(x, y) {
            const anchor = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y + EMA.nailY, EMA.nailZ))
            const rack = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y + EMA.nailY, -.14))
            const rackCollider = world.createCollider(RAPIER.ColliderDesc.cuboid(1.35, .105, .13).setFriction(.72), rack)
            const nail = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y + EMA.nailY, .2))
            const nailRotation = { x: Math.SQRT1_2, y: 0, z: 0, w: Math.SQRT1_2 }
            world.createCollider(RAPIER.ColliderDesc.cylinder(.0175, .065).setTranslation(0,0,.12).setRotation(nailRotation).setFriction(.5), nail)
            world.createCollider(RAPIER.ColliderDesc.cylinder(.11,.023).setRotation(nailRotation).setFriction(.5),nail)
            const cords = []
            let previous = anchor
            for (let i = 1; i <= EMA.segments; i++) {
                const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(x, y + EMA.nailY-i*EMA.segmentLength, EMA.nailZ*(1-i/EMA.segments))
                    .setLinearDamping(.8).setAngularDamping(1))
                world.createCollider(RAPIER.ColliderDesc.ball(.018).setMass(.025).setSensor(true), body)
                world.createImpulseJoint(RAPIER.JointData.rope(EMA.segmentLength, zero, zero), previous, body, true).setContactsEnabled(false)
                cords.push(body); previous = body
            }
            const centerY = y + EMA.nailY - EMA.segments*EMA.segmentLength - EMA.holeY
            const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x, centerY, 0)
                .setLinearDamping(.4).setAngularDamping(.55).setCcdEnabled(true).setAdditionalSolverIterations(6))
            const z = EMA.thickness/2+EMA.bevel
            world.createCollider(RAPIER.ColliderDesc.cuboid(EMA.halfWidth,.625,z).setTranslation(0,-.175,0)
                .setMass(.8).setFriction(.6).setRestitution(.15),body)
            const roof = RAPIER.ColliderDesc.convexHull(new Float32Array([-1.02,.45,-z, 1.02,.45,-z, 0,.88,-z, -1.02,.45,z, 1.02,.45,z, 0,.88,z]))
            world.createCollider(roof.setMass(.19).setFriction(.6).setRestitution(.15),body)
            world.createImpulseJoint(RAPIER.JointData.spherical(zero, {x:0,y:EMA.holeY,z:0}), previous, body, true).setContactsEnabled(false)
            const plaque = { body, anchor, rack, rackCollider, nail, cords, x, y, enabled: true, phase: x*2.71+y*.33 }
            plaques.add(plaque)
            return plaque
        },
        configureRack(p,centerX,halfWidth,enabled) {
            p.rack.setEnabled(enabled)
            if(enabled) {
                p.rack.setTranslation({x:centerX,y:p.y+EMA.nailY,z:-.14},false)
                p.rackCollider.setHalfExtents({x:halfWidth,y:.105,z:.13})
            }
        },
        relocate(p,x,y) {
            if (p.x===x && p.y===y) return
            for (const body of [p.anchor,p.rack,p.nail,...p.cords,p.body]) {
                const t=body.translation(); body.setTranslation({x:t.x+x-p.x,y:t.y+y-p.y,z:t.z},false)
            }
            p.x=x; p.y=y
        },
        enable(p,enabled) {
            if (p.enabled===enabled) return
            p.enabled=enabled
            for (const body of [p.anchor,p.rack,p.nail,...p.cords,p.body]) body.setEnabled(enabled)
        },
        impulse(p,x,y,z=0) {
            if(p.enabled) p.body.applyImpulse({x:clamp(x,-.25,.25),y:clamp(y,-.12,.12),z:clamp(z,-.18,.18)},true)
        },
        twist(p,x,y,z=0) {
            if(p.enabled) p.body.applyTorqueImpulse({x:clamp(x,-.08,.08),y:clamp(y,-.1,.1),z:clamp(z,-.06,.06)},true)
        },
        startDrag(p,point,local) {
            endDrag()
            const target=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(point.x,point.y,point.z))
            world.createImpulseJoint(RAPIER.JointData.spring(0,150,10,zero,local),target,p.body,true)
            drag={target,plaque:p,desired:{...point}}
            for(const body of [...p.cords,p.body]) body.wakeUp()
        },
        moveDrag(point) {
            if(!drag) return
            const p=drag.plaque
            drag.desired={x:clamp(point.x,p.x-2,p.x+2),y:clamp(point.y,p.y-1.6,p.y+1.8),z:clamp(point.z,-1.4,1.4)}
        },
        endDrag,
        step(wind = true) {
            time+=STEP
            // Limit the handle's speed in world units, independently of pointer
            // event frequency. A rapid swipe cannot teleport the spring anchor.
            if(drag) {
                const current=drag.target.translation(), desired=drag.desired
                const delta={x:desired.x-current.x,y:desired.y-current.y,z:desired.z-current.z}
                const length=Math.hypot(delta.x,delta.y,delta.z)
                const amount=Math.min(1,6*STEP/Math.max(length,.0001))
                drag.target.setNextKinematicTranslation({x:current.x+delta.x*amount,y:current.y+delta.y*amount,z:current.z+delta.z*amount})
            }
            for(const p of plaques) {
                if(!p.enabled) continue
                // Tiny, coherent gusts bend the flexible cord; not independent random jitters.
                const gust=Math.sin(time*.8+p.phase)*Math.sin(time*.31+.7)
                if(wind) for(let i=0;i<p.cords.length;i++) p.cords[i].applyImpulse({x:gust*.000035,y:0,z:Math.sin(time*.6+p.phase+i*.15)*.000025},true)
                // Very weak yaw torsion allows a full flip and slow relaxation.
                const q=p.body.rotation(), sign=q.w<0?-1:1
                p.body.addTorque({x:0,y:drag?.plaque===p ? 0 : -q.y*sign*.12,z:0},false)
                const v=p.body.linvel(), w=p.body.angvel()
                p.body.setLinvel({x:clamp(v.x,-8,8),y:clamp(v.y,-8,8),z:clamp(v.z,-8,8)},false)
                p.body.setAngvel({x:clamp(w.x,-12,12),y:clamp(w.y,-12,12),z:clamp(w.z,-12,12)},false)
            }
            world.step()
            for(const p of plaques) if(p.enabled) p.body.resetTorques(false)
        },
        remove(p) {
            if(drag?.plaque===p) endDrag()
            for(const body of [p.body,...p.cords,p.anchor,p.rack,p.nail]) world.removeRigidBody(body)
            plaques.delete(p)
        },
        dispose() {endDrag();plaques.clear();world.free()},
    }
}
