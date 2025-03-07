export class Agent {
  constructor(x, y, grid, cols, rows, ctx, cellSize) {
    this.x = x;
    this.y = y;
    this.grid = grid;  // Pass the grid as a parameter
    this.ctx = ctx;    // Pass the canvas context as a parameter
    this.cellSize = cellSize;  // Pass the cell size as a parameter
    this.pathIndex = 0;
    this.cols = cols; 
    this.rows = rows;
  }

  draw() {
    const ax = this.x * this.cellSize;
    const ay = this.y * this.cellSize;
    this.ctx.fillStyle = 'blue';
    this.ctx.fillRect(ax + 5, ay + 5, this.cellSize - 10, this.cellSize - 10);
  }

  moveAlongPath() {
    if (this.pathIndex < this.path.length) {
      // Leave a trail at the current cell

      // Move to the next cell in the path
      const nextCell = this.path[this.pathIndex];
      this.x = nextCell.x;
      this.y = nextCell.y;
      this.pathIndex++;

      // Draw the agent in the new position
      this.draw();

      // Continue moving along the path
      setTimeout(() => {
        requestAnimationFrame(() => this.moveAlongPath());
      }, 200); // Adjust the delay between moves for smooth animation
    } else {
      console.log("Agent has reached the goal!");
    }
  }

  setPath(path) {
    this.path = path; // Store the path calculated by A*
    this.pathIndex = 0; // Reset path index to start from the beginning
    console.log("Path set for the agent:", path);
  }

  move(dir, index) {
    let nextX = this.x;
    let nextY = this.y;
    let currentCell = this.grid[index(this.x, this.y)];

    if (dir === 'up' && !currentCell.walls[0]) nextY--;
    if (dir === 'right' && !currentCell.walls[1]) nextX++;
    if (dir === 'down' && !currentCell.walls[2]) nextY++;
    if (dir === 'left' && !currentCell.walls[3]) nextX--;

    if (nextX >= 0 && nextY >= 0 && nextX < this.cols && nextY < this.rows) {
      this.x = nextX;
      this.y = nextY;
    }

    this.draw(); // Draw the agent in the new location
  }
}
