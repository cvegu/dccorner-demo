import { CuboidCollider, RigidBody } from '@react-three/rapier'
import {
  FIELD_LENGTH,
  FIELD_WIDTH,
  GOAL_WIDTH,
  PALETTE,
  TEAM_COLORS,
  WALL_HEIGHT,
  WALL_THICKNESS,
} from '../constants'

type Vec3 = [number, number, number]

interface WallProps {
  position: Vec3
  size: Vec3
}

function Wall({ position, size }: WallProps) {
  const innerSize: Vec3 = [
    Math.max(size[0] - 0.08, 0.12),
    Math.max(size[1] - 0.12, 0.12),
    Math.max(size[2] - 0.08, 0.12),
  ]

  return (
    <>
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2, size[2] / 2]}
        position={position}
        friction={0.3}
        restitution={0.72}
      />
      <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={PALETTE.darkBrown} roughness={0.82} />
      </mesh>
      <mesh position={[position[0], position[1] + 0.03, position[2]]} castShadow>
        <boxGeometry args={innerSize} />
        <meshStandardMaterial color={PALETTE.cream} roughness={0.88} />
      </mesh>
    </>
  )
}

function FieldLine({ position, size }: WallProps) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshBasicMaterial color={PALETTE.paper} />
    </mesh>
  )
}

export function Arena() {
  const halfWidth = FIELD_WIDTH / 2
  const halfLength = FIELD_LENGTH / 2
  const endSegment = (FIELD_WIDTH - GOAL_WIDTH) / 2
  const endSegmentX = GOAL_WIDTH / 2 + endSegment / 2

  return (
    <group>
      <mesh position={[0, -0.29, 0]} castShadow receiveShadow>
        <boxGeometry args={[FIELD_WIDTH + 1.25, 0.34, FIELD_LENGTH + 1.25]} />
        <meshStandardMaterial color={PALETTE.darkBrown} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[FIELD_WIDTH + 0.78, 0.22, FIELD_LENGTH + 0.78]} />
        <meshStandardMaterial color={PALETTE.cream} roughness={0.92} />
      </mesh>

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[FIELD_WIDTH / 2, 0.1, FIELD_LENGTH / 2]}
          position={[0, -0.1, 0]}
          friction={0.45}
          restitution={0.08}
        />

        <mesh position={[0, -0.1, 0]} receiveShadow>
          <boxGeometry args={[FIELD_WIDTH, 0.2, FIELD_LENGTH]} />
          <meshStandardMaterial color={PALETTE.pitchBlue} roughness={0.88} />
        </mesh>

        {[-7.5, -4.5, -1.5, 1.5, 4.5, 7.5].map((z, index) => (
          <mesh key={z} position={[0, 0.004, z]} receiveShadow>
            <boxGeometry args={[FIELD_WIDTH - 0.08, 0.008, 3]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? '#36afe2' : '#2ca2d8'}
              roughness={0.92}
            />
          </mesh>
        ))}

        <mesh position={[0, 0.009, -halfLength + 0.38]}>
          <boxGeometry args={[GOAL_WIDTH, 0.018, 0.55]} />
          <meshBasicMaterial color={TEAM_COLORS.BLUE.main} transparent opacity={0.78} />
        </mesh>
        <mesh position={[0, 0.009, halfLength - 0.38]}>
          <boxGeometry args={[GOAL_WIDTH, 0.018, 0.55]} />
          <meshBasicMaterial color={TEAM_COLORS.RED.main} transparent opacity={0.78} />
        </mesh>

        <Wall
          position={[-halfWidth - WALL_THICKNESS / 2, WALL_HEIGHT / 2, 0]}
          size={[WALL_THICKNESS, WALL_HEIGHT, FIELD_LENGTH + WALL_THICKNESS * 2]}
        />
        <Wall
          position={[halfWidth + WALL_THICKNESS / 2, WALL_HEIGHT / 2, 0]}
          size={[WALL_THICKNESS, WALL_HEIGHT, FIELD_LENGTH + WALL_THICKNESS * 2]}
        />

        {[-1, 1].map((side) =>
          [-1, 1].map((end) => (
            <Wall
              key={`${side}-${end}`}
              position={[side * endSegmentX, WALL_HEIGHT / 2, end * (halfLength + WALL_THICKNESS / 2)]}
              size={[endSegment, WALL_HEIGHT, WALL_THICKNESS]}
            />
          )),
        )}
      </RigidBody>

      <FieldLine position={[0, 0.025, 0]} size={[FIELD_WIDTH - 0.24, 0.028, 0.075]} />
      <FieldLine position={[0, 0.027, -halfLength + 2.25]} size={[GOAL_WIDTH, 0.028, 0.075]} />
      <FieldLine position={[0, 0.027, halfLength - 2.25]} size={[GOAL_WIDTH, 0.028, 0.075]} />
      {[-1, 1].map((side) => (
        <FieldLine
          key={side}
          position={[side * GOAL_WIDTH / 2, 0.027, 0]}
          size={[0.065, 0.028, 4.5]}
        />
      ))}

      <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.43, 1.52, 64]} />
        <meshBasicMaterial color={PALETTE.paper} />
      </mesh>
      <mesh position={[0, 0.044, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.11, 24]} />
        <meshBasicMaterial color={PALETTE.amber} />
      </mesh>
    </group>
  )
}
