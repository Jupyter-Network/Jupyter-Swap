import { Input } from "./elements";
import { useState } from "react";

export default function NumericInput({
  value,
  setValue}) {
  const [valState, setValState] = useState(value);
  function handleChange(value) {
    const numericString = value.replace(/[^0-9 .]/g, "");
    setValState(numericString);
  }

  return (
      <Input
        onBlur={(e) => setValue(e.target.value)}
        onChange={(e) => {
          setValue(e.target.value)
          handleChange(e.target.value);
        }}
        value={valState}
      ></Input>
  );
}
