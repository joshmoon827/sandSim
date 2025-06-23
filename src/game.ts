import { Cell, Cluster, GameState } from './types'

export const WIDTH = 10
export const HEIGHT = 20

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

export function createEmptyBoard(): Cell[][] {
  return Array.from({ length: HEIGHT }, () => Array<Cell>(WIDTH).fill(null))
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
      board[y][x] = active.color
    }
  }
}

export function canMove(cluster: Cluster, board: Cell[][], dx: number, dy: number): boolean {
  for (const [sx, sy] of cluster.shape) {
    const x = cluster.x + sx + dx
    const y = cluster.y + sy + dy
    if (x < 0 || x >= WIDTH || y >= HEIGHT) return false
    if (y >= 0 && board[y][x]) return false
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

export function settle(board: Cell[][]) {
  let moved = false
  do {
    moved = false
    for (let y = HEIGHT - 2; y >= 0; y--) {
      for (let x = 0; x < WIDTH; x++) {
        if (board[y][x] && !board[y+1][x]) {
          board[y+1][x] = board[y][x]
          board[y][x] = null
          moved = true
        }
      }
    }
  } while (moved)
}

export function clearLines(board: Cell[][]) {
  for (let y = 0; y < HEIGHT; y++) {
    const color = board[y][0]
    if (!color) continue
    let full = true
    for (let x = 1; x < WIDTH; x++) {
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

function bfsClear(board: Cell[][], y: number, color: string) {
  const queue: [number, number][] = []
  const visited = new Set<string>()
  for (let x = 0; x < WIDTH; x++) {
    queue.push([x, y])
  }
  while (queue.length) {
    const [cx, cy] = queue.shift()!
    if (cx < 0 || cx >= WIDTH || cy < 0 || cy >= HEIGHT) continue
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
