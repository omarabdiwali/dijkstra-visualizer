# Pathfinding Visualizer

This project is a React-based web application that visualizes pathfinding algorithms like Dijkstra's Algorithm and A* Search.  It allows users to generate a maze or interactively create a grid, place start and end nodes, add obstacles (walls), designate intermediate points, and then visualize how these algorithms find the shortest path.

### **Website: https://dijkstra-visualizer.vercel.app**

## Features

*   **Interactive Grid:** Users can click and drag on the grid to:
    *   Place a Start Node (Green)
    *   Place an End Node (Red)
    *   Place Intermediate Point Nodes (Orange) - The algorithms will find the shortest path visiting these points in order.
    *   Create Wall Nodes (Black) - Impassable obstacles.
    *   Erase Nodes
*   **Algorithm Selection:**
    *   Dijkstra's Algorithm
    *   A\* Search
*   **Maze Generation:**
    *   Recursive Division Maze Generation
*   **Visualization:**
    *   The algorithm's search process is visualized step-by-step, highlighting explored nodes in blue/purple shades.
    *   The final shortest path is highlighted in yellow.
* **Diagonal Movement Toggle (Optional)** Allows toggling for a path to find corners (go diagonal, rather that just up/down/left/right). Not implemented fully yet.
*   **Responsive Design:** The grid adapts to different window sizes.
*   **Snackbar Notifications:**  Provides feedback to the user, such as prompting them to add start/end nodes or select an algorithm.
*   **Erase Board Button:** Clears the entire board, resetting it to its initial state.

## Project Structure

The application is built using the following key files:

*   **`index.js`:**  The main component of the application.  Handles user interaction, state management (start/end nodes, walls, points, algorithm selection), and rendering the grid.
*   **`helperFunctions.js`:** Contains utility functions used throughout the project, including:
    *   `getSquare(pos, size)`:  Gets the DOM element representing a square on the grid given its position and the grid's width.
    *   `getValidSquares(pos, size, past, walls, start, check, diagonals)`:  Returns an array of valid neighboring squares for a given position, taking into account grid boundaries, previously visited squares, walls, the start node, and existing points.  Also considers diagonal movement if enabled.
    *   `colorSquares(squares, next, end, size, prevPos, prev, count)`: Colors the explored squares during the visualization and updates the `prev` object (used for path reconstruction).
    *   `getShortestPath(start, end, prev, size)`:  Reconstructs and visualizes the shortest path found by the algorithm by tracing back through the `prev` object.
    * `getPosValues(pos, size)`: Gets row and column value based on index and board size.
*   **`dijkstra.js`:** Implements Dijkstra's algorithm.  The `getDijkstraPath` function orchestrates the visualization, handling multiple waypoints (intermediate points).  `dijkstraPath` performs a single step of Dijkstra's algorithm, exploring neighbors and coloring them.
*   **`aStar.js`:** Implements the A\* search algorithm. `getAStarPath` manages the overall flow, handling multiple waypoints.  `aStarPath` performs a single step, similar to Dijkstra's, but using a heuristic (`hValue`) to prioritize exploration towards the target. The heuristic is implemented and working.
*   **`mazeGeneration.js`:** Implementation of the recursive division maze generation. `recursiveDivision` handles the recursion and setting which nodes will become walls, with the main `mazeGeneration` performing the initial step to start the generation.

## How it Works (Algorithm Logic)

Both `dijkstra.js` and `aStar.js` follow a similar structure:

1.  **Initialization:**
    *   The algorithms start at the `start` node.
    *   Data structures are initialized:
        *   `queue` (Dijkstra) or `squares` (A\*) to hold nodes to be explored.
        *   `past` to track visited nodes.
        *   `prev` (Dijkstra) or `cameFrom` (A\*) to store the previous node in the shortest path to each node.
        *   `gScore` and `fScore` (A\* only) to store cost values.

2.  **Iteration:**
    *   The algorithm iterates as long as there are nodes to explore in the `queue` or `squares`.
    *   **Dijkstra:** The next node to explore (`nextPos`) is removed from the front of the `queue`.
    *   **A\*:**  The node with the lowest f-score (`current`) is selected from `squares`.
    *   `getValidSquares` is used to find the valid neighbors of the current node.
    *   **Dijkstra:**  The neighbors are added to the `queue` for later exploration.
    *   **A\*:** For each neighbor:
        *   Calculate a tentative g-score (`tentGScore`).
        *   If the tentative g-score is better than the current g-score for the neighbor, update `cameFrom`, `gScore`, and `fScore`.
        *   Add the neighbor to `squares` if it's not already there.
    *   `colorSquares` is called to visually update the grid, showing the explored nodes.
    *   The process continues until the `end` node is reached or the `queue`/`squares` is empty (no path found).

3.  **Path Reconstruction:**
    *   Once the `end` node is found, `getShortestPath` is called.
    *   It uses the `prev` (Dijkstra) or `cameFrom` (A\*) object to trace back from the `end` node to the `start` node, building the shortest path.
    *   The path is then visualized by changing the color of the squares.

## Key Concepts

*   **Dijkstra's Algorithm:**  A classic algorithm for finding the shortest path in a graph with non-negative edge weights.  It explores nodes in order of their distance from the start node.
*   **A\* Search:**  An informed search algorithm that uses a heuristic function to estimate the distance from a node to the goal. This heuristic guides the search, making it more efficient than Dijkstra's in many cases.  The heuristic used here is the Manhattan distance.
*   **Recursive Division Maze Generation:**  This algorithm works as follows: Begin with the maze's space with no walls (chamber). Divide the chamber with a randomly positioned wall (or multiple walls) where each wall contains a randomly positioned passage opening within it. Then recursively repeat the process on the subchambers until all chambers are minimum sized. This method results in mazes with long straight walls crossing their space, making it easier to see which areas to avoid.
*   **State Management (React):**  The `useState` hook is used extensively to manage the state of the application, such as the positions of nodes, the presence of walls, the selected algorithm, and the visualization progress.
*   **Event Handling (React):**  Event handlers like `onClick`, `onMouseDown`, `onMouseUp`, and `onMouseMove` are used to handle user interactions with the grid.
*   **Asynchronous Operations:** The `async/await` keywords are used to make the visualization appear smooth and step-by-step.  The `sleep` function introduces delays to control the speed of the visualization.
*   **DOM Manipulation:**  The code directly manipulates the DOM (e.g., changing `backgroundColor` and `innerText` of grid cells) to visualize the algorithm's progress.  This is a less common approach in React, which usually favors updating the state and letting React handle the DOM updates.

## Potential Improvements

*   **More Algorithms:** Implement other pathfinding algorithms (e.g., Breadth-First Search, Depth-First Search).
*   **Weighted Nodes:**  Allow users to add weighted nodes (e.g., terrain with different traversal costs).
*   **Performance Optimization:** For very large grids, consider using more efficient data structures for the open and closed sets (e.g., a priority queue).  Also, optimize the DOM manipulation to minimize reflows and repaints.
*   **UI/UX Enhancements:**
    *   Provide options to adjust the visualization speed.
    *   Display the cost of the path found.
    *   Improve the styling and visual feedback.

## Setup & Running

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    ```
2.  **Install dependencies:**
    ```bash
    cd <project_directory>
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will typically start the application on `http://localhost:3000`.