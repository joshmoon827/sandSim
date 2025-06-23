export type Cell = string | null

/**
 * A single sand pixel. When null, the pixel is empty. Otherwise it contains the
 * color of the sand grain occupying that location.
 */
export type Pixel = string | null

export interface Cluster {
  shape: [number, number][]
  color: string
  x: number
  y: number
}

export interface GameState {
  /**
   * 2D array representing the sand field at pixel resolution. The dimensions
   * are determined by the constants in `game.ts`.
   */
  board: Pixel[][]
  active: Cluster
  queue: Cluster[]
  palette: string[]
}
