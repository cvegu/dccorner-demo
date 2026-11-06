import { Plane, Ray, Vector3 } from 'three'
import type { Team } from '../types'

const pointerPlane = new Plane()
const planeNormal = new Vector3(0, 1, 0)

export function projectRayToHorizontalPlane(ray: Ray, height: number) {
  // R3F supplies a world-space ray from the camera through the pointer. Intersecting
  // it with the play plane keeps aiming accurate at every viewport resolution.
  pointerPlane.set(planeNormal, -height)
  return ray.intersectPlane(pointerPlane, new Vector3())
}

export function oppositeTeam(team: Team): Team {
  return team === 'BLUE' ? 'RED' : 'BLUE'
}
