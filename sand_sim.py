import pygame
import sys

WIDTH, HEIGHT = 600, 400
CELL_SIZE = 4
GRID_WIDTH = WIDTH // CELL_SIZE
GRID_HEIGHT = HEIGHT // CELL_SIZE

EMPTY = 0
SAND = 1

colors = {
    EMPTY: (0, 0, 0),
    SAND: (194, 178, 128),
}

def create_grid():
    return [[EMPTY for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]

def update_grid(grid):
    for y in range(GRID_HEIGHT-2, -1, -1):
        for x in range(GRID_WIDTH):
            if grid[y][x] == SAND:
                below = grid[y+1][x]
                if below == EMPTY:
                    grid[y][x] = EMPTY
                    grid[y+1][x] = SAND
                else:
                    down_left = grid[y+1][x-1] if x > 0 else None
                    down_right = grid[y+1][x+1] if x < GRID_WIDTH-1 else None
                    if x > 0 and down_left == EMPTY:
                        grid[y][x] = EMPTY
                        grid[y+1][x-1] = SAND
                    elif x < GRID_WIDTH-1 and down_right == EMPTY:
                        grid[y][x] = EMPTY
                        grid[y+1][x+1] = SAND


def draw_grid(screen, grid):
    for y in range(GRID_HEIGHT):
        for x in range(GRID_WIDTH):
            color = colors[grid[y][x]]
            rect = pygame.Rect(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE)
            screen.fill(color, rect)

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    clock = pygame.time.Clock()
    grid = create_grid()

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:
                    mx, my = pygame.mouse.get_pos()
                    gx, gy = mx // CELL_SIZE, my // CELL_SIZE
                    if 0 <= gx < GRID_WIDTH and 0 <= gy < GRID_HEIGHT:
                        grid[gy][gx] = SAND

        update_grid(grid)
        draw_grid(screen, grid)
        pygame.display.flip()
        clock.tick(60)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
