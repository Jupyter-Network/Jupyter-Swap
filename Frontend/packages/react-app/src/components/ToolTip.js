import { useState } from "react";

export default function ToolTip({ toolTip,link }) {
  const [open, setOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  return (
    <>
      <div
        onMouseEnter={(e) => {
          setMousePosition({ x: e.clientX, y: e.clientY });
          setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        onMouseMove={(e) => {
          if (open) {
            setMousePosition({ x: e.clientX, y: e.clientY });
          }
        }}
        style={{
          position: "relative",
          display:"inline"
        }}
      >
        <a href={link}><img style={{color:"dodgerblue",width:15,borderRadius:"50%"}} src="/question-mark.svg"></img></a>
      </div>
      {open ? (
        <div
          style={{
            pointerEvents:"none",
            userSelect: "none",
            display: open ? "inline" : "none",
            position: "fixed",
            left: mousePosition.x+10,
            top: `calc(${mousePosition.y}px - 50px)`,
            backgroundColor:"white",
            padding:5,
            borderRadius:10,
            border:"solid",
            color:"dodgerblue",
          }}
        >
          {toolTip}
        </div>
      ) : (
        <span></span>
      )}
    </>
  );
}
