import { Canvas, useThree } from '@react-three/fiber'
import { Physics, type RapierRigidBody } from '@react-three/rapier'
import { Suspense, useCallback, useEffect, useRef } from 'react'
import { PerspectiveCamera } from 'three'
import { HUD } from '../components/HUD'
import { DEBUG_PHYSICS, INITIAL_PLAYERS, MAX_POWER } from './constants'
import type { BodyRegistry } from './types'
import { useAiming } from './hooks/useAiming'
import { useGameState } from './hooks/useGameState'
import { AimIndicator } from './components/AimIndicator'
import { Arena } from './components/Arena'
import { Ball } from './components/Ball'
import { Bobble } from './components/Bobble'
import { Goal } from './components/Goal'
import { PhysicsMonitor } from './components/PhysicsMonitor'

function CameraRig() {
  const { camera, size } = useThree()

  useEffect(() => {
    const aspect = size.width / size.height

    if (aspect < 0.85) {
      camera.position.set(0, 22, 18)
    } else if (aspect < 1.25) {
      camera.position.set(21, 15, 0)
    } else {
      camera.position.set(17, 12, 0)
    }

    if (camera instanceof PerspectiveCamera) {
      camera.fov = aspect < 0.85 ? 46 : 43
    }
    camera.lookAt(0, 0.35, 0)
    camera.updateProjectionMatrix()
  }, [camera, size.height, size.width])

  return null
}

export function Game() {
  const game = useGameState()
  const bodies = useRef<BodyRegistry>(new Map())
  const { aim, plans, beginAim, updateAim, releaseAim, cancelAim, clearPlans } = useAiming()

  const registerBody = useCallback((id: string, body: RapierRigidBody | null) => {
    if (body) bodies.current.set(id, body)
    else bodies.current.delete(id)
  }, [])

  const resetMatch = useCallback(() => {
    cancelAim()
    clearPlans()
    game.resetMatch()
  }, [cancelAim, clearPlans, game.resetMatch])

  const executePlans = useCallback(() => {
    const plannedShots = Object.values(plans)
    if (game.phase !== 'AIMING' || plannedShots.length === 0) return

    // All planned impulses are queued in the same frame, before Rapier advances,
    // so the three bobbles launch simultaneously rather than sequentially.
    for (const shot of plannedShots) {
      const body = bodies.current.get(shot.playerId)
      if (!body) continue
      const strength = shot.power * MAX_POWER
      body.applyImpulse(
        {
          x: shot.direction.x * strength,
          y: 0,
          z: shot.direction.z * strength,
        },
        true,
      )
    }

    cancelAim()
    clearPlans()
    game.startSimulation()
  }, [cancelAim, clearPlans, game.phase, game.startSimulation, plans])

  return (
    <main className="game-shell">
      <Canvas
        aria-label="3D tabletop football arena"
        camera={{ fov: 43, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false }}
        shadows="basic"
        dpr={[1, 2]}
        onPointerMissed={cancelAim}
      >
        <color attach="background" args={['#dff3f7']} />
        <CameraRig />

        <hemisphereLight args={['#ffffff', '#79bdd0', 0.62]} />
        <ambientLight intensity={0.28} />
        <directionalLight
          castShadow
          position={[-8, 16, 10]}
          intensity={1.35}
          color="#fff7df"
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={38}
          shadow-camera-left={-13}
          shadow-camera-right={13}
          shadow-camera-top={13}
          shadow-camera-bottom={-13}
        />
        <Suspense fallback={null}>
          <Physics key={game.resetVersion} gravity={[0, -9.81, 0]} debug={DEBUG_PHYSICS}>
            <Arena />
            <Goal side="NORTH" onGoal={game.scoreGoal} />
            <Goal side="SOUTH" onGoal={game.scoreGoal} />
            {INITIAL_PLAYERS.map((player) => (
              <Bobble
                key={player.id}
                {...player}
                selectable={game.phase === 'AIMING' && game.activeTeam === player.team}
                selected={aim?.playerId === player.id}
                planned={Boolean(plans[player.id])}
                registerBody={registerBody}
                onAimStart={beginAim}
                onAimMove={updateAim}
                onAimEnd={releaseAim}
                onAimCancel={cancelAim}
              />
            ))}
            <Ball registerBody={registerBody} />
            <PhysicsMonitor
              bodies={bodies.current}
              phase={game.phase}
              onMovingChange={game.setObjectsMoving}
              onSettled={game.finishTurn}
            />
          </Physics>
        </Suspense>

        {Object.values(plans)
          .filter((plan) => plan.playerId !== aim?.playerId)
          .map((plan) => (
            <AimIndicator key={plan.playerId} aim={plan} team={game.activeTeam} planned />
          ))}
        {aim ? <AimIndicator aim={aim} team={game.activeTeam} /> : null}
      </Canvas>

      <HUD
        scores={game.scores}
        activeTeam={game.activeTeam}
        phase={game.phase}
        aim={aim}
        goalTeam={game.goalTeam}
        winner={game.winner}
        objectsMoving={game.objectsMoving}
        plannedCount={Object.keys(plans).length}
        onReady={executePlans}
        onReset={resetMatch}
      />
    </main>
  )
}
