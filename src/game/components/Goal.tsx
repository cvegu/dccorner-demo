import { CuboidCollider, RigidBody } from '@react-three/rapier'
import {
  FIELD_LENGTH,
  GOAL_DEPTH,
  GOAL_WIDTH,
  PALETTE,
  TEAM_COLORS,
  WALL_HEIGHT,
  WALL_THICKNESS,
} from '../constants'
import type { Team } from '../types'

interface GoalProps {
  side: 'NORTH' | 'SOUTH'
  onGoal: (team: Team) => void
}

export function Goal({ side, onGoal }: GoalProps) {
  const direction = side === 'NORTH' ? 1 : -1
  const scorer: Team = side === 'NORTH' ? 'BLUE' : 'RED'
  const z = direction * (FIELD_LENGTH / 2 + GOAL_DEPTH / 2)
  const accent = TEAM_COLORS[side === 'NORTH' ? 'RED' : 'BLUE'].main

  return (
    <group>
      <mesh position={[0, -0.17, z]} castShadow receiveShadow>
        <boxGeometry args={[GOAL_WIDTH + 0.7, 0.24, GOAL_DEPTH + 0.35]} />
        <meshStandardMaterial color={PALETTE.darkBrown} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.04, z]} receiveShadow>
        <boxGeometry args={[GOAL_WIDTH + 0.48, 0.08, GOAL_DEPTH + 0.17]} />
        <meshStandardMaterial color={PALETTE.cream} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.008, z]}>
        <boxGeometry args={[GOAL_WIDTH + 0.3, 0.018, GOAL_DEPTH]} />
        <meshBasicMaterial color={accent} transparent opacity={0.16} />
      </mesh>

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          sensor
          args={[GOAL_WIDTH / 2 - 0.12, 0.55, GOAL_DEPTH / 2 - 0.06]}
          position={[0, 0.5, z]}
          onIntersectionEnter={({ other }) => {
            // The sensor has no physical response. Rapier reports the named ball
            // rigid body once its collider is far enough beyond the goal line.
            if (other.rigidBodyObject?.name === 'ball') onGoal(scorer)
          }}
        />

        <CuboidCollider
          args={[GOAL_WIDTH / 2 + WALL_THICKNESS, WALL_HEIGHT / 2, WALL_THICKNESS / 2]}
          position={[0, WALL_HEIGHT / 2, direction * (FIELD_LENGTH / 2 + GOAL_DEPTH)]}
          friction={0.28}
          restitution={0.68}
        />
        {[-1, 1].map((xSide) => (
          <CuboidCollider
            key={xSide}
            args={[WALL_THICKNESS / 2, WALL_HEIGHT / 2, GOAL_DEPTH / 2]}
            position={[xSide * (GOAL_WIDTH / 2 + WALL_THICKNESS / 2), WALL_HEIGHT / 2, z]}
            friction={0.28}
            restitution={0.68}
          />
        ))}
      </RigidBody>

      <mesh position={[0, WALL_HEIGHT / 2, direction * (FIELD_LENGTH / 2 + GOAL_DEPTH)]} castShadow>
        <boxGeometry args={[GOAL_WIDTH + WALL_THICKNESS * 2, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={PALETTE.darkBrown} roughness={0.88} />
      </mesh>
      <mesh position={[0, WALL_HEIGHT / 2 + 0.02, direction * (FIELD_LENGTH / 2 + GOAL_DEPTH - 0.025)]}>
        <boxGeometry args={[GOAL_WIDTH + WALL_THICKNESS * 1.3, WALL_HEIGHT - 0.12, WALL_THICKNESS * 0.62]} />
        <meshStandardMaterial color={PALETTE.paper} roughness={0.92} />
      </mesh>
      {[-1, 1].map((xSide) => (
        <group key={xSide}>
          <mesh
            position={[xSide * (GOAL_WIDTH / 2 + WALL_THICKNESS / 2), WALL_HEIGHT / 2, z]}
            castShadow
          >
            <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, GOAL_DEPTH]} />
            <meshStandardMaterial color={PALETTE.darkBrown} roughness={0.88} />
          </mesh>
          <mesh
            position={[xSide * (GOAL_WIDTH / 2 + WALL_THICKNESS / 2), WALL_HEIGHT / 2 + 0.02, z]}
          >
            <boxGeometry args={[WALL_THICKNESS * 0.58, WALL_HEIGHT - 0.12, GOAL_DEPTH - 0.08]} />
            <meshStandardMaterial color={PALETTE.paper} roughness={0.92} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.08, direction * (FIELD_LENGTH / 2 + 0.06)]}>
        <boxGeometry args={[GOAL_WIDTH, 0.13, 0.16]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      <mesh position={[0, WALL_HEIGHT + 0.01, z]} castShadow>
        <boxGeometry args={[GOAL_WIDTH + WALL_THICKNESS * 2, 0.14, 0.16]} />
        <meshStandardMaterial color={accent} roughness={0.76} />
      </mesh>
    </group>
  )
}
