import type { ThreeEvent } from '@react-three/fiber'
import { CylinderCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useCursor } from '@react-three/drei'
import { useCallback, useRef, useState } from 'react'
import type { Ray } from 'three'
import { PALETTE, PLAYER_RADIUS, TEAM_COLORS } from '../constants'
import type { PlayerConfig } from '../types'

interface BobbleProps extends PlayerConfig {
  selectable: boolean
  selected: boolean
  planned: boolean
  registerBody: (id: string, body: RapierRigidBody | null) => void
  onAimStart: (id: string, body: RapierRigidBody, ray: Ray) => void
  onAimMove: (ray: Ray) => void
  onAimEnd: (ray: Ray) => void
  onAimCancel: () => void
}

type PointerCaptureTarget = EventTarget & {
  setPointerCapture: (pointerId: number) => void
  releasePointerCapture: (pointerId: number) => void
}

export function Bobble({
  id,
  team,
  number,
  position,
  selectable,
  selected,
  planned,
  registerBody,
  onAimStart,
  onAimMove,
  onAimEnd,
  onAimCancel,
}: BobbleProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null)
  const [hovered, setHovered] = useState(false)
  const colors = TEAM_COLORS[team]
  const facing = team === 'BLUE' ? 1 : -1
  useCursor(selectable && hovered, selected ? 'grabbing' : 'grab')

  const setBodyRef = useCallback(
    (body: RapierRigidBody | null) => {
      bodyRef.current = body
      registerBody(id, body)
    },
    [id, registerBody],
  )

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!selectable || !bodyRef.current) return
    event.stopPropagation()
    ;(event.target as PointerCaptureTarget).setPointerCapture(event.pointerId)
    onAimStart(id, bodyRef.current, event.ray)
  }

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!selected) return
    event.stopPropagation()
    onAimMove(event.ray)
  }

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!selected) return
    event.stopPropagation()
    ;(event.target as PointerCaptureTarget).releasePointerCapture(event.pointerId)
    onAimEnd(event.ray)
  }

  return (
    <RigidBody
      ref={setBodyRef}
      name={id}
      position={position}
      colliders={false}
      mass={4.6}
      linearDamping={1.4}
      angularDamping={10}
      enabledTranslations={[true, false, true]}
      enabledRotations={[false, false, false]}
      ccd
      canSleep
    >
      <CylinderCollider args={[0.5, PLAYER_RADIUS]} friction={0.34} restitution={0.48} />

      <group
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={onAimCancel}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[0, -0.42, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.51, 0.54, 0.18, 32]} />
          <meshStandardMaterial color={PALETTE.darkBrown} roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.355, 0]} castShadow>
          <cylinderGeometry args={[0.44, 0.48, 0.12, 32]} />
          <meshStandardMaterial color={colors.light} roughness={0.78} />
        </mesh>

        <mesh position={[0, -0.055, 0]} castShadow>
          <cylinderGeometry args={[0.39, 0.46, 0.58, 32]} />
          <meshStandardMaterial color={colors.main} roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.245, 0]} castShadow>
          <cylinderGeometry args={[0.39, 0.39, 0.08, 32]} />
          <meshStandardMaterial color={PALETTE.darkBrown} roughness={0.78} />
        </mesh>
        <mesh position={[0, -0.345, 0]} castShadow>
          <cylinderGeometry args={[0.47, 0.48, 0.08, 32]} />
          <meshStandardMaterial color={PALETTE.darkBrown} roughness={0.78} />
        </mesh>

        {Array.from({ length: number }).map((_, index) => (
          <mesh
            key={index}
            position={[(index - (number - 1) / 2) * 0.105, 0, 0.354 * facing]}
          >
            <sphereGeometry args={[0.035, 12, 8]} />
            <meshBasicMaterial color={PALETTE.amber} />
          </mesh>
        ))}

        <mesh position={[0, 0.46, 0]} castShadow>
          <sphereGeometry args={[0.36, 30, 22]} />
          <meshStandardMaterial color={PALETTE.cream} roughness={0.86} />
        </mesh>

        <mesh position={[0, 0.68, -0.005]} scale={[1, 0.52, 1]} castShadow>
          <sphereGeometry args={[0.345, 28, 18]} />
          <meshStandardMaterial color={colors.dark} roughness={0.9} />
        </mesh>

        {[-0.105, 0.105].map((x) => (
          <mesh key={x} position={[x, 0.51, 0.304 * facing]}>
            <sphereGeometry args={[0.038, 14, 10]} />
            <meshBasicMaterial color={PALETTE.darkBrown} />
          </mesh>
        ))}
        <mesh
          position={[0, 0.39, 0.326 * facing]}
          rotation={[0, facing < 0 ? Math.PI : 0, Math.PI]}
        >
          <torusGeometry args={[0.085, 0.018, 8, 18, Math.PI]} />
          <meshBasicMaterial color={PALETTE.darkBrown} />
        </mesh>

        {selected || planned ? (
          <mesh position={[0, -0.485, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.59, 0.7, 48]} />
            <meshBasicMaterial
              color={selected ? PALETTE.amber : colors.light}
              transparent
              opacity={selected ? 1 : 0.76}
            />
          </mesh>
        ) : null}
      </group>
    </RigidBody>
  )
}
