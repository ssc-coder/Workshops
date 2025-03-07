import { Cell } from './maze.js';
import { Agent } from './agent.js';
import { generateGoal } from './goal.js';

const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

const cols = 10; // number of columns
const rows = 10; // number of rows
const cellSize = canvas.width / cols;

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

function heuristic(a, b) { // Manhattan distance estimation
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function aStar() {
  if (openSet.length > 0) {
    let lowestIndex = 0; // setting the position we are on to 0 first, assuming the first cell in the set has the lowest F-cost
    for (let i = 0; i < openSet.length; i++) { // comparison of the f-costs of each cell happens here
      if (openSet[i].f < openSet[lowestIndex].f) { 
        // comparison of each cell in the set by the lowestcost's index finds a cell with lower cost here
        lowestIndex = i;
      }
    }
    let current = openSet[lowestIndex]; // picking the lowest cost cell as our current

    if (current === goal) { // Checks if we reached the goal
      console.log("Path found!");
      path = [];
      let temp = current;
      while (temp.previous) {
        path.push(temp);
        temp = temp.previous;
      }
      path.push(grid[0]); // Start point
      path.reverse(); // Ensure the path starts from the start
      agent.setPath(path); // Pass the path to the agent
      agent.moveAlongPath(); // Start moving the agent along the path
      return;
    }

    openSet.splice(lowestIndex, 1); // removes the lowest-cost cell from the openSet
    closedSet.push(current); // adds the cell to the closed set, meaning this cell has been explored

    let neighbors = current.checkNeighborsForAStar(index); // retrieves the neighboring cells of the current cell that can be stepped into
    for (let neighbor of neighbors) {
      if (!closedSet.includes(neighbor)) {
        let tempG = current.g + 1; // Each neighbor is 1 step away and the not visited current.g's are uniformly 0 

        let newPath = false;
        if (!openSet.includes(neighbor)) { // checking if the cell has already been added to search set
          openSet.push(neighbor);
          newPath = true;
        } else if (tempG < neighbor.g) { // checks if this g-cost is lower than the neighbor's g-cost
          newPath = true;
        }

        if (newPath) {
          neighbor.g = tempG; // updating the cost
          neighbor.h = heuristic(neighbor, goal); // calculating the new heuristic cost 
          neighbor.f = neighbor.g + neighbor.h; // updating the f-cost
          neighbor.previous = current; // Track the path
        }
      }
    }
  } else {
    console.log("No solution");
    return;
  }

  requestAnimationFrame(aStar); // schedules the A* function on the next screen repaint on your browser
}

// // Capture key presses for agent movement
// window.addEventListener('keydown', (e) => {
//   if (e.key === 'ArrowUp') agent.move('up', index);
//   if (e.key === 'ArrowRight') agent.move('right', index);
//   if (e.key === 'ArrowDown') agent.move('down', index);
//   if (e.key === 'ArrowLeft') agent.move('left', index);
// });
mazeGeneration();