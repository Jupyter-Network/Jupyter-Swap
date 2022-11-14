import { useEffect, useRef, useState } from "react";
import { scaleLinear, scaleSqrt } from "d3";
import { numericFormat } from "../../utils/inputValidations";

export function Slider(props) {
  let [xPosLeft, setXPosLeft] = useState(100);
  let [xPosRight, setXPosRight] = useState(200);
  let [drag, setDrag] = useState(false);
  let [selected, setSelected] = useState(99);
  let self = useRef();

  let lowerBoundary = 0;
  let upperBoundary = 10;

  useEffect(() => {
    props.onMoveRight(myScale(xPosRight));
  }, [xPosRight]);
  useEffect(() => {
    props.onMoveLeft(myScale(xPosLeft));
  }, [xPosLeft]);



  let myScale = scaleSqrt()
    .range([0, props.currentPrice * 2])
    .domain([0, 300]);
  let yScale = scaleLinear()
    .domain([0, props.positions.reduce((acc, item) => acc + item.lp, 0)])
    .range([0, props.height]);
  function move(e) {
    const clientX = e.clientX - self.current.offsetLeft;
    if (clientX > 0 && clientX < props.width && drag) {
      if (selected == 0 && clientX < xPosRight) {
        setXPosLeft(clientX);
      } else if (selected == 1 && clientX > xPosLeft) {
        setXPosRight(clientX);
      }
    }
  }

  function startDrag(e) {
    e.preventDefault();
    console.log(
      "Start Drag ",
      e.clientX > xPosLeft - 20 + self.current.offsetLeft &&
        e.clientX < xPosLeft + 20 + self.current.offsetLeft
    );
    let correctedX = e.clientX - self.current.offsetLeft;
    console.log(correctedX);
    correctedX = correctedX > 0 ? correctedX : 0;
    if (correctedX > xPosLeft - 20 && correctedX < xPosLeft + 20) {
      setSelected(0);
    } else if (correctedX > xPosRight - 20 && correctedX < xPosRight + 20) {
      setSelected(1);
    } else {
      setSelected(99);
      return;
    }
    setDrag(true);
  }

  function liquidityProfile() {
    if (props.positions && props.positions.length > 0) {
      const step = 10;
      let out = [];
      for (let i = 0; i < props.width; i += step) {
        let sum = props.positions.reduce(
          (acc, current) =>
            current.lt >= myScale(i) && current.ut > myScale(i + step)
              ? acc + current.lp
              : acc,
          0
        );
        out.push(
          <rect
            key={i}
            fill={"gray"}
            x={i}
            width={step}
            y={props.height - yScale(sum)}
            height={yScale(sum)}
          ></rect>
        );
      }
      return out;
    }
  }

  return (
    <div
      ref={self}
      style={{ height: 100, width: props.width, touchAction: "none" }}
      onPointerDown={(e) => startDrag(e)}
      onPointerUp={() => setDrag(false)}
      onPointerMove={(e) => {
        move(e);
      }}
      onPointerLeave={() => {
        setDrag(false);
      }}
    >
      <svg
        width={"100%"}
        style={{
          backgroundColor: "darkgray",
          height: props.height,
          borderRadius: 3,
        }}
      >
        {liquidityProfile()}
        <rect
          x={myScale.invert(props.currentPrice)}
          style={{ fill: "orange" }}
          height={props.height}
          width={2}
        ></rect>
        <g transform={`translate(${xPosLeft},${0})`}>
          <rect
            x={0}
            style={{ fill: "black" }}
            height={props.height}
            width={2}
          ></rect>
          <rect
            x={-8}
            stroke={selected == 1 ? "black" : "orange"}
            rx={3}
            width={18}
            height={props.height / 2}
            fill={"gray"}
          ></rect>
        </g>
        <g transform={`translate(${xPosRight},${0})`}>
          <rect
            style={{ fill: "black" }}
            height={props.height}
            width={2}
          ></rect>
          <rect
            x={-8}
            stroke={selected == 0 ? "black" : "orange"}
            rx={3}
            width={18}
            height={props.height / 2}
            fill={"gray"}
          />
        </g>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <p>{numericFormat(myScale(xPosLeft) * 10 ** 18)}</p>
        <p>{numericFormat(myScale(xPosRight) * 10 ** 18)}</p>
      </div>
    </div>
  );
}
