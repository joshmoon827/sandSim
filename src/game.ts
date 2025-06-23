import { Pixel, Cluster, GameState } from './types'

export const WIDTH = 10
export const HEIGHT = 20

/**
 * Number of sand pixels that make up one traditional Tetris block. A higher
 * value means finer grained sand simulation.
 */
export const SUBDIV = 150

export const PIXEL_WIDTH = WIDTH * SUBDIV
export const PIXEL_HEIGHT = HEIGHT * SUBDIV

function regionOccupied(board: Pixel[][], cellX: number, cellY: number): boolean {
  const sx = cellX * SUBDIV
  const sy = cellY * SUBDIV
  for (let y = 0; y < SUBDIV; y++) {
    for (let x = 0; x < SUBDIV; x++) {
      if (board[sy + y] && board[sy + y][sx + x]) return true
    }
  }
  return false
}

function fillRegion(board: Pixel[][], cellX: number, cellY: number, color: string) {
  const sx = cellX * SUBDIV
  const sy = cellY * SUBDIV
  for (let y = 0; y < SUBDIV; y++) {
    for (let x = 0; x < SUBDIV; x++) {
      const py = sy + y
      const px = sx + x
      if (py >= 0 && py < PIXEL_HEIGHT && px >= 0 && px < PIXEL_WIDTH) {
        board[py][px] = color
      }
    }
  }
}

export const DEFAULT_PALETTE = [
  '#F94144',
  '#F3722C',
  '#90BE6D',
  '#577590',
  '#277DA1',
]

const SHAPES: [number, number][][] = [
  [ [0,0], [1,0], [0,1], [1,1] ], // O
  [ [0,0], [1,0], [2,0], [3,0] ], // I
  [ [0,0], [1,0], [2,0], [2,1] ], // L
  [ [0,0], [1,0], [2,0], [0,1] ], // J
  [ [0,0], [1,0], [1,1], [2,1] ], // Z
  [ [1,0], [2,0], [0,1], [1,1] ], // S
]

export function createEmptyBoard(): Pixel[][] {
  return Array.from({ length: PIXEL_HEIGHT }, () =>
    Array<Pixel>(PIXEL_WIDTH).fill(null)
  )
}

function randomShape(): [number, number][] {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)]
}

function randomColor(palette: string[]): string {
  return palette[Math.floor(Math.random() * palette.length)]
}

export function createCluster(palette: string[]): Cluster {
  return {
    shape: randomShape(),
    color: randomColor(palette),
    x: Math.floor(WIDTH / 2) - 1,
    y: 0,
  }
}

export function createInitialState(): GameState {
  const palette = DEFAULT_PALETTE.slice()
  const active = createCluster(palette)
  const queue = [createCluster(palette), createCluster(palette)]
  return { board: createEmptyBoard(), active, queue, palette }
}

export function mergeCluster(state: GameState) {
  const { board, active } = state
  for (const [dx, dy] of active.shape) {
    const x = active.x + dx
    const y = active.y + dy
    if (y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) {
      fillRegion(board, x, y, active.color)
    }
  }
}

export function canMove(cluster: Cluster, board: Pixel[][], dx: number, dy: number): boolean {
  for (const [sx, sy] of cluster.shape) {
    const x = cluster.x + sx + dx
    const y = cluster.y + sy + dy
    if (x < 0 || x >= WIDTH || y >= HEIGHT) return false
    if (y >= 0 && regionOccupied(board, x, y)) return false
  }
  return true
}

export function moveCluster(state: GameState, dx: number, dy: number) {
  if (canMove(state.active, state.board, dx, dy)) {
    state.active.x += dx
    state.active.y += dy
  } else if (dy === 1) {
    // landed
    mergeCluster(state)
    clearLines(state.board)
    settle(state.board)
    state.active = state.queue.shift()!
    state.queue.push(createCluster(state.palette))
  }
}

export function settle(board: Pixel[][]) {
  let moved = false
  do {
    moved = false
    for (let y = PIXEL_HEIGHT - 2; y >= 0; y--) {
      for (let x = 0; x < PIXEL_WIDTH; x++) {
        const c = board[y][x]
        if (!c) continue
        if (!board[y+1][x]) {
          board[y+1][x] = c
          board[y][x] = null
          moved = true
        } else {
          const left = x > 0 && !board[y+1][x-1]
          const right = x < PIXEL_WIDTH - 1 && !board[y+1][x+1]
          if (left && right) {
            if (Math.random() < 0.5) {
              board[y+1][x-1] = c
            } else {
              board[y+1][x+1] = c
            }
            board[y][x] = null
            moved = true
          } else if (left) {
            board[y+1][x-1] = c
            board[y][x] = null
            moved = true
          } else if (right) {
            board[y+1][x+1] = c
            board[y][x] = null
            moved = true
          }
        }
      }
    }
  } while (moved)
}

export function clearLines(board: Pixel[][]) {
  for (let y = 0; y < PIXEL_HEIGHT; y++) {
    const color = board[y][0]
    if (!color) continue
    let full = true
    for (let x = 1; x < PIXEL_WIDTH; x++) {
      if (board[y][x] !== color) {
        full = false
        break
      }
    }
    if (full) {
      bfsClear(board, y, color)
    }
  }
}

function bfsClear(board: Pixel[][], y: number, color: string) {
  const queue: [number, number][] = []
  const visited = new Set<string>()
  for (let x = 0; x < PIXEL_WIDTH; x++) {
    queue.push([x, y])
  }
  while (queue.length) {
    const [cx, cy] = queue.shift()!
    if (cx < 0 || cx >= PIXEL_WIDTH || cy < 0 || cy >= PIXEL_HEIGHT) continue
    const key = `${cx},${cy}`
    if (visited.has(key)) continue
    if (board[cy][cx] !== color) continue
    visited.add(key)
    board[cy][cx] = null
    queue.push([cx+1, cy])
    queue.push([cx-1, cy])
    queue.push([cx, cy+1])
    queue.push([cx, cy-1])
  }
}

export function addPaletteColor(state: GameState, color: string) {
  state.palette.push(color)
}
