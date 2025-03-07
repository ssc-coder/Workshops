import { Cell } from './maze.js';
import { Agent } from './agent.js';
import { generateGoal } from './goal.js';

const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d'); // gets an object that provides the 2D drawing api 

const cols = 10; // number of columns
const rows = 10; // number of rows
const cellSize = canvas.width / cols; // even out the size of the cells in the maze

let goal;
let grid = [];
let stack = []; // Stack for DFS maze generation
let openSet = []; // For A* open set
let closedSet = []; // For A* closed set
let path = []; // Final path found by A*

// Helper function to get the index of a cell
function index(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) {
    return -1;
  }
  return x + y * cols;
}

// Initialize grid
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    let cell = new Cell(x, y, grid,  ctx, cellSize);
    grid.push(cell);
  }
}

// Create the goal and agent
let agent = new Agent(0, 0, grid, cols, rows, ctx, cellSize);
goal = generateGoal(grid);

// Start recursive DFS maze generation
let current = grid[0]; // Start from the first cell
current.visited = true;
stack.push(current);  // Add the starting cell to the stack

function mazeGeneration() {
  current.visited = true;
  // Highlight only the current cell
  current.highlight("black");
  // Find an unvisited neighbor
  let next = current.checkNeighbors(index);
  // If there's an unvisited neighbor, proceed to that cell
  if (next) {
    next.visited = true;
    Cell.removeWalls(current, next); // Remove walls between the current and the next cell
    // Move to the next cell
    stack.push(current);
    current = next;

  } else if (stack.length > 0) {
    current = stack.pop(); // If no neighbors, backtrack to the previous cell
  }
  // Continue generating the maze
  if (stack.length > 0) {
    requestAnimationFrame(mazeGeneration); // schedules the maze generator function on the next screen repaint on your browser
  } else {
    // Maze generation complete, proceed with agent and goal drawing
    grid.forEach(cell => cell.draw());
    agent.draw();
    goal.highlight("red");
    openSet.push(grid[0]); // Start the A* pathfinding from the top-left corner
    aStar(); // you can comment this out and uncomment the windowslistener to move around on your keyboard 
  }
}

// // Capture key presses for agent movement
// window.addEventListener('keydown', (e) => {
//   if (e.key === 'ArrowUp') agent.move('up', index);
//   if (e.key === 'ArrowRight') agent.move('right', index);
//   if (e.key === 'ArrowDown') agent.move('down', index);
//   if (e.key === 'ArrowLeft') agent.move('left', index);
// });
mazeGeneration();