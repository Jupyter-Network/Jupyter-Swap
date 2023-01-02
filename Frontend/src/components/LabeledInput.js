import { Input } from "../theme/inputs";
import { Label } from "../theme/outputs";
import { background, primary, secondary, tintedBackground } from "../theme/theme";

export default function LabeledInput({
  name,
  onChange,
  value,
  icon,
  info,
  title = "",
  onFocus = () => {},
  onBlur = () => {},
  loading = false,
  symbol="",
  error=false,
  type="tel"
}) {
  return (
    <div style={{ width: "90%" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "space-between",
        }}
      >
    
        <p
          style={{
            lineHeight: 0.1,
            fontSize: "medium",
            textAlign: "left",
            margin: 5,
            marginBottom: -4,
          }}
        >
                     {icon ? (
            <img src={"/tokenlogos/" + icon} style={{ width: 15 }}></img>
          ) : (
            <span></span>
          )} &nbsp;

                    <span>{name}</span>
          &nbsp;
   
        </p>


        <p
          style={{
            fontSize: "x-small",
            textAlign: "right",
            marginRight: -10,
            marginBottom: 0,
          }}
        >
          {info}
        </p>
      </div>
      {!loading ? (
        <Input
          style={{backgroundColor:error ? "#6b260d": tintedBackground}}
          title={title}
          placeholder={name}
          value={value}
          onChange={(e) => {
            onChange(e);
          }}
          onFocus={(e) => {
            onFocus(e);
          }}
          onBlur={(e) => {
            onBlur(e);
          }}
          type={type}
        ></Input>
      ) : (
        <img style={{ width: 25 }} src="/small_loader.svg"></img>
      )}
    </div>
  );
}
