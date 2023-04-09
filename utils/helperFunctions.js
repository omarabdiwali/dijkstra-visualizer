import styles from "@/styles/Home.module.css"

export async function getPath(pos, size, past, next, walls, start, end, prev) {
  let squares = getValidSquares(pos, size, past, walls, start)
  let values = await colorSquares(squares, next, end, size, pos, prev);
  
  let found = values[0];
  squares = values[1];

  if (found == true) {
    await getShortestPath(start, end, prev, size);
  }

  return [found, squares];
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
    sq.style.backgroundColor = "yellow";
    await sleep(80);
  }
}

export async function createMaze(x, y, width, height, orientation, walls, gaps) {
  if (width < 5 || height < 5) {
    return;
  }

  console.log(width, height);
  console.log(x, y);
  console.log(orientation);

  let horizontal = orientation == "horizontal";
  
  let wx = x + (horizontal ? 0 : Math.floor(Math.random() * (width - 3)));
  let wy = y + (horizontal ? Math.floor(Math.random() * (height - 3)) : 0);

  let px = wx + (horizontal ? Math.floor(Math.random() * width): 0)
  let py = wy + (horizontal ? 0 : Math.floor(Math.random() * height))

  let dx = horizontal ? 1 : 0;
  let dy = horizontal ? 0 : 1;

  let length = horizontal ? width : height;

  for (let i = 0; i < length; i++) {
    let pos = wy * 25 + wx;

    if (wx != px || wy != py) {
      addWalls(wy, wx, pos, walls, gaps);
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

function getOrientation(w, h) {
  if (w < h) {
    return "horizontal";
  } else if (h < w) {
    return "vertical";
  } else {
    return Math.random() < 0.5 ? "horizontal" : "vertical";
  }
}

function getValidSquares(pos, size, past, walls, start) {
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

  return squares;
}

function addWalls(row, col, pos, walls, gaps) {
  if (walls.indexOf(pos) > -1 || gaps.indexOf(pos) > -1) {
    return;
  }
  let sq = document.getElementById("board").childNodes.item(`${row}`).children[col];
  sq.classList.add("wall");
  sq.style.backgroundColor = "black";
}

async function colorSquares(squares, next, end, size, prevPos, prev) {
  let realSq = [];

  for (let i = 0; i < next.length; i++) {
    const pos = next[i];
    let sq = getSquare(pos, size);

    sq.classList.add(`${styles.change}`);
    sq.style.backgroundColor = "darkblue";
  }

  for (let i = 0; i < squares.length; i++) {
    const pos = squares[i];
    let sq = getSquare(pos, size);
    prev[pos] = prevPos;

    if (pos == end) {
      return [true, realSq];
    }

    await sleep(10);
    sq.style.backgroundColor = "skyblue";
    realSq.push(pos);
  }

  await sleep(20);
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

function getSquare(pos, size) {
  let values = getPosValues(pos, size);
  let row = values[0], col = values[1];
  let square = document.getElementById("board").childNodes.item(`${row}`).children[col];

  return square;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));