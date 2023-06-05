import { getValidSquares, colorSquares, getShortestPath, getPosValues } from "../helperFunctions";

export default async function getAStarPath(start, end, size, walls, points, diagonals) {
  let curStart = start;
  let allPoints = [...points, end];

  for (let i = 0; i < allPoints.length; i++) {
    let point = allPoints[i];
    
    let pPoints = [start, ...points, end];
    pPoints = pPoints.filter(x => x != point);

    await aStarPath(curStart, point, size, walls, pPoints, i, diagonals);
    curStart = point;
  }

}

async function aStarPath(start, end, size, walls, points, count, diagonals) {
  let squares = [start];
  let cameFrom = {};

  let gScore = {};
  gScore[start] = 0;
  
  let fScore = {};
  fScore[start] = hValue(start, end, size);

  let past = [];
  let next = [];

  while (squares.length > 0) {
    let current = getFScore(squares, fScore);
    
    if (current == end) {
      await colorSquares([], next, end, size, 0, [], count);
      await getShortestPath(start, current, cameFrom, size);
      break;
    }

    let index = squares.indexOf(current);
    squares.splice(index, 1);

    let neighbors = getValidSquares(current, size, [], walls, start, points, diagonals);

    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      let g = gScore[neighbor] || Infinity;

      let tentGScore = gScore[current] + hValue(current, neighbor, size);

      if (tentGScore < g) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentGScore;
        fScore[neighbor] = tentGScore + hValue(neighbor, end, size);

        if (squares.indexOf(neighbor) == -1) {
          squares.push(neighbor);
        }
      }
    }

    neighbors = neighbors.filter(x => !past.includes(x) && x != end);
    await colorSquares(neighbors, next, end, size, 0, [], count);

    next = neighbors;
    past = [...past, ...neighbors];
  }

  return;
}

function getFScore(squares, fScore) {
  let lowest = Infinity;
  let value = 0;

  for (let i = 0; i < squares.length; i++) {
    const element = squares[i];
    let f = fScore[element] || Infinity;

    if (f < lowest) {
      lowest = f;
      value = element;
    }
  }
  
  return value;
}

function hValue(start, end, size) {
  let stValues = getPosValues(start, size);
  let endValues = getPosValues(end, size);

  let h = Math.abs(stValues[0] - endValues[0]) + Math.abs(stValues[1] - endValues[1]);

  return h;
}