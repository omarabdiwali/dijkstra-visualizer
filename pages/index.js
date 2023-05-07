import { useState, useEffect } from "react"
import styles from "@/styles/Home.module.css"
import WindowSizeListener from "react-window-size-listener";
import { createMaze, getAStarPath, getDijkstraPath, getSquare } from "@/utils/helperFunctions";

export default function Home() {
  const WIDTH = 55;
  const LENGTH = 25;
  const SIZE = 20;
  const rowLength = [];
  const brd = [];

  const [offset, setOffset] = useState();
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [walls, setWalls] = useState([]);
  const [points, setPoints] = useState([]);
  const [current, setCurrent] = useState("start");
  const [count, setCount] = useState(0);
  const [hold, setHold] = useState(false);

  for (let i = 1; i <= WIDTH; i++) {
    rowLength.push(i);
  }
  
  for (let index = 1; index <= LENGTH; index++) {
    brd.push(rowLength);
  }

  useEffect(() => {
    setOffset(document.getElementById("board").getBoundingClientRect());
  }, [])

  const changeCurrent = (e) => {
    if (e.target.value == "Start Node") {
      setCurrent("start");
    } else if (e.target.value == "Wall Node") {
      setCurrent("wall");
    } else if (e.target.value == "Point Node") {
      setCurrent("point");
    } else if (e.target.value == "Eraser") {
      setCurrent("erase");
    } else {
      setCurrent("end")
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

    setCurrent("end");
  }

  const findPath = async (e) => {
    if (!start || !end) {
      return;
    }

    if (e.target.value == "Visualize Dijkstra") {
      setCurrent("Running Dijkstra...");
      await getDijkstraPath(start, points, end, walls, WIDTH);
    } else {
      setCurrent("Running A*...");
      return await getAStarPath(start, end, WIDTH, walls, points);
    }
  }

  const addNode = (e) => {
    let x = Math.ceil((e.clientX - offset.left) / SIZE);
    let y = Math.ceil((e.clientY - offset.top) / SIZE);

    let pos = (y - 1) * WIDTH + x;
    let sq = getSquare(pos, WIDTH);

    if (current.includes("Running")) {
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

  const drawMaze = () => {
    createMaze(0, 0, WIDTH, LENGTH, "vertical", [], []);
  }
  
  const onHold = () => {
    setHold(true);
  }

  const onUp = () => {
    setHold(false);
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

      if (order) orderPoints(temp);
    }
  }


  return (
    <div>
      <input type="button" value="Start Node" onClick={e => changeCurrent(e)}></input>
      <input style={{ marginLeft: "5px", marginRight: "5px" }} type="button" value="Wall Node" onClick={e => changeCurrent(e)}></input>
      <input style={{ marginRight: "5px" }} type="button" value="End Node" onClick={e => changeCurrent(e)}></input>
      <input style={{ marginRight: "5px" }} type="button" value="Point Node" onClick={e => changeCurrent(e)}></input>
      <input style={{ marginRight: "5px" }} type="button" value="Eraser" onClick={e => changeCurrent(e)}></input>
      {/* <input style={{ marginRight: "5px" }} type="button" value="Maze" onClick={drawMaze}></input> */}
      <span style={{marginLeft: "20%", marginRight: "20%"}}>Current: {current}</span>
      <input style={{ marginRight: "5px" }} type="button" value="Visualize Dijkstra" onClick={e => findPath(e)}></input>
      <input type="button" value="Visualize A*" onClick={e => findPath(e)}></input>
      <div className={styles.App}>
        <WindowSizeListener onResize={() => {
          setOffset(document.getElementById("board").getBoundingClientRect());
        }}>
          <div id="board" onClick={e => addNode(e)} onMouseDown={onHold} onMouseUp={onUp} onMouseMove={e => hold && current == "wall" ? addNode(e) : ""}>
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
    </div>
  )
}
