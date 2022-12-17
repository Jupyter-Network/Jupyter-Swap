import { Input } from "../theme/inputs";
import { Label } from "../theme/outputs";

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
          {name}
          &nbsp;
          {icon ? (
            <img src={"/tokenlogos/" + icon} style={{ width: 13 }}></img>
          ) : (
            <span></span>
          )}
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
          type={"tel"}
        ></Input>
      ) : (
        <img style={{ width: 25 }} src="/small_loader.svg"></img>
      )}
    </div>
  );
}
