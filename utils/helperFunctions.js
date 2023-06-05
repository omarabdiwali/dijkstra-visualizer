import styles from "@/styles/Home.module.css"

export async function getShortestPath(start, end, prev, size) {
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

export function getValidSquares(pos, size, past, walls, start, check, diagonals) {
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

  if (diagonals) {
    if (pos < bottom) {
      if (pos % size != 0) {
        squares.push(pos + size + 1);
      } if (pos % size != 1) {
        squares.push(pos + size - 1);
      }
    }

    if (pos > size) {
      if (pos % size != 0) {
        squares.push(pos - size + 1);
      } if (pos % size != 1) {
        squares.push(pos - size - 1);
      }
    }
  }

  squares = squares.filter(x => !past.includes(x) && x != start);
  squares = squares.filter(x => !walls.includes(x));
  squares = squares.filter(x => !check.includes(x));

  return squares;
}

export async function colorSquares(squares, next, end, size, prevPos, prev, count) {
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

export function getPosValues(pos, size) {
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
