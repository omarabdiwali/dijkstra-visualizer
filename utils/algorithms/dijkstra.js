import { getValidSquares, colorSquares, getShortestPath } from "../helperFunctions";

export default async function getDijkstraPath(start, points, end, walls, size, diagonals) {
  let curStart = start;
  let allPoints = [...points, end];

  for (let i = 0; i < allPoints.length; i++) {
    let point = allPoints[i];
    
    let queue = [curStart];
    let past = [];
    let next = [];
    let prev = {};
    let found = false;

    let pPoints = [start, ...points, end];
    pPoints = pPoints.filter(x => x != point);

    while (queue.length > 0 && !found) {
      let nextPos = queue.shift();
      let result = await dijkstraPath(nextPos, size, past, next, walls, curStart, point, prev, pPoints, i, diagonals);
      let sqs = result[1];
      
      found = result[0]
      queue = queue.concat(sqs);
      next = sqs;
      past = [...past, ...sqs]; 
    }

    curStart = point;
  }
}

async function dijkstraPath(pos, size, past, next, walls, start, end, prev, points, count, diagonals) {
  let squares = getValidSquares(pos, size, past, walls, start, points, diagonals)
  let values = await colorSquares(squares, next, end, size, pos, prev, count);
  
  let found = values[0];
  squares = values[1];

  if (found == true) {
    await getShortestPath(start, end, prev, size);
  }

  return [found, squares];
}
