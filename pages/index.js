import { useState, useEffect } from "react"
import { useSnackbar } from 'notistack';
import { getSquare } from "@/utils/helperFunctions";

import styles from "@/styles/Home.module.css"
import Dropdown from "@/utils/dropdown";
import WindowSizeListener from "react-window-size-listener";
import Button from "@mui/material/Button";

import getDijkstraPath from "@/utils/algorithms/dijkstra";
import getAStarPath from "@/utils/algorithms/aStar";

export default function Home() {
  const WIDTH = 55;
  const LENGTH = 25;
  const SIZE = 20;
  const rowLength = [];
  const brd = [];

  const [diagonals, setDiagonals] = useState(false);
  const [offset, setOffset] = useState();
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
  
  for (let index = 1; index <= LENGTH; index++) {
    brd.push(rowLength);
  }

  useEffect(() => {
    setOffset(document.getElementById("board").getBoundingClientRect());
  }, [])

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

  const addNode = (e) => {
    let x = Math.ceil((e.pageX - offset.left) / SIZE);
    let y = Math.ceil((e.pageY - offset.top) / SIZE);

    let pos = (y - 1) * WIDTH + x;
    let sq = getSquare(pos, WIDTH);

    if (progress) {
      return;
    }

    if (current == "start" || current == "end") {
      changeNode(sq, pos, current);
    }

    else if (current == "point") {
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

    else if (current == "wall") {
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

    else if (current == "erase") {
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
      console.log(type);
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

  const eraseAll = () => {
    for (let i = 1; i <= 1375; i++) {
      let sq = getSquare(i, WIDTH); 
      sq.style.backgroundColor = "";
      sq.classList = i % 2 === 0 ? `${styles.cell} ${styles.odd}` : `${styles.cell} ${styles.even}`;
      
      if (i == start) {
        sq.style.backgroundColor = "green"
      } else if (i == end) {
        sq.style.backgroundColor = "red";
      } else if (walls.includes(i)) {
        sq.style.backgroundColor = "black";
      } else if (points.includes(i)) {
        sq.style.backgroundColor = "orange";
        sq.classList.add(`${styles.noselect}`);
        sq.innerText = points.indexOf(i);
      }
    }
  }

  const runAlgorithm = async () => {
    if (!start || !end) {
      enqueueSnackbar("Add Start / End Nodes", { autoHideDuration: 3000, variant: "info" });
      return;
    }
    
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
      <Button onClick={eraseAll}>Erase Board</Button>
      <Button onClick={runAlgorithm}>{algorithm}</Button>

      <div className={styles.App}>
        <WindowSizeListener onResize={() => {
          setOffset(document.getElementById("board").getBoundingClientRect());
        }}>
          <div id="board" onClick={e => addNode(e)} onMouseDown={() => setHold(true)} onMouseUp={() => setHold(false)} onMouseMove={e => hold && current == "wall" ? addNode(e) : ""}>
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
        </WindowSizeListener>
      </div>
    </>
  )
}
