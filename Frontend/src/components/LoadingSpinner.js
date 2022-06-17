import { LoaderObject, Rocket } from "../theme/loader";
import { background, highlightGradient } from "../theme/theme";

const rotate = `p {
  animation-duration: 3s;
  animation-name: slidein;
}

@keyframes slidein {
  from {
    transform:rotate(90deg);
  }

  to {
    transform:rotate(180deg);
  }
}`;
let planetWidth = "150px"


export default function LoadingSpinner({ loading }) {
  return (
    <>
      {loading ? (
        <div style={{ display:"flex",justifyContent:"center",}}>
          <div
            style={{
              zIndex: 1000,
              backgroundColor: background,
              marginTop:100,
              width:planetWidth,
              padding:40,
              overflow:"hidden"
            }}
          >
            <LoaderObject
              type="image/svg+xml"
              data="drawing.svg"
              style={{ width:"100%"}}

            ></LoaderObject>
            <Rocket
              type="image/svg+xml"
              height="100%"
              width="100%"
              data="rocket.svg"
              style={{ position:"relative",top:"-75%",left:0}}
            ></Rocket>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
