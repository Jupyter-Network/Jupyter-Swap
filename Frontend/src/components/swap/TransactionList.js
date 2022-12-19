import BN from "bignumber.js";
import { useState } from "react";
import { Table } from "../../theme";
import {
  background,
  highlightGradient,
  shadowEffect,
  tintedBackground,
} from "../../theme/theme";
import {
  dynamicPrecisionDecimal,
  numericFormat,
} from "../../utils/inputValidations";
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
          <th></th>

          <th>Amount</th>
          <th>Rate</th>
          <th>&nbsp;</th>
          <th>Time</th>


          <th>TX</th>
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
  let swapUp = transaction.limit_tick < transaction.current_tick;
  return (
    <tr
      style={{
        fontSize: "0.7em",
        backgroundColor: index % 2 === 0 ? tintedBackground : background,
      }}
    >
      <td
        style={{
          padding: 10,
        }}
      >
        {swapUp ? (
          <>
            <img
              style={{
                height: 30,
                marginLeft: 20,
                boxShadow: "0px 0px 7px -2px black",
                borderRadius: "50%",
                backgroundColor: background,
              }}
              src={"/tokenlogos/" + tokens["token1"].icon}
            ></img>
            <img
              style={{
                height: 30,
                zIndex: 0,
                marginLeft: -50,
                boxShadow: "0px 0px 7px -2px black",
                borderRadius: "50%",
                backgroundColor: background,
              }}
              src={"/tokenlogos/" + tokens["token0"].icon}
            ></img>
          </>
        ) : (
          <>
            <img
              style={{
                height: 30,
                marginLeft: 15,
                boxShadow: "0px 0px 7px -2px black",
                borderRadius: "50%",
                backgroundColor: background,
              }}
              src={"/tokenlogos/" + tokens["token0"].icon}
            ></img>
            <img
              style={{
                height: 30,
                marginLeft: -50,
                boxShadow: "0px 0px 7px -2px black",
                borderRadius: "50%",
                backgroundColor: background,
              }}
              src={"/tokenlogos/" + tokens["token1"].icon}
            ></img>
          </>
        )}
        &nbsp; &nbsp; &nbsp;
      </td>
      <td style={{textAlign:"start",fontSize:"1.2em"}}>
        <b>
          {dynamicPrecisionDecimal(
            BN(transaction.amount_in).dividedBy(BN(10).pow(18))
          ).toString()}
        </b>{" "}
        {swapUp ? tokens["token0"].symbol : tokens["token1"].symbol}
      </td>

      <td  style={{textAlign:"start",fontSize:"1,2em"}}>
        <b>
        {Math.round(dynamicPrecisionDecimal(
          priceFromSqrtPrice(BigInt(transaction.sqrt_price))
        )*100000000)/100000000}
        </b>
      </td>
      <br/>
      <td style={{fontSize:"1.1em"}}>{new Date(transaction.time).toUTCString()}</td>

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
    </tr>
  );
}
