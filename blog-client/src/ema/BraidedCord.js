import * as THREE from 'three'
import { sampleCordSections } from './cordPath.js'

/** Three actual helical strands, following a deforming closed loop through the
 * board's hole and around its nail. UV.v is arc length, never segment index, so
 * the fibre density does not stretch when the rope bends. */
export class BraidedCord extends THREE.Mesh {
    constructor(material) {
        const longitudinal = 240, radial = 6, plies = 3
        const count = plies * (longitudinal + 1) * (radial + 1)
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage))
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage))
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2).setUsage(THREE.DynamicDrawUsage))
        const indices = []
        for (let ply = 0; ply < plies; ply++) {
            const offset = ply * (longitudinal + 1) * (radial + 1)
            for (let i = 0; i < longitudinal; i++) for (let j = 0; j < radial; j++) {
                const a = offset + i * (radial + 1) + j, b = a + radial + 1
                indices.push(a, b, a + 1, b, b + 1, a + 1)
            }
        }
        geometry.setIndex(indices)
        super(geometry, material)
        this.longitudinal = longitudinal; this.radial = radial
        this.previousTangent = null
        this.previousNormal = null
        this.restLengths = null
        this.castShadow = true; this.frustumCulled = false
    }

    update(sections) {
        const centers=sampleCordSections(sections)
        const segments=centers.length-1, radial=this.radial
        if(segments!==this.longitudinal) throw new Error('Cord section resolution must match geometry')
        const tangents=centers.map((p,i)=>centers[Math.min(i+1,segments)].clone().sub(centers[Math.max(0,i-1)]).normalize())
        // Parallel transport the first frame from the previous frame in time.
        // A new arbitrary Frenet starting axis each frame made the braid pop.
        let initial
        if(this.previousNormal) {
            initial=this.previousNormal.clone().applyQuaternion(new THREE.Quaternion().setFromUnitVectors(this.previousTangent,tangents[0]))
        } else {
            initial=new THREE.Vector3(0,0,1)
            if(Math.abs(initial.dot(tangents[0]))>.9) initial.set(0,1,0)
        }
        initial.addScaledVector(tangents[0],-initial.dot(tangents[0])).normalize()
        const normals=[initial], binormals=[new THREE.Vector3().crossVectors(tangents[0],initial).normalize()]
        for(let i=1;i<=segments;i++) {
            const normal=normals[i-1].clone().applyQuaternion(new THREE.Quaternion().setFromUnitVectors(tangents[i-1],tangents[i]))
            normal.addScaledVector(tangents[i],-normal.dot(tangents[i])).normalize()
            normals.push(normal);binormals.push(new THREE.Vector3().crossVectors(tangents[i],normal).normalize())
        }
        this.previousNormal=initial.clone();this.previousTangent=tangents[0].clone()
        // Material coordinates are fixed at rest: bending cannot add/remove a
        // whole braid turn as round(currentLength/pitch) used to do.
        if(!this.restLengths) {
            this.restLengths=[0]
            for(let i=1;i<=segments;i++) this.restLengths.push(this.restLengths[i-1]+centers[i].distanceTo(centers[i-1]))
        }
        const length=this.restLengths.at(-1)
        const seamAngle=Math.atan2(tangents[0].dot(new THREE.Vector3().crossVectors(normals[segments],normals[0])),normals[segments].dot(normals[0]))
        for(let i=1;i<=segments;i++) {
            normals[i].applyAxisAngle(tangents[i],seamAngle*i/segments)
            binormals[i].crossVectors(tangents[i],normals[i]).normalize()
        }
        const position=this.geometry.attributes.position,normal=this.geometry.attributes.normal,uv=this.geometry.attributes.uv
        const turns=Math.max(1,Math.round(length/.115))
        let index = 0
        for (let ply = 0; ply < 3; ply++) for (let i = 0; i <= segments; i++) {
            const phase = this.restLengths[i] / length * Math.PI * 2 * turns + ply * Math.PI * 2 / 3
            const n = normals[i], b = binormals[i], p = centers[i]
            const sx = Math.cos(phase) * .013, sy = Math.sin(phase) * .013
            for (let j = 0; j <= radial; j++) {
                const angle = j / radial * Math.PI * 2
                const cx = Math.cos(angle), cy = Math.sin(angle)
                const x = sx + cx * .011, y = sy + cy * .011
                position.setXYZ(index, p.x + n.x*x + b.x*y, p.y + n.y*x + b.y*y, p.z + n.z*x + b.z*y)
                normal.setXYZ(index, n.x*cx + b.x*cy, n.y*cx + b.y*cy, n.z*cx + b.z*cy)
                uv.setXY(index++, j/radial, this.restLengths[i]*28)
            }
        }
        position.needsUpdate = normal.needsUpdate = uv.needsUpdate = true
    }

    dispose() { this.geometry.dispose() }
}
