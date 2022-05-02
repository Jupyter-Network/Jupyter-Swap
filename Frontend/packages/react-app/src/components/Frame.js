import { useState } from "react";
import MainComponent from "./MainComponent";
import SideBar from "./SideBar/SideBar";

export default function Frame({ children }) {
  const [page, setPage] = useState("swap");
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "nowrap",
          width: "100vw",
          height: "100vh",
        }}
      >
        <MainComponent page={page} />

      </div>
    </div>
  );
}
