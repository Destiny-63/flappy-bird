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
