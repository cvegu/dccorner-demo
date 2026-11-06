import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import type { AimState, Team } from '../types'
import { PALETTE, TEAM_COLORS } from '../constants'

interface AimIndicatorProps {
  aim: AimState
  team: Team
  planned?: boolean
}

const UP = new Vector3(0, 1, 0)

export function AimIndicator({ aim, team, planned = false }: AimIndicatorProps) {
  const { arrowStart, arrowEnd, dragEnd, rotation } = useMemo(() => {
    const direction = aim.direction.lengthSq() > 0 ? aim.direction : new Vector3(0, 0, 1)
    const start = aim.origin.clone().setY(0.14)
    const end = start.clone().addScaledVector(direction, 1.05 + aim.power * 3.25)
    const pointer = aim.current.clone().setY(0.12)
    const quaternion = new Quaternion().setFromUnitVectors(UP, direction.clone().normalize())
    return { arrowStart: start, arrowEnd: end, dragEnd: pointer, rotation: quaternion }
  }, [aim])

  if (aim.power < 0.01) return null

  const color = planned ? TEAM_COLORS[team].light : PALETTE.amber

  return (
    <group>
      <Line
        points={[arrowStart, arrowEnd]}
        color={color}
        lineWidth={2.4 + aim.power * 1.4}
        transparent
        opacity={0.8}
      />
      <mesh position={arrowEnd} quaternion={rotation}>
        <coneGeometry args={[0.11 + aim.power * 0.06, 0.34, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.96} />
      </mesh>
      {!planned ? (
        <>
          <Line
            points={[arrowStart, dragEnd]}
            color={PALETTE.paper}
            lineWidth={1.5}
            dashed
            dashSize={0.18}
            gapSize={0.12}
            transparent
            opacity={0.4}
          />
          <mesh position={dragEnd} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.2, 24]} />
            <meshBasicMaterial color={PALETTE.paper} transparent opacity={0.72} />
          </mesh>
        </>
      ) : null}
    </group>
  )
}
