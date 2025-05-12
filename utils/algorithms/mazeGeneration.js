import { HEIGHT, WIDTH } from "@/pages";
import { getSquare, sleep } from "../helperFunctions";

let walls = [];

const createBoard = () => {
    walls = [];
    const nodes = {};
    let pos = 1;

    for (let r = 0; r < HEIGHT; r++) {
        for (let c = 0; c < WIDTH; c++) {
            let key = `${r}-${c}-${pos}`;
            nodes[key] = '';
            pos += 1;
        }
    }

    return [nodes, walls];
}

const recursiveDivision = (nodes, rStart, rEnd, cStart, cEnd, orient, immutablePos) => {
    if (rEnd < rStart || cEnd < cStart) return;
    let rows = [];
    let cols = [];
    if (orient == "h") {
        for (let i = rStart; i <= rEnd; i += 2) {
            rows.push(i);
        }
        for (let i = cStart - 1; i <= cEnd + 1; i += 2) {
            cols.push(i);
        }

        let randomRowIndex = Math.floor(Math.random() * rows.length);
        let randomColIndex = Math.floor(Math.random() * cols.length);
        let currentRow = rows[randomRowIndex];
        let colRandom = cols[randomColIndex];

        Object.keys(nodes).forEach(node => {
            let [r, c, pos] = node.split('-');
            r = parseInt(r), c = parseInt(c), pos = parseInt(pos);
            if (r === currentRow && c !== colRandom && c >= cStart - 1 && c <= cEnd + 1 && !immutablePos.includes(pos)) {
                nodes[node] = "wall";
                walls.push(pos);
            }
        })

        if (currentRow - 2 - rStart > cEnd - cStart) {
            recursiveDivision(nodes, rStart, currentRow - 2, cStart, cEnd, orient, immutablePos);
        } else {
            recursiveDivision(nodes, rStart, currentRow - 2, cStart, cEnd, "v", immutablePos);
        }

        if (rEnd - (currentRow + 2) > cEnd - cStart) {
            recursiveDivision(nodes, currentRow + 2, rEnd, cStart, cEnd, orient, immutablePos);
        } else {
            recursiveDivision(nodes, currentRow + 2, rEnd, cStart, cEnd, "v", immutablePos);
        }
    } else {
        for (let i = cStart; i <= cEnd; i += 2) {
            cols.push(i);
        }
        for (let i = rStart - 1; i <= rEnd + 1; i += 2) {
            rows.push(i);
        }

        let randomColIndex = Math.floor(Math.random() * cols.length);
        let randomRowIndex = Math.floor(Math.random() * rows.length);
        let currentCol = cols[randomColIndex];
        let rowRandom = rows[randomRowIndex];

        Object.keys(nodes).forEach(node => {
            let [r, c, pos] = node.split('-');
            r = parseInt(r), c = parseInt(c), pos = parseInt(pos);

            if (c === currentCol && r !== rowRandom && r >= rStart - 1 && r <= rEnd + 1 && !immutablePos.includes(pos)) {
                nodes[node] = "wall";
                walls.push(pos);
            }
        })

        if (rEnd - rStart > currentCol - 2 - cStart) {
            recursiveDivision(nodes, rStart, rEnd, cStart, currentCol - 2, "h", immutablePos);
        } else {
            recursiveDivision(nodes, rStart, rEnd, cStart, currentCol - 2, orient, immutablePos);
        }
        if (rEnd - rStart > cEnd - (currentCol + 2)) {
            recursiveDivision(nodes, rStart, rEnd, currentCol + 2, cEnd, "h", immutablePos);
        } else {
            recursiveDivision(nodes, rStart, rEnd, currentCol + 2, cEnd, orient, immutablePos);
        }
    }
}

export default async function mazeGeneration(start, points, end) {
    const [nodes, walls] = createBoard();
    const immutablePos = [start, ...points, end];
    recursiveDivision(nodes, 1, HEIGHT - 2, 1, WIDTH - 2, "h", immutablePos);
    
    for (const pos of walls) {
        let sq = getSquare(pos, WIDTH);
        sq.style.backgroundColor = "black";
        await sleep(7);
    }

    return walls;
}