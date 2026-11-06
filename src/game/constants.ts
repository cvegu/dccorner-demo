import type { PlayerConfig, Team } from './types'

export const DEBUG_PHYSICS = false

export const FIELD_WIDTH = 12
export const FIELD_LENGTH = 18
export const GOAL_WIDTH = 4.2
export const GOAL_DEPTH = 1.35
export const WALL_HEIGHT = 0.7
export const WALL_THICKNESS = 0.28

export const PLAYER_Y = 0.55
export const BALL_Y = 0.32
export const PLAYER_RADIUS = 0.48
export const BALL_RADIUS = 0.3

export const MAX_DRAG = 4
export const MAX_POWER = 22
export const MIN_DRAG = 0.14

export const REST_SPEED_THRESHOLD = 0.16
export const REST_TIME = 0.72
export const WIN_SCORE = 3

export const PALETTE = {
  pitchBlue: '#2fa8e0',
  pitchBlueDark: '#2384b2',
  amber: '#f5a524',
  cream: '#fff1c9',
  darkBrown: '#3e2a2a',
  paper: '#fffdf7',
} as const

export const TEAM_COLORS: Record<Team, { main: string; light: string; dark: string }> = {
  BLUE: { main: '#1fb5b0', light: '#79e3dc', dark: '#19948f' },
  RED: { main: '#7b4fb8', light: '#c5a4ed', dark: '#633e96' },
}

export const INITIAL_PLAYERS: PlayerConfig[] = [
  { id: 'blue-1', team: 'BLUE', number: 1, position: [0, PLAYER_Y, -6.3] },
  { id: 'blue-2', team: 'BLUE', number: 2, position: [-2.35, PLAYER_Y, -3.7] },
  { id: 'blue-3', team: 'BLUE', number: 3, position: [2.35, PLAYER_Y, -3.7] },
  { id: 'red-1', team: 'RED', number: 1, position: [0, PLAYER_Y, 6.3] },
  { id: 'red-2', team: 'RED', number: 2, position: [-2.35, PLAYER_Y, 3.7] },
  { id: 'red-3', team: 'RED', number: 3, position: [2.35, PLAYER_Y, 3.7] },
]
