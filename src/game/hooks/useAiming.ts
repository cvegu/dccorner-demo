import type { RapierRigidBody } from '@react-three/rapier'
import { useCallback, useRef, useState } from 'react'
import type { Ray } from 'three'
import { Vector3 } from 'three'
import { MAX_DRAG, MIN_DRAG, PLAYER_Y } from '../constants'
import type { AimState } from '../types'
import { projectRayToHorizontalPlane } from '../utils/physics'

export function useAiming() {
  const [aim, setAim] = useState<AimState | null>(null)
  const [plans, setPlans] = useState<Record<string, AimState>>({})
  const aimRef = useRef<AimState | null>(null)

  const commitAim = useCallback((next: AimState | null) => {
    aimRef.current = next
    setAim(next)
  }, [])

  const beginAim = useCallback(
    (playerId: string, body: RapierRigidBody, ray: Ray) => {
      const start = projectRayToHorizontalPlane(ray, PLAYER_Y)
      if (!start) return

      const translation = body.translation()
      const origin = new Vector3(translation.x, PLAYER_Y, translation.z)
      commitAim({
        playerId,
        origin,
        start,
        current: start.clone(),
        direction: new Vector3(),
        power: 0,
      })
    },
    [commitAim],
  )

  const updateAim = useCallback(
    (ray: Ray) => {
      const currentAim = aimRef.current
      const point = projectRayToHorizontalPlane(ray, PLAYER_Y)
      if (!currentAim || !point) return

      const drag = currentAim.start.clone().sub(point)
      drag.y = 0
      const distance = drag.length()
      const direction = distance > 0 ? drag.normalize() : drag
      commitAim({
        ...currentAim,
        current: point,
        direction,
        power: Math.min(distance / MAX_DRAG, 1),
      })
    },
    [commitAim],
  )

  const releaseAim = useCallback(
    (ray: Ray) => {
      updateAim(ray)
      const currentAim = aimRef.current
      commitAim(null)

      if (!currentAim) return
      const dragDistance = currentAim.start.distanceTo(currentAim.current)
      if (dragDistance < MIN_DRAG) {
        setPlans((current) => {
          const next = { ...current }
          delete next[currentAim.playerId]
          return next
        })
        return
      }

      setPlans((current) => ({ ...current, [currentAim.playerId]: currentAim }))
    },
    [commitAim, updateAim],
  )

  const cancelAim = useCallback(() => {
    commitAim(null)
  }, [commitAim])

  const clearPlans = useCallback(() => setPlans({}), [])

  return { aim, plans, beginAim, updateAim, releaseAim, cancelAim, clearPlans }
}
