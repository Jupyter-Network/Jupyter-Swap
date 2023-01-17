import { useEffect, useRef, useState } from "react";
import {
  rgb,
  scaleLinear,
  scaleLog,
  scalePow,
  scaleQuantile,
  scaleQuantize,
  scaleSqrt,
} from "d3";
import { numericFormat } from "../../utils/inputValidations";
import { priceFromTick } from "../../utils/mathHelper";

function scale(currentPrice) {
  return [currentPrice/100,currentPrice*100]

}
export function Slider(props) {
  let [xPosLeft, setXPosLeft] = useState(100);
  let [xPosRight, setXPosRight] = useState(200);
  let [drag, setDrag] = useState(false);
  let [selected, setSelected] = useState(99);
  let self = useRef();

  useEffect(() => {
    props.onMoveRight(myScale.invert(xPosRight));
  }, [xPosRight]);
  useEffect(() => {
    props.onMoveLeft(myScale.invert(xPosLeft));
  }, [xPosLeft]);

  const myScale = scaleLog()
    .domain(scale(props.currentPrice))
    .range([0, props.width]);
  let yScale = scaleLinear()
    .range([0, props.height])
    .domain([
      props.positions.reduce((acc, item) => (item.lp < acc ? item.lp : acc), 0),
      props.positions.reduce((acc, item) => (item.lp > acc ? item.lp : acc), 0),
    ])
    .clamp(false);
  function move(e) {
    const clientX = e.clientX - self.current.offsetLeft;
    if (clientX > 0 && clientX < props.width && drag) {
      if (selected == 0 && clientX < xPosRight - 20) {
        setXPosLeft(clientX);
      } else if (selected == 1 && clientX > xPosLeft + 20) {
        setXPosRight(clientX);
      }
    }
  }

  function startDrag(e) {
    e.preventDefault();

    let correctedX = e.clientX - self.current.offsetLeft;
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
      let sum = 0;
      let sums = [];
      for (let i = 0; i < props.width; i += step) {
        sum += props.positions.reduce((acc, current) => {
          let c =
            current.lt >= myScale.invert(i) &&
            current.lt < myScale.invert(i + step)
              ? +current.lp
              : 0;
          let b =
            current.ut >= myScale.invert(i) &&
            current.ut < myScale.invert(i + step)
              ? -current.lp
              : 0;
          acc = acc + c + b;
          return acc;
        }, 0);
        sums.push(sum);
      }
      yScale.domain([
        sums.reduce((acc, item) => (item < acc ? item : acc), 0),
        sums.reduce((acc, item) => (item > acc ? item : acc), 0),
      ]);

      out = sums.map((e, i) => {
        return (
          <rect
            key={i * step}
            fill={"gray"}
            x={i * step}
            width={step}
            y={props.height - yScale(e)} //props.height - yScale(sum)}
            height={yScale(e)}
          ></rect>
        );
      });

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
          x={xPosLeft}
          width={xPosRight - xPosLeft}
          height={300}
          fill={"rgba(12,12,12,0.2)"}
        ></rect>

        <rect
          x={myScale(props.currentPrice)}
          style={{ fill: "orange" }}
          height={props.height}
          width={2}
        ></rect>
                <rect
          x={myScale(priceFromTick(props.currentTick))}
          style={{ fill: "purple" }}
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
        <p>{numericFormat(myScale.invert(xPosLeft) * 10 ** 18)}</p>
        <p>{numericFormat(myScale.invert(xPosRight) * 10 ** 18)}</p>
      </div>
    </div>
  );
}
