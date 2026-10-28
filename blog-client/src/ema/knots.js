import * as THREE from 'three'
import { EMA } from './model.js'

// These are waypoints of ONE continuous cord, not separate decorative rings.
// Board points are transformed by the board; nail points remain on the rack.
export function boardKnotPath() {
    const y=EMA.holeY, z=EMA.thickness/2+EMA.bevel+.055
    // The two lower leads deliberately leave the drilled hole on a shallow
    // catenary. They are not straight spokes: the rope has slack before it
    // tightens into each bow loop.
    return [
        [0,y,z],[-.012,y+.006,z+.024],[-.028,y+.018,z+.048],
        [-.052,y+.035,z+.058],[-.095,y+.060,z+.050],
        [-.17,y+.105,z+.035],[-.26,y+.125,z+.018],[-.33,y+.095,z+.012],
        [-.36,y+.025,z+.018],[-.33,y-.045,z+.028],[-.27,y-.075,z+.042],
        [-.19,y-.065,z+.050],[-.11,y-.025,z+.060],[-.045,y+.020,z+.075],
        [-.005,y+.052,z+.095],[.025,y+.075,z+.10],
        [.070,y+.092,z+.085],[.14,y+.12,z+.065],[.23,y+.115,z+.04],
        [.31,y+.075,z+.022],[.36,y+.015,z+.018],[.34,y-.05,z+.03],
        [.28,y-.075,z+.045],[.20,y-.055,z+.06],[.12,y-.005,z+.075],
        [.055,y+.035,z+.09],[.01,y+.06,z+.105],
        [-.015,y+.09,z+.11],[-.035,y+.115,z+.10],
    ].map(p=>new THREE.Vector3(...p))
}

export function nailKnotPath() {
    const points=[]
    // Two full turns sit behind the nail head and tighten around its shaft.
    for(let i=0;i<=32;i++) {
        const angle=-Math.PI/2-i/32*Math.PI*4
        points.push(new THREE.Vector3(Math.cos(angle)*.054,EMA.nailY+Math.sin(angle)*.054,.20+i/32*.055))
    }
    points.push(...[
        [-.06,EMA.nailY-.10,.26],[-.025,EMA.nailY-.16,.28],
        [.04,EMA.nailY-.135,.28],[.055,EMA.nailY-.08,.23],
        [.005,EMA.nailY-.075,.19],[-.015,EMA.nailY-.12,.20],
        [.035,EMA.nailY-.16,.24],
    ].map(p=>new THREE.Vector3(...p)))
    return points
}
