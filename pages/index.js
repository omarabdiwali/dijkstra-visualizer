import { useState } from "react"
import { useSnackbar } from 'notistack';
import { getSquare } from "@/utils/helperFunctions";

import styles from "@/styles/Home.module.css"
import Dropdown from "@/utils/dropdown";
import Button from "@mui/material/Button";

import getDijkstraPath from "@/utils/algorithms/dijkstra";
import getAStarPath from "@/utils/algorithms/aStar";
import mazeGeneration from "@/utils/algorithms/mazeGeneration";

export const WIDTH = 55;
export const HEIGHT = 25;

export default function Home() {
  const rowLength = [];
  const brd = [];

  const [diagonals, setDiagonals] = useState(false);
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [walls, setWalls] = useState([]);
  const [points, setPoints] = useState([]);
  const [current, setCurrent] = useState("start");
  const [progress, setProgress] = useState(false);
  const [count, setCount] = useState(0);
  const [hold, setHold] = useState(false);
  const [algorithm, setAlgorithm] = useState("Visualize");
  const { enqueueSnackbar } = useSnackbar();

  const nodes = ["Start Node", "Point Node", "Wall Node", "End Node", "Eraser"];
  const algos = ["Dijkstra's Algorithm", "A* Search"];

  for (let i = 1; i <= WIDTH; i++) {
    rowLength.push(i);
  }
  
  for (let index = 1; index <= HEIGHT; index++) {
    brd.push(rowLength);
  }

  const changeCurrent = (option) => {
    if (option == "Start Node") {
      setCurrent("start");
    } else if (option == "Wall Node") {
      setCurrent("wall");
    } else if (option == "Point Node") {
      setCurrent("point");
    } else if (option == "Eraser") {
      setCurrent("erase");
    } else if (option == "End Node") {
      setCurrent("end");
    }
  }

  const changeNode = (sq, pos, type) => {
    let node = type == "start";
    let move = node ? start : end;

    if (move) {
      let pRow = Math.floor(move / WIDTH);
      let pCol = (move - (pRow * WIDTH) - 1);
      
      if (move % WIDTH === 0) {
        pCol = WIDTH - 1;
        pRow -= 1;
      }

      let prevSq = document.getElementById("board").childNodes.item(`${pRow}`).children[pCol];
      prevSq.style.backgroundColor = null;
    }

    sq.style.backgroundColor = node ? "green" : "red";
    node ? setStart(pos) : setEnd(pos);

    if (pos == (node ? end : start)) {
      node ? setEnd(null) : setStart(null);
    }

    checkCollisions(pos, sq);
    checkCollisions(pos, sq, "points", true);
  }

  const findPath = async (option) => {
    if (option.includes("Dijkstra")) {
      setAlgorithm("Visualize Dijkstra");
    } else {
      setAlgorithm("Visualize A*");
    }
  }

  const addNode = (pos, nodeType) => {
    let sq = getSquare(pos, WIDTH);
    if (progress || !sq) return;

    if (nodeType == "start" || nodeType == "end") {
      changeNode(sq, pos, current);
    }

    else if (nodeType == "point") {
      if (!points.includes(pos)) {
        sq.style.backgroundColor = "orange";
        setPoints(points => [...points, pos]);
        sq.innerText = `${count}`;
        sq.classList.add(`${styles.noselect}`);

        setCount(count + 1);

        if (start == pos) {
          setStart(null);
        } else if (end == pos) {
          setEnd(null);
        } else if (walls.includes(pos)) {
          checkCollisions(pos, sq);
        }
      }
    }

    else if (nodeType == "wall") {
      if (!walls.includes(pos)) {
        sq.style.backgroundColor = "black";
        setWalls(walls => [...walls, pos]);

        if (start == pos) {
          setStart(null);
        } else if (end == pos) {
          setEnd(null);
        } else {
          checkCollisions(pos, sq, "points", true);
        }
      }
    }

    else if (nodeType == "erase") {
      sq.style.backgroundColor = null;
      if (start == pos) {
        setStart(null);
      } else if (end == pos) {
        setEnd(null);
      } else {
        checkCollisions(pos, sq);
        checkCollisions(pos, sq, "points", true);
      }
    }
  }

  const orderPoints = (pts) => {
    for (let i = 0; i < pts.length; i++) {
      let point = pts[i];
      let sq = getSquare(point, WIDTH);

      sq.innerText = `${i}`;
    }

    setCount(count - 1);
  }

  const checkCollisions = (pos, sq, type="walls", order=false) => {
    let ifWalls = type == "walls";
    let index = ifWalls ? walls.indexOf(pos) : points.indexOf(pos);

    if (index > -1) {
      let temp = ifWalls ? [...walls] : [...points];
      temp.splice(index, 1);
      ifWalls ? setWalls(temp) : setPoints(temp);
      ifWalls ? null : sq.innerText = "";

      if (order) {
        orderPoints(temp);
        sq.classList.remove(`${styles.noselect}`);
      };
    }
  }

  const eraseAll = (clearWalls) => {
    if (progress) return;

    for (let i = 1; i <= 1375; i++) {
      let sq = getSquare(i, WIDTH); 
      sq.style.backgroundColor = "";
      sq.classList = i % 2 === 0 ? `${styles.cell} ${styles.odd}` : `${styles.cell} ${styles.even}`;
      
      if (i == start) {
        sq.style.backgroundColor = "green"
      } else if (i == end) {
        sq.style.backgroundColor = "red";
      } else if (!clearWalls && walls.includes(i)) {
        sq.style.backgroundColor = "black";
      } else if (points.includes(i)) {
        sq.style.backgroundColor = "orange";
        sq.classList.add(`${styles.noselect}`);
        sq.innerText = points.indexOf(i);
      }
    }

    if (clearWalls) setWalls([]);
  }

  const generateMaze = async () => {
    if (progress) return;
    setWalls([]);
    setProgress(true);
    await mazeGeneration(addNode);
    setProgress(false);
  }

  const runAlgorithm = async () => {
    if (!start || !end) {
      enqueueSnackbar("Add Start / End Nodes", { autoHideDuration: 3000, variant: "info" });
      return;
    }

    if (progress) return;
    if (algorithm == "Visualize Dijkstra") {
      setProgress(true);
      await getDijkstraPath(start, points, end, walls, WIDTH, diagonals);
      setProgress(false);
    } else if (algorithm == "Visualize A*") {
      setProgress(true);
      await getAStarPath(start, end, WIDTH, walls, points, diagonals);
      setProgress(false);
    } else {
      enqueueSnackbar("Select an algorithm", { variant: "info", autoHideDuration: 3000 });
    }
  }

  return (
    <>
      <Dropdown options={nodes} onClick={changeCurrent} />
      <Dropdown options={algos} title="Algorithms" onClick={findPath} />
      <Button onClick={generateMaze}>Generate Maze</Button>
      <Button onClick={() => eraseAll(true)}>Clear Walls</Button>
      <Button onClick={() => eraseAll(false)}>Erase Path</Button>
      <Button onClick={runAlgorithm}>{algorithm}</Button>

      <div className={styles.App}>
        <div id="board" onClick={e => addNode(parseInt(e.target.id), current)} onMouseDown={() => setHold(true)} onMouseUp={() => setHold(false)} onMouseMove={e => hold && current == "wall" ? addNode(parseInt(e.target.id), current) : ""}>
          {brd.map((row, idx) => {
            return (
              <div className={styles.row} key={idx}>
                {row.map((cell, id) => {
                  const pos = idx * WIDTH + cell;
                  return (
                    <div className={(idx + id + 2) % 2 === 0 ? `${styles.cell} ${styles.even}` : `${styles.cell} ${styles.odd}`} id={`${pos}`} key={id}></div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
