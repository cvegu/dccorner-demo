import { BallCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useCallback } from 'react'
import { BALL_RADIUS, BALL_Y, PALETTE } from '../constants'

interface BallProps {
  registerBody: (id: string, body: RapierRigidBody | null) => void
}

export function Ball({ registerBody }: BallProps) {
  const setBodyRef = useCallback(
    (body: RapierRigidBody | null) => registerBody('ball', body),
    [registerBody],
  )

  return (
    <RigidBody
      ref={setBodyRef}
      name="ball"
      position={[0, BALL_Y, 0]}
      colliders={false}
      mass={0.48}
      linearDamping={0.85}
      angularDamping={1.2}
      enabledTranslations={[true, false, true]}
      enabledRotations={[false, true, false]}
      ccd
      canSleep
    >
      <BallCollider args={[BALL_RADIUS]} friction={0.08} restitution={0.78} />
      <group>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[BALL_RADIUS, 28, 20]} />
          <meshStandardMaterial color={PALETTE.paper} roughness={0.76} />
        </mesh>
        <mesh position={[0, BALL_RADIUS - 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.075, 5]} />
          <meshBasicMaterial color={PALETTE.darkBrown} />
        </mesh>
        <mesh position={[BALL_RADIUS - 0.008, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.07, 5]} />
          <meshBasicMaterial color={PALETTE.darkBrown} />
        </mesh>
        <mesh position={[0, 0, BALL_RADIUS - 0.008]}>
          <circleGeometry args={[0.07, 5]} />
          <meshBasicMaterial color={PALETTE.darkBrown} />
        </mesh>
      </group>
    </RigidBody>
  )
}
