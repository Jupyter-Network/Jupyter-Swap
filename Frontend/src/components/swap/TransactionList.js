import BN from "bignumber.js";
import { Table } from "../../theme";
import { background } from "../../theme/theme";
import { numericFormat } from "../../utils/inputValidations";

export default function TransactionList({ transactions }) {
  console.log(transactions);
  if (transactions) {
    return (
      <Table
        style={{
          padding: 5,
          height: 500,
          overflowY: "scroll",
          width: "100%",
          textAlign: "left",
          border: "none",
          borderCollapse: "collapse",
        }}
      >
      <tr>
          <th>
              From Amount
              </th>
    
              <th style={{textAlign:"right"}}>
              
              </th>
              <th style={{textAlign:"center"}}>
              </th>
              <th>
              
              </th>
              <th style={{textAlign:"right"}}>
              To Amount
              </th>
              <th style={{textAlign:"right"}}>Scan</th>

              <th style={{textAlign:"right"}}>
              Time
              </th>
  
              </tr>
        {transactions.map((transaction, index) => {
          return <ListItem transaction={transaction} index={index}></ListItem>;
        })}
      </Table>
    );
  }
  return <p>Loading..</p>;
}

function ListItem({ transaction, index }) {
  return (
    <tr
      style={{
          fontSize:"0.7em",
        backgroundColor: index % 2 === 0 ? "#5e513a" : background,

      }}
    >
      <td style={{ padding: 8 }}>
        {numericFormat(BN(transaction.from_amount).dividedBy(BN(10).pow(18)).toFixed(18))}{" "}
        &nbsp;
        {transaction.from_symbol}
      </td>
      <td style={{ textAlign: "right" }}>
        <img style={{ height: 25 }} src={"/tokenlogos/"+transaction.from_icon}></img>
      </td>
      <td style={{minWidth:30,textAlign:"center"}}>{"< - >"}</td>
      <td>
        {" "}
        <img style={{ height: 25 }} src={"/tokenlogos/" + transaction.to_icon}></img>
      </td>
      <td style={{textAlign:"right"}}>
        {numericFormat(BN(transaction.to_amount).dividedBy(BN(10).pow(18)).toFixed(18))} &nbsp;
        {transaction.to_symbol}
      </td>
      <td style={{textAlign:"right"}}><a target="_blank" href={"http://bscscan.com/tx/"+transaction.transaction_hash}><img style={{height:21,paddingRight:5}} src="/chain.svg"></img></a></td>

      <td style={{ textAlign: "right", padding: 8 }}>
        {new Date(transaction.time).toLocaleString()}
      </td>
    </tr>
  );
}

