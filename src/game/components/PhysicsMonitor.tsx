import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { REST_SPEED_THRESHOLD, REST_TIME } from '../constants'
import type { BodyRegistry, GamePhase } from '../types'

interface PhysicsMonitorProps {
  bodies: BodyRegistry
  phase: GamePhase
  onMovingChange: (moving: boolean) => void
  onSettled: () => void
}

export function PhysicsMonitor({ bodies, phase, onMovingChange, onSettled }: PhysicsMonitorProps) {
  const restDuration = useRef(0)
  const lastMoving = useRef(false)

  useEffect(() => {
    restDuration.current = 0
    if (phase !== 'SIMULATING') lastMoving.current = false
  }, [phase])

  useFrame((_, delta) => {
    if (phase !== 'SIMULATING' || bodies.size < 7) return

    const thresholdSq = REST_SPEED_THRESHOLD ** 2
    let moving = false

    // End the turn from measured Rapier velocities, not a fixed shot timeout.
    // Every body must stay below the threshold for a continuous quiet window.
    for (const body of bodies.values()) {
      const velocity = body.linvel()
      if (velocity.x ** 2 + velocity.z ** 2 > thresholdSq) {
        moving = true
        break
      }
    }

    if (moving !== lastMoving.current) {
      lastMoving.current = moving
      onMovingChange(moving)
    }

    if (moving) {
      restDuration.current = 0
      return
    }

    restDuration.current += Math.min(delta, 0.1)
    if (restDuration.current < REST_TIME) return

    for (const body of bodies.values()) {
      body.setLinvel({ x: 0, y: 0, z: 0 }, false)
      body.setAngvel({ x: 0, y: 0, z: 0 }, false)
    }
    restDuration.current = 0
    onSettled()
  })

  return null
}
