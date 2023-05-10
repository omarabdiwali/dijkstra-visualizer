import styles from "@/styles/Home.module.css"

export async function getDijkstraPath(start, points, end, walls, size) {
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
      let result = await dijkstraPath(nextPos, size, past, next, walls, curStart, point, prev, pPoints, i);
      let sqs = result[1];
      
      found = result[0]
      queue = queue.concat(sqs);
      next = sqs;
      past = [...past, ...sqs]; 
    }

    curStart = point;
  }
}

export async function getAStarPath(start, end, size, walls, points) {
  let curStart = start;
  let allPoints = [...points, end];

  for (let i = 0; i < allPoints.length; i++) {
    let point = allPoints[i];
    
    let pPoints = [start, ...points, end];
    pPoints = pPoints.filter(x => x != point);

    await aStarPath(curStart, point, size, walls, pPoints, i);
    curStart = point;
  }

}

async function dijkstraPath(pos, size, past, next, walls, start, end, prev, points, count) {
  let squares = getValidSquares(pos, size, past, walls, start, points)
  let values = await colorSquares(squares, next, end, size, pos, prev, count);
  
  let found = values[0];
  squares = values[1];

  if (found == true) {
    await getShortestPath(start, end, prev, size);
  }

  return [found, squares];
}

async function aStarPath(start, end, size, walls, points, count) {
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

    let neighbors = getValidSquares(current, size, [], walls, start, points);

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

async function getShortestPath(start, end, prev, size) {
  let seq = [];
  let found = end;

  while (found != start) {
    let prevPos = prev[found];
    seq.unshift(prevPos);

    found = prevPos;
  }


  for (let i = 1; i < seq.length; i++) {
    const pos = seq[i];
    let sq = getSquare(pos, size);

    sq.classList.replace(`${styles.change}`, `${styles.path}`);
    // sq.classList.add("path");
    sq.style.backgroundColor = "yellow";
    await sleep(80);
  }
}

function getValidSquares(pos, size, past, walls, start, check) {
  let squares = [];
  let bottom = size * 24;

  if (pos % size != 0) {
    squares.push(pos + 1);
  } if (pos <= bottom) {
    squares.push(pos + size);
  } if (pos % size != 1) {
    squares.push(pos - 1);
  } if (pos > size) {
    squares.push(pos - size);
  }

  squares = squares.filter(x => !past.includes(x) && x != start);
  squares = squares.filter(x => !walls.includes(x));
  squares = squares.filter(x => !check.includes(x));

  return squares;
}

async function colorSquares(squares, next, end, size, prevPos, prev, count) {
  let realSq = [];

  for (let i = 0; i < next.length; i++) {
    const pos = next[i];
    let sq = getSquare(pos, size);

    if (!(sq.style.backgroundColor == "yellow")) {
      sq.classList.add(`${styles.change}`);
      sq.style.backgroundColor = count % 2 == 0 ? "skyblue" : "pink";
      sq.style.backgroundColor = count % 2 == 0 ? "darkblue" : "purple";
    }
  }

  await sleep(10);

  for (let i = 0; i < squares.length; i++) {
    const pos = squares[i];
    let sq = getSquare(pos, size);

    if (!(sq.style.backgroundColor == "yellow")) {
      prev[pos] = prevPos;

      if (pos == end) {
        return [true, realSq];
      }
      
      if (sq.style.backgroundColor == "darkblue" || sq.style.backgroundColor == "purple") {
        sq.classList.remove(`${styles.change}`);
      }
      
      sq.style.backgroundColor = count % 2 == 0 ? "skyblue" : "pink";
      realSq.push(pos);
      await sleep(25);
    }
  }

  return [false, realSq];
}

function getPosValues(pos, size) {
  let row = Math.floor(pos / size);
  let col = (pos - (row * size) - 1);
    
  if (pos % size === 0) {
    col = size - 1;
    row -= 1;
  }

  return [row, col]
}

export function getSquare(pos, size) {
  let values = getPosValues(pos, size);
  let row = values[0], col = values[1];
  let square = document.getElementById("board").childNodes.item(`${row}`).children[col];

  return square;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function createMaze(x, y, width, height, orientation, walls, gaps) {
  if (width < 2 || height < 2) {
    return;
  }

  let horizontal = orientation == "horizontal";
  
  let wx = x + (horizontal ? 0 : Math.floor(Math.random() * (width - 2)));
  let wy = y + (horizontal ? Math.floor(Math.random() * (height - 2)) : 0);

  let px = wx + (horizontal ? Math.floor(Math.random() * width): 0)
  let py = wy + (horizontal ? 0 : Math.floor(Math.random() * height))

  let dx = horizontal ? 1 : 0;
  let dy = horizontal ? 0 : 1;

  let length = horizontal ? width : height;

  for (let i = 0; i < length; i++) {
    let pos = wy * 25 + wx;

    if (wx != px || wy != py) {
      addWalls(wy, wx, pos, walls, gaps);
    } else {
      addDoor(wy, wx, pos, gaps);
    }
    
    wx += dx;
    wy += dy;
  }

  await sleep(1000);

  let nx = x, ny = y;
  let values = horizontal ? [width, wy - y + 1] : [wx - x + 1, height];
  let w = values[0], h = values[1];
  createMaze(nx, ny, w, h, getOrientation(w, h), walls, gaps);

  let val = horizontal ? [x, wy + 1] : [wx + 1, y];
  nx = val[0], ny = val[1];
  let val1 = horizontal ? [width, y + height - wy - 1] : [x + width - wx - 1, height];
  w = val1[0], h = val1[1];

  createMaze(nx, ny, w, h, getOrientation(w, h), walls, gaps);
}

function addDoor(row, col, pos, gaps) {
  let sq = document.getElementById("board").childNodes.item(`${row}`).children[col];
  if (sq.classList.contains("wall")) {
    sq.classList.remove("wall");
  }
  
  sq.style.backgroundColor = null;
  gaps.push(pos);
}

function getOrientation(w, h) {
  if (w < h) {
    return "horizontal";
  } else if (h < w) {
    return "vertical";
  } else {
    return Math.random() < 0.5 ? "horizontal" : "vertical";
  }
}

function addWalls(row, col, pos, walls, gaps) {
  if (walls.includes(pos) || gaps.includes(pos)) return;

  let sq = document.getElementById("board").childNodes.item(`${row}`).children[col];
  sq.classList.add("wall");
  sq.style.backgroundColor = "black";
}

function random(num) {
  return Math.floor(Math.random() * num);
}