import BN from "bignumber.js";
import { useState } from "react";
import { Table } from "../../theme";
import { background, tintedBackground } from "../../theme/theme";
import { numericFormat } from "../../utils/inputValidations";
import { priceFromSqrtPrice } from "../../utils/mathHelper";

export default function TransactionList({ transactions, tokens }) {
  console.log(transactions);
  if (transactions && tokens) {
    return (
      <Table
        style={{
          padding: 5,
          width: "100%",
          textAlign: "left",
          border: "none",
          borderCollapse: "collapse",
        }}
      >
        <tr>
          <th>From</th>

          <th></th>
          <th></th>
          <th>To</th>
          <th>Rate</th>
          <th>Scan</th>

          <th>Time</th>
        </tr>
        {transactions.map((transaction, index) => {
          return (
            <ListItem
              transaction={transaction}
              index={index}
              tokens={tokens}
            ></ListItem>
          );
        })}
      </Table>
    );
  }
  return <p>Loading..</p>;
}

function ListItem({ transaction, index, tokens }) {
  let swapUp = transaction.limit_tick > transaction.currentTick;
  return (
    <tr
      style={{
        fontSize: "0.7em",
        backgroundColor: index % 2 === 0 ? tintedBackground : background,
      }}
    >
      <td style={{ padding: 5 }}>
        {transaction.limit_tick < transaction.current_tick ? (
          <img
            style={{ height: 25 }}
            src={"/tokenlogos/" + tokens["token0"].icon}
          ></img>
        ) : (
          <img
            style={{ height: 25 }}
            src={"/tokenlogos/" + tokens["token1"].icon}
          ></img>
        )}
      </td>
      <td>
        {BN(transaction.amount_in).dividedBy(BN(10).pow(18)).toString()} &nbsp;
        {transaction.limit_tick < transaction.current_tick
          ? tokens["token0"].symbol
          : tokens["token1"].symbol}
      </td>

      <td style={{ minWidth: 30 }}>{"< - >"}</td>
      <td>
        {transaction.limit_tick < transaction.current_tick ? (
          <img
            style={{ height: 25 }}
            src={"/tokenlogos/" + tokens["token1"].icon}
          ></img>
        ) : (
          <img
            style={{ height: 25 }}
            src={"/tokenlogos/" + tokens["token0"].icon}
          ></img>
        )}
      </td>
      <td>
        {priceFromSqrtPrice(BigInt(transaction.sqrt_price))}
        &nbsp;
      </td>
      <td>
        <a
          title="View transaction on bscscan"
          target="_blank"
          href={"http://bscscan.com/tx/" + transaction.transaction_hash}
        >
          <img
            style={{ height: 21, paddingRight: 5, paddingLeft: 9 }}
            src="/chain.svg"
          ></img>
        </a>
      </td>

      <td>{new Date(transaction.time).toLocaleString()}</td>
    </tr>
  );
}
