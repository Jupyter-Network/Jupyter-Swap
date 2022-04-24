import { EasyContainer } from "..";
import SideBarButton from "./SideBarButton";

export default function SideBar({ setPage }) {
  function clicked(page) {
    setPage(page);
  }

  return (
    <EasyContainer >
      <SideBarButton text="Home" onClick={() => clicked("home")} />
      <SideBarButton text="Swap" onClick={() => clicked("swap")} />
    </EasyContainer>
  );
}
