import { createWorld, handleSpace, updateWorld } from './game/world'
import { createSpaceInput } from './input/keyboard'
import { drawFrame, loadBirdSprite } from './render/draw'

const canvas = document.getElementById('game')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Missing #game canvas')
}
const maybeCtx = canvas.getContext('2d')
if (!maybeCtx) {
  throw new Error('2D context unavailable')
}
const ctx: CanvasRenderingContext2D = maybeCtx

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

void loadBirdSprite().then(() => {
  requestAnimationFrame(frame)
})
