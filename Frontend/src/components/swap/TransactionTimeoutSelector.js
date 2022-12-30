import { useState } from "react";
import { SmallSecondaryButton } from "../../theme/buttons";

export default function TransactionTimeoutSelector({ initTimeout, setTime }) {
  const [timeout, setTimeoutTime] = useState(900000);
  const [open, setOpen] = useState(false);
  function handleChange(value) {
    setOpen(false);
    setTimeoutTime(value);
    setTime(value);
  }
  return <div></div>;
  /*
  return (
    <div>
      {open ? (
        <div style={{display:"flex",justifyContent:"center"}}>
          <SmallSecondaryButton onClick={() => handleChange(300000)}>5min</SmallSecondaryButton>
          <SmallSecondaryButton onClick={() => handleChange(900000)}>15min</SmallSecondaryButton>
          <SmallSecondaryButton onClick={() => handleChange(1800000)}>30min</SmallSecondaryButton>
        </div>
      ) : (
        <SmallSecondaryButton
        title={`Cancel transaction if not executed after timeout`}
          onClick={() => {
            setOpen(true);
            setTimeout(() => {
              setOpen(false);
            }, 10000);
          }}
        >
          Tx timeout&nbsp;
          <b>{timeout / 60000}min</b>
        </SmallSecondaryButton>
      )}
    </div>
  );
  */
}
