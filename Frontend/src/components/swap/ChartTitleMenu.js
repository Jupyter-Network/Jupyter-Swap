import { useState } from "react";
import { ContainerButton } from "../../theme";
import { MediumButton, MediumButtonInverted } from "../../theme/buttons";
import { background, primary, shadowEffect } from "../../theme/theme";

export default function ChartTitleMenu({ onChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [state, setState] = useState({
    bucket: 15,
  });

  function handleBucketChange(bucket) {
    onChange(bucket);
    setState({ ...state, bucket: bucket });
    setMenuOpen(false);
  }

  const buttonStyle = {
    transition: "opacity height 0.3s ease",
    opacity: !menuOpen ? 0 : 1,
    height: menuOpen ? 40 : 0,
  };
  return (
    <>
      <ContainerButton
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ zIndex: 5 }}
      >
        <img
          style={{
            transition: "all 0.2s linear",
            width: 26,
            position: "relative",
            top: 5,
            transform: menuOpen ? "rotate(90deg) scale(2)" : "",
          }}
          src={"/hamburger-menu.svg"}
        ></img>
      </ContainerButton>

      <div
        style={{
          position: "absolute",
          backgroundColor: background,
          zIndex: 1000,
          top: 160,
          maxWidth: 200,
          visibility: menuOpen ? "visible" : "hidden",
          height: menuOpen ? 200 : 0,
          boxShadow: "0px 2px 5px -3px black",
          transition: "all 0.5s ease",
          display: "flex",
          flexWrap: "wrap",
          border: "solid",
          color: primary,
          borderWidth: 1,
          borderRadius: 10,
        }}
      >
        <MediumButtonInverted
          style={
            state.bucket === 10080
              ? { ...buttonStyle, border: "solid", borderWidth: 1 }
              : buttonStyle
          }
          onClick={() => {
            handleBucketChange(10080);
          }}
        >
          1w
        </MediumButtonInverted>
        <MediumButtonInverted
        style={
            state.bucket === 1440
              ? { ...buttonStyle, border: "solid", borderWidth: 1 }
              : buttonStyle
          }          onClick={() => {
            handleBucketChange(1440);
          }}
        >
          1d
        </MediumButtonInverted>
        <MediumButtonInverted
        style={
            state.bucket === 720
              ? { ...buttonStyle, border: "solid", borderWidth: 1 }
              : buttonStyle
          }          onClick={() => {
            handleBucketChange(720);
          }}
        >
          12h
        </MediumButtonInverted>
        <MediumButtonInverted
        style={
            state.bucket === 360
              ? { ...buttonStyle, border: "solid", borderWidth: 1 }
              : buttonStyle
          }          onClick={() => {
            handleBucketChange(360);
          }}
        >
          6h
        </MediumButtonInverted>
        <MediumButtonInverted
        style={
            state.bucket === 240
              ? { ...buttonStyle, border: "solid", borderWidth: 1 }
              : buttonStyle
          }          onClick={() => {
            handleBucketChange(240);
          }}
        >
          4h
        </MediumButtonInverted>
        <MediumButtonInverted
        style={
            state.bucket === 120
              ? { ...buttonStyle, border: "solid", borderWidth: 1 }
              : buttonStyle
          }          onClick={() => {
            handleBucketChange(120);
          }}
        >
          2h
        </MediumButtonInverted>
        <MediumButtonInverted
        style={
            state.bucket === 60
              ? { ...buttonStyle, border: "solid", borderWidth: 1 }
              : buttonStyle
          }          onClick={() => {
            handleBucketChange(60);
          }}
        >
          1h
        </MediumButtonInverted>
        <MediumButtonInverted
        style={
            state.bucket === 30
              ? { ...buttonStyle, border: "solid", borderWidth: 1 }
              : buttonStyle
          }          onClick={() => {
            handleBucketChange(30);
          }}
        >
          30m
        </MediumButtonInverted>
        <MediumButtonInverted
        style={
            state.bucket === 15
              ? { ...buttonStyle, border: "solid", borderWidth: 1 }
              : buttonStyle
          }          onClick={() => {
            handleBucketChange(15);
          }}
        >
          15m
        </MediumButtonInverted>
        <MediumButtonInverted
        style={
            state.bucket === 5
              ? { ...buttonStyle, border: "solid", borderWidth: 1 }
              : buttonStyle
          }          onClick={() => {
            handleBucketChange(5);
          }}
        >
          5m
        </MediumButtonInverted>
      </div>
    </>
  );
}
