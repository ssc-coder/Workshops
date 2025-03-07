export function generateGoal(grid) {
  let goalIndex;
  let goal;
  do {
    goalIndex = Math.floor(Math.random() * grid.length);
  } while (goalIndex === 0); // Ensure goal is not at the start

  goal = grid[goalIndex]; // Choose the random goal cell
  return goal;
}
