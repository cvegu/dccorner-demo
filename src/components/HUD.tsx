import { TEAM_COLORS, WIN_SCORE } from '../game/constants'
import type { AimState, GamePhase, Scores, Team } from '../game/types'

interface HUDProps {
  scores: Scores
  activeTeam: Team
  phase: GamePhase
  aim: AimState | null
  goalTeam: Team | null
  winner: Team | null
  objectsMoving: boolean
  plannedCount: number
  onReady: () => void
  onReset: () => void
}

const TEAM_NAMES: Record<Team, string> = {
  BLUE: 'TURQUOISE',
  RED: 'PURPLE',
}

const PHASE_LABELS: Record<GamePhase, string> = {
  AIMING: 'PLANNING',
  SIMULATING: 'IN PLAY',
  GOAL: 'GOAL!',
  GAME_OVER: 'FULL TIME',
}

export function HUD({
  scores,
  activeTeam,
  phase,
  aim,
  goalTeam,
  winner,
  objectsMoving,
  plannedCount,
  onReady,
  onReset,
}: HUDProps) {
  const power = Math.round((aim?.power ?? 0) * 100)
  const activeColor = TEAM_COLORS[activeTeam].main
  const instruction = phase === 'AIMING'
    ? plannedCount > 0
      ? 'Nice setup! Plan up to three shots, then launch them together.'
      : 'Drag a bobble backwards to aim and set its power.'
    : phase === 'SIMULATING'
      ? 'The play is live — watch the bounce!'
      : PHASE_LABELS[phase]

  return (
    <div className="hud">
      <header className="hud-bar">
        <div className="brand-lockup" aria-label="DCCorner">
          <span className="brand-name">DC<b>Corner</b></span>
        </div>

        <div className="scoreboard" aria-label={`Score: Turquoise ${scores.BLUE}, Purple ${scores.RED}`}>
          <div className="score-team score-team--turquoise">
            <span className="team-dot" />
            <span className="team-name">TURQUOISE</span>
            <strong>{scores.BLUE}</strong>
          </div>
          <span className="score-divider">:</span>
          <div className="score-team score-team--purple">
            <strong>{scores.RED}</strong>
            <span className="team-name">PURPLE</span>
            <span className="team-dot" />
          </div>
        </div>

        <div className="match-meta">
          <div className="turn-indicator">
            <span className="turn-label">TURN</span>
            <span className="turn-team" style={{ color: activeColor }}>
              <span className="turn-dot" style={{ backgroundColor: activeColor }} />
              {TEAM_NAMES[activeTeam]}
            </span>
          </div>
          <button className="icon-button" type="button" onClick={onReset} aria-label="Restart match" title="Restart match">
            ↻
          </button>
        </div>
      </header>

      <div className="instruction-card" role="status">
        <span className="phase-badge">{PHASE_LABELS[phase]}</span>
        <p>{instruction}</p>
      </div>

      <div className="hud-controls">
        <div className="plan-counter">
          <span className="control-label">SHOTS PLANNED</span>
          <div className="plan-pips" aria-label={`${plannedCount} of 3 shots planned`}>
            {[0, 1, 2].map((index) => (
              <span key={index} className={index < plannedCount ? 'plan-pip is-filled' : 'plan-pip'} />
            ))}
          </div>
        </div>

        <label className="power-control">
          <span className="control-label">SHOT POWER</span>
          <span className="power-row">
            <progress max="100" value={power} aria-label={`Shot power ${power}%`} />
            <strong>{power}%</strong>
          </span>
        </label>

        <button
          className="launch-button"
          type="button"
          disabled={phase !== 'AIMING' || plannedCount === 0}
          onClick={onReady}
        >
          <span>LAUNCH PLAY</span>
          <span className="launch-icon" aria-hidden="true">➜</span>
        </button>
      </div>

      <div className="win-target">FIRST TO {WIN_SCORE}</div>

      {import.meta.env.DEV ? (
        <pre className="debug-panel">{phase} · {activeTeam} · moving {String(objectsMoving)}</pre>
      ) : null}

      {phase === 'GOAL' ? (
        <div className="message-overlay message-overlay--goal">
          <div className="goal-burst" aria-hidden="true" />
          <div className="goal-card">
            <span className="overlay-kicker">WHAT A SHOT!</span>
            <strong style={{ color: goalTeam ? TEAM_COLORS[goalTeam].main : undefined }}>GOAL!</strong>
            <p>{goalTeam ? TEAM_NAMES[goalTeam] : ''} scores</p>
          </div>
        </div>
      ) : null}

      {phase === 'GAME_OVER' ? (
        <div className="message-overlay">
          <div className="result-card">
            <span className="result-accent" />
            <span className="overlay-kicker">MATCH COMPLETE</span>
            <h1>{winner ? TEAM_NAMES[winner] : ''} WINS!</h1>
            <div className="final-score">
              <strong>{scores.BLUE}</strong>
              <span>FINAL SCORE</span>
              <strong>{scores.RED}</strong>
            </div>
            <button className="play-again-button" type="button" onClick={onReset}>
              PLAY AGAIN <span aria-hidden="true">↻</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
