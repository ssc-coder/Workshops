export class Cell {
  constructor(x, y, grid, ctx, cellSize) {
    this.x = x;
    this.y = y;
    this.visited = false;
    this.walls = [true, true, true, true]; // top, right, bottom, left
    this.g = 0; // G-cost (cost from start to current)
    this.h = 0; // H-cost (estimated cost to goal)
    this.f = 0; // F-cost (G + H)
    this.neighbors = []; // Neighbors of the cell
    this.previous = null; // For path reconstruction
    this.ctx = ctx;
    this.cellSize = cellSize;
    this.grid = grid;
  }

  draw() {
    const x = this.x * this.cellSize;
    const y = this.y * this.cellSize;
    
    if (this.trailColor) {
      this.ctx.fillStyle = this.trailColor;
      this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    }

    this.ctx.strokeStyle = 'white';
    if (this.walls[0]) this.ctx.strokeRect(x, y, this.cellSize, 1);           // top
    if (this.walls[1]) this.ctx.strokeRect(x + this.cellSize, y, 1, this.cellSize); // right
    if (this.walls[2]) this.ctx.strokeRect(x, y + this.cellSize, this.cellSize, 1); // bottom
    if (this.walls[3]) this.ctx.strokeRect(x, y, 1, this.cellSize);            // left
  }

  highlight(color) {
    const x = this.x * this.cellSize;
    const y = this.y * this.cellSize;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
  }

  checkNeighbors(index) {
    let neighbors = [];

    const top = this.grid[index(this.x, this.y - 1)];
    const right = this.grid[index(this.x + 1, this.y)];
    const bottom = this.grid[index(this.x, this.y + 1)];
    const left = this.grid[index(this.x - 1, this.y)];

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    if (neighbors.length > 0) {
      const r = Math.floor(Math.random() * neighbors.length);
      return neighbors[r];
    } else {
      return undefined;
    }
  }

  checkNeighborsForAStar(index) {
    let neighbors = [];

    const top = this.grid[index(this.x, this.y - 1)];
    const right = this.grid[index(this.x + 1, this.y)];
    const bottom = this.grid[index(this.x, this.y + 1)];
    const left = this.grid[index(this.x - 1, this.y)];

    // A* needs valid cells that aren't blocked by walls
    if (top && !this.walls[0]) neighbors.push(top);      // No wall on top
    if (right && !this.walls[1]) neighbors.push(right);  // No wall on right
    if (bottom && !this.walls[2]) neighbors.push(bottom); // No wall on bottom
    if (left && !this.walls[3]) neighbors.push(left);    // No wall on left

    return neighbors;
  }

  static removeWalls(a, b) {
    const x = a.x - b.x;
    if (x === 1) {
      a.walls[3] = false;
      b.walls[1] = false;
    } else if (x === -1) {
      a.walls[1] = false;
      b.walls[3] = false;
    }
  
    const y = a.y - b.y;
    if (y === 1) {
      a.walls[0] = false;
      b.walls[2] = false;
    } else if (y === -1) {
      a.walls[2] = false;
      b.walls[0] = false;
    }
  }
}
