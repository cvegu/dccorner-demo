# DCCorner

Prototipo local de un juego de fútbol táctico por turnos. La intención es demostrar que la mecánica central puede construirse en el navegador con React, Three.js y un motor físico open source, sin crear un motor gráfico o físico desde cero.

La demo no usa assets, nombres, personajes, sonidos ni branding de juegos existentes. Todo se construye con geometrías básicas.

## Ejecutar el proyecto

Requisitos:

- Node.js 22 LTS recomendado (también funciona con Node.js 20.19 o superior);
- npm;
- un navegador con WebGL, como Chrome.

```bash
npm install
npm run dev
```

Vite mostrará una URL local, normalmente `http://localhost:5173`.

Para validar en un solo paso que TypeScript y el build de producción están correctos:

```bash
npm run check
```

Para comprobar la versión de producción:

```bash
npm run build
npm run preview
```

En CI o después de clonar, `npm ci` instala exactamente las versiones registradas en
`package-lock.json`.

## Cómo se juega

Cada equipo tiene tres bobbles. En su turno el jugador prepara los movimientos antes de ejecutar la física:

1. Arrastra desde un bobble del equipo activo.
2. La flecha muestra la dirección del disparo, opuesta al arrastre.
3. La longitud del arrastre determina la potencia.
4. Al soltar, la orden queda guardada pero la pieza no se mueve todavía.
5. Es posible configurar uno, dos o los tres bobbles.
6. Un clic corto sobre un bobble configurado elimina su orden.
7. Al presionar **Ready**, todos los impulsos guardados se aplican en el mismo paso físico.
8. Cuando todas las piezas y la pelota se detienen, comienza el turno del otro equipo.

Gana el primer equipo que marca tres goles.

## Flujo principal

```text
AIMING
  │
  ├─ raycasting del mouse contra el plano de juego
  ├─ cálculo de dirección y potencia
  ├─ almacenamiento de 1 a 3 órdenes
  │
  └─ READY
       ↓
SIMULATING
  │
  ├─ aplicación simultánea de impulsos
  ├─ colisiones y rebotes de Rapier
  ├─ detección de goles
  └─ detección de reposo
       ↓
AIMING del otro equipo
```

También existen los estados `GOAL` y `GAME_OVER`.

## Librerías open source

### Vite

Servidor de desarrollo y herramienta de build. Se ocupa de transformar TypeScript, servir los módulos durante desarrollo y crear la carpeta `dist`.

### React

Administra el estado del partido y la interfaz HTML: marcador, turno, potencia, órdenes preparadas y botones.

### three

Es la biblioteca 3D base. Proporciona la escena, cámara, luces, materiales, geometrías, vectores, rayos y planos matemáticos.

### @react-three/fiber

Renderer de React para Three.js. Permite describir la escena 3D con componentes JSX y ofrece el render loop mediante `useFrame`.

### @react-three/drei

Colección de utilidades para React Three Fiber. En esta demo se usa principalmente `Line` para dibujar las flechas de apuntado y `useCursor` para el feedback del puntero.

### @react-three/rapier

Integración de Rapier con React Three Fiber. Rapier calcula cuerpos rígidos, colliders, impulsos, rebotes, fricción, sensores y velocidades.

No se implementan manualmente integración física, detección de colisiones, raycasters ni operaciones vectoriales.

## Mouse, raycasting y apuntado

Las coordenadas del mouse están en una pantalla 2D, pero la cancha existe en un mundo 3D. No es correcto convertir el movimiento usando únicamente píxeles de pantalla, porque el resultado cambiaría con la cámara y la resolución.

React Three Fiber entrega un `Ray` que parte desde la cámara y pasa por la posición del puntero. La función `projectRayToHorizontalPlane` intersecta ese rayo con un plano horizontal ubicado a la altura de los bobbles:

```text
mouse 2D
  ↓
rayo desde la cámara
  ↓
intersección con plano Y constante
  ↓
posición X/Z dentro de la cancha
```

La dirección usa el vector opuesto al arrastre:

```ts
direction = dragStart - currentPointer
```

La potencia es la distancia del drag normalizada y limitada:

```ts
power = min(dragDistance / MAX_DRAG, 1)
impulseStrength = power * MAX_POWER
```

El código correspondiente está en:

- `src/game/hooks/useAiming.ts`;
- `src/game/utils/physics.ts`;
- `src/game/components/AimIndicator.tsx`.

## Ejecución simultánea

Durante `AIMING`, `useAiming` mantiene un objeto de órdenes indexado por el identificador de cada bobble. Una orden contiene:

