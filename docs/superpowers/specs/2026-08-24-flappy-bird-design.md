# Flappy Bird–Style Browser Game — Design Spec

**Date:** 2026-08-24  
**Status:** Approved for implementation planning

## Goal

Build a desktop browser game similar to Flappy Bird: a bird moves forward continuously in the horizontal sense, falls under gravity vertically, rises a fixed amount on Space, and must pass through randomly placed gaps in pipes. Hitting solid pipe or the top/bottom of the playfield ends the game. First version includes current score, persistent high score, and simple ready / playing / game-over screens.

## Constraints (product)

- **Platform:** Browser only; open a local/static page to play.
- **Input:** Desktop keyboard — Space only for flap / start / restart. No mobile touch.
- **Scope (MVP+):** Current score, high score via `localStorage`, start and end screens. No sound, no external image assets, no backend leaderboard, no E2E automation.
- **Visual:** Code-drawn Canvas art — gradient sky, simple bird silhouette, lightly decorated pipes (not flat color blocks only; no sprite sheets).

## Tech Stack

- Vite
- TypeScript
- HTML Canvas 2D
- Vitest (unit tests for rules that do not need a real canvas)

## Architecture

Logical canvas size is fixed (e.g. **400×600**). CSS may scale the canvas for display; game logic and collision always use logical coordinates.

| Module | Responsibility |
|--------|----------------|
| `game/physics` | Constant gravity; Space applies a fixed upward velocity (same value each flap; does not stack into infinite hover). |
| `game/pipes` | Spawn pipe pairs at intervals; random gap center within safe bounds; constant leftward scroll; recycle when off-screen left. |
| `game/collision` | AABB bird vs pipe solids; bird vs top/bottom bounds. |
| `game/score` | +1 when bird’s x crosses a pipe pair’s right edge without collision; each pair scored once; read/write high score in `localStorage`. |
| `game/state` | State machine: `ready` → `playing` → `gameover` → (Space) back to `playing` for a new run. |
| `render/` | Gradient sky, bird outline, pipe decoration, HUD (score / high score), ready and game-over copy. |
| `input/` | Space key only; behavior depends on current state. |
| `main` | Game loop (`requestAnimationFrame` or fixed timestep): input → update → collision → render. |

**Horizontal motion model:** Bird’s x is fixed on the left side of the canvas; pipes scroll left so the bird appears to fly forward.

**Out of scope:** Audio, touch, external assets, online scores, pause-on-blur, Phaser/other engines.

## Gameplay & Physics

### Bird

- Continuous downward acceleration from gravity every frame while `playing`.
- On Space while `playing`: set vertical velocity to a single fixed upward value (feels like a fixed lift distance).
- Hitting canvas top or bottom → `gameover` (same as pipe hit).

### Pipes

- Each obstacle is a pair: upper solid + lower solid with a gap between.
- Gap center y is random within a range that keeps the full gap on-screen and leaves positive solid height above and below.
- Fixed pipe width; roughly fixed horizontal spacing; constant scroll speed left.
- Pairs fully past the left edge are removed/recycled.

### Scoring & end

- When the bird’s x crosses the right edge of a pipe pair and no collision occurred for that pair → score += 1 (once per pair).
- Any AABB overlap with pipe solid → `gameover`.
- On `gameover`: stop simulation updates; if current score > high score, write high score; show end UI; **Space starts a new `playing` run** (reset score, pipes, bird).

### Feel targets

- Without flapping, the bird reaches the bottom in a short time (classic difficulty).
- Rhythmic flapping can clear gaps; spam-flapping must not allow indefinite hovering in place.
- Numeric constants (gravity, flap velocity, gap size, scroll speed) may be tuned in implementation while preserving these targets.

## UI & States

| State | Visual | Space |
|-------|--------|-------|
| `ready` | Gradient sky, bird idle (optional slight bob), “按空格开始”, show high score | Enter `playing`; reset score and pipes |
| `playing` | Full scene; HUD: current score (high score may stay visible) | Flap only |
| `gameover` | Frozen last frame and/or light overlay; “游戏结束”; this run’s score; high score (optional “新纪录” if beaten); “按空格再来” | New run → `playing` |

**Resilience:** If `localStorage` is missing or corrupt, treat high score as `0` and continue; do not block play with dialogs. Pause-on-blur is not required.

## Testing

### Automated (Vitest)

- **Physics:** Gravity increases downward velocity without input; flap sets fixed upward velocity; position integrates velocity.
- **Pipes:** Gap fully on-screen; upper/lower solids have height > 0; spacing rules hold.
- **Collision:** Overlap with solid → hit; path through gap only → no hit; top/bottom bounds → hit.
- **Score:** Cross pipe right edge without hit → +1; same pair not double-counted.
- **High score:** New record persists; non-record does not overwrite; bad stored data → 0.
- **State:** Legal transitions only among `ready` / `playing` / `gameover`.

### Manual acceptance

1. Load shows ready screen and high score (0 on first visit).
2. Space starts; bird falls; Space lifts.
3. Pipes approach from the right; gaps are passable; hit pipe/top/bottom ends the run.
4. Game-over shows run score and high score; Space starts again.
5. Reload page: high score remains.

**Not required:** Browser E2E, screenshot/pixel diffs, audio tests.

## File layout (indicative)

```
index.html
package.json
vite.config.ts
vitest.config.ts
src/
  main.ts
  input/keyboard.ts
  game/
    physics.ts
    pipes.ts
    collision.ts
    score.ts
    state.ts
    types.ts
  render/
    draw.ts
  styles.css
src/**/*.test.ts   # colocated or under src/game/
```

Exact paths may be adjusted in the implementation plan; responsibilities above are normative.

## Success criteria

- Playable in desktop Chrome/Safari/Firefox via `npm run dev` (or equivalent).
- Matches gameplay rules in this spec.
- Unit tests cover physics, pipes, collision, score, high score, and state transitions.
- Manual acceptance checklist passes.
- No features listed under “Out of scope” / product constraints unless a later spec revises this document.
