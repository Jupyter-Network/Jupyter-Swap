import { background, highlight } from "../theme/theme";

export default function LoadingSpinner({ loading }) {
  return (
    <>
      {loading ? (
        <div
          style={{
            position: "absolute",
            zIndex: 1000,
            backgroundColor: background,
            width: "100vw",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <img height="30%" src={"/loader.svg"}></img>
  
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
