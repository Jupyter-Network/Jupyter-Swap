import { useState } from "react";
import {
  MediumButton,
  MediumButtonInverted,
  SmallSecondaryButton,
} from "../../theme/buttons";
import {
  background,
  backgroundGradient,
  highlight,
  highlightGradient,
  secondary,
} from "../../theme/theme";

export default function MaxSlippageSelector({ maxSlippage, setMaxSlippage }) {
  const [open, setOpen] = useState(false);
  const [slippage, setSlippage] = useState(maxSlippage);
  function handleChange(value) {
    setOpen(false);
    setMaxSlippage(value);
    setSlippage(value);
  }
  return (
    <div>
      {open ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SmallSecondaryButton onClick={() => handleChange(0.2)}>
            0.2%
          </SmallSecondaryButton>
          <SmallSecondaryButton onClick={() => handleChange(0.5)}>
            0.5%
          </SmallSecondaryButton>
          <SmallSecondaryButton onClick={() => handleChange(1)}>
            1%
          </SmallSecondaryButton>
        </div>
      ) : (
        <SmallSecondaryButton
          title={`Cancel transaction if slippage is too high`}
          onClick={() => {
            setTimeout(() => {
              setOpen(!open);
            }, 50);
            setTimeout(() => setOpen(false), 10000);
          }}
        >
          Max Slippage&nbsp;
          <b>{slippage}%</b>
        </SmallSecondaryButton>
      )}
    </div>
  );
}
