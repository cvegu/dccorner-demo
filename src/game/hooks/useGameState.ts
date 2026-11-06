import { useCallback, useEffect, useState } from 'react'
import { WIN_SCORE } from '../constants'
import type { GamePhase, Scores, Team } from '../types'
import { oppositeTeam } from '../utils/physics'

const INITIAL_SCORES: Scores = { BLUE: 0, RED: 0 }

export function useGameState() {
  const [scores, setScores] = useState<Scores>(INITIAL_SCORES)
  const [activeTeam, setActiveTeam] = useState<Team>('BLUE')
  const [phase, setPhase] = useState<GamePhase>('AIMING')
  const [goalTeam, setGoalTeam] = useState<Team | null>(null)
  const [winner, setWinner] = useState<Team | null>(null)
  const [resetVersion, setResetVersion] = useState(0)
  const [objectsMoving, setObjectsMoving] = useState(false)

  const startSimulation = useCallback(() => {
    setObjectsMoving(true)
    setPhase('SIMULATING')
  }, [])

  const finishTurn = useCallback(() => {
    setObjectsMoving(false)
    setActiveTeam((team) => oppositeTeam(team))
    setPhase('AIMING')
  }, [])

  const scoreGoal = useCallback(
    (scorer: Team) => {
      if (phase !== 'SIMULATING') return

      setScores((current) => {
        const next = { ...current, [scorer]: current[scorer] + 1 }
        if (next[scorer] >= WIN_SCORE) setWinner(scorer)
        return next
      })
      setObjectsMoving(false)
      setGoalTeam(scorer)
      setPhase('GOAL')
    },
    [phase],
  )

  useEffect(() => {
    if (phase !== 'GOAL' || !goalTeam) return

    const timer = window.setTimeout(() => {
      if (winner) {
        setPhase('GAME_OVER')
        return
      }

      setActiveTeam(oppositeTeam(goalTeam))
      setGoalTeam(null)
      setResetVersion((version) => version + 1)
      setPhase('AIMING')
    }, 1550)

    return () => window.clearTimeout(timer)
  }, [goalTeam, phase, winner])

  const resetMatch = useCallback(() => {
    setScores(INITIAL_SCORES)
    setActiveTeam('BLUE')
    setPhase('AIMING')
    setGoalTeam(null)
    setWinner(null)
    setObjectsMoving(false)
    setResetVersion((version) => version + 1)
  }, [])

  return {
    scores,
    activeTeam,
    phase,
    goalTeam,
    winner,
    resetVersion,
    objectsMoving,
    setObjectsMoving,
    startSimulation,
    finishTurn,
    scoreGoal,
    resetMatch,
  }
}
