import { useEffect, useRef, useState } from 'react'
import { GameState } from './types'
import { WIDTH, HEIGHT, createInitialState, moveCluster, addPaletteColor } from './game'

const CELL_SIZE = 20

function useGame() {
  const [state, setState] = useState<GameState>(() => createInitialState())

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(-1)
      if (e.key === 'ArrowRight') move(1)
    }
    window.addEventListener('keydown', handleKey)
    const interval = setInterval(() => move(0,1), 500)
    return () => {
      window.removeEventListener('keydown', handleKey)
      clearInterval(interval)
    }
  }, [state])

  function move(dx: number, dy: number = 0) {
    setState(s => {
      const copy: GameState = JSON.parse(JSON.stringify(s))
      moveCluster(copy, dx, dy)
      return copy
    })
  }

  function addColor(color: string) {
    setState(s => {
      const copy: GameState = JSON.parse(JSON.stringify(s))
      addPaletteColor(copy, color)
      return copy
    })
  }

  return { state, addColor }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state, addColor } = useGame()

  useEffect(() => {
    const canvas = canvasRef.current!
    canvas.width = WIDTH * CELL_SIZE
    canvas.height = HEIGHT * CELL_SIZE
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0,0,canvas.width, canvas.height)
    // draw board
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const c = state.board[y][x]
        if (c) {
          ctx.fillStyle = c
          ctx.fillRect(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
      }
    }
    // draw active cluster
    ctx.fillStyle = state.active.color
    for (const [dx,dy] of state.active.shape) {
      const x = state.active.x + dx
      const y = state.active.y + dy
      ctx.fillRect(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }
  }, [state])

  const previewStyle = { display:'flex', gap:'0.5rem', marginTop:'1rem' }

  return (
    <div>
      <canvas ref={canvasRef} />
      <div style={previewStyle}>
        {state.queue.map((c, i) => (
          <div key={i} style={{display:'grid',gridTemplateColumns:'repeat(4,10px)',gap:'1px'}}>
            {Array.from({length:16}).map((_, idx) => {
              const x = idx % 4
              const y = Math.floor(idx / 4)
              const filled = c.shape.some(([sx, sy]) => sx === x && sy === y)
              return (
                <div
                  key={idx}
                  style={{
                    width: 10,
                    height: 10,
                    background: filled ? c.color : 'transparent',
                    border: '1px solid #555',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="controls">
        <input type="color" onChange={e=>addColor(e.target.value)} />
      </div>
    </div>
  )
}

