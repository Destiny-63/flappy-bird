# Flappy Bird Browser Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a desktop browser Flappy Bird–style game (Space to flap/start/restart, scrolling pipes with random gaps, score + persistent high score, ready/playing/gameover screens) using Vite + TypeScript + Canvas 2D.

**Architecture:** Pure game logic modules (physics, pipes, collision, score, state) are independent of Canvas and covered by Vitest. A thin `GameWorld` orchestrates updates while `playing`. `render/draw.ts` paints from world snapshot; `main.ts` owns the animation loop and Space input routing.

**Tech Stack:** Vite, TypeScript, HTML Canvas 2D, Vitest

## Global Constraints

- Platform: browser only; play via `npm run dev` (desktop Chrome/Safari/Firefox).
- Input: Space only for flap / start / restart; no mobile touch.
- Scope: current score, `localStorage` high score, ready / playing / gameover UI; no sound, no external images, no backend, no E2E.
- Visual: code-drawn Canvas — gradient sky, simple bird silhouette, lightly decorated pipes.
- Logical canvas: **400×600**; CSS may scale display; logic uses logical pixels only.
- Copy (exact): ready 「按空格开始」; gameover 「游戏结束」 / 「按空格再来」; optional 「新纪录」 when high score beaten.
- High score key: `flappy-bird-high-score`; corrupt/missing storage → treat as `0`, never block play.
- Horizontal model: bird `x` fixed; pipes scroll left.
- On gameover Space → new `playing` run (not back to ready).
- YAGNI / TDD / frequent commits; no Phaser.

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `package.json` | Scripts: `dev`, `build`, `test` |
| `vite.config.ts` | Vite + Vitest config |
| `tsconfig.json` | TypeScript strict |
| `index.html` | Canvas host |
| `src/styles.css` | Page + canvas centering/scale |
| `src/game/constants.ts` | Tunable numbers (gravity, sizes, speeds) |
| `src/game/types.ts` | Shared types (`Bird`, `PipePair`, `Rect`, `GamePhase`) |
| `src/game/physics.ts` | Gravity, flap, integrate |
| `src/game/state.ts` | Phase transitions |
| `src/game/collision.ts` | AABB + bounds checks |
| `src/game/pipes.ts` | Spawn, scroll, recycle, gap rules |
| `src/game/score.ts` | Pass scoring + high-score storage |
| `src/game/world.ts` | Compose modules into one updatable world |
| `src/input/keyboard.ts` | Space edge detection |
| `src/render/draw.ts` | All Canvas drawing |
| `src/main.ts` | Boot, loop, wire input → world → draw |
| `src/game/*.test.ts` | Unit tests colocated with modules |

---

### Task 1: Scaffold Vite + TypeScript + Vitest + constants/types

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/styles.css`
- Create: `src/main.ts` (temporary stub)
- Create: `src/game/constants.ts`
- Create: `src/game/types.ts`
- Create: `src/game/constants.test.ts`
- Create: `.gitignore`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `CANVAS_WIDTH = 400`, `CANVAS_HEIGHT = 600`
  - `BIRD_X = 80`, `BIRD_WIDTH = 34`, `BIRD_HEIGHT = 24`
  - `GRAVITY = 1800` (px/s²), `FLAP_VELOCITY = -420` (px/s)
  - `PIPE_WIDTH = 60`, `PIPE_GAP = 150`, `PIPE_SPEED = 140` (px/s), `PIPE_SPACING = 220`
  - `PIPE_MIN_MARGIN = 40` (min solid above/below gap)
  - `HIGH_SCORE_KEY = 'flappy-bird-high-score'`
  - Types: `GamePhase = 'ready' | 'playing' | 'gameover'`, `Bird { x, y, vy, width, height }`, `Rect { x, y, width, height }`, `PipePair { x, gapCenterY, gapSize, width, scored }`

- [ ] **Step 1: Write the failing test**

Create `src/game/constants.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  HIGH_SCORE_KEY,
  PIPE_GAP,
  PIPE_MIN_MARGIN,
} from './constants'

