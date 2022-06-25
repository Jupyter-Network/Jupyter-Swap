import BN from "bignumber.js";
import { Table } from "../../theme";
import { background, tintedBackground } from "../../theme/theme";
import { numericFormat } from "../../utils/inputValidations";

export default function TransactionList({ transactions }) {
  if (transactions) {
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
          <th></th>
          <th>Rate</th>
          <th>Scan</th>

          <th>Time</th>
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
        fontSize: "0.7em",
        backgroundColor: index % 2 === 0 ? tintedBackground : background,
      }}
    >
      <td style={{ padding: 5 }}>
        <img
          style={{ height: 25 }}
          src={"/tokenlogos/" + transaction.from_icon}
        ></img>
      </td>
      <td>
        {numericFormat(
          BN(transaction.from_amount).dividedBy(BN(10).pow(18)),
          18
        )}{" "}
        &nbsp;
        {transaction.from_symbol}
      </td>

      <td style={{ minWidth: 30 }}>{"< - >"}</td>
      <td>
        {" "}
        <img
          style={{ height: 25 }}
          src={"/tokenlogos/" + transaction.to_icon}
        ></img>
      </td>
      <td>
        &nbsp;
        {numericFormat(
          BN(transaction.to_amount).dividedBy(BN(10).pow(18)),
          18
        )}{" "}
        &nbsp;
        {transaction.to_symbol}
      </td>
      <td>
        {numericFormat(
          BN(transaction.to_amount).dividedBy(transaction.from_amount),
          18
        )}{" "}
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
