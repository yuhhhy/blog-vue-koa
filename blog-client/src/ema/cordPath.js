import * as THREE from 'three'

/** Retarget a simulated rope centerline to the actual tied ends. Offsets are
 * interpolated along its length, never added in world axes independently. */
export function standingLeg(centerline, start, end) {
    const distances=[0]
    for(let i=1;i<centerline.length;i++) distances.push(distances[i-1]+centerline[i].distanceTo(centerline[i-1]))
    const length=distances.at(-1)
    const startOffset=start.clone().sub(centerline[0])
    const endOffset=end.clone().sub(centerline.at(-1))
    return centerline.map((point,i)=>point.clone().add(startOffset.clone().lerp(endOffset,length>1e-6?distances[i]/length:i/(centerline.length-1))))
}

/** Piecewise curves reserve samples for each knot separately. Moving a free
 * span cannot change the knot's shape or redistribute all its vertices. */
export function sampleCordSections(sections) {
    const points=[]
    for(const {points:controls,segments} of sections) {
        const curve=new THREE.CatmullRomCurve3(controls,false,'centripetal')
        const samples=curve.getSpacedPoints(segments)
        points.push(...(points.length?samples.slice(1):samples))
    }
    return points
}