describe('constants', () => {
  it('locks logical canvas to 400x600', () => {
    expect(CANVAS_WIDTH).toBe(400)
    expect(CANVAS_HEIGHT).toBe(600)
  })

  it('keeps pipe gap passable with margins', () => {
    expect(PIPE_GAP + 2 * PIPE_MIN_MARGIN).toBeLessThanOrEqual(CANVAS_HEIGHT)
  })

  it('uses the agreed high-score storage key', () => {
    expect(HIGH_SCORE_KEY).toBe('flappy-bird-high-score')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm install && npm test -- --run src/game/constants.test.ts`  
(If `package.json` does not exist yet, create the files in Step 3 first then run install+test; the first red run must show missing module `./constants` or failed assertions.)

Expected: FAIL (cannot resolve `./constants` or values undefined)

- [ ] **Step 3: Write minimal implementation**

`package.json`:

```json
{
  "name": "flappy-bird",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.8.2",
    "vite": "^6.2.0",
    "vitest": "^3.0.8"
  }
}
```

`vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "lib": ["ES2022", "DOM"],
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
```

`.gitignore`:

```
node_modules
dist
.DS_Store
```

`src/game/constants.ts`:

```ts
export const CANVAS_WIDTH = 400
export const CANVAS_HEIGHT = 600

export const BIRD_X = 80
export const BIRD_WIDTH = 34
export const BIRD_HEIGHT = 24

export const GRAVITY = 1800
export const FLAP_VELOCITY = -420

export const PIPE_WIDTH = 60
export const PIPE_GAP = 150
export const PIPE_SPEED = 140
export const PIPE_SPACING = 220
export const PIPE_MIN_MARGIN = 40

export const HIGH_SCORE_KEY = 'flappy-bird-high-score'
```

`src/game/types.ts`:

```ts
export type GamePhase = 'ready' | 'playing' | 'gameover'

export type Bird = {
  x: number
  y: number
  vy: number
  width: number
  height: number
}

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type PipePair = {
  x: number
  gapCenterY: number
  gapSize: number
  width: number
  scored: boolean
}
```

`index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Flappy Bird</title>
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <canvas id="game" width="400" height="600"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`src/styles.css`:

```css
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  height: 100%;
  background: #1a2332;
  display: grid;
  place-items: center;
  font-family: "Segoe UI", "PingFang SC", sans-serif;
}

#game {
  width: min(100vw - 24px, 400px);
  height: auto;
  image-rendering: auto;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  border-radius: 8px;
}
```

`src/main.ts`:

```ts
const canvas = document.getElementById('game')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Missing #game canvas')
}
const ctx = canvas.getContext('2d')
if (!ctx) {
  throw new Error('2D context unavailable')
}
ctx.fillStyle = '#87ceeb'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm install && npm test -- --run src/game/constants.test.ts`  
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json index.html .gitignore src
git commit -m "chore: scaffold Vite TypeScript Vitest and game constants"
```

---

### Task 2: Bird physics (gravity, flap, integrate)

**Files:**
- Create: `src/game/physics.ts`
- Create: `src/game/physics.test.ts`

**Interfaces:**
- Consumes: `Bird` from `./types`; `GRAVITY`, `FLAP_VELOCITY` from `./constants`
- Produces:
  - `createBird(y: number): Bird`
  - `flap(bird: Bird): void` — sets `bird.vy = FLAP_VELOCITY`
  - `stepBird(bird: Bird, dt: number): void` — `vy += GRAVITY * dt`, then `y += vy * dt`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { BIRD_HEIGHT, BIRD_WIDTH, BIRD_X, FLAP_VELOCITY, GRAVITY } from './constants'
import { createBird, flap, stepBird } from './physics'

describe('physics', () => {
  it('createBird places bird at fixed x with zero velocity', () => {
    const bird = createBird(200)
    expect(bird).toEqual({
      x: BIRD_X,
      y: 200,
      vy: 0,
      width: BIRD_WIDTH,
      height: BIRD_HEIGHT,
    })
  })

  it('gravity increases downward velocity and moves bird down', () => {
    const bird = createBird(100)
    stepBird(bird, 0.1)
    expect(bird.vy).toBeCloseTo(GRAVITY * 0.1)
    expect(bird.y).toBeCloseTo(100 + GRAVITY * 0.1 * 0.1)
  })

  it('flap sets a fixed upward velocity (does not stack)', () => {
    const bird = createBird(100)
    bird.vy = 50
    flap(bird)
    expect(bird.vy).toBe(FLAP_VELOCITY)
    flap(bird)
    expect(bird.vy).toBe(FLAP_VELOCITY)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/game/physics.test.ts`  
Expected: FAIL — cannot find module `./physics`

- [ ] **Step 3: Write minimal implementation**

```ts
import {
  BIRD_HEIGHT,
  BIRD_WIDTH,
  BIRD_X,
  FLAP_VELOCITY,
  GRAVITY,
} from './constants'
import type { Bird } from './types'

export function createBird(y: number): Bird {
  return {
    x: BIRD_X,
    y,
    vy: 0,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
  }
}

export function flap(bird: Bird): void {
  bird.vy = FLAP_VELOCITY
}

export function stepBird(bird: Bird, dt: number): void {
  bird.vy += GRAVITY * dt
  bird.y += bird.vy * dt
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/game/physics.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/physics.ts src/game/physics.test.ts
git commit -m "feat: add bird gravity and flap physics"
```

---

### Task 3: Game phase state machine

**Files:**
- Create: `src/game/state.ts`
- Create: `src/game/state.test.ts`

**Interfaces:**
- Consumes: `GamePhase` from `./types`
- Produces:
  - `transition(phase: GamePhase, event: 'space'): GamePhase`
  - Rules: `ready`+space → `playing`; `playing`+space → `playing` (flap handled elsewhere; phase unchanged); `gameover`+space → `playing`
  - `toGameOver(phase: GamePhase): GamePhase` — from `playing` → `gameover`; other phases unchanged

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { toGameOver, transition } from './state'

describe('state', () => {
  it('starts a run from ready on space', () => {
    expect(transition('ready', 'space')).toBe('playing')
  })

  it('keeps playing on space (flap is not a phase change)', () => {
    expect(transition('playing', 'space')).toBe('playing')
  })

  it('restarts from gameover on space', () => {
    expect(transition('gameover', 'space')).toBe('playing')
  })

  it('enters gameover only from playing', () => {
    expect(toGameOver('playing')).toBe('gameover')
    expect(toGameOver('ready')).toBe('ready')
    expect(toGameOver('gameover')).toBe('gameover')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/game/state.test.ts`  
Expected: FAIL — cannot find module `./state`

- [ ] **Step 3: Write minimal implementation**

```ts
import type { GamePhase } from './types'

export function transition(phase: GamePhase, event: 'space'): GamePhase {
  if (event !== 'space') return phase
  if (phase === 'ready') return 'playing'
  if (phase === 'gameover') return 'playing'
  return phase
}

export function toGameOver(phase: GamePhase): GamePhase {
  return phase === 'playing' ? 'gameover' : phase
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/game/state.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/state.ts src/game/state.test.ts
git commit -m "feat: add ready/playing/gameover state transitions"
```

---

### Task 4: Collision (AABB + bounds)

**Files:**
- Create: `src/game/collision.ts`
- Create: `src/game/collision.test.ts`

**Interfaces:**
- Consumes: `Bird`, `PipePair`, `Rect` from `./types`; `CANVAS_HEIGHT`, `PIPE_GAP` helpers via pipe solid derivation
- Produces:
  - `rectsOverlap(a: Rect, b: Rect): boolean`
  - `birdRect(bird: Bird): Rect`
  - `pipeSolids(pipe: PipePair, canvasHeight: number): { top: Rect; bottom: Rect }`
  - `hitsBounds(bird: Bird, canvasHeight: number): boolean` — true if `y < 0` or `y + height > canvasHeight`
  - `hitsPipes(bird: Bird, pipes: PipePair[], canvasHeight: number): boolean`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { CANVAS_HEIGHT } from './constants'
import {
  birdRect,
  hitsBounds,
  hitsPipes,
  pipeSolids,
  rectsOverlap,
} from './collision'
import type { Bird, PipePair } from './types'

const birdAt = (x: number, y: number): Bird => ({
  x,
  y,
  vy: 0,
  width: 34,
  height: 24,
})

describe('collision', () => {
  it('detects overlapping rects', () => {
    expect(
      rectsOverlap(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ),
    ).toBe(true)
    expect(
      rectsOverlap(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 11, y: 0, width: 10, height: 10 },
      ),
    ).toBe(false)
  })

  it('builds top/bottom solids around the gap', () => {
    const pipe: PipePair = {
      x: 100,
      gapCenterY: 300,
      gapSize: 150,
      width: 60,
      scored: false,
    }
    const { top, bottom } = pipeSolids(pipe, CANVAS_HEIGHT)
    expect(top).toEqual({ x: 100, y: 0, width: 60, height: 225 })
    expect(bottom).toEqual({ x: 100, y: 375, width: 60, height: 225 })
  })

  it('hits bounds at top or bottom', () => {
    expect(hitsBounds(birdAt(80, -1), CANVAS_HEIGHT)).toBe(true)
    expect(hitsBounds(birdAt(80, CANVAS_HEIGHT - 23), CANVAS_HEIGHT)).toBe(true)
    expect(hitsBounds(birdAt(80, 200), CANVAS_HEIGHT)).toBe(false)
  })

  it('hits pipe solid but not the gap corridor', () => {
    const pipe: PipePair = {
      x: 80,
      gapCenterY: 300,
      gapSize: 150,
      width: 60,
      scored: false,
    }
    expect(hitsPipes(birdAt(80, 50), [pipe], CANVAS_HEIGHT)).toBe(true)
    expect(hitsPipes(birdAt(80, 288), [pipe], CANVAS_HEIGHT)).toBe(false)
  })

  it('exposes birdRect from bird fields', () => {
    expect(birdRect(birdAt(80, 100))).toEqual({
      x: 80,
      y: 100,
      width: 34,
      height: 24,
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/game/collision.test.ts`  
Expected: FAIL — cannot find module `./collision`

- [ ] **Step 3: Write minimal implementation**

```ts
import type { Bird, PipePair, Rect } from './types'

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export function birdRect(bird: Bird): Rect {
  return { x: bird.x, y: bird.y, width: bird.width, height: bird.height }
}

export function pipeSolids(
  pipe: PipePair,
  canvasHeight: number,
): { top: Rect; bottom: Rect } {
  const gapTop = pipe.gapCenterY - pipe.gapSize / 2
  const gapBottom = pipe.gapCenterY + pipe.gapSize / 2
  return {
    top: { x: pipe.x, y: 0, width: pipe.width, height: gapTop },
    bottom: {
      x: pipe.x,
      y: gapBottom,
      width: pipe.width,
      height: canvasHeight - gapBottom,
    },
  }
}

export function hitsBounds(bird: Bird, canvasHeight: number): boolean {
  return bird.y < 0 || bird.y + bird.height > canvasHeight
}

export function hitsPipes(
  bird: Bird,
  pipes: PipePair[],
  canvasHeight: number,
): boolean {
  const birdR = birdRect(bird)
  for (const pipe of pipes) {
    const { top, bottom } = pipeSolids(pipe, canvasHeight)
    if (rectsOverlap(birdR, top) || rectsOverlap(birdR, bottom)) return true
  }
  return false
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/game/collision.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/collision.ts src/game/collision.test.ts
git commit -m "feat: add AABB pipe and bounds collision"
```

---

### Task 5: Pipe spawn, scroll, recycle

**Files:**
- Create: `src/game/pipes.ts`
- Create: `src/game/pipes.test.ts`

**Interfaces:**
- Consumes: constants; `PipePair` type
- Produces:
  - `clampGapCenter(gapCenterY: number, gapSize: number, canvasHeight: number, minMargin: number): number`
  - `createPipePair(x: number, gapCenterY: number, gapSize?: number, width?: number): PipePair`
  - `randomGapCenter(rng: () => number, canvasHeight: number, gapSize: number, minMargin: number): number` — `rng()` returns `[0,1)`
  - `stepPipes(pipes: PipePair[], dt: number, speed: number): void` — `x -= speed * dt`
  - `recyclePipes(pipes: PipePair[], canvasWidth: number): PipePair[]` — drop pipes with `x + width < 0`
  - `shouldSpawn(pipes: PipePair[], canvasWidth: number, spacing: number): boolean` — true if no pipes or rightmost `x <= canvasWidth - spacing`
  - `spawnPipe(pipes: PipePair[], canvasWidth: number, canvasHeight: number, rng: () => number): PipePair[]` — appends one pair at `x = canvasWidth` with random gap

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PIPE_GAP,
  PIPE_MIN_MARGIN,
  PIPE_SPACING,
  PIPE_WIDTH,
} from './constants'
import {
  clampGapCenter,
  createPipePair,
  randomGapCenter,
  recyclePipes,
  shouldSpawn,
  spawnPipe,
  stepPipes,
} from './pipes'

describe('pipes', () => {
  it('clamps gap so solids stay at least minMargin', () => {
    const min = PIPE_MIN_MARGIN + PIPE_GAP / 2
    const max = CANVAS_HEIGHT - PIPE_MIN_MARGIN - PIPE_GAP / 2
    expect(clampGapCenter(0, PIPE_GAP, CANVAS_HEIGHT, PIPE_MIN_MARGIN)).toBe(min)
    expect(clampGapCenter(9999, PIPE_GAP, CANVAS_HEIGHT, PIPE_MIN_MARGIN)).toBe(max)
  })

  it('randomGapCenter stays within safe range', () => {
    const y = randomGapCenter(() => 0.5, CANVAS_HEIGHT, PIPE_GAP, PIPE_MIN_MARGIN)
    const min = PIPE_MIN_MARGIN + PIPE_GAP / 2
    const max = CANVAS_HEIGHT - PIPE_MIN_MARGIN - PIPE_GAP / 2
    expect(y).toBeGreaterThanOrEqual(min)
    expect(y).toBeLessThanOrEqual(max)
  })

  it('scrolls left and recycles off-screen pipes', () => {
    const pipes = [createPipePair(-70, 300)]
    stepPipes(pipes, 1, 10)
    expect(pipes[0].x).toBe(-80)
    expect(recyclePipes(pipes, CANVAS_WIDTH)).toEqual([])
  })

  it('spawns when rightmost pipe is far enough left', () => {
    expect(shouldSpawn([], CANVAS_WIDTH, PIPE_SPACING)).toBe(true)
    const one = [createPipePair(CANVAS_WIDTH - PIPE_SPACING, 300)]
    expect(shouldSpawn(one, CANVAS_WIDTH, PIPE_SPACING)).toBe(true)
    const close = [createPipePair(CANVAS_WIDTH - 10, 300)]
    expect(shouldSpawn(close, CANVAS_WIDTH, PIPE_SPACING)).toBe(false)
  })

  it('spawnPipe appends a full on-screen gap pair', () => {
    const pipes = spawnPipe([], CANVAS_WIDTH, CANVAS_HEIGHT, () => 0.25)
    expect(pipes).toHaveLength(1)
    expect(pipes[0].x).toBe(CANVAS_WIDTH)
    expect(pipes[0].width).toBe(PIPE_WIDTH)
    expect(pipes[0].gapSize).toBe(PIPE_GAP)
    expect(pipes[0].scored).toBe(false)
    const gapTop = pipes[0].gapCenterY - pipes[0].gapSize / 2
    const gapBottom = pipes[0].gapCenterY + pipes[0].gapSize / 2
    expect(gapTop).toBeGreaterThanOrEqual(PIPE_MIN_MARGIN)
    expect(gapBottom).toBeLessThanOrEqual(CANVAS_HEIGHT - PIPE_MIN_MARGIN)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/game/pipes.test.ts`  
Expected: FAIL — cannot find module `./pipes`

- [ ] **Step 3: Write minimal implementation**

```ts
import { PIPE_GAP, PIPE_MIN_MARGIN, PIPE_WIDTH } from './constants'
import type { PipePair } from './types'

export function clampGapCenter(
  gapCenterY: number,
  gapSize: number,
  canvasHeight: number,
  minMargin: number,
): number {
  const min = minMargin + gapSize / 2
  const max = canvasHeight - minMargin - gapSize / 2
  return Math.min(max, Math.max(min, gapCenterY))
}

export function createPipePair(
  x: number,
  gapCenterY: number,
  gapSize: number = PIPE_GAP,
  width: number = PIPE_WIDTH,
): PipePair {
  return { x, gapCenterY, gapSize, width, scored: false }
}

export function randomGapCenter(
  rng: () => number,
  canvasHeight: number,
  gapSize: number,
  minMargin: number,
): number {
  const min = minMargin + gapSize / 2
  const max = canvasHeight - minMargin - gapSize / 2
  return min + rng() * (max - min)
}

export function stepPipes(pipes: PipePair[], dt: number, speed: number): void {
  for (const pipe of pipes) {
    pipe.x -= speed * dt
  }
}

export function recyclePipes(pipes: PipePair[], _canvasWidth: number): PipePair[] {
  return pipes.filter((pipe) => pipe.x + pipe.width >= 0)
}

export function shouldSpawn(
  pipes: PipePair[],
  canvasWidth: number,
  spacing: number,
): boolean {
  if (pipes.length === 0) return true
  const rightmost = Math.max(...pipes.map((p) => p.x))
  return rightmost <= canvasWidth - spacing
}

export function spawnPipe(
  pipes: PipePair[],
  canvasWidth: number,
  canvasHeight: number,
  rng: () => number,
): PipePair[] {
  const gapCenterY = randomGapCenter(
    rng,
    canvasHeight,
    PIPE_GAP,
    PIPE_MIN_MARGIN,
  )
  return [...pipes, createPipePair(canvasWidth, gapCenterY)]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/game/pipes.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/pipes.ts src/game/pipes.test.ts
git commit -m "feat: add pipe spawn scroll and recycle"
```

---

### Task 6: Scoring and high-score persistence

**Files:**
- Create: `src/game/score.ts`
- Create: `src/game/score.test.ts`

**Interfaces:**
- Consumes: `Bird`, `PipePair`; `HIGH_SCORE_KEY`
- Produces:
  - `applyPassScore(bird: Bird, pipes: PipePair[], score: number): number` — for each unscored pipe where `bird.x >= pipe.x + pipe.width`, mark `scored` and `score += 1`
  - `readHighScore(storage: StorageLike): number`
  - `writeHighScore(storage: StorageLike, value: number): void`
  - `updateHighScore(storage: StorageLike, score: number, highScore: number): number` — if `score > highScore`, persist and return `score`, else return `highScore`
  - `StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void }`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { HIGH_SCORE_KEY } from './constants'
import {
  applyPassScore,
  readHighScore,
  updateHighScore,
  writeHighScore,
} from './score'
import type { Bird, PipePair } from './types'

class MemoryStorage {
  private data = new Map<string, string>()
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null
  }
  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
}

const bird = (x: number): Bird => ({
  x,
  y: 200,
  vy: 0,
  width: 34,
  height: 24,
})

describe('score', () => {
  it('increments once when bird crosses pipe right edge', () => {
    const pipes: PipePair[] = [
      { x: 40, gapCenterY: 300, gapSize: 150, width: 60, scored: false },
    ]
    const next = applyPassScore(bird(100), pipes, 0)
    expect(next).toBe(1)
    expect(pipes[0].scored).toBe(true)
    expect(applyPassScore(bird(120), pipes, next)).toBe(1)
  })

  it('reads 0 for missing or corrupt high scores', () => {
    const storage = new MemoryStorage()
    expect(readHighScore(storage)).toBe(0)
    storage.setItem(HIGH_SCORE_KEY, 'nope')
    expect(readHighScore(storage)).toBe(0)
  })

  it('writes and only updates on a new record', () => {
    const storage = new MemoryStorage()
    writeHighScore(storage, 3)
    expect(readHighScore(storage)).toBe(3)
    expect(updateHighScore(storage, 2, 3)).toBe(3)
    expect(readHighScore(storage)).toBe(3)
    expect(updateHighScore(storage, 5, 3)).toBe(5)
    expect(readHighScore(storage)).toBe(5)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/game/score.test.ts`  
Expected: FAIL — cannot find module `./score`

- [ ] **Step 3: Write minimal implementation**

```ts
import { HIGH_SCORE_KEY } from './constants'
import type { Bird, PipePair } from './types'

export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function applyPassScore(
  bird: Bird,
  pipes: PipePair[],
  score: number,
): number {
  let next = score
  for (const pipe of pipes) {
    if (!pipe.scored && bird.x >= pipe.x + pipe.width) {
      pipe.scored = true
      next += 1
    }
  }
  return next
}

export function readHighScore(storage: StorageLike): number {
  try {
    const raw = storage.getItem(HIGH_SCORE_KEY)
    if (raw == null) return 0
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
  } catch {
    return 0
  }
}

export function writeHighScore(storage: StorageLike, value: number): void {
  try {
    storage.setItem(HIGH_SCORE_KEY, String(value))
  } catch {
    // ignore quota / privacy errors
  }
}

export function updateHighScore(
  storage: StorageLike,
  score: number,
  highScore: number,
): number {
  if (score > highScore) {
    writeHighScore(storage, score)
    return score
  }
  return highScore
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/game/score.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/score.ts src/game/score.test.ts
git commit -m "feat: add pass scoring and high score storage"
```

---

### Task 7: GameWorld orchestration

**Files:**
- Create: `src/game/world.ts`
- Create: `src/game/world.test.ts`

**Interfaces:**
- Consumes: physics, pipes, collision, score, state, constants
- Produces:
  - `type GameWorld = { phase: GamePhase; bird: Bird; pipes: PipePair[]; score: number; highScore: number; beatHighScore: boolean }`
  - `createWorld(storage: StorageLike): GameWorld` — phase `ready`, bird at y=`CANVAS_HEIGHT/2 - BIRD_HEIGHT/2`, empty pipes, score 0, highScore from storage, `beatHighScore: false`
  - `resetRun(world: GameWorld): void` — clear pipes, score 0, `beatHighScore: false`, recreate bird centered, keep highScore
  - `handleSpace(world: GameWorld, storage: StorageLike): void` — if ready/gameover: transition + `resetRun` + set phase `playing`; if playing: `flap(world.bird)`
  - `updateWorld(world: GameWorld, dt: number, storage: StorageLike, rng?: () => number): void` — no-op unless `playing`; step bird; step/recycle/spawn pipes; apply score; if hits pipes or bounds → `toGameOver`, `highScore = updateHighScore(...)`, set `beatHighScore` if score became highScore and score > previous

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { CANVAS_HEIGHT, CANVAS_WIDTH, PIPE_SPACING } from './constants'
import { createWorld, handleSpace, updateWorld } from './world'

class MemoryStorage {
  private data = new Map<string, string>()
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null
  }
  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
}

describe('world', () => {
  it('starts in ready and begins playing on space', () => {
    const world = createWorld(new MemoryStorage())
    expect(world.phase).toBe('ready')
    handleSpace(world, new MemoryStorage())
    expect(world.phase).toBe('playing')
    expect(world.pipes.length).toBeGreaterThanOrEqual(0)
  })

  it('does not update simulation while ready', () => {
    const world = createWorld(new MemoryStorage())
    const y = world.bird.y
    updateWorld(world, 1, new MemoryStorage())
    expect(world.bird.y).toBe(y)
  })

  it('ends the run when the bird hits the ground', () => {
    const storage = new MemoryStorage()
    const world = createWorld(storage)
    handleSpace(world, storage)
    world.bird.y = CANVAS_HEIGHT
    updateWorld(world, 0.016, storage)
    expect(world.phase).toBe('gameover')
  })

  it('spawns pipes while playing over time', () => {
    const storage = new MemoryStorage()
    const world = createWorld(storage)
    handleSpace(world, storage)
    for (let i = 0; i < 5; i++) {
      updateWorld(world, 0.5, storage, () => 0.5)
    }
    expect(world.pipes.length).toBeGreaterThan(0)
    expect(world.pipes[0].x).toBeLessThan(CANVAS_WIDTH)
  })

  it('restarts from gameover on space', () => {
    const storage = new MemoryStorage()
    const world = createWorld(storage)
    handleSpace(world, storage)
    world.phase = 'gameover'
    world.score = 4
    handleSpace(world, storage)
    expect(world.phase).toBe('playing')
    expect(world.score).toBe(0)
  })

  it('keeps PIPE_SPACING available for spawn cadence', () => {
    expect(PIPE_SPACING).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/game/world.test.ts`  
Expected: FAIL — cannot find module `./world`

- [ ] **Step 3: Write minimal implementation**

```ts
import {
  BIRD_HEIGHT,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PIPE_SPEED,
  PIPE_SPACING,
} from './constants'
import { hitsBounds, hitsPipes } from './collision'
import { createBird, flap, stepBird } from './physics'
import {
  recyclePipes,
  shouldSpawn,
  spawnPipe,
  stepPipes,
} from './pipes'
import {
  applyPassScore,
  readHighScore,
  updateHighScore,
  type StorageLike,
} from './score'
import { toGameOver, transition } from './state'
import type { Bird, GamePhase, PipePair } from './types'

export type GameWorld = {
  phase: GamePhase
  bird: Bird
  pipes: PipePair[]
  score: number
  highScore: number
  beatHighScore: boolean
}

export function createWorld(storage: StorageLike): GameWorld {
  return {
    phase: 'ready',
    bird: createBird(CANVAS_HEIGHT / 2 - BIRD_HEIGHT / 2),
    pipes: [],
    score: 0,
    highScore: readHighScore(storage),
    beatHighScore: false,
  }
}

export function resetRun(world: GameWorld): void {
  world.bird = createBird(CANVAS_HEIGHT / 2 - BIRD_HEIGHT / 2)
  world.pipes = []
  world.score = 0
  world.beatHighScore = false
}

export function handleSpace(world: GameWorld, storage: StorageLike): void {
  const next = transition(world.phase, 'space')
  if (world.phase === 'ready' || world.phase === 'gameover') {
    resetRun(world)
    world.highScore = readHighScore(storage)
    world.phase = next
    return
  }
  if (world.phase === 'playing') {
    flap(world.bird)
  }
}

export function updateWorld(
  world: GameWorld,
  dt: number,
  storage: StorageLike,
  rng: () => number = Math.random,
): void {
  if (world.phase !== 'playing') return

  stepBird(world.bird, dt)
  stepPipes(world.pipes, dt, PIPE_SPEED)
  world.pipes = recyclePipes(world.pipes, CANVAS_WIDTH)
  if (shouldSpawn(world.pipes, CANVAS_WIDTH, PIPE_SPACING)) {
    world.pipes = spawnPipe(world.pipes, CANVAS_WIDTH, CANVAS_HEIGHT, rng)
  }
  world.score = applyPassScore(world.bird, world.pipes, world.score)

  if (
    hitsBounds(world.bird, CANVAS_HEIGHT) ||
    hitsPipes(world.bird, world.pipes, CANVAS_HEIGHT)
  ) {
    const previousHigh = world.highScore
    world.phase = toGameOver(world.phase)
    world.highScore = updateHighScore(storage, world.score, world.highScore)
    world.beatHighScore = world.score > previousHigh
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/game/world.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/world.ts src/game/world.test.ts
git commit -m "feat: orchestrate game world update loop"
```

---

### Task 8: Keyboard Space edge detection

**Files:**
- Create: `src/input/keyboard.ts`
- Create: `src/input/keyboard.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `createSpaceInput(): { observe(target: EventTarget): () => void; consumeSpace(): boolean }`
  - `observe` registers `keydown`/`keyup` for `code === 'Space'` (preventDefault on keydown to avoid page scroll)
  - `consumeSpace()` returns true once per press edge (down), then false until release and press again

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { createSpaceInput } from './keyboard'

class FakeTarget {
  private listeners = new Map<string, Set<EventListener>>()
  addEventListener(type: string, listener: EventListener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(listener)
  }
  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener)
  }
  dispatch(type: string, event: { code: string; preventDefault(): void }) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event as unknown as Event)
    }
  }
}

describe('keyboard', () => {
  it('consumes one space edge per keydown', () => {
    const input = createSpaceInput()
    const target = new FakeTarget()
    const stop = input.observe(target as unknown as EventTarget)
    const preventDefault = () => {}

    expect(input.consumeSpace()).toBe(false)
    target.dispatch('keydown', { code: 'Space', preventDefault })
    expect(input.consumeSpace()).toBe(true)
    expect(input.consumeSpace()).toBe(false)
    target.dispatch('keyup', { code: 'Space', preventDefault })
    target.dispatch('keydown', { code: 'Space', preventDefault })
    expect(input.consumeSpace()).toBe(true)
    stop()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/input/keyboard.test.ts`  
Expected: FAIL — cannot find module `./keyboard`

- [ ] **Step 3: Write minimal implementation**

```ts
export function createSpaceInput() {
  let pressed = false
  let edge = false

  const onKeyDown = (event: Event) => {
    const e = event as KeyboardEvent
    if (e.code !== 'Space') return
    e.preventDefault()
    if (!pressed) {
      pressed = true
      edge = true
    }
  }

  const onKeyUp = (event: Event) => {
    const e = event as KeyboardEvent
    if (e.code !== 'Space') return
    pressed = false
  }

  return {
    observe(target: EventTarget): () => void {
      target.addEventListener('keydown', onKeyDown)
      target.addEventListener('keyup', onKeyUp)
      return () => {
        target.removeEventListener('keydown', onKeyDown)
        target.removeEventListener('keyup', onKeyUp)
      }
    },
    consumeSpace(): boolean {
      if (!edge) return false
      edge = false
      return true
    },
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/input/keyboard.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/input/keyboard.ts src/input/keyboard.test.ts
git commit -m "feat: add Space key edge input"
```

---

### Task 9: Canvas renderer

**Files:**
- Create: `src/render/draw.ts`
- Create: `src/render/draw.test.ts` (logic helpers only — color stops / layout numbers, not pixel asserts)

**Interfaces:**
- Consumes: `GameWorld`, constants
- Produces:
  - `drawFrame(ctx: CanvasRenderingContext2D, world: GameWorld): void`
  - Draws: vertical sky gradient (`#7ec8e3` → `#e8f4c8`), pipes (rounded green body `#3aa35a` + darker cap `#2d7a44`), bird (ellipse body `#f5d76e`, beak `#e67e22`, eye), HUD score top-center while playing, high score top-left always as `最高分 {n}`, ready overlay text `按空格开始`, gameover overlay with `游戏结束`, score, high score, `新纪录` if `beatHighScore`, `按空格再来`

Because Canvas drawing is hard to unit-test deeply, add a small pure helper and test it:

- `overlayTitle(phase: GamePhase): string | null` — ready → `按空格开始`; gameover → `游戏结束`; playing → `null`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { overlayTitle } from './draw'

describe('draw helpers', () => {
  it('returns Chinese titles for overlays', () => {
    expect(overlayTitle('ready')).toBe('按空格开始')
    expect(overlayTitle('gameover')).toBe('游戏结束')
    expect(overlayTitle('playing')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/render/draw.test.ts`  
Expected: FAIL — cannot find module `./draw`

- [ ] **Step 3: Write minimal implementation**

```ts
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../game/constants'
import { pipeSolids } from '../game/collision'
import type { GameWorld } from '../game/world'
import type { GamePhase } from '../game/types'

export function overlayTitle(phase: GamePhase): string | null {
  if (phase === 'ready') return '按空格开始'
  if (phase === 'gameover') return '游戏结束'
  return null
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
  sky.addColorStop(0, '#7ec8e3')
  sky.addColorStop(1, '#e8f4c8')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  for (const pipe of world.pipes) {
    const { top, bottom } = pipeSolids(pipe, CANVAS_HEIGHT)
    drawPipeSegment(ctx, top)
    drawPipeSegment(ctx, bottom)
  }

  drawBird(ctx, world.bird.x, world.bird.y, world.bird.width, world.bird.height)

  ctx.fillStyle = 'rgba(20, 30, 40, 0.75)'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`最高分 ${world.highScore}`, 12, 24)

  if (world.phase === 'playing') {
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(world.score), CANVAS_WIDTH / 2, 56)
  }

  const title = overlayTitle(world.phase)
  if (title) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 24)
    if (world.phase === 'gameover') {
      ctx.font = '20px sans-serif'
      ctx.fillText(`得分 ${world.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12)
      ctx.fillText(
        `最高分 ${world.highScore}`,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 40,
      )
      if (world.beatHighScore) {
        ctx.fillStyle = '#ffe566'
        ctx.fillText('新纪录', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 68)
      }
      ctx.fillStyle = '#fff'
      ctx.font = '18px sans-serif'
      ctx.fillText('按空格再来', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100)
    }
  }
}

function drawPipeSegment(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
): void {
  if (rect.height <= 0) return
  ctx.fillStyle = '#3aa35a'
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 6)
  ctx.fill()
  const capH = Math.min(18, rect.height)
  const capY = rect.y === 0 ? rect.height - capH : rect.y
  ctx.fillStyle = '#2d7a44'
  roundRect(ctx, rect.x - 4, capY, rect.width + 8, capH, 6)
  ctx.fill()
}

function drawBird(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const cx = x + w / 2
  const cy = y + h / 2
  ctx.fillStyle = '#f5d76e'
  ctx.beginPath()
  ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e67e22'
  ctx.beginPath()
  ctx.moveTo(x + w - 2, cy)
  ctx.lineTo(x + w + 10, cy - 4)
  ctx.lineTo(x + w + 10, cy + 4)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(cx + 6, cy - 4, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#222'
  ctx.beginPath()
  ctx.arc(cx + 7, cy - 4, 2, 0, Math.PI * 2)
  ctx.fill()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/render/draw.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/render/draw.ts src/render/draw.test.ts
git commit -m "feat: render sky pipes bird and overlay UI"
```

---

### Task 10: Wire main loop and ship playable game

**Files:**
- Modify: `src/main.ts` (replace stub)
- Verify: `index.html`, `src/styles.css` already present from Task 1

**Interfaces:**
- Consumes: `createWorld`, `handleSpace`, `updateWorld`, `createSpaceInput`, `drawFrame`
- Produces: running game in browser

- [ ] **Step 1: Write failing “smoke” by replacing main and running full unit suite first**

There is no new pure unit here; gate with full test suite before wiring:

Run: `npm test -- --run`  
Expected: all existing tests PASS (if any fail, fix before continuing).

- [ ] **Step 2: Implement `src/main.ts`**

```ts
import { createWorld, handleSpace, updateWorld } from './game/world'
import { createSpaceInput } from './input/keyboard'
import { drawFrame } from './render/draw'

const canvas = document.getElementById('game')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Missing #game canvas')
}
const ctx = canvas.getContext('2d')
if (!ctx) {
  throw new Error('2D context unavailable')
}

function getStorage(): Storage {
  try {
    const probe = window.localStorage
    probe.getItem('flappy-bird-high-score')
    return probe
  } catch {
    const mem = new Map<string, string>()
    return {
      get length() {
        return mem.size
      },
      clear() {
        mem.clear()
      },
      getItem(key: string) {
        return mem.has(key) ? mem.get(key)! : null
      },
      key() {
        return null
      },
      removeItem(key: string) {
        mem.delete(key)
      },
      setItem(key: string, value: string) {
        mem.set(key, value)
      },
    }
  }
}

const storage = getStorage()
const world = createWorld(storage)
const space = createSpaceInput()
space.observe(window)

let last = performance.now()

function frame(now: number) {
  const dt = Math.min(0.033, (now - last) / 1000)
  last = now

  if (space.consumeSpace()) {
    handleSpace(world, storage)
  }
  updateWorld(world, dt, storage)
  drawFrame(ctx, world)
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
```

- [ ] **Step 3: Typecheck / tests**

Run: `npm test -- --run`  
Expected: PASS  

Run: `npx tsc --noEmit`  
Expected: exit 0 (if `noEmit` project already; otherwise rely on `npm run build` after adjusting — with current `tsconfig` `noEmit: true`, `npx tsc` is enough)

- [ ] **Step 4: Manual play smoke (developer)**

Run: `npm run dev`  
Open the local URL. Verify checklist from spec:
1. Ready screen + 最高分 0  
2. Space starts; falls; Space lifts  
3. Pipes / gaps / collisions end run  
4. Gameover UI; Space restarts  
5. Reload keeps high score  

- [ ] **Step 5: Commit**

```bash
git add src/main.ts
git commit -m "feat: wire game loop input and rendering"
```

---

## Spec coverage self-check

| Spec requirement | Task |
|------------------|------|
| Vite + TS + Canvas + Vitest | 1, 9, 10 |
| Desktop Space only | 8, 10 |
| Gravity + fixed flap velocity | 2 |
| Pipes scroll, random gap, recycle | 5, 7 |
| Collision pipes + bounds | 4, 7 |
| Score on pass + high score localStorage | 6, 7 |
| ready / playing / gameover + copy | 3, 9, 10 |
| Code-drawn visuals | 9 |
| Gameover Space → new playing run | 3, 7 |
| Corrupt storage → 0 | 6, 10 |
| Manual acceptance | 10 |

No placeholders remaining after authoring. Types/signatures aligned across tasks (`GameWorld`, `StorageLike`, `PipePair.scored`, etc.).
