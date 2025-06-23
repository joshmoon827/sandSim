export type Cell = string | null

export interface Cluster {
  shape: [number, number][]
  color: string
  x: number
  y: number
}

export interface GameState {
  board: Cell[][]
  active: Cluster
  queue: Cluster[]
  palette: string[]
}
