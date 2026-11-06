import type { RapierRigidBody } from '@react-three/rapier'
import type { Vector3 } from 'three'

export type Team = 'BLUE' | 'RED'
export type GamePhase = 'AIMING' | 'SIMULATING' | 'GOAL' | 'GAME_OVER'

export interface PlayerConfig {
  id: string
  team: Team
  number: number
  position: [number, number, number]
}

export interface AimState {
  playerId: string
  origin: Vector3
  start: Vector3
  current: Vector3
  direction: Vector3
  power: number
}

export type BodyRegistry = Map<string, RapierRigidBody>

export interface Scores {
  BLUE: number
  RED: number
}
