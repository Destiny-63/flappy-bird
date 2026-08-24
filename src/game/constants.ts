export const CANVAS_WIDTH = 400
export const CANVAS_HEIGHT = 600

export const BIRD_X = 80
export const BIRD_WIDTH = 34
export const BIRD_HEIGHT = 24
/** On-screen bird diameter scale (matches drawBird). */
export const BIRD_DRAW_SCALE = 1.65
export const BIRD_MODEL_SIZE = Math.max(BIRD_WIDTH, BIRD_HEIGHT) * BIRD_DRAW_SCALE

export const GRAVITY = 1800
export const FLAP_VELOCITY = -420

export const PIPE_WIDTH = 60
/** Default / mid gap (legacy reference); spawns use random in [MIN, MAX]. */
export const PIPE_GAP = 150
/** Smallest gap: at least two bird models tall. */
export const MIN_PIPE_GAP = 2 * BIRD_MODEL_SIZE
export const MAX_PIPE_GAP = 180
export const PIPE_SPEED = 140
export const PIPE_SPACING = 220
export const PIPE_MIN_MARGIN = 40

/** Score at which difficulty approaches max (gap/reachability). */
export const DIFFICULTY_SCORE_SCALE = 15
/** Assumed fastest sustainable flap interval for reachability (seconds). */
export const MIN_FLAP_INTERVAL = 0.14

/** After score exceeds this, newly spawned pipes can oscillate their gaps. */
export const MOVING_GAP_SCORE_THRESHOLD = 5
export const MOVING_GAP_AMPLITUDE = 55
export const MOVING_GAP_OMEGA = 1.85

export const HIGH_SCORE_KEY = 'flappy-bird-high-score'