- origen;
- dirección normalizada;
- potencia entre 0 y 1;
- posición del drag usada para el indicador.

Al presionar Ready, `Game.tsx` recorre las órdenes y llama a `applyImpulse` para cada cuerpo antes de que Rapier avance al siguiente paso. Por eso todos los bobbles comienzan a moverse simultáneamente.

Los bobbles sin orden no reciben impulso, aunque pueden moverse después al ser golpeados.

## Física

Cada bobble y la pelota son `RigidBody` reales con colliders separados de su geometría visual.

Parámetros importantes:

- los bobbles tienen mucha más masa que la pelota;
- `linearDamping` reduce gradualmente la velocidad;
- `friction` controla el roce durante contactos;
- `restitution` determina cuánto rebota una colisión;
- `ccd` reduce el riesgo de atravesar objetos a alta velocidad;
- la traducción vertical está bloqueada;
- los bobbles no pueden rotar físicamente y permanecen verticales.

La pelota tiene menor damping y fricción, y mayor restitución. Esto le da más inercia y permite rebotes más visibles.

La geometría visual se mantiene deliberadamente simple y no modifica los colliders.

## Detección de reposo

No se usa un timeout fijo para terminar un turno.

`PhysicsMonitor.tsx` consulta la velocidad X/Z de los siete cuerpos. Si todos permanecen bajo `REST_SPEED_THRESHOLD` durante `REST_TIME`, sus pequeñas velocidades residuales se llevan a cero y cambia el turno.

Esto es más robusto que asumir que todas las jugadas duran la misma cantidad de segundos.

## Goles

Cada portería contiene un `CuboidCollider` configurado como sensor. Un sensor detecta intersecciones pero no empuja físicamente la pelota.

Cuando el rigid body llamado `ball` entra en el sensor:

1. se identifica el equipo que marcó;
2. se incrementa el marcador;
3. se muestra el estado `GOAL`;
4. se recrea el mundo físico en su formación inicial;
5. continúa el partido o se muestra `GAME_OVER`.

## Cámara

La cámara está elevada y ubicada al costado de la cancha, similar a una transmisión de fútbol. Es fija y no puede controlarse manualmente. Esto reduce código y mantiene la cancha completa siempre visible.

## Estado de React y estado de Rapier

Conviene separar dos tipos de información:

- **React state:** marcador, equipo activo, fase, ganador, potencia y órdenes preparadas;
- **Rapier state:** posición, velocidad, masa y contactos de los cuerpos físicos.

Las referencias a los rigid bodies se guardan en un `Map`. Consultar velocidades dentro de `useFrame` no provoca un render de React en cada frame. React sólo se actualiza cuando cambia algo relevante para la interfaz.

## Estructura principal

```text
src/
  App.tsx
  components/
    HUD.tsx
  game/
    Game.tsx
    constants.ts
    types.ts
    components/
      Arena.tsx
      Bobble.tsx
      Ball.tsx
      Goal.tsx
      AimIndicator.tsx
      PhysicsMonitor.tsx
    hooks/
      useAiming.ts
      useGameState.ts
    utils/
      physics.ts
```

`Game.tsx` conecta el estado, el Canvas, Rapier y los componentes. La lógica de apuntado y la lógica del partido se mantienen en hooks diferentes para que puedan estudiarse por separado.

## Debug

En `src/game/constants.ts` existe:

```ts
export const DEBUG_PHYSICS = false
```

Al cambiarlo a `true`, React Three Rapier dibuja los colliders. Es útil para investigar colisiones, tamaños incorrectos o sensores de gol.

En desarrollo también se muestran la fase, el equipo activo y si existen objetos en movimiento.

## Conceptos útiles para estudiar

- sistemas de coordenadas locales y globales;
- vectores, normalización y magnitud;
- intersección rayo-plano;
- scene graph de Three.js;
- render loops;
- cuerpos rígidos y colliders;
- masa, impulso, damping, fricción y restitución;
- continuous collision detection;
- sensores físicos;
- máquinas de estado;
- separación entre simulación y presentación;
- referencias mutables para datos actualizados cada frame.

## Limitaciones de la demo

- toda la simulación vive en el navegador;
- no existe backend ni persistencia;
- no existe sincronización entre computadores;
- la física no es autoritativa ni está protegida contra modificaciones;
- no existen audio, IA o controles para dispositivos móviles.

Para convertirla en multijugador sería necesario agregar un servidor autoritativo, protocolo de comandos, WebSockets, salas, matchmaking, snapshots físicos, reconciliación y validación de turnos. La escena, los componentes visuales, el raycasting y gran parte del HUD podrían reutilizarse.
