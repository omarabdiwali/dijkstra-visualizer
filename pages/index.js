import { useState, useEffect } from "react"
import styles from "@/styles/Home.module.css"
import WindowSizeListener from "react-window-size-listener";
import { getPath } from "@/utils/helperFunctions";

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
  const [current, setCurrent] = useState("start");
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
    } else if (e.target.value == "Eraser") {
      setCurrent("erase");
    } else {
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

    let index = walls.indexOf(pos);
    
    if (index > -1) {
      let tempWalls = [...walls];
      tempWalls.splice(index, 1);
      setWalls(tempWalls);
    }

    setCurrent("end");
  }

  const findPath = async () => {
    if (!start || !end) {
      return;
    }

    setCurrent("play");
    let queue = [start];
    let past = [];
    let next = [];
    let prev = {};
    let found = false;

    while (queue.length > 0 && !found) {
      let nextPos = queue.shift();
      let result = await getPath(nextPos, WIDTH, past, next, walls, start, end, prev);
      let sqs = result[1];
      
      found = result[0]
      queue = queue.concat(sqs);
      next = sqs;
      past = [...past, ...sqs]; 
    }
  }

  const addNode = (e) => {
    let x = Math.ceil((e.clientX - offset.left) / SIZE);
    let y = Math.ceil((e.clientY - offset.top) / SIZE);

    let pos = (y - 1) * WIDTH + x;
    let row = Math.floor(pos / WIDTH);
    let col = (pos - (row * WIDTH) - 1);
    
    if (pos % WIDTH === 0) {
      col = WIDTH - 1;
      row -= 1;
    }

    let sq = document.getElementById("board").childNodes.item(`${row}`).children[col];

    if (current == "play") {
      return;
    }

    if (current == "start" || current == "end") {
      changeNode(sq, pos, current);
    }

    else if (current == "wall") {
      if (!walls.includes(pos)) {
        sq.style.backgroundColor = "black";
        setWalls(walls => [...walls, pos]);

        if (start == pos) {
          setStart(null);
        } else if (end == pos) {
          setEnd(null);
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
        const index = walls.indexOf(pos);
        if (index > -1) {
          let tempWalls = [...walls];
          tempWalls.splice(index, 1);
          setWalls(tempWalls);
        }
      }
    }
  }
  
  const onHold = () => {
    setHold(true);
  }

  const onUp = () => {
    setHold(false);
  }


  return (
    <div>
      <input type="button" value="Start Node" onClick={e => changeCurrent(e)}></input>
      <input style={{ marginLeft: "5px", marginRight: "5px" }} type="button" value="Wall Node" onClick={e => changeCurrent(e)}></input>
      <input style={{ marginRight: "5px" }} type="button" value="End Node" onClick={e => changeCurrent(e)}></input>
      <input style={{ marginRight: "5px" }} type="button" value="Eraser" onClick={e => changeCurrent(e)}></input>
      <input type="button" value="Start" onClick={findPath}></input>
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
